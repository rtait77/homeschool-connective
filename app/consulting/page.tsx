'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

type Plan = 'consulting' | 'bundle-monthly' | 'bundle-yearly'

const PLAN_LABELS: Record<Plan, string> = {
  'consulting': 'Get Personalized Recommendations — $47',
  'bundle-monthly': 'Get Started — $52',
  'bundle-yearly': 'Get Started — $97',
}

export default function ConsultingPage() {
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<Plan>('consulting')
  const [resourceCount, setResourceCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/consulting/resource-count')
      .then(r => r.json())
      .then(data => setResourceCount(data.count))
      .catch(() => {})
  }, [])

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
    <div style={{ fontFamily: 'Nunito, sans-serif' }}>

      {/* ── HERO ── */}
      <div style={{ backgroundColor: '#ed7c5a', padding: '52px 24px 60px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', marginBottom: 14 }}>
            One-on-One Homeschool Consulting
          </p>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: 16 }}>
            Stop Guessing.<br />Get Personalized Curriculum Recommendations,<br />and Homeschooling Support.
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.88)', lineHeight: 1.7, maxWidth: 500, margin: '0 auto 28px' }}>
            Mel provides personalized support for your family, including curriculum recommendations, resource matching, and ongoing mentorship all in one place.
          </p>
          <a
            href="#pricing"
            style={{ display: 'inline-block', backgroundColor: '#fff', color: '#ed7c5a', fontWeight: 800, fontSize: '1rem', padding: '0.85rem 2rem', borderRadius: 999, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
          >
            Get Personalized Recommendations — $47
          </a>
        </div>
      </div>

      {/* ── IS THIS YOU? ── */}
      <div style={{ backgroundColor: '#f5f1e9', padding: '64px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#55b6ca', textAlign: 'center', marginBottom: 12 }}>The Struggle</p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: '#1c1c1c', textAlign: 'center', marginBottom: 40 }}>Is this you?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {[
              "You've tried two or three curricula and nothing has quite clicked. You're not sure what to change or where to even begin.",
              "You're brand new to homeschooling and don't know where to start. Everything feels overwhelming and you're not even sure what questions to ask yet.",
              "You know your child is smart and capable, but something about the way things are going just isn't working.",
              "You wish you could sit down with someone experienced and get a straight answer about what to try.",
            ].map((text, i) => (
              <div key={i} style={{ backgroundColor: '#fff', borderRadius: 14, padding: '22px 24px', border: '1px solid #e2ddd5', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: '0.92rem', lineHeight: 1.65, color: '#3a3a3a', margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: '1.05rem', fontWeight: 800, color: '#ed7c5a', marginTop: 36 }}>
            That&apos;s exactly what Mel is here for.
          </p>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ backgroundColor: '#f5f1e9', padding: '64px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#55b6ca', textAlign: 'center', marginBottom: 12 }}>The Process</p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: '#1c1c1c', textAlign: 'center', marginBottom: 48 }}>How it works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { num: '1', title: 'Sign Up', desc: 'Choose your plan and complete your purchase. You\'ll get immediate access to your dashboard.' },
              { num: '2', title: 'Fill Out Your Intake Form', desc: 'Answer questions about your child, your teaching style, what\'s working, and what isn\'t.' },
              { num: '3', title: 'Get Your Report', desc: 'Mel puts together a report of personalized recommendations tailored to your family.' },
              { num: '4', title: 'Mentorship & Support', desc: 'Email Mel anytime for 3 months. She\'s here for follow-up questions, guidance, and ongoing homeschool support.' },
            ].map(step => (
              <div key={step.num} style={{ backgroundColor: '#fff', borderRadius: 14, padding: '28px 18px', textAlign: 'center', border: '1px solid #e2ddd5' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#ed7c5a', color: '#fff', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>{step.num}</div>
                <p style={{ fontWeight: 800, fontSize: '0.92rem', color: '#1c1c1c', marginBottom: 8 }}>{step.title}</p>
                <p style={{ fontSize: '0.82rem', color: '#5c5c5c', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RESOURCE COUNT STAT ── */}
      <div style={{ backgroundColor: '#fff', padding: '48px 24px' }}>
        <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
          {resourceCount !== null && (
            <>
              <p style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 800, color: '#ed7c5a', lineHeight: 1, margin: '0 0 8px' }}>
                {resourceCount}
              </p>
              <p style={{ fontSize: '1rem', fontWeight: 800, color: '#1c1c1c', marginBottom: 6 }}>
                curated resources in our database
              </p>
              <p style={{ fontSize: '0.85rem', color: '#a09890', margin: 0 }}>
                and growing — Mel matches from this list to build your personalized report.
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── WHAT'S INCLUDED ── */}
      <div style={{ backgroundColor: '#fff', padding: '64px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#55b6ca', textAlign: 'center', marginBottom: 12 }}>What&apos;s Included</p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: '#1c1c1c', textAlign: 'center', marginBottom: 40 }}>Everything included</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            <div style={{ backgroundColor: '#ed7c5a', borderRadius: 14, padding: '28px 24px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
              <p style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: 8 }}>The Intake Form</p>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.88)', lineHeight: 1.65, margin: 0 }}>
                After you sign up, you&apos;ll receive a detailed intake form that Mel and our team designed specifically to capture what matters most for your family. It covers your child&apos;s age, learning strengths and challenges, your teaching style, what you&apos;ve tried before, and what your goals are. Your answers feed directly into our recommendation matching system, which helps Mel identify the resources most likely to work for your family.
              </p>
            </div>
            <div style={{ backgroundColor: '#ed7c5a', borderRadius: 14, padding: '28px 24px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
              <p style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: 8 }}>Personalized Recommendations</p>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.88)', lineHeight: 1.65, margin: 0 }}>
                Based on your intake form responses, our matching system identifies the curriculum and resources most likely to work for your child and your teaching style. Mel reviews everything and puts together a custom report with specific suggestions that fit your family&apos;s needs and budget. No generic lists and no guesswork. Every recommendation is chosen with your family in mind.
              </p>
            </div>
            <div style={{ backgroundColor: '#ed7c5a', borderRadius: 14, padding: '28px 24px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
              <p style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: 8 }}>Homeschool Mentorship</p>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.88)', lineHeight: 1.65, margin: 0 }}>
                After you receive your report from Mel, you&apos;ll be able to ask questions and get help for 3 months through email correspondence. Whether something isn&apos;t clicking the way you hoped, you want her opinion before purchasing a resource, or you just need someone to think through a challenge with you, she is there to help. You won&apos;t be left figuring it out on your own.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MEET MEL ── */}
      <div style={{ backgroundColor: '#f5f1e9', padding: '64px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#55b6ca', textAlign: 'center', marginBottom: 12 }}>Your Consultant</p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: '#1c1c1c', textAlign: 'center', marginBottom: 36 }}>Meet Mel</h2>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
            <Image
              src="/melanie.avif"
              alt="Mel"
              width={140}
              height={140}
              style={{ borderRadius: '50%', objectFit: 'cover', width: 140, height: 140, border: '4px solid #fff' }}
            />
            <div style={{ textAlign: 'center', maxWidth: 580 }}>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: '#3a3a3a', marginBottom: 16 }}>
                With over 25 years of homeschooling experience, Mel has dedicated her life to nurturing young learners and supporting families on their educational journeys. She began homeschooling her own children in 2000, and today has the joy of homeschooling her grandchildren.
              </p>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: '#3a3a3a', marginBottom: 16 }}>
                Along the way, she has worked as assistant director of a homeschool co-op, coordinator at a church nursery, and lead teacher at a pre-K center, giving her a well-rounded perspective on how children learn best in a variety of settings.
              </p>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: '#3a3a3a' }}>
                Mel is passionate about coming alongside homeschooling families as a mentor, helping them find curriculum and resources that truly fit their unique family, teaching style, and children&apos;s needs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── PRICING ── */}
      <div id="pricing" style={{ backgroundColor: '#fff', padding: '64px 24px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#55b6ca', textAlign: 'center', marginBottom: 12 }}>Pricing</p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: '#1c1c1c', textAlign: 'center', marginBottom: 8 }}>Choose your plan</h2>
          <p style={{ fontSize: '0.9rem', color: '#5c5c5c', textAlign: 'center', maxWidth: 560, margin: '0 auto 40px' }}>
            Consulting includes everything above. You can also add a games subscription for full access to our educational games and lessons.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 36 }}>

            {/* Consulting only */}
            <button
              type="button"
              onClick={() => setPlan('consulting')}
              style={{ borderRadius: 18, padding: '24px 20px', textAlign: 'left', border: `2px solid ${plan === 'consulting' ? '#ed7c5a' : '#e2ddd5'}`, backgroundColor: '#fff', cursor: 'pointer', boxShadow: plan === 'consulting' ? '0 4px 20px rgba(237,124,90,0.18)' : '0 2px 12px rgba(0,0,0,0.06)', transition: 'all 0.15s' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1c1c1c' }}>Consulting Only</span>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${plan === 'consulting' ? '#ed7c5a' : '#ddd8cc'}`, backgroundColor: plan === 'consulting' ? '#ed7c5a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {plan === 'consulting' && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fff' }} />}
                </div>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: '#ed7c5a', margin: '0 0 2px' }}>$47</p>
              <p style={{ fontSize: '0.75rem', color: '#5c5c5c', marginBottom: 20 }}>one-time payment</p>
              <ul style={{ fontSize: '0.85rem', color: '#5c5c5c', listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>✓ Intake form</li>
                <li>✓ Personalized recommendations</li>
                <li>✓ 3 months of homeschool mentorship</li>
              </ul>
            </button>

            {/* Bundle monthly */}
            <button
              type="button"
              onClick={() => setPlan('bundle-monthly')}
              style={{ borderRadius: 18, padding: '24px 20px', textAlign: 'left', border: `2px solid ${plan === 'bundle-monthly' ? '#ed7c5a' : '#e2ddd5'}`, backgroundColor: '#fff', cursor: 'pointer', boxShadow: plan === 'bundle-monthly' ? '0 4px 20px rgba(237,124,90,0.18)' : '0 2px 12px rgba(0,0,0,0.06)', transition: 'all 0.15s' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1c1c1c' }}>Consulting + Monthly Games</span>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${plan === 'bundle-monthly' ? '#ed7c5a' : '#ddd8cc'}`, backgroundColor: plan === 'bundle-monthly' ? '#ed7c5a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {plan === 'bundle-monthly' && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fff' }} />}
                </div>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: '#ed7c5a', margin: '0 0 2px' }}>$52</p>
              <p style={{ fontSize: '0.75rem', color: '#5c5c5c', marginBottom: 20 }}>today, then $5/month</p>
              <ul style={{ fontSize: '0.85rem', color: '#5c5c5c', listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>✓ Everything in Consulting Only</li>
                <li>✓ Full access to all games & lessons</li>
                <li>✓ New content as it&apos;s added</li>
                <li>✓ Cancel games anytime</li>
              </ul>
            </button>

            {/* Bundle yearly */}
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#55b6ca', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '3px 14px', borderRadius: 999, whiteSpace: 'nowrap', zIndex: 10 }}>BEST VALUE</span>
              <button
                type="button"
                onClick={() => setPlan('bundle-yearly')}
                style={{ width: '100%', borderRadius: 18, padding: '24px 20px', textAlign: 'left', border: `2px solid ${plan === 'bundle-yearly' ? '#ed7c5a' : '#e2ddd5'}`, backgroundColor: '#fff', cursor: 'pointer', boxShadow: plan === 'bundle-yearly' ? '0 4px 20px rgba(237,124,90,0.18)' : '0 2px 12px rgba(0,0,0,0.06)', transition: 'all 0.15s' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1c1c1c' }}>Consulting + Yearly Games</span>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${plan === 'bundle-yearly' ? '#ed7c5a' : '#ddd8cc'}`, backgroundColor: plan === 'bundle-yearly' ? '#ed7c5a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {plan === 'bundle-yearly' && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fff' }} />}
                  </div>
                </div>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: '#ed7c5a', margin: '0 0 2px' }}>$97</p>
                <p style={{ fontSize: '0.75rem', color: '#5c5c5c', marginBottom: 20 }}>today, then $50/year (save $10!)</p>
                <ul style={{ fontSize: '0.85rem', color: '#5c5c5c', listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <li>✓ Everything in Consulting Only</li>
                  <li>✓ Full access to all games & lessons</li>
                  <li>✓ New content as it&apos;s added</li>
                  <li>✓ Best value on games</li>
                </ul>
              </button>
            </div>

          </div>

          {/* Terms */}
          <div style={{ backgroundColor: '#f5f1e9', border: '1px solid #e2ddd5', borderRadius: 14, padding: '28px', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1c1c1c', marginBottom: 16 }}>Terms & Agreement</h3>
            <div style={{ fontSize: '0.85rem', color: '#5c5c5c', lineHeight: 1.7, marginBottom: 20 }}>
              <p style={{ marginBottom: 10 }}>By signing up for this consulting service, you agree to the following:</p>
              <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>No refunds once the intake form has been sent to you.</li>
                <li>Email support is provided for 3 months from the date of purchase. Mel will respond within 3 to 5 business days.</li>
                <li>Curriculum recommendations are suggestions based on your intake form. They are not guarantees of outcome. The final curriculum decision remains with the parent/guardian.</li>
                <li>Your family&apos;s information will not be shared with any third party.</li>
                <li>This is an educational consulting service, not a licensed tutoring or therapy service.</li>
              </ol>
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                style={{ marginTop: 2, width: 16, height: 16, accentColor: '#ed7c5a', cursor: 'pointer', flexShrink: 0 }}
              />
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1c1c1c' }}>I have read and agree to the terms above.</span>
            </label>
          </div>

          {/* Pay button */}
          <button
            onClick={handleCheckout}
            disabled={!agreed || loading}
            style={{ width: '100%', backgroundColor: '#ed7c5a', color: '#fff', fontWeight: 800, fontSize: '1.05rem', padding: '1rem', borderRadius: 12, border: 'none', cursor: agreed && !loading ? 'pointer' : 'not-allowed', opacity: agreed && !loading ? 1 : 0.4, transition: 'opacity 0.15s' }}
          >
            {loading ? 'Redirecting to payment...' : PLAN_LABELS[plan]}
          </button>
          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#a09890', marginTop: 10 }}>Secure payment via Stripe. You&apos;ll receive a confirmation email right after payment.</p>

        </div>
      </div>

    </div>
  )
}
