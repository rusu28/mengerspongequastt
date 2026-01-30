import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { ScreenShell } from '@/components/screen-shell'
import { ARCH } from '@/components/arch-theme'

const DETAILS: Record<string, { title: string; body: string }> = {
  romanesco: {
    title: 'Romanesco broccoli',
    body: 'Romanesco grows in spiral florets that repeat in smaller spirals. Each branch mirrors the overall geometry, making it a living fractal.'
  },
  snowflakes: {
    title: 'Snowflakes',
    body: 'Snowflakes grow by adding crystal branches. Each branch splits again, creating self-similar, fractal-like patterns.'
  },
  coastlines: {
    title: 'Coastlines',
    body: 'As you measure a coastline with smaller rulers, the measured length increases. This is a classic sign of fractal geometry.'
  },
  clouds: {
    title: 'Clouds',
    body: 'Turbulence produces cascading eddies. The result is a texture that repeats across scales, from small puffs to huge cloud masses.'
  },
  trees: {
    title: 'Trees',
    body: 'Branches split into smaller branches that split again. This recursive branching is one of the most recognizable natural fractals.'
  },
  lightning: {
    title: 'Lightning',
    body: 'Electrical discharge follows branching paths through air. The result is a fractal structure that rapidly grows across scales.'
  }
}

export default function RealLifeDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const content = DETAILS[slug ?? ''] || DETAILS.romanesco

  return (
    <ScreenShell
      title={content.title}
      subtitle="Natural fractal breakdown"
    >
      <View style={styles.card}>
        <Text style={styles.body}>{content.body}</Text>
      </View>
    </ScreenShell>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT,
    backgroundColor: 'rgba(255,255,255,0.02)'
  },
  body: {
    color: ARCH.TEXT,
    lineHeight: 22
  }
})
