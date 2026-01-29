import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { StyleSheet, View } from 'react-native'

export const ARCH = {
  BG: '#0B0810',
  PANEL: 'rgba(255,255,255,0.06)',
  PANEL_2: 'rgba(255,255,255,0.045)',
  BORDER: 'rgba(255,255,255,0.10)',
  BORDER_SOFT: 'rgba(255,255,255,0.08)',
  TEXT: '#F4EFFA',
  SUB: 'rgba(244,239,250,0.70)',
  MUTED: 'rgba(244,239,250,0.55)',
  ACCENT: '#D8B4FE',
  ACCENT_2: '#F0ABFC',
  ACCENT_3: '#93C5FD'
} as const

export function ArchBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#07050C', '#0B0810', '#0B0810']} style={StyleSheet.absoluteFill} />
      <View style={[styles.blob, { left: -160, top: -120, backgroundColor: 'rgba(216,180,254,0.14)' }]} />
      <View style={[styles.blob, { right: -170, top: 120, backgroundColor: 'rgba(147,197,253,0.10)' }]} />
      <View style={[styles.blob, { left: 40, bottom: -220, backgroundColor: 'rgba(240,171,252,0.10)' }]} />
      <View style={styles.ring1} />
      <View style={styles.ring2} />
      <View style={styles.ring3} />
      <LinearGradient
        colors={['rgba(0,0,0,0.70)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.75)']}
        style={StyleSheet.absoluteFill}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    width: 460,
    height: 460,
    borderRadius: 460
  },
  ring1: {
    position: 'absolute',
    left: -140,
    top: 120,
    width: 520,
    height: 520,
    borderRadius: 520,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  ring2: {
    position: 'absolute',
    right: -260,
    top: 220,
    width: 620,
    height: 620,
    borderRadius: 620,
    borderWidth: 1,
    borderColor: 'rgba(216,180,254,0.06)'
  },
  ring3: {
    position: 'absolute',
    left: 20,
    bottom: -360,
    width: 760,
    height: 760,
    borderRadius: 760,
    borderWidth: 1,
    borderColor: 'rgba(147,197,253,0.05)'
  }
})
