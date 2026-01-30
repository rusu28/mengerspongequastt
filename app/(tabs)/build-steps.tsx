import { Canvas, useFrame } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, Text, View, Pressable } from 'react-native'
import * as THREE from 'three'
import { ScreenShell } from '@/components/screen-shell'
import { ARCH } from '@/components/arch-theme'

const STEPS = [
  { level: 0, title: 'Level 0', desc: 'A single solid cube.' },
  { level: 1, title: 'Level 1', desc: 'Remove center + face centers.' },
  { level: 2, title: 'Level 2', desc: 'Recursive cut on every remaining cube.' }
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

function Sponge({ level }: { level: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const progress = useRef(0)
  const positions = useMemo(() => generateMengerPositions(level), [level])

  useEffect(() => {
    progress.current = 0
  }, [level])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    progress.current = Math.min(1, progress.current + delta * 1.4)
    const scaleFactor = THREE.MathUtils.lerp(0.1, 1, progress.current)
    const dummy = new THREE.Object3D()
    for (let i = 0; i < positions.length; i++) {
      const p = positions[i].pos
      const s = positions[i].size * scaleFactor
      dummy.position.set(p[0], p[1], p[2])
      dummy.scale.set(s, s, s)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, positions.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#9ca3ff" roughness={0.35} metalness={0.15} />
    </instancedMesh>
  )
}

export default function BuildSteps() {
  const [step, setStep] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  useEffect(() => {
    if (!autoPlay) return
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 2200)
    return () => clearInterval(id)
  }, [autoPlay])

  const active = STEPS[step]

  return (
    <ScreenShell
      title="Build Steps"
      subtitle="Watch the sponge form step by step. Optimized for smooth FPS."
    >
      <View style={styles.preview}>
        <Text style={styles.previewTitle}>{active.title}</Text>
        <Text style={styles.previewText}>{active.desc}</Text>
        <View style={styles.canvasWrap}>
          <Canvas camera={{ position: [1.6, 1.6, 2.2], fov: 45 }}>
            <color attach="background" args={[ARCH.BG]} />
            <ambientLight intensity={0.7} />
            <directionalLight position={[3, 4, 2]} intensity={1.0} />
            <Sponge level={step} />
          </Canvas>
        </View>
        <View style={styles.stepBar}>
          {STEPS.map((s) => (
            <View key={s.level} style={[styles.stepDot, s.level <= step && styles.stepDotActive]} />
          ))}
        </View>
      </View>

      <View style={styles.controls}>
        {STEPS.map((s) => (
          <Pressable key={s.level} onPress={() => setStep(s.level)} style={[styles.stepBtn, step === s.level && styles.stepBtnActive]}>
            <Text style={[styles.stepBtnText, step === s.level && styles.stepBtnTextActive]}>{s.title}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => setAutoPlay((s) => !s)} style={styles.autoBtn}>
        <Text style={styles.autoBtnText}>{autoPlay ? 'Autoplay ON' : 'Autoplay OFF'}</Text>
      </Pressable>
    </ScreenShell>
  )
}

const styles = StyleSheet.create({
  preview: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT,
    backgroundColor: 'rgba(255,255,255,0.04)'
  },
  previewTitle: {
    color: ARCH.TEXT,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  previewText: {
    color: ARCH.SUB,
    marginTop: 8
  },
  canvasWrap: {
    height: 220,
    marginTop: 12,
    borderRadius: 14,
    overflow: 'hidden'
  },
  stepBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14
  },
  stepDot: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  stepDotActive: {
    backgroundColor: ARCH.ACCENT
  },
  controls: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  stepBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT
  },
  stepBtnActive: {
    backgroundColor: 'rgba(216,180,254,0.25)',
    borderColor: 'rgba(216,180,254,0.7)'
  },
  stepBtnText: {
    color: ARCH.TEXT,
    fontWeight: '700'
  },
  stepBtnTextActive: {
    color: ARCH.TEXT
  },
  autoBtn: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: ARCH.ACCENT
  },
  autoBtnText: {
    color: '#120A16',
    fontWeight: '800'
  }
})
