'use client'

import { useState } from 'react'

/* ─── Types ─── */
type QuizAnswers = {
  age: string
  toughDay: string[]
  engagement: string[]
  timeAvailable: string
  involvement: string
  screens: string
  subjects: string[]
  firstName: string
  email: string
}

type QuizResult = {
  profile: string
  resources: { id: string; name: string; description: string; url: string; resourceType: string }[]
  totalMatches: number
}

const INITIAL: QuizAnswers = {
  age: '', toughDay: [], engagement: [], timeAvailable: '',
  involvement: '', screens: '', subjects: [], firstName: '', email: '',
}

const TYPE_LABELS: Record<string, string> = {
  book: 'Book', curriculum: 'Curriculum', app: 'App', board_game: 'Board Game',
  toy: 'Toy', online_lessons: 'Online Lessons', online_game: 'Online Game',
  online_classes: 'Online Classes', video: 'Video', workbook: 'Workbook',
  unit_study: 'Unit Study', subscription_box: 'Subscription Box', magazine: 'Magazine',
  online_school: 'Online School', website: 'Website',
}

/* ─── Shared Styles ─── */
const CARD_BASE: React.CSSProperties = {
  border: '2px solid #e2ddd5', borderRadius: 14, padding: '16px 20px',
  cursor: 'pointer', transition: 'all 0.15s ease', backgroundColor: '#fff',
  textAlign: 'left', width: '100%', fontSize: '0.95rem', color: '#383838',
  fontFamily: 'Nunito, sans-serif', fontWeight: 600, lineHeight: 1.5,
}
const CARD_SELECTED: React.CSSProperties = {
  ...CARD_BASE, borderColor: '#55b6ca', backgroundColor: '#edf7fa', color: '#1c1c1c',
}

/* ─── Components ─── */

function RadioCard({ label, value, selected, onSelect }: {
  label: string; value: string; selected: boolean; onSelect: (v: string) => void
}) {
  return (
    <button type="button" onClick={() => onSelect(value)}
      style={selected ? CARD_SELECTED : CARD_BASE}
      onMouseEnter={e => { if (!selected) (e.currentTarget.style.borderColor = '#c5d8dc') }}
      onMouseLeave={e => { if (!selected) (e.currentTarget.style.borderColor = '#e2ddd5') }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          width: 22, height: 22, borderRadius: '50%', border: selected ? 'none' : '2px solid #ccc',
          backgroundColor: selected ? '#55b6ca' : 'transparent', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {selected && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </span>
        {label}
      </span>
    </button>
  )
}

function CheckCard({ label, value, checked, onToggle }: {
  label: string; value: string; checked: boolean; onToggle: (v: string) => void
}) {
  return (
    <button type="button" onClick={() => onToggle(value)}
      style={checked ? CARD_SELECTED : CARD_BASE}
      onMouseEnter={e => { if (!checked) (e.currentTarget.style.borderColor = '#c5d8dc') }}
      onMouseLeave={e => { if (!checked) (e.currentTarget.style.borderColor = '#e2ddd5') }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          width: 22, height: 22, borderRadius: 6, border: checked ? 'none' : '2px solid #ccc',
          backgroundColor: checked ? '#55b6ca' : 'transparent', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {checked && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </span>
        {label}
      </span>
    </button>
  )
}

/* ─── Main Quiz ─── */
export default function QuizPage() {
  const [step, setStep] = useState(0) // 0=intro, 1-7=questions, 8=email, 9=results
  const [answers, setAnswers] = useState<QuizAnswers>({ ...INITIAL })
  const [result, setResult] = useState<QuizResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [skippedEmail, setSkippedEmail] = useState(false)

  const totalSteps = 7

  function setRadio(field: keyof QuizAnswers, value: string) {
    setAnswers(a => ({ ...a, [field]: value }))
  }

  function toggleCheck(field: keyof QuizAnswers, value: string) {
    setAnswers(a => {
      const arr = a[field] as string[]
      return { ...a, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] }
    })
  }

  function canAdvance(): boolean {
    switch (step) {
      case 1: return answers.age !== ''
      case 2: return answers.toughDay.length > 0
      case 3: return answers.engagement.length > 0
      case 4: return answers.timeAvailable !== ''
      case 5: return answers.involvement !== ''
      case 6: return answers.screens !== ''
      case 7: return answers.subjects.length > 0
      case 8: return skippedEmail || (answers.firstName.trim() !== '' && answers.email.trim() !== '')
      default: return true
    }
  }

  async function submitQuiz() {
    setLoading(true)
    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
      const data = await res.json()
      setResult(data)
      setStep(9)
    } catch {
      alert('Something went wrong — please try again.')
    } finally {
      setLoading(false)
    }
  }

  function next() {
    if (step === 8) { submitQuiz(); return }
    if (step === 7) { setStep(8); return }
    setStep(s => s + 1)
  }

  function back() {
    if (step > 0) setStep(s => s - 1)
  }

  /* ─── Render ─── */
  return (
    <div style={{ fontFamily: 'Nunito, sans-serif', minHeight: '100vh', backgroundColor: '#f5f1e9' }}>

      {/* ── Progress Bar (visible during questions) ── */}
      {step >= 1 && step <= 8 && (
        <div style={{ position: 'sticky', top: 0, zIndex: 20, backgroundColor: '#f5f1e9', padding: '16px 24px 0' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.75rem', fontWeight: 700, color: '#999' }}>
              <span>{step <= 7 ? `Question ${step} of ${totalSteps}` : 'Almost done!'}</span>
              <span>{Math.round(((step <= 7 ? step : 7) / totalSteps) * 100)}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, backgroundColor: '#e2ddd5', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3, backgroundColor: '#ed7c5a',
                width: `${((step <= 7 ? step : 7) / totalSteps) * 100}%`,
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Step Container ── */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* ═══ INTRO ═══ */}
        {step === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#238FA4', marginBottom: 16 }}>
              Free Homeschool Style Quiz
            </p>
            <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', fontWeight: 800, color: '#1c1c1c', lineHeight: 1.2, marginBottom: 20 }}>
              Find Your Homeschool Fit
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#5c5c5c', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 12px' }}>
              Answer 7 quick questions and we&apos;ll match your child with resources from our database of 1,100+ homeschool tools — books, games, curricula, apps, and more.
            </p>
            <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: 40 }}>
              Takes about 2 minutes. No account needed.
            </p>
            <button onClick={() => setStep(1)} style={{
              backgroundColor: '#ed7c5a', color: '#fff', fontWeight: 800, fontSize: '1.1rem',
              padding: '16px 48px', borderRadius: 12, border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(237,124,90,0.3)', transition: 'opacity 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Start the Quiz →
            </button>

            {/* Trust signals */}
            <div style={{ marginTop: 56, display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
              {[
                { num: '1,100+', label: 'Resources' },
                { num: '7', label: 'Questions' },
                { num: '2 min', label: 'To complete' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#238FA4', margin: 0 }}>{s.num}</p>
                  <p style={{ fontSize: '0.78rem', color: '#999', margin: 0, fontWeight: 600 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ Q1: Age ═══ */}
        {step === 1 && (
          <QuestionWrapper title="How old is your child?" onNext={next} onBack={back} canAdvance={canAdvance()} step={step}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { v: '3-5', l: '3–5 years old' },
                { v: '6-8', l: '6–8 years old' },
                { v: '9-11', l: '9–11 years old' },
                { v: '12-14', l: '12–14 years old' },
                { v: '15-18', l: '15–18 years old' },
              ].map(o => (
                <RadioCard key={o.v} label={o.l} value={o.v} selected={answers.age === o.v} onSelect={v => setRadio('age', v)} />
              ))}
            </div>
          </QuestionWrapper>
        )}

        {/* ═══ Q2: Tough day ═══ */}
        {step === 2 && (
          <QuestionWrapper title="What does a tough school day usually look like?" subtitle="Pick all that apply" onNext={next} onBack={back} canAdvance={canAdvance()} step={step}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { v: 'meltdowns', l: 'Meltdowns or shutdowns over hard work' },
                { v: 'bored', l: '"I\'m bored" on repeat' },
                { v: 'cant_sit', l: 'Can\'t sit still for more than a few minutes' },
                { v: 'takes_long', l: 'Everything takes way longer than it should' },
                { v: 'fights_writing', l: 'Fights about writing specifically' },
                { v: 'wont_work_alone', l: 'Won\'t work unless I\'m sitting right there' },
                { v: 'pretty_good', l: 'Honestly, most days are pretty good — I just want to optimize' },
              ].map(o => (
                <CheckCard key={o.v} label={o.l} value={o.v} checked={answers.toughDay.includes(o.v)} onToggle={v => toggleCheck('toughDay', v)} />
              ))}
            </div>
          </QuestionWrapper>
        )}

        {/* ═══ Q3: Engagement ═══ */}
        {step === 3 && (
          <QuestionWrapper title="When your child is really into something, what do they do?" subtitle="Pick all that apply" onNext={next} onBack={back} canAdvance={canAdvance()} step={step}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { v: 'talks', l: 'Talk about it nonstop' },
                { v: 'draws_builds', l: 'Draw or build things related to it' },
                { v: 'reads', l: 'Read everything they can find about it' },
                { v: 'watches', l: 'Watch videos about it' },
                { v: 'experiments', l: 'Want to do hands-on experiments' },
                { v: 'teaches', l: 'Want to teach someone else about it' },
              ].map(o => (
                <CheckCard key={o.v} label={o.l} value={o.v} checked={answers.engagement.includes(o.v)} onToggle={v => toggleCheck('engagement', v)} />
              ))}
            </div>
          </QuestionWrapper>
        )}

        {/* ═══ Q4: Time ═══ */}
        {step === 4 && (
          <QuestionWrapper title="How much time do you realistically have for school each day?" onNext={next} onBack={back} canAdvance={canAdvance()} step={step}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { v: 'less_than_1', l: 'Less than 1 hour' },
                { v: '1_2', l: '1–2 hours' },
                { v: '2_3', l: '2–3 hours' },
                { v: '3_plus', l: '3+ hours' },
              ].map(o => (
                <RadioCard key={o.v} label={o.l} value={o.v} selected={answers.timeAvailable === o.v} onSelect={v => setRadio('timeAvailable', v)} />
              ))}
            </div>
          </QuestionWrapper>
        )}

        {/* ═══ Q5: Involvement ═══ */}
        {step === 5 && (
          <QuestionWrapper title="How involved do you want to be in the teaching?" onNext={next} onBack={back} canAdvance={canAdvance()} step={step}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { v: 'teach_myself', l: 'I want to teach it all myself' },
                { v: 'guide_done_for_me', l: 'I\'ll guide, but I need something mostly done-for-me' },
                { v: 'independent', l: 'My child needs to work independently — I can\'t sit with them' },
                { v: 'someone_else', l: 'I want someone else to teach (online classes, videos)' },
              ].map(o => (
                <RadioCard key={o.v} label={o.l} value={o.v} selected={answers.involvement === o.v} onSelect={v => setRadio('involvement', v)} />
              ))}
            </div>
          </QuestionWrapper>
        )}

        {/* ═══ Q6: Screens ═══ */}
        {step === 6 && (
          <QuestionWrapper title="Screens — what's your comfort level?" onNext={next} onBack={back} canAdvance={canAdvance()} step={step}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { v: 'love', l: 'Love \'em — apps and videos are great tools' },
                { v: 'mix', l: 'Some screens are fine, but I want a mix' },
                { v: 'minimal', l: 'Minimal screens — physical books and hands-on' },
              ].map(o => (
                <RadioCard key={o.v} label={o.l} value={o.v} selected={answers.screens === o.v} onSelect={v => setRadio('screens', v)} />
              ))}
            </div>
          </QuestionWrapper>
        )}

        {/* ═══ Q7: Subjects ═══ */}
        {step === 7 && (
          <QuestionWrapper title="What subjects are you most looking for help with?" subtitle="Pick up to 3" onNext={next} onBack={back} canAdvance={canAdvance()} step={step}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { v: 'math', l: 'Math' },
                { v: 'reading', l: 'Reading / Language Arts' },
                { v: 'science', l: 'Science' },
                { v: 'history', l: 'History / Social Studies' },
                { v: 'writing', l: 'Writing' },
                { v: 'foreign_language', l: 'Foreign Language' },
                { v: 'everything', l: 'We need help with everything' },
              ].map(o => (
                <CheckCard key={o.v} label={o.l} value={o.v}
                  checked={answers.subjects.includes(o.v)}
                  onToggle={v => {
                    if (v === 'everything') {
                      setAnswers(a => ({ ...a, subjects: a.subjects.includes('everything') ? [] : ['everything'] }))
                    } else {
                      setAnswers(a => {
                        const without = a.subjects.filter(s => s !== 'everything')
                        const toggled = without.includes(v) ? without.filter(s => s !== v) : [...without, v]
                        return { ...a, subjects: toggled.length > 3 ? toggled.slice(-3) : toggled }
                      })
                    }
                  }}
                />
              ))}
            </div>
          </QuestionWrapper>
        )}

        {/* ═══ Email Capture ═══ */}
        {step === 8 && (
          <div>
            <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#238FA4', fontWeight: 700, fontSize: '0.85rem', marginBottom: 24, padding: 0 }}>
              ← Back
            </button>
            <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: 800, color: '#1c1c1c', lineHeight: 1.25, marginBottom: 8 }}>
              Almost done!
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#5c5c5c', lineHeight: 1.6, marginBottom: 32 }}>
              Where should we send your personalized results?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#383838', marginBottom: 6 }}>First name</label>
                <input
                  type="text" value={answers.firstName}
                  onChange={e => setAnswers(a => ({ ...a, firstName: e.target.value }))}
                  placeholder="Your first name"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: '2px solid #e2ddd5', fontSize: '0.95rem', fontFamily: 'Nunito, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#55b6ca')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e2ddd5')}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#383838', marginBottom: 6 }}>Email address</label>
                <input
                  type="email" value={answers.email}
                  onChange={e => setAnswers(a => ({ ...a, email: e.target.value }))}
                  placeholder="you@example.com"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: '2px solid #e2ddd5', fontSize: '0.95rem', fontFamily: 'Nunito, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#55b6ca')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e2ddd5')}
                />
              </div>
              <p style={{ fontSize: '0.78rem', color: '#999', margin: 0 }}>
                We&apos;ll also send you a few free homeschool tips. Unsubscribe anytime.
              </p>
            </div>
            <button onClick={next} disabled={loading || !canAdvance()} style={{
              width: '100%', marginTop: 24, backgroundColor: '#ed7c5a', color: '#fff', fontWeight: 800,
              fontSize: '1rem', padding: '16px', borderRadius: 12, border: 'none', cursor: loading || !canAdvance() ? 'default' : 'pointer',
              opacity: loading || !canAdvance() ? 0.5 : 1, transition: 'opacity 0.15s',
            }}>
              {loading ? 'Getting your results...' : 'See My Results →'}
            </button>
            {!skippedEmail && (
              <button onClick={() => { setSkippedEmail(true); submitQuiz() }} disabled={loading}
                style={{ display: 'block', margin: '16px auto 0', background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'underline' }}>
                Skip for now
              </button>
            )}
          </div>
        )}

        {/* ═══ Results ═══ */}
        {step === 9 && result && (
          <div>
            {/* Confetti-lite: decorative dots */}
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '2rem' }}>&#10024;</span>
            </div>

            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: '#1c1c1c', textAlign: 'center', lineHeight: 1.25, marginBottom: 40 }}>
              Your Results
            </h2>

            {/* Section 1: Learning Profile */}
            <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '28px 24px', border: '1px solid #e2ddd5', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 28 }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#238FA4', marginBottom: 14 }}>
                Your Child&apos;s Learning Profile
              </h3>
              <div style={{ borderLeft: '4px solid #55b6ca', paddingLeft: 20 }}>
                <p style={{ fontSize: '1rem', lineHeight: 1.75, color: '#383838', margin: 0, fontStyle: 'italic' }}>
                  {result.profile}
                </p>
              </div>
            </div>

            {/* Section 2: Resource Recommendations */}
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#238FA4', marginBottom: 16 }}>
                3 Resources We&apos;d Recommend
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {result.resources.map(r => (
                  <a key={r.id} href={r.url || '#'} target="_blank" rel="noopener noreferrer"
                    style={{ backgroundColor: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #e2ddd5', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', textDecoration: 'none', display: 'block', transition: 'box-shadow 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1c1c1c' }}>{r.name}</span>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                        backgroundColor: '#edf7fa', color: '#238FA4', padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap',
                      }}>
                        {TYPE_LABELS[r.resourceType] || r.resourceType}
                      </span>
                    </div>
                    {r.description && (
                      <p style={{ fontSize: '0.88rem', color: '#5c5c5c', lineHeight: 1.6, margin: 0 }}>
                        {r.description.length > 160 ? r.description.slice(0, 160) + '...' : r.description}
                      </p>
                    )}
                    {r.url && (
                      <span style={{ display: 'inline-block', marginTop: 10, fontSize: '0.8rem', fontWeight: 700, color: '#238FA4' }}>
                        View resource →
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Section 3: Upsell */}
            <div style={{
              background: 'linear-gradient(135deg, #238FA4 0%, #1a7a8d 100%)', borderRadius: 16,
              padding: '32px 28px', color: '#fff', marginBottom: 28,
            }}>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.3, marginBottom: 8 }}>
                We found {result.totalMatches}+ resources that match your child&apos;s profile.
              </p>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, opacity: 0.85, marginBottom: 0 }}>
                Want the full picture?
              </p>
              <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.2)', margin: '20px 0' }} />
              <p style={{ fontSize: '0.95rem', lineHeight: 1.7, opacity: 0.95, marginBottom: 24 }}>
                Melanie works 1-on-1 with homeschool families to build a complete, personalized curriculum plan. She reviews every detail — learning style, challenges, interests, schedule — and hand-picks resources your child will actually love.
              </p>
              <a href="/consulting" style={{
                display: 'inline-block', backgroundColor: '#ed7c5a', color: '#fff', fontWeight: 800,
                fontSize: '0.95rem', padding: '14px 32px', borderRadius: 10, textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)', transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Book a Consulting Session →
              </a>
            </div>

            {/* Section 4: What consulting includes */}
            <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '28px 24px', border: '1px solid #e2ddd5', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#383838', marginBottom: 16 }}>
                What you get with a consulting session:
              </h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'A deep intake form covering every child in your family',
                  'A personalized resource report with 20–50+ matched resources',
                  'Your child\'s learning style and your teaching style breakdown',
                  '3 months of email support with Melanie',
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ color: '#55b6ca', fontWeight: 800, fontSize: '1.1rem', lineHeight: 1, marginTop: 2, flexShrink: 0 }}>&#10003;</span>
                    <span style={{ fontSize: '0.9rem', color: '#5c5c5c', lineHeight: 1.6 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Retake */}
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button onClick={() => { setStep(0); setAnswers({ ...INITIAL }); setResult(null); setSkippedEmail(false) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#238FA4', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'underline' }}>
                Retake the quiz
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {step === 9 && !result && loading && (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <div style={{ width: 40, height: 40, border: '4px solid #e2ddd5', borderTopColor: '#ed7c5a', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: '#5c5c5c', fontWeight: 600 }}>Finding your perfect matches...</p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
      `}} />
    </div>
  )
}

/* ─── Question Wrapper ─── */
function QuestionWrapper({ title, subtitle, children, onNext, onBack, canAdvance, step }: {
  title: string; subtitle?: string; children: React.ReactNode
  onNext: () => void; onBack: () => void; canAdvance: boolean; step: number
}) {
  return (
    <div>
      {step > 1 && (
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#238FA4', fontWeight: 700, fontSize: '0.85rem', marginBottom: 24, padding: 0 }}>
          ← Back
        </button>
      )}
      <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.7rem)', fontWeight: 800, color: '#1c1c1c', lineHeight: 1.3, marginBottom: subtitle ? 6 : 24 }}>
        {title}
      </h2>
      {subtitle && <p style={{ fontSize: '0.88rem', color: '#999', marginBottom: 24, fontWeight: 600 }}>{subtitle}</p>}
      {children}
      <button onClick={onNext} disabled={!canAdvance} style={{
        width: '100%', marginTop: 28, backgroundColor: '#ed7c5a', color: '#fff', fontWeight: 800,
        fontSize: '1rem', padding: '16px', borderRadius: 12, border: 'none', cursor: canAdvance ? 'pointer' : 'default',
        opacity: canAdvance ? 1 : 0.4, transition: 'opacity 0.15s',
      }}
        onMouseEnter={e => { if (canAdvance) e.currentTarget.style.opacity = '0.9' }}
        onMouseLeave={e => { if (canAdvance) e.currentTarget.style.opacity = '1' }}
      >
        {step === 7 ? 'Next →' : 'Next →'}
      </button>
    </div>
  )
}
