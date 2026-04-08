'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

export default function ConsultingSuccessPage() {
  const [intakeSubmitted, setIntakeSubmitted] = useState(false)
  const [checked, setChecked] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        subscription.unsubscribe()
        if (!session?.user) { setChecked(true); return }
        const res = await fetch('/api/consulting/load-intake')
        if (res.ok) {
          const data = await res.json()
          setIntakeSubmitted(data.status === 'submitted')
        }
        setChecked(true)
      }
    })
  }, [])

  return (
    <div className="max-w-[600px] mx-auto px-6 py-20 text-center">
      <div className="text-5xl mb-6">🎉</div>
      <h1 className="text-3xl font-extrabold mb-3">Welcome! Mel can't wait to help your family.</h1>
      <p className="text-[#5c5c5c] mb-2">Check your email — a welcome message with next steps is on its way.</p>
      <p className="text-[#5c5c5c] mb-10 text-sm">If you don't see it within a few minutes, check your spam folder.</p>

      {checked && !intakeSubmitted && (
        <div className="bg-[#f5f1e9] rounded-2xl p-6 mb-6 border border-[#e2ddd5]">
          <p className="font-extrabold text-lg mb-2">Next step: complete your intake form</p>
          <p className="text-sm text-[#5c5c5c] mb-5">Mel will use your answers to build personalized curriculum recommendations for your family. The form saves as you go — no need to finish in one sitting.</p>
          <Link
            href="/dashboard/intake"
            className="inline-block bg-[#ed7c5a] text-white font-bold px-8 py-3 rounded-xl text-sm hover:opacity-90 transition"
          >
            Complete My Intake Form →
          </Link>
        </div>
      )}

      {checked && intakeSubmitted && (
        <div className="bg-[#d1f5ea] rounded-2xl p-6 mb-6 border border-[#a3e6cc]">
          <p className="font-extrabold text-lg mb-1 text-[#1a7a52]">Intake form submitted!</p>
          <p className="text-sm text-[#1a7a52]">Mel will review your answers and be in touch within 3–5 business days.</p>
        </div>
      )}

      <Link href="/dashboard" className="text-sm font-bold text-[#238FA4] hover:underline">
        Go to my dashboard →
      </Link>
    </div>
  )
}
