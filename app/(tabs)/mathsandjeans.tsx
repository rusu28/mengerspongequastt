import 'katex/dist/katex.min.css'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as RN from 'react-native'
import Latex from 'react-latex-next'

/**
 * UI constants
 */
import { ArchBackground, ARCH } from '@/components/arch-theme'
import { RuriNav } from '@/components/ruri-nav'

const BG = ARCH.BG
const BOARD = ARCH.PANEL
const INK = ARCH.TEXT
const SUB = ARCH.SUB
const ACCENT = ARCH.ACCENT

/**
 * Helpers: numbers
 */
function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}
function fmt(x: number, digits = 6) {
  if (!Number.isFinite(x)) return 'NaN'
  // keep it readable
  const d = clamp(digits, 0, 12)
  const fixed = x.toFixed(d)
  if (d === 0) return fixed
  return fixed.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')
}
function pow(a: number, b: number) {
  return Math.pow(a, b)
}
function ln(x: number) {
  return Math.log(x)
}

/**
 * Step model: render text and math cleanly
 */
type Step =
  | { type: 'h1'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'text'; text: string }
  | { type: 'math'; latex: string }
  | { type: 'spacer' }

type FormulaDoc = {
  key: string
  title: string
  steps: (ctx: Ctx) => Step[]
}

/**
 * Parameters / context for generation
 */
type Ctx = {
  n: number

  // optional “physics-ish” params used by some formulas
  k0: number // base conductivity factor
  deltaT: number
  mu: number
  L0: number
  I0: number
  scatterK: number

  // derived
  N: number
  l: number
  V: number
  Vremoved: number
  A: number
  A_over_V: number
  D: number
  rho: number
  phi: number
  holes: number
  holesTot: number
  kEff: number
  REff: number
  Lopt: number
  T: number
  Iout: number
  PhiHeat: number
}

function buildCtx(n: number, params: Partial<Omit<Ctx, 'n'>> = {}): Ctx {
  // Base parameters (change them whenever you want)
  const k0 = params.k0 ?? 1
  const deltaT = params.deltaT ?? 1
  const mu = params.mu ?? 0.12
  const L0 = params.L0 ?? 1
  const I0 = params.I0 ?? 1
  const scatterK = params.scatterK ?? 0.05

  // Menger sponge core
  const N = pow(20, n)
  const l = pow(1 / 3, n)
  const V = pow(20 / 27, n)
  const Vremoved = 1 - V
  const A = 6 * pow(20 / 9, n)
  const A_over_V = A / V
  const D = ln(20) / ln(3)

  // “interpretări” folosite în listele tale
  const rho = V
  const phi = 1 - V

  // holes: la primul pas apar 7 goluri; apoi fiecare cub “rămas” produce 7 goluri noi
  const nInt = Math.round(n)
  const holes = nInt <= 0 ? 0 : 7 * pow(20, nInt - 1)
  const holesTot = nInt <= 0 ? 0 : 7 * ((pow(20, nInt) - 1) / (20 - 1))

  // example scalings
  const kEff = k0 * V
  const REff = pow(3 / 20, n) // just scaling (unitless unless you define R0)
  const Lopt = L0 * pow(3, n)

  const T = Math.exp(-mu * Lopt)
  const Iout = I0 / (1 + scatterK * A)
  const PhiHeat = kEff * A * (deltaT / l)

  return {
    n,
    k0,
    deltaT,
    mu,
    L0,
    I0,
    scatterK,
    N,
    l,
    V,
    Vremoved,
    A,
    A_over_V,
    D,
    rho,
    phi,
    holes,
    holesTot,
    kEff,
    REff,
    Lopt,
    T,
    Iout,
    PhiHeat
  }
}

/**
 * A “math block” renderer that looks good:
 * - separate View for math
 * - spacing
 * - keeps KaTeX from getting cramped inside <Text>
 */
function MathBlock({ latex }: { latex: string }) {
  // IMPORTANT: react-latex-next expects something like "$$ ... $$" inside.
  const content = latex.trim().startsWith('$$') ? latex : `$$${latex}$$`
  return (
    <RN.View style={{ marginVertical: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, backgroundColor: 'rgba(110,231,255,0.06)', borderWidth: 1, borderColor: 'rgba(110,231,255,0.18)' }}>
      {/* Wrap Latex in a View; avoid nesting inside RN.Text */}
      {/* On web via RN-web it will render KaTeX nicely */}
      {/* If you are on native, consider the note at the bottom */}
      <Latex>{content}</Latex>
    </RN.View>
  )
}

function TextLine({ children }: { children: React.ReactNode }) {
  return (
    <RN.Text style={{ color: INK, fontSize: 15, lineHeight: 22 }}>
      {children}
    </RN.Text>
  )
}

/**
 * Formula docs: each one generates “from 0” steps.
 * They all use ctx, so numbers update automatically.
 */
const DOCS: FormulaDoc[] = [
  {
    key: 'values',
    title: 'Formula values (generated)',
    steps: (c) => [
      { type: 'h1', text: `Menger Sponge @ n=${c.n}` },
      { type: 'text', text: 'Toate valorile de mai jos sunt generate din definiții.' },
      { type: 'spacer' },

      { type: 'h2', text: 'Core geometry' },
      { type: 'math', latex: `N = 20^n = 20^{${c.n}} = ${fmt(c.N, 0)}` },
      { type: 'math', latex: `l_n = 3^{-n} = 3^{-${c.n}} = ${fmt(c.l, 6)}` },
      { type: 'math', latex: `V_n = \\left(\\frac{20}{27}\\right)^n = \\left(\\frac{20}{27}\\right)^{${c.n}} = ${fmt(c.V, 6)}` },
      { type: 'math', latex: `V_{removed} = 1 - V_n = ${fmt(c.Vremoved, 6)}` },
      { type: 'math', latex: `A_n = 6\\left(\\frac{20}{9}\\right)^n = ${fmt(c.A, 6)}` },
      { type: 'math', latex: `\\frac{A}{V} = ${fmt(c.A_over_V, 6)}` },
      { type: 'math', latex: `D = \\frac{\\log 20}{\\log 3} = ${fmt(c.D, 6)}` },

      { type: 'spacer' },
      { type: 'h2', text: 'Derived / physical scalings (example)' },
      { type: 'math', latex: `\\rho = V_n = ${fmt(c.rho, 6)}` },
      { type: 'math', latex: `\\phi = 1 - V_n = ${fmt(c.phi, 6)}` },
      { type: 'math', latex: c.n <= 0 ? `H_n = 0` : `H_n = 7\\cdot 20^{n-1} = ${fmt(c.holes, 0)}` },
      { type: 'math', latex: `H_{tot} = 7\\sum_{k=0}^{n-1}20^k = ${fmt(c.holesTot, 0)}` },
      { type: 'math', latex: `k_{eff} = k_0\\,V_n = ${fmt(c.kEff, 6)}` },
      { type: 'math', latex: `R_{eff}\\sim \\left(\\frac{3}{20}\\right)^n = ${fmt(c.REff, 8)}` },
      { type: 'math', latex: `L_{opt} = L_0\\,3^n = ${fmt(c.Lopt, 6)}` },
      { type: 'math', latex: `T = e^{-\\mu L_{opt}} = ${fmt(c.T, 6)}` },
      { type: 'math', latex: `I_{out} = \\frac{I_0}{1 + kA} = ${fmt(c.Iout, 6)}` },
      { type: 'math', latex: `\\Phi = k_{eff}\\,A\\,\\frac{\\Delta T}{l_n} = ${fmt(c.PhiHeat, 6)}` }
    ]
  },

  {
    key: 'cubes',
    title: '1) Cubes count (N = 20^n)',
    steps: (c) => [
      { type: 'h1', text: 'Cubes count' },
      { type: 'text', text: 'Definiție (Menger Sponge): La fiecare iterație împarți cubul în 3×3×3 = 27 sub-cuburi egale și păstrezi 20.' },
      { type: 'spacer' },

      { type: 'h2', text: 'Step 1 — recurrence' },
      { type: 'math', latex: `N_0 = 1` },
      { type: 'text', text: 'La fiecare pas, fiecare cub rămas generează 20 cuburi noi (cele păstrate).' },
      { type: 'math', latex: `N_n = 20\\,N_{n-1}` },

      { type: 'spacer' },
      { type: 'h2', text: 'Step 2 — closed form' },
      { type: 'text', text: 'Desfaci recurența:' },
      { type: 'math', latex: `N_n = 20\\,N_{n-1} = 20\\cdot 20\\,N_{n-2} = \\cdots = 20^n N_0` },
      { type: 'math', latex: `\\Rightarrow N_n = 20^n` },

      { type: 'spacer' },
      { type: 'h2', text: 'Evaluate' },
      { type: 'math', latex: `n=${c.n}\\Rightarrow N=20^{${c.n}}=${fmt(c.N, 0)}` }
    ]
  },

  {
    key: 'edge',
    title: '2) Edge length (l = 3^{-n})',
    steps: (c) => [
      { type: 'h1', text: 'Edge length' },
      { type: 'text', text: 'La fiecare iterație, pe fiecare axă împarți lungimea la 3.' },
      { type: 'spacer' },

      { type: 'h2', text: 'Recurrence' },
      { type: 'math', latex: `l_0 = 1` },
      { type: 'math', latex: `l_n = \\frac{1}{3}l_{n-1}` },

      { type: 'spacer' },
      { type: 'h2', text: 'Closed form' },
      { type: 'math', latex: `l_n = \\left(\\frac{1}{3}\\right)^n = 3^{-n}` },

      { type: 'spacer' },
      { type: 'h2', text: 'Evaluate' },
      { type: 'math', latex: `n=${c.n}\\Rightarrow l=${fmt(c.l, 6)}` }
    ]
  },

  {
    key: 'volume',
    title: '3) Volume (V = (20/27)^n)',
    steps: (c) => [
      { type: 'h1', text: 'Volume' },
      { type: 'text', text: 'Într-o împărțire 3×3×3 ai 27 sub-cuburi egale. Păstrezi 20. Volumul scade cu factor 20/27 la fiecare pas.' },
      { type: 'spacer' },

      { type: 'h2', text: 'Recurrence' },
      { type: 'math', latex: `V_0 = 1` },
      { type: 'math', latex: `V_n = \\frac{20}{27}V_{n-1}` },

      { type: 'spacer' },
      { type: 'h2', text: 'Closed form' },
      { type: 'math', latex: `V_n = \\left(\\frac{20}{27}\\right)^n` },

      { type: 'spacer' },
      { type: 'h2', text: 'Evaluate' },
      { type: 'math', latex: `n=${c.n}\\Rightarrow V=${fmt(c.V, 6)}` }
    ]
  },

  {
    key: 'removed',
    title: '4) Removed volume (1 − V)',
    steps: (c) => [
      { type: 'h1', text: 'Removed volume' },
      { type: 'text', text: 'Dacă pornești cu volum 1, volumul scos este ce lipsește din 1.' },
      { type: 'spacer' },
      { type: 'math', latex: `V_{removed} = 1 - V_n` },
      { type: 'math', latex: `= 1 - \\left(\\frac{20}{27}\\right)^n` },
      { type: 'spacer' },
      { type: 'math', latex: `n=${c.n}\\Rightarrow V_{removed}=${fmt(c.Vremoved, 6)}` }
    ]
  },

  {
    key: 'area',
    title: '5) Surface area (A = 6(20/9)^n)',
    steps: (c) => [
      { type: 'h1', text: 'Surface area' },
      { type: 'text', text: 'Rezultatul clasic pentru Menger Sponge: aria se multiplică cu 20/9 la fiecare iterație.' },
      { type: 'text', text: 'Intuiție: fiecare cub rămas are latura /3 ⇒ aria unui cub scade cu /9, dar ai 20 cuburi.' },
      { type: 'spacer' },

      { type: 'h2', text: 'Scale per iteration' },
      { type: 'math', latex: `\\text{(număr cuburi)} \\times \\text{(aria unui cub)} \\sim 20 \\times \\frac{1}{9} = \\frac{20}{9}` },

      { type: 'spacer' },
      { type: 'h2', text: 'Recurrence' },
      { type: 'math', latex: `A_0 = 6` },
      { type: 'math', latex: `A_n = \\frac{20}{9}A_{n-1}` },

      { type: 'spacer' },
      { type: 'h2', text: 'Closed form' },
      { type: 'math', latex: `A_n = 6\\left(\\frac{20}{9}\\right)^n` },

      { type: 'spacer' },
      { type: 'h2', text: 'Evaluate' },
      { type: 'math', latex: `n=${c.n}\\Rightarrow A=${fmt(c.A, 6)}` }
    ]
  },

  {
    key: 'ratio',
    title: '6) Surface/Volume ratio (A/V)',
    steps: (c) => [
      { type: 'h1', text: 'Surface / Volume ratio' },
      { type: 'text', text: 'Folosind formele închise pentru A și V:' },
      { type: 'spacer' },
      { type: 'math', latex: `\\frac{A_n}{V_n} = \\frac{6\\left(\\frac{20}{9}\\right)^n}{\\left(\\frac{20}{27}\\right)^n}` },
      { type: 'math', latex: `= 6\\left(\\frac{20}{9}\\cdot\\frac{27}{20}\\right)^n` },
      { type: 'math', latex: `= 6\\left(3\\right)^n = 6\\cdot 3^n` },
      { type: 'spacer' },
      { type: 'math', latex: `n=${c.n}\\Rightarrow \\frac{A}{V}=6\\cdot 3^{${c.n}}=${fmt(6 * pow(3, c.n), 0)}` }
    ]
  },

  {
    key: 'dimension',
    title: '8) Fractal dimension (log 20 / log 3)',
    steps: (c) => [
      { type: 'h1', text: 'Fractal dimension' },
      { type: 'text', text: 'Dimensiunea fractală D pentru self-similaritate: N = r^{-D}, unde r este factorul de scalare pe lungime.' },
      { type: 'spacer' },
      { type: 'math', latex: `r = \\frac{1}{3}` },
      { type: 'math', latex: `N = 20` },
      { type: 'math', latex: `20 = \\left(\\frac{1}{3}\\right)^{-D} = 3^D` },
      { type: 'math', latex: `D = \\frac{\\log 20}{\\log 3}` },
      { type: 'spacer' },
      { type: 'math', latex: `D \\approx ${fmt(c.D, 6)}` }
    ]
  },

  {
    key: 'holes',
    title: '10) Holes (H = 7·20^{n−1})',
    steps: (c) => [
      { type: 'h1', text: 'Holes per iteration' },
      { type: 'text', text: 'La prima iterație scoți 7 sub-cuburi (centrul + cele 6 centre de fețe). Asta creează 7 goluri.' },
      { type: 'text', text: 'La iterația următoare, fiecare din cele 20 cuburi păstrate creează încă 7 goluri, etc.' },
      { type: 'spacer' },
      { type: 'math', latex: `H_0 = 0` },
      { type: 'math', latex: `H_1 = 7` },
      { type: 'math', latex: `H_n = 7\\cdot 20^{n-1}\\quad (n\\ge 1)` },
      { type: 'spacer' },
      { type: 'math', latex: `n=${c.n}\\Rightarrow H=${fmt(c.holes, 0)}` }
    ]
  },

  {
    key: 'total-holes',
    title: '11) Total holes (geometric sum)',
    steps: (c) => [
      { type: 'h1', text: 'Total holes' },
      { type: 'text', text: 'Totalul până la iterația n este suma geometrică a golurilor noi create la fiecare pas.' },
      { type: 'spacer' },
      { type: 'math', latex: `H_{tot} = \\sum_{i=1}^{n} 7\\cdot 20^{i-1}` },
      { type: 'math', latex: `= 7\\sum_{k=0}^{n-1}20^k` },
      { type: 'math', latex: `= 7\\cdot\\frac{20^n-1}{20-1}` },
      { type: 'spacer' },
      { type: 'math', latex: `n=${c.n}\\Rightarrow H_{tot}=${fmt(c.holesTot, 0)}` }
    ]
  },

  {
    key: 'heat',
    title: '21) Heat flux (Φ = k_eff A ΔT / l)',
    steps: (c) => [
      { type: 'h1', text: 'Heat flux' },
      { type: 'text', text: 'Pornești din legea lui Fourier (formă 1D): flux ∼ k·A·ΔT/L.' },
      { type: 'spacer' },
      { type: 'math', latex: `\\Phi = k\\,A\\,\\frac{\\Delta T}{L}` },
      { type: 'text', text: 'Pentru Menger, folosești:' },
      { type: 'math', latex: `k_{eff} = k_0\\,V_n` },
      { type: 'math', latex: `A = A_n` },
      { type: 'math', latex: `L = l_n` },
      { type: 'spacer' },
      { type: 'math', latex: `\\Rightarrow \\Phi = k_{eff}\\,A\\,\\frac{\\Delta T}{l_n}` },
      { type: 'spacer' },
      { type: 'math', latex: `n=${c.n}\\Rightarrow \\Phi=${fmt(c.PhiHeat, 6)}` }
    ]
  }
]

/**
 * Main component
 */
export default function MathsAndJeans() {
  // Change n here (or add a slider)
  const [n, setN] = useState(2)

  const ctx = useMemo(
    () =>
      buildCtx(n, {
        // you can tweak these defaults:
        k0: 1,
        deltaT: 1,
        mu: 0.12,
        L0: 1,
        I0: 1,
        scatterK: 0.05
      }),
    [n]
  )

  const [selectedKey, setSelectedKey] = useState(DOCS[0].key)
  const selected = useMemo(() => DOCS.find((d) => d.key === selectedKey) ?? DOCS[0], [selectedKey])
  const steps = useMemo(() => selected.steps(ctx), [selected, ctx])

  // step-by-step reveal
  const [visible, setVisible] = useState(0)
  const [paused, setPaused] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setVisible(0)
    setPaused(false)
  }, [selectedKey, n])

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    if (paused) return

    const tick = () => {
      setVisible((v) => {
        const next = v + 1
        if (next >= steps.length) return steps.length
        return next
      })
    }

    const current = steps[visible]
    let delay = 180
    if (!current) delay = 180
    else if (current.type === 'spacer') delay = 80
    else if (current.type === 'math') delay = 260
    else if (current.type === 'h1') delay = 220
    else if (current.type === 'h2') delay = 200
    else delay = 170

    if (visible < steps.length) timer.current = setTimeout(tick, delay)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [paused, visible, steps])

  const reset = () => {
    setVisible(0)
    setPaused(false)
  }
  const skip = () => {
    setVisible(steps.length)
    setPaused(true)
  }

  return (
    <RN.View style={{ flex: 1, backgroundColor: BG }}>
      <ArchBackground />
      <RN.View
        pointerEvents="none"
        style={{
          ...RN.StyleSheet.absoluteFillObject,
          opacity: 0.2,
          backgroundColor: 'transparent',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.08)'
        }}
      />
      {/* blobs */}
      <RN.View style={{ position: 'absolute', top: -140, left: -60, width: 280, height: 280, borderRadius: 999, backgroundColor: '#141414', opacity: 0.7 }} />
      <RN.View style={{ position: 'absolute', bottom: -160, right: -80, width: 320, height: 320, borderRadius: 999, backgroundColor: '#101010', opacity: 0.8 }} />

      <RN.View style={{ paddingHorizontal: 18, paddingTop: 26, paddingBottom: 10 }}>
        <RuriNav />
        <RN.Text style={{ color: INK, fontSize: 20, fontWeight: '800', marginTop: 12 }}>Cubes Laborator Maths Lab</RN.Text>
        <RN.Text style={{ color: SUB, marginTop: 4 }}>Menger Sponge generator + demonstratii "from 0"</RN.Text>

        {/* n controller */}
        <RN.View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}>
          <RN.Text style={{ color: SUB, fontWeight: '700' }}>n:</RN.Text>
          <RN.TouchableOpacity
            onPress={() => setN((x) => Math.max(0, x - 1))}
            style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: ARCH.BORDER }}
          >
            <RN.Text style={{ color: INK, fontWeight: '800' }}>−</RN.Text>
          </RN.TouchableOpacity>
          <RN.View style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: ARCH.BORDER_SOFT }}>
            <RN.Text style={{ color: INK, fontWeight: '800' }}>{n}</RN.Text>
          </RN.View>
          <RN.TouchableOpacity
            onPress={() => setN((x) => Math.min(8, x + 1))}
            style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: ARCH.BORDER }}
          >
            <RN.Text style={{ color: INK, fontWeight: '800' }}>+</RN.Text>
          </RN.TouchableOpacity>

          <RN.Text style={{ color: SUB, marginLeft: 6 }}>(0-8)</RN.Text>
        </RN.View>
      </RN.View>

      <RN.View style={{ flex: 1, paddingHorizontal: 14, paddingBottom: 16, flexDirection: 'row', gap: 12 }}>
        {/* left menu */}
        <RN.View style={{ width: 170 }}>
          <RN.Text style={{ color: '#b9d7ff', fontWeight: '700', marginBottom: 8 }}>Formulas</RN.Text>
          <RN.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
            {DOCS.map((d) => {
              const active = d.key === selectedKey
              return (
                <RN.TouchableOpacity
                  key={d.key}
                  onPress={() => setSelectedKey(d.key)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    borderRadius: 12,
                    marginBottom: 8,
                    backgroundColor: active ? 'rgba(56,189,248,0.18)' : 'rgba(15,26,38,0.7)',
                    borderWidth: 1,
                    borderColor: active ? 'rgba(56,189,248,0.7)' : 'rgba(255,255,255,0.08)'
                  }}
                >
                  <RN.Text style={{ color: active ? '#e0f2ff' : '#c9d6ea', fontSize: 12, fontWeight: '700' }}>
                    {d.title}
                  </RN.Text>
                </RN.TouchableOpacity>
              )
            })}
          </RN.ScrollView>
        </RN.View>

        {/* board */}
        <RN.View style={{ flex: 1 }}>
          <RN.View
            style={{
              flex: 1,
              backgroundColor: BOARD,
              borderRadius: 18,
              padding: 16,
              borderWidth: 1,
              borderColor: 'rgba(160,230,190,0.15)',
              shadowColor: '#000',
              shadowOpacity: 0.35,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 6 },
              elevation: 6
            }}
          >
            <RN.View style={{ position: 'absolute', top: 12, right: 14, width: 70, height: 6, borderRadius: 4, backgroundColor: 'rgba(170,220,190,0.2)' }} />

            <RN.ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
              {steps.slice(0, visible).map((s, idx) => {
                if (s.type === 'spacer') return <RN.View key={idx} style={{ height: 10 }} />
                if (s.type === 'h1')
                  return (
                    <RN.Text key={idx} style={{ color: '#eaf1ff', fontSize: 18, fontWeight: '900', marginBottom: 8 }}>
                      {s.text}
                    </RN.Text>
                  )
                if (s.type === 'h2')
                  return (
                    <RN.Text key={idx} style={{ color: '#b9d7ff', fontSize: 14, fontWeight: '900', marginTop: 10, marginBottom: 6 }}>
                      {s.text}
                    </RN.Text>
                  )
                if (s.type === 'text')
                  return (
                    <RN.View key={idx} style={{ marginBottom: 6 }}>
                      <TextLine>{s.text}</TextLine>
                    </RN.View>
                  )
                if (s.type === 'math') return <MathBlock key={idx} latex={s.latex} />
                return null
              })}
            </RN.ScrollView>

            <RN.View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <RN.TouchableOpacity
                onPress={() => setPaused((p) => !p)}
                style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: paused ? '#111c2f' : ACCENT }}
              >
                <RN.Text style={{ color: '#fff', fontWeight: '800' }}>{paused ? 'Resume' : 'Pause'}</RN.Text>
              </RN.TouchableOpacity>

              <RN.TouchableOpacity
                onPress={reset}
                style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: '#111c2f' }}
              >
                <RN.Text style={{ color: '#fff', fontWeight: '800' }}>Replay</RN.Text>
              </RN.TouchableOpacity>

              <RN.TouchableOpacity
                onPress={skip}
                style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: '#111c2f' }}
              >
                <RN.Text style={{ color: '#fff', fontWeight: '800' }}>Skip</RN.Text>
              </RN.TouchableOpacity>
            </RN.View>
          </RN.View>
        </RN.View>
      </RN.View>
    </RN.View>
  )
}
