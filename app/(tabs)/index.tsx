import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import * as ReactNative from 'react-native'

const SCREEN_PADDING = 18
const CARD_BG = '#111c27'
const EMPHASIS = '#2b8cf6'
const HERO_IMAGE =
  'https://i.ytimg.com/vi/fWsmq9E4YC0/maxresdefault.jpg'

const exploreItems = [
  { title: 'What is it?', subtitle: 'A detailed explanation', icon: '?', slug: 'ce-este' },
  { title: 'Interactive Build', subtitle: 'Model it in 3D', icon: '[3D]', slug: 'constructie-interactiva' },
  { title: 'Math Properties', subtitle: 'Area and volume', icon: '[fx]', slug: 'proprietati-matematice' },
  { title: 'Gallery', subtitle: 'Images and animations', icon: '[img]', slug: 'galerie' },
  { title: 'Physical Properties', subtitle: 'Light, sound, heat, flow', icon: '[phys]', slug: 'proprietati-fizice' }
]

export default function ExploreScreen() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleNavigate = (slug: string) => {
    setMenuOpen(false)
    router.push(`/explore/${slug}`)
  }

  return (
    <ReactNative.View style={{ flex: 1, backgroundColor: '#0c1520' }}>
      <ReactNative.StatusBar barStyle="light-content" />
      <ReactNative.ScrollView
        contentContainerStyle={{
          padding: SCREEN_PADDING,
          paddingBottom: 32 + SCREEN_PADDING
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ReactNative.View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <ReactNative.TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setMenuOpen((o) => !o)}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <ReactNative.View style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.06)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)'
            }}>
              <ReactNative.Text style={{ color: '#f6f8ff', fontSize: 18 }}>[]</ReactNative.Text>
            </ReactNative.View>
            <ReactNative.Text style={{ color: '#f2f6ff', fontSize: 18, fontWeight: '800' }}>Menger Sponge</ReactNative.Text>
          </ReactNative.TouchableOpacity>
          <ReactNative.View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.08)',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.12)'
          }}>
            <ReactNative.Text style={{ color: '#f2f6ff', fontWeight: '700', fontSize: 16 }}>i</ReactNative.Text>
          </ReactNative.View>
        </ReactNative.View>

        {/* Hero image */}
        <ReactNative.View style={{
          borderRadius: 18,
          overflow: 'hidden',
          backgroundColor: '#101924',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.06)',
          marginBottom: 22,
          shadowColor: '#000',
          shadowOpacity: 0.35,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
          elevation: 10
        }}>
          <ReactNative.Image
            source={{ uri: HERO_IMAGE }}
            resizeMode="cover"
            style={{ width: '100%', aspectRatio: 16 / 9, minHeight: 180, maxHeight: 260 }}
          />
          <ReactNative.View style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.12)'
          }} />
        </ReactNative.View>

        {/* Hero text */}
        <ReactNative.View style={{ paddingHorizontal: 4, marginBottom: 20 }}>
          <ReactNative.Text style={{ color: '#f6f8ff', fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 10 }}>
            Discover an Infinite Fractal
          </ReactNative.Text>
          <ReactNative.Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, textAlign: 'center', lineHeight: 22 }}>
            Explore the endless complexity and fascinating properties of the Menger Sponge, a remarkable mathematical object.
          </ReactNative.Text>
        </ReactNative.View>

        {/* Explore list */}
        <ReactNative.Text style={{ color: '#f2f6ff', fontSize: 20, fontWeight: '800', marginBottom: 12 }}>Explore</ReactNative.Text>
        <ReactNative.View style={{ gap: 12 }}>
          {exploreItems.map((item, idx) => (
            <ReactNative.TouchableOpacity
              key={item.title}
              activeOpacity={0.9}
              onPress={() => handleNavigate(item.slug)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: CARD_BG,
                padding: 14,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.05)',
                shadowColor: '#000',
                shadowOpacity: 0.25,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 6 },
                elevation: 6
              }}
            >
              <ReactNative.View style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                backgroundColor: 'rgba(43,140,246,0.12)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
                borderWidth: 1,
                borderColor: 'rgba(43,140,246,0.35)'
              }}>
                <ReactNative.Text style={{ fontSize: 16, color: EMPHASIS }}>{item.icon}</ReactNative.Text>
              </ReactNative.View>
              <ReactNative.View style={{ flex: 1 }}>
                <ReactNative.Text style={{ color: '#f6f8ff', fontSize: 16, fontWeight: '800' }}>{item.title}</ReactNative.Text>
                <ReactNative.Text style={{ color: 'rgba(255,255,255,0.68)', marginTop: 4 }}>{item.subtitle}</ReactNative.Text>
              </ReactNative.View>
              <ReactNative.Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }}>{'>'}</ReactNative.Text>
            </ReactNative.TouchableOpacity>
          ))}
        </ReactNative.View>

        <ReactNative.View style={{ marginTop: 32, alignItems: 'center' }}>
          <ReactNative.Text style={{ color: 'rgba(255,255,255,0.55)' }}>(c) 2024 Menger Sponge. All rights reserved.</ReactNative.Text>
        </ReactNative.View>
      </ReactNative.ScrollView>

      {menuOpen ? (
        <>
          <ReactNative.TouchableWithoutFeedback onPress={() => setMenuOpen(false)}>
            <ReactNative.View style={{ position: 'absolute', inset: 0 }} />
          </ReactNative.TouchableWithoutFeedback>
          <ReactNative.View style={{
            position: 'absolute',
            top: 80,
            left: SCREEN_PADDING,
            right: SCREEN_PADDING,
            backgroundColor: '#0f1b29',
            borderRadius: 14,
            padding: 12,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            shadowColor: '#000',
            shadowOpacity: 0.35,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 8 },
            elevation: 16
          }}>
            {exploreItems.map((item, idx) => (
              <ReactNative.TouchableOpacity
                key={item.slug}
                onPress={() => handleNavigate(item.slug)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderBottomWidth: idx === exploreItems.length - 1 ? 0 : 1,
                  borderColor: 'rgba(255,255,255,0.06)'
                }}
              >
                <ReactNative.Text style={{ color: EMPHASIS, marginRight: 10 }}>{item.icon}</ReactNative.Text>
                <ReactNative.View style={{ flex: 1 }}>
                  <ReactNative.Text style={{ color: '#f6f8ff', fontWeight: '700' }}>{item.title}</ReactNative.Text>
                  <ReactNative.Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{item.subtitle}</ReactNative.Text>
                </ReactNative.View>
                <ReactNative.Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 18 }}>{'>'}</ReactNative.Text>
              </ReactNative.TouchableOpacity>
            ))}
          </ReactNative.View>
        </>
      ) : null}
    </ReactNative.View>
  )
}
