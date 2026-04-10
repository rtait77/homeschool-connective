'use client'

import { useEffect } from 'react'

export default function AsteroidBlastDwarfPlanets() {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const nav = document.querySelector('nav')
    if (nav) (nav as HTMLElement).style.display = 'none'
    const viewport = document.querySelector('meta[name="viewport"]')
    const prevContent = viewport?.getAttribute('content') ?? ''
    viewport?.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    return () => {
      document.body.style.overflow = ''
      if (nav) (nav as HTMLElement).style.display = ''
      if (viewport && prevContent) viewport.setAttribute('content', prevContent)
    }
  }, [])

  return (
    <>
      <iframe
        src="/asteroid-blast-dwarf-planets.html"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 'none', zIndex: 100 }}
      />
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); window.history.back(); }}
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 200,
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.8rem',
          padding: '6px 14px',
          borderRadius: 20,
          textDecoration: 'none',
          letterSpacing: '0.01em',
          textShadow: '0 1px 4px rgba(0,0,0,0.9)',
        }}
      >
        ← Back to Games
      </a>
    </>
  )
}
