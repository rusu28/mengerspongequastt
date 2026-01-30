import React, { useEffect, useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { ScreenShell } from '@/components/screen-shell'
import { ARCH } from '@/components/arch-theme'

const ESSAYS: Record<string, { title: string; body: string[] }> = {
  intro: {
    title: 'What is a fractal?',
    body: [
      'A fractal is a shape or pattern that repeats at every scale. When you zoom in, the structure keeps revealing new detail that echoes the whole.',
      'This is called self-similarity. Nature loves it because it is efficient: it packs long paths and massive surfaces into small volumes.',
      'Fractals sit between dimensions. A coastline is more than a line, less than a plane. That is why fractal dimensions are often non-integer.'
    ]
  },
  menger: {
    title: 'How the Menger sponge is built',
    body: [
      'Start with a single cube. Split it into a 3x3x3 grid, which gives 27 smaller cubes.',
      'Remove the center cube and the six cubes at the center of each face. You keep 20 cubes.',
      'Repeat the same carving on every remaining cube. Each iteration creates a lattice of tunnels and cavities.'
    ]
  },
  dimension: {
    title: 'Why the surface explodes',
    body: [
      'Each iteration removes volume but increases surface area. You add more exposed faces than you remove.',
      'As the iterations continue, the volume tends toward zero while the surface area grows without bound.',
      'That is why the Menger sponge is used as a model for ultra-porous materials and antennas.'
    ]
  },
  nature: {
    title: 'Applications in nature',
    body: [
      'Fractal geometry appears in coastlines, lungs, lightning, clouds, and branching trees.',
      'These systems distribute energy and matter efficiently because branching networks maximize surface area.',
      'That is why fractals are used in computer graphics, antennas, filters, and procedural worlds.'
    ]
  }
}

export default function LearnEssay() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const content = ESSAYS[slug ?? ''] || ESSAYS.intro
  const fullText = useMemo(() => content.body.join('\n\n'), [content])
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    setDisplayed('')
    let index = 0
    const id = setInterval(() => {
      index += 1
      setDisplayed(fullText.slice(0, index))
      if (index >= fullText.length) clearInterval(id)
    }, 18)
    return () => clearInterval(id)
  }, [fullText])

  return (
    <ScreenShell
      title={content.title}
      subtitle="Auto-typing essay mode"
    >
      <View style={styles.panel}>
        <Text style={styles.body}>{displayed}</Text>
      </View>
    </ScreenShell>
  )
}

const styles = StyleSheet.create({
  panel: {
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
