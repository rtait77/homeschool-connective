'use client'
import Link from 'next/link'
import { useEffect } from 'react'

export default function AsteroidBlastPlanetsPage() {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const nav = document.querySelector('nav')
    if (nav) (nav as HTMLElement).style.display = 'none'
    return () => {
      document.body.style.overflow = ''
      if (nav) (nav as HTMLElement).style.display = ''
    }
  }, [])

  return (
    <>
      <iframe
        src="/asteroid-blast-planets.html"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 'none', zIndex: 100 }}
      />
      <Link
        href="/learn"
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
      </Link>
    </>
  )
}
