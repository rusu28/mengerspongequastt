import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { ArchBackground, ARCH } from '@/components/arch-theme'
import { SafeAreaView, View, Text, StyleSheet, TextInput, Pressable, StatusBar } from 'react-native'

const ACCESS_CODE = 'strajivraji'

export default function GateScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(id)
  }, [])

  const handleEnter = () => {
    if (code.trim().toLowerCase() === ACCESS_CODE) {
      router.replace('/(tabs)')
      return
    }
    setError('Invalid access code.')
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ArchBackground />
      <View style={styles.center}>
        <Text style={styles.title}>Rus Vlad Andrei & Strajan Andrei</Text>
        <Text style={styles.subtitle}>Private access required</Text>

        {loading ? (
          <View style={styles.loader}>
            <View style={styles.loaderDot} />
            <View style={styles.loaderDot} />
            <View style={styles.loaderDot} />
            <Text style={styles.loaderText}>Loading modules...</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.label}>Enter access code</Text>
            <TextInput
              placeholder="strajivraji"
              placeholderTextColor={ARCH.MUTED}
              value={code}
              onChangeText={(value) => {
                setCode(value)
                setError('')
              }}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable
              onPress={handleEnter}
              style={({ pressed, hovered }) => [
                styles.button,
                (pressed || hovered) && styles.buttonHover
              ]}
            >
              <Text style={styles.buttonText}>Enter site</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ARCH.BG },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: ARCH.TEXT, fontSize: 28, fontWeight: '900', letterSpacing: 1.2 },
  subtitle: { color: ARCH.MUTED, marginTop: 6, marginBottom: 24 },
  loader: { alignItems: 'center', gap: 10 },
  loaderDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.5)'
  },
  loaderText: { color: ARCH.MUTED, fontSize: 12, letterSpacing: 1 },
  card: {
    width: '100%',
    maxWidth: 360,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT,
    backgroundColor: 'rgba(255,255,255,0.04)'
  },
  label: { color: ARCH.SUB, fontSize: 12, letterSpacing: 1, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: ARCH.BORDER,
    backgroundColor: 'rgba(0,0,0,0.4)',
    color: ARCH.TEXT,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12
  },
  error: { color: '#ff6b6b', marginTop: 8, fontSize: 12 },
  button: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: ARCH.TEXT,
    alignItems: 'center'
  },
  buttonHover: {
    transform: [{ translateY: -1 }],
    opacity: 0.92
  },
  buttonText: { color: '#0b0b0b', fontWeight: '900', letterSpacing: 1 }
})
