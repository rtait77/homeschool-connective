'use client'

import Image from 'next/image'
import { useState } from 'react'

type Plan = 'consulting' | 'bundle-monthly' | 'bundle-yearly'

const PLAN_LABELS: Record<Plan, string> = {
  'consulting': 'Sign Up & Pay — $47',
  'bundle-monthly': 'Sign Up & Pay — $52',
  'bundle-yearly': 'Sign Up & Pay — $97',
}

export default function ConsultingPage() {
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<Plan>('consulting')

  async function handleCheckout() {
    setLoading(true)
    let endpoint = '/api/checkout-consulting'
    let body: string | undefined

    if (plan === 'bundle-monthly' || plan === 'bundle-yearly') {
      endpoint = '/api/checkout-bundle'
      body = JSON.stringify({ plan: plan === 'bundle-monthly' ? 'monthly' : 'yearly' })
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
    const { url } = await res.json()
    window.location.href = url
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-14">

      {/* Hero */}
      <div className="flex flex-col sm:flex-row items-center gap-8 mb-16">
        <div className="flex-shrink-0">
          <Image
            src="/melanie.avif"
            alt="Mel"
            width={160}
            height={160}
            className="rounded-full object-cover w-40 h-40"
          />
        </div>
        <div>
          <p className="text-sm font-bold text-[#55b6ca] uppercase tracking-widest mb-2">One-on-One Help</p>
          <h1 className="text-3xl font-extrabold mb-3">Personalized Homeschool Consulting with Mel</h1>
          <p className="text-[#5c5c5c] mb-3">With over 25 years of homeschooling experience, I have dedicated my life to nurturing young learners and supporting families on their educational journeys. I began homeschooling my own children in 2000, and today I have the joy of homeschooling my grandchildren.</p>
          <p className="text-[#5c5c5c] mb-3">Along the way, I have worked in a homeschool co-op as assistant director, at church nursery as coordinator, and a pre-K center as lead teacher, giving me a well-rounded perspective on how children learn best in a variety of settings. I am passionate about coming alongside other homeschooling families as a mentor, helping them find curriculum and resources that truly fit their unique family, teaching style, and children's needs.</p>
          <p className="text-[#5c5c5c]">I also create educational resources designed specifically for homeschoolers in grades Pre-K through 3rd grade, with a focus on making learning engaging, accessible, and effective for all types of learners.</p>
        </div>
      </div>

      {/* How it works */}
      <div className="mb-14">
        <h2 className="text-2xl font-extrabold mb-6">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { num: '1', title: 'Sign Up & Pay', desc: 'Complete your purchase to get started.' },
            { num: '2', title: 'Intake Form & Quiz', desc: 'Mel sends you a short intake form and a learning style quiz.' },
            { num: '3', title: 'Personalized Recommendations', desc: 'Mel reviews your responses and puts together curriculum suggestions tailored to your family.' },
            { num: '4', title: '3 Months of Support', desc: 'Ask questions by email anytime. Mel is here to help you adjust and grow.' },
          ].map(step => (
            <div key={step.num} className="bg-white rounded-[14px] p-5 border border-[#e2ddd5] text-center" style={{ boxShadow: '0 3px 18px rgba(0,0,0,0.08)' }}>
              <div className="w-10 h-10 rounded-full bg-[#ed7c5a] text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-3">{step.num}</div>
              <p className="font-extrabold mb-1">{step.title}</p>
              <p className="text-sm text-[#5c5c5c]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Info blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-14">
        <div className="bg-[#f5f1e9] rounded-[14px] p-7">
          <p className="text-2xl mb-3">📋</p>
          <h3 className="font-extrabold text-lg mb-2">The Intake Form</h3>
          <p className="text-sm text-[#5c5c5c]">After you sign up, Mel will send you a short intake form. It covers your child's age and grade, how long you've been homeschooling, what's working, what isn't, and what you're hoping to achieve. This gives Mel the full picture she needs to help you well.</p>
        </div>
        <div className="bg-[#f5f1e9] rounded-[14px] p-7">
          <p className="text-2xl mb-3">🧠</p>
          <h3 className="font-extrabold text-lg mb-2">The Learning Style Quiz</h3>
          <p className="text-sm text-[#5c5c5c]">Every child learns differently — and so does every parent teach. The quiz helps Mel understand how your child absorbs information and how you feel most comfortable guiding them. This is key to recommending curriculum that will actually work for your family.</p>
        </div>
        <div className="bg-[#f5f1e9] rounded-[14px] p-7">
          <p className="text-2xl mb-3">📚</p>
          <h3 className="font-extrabold text-lg mb-2">Curriculum Recommendations</h3>
          <p className="text-sm text-[#5c5c5c]">Based on your intake form and quiz results, Mel will put together a personalized email with curriculum suggestions that fit your child, your teaching style, and your budget. No niche — Mel works with families across all homeschool styles and subjects.</p>
        </div>
        <div className="bg-[#f5f1e9] rounded-[14px] p-7">
          <p className="text-2xl mb-3">✉️</p>
          <h3 className="font-extrabold text-lg mb-2">3 Months of Email Support</h3>
          <p className="text-sm text-[#5c5c5c]">After you receive your recommendations, you'll have 3 months to email Mel with questions. She responds generally once a week, though quick questions may get a faster reply. You're not alone in this — Mel is here to help you adjust as you go.</p>
        </div>
      </div>

      {/* Pricing options */}
      <div className="mb-10">
        <h2 className="text-2xl font-extrabold mb-2 text-center">Choose Your Plan</h2>
        <p className="text-sm text-[#5c5c5c] text-center mb-8">Consulting includes everything above. Add a games subscription to get full access to all our educational games and lessons too.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Consulting only */}
          <button
            type="button"
            onClick={() => setPlan('consulting')}
            className={`rounded-2xl p-6 text-left border-2 transition-all cursor-pointer ${
              plan === 'consulting'
                ? 'border-[#ed7c5a] bg-white'
                : 'border-[#e2ddd5] bg-white hover:border-[#ed7c5a]'
            }`}
            style={{ boxShadow: plan === 'consulting' ? '0 4px 20px rgba(237,124,90,0.18)' : '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-extrabold text-base">Consulting Only</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${plan === 'consulting' ? 'border-[#ed7c5a] bg-[#ed7c5a]' : 'border-[#ddd8cc]'}`}>
                {plan === 'consulting' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>
            <p className="text-3xl font-extrabold text-[#ed7c5a] mb-0.5">$47</p>
            <p className="text-xs text-[#5c5c5c] mb-5">one-time payment</p>
            <ul className="text-sm text-[#5c5c5c] space-y-2">
              <li>✓ Intake form + learning style quiz</li>
              <li>✓ Custom curriculum recommendations</li>
              <li>✓ 3 months of email support</li>
            </ul>
          </button>

          {/* Bundle monthly */}
          <button
            type="button"
            onClick={() => setPlan('bundle-monthly')}
            className={`rounded-2xl p-6 text-left border-2 transition-all cursor-pointer ${
              plan === 'bundle-monthly'
                ? 'border-[#ed7c5a] bg-white'
                : 'border-[#e2ddd5] bg-white hover:border-[#ed7c5a]'
            }`}
            style={{ boxShadow: plan === 'bundle-monthly' ? '0 4px 20px rgba(237,124,90,0.18)' : '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-extrabold text-base">Consulting + Monthly Games</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${plan === 'bundle-monthly' ? 'border-[#ed7c5a] bg-[#ed7c5a]' : 'border-[#ddd8cc]'}`}>
                {plan === 'bundle-monthly' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>
            <p className="text-3xl font-extrabold text-[#ed7c5a] mb-0.5">$52</p>
            <p className="text-xs text-[#5c5c5c] mb-5">today, then $5/month</p>
            <ul className="text-sm text-[#5c5c5c] space-y-2">
              <li>✓ Everything in Consulting Only</li>
              <li>✓ Full access to all games & lessons</li>
              <li>✓ New content as it's added</li>
              <li>✓ Cancel games anytime</li>
            </ul>
          </button>

          {/* Bundle yearly */}
          <div className="relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#55b6ca] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap z-10">BEST VALUE</span>
            <button
              type="button"
              onClick={() => setPlan('bundle-yearly')}
              className={`w-full h-full rounded-2xl p-6 text-left border-2 transition-all cursor-pointer ${
                plan === 'bundle-yearly'
                  ? 'border-[#ed7c5a] bg-white'
                  : 'border-[#e2ddd5] bg-white hover:border-[#ed7c5a]'
              }`}
              style={{ boxShadow: plan === 'bundle-yearly' ? '0 4px 20px rgba(237,124,90,0.18)' : '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-extrabold text-base">Consulting + Yearly Games</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${plan === 'bundle-yearly' ? 'border-[#ed7c5a] bg-[#ed7c5a]' : 'border-[#ddd8cc]'}`}>
                  {plan === 'bundle-yearly' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
              <p className="text-3xl font-extrabold text-[#ed7c5a] mb-0.5">$97</p>
              <p className="text-xs text-[#5c5c5c] mb-5">today, then $50/year — save $10!</p>
              <ul className="text-sm text-[#5c5c5c] space-y-2">
                <li>✓ Everything in Consulting Only</li>
                <li>✓ Full access to all games & lessons</li>
                <li>✓ New content as it's added</li>
                <li>✓ Best value on games</li>
              </ul>
            </button>
          </div>

        </div>
      </div>

      {/* Contract */}
      <div className="bg-white border border-[#e2ddd5] rounded-[14px] p-7 mb-6">
        <h3 className="font-extrabold text-base mb-4">Terms & Agreement</h3>
        <div className="text-sm text-[#5c5c5c] space-y-2 mb-6">
          <p>By signing up for this consulting service, you agree to the following:</p>
          <ol className="list-decimal list-inside space-y-2 mt-3">
            <li>No refunds once the intake form has been sent to you.</li>
            <li>Email support is provided for 3 months from the date of purchase. Mel will respond within 3–5 business days. Responses are generally once per week, though quick questions may be answered sooner.</li>
            <li>Curriculum recommendations are suggestions based on your intake form and quiz results. They are not guarantees of outcome. The final curriculum decision remains with the parent.</li>
            <li>Your family's information will not be shared with any third party.</li>
            <li>This is an educational consulting service, not a licensed tutoring or therapy service.</li>
          </ol>
        </div>
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#ed7c5a] cursor-pointer"
          />
          <span className="text-sm font-bold">I have read and agree to the terms above.</span>
        </label>
      </div>

      {/* Pay button */}
      <button
        onClick={handleCheckout}
        disabled={!agreed || loading}
        className="w-full bg-[#ed7c5a] text-white font-extrabold text-lg py-4 rounded-xl hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Redirecting to payment...' : PLAN_LABELS[plan]}
      </button>
      <p className="text-center text-xs text-[#5c5c5c] mt-3">Secure payment via Stripe. You'll receive a confirmation email right after payment.</p>

    </div>
  )
}
