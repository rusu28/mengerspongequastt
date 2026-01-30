import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
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
  const { width } = useWindowDimensions()
  const compact = width < 720

  return (
    <View style={[styles.topbar, compact && styles.topbarCompact]}>
      <Pressable
        onPress={() => router.push('/(tabs)')}
        style={({ pressed, hovered }) => [
          styles.brandPill,
          (pressed || hovered) && styles.brandPillActive,
          compact && styles.brandPillCompact
        ]}
      >
        <Text style={[styles.brandText, compact && styles.brandTextCompact]}>Cubes Laborator</Text>
      </Pressable>

      {compact ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.navRowCompact}
        >
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
        </ScrollView>
      ) : (
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
      )}
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
  topbarCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 18
  },
  brandPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: ARCH.BORDER,
    backgroundColor: 'rgba(255,255,255,0.04)'
  },
  brandPillCompact: {
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  brandPillActive: {
    transform: [{ scale: 0.98 }],
    borderColor: ARCH.TEXT
  },
  brandText: { color: ARCH.TEXT, fontWeight: '800', letterSpacing: 2 },
  brandTextCompact: {
    fontSize: 11,
    letterSpacing: 1.6
  },

  navRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', justifyContent: 'center', flex: 1, marginLeft: 16 },
  navRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 6
  },
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
