import React, { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber/native'
import * as THREE from 'three'
import { ArchBackground, ARCH } from '@/components/arch-theme'
import { RuriNav } from '@/components/ruri-nav'
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from 'react-native'

const BG = ARCH.BG
const BORDER = ARCH.BORDER
const BORDER_SOFT = ARCH.BORDER_SOFT
const TEXT = ARCH.TEXT
const SUB = ARCH.SUB
const MUTED = ARCH.MUTED

const MENGER_FACTS = [
  { label: 'Rule', value: 'Split 3x3x3, remove 7' },
  { label: 'Kept cubes', value: '20 / 27' },
  { label: 'Dimension', value: 'log(20) / log(3)' },
  { label: 'Volume', value: '-> 0' },
  { label: 'Surface', value: '-> infinity' }
]

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
          newPositions.push(...generateMengerPositions(order - 1, size / 3, [newX, newY, newZ]))
        }
      }
    }
  }
  return newPositions
}

function MengerSponge({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const positions = useMemo(() => generateMengerPositions(2, 1), [])

  useEffect(() => {
    if (!meshRef.current) return
    const dummy = new THREE.Object3D()
    positions.forEach((item, i) => {
      dummy.position.set(item.pos[0], item.pos[1], item.pos[2])
      dummy.scale.setScalar(item.size)
      dummy.updateMatrix()
      meshRef.current?.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [positions])

  useFrame((state, delta) => {
    if (!group.current) return
    const y = scrollRef.current
    group.current.rotation.y += delta * 0.25
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.2 - y * 0.0003
    group.current.position.y = -y * 0.0006
  })

  return (
    <group ref={group}>
      <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, positions.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#f5f5f5" metalness={0.2} roughness={0.4} />
      </instancedMesh>
    </group>
  )
}

function DotGrid({ columns, rows }: { columns: number; rows: number }) {
  const dots = Array.from({ length: columns * rows })
  return (
    <View pointerEvents="none" style={styles.dotGrid}>
      {dots.map((_, index) => (
        <View key={`dot-${index}`} style={styles.dot} />
      ))}
    </View>
  )
}

function ArticleSection({
  title,
  body,
  note,
  code
}: {
  title: string
  body: string
  note?: string
  code?: string
}) {
  return (
    <View style={styles.articleSection}>
      <Text style={styles.articleTitle}>{title}</Text>
      <Text style={styles.articleBody}>{body}</Text>
      {note ? <Text style={styles.articleNote}>{note}</Text> : null}
      {code ? (
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>{code}</Text>
        </View>
      ) : null}
    </View>
  )
}

export default function HomeScreen() {
  const { width } = useWindowDimensions()
  const columns = Math.max(12, Math.floor(width / 54))
  const isNarrow = width < 820
  const contentPadding = width < 720 ? 14 : 18
  const contentBottom = width < 720 ? 70 : 80
  const scrollY = useRef(new Animated.Value(0)).current
  const scrollRef = useRef(0)

  const heroShift = scrollY.interpolate({
    inputRange: [0, 500],
    outputRange: [0, -90],
    extrapolate: 'clamp'
  })
  const sectionShift = scrollY.interpolate({
    inputRange: [200, 900],
    outputRange: [40, -40],
    extrapolate: 'clamp'
  })
  const gridShift = scrollY.interpolate({
    inputRange: [0, 1200],
    outputRange: [0, -80],
    extrapolate: 'clamp'
  })
  const hazeShift = scrollY.interpolate({
    inputRange: [0, 1200],
    outputRange: [0, -140],
    extrapolate: 'clamp'
  })
  const canvasShift = scrollY.interpolate({
    inputRange: [0, 600],
    outputRange: [0, -120],
    extrapolate: 'clamp'
  })
  const textShift = scrollY.interpolate({
    inputRange: [0, 600],
    outputRange: [0, -40],
    extrapolate: 'clamp'
  })

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ArchBackground />
      <Animated.View style={[styles.gridLayer, { transform: [{ translateY: gridShift }] }]}>
        <DotGrid columns={columns} rows={12} />
      </Animated.View>
      <Animated.View style={[styles.hazeLayer, { transform: [{ translateY: hazeShift }] }]} />
      <Animated.View style={[styles.hazeLayerSecondary, { transform: [{ translateY: hazeShift }] }]} />

      <Animated.ScrollView
        contentContainerStyle={[styles.content, { padding: contentPadding, paddingBottom: contentBottom }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
          listener: (event) => {
            scrollRef.current = event.nativeEvent.contentOffset.y
          }
        })}
      >
        <RuriNav />

        <Animated.View style={[styles.hero, isNarrow && styles.heroStack, { transform: [{ translateY: heroShift }] }]}>
          <Animated.View style={[styles.heroText, { transform: [{ translateY: textShift }] }]}>
            <Text style={styles.heroTitle}>Menger Sponge</Text>
            <Text style={styles.heroSubtitle}>Parallax editorial with a live 3D sponge.</Text>
            <Text style={styles.heroNote}>
              Scroll to reveal layers. The sponge shifts in depth while the content unfolds like a long-form article.
            </Text>
          </Animated.View>

          <Animated.View style={[styles.heroCanvas, isNarrow && styles.heroCanvasStack, { transform: [{ translateY: canvasShift }] }]}>
            <Canvas camera={{ position: [2.5, 2.2, 2.5], fov: 45 }}>
              <color attach="background" args={[BG]} />
              <ambientLight intensity={0.55} />
              <directionalLight position={[3, 4, 2]} intensity={1.2} />
              <MengerSponge scrollRef={scrollRef} />
            </Canvas>
          </Animated.View>
        </Animated.View>

        <Animated.View style={[styles.section, { transform: [{ translateY: sectionShift }] }]}>
          <ArticleSection
            title="What is a Menger sponge?"
            body="A 3D fractal built by subdividing a cube into 27 smaller cubes, removing the center cube and the six cubes centered on each face, then repeating the rule on every remaining cube."
            note="This recursive subtraction creates a structure with infinite surface detail and vanishing volume."
          />
          <View style={styles.factRow}>
            {MENGER_FACTS.map((fact) => (
              <View key={fact.label} style={styles.factPill}>
                <Text style={styles.factValue}>{fact.value}</Text>
                <Text style={styles.factLabel}>{fact.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.sectionWide, { transform: [{ translateY: sectionShift }] }]}>
          <ArticleSection
            title="How the rule scales"
            body="Each iteration scales the cube by 1/3 and preserves 20 sub-cubes. The count grows as 20^n, while the smallest cubes shrink as (1/3)^n."
            code={`// Menger count per iteration\ncubes(n) = 20^n\nsize(n) = (1/3)^n`}
          />
          <ArticleSection
            title="Why the surface explodes"
            body="Surface area increases with each iteration, while the total volume shrinks. The sponge becomes a paradoxical solid: infinite surface, zero volume."
          />
        </Animated.View>

        <Animated.View style={[styles.sectionWide, { transform: [{ translateY: sectionShift }] }]}>
          <Text style={styles.sectionTitle}>About team</Text>
          <Text style={styles.sectionBody}>
            Built by Strajan Andrei and Rus Vlad-Andrei with 💘 and precision.
          </Text>
         
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  content: { padding: 18, paddingBottom: 80 },

  dotGrid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 18,
    paddingHorizontal: 18,
    opacity: 0.28
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 2,
    marginRight: 18,
    marginBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.35)'
  },
  gridLayer: { ...StyleSheet.absoluteFillObject },
  hazeLayer: {
    position: 'absolute',
    top: -120,
    left: -40,
    right: -40,
    height: 260,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 999
  },
  hazeLayerSecondary: {
    position: 'absolute',
    top: 240,
    left: -120,
    right: -120,
    height: 380,
    backgroundColor: 'rgba(255,255,255,0.025)',
    borderRadius: 999
  },

  hero: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    borderRadius: 24,
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    marginBottom: 24
  },
  heroStack: {
    flexDirection: 'column'
  },
  heroText: { flex: 1 },
  heroTitle: { color: TEXT, fontSize: 36, fontWeight: '900' },
  heroSubtitle: { color: SUB, marginTop: 10, fontSize: 15 },
  heroNote: { color: MUTED, marginTop: 10, lineHeight: 18 },
  heroCanvas: {
    width: 320,
    height: 320,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: BORDER
  },
  heroCanvasStack: {
    width: '100%',
    height: 300
  },

  section: {
    borderRadius: 22,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    marginBottom: 24
  },
  sectionWide: {
    borderRadius: 22,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    marginBottom: 40
  },
  sectionTitle: { color: TEXT, fontSize: 22, fontWeight: '800' },
  sectionBody: { color: MUTED, marginTop: 10, lineHeight: 18 },

  articleSection: { marginBottom: 18 },
  articleTitle: { color: TEXT, fontSize: 20, fontWeight: '800' },
  articleBody: { color: SUB, marginTop: 8, lineHeight: 18 },
  articleNote: { color: MUTED, marginTop: 8, fontSize: 12 },
  codeBlock: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: BORDER
  },
  codeText: { color: '#cfcfcf', fontSize: 12, fontFamily: 'Courier' },

  factRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  factPill: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: BORDER,
    minWidth: 140
  },
  factValue: { color: TEXT, fontWeight: '800' },
  factLabel: { color: MUTED, marginTop: 4, fontSize: 11 },

  teamRow: { flexDirection: 'row', gap: 12, marginTop: 14, flexWrap: 'wrap' },
  teamCard: {
    flexGrow: 1,
    minWidth: 200,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: BORDER
  },
  teamName: { color: TEXT, fontWeight: '800' },
  teamRole: { color: SUB, marginTop: 6, fontSize: 12 }
})
