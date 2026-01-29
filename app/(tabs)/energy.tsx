import { Canvas, useFrame, useThree } from '@react-three/fiber/native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as ReactNative from 'react-native'
import * as THREE from 'three'
import { ArchBackground, ARCH } from '@/components/arch-theme'
import { ArchNav } from '@/components/arch-nav'

type ControlMode = 'throw' | 'grab' | 'camera'

const BG = ARCH.BG
const ACCENT = ARCH.ACCENT
const PANEL_MAX_HEIGHT = 340
const tmpUp = new THREE.Vector3(0, 1, 0)
const tmpDir = new THREE.Vector3()
const tmpQuat = new THREE.Quaternion()
const tmpMid = new THREE.Vector3()
const tmpNormal = new THREE.Vector3()
const tmpClosest = new THREE.Vector3()
const tmpVoxelCenter = new THREE.Vector3()
const tmpCorrection = new THREE.Vector3()
const GRAVITY_COLOR = new THREE.Color('#ff6b6b')
const VELOCITY_COLOR = new THREE.Color('#6bd1ff')
const NORMAL_COLOR = new THREE.Color('#6bff9a')
const MAX_INSTANCED_ORDER = 3
const VOXEL_RES = 48
const FIXED_DT = 1 / 60
const MAX_SUBSTEPS = 5

const MEDIUMS = [
  { key: 'air', label: 'Air', opticalScatter: 1, opticalAtten: 1, thermalCond: 1, electricalResist: 1, fluidResist: 1, acousticAbsorb: 1 },
  { key: 'water', label: 'Water', opticalScatter: 1.3, opticalAtten: 1.8, thermalCond: 0.6, electricalResist: 0.2, fluidResist: 1.6, acousticAbsorb: 1.2 },
  { key: 'glass', label: 'Glass', opticalScatter: 0.8, opticalAtten: 1.5, thermalCond: 0.5, electricalResist: 1.5, fluidResist: 1.2, acousticAbsorb: 0.9 },
  { key: 'metal', label: 'Metal', opticalScatter: 1.5, opticalAtten: 2.0, thermalCond: 2.5, electricalResist: 0.05, fluidResist: 1.0, acousticAbsorb: 1.4 },
  { key: 'foam', label: 'Foam', opticalScatter: 1.8, opticalAtten: 1.4, thermalCond: 0.3, electricalResist: 2.0, fluidResist: 1.8, acousticAbsorb: 2.2 }
]

const PROPERTY_SECTIONS = [
  {
    key: 'foundations',
    title: 'Fractal foundations',
    points: [
      'Self-similarity at every scale',
      'Infinitely many voids',
      'Volume -> 0, surface area -> infinity',
      'Fractal dimension ~= 2.7268',
      'Drives all physical behaviors'
    ]
  },
  {
    key: 'optics',
    title: 'Optical',
    points: [
      'Extreme diffusion and scattering',
      'Fractal shadows and partial transparency',
      'Near-infinite internal reflections',
      'Acts like a high-performance light diffuser'
    ]
  },
  {
    key: 'acoustics',
    title: 'Acoustic',
    points: [
      'High sound absorption via endless cavities',
      'Excellent at soaking high frequencies',
      'Local fractal resonances can appear',
      'Strong scattering, good for anechoic uses'
    ]
  },
  {
    key: 'thermal',
    title: 'Thermal',
    points: [
      'Excellent heat dissipation (huge area)',
      'Chaotic internal heat paths',
      'Ideal radiator geometry if materialized'
    ]
  },
  {
    key: 'electrical',
    title: 'Electrical',
    points: [
      'Long fragmented paths raise resistance',
      'Complex field distribution',
      'Great candidate for 3D fractal antennas'
    ]
  },
  {
    key: 'mechanical',
    title: 'Mechanical',
    points: [
      'Ultra-light (density tends to 0)',
      'Rigid along internal networks, fragile edges',
      'Huge surface/volume for foams, filters, porous lattices'
    ]
  },
  {
    key: 'fluids',
    title: 'Fluids',
    points: [
      'Chaotic turbulent mixing',
      'High mass/gas transfer rates',
      'Significant flow resistance - great for filters/catalysts'
    ]
  },
  {
    key: 'energy',
    title: 'Energy interactions',
    points: [
      'Energy dissipates quickly: sound, light, heat, pressure',
      'Infinite area accelerates loss and scattering'
    ]
  },
  {
    key: 'formulas',
    title: 'Formulas & scaling',
    points: [
      'Cubes N=20^n, edge l=1/3^n, volume V=(20/27)^n',
      'Area A=6*(20/9)^n, S/V = 6*3^n, D=log(20)/log(3) ~= 2.7268',
      'Holes H=7*20^(n-1), total H_tot=7*(20^n-1)/19, density rho=(20/27)^n',
      'Optics: I_out=I_in/(1+kA), T=e^(-mu*L_opt), reflections ~= 3^n',
      'Acoustics: alpha ~ 3^n, L_eff ~= L_0*3^n, f_n=f_0*3^n',
      'Thermal: k_eff=k_0*(20/27)^n, Q ~ A(n), R_th ~ 1/A(n)',
      'Electrical: R_eff ~ (3/20)^n, C ~ A(n), f_res=f_0*3^n',
      'Fluids: phi=1-(20/27)^n, R_f ~ 3^n, A_wet=A(n)'
    ]
  }
]

const formatNumber = (n: number) => {
  if (Math.abs(n) >= 1e6 || (Math.abs(n) > 0 && Math.abs(n) < 1e-3)) {
    return n.toExponential(3)
  }
  return n.toFixed(6).replace(/\.?0+$/, '')
}

const parseNumber = (input: string, fallback: number) => {
  const v = Number(input)
  return Number.isFinite(v) ? v : fallback
}

function generateMengerPositions(order: number) {
  const recur = (n: number, size = 1, pos = [0, 0, 0]): { pos: number[]; size: number }[] => {
    if (n === 0) return [{ pos, size }]
    const offset = size / 3
    const out: { pos: number[]; size: number }[] = []
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const sum = Math.abs(x) + Math.abs(y) + Math.abs(z)
          if (sum > 1) {
            const nx = pos[0] + x * offset
            const ny = pos[1] + y * offset
            const nz = pos[2] + z * offset
            out.push(...recur(n - 1, size / 3, [nx, ny, nz]))
          }
        }
      }
    }
    return out
  }
  return recur(order, 1, [0, 0, 0])
}

function buildVoxelField(order: number, res: number) {
  const positions = generateMengerPositions(order)
  const data = new Uint8Array(res * res * res)
  const voxelSize = 1 / res
  const clampIndex = (n: number) => Math.max(0, Math.min(res - 1, n))

  for (const p of positions) {
    const half = p.size / 2
    const minX = p.pos[0] - half
    const maxX = p.pos[0] + half
    const minY = p.pos[1] - half
    const maxY = p.pos[1] + half
    const minZ = p.pos[2] - half
    const maxZ = p.pos[2] + half

    const ix0 = clampIndex(Math.floor((minX + 0.5) / voxelSize))
    const ix1 = clampIndex(Math.floor((maxX + 0.5) / voxelSize))
    const iy0 = clampIndex(Math.floor((minY + 0.5) / voxelSize))
    const iy1 = clampIndex(Math.floor((maxY + 0.5) / voxelSize))
    const iz0 = clampIndex(Math.floor((minZ + 0.5) / voxelSize))
    const iz1 = clampIndex(Math.floor((maxZ + 0.5) / voxelSize))

    for (let ix = ix0; ix <= ix1; ix++) {
      for (let iy = iy0; iy <= iy1; iy++) {
        const base = (ix * res + iy) * res
        for (let iz = iz0; iz <= iz1; iz++) {
          data[base + iz] = 1
        }
      }
    }
  }

  return { res, voxelSize, data }
}

function CameraRig({ azimuth, elevation, radius, offset }: { azimuth: number; elevation: number; radius: number; offset: { x: number; z: number } }) {
  const { camera } = useThree()
  useFrame(() => {
    const el = THREE.MathUtils.clamp(elevation, 0.2, Math.PI / 2 - 0.2)
    const x = offset.x + radius * Math.sin(el) * Math.cos(azimuth)
    const z = offset.z + radius * Math.sin(el) * Math.sin(azimuth)
    const y = radius * Math.cos(el)
    camera.position.set(x, y, z)
    camera.lookAt(offset.x, 1, offset.z)
    camera.updateProjectionMatrix()
  })
  return null
}

function PhysicsMenger({
  mass,
  gravity,
  friction,
  restitution,
  lightIntensity,
  envStrength,
  onEnergyUpdate,
  throwVelocity,
  resetSignal,
  manualPos,
  paused,
  onForcesUpdate,
  mengerOrder
}: {
  mass: number
  gravity: number
  friction: number
  restitution: number
  lightIntensity: number
  envStrength: number
  onEnergyUpdate: (kin: number, pot: number) => void
  onForcesUpdate: (forces: { g: number; v: number; n: number }) => void
  throwVelocity: THREE.Vector3 | null
  resetSignal: number
  manualPos: THREE.Vector3 | null
  paused: boolean
  mengerOrder: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const vel = useRef(new THREE.Vector3(0, 0, 0))
  const pos = useRef(new THREE.Vector3(0, 2, 0))
  const gArrow = useRef<THREE.Group>(null)
  const vArrow = useRef<THREE.Group>(null)
  const nArrow = useRef<THREE.Group>(null)

  const floorY = 0
  const positions = useMemo(() => generateMengerPositions(mengerOrder), [mengerOrder])
  const cubeSize = 1 / Math.pow(3, mengerOrder)
  const scale = 1
  const materialColor = '#f6d36f'

  useEffect(() => {
    pos.current.set(0, 2.2, 0)
    vel.current.set(0, 0, 0)
  }, [resetSignal])

  useEffect(() => {
    if (throwVelocity) {
      vel.current.copy(throwVelocity)
    }
  }, [throwVelocity])

  useEffect(() => {
    if (manualPos) {
      pos.current.copy(manualPos)
      vel.current.set(0, 0, 0)
    }
  }, [manualPos])

  const updateArrow = (ref: React.RefObject<THREE.Group>, origin: THREE.Vector3, dir: THREE.Vector3, color: string) => {
    const len = dir.length()
    if (!ref.current) return
    if (len < 0.01) {
      ref.current.visible = false
      return
    }
    ref.current.visible = true
    tmpDir.copy(dir).normalize()
    tmpQuat.setFromUnitVectors(tmpUp, tmpDir)
    const mid = tmpDir.clone().multiplyScalar(len * 0.5).add(origin)
    ref.current.position.copy(mid)
    ref.current.quaternion.copy(tmpQuat)
    ref.current.scale.set(1, len, 1)
    ;(ref.current.children[0] as THREE.Mesh).material.color = new THREE.Color(color)
    ;(ref.current.children[1] as THREE.Mesh).material.color = new THREE.Color(color)
  }

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.033)
    if (!paused) {
      vel.current.y -= gravity * dt
      vel.current.multiplyScalar(1 - friction * dt)
      pos.current.addScaledVector(vel.current, dt)

      if (pos.current.y - scale * 0.5 < floorY) {
        pos.current.y = floorY + scale * 0.5
        vel.current.y = -vel.current.y * restitution
        vel.current.x *= 0.9
        vel.current.z *= 0.9
      }
      if (pos.current.y < -4) {
        pos.current.set(0, 2.2, 0)
        vel.current.set(0, 0, 0)
      }
    }

    if (groupRef.current) {
      groupRef.current.position.copy(pos.current)
    }

    const height = Math.max(0, pos.current.y - floorY)
    const potential = mass * gravity * height
    const kinetic = 0.5 * mass * vel.current.lengthSq()
    onEnergyUpdate(kinetic, potential)

    updateArrow(gArrow, pos.current, new THREE.Vector3(0, -gravity * 0.2, 0), '#ff6b6b')
    updateArrow(vArrow, pos.current, vel.current.clone().multiplyScalar(0.2), '#6bd1ff')
    const normalVec = pos.current.y - scale * 0.5 <= floorY + 0.001 ? new THREE.Vector3(0, gravity * 0.15, 0) : new THREE.Vector3(0, 0, 0)
    updateArrow(nArrow, pos.current, normalVec, '#6bff9a')
    onForcesUpdate({ g: gravity, v: vel.current.length(), n: normalVec.length() })
  })

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      <ambientLight intensity={0.35 * envStrength} />
      <directionalLight position={[4, 6, 4]} intensity={lightIntensity} color="#ffd28a" />
      {positions.map((p, i) => (
        <mesh key={i} position={[p.pos[0] * scale, p.pos[1] * scale, p.pos[2] * scale]} scale={[cubeSize * scale, cubeSize * scale, cubeSize * scale]} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={materialColor} roughness={0.35} metalness={0.15} />
        </mesh>
      ))}
      <group ref={gArrow} visible={false}>
        <mesh>
          <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <coneGeometry args={[0.08, 0.16, 8]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
      </group>
      <group ref={vArrow} visible={false}>
        <mesh>
          <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
          <meshStandardMaterial color="#6bd1ff" />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <coneGeometry args={[0.08, 0.16, 8]} />
          <meshStandardMaterial color="#6bd1ff" />
        </mesh>
      </group>
      <group ref={nArrow} visible={false}>
        <mesh>
          <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
          <meshStandardMaterial color="#6bff9a" />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <coneGeometry args={[0.08, 0.16, 8]} />
          <meshStandardMaterial color="#6bff9a" />
        </mesh>
      </group>
    </group>
  )
}

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  const [width, setWidth] = useState(0)
  const trackHeight = 6
  const knobSize = 22
  const clamp = (n: number) => {
    const stepped = step ? Math.round(n / step) * step : n
    return Math.min(max, Math.max(min, stepped))
  }
  const handle = (x: number) => {
    if (!width) return
    const ratio = Math.min(1, Math.max(0, x / width))
    const next = min + ratio * (max - min)
    onChange(clamp(next))
  }
  const ratio = (value - min) / (max - min || 1)
  const knobLeft = width ? ratio * width : 0

  return (
    <ReactNative.View style={{ marginVertical: 6 }}>
      <ReactNative.Text style={{ color: '#e5ecf7', fontWeight: '700', fontSize: 13, marginBottom: 4 }}>
        {label}: {value.toFixed(2)}
      </ReactNative.Text>
      <ReactNative.View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onResponderGrant={(e) => handle(e.nativeEvent.locationX)}
        onResponderMove={(e) => handle(e.nativeEvent.locationX)}
        style={{ paddingVertical: 8, position: 'relative' }}
      >
        <ReactNative.View style={{ height: trackHeight, borderRadius: trackHeight / 2, backgroundColor: 'rgba(255,255,255,0.12)' }} />
        <ReactNative.View
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            width: knobLeft,
            height: trackHeight,
            borderRadius: trackHeight / 2,
            backgroundColor: 'rgba(43,140,246,0.35)',
            transform: [{ translateY: -trackHeight / 2 }]
          }}
        />
        <ReactNative.View
          style={{
            position: 'absolute',
            width: knobSize,
            height: knobSize,
            borderRadius: knobSize / 2,
            backgroundColor: ARCH.TEXT,
            borderWidth: 1.5,
            borderColor: 'rgba(43,140,246,0.85)',
            left: Math.max(0, Math.min(knobLeft - knobSize / 2, width ? width - knobSize : 0)),
            top: '50%',
            transform: [{ translateY: -knobSize / 2 }],
            shadowColor: '#000',
            shadowOpacity: 0.22,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 5
          }}
        />
      </ReactNative.View>
    </ReactNative.View>
  )
}

export default function EnergyLab() {
  const [mass, setMass] = useState(2)
  const [gravity, setGravity] = useState(9.81)
  const [friction, setFriction] = useState(0.4)
  const [restitution, setRestitution] = useState(0.55)
  const [lightIntensity, setLightIntensity] = useState(1.0)
  const [envStrength, setEnvStrength] = useState(1.0)
  const [kinetic, setKinetic] = useState(0)
  const [potential, setPotential] = useState(0)
  const [throwVelocity, setThrowVelocity] = useState<THREE.Vector3 | null>(null)
  const [resetSignal, setResetSignal] = useState(0)
  const [manualPos, setManualPos] = useState<THREE.Vector3 | null>(null)
  const [controlMode, setControlMode] = useState<ControlMode>('throw')
  const [panelVisible, setPanelVisible] = useState(true)
  const [timeOfDay, setTimeOfDay] = useState(0.2)
  const [animateTime, setAnimateTime] = useState(true)
  const [paused, setPaused] = useState(false)
  const [forces, setForces] = useState({ g: gravity, v: 0, n: 0 })
  const [mengerOrder, setMengerOrder] = useState(2)
  const [azimuth, setAzimuth] = useState(0.6)
  const [elevation, setElevation] = useState(0.9)
  const radius = 5
  const [camOffset, setCamOffset] = useState({ x: 0, z: 0 })
  const [propertyKey, setPropertyKey] = useState(PROPERTY_SECTIONS[0].key)
  const [baseL0, setBaseL0] = useState(1)
  const [baseMu, setBaseMu] = useState(0.12)
  const [baseScatterK, setBaseScatterK] = useState(0.18)
  const [baseI0, setBaseI0] = useState(1)
  const [baseF0, setBaseF0] = useState(1000)
  const [baseK0, setBaseK0] = useState(1)
  const [baseR, setBaseR] = useState(0.82)
  const [baseDeltaT, setBaseDeltaT] = useState(10)
  const [mediumKey, setMediumKey] = useState('air')
  const formulas = useMemo(() => {
    const n = mengerOrder
    const pow = (base: number, exp: number) => Math.pow(base, exp)
    const medium = MEDIUMS.find((m) => m.key === mediumKey) || MEDIUMS[0]
    const N = pow(20, n)
    const edge = 1 / pow(3, n)
    const volume = pow(20 / 27, n)
    const volumeRemoved = 1 - volume
    const area = 6 * pow(20 / 9, n)
    const surfaceVolume = area / (volume || 1)
    const svClosed = 6 * pow(3, n)
    const D = Math.log(20) / Math.log(3)
    const density = volume
    const holes = n >= 1 ? 7 * pow(20, n - 1) : 0
    const totalHoles = 7 * (pow(20, n) - 1) / 19
    const opticsReflections = pow(3, n)
    const acousticsAlpha = pow(3, n) * medium.acousticAbsorb
    const resonance = pow(3, n)
    const thermalK = pow(20 / 27, n)
    const electricalR = pow(3 / 20, n)
    const fluidPorosity = 1 - pow(20 / 27, n)
    const fluidResistance = pow(3, n) * medium.fluidResist
    const lOpt = baseL0 * pow(3, n)
    const transmittance = Math.exp(-(baseMu * medium.opticalAtten) * lOpt)
    const scatteredIntensity = baseI0 / (1 + (baseScatterK * medium.opticalScatter) * area)
    const fResonance = baseF0 * pow(3, n)
    const kEff = (baseK0 * medium.thermalCond) * pow(20 / 27, n)
    const rEff = (baseR * medium.electricalResist) * pow(3 / 20, n)
    const heatFlux = kEff * area * baseDeltaT / Math.max(edge, 1e-9)
    return {
      n,
      N,
      edge,
      volume,
      volumeRemoved,
      area,
      surfaceVolume,
      svClosed,
      D,
      density,
      holes,
      totalHoles,
      opticsReflections,
      acousticsAlpha,
      resonance,
      thermalK,
      electricalR,
      fluidPorosity,
      fluidResistance,
      lOpt,
      transmittance,
      scatteredIntensity,
      fResonance,
      kEff,
      rEff,
      heatFlux
    }
  }, [mengerOrder, baseL0, baseMu, baseScatterK, baseI0, baseF0, baseK0, baseR, baseDeltaT, mediumKey])

  useEffect(() => {
    setForces((f) => ({ ...f, g: gravity }))
  }, [gravity])

  useEffect(() => {
    if (!animateTime) return
    const id = setInterval(() => setTimeOfDay((t) => (t + 0.003) % 1), 30)
    return () => clearInterval(id)
  }, [animateTime])

  const panStart = useRef<THREE.Vector3 | null>(null)
  const panResponder = useMemo(
    () =>
      ReactNative.PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, gesture) => {
          panStart.current = new THREE.Vector3(gesture.x0, gesture.y0, 0)
          if (controlMode === 'grab' && !manualPos) {
            setManualPos((pos) => new THREE.Vector3(pos ? pos.x : 0, pos ? pos.y : 2, pos ? pos.z : 0))
          }
        },
        onPanResponderMove: (_, gesture) => {
          if (!panStart.current) return
          if (controlMode === 'grab') {
            const dx = gesture.moveX - panStart.current.x
            const dy = gesture.moveY - panStart.current.y
            const startY = manualPos ? manualPos.y : 2
            const startX = manualPos ? manualPos.x : 0
            const startZ = manualPos ? manualPos.z : 0
            // Allow grabbing/dragging the cube vertically without an upper cap.
            const newY = Math.max(0.6, startY - dy * 0.02)
            const newX = THREE.MathUtils.clamp(startX + dx * 0.02, -3, 3)
            const newZ = THREE.MathUtils.clamp(startZ + dy * 0.02, -3, 3)
            setManualPos(new THREE.Vector3(newX, newY, newZ))
          }
          if (controlMode === 'camera') {
            const dx = gesture.moveX - panStart.current.x
            const dy = gesture.moveY - panStart.current.y
            setAzimuth((a) => a - dx * 0.005)
            setElevation((e) => THREE.MathUtils.clamp(e + dy * 0.004, 0.25, 1.2))
            panStart.current = new THREE.Vector3(gesture.moveX, gesture.moveY, 0)
          }
        },
        onPanResponderRelease: (_, gesture) => {
          if (!panStart.current) return
          const end = new THREE.Vector3(gesture.moveX || gesture.x0, gesture.moveY || gesture.y0, 0)
          const delta = end.sub(panStart.current)
          if (controlMode === 'throw') {
            const vx = -delta.x * 0.02
            const vz = delta.y * 0.02
            const vy = Math.min(12, Math.max(-4, 6 + -delta.y * 0.02))
            setThrowVelocity(new THREE.Vector3(vx, vy, vz))
          }
          if (controlMode === 'grab') {
            setManualPos(null)
          }
          panStart.current = null
        }
      }),
    [controlMode]
  )

  const total = kinetic + potential
  const skyColor = useMemo(() => {
    const day = new THREE.Color('#6fa5ff')
    const night = new THREE.Color('#050a12')
    return night.lerp(day, timeOfDay).getStyle()
  }, [timeOfDay])

  return (
    <ReactNative.View style={{ flex: 1, backgroundColor: BG }}>
      <ReactNative.StatusBar barStyle="light-content" />
      <ArchBackground />
      <Canvas
        style={{ flex: 1 }}
        camera={{ position: [0, 2.8, 4.5], fov: 55 }}
        onCreated={({ gl }) => {
          gl.setClearColor(skyColor)
        }}
      >
        <color attach="background" args={[skyColor]} />
        <CameraRig azimuth={azimuth} elevation={elevation} radius={radius} offset={camOffset} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[12, 12]} />
          <meshStandardMaterial color="#3b7a3b" roughness={0.95} metalness={0.05} />
        </mesh>
        <PhysicsMenger
          mass={mass}
          gravity={gravity}
          friction={friction}
          restitution={restitution}
          lightIntensity={lightIntensity}
          envStrength={envStrength}
          throwVelocity={throwVelocity}
          resetSignal={resetSignal}
          manualPos={manualPos}
          paused={paused}
          mengerOrder={mengerOrder}
          onEnergyUpdate={(k, p) => {
            setKinetic(k)
            setPotential(p)
          }}
          onForcesUpdate={setForces}
        />
      </Canvas>

      <ReactNative.View
        style={{
          position: 'absolute',
          top: 8,
          left: 10,
          right: 10,
          zIndex: 20
        }}
      >
        <ArchNav active="/energy" />
      </ReactNative.View>

      <ReactNative.View
        {...panResponder.panHandlers}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: panelVisible ? PANEL_MAX_HEIGHT + 20 : 80
        }}
        pointerEvents="auto"
      />

      <ReactNative.View
        style={{
          position: 'absolute',
          right: 14,
          top: 16,
          backgroundColor: 'rgba(0,0,0,0.35)',
          paddingHorizontal: 10,
          paddingVertical: 8,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: ARCH.BORDER_SOFT
        }}
      >
        <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '700' }}>
          G: {forces.g.toFixed(2)} | |v|: {forces.v.toFixed(2)} | N: {forces.n.toFixed(2)}
        </ReactNative.Text>
      </ReactNative.View>

      <ReactNative.View
        style={{
          position: 'absolute',
          left: 12,
          top: 16,
          flexDirection: 'row',
          gap: 8
        }}
      >
        {(['throw', 'grab', 'camera'] as ControlMode[]).map((m) => (
          <ReactNative.TouchableOpacity
            key={m}
            onPress={() => setControlMode(m)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 10,
              backgroundColor: controlMode === m ? 'rgba(43,140,246,0.28)' : 'rgba(0,0,0,0.35)',
              borderWidth: 1,
              borderColor: controlMode === m ? 'rgba(43,140,246,0.6)' : ARCH.BORDER_SOFT
            }}
          >
            <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '700' }}>{m === 'throw' ? 'Throw' : m === 'grab' ? 'Lift' : 'Camera'}</ReactNative.Text>
          </ReactNative.TouchableOpacity>
        ))}
      </ReactNative.View>

      <ReactNative.View style={{ position: 'absolute', left: 12, bottom: panelVisible ? PANEL_MAX_HEIGHT + 20 : 40, flexDirection: 'column', gap: 6 }}>
        <ReactNative.View style={{ flexDirection: 'row', gap: 6 }}>
          <ReactNative.TouchableOpacity
            onPress={() => setCamOffset((c) => ({ ...c, z: c.z - 0.4 }))}
            style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.35)', borderWidth: 1, borderColor: ARCH.BORDER_SOFT }}
          >
            <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '700' }}>W</ReactNative.Text>
          </ReactNative.TouchableOpacity>
        </ReactNative.View>
        <ReactNative.View style={{ flexDirection: 'row', gap: 6 }}>
          <ReactNative.TouchableOpacity
            onPress={() => setCamOffset((c) => ({ ...c, x: c.x - 0.4 }))}
            style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.35)', borderWidth: 1, borderColor: ARCH.BORDER_SOFT }}
          >
            <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '700' }}>A</ReactNative.Text>
          </ReactNative.TouchableOpacity>
          <ReactNative.TouchableOpacity
            onPress={() => setCamOffset((c) => ({ ...c, z: c.z + 0.4 }))}
            style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.35)', borderWidth: 1, borderColor: ARCH.BORDER_SOFT }}
          >
            <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '700' }}>S</ReactNative.Text>
          </ReactNative.TouchableOpacity>
          <ReactNative.TouchableOpacity
            onPress={() => setCamOffset((c) => ({ ...c, x: c.x + 0.4 }))}
            style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.35)', borderWidth: 1, borderColor: ARCH.BORDER_SOFT }}
          >
            <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '700' }}>D</ReactNative.Text>
          </ReactNative.TouchableOpacity>
        </ReactNative.View>
      </ReactNative.View>

      <ReactNative.TouchableOpacity
        onPress={() => setPanelVisible((v) => !v)}
        style={{
          position: 'absolute',
          right: 16,
          bottom: panelVisible ? PANEL_MAX_HEIGHT + 20 : 20,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 10,
          backgroundColor: 'rgba(0,0,0,0.35)',
          borderWidth: 1,
          borderColor: ARCH.BORDER_SOFT,
          zIndex: 50
        }}
      >
        <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '700' }}>{panelVisible ? 'Hide UI' : 'Show UI'}</ReactNative.Text>
      </ReactNative.TouchableOpacity>

      {panelVisible ? (
        <ReactNative.View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10,16,26,0.96)',
            paddingHorizontal: 14,
            paddingTop: 8,
            paddingBottom: 12,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            borderTopWidth: 1,
            borderColor: ARCH.BORDER_SOFT,
            shadowColor: '#000',
            shadowOpacity: 0.4,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: -2 },
            elevation: 18
          }}
        >
          <ReactNative.View style={{ alignSelf: 'center', width: 48, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)', marginBottom: 8 }} />

                    <ReactNative.ScrollView
            style={{ maxHeight: PANEL_MAX_HEIGHT }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 6 }}
          >
            <ReactNative.View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <ReactNative.Text style={{ color: ARCH.TEXT, fontSize: 15, fontWeight: '800' }}>Energy control</ReactNative.Text>
              <ReactNative.TouchableOpacity onPress={() => setResetSignal((n) => n + 1)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: ACCENT }}>
                <ReactNative.Text style={{ color: '#fff', fontWeight: '700' }}>Reset</ReactNative.Text>
              </ReactNative.TouchableOpacity>
            </ReactNative.View>

            <ReactNative.Text style={{ color: ARCH.SUB, marginBottom: 8, fontSize: 12, lineHeight: 18 }}>
              Throw the cube (drag) to see Ep = m*g*h and Ec = 1/2*m*v^2. Auto respawn under the platform. Arrows: red = gravity, blue = velocity, green = normal force.
            </ReactNative.Text>

            <Slider label="Gravity (m/s^2)" value={gravity} min={1} max={18} step={0.1} onChange={setGravity} />
            <Slider label="Cube mass (kg)" value={mass} min={0.5} max={6} step={0.1} onChange={setMass} />
            <Slider label="Friction (damping)" value={friction} min={0} max={1} step={0.01} onChange={setFriction} />
            <Slider label="Restitution" value={restitution} min={0} max={1} step={0.01} onChange={setRestitution} />
            <Slider label="Direct light" value={lightIntensity} min={0.2} max={2} step={0.05} onChange={setLightIntensity} />
            <Slider label="Ambient light" value={envStrength} min={0.2} max={2} step={0.05} onChange={setEnvStrength} />
            <Slider label="Menger level" value={mengerOrder} min={0} max={4} step={1} onChange={(v) => setMengerOrder(Math.round(v))} />
            <Slider label="Time (0 night, 1 day)" value={timeOfDay} min={0} max={1} step={0.01} onChange={setTimeOfDay} />

            <ReactNative.View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <ReactNative.TouchableOpacity
                onPress={() => setAnimateTime((s) => !s)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: animateTime ? 'rgba(43,140,246,0.25)' : 'rgba(255,255,255,0.05)',
                  borderWidth: 1,
                  borderColor: animateTime ? 'rgba(43,140,246,0.6)' : ARCH.BORDER_SOFT
                }}
              >
                <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '700' }}>{animateTime ? 'Time animation ON' : 'Time animation OFF'}</ReactNative.Text>
              </ReactNative.TouchableOpacity>
              <ReactNative.TouchableOpacity
                onPress={() => setPaused((p) => !p)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: paused ? 'rgba(255,180,92,0.2)' : 'rgba(255,255,255,0.05)',
                  borderWidth: 1,
                  borderColor: paused ? 'rgba(255,180,92,0.6)' : ARCH.BORDER_SOFT
                }}
              >
                <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '700' }}>{paused ? 'Paused' : 'Running'}</ReactNative.Text>
              </ReactNative.TouchableOpacity>
            </ReactNative.View>
            <ReactNative.View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <ReactNative.View>
                <ReactNative.Text style={{ color: '#8fd4ff', fontWeight: '700', fontSize: 13 }}>Kinetic energy</ReactNative.Text>
                <ReactNative.Text style={{ color: ARCH.TEXT, fontSize: 13 }}>{kinetic.toFixed(2)} J</ReactNative.Text>
              </ReactNative.View>
              <ReactNative.View>
                <ReactNative.Text style={{ color: '#8fd4ff', fontWeight: '700', fontSize: 13 }}>Potential energy</ReactNative.Text>
                <ReactNative.Text style={{ color: ARCH.TEXT, fontSize: 13 }}>{potential.toFixed(2)} J</ReactNative.Text>
              </ReactNative.View>
              <ReactNative.View>
                <ReactNative.Text style={{ color: '#8fd4ff', fontWeight: '700', fontSize: 13 }}>Total</ReactNative.Text>
                <ReactNative.Text style={{ color: ARCH.TEXT, fontSize: 13 }}>{total.toFixed(2)} J</ReactNative.Text>
              </ReactNative.View>
            </ReactNative.View>

            <ReactNative.View style={{ marginTop: 12 }}>
              <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '800', fontSize: 14, marginBottom: 8 }}>Fractal physical properties</ReactNative.Text>
              <ReactNative.View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {PROPERTY_SECTIONS.map((section) => {
                  const active = propertyKey === section.key
                  return (
                    <ReactNative.TouchableOpacity
                      key={section.key}
                      onPress={() => setPropertyKey(section.key)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 10,
                        backgroundColor: active ? 'rgba(43,140,246,0.22)' : 'rgba(255,255,255,0.06)',
                        borderWidth: 1,
                        borderColor: active ? 'rgba(43,140,246,0.65)' : ARCH.BORDER_SOFT
                      }}
                    >
                      <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '700', fontSize: 12 }}>{section.title}</ReactNative.Text>
                    </ReactNative.TouchableOpacity>
                  )
                })}
              </ReactNative.View>

              {(() => {
                const active = PROPERTY_SECTIONS.find((p) => p.key === propertyKey) || PROPERTY_SECTIONS[0]
                return (
                  <ReactNative.View style={{ marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: ARCH.BORDER_SOFT }}>
                    {active.points.map((pt) => (
                      <ReactNative.Text key={pt} style={{ color: ARCH.SUB, marginBottom: 4, fontSize: 12 }}>
                        ? {pt}
                      </ReactNative.Text>
                    ))}
                  </ReactNative.View>
                )
              })()}
            </ReactNative.View>

            <ReactNative.View style={{ marginTop: 12 }}>
              <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '800', fontSize: 14, marginBottom: 6 }}>Tuning constants (live)</ReactNative.Text>
              <ReactNative.View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {[
                  { label: 'L0 (m) - base optical path', value: baseL0.toString(), setter: (v: string) => setBaseL0(parseNumber(v, baseL0)), note: 'Base optical path length', use: 'Used in L_opt and T(n)' },
                  { label: 'mu (1/m) - attenuation', value: baseMu.toString(), setter: (v: string) => setBaseMu(parseNumber(v, baseMu)), note: 'Attenuation coefficient', use: 'Used in T(n)=e^(-mu*L_opt)' },
                  { label: 'Scatter k - scattering strength', value: baseScatterK.toString(), setter: (v: string) => setBaseScatterK(parseNumber(v, baseScatterK)), note: 'Scattering constant', use: 'Used in I_out = I_in/(1+k*A)' },
                  { label: 'I0 - input intensity', value: baseI0.toString(), setter: (v: string) => setBaseI0(parseNumber(v, baseI0)), note: 'Input intensity', use: 'Used in scattered intensity' },
                  { label: 'f0 (Hz) - base resonance', value: baseF0.toString(), setter: (v: string) => setBaseF0(parseNumber(v, baseF0)), note: 'Base resonant frequency', use: 'Used in f_n = f0*3^n' },
                  { label: 'k0 (W/mK) - thermal base', value: baseK0.toString(), setter: (v: string) => setBaseK0(parseNumber(v, baseK0)), note: 'Base thermal conductivity', use: 'Used in k_eff, heat flux Phi' },
                  { label: 'R0 (ohm) - electrical base', value: baseR.toString(), setter: (v: string) => setBaseR(parseNumber(v, baseR)), note: 'Base electrical resistance', use: 'Used in R_eff scaling' },
                  { label: 'dT (K) - temperature gradient', value: baseDeltaT.toString(), setter: (v: string) => setBaseDeltaT(parseNumber(v, baseDeltaT)), note: 'Temperature gradient', use: 'Used in heat flux Phi' }
                ].map(({ label, value, setter, note, use }) => (
                  <ReactNative.View key={label} style={{ width: '48%' }}>
                    <ReactNative.Text style={{ color: ARCH.SUB, fontSize: 12 }}>{label}</ReactNative.Text>
                    <ReactNative.TextInput
                      value={value}
                      onChangeText={setter}
                      keyboardType="numeric"
                      style={{
                        marginTop: 4,
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                        borderRadius: 8,
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.12)',
                        color: ARCH.TEXT,
                        fontSize: 12
                      }}
                    />
                    <ReactNative.Text style={{ color: ARCH.MUTED, fontSize: 11, marginTop: 2 }}>{note}</ReactNative.Text>
                    <ReactNative.Text style={{ color: ARCH.MUTED, fontSize: 11 }}>{use}</ReactNative.Text>
                  </ReactNative.View>
                ))}
              </ReactNative.View>
            </ReactNative.View>

            <ReactNative.View style={{ marginTop: 12 }}>
              <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '800', fontSize: 14, marginBottom: 6 }}>Formula values (n = {formulas.n})</ReactNative.Text>
              <ReactNative.View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, borderWidth: 1, borderColor: ARCH.BORDER_SOFT, padding: 12 }}>
                {[
                  ['Cubes N', formatNumber(formulas.N)],
                  ['Edge length l', formatNumber(formulas.edge)],
                  ['Volume V', formatNumber(formulas.volume)],
                  ['Removed volume', formatNumber(formulas.volumeRemoved)],
                  ['Area A', formatNumber(formulas.area)],
                  ['Surface/Volume', formatNumber(formulas.surfaceVolume)],
                  ['S/V closed form', formatNumber(formulas.svClosed)],
                  ['Fractal dimension D', formatNumber(formulas.D)],
                  ['Density rho', formatNumber(formulas.density)],
                  ['Holes H', formatNumber(formulas.holes)],
                  ['Total holes H_tot', formatNumber(formulas.totalHoles)],
                  ['Optics: reflections ~3^n', formatNumber(formulas.opticsReflections)],
                  ['Acoustics: alpha ~3^n', formatNumber(formulas.acousticsAlpha)],
                  ['Resonant f_n ~3^n', formatNumber(formulas.resonance)],
                  ['Thermal k_eff', formatNumber(formulas.thermalK)],
                  ['Electrical R_eff', formatNumber(formulas.electricalR)],
                  ['Fluid porosity phi', formatNumber(formulas.fluidPorosity)],
                  ['Fluid resistance R_f', formatNumber(formulas.fluidResistance)],
                  ['Optical path L_opt', formatNumber(formulas.lOpt)],
                  ['Transmittance T', formatNumber(formulas.transmittance)],
                  ['Scattered intensity I_out', formatNumber(formulas.scatteredIntensity)],
                  ['Resonant freq f_n', formatNumber(formulas.fResonance)],
                  ['Thermal k_eff (scaled)', formatNumber(formulas.kEff)],
                  ['Electrical R_eff (scaled)', formatNumber(formulas.rEff)],
                  ['Heat flux Phi', formatNumber(formulas.heatFlux)]
                ].map(([label, value]) => (
                  <ReactNative.View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <ReactNative.Text style={{ color: ARCH.SUB, fontSize: 12 }}>{label}</ReactNative.Text>
                    <ReactNative.Text style={{ color: ARCH.TEXT, fontSize: 12, fontWeight: '700' }}>{value}</ReactNative.Text>
                  </ReactNative.View>
                ))}
              </ReactNative.View>
            </ReactNative.View>
          </ReactNative.ScrollView>
        </ReactNative.View>
      ) : null}
    </ReactNative.View>
  )
}

