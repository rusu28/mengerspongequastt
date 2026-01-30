import { Canvas, useFrame } from '@react-three/fiber'
import React, { useMemo, useRef, useState } from 'react'
import { StyleSheet, Text, View, Pressable } from 'react-native'
import * as THREE from 'three'
import { ScreenShell } from '@/components/screen-shell'
import { ARCH } from '@/components/arch-theme'

const MODES = ['Ambient', 'Pulse', 'Bass Boost', 'Cosmic']

function ReactiveGrid({ bass, treble }: { bass: number; treble: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const cubes = useMemo(() => {
    const out: { pos: [number, number, number]; phase: number }[] = []
    const size = 3
    for (let x = -size; x <= size; x++) {
      for (let z = -size; z <= size; z++) {
        out.push({ pos: [x * 0.35, 0, z * 0.35], phase: Math.random() * Math.PI * 2 })
      }
    }
    return out
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (!groupRef.current) return
    groupRef.current.children.forEach((child, index) => {
      const mesh = child as THREE.Mesh
      const phase = cubes[index].phase
      const bassWave = Math.sin(t * (0.8 + bass * 0.3) + phase) * 0.2
      const trebleWave = Math.sin(t * (2.4 + treble * 0.5) + phase * 1.4) * 0.08
      const scale = 0.5 + bassWave + trebleWave
      mesh.scale.set(1, Math.max(0.2, scale), 1)
    })
  })

  return (
    <group ref={groupRef}>
      {cubes.map((c, i) => (
        <mesh key={i} position={c.pos}>
          <boxGeometry args={[0.25, 0.25, 0.25]} />
          <meshStandardMaterial color="#7dd3fc" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export default function AudioReactive() {
  const [mode, setMode] = useState(MODES[0])
  const [bass, setBass] = useState(2)
  const [treble, setTreble] = useState(3)

  return (
    <ScreenShell
      title="Audio Reactive"
      subtitle="Each cube pulses with a simulated audio signal (bass + treble)."
    >
      <View style={styles.visual}>
        <Canvas camera={{ position: [1.2, 1.4, 2.4], fov: 50 }}>
          <color attach="background" args={[ARCH.BG]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[2, 3, 2]} intensity={1.1} />
          <ReactiveGrid bass={bass} treble={treble} />
        </Canvas>
        <Text style={styles.visualTitle}>{mode} Mode</Text>
        <Text style={styles.visualText}>Bass: {bass} | Treble: {treble}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mode</Text>
        <View style={styles.row}>
          {MODES.map((item) => (
            <Pressable key={item} onPress={() => setMode(item)} style={[styles.chip, mode === item && styles.chipActive]}>
              <Text style={[styles.chipText, mode === item && styles.chipTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio mix</Text>
        <View style={styles.row}>
          {[1, 2, 3, 4, 5].map((level) => (
            <Pressable key={`bass-${level}`} onPress={() => setBass(level)} style={[styles.level, bass === level && styles.levelActive]}>
              <Text style={styles.levelText}>{level}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.levelLabel}>Bass impact</Text>
        <View style={styles.row}>
          {[1, 2, 3, 4, 5].map((level) => (
            <Pressable key={`treble-${level}`} onPress={() => setTreble(level)} style={[styles.level, treble === level && styles.levelActive]}>
              <Text style={styles.levelText}>{level}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.levelLabel}>Treble shimmer</Text>
      </View>
    </ScreenShell>
  )
}

const styles = StyleSheet.create({
  visual: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT,
    alignItems: 'center'
  },
  visualTitle: {
    color: ARCH.TEXT,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginTop: 10
  },
  visualText: {
    color: ARCH.SUB,
    marginTop: 6
  },
  section: {
    marginTop: 18
  },
  sectionTitle: {
    color: ARCH.TEXT,
    fontWeight: '800',
    marginBottom: 10
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT
  },
  chipActive: {
    backgroundColor: 'rgba(147,197,253,0.25)',
    borderColor: 'rgba(147,197,253,0.7)'
  },
  chipText: {
    color: ARCH.TEXT,
    fontWeight: '700'
  },
  chipTextActive: {
    color: ARCH.TEXT
  },
  level: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: ARCH.PANEL,
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT,
    alignItems: 'center',
    justifyContent: 'center'
  },
  levelActive: {
    backgroundColor: ARCH.ACCENT,
    borderColor: 'rgba(255,255,255,0.35)'
  },
  levelText: {
    color: '#120A16',
    fontWeight: '800'
  },
  levelLabel: {
    color: ARCH.MUTED,
    marginTop: 6
  }
})
