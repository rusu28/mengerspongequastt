import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View, Pressable, ActivityIndicator } from 'react-native';
import { ArchBackground, ARCH } from '@/components/arch-theme';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const BG = ARCH.BG;
const TEXT = ARCH.TEXT;
const SUB = ARCH.SUB;
const BORDER = ARCH.BORDER;
const ACCENT = ARCH.ACCENT;
const ACCENT_2 = ARCH.ACCENT_2;
const ACCESS_CODE = 'strajivraji';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(true);
  const [codeInput, setCodeInput] = useState('');
  const [accessGranted, setAccessGranted] = useState(false);
  const [codeError, setCodeError] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(id);
  }, []);

  const submitCode = () => {
    const cleaned = codeInput.trim().toLowerCase();
    if (cleaned === ACCESS_CODE) {
      setAccessGranted(true);
      setCodeError('');
    } else {
      setCodeError('Invalid access code.');
    }
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {loading ? (
        <SafeAreaView style={styles.root}>
          <ArchBackground />
          <View style={styles.loadingCard}>
            <Text style={styles.loadingTitle}>Loading The Magic Cube Hub</Text>
            <Text style={styles.loadingSub}>Preparing modules...</Text>
            <ActivityIndicator size="large" color={ACCENT_2} style={{ marginTop: 16 }} />
          </View>
          <StatusBar style="light" />
        </SafeAreaView>
      ) : !accessGranted ? (
        <SafeAreaView style={styles.root}>
          <ArchBackground />
          <View style={styles.accessWrap}>
            <View style={styles.accessCard}>
              <Text style={styles.accessTitle}>Access Required</Text>
              <Text style={styles.accessSub}>Enter the access code to continue.(code: strajivraji )</Text>

              <TextInput
                value={codeInput}
                onChangeText={(t) => {
                  setCodeInput(t);
                  if (codeError) setCodeError('');
                }}
                onSubmitEditing={submitCode}
                placeholder="Access code"
                placeholderTextColor="rgba(244,239,250,0.45)"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.accessInput}
              />
              {codeError ? <Text style={styles.accessError}>{codeError}</Text> : null}
              <Pressable onPress={submitCode} style={styles.accessBtn}>
                <Text style={styles.accessBtnText}>Unlock</Text>
              </Pressable>
            </View>
          </View>
          <StatusBar style="light" />
        </SafeAreaView>
      ) : (
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      )}
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, justifyContent: 'center', alignItems: 'center' },
  loadingCard: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(15,12,20,0.75)',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center'
  },
  loadingTitle: { color: TEXT, fontSize: 20, fontWeight: '900' },
  loadingSub: { color: SUB, marginTop: 6 },
  accessWrap: { width: '100%', paddingHorizontal: 18, alignItems: 'center' },
  accessCard: {
    width: '100%',
    maxWidth: 420,
    padding: 22,
    borderRadius: 22,
    backgroundColor: 'rgba(12, 9, 16, 0.88)',
    borderWidth: 1,
    borderColor: BORDER
  },
  accessTitle: { color: TEXT, fontSize: 22, fontWeight: '900' },
  accessSub: { color: SUB, marginTop: 6, marginBottom: 14 },
  accessInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    color: TEXT,
    backgroundColor: 'rgba(255,255,255,0.06)'
  },
  accessError: { color: '#ff8a8a', marginTop: 8 },
  accessBtn: {
    marginTop: 12,
    height: 46,
    borderRadius: 12,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center'
  },
  accessBtnText: { color: '#120A16', fontWeight: '900' }
});
