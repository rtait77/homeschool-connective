'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function ConsultingPage() {
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setLoading(true)
    const res = await fetch('/api/checkout-consulting', { method: 'POST' })
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
          <p className="text-[#5c5c5c]">Bio coming soon.</p>
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

      {/* What you get */}
      <div className="bg-white border-2 border-[#55b6ca] rounded-[14px] p-8 mb-14" style={{ boxShadow: '0 3px 18px rgba(0,0,0,0.08)' }}>
        <h3 className="font-extrabold text-xl mb-5 text-center">What You Get</h3>
        <ul className="space-y-3 max-w-[500px] mx-auto">
          {[
            'A personalized intake form to share your family\'s story',
            'A learning style & teaching style quiz',
            'Custom curriculum recommendations from Mel',
            '3 months of email support — ask questions, get real answers',
          ].map(item => (
            <li key={item} className="flex items-start gap-3 text-sm">
              <span className="text-[#ed7c5a] font-extrabold text-base mt-0.5">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-center text-4xl font-extrabold mt-8 mb-1">$47</p>
        <p className="text-center text-sm text-[#5c5c5c]">One-time payment. No subscription.</p>
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
        {loading ? 'Redirecting to payment...' : 'Sign Up & Pay — $47'}
      </button>
      <p className="text-center text-xs text-[#5c5c5c] mt-3">Secure payment via Stripe. You'll receive a confirmation email right after payment.</p>

    </div>
  )
}
