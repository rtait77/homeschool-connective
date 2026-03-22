'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

export default function SubscribePage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [agreedToTos, setAgreedToTos] = useState(false)
  const [emailOptIn, setEmailOptIn] = useState(false)
  const [showTrial, setShowTrial] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('trial_end, subscription_status')
        .eq('id', user.id)
        .single()
      const trialActive = profile?.trial_end && new Date(profile.trial_end) > new Date()
      const trialExpired = profile?.trial_end && new Date(profile.trial_end) <= new Date()
      const subscribed = profile?.subscription_status === 'active'
      if (trialActive || trialExpired || subscribed) setShowTrial(false)
    }
    checkUser()
  }, [])

  async function handleCheckout(plan: 'monthly' | 'yearly') {
    if (!agreedToTos) return
    setLoading(plan)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const { url } = await res.json()
    window.location.href = url
  }

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-16">
      <h1 className="text-3xl font-extrabold text-center mb-2">Plans & Pricing</h1>
      <p className="text-center text-[#5c5c5c] mb-12">Two ways to get support for your homeschool.</p>

      {/* Free trial CTA — hidden for users already trialing or subscribed */}
      {showTrial && (
        <div className="bg-[#f5f1e9] rounded-2xl p-6 text-center mb-10">
          <p className="font-extrabold mb-1">Try games free for 7 days</p>
          <p className="text-[#5c5c5c] text-sm mb-4">No credit card required. Full access. Cancel anytime.</p>
          <Link href="/signup" className="inline-block bg-[#ed7c5a] text-white font-bold px-8 py-3 rounded-lg text-sm hover:opacity-90 transition">
            Start Free Trial
          </Link>
          <p className="text-xs text-[#5c5c5c] mt-3">Already have an account? <Link href="/login" className="text-[#238FA4] font-bold hover:underline">Log in</Link></p>
        </div>
      )}

      {/* Terms — required for games checkout */}
      <div className="bg-white rounded-2xl p-5 mb-6 flex flex-col gap-3" style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
        <p className="text-xs font-bold text-[#5c5c5c] uppercase tracking-wide">Required to subscribe to games:</p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={agreedToTos} onChange={e => setAgreedToTos(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#ed7c5a] flex-shrink-0" />
          <span className="text-xs text-[#5c5c5c]">
            I agree to the <a href="/terms" target="_blank" className="text-[#238FA4] font-bold hover:underline">Terms of Service</a> and <a href="/privacy" target="_blank" className="text-[#238FA4] font-bold hover:underline">Privacy Policy</a> <span className="text-red-400">*</span>
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={emailOptIn} onChange={e => setEmailOptIn(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#ed7c5a] flex-shrink-0" />
          <span className="text-xs text-[#5c5c5c]">I&apos;d like to receive updates about new games, lessons, and homeschool tips. You can unsubscribe anytime.</span>
        </label>
      </div>

      {/* 3-column side-by-side grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

        {/* Consulting */}
        <div className="bg-white rounded-2xl p-7 border-2 border-[#ed7c5a] flex flex-col" style={{ boxShadow: '0 4px 20px rgba(237,124,90,0.12)' }}>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#55b6ca] mb-3">One-on-One Consulting</p>
          <p className="text-3xl font-extrabold text-[#ed7c5a] mb-0">$47</p>
          <p className="text-xs text-[#a09890] mb-5">one-time payment</p>
          <ul className="text-sm text-[#3a3a3a] space-y-2 mb-4 flex-1">
            <li>✓ Deep-dive intake form</li>
            <li>✓ Personalized recommendations</li>
            <li>✓ Learning style & method match</li>
            <li>✓ 3 months of email support with Mel</li>
            <li className="text-[#55b6ca] font-bold">✓ 7-day games trial included</li>
          </ul>
          <p className="text-xs text-[#a09890] mb-5">Option to subscribe to games after your trial if you choose.</p>
          <Link href="/consulting#pricing" className="block w-full py-3 rounded-lg bg-[#ed7c5a] text-white font-bold text-sm text-center hover:opacity-90 transition">
            Learn More & Get Started →
          </Link>
        </div>

        {/* Monthly Games */}
        <div className="bg-white rounded-2xl p-7 flex flex-col" style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.08)' }}>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#55b6ca] mb-3">Games Subscription</p>
          <p className="text-3xl font-extrabold text-[#ed7c5a] mb-0">$5</p>
          <p className="text-xs text-[#a09890] mb-5">per month</p>
          <ul className="text-sm text-[#5c5c5c] space-y-2 mb-6 flex-1">
            <li>✓ Full access to all games & lessons</li>
            <li>✓ New content as it&apos;s added</li>
            <li>✓ Cancel anytime</li>
          </ul>
          <button onClick={() => handleCheckout('monthly')} disabled={loading !== null || !agreedToTos} className="w-full py-3 rounded-lg bg-[#ed7c5a] text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-50 mt-auto">
            {loading === 'monthly' ? 'Loading...' : 'Subscribe Monthly'}
          </button>
          {!agreedToTos && <p className="text-xs text-[#a09890] text-center mt-2">Agree to terms above to subscribe</p>}
        </div>

        {/* Yearly Games */}
        <div className="bg-[#ed7c5a] rounded-2xl p-7 flex flex-col text-white relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#55b6ca] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">BEST VALUE</span>
          <p className="text-xs font-extrabold uppercase tracking-widest text-white/70 mb-3">Games Subscription</p>
          <p className="text-3xl font-extrabold mb-0">$50</p>
          <p className="text-xs text-white/70 mb-1">per year</p>
          <p className="text-xs font-bold mb-5">Save $10 vs monthly!</p>
          <ul className="text-sm text-white/90 space-y-2 mb-6 flex-1">
            <li>✓ Full access to all games & lessons</li>
            <li>✓ New content as it&apos;s added</li>
            <li>✓ Best value</li>
          </ul>
          <button onClick={() => handleCheckout('yearly')} disabled={loading !== null || !agreedToTos} className="w-full py-3 rounded-lg bg-white text-[#ed7c5a] font-bold text-sm hover:opacity-90 transition disabled:opacity-50 mt-auto">
            {loading === 'yearly' ? 'Loading...' : 'Subscribe Yearly'}
          </button>
          {!agreedToTos && <p className="text-xs text-white/60 text-center mt-2">Agree to terms above to subscribe</p>}
        </div>

      </div>
    </div>
  )
}
