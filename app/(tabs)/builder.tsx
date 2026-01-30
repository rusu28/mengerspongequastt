import { Canvas } from '@react-three/fiber'
import React, { useMemo, useState } from 'react'
import { StyleSheet, Text, View, Pressable } from 'react-native'
import * as THREE from 'three'
import { ScreenShell } from '@/components/screen-shell'
import { ARCH } from '@/components/arch-theme'

const RULES = ['Remove center', 'Remove center + faces'] as const
const SUBDIVISIONS = [2, 3, 4]

type Rule = (typeof RULES)[number]

function generateCustom(order: number, subdiv: number, rule: Rule, size = 1, pos: [number, number, number] = [0, 0, 0]) {
  if (order === 0) return [{ pos, size }]
  const out: { pos: [number, number, number]; size: number }[] = []
  const offset = size / subdiv
  const center = (subdiv - 1) / 2

  for (let x = 0; x < subdiv; x++) {
    for (let y = 0; y < subdiv; y++) {
      for (let z = 0; z < subdiv; z++) {
        const dx = x - center
        const dy = y - center
        const dz = z - center
        const isCenter = x === center && y === center && z === center
        const isFace =
          (x === center && y === center) ||
          (x === center && z === center) ||
          (y === center && z === center)

        if (rule === 'Remove center + faces') {
          if (isCenter || isFace) continue
        } else {
          if (isCenter) continue
        }

        const newPos: [number, number, number] = [
          pos[0] + (x - center) * offset,
          pos[1] + (y - center) * offset,
          pos[2] + (z - center) * offset
        ]
        out.push(...generateCustom(order - 1, subdiv, rule, size / subdiv, newPos))
      }
    }
  }
  return out
}

function InstancedPreview({ order, subdiv, rule }: { order: number; subdiv: number; rule: Rule }) {
  const positions = useMemo(() => generateCustom(order, subdiv, rule), [order, subdiv, rule])
  const color = useMemo(() => new THREE.Color('#f0abfc'), [])

  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} position={p.pos} scale={[p.size, p.size, p.size]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

export default function Builder() {
  const [rule, setRule] = useState<Rule>('Remove center + faces')
  const [subdiv, setSubdiv] = useState(3)
  const [iterations, setIterations] = useState(2)

  return (
    <ScreenShell
      title="Build your own fractal"
      subtitle="Configure rules, subdivision, and iterations, then generate a live 3D cube."
    >
      <View style={styles.preview}>
        <Canvas camera={{ position: [1.8, 1.6, 2.4], fov: 45 }}>
          <color attach="background" args={[ARCH.BG]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[2, 3, 2]} intensity={1.1} />
          <InstancedPreview order={iterations} subdiv={subdiv} rule={rule} />
        </Canvas>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rule set</Text>
        <View style={styles.row}>
          {RULES.map((item) => (
            <Pressable key={item} onPress={() => setRule(item)} style={[styles.chip, rule === item && styles.chipActive]}>
              <Text style={styles.chipText}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subdivision</Text>
        <View style={styles.row}>
          {SUBDIVISIONS.map((n) => (
            <Pressable key={n} onPress={() => setSubdiv(n)} style={[styles.square, subdiv === n && styles.squareActive]}>
              <Text style={styles.squareText}>{n}x</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Iterations</Text>
        <View style={styles.row}>
          {[1, 2, 3].map((n) => (
            <Pressable key={n} onPress={() => setIterations(n)} style={[styles.square, iterations === n && styles.squareActive]}>
              <Text style={styles.squareText}>{n}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.previewInfo}>
        <Text style={styles.previewTitle}>Preview settings</Text>
        <Text style={styles.previewText}>Rule: {rule}</Text>
        <Text style={styles.previewText}>Subdivision: {subdiv}x{subdiv}</Text>
        <Text style={styles.previewText}>Iterations: {iterations}</Text>
      </View>
    </ScreenShell>
  )
}

const styles = StyleSheet.create({
  preview: {
    height: 240,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT
  },
  section: {
    marginBottom: 16,
    marginTop: 12
  },
  sectionTitle: {
    color: ARCH.TEXT,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 8
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT
  },
  chipActive: {
    backgroundColor: 'rgba(216,180,254,0.25)',
    borderColor: 'rgba(216,180,254,0.7)'
  },
  chipText: {
    color: ARCH.TEXT,
    fontWeight: '700'
  },
  square: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT,
    alignItems: 'center',
    justifyContent: 'center'
  },
  squareActive: {
    backgroundColor: ARCH.ACCENT
  },
  squareText: {
    color: '#120A16',
    fontWeight: '800'
  },
  previewInfo: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT,
    backgroundColor: 'rgba(255,255,255,0.04)'
  },
  previewTitle: {
    color: ARCH.TEXT,
    fontWeight: '800',
    marginBottom: 6
  },
  previewText: {
    color: ARCH.SUB,
    marginBottom: 4
  }
})
