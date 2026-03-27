'use client'
import Link from 'next/link'
import { useEffect } from 'react'

export default function AsteroidBlastGasGiantsPage() {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return (
    <>
      <iframe
        src="/asteroid-blast-gas-giants.html"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 'none', zIndex: 100 }}
      />
      <Link
        href="/learn"
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 200,
          backgroundColor: 'rgba(0,0,0,0.55)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.8rem',
          padding: '6px 14px',
          borderRadius: 20,
          textDecoration: 'none',
          backdropFilter: 'blur(4px)',
          letterSpacing: '0.01em',
        }}
      >
        ← Back to Games
      </Link>
    </>
  )
}
