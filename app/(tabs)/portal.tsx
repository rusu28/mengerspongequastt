import { Canvas } from '@react-three/fiber'
import React, { useMemo, useState } from 'react'
import { StyleSheet, Text, View, Pressable } from 'react-native'
import * as THREE from 'three'
import { ScreenShell } from '@/components/screen-shell'
import { ARCH } from '@/components/arch-theme'

type PortalKey = 'sponge' | 'sierpinski' | 'mandelbrot' | 'julia'

const PORTALS: { key: PortalKey; title: string; desc: string }[] = [
  { key: 'sponge', title: 'Sponge Gate', desc: 'Jump into a deeper Menger layer.' },
  { key: 'sierpinski', title: 'Sierpinski Rift', desc: 'Teleport into tetrahedral worlds.' },
  { key: 'mandelbrot', title: 'Mandelbrot Mirror', desc: 'Dive into 2D infinity with zoom recursion.' },
  { key: 'julia', title: 'Julia Bridge', desc: 'Orbit-based tunnels that twist space.' }
]

function PortalPreview({ type }: { type: PortalKey }) {
  const color = useMemo(() => {
    switch (type) {
      case 'sierpinski':
        return '#93c5fd'
      case 'mandelbrot':
        return '#f0abfc'
      case 'julia':
        return '#facc15'
      default:
        return '#8b5cf6'
    }
  }, [type])

  return (
    <group>
      {type === 'sierpinski' ? (
        <mesh>
          <tetrahedronGeometry args={[0.9]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
      ) : type === 'mandelbrot' ? (
        <mesh>
          <torusKnotGeometry args={[0.5, 0.18, 100, 16]} />
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.2} />
        </mesh>
      ) : type === 'julia' ? (
        <mesh>
          <icosahedronGeometry args={[0.7, 0]} />
          <meshStandardMaterial color={color} roughness={0.2} metalness={0.4} />
        </mesh>
      ) : (
        <mesh>
          <boxGeometry args={[0.9, 0.9, 0.9]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
        </mesh>
      )}
    </group>
  )
}

export default function Portal() {
  const [active, setActive] = useState<PortalKey>('sponge')

  return (
    <ScreenShell
      title="Portal Between Fractals"
      subtitle="Switch portals and jump to another fractal world in real time."
    >
      <View style={styles.preview}>
        <Canvas camera={{ position: [0, 0.8, 2.2], fov: 45 }}>
          <color attach="background" args={[ARCH.BG]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[2, 3, 2]} intensity={1.1} />
          <PortalPreview type={active} />
        </Canvas>
        <Text style={styles.previewTitle}>Active portal: {active}</Text>
      </View>

      <View style={styles.list}>
        {PORTALS.map((portal) => (
          <View key={portal.key} style={styles.card}>
            <Text style={styles.cardTitle}>{portal.title}</Text>
            <Text style={styles.cardText}>{portal.desc}</Text>
            <Pressable onPress={() => setActive(portal.key)} style={styles.cardBtn}>
              <Text style={styles.cardBtnText}>Enter portal</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </ScreenShell>
  )
}

const styles = StyleSheet.create({
  preview: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT
  },
  previewTitle: {
    position: 'absolute',
    left: 16,
    bottom: 12,
    color: ARCH.TEXT,
    fontWeight: '800'
  },
  list: {
    marginTop: 18,
    gap: 12
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT
  },
  cardTitle: {
    color: ARCH.TEXT,
    fontWeight: '800'
  },
  cardText: {
    color: ARCH.SUB,
    marginTop: 6
  },
  cardBtn: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: ARCH.ACCENT,
    alignItems: 'center'
  },
  cardBtnText: {
    color: '#120A16',
    fontWeight: '800'
  }
})
