'use client'
import { useEffect } from 'react'

export default function BuildARoverPage() {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return (
    <iframe
      src="/build-a-rover.html"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        border: 'none',
        zIndex: 100,
      }}
    />
  )
}
