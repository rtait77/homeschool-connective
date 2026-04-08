'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

export default function SuccessPage() {
  const [ready, setReady] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        subscription.unsubscribe()
        setReady(true)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe()
        setReady(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="max-w-[600px] mx-auto px-6 py-24 text-center">
      <div className="text-5xl mb-6">🎉</div>
      <h1 className="text-3xl font-extrabold mb-4">You're subscribed!</h1>
      <p className="text-[#5c5c5c] mb-8">Welcome to Homeschool Connective. You now have full access to all games and resources.</p>
      {ready ? (
        <Link href="/learn" className="inline-block bg-[#ed7c5a] text-white font-bold px-8 py-3 rounded-lg hover:opacity-90 transition">
          Start Learning →
        </Link>
      ) : (
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-3 border-[#ed7c5a] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#5c5c5c] text-sm font-semibold">Setting up your account...</span>
        </div>
      )}
    </div>
  )
}
