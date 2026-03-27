'use client'

import { useEffect, useRef } from 'react'

export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    video.muted = true
    video.play().catch(() => {})
  }, [])

  return (
    <video
      ref={ref}
      autoPlay
      muted
      playsInline
      loop
      className="w-full block"
      style={{ maxHeight: '58vh', objectFit: 'cover', objectPosition: 'center 40%' }}
    >
      <source src="/new-hero-video.mp4" type="video/mp4" />
    </video>
  )
}
