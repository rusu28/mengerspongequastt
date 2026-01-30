import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import { ARCH } from './arch-theme'

const NAV_ITEMS = [
  { label: 'Index', route: '/(tabs)' },
  { label: 'Explore', route: '/explore' },
  { label: 'Shader Studio', route: '/shader-studio' },
  { label: 'Real Life', route: '/real-life' },
  { label: 'Quiz', route: '/quiz' },
  { label: 'Learn', route: '/learn' },
  { label: 'Portal', route: '/portal' },
  { label: 'Maths Lab', route: '/mathsandjeans' },
  { label: 'Laborator', route: '/laborator' },
  { label: 'Energy', route: '/energy' }
]

export function RuriNav() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <View style={styles.topbar}>
      <Pressable
        onPress={() => router.push('/(tabs)')}
        style={({ pressed, hovered }) => [
          styles.brandPill,
          (pressed || hovered) && styles.brandPillActive
        ]}
      >
        <Text style={styles.brandText}>Cubes Laborator</Text>
      </Pressable>

      <View style={styles.navRow}>
        {NAV_ITEMS.map((item) => {
          const active = item.route === '/(tabs)' ? pathname === '/' || pathname === '/(tabs)' : pathname === item.route
          return (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route)}
              style={({ pressed, hovered }) => [
                styles.navItem,
                active && styles.navItemActive,
                (pressed || hovered) && styles.navItemHover
              ]}
            >
              <Text style={[styles.navText, active && styles.navTextActive]}>{item.label}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  topbar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 26
  },
  brandPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: ARCH.BORDER,
    backgroundColor: 'rgba(255,255,255,0.04)'
  },
  brandPillActive: {
    transform: [{ scale: 0.98 }],
    borderColor: ARCH.TEXT
  },
  brandText: { color: ARCH.TEXT, fontWeight: '800', letterSpacing: 2 },

  navRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', justifyContent: 'center', flex: 1, marginLeft: 16 },
  navItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  navItemHover: {
    transform: [{ translateY: -1 }],
    borderColor: ARCH.BORDER_SOFT,
    backgroundColor: 'rgba(255,255,255,0.04)'
  },
  navItemActive: {
    borderColor: ARCH.TEXT,
    backgroundColor: 'rgba(255,255,255,0.06)'
  },
  navText: { color: ARCH.SUB, fontSize: 12, fontWeight: '700', letterSpacing: 1.1 },
  navTextActive: { color: ARCH.TEXT }
})
