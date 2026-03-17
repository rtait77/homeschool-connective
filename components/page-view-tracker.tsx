'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const TRACKED_PATHS = ['/', '/learn', '/pricing', '/tips', '/about', '/contact']

export default function PageViewTracker() {
  const pathname = usePathname()
  const lastTracked = useRef<string | null>(null)

  useEffect(() => {
    if (!TRACKED_PATHS.includes(pathname)) return
    if (lastTracked.current === pathname) return
    lastTracked.current = pathname

    fetch('/api/track/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {})
  }, [pathname])

  return null
}
