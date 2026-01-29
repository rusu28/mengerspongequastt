import { Canvas, useFrame, useThree } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as ReactNative from 'react-native'
import * as THREE from 'three'
import { ArchBackground, ARCH } from '@/components/arch-theme'
import { ArchNav } from '@/components/arch-nav'

const MAX_ORDER = 5
const CUBE_COUNT_MAP = { 0: 1, 1: 7, 2: 147, 3: 2947, 4: 58947, 5: '>59k' }

// Helper: detect mobile
const useIsMobile = () => {
  return useMemo(() => {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') return false
    const ua = navigator.userAgent || ''
    const isTouch = 'ontouchstart' in window
    const smallScreen = window.innerWidth <= 768
    return /Mobi|Android|iPhone|iPad|iPod/.test(ua) || isTouch || smallScreen
  }, [])
}

// Recursion: generate positions for the Menger sponge
function generateMengerPositions(order, size = 1, position = [0, 0, 0]) {
  if (order === 0) return [{ pos: position, size }]

  const newPositions = []
  const offset = size / 3

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const sum = Math.abs(x) + Math.abs(y) + Math.abs(z)
        if (sum > 1) {
          const newX = position[0] + x * offset
          const newY = position[1] + y * offset
          const newZ = position[2] + z * offset
          newPositions.push(
            ...generateMengerPositions(order - 1, size / 3, [newX, newY, newZ])
          )
        }
      }
    }
  }
  return newPositions
}

function Menger({ order, lowGraphics, mobile, vrRotation }) {
  const maxRenderIfLowDesktop = 3
  const maxRenderIfHighDesktop = 4
  const maxRenderIfLowMobile = 2
  const maxRenderIfHighMobile = 3

  const effectiveOrder = useMemo(() => {
    if (mobile) {
      return Math.min(order, lowGraphics ? maxRenderIfLowMobile : maxRenderIfHighMobile)
    }
    return Math.min(order, lowGraphics ? maxRenderIfLowDesktop : maxRenderIfHighDesktop)
  }, [order, lowGraphics, mobile])

  const positions = useMemo(() => generateMengerPositions(effectiveOrder, 1, [0, 0, 0]), [effectiveOrder])
  const finalCubeSize = useMemo(() => 1 / Math.pow(3, effectiveOrder), [effectiveOrder])
  const { size, viewport } = useThree()

  const bounds = useMemo(() => {
    if (!positions || positions.length === 0) return { span: 1 }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity
    for (const p of positions) {
      const [x, y, z] = p.pos
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
      minZ = Math.min(minZ, z)
      maxZ = Math.max(maxZ, z)
    }
    const spanX = (maxX - minX) + finalCubeSize
    const spanY = (maxY - minY) + finalCubeSize
    const spanZ = (maxZ - minZ) + finalCubeSize
    return { span: Math.max(spanX, spanY, spanZ) }
  }, [positions, finalCubeSize])

  const defaultTargetPixels = mobile ? Math.min(380, Math.min(size.width, size.height) * 0.7) : Math.min(500, Math.min(size.width, size.height) * 0.4)
  const worldPerPixel = viewport.width / size.width
  const targetWorld = defaultTargetPixels * worldPerPixel
  const globalScale = targetWorld / (bounds.span || 1)

  const useInstancing = positions.length > 3000
  const groupRef = useRef()
  const meshRef = useRef()

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotate cube based on device orientation if VR mode is active
      if (mobile && vrRotation) {
        const { gamma, beta } = vrRotation
        groupRef.current.rotation.y = gamma * 0.01
        groupRef.current.rotation.x = beta * 0.01
      } else {
        const ySpeed = mobile ? 0.28 : 0.2
        const xSpeed = mobile ? 0.12 : 0.08
        groupRef.current.rotation.y += delta * ySpeed
        groupRef.current.rotation.x += delta * xSpeed
      }
    }
  })

  useEffect(() => {
    if (!meshRef.current) return
    const dummy = new THREE.Object3D()
    for (let i = 0; i < positions.length; i++) {
      const p = positions[i].pos
      dummy.position.set(p[0], p[1], p[2])
      dummy.scale.set(finalCubeSize * globalScale, finalCubeSize * globalScale, finalCubeSize * globalScale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [positions, finalCubeSize, globalScale])

  const materialColor = '#7ab07a'

  if (useInstancing) {
    return (
      <group ref={groupRef} scale={[1, 1, 1]}>
        <instancedMesh ref={meshRef} args={[null, null, positions.length]} frustumCulled={false}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={materialColor} roughness={0.3} metalness={0.1} />
        </instancedMesh>
      </group>
    )
  }

  return (
    <group ref={groupRef} scale={[1, 1, 1]}>
      {positions.map((p, i) => (
        <mesh key={i} position={p.pos} scale={[finalCubeSize * globalScale, finalCubeSize * globalScale, finalCubeSize * globalScale]} frustumCulled={false}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={materialColor} roughness={0.3} metalness={0.1} />
        </mesh>
      ))}
    </group>
  )
}

function OrderSlider({ value, min = 0, max = MAX_ORDER, onChange }) {
  const [width, setWidth] = useState(0)
  const clamp = (n) => Math.min(max, Math.max(min, Math.round(n)))

  const handlePosition = (x) => {
    if (!width) return
    const ratio = Math.min(1, Math.max(0, x / width))
    const next = min + ratio * (max - min)
    onChange(clamp(next))
  }

  const ratio = (value - min) / (max - min || 1)
  const knobLeft = width ? ratio * width : 0

  return (
    <ReactNative.View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onResponderGrant={(e) => handlePosition(e.nativeEvent.locationX)}
      onResponderMove={(e) => handlePosition(e.nativeEvent.locationX)}
      style={{ paddingVertical: 10, position: 'relative' }}
    >
      <ReactNative.View style={{ height: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)' }} />
      <ReactNative.View
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          width: width ? Math.max(12, knobLeft) : 0,
          height: 8,
          borderRadius: 999,
          backgroundColor: ARCH.ACCENT,
          transform: [{ translateY: -4 }]
        }}
      />
      <ReactNative.View
        style={{
          position: 'absolute',
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: ARCH.ACCENT,
          borderWidth: 2,
          borderColor: '#0c1a28',
          left: Math.max(0, Math.min(knobLeft - 14, width ? width - 28 : 0)),
          top: '50%',
          transform: [{ translateY: -14 }],
          shadowColor: '#000',
          shadowOpacity: 0.35,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
          elevation: 6
        }}
      />
    </ReactNative.View>
  )
}

function MiniTutorial({ visible, onClose }) {
  if (!visible) return null
  return (
    <ReactNative.View style={{
      position: 'absolute',
      top: 70,
      left: 20,
      right: 20,
      backgroundColor: ARCH.PANEL_2,
      padding: 16,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 8,
      borderWidth: 1,
      borderColor: ARCH.BORDER_SOFT,
      zIndex: 20
    }}>
      <ReactNative.Text style={{ fontWeight: '800', fontSize: 18, marginBottom: 8, color: ARCH.TEXT }}>Menger Sponge - quick guide</ReactNative.Text>
      <ReactNative.Text style={{ color: ARCH.SUB, marginBottom: 4 }}>- Fractal built recursively from 3x3x3 subdivisions.</ReactNative.Text>
      <ReactNative.Text style={{ color: ARCH.SUB, marginBottom: 4 }}>- Remove the center cube and all face centers at every level.</ReactNative.Text>
      <ReactNative.Text style={{ color: ARCH.SUB, marginBottom: 4 }}>- Cube count explodes: 1 -> 7 -> 147 -> 2947 -> 58947.</ReactNative.Text>
      <ReactNative.Text style={{ color: ARCH.SUB }}>- On mobile you can tilt the phone to rotate the model.</ReactNative.Text>

      <ReactNative.TouchableOpacity onPress={onClose} style={{ marginTop: 14, padding: 10, backgroundColor: ARCH.ACCENT, borderRadius: 10, alignSelf: 'flex-end' }}>
        <ReactNative.Text style={{ color: '#120A16', fontWeight: '800' }}>Got it</ReactNative.Text>
      </ReactNative.TouchableOpacity>
    </ReactNative.View>
  )
}

export default function App() {
  const [order, setOrder] = useState(1)
  const [lowGraphics, setLowGraphics] = useState(true)
  const [vrRotation, setVrRotation] = useState({ beta: 0, gamma: 0 })
  const [showTutorial, setShowTutorial] = useState(false)

  const mobile = useIsMobile()

  useEffect(() => {
    if (!mobile) return
    const handleOrientation = (e) => {
      setVrRotation({ beta: e.beta || 0, gamma: e.gamma || 0 })
    }
    window.addEventListener('deviceorientation', handleOrientation)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [mobile])

  const cubeCount = CUBE_COUNT_MAP[order] ?? '>59k'
  const cubeSizeDisplay = (1 / Math.pow(order || 1, 3)).toFixed(3)
  const performanceNotice = (lowGraphics && order > 3) || (!lowGraphics && order > 4)
  const accent = ARCH.ACCENT

  return (
    <ReactNative.View style={{ flex: 1, backgroundColor: ARCH.BG }}>
      <ArchBackground />
      <Canvas
        style={{ flex: 1 }}
        camera={{ position: mobile ? [2.6, 2.6, 2.6] : [2, 2, 2], fov: mobile ? 60 : 50 }}
      >
        <color attach="background" args={[ARCH.BG]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Menger order={order} lowGraphics={lowGraphics} mobile={mobile} vrRotation={vrRotation} />
      </Canvas>

      <ReactNative.View style={{
        position: 'absolute',
        top: mobile ? 40 : 24,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10
      }}>
        <ReactNative.View>
          <ArchNav active="/explore" />
          <ReactNative.Text style={{ color: ARCH.TEXT, fontSize: mobile ? 22 : 20, fontWeight: '800', letterSpacing: 0.3 }}>Menger Sponge Viewer</ReactNative.Text>
          <ReactNative.Text style={{ color: ARCH.SUB, marginTop: 4 }}>Explore the fractal in 3D</ReactNative.Text>
        </ReactNative.View>
        <ReactNative.TouchableOpacity
          onPress={() => setShowTutorial(true)}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: ARCH.PANEL,
            borderWidth: 1,
            borderColor: ARCH.BORDER_SOFT,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8
          }}
        >
          <ReactNative.Text style={{ color: '#e6f0ff', fontWeight: '800', fontSize: 18 }}>i</ReactNative.Text>
        </ReactNative.TouchableOpacity>
      </ReactNative.View>

      <ReactNative.View style={{
        position: 'absolute',
        bottom: mobile ? 26 : 18,
        left: 16,
        right: 16,
        backgroundColor: ARCH.PANEL,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: ARCH.BORDER_SOFT,
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12
      }}>
        <ReactNative.View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <ReactNative.Text style={{ color: ARCH.TEXT, fontSize: 18, fontWeight: '700' }}>Iteration level</ReactNative.Text>
          <ReactNative.Text style={{ color: accent, fontSize: 20, fontWeight: '800' }}>{order}</ReactNative.Text>
        </ReactNative.View>

        <OrderSlider value={order} min={0} max={MAX_ORDER} onChange={setOrder} />

        <ReactNative.View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <ReactNative.TouchableOpacity
            onPress={() => setLowGraphics((s) => !s)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: lowGraphics ? 'rgba(216,180,254,0.18)' : ARCH.PANEL,
              borderWidth: 1,
              borderColor: lowGraphics ? 'rgba(216,180,254,0.55)' : ARCH.BORDER_SOFT
            }}
          >
            <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '600' }}>{lowGraphics ? 'Low Graphics ON' : 'High Fidelity'}</ReactNative.Text>
          </ReactNative.TouchableOpacity>
          <ReactNative.Text style={{ color: ARCH.SUB, marginLeft: 10 }}>
            {mobile ? 'Tilt your phone to rotate' : 'Auto-rotation (mouse to orbit)'}
          </ReactNative.Text>
        </ReactNative.View>

        <ReactNative.View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
          <ReactNative.View>
            <ReactNative.Text style={{ color: ARCH.MUTED, fontSize: 12 }}>Cubes</ReactNative.Text>
            <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '700', marginTop: 2 }}>{cubeCount}</ReactNative.Text>
          </ReactNative.View>
          <ReactNative.View>
            <ReactNative.Text style={{ color: ARCH.MUTED, fontSize: 12 }}>Cube size</ReactNative.Text>
            <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '700', marginTop: 2 }}>{cubeSizeDisplay}</ReactNative.Text>
          </ReactNative.View>
          <ReactNative.View>
            <ReactNative.Text style={{ color: ARCH.MUTED, fontSize: 12 }}>Quality</ReactNative.Text>
            <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '700', marginTop: 2 }}>{lowGraphics ? 'Performance' : 'Detail'}</ReactNative.Text>
          </ReactNative.View>
        </ReactNative.View>

        {performanceNotice ? (
          <ReactNative.Text style={{ marginTop: 10, color: ARCH.MUTED, fontSize: 12 }}>
            Render capped for performance; level approximated.
          </ReactNative.Text>
        ) : null}
      </ReactNative.View>

      <MiniTutorial visible={showTutorial} onClose={() => setShowTutorial(false)} />
    </ReactNative.View>
  )
}






