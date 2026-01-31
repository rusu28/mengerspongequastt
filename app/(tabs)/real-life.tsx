import React from 'react'
import { StyleSheet, Text, View, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { ScreenShell } from '@/components/screen-shell'
import { ARCH } from '@/components/arch-theme'

const EXAMPLES = [
  { key: 'romanesco', title: 'Romanesco broccoli', desc: 'Spirals repeating in perfect self-similarity.' },
  { key: 'snowflakes', title: 'Snowflakes', desc: 'Branching ice crystals form fractal arms.' },
  { key: 'coastlines', title: 'Coastlines', desc: 'Infinite detail as you zoom into shorelines.' },
  { key: 'clouds', title: 'Clouds', desc: 'Cascading turbulence produces fractal textures.' },
  { key: 'trees', title: 'Trees', desc: 'Branches split into smaller branches recursively.' },
  { key: 'lightning', title: 'Lightning', desc: 'Electric paths branch like fractals.' }
]

export default function RealLife() {
  const router = useRouter()

  return (
    <ScreenShell
      title="Fractals in real life"
      subtitle="Tap an example to open a focused explanation."
    >
      <View style={styles.list}>
        {EXAMPLES.map((item) => (
          <Pressable key={item.key} onPress={() => router.push(`/real-life/${item.key}`)} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardText}>{item.desc}</Text>
            <Text style={styles.cardLink}>Explain</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.callout}>
        <Text style={styles.calloutTitle}>💘</Text>
        <Text style={styles.calloutText}>Love coding(R.V.A)</Text>
      </View>
    </ScreenShell>
  )
}

const styles = StyleSheet.create({
  list: {
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
  cardLink: {
    marginTop: 10,
    color: ARCH.ACCENT,
    fontWeight: '700'
  },
  callout: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(240,171,252,0.6)',
    backgroundColor: 'rgba(240,171,252,0.12)'
  },
  calloutTitle: {
    color: ARCH.TEXT,
    fontWeight: '800'
  },
  calloutText: {
    color: ARCH.SUB,
    marginTop: 6
  }
})
