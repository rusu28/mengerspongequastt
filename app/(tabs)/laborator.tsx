import React, { useEffect, useMemo, useState } from 'react'
import * as ReactNative from 'react-native'
import { ArchBackground, ARCH } from '@/components/arch-theme'
import { RuriNav } from '@/components/ruri-nav'

type Mode = 'carpet' | 'cantor' | 'triangle'
type Speed = 'slow' | 'normal' | 'fast'

const PREVIEW_SIZE = 280
const BG = ARCH.BG
const CARD = ARCH.PANEL
const ACCENT = ARCH.ACCENT

function useAnimateSteps(target: number, speed: Speed, trigger: number) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    setStep(0)
    if (target <= 0) return
    const delay = speed === 'slow' ? 700 : speed === 'fast' ? 200 : 400
    let current = 0
    const id = setInterval(() => {
      current += 1
      setStep(current)
      if (current >= target) clearInterval(id)
    }, delay)
    return () => clearInterval(id)
  }, [target, speed, trigger])
  return step
}

function generateCarpet(iter: number) {
  let squares = [{ x: 0, y: 0, size: 1 }]
  for (let i = 0; i < iter; i++) {
    const next: { x: number; y: number; size: number }[] = []
    for (const s of squares) {
      const third = s.size / 3
      for (let dx = 0; dx < 3; dx++) {
        for (let dy = 0; dy < 3; dy++) {
          if (dx === 1 && dy === 1) continue
          next.push({ x: s.x + dx * third, y: s.y + dy * third, size: third })
        }
      }
    }
    squares = next
  }
  return squares
}

function generateTrianglePoints(iter: number) {
  const a = { x: 0.1, y: 0.85 }
  const b = { x: 0.9, y: 0.85 }
  const c = { x: 0.5, y: 0.15 }
  const points: { x: number; y: number }[] = []
  let p = { x: 0.5, y: 0.5 }
  const steps = 500 + iter * 350
  for (let i = 0; i < steps; i++) {
    const target = [a, b, c][Math.floor(Math.random() * 3)]
    p = { x: (p.x + target.x) / 2, y: (p.y + target.y) / 2 }
    points.push(p)
  }
  return points
}

function generateCantor(iter: number) {
  let segments = [{ x: 0.05, width: 0.9, level: 0 }]
  for (let i = 0; i < iter; i++) {
    const next: { x: number; width: number; level: number }[] = []
    for (const s of segments) {
      const w = s.width / 3
      next.push({ x: s.x, width: w, level: s.level + 1 })
      next.push({ x: s.x + 2 * w, width: w, level: s.level + 1 })
    }
    segments = next
  }
  return segments
}

function ModePill({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <ReactNative.TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: active ? 'rgba(43,140,246,0.18)' : 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: active ? 'rgba(216,180,254,0.6)' : ARCH.BORDER_SOFT
      }}
    >
      <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '700' }}>{label}</ReactNative.Text>
    </ReactNative.TouchableOpacity>
  )
}

function SpeedPill({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <ReactNative.TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: active ? 'rgba(43,140,246,0.18)' : 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: active ? 'rgba(216,180,254,0.6)' : ARCH.BORDER_SOFT
      }}
    >
      <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '700' }}>{label}</ReactNative.Text>
    </ReactNative.TouchableOpacity>
  )
}

function Slider({ value, min = 0, max = 6, onChange }: { value: number; min?: number; max?: number; onChange: (n: number) => void }) {
  const [width, setWidth] = useState(0)
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n)))
  const handle = (x: number) => {
    if (!width) return
    const ratio = Math.min(1, Math.max(0, x / width))
    const next = min + ratio * (max - min)
    onChange(clamp(next))
  }
  const ratio = (value - min) / (max - min || 1)
  const knobLeft = width ? ratio * width : 0
  return (
    <ReactNative.View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onResponderGrant={(e) => handle(e.nativeEvent.locationX)}
      onResponderMove={(e) => handle(e.nativeEvent.locationX)}
      style={{ paddingVertical: 12, position: 'relative' }}
    >
      <ReactNative.View style={{ height: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)' }} />
      <ReactNative.View
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          width: knobLeft,
          height: 8,
          borderRadius: 999,
          backgroundColor: ACCENT,
          transform: [{ translateY: -4 }]
        }}
      />
      <ReactNative.View
        style={{
          position: 'absolute',
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: ACCENT,
          borderWidth: 2,
          borderColor: '#0c1520',
          left: Math.max(0, Math.min(knobLeft - 14, width ? width - 28 : 0)),
          top: '50%',
          transform: [{ translateY: -14 }],
          shadowColor: '#000',
          shadowOpacity: 0.35,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
          elevation: 6
        }}
      />
    </ReactNative.View>
  )
}

export default function LaboratorFractal() {
  const [mode, setMode] = useState<Mode>('carpet')
  const [iterations, setIterations] = useState(4)
  const [speed, setSpeed] = useState<Speed>('normal')
  const [trigger, setTrigger] = useState(0)
  const [performanceMode, setPerformanceMode] = useState(false)

  const effectiveIterations = performanceMode ? Math.min(iterations, 4) : iterations
  const step = useAnimateSteps(effectiveIterations, speed, trigger)

  const carpet = useMemo(() => generateCarpet(step), [step])
  const trianglePoints = useMemo(() => generateTrianglePoints(performanceMode ? Math.min(step, 4) : step), [step, performanceMode])
  const cantor = useMemo(() => generateCantor(step), [step])

  const displayIter = step

  const renderPreview = () => {
    if (mode === 'carpet') {
      return carpet.map((s, idx) => (
        <ReactNative.View
          key={idx}
          style={{
            position: 'absolute',
            left: s.x * PREVIEW_SIZE,
            top: s.y * PREVIEW_SIZE,
            width: s.size * PREVIEW_SIZE,
            height: s.size * PREVIEW_SIZE,
            backgroundColor: ACCENT
          }}
        />
      ))
    }
    if (mode === 'triangle') {
      return trianglePoints.map((p, idx) => (
        <ReactNative.View
          key={`${p.x}-${p.y}-${idx}`}
          style={{
            position: 'absolute',
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: ACCENT,
            left: p.x * PREVIEW_SIZE,
            top: p.y * PREVIEW_SIZE,
            opacity: 0.8
          }}
        />
      ))
    }
    return cantor.map((seg, idx) => (
      <ReactNative.View
        key={`${seg.x}-${seg.level}-${idx}`}
        style={{
          position: 'absolute',
          left: seg.x * PREVIEW_SIZE,
          top: (0.05 + seg.level * 0.07) * PREVIEW_SIZE,
          width: seg.width * PREVIEW_SIZE,
          height: 0.05 * PREVIEW_SIZE,
          borderRadius: 6,
          backgroundColor: ACCENT
        }}
      />
    ))
  }

  return (
    <ReactNative.View style={{ flex: 1, backgroundColor: BG }}>
      <ReactNative.StatusBar barStyle="light-content" />
      <ArchBackground />
      <ReactNative.ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <ReactNative.View style={{ paddingHorizontal: 20, paddingTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <ReactNative.Text style={{ color: ARCH.TEXT, fontSize: 26, fontWeight: '800' }}>Fractal Lab</ReactNative.Text>
          <ReactNative.View style={{ flexDirection: 'row', gap: 12 }}>
            <ReactNative.TouchableOpacity style={{ padding: 8 }}>
              <ReactNative.Text style={{ color: ARCH.TEXT }}>===</ReactNative.Text>
            </ReactNative.TouchableOpacity>
            <ReactNative.TouchableOpacity style={{ padding: 8 }}>
              <ReactNative.Text style={{ color: ARCH.TEXT }}>{'->'}</ReactNative.Text>
            </ReactNative.TouchableOpacity>
          </ReactNative.View>
        </ReactNative.View>
        <ReactNative.View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <RuriNav />
        </ReactNative.View>

        <ReactNative.View style={{ alignItems: 'center', marginTop: 24 }}>
          <ReactNative.View
            style={{
              width: PREVIEW_SIZE,
              height: PREVIEW_SIZE,
              borderRadius: 12,
              backgroundColor: ARCH.PANEL_2,
              borderWidth: 1,
              borderColor: 'rgba(216,180,254,0.6)',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {renderPreview()}
          </ReactNative.View>
          <ReactNative.Text style={{ color: ARCH.TEXT, fontSize: 20, fontWeight: '800', marginTop: 18 }}>Fractal Lab</ReactNative.Text>
          <ReactNative.Text style={{ color: ARCH.SUB, textAlign: 'center', marginTop: 6 }}>
            Pick a fractal and tap "Generate" to start
          </ReactNative.Text>
        </ReactNative.View>

        <ReactNative.View
          style={{
            marginTop: 24,
            backgroundColor: CARD,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 18,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)'
          }}
        >
          <ReactNative.View style={{ alignItems: 'center', marginBottom: 12 }}>
            <ReactNative.View style={{ width: 60, height: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)' }} />
          </ReactNative.View>
          <ReactNative.View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <ReactNative.Text style={{ color: ARCH.TEXT, fontSize: 18, fontWeight: '800' }}>Settings</ReactNative.Text>
            <ReactNative.TouchableOpacity style={{ padding: 8 }}>
              <ReactNative.Text style={{ color: ARCH.SUB }}>i</ReactNative.Text>
            </ReactNative.TouchableOpacity>
          </ReactNative.View>

          <ReactNative.View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            <ModePill active={mode === 'carpet'} label="Sierpinski Carpet" onPress={() => setMode('carpet')} />
            <ModePill active={mode === 'cantor'} label="Cantor Set" onPress={() => setMode('cantor')} />
            <ModePill active={mode === 'triangle'} label="Triangle" onPress={() => setMode('triangle')} />
          </ReactNative.View>

          <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '700', marginBottom: 4 }}>
            Detail level (iterations): {effectiveIterations}
          </ReactNative.Text>
          <Slider value={iterations} min={0} max={6} onChange={setIterations} />
          {performanceMode ? (
            <ReactNative.Text style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 10 }}>
              Performance mode active: iterations are capped for smoother rendering.
            </ReactNative.Text>
          ) : null}

          <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '700', marginTop: 6, marginBottom: 8 }}>Animation speed</ReactNative.Text>
          <ReactNative.View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
            <SpeedPill active={speed === 'slow'} label="Slow" onPress={() => setSpeed('slow')} />
            <SpeedPill active={speed === 'normal'} label="Normal" onPress={() => setSpeed('normal')} />
            <SpeedPill active={speed === 'fast'} label="Fast" onPress={() => setSpeed('fast')} />
          </ReactNative.View>

          <ReactNative.View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '700' }}>Performance mode</ReactNative.Text>
            <ReactNative.TouchableOpacity
              onPress={() => setPerformanceMode((s) => !s)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: performanceMode ? 'rgba(43,140,246,0.25)' : 'rgba(255,255,255,0.05)',
                borderWidth: 1,
                borderColor: performanceMode ? 'rgba(216,180,254,0.6)' : ARCH.BORDER_SOFT
              }}
            >
              <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '700' }}>{performanceMode ? 'On' : 'Off'}</ReactNative.Text>
            </ReactNative.TouchableOpacity>
          </ReactNative.View>

          <ReactNative.TouchableOpacity
            onPress={() => setTrigger((t) => t + 1)}
            style={{
              backgroundColor: ACCENT,
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
              marginTop: 4
            }}
          >
            <ReactNative.Text style={{ color: ARCH.TEXT, fontWeight: '800', fontSize: 16 }}>Generate</ReactNative.Text>
          </ReactNative.TouchableOpacity>

          <ReactNative.Text style={{ color: 'rgba(255,255,255,0.65)', textAlign: 'center', marginTop: 12 }}>
            Current iteration: {displayIter}
          </ReactNative.Text>
        </ReactNative.View>
      </ReactNative.ScrollView>
    </ReactNative.View>
  )
}



