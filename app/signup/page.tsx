'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

export default function SignupPage() {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [showPassword, setShowPassword] = useState(true)
  const [agreedToTos, setAgreedToTos] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { first_name: firstName.trim() },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="max-w-[480px] mx-auto px-6 py-24 text-center">
        <div className="text-5xl mb-6">📬</div>
        <h1 className="text-2xl font-extrabold mb-4">Check your email!</h1>
        <p className="text-[#5c5c5c]">We sent a confirmation link to <strong>{email}</strong>. Click it to activate your 7-day free trial.</p>
      </div>
    )
  }

  return (
    <div className="max-w-[480px] mx-auto px-6 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold mb-2">Start your free 7-day trial</h1>
        <p className="text-[#5c5c5c] text-sm">No credit card required. Full access to all games.</p>
      </div>

      <form onSubmit={handleSignup} className="bg-white rounded-2xl p-8 flex flex-col gap-4" style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.08)' }}>
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

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={agreedToTos}
            onChange={e => setAgreedToTos(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#ed7c5a] flex-shrink-0"
          />
          <span className="text-xs text-[#5c5c5c]">
            I agree to the <a href="/terms" target="_blank" className="text-[#238FA4] font-bold hover:underline">Terms of Service</a> and <a href="/privacy" target="_blank" className="text-[#238FA4] font-bold hover:underline">Privacy Policy</a>
          </span>
        </label>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || !agreedToTos}
          className="w-full py-3 rounded-lg bg-[#ed7c5a] text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Start 7 Day Free Trial'}
        </button>

        <p className="text-center text-xs text-[#5c5c5c]">
          Already have an account? <Link href="/login" className="text-[#238FA4] font-bold hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  )
}
