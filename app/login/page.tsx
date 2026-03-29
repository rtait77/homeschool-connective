'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(true)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out. Please try again.')), 10000)
      )
      const authCall = supabase.auth.signInWithPassword({ email, password })
      const { data, error } = await Promise.race([authCall, timeout]) as Awaited<typeof authCall>

      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        router.push(data.user?.email === 'support@homeschoolconnective.com' ? '/admin' : '/learn')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[480px] mx-auto px-6 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold mb-2">Welcome back!</h1>
        <p className="text-[#5c5c5c] text-sm">Log in to access your games.</p>
      </div>

      <form onSubmit={handleLogin} className="bg-white rounded-2xl p-8 flex flex-col gap-4" style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.08)' }}>
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
              placeholder="Your password"
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
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <p className="text-center text-xs text-[#5c5c5c]">
          Don't have an account? <Link href="/signup" className="text-[#238FA4] font-bold hover:underline">Start free trial</Link>
        </p>
      </form>
    </div>
  )
}
