'use client'

import { useState } from 'react'

const TOPICS = [
  'Ocean Animals',
  'Dinosaurs',
  'The 7 Continents',
  'Extreme Environments',
  'Natural Disasters',
]

export default function TopicVote() {
  const [selected, setSelected] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setLoading(true)
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: 'e9fa8d0f-0004-4b87-bdf7-5403329c59cb',
          subject: `Topic interest: ${selected}`,
          message: `A parent expressed interest in "${selected}" on the homepage.`,
          email: email || 'not provided',
          from_name: 'Homeschool Connective — Topic Vote',
        }),
      })
      setSubmitted(true)
    } catch {
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <p style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1c1c1c', marginBottom: '6px' }}>
          Thanks! We&apos;ll keep {selected} on our list.
        </p>
        <p style={{ fontSize: '0.875rem', color: '#5c5c5c' }}>
          {email ? "We'll email you when it's ready." : 'Check back soon.'}
        </p>
      </div>
    )
  }

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: `
        .topic-pill {
          display: inline-flex;
          align-items: center;
          padding: 10px 20px;
          border-radius: 999px;
          border: 2px solid #ddd8cc;
          background: white;
          font-size: 0.9rem;
          font-weight: 700;
          color: #1c1c1c;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .topic-pill:hover {
          border-color: #ed7c5a;
          color: #ed7c5a;
          background: #fff8f6;
        }
        .topic-pill.selected {
          border-color: #ed7c5a;
          background: #ed7c5a;
          color: white;
        }
        .topic-notify-form {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 20px;
          animation: fadeIn 0.2s ease;
        }
        .topic-notify-input {
          padding: 10px 16px;
          border: 2px solid #ddd8cc;
          border-radius: 10px;
          font-size: 0.875rem;
          outline: none;
          min-width: 240px;
          transition: border-color 0.15s;
        }
        .topic-notify-input:focus { border-color: #ed7c5a; }
        .topic-notify-btn {
          padding: 10px 20px;
          border-radius: 10px;
          background: #ed7c5a;
          color: white;
          font-size: 0.875rem;
          font-weight: 800;
          border: none;
          cursor: pointer;
          transition: opacity 0.15s;
          white-space: nowrap;
        }
        .topic-notify-btn:hover { opacity: 0.88; }
        .topic-notify-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .topic-skip {
          background: none;
          border: none;
          font-size: 0.75rem;
          color: #a09890;
          cursor: pointer;
          text-decoration: underline;
          margin-top: 8px;
          display: block;
        }
        .topic-skip:hover { color: #5c5c5c; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}} />

      {/* Topic pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
        {TOPICS.map(topic => (
          <button
            key={topic}
            className={`topic-pill${selected === topic ? ' selected' : ''}`}
            onClick={() => setSelected(topic === selected ? null : topic)}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Email capture — appears after selection */}
      {selected && (
        <form className="topic-notify-form" onSubmit={handleSubmit}>
          <input
            type="email"
            className="topic-notify-input"
            placeholder={`Email me when ${selected} is ready`}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button type="submit" className="topic-notify-btn" disabled={loading}>
            {loading ? 'Sending…' : 'Notify me →'}
          </button>
          <button
            type="button"
            className="topic-skip"
            style={{ width: '100%' }}
            onClick={handleSubmit as any}
          >
            Just vote, no email
          </button>
        </form>
      )}
    </div>
  )
}
