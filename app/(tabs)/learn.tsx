import React from 'react'
import { StyleSheet, Text, View, Pressable, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { ScreenShell } from '@/components/screen-shell'
import { ARCH } from '@/components/arch-theme'

const SECTIONS = [
  {
    key: 'intro',
    title: 'What is a fractal?',
    body: 'A fractal is a shape that shows detail at every scale. Tap to read the full essay.'
  },
  {
    key: 'menger',
    title: 'How the Menger sponge is built',
    body: 'Start with a cube, split it into 27 cubes, remove the center and face centers.'
  },
  {
    key: 'dimension',
    title: 'Why the surface explodes',
    body: 'Each iteration removes volume but increases surface area dramatically.'
  },
  {
    key: 'nature',
    title: 'Applications in nature',
    body: 'Coastlines, lungs, lightning, clouds, and branching trees use fractal geometry.'
  }
]

export default function Learn() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const columns = width >= 900 ? 2 : 1

  return (
    <ScreenShell
      title="Learn fractals"
      subtitle="Tap any topic to open a deeper essay with a live typewriter effect."
    >
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Fractals are infinite stories told by math.</Text>
        <Text style={styles.heroBody}>Explore the theory, then jump into the explorer to see it in motion.</Text>
      </View>

      <View style={styles.grid}>
        {SECTIONS.map((section) => {
          const cardWidth = columns === 1 ? '100%' : '48%'
          return (
            <Pressable key={section.key} onPress={() => router.push(`/learn/${section.key}`)} style={[styles.card, { width: cardWidth }]}>
              <Text style={styles.cardTitle}>{section.title}</Text>
              <Text style={styles.cardBody}>{section.body}</Text>
              <Text style={styles.cardLink}>Read essay</Text>
            </Pressable>
          )
        })}
      </View>

      <View style={styles.callout}>
        <Text style={styles.calloutTitle}>Next up</Text>
        <Text style={styles.calloutText}>Check the website😭</Text>
      </View>
    </ScreenShell>
  )
}

const styles = StyleSheet.create({
  hero: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT,
    backgroundColor: 'rgba(255,255,255,0.04)'
  },
  heroTitle: {
    color: ARCH.TEXT,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  heroBody: {
    color: ARCH.SUB,
    marginTop: 8
  },
  grid: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    fontWeight: '800',
    marginBottom: 8
  },
  cardBody: {
    color: ARCH.SUB,
    lineHeight: 20
  },
  cardLink: {
    marginTop: 10,
    color: ARCH.ACCENT,
    fontWeight: '700'
  },
  callout: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(147,197,253,0.6)',
    backgroundColor: 'rgba(147,197,253,0.12)'
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
