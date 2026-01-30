import React from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { ArchBackground, ARCH } from './arch-theme'
import { RuriNav } from './ruri-nav'

type ScreenShellProps = {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function ScreenShell({ title, subtitle, children }: ScreenShellProps) {
  const { width } = useWindowDimensions()
  const wide = width >= 900

  return (
    <SafeAreaView style={styles.root}>
      <ArchBackground />
      <View style={styles.shell}>
        {wide ? (
          <View style={styles.rail}>
            <View style={styles.railLogo} />
            <View style={styles.railDots}>
              {['home', 'layers', 'archive', 'studio', 'journal', 'award'].map((item) => (
                <View key={item} style={styles.railDot} />
              ))}
            </View>
            <View style={styles.railFooter} />
          </View>
        ) : null}
        <View style={styles.page}>
          <ScrollView contentContainerStyle={[styles.content, wide && styles.contentWide]} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <RuriNav />
              <View style={styles.headerLine} />
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {children}
          </ScrollView>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Rus Vlad Andrei & Strajan Andrei</Text>
            <Text style={styles.footerText}>Cubes Laborator</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ARCH.BG
  },
  shell: {
    flex: 1,
    flexDirection: 'row'
  },
  page: {
    flex: 1
  },
  rail: {
    width: 72,
    borderRightWidth: 1,
    borderRightColor: ARCH.BORDER,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 18
  },
  railLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)'
  },
  railDots: {
    gap: 18,
    alignItems: 'center'
  },
  railDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)'
  },
  railFooter: {
    marginTop: 'auto',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: ARCH.BORDER
  },
  content: {
    padding: 20,
    paddingBottom: 36
  },
  contentWide: {
    paddingHorizontal: 36
  },
  header: {
    marginBottom: 20
  },
  headerLine: {
    marginTop: 6,
    width: 120,
    height: 2,
    backgroundColor: ARCH.ACCENT,
    opacity: 0.6
  },
  title: {
    color: ARCH.TEXT,
    fontSize: 26,
    fontWeight: '900',
    marginTop: 12,
    letterSpacing: 0.4
  },
  subtitle: {
    color: ARCH.SUB,
    marginTop: 6,
    lineHeight: 20
  },
  footer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  footerText: {
    color: ARCH.MUTED,
    fontSize: 9,
    letterSpacing: 2
  }
})
