import React, { useMemo, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { ArchBackground, ARCH } from '@/components/arch-theme'
import { ArchNav } from '@/components/arch-nav'
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Animated,
  Dimensions,
  StatusBar
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
const { height: H, width: W } = Dimensions.get('window')

const HERO_IMAGE = 'https://i.ytimg.com/vi/fWsmq9E4YC0/maxresdefault.jpg'

const FLOAT_IMG_1 = HERO_IMAGE
const FLOAT_IMG_2 = 'https://images.unsplash.com/photo-1529421308418-eab98863cee5?auto=format&fit=crop&w=1200&q=60'
const FLOAT_IMG_3 = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=60'

const exploreItems = [
  { title: 'What is it?', subtitle: 'A detailed explanation', icon: 'help-circle-outline', slug: 'ce-este' },
  { title: 'Interactive Build', subtitle: 'Model it in 3D', icon: 'cube-outline', slug: 'constructie-interactiva' },
  { title: 'Math Properties', subtitle: 'Area and volume', icon: 'calculator-outline', slug: 'proprietati-matematice' },
  { title: 'Gallery', subtitle: 'Images and animations', icon: 'images-outline', slug: 'galerie' },
  { title: 'Physical Properties', subtitle: 'Light, sound, heat, flow', icon: 'planet-outline', slug: 'proprietati-fizice' }
] as const

// Arch-like palette
const BG = ARCH.BG
const PANEL = 'rgba(255,255,255,0.06)'
const PANEL_2 = 'rgba(255,255,255,0.045)'
const BORDER = 'rgba(255,255,255,0.10)'
const BORDER_SOFT = 'rgba(255,255,255,0.08)'
const TEXT = '#F4EFFA'
const SUB = 'rgba(244,239,250,0.70)'
const MUTED = 'rgba(244,239,250,0.55)'

// accents
const ACCENT = ARCH.ACCENT // lavender
const ACCENT_2 = ARCH.ACCENT_2 // pink-lilac
const ACCENT_3 = ARCH.ACCENT_3 // soft blue

function AccentDot() {
  return <View style={styles.accentDot} />
}

function AccentBar() {
  return (
    <LinearGradient
      colors={[ACCENT_3, ACCENT_2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.accentBar}
    />
  )
}

const ExploreCard = React.memo(function ExploreCard(props: {
  title: string
  subtitle: string
  icon: string
  onPress: () => void
}) {
  const scale = useRef(new Animated.Value(1)).current

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.985, useNativeDriver: true, damping: 18, stiffness: 240 }).start()
  }
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 240 }).start()
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable onPress={props.onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={styles.card}>
        <AccentBar />
        <View style={styles.cardIcon}>
          <Ionicons name={props.icon as any} size={18} color={TEXT} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{props.title}</Text>
          <Text style={styles.cardSubtitle}>{props.subtitle}</Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color="rgba(244,239,250,0.45)" />
      </Pressable>
    </Animated.View>
  )
})

export default function ExploreScreen() {
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)

  const sheetY = useRef(new Animated.Value(H)).current
  const overlayOpacity = useRef(new Animated.Value(0)).current

  const openSheet = () => {
    setSheetOpen(true)
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.spring(sheetY, { toValue: 0, damping: 18, stiffness: 190, useNativeDriver: true })
    ]).start()
  }

  const closeSheet = (cb?: () => void) => {
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(sheetY, { toValue: H, duration: 170, useNativeDriver: true })
    ]).start(({ finished }) => {
      if (finished) setSheetOpen(false)
      cb?.()
    })
  }

  const handleNavigate = (slug: string) => closeSheet(() => router.push(`/explore/${slug}`))

  const heroStats = useMemo(
    () => [
      { label: 'Fractal', value: 'infinite detail' },
      { label: 'Dimension', value: '2.73' },
      { label: 'Iterations', value: 'n' }
    ],
    []
  )

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ArchBackground />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={styles.topbar}>
          <Pressable onPress={openSheet} style={styles.brandBtn} android_ripple={{ color: 'rgba(255,255,255,0.08)' }}>
            <Text style={styles.brandMark}>racovita.</Text>
          </Pressable>

          <View style={styles.topbarRight}>
            <Pressable onPress={() => router.push('/explore/ce-este')} style={styles.iconBtn}>
              <Ionicons name="information-circle-outline" size={20} color={TEXT} />
            </Pressable>
            <Pressable onPress={openSheet} style={styles.iconBtn}>
              <Ionicons name="menu" size={18} color={TEXT} />
            </Pressable>
          </View>
        </View>

        <ArchNav active="/" />

        {/* Hero (editorial layout) */}
        <View style={styles.heroWrap}>
          {/* Left text */}
          <View style={styles.heroLeft}>
            <Text style={styles.kicker}>MENGER SPONGE</Text>

            {/* serif-like vibe: big quote */}
            <Text style={styles.heroQuote} numberOfLines={4}>
              We shape our cubes, there after they shape us
            </Text>

            <Text style={styles.heroSmall}>
              Cubes are cool.
            </Text>

            <View style={styles.heroCtas}>
              <Pressable onPress={() => handleNavigate('constructie-interactiva')} style={styles.ctaPrimary}>
                <Text style={styles.ctaPrimaryText}>Explore now</Text>
                <Ionicons name="arrow-forward" size={16} color="#120A16" />
              </Pressable>

              <Pressable onPress={() => handleNavigate('ce-este')} style={styles.ctaGhost}>
                <Text style={styles.ctaGhostText}>Learn basics</Text>
              </Pressable>
            </View>

            <View style={styles.statsRow}>
              {heroStats.map((s) => (
                <View key={s.label} style={styles.statPill}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Right collage */}
          <View style={styles.heroRight}>
            <View style={styles.collage}>
              <View style={[styles.photoCard, styles.photoA]}>
                <Image source={{ uri: FLOAT_IMG_1 }} style={styles.photoImg} resizeMode="cover" />
              </View>

              <View style={[styles.photoCard, styles.photoB]}>
                <Image source={{ uri: FLOAT_IMG_2 }} style={styles.photoImg} resizeMode="cover" />
              </View>

              <View style={[styles.photoCard, styles.photoC]}>
                <Image source={{ uri: FLOAT_IMG_3 }} style={styles.photoImg} resizeMode="cover" />
              </View>

              {/* floating mini panel */}
              <View style={styles.miniPanel}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <AccentDot />
                  <Text style={styles.miniTitle}>Curated modules</Text>
                </View>
                <Text style={styles.miniSub}>Math 🧊 3D 🧊 Gallery 🧊 Physics</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Explore header */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Explore</Text>
          <Pressable onPress={openSheet} style={styles.sectionAction}>
            <Text style={styles.sectionActionText}>All</Text>
            <Ionicons name="chevron-down" size={16} color="rgba(244,239,250,0.75)" />
          </Pressable>
        </View>

        {/* Explore list */}
        <View style={{ gap: 12 }}>
          {exploreItems.map((item) => (
            <ExploreCard
              key={item.slug}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              onPress={() => handleNavigate(item.slug)}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with 💘 by Strajan Andrei and Rus Vlad-Andrei</Text>
        </View>
      </ScrollView>

      {/* Bottom Sheet */}
      {sheetOpen ? (
        <View style={StyleSheet.absoluteFill}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => closeSheet()}>
            <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
          </Pressable>

          <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetY }] }]}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Navigate</Text>
              <Pressable onPress={() => closeSheet()} style={styles.sheetClose}>
                <Ionicons name="close" size={18} color={TEXT} />
              </Pressable>
            </View>

            <View style={{ gap: 10 }}>
              {exploreItems.map((item) => (
                <Pressable key={item.slug} onPress={() => handleNavigate(item.slug)} style={styles.sheetRow}>
                  <AccentBar />
                  <View style={styles.sheetRowIcon}>
                    <Ionicons name={item.icon as any} size={18} color={TEXT} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetRowTitle}>{item.title}</Text>
                    <Text style={styles.sheetRowSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="rgba(244,239,250,0.45)" />
                </Pressable>
              ))}
            </View>
          </Animated.View>
        </View>
      ) : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  content: { padding: 18, paddingBottom: 30 },


  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  brandBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999
  },
  brandMark: { color: TEXT, fontSize: 18, fontWeight: '900', letterSpacing: 0.2 },

  topbarRight: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center'
  },

  heroWrap: {
    flexDirection: 'row',
    gap: 14,
    borderRadius: 22,
    padding: 14,
    backgroundColor: PANEL_2,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    marginBottom: 18
  },

  heroLeft: { flex: 1.05, minHeight: 240 },
  heroRight: { flex: 0.95 },

  kicker: { color: MUTED, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  heroQuote: {
    color: TEXT,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 10,
    lineHeight: 34
  },
  heroSmall: { color: SUB, marginTop: 10, lineHeight: 20 },

  heroCtas: { flexDirection: 'row', gap: 10, marginTop: 14 },
  ctaPrimary: {
    flex: 1,
    backgroundColor: ACCENT,
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ctaPrimaryText: { color: '#120A16', fontWeight: '900' },
  ctaGhost: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: BORDER
  },
  ctaGhostText: { color: TEXT, fontWeight: '900' },

  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14, flexWrap: 'wrap' },
  statPill: {
    minWidth: 92,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: BORDER_SOFT
  },
  statValue: { color: TEXT, fontWeight: '900' },
  statLabel: { color: MUTED, marginTop: 4, fontSize: 12, fontWeight: '700' },

  collage: { height: 260, position: 'relative' },
  photoCard: {
    position: 'absolute',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: BORDER_SOFT
  },
  photoImg: { width: '100%', height: '100%' },

  photoA: { left: 0, top: 0, width: '68%', height: 150 },
  photoB: { right: 0, top: 30, width: '50%', height: 110 },
  photoC: { left: 14, bottom: 0, width: '60%', height: 120 },

  miniPanel: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '44%',
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(10, 8, 16, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)'
  },
  accentDot: { width: 8, height: 8, borderRadius: 8, backgroundColor: ACCENT_2 },
  miniTitle: { color: TEXT, fontWeight: '900' },
  miniSub: { color: MUTED, marginTop: 6, fontSize: 12, lineHeight: 16 },

  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  sectionTitle: { color: TEXT, fontSize: 20, fontWeight: '950' },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: BORDER
  },
  sectionActionText: { color: 'rgba(244,239,250,0.75)', fontWeight: '900', fontSize: 12 },

  accentBar: { width: 4, height: 40, borderRadius: 999, marginRight: 10, opacity: 0.95 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    backgroundColor: PANEL,
    borderWidth: 1,
    borderColor: BORDER_SOFT
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(216,180,254,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(216,180,254,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  cardTitle: { color: TEXT, fontWeight: '950', fontSize: 15 },
  cardSubtitle: { color: SUB, marginTop: 4, fontSize: 13, lineHeight: 18 },

  footer: { marginTop: 26, alignItems: 'center' },
  footerText: { color: MUTED, textAlign: 'center' },

  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: 'rgba(12, 9, 16, 0.90)',
    borderWidth: 1,
    borderColor: BORDER
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 54,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 12
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sheetTitle: { color: TEXT, fontSize: 16, fontWeight: '950' },
  sheetClose: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: BORDER_SOFT
  },
  sheetRowIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: 'rgba(216,180,254,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(216,180,254,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  sheetRowTitle: { color: TEXT, fontWeight: '950', fontSize: 14 },
  sheetRowSubtitle: { color: SUB, marginTop: 3, fontSize: 12 }
})

