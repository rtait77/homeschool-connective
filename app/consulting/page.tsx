'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderTop: '1px solid #e2ddd5' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#383838', lineHeight: 1.5 }}>{q}</span>
        <span style={{ fontSize: '1.2rem', color: '#ed7c5a', flexShrink: 0, lineHeight: 1 }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ paddingBottom: 20 }}>
          <p style={{ fontSize: '0.88rem', color: '#6b6b6b', lineHeight: 1.8, margin: 0 }}>{a}</p>
        </div>
      )}
    </div>
  )
}

export default function ConsultingPage() {
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resourceCount, setResourceCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/consulting/resource-count')
      .then(r => r.json())
      .then(data => setResourceCount(data.count))
      .catch(() => {})
  }, [])

  async function handleCheckout() {
    setLoading(true)
    const res = await fetch('/api/checkout-consulting', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
    const { url } = await res.json()
    window.location.href = url
  }

  return (
    <div style={{ fontFamily: 'Nunito, sans-serif' }}>

      {/* ── HERO — split: solid coral left, photo right, soft blend at seam ── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 560, gap: 0 }} className="consulting-hero">

          {/* Left: solid coral panel */}
          <div style={{ background: '#e86d47', padding: '80px 52px 100px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>
              One-on-One Homeschool Consulting
            </p>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.8rem)', fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: 20 }}>
              Stop Guessing.<br />Get Personalized Support.
            </h1>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.88)', lineHeight: 1.75, marginBottom: 36, maxWidth: 420 }}>
              Mel provides personalized support for your family — curriculum recommendations, resource matching, and ongoing mentorship.
            </p>
            <a
              href="#pricing"
              style={{ display: 'inline-block', alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 800, fontSize: '0.95rem', padding: '12px 28px', borderRadius: 10, textDecoration: 'none', border: '2px solid rgba(255,255,255,0.6)', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}
            >
              Book a Consult →
            </a>
          </div>

          {/* Right: photo only, no overlay */}
          <div style={{ position: 'relative', minHeight: 400, overflow: 'hidden' }}>
            <Image
              src="/consulting-hero.jpg"
              alt="Homeschooling family"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center center' }}
              priority
            />
          </div>
        </div>


        {/* Wave bottom edge */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0, pointerEvents: 'none', zIndex: 2 }}>
          <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
            <path d="M0,56 L0,48 C360,0 1080,48 1440,16 L1440,56 Z" fill="#f5f1e9" />
          </svg>
        </div>
      </div>

      {/* ── SOUND FAMILIAR? ── */}
      <div style={{ backgroundColor: '#f5f1e9', padding: '64px 24px 96px', marginTop: -2, position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 600, color: '#383838', textAlign: 'center', marginBottom: 40 }}>
            Sound familiar?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {[
              "I've tried two or three curricula and nothing has quite clicked. I'm not sure what to change or where to even begin.",
              "I'm brand new to homeschooling and don't know where to start. Everything feels overwhelming and I'm not even sure what questions to ask yet.",
              "I know my child is smart and capable, but something about the way things are going just isn't working.",
              "I wish I could sit down with someone experienced and get a straight answer about what to try.",
            ].map((text, i) => (
              <div key={i} style={{ backgroundColor: '#fdf8f4', borderRadius: 14, padding: '22px 24px', border: '1px solid #ebe5dc', borderLeft: '4px solid #55b6ca', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.4rem', lineHeight: 1, color: '#55b6ca', flexShrink: 0, fontWeight: 800, marginTop: -2 }}>&ldquo;</span>
                <p style={{ fontSize: '0.92rem', lineHeight: 1.65, color: '#383838', margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0, pointerEvents: 'none' }}>
          <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
            <path d="M0,56 L0,32 C480,56 960,8 1440,40 L1440,56 Z" fill="#fff" />
          </svg>
        </div>
      </div>

      {/* ── WHAT'S INCLUDED ── */}
      <div style={{ backgroundColor: '#fff', padding: '64px 24px 96px', marginTop: -2, position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 600, color: '#383838', textAlign: 'center', marginBottom: 48 }}>How We Help</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ed7c5a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                ),
                title: 'The Intake Form',
                body: "This isn't your basic questionnaire. Mel and her team built a deep intake form that is the foundation of everything. You'll answer carefully selected questions so Mel can uncover your child's preferred learning style, your preferred teaching style, and which homeschooling methods may best suit your family. Every answer feeds directly into the matching system Mel and her team built.",
              },
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ed7c5a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18h6"/>
                    <path d="M10 22h4"/>
                    <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6H8.3C6.3 13.7 5 11.5 5 9a7 7 0 0 1 7-7z"/>
                  </svg>
                ),
                title: 'Recommendations & Help',
                body: "Mel reviews your intake form and carefully reviews each resource you were matched with. She compiles a report with her personal suggestions for curriculum and supplements. The report will include your child's learning style, your teaching style, and the homeschooling method that fits you best based on the answers to your questions. No guessing, no generic lists.",
              },
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ed7c5a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                ),
                title: 'Homeschool Mentorship',
                body: "After you receive your report, Mel is available to you via email for 3 months. Whether something isn't clicking, you want a second opinion before buying something, or you just need someone to think through something with you, Mel is just an email away. She will respond to emails within 3–5 business days.",
              },
            ].map((card) => (
              <div key={card.title} style={{ backgroundColor: '#fff', borderRadius: 16, padding: '32px 28px', border: '1px solid #e2ddd5', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: '#fff5f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {card.icon}
                </div>
                <p style={{ fontWeight: 800, fontSize: '1rem', color: '#383838', margin: 0 }}>{card.title}</p>
                <p style={{ fontSize: '0.88rem', color: '#5c5c5c', lineHeight: 1.75, margin: 0 }}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0, pointerEvents: 'none' }}>
          <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
            <path d="M0,56 L0,16 C360,56 1080,8 1440,48 L1440,56 Z" fill="#f5f1e9" />
          </svg>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ backgroundColor: '#f5f1e9', padding: '64px 24px 96px', marginTop: -2, position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 600, color: '#383838', textAlign: 'center', marginBottom: 48 }}>How it works</h2>
          <div style={{ position: 'relative' }}>
            {/* Dotted connecting line — centered on the number circles */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 'calc(12.5% + 22px)',
              right: 'calc(12.5% + 22px)',
              height: 0,
              borderTop: '2px dashed #d5cfc6',
              pointerEvents: 'none',
              transform: 'translateY(-50%)',
            }} className="step-connector" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, position: 'relative' }}>
              {[
                { num: '1', title: 'Sign Up', desc: 'Choose your plan and complete your purchase. You\'ll get immediate access to your dashboard.' },
                { num: '2', title: 'Fill Out Your Intake Form', desc: 'Answer questions about your child, your teaching style, what\'s working, and what isn\'t.' },
                { num: '3', title: 'Get Your Report', desc: 'Mel puts together a report of personalized recommendations tailored to your family.' },
                { num: '4', title: 'Mentorship & Support', desc: 'Email Mel anytime for 3 months. She\'s here for follow-up questions, guidance, and ongoing homeschool support.' },
              ].map(step => (
                <div key={step.num} style={{ backgroundColor: '#fff', borderRadius: 14, padding: '28px 18px', textAlign: 'center', border: '1px solid #e2ddd5' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#ed7c5a', color: '#fff', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', position: 'relative', zIndex: 1 }}>{step.num}</div>
                  <p style={{ fontWeight: 800, fontSize: '0.92rem', color: '#383838', marginBottom: 8 }}>{step.title}</p>
                  <p style={{ fontSize: '0.82rem', color: '#5c5c5c', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0, pointerEvents: 'none' }}>
          <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
            <path d="M0,56 L0,48 C360,0 1080,48 1440,16 L1440,56 Z" fill="#fff" />
          </svg>
        </div>
      </div>

      {/* ── RESOURCE COUNT STAT ── */}
      <div style={{ backgroundColor: '#fff', padding: '48px 24px 96px', marginTop: -2, position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
          {resourceCount !== null && (
            <>
              <p style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 800, color: '#ed7c5a', lineHeight: 1, margin: '0 0 8px' }}>
                {resourceCount}
              </p>
              <p style={{ fontSize: '1rem', fontWeight: 800, color: '#383838', marginBottom: 6 }}>
                curated resources in our database
              </p>
              <p style={{ fontSize: '0.85rem', color: '#5c5c5c', marginBottom: 8 }}>
                Curricula, books, games, toys, activity books, websites, online games, apps, subscription boxes, and more.
              </p>
              <p style={{ fontSize: '0.85rem', color: '#55b6ca', fontWeight: 700, margin: 0 }}>
                And growing — Mel matches from this list to build your personalized report.
              </p>
            </>
          )}
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0, pointerEvents: 'none' }}>
          <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
            <path d="M0,56 L0,16 C360,56 1080,8 1440,48 L1440,56 Z" fill="#f5f1e9" />
          </svg>
        </div>
      </div>

      {/* ── ACTIVITY TILES ── */}
      <div style={{ backgroundColor: '#f5f1e9', padding: '64px 24px 96px', marginTop: -2, position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 600, color: '#383838', textAlign: 'center', marginBottom: 8 }}>Whatever your family&apos;s learning looks like, Mel can help.</h2>
          <p style={{ fontSize: '0.9rem', color: '#5c5c5c', textAlign: 'center', marginBottom: 48, maxWidth: 560, margin: '0 auto 48px' }}>From structured bookwork to hands-on projects — she&apos;s helped families find what works across every style of learning.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {([
              { src: '/activity-bookwork.jpg', label: 'Curriculum', desc: 'Core subjects matched to your child\'s pace and learning style.' },
              { src: '/activity-reading-2.jpg', label: 'Reading', desc: 'Finding the right books and reading programs for every level.' },
              { src: '/activity-arts-and-crafts.jpg', label: 'Art & Crafts', desc: 'Creative projects that make learning memorable.' },
              { src: '/activity-building.JPG', label: 'Building & Making', desc: 'Engineering, STEM kits, and hands-on construction projects.' },
              { src: '/activity-board-game.jpg', label: 'Games & Play-Based Learning', desc: 'Board games, puzzles, and play that builds real skills.' },
              { src: '/activity-science.JPG', label: 'Science Experiments', desc: 'Hands-on labs and experiments that make concepts click.' },
              { src: '/activity-activitybook.jpg', label: 'Activity Books', desc: 'Workbooks and hands-on activity books for every subject and age.' },
              { src: '/activity-subscriptionbox.jpg', label: 'Subscription Boxes', desc: 'Curated monthly boxes that bring learning to your doorstep.' },
              { src: '/activity-online-class.jpg', label: 'Online Lessons', desc: 'Online classes, video courses, and digital resources for every subject.' },
            ] as { src: string | null; label: string; desc: string }[]).map((tile, i) => (
              <div key={i} style={{ borderRadius: 14, overflow: 'hidden', backgroundColor: '#fff', border: '1px solid #e2ddd5', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                {tile.src ? (
                  <div style={{ position: 'relative', width: '100%', paddingBottom: '125%', overflow: 'hidden' }}>
                    <img src={tile.src} alt={tile.label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                  </div>
                ) : (
                  <div style={{ width: '100%', paddingBottom: '125%', position: 'relative', backgroundColor: '#ede8e0' }} />
                )}
                <div style={{ padding: '18px 20px' }}>
                  <p style={{ fontWeight: 800, fontSize: '0.92rem', color: '#383838', marginBottom: 4 }}>{tile.label}</p>
                  {tile.desc ? <p style={{ fontSize: '0.82rem', color: '#5c5c5c', lineHeight: 1.6, margin: 0 }}>{tile.desc}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0, pointerEvents: 'none' }}>
          <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
            <path d="M0,56 L0,48 C360,0 1080,48 1440,16 L1440,56 Z" fill="#fff" />
          </svg>
        </div>
      </div>

      {/* ── HOMESCHOOL LIFE PHOTOS ── */}
      <div style={{ backgroundColor: '#fff', padding: '64px 24px 96px', marginTop: -2, position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 600, color: '#383838', textAlign: 'center', marginBottom: 48 }}>Learning happens everywhere.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {([
              { src: '/learn-anywhere-1.jpg', label: '' },
              { src: '/learn-anywhere-2.jpg', label: '' },
              { src: '/learn-anywhere-3.jpg', label: '' },
              { src: '/learn-anywhere-4.jpg', label: '' },
              { src: '/learn-anywhere-5.jpg', label: '' },
              { src: '/learn-anywhere-6.jpg', label: '' },
            ] as { src: string | null; label: string }[]).map((tile, i) => (
              <div key={i} style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #e2ddd5', backgroundColor: '#ede8e0' }}>
                {tile.src ? (
                  <div style={{ position: 'relative', width: '100%', paddingBottom: '125%', overflow: 'hidden' }}>
                    <img src={tile.src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                  </div>
                ) : (
                  <div style={{ width: '100%', paddingBottom: '125%', backgroundColor: '#ede8e0' }} />
                )}
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0, pointerEvents: 'none' }}>
          <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
            <path d="M0,56 L0,48 C360,0 1080,48 1440,16 L1440,56 Z" fill="#f5f1e9" />
          </svg>
        </div>
      </div>

      {/* ── MEET MEL — large photo left, bio right ── */}
      <div style={{ backgroundColor: '#f5f1e9', padding: '80px 24px 112px', position: 'relative', overflow: 'hidden', marginTop: -2 }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 600, color: '#383838', textAlign: 'center', marginBottom: 48 }}>Meet Mel</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }} className="mel-layout">
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
              <Image
                src="/melanie.avif"
                alt="Mel"
                width={480}
                height={560}
                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
              />
            </div>
            <div>
              <p style={{ fontSize: '1rem', lineHeight: 1.85, color: '#383838', marginBottom: 20 }}>
                With over 25 years of homeschooling experience, Mel has dedicated her life to nurturing young learners and supporting families on their educational journeys. She began homeschooling her own children in 2000, and today has the joy of homeschooling her grandchildren.
              </p>
              <p style={{ fontSize: '1rem', lineHeight: 1.85, color: '#383838', margin: 0 }}>
                Along the way, she has worked as assistant director of a homeschool co-op, coordinator at a church nursery, and lead teacher at a pre-K center, giving her a well-rounded perspective on how children learn best in a variety of settings.
              </p>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0, pointerEvents: 'none' }}>
          <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
            <path d="M0,48 C360,0 1080,48 1440,16 L1440,48 Z" fill="#fff" />
          </svg>
        </div>
      </div>

      {/* ── PRICING ── */}
      <div id="pricing" style={{ backgroundColor: '#fff', padding: '64px 24px 96px', marginTop: -2, position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 600, color: '#383838', textAlign: 'center', marginBottom: 8 }}>Get Started</h2>
          <p style={{ fontSize: '0.9rem', color: '#5c5c5c', textAlign: 'center', margin: '0 auto 40px' }}>
            One-time payment. No subscription required.
          </p>

          <div style={{ borderRadius: 18, padding: '32px', border: '2px solid #ed7c5a', backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(237,124,90,0.12)', marginBottom: 28 }}>
            <p style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ed7c5a', margin: '0 0 2px' }}>$47</p>
            <p style={{ fontSize: '0.8rem', color: '#a09890', marginBottom: 24 }}>one-time payment</p>
            <ul style={{ fontSize: '0.9rem', color: '#383838', listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li>✓ Deep-dive intake form</li>
              <li>✓ Personalized curriculum recommendations</li>
              <li>✓ Learning styles, teaching styles, and homeschool methods match</li>
              <li>✓ 3 months of email support with Mel</li>
              <li style={{ color: '#55b6ca', fontWeight: 700 }}>✓ 7-day free trial of our educational games included</li>
            </ul>
            <p style={{ fontSize: '0.8rem', color: '#a09890', marginTop: 12, marginBottom: 0 }}>Option to subscribe to games after your trial if you choose.</p>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#5c5c5c', marginBottom: 20 }}>
            Looking for games only? <a href="/pricing" style={{ color: '#ed7c5a', fontWeight: 700, textDecoration: 'none' }}>See all pricing options →</a>
          </p>

          <div style={{ backgroundColor: '#f5f1e9', border: '1px solid #e2ddd5', borderRadius: 14, padding: '28px', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#383838', marginBottom: 16 }}>Terms & Agreement</h3>
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
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#383838' }}>I have read and agree to the terms above.</span>
            </label>
          </div>

          <button
            onClick={handleCheckout}
            disabled={!agreed || loading}
            style={{ width: '100%', backgroundColor: '#ed7c5a', color: '#fff', fontWeight: 800, fontSize: '1.05rem', padding: '1rem', borderRadius: 12, border: 'none', cursor: agreed && !loading ? 'pointer' : 'not-allowed', opacity: agreed && !loading ? 1 : 0.4, transition: 'opacity 0.15s' }}
          >
            {loading ? 'Redirecting to payment...' : 'Get Started — $47'}
          </button>
          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#a09890', marginTop: 10 }}>Secure payment via Stripe. You&apos;ll receive a confirmation email right after payment.</p>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0, pointerEvents: 'none' }}>
          <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
            <path d="M0,56 L0,16 C360,56 1080,8 1440,48 L1440,56 Z" fill="#f5f1e9" />
          </svg>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div style={{ backgroundColor: '#f5f1e9', padding: '64px 24px', marginTop: -2 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 600, color: '#383838', textAlign: 'center', marginBottom: 48 }}>Common Questions</h2>
          <div style={{ borderBottom: '1px solid #e2ddd5' }}>
            {[
              {
                q: 'What is covered in the intake form, and what\'s included in the report?',
                a: 'The intake form covers both the child and the parent/guardian. On the child\'s side: sensory and regulation needs, how they handle frustration, focus span, reading and writing levels, what subjects they love or avoid, screen habits, and more. On your side: your teaching style, schedule, prep willingness, goals, and what you\'ve already tried. Your report includes personalized curriculum and resource recommendations with specific reasons why each one was chosen for your family — matched to your child\'s learning style, your preferred homeschooling method, and your teaching style — plus 3 months of email support with Mel.',
              },
              {
                q: 'How long does it take to get my report?',
                a: 'Mel typically delivers your report within 3–5 business days of receiving your completed intake form.',
              },
              {
                q: 'What subjects does this cover?',
                a: 'All of them. We recommend resources across a wide range of subjects because learners have a wide range of interests. Core subjects like math, reading, writing, and science are covered — but so is anything else your family is exploring.',
              },
              {
                q: 'What ages and grades do you work with?',
                a: 'Pre-K through high school.',
              },
              {
                q: 'What if I have more than one child?',
                a: 'The intake form includes a section for each child, so Mel can tailor recommendations for multiple children at once — all for the same price.',
              },
              {
                q: 'Is this for new homeschoolers or experienced ones?',
                a: 'Both. Whether you\'re just starting out or you\'ve been at it for years and something isn\'t working, Mel can help.',
              },
              {
                q: 'Do you recommend secular or religious curriculum?',
                a: 'Both. The intake form asks about your preference and Mel matches resources accordingly. No assumptions are made.',
              },
              {
                q: 'How is this different from googling curriculum reviews?',
                a: 'Reviews tell you what a curriculum is like. Mel tells you whether it\'s right for your child and your family. She looks at how your child learns, how you teach, what you\'ve already tried, what your schedule looks like, and what your goals are — then matches from there. It\'s the difference between reading a menu and having someone who knows you well order for you.',
              },
              {
                q: 'What does the 3 months of email support actually look like?',
                a: 'After you receive your report, you can email Mel with follow-up questions — whether something isn\'t clicking, you want her opinion before buying something, or you just need a second opinion. She responds within 3–5 business days.',
              },
              {
                q: 'Do I get access to the games when I sign up for consulting?',
                a: 'Yes — when you sign up for consulting, you\'ll receive a 7-day free trial of our educational games. After that, you can choose to add a games subscription separately. There is no free trial for the consulting service itself.',
              },
              {
                q: 'Can I get a refund if I change my mind?',
                a: 'Refunds are not available once the intake form has been sent to you. If you have questions before purchasing, reach out at consulting@homeschoolconnective.com.',
              },
            ].map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 640px) {
          .consulting-hero {
            grid-template-columns: 1fr !important;
          }
          .consulting-hero > div:last-child {
            min-height: 260px !important;
          }
          .hero-seam {
            display: none !important;
          }
          .step-connector {
            display: none !important;
          }
          .mel-layout {
            grid-template-columns: 1fr !important;
          }
          .help-row {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .help-title-col {
            width: 100% !important;
          }
        }
        @media (max-width: 700px) {
          .step-connector {
            display: none !important;
          }
        }
      `}} />

    </div>
  )
}
