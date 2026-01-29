import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { ArchBackground, ARCH } from '@/components/arch-theme'
import { ArchNav } from '@/components/arch-nav'

/**
 * Terminal Story Game (React Native TSX)
 * - ASCII 3D Menger sponge "donut-like" renderer
 * - Interactive command-line with story nodes, inventory, quests
 * - No external deps (save/load uses optional AsyncStorage if present)
 */

type MediumKey = 'air' | 'water' | 'glass' | 'metal' | 'foam'
type ThemeKey = 'matrix' | 'amber' | 'ice'

type GameState = {
  // Render/sim
  level: 0 | 1 | 2 | 3
  medium: MediumKey
  scan: boolean
  spinning: boolean
  speed: number // visual rotation speed multiplier

  // "Lab" stats
  integrity: number // 0..100
  energy: number // 0..100
  heat: number // 0..100
  noise: number // 0..100
  credits: number

  // Story
  node: string
  flags: Record<string, boolean>
  inventory: Record<string, number>
  equipped: string | null

  // Shell
  cwd: string
  theme: ThemeKey
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
const pad2 = (n: number) => (n < 10 ? '0' + n : '' + n)

const MEDIUMS: Record<MediumKey, { label: string; atten: number; jitter: number; heatMul: number; noiseMul: number }> = {
  air: { label: 'AIR', atten: 0.02, jitter: 0.00, heatMul: 1.0, noiseMul: 1.0 },
  water: { label: 'WATER', atten: 0.12, jitter: 0.03, heatMul: 0.65, noiseMul: 0.8 },
  glass: { label: 'GLASS', atten: 0.08, jitter: 0.015, heatMul: 0.85, noiseMul: 0.9 },
  metal: { label: 'METAL', atten: 0.18, jitter: 0.01, heatMul: 1.4, noiseMul: 1.1 },
  foam: { label: 'FOAM', atten: 0.10, jitter: 0.05, heatMul: 0.75, noiseMul: 0.55 }
}

const THEMES: Record<ThemeKey, { bg: string; fg: string; fgDim: string; border: string; accent: string }> = {
  matrix: { bg: '#050a07', fg: 'rgba(170,255,220,0.95)', fgDim: 'rgba(140,255,200,0.60)', border: 'rgba(120,255,180,0.22)', accent: 'rgba(120,255,180,0.85)' },
  amber: { bg: '#0a0703', fg: 'rgba(255,210,140,0.95)', fgDim: 'rgba(255,200,120,0.55)', border: 'rgba(255,200,120,0.22)', accent: 'rgba(255,180,92,0.85)' },
  ice: { bg: '#041018', fg: 'rgba(170,230,255,0.95)', fgDim: 'rgba(140,210,255,0.60)', border: 'rgba(140,210,255,0.22)', accent: 'rgba(140,210,255,0.85)' }
}

// ASCII ramp (dark->bright)
const RAMP = " .,-~:;=!*#$@"

// -------- Menger membership test --------
// Standard rule: at each scale, remove if at least two coordinates have digit == 1 in base-3.
function isMengerSolid(x: number, y: number, z: number, level: number): boolean {
  for (let i = 0; i < level; i++) {
    const xi = Math.floor(x * 3) % 3
    const yi = Math.floor(y * 3) % 3
    const zi = Math.floor(z * 3) % 3
    const ones = (xi === 1 ? 1 : 0) + (yi === 1 ? 1 : 0) + (zi === 1 ? 1 : 0)
    if (ones >= 2) return false
    x = (x * 3) % 1
    y = (y * 3) % 1
    z = (z * 3) % 1
  }
  return true
}

function rotateY(x: number, z: number, a: number) {
  const c = Math.cos(a), s = Math.sin(a)
  return { x: x * c - z * s, z: x * s + z * c }
}
function rotateX(y: number, z: number, a: number) {
  const c = Math.cos(a), s = Math.sin(a)
  return { y: y * c - z * s, z: y * s + z * c }
}

function renderAsciiFrame(opts: {
  W: number
  H: number
  level: number
  t: number
  medium: MediumKey
  scan: boolean
  glitch: number // 0..1
}) {
  const { W, H, level, t, medium, scan, glitch } = opts
  const m = MEDIUMS[medium]
  const aspect = W / H

  const ax = t * 0.65
  const ay = t * 0.85

  const light = { x: 0.6, y: 0.8, z: 0.3 }
  const invLen = 1 / Math.hypot(light.x, light.y, light.z)
  light.x *= invLen; light.y *= invLen; light.z *= invLen

  const chars: string[] = new Array(W * H).fill(' ')
  const zbuf: number[] = new Array(W * H).fill(-1e9)

  const fov = 1.15
  const step = 0.035
  const maxSteps = 110

  const scanY = scan ? ((Math.sin(t * 2.2) * 0.5 + 0.5) * (H - 1)) : -999

  // cheap deterministic noise (no RNG)
  const noise2 = (x: number, y: number, k: number) => {
    const v = Math.sin((x * 12.989 + y * 78.233 + k * 37.719) * 0.017) * 43758.5453
    return v - Math.floor(v)
  }

  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const u = ((px + 0.5) / W) * 2 - 1
      const v = ((py + 0.5) / H) * 2 - 1
      const sx = u * aspect * fov
      const sy = -v * fov

      let ro = { x: 0, y: 0, z: 2.8 }
      let rd = { x: sx, y: sy, z: -1.4 }
      const rdn = 1 / Math.hypot(rd.x, rd.y, rd.z)
      rd.x *= rdn; rd.y *= rdn; rd.z *= rdn

      let hit = false
      let hitP = { x: 0, y: 0, z: 0 }
      let depth = 0

      for (let s = 0; s < maxSteps; s++) {
        const p = { x: ro.x + rd.x * depth, y: ro.y + rd.y * depth, z: ro.z + rd.z * depth }

        let lx = p.x, ly = p.y, lz = p.z
        const ry = rotateY(lx, lz, ay); lx = ry.x; lz = ry.z
        const rx = rotateX(ly, lz, ax); ly = rx.y; lz = rx.z

        if (Math.abs(lx) <= 1 && Math.abs(ly) <= 1 && Math.abs(lz) <= 1) {
          const mx = (lx + 1) * 0.5
          const my = (ly + 1) * 0.5
          const mz = (lz + 1) * 0.5
          if (isMengerSolid(mx, my, mz, level)) {
            hit = true
            hitP = { x: lx, y: ly, z: lz }
            break
          }
        }

        depth += step
        if (depth > 5) break
      }

      if (!hit) continue

      const eps = 0.02
      const sample = (x: number, y: number, z: number) => {
        if (Math.abs(x) > 1 || Math.abs(y) > 1 || Math.abs(z) > 1) return 0
        const mx = (x + 1) * 0.5
        const my = (y + 1) * 0.5
        const mz = (z + 1) * 0.5
        return isMengerSolid(mx, my, mz, level) ? 1 : 0
      }

      const nx = sample(hitP.x + eps, hitP.y, hitP.z) - sample(hitP.x - eps, hitP.y, hitP.z)
      const ny = sample(hitP.x, hitP.y + eps, hitP.z) - sample(hitP.x, hitP.y - eps, hitP.z)
      const nz = sample(hitP.x, hitP.y, hitP.z + eps) - sample(hitP.x, hitP.y, hitP.z - eps)

      const nlen = Math.max(1e-6, Math.hypot(nx, ny, nz))
      const N = { x: nx / nlen, y: ny / nlen, z: nz / nlen }

      let lum = clamp(N.x * light.x + N.y * light.y + N.z * light.z, 0, 1)
      const jitter = (noise2(px, py, t * 30) * 2 - 1) * m.jitter
      lum = clamp(lum * (1 - m.atten) + jitter, 0, 1)

      if (scan) {
        const d = Math.abs(py - scanY)
        lum *= clamp(1.0 + Math.exp(-d * 0.25) * 0.45, 0.6, 1.35)
      }

      // glitch: randomly drop/shift chars
      const g = glitch
      const gRoll = noise2(px + 99, py + 17, t * 50)
      if (g > 0 && gRoll < g * 0.08) {
        // drop a pixel
        continue
      }
      const idx = py * W + px
      const z = -hitP.z
      if (z > zbuf[idx]) {
        zbuf[idx] = z
        const ci = Math.floor(lum * (RAMP.length - 1))
        chars[idx] = RAMP[ci]
      }
    }
  }

  const lines: string[] = []
  for (let y = 0; y < H; y++) lines.push(chars.slice(y * W, (y + 1) * W).join(''))
  return lines.join('\n')
}

// ---- Optional AsyncStorage (if installed) ----
async function getAsyncStorage() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('@react-native-async-storage/async-storage')
    return mod?.default ?? mod
  } catch {
    return null
  }
}

// ---------------- Story data ----------------
type StoryNode = {
  title: string
  intro: string[]
  hints?: string[]
  onEnter?: (s: GameState) => Partial<GameState> | void
  choices?: {
    key: string
    label: string
    next: string
    req?: (s: GameState) => boolean
    effect?: (s: GameState) => Partial<GameState> | void
  }[]
}

const STORY: Record<string, StoryNode> = {
  boot: {
    title: 'BOOTSTRAP',
    intro: [
      'boot: menger-lab//intrusion-suite v1.2.9',
      'link: /dev/fractal_core  [ok]',
      'entropy: seeded',
      'hint: type "help" to list commands'
    ],
    onEnter: () => ({
      cwd: '/root',
      integrity: 100,
      energy: 72,
      heat: 15,
      noise: 10,
      credits: 25,
      inventory: { keycard: 0, shard: 0, coil: 0, coolant: 0, cipher: 0, patch: 0 },
      equipped: null,
      flags: { connected: false, admin: false, vaultOpen: false, metEcho: false, gotMap: false },
      level: 1,
      medium: 'air',
      scan: true,
      spinning: true,
      speed: 1.0,
      theme: 'matrix'
    })
  },
  alley: {
    title: 'ALLEY NODE',
    intro: [
      'You wake in a silent terminal. The screen breathes.',
      'A fractal object spins behind the text: a sponge of infinite missing matter.',
      'A message blinks: "CONNECT OR DIE."',
      'Objective: establish uplink to ECHO relay.'
    ],
    hints: ['try: connect echo', 'try: ls', 'try: cat README', 'try: quest'],
  },
  echo: {
    title: 'ECHO RELAY',
    intro: [
      'uplink established. latency: 32ms',
      'ECHO: "I can guide you, but the sponge is unstable."',
      'ECHO: "We need a KEYCARD. It is inside /vault."',
      'New objective: obtain keycard (vault).'
    ],
    onEnter: (s) => ({ flags: { ...s.flags, connected: true, metEcho: true } }),
    hints: ['try: cd /vault', 'try: ls', 'try: hack door', 'try: probe'],
  },
  vault: {
    title: 'VAULT INTERFACE',
    intro: [
      'The vault directory is cold. Files have teeth.',
      'A lock daemon watches you: LOCKD v3.',
      'ECHO: "Either break it or trick it."'
    ],
    hints: ['try: ls', 'try: hack lockd', 'try: decrypt cipher', 'try: decide A/B/C'],
    choices: [
      {
        key: 'A',
        label: 'Brute-force LOCKD (risk integrity, gain cipher)',
        next: 'vault',
        effect: (s) => {
          // handled in command "decide"
          void s
        }
      }
    ]
  },
  breach: {
    title: 'BREACH',
    intro: [
      'LOCKD collapses into static.',
      'A keycard drops into your inventory.',
      'ECHO: "Good. Now open the CORE CHAMBER."',
      'New objective: reach /core and stabilize recursion.'
    ],
    onEnter: (s) => ({ inventory: { ...s.inventory, keycard: (s.inventory.keycard ?? 0) + 1 }, flags: { ...s.flags, vaultOpen: true } }),
    hints: ['try: cd /core', 'try: use keycard', 'try: level 3', 'try: pulse'],
  },
  core: {
    title: 'FRACTAL CORE',
    intro: [
      'The core chamber hums. Geometry is alive.',
      'A warning floats: "RECURSION LIMITER OFFLINE."',
      'You can stabilize (repair) or weaponize (fracture) the sponge.',
      'Goal: reach ADMIN by crafting a PATCH + DECRYPTING a CIPHER.'
    ],
    hints: ['try: craft patch', 'try: decrypt cipher', 'try: fracture', 'try: repair', 'try: equip coil'],
  },
  admin: {
    title: 'ADMIN SHELL',
    intro: [
      'Privilege escalation complete.',
      'ADMIN: You can now run sealed commands: "open portal", "dump", "override".',
      'Final objective: OPEN PORTAL and escape the recursion.'
    ],
    onEnter: (s) => ({ flags: { ...s.flags, admin: true } }),
    hints: ['try: open portal', 'try: dump', 'try: override limiter'],
  },
  escape: {
    title: 'ESCAPE',
    intro: [
      'PORTAL OPEN.',
      'The sponge unfolds into a corridor of missing space.',
      'ECHO: "Run. Dont look back."',
      'END. (You can keep playing; try: override limiter)'
    ],
    hints: ['try: override limiter', 'try: level 0', 'try: medium water'],
  }
}

// --------------- Virtual filesystem (fun) ---------------
const FS: Record<string, { type: 'dir' | 'file'; content?: string; children?: string[] }> = {
  '/': { type: 'dir', children: ['root', 'vault', 'core', 'logs'] },
  '/root': { type: 'dir', children: ['README', 'tools.txt', 'notes.txt'] },
  '/root/README': { type: 'file', content: `MENGER-LAB / INTRUSION SUITE\n\nGoal: survive recursion.\nCommands: help, ls, cd, cat, connect, probe, hack, decrypt, craft, equip, use, quest, map, status.\n` },
  '/root/tools.txt': { type: 'file', content: `TOOLS\n- probe: scans sponge resonance\n- hack: attacks lock daemons\n- decrypt: cracks ciphers into shards\n- craft: build patch/coil from parts\n` },
  '/root/notes.txt': { type: 'file', content: `NOTES\nThe sponge reacts to medium & recursion.\nHigh level => high surface => high noise.\nIf integrity hits 0: cascade.\n` },

  '/vault': { type: 'dir', children: ['door.lock', 'cipher.bin', 'manifest'] },
  '/vault/door.lock': { type: 'file', content: `LOCKD v3\nstate: ARMED\nhint: brute-force costs integrity\n` },
  '/vault/cipher.bin': { type: 'file', content: `CIPHER_BLOB::A9F3-19C0-77EE\n` },
  '/vault/manifest': { type: 'file', content: `manifest: keycard:1\nrequires: unlock sequence\n` },

  '/core': { type: 'dir', children: ['limiter.cfg', 'coil.slot', 'chamber'] },
  '/core/limiter.cfg': { type: 'file', content: `limiter=OFF\nrecommended: patch\n` },
  '/core/coil.slot': { type: 'file', content: `slot: EMPTY\nhint: equip coil; use coil\n` },
  '/core/chamber': { type: 'file', content: `The chamber vibrates.\nTry: fracture / repair / pulse\n` },

  '/logs': { type: 'dir', children: ['echo.log', 'incident.log'] },
  '/logs/echo.log': { type: 'file', content: `[ECHO] If you get a shard, craft patch.\n[ECHO] Water reduces heat. Foam reduces noise.\n` },
  '/logs/incident.log': { type: 'file', content: `INCIDENT: recursion spike at n=3\nCASCADE signature present.\n` }
}

function pathJoin(a: string, b: string) {
  if (b.startsWith('/')) return b
  if (a === '/') return '/' + b
  return a.replace(/\/+$/, '') + '/' + b
}
function pathNorm(p: string) {
  const parts = p.split('/').filter(Boolean)
  const stack: string[] = []
  for (const part of parts) {
    if (part === '.') continue
    if (part === '..') stack.pop()
    else stack.push(part)
  }
  return '/' + stack.join('/')
}

// ---------------- Terminal Engine ----------------
type CmdCtx = {
  get: () => GameState
  set: React.Dispatch<React.SetStateAction<GameState>>
  out: (s: string) => void
  outLines: (...s: string[]) => void
  sys: (s: string) => void
  err: (s: string) => void
  go: (node: string) => void
  now: () => string
}

type Command = {
  name: string
  usage: string
  desc: string
  run: (ctx: CmdCtx, args: string[]) => void | Promise<void>
  hidden?: boolean
}

function timeStamp() {
  const d = new Date()
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

export default function TerminalStoryGame() {
  const screen = Dimensions?.get?.('window') ?? { width: 380, height: 700 }
  const ASCII_W = clamp(Math.floor(screen.width / 9.5), 44, 84)
  const ASCII_H = clamp(Math.floor((screen.height - 280) / 14), 18, 28)

  const [lines, setLines] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [frame, setFrame] = useState('')

  const scrollRef = useRef<ScrollView>(null)
  const t0 = useRef(Date.now() / 1000)
  const t = useRef(0)

  const [state, setState] = useState<GameState>({
    level: 1,
    medium: 'air',
    scan: true,
    spinning: true,
    speed: 1.0,
    integrity: 100,
    energy: 72,
    heat: 15,
    noise: 10,
    credits: 25,
    node: 'boot',
    flags: { connected: false, admin: false, vaultOpen: false, metEcho: false, gotMap: false },
    inventory: { keycard: 0, shard: 0, coil: 0, coolant: 0, cipher: 0, patch: 0 },
    equipped: null,
    cwd: '/root',
    theme: 'matrix'
  })

  const theme = THEMES[state.theme]

  const push = (s: string) => {
    setLines((prev) => [...prev, s].slice(-260))
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 10)
  }
  const pushLines = (...arr: string[]) => arr.forEach(push)

  const sys = (s: string) => push(`${theme.accent}${timeStamp()}${''} ${s}`)
  const err = (s: string) => push(`! ${s}`)

  const enterNode = (nodeKey: string) => {
    const node = STORY[nodeKey]
    if (!node) return
    setState((s) => {
      const patch = node.onEnter?.(s)
      return { ...s, ...patch, node: nodeKey }
    })
    pushLines(' ', `# ${node.title}`, ...node.intro.map((x) => `> ${x}`))
    if (node.hints?.length) pushLines(...node.hints.map((h) => `${theme.fgDim}${h}`))
  }

  // Boot once
  useEffect(() => {
    enterNode('boot')
    setTimeout(() => enterNode('alley'), 30)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Frame renderer loop
  useEffect(() => {
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)

      // time
      const now = Date.now() / 1000
      const dt = now - t0.current
      t0.current = now
      if (state.spinning) t.current += dt * state.speed

      // stats drift (lightweight "simulation")
      // higher level increases noise/heat; medium affects them
      // keep it subtle
      const m = MEDIUMS[state.medium]
      const levelFactor = 1 + state.level * 0.25
      const heatTarget = clamp(10 + state.level * 12 + (state.flags.admin ? 8 : 0), 0, 100)
      const noiseTarget = clamp(8 + state.level * 14 + (state.scan ? 6 : 0), 0, 100)

      // we update state rarely to avoid rerender spam
      // do a cheap "every ~0.4s" update
      if (Math.floor(now * 2.5) !== Math.floor((now - dt) * 2.5)) {
        setState((s) => {
          const heat = clamp(s.heat + (heatTarget - s.heat) * 0.12 * m.heatMul, 0, 100)
          const noise = clamp(s.noise + (noiseTarget - s.noise) * 0.12 * m.noiseMul, 0, 100)
          // integrity slowly decays if heat+noise high
          const stress = (heat * 0.35 + noise * 0.25) / 100
          const integrity = clamp(s.integrity - stress * 1.2, 0, 100)
          return { ...s, heat, noise, integrity }
        })
      }

      const glitch = clamp((100 - state.integrity) / 100, 0, 1) * 0.9
      const f = renderAsciiFrame({
        W: ASCII_W,
        H: ASCII_H,
        level: state.level,
        t: t.current,
        medium: state.medium,
        scan: state.scan,
        glitch
      })
      setFrame(f)
    }

    loop()
    return () => cancelAnimationFrame(raf)
  }, [ASCII_W, ASCII_H, state.level, state.medium, state.scan, state.spinning, state.speed, state.integrity, state.flags.admin])

  const header = useMemo(() => {
    const m = MEDIUMS[state.medium]
    const bar = (v: number) => {
      const n = 16
      const k = Math.round((clamp(v, 0, 100) / 100) * n)
      return '[' + '#'.repeat(k) + ' '.repeat(n - k) + ']'
    }
    return [
      `node=${state.node}  cwd=${state.cwd}  medium=${m.label}  n=${state.level}  scan=${state.scan ? 'ON' : 'OFF'}  spin=${state.spinning ? 'ON' : 'OFF'}  speed=${state.speed.toFixed(2)}`,
      `integrity ${bar(state.integrity)} ${state.integrity.toFixed(0)}%   energy ${bar(state.energy)} ${state.energy.toFixed(0)}%   heat ${bar(state.heat)} ${state.heat.toFixed(0)}%   noise ${bar(state.noise)} ${state.noise.toFixed(0)}%   credits=${state.credits}`
    ].join('\n')
  }, [state])

  // ------------ Commands ------------
  const ctx: CmdCtx = useMemo(() => ({
    get: () => state,
    set: setState,
    out: (s: string) => push(s),
    outLines: (...s: string[]) => pushLines(...s),
    sys: (s: string) => sys(s),
    err: (s: string) => err(s),
    go: (node: string) => enterNode(node),
    now: () => timeStamp()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [state, theme])

  const commands: Command[] = useMemo(() => {
    const cmd: Command[] = []

    const add = (c: Command) => cmd.push(c)

    add({
      name: 'help',
      usage: 'help [cmd]',
      desc: 'List commands or show help for a command.',
      run: (_ctx, args) => {
        if (args[0]) {
          const f = cmd.find((x) => x.name === args[0])
          if (!f) return _ctx.err('unknown command')
          _ctx.outLines(
            `> ${f.name}`,
            `usage: ${f.usage}`,
            `desc: ${f.desc}`
          )
          return
        }
        _ctx.outLines(
          '# commands',
          cmd.filter((x) => !x.hidden).map((x) => `- ${x.name.padEnd(10)}  ${x.desc}`).join('\n')
        )
      }
    })

    add({
      name: 'clear',
      usage: 'clear',
      desc: 'Clear terminal log.',
      run: (_ctx) => {
        setLines([])
        _ctx.out('> cleared')
      }
    })

    add({
      name: 'status',
      usage: 'status',
      desc: 'Show full status (flags, inventory).',
      run: (_ctx) => {
        const s = _ctx.get()
        _ctx.outLines(
          `node=${s.node}`,
          `cwd=${s.cwd}`,
          `flags=${Object.entries(s.flags).map(([k,v]) => `${k}:${v?'1':'0'}`).join(' ')}`,
          `inventory=${Object.entries(s.inventory).map(([k,v]) => `${k}:${v}`).join(' ')}`,
          `equipped=${s.equipped ?? 'none'}`
        )
      }
    })

    add({
      name: 'theme',
      usage: 'theme matrix|amber|ice',
      desc: 'Change terminal color theme.',
      run: (_ctx, args) => {
        const k = (args[0] as ThemeKey) || 'matrix'
        if (!THEMES[k]) return _ctx.err('theme must be matrix|amber|ice')
        _ctx.set((s) => ({ ...s, theme: k }))
        _ctx.sys(`theme=${k}`)
      }
    })

    add({
      name: 'speed',
      usage: 'speed <0.2..3>',
      desc: 'Set spin speed.',
      run: (_ctx, args) => {
        const v = Number(args[0])
        if (!Number.isFinite(v)) return _ctx.err('speed number required')
        _ctx.set((s) => ({ ...s, speed: clamp(v, 0.2, 3) }))
        _ctx.sys(`speed=${clamp(v, 0.2, 3).toFixed(2)}`)
      }
    })

    add({
      name: 'spin',
      usage: 'spin on|off',
      desc: 'Toggle rotation.',
      run: (_ctx, args) => {
        const v = args[0]
        if (!['on', 'off'].includes(v)) return _ctx.err('spin on|off')
        _ctx.set((s) => ({ ...s, spinning: v === 'on' }))
        _ctx.sys(`spin=${v.toUpperCase()}`)
      }
    })

    add({
      name: 'scan',
      usage: 'scan on|off',
      desc: 'Toggle scanline mode.',
      run: (_ctx, args) => {
        const v = args[0]
        if (!['on', 'off'].includes(v)) return _ctx.err('scan on|off')
        _ctx.set((s) => ({ ...s, scan: v === 'on' }))
        _ctx.sys(`scan=${v.toUpperCase()}`)
      }
    })

    add({
      name: 'level',
      usage: 'level 0|1|2|3',
      desc: 'Set Menger recursion level.',
      run: (_ctx, args) => {
        const n = Number(args[0])
        if (![0,1,2,3].includes(n)) return _ctx.err('level must be 0..3')
        _ctx.set((s) => ({ ...s, level: n as 0|1|2|3 }))
        _ctx.sys(`recursion n=${n}`)
      }
    })

    add({
      name: 'medium',
      usage: 'medium air|water|glass|metal|foam',
      desc: 'Switch simulation medium.',
      run: (_ctx, args) => {
        const k = args[0] as MediumKey
        if (!MEDIUMS[k]) return _ctx.err('medium must be air|water|glass|metal|foam')
        _ctx.set((s) => ({ ...s, medium: k }))
        _ctx.sys(`medium=${MEDIUMS[k].label}`)
      }
    })

    // ---- shell vibe ----
    add({
      name: 'pwd',
      usage: 'pwd',
      desc: 'Print current directory.',
      run: (_ctx) => _ctx.out(_ctx.get().cwd)
    })

    add({
      name: 'ls',
      usage: 'ls [path]',
      desc: 'List directory contents.',
      run: (_ctx, args) => {
        const s = _ctx.get()
        const p = pathNorm(pathJoin(s.cwd, args[0] || '.'))
        const node = FS[p]
        if (!node) return _ctx.err('no such file or directory')
        if (node.type !== 'dir') return _ctx.err('not a directory')
        _ctx.out((node.children || []).join('  '))
      }
    })

    add({
      name: 'cd',
      usage: 'cd <path>',
      desc: 'Change directory.',
      run: (_ctx, args) => {
        const s = _ctx.get()
        const p = pathNorm(pathJoin(s.cwd, args[0] || '/'))
        const node = FS[p]
        if (!node) return _ctx.err('no such directory')
        if (node.type !== 'dir') return _ctx.err('not a directory')
        _ctx.set((st) => ({ ...st, cwd: p }))
        _ctx.out(`> cwd=${p}`)
      }
    })

    add({
      name: 'cat',
      usage: 'cat <file>',
      desc: 'Print a file.',
      run: (_ctx, args) => {
        const s = _ctx.get()
        const p = pathNorm(pathJoin(s.cwd, args[0] || ''))
        const node = FS[p]
        if (!node) return _ctx.err('no such file')
        if (node.type !== 'file') return _ctx.err('not a file')
        _ctx.outLines(node.content || '')
        // story triggers
        if (p === '/vault/cipher.bin') {
          _ctx.set((st) => ({ ...st, inventory: { ...st.inventory, cipher: Math.max(st.inventory.cipher, 1) } }))
          _ctx.sys('cipher acquired (inventory.cipher=1)')
        }
      }
    })

    add({
      name: 'quest',
      usage: 'quest',
      desc: 'Show current objective.',
      run: (_ctx) => {
        const s = _ctx.get()
        if (s.node === 'alley') return _ctx.out('objective: establish uplink (connect echo)')
        if (s.node === 'echo') return _ctx.out('objective: obtain keycard (vault)')
        if (s.node === 'breach') return _ctx.out('objective: reach /core and stabilize recursion')
        if (s.node === 'core') return _ctx.out('objective: craft patch + decrypt cipher to reach admin')
        if (s.node === 'admin') return _ctx.out('objective: open portal')
        _ctx.out('objective: survive recursion')
      }
    })

    add({
      name: 'connect',
      usage: 'connect echo',
      desc: 'Attempt uplink to ECHO relay.',
      run: (_ctx, args) => {
        const s = _ctx.get()
        if (args[0] !== 'echo') return _ctx.err('usage: connect echo')
        if (s.flags.connected) return _ctx.out('> already connected')
        _ctx.out('> dialing...')
        _ctx.set((st) => ({ ...st, flags: { ...st.flags, connected: true } }))
        _ctx.go('echo')
      }
    })

    add({
      name: 'probe',
      usage: 'probe',
      desc: 'Scan resonance; may yield parts.',
      run: (_ctx) => {
        const s = _ctx.get()
        const m = MEDIUMS[s.medium]
        const chance = clamp(0.18 + s.level * 0.08 + (s.scan ? 0.06 : 0) - m.atten * 0.2, 0.05, 0.6)
        const roll = Math.random()
        _ctx.out(`> resonance sweep: n=${s.level}, medium=${m.label}, chance=${(chance*100).toFixed(0)}%`)
        if (roll < chance) {
          const loot = pick(['shard','coil','coolant','patch'] as const)
          _ctx.set((st) => ({ ...st, inventory: { ...st.inventory, [loot]: (st.inventory[loot] ?? 0) + 1 }, credits: st.credits + 3 }))
          _ctx.sys(`loot found: ${loot} (+3 credits)`)
        } else {
          _ctx.out('> nothing but silence.')
        }
      }
    })

    add({
      name: 'pulse',
      usage: 'pulse',
      desc: 'Spend energy for a scan boost; reduces integrity slightly.',
      run: (_ctx) => {
        _ctx.set((s) => {
          if (s.energy < 12) {
            _ctx.err('insufficient energy')
            return s
          }
          _ctx.sys('pulse emitted: scan boost + microstress')
          return { ...s, energy: clamp(s.energy - 12, 0, 100), integrity: clamp(s.integrity - 2, 0, 100), scan: true }
        })
      }
    })

    add({
      name: 'fracture',
      usage: 'fracture',
      desc: 'Risk integrity to gain energy and shards (risky).',
      run: (_ctx) => {
        _ctx.set((s) => {
          const risk = 8 + s.level * 6 + Math.round(s.noise / 20)
          const gainE = 10 + s.level * 4
          const gainS = Math.random() < 0.55 ? 1 : 0
          const cascade = Math.random() < clamp((100 - s.integrity) / 180, 0, 0.55)
          if (cascade) {
            _ctx.err(`cascade! integrity -${risk * 2}`)
            return {
              ...s,
              integrity: clamp(s.integrity - risk * 2, 0, 100),
              energy: clamp(s.energy + gainE + 6, 0, 100),
              inventory: { ...s.inventory, shard: (s.inventory.shard ?? 0) + gainS + 1 }
            }
          }
          _ctx.sys(`fracture: integrity -${risk}, energy +${gainE}${gainS ? ', shard +1' : ''}`)
          return {
            ...s,
            integrity: clamp(s.integrity - risk, 0, 100),
            energy: clamp(s.energy + gainE, 0, 100),
            inventory: { ...s.inventory, shard: (s.inventory.shard ?? 0) + gainS }
          }
        })
      }
    })

    add({
      name: 'repair',
      usage: 'repair',
      desc: 'Convert energy (and optionally coolant) into integrity.',
      run: (_ctx) => {
        _ctx.set((s) => {
          const useCoolant = (s.inventory.coolant ?? 0) > 0 && Math.random() < 0.9
          const cost = useCoolant ? 8 : 12
          if (s.energy < cost) {
            _ctx.err('insufficient energy')
            return s
          }
          const gain = useCoolant ? 18 : 12
          _ctx.sys(`repair: energy -${cost}, integrity +${gain}${useCoolant ? ' (coolant used)' : ''}`)
          return {
            ...s,
            energy: clamp(s.energy - cost, 0, 100),
            integrity: clamp(s.integrity + gain, 0, 100),
            inventory: useCoolant ? { ...s.inventory, coolant: Math.max(0, (s.inventory.coolant ?? 0) - 1) } : s.inventory
          }
        })
      }
    })

    add({
      name: 'hack',
      usage: 'hack lockd|door',
      desc: 'Attack vault lock daemon (risk).',
      run: (_ctx, args) => {
        const target = args[0]
        const s = _ctx.get()
        if (s.cwd !== '/vault') return _ctx.err('hack works best in /vault')
        if (s.flags.vaultOpen) return _ctx.out('> vault already breached')

        if (!['lockd','door'].includes(target)) return _ctx.err('usage: hack lockd|door')

        _ctx.out('> injecting...')
             _ctx.set((st) => {
          const risk = 10 + st.level * 6
          const base = 0.28 + st.level * 0.08 + (st.scan ? 0.05 : 0) - (MEDIUMS[st.medium].atten * 0.15)
          const success = Math.random() < clamp(base, 0.08, 0.72)

          const integrity = clamp(st.integrity - risk * (success ? 0.45 : 1.0), 0, 100)
          const energy = clamp(st.energy - (success ? 6 : 10), 0, 100)

          if (success) {
            _ctx.sys('LOCKD destabilized: door state -> BREACHED')
            // give cipher if not already
            const inv = { ...st.inventory }
            inv.cipher = Math.max(inv.cipher ?? 0, 1)
            inv.keycard = (inv.keycard ?? 0) + 1
            _ctx.go('breach')
            return { ...st, integrity, energy, inventory: inv, flags: { ...st.flags, vaultOpen: true } }
          } else {
            _ctx.err('LOCKD resisted. integrity damaged.')
            return { ...st, integrity, energy, noise: clamp(st.noise + 8, 0, 100) }
          }
        })
      }
    })

    add({
      name: 'decrypt',
      usage: 'decrypt cipher',
      desc: 'Decrypt cipher into shards / parts (requires cipher).',
      run: (_ctx, args) => {
        const s = _ctx.get()
        if (args[0] !== 'cipher') return _ctx.err('usage: decrypt cipher')
        if ((s.inventory.cipher ?? 0) <= 0) return _ctx.err('you have no cipher (try: cat /vault/cipher.bin)')

        _ctx.set((st) => {
          const costE = 10
          if (st.energy < costE) {
            _ctx.err('insufficient energy')
            return st
          }
          const m = MEDIUMS[st.medium]
          const quality = clamp(0.35 + st.level * 0.12 + (st.scan ? 0.08 : 0) - m.atten * 0.2, 0.1, 0.85)
          const shards = (Math.random() < quality ? 2 : 1) + (Math.random() < quality * 0.35 ? 1 : 0)
          const gotCoil = Math.random() < quality * 0.22
          const gotCoolant = Math.random() < (st.level >= 2 ? 0.25 : 0.12)

          _ctx.sys(`decrypt: energy -${costE}, shard +${shards}${gotCoil ? ', coil +1' : ''}${gotCoolant ? ', coolant +1' : ''}`)

          return {
            ...st,
            energy: clamp(st.energy - costE, 0, 100),
            inventory: {
              ...st.inventory,
              shard: (st.inventory.shard ?? 0) + shards,
              coil: (st.inventory.coil ?? 0) + (gotCoil ? 1 : 0),
              coolant: (st.inventory.coolant ?? 0) + (gotCoolant ? 1 : 0),
              // cipher consumed
              cipher: Math.max(0, (st.inventory.cipher ?? 0) - 1)
            },
            credits: st.credits + 6
          }
        })
      }
    })

    add({
      name: 'craft',
      usage: 'craft patch|coil|coolant',
      desc: 'Craft items from shards/parts.',
      run: (_ctx, args) => {
        const what = args[0]
        if (!what) return _ctx.err('usage: craft patch|coil|coolant')
        _ctx.set((s) => {
          const inv = { ...s.inventory }
          const spend = (k: string, n: number) => {
            inv[k] = Math.max(0, (inv[k] ?? 0) - n)
          }
          const have = (k: string, n: number) => (inv[k] ?? 0) >= n

          if (what === 'patch') {
            // Patch: 3 shards + 1 coil
            if (!have('shard', 3) || !have('coil', 1)) {
              _ctx.err('need: shard x3 + coil x1')
              return s
            }
            spend('shard', 3); spend('coil', 1)
            inv.patch = (inv.patch ?? 0) + 1
            _ctx.sys('crafted: patch +1')
            return { ...s, inventory: inv, credits: s.credits + 4 }
          }

          if (what === 'coil') {
            // Coil: 2 shards
            if (!have('shard', 2)) {
              _ctx.err('need: shard x2')
              return s
            }
            spend('shard', 2)
            inv.coil = (inv.coil ?? 0) + 1
            _ctx.sys('crafted: coil +1')
            return { ...s, inventory: inv, credits: s.credits + 2 }
          }

          if (what === 'coolant') {
            // Coolant: 2 shards + 1 credit (flavor)
            if (!have('shard', 2) || s.credits < 1) {
              _ctx.err('need: shard x2 + credits x1')
              return s
            }
            spend('shard', 2)
            inv.coolant = (inv.coolant ?? 0) + 1
            _ctx.sys('crafted: coolant +1')
            return { ...s, inventory: inv, credits: s.credits - 1 }
          }

          _ctx.err('craft patch|coil|coolant')
          return s
        })
      }
    })

    add({
      name: 'equip',
      usage: 'equip coil|patch|none',
      desc: 'Equip an item.',
      run: (_ctx, args) => {
        const what = args[0]
        _ctx.set((s) => {
          if (!what) {
            _ctx.err('equip coil|patch|none')
            return s
          }
          if (what === 'none') {
            _ctx.sys('equipped: none')
            return { ...s, equipped: null }
          }
          if (!['coil', 'patch'].includes(what)) {
            _ctx.err('equip coil|patch|none')
            return s
          }
          if ((s.inventory as any)[what] <= 0) {
            _ctx.err(`you do not have ${what}`)
            return s
          }
          _ctx.sys(`equipped: ${what}`)
          return { ...s, equipped: what }
        })
      }
    })

    add({
      name: 'use',
      usage: 'use keycard|patch|coil',
      desc: 'Use an item in the right place.',
      run: (_ctx, args) => {
        const item = args[0]
        const s = _ctx.get()
        if (!item) return _ctx.err('usage: use keycard|patch|coil')

        // Keycard opens core in story sense
        if (item === 'keycard') {
          if ((s.inventory.keycard ?? 0) <= 0) return _ctx.err('no keycard')
          _ctx.sys('keycard accepted.')
          if (s.node === 'breach' || s.node === 'echo' || s.node === 'vault') {
            _ctx.go('core')
          } else {
            _ctx.out('> access granted, but nothing here responds.')
          }
          return
        }

        if (item === 'patch') {
          if ((s.inventory.patch ?? 0) <= 0) return _ctx.err('no patch')
          if (s.cwd !== '/core') return _ctx.err('patch works in /core')
          _ctx.set((st) => ({
            ...st,
            inventory: { ...st.inventory, patch: Math.max(0, (st.inventory.patch ?? 0) - 1) },
            integrity: clamp(st.integrity + 22, 0, 100),
            heat: clamp(st.heat - 18, 0, 100),
            flags: { ...st.flags, admin: st.flags.admin } // no change here
          }))
          _ctx.sys('patch applied: limiter stabilization + integrity boost')
          return
        }

        if (item === 'coil') {
          if ((s.inventory.coil ?? 0) <= 0) return _ctx.err('no coil')
          if (s.cwd !== '/core') return _ctx.err('coil works in /core')
          _ctx.set((st) => ({
            ...st,
            inventory: { ...st.inventory, coil: Math.max(0, (st.inventory.coil ?? 0) - 1) },
            energy: clamp(st.energy + 20, 0, 100),
            noise: clamp(st.noise + 6, 0, 100)
          }))
          _ctx.sys('coil installed: energy surge (noise up)')
          return
        }

        _ctx.err('use keycard|patch|coil')
      }
    })

    // story choice gate (A/B/C)
    add({
      name: 'decide',
      usage: 'decide A|B|C',
      desc: 'Make a narrative decision (contextual).',
      run: (_ctx, args) => {
        const choice = (args[0] || '').toUpperCase()
        if (!['A', 'B', 'C'].includes(choice)) return _ctx.err('usage: decide A|B|C')

        const s = _ctx.get()

        // In vault: choices affect unlock chances / loot
        if (s.node === 'vault' || s.cwd === '/vault') {
          if (choice === 'A') {
            _ctx.out('> route A: brute force escalation')
            _ctx.set((st) => ({
              ...st,
              integrity: clamp(st.integrity - (12 + st.level * 6), 0, 100),
              noise: clamp(st.noise + 10, 0, 100),
              energy: clamp(st.energy + 8, 0, 100),
              inventory: { ...st.inventory, cipher: Math.max(st.inventory.cipher ?? 0, 1) }
            }))
            _ctx.sys('cipher scraped from lock memory')
            return
          }
          if (choice === 'B') {
            _ctx.out('> route B: quiet bypass')
            _ctx.set((st) => ({
              ...st,
              medium: 'foam',
              noise: clamp(st.noise - 8, 0, 100),
              integrity: clamp(st.integrity + 4, 0, 100)
            }))
            _ctx.sys('signal masked (foam)')
            return
          }
          // C
          _ctx.out('> route C: conductive spike')
          _ctx.set((st) => ({
            ...st,
            medium: 'metal',
            energy: clamp(st.energy + 14, 0, 100),
            integrity: clamp(st.integrity - 6, 0, 100)
          }))
          _ctx.sys('energy spike injected (risk)')
          return
        }

        // In core: choices affect reaching admin
        if (s.node === 'core' || s.cwd === '/core') {
          if (choice === 'A') {
            _ctx.out('> route A: stabilize recursion')
            _ctx.set((st) => ({ ...st, integrity: clamp(st.integrity + 6, 0, 100), heat: clamp(st.heat - 6, 0, 100) }))
            return
          }
          if (choice === 'B') {
            _ctx.out('> route B: deepen recursion (more output, more risk)')
            _ctx.set((st) => ({ ...st, level: clamp(st.level + 1, 0, 3) as 0|1|2|3, noise: clamp(st.noise + 8, 0, 100) }))
            return
          }
          _ctx.out('> route C: liquid damping')
          _ctx.set((st) => ({ ...st, medium: 'water', heat: clamp(st.heat - 10, 0, 100), noise: clamp(st.noise - 6, 0, 100) }))
          return
        }

        _ctx.out('> the terminal accepts your choice, but the world does not react here.')
      }
    })

    // ADMIN-only commands
    add({
      name: 'open',
      usage: 'open portal',
      desc: 'Open the portal (requires admin).',
      run: (_ctx, args) => {
        const s = _ctx.get()
        if (args[0] !== 'portal') return _ctx.err('usage: open portal')
        if (!s.flags.admin) return _ctx.err('permission denied (need admin)')
        _ctx.go('escape')
      }
    })

    add({
      name: 'dump',
      usage: 'dump',
      desc: 'Dump system internals (admin).',
      run: (_ctx) => {
        const s = _ctx.get()
        if (!s.flags.admin) return _ctx.err('permission denied')
        _ctx.outLines(
          '# dump',
          `entropy_seed=${Math.floor(Math.random() * 1e9)}`,
          `recursion=${s.level}`,
          `medium=${MEDIUMS[s.medium].label}`,
          `limiter=${(s.inventory.patch ?? 0) > 0 ? 'PATCH_READY' : 'UNPATCHED'}`,
          `vault_open=${s.flags.vaultOpen ? '1' : '0'}`
        )
      }
    })

    add({
      name: 'override',
      usage: 'override limiter',
      desc: 'Override recursion limiter (admin; dangerous).',
      run: (_ctx, args) => {
        const s = _ctx.get()
        if (args[0] !== 'limiter') return _ctx.err('usage: override limiter')
        if (!s.flags.admin) return _ctx.err('permission denied')
        _ctx.set((st) => ({
          ...st,
          level: 3,
          scan: true,
          speed: clamp(st.speed + 0.35, 0.2, 3),
          noise: clamp(st.noise + 18, 0, 100),
          heat: clamp(st.heat + 16, 0, 100),
          integrity: clamp(st.integrity - 14, 0, 100)
        }))
        _ctx.sys('limiter overridden: recursion forced to n=3 (danger)')
      }
    })

    // Progression trigger to ADMIN
    add({
      name: 'ascend',
      usage: 'ascend',
      desc: 'Attempt privilege escalation (core only).',
      run: (_ctx) => {
        const s = _ctx.get()
        if (s.cwd !== '/core') return _ctx.err('ascend works in /core')
        const hasPatch = (s.inventory.patch ?? 0) > 0
        const hasShards = (s.inventory.shard ?? 0) >= 2
        if (!hasPatch || !hasShards) return _ctx.err('need: patch x1 + shard x2 (craft / decrypt)')
        _ctx.set((st) => ({
          ...st,
          flags: { ...st.flags, admin: true },
          inventory: { ...st.inventory, shard: Math.max(0, (st.inventory.shard ?? 0) - 2) }
        }))
        _ctx.go('admin')
      }
    })

    // Save/Load (optional)
    add({
      name: 'save',
      usage: 'save',
      desc: 'Save game (AsyncStorage if installed).',
      run: async (_ctx) => {
        const storage = await getAsyncStorage()
        if (!storage) return _ctx.err('AsyncStorage not installed')
        await storage.setItem('menger_terminal_save', JSON.stringify(_ctx.get()))
        _ctx.sys('saved.')
      }
    })

    add({
      name: 'load',
      usage: 'load',
      desc: 'Load game (AsyncStorage if installed).',
      run: async (_ctx) => {
        const storage = await getAsyncStorage()
        if (!storage) return _ctx.err('AsyncStorage not installed')
        const raw = await storage.getItem('menger_terminal_save')
        if (!raw) return _ctx.err('no save found')
        const parsed = JSON.parse(raw)
        _ctx.set(() => parsed)
        _ctx.sys('loaded.')
      }
    })

    // Hidden helper: map
    add({
      name: 'map',
      usage: 'map',
      desc: 'Show location map.',
      run: (_ctx) => {
        _ctx.outLines(
          '# map',
          '/root  -> docs/tools',
          '/vault -> lockd + cipher + keycard',
          '/core  -> limiter + chamber',
          '/logs  -> hints'
        )
      }
    })

    return cmd
  }, [])

  const run = async (raw: string) => {
    const cmdline = raw.trim()
    if (!cmdline) return
    push(`> ${cmdline}`)

    const [name, ...args] = cmdline.split(/\s+/)
    const c = commands.find((x) => x.name === name)
    if (!c) {
      err('unknown command (try: help)')
      return
    }

    try {
      await c.run(ctx, args)

      // auto progression hooks
      const s = ctx.get()
      if (s.node === 'alley' && s.flags.connected) enterNode('echo')
      if (s.node === 'echo' && s.flags.vaultOpen) enterNode('breach')

      // if in core and admin possible, hint
      if ((s.node === 'core' || s.cwd === '/core') && !s.flags.admin) {
        const canAscend = (s.inventory.patch ?? 0) > 0 && (s.inventory.shard ?? 0) >= 2
        if (canAscend) pushLines(`${theme.fgDim}hint: you can now run "ascend"`)
      }
    } catch (e: any) {
      err(e?.message || 'command crashed')
    }
  }

  // Auto story transitions when you enter folders
  useEffect(() => {
    if (state.cwd === '/vault' && !state.flags.connected) return
    if (state.cwd === '/vault' && state.flags.connected && state.node !== 'vault' && !state.flags.vaultOpen) enterNode('vault')
    if (state.cwd === '/core' && state.node !== 'core' && !state.flags.admin) enterNode('core')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.cwd])

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <ArchBackground />
      <ArchNav active="/game" />
      <Text style={[styles.title, { color: theme.accent }]}>MENGER//LAB_TERMINAL</Text>

      <View style={[styles.panel, { borderColor: theme.border, backgroundColor: ARCH.PANEL_2 }]}>
        <Text style={[styles.header, { color: theme.fgDim }]}>{header}</Text>

        <Text style={[styles.frame, { color: theme.fg }]}>{frame}</Text>

        <View style={[styles.hr, { backgroundColor: theme.border }]} />

        <ScrollView ref={scrollRef} style={styles.log} contentContainerStyle={{ paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
          {lines.map((l, i) => (
            <Text key={i} style={[styles.line, { color: theme.fg }]}>
              {l}
            </Text>
          ))}
        </ScrollView>

        <View style={[styles.inputRow, { borderColor: theme.border }]}>
          <Text style={[styles.prompt, { color: theme.fg }]}>></Text>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="type a command... (help)"
            placeholderTextColor={theme.fgDim}
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, { color: theme.fg }]}
            onSubmitEditing={() => {
              const c = input
              setInput('')
              run(c)
            }}
            returnKeyType="send"
          />
        </View>

        <Text style={[styles.hint, { color: theme.fgDim }]}>
          try: <Text style={{ color: theme.fg }}>help</Text>, <Text style={{ color: theme.fg }}>ls</Text>, <Text style={{ color: theme.fg }}>connect echo</Text>,{' '}
          <Text style={{ color: theme.fg }}>cd /vault</Text>, <Text style={{ color: theme.fg }}>hack lockd</Text>, <Text style={{ color: theme.fg }}>cd /core</Text>,{' '}
          <Text style={{ color: theme.fg }}>decrypt cipher</Text>, <Text style={{ color: theme.fg }}>craft patch</Text>, <Text style={{ color: theme.fg }}>ascend</Text>,{' '}
          <Text style={{ color: theme.fg }}>open portal</Text>
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 14 },
  title: {
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 10
  },
  panel: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12
  },
  header: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10
  },
  frame: {
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 12,
    includeFontPadding: false
  },
  hr: { height: 1, marginVertical: 10 },
  log: { flex: 1 },
  line: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 16
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  prompt: {
    fontFamily: 'monospace',
    fontSize: 16,
    marginRight: 8
  },
  input: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 14,
    padding: 0
  },
  hint: {
    marginTop: 10,
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 16
  }
})



