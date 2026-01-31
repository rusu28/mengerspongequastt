import React, { useMemo, useRef } from 'react'
import {
  Animated,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from 'react-native'
import { ArchBackground, ARCH } from '@/components/arch-theme'
import { RuriNav } from '@/components/ruri-nav'

const TEAM = [
  {
    name: 'Rus Vlad Andrei',
    role: 'Programator + UI + Hosting',
    bio: 'Programare, putin la matematica, UI si hosting. Coordoneaza flow-ul si layout-ul aplicatiei.'
  },
  {
    name: 'Strajan Andrei',
    role: 'Matematica + Formule',
    bio: 'Matematica, formulele si logica din spate. Structureaza explicatiile si corectitudinea.'
  }
]

const NOTES = [
  {
    title: 'Why we build',
    body: 'We translate mathematical beauty into a visual language that feels alive, tactile, and precise.'
  },
  {
    title: 'Workflow',
    body: 'We design in layers: geometry first, then motion, then micro-contrast and typography.'
  },
  {
    title: 'What matters',
    body: 'Clarity, depth, and a black-first palette that lets the structure speak louder than noise.'
  }
]

export default function AboutTeam() {
  const { width } = useWindowDimensions()
  const compact = width < 720
  const scrollY = useRef(new Animated.Value(0)).current
  const contentPadding = compact ? 14 : 20
  const dots = useMemo(() => Array.from({ length: 160 }), [])

  const heroShift = scrollY.interpolate({
    inputRange: [0, 400],
    outputRange: [0, -60],
    extrapolate: 'clamp'
  })
  const cardShift = scrollY.interpolate({
    inputRange: [200, 900],
    outputRange: [40, -50],
    extrapolate: 'clamp'
  })
  const gridShift = scrollY.interpolate({
    inputRange: [0, 1200],
    outputRange: [0, -80],
    extrapolate: 'clamp'
  })
  const hazeShift = scrollY.interpolate({
    inputRange: [0, 1200],
    outputRange: [0, -140],
    extrapolate: 'clamp'
  })

  const cards = useMemo(() => TEAM, [])

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ArchBackground />
      <Animated.View style={[styles.gridLayer, { transform: [{ translateY: gridShift }] }]}>
        <View style={styles.dotGrid}>
          {dots.map((_, index) => (
            <View key={`dot-${index}`} style={styles.dot} />
          ))}
        </View>
      </Animated.View>
      <Animated.View style={[styles.hazeLayer, { transform: [{ translateY: hazeShift }] }]} />
      <Animated.View style={[styles.hazeLayerSecondary, { transform: [{ translateY: hazeShift }] }]} />

      <Animated.ScrollView
        contentContainerStyle={[styles.content, { padding: contentPadding, paddingBottom: 80 }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true
        })}
      >
        <RuriNav />

        <Animated.View style={[styles.hero, { transform: [{ translateY: heroShift }] }]}>
          <Text style={styles.kicker}>ABOUT TEAM</Text>
          <Text style={styles.title}>Racovita Lab</Text>
          <Text style={styles.subtitle}>
            Rus Vlad Andrei & Strajan Andrei - dual focus on fractal logic and visual systems.
          </Text>
        </Animated.View>

        <View style={styles.grid}>
          {cards.map((member, index) => {
            const alignRight = index % 2 === 1 && !compact
            return (
              <Animated.View
                key={member.name}
                style={[
                  styles.card,
                  alignRight && styles.cardRight,
                  { transform: [{ translateY: Animated.multiply(cardShift, alignRight ? 0.7 : 0.5) }] }
                ]}
              >
                <View style={styles.cardLine} />
                <Text style={styles.cardName}>{member.name}</Text>
                <Text style={styles.cardRole}>{member.role}</Text>
                <Text style={styles.cardBody}>{member.bio}</Text>
              </Animated.View>
            )
          })}
        </View>

        <View style={styles.noteWrap}>
          {NOTES.map((note, index) => (
            <Animated.View
              key={note.title}
              style={[
                styles.note,
                {
                  transform: [{ translateY: Animated.multiply(cardShift, 0.35 + index * 0.1) }]
                }
              ]}
            >
              <Text style={styles.noteTitle}>{note.title}</Text>
              <Text style={styles.noteBody}>{note.body}</Text>
            </Animated.View>
          ))}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ARCH.BG
  },
  content: {
    padding: 20
  },
  dotGrid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 18,
    paddingHorizontal: 18,
    opacity: 0.28
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 2,
    marginRight: 18,
    marginBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.35)'
  },
  gridLayer: { ...StyleSheet.absoluteFillObject },
  hazeLayer: {
    position: 'absolute',
    top: -120,
    left: -40,
    right: -40,
    height: 260,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 999
  },
  hazeLayerSecondary: {
    position: 'absolute',
    top: 240,
    left: -120,
    right: -120,
    height: 380,
    backgroundColor: 'rgba(255,255,255,0.025)',
    borderRadius: 999
  },
  hero: {
    paddingVertical: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 18,
    marginBottom: 24
  },
  kicker: {
    color: ARCH.MUTED,
    letterSpacing: 3,
    fontSize: 11
  },
  title: {
    color: ARCH.TEXT,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 8
  },
  subtitle: {
    color: ARCH.SUB,
    marginTop: 10,
    lineHeight: 20
  },
  grid: {
    gap: 16
  },
  card: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT,
    backgroundColor: 'rgba(0,0,0,0.35)',
    maxWidth: 520
  },
  cardRight: {
    alignSelf: 'flex-end'
  },
  cardLine: {
    width: 120,
    height: 2,
    backgroundColor: ARCH.ACCENT,
    opacity: 0.7
  },
  cardName: {
    color: ARCH.TEXT,
    fontWeight: '800',
    fontSize: 18,
    marginTop: 12
  },
  cardRole: {
    color: ARCH.MUTED,
    marginTop: 4,
    letterSpacing: 1.2,
    fontSize: 11,
    textTransform: 'uppercase'
  },
  cardBody: {
    color: ARCH.SUB,
    marginTop: 10,
    lineHeight: 20
  },
  noteWrap: {
    marginTop: 26,
    gap: 12
  },
  note: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT,
    backgroundColor: 'rgba(255,255,255,0.02)'
  },
  noteTitle: {
    color: ARCH.TEXT,
    fontWeight: '800'
  },
  noteBody: {
    color: ARCH.SUB,
    marginTop: 6,
    lineHeight: 20
  }
})
