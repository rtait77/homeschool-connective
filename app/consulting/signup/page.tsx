'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ConsultingSignupPage() {
  const supabase = createClient()
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Create account via admin API (auto-confirmed)
    const res = await fetch('/api/consulting-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, email, password }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong.')
      setLoading(false)
      return
    }

    // Sign in with the new credentials
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('Account created but could not sign in. Please go to the login page.')
      setLoading(false)
      return
    }

    // Redirect to Stripe checkout
    const checkoutRes = await fetch('/api/checkout-consulting', { method: 'POST' })
    const { url, error: checkoutError } = await checkoutRes.json()
    if (checkoutError || !url) {
      setError('Could not start checkout. Please try again.')
      setLoading(false)
      return
    }

    window.location.href = url
  }

  return (
    <div className="max-w-[480px] mx-auto px-6 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold mb-2">Create your account</h1>
        <p className="text-[#5c5c5c] text-sm">You'll use this to access your dashboard and intake form after payment.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 flex flex-col gap-4" style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.08)' }}>
        <div>
          <label className="block text-sm font-bold mb-1">First Name</label>
          <input
            type="text"
            required
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            className="w-full border border-[#ddd8cc] rounded-lg px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#55b6ca]"
            placeholder="Your first name"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-[#ddd8cc] rounded-lg px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#55b6ca]"
            placeholder="you@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-[#ddd8cc] rounded-lg px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#55b6ca]"
              placeholder="At least 6 characters"
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5c5c5c] hover:text-[#1c1c1c] text-xs font-bold"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-[#ed7c5a] text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'Setting up your account...' : 'Continue to Payment →'}
        </button>

        <p className="text-center text-xs text-[#5c5c5c]">
          Already have an account? <a href="/login" className="text-[#238FA4] font-bold hover:underline">Log in</a>
        </p>
      </form>
    </div>
  )
}
