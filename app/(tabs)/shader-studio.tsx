import { Canvas, useFrame } from '@react-three/fiber'
import React, { useMemo, useRef, useState } from 'react'
import { StyleSheet, Text, View, Pressable, useWindowDimensions } from 'react-native'
import * as THREE from 'three'
import { LinearGradient } from 'expo-linear-gradient'
import { ScreenShell } from '@/components/screen-shell'
import { ARCH } from '@/components/arch-theme'

type ThemeKey = 'neon' | 'glass' | 'wireframe' | 'cartoon' | 'cosmic'

const THEMES: { key: ThemeKey; title: string; desc: string; colors: string[] }[] = [
  { key: 'neon', title: 'Neon Flux', desc: 'Electric glow with emissive edges', colors: ['#22d3ee', '#a855f7', '#0f172a'] },
  { key: 'glass', title: 'Glass Prism', desc: 'Transparent refractions + soft light', colors: ['#e0f2fe', '#93c5fd', '#0f172a'] },
  { key: 'wireframe', title: 'Wireframe', desc: 'Lines, structure, minimal surface', colors: ['#38bdf8', '#0ea5e9', '#0b1220'] },
  { key: 'cartoon', title: 'Cartoon', desc: 'Flat shading and bold contrasts', colors: ['#fde68a', '#f97316', '#111827'] },
  { key: 'cosmic', title: 'Cosmic', desc: 'Deep-space gradients + stardust', colors: ['#1e1b4b', '#7c3aed', '#0f172a'] }
]

function getMaterialProps(mode: ThemeKey, tint: string) {
  switch (mode) {
    case 'neon':
      return {
        color: tint,
        emissive: new THREE.Color(tint),
        emissiveIntensity: 0.7,
        roughness: 0.15,
        metalness: 0.3
      }
    case 'glass':
      return {
        color: tint,
        transparent: true,
        opacity: 0.35,
        roughness: 0.05,
        metalness: 0.05
      }
    case 'wireframe':
      return {
        color: tint,
        wireframe: true,
        roughness: 0.8,
        metalness: 0
      }
    case 'cartoon':
      return {
        color: tint,
        roughness: 0.6,
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

function PhysicsCube({ mode, tint, gravity, bounce }: { mode: ThemeKey; tint: string; gravity: number; bounce: number }) {
  const cubeRef = useRef<THREE.Mesh>(null)
  const velocity = useRef(0)
  const yPos = useRef(0.7)

  useFrame((_, delta) => {
    if (!cubeRef.current) return
    velocity.current -= gravity * delta
    yPos.current += velocity.current * delta

    if (yPos.current < 0.5) {
      yPos.current = 0.5
      velocity.current = Math.abs(velocity.current) * bounce
    }

    cubeRef.current.position.y = yPos.current
    cubeRef.current.rotation.x += delta * 0.6
    cubeRef.current.rotation.y += delta * 0.8
  })

  const materialProps = useMemo(() => getMaterialProps(mode, tint), [mode, tint])

  return (
    <mesh ref={cubeRef} position={[0, 0.7, 0]} castShadow>
      <boxGeometry args={[0.7, 0.7, 0.7]} />
      <meshStandardMaterial {...materialProps} />
    </mesh>
  )
}

export default function ShaderStudio() {
  const [active, setActive] = useState<ThemeKey>('neon')
  const [gravity, setGravity] = useState(3.4)
  const [bounce, setBounce] = useState(0.65)
  const [tint, setTint] = useState('#93c5fd')
  const { width } = useWindowDimensions()
  const columns = width >= 900 ? 3 : width >= 640 ? 2 : 1

  const activeTheme = useMemo(() => THEMES.find((t) => t.key === active) || THEMES[0], [active])

  return (
    <ScreenShell
      title="Shader Studio"
      subtitle="Select a shader preset, tweak physics, and watch the cube respond in real time."
    >
      <View style={styles.previewWrap}>
        <LinearGradient colors={activeTheme.colors} style={styles.previewHero}>
          <Text style={styles.previewTitle}>{activeTheme.title}</Text>
          <Text style={styles.previewSub}>{activeTheme.desc}</Text>
        </LinearGradient>
        <View style={styles.canvasWrap}>
          <Canvas shadows camera={{ position: [1.6, 1.6, 2.2], fov: 45 }}>
            <color attach="background" args={[ARCH.BG]} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 3, 2]} intensity={1.1} castShadow />
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[6, 6]} />
              <meshStandardMaterial color="#10131d" roughness={0.95} metalness={0.05} />
            </mesh>
            <PhysicsCube mode={active} tint={tint} gravity={gravity} bounce={bounce} />
          </Canvas>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose a preset</Text>
        <View style={styles.grid}>
          {THEMES.map((theme) => {
            const selected = theme.key === active
            const cardWidth = columns === 1 ? '100%' : columns === 2 ? '48%' : '31%'
            return (
              <Pressable key={theme.key} onPress={() => setActive(theme.key)} style={[styles.card, { width: cardWidth }, selected && styles.cardActive]}>
                <LinearGradient colors={theme.colors} style={styles.cardSwatch} />
                <Text style={styles.cardTitle}>{theme.title}</Text>
                <Text style={styles.cardText}>{theme.desc}</Text>
                <Text style={[styles.cardBadge, selected && styles.cardBadgeActive]}>{selected ? 'Active' : 'Preview'}</Text>
              </Pressable>
            )
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Physics controls</Text>
        <View style={styles.controls}>
          {[
            { label: 'Gravity', value: gravity, setter: setGravity, options: [1.4, 2.4, 3.4, 4.8] },
            { label: 'Bounce', value: bounce, setter: setBounce, options: [0.25, 0.45, 0.65, 0.85] }
          ].map((row) => (
            <View key={row.label} style={styles.controlRow}>
              <Text style={styles.controlLabel}>{row.label}</Text>
              <View style={styles.controlButtons}>
                {row.options.map((opt) => (
                  <Pressable
                    key={`${row.label}-${opt}`}
                    onPress={() => row.setter(opt)}
                    style={[styles.controlChip, row.value === opt && styles.controlChipActive]}
                  >
                    <Text style={styles.controlChipText}>{opt.toFixed(2)}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tint</Text>
        <View style={styles.swatches}>
          {['#93c5fd', '#f0abfc', '#fca5a5', '#fde68a', '#7dd3fc', '#34d399'].map((color) => (
            <Pressable
              key={color}
              onPress={() => setTint(color)}
              style={[styles.swatch, { backgroundColor: color }, tint === color && styles.swatchActive]}
            />
          ))}
        </View>
      </View>
    </ScreenShell>
  )
}

const styles = StyleSheet.create({
  previewWrap: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT
  },
  previewHero: {
    padding: 18
  },
  previewTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.6
  },
  previewSub: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6
  },
  canvasWrap: {
    height: 260,
    backgroundColor: ARCH.BG
  },
  section: {
    marginTop: 18
  },
  sectionTitle: {
    color: ARCH.TEXT,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
    letterSpacing: 0.6
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  card: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT
  },
  cardActive: {
    borderColor: 'rgba(147,197,253,0.9)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  cardSwatch: {
    height: 70,
    borderRadius: 12,
    marginBottom: 10
  },
  cardTitle: {
    color: ARCH.TEXT,
    fontWeight: '800',
    fontSize: 14
  },
  cardText: {
    color: ARCH.SUB,
    marginTop: 6,
    fontSize: 12
  },
  cardBadge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: ARCH.SUB,
    fontSize: 11,
    fontWeight: '700'
  },
  cardBadgeActive: {
    backgroundColor: 'rgba(147,197,253,0.25)',
    color: ARCH.TEXT
  },
  controls: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT,
    padding: 14,
    gap: 10
  },
  controlRow: {
    gap: 8
  },
  controlLabel: {
    color: ARCH.SUB
  },
  controlButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  controlChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT,
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  controlChipActive: {
    borderColor: 'rgba(147,197,253,0.75)',
    backgroundColor: 'rgba(147,197,253,0.2)'
  },
  controlChipText: {
    color: ARCH.TEXT,
    fontWeight: '700'
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  swatchActive: {
    borderColor: '#fff',
    borderWidth: 2
  }
})
