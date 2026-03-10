'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SubscribePage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [agreedToTos, setAgreedToTos] = useState(false)
  const [emailOptIn, setEmailOptIn] = useState(false)

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
    <div className="max-w-[900px] mx-auto px-6 py-16">
      <h1 className="text-3xl font-extrabold text-center mb-2">Get Full Access</h1>
      <p className="text-center text-[#5c5c5c] mb-4">All games, all topics, new content added regularly.</p>

      {/* Free trial CTA */}
      <div className="bg-[#f5f1e9] rounded-2xl p-8 text-center mb-10">
        <h2 className="text-xl font-extrabold mb-2">Try it free for 7 days</h2>
        <p className="text-[#5c5c5c] text-sm mb-6">No credit card required. Full access to all games and lessons. Cancel anytime.</p>
        <Link
          href="/signup"
          className="inline-block bg-[#ed7c5a] text-white font-bold px-10 py-4 rounded-lg text-base hover:opacity-90 transition"
        >
          Start 7 Day Free Trial
        </Link>
        <p className="text-xs text-[#5c5c5c] mt-4">Already have an account? <Link href="/login" className="text-[#238FA4] font-bold hover:underline">Log in</Link></p>
      </div>

      <p className="text-center text-sm text-[#5c5c5c] mb-8">After your trial, choose a plan:</p>

      <div className="bg-white rounded-2xl p-6 mb-6 flex flex-col gap-3" style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.08)' }}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToTos}
            onChange={e => setAgreedToTos(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#ed7c5a] flex-shrink-0"
          />
          <span className="text-xs text-[#5c5c5c]">
            I agree to the <a href="/terms" target="_blank" className="text-[#238FA4] font-bold hover:underline">Terms of Service</a> and <a href="/privacy" target="_blank" className="text-[#238FA4] font-bold hover:underline">Privacy Policy</a> <span className="text-red-400">*</span>
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={emailOptIn}
            onChange={e => setEmailOptIn(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#ed7c5a] flex-shrink-0"
          />
          <span className="text-xs text-[#5c5c5c]">
            I'd like to receive updates about new games, lessons, and homeschool tips from Homeschool Connective. You can unsubscribe anytime.
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly */}
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center text-center" style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.08)' }}>
          <h2 className="text-xl font-extrabold mb-2">Monthly</h2>
          <p className="text-4xl font-extrabold text-[#ed7c5a] mb-1">$5</p>
          <p className="text-sm text-[#5c5c5c] mb-6">per month</p>
          <ul className="text-sm text-[#5c5c5c] space-y-2 mb-8 text-left w-full">
            <li>✓ Full access to all games and lessons</li>
            <li>✓ New content as it's added</li>
            <li>✓ Cancel anytime</li>
          </ul>
          <button
            onClick={() => handleCheckout('monthly')}
            disabled={loading !== null || !agreedToTos}
            className="w-full py-3 rounded-lg bg-[#ed7c5a] text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {loading === 'monthly' ? 'Loading...' : 'Subscribe Monthly'}
          </button>
        </div>

        {/* Yearly */}
        <div className="bg-[#ed7c5a] rounded-2xl p-8 flex flex-col items-center text-center text-white relative">
          <span className="absolute -top-3 bg-[#55b6ca] text-white text-xs font-bold px-4 py-1 rounded-full">BEST VALUE</span>
          <h2 className="text-xl font-extrabold mb-2">Yearly</h2>
          <p className="text-4xl font-extrabold mb-1">$50</p>
          <p className="text-sm opacity-80 mb-1">per year</p>
          <p className="text-sm font-bold mb-6">Save $10 vs monthly!</p>
          <ul className="text-sm opacity-90 space-y-2 mb-8 text-left w-full">
            <li>✓ Full access to all games and lessons</li>
            <li>✓ New content as it's added</li>
            <li>✓ Best value</li>
          </ul>
          <button
            onClick={() => handleCheckout('yearly')}
            disabled={loading !== null || !agreedToTos}
            className="w-full py-3 rounded-lg bg-white text-[#ed7c5a] font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {loading === 'yearly' ? 'Loading...' : 'Subscribe Yearly'}
          </button>
        </div>
      </div>
    </div>
  )
}
