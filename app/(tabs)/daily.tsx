import React, { useEffect, useMemo, useState } from 'react'
import { StyleSheet, Text, View, Pressable } from 'react-native'
import { ScreenShell } from '@/components/screen-shell'
import { ARCH } from '@/components/arch-theme'

const CHALLENGES = [
  { title: 'Guess the fractal', desc: 'Identify the fractal in 5 seconds.' },
  { title: 'Find the hidden cube', desc: 'Spot the missing cube before time runs out.' },
  { title: 'Shader speedrun', desc: 'Match the shader preset by memory.' },
  { title: 'Portal hop', desc: 'Chain 3 portals without mistakes.' },
  { title: 'Infinite zoom', desc: 'Reach depth 6 in under 20 seconds.' },
  { title: 'Audio sync', desc: 'Match pulses to the beat.' }
]

function getDayKey(date = new Date()) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function getDailyIndex(date = new Date()) {
  const key = getDayKey(date)
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) % 100000
  }
  return CHALLENGES.length ? hash % CHALLENGES.length : 0
}

function getTimeToReset() {
  const now = new Date()
  const next = new Date(now)
  next.setHours(24, 0, 0, 0)
  const diff = Math.max(0, next.getTime() - now.getTime())
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { hours, minutes, seconds }
}

export default function Daily() {
  const [completed, setCompleted] = useState(false)
  const [dayKey, setDayKey] = useState(getDayKey())
  const [dailyIndex, setDailyIndex] = useState(getDailyIndex())
  const daily = CHALLENGES[dailyIndex] ?? CHALLENGES[0]
  const [timeLeft, setTimeLeft] = useState(getTimeToReset())

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date()
      const nextKey = getDayKey(now)
      if (nextKey !== dayKey) {
        setDayKey(nextKey)
        setDailyIndex(getDailyIndex(now))
        setCompleted(false)
      }
      setTimeLeft(getTimeToReset())
    }, 1000)
    return () => clearInterval(id)
  }, [dayKey])

  return (
    <ScreenShell
      title="Daily Challenge"
      subtitle="Ruri lines mode: one focused mission per day."
    >
      <View style={styles.hero}>
        <View>
          <Text style={styles.heroKicker}>TODAY</Text>
          <Text style={styles.heroTitle}>{daily.title}</Text>
          <Text style={styles.heroText}>{daily.desc}</Text>
        </View>
        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>Resets in</Text>
          <Text style={styles.timerValue}>
            {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </Text>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Streak</Text>
        <Text style={styles.panelValue}>04 days</Text>
        <Pressable style={styles.primaryBtn} onPress={() => setCompleted((v) => !v)}>
          <Text style={styles.primaryText}>{completed ? 'Marked complete' : 'Start challenge'}</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {CHALLENGES.map((item) => (
          <View key={item.title} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardText}>{item.desc}</Text>
          </View>
        ))}
      </View>
    </ScreenShell>
  )
}

const styles = StyleSheet.create({
  hero: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(199,182,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(199,182,255,0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  heroKicker: {
    color: ARCH.MUTED,
    letterSpacing: 2,
    fontSize: 11
  },
  heroTitle: {
    color: ARCH.TEXT,
    fontWeight: '900',
    fontSize: 18,
    marginTop: 6
  },
  heroText: {
    color: ARCH.SUB,
    marginTop: 6
  },
  timerBox: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ARCH.BORDER,
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  timerLabel: {
    color: ARCH.MUTED,
    fontSize: 11
  },
  timerValue: {
    color: ARCH.TEXT,
    fontWeight: '800',
    marginTop: 6
  },
  panel: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: ARCH.PANEL,
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT
  },
  panelTitle: {
    color: ARCH.SUB,
    letterSpacing: 2,
    fontSize: 11
  },
  panelValue: {
    color: ARCH.TEXT,
    fontWeight: '900',
    fontSize: 20,
    marginTop: 6
  },
  primaryBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: ARCH.ACCENT,
    alignItems: 'center'
  },
  primaryText: {
    color: '#0A0B0E',
    fontWeight: '800'
  },
  list: {
    marginTop: 18,
    gap: 12
  },
  card: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT
  },
  cardTitle: {
    color: ARCH.TEXT,
    fontWeight: '700'
  },
  cardText: {
    color: ARCH.SUB,
    marginTop: 6
  }
})
