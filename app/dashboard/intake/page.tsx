'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

type IntakeForm = {
  parentName: string
  childName: string
  childAge: string
  childGrade: string
  readingLevel: string
  readingFeel: string
  writingLevel: string
  writingFeel: string
  spellingFeel: string
  grammarFeel: string
  spellingNotes: string
  learningStyles: string[]
  biggestChallenges: string
  screenTime: string
  attentionSpan: string
  lovesSubjects: string
  avoidsSubjects: string
  currentCurriculum: string
  homeschoolingDuration: string
  primaryGoal: string
  additionalNotes: string
}

const EMPTY: IntakeForm = {
  parentName: '', childName: '', childAge: '', childGrade: '',
  readingLevel: '', readingFeel: '',
  writingLevel: '', writingFeel: '',
  spellingFeel: '', grammarFeel: '', spellingNotes: '',
  learningStyles: [],
  biggestChallenges: '', screenTime: '', attentionSpan: '',
  lovesSubjects: '', avoidsSubjects: '',
  currentCurriculum: '', homeschoolingDuration: '', primaryGoal: '', additionalNotes: '',
}

const LEARNING_STYLE_OPTIONS = [
  'Hands-on projects', 'Visual / pictures & diagrams', 'Auditory / listening',
  'Reading & writing', 'Movement & activity', 'Games & play',
]

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-bold text-[#1c1c1c] mb-1.5">{label}</label>
      {hint && <p className="text-xs text-[#5c5c5c] mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}

const inputCls = "w-full px-4 py-2.5 rounded-xl border-2 border-[#ddd8cc] bg-white font-semibold text-sm text-[#1c1c1c] focus:outline-none focus:border-[#55b6ca] transition-colors disabled:opacity-60"
const selectCls = `${inputCls} cursor-pointer`
const textareaCls = `${inputCls} resize-none`

export default function IntakePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<IntakeForm>(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [section, setSection] = useState(0)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Check for existing draft/submission
      const res = await fetch('/api/consulting/load-intake')
      if (res.ok) {
        const data = await res.json()
        if (data.status === 'submitted') { setSubmitted(true); setLoading(false); return }
        if (data.responses) {
          setForm({ ...EMPTY, ...data.responses, learningStyles: data.responses.learningStyles ?? [] })
        }
        if (data.last_saved_at) setSavedAt(data.last_saved_at)
      } else if (res.status === 404) {
        // No record yet — that's fine
      } else {
        setError('Could not load your intake form. Please refresh.')
      }
      setLoading(false)
    }
    load()
  }, [])

  function set(field: keyof IntakeForm, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function toggleStyle(style: string) {
    setForm(f => ({
      ...f,
      learningStyles: f.learningStyles.includes(style)
        ? f.learningStyles.filter(s => s !== style)
        : [...f.learningStyles, style],
    }))
  }

  async function saveProgress() {
    setSaving(true)
    setError('')
    const res = await fetch('/api/consulting/save-intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responses: form }),
    })
    if (res.ok) {
      setSavedAt(new Date().toISOString())
    } else {
      const d = await res.json()
      setError(d.error ?? 'Could not save. Please try again.')
    }
    setSaving(false)
  }

  async function handleSubmit() {
    setError('')
    if (!form.childName.trim() || !form.primaryGoal.trim()) {
      setError("Please fill in your child's name and your #1 goal before submitting.")
      return
    }
    setSubmitting(true)
    const res = await fetch('/api/consulting/submit-intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responses: form }),
    })
    if (res.ok) {
      setSubmitted(true)
    } else {
      const d = await res.json()
      setError(d.error ?? 'Could not submit. Please try again.')
    }
    setSubmitting(false)
  }

  if (loading) return <div className="max-w-[700px] mx-auto px-6 py-14 text-[#5c5c5c] text-sm">Loading...</div>

  if (submitted) {
    return (
      <div className="max-w-[700px] mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-6">🎉</div>
        <h1 className="text-2xl font-extrabold mb-3">Form submitted!</h1>
        <p className="text-[#5c5c5c] mb-8">Mel will review your answers and be in touch soon. You can expect to hear back within 3–5 business days.</p>
        <a href="/dashboard" className="inline-block bg-[#ed7c5a] text-white font-bold px-7 py-3 rounded-xl text-sm hover:opacity-90 transition">Back to My Dashboard</a>
      </div>
    )
  }

  const sections = [
    { title: 'About Your Family', content: <SectionFamily form={form} set={set} /> },
    { title: 'Reading', content: <SectionReading form={form} set={set} /> },
    { title: 'Writing', content: <SectionWriting form={form} set={set} /> },
    { title: 'Spelling & Grammar', content: <SectionSpelling form={form} set={set} /> },
    { title: 'Learning Profile', content: <SectionLearning form={form} set={set} toggleStyle={toggleStyle} /> },
    { title: 'Background & Goals', content: <SectionGoals form={form} set={set} /> },
  ]

  return (
    <div className="max-w-[700px] mx-auto px-6 py-12">

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold mb-2">Consulting Intake Form</h1>
        <p className="text-sm text-[#5c5c5c]">Fill this out at your own pace — your progress saves automatically. Once you submit, Mel will review and be in touch.</p>
      </div>

      {/* Progress steps */}
      <div className="flex gap-1.5 mb-8 flex-wrap">
        {sections.map((s, i) => (
          <button
            key={i}
            onClick={() => setSection(i)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              i === section
                ? 'bg-[#ed7c5a] text-white'
                : i < section
                ? 'bg-[#55b6ca] text-white'
                : 'bg-[#f5f1e9] text-[#5c5c5c]'
            }`}
          >
            {i + 1}. {s.title}
          </button>
        ))}
      </div>

      {/* Section card */}
      <div className="bg-white rounded-2xl p-8 border border-[#e2ddd5] mb-6" style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
        <h2 className="text-lg font-extrabold mb-6 text-[#ed7c5a]">{sections[section].title}</h2>
        <div className="space-y-6">
          {sections[section].content}
        </div>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</p>}

      {/* Nav + save actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2">
          {section > 0 && (
            <button onClick={() => setSection(s => s - 1)} className="px-5 py-2.5 rounded-xl border-2 border-[#ddd8cc] text-sm font-bold text-[#5c5c5c] hover:border-[#1c1c1c] transition cursor-pointer">
              ← Back
            </button>
          )}
          {section < sections.length - 1 && (
            <button onClick={() => setSection(s => s + 1)} className="px-5 py-2.5 rounded-xl bg-[#55b6ca] text-white text-sm font-bold hover:opacity-90 transition cursor-pointer">
              Next →
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {savedAt && (
            <span className="text-xs text-[#5c5c5c]">
              Saved {new Date(savedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={saveProgress}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl border-2 border-[#55b6ca] text-[#55b6ca] text-sm font-bold hover:bg-[#55b6ca] hover:text-white transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Progress'}
          </button>
          {section === sections.length - 1 && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#ed7c5a] text-white text-sm font-bold hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit to Mel →'}
            </button>
          )}
        </div>
      </div>

    </div>
  )
}

function SectionFamily({ form, set }: { form: IntakeForm; set: (f: keyof IntakeForm, v: string) => void }) {
  return (
    <>
      <Field label="Your first name">
        <input type="text" value={form.parentName} onChange={e => set('parentName', e.target.value)} placeholder="e.g. Sarah" className={inputCls} />
      </Field>
      <Field label="Your child's name">
        <input type="text" value={form.childName} onChange={e => set('childName', e.target.value)} placeholder="e.g. Emma" className={inputCls} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Child's age">
          <input type="text" value={form.childAge} onChange={e => set('childAge', e.target.value)} placeholder="e.g. 7" className={inputCls} />
        </Field>
        <Field label="Grade level">
          <input type="text" value={form.childGrade} onChange={e => set('childGrade', e.target.value)} placeholder="e.g. 2nd grade" className={inputCls} />
        </Field>
      </div>
    </>
  )
}

function SectionReading({ form, set }: { form: IntakeForm; set: (f: keyof IntakeForm, v: string) => void }) {
  return (
    <>
      <Field label="Where would you place your child's reading level?">
        <select value={form.readingLevel} onChange={e => set('readingLevel', e.target.value)} className={selectCls}>
          <option value="">Select one...</option>
          <option value="not-yet-reading">Not yet reading</option>
          <option value="beginning-reader">Beginning reader</option>
          <option value="grade-level">At grade level</option>
          <option value="above-grade-level">Above grade level</option>
        </select>
      </Field>
      <Field label="How do you feel about where they are with reading?" hint="Are you concerned, content, unsure? Any context helps.">
        <textarea rows={4} value={form.readingFeel} onChange={e => set('readingFeel', e.target.value)} placeholder="Share your thoughts..." className={textareaCls} />
      </Field>
    </>
  )
}

function SectionWriting({ form, set }: { form: IntakeForm; set: (f: keyof IntakeForm, v: string) => void }) {
  return (
    <>
      <Field label="Where would you place your child's writing level?">
        <select value={form.writingLevel} onChange={e => set('writingLevel', e.target.value)} className={selectCls}>
          <option value="">Select one...</option>
          <option value="not-yet-writing">Not yet writing</option>
          <option value="forming-letters">Forming letters</option>
          <option value="sentences">Writing sentences</option>
          <option value="paragraphs">Writing paragraphs</option>
          <option value="above-grade-level">Above grade level</option>
        </select>
      </Field>
      <Field label="How do you feel about where they are with writing?" hint="Any concerns, wins, or things you've noticed?">
        <textarea rows={4} value={form.writingFeel} onChange={e => set('writingFeel', e.target.value)} placeholder="Share your thoughts..." className={textareaCls} />
      </Field>
    </>
  )
}

function SectionSpelling({ form, set }: { form: IntakeForm; set: (f: keyof IntakeForm, v: string) => void }) {
  return (
    <>
      <Field label="How do you feel about spelling?">
        <select value={form.spellingFeel} onChange={e => set('spellingFeel', e.target.value)} className={selectCls}>
          <option value="">Select one...</option>
          <option value="needs-work">Needs a lot of work</option>
          <option value="on-track">On track</option>
          <option value="ahead">Ahead of where I expected</option>
        </select>
      </Field>
      <Field label="How do you feel about grammar?">
        <select value={form.grammarFeel} onChange={e => set('grammarFeel', e.target.value)} className={selectCls}>
          <option value="">Select one...</option>
          <option value="needs-work">Needs a lot of work</option>
          <option value="on-track">On track</option>
          <option value="ahead">Ahead of where I expected</option>
        </select>
      </Field>
      <Field label="Any notes on spelling or grammar?">
        <textarea rows={3} value={form.spellingNotes} onChange={e => set('spellingNotes', e.target.value)} placeholder="Optional — anything specific you've noticed..." className={textareaCls} />
      </Field>
    </>
  )
}

function SectionLearning({ form, set, toggleStyle }: {
  form: IntakeForm
  set: (f: keyof IntakeForm, v: string) => void
  toggleStyle: (s: string) => void
}) {
  return (
    <>
      <Field label="How does your child learn best?" hint="Check all that apply.">
        <div className="flex flex-wrap gap-2 mt-1">
          {LEARNING_STYLE_OPTIONS.map(style => (
            <button
              key={style}
              type="button"
              onClick={() => toggleStyle(style)}
              className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all cursor-pointer ${
                form.learningStyles.includes(style)
                  ? 'bg-[#55b6ca] border-[#55b6ca] text-white'
                  : 'bg-white border-[#ddd8cc] text-[#5c5c5c] hover:border-[#55b6ca]'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </Field>
      <Field label="What are their biggest learning challenges?">
        <textarea rows={3} value={form.biggestChallenges} onChange={e => set('biggestChallenges', e.target.value)} placeholder="e.g. staying focused, handwriting, reading comprehension..." className={textareaCls} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Daily screen time">
          <select value={form.screenTime} onChange={e => set('screenTime', e.target.value)} className={selectCls}>
            <option value="">Select one...</option>
            <option value="under-1hr">Less than 1 hour</option>
            <option value="1-2hrs">1–2 hours</option>
            <option value="2-3hrs">2–3 hours</option>
            <option value="over-3hrs">More than 3 hours</option>
          </select>
        </Field>
        <Field label="Typical attention span">
          <select value={form.attentionSpan} onChange={e => set('attentionSpan', e.target.value)} className={selectCls}>
            <option value="">Select one...</option>
            <option value="a-few-minutes">A few minutes</option>
            <option value="10-15min">10–15 minutes</option>
            <option value="20-30min">20–30 minutes</option>
            <option value="30-plus">30+ minutes</option>
          </select>
        </Field>
      </div>
      <Field label="Subjects or activities they love">
        <textarea rows={3} value={form.lovesSubjects} onChange={e => set('lovesSubjects', e.target.value)} placeholder="e.g. science, art, building things, reading..." className={textareaCls} />
      </Field>
      <Field label="Subjects or activities they avoid">
        <textarea rows={3} value={form.avoidsSubjects} onChange={e => set('avoidsSubjects', e.target.value)} placeholder="e.g. math, writing, sitting still..." className={textareaCls} />
      </Field>
    </>
  )
}

function SectionGoals({ form, set }: { form: IntakeForm; set: (f: keyof IntakeForm, v: string) => void }) {
  return (
    <>
      <Field label="What curriculum are you currently using?" hint="Or 'none' / 'eclectic' if applicable.">
        <input type="text" value={form.currentCurriculum} onChange={e => set('currentCurriculum', e.target.value)} placeholder="e.g. Sonlight, Charlotte Mason, eclectic..." className={inputCls} />
      </Field>
      <Field label="How long have you been homeschooling?">
        <select value={form.homeschoolingDuration} onChange={e => set('homeschoolingDuration', e.target.value)} className={selectCls}>
          <option value="">Select one...</option>
          <option value="just-starting">Just starting out</option>
          <option value="less-than-1yr">Less than 1 year</option>
          <option value="1-2yrs">1–2 years</option>
          <option value="3-5yrs">3–5 years</option>
          <option value="5plus-yrs">5+ years</option>
        </select>
      </Field>
      <Field label="What is your #1 goal for this consulting relationship?" hint="Be as specific as you like — this helps Mel focus her recommendations.">
        <textarea rows={4} value={form.primaryGoal} onChange={e => set('primaryGoal', e.target.value)} placeholder="e.g. I want to find a reading program that actually works for my struggling reader..." className={textareaCls} />
      </Field>
      <Field label="Anything else you want Mel to know?">
        <textarea rows={4} value={form.additionalNotes} onChange={e => set('additionalNotes', e.target.value)} placeholder="Optional — any context, concerns, or hopes you'd like to share..." className={textareaCls} />
      </Field>
    </>
  )
}
