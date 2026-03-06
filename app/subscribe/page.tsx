'use client'

import { useState } from 'react'

export default function SubscribePage() {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleCheckout(plan: 'monthly' | 'yearly') {
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
      <h1 className="text-3xl font-extrabold text-center mb-2">Join Homeschool Connective</h1>
      <p className="text-center text-[#5c5c5c] mb-12">Get full access to all games, resources, and new content as it's added.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly */}
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center text-center" style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.08)' }}>
          <h2 className="text-xl font-extrabold mb-2">Monthly</h2>
          <p className="text-4xl font-extrabold text-[#ed7c5a] mb-1">$5</p>
          <p className="text-sm text-[#5c5c5c] mb-6">per month</p>
          <ul className="text-sm text-[#5c5c5c] space-y-2 mb-8 text-left w-full">
            <li>✓ Full access to all games</li>
            <li>✓ New content as it's added</li>
            <li>✓ Cancel anytime</li>
          </ul>
          <button
            onClick={() => handleCheckout('monthly')}
            disabled={loading !== null}
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
            <li>✓ Full access to all games</li>
            <li>✓ New content as it's added</li>
            <li>✓ Best value</li>
          </ul>
          <button
            onClick={() => handleCheckout('yearly')}
            disabled={loading !== null}
            className="w-full py-3 rounded-lg bg-white text-[#ed7c5a] font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {loading === 'yearly' ? 'Loading...' : 'Subscribe Yearly'}
          </button>
        </div>
      </div>
    </div>
  )
}
