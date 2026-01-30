import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { StyleSheet, View } from 'react-native'

export const ARCH = {
  BG: '#0a0a0a',
  PANEL: '#121212',
  PANEL_2: '#0f0f0f',
  BORDER: '#1f1f1f',
  BORDER_SOFT: '#2a2a2a',
  TEXT: '#f5f5f5',
  SUB: '#cfcfcf',
  MUTED: '#9a9a9a',
  ACCENT: '#ffffff',
  ACCENT_2: '#e5e5e5',
  ACCENT_3: '#bdbdbd'
} as const

export function ArchBackground() {
  const bars = [
    { left: '58%', width: 2, opacity: 0.18 },
    { left: '61%', width: 1, opacity: 0.3 },
    { left: '63%', width: 2, opacity: 0.24 },
    { left: '65%', width: 1, opacity: 0.4 },
    { left: '67%', width: 2, opacity: 0.26 },
    { left: '69%', width: 1, opacity: 0.35 },
    { left: '71%', width: 2, opacity: 0.22 },
    { left: '73%', width: 1, opacity: 0.38 },
    { left: '75%', width: 2, opacity: 0.2 },
    { left: '77%', width: 1, opacity: 0.33 },
    { left: '79%', width: 2, opacity: 0.24 },
    { left: '81%', width: 1, opacity: 0.3 },
    { left: '83%', width: 2, opacity: 0.2 },
    { left: '85%', width: 1, opacity: 0.28 }
  ]

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#0a0a0a', '#0f0f0f', '#0a0a0a']} style={StyleSheet.absoluteFill} />
      <View style={[styles.lineH, { top: '22%' }]} />
      <View style={[styles.lineH, { top: '74%' }]} />
      <View style={[styles.lineV, { left: '18%' }]} />
      <View style={[styles.lineV, { left: '82%' }]} />
      {bars.map((bar, index) => (
        <View key={`bar-${index}`} style={[styles.bar, bar]} />
      ))}
      <View style={styles.panelBlock} />
      <View style={[styles.glow, { left: -160, top: -120, backgroundColor: 'rgba(255,255,255,0.06)' }]} />
      <View style={[styles.glow, { right: -200, top: 140, backgroundColor: 'rgba(255,255,255,0.04)' }]} />
      <View style={[styles.glow, { left: 20, bottom: -240, backgroundColor: 'rgba(255,255,255,0.05)' }]} />
      <View style={styles.scanlines} />
      <View style={styles.rings} />
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(20,20,20,0.15)', 'rgba(0,0,0,0.9)']}
        style={StyleSheet.absoluteFill}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    width: 460,
    height: 460,
    borderRadius: 460
  },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.18,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)'
  },
  rings: {
    position: 'absolute',
    left: -140,
    top: 120,
    width: 520,
    height: 520,
    borderRadius: 520,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  lineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)'
  },
  lineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.12)'
  },
  bar: {
    position: 'absolute',
    top: 40,
    bottom: 40,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 2
  },
  panelBlock: {
    position: 'absolute',
    right: -24,
    bottom: 40,
    width: 220,
    height: 180,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)'
  }
})
