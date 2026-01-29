import React from 'react'
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ARCH } from './arch-theme'

const NAV_ITEMS = [
  { label: 'Home', route: '/' },
  { label: 'Explore', route: '/explore' },
  { label: 'Energy', route: '/energy' },
  { label: 'Game', route: '/game' },
  { label: 'Lab', route: '/laborator' },
  { label: 'Maths', route: '/mathsandjeans' }
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
    marginBottom: 12
  },
  row: {
    gap: 10,
    paddingHorizontal: 4
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: ARCH.PANEL,
    borderWidth: 1,
    borderColor: ARCH.BORDER
  },
  pillActive: {
    backgroundColor: ARCH.ACCENT,
    borderColor: 'rgba(255,255,255,0.18)'
  },
  pillText: {
    color: ARCH.TEXT,
    fontWeight: '800',
    fontSize: 12
  },
  pillTextActive: {
    color: '#120A16'
  }
})
