import React, { useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View, Pressable, Switch, useWindowDimensions } from 'react-native'
import { ArchBackground, ARCH } from '@/components/arch-theme'
import { RuriNav } from '@/components/ruri-nav'

export default function Settings() {
  const [lowGraphics, setLowGraphics] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const [notifications, setNotifications] = useState(false)
  const { width } = useWindowDimensions()
  const compact = width < 720
  const padding = compact ? 14 : 24

  return (
    <SafeAreaView style={[styles.root, { paddingHorizontal: padding }]}>
      <ArchBackground />
      <View style={styles.header}>
        <RuriNav />
      </View>

      <View style={styles.main}>
        <Text style={styles.kicker}>System Control</Text>
        <Text style={[styles.title, compact && styles.titleCompact]}>Settings</Text>
        <Text style={[styles.sub, compact && styles.subCompact]}>Tune rendering, motion, and system preferences.</Text>

        <View style={styles.panel}>
          {[
            { label: 'Low graphics mode', value: lowGraphics, setter: setLowGraphics },
            { label: 'Auto-rotate scenes', value: autoRotate, setter: setAutoRotate },
            { label: 'Daily notifications', value: notifications, setter: setNotifications }
          ].map((item) => (
            <View key={item.label} style={styles.row}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Switch
                value={item.value}
                onValueChange={item.setter}
                trackColor={{ false: '#1a1a1a', true: ARCH.ACCENT }}
                thumbColor={item.value ? '#ffffff' : '#8b8b8b'}
              />
            </View>
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Session</Text>
          <Pressable style={styles.cta}>
            <Text style={styles.ctaText}>Reset preferences</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.footer, compact && styles.footerCompact]}>
        <Text style={styles.footerText}>© 2024 LUXE DIGITAL ESTATES</Text>
        <Text style={styles.footerText}>Invitations Only</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ARCH.BG,
    paddingHorizontal: 24
  },
  header: {
    marginTop: 16
  },
  main: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  kicker: {
    color: ARCH.ACCENT,
    letterSpacing: 4,
    fontSize: 10,
    textTransform: 'uppercase'
  },
  title: {
    color: ARCH.TEXT,
    fontSize: 36,
    marginTop: 10,
    fontWeight: '300',
    letterSpacing: 0.5
  },
  titleCompact: {
    fontSize: 28
  },
  sub: {
    color: ARCH.SUB,
    marginTop: 12,
    maxWidth: 320
  },
  subCompact: {
    maxWidth: 280
  },
  panel: {
    width: '100%',
    marginTop: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT,
    backgroundColor: ARCH.PANEL,
    padding: 16,
    gap: 12
  },
  panelTitle: {
    color: ARCH.TEXT,
    fontWeight: '700'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  rowLabel: {
    color: ARCH.SUB
  },
  cta: {
    marginTop: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ARCH.BORDER,
    alignItems: 'center'
  },
  ctaText: {
    color: ARCH.TEXT,
    letterSpacing: 2,
    fontSize: 11
  },
  footer: {
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  footerCompact: {
    flexDirection: 'column',
    gap: 6,
    alignItems: 'flex-start'
  },
  footerText: {
    color: ARCH.MUTED,
    fontSize: 9,
    letterSpacing: 2
  }
})

