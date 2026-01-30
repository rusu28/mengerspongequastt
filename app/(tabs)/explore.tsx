import { Canvas, useFrame, useThree } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable, useWindowDimensions, TextInput } from 'react-native'
import * as THREE from 'three'
import { ArchBackground, ARCH } from '@/components/arch-theme'
import { RuriNav } from '@/components/ruri-nav'

type MaterialMode = 'neon' | 'glass' | 'wireframe' | 'cartoon' | 'cosmic'

const MAX_ORDER = 5
const CUBE_COUNT_MAP: Record<number, string> = { 0: '1', 1: '7', 2: '147', 3: '2,947', 4: '58,947', 5: '>59k' }

const MATERIALS: { key: MaterialMode; label: string; blurb: string }[] = [
  { key: 'neon', label: 'Neon', blurb: 'Glow + emissive' },
  { key: 'glass', label: 'Glass', blurb: 'Transparent shell' },
  { key: 'wireframe', label: 'Wireframe', blurb: 'Edge focus' },
  { key: 'cartoon', label: 'Cartoon', blurb: 'Flat shading' },
  { key: 'cosmic', label: 'Cosmic', blurb: 'Deep space' }
]

const COLOR_SWATCHES = ['#93C5FD', '#F0ABFC', '#D8B4FE', '#7DD3FC', '#FDE68A', '#FCA5A5']

const MODULES = [
  { title: 'Archive', subtitle: 'Selected studies' },
  { title: 'Collection', subtitle: 'Iteration focus' },
  { title: 'Editorial', subtitle: 'Line language' },
  { title: 'Studio', subtitle: 'Material tests' }
]

const useIsMobile = () => {
  return useMemo(() => {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') return false
    const ua = navigator.userAgent || ''
    const isTouch = 'ontouchstart' in window
    const smallScreen = window.innerWidth <= 768
    return /Mobi|Android|iPhone|iPad|iPod/.test(ua) || isTouch || smallScreen
  }, [])
}

function generateMengerPositions(order: number, size = 1, position: [number, number, number] = [0, 0, 0]) {
  if (order === 0) return [{ pos: position, size }]

  const newPositions: { pos: [number, number, number]; size: number }[] = []
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

function getMaterialProps(mode: MaterialMode, tint: string) {
  switch (mode) {
    case 'neon':
      return {
        color: tint,
        emissive: new THREE.Color(tint),
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.2
      }
    case 'glass':
      return {
        color: tint,
        transparent: true,
        opacity: 0.38,
        roughness: 0.05,
        metalness: 0.1
      }
    case 'wireframe':
      return {
        color: tint,
        wireframe: true,
        roughness: 0.6,
        metalness: 0
      }
    case 'cartoon':
      return {
        color: tint,
        roughness: 0.7,
        metalness: 0,
        flatShading: true
      }
    case 'cosmic':
    default:
      return {
        color: tint,
        roughness: 0.35,
        metalness: 0.25
      }
  }
}

function Menger({ order, lowGraphics, mobile, vrRotation, zoom, rotationSpeed, autoRotate, materialMode, tint }: {
  order: number
  lowGraphics: boolean
  mobile: boolean
  vrRotation: { beta: number; gamma: number }
  zoom: number
  rotationSpeed: number
  autoRotate: boolean
  materialMode: MaterialMode
  tint: string
}) {
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

  const defaultTargetPixels = mobile ? Math.min(380, Math.min(size.width, size.height) * 0.7) : Math.min(520, Math.min(size.width, size.height) * 0.42)
  const worldPerPixel = viewport.width / size.width
  const targetWorld = defaultTargetPixels * worldPerPixel
  const globalScale = (targetWorld / (bounds.span || 1)) * zoom

  const useInstancing = positions.length > 3000
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.InstancedMesh>(null)

  useFrame((_, delta) => {
    if (!groupRef.current) return

    if (mobile && vrRotation) {
      const { gamma, beta } = vrRotation
      groupRef.current.rotation.y = gamma * 0.01
      groupRef.current.rotation.x = beta * 0.01
      return
    }

    if (autoRotate) {
      const speed = 0.08 + rotationSpeed * 0.5
      groupRef.current.rotation.y += delta * speed
      groupRef.current.rotation.x += delta * speed * 0.45
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

  const materialProps = getMaterialProps(materialMode, tint)

  if (useInstancing) {
    return (
      <group ref={groupRef} scale={[1, 1, 1]}>
        <instancedMesh ref={meshRef} args={[null, null, positions.length]} frustumCulled={false}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial {...materialProps} />
        </instancedMesh>
      </group>
    )
  }

  return (
    <group ref={groupRef} scale={[1, 1, 1]}>
      {positions.map((p, i) => (
        <mesh key={i} position={p.pos} scale={[finalCubeSize * globalScale, finalCubeSize * globalScale, finalCubeSize * globalScale]} frustumCulled={false}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      ))}
    </group>
  )
}

function OrderSlider({ value, min = 0, max = MAX_ORDER, onChange }: { value: number; min?: number; max?: number; onChange: (n: number) => void }) {
  const [width, setWidth] = useState(0)
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n)))

  const handlePosition = (x: number) => {
    if (!width) return
    const ratio = Math.min(1, Math.max(0, x / width))
    const next = min + ratio * (max - min)
    onChange(clamp(next))
  }

  const ratio = (value - min) / (max - min || 1)
  const knobLeft = width ? ratio * width : 0

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onResponderGrant={(e) => handlePosition(e.nativeEvent.locationX)}
      onResponderMove={(e) => handlePosition(e.nativeEvent.locationX)}
      style={{ paddingVertical: 10, position: 'relative' }}
    >
      <View style={{ height: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)' }} />
      <View
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
      <View
        style={{
          position: 'absolute',
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: ARCH.ACCENT,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.35)',
          left: Math.max(0, Math.min(knobLeft - 14, width ? width - 28 : 0)),
          top: '50%',
          transform: [{ translateY: -14 }]
        }}
      />
    </View>
  )
}

function RangeSlider({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (n: number) => void }) {
  const [width, setWidth] = useState(0)
  const clamp = (n: number) => Math.min(max, Math.max(min, n))

  const handlePosition = (x: number) => {
    if (!width) return
    const ratio = Math.min(1, Math.max(0, x / width))
    const next = min + ratio * (max - min)
    onChange(clamp(next))
  }

  const ratio = (value - min) / (max - min || 1)
  const knobLeft = width ? ratio * width : 0

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onResponderGrant={(e) => handlePosition(e.nativeEvent.locationX)}
      onResponderMove={(e) => handlePosition(e.nativeEvent.locationX)}
      style={{ paddingVertical: 10, position: 'relative' }}
    >
      <View style={{ height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)' }} />
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          width: width ? Math.max(10, knobLeft) : 0,
          height: 6,
          borderRadius: 999,
          backgroundColor: 'rgba(199,182,255,0.5)',
          transform: [{ translateY: -3 }]
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: ARCH.TEXT,
          borderWidth: 1,
          borderColor: 'rgba(199,182,255,0.7)',
          left: Math.max(0, Math.min(knobLeft - 11, width ? width - 22 : 0)),
          top: '50%',
          transform: [{ translateY: -11 }]
        }}
      />
    </View>
  )
}

export default function ExploreScreen() {
  const [order, setOrder] = useState(1)
  const [lowGraphics, setLowGraphics] = useState(true)
  const [vrRotation, setVrRotation] = useState({ beta: 0, gamma: 0 })
  const [materialMode, setMaterialMode] = useState<MaterialMode>('cosmic')
  const [accentColor, setAccentColor] = useState(COLOR_SWATCHES[0])
  const [zoom, setZoom] = useState(1)
  const [rotationSpeed, setRotationSpeed] = useState(0.35)
  const [autoRotate, setAutoRotate] = useState(true)

  const mobile = useIsMobile()
  const { width } = useWindowDimensions()
  const wide = width >= 900

  useEffect(() => {
    if (!mobile) return
    const handleOrientation = (e: DeviceOrientationEvent) => {
      setVrRotation({ beta: e.beta || 0, gamma: e.gamma || 0 })
    }
    window.addEventListener('deviceorientation', handleOrientation)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [mobile])

  const cubeCount = CUBE_COUNT_MAP[order] ?? '>59k'
  const cubeSizeDisplay = (1 / Math.pow(order || 1, 3)).toFixed(3)
  const performanceNotice = (lowGraphics && order > 3) || (!lowGraphics && order > 4)

  return (
    <SafeAreaView style={styles.root}>
      <ArchBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <RuriNav />
          <Text style={styles.kicker}>NEW PERSPECTIVE</Text>
          <Text style={styles.title}>Menger Sponge Explorer</Text>
          <View style={styles.headerLine} />
          <Text style={styles.subtitle}>Brutalist geometry mapped into Cubes Laborator lines, with precision controls.</Text>
        </View>

        <View style={[styles.hero, wide && styles.heroWide]}>
          <View style={styles.heroText}>
            <Text style={styles.heroLabel}>Ruri Lines / Studio</Text>
            <Text style={styles.heroTitle}>Abstract line study, rendered in 3D volume.</Text>
            <Text style={styles.heroBody}>Tune depth, zoom, and surface behavior without leaving the editorial flow.</Text>
            <View style={styles.metaRow}>
              <View>
                <Text style={styles.metaLabel}>Cubes</Text>
                <Text style={styles.metaValue}>{cubeCount}</Text>
              </View>
              <View>
                <Text style={styles.metaLabel}>Cube size</Text>
                <Text style={styles.metaValue}>{cubeSizeDisplay}</Text>
              </View>
              <View>
                <Text style={styles.metaLabel}>Mode</Text>
                <Text style={styles.metaValue}>{materialMode}</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroCanvas}>
            <Canvas camera={{ position: mobile ? [2.6, 2.6, 2.6] : [2, 2, 2], fov: mobile ? 60 : 50 }}>
              <color attach="background" args={[ARCH.BG]} />
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={1} />
              <Menger
                order={order}
                lowGraphics={lowGraphics}
                mobile={mobile}
                vrRotation={vrRotation}
                zoom={zoom}
                rotationSpeed={rotationSpeed}
                autoRotate={autoRotate}
                materialMode={materialMode}
                tint={accentColor}
              />
            </Canvas>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Control grid</Text>
          <Text style={styles.sectionMeta}>Iteration / Motion / Material</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Iteration level</Text>
          <OrderSlider value={order} min={0} max={MAX_ORDER} onChange={setOrder} />
          <View style={styles.panelRow}>
            <View style={styles.panelCol}>
              <Text style={styles.panelLabel}>Zoom</Text>
              <RangeSlider value={zoom} min={0.7} max={1.6} onChange={setZoom} />
            </View>
            <View style={styles.panelCol}>
              <Text style={styles.panelLabel}>Rotate speed</Text>
              <RangeSlider value={rotationSpeed} min={0} max={1} onChange={setRotationSpeed} />
            </View>
          </View>
          <Pressable
            onPress={() => setAutoRotate((s) => !s)}
            style={[styles.toggle, autoRotate && styles.toggleActive]}
          >
            <Text style={styles.toggleText}>{autoRotate ? 'Auto-rotate ON' : 'Auto-rotate OFF'}</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Shader themes</Text>
          <View style={styles.chipRow}>
            {MATERIALS.map((item) => {
              const active = item.key === materialMode
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setMaterialMode(item.key)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={styles.chipText}>{item.label}</Text>
                </Pressable>
              )
            })}
          </View>
          <Text style={styles.panelLabel}>Tint</Text>
          <View style={styles.swatches}>
            {COLOR_SWATCHES.map((color) => {
              const active = color === accentColor
              return (
                <Pressable
                  key={color}
                  onPress={() => setAccentColor(color)}
                  style={[styles.swatch, { backgroundColor: color }, active && styles.swatchActive]}
                />
              )
            })}
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Performance</Text>
          <View style={styles.panelRow}>
            <Pressable
              onPress={() => setLowGraphics((s) => !s)}
              style={[styles.toggle, lowGraphics && styles.toggleActive]}
            >
              <Text style={styles.toggleText}>{lowGraphics ? 'Performance Mode' : 'High Fidelity'}</Text>
            </Pressable>
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>{mobile ? 'Tilt your phone to rotate.' : 'Desktop uses auto-rotation.'}</Text>
            </View>
          </View>
          {performanceNotice ? (
            <Text style={styles.notice}>Render capped for performance; level approximated.</Text>
          ) : null}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>The archive</Text>
          <Text style={styles.sectionMeta}>Vol. 01 — 2024</Text>
        </View>

        <View style={styles.grid}>
          {MODULES.map((module) => (
            <View key={module.title} style={styles.gridCard}>
              <View style={styles.gridLine} />
              <Text style={styles.gridTitle}>{module.title}</Text>
              <Text style={styles.gridSubtitle}>{module.subtitle}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ARCH.BG
  },
  content: {
    padding: 20,
    paddingBottom: 40
  },
  header: {
    marginBottom: 20
  },
  kicker: {
    color: ARCH.MUTED,
    fontSize: 11,
    letterSpacing: 3
  },
  title: {
    color: ARCH.TEXT,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 8
  },
  headerLine: {
    marginTop: 8,
    width: 140,
    height: 2,
    backgroundColor: ARCH.ACCENT,
    opacity: 0.7
  },
  subtitle: {
    color: ARCH.SUB,
    marginTop: 8,
    lineHeight: 20
  },
  hero: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 18
  },
  heroWide: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'stretch'
  },
  heroText: {
    flex: 1
  },
  heroCanvas: {
    flex: 1,
    minHeight: 280,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT,
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  heroLabel: {
    color: ARCH.MUTED,
    letterSpacing: 2,
    fontSize: 11
  },
  heroTitle: {
    color: ARCH.TEXT,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8
  },
  heroBody: {
    color: ARCH.SUB,
    marginTop: 8
  },
  metaRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 16
  },
  metaLabel: {
    color: ARCH.MUTED,
    fontSize: 11,
    letterSpacing: 1.6
  },
  metaValue: {
    color: ARCH.TEXT,
    marginTop: 4,
    fontWeight: '700'
  },
  sectionHeader: {
    marginTop: 22,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  sectionTitle: {
    color: ARCH.TEXT,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  sectionMeta: {
    color: ARCH.MUTED,
    fontSize: 11,
    letterSpacing: 2
  },
  panel: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 16,
    marginBottom: 16
  },
  panelTitle: {
    color: ARCH.TEXT,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 10
  },
  panelLabel: {
    color: ARCH.SUB,
    marginTop: 8
  },
  panelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  panelCol: {
    flex: 1,
    minWidth: 180
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT,
    backgroundColor: 'rgba(255,255,255,0.02)'
  },
  chipActive: {
    borderColor: ARCH.ACCENT,
    backgroundColor: 'rgba(199,182,255,0.16)'
  },
  chipText: {
    color: ARCH.TEXT,
    fontWeight: '700'
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  swatchActive: {
    borderColor: '#fff',
    borderWidth: 2
  },
  toggle: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT,
    backgroundColor: 'rgba(255,255,255,0.02)',
    alignSelf: 'flex-start'
  },
  toggleActive: {
    borderColor: ARCH.ACCENT,
    backgroundColor: 'rgba(199,182,255,0.16)'
  },
  toggleText: {
    color: ARCH.TEXT,
    fontWeight: '700'
  },
  noteBox: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT,
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  noteText: {
    color: ARCH.MUTED,
    fontSize: 12
  },
  notice: {
    marginTop: 8,
    color: ARCH.MUTED,
    fontSize: 12
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  gridCard: {
    flex: 1,
    minWidth: 160,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT,
    backgroundColor: 'rgba(255,255,255,0.02)'
  },
  gridLine: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 10
  },
  gridTitle: {
    color: ARCH.TEXT,
    fontWeight: '700'
  },
  gridSubtitle: {
    color: ARCH.MUTED,
    marginTop: 6
  }
})
