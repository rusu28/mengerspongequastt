import React from 'react'
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ARCH } from './arch-theme'

const NAV_ITEMS = [
  { label: 'Home', route: '/' },
  { label: 'Explorer', route: '/explore' },
  { label: 'Shader', route: '/shader-studio' },
  { label: 'Quiz', route: '/quiz' },
  { label: 'Learn', route: '/learn' },
  { label: 'Build', route: '/build-steps' },
  { label: 'Real Life', route: '/real-life' },
  { label: 'Audio', route: '/audio-reactive' },
  { label: 'Builder', route: '/builder' },
  { label: 'Portal', route: '/portal' },
  { label: 'Daily', route: '/daily' },
  { label: 'Settings', route: '/settings' },
  { label: 'Energy', route: '/energy' },
  { label: 'Lab', route: '/laborator' },
  { label: 'Maths Lab', route: '/mathsandjeans' }
]

export function ArchNav({ active }: { active?: string }) {
  const router = useRouter()

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.route
          return (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route)}
              style={[styles.pill, isActive && styles.pillActive]}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{item.label}</Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8
  },
  row: {
    gap: 10,
    paddingHorizontal: 2
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: ARCH.BORDER
  },
  pillActive: {
    borderColor: ARCH.ACCENT,
    backgroundColor: 'rgba(240,234,214,0.18)'
  },
  pillText: {
    color: ARCH.SUB,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1.2
  },
  pillTextActive: {
    color: ARCH.TEXT
  }
})
