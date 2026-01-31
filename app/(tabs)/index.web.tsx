import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Parallax, ParallaxLayer, type IParallax } from '@react-spring/parallax'

const url = (name: string, wrap = false) =>
  `${wrap ? 'url(' : ''}https://awv3node-homepage.surge.sh/build/assets/${name}.svg${wrap ? ')' : ''}`

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

export default function IndexWeb() {
  const parallax = useRef<IParallax>(null!)
  const [scrolled, setScrolled] = useState(false)
  const [cloudOpen, setCloudOpen] = useState(false)
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
        const progress = top / Math.max(1, container.scrollHeight - container.clientHeight)
        setCloudOpen(progress > 0.45)
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
        @media (max-width: 720px) {
          .nav {
            width: 92vw;
            padding: 8px 12px;
            top: 10px;
          }
          .nav-items {
            display: none;
          }
          .nav-brand {
            font-size: 10px;
            letter-spacing: 0.18em;
          }
          .nav-dot {
            width: 28px;
            height: 28px;
            border-radius: 14px;
          }
        }
        @keyframes floatSlow {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-18px); }
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

      <Parallax ref={parallax} pages={6} style={{ background: '#0a0a0a' }}>
        <ParallaxLayer offset={0} speed={0} factor={6} style={{ pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: 0.2 }}>
            <div style={{ width: '80vw', height: '80vh', display: 'grid', gridTemplateColumns: 'repeat(20, 1fr)', gap: 18 }}>
              {dots.map((_, index) => (
                <span key={`dot-${index}`} style={{ width: 2, height: 2, borderRadius: 2, background: '#f5f5f5' }} />
              ))}
            </div>
          </div>
        </ParallaxLayer>

        <ParallaxLayer offset={0} speed={0} factor={6} style={{ pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: '25%', height: 1, background: 'rgba(255,255,255,0.25)' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: '75%', height: 1, background: 'rgba(255,255,255,0.25)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '20%', width: 1, background: 'rgba(255,255,255,0.25)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '80%', width: 1, background: 'rgba(255,255,255,0.25)' }} />
          </div>
        </ParallaxLayer>

        <ParallaxLayer offset={0.9} speed={0.35} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: 0,
              right: 0,
              height: 260,
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0 8vw',
              opacity: 0.65
            }}
          >
            <img
              src={url('cloud')}
              style={{
                width: '28%',
                transform: cloudOpen ? 'translateX(-40%)' : 'translateX(0%)',
                transition: 'transform 600ms ease'
              }}
            />
            <img
              src={url('cloud')}
              style={{
                width: '30%',
                transform: cloudOpen ? 'translateX(40%)' : 'translateX(0%)',
                transition: 'transform 600ms ease'
              }}
            />
          </div>
        </ParallaxLayer>

        <ParallaxLayer offset={0.9} speed={0.35} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: 0,
              right: 0,
              height: 260,
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0 8vw',
              opacity: 0.65
            }}
          >
            <img
              src={url('cloud')}
              style={{
                width: '28%',
                transform: cloudOpen ? 'translateX(-40%)' : 'translateX(0%)',
                transition: 'transform 600ms ease'
              }}
            />
            <img
              src={url('cloud')}
              style={{
                width: '30%',
                transform: cloudOpen ? 'translateX(40%)' : 'translateX(0%)',
                transition: 'transform 600ms ease'
              }}
            />
          </div>
        </ParallaxLayer>

        <ParallaxLayer offset={1.3} speed={-0.3}>
          <div
            style={{
              width: 140,
              height: 140,
              marginLeft: '70%',
              borderRadius: 18,
              border: '1px solid #2a2a2a',
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.02)), repeating-linear-gradient(90deg, rgba(255,255,255,0.3) 0, rgba(255,255,255,0.3) 3px, transparent 3px, transparent 10px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              transform: 'rotateX(16deg) rotateY(-18deg)',
              animation: 'floatSlow 6s ease-in-out infinite alternate',
              transition: 'transform 300ms ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotateX(28deg) rotateY(-28deg) scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'rotateX(16deg) rotateY(-18deg)')}
          />
        </ParallaxLayer>

        <ParallaxLayer
          offset={2.5}
          speed={-0.4}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              width: '45vw',
              maxWidth: 520,
              aspectRatio: '1 / 1',
              borderRadius: 32,
              border: '1px solid #2a2a2a',
              background:
                'linear-gradient(145deg, rgba(255,255,255,0.2), rgba(255,255,255,0.02)), repeating-linear-gradient(0deg, rgba(255,255,255,0.35) 0, rgba(255,255,255,0.35) 3px, transparent 3px, transparent 12px)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
              transform: 'rotateX(12deg) rotateY(-18deg)',
              transition: 'transform 300ms ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotateX(22deg) rotateY(-30deg) scale(1.03)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'rotateX(12deg) rotateY(-18deg)')}
          />
        </ParallaxLayer>

        <ParallaxLayer
          offset={0}
          speed={0.2}
          onClick={() => parallax.current.scrollTo(1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 18
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '10vw',
                fontWeight: 900,
                textTransform: 'uppercase',
                backgroundImage:
                  'repeating-linear-gradient(90deg, rgba(255,255,255,0.9) 0, rgba(255,255,255,0.9) 6px, rgba(255,255,255,0.15) 6px, rgba(255,255,255,0.15) 12px)',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}
            >
              Menger Sponge
            </div>
            <div
              style={{
                color: '#bdbdbd',
                letterSpacing: '0.08em'
              }}
            >
             💘The art of nature
            </div>
          </div>
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: 16,
              border: '1px solid #2a2a2a',
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05)), repeating-linear-gradient(0deg, rgba(255,255,255,0.2) 0, rgba(255,255,255,0.2) 2px, transparent 2px, transparent 8px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              transform: 'rotateX(14deg) rotateY(12deg)',
              transition: 'transform 300ms ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotateX(24deg) rotateY(24deg) scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'rotateX(14deg) rotateY(12deg)')}
          />
        </ParallaxLayer>

        <ParallaxLayer offset={0.6} speed={0.18}>
          <div
            style={{
              width: 110,
              height: 110,
              marginLeft: '12%',
              borderRadius: 14,
              border: '1px solid #2a2a2a',
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.04)), repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.25) 2px, transparent 2px, transparent 9px)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
              transform: 'rotateX(12deg) rotateY(16deg)',
              transition: 'transform 300ms ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotateX(22deg) rotateY(28deg) scale(1.06)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'rotateX(12deg) rotateY(16deg)')}
          />
        </ParallaxLayer>

        <ParallaxLayer offset={1.9} speed={-0.15}>
          <div
            style={{
              width: 150,
              height: 150,
              marginLeft: '75%',
              borderRadius: 18,
              border: '1px solid #2a2a2a',
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.03)), repeating-linear-gradient(0deg, rgba(255,255,255,0.28) 0, rgba(255,255,255,0.28) 2px, transparent 2px, transparent 10px)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.55)',
              transform: 'rotateX(18deg) rotateY(-20deg)',
              transition: 'transform 300ms ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotateX(30deg) rotateY(-30deg) scale(1.04)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'rotateX(18deg) rotateY(-20deg)')}
          />
        </ParallaxLayer>

        <ParallaxLayer
          offset={1}
          speed={0.25}
          onClick={() => parallax.current.scrollTo(2)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: '10vw' }}
        >
          <div style={{ maxWidth: 720 }}>
            <h2 style={{ fontSize: '5vw', margin: 0, textTransform: 'uppercase' }}>Rule</h2>
            <p style={{ color: '#cfcfcf', lineHeight: 1.7 }}>
              Split a cube into 27 parts, remove the center and the six face-centered cubes, and repeat forever. Each step
              keeps 20 cubes and scales by 1/3.
            </p>
          </div>
        </ParallaxLayer>

        <ParallaxLayer
          offset={2}
          speed={0.3}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ maxWidth: 760, padding: '20px 26px', border: '1px solid #2a2a2a', borderRadius: 18 }}>
            <h2 style={{ fontSize: '4.5vw', margin: 0 }}>Infinite Surface</h2>
            <p style={{ color: '#bdbdbd', lineHeight: 1.7 }}>
              Surface area explodes while the volume tends to zero. This paradox is the Menger sponge signature.
            </p>
          </div>
        </ParallaxLayer>

        <ParallaxLayer
          offset={3}
          speed={0.35}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: '10vw' }}
        >
          <div style={{ maxWidth: 760 }}>
            <h2 style={{ fontSize: '4.5vw', margin: 0 }}>Iterations</h2>
            <p style={{ color: '#bdbdbd', lineHeight: 1.7 }}>
              Cube count grows as 20^n. The smallest cubes shrink as (1/3)^n. Depth comes from repeated subtraction.
            </p>
          </div>
        </ParallaxLayer>

        <ParallaxLayer
          offset={4}
          speed={0.45}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: '10vw' }}
        >
          <div style={{ maxWidth: 760 }}>
            <h2 style={{ fontSize: '4.5vw', margin: 0 }}>About Team</h2>
            <p style={{ color: '#bdbdbd', lineHeight: 1.7 }}>
                          Built by Strajan Andrei and Rus Vlad-Andrei with 💘 and precision.

            </p>
          </div>
        </ParallaxLayer>

        <ParallaxLayer
          offset={5}
          speed={0.7}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            style={{
              width: 'min(1000px, 90vw)',
              padding: '24px 28px',
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
              Check the other pages(:
            </p>
          </div>
        </ParallaxLayer>
      </Parallax>
    </div>
  )
}
