'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type ModalTarget = 'monthly' | 'yearly' | 'consulting' | null

function TermsModal({
  target,
  onClose,
  onConfirm,
  loading,
}: {
  target: ModalTarget
  onClose: () => void
  onConfirm: (emailOptIn: boolean) => void
  loading: boolean
}) {
  const [agreedToTos, setAgreedToTos] = useState(false)
  const [emailOptIn, setEmailOptIn] = useState(false)

  const label = target === 'consulting'
    ? 'Get Started — $47'
    : target === 'yearly'
    ? 'Subscribe Yearly — $50/yr'
    : 'Subscribe Monthly — $5/mo'

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '36px 32px', maxWidth: 480, width: '100%', position: 'relative', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 20, background: 'none', border: 'none', fontSize: '1.4rem', color: '#a09890', cursor: 'pointer', lineHeight: 1 }}
        >×</button>

        <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#55b6ca', marginBottom: 8 }}>Almost there!</p>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1c1c1c', marginBottom: 20 }}>Before you continue</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={agreedToTos}
              onChange={e => setAgreedToTos(e.target.checked)}
              style={{ marginTop: 2, width: 16, height: 16, accentColor: '#ed7c5a', flexShrink: 0, cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.85rem', color: '#3a3a3a', lineHeight: 1.6 }}>
              I agree to the{' '}
              <a href="/terms" target="_blank" style={{ color: '#238FA4', fontWeight: 700 }}>Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" target="_blank" style={{ color: '#238FA4', fontWeight: 700 }}>Privacy Policy</a>
              {' '}<span style={{ color: '#f87171' }}>*</span>
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={emailOptIn}
              onChange={e => setEmailOptIn(e.target.checked)}
              style={{ marginTop: 2, width: 16, height: 16, accentColor: '#ed7c5a', flexShrink: 0, cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.85rem', color: '#5c5c5c', lineHeight: 1.6 }}>
              I&apos;d like to receive updates about new games, lessons, and homeschool tips. You can unsubscribe anytime.
            </span>
          </label>
        </div>

        <button
          onClick={() => onConfirm(emailOptIn)}
          disabled={!agreedToTos || loading}
          style={{ width: '100%', backgroundColor: agreedToTos && !loading ? '#ed7c5a' : '#d4cdc8', color: '#fff', fontWeight: 800, fontSize: '0.95rem', padding: '0.85rem', borderRadius: 12, border: 'none', cursor: agreedToTos && !loading ? 'pointer' : 'not-allowed', transition: 'background-color 0.15s', marginBottom: 10 }}
        >
          {loading ? 'Loading...' : label + ' →'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#a09890', margin: 0 }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#a09890', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.78rem' }}>Cancel</button>
        </p>
      </div>
    </div>
  )
}

export default function SubscribePage() {
  const [gamesPlan, setGamesPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [modalTarget, setModalTarget] = useState<ModalTarget>(null)
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )


  async function handleConfirm(emailOptIn: boolean) {
    if (!modalTarget) return
    setLoading(true)

    if (modalTarget === 'consulting') {
      const res = await fetch('/api/checkout-consulting', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      const { url } = await res.json()
      window.location.href = url
      return
    }

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: modalTarget }),
    })
    const { url } = await res.json()
    window.location.href = url
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-16">
      {modalTarget && (
        <TermsModal
          target={modalTarget}
          onClose={() => { setModalTarget(null); setLoading(false) }}
          onConfirm={handleConfirm}
          loading={loading}
        />
      )}

      <h1 className="text-3xl font-extrabold text-center mb-2">Plans & Pricing</h1>
      <p className="text-center text-[#5c5c5c] mb-12">Two ways to get support for your homeschool.</p>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

        {/* Consulting card */}
        <div className="bg-white rounded-2xl p-7 border-2 border-[#ed7c5a] flex flex-col" style={{ boxShadow: '0 4px 20px rgba(237,124,90,0.12)' }}>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#55b6ca] mb-3">One-on-One Consulting</p>
          <p className="text-3xl font-extrabold text-[#ed7c5a] mb-0">$47</p>
          <p className="text-xs text-[#a09890] mb-5">one-time payment</p>
          <ul className="text-sm text-[#3a3a3a] space-y-2 mb-4 flex-1">
            <li>✓ Deep-dive intake form</li>
            <li>✓ Personalized recommendations</li>
            <li>✓ Learning style &amp; method match</li>
            <li>✓ 3 months of email support with Mel</li>
            <li className="text-[#55b6ca] font-bold">✓ 7-day games trial included</li>
          </ul>
          <p className="text-xs text-[#a09890] mb-5">Option to subscribe to games after your trial if you choose.</p>
          <a href="/consulting" className="text-sm font-bold text-[#55b6ca] hover:underline mb-4 inline-block">Learn more about consulting →</a>
          <button
            onClick={() => setModalTarget('consulting')}
            className="block w-full py-3 rounded-lg bg-[#ed7c5a] text-white font-bold text-sm text-center hover:opacity-90 transition"
          >
            Get Started →
          </button>
        </div>

        {/* Games card with toggle */}
        <div className="bg-white rounded-2xl p-7 border-2 border-[#ed7c5a] flex flex-col relative" style={{ boxShadow: '0 4px 20px rgba(237,124,90,0.12)' }}>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#55b6ca] mb-4">Games/Lessons/Printables Subscription</p>

          {/* Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-[#e2ddd5] mb-5 self-start w-full">
            <button
              onClick={() => setGamesPlan('monthly')}
              className={`flex-1 py-2 text-sm font-bold transition ${gamesPlan === 'monthly' ? 'bg-[#ed7c5a] text-white' : 'bg-white text-[#5c5c5c] hover:bg-[#fdf8f5]'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setGamesPlan('yearly')}
              className={`flex-1 py-2 text-sm font-bold transition ${gamesPlan === 'yearly' ? 'bg-[#ed7c5a] text-white' : 'bg-white text-[#5c5c5c] hover:bg-[#fdf8f5]'}`}
            >
              Yearly
            </button>
          </div>

          {/* Price */}
          <div className="flex items-end gap-2 mb-1">
            <p className="text-3xl font-extrabold text-[#ed7c5a]">{gamesPlan === 'monthly' ? '$5' : '$50'}</p>
            <p className="text-xs text-[#a09890] mb-1">{gamesPlan === 'monthly' ? 'per month' : 'per year'}</p>
            {gamesPlan === 'yearly' && (
              <span className="mb-1 bg-[#55b6ca] text-white text-xs font-bold px-3 py-0.5 rounded-full">BEST VALUE</span>
            )}
          </div>
          <p className="text-xs font-bold text-[#55b6ca] mb-5" style={{ minHeight: '1.25rem' }}>
            {gamesPlan === 'yearly' ? 'Save $10 vs monthly!' : ''}
          </p>

          <ul className="text-sm text-[#5c5c5c] space-y-2 mb-6 flex-1">
            <li>✓ Full access to all games &amp; lessons</li>
            <li>✓ Access to all printables</li>
            <li>✓ New content as it&apos;s added</li>
            <li>✓ Cancel anytime</li>
          </ul>

          <button
            onClick={() => setModalTarget(gamesPlan)}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#ed7c5a] text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-50 mt-auto"
          >
            {gamesPlan === 'monthly' ? 'Subscribe Monthly' : 'Subscribe Yearly'}
          </button>
        </div>

      </div>
    </div>
  )
}
