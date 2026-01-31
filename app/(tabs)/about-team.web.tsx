import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Parallax, ParallaxLayer, type IParallax } from '@react-spring/parallax'

const NAV_ITEMS = [
  { label: 'Home', href: '/(tabs)' },
  { label: 'Explore', href: '/explore' },
  { label: 'Shader Studio', href: '/shader-studio' },
  { label: 'Real Life', href: '/real-life' },
  { label: 'Quiz', href: '/quiz' },
  { label: 'About Team', href: '/about-team' },
  { label: 'Portal', href: '/portal' },
  { label: 'Maths Lab', href: '/mathsandjeans' },
  { label: 'Learn', href: '/learn' },
  { label: 'Laborator', href: '/laborator' },
  { label: 'Energy', href: '/energy' }
]

const CUBES = [
  { size: 160, x: '8%', y: '18%', rot: 'rotateX(18deg) rotateY(12deg)' },
  { size: 120, x: '72%', y: '14%', rot: 'rotateX(22deg) rotateY(-18deg)' },
  { size: 220, x: '62%', y: '48%', rot: 'rotateX(14deg) rotateY(28deg)' },
  { size: 140, x: '18%', y: '62%', rot: 'rotateX(26deg) rotateY(-10deg)' },
  { size: 90, x: '78%', y: '72%', rot: 'rotateX(30deg) rotateY(24deg)' },
  { size: 110, x: '12%', y: '78%', rot: 'rotateX(10deg) rotateY(18deg)' }
]

const CLOUDS = [
  { w: 220, x: '6%', y: '18%', speed: 0.3 },
  { w: 260, x: '68%', y: '14%', speed: 0.22 },
  { w: 180, x: '12%', y: '64%', speed: 0.18 },
  { w: 240, x: '72%', y: '62%', speed: 0.25 }
]

const SPACE_OBJECTS = [
  { size: 220, x: '10%', y: '10%', z: -240, rot: 'rotateX(26deg) rotateY(16deg)' },
  { size: 180, x: '70%', y: '8%', z: -180, rot: 'rotateX(18deg) rotateY(-20deg)' },
  { size: 280, x: '62%', y: '52%', z: -320, rot: 'rotateX(12deg) rotateY(28deg)' },
  { size: 140, x: '20%', y: '60%', z: -120, rot: 'rotateX(24deg) rotateY(-12deg)' },
  { size: 120, x: '78%', y: '72%', z: -160, rot: 'rotateX(22deg) rotateY(20deg)' },
  { size: 90, x: '12%', y: '78%', z: -80, rot: 'rotateX(10deg) rotateY(18deg)' }
]

export default function AboutTeamWeb() {
  const parallax = useRef<IParallax>(null!)
  const [scrolled, setScrolled] = useState(false)
  const dots = useMemo(() => Array.from({ length: 220 }), [])
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const resolveContainer = () => {
      const raw = parallax.current?.container as any
      return raw?.current ?? raw
    }
    const container = resolveContainer()
    if (!container || typeof container.addEventListener !== 'function') return
    const onScroll = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        const top = container.scrollTop
        setScrolled(top > 10)
      })
    }
    onScroll()
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0a0a' }}>
      <style>{`
        html, body, #root {
          height: 100%;
          width: 100%;
          margin: 0;
          font-family: "Space Grotesk", "Helvetica Neue", Arial, sans-serif;
          background: #0a0a0a;
          color: #f5f5f5;
        }
        *, *:after, *:before { box-sizing: border-box; }
        * { scrollbar-width: none; }
        *::-webkit-scrollbar { width: 0; height: 0; background: transparent; }
        ::selection { background: #f5f5f5; color: #0a0a0a; }
        .nav {
          position: fixed;
          top: 18px;
          left: 50%;
          transform: translateX(-50%);
          width: min(1100px, 94vw);
          z-index: 50;
          border-radius: 999px;
          padding: 10px 18px;
          background: rgba(0,0,0,0.4);
          border: 1px solid transparent;
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 200ms ease;
        }
        .nav.scrolled {
          background: rgba(0,0,0,0.72);
          border-color: #2a2a2a;
        }
        .nav-brand {
          font-weight: 800;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          font-size: 12px;
          white-space: nowrap;
        }
        .nav-items {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: center;
          flex: 1;
          margin-left: 16px;
        }
        .nav-dot {
          width: 36px;
          height: 36px;
          border-radius: 18px;
          border: 1px solid #2a2a2a;
          flex-shrink: 0;
        }
        .team-card {
          border: 1px solid #2a2a2a;
          border-radius: 18px;
          padding: 24px 26px;
          background: rgba(255,255,255,0.03);
          max-width: 560px;
        }
        .team-kicker {
          letter-spacing: 0.22em;
          text-transform: uppercase;
          font-size: 11px;
          color: #9b9b9b;
        }
        .team-title {
          font-size: 42px;
          margin: 10px 0 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .team-name {
          font-size: 26px;
          font-weight: 800;
          margin: 0 0 6px;
        }
        .team-role {
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-size: 11px;
          color: #bdbdbd;
        }
        .team-body {
          color: #cfcfcf;
          line-height: 1.7;
        }
        .space-scene {
          position: relative;
          width: 100%;
          height: 70vh;
          transform-style: preserve-3d;
          perspective: 1200px;
        }
        .space-object {
          position: absolute;
          border: 1px solid #2a2a2a;
          border-radius: 18px;
          background:
            linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.02)),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.35) 0, rgba(255,255,255,0.35) 3px, transparent 3px, transparent 14px);
          box-shadow: 0 22px 80px rgba(0,0,0,0.65);
          transition: transform 300ms ease;
        }
        .space-object:hover {
          transform: translateZ(-40px) rotateX(28deg) rotateY(-28deg) scale(1.05);
        }
        .cube {
          position: absolute;
          border: 1px solid #2a2a2a;
          border-radius: 16px;
          background:
            linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.02)),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.35) 0, rgba(255,255,255,0.35) 3px, transparent 3px, transparent 12px);
          box-shadow: 0 22px 60px rgba(0,0,0,0.6);
          transition: transform 300ms ease;
        }
        .cube:hover {
          transform: rotateX(28deg) rotateY(-28deg) scale(1.05);
        }
        @media (max-width: 720px) {
          .nav {
            width: 92vw;
            padding: 8px 12px;
            top: 10px;
          }
          .nav-items { display: none; }
          .nav-brand { font-size: 10px; letter-spacing: 0.18em; }
          .nav-dot { width: 28px; height: 28px; border-radius: 14px; }
          .team-title { font-size: 30px; }
          .team-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-brand">Cubes Laborator</div>
        <div className="nav-items">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                fontSize: 10,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: scrolled ? '#cfcfcf' : '#e6e6e6',
                textDecoration: 'none',
                padding: '6px 10px',
                borderRadius: 999,
                border: '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2a2a2a'
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="nav-dot" />
      </div>

      <Parallax ref={parallax} pages={3} style={{ background: '#0a0a0a' }}>
        <ParallaxLayer offset={0} speed={0} factor={4} style={{ pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: 0.2 }}>
            <div style={{ width: '80vw', height: '80vh', display: 'grid', gridTemplateColumns: 'repeat(20, 1fr)', gap: 18 }}>
              {dots.map((_, index) => (
                <span key={`dot-${index}`} style={{ width: 2, height: 2, borderRadius: 2, background: '#f5f5f5' }} />
              ))}
            </div>
          </div>
        </ParallaxLayer>

        <ParallaxLayer offset={0} speed={0} factor={4} style={{ pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.18 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: '20%', height: 1, background: 'rgba(255,255,255,0.25)' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: '68%', height: 1, background: 'rgba(255,255,255,0.25)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '18%', width: 1, background: 'rgba(255,255,255,0.25)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '82%', width: 1, background: 'rgba(255,255,255,0.25)' }} />
          </div>
        </ParallaxLayer>

        <ParallaxLayer offset={0} speed={0.2}>
          <div style={{ paddingTop: '16vh', textAlign: 'center' }}>
            <div className="team-kicker">ABOUT TEAM</div>
            <div className="team-title">Cubes Lab</div>
            <div style={{ color: '#bdbdbd', letterSpacing: '0.08em' }}>Rus Vlad Andrei & Strajan Andrei</div>
          </div>
        </ParallaxLayer>

        <ParallaxLayer offset={0.35} speed={0.18} style={{ pointerEvents: 'none' }}>
          <div className="space-scene">
            {SPACE_OBJECTS.map((obj, index) => (
              <div
                key={`space-${index}`}
                className="space-object"
                style={{
                  width: obj.size,
                  height: obj.size,
                  left: obj.x,
                  top: obj.y,
                  transform: `translateZ(${obj.z}px) ${obj.rot}`
                }}
              />
            ))}
            {CUBES.map((cube, index) => (
              <div
                key={`cube-${index}`}
                className="cube"
                style={{
                  width: cube.size,
                  height: cube.size,
                  left: cube.x,
                  top: cube.y,
                  transform: cube.rot
                }}
              />
            ))}
          </div>
        </ParallaxLayer>

        {CLOUDS.map((cloud, index) => (
          <ParallaxLayer
            key={`cloud-${index}`}
            offset={0.6 + index * 0.15}
            speed={cloud.speed}
            style={{ pointerEvents: 'none' }}
          >
            <div
              style={{
                position: 'absolute',
                left: cloud.x,
                top: cloud.y,
                width: cloud.w,
                height: cloud.w * 0.6,
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.2)',
                background:
                  'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), rgba(255,255,255,0.04) 60%, transparent 70%)'
              }}
            />
          </ParallaxLayer>
        ))}

        <ParallaxLayer
          offset={1.1}
          speed={0.28}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ width: 'min(1100px, 90vw)', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 20 }}>
            <div className="team-card">
              <div className="team-name">Strajan Andrei</div>
              <div className="team-role">Matematica + Formule</div>
              <p className="team-body">
                Se ocupa de matematica si formulele din spate. Structureaza explicatiile si verifica logica fractalului.
              </p>
              <p className="team-body">
                Focus: corectitudine, structura, explicatii clare.
              </p>
            </div>
            <div className="team-card">
              <div className="team-name">Rus Vlad Andrei</div>
              <div className="team-role">Programator + UI + Hosting</div>
              <p className="team-body">
                Programare, UI, hosting si putin la matematica. Se ocupa de layout, flow si partea vizuala.
              </p>
              <p className="team-body">
                Focus: interactiuni, contrast, stil dark & smooth.
              </p>
            </div>
          </div>
        </ParallaxLayer>

        <ParallaxLayer
          offset={2}
          speed={0.55}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            style={{
              width: 'min(900px, 90vw)',
              padding: '22px 26px',
              borderRadius: 22,
              border: '1px solid #2a2a2a',
              background: 'rgba(255,255,255,0.04)'
            }}
          >
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              {NAV_ITEMS.map((item) => (
                <a
                  key={`nav-${item.href}`}
                  href={item.href}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 999,
                    border: '1px solid #3a3a3a',
                    textTransform: 'uppercase',
                    fontSize: 11,
                    letterSpacing: '0.16em',
                    color: '#f5f5f5',
                    textDecoration: 'none'
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>
            <p style={{ color: '#8a8a8a', textAlign: 'center', marginTop: 14, fontSize: 12 }}>
              R.V.A💘
            </p>
          </div>
        </ParallaxLayer>
      </Parallax>
    </div>
  )
}
