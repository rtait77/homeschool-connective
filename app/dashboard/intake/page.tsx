'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

// ── TYPES ──────────────────────────────────────────────────────────────────
type ChildData = {
  name: string; age: string
  regulation: string[]
  frustrationChild: string[]; frustrationParent: string[]; frustrationWorks: string
  newTasks: string[]; hardTasks: string[]
  readAloud: string[]
  videoEngagement: string[]; screenUse: string[]
  games: string[]
  readingLevel: string; readingFeel: string
  writingStage: string; writingFeel: string
  physicalWriting: string[]; writingTypes: string[]
  spellingLevel: string; spellingFeel: string
  grammarLevel: string; grammarFeel: string
  grammarStruggles: string[]; grammarStrugglesOther: string
  demonstratesUnderstanding: string[]
  focusSpan: string; intenseInterests: string
  lovesSubjects: string[]; lovesOther: string
  avoidsSubjects: string[]; avoidsOther: string
  levelFlexibility: string
  readingPreference: string[]; bookFormat: string[]; independenceLevel: string
  freeTimeActivities: string[]; freeTimeOther: string
  extraInfo: string[]; diagnosis: string; extraOther: string
  coreSubjects: string[]
  mathTopics: string[]; mathTopicsOther: string
  scienceTopics: string[]; scienceTopicsOther: string
  historyTopics: string[]; historyTopicsOther: string
  elaTopics: string[]; elaTopicsOther: string
  foreignLanguages: string[]; foreignLanguagesOther: string
  skillsPractice: string[]; skillsPracticeOther: string
}

type IntakeForm = {
  parentName: string; parentEmail: string; parentState: string
  children: ChildData[]
  whyHomeschooling: string[]; whyOther: string
  experienceLength: string
  currentExperience: string; primaryGoal: string
  startingFeelings: string[]
  curriculumExperience: string[]; curriculumHappened: string; curriculumTried: string
  biggestChallenges: string[]; biggestChallengesOther: string
  daysPerWeek: string; hoursPerDay: string; numChildrenHomeschooling: string
  otherDemands: string[]
  idealDay: string[]
  teachingStyle: string[]
  screenAttitude: string[]
  progressMeasurement: string[]
  prepWillingness: string
  learningEnvironment: string[]
  coopParticipation: string[]
  parentPersonality: string[]
  religiousPreference: string
  educationValues: string[]
  biggestWorries: string[]
  successVision: string; howHeard: string; parentNotes: string
}

const EMPTY_CHILD: ChildData = {
  name: '', age: '',
  regulation: [], frustrationChild: [], frustrationParent: [], frustrationWorks: '',
  newTasks: [], hardTasks: [],
  readAloud: [],
  videoEngagement: [], screenUse: [],
  games: [],
  readingLevel: '', readingFeel: '',
  writingStage: '', writingFeel: '',
  physicalWriting: [], writingTypes: [],
  spellingLevel: '', spellingFeel: '',
  grammarLevel: '', grammarFeel: '',
  grammarStruggles: [], grammarStrugglesOther: '',
  demonstratesUnderstanding: [],
  focusSpan: '', intenseInterests: '',
  lovesSubjects: [], lovesOther: '',
  avoidsSubjects: [], avoidsOther: '',
  levelFlexibility: '',
  readingPreference: [], bookFormat: [], independenceLevel: '',
  freeTimeActivities: [], freeTimeOther: '',
  extraInfo: [], diagnosis: '', extraOther: '',
  coreSubjects: [],
  mathTopics: [], mathTopicsOther: '',
  scienceTopics: [], scienceTopicsOther: '',
  historyTopics: [], historyTopicsOther: '',
  elaTopics: [], elaTopicsOther: '',
  foreignLanguages: [], foreignLanguagesOther: '',
  skillsPractice: [], skillsPracticeOther: '',
}

const EMPTY: IntakeForm = {
  parentName: '', parentEmail: '', parentState: '',
  children: [{ ...EMPTY_CHILD }],
  whyHomeschooling: [], whyOther: '',
  experienceLength: '',
  currentExperience: '', primaryGoal: '',
  startingFeelings: [],
  curriculumExperience: [], curriculumHappened: '', curriculumTried: '',
  biggestChallenges: [], biggestChallengesOther: '',
  daysPerWeek: '', hoursPerDay: '', numChildrenHomeschooling: '',
  otherDemands: [],
  idealDay: [],
  teachingStyle: [],
  screenAttitude: [],
  progressMeasurement: [],
  prepWillingness: '',
  learningEnvironment: [],
  coopParticipation: [],
  parentPersonality: [],
  religiousPreference: '',
  educationValues: [],
  biggestWorries: [],
  successVision: '', howHeard: '', parentNotes: '',
}

// ── STYLE CONSTANTS ────────────────────────────────────────────────────────
const inputCls = "w-full px-4 py-2.5 rounded-xl border-2 border-[#ddd8cc] bg-white font-semibold text-sm text-[#1c1c1c] focus:outline-none focus:border-[#55b6ca] transition-colors"
const textareaCls = `${inputCls} resize-none`

// ── HELPER COMPONENTS ──────────────────────────────────────────────────────
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-bold text-[#1c1c1c] mb-1.5">{label}</label>
      {hint && <p className="text-xs text-[#5c5c5c] mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}

function CheckList({ options, values, onChange }: { options: string[]; values: string[]; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5 mt-1">
      {options.map(opt => (
        <label key={opt} className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border-2 cursor-pointer text-sm font-semibold transition-all ${values.includes(opt) ? 'bg-[#eaf7fb] border-[#55b6ca] text-[#1c1c1c]' : 'bg-white border-[#ddd8cc] text-[#5c5c5c] hover:border-[#55b6ca]'}`}>
          <input type="checkbox" checked={values.includes(opt)} onChange={() => onChange(opt)} className="mt-0.5 accent-[#ed7c5a] flex-shrink-0 w-4 h-4" />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  )
}

function RadioList({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5 mt-1">
      {options.map(opt => (
        <label key={opt} className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border-2 cursor-pointer text-sm font-semibold transition-all ${value === opt ? 'bg-[#eaf7fb] border-[#55b6ca] text-[#1c1c1c]' : 'bg-white border-[#ddd8cc] text-[#5c5c5c] hover:border-[#55b6ca]'}`}>
          <input type="radio" checked={value === opt} onChange={() => onChange(opt)} className="mt-0.5 accent-[#ed7c5a] flex-shrink-0 w-4 h-4" />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  )
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-extrabold text-[#55b6ca] uppercase tracking-wider mt-5 mb-2">{children}</p>
}

function Followup({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null
  return (
    <div className="mt-3 p-4 bg-[#f5f1e9] rounded-xl border-l-4 border-[#55b6ca] space-y-4">
      {children}
    </div>
  )
}

function QBlock({ num, label, note, children }: { num?: string | number; label: string; note?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-bold text-[#1c1c1c] mb-1">{num ? `${num}. ` : ''}{label}</p>
      {note && <p className="text-xs text-[#5c5c5c] mb-2">{note}</p>}
      {children}
    </div>
  )
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function IntakePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<IntakeForm>(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [reportSent, setReportSent] = useState(false)
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
      const res = await fetch('/api/consulting/load-intake')
      if (res.ok) {
        const data = await res.json()
        if (data.status === 'submitted') setSubmitted(true)
        if (data.report_sent) setReportSent(true)
        if (data.responses) {
          const r = data.responses
          // Migrate from old single-child format
          let children = r.children
          if (!children && r.childName) {
            children = [{
              ...EMPTY_CHILD,
              name: r.childName || '',
              age: r.childAge || '',
              readingLevel: r.readingLevel || '',
              readingFeel: r.readingFeel || '',
              writingStage: r.writingLevel || '',
              writingFeel: r.writingFeel || '',
            }]
          }
          setForm({
            ...EMPTY,
            ...r,
            children: children && children.length > 0
              ? children.map((c: Partial<ChildData>) => ({ ...EMPTY_CHILD, ...c }))
              : [{ ...EMPTY_CHILD }],
          })
        }
        if (data.last_saved_at) setSavedAt(data.last_saved_at)
      } else if (res.status !== 404) {
        setError('Could not load your intake form. Please refresh.')
      }
      setLoading(false)
    }
    load()
  }, [])

  function set(field: keyof IntakeForm, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function toggleCheck(field: keyof IntakeForm, value: string) {
    setForm(f => {
      const arr = (f[field] as string[]) || []
      return { ...f, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] }
    })
  }

  function setChildField(index: number, field: keyof ChildData, value: string) {
    setForm(f => {
      const children = [...f.children]
      children[index] = { ...children[index], [field]: value }
      return { ...f, children }
    })
  }

  function toggleChildCheck(index: number, field: keyof ChildData, value: string) {
    setForm(f => {
      const children = [...f.children]
      const arr = (children[index][field] as string[]) || []
      children[index] = { ...children[index], [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] }
      return { ...f, children }
    })
  }

  function addChild() {
    if (form.children.length >= 6) return
    setForm(f => ({ ...f, children: [...f.children, { ...EMPTY_CHILD }] }))
  }

  function removeChild(index: number) {
    if (form.children.length <= 1) return
    setForm(f => ({ ...f, children: f.children.filter((_, i) => i !== index) }))
    if (section > 1 + index) setSection(s => s - 1)
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
    if (!form.parentName.trim() || !form.children[0]?.name.trim()) {
      setError("Please fill in your name and your child's name before submitting.")
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

  if (loading) return <div className="max-w-[760px] mx-auto px-6 py-14 text-[#5c5c5c] text-sm">Loading...</div>

  const sections = [
    {
      title: 'Before We Begin',
      content: (
        <SectionIntro
          form={form}
          set={(f, v) => set(f as keyof IntakeForm, v)}
          setChildField={(i, f, v) => setChildField(i, f as keyof ChildData, v)}
          addChild={addChild}
          removeChild={removeChild}
        />
      ),
    },
    {
      title: 'About You',
      content: (
        <SectionParent
          form={form}
          set={(f, v) => set(f as keyof IntakeForm, v)}
          toggleCheck={(f, v) => toggleCheck(f as keyof IntakeForm, v)}
        />
      ),
    },
    ...form.children.map((child, i) => ({
      title: child.name || `Child ${i + 1}`,
      content: (
        <SectionChild
          key={i}
          child={child}
          setChildField={(f, v) => setChildField(i, f as keyof ChildData, v)}
          toggleChildCheck={(f, v) => toggleChildCheck(i, f as keyof ChildData, v)}
        />
      ),
    })),
  ]

  return (
    <div className="max-w-[760px] mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold mb-2">Consulting Intake Form</h1>
        <p className="text-sm text-[#5c5c5c]">Fill this out at your own pace — your progress saves automatically. Once you submit, Mel will review and be in touch.</p>
      </div>

      {submitted && (
        <div className="mb-6 bg-[#edfaf4] border-2 border-[#3dbb7e] rounded-2xl px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-extrabold text-sm text-[#1a7a52] mb-0.5">Form submitted</p>
            <p className="text-sm text-[#5c5c5c]">Your answers are with Mel. This is a read-only copy.</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {!reportSent && (
              <button onClick={() => { setSubmitted(false); setError('') }} className="text-sm font-bold text-[#ed7c5a] hover:underline whitespace-nowrap cursor-pointer">
                Edit &amp; Resubmit
              </button>
            )}
            <a href="/dashboard" className="text-sm font-bold text-[#55b6ca] hover:underline whitespace-nowrap">← Dashboard</a>
          </div>
        </div>
      )}

      {/* Section pills */}
      <div className="flex gap-1.5 mb-8 flex-wrap">
        {sections.map((s, i) => (
          <button
            key={i}
            onClick={() => { setSection(i); window.scrollTo({ top: 0 }) }}
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
      <div className={`bg-white rounded-2xl p-8 border border-[#e2ddd5] mb-6 ${submitted ? 'pointer-events-none opacity-80' : ''}`} style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
        <h2 className="text-lg font-extrabold mb-6 text-[#ed7c5a]">{sections[section].title}</h2>
        <div className="space-y-8">
          {sections[section].content}
        </div>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</p>}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2">
          {section > 0 && (
            <button onClick={() => { setSection(s => s - 1); window.scrollTo({ top: 0 }) }} className="px-5 py-2.5 rounded-xl border-2 border-[#ddd8cc] text-sm font-bold text-[#5c5c5c] hover:border-[#1c1c1c] transition cursor-pointer">
              ← Back
            </button>
          )}
          {section < sections.length - 1 && (
            <button onClick={() => { setSection(s => s + 1); window.scrollTo({ top: 0 }) }} className="px-5 py-2.5 rounded-xl bg-[#55b6ca] text-white text-sm font-bold hover:opacity-90 transition cursor-pointer">
              Next →
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!submitted && savedAt && (
            <span className="text-xs text-[#5c5c5c]">
              Saved {new Date(savedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
          {!submitted && (
            <button
              onClick={saveProgress}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl border-2 border-[#55b6ca] text-[#55b6ca] text-sm font-bold hover:bg-[#55b6ca] hover:text-white transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Progress'}
            </button>
          )}
          {!submitted && section === sections.length - 1 && (
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

// ── SECTION: BEFORE WE BEGIN ───────────────────────────────────────────────
function SectionIntro({
  form, set, setChildField, addChild, removeChild,
}: {
  form: IntakeForm
  set: (f: string, v: string) => void
  setChildField: (i: number, f: string, v: string) => void
  addChild: () => void
  removeChild: (i: number) => void
}) {
  return (
    <>
      <p className="text-sm text-[#5c5c5c] -mt-2">There are no wrong answers here. Mel works with families on everything from finding the right curriculum to navigating learning differences, rebuilding confidence, and figuring out what homeschool can actually look like for your family.</p>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Your name *">
          <input type="text" value={form.parentName} onChange={e => set('parentName', e.target.value)} placeholder="Jane Smith" className={inputCls} />
        </Field>
        <Field label="Your email *">
          <input type="email" value={form.parentEmail} onChange={e => set('parentEmail', e.target.value)} placeholder="jane@email.com" className={inputCls} />
        </Field>
      </div>

      <Field label="What state are you homeschooling in?">
        <input type="text" value={form.parentState} onChange={e => set('parentState', e.target.value)} placeholder="e.g. Texas" className={inputCls} />
      </Field>

      <div>
        <p className="text-sm font-bold text-[#1c1c1c] mb-3">Your children</p>
        <div className="space-y-3">
          {form.children.map((child, i) => (
            <div key={i} className="bg-[#f5f1e9] rounded-xl p-4 border-2 border-[#ddd8cc]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-[#55b6ca] uppercase tracking-wider">Child {i + 1}</span>
                {form.children.length > 1 && (
                  <button onClick={() => removeChild(i)} className="text-xs font-bold text-[#ccc] hover:text-[#ed7c5a] transition cursor-pointer">
                    ✕ Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name *">
                  <input type="text" value={child.name} onChange={e => setChildField(i, 'name', e.target.value)} placeholder="First name" className={inputCls} />
                </Field>
                <Field label="Age">
                  <input type="text" value={child.age} onChange={e => setChildField(i, 'age', e.target.value)} placeholder="e.g. 7" className={inputCls} />
                </Field>
              </div>
            </div>
          ))}
        </div>
        {form.children.length < 6 && (
          <button onClick={addChild} className="mt-3 px-5 py-2.5 rounded-xl border-2 border-[#55b6ca] text-[#55b6ca] text-sm font-bold hover:bg-[#55b6ca] hover:text-white transition cursor-pointer">
            + Add Another Child
          </button>
        )}
        {form.children.length >= 6 && (
          <p className="mt-3 text-xs text-[#5c5c5c]">Maximum 6 children reached.</p>
        )}
        {form.children.length > 1 && (
          <p className="mt-3 text-xs text-[#5c5c5c]">Each child will have their own section in this form.</p>
        )}
      </div>
    </>
  )
}

// ── SECTION: ABOUT YOU (PARENT) ────────────────────────────────────────────
function SectionParent({
  form, set, toggleCheck,
}: {
  form: IntakeForm
  set: (f: string, v: string) => void
  toggleCheck: (f: string, v: string) => void
}) {
  const isNew = form.experienceLength === "We haven't started yet — we're planning ahead"
  const isExisting = !!form.experienceLength && !isNew
  const showCurrFu = form.curriculumExperience.includes("Yes — and it didn't work well for us") ||
    form.curriculumExperience.includes("We've tried a few things and are still figuring it out")

  return (
    <>
      <QBlock num={1} label="Why are you homeschooling?" note="Pick all that apply">
        <CheckList
          options={[
            "My child has learning differences or special needs that school wasn't meeting",
            'We want more flexibility in our schedule and lifestyle',
            'We had a bad experience with traditional school',
            'Academic reasons — we want more rigour or a different approach',
            'Religious or values-based reasons',
            'My child has anxiety, social struggles, or was not thriving in school',
            'We want to travel or live an unconventional lifestyle',
            'We were always planning to homeschool',
            'We started during COVID and never went back',
            'My child asked to be homeschooled',
            'Other',
          ]}
          values={form.whyHomeschooling}
          onChange={v => toggleCheck('whyHomeschooling', v)}
        />
        {form.whyHomeschooling.includes('Other') && (
          <div className="mt-3">
            <Field label="Please share:">
              <input type="text" value={form.whyOther} onChange={e => set('whyOther', e.target.value)} placeholder="Tell us more..." className={inputCls} />
            </Field>
          </div>
        )}
      </QBlock>

      <QBlock num={2} label="How long have you been homeschooling?" note="Choose one">
        <RadioList
          options={[
            "We haven't started yet — we're planning ahead",
            'Less than 6 months',
            '6 months to 1 year',
            '1–2 years',
            '3–5 years',
            'More than 5 years',
          ]}
          value={form.experienceLength}
          onChange={v => set('experienceLength', v)}
        />
        <Followup show={isNew}>
          <p className="text-xs font-bold text-[#55b6ca] mb-2">How are you feeling about beginning homeschooling?</p>
          <p className="text-xs text-[#5c5c5c] mb-1">Pick all that apply</p>
          <CheckList
            options={[
              "Excited — I can't wait to get started",
              'Scared or nervous',
              'Uncertain — not sure what to expect',
              "Totally lost — I don't know where to begin",
            ]}
            values={form.startingFeelings}
            onChange={v => toggleCheck('startingFeelings', v)}
          />
        </Followup>
        <Followup show={isExisting}>
          <p className="text-xs font-bold text-[#55b6ca] mb-2">How would you describe your current homeschool experience?</p>
          <RadioList
            options={[
              "Completely lost — I don't know where to start",
              "We're trying, but it feels chaotic and inconsistent",
              'We have some things working, but need help in certain areas',
              'Things are going okay, but I want to level up',
              "We're doing well — I just need accountability and new ideas",
            ]}
            value={form.currentExperience}
            onChange={v => set('currentExperience', v)}
          />
          <div className="mt-4">
            <Field label="What is your #1 goal for your homeschool right now?">
              <textarea rows={3} value={form.primaryGoal} onChange={e => set('primaryGoal', e.target.value)} placeholder="e.g. get my child reading independently, find a curriculum that finally sticks..." className={textareaCls} />
            </Field>
          </div>
        </Followup>

        <SubLabel>Have you used a formal curriculum before?</SubLabel>
        <p className="text-xs text-[#5c5c5c] mb-1">Pick all that apply</p>
        <CheckList
          options={[
            "No — we're just getting started",
            'Yes — and it worked well for us',
            "Yes — and it didn't work well for us",
            "We've tried a few things and are still figuring it out",
          ]}
          values={form.curriculumExperience}
          onChange={v => toggleCheck('curriculumExperience', v)}
        />
        <Followup show={showCurrFu}>
          <Field label="What happened?">
            <input type="text" value={form.curriculumHappened} onChange={e => set('curriculumHappened', e.target.value)} placeholder="What went wrong or what didn't fit..." className={inputCls} />
          </Field>
          <Field label="What curriculum did you try?">
            <input type="text" value={form.curriculumTried} onChange={e => set('curriculumTried', e.target.value)} placeholder="e.g. All About Reading, Math-U-See..." className={inputCls} />
          </Field>
        </Followup>
      </QBlock>

      <QBlock label="What feels like your biggest challenge right now?" note="Pick all that apply">
        <CheckList
          options={[
            'Math',
            'Reading / Language Arts',
            'Science',
            'History / Social Studies',
            'Writing',
            'Scheduling and consistency',
            "My child's motivation",
            'My own confidence as a teacher',
            'Other',
          ]}
          values={form.biggestChallenges}
          onChange={v => toggleCheck('biggestChallenges', v)}
        />
        {form.biggestChallenges.includes('Other') && (
          <div className="mt-3">
            <Field label="What else?">
              <input type="text" value={form.biggestChallengesOther} onChange={e => set('biggestChallengesOther', e.target.value)} placeholder="Describe your challenge..." className={inputCls} />
            </Field>
          </div>
        )}
      </QBlock>

      <div>
        <p className="text-sm font-bold text-[#1c1c1c] mb-1">3. Schedule and availability</p>
        <p className="text-xs italic text-[#ed7c5a] mb-3">If you haven't started yet, answer based on what you anticipate.</p>
        <SubLabel>How many days per week do you typically do structured learning?</SubLabel>
        <RadioList
          options={['2–3 days per week', '4 days per week', '5 days per week', 'It varies a lot week to week']}
          value={form.daysPerWeek}
          onChange={v => set('daysPerWeek', v)}
        />
        <SubLabel>On school days, how many hours are you realistically available?</SubLabel>
        <RadioList
          options={['Less than 1 hour', '1–2 hours', '2–3 hours', '3–4 hours', '4+ hours']}
          value={form.hoursPerDay}
          onChange={v => set('hoursPerDay', v)}
        />
        <SubLabel>How many children are you homeschooling at the same time?</SubLabel>
        <RadioList
          options={['Just one', 'Two', 'Three', 'Four or more']}
          value={form.numChildrenHomeschooling}
          onChange={v => set('numChildrenHomeschooling', v)}
        />
        <SubLabel>Other demands during school hours</SubLabel>
        <p className="text-xs text-[#5c5c5c] mb-1">Pick all that apply</p>
        <CheckList
          options={[
            'I work part-time during school hours',
            'I work full-time — homeschooling happens around my work schedule',
            'I have a baby or toddler at home',
            'I have significant caregiving responsibilities for another family member',
            'My time is mostly free during school hours',
          ]}
          values={form.otherDemands}
          onChange={v => toggleCheck('otherDemands', v)}
        />
      </div>

      <QBlock num={4} label="When you imagine your ideal homeschool day, what does it look like?" note="Pick all that apply">
        <CheckList
          options={[
            'A structured schedule — same subjects, same order, every day',
            'A loose rhythm — a general flow but flexible day to day',
            "Child-led — we follow what they're interested in that day",
            'A mix of structured core subjects plus free exploration time',
            'We do school in short bursts throughout the day rather than one block',
            'We do intense school days some days and take other days off completely',
          ]}
          values={form.idealDay}
          onChange={v => toggleCheck('idealDay', v)}
        />
      </QBlock>

      <QBlock num={5} label="How do you naturally prefer to teach?" note="Pick all that apply">
        <CheckList
          options={[
            'Sitting down and teaching directly — explaining, questioning, discussing',
            'Setting up activities and materials and stepping back',
            'Reading aloud together and discussing',
            'Finding experiences — field trips, documentaries, real-world projects',
            'I prefer to let the curriculum or a video do the teaching and I support',
            'I love incorporating creativity, art, music, or storytelling into how we learn',
            "I'm still figuring out what kind of teacher I am",
          ]}
          values={form.teachingStyle}
          onChange={v => toggleCheck('teachingStyle', v)}
        />
      </QBlock>

      <QBlock num={6} label="How do you feel about screens and technology as part of your homeschool?" note="Pick all that apply">
        <CheckList
          options={[
            "I'm fully on board — video lessons and apps are great tools",
            "Online games are a learning tool I'm comfortable using",
            'I prefer minimal screens — I want physical books and hands-on work',
            "I'm open to it but want to be selective",
            'I use screens as a reward, not a learning tool',
            'My child would do everything on a screen if I let them — I need a balance',
            'Screen-based curriculum is a practical necessity for us given my schedule',
            'I prefer a mix — some screen-based learning alongside physical books and hands-on activities',
          ]}
          values={form.screenAttitude}
          onChange={v => toggleCheck('screenAttitude', v)}
        />
      </QBlock>

      <QBlock num={7} label="How do you feel about your child's progress being measured?" note="Pick all that apply">
        <CheckList
          options={[
            "I need clear grade levels and scope-and-sequence — I need to know we're on track",
            "I care more about mastery than grade level — they move when they're ready",
            'Testing and grades make me anxious — I prefer portfolio or narrative assessment',
            'My state requires testing or record-keeping and I need curriculum that helps with that',
            "I trust the process — I'm not focused on measuring progress formally",
          ]}
          values={form.progressMeasurement}
          onChange={v => toggleCheck('progressMeasurement', v)}
        />
      </QBlock>

      <QBlock num={8} label="How much preparation and planning are you willing and able to do?" note="Choose one">
        <RadioList
          options={[
            'I need something I can open and use with minimal prep — done for me',
            "I'm happy to do some planning — maybe an hour a week",
            'I enjoy planning and can invest significant time in designing our school',
            'I want a spine or framework I can build around with my own additions',
          ]}
          value={form.prepWillingness}
          onChange={v => set('prepWillingness', v)}
        />
      </QBlock>

      <QBlock num={9} label="What does your child's learning environment look like?" note="Pick all that apply">
        <CheckList
          options={[
            'A dedicated school room or space',
            'Kitchen table or shared living space',
            'Wherever they feel like that day — we move around',
            'Outdoors as much as possible',
            'We travel and school on the road',
            "It's noisy and busy — younger siblings, pets, distractions",
            "It's generally quiet and calm",
            'We have a specific lifestyle — homesteading, travel, family business, ministry — that learning naturally happens inside',
          ]}
          values={form.learningEnvironment}
          onChange={v => toggleCheck('learningEnvironment', v)}
        />
      </QBlock>

      <QBlock num={10} label="Are you part of a homeschool co-op or community?" note="Pick all that apply">
        <CheckList
          options={[
            "Yes — we attend regularly and it's important to us",
            "Yes — but it's occasional, not central to our homeschool",
            "No — but we're looking for one",
            'No — we prefer to homeschool independently',
            'We use online classes or communities instead of in-person co-ops',
          ]}
          values={form.coopParticipation}
          onChange={v => toggleCheck('coopParticipation', v)}
        />
      </QBlock>

      <QBlock num={11} label="How would you describe yourself as a person?" note="Pick all that apply">
        <CheckList
          options={[
            "I'm a planner — I like structure and knowing what comes next",
            "I'm a go-with-the-flow type — rigidity stresses me out",
            'I get excited about new ideas but struggle with follow-through',
            "I'm consistent and persistent — I finish what I start",
            "I get overwhelmed easily when there's too much on my plate",
            'I have my own learning differences or challenges that affect how I teach',
            'I have anxiety that sometimes affects our homeschool',
            "I learn best the same way my child does — we're very similar",
            'I learn very differently from my child — we sometimes clash',
          ]}
          values={form.parentPersonality}
          onChange={v => toggleCheck('parentPersonality', v)}
        />
      </QBlock>

      <QBlock num={12} label="When it comes to curriculum and resources, do you have a preference?" note="Choose one">
        <RadioList
          options={[
            'Secular only — I prefer no religious content',
            'Christian / faith-based — I prefer resources that reflect our faith',
            'Either is fine — open to both secular and faith-based recommendations',
          ]}
          value={form.religiousPreference}
          onChange={v => set('religiousPreference', v)}
        />
      </QBlock>

      <QBlock num={13} label="What does your family value most in education?" note="Pick your top 3">
        <CheckList
          options={[
            'Academic rigor — I want my child challenged and well-prepared',
            'Character development — kindness, integrity, responsibility',
            'Creativity and self-expression',
            'Independence and self-direction — learning to learn',
            'Faith formation — education grounded in our beliefs',
            'Real-world skills — practical knowledge they can use',
            'Social skills and emotional growth',
            'Joy and love of learning — I want them to be curious, not burned out',
          ]}
          values={form.educationValues}
          onChange={v => toggleCheck('educationValues', v)}
        />
      </QBlock>

      <QBlock num={14} label="What worries you most about homeschooling right now?" note="Pick all that apply">
        <CheckList
          options={[
            "I'm worried about gaps in their education",
            "I'm worried about socialization",
            "I'm not sure I'm qualified to teach everything",
            "I worry they're falling behind their peers",
            "I'm heading toward burnout",
            "I worry about college readiness and transcripts",
            "I don't know if what we're doing is enough",
            "I'm worried about a specific learning challenge or diagnosis",
            "Honestly, I'm feeling good — I just want to keep improving",
          ]}
          values={form.biggestWorries}
          onChange={v => toggleCheck('biggestWorries', v)}
        />
      </QBlock>

      <Field label='What would "homeschool success" look like for your family 6 months from now?'>
        <textarea rows={3} value={form.successVision} onChange={e => set('successVision', e.target.value)} placeholder="Describe what success would look like..." className={textareaCls} />
      </Field>

      <Field label="How did you hear about Homeschool Connective?">
        <input type="text" value={form.howHeard} onChange={e => set('howHeard', e.target.value)} placeholder="e.g. Instagram, a friend, Google..." className={inputCls} />
      </Field>

      <Field label="Is there anything else you'd like Mel to know about you?">
        <textarea rows={5} value={form.parentNotes} onChange={e => set('parentNotes', e.target.value)} placeholder="Share anything else that feels relevant — no detail is too small..." className={textareaCls} />
      </Field>
    </>
  )
}

// ── SECTION: CHILD ─────────────────────────────────────────────────────────
function SectionChild({
  child, setChildField, toggleChildCheck,
}: {
  child: ChildData
  setChildField: (f: string, v: string) => void
  toggleChildCheck: (f: string, v: string) => void
}) {
  const n = child.name || 'your child'
  const showFocusFu = child.focusSpan === '5 minutes or less' ||
    child.focusSpan === 'Completely depends on the topic — night and day difference'

  return (
    <>
      <QBlock num={1} label={`How does ${n} typically calm down when overwhelmed or dysregulated?`} note="Pick all that apply">
        <CheckList
          options={[
            'They need to move — run, jump, pace, or do something physical',
            'They need quiet and low stimulation — a calm space, dim light, no noise',
            'They need to talk it through with someone',
            'They need to be left alone',
            'They need something to squeeze, chew, or fidget with',
            'They need a complete change of activity — something totally different',
            'They need to touch or handle materials while learning — manipulatives, blocks, or textures help',
            'They get deeply absorbed in things they choose and really dislike being interrupted',
            "They don't get overwhelmed often — they regulate pretty easily",
          ]}
          values={child.regulation}
          onChange={v => toggleChildCheck('regulation', v)}
        />
      </QBlock>

      <div>
        <p className="text-sm font-bold text-[#1c1c1c] mb-1">2. When {n} gets frustrated during learning —</p>
        <SubLabel>Part A: What do they naturally do?</SubLabel>
        <p className="text-xs text-[#5c5c5c] mb-1">Pick all that apply</p>
        <CheckList
          options={[
            'Shuts down completely — refuses, cries, or walks away',
            'Gets upset but pushes through if I stay with them',
            'Gets physical — slams things, tenses up, or acts out',
            'Becomes anxious — worried about being wrong, not just frustrated',
            'Quietly gives up without making a fuss',
            'Takes a break on their own and comes back to it',
            'Digs in harder — frustration actually motivates them',
          ]}
          values={child.frustrationChild}
          onChange={v => toggleChildCheck('frustrationChild', v)}
        />
        <SubLabel>Part B: What do you as the parent/guardian try to do?</SubLabel>
        <p className="text-xs text-[#5c5c5c] mb-1">Pick all that apply</p>
        <CheckList
          options={[
            'Stay close and coach them through it',
            'Give them space and let them come back when ready',
            'Redirect to something completely different',
            'Offer movement or a sensory break',
            'Simplify the task or break it into smaller steps',
            'Put it away for the day entirely',
          ]}
          values={child.frustrationParent}
          onChange={v => toggleChildCheck('frustrationParent', v)}
        />
        <SubLabel>Part C: Does what you try actually work?</SubLabel>
        <p className="text-xs text-[#5c5c5c] mb-1">Choose one</p>
        <RadioList
          options={[
            'Yes, pretty consistently',
            'Sometimes — it depends on the day',
            "Rarely — we haven't found what works yet",
            'It varies a lot depending on the situation',
          ]}
          value={child.frustrationWorks}
          onChange={v => setChildField('frustrationWorks', v)}
        />
      </div>

      <div>
        <p className="text-sm font-bold text-[#1c1c1c] mb-1">3. New tasks vs. hard tasks —</p>
        <SubLabel>Part A: When {n} encounters something NEW:</SubLabel>
        <p className="text-xs text-[#5c5c5c] mb-1">Pick all that apply</p>
        <CheckList
          options={[
            'Jumps in immediately — excited and curious',
            'Watches or observes first before trying',
            "Asks a lot of questions before they'll start",
            'Resists or refuses until they feel safe enough',
            'Gets anxious — worries about doing it wrong',
            'Depends entirely on whether it interests them',
          ]}
          values={child.newTasks}
          onChange={v => toggleChildCheck('newTasks', v)}
        />
        <SubLabel>Part B: When {n} encounters something HARD:</SubLabel>
        <p className="text-xs text-[#5c5c5c] mb-1">Pick all that apply</p>
        <CheckList
          options={[
            "Persists if it's something they care about",
            "Avoids it even if it's something they want to achieve",
            'Needs someone alongside them to keep going',
            'Pushes through independently once they start',
            'Gives up quickly regardless of interest',
            'Has big goals but struggles to do the work required to get there',
          ]}
          values={child.hardTasks}
          onChange={v => toggleChildCheck('hardTasks', v)}
        />
      </div>

      <QBlock num={4} label={`When ${n} is being read aloud to — even if they seem distracted:`} note="Pick all that apply">
        <CheckList
          options={[
            "They absorb almost everything, even when they look like they're not listening",
            'They catch it if the topic interests them, but zone out otherwise',
            'They need to be sitting still and focused to take anything in',
            'They retain it better if their hands are busy at the same time',
            'They want to stop and discuss as you go',
            "They drift and can't recall much afterwards",
            'They draw or doodle while listening — it actually helps them focus and retain',
            'Reading aloud together is one of our favorite things — they really come alive',
          ]}
          values={child.readAloud}
          onChange={v => toggleChildCheck('readAloud', v)}
        />
      </QBlock>

      <div>
        <p className="text-sm font-bold text-[#1c1c1c] mb-1">5. How does {n} engage with videos and screens as a learning tool?</p>
        <SubLabel>Part A: Video engagement</SubLabel>
        <p className="text-xs text-[#5c5c5c] mb-1">Pick all that apply</p>
        <CheckList
          options={[
            'They retain information well from videos — it sticks',
            "Videos feel more like entertainment — they enjoy it but don't absorb much",
            'They prefer to speed videos up — slow-paced content loses them',
            'They need to slow videos down or pause frequently to process',
            'They ask questions and want to discuss what they watched',
            'They zone out during videos, even ones they chose',
            "We limit screens significantly — this isn't really an option for us",
          ]}
          values={child.videoEngagement}
          onChange={v => toggleChildCheck('videoEngagement', v)}
        />
        <SubLabel>Part B: How does {n} use screens day-to-day?</SubLabel>
        <p className="text-xs text-[#5c5c5c] mb-1">Pick all that apply</p>
        <CheckList
          options={[
            'They use screens for entertainment — YouTube, shows, games',
            'They use screens for schoolwork',
            'They use screens to watch educational videos',
            'They use screens to play educational games',
            "They gravitate to screens to decompress or regulate — it's a calming tool for them",
            'They use screens creatively — making things, building, coding',
            "They're not particularly drawn to screens — they prefer other activities",
            'Screen time is limited or restricted in our home',
          ]}
          values={child.screenUse}
          onChange={v => toggleChildCheck('screenUse', v)}
        />
      </div>

      <QBlock num={6} label={`Does ${n} learn well through games?`} note="Pick all that apply">
        <CheckList
          options={[
            'Yes — board games or card games',
            'Yes — strategy or puzzle video games (e.g. chess-style, logic puzzles)',
            'Yes — adventure or narrative video games',
            'Yes — creative or building games (e.g. Minecraft, Roblox)',
            'Yes — escape room or mystery-style games',
            'They love memorizing facts, chants, songs, or repetitive patterns — it energizes them',
            "They enjoy games for fun but learning doesn't really stick through games for this child",
            "They don't enjoy board games or card games",
            "They don't enjoy video games",
          ]}
          values={child.games}
          onChange={v => toggleChildCheck('games', v)}
        />
      </QBlock>

      <div>
        <p className="text-sm font-bold text-[#1c1c1c] mb-2">7. Reading &amp; Writing —</p>

        <SubLabel>Part A: Where is {n} with reading?</SubLabel>
        <p className="text-xs text-[#5c5c5c] mb-1">Choose one</p>
        <RadioList
          options={[
            'Not yet reading — working on letters and sounds',
            'Beginning to read — sounding out short words',
            'Reading simple books with some effort',
            'Reading independently at or around grade level',
            'Reading above grade level or voraciously',
          ]}
          value={child.readingLevel}
          onChange={v => setChildField('readingLevel', v)}
        />
        {child.readingLevel && (
          <div className="mt-3 pl-1">
            <p className="text-xs font-bold text-[#55b6ca] italic mb-2">How do you feel about their reading skills?</p>
            <RadioList
              options={['They are good', 'They need to improve']}
              value={child.readingFeel}
              onChange={v => setChildField('readingFeel', v)}
            />
          </div>
        )}

        <SubLabel>Part B: Where is {n} in their writing journey?</SubLabel>
        <p className="text-xs text-[#5c5c5c] mb-1">Choose one</p>
        <RadioList
          options={[
            'Not yet writing — working on pencil grip and pre-writing shapes',
            'Writing individual letters',
            'Writing short words or simple phrases',
            'Writing full sentences',
            'Writing paragraphs',
            'Writing multi-paragraph pieces or short essays',
            'Writing longer pieces, stories, or structured essays',
          ]}
          value={child.writingStage}
          onChange={v => setChildField('writingStage', v)}
        />
        {child.writingStage && (
          <div className="mt-3 pl-1">
            <p className="text-xs font-bold text-[#55b6ca] italic mb-2">How do you feel about their writing skills?</p>
            <RadioList
              options={['They are good', 'They need to improve']}
              value={child.writingFeel}
              onChange={v => setChildField('writingFeel', v)}
            />
          </div>
        )}

        <SubLabel>Part C: How does {n} experience the physical act of writing?</SubLabel>
        <p className="text-xs text-[#5c5c5c] mb-1">Pick all that apply</p>
        <CheckList
          options={[
            "They have a lot to say but their handwriting can't keep up with their ideas — this causes real frustration",
            'They have ideas but freeze when it comes to getting them onto paper',
            'The physical act of writing is slow, painful, or messy despite real effort',
            'They strongly prefer typing over handwriting',
            "Handwriting is fine — it's not a barrier for them",
            "Writing is not yet developmentally expected for this child's age",
          ]}
          values={child.physicalWriting}
          onChange={v => toggleChildCheck('physicalWriting', v)}
        />

        <SubLabel>Part D: What kinds of writing does {n} engage with?</SubLabel>
        <p className="text-xs text-[#5c5c5c] mb-1">Pick all that apply</p>
        <CheckList
          options={[
            'Creative writing — stories, imaginative pieces',
            'Factual or informational writing',
            'Journaling or personal writing',
            'Poetry or rhyming text — they enjoy it or gravitate toward it',
            'They avoid writing in any form',
          ]}
          values={child.writingTypes}
          onChange={v => toggleChildCheck('writingTypes', v)}
        />

        <SubLabel>Part E: Where is {n} with spelling?</SubLabel>
        <p className="text-xs text-[#5c5c5c] mb-1">Choose one</p>
        <RadioList
          options={[
            'Not yet working on spelling formally',
            'Learning basic phonetic spelling — sounding words out',
            'Spelling common words correctly but inconsistent with harder words',
            'Spelling is a significant struggle — words spelled differently every time',
            'Spelling is strong and mostly accurate',
          ]}
          value={child.spellingLevel}
          onChange={v => setChildField('spellingLevel', v)}
        />
        {child.spellingLevel && (
          <div className="mt-3 pl-1">
            <p className="text-xs font-bold text-[#55b6ca] italic mb-2">How do you feel about their spelling skills?</p>
            <RadioList
              options={['They are good', 'They need to improve']}
              value={child.spellingFeel}
              onChange={v => setChildField('spellingFeel', v)}
            />
          </div>
        )}

        <SubLabel>Part F: Where is {n} with grammar?</SubLabel>
        <p className="text-xs text-[#5c5c5c] mb-1">Choose one</p>
        <RadioList
          options={[
            'Not yet working on grammar formally',
            'Beginning to understand basic sentence structure',
            'Working on punctuation and capitalization',
            'Understanding parts of speech (nouns, verbs, adjectives)',
            'Working on more complex grammar — clauses, tenses, agreement',
          ]}
          value={child.grammarLevel}
          onChange={v => setChildField('grammarLevel', v)}
        />
        {child.grammarLevel && (
          <div className="mt-3 pl-1">
            <p className="text-xs font-bold text-[#55b6ca] italic mb-2">How do you feel about their grammar skills?</p>
            <RadioList
              options={['They are good', 'They need to improve']}
              value={child.grammarFeel}
              onChange={v => setChildField('grammarFeel', v)}
            />
          </div>
        )}

        <SubLabel>Part G: Grammar areas of struggle</SubLabel>
        <p className="text-xs text-[#5c5c5c] mb-1">Pick all that apply</p>
        <CheckList
          options={[
            'Punctuation and capitalization',
            'Sentence structure — run-ons or fragments',
            'Parts of speech',
            'Phrases and clauses',
            'Labeling sentence parts',
            "We're not sure yet — haven't gotten there",
            'No significant struggles',
            'Other',
          ]}
          values={child.grammarStruggles}
          onChange={v => toggleChildCheck('grammarStruggles', v)}
        />
        {child.grammarStruggles.includes('Other') && (
          <div className="mt-3">
            <Field label="Please describe:">
              <input type="text" value={child.grammarStrugglesOther} onChange={e => setChildField('grammarStrugglesOther', e.target.value)} placeholder="Describe the grammar struggle..." className={inputCls} />
            </Field>
          </div>
        )}
      </div>

      <QBlock num={8} label={`How does ${n} best demonstrate they've understood something?`} note="Pick all that apply">
        <CheckList
          options={[
            'Explaining it back in their own words — verbally',
            'Drawing, building, or creating something connected to it',
            'Answering questions verbally',
            'Writing it down',
            'Acting it out or turning it into a game',
            'Going off and finding more information on their own',
            'Teaching it to someone else (or a pet!)',
            'Humming, singing, or putting things to a beat or rhythm',
            'Talking out loud to themselves while they work through it',
            'Debating or defending their ideas — they love being challenged to explain their thinking',
          ]}
          values={child.demonstratesUnderstanding}
          onChange={v => toggleChildCheck('demonstratesUnderstanding', v)}
        />
      </QBlock>

      <QBlock num={9} label={`How long can ${n} realistically focus on something they didn't choose?`} note="Choose one">
        <RadioList
          options={[
            '5 minutes or less',
            'Around 10–15 minutes with some redirection',
            "Around 20–30 minutes if I'm engaged with them",
            '30+ minutes — they sustain focus well',
            'Completely depends on the topic — night and day difference',
          ]}
          value={child.focusSpan}
          onChange={v => setChildField('focusSpan', v)}
        />
        <Followup show={showFocusFu}>
          <p className="text-xs font-bold text-[#55b6ca] mb-2">Does {n} have areas of very intense or obsessive interest?</p>
          <RadioList
            options={[
              'Yes — one or two things they are completely fixated on',
              'Somewhat — some topics grab them much more than others',
              'Not really — interests are fairly broad and even',
            ]}
            value={child.intenseInterests}
            onChange={v => setChildField('intenseInterests', v)}
          />
        </Followup>
      </QBlock>

      <div>
        <p className="text-sm font-bold text-[#1c1c1c] mb-1">10. What topics or subjects does {n} love?</p>
        <p className="text-xs text-[#5c5c5c] mb-1">Pick all that apply</p>
        <CheckList
          options={[
            'Science and how things work',
            'Animals and nature',
            'History and stories from the past',
            'Math and numbers and patterns',
            'Art, music, or creative making',
            'Reading and stories',
            'Building and engineering',
            'Space and the universe',
            'People, relationships, and emotions',
            'Sports, movement, and the body',
            'Technology and computers',
            'Other',
          ]}
          values={child.lovesSubjects}
          onChange={v => toggleChildCheck('lovesSubjects', v)}
        />
        {child.lovesSubjects.includes('Other') && (
          <div className="mt-3">
            <Field label="What are they into?">
              <input type="text" value={child.lovesOther} onChange={e => setChildField('lovesOther', e.target.value)} placeholder="e.g. dinosaurs, trains, ancient Egypt..." className={inputCls} />
            </Field>
          </div>
        )}

      </div>

      <QBlock num={11} label={`Does ${n} need curriculum that allows working above or below their age or grade level?`} note="Choose one">
        <RadioList
          options={[
            'Yes — we need the ability to move up or down levels freely',
            'It would be helpful, but is not essential',
            'No — grade-level curriculum works well for us',
          ]}
          value={child.levelFlexibility}
          onChange={v => setChildField('levelFlexibility', v)}
        />
      </QBlock>

      <QBlock num={12} label={`When ${n} reads or is read to, what do they enjoy?`} note="Pick all that apply">
        <CheckList
          options={[
            'Fiction and stories — characters, adventure, and imagination',
            'Nonfiction — real facts about animals, science, history, or how things work',
            'Graphic novels or comics — pictures are as important as the words',
          ]}
          values={child.readingPreference}
          onChange={v => toggleChildCheck('readingPreference', v)}
        />
      </QBlock>

      <QBlock num={13} label={`What kinds of books does ${n} engage with most?`} note="Pick all that apply">
        <CheckList
          options={[
            'Highly illustrated — lots of pictures, and visual layout matters a lot',
            'Some illustrations alongside the text',
            'Mostly text — they do not need many pictures',
          ]}
          values={child.bookFormat}
          onChange={v => toggleChildCheck('bookFormat', v)}
        />
      </QBlock>

      <QBlock num={14} label={`Once a lesson or task has been introduced, how independently can ${n} work?`} note="Choose one">
        <RadioList
          options={[
            'Very independently — they can work through most things on their own',
            'With occasional check-ins — I need to be nearby but not always actively involved',
            'I need to sit with them for most of the session',
            'It varies a lot depending on the subject or their mood',
          ]}
          value={child.independenceLevel}
          onChange={v => setChildField('independenceLevel', v)}
        />
      </QBlock>

      <QBlock num={15} label={`When ${n} is NOT doing school, what do they naturally gravitate toward?`} note="Pick all that apply">
        <CheckList
          options={[
            'Playing outside — running, climbing, exploring',
            'Reading on their own',
            'Drawing, painting, or making art',
            'Building with LEGO, blocks, or construction toys',
            'Playing video games',
            'Watching YouTube or shows',
            'Playing with siblings or friends',
            'Sports or physical activities',
            'Imaginative play — pretending, role-playing, creating worlds',
            'Cooking or baking',
            'Taking things apart or figuring out how things work',
            'Nothing in particular — they seem bored or restless a lot',
            'Other',
          ]}
          values={child.freeTimeActivities}
          onChange={v => toggleChildCheck('freeTimeActivities', v)}
        />
        {child.freeTimeActivities.includes('Other') && (
          <div className="mt-3">
            <Field label="What else do they do?">
              <input type="text" value={child.freeTimeOther} onChange={e => setChildField('freeTimeOther', e.target.value)} placeholder="e.g. music, animals, coding..." className={inputCls} />
            </Field>
          </div>
        )}
      </QBlock>

      <QBlock num={16} label={`What else would you like Mel to know about ${n}?`} note="Pick all that apply">
        <CheckList
          options={[
            'Is currently in speech, OT, or another therapy',
            'Has been formally assessed or diagnosed',
            'Has experienced bullying or school trauma',
            'Is twice-exceptional (gifted + learning difference)',
            'Has significant anxiety around academics',
            'Is coming out of a bad school experience and needs to decompress/deschool',
            'Has a physical disability that affects learning',
            'Other',
          ]}
          values={child.extraInfo}
          onChange={v => toggleChildCheck('extraInfo', v)}
        />
        {child.extraInfo.includes('Has been formally assessed or diagnosed') && (
          <div className="mt-3">
            <Field label="Would you like to share the diagnosis? (optional)">
              <input type="text" value={child.diagnosis} onChange={e => setChildField('diagnosis', e.target.value)} placeholder="e.g. ADHD, dyslexia, autism, SPD..." className={inputCls} />
            </Field>
          </div>
        )}
        {child.extraInfo.includes('Other') && (
          <div className="mt-3">
            <Field label="Please describe:">
              <input type="text" value={child.extraOther} onChange={e => setChildField('extraOther', e.target.value)} placeholder="Anything else Mel should know..." className={inputCls} />
            </Field>
          </div>
        )}
      </QBlock>

      <QBlock num={17} label={`Would you like to see recommendations for ${n} in any of these core subjects?`} note="Pick all that apply — then select specific topics">
        <div className="space-y-2 mt-1">

          {/* Math */}
          <div>
            <label className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border-2 cursor-pointer text-sm font-semibold transition-all ${child.coreSubjects.includes('Math') ? 'bg-[#eaf7fb] border-[#55b6ca] text-[#1c1c1c]' : 'bg-white border-[#ddd8cc] text-[#5c5c5c] hover:border-[#55b6ca]'}`}>
              <input type="checkbox" checked={child.coreSubjects.includes('Math')} onChange={() => toggleChildCheck('coreSubjects', 'Math')} className="mt-0.5 accent-[#ed7c5a] flex-shrink-0 w-4 h-4" />
              <span>Math</span>
            </label>
            {child.coreSubjects.includes('Math') && (
              <div className="mt-2 ml-6 p-4 bg-[#f5f1e9] rounded-xl border-l-4 border-[#55b6ca] space-y-2">
                <p className="text-xs font-bold text-[#55b6ca] mb-1">Which math topic(s)?</p>
                <CheckList
                  options={['Pre-K Math','Kindergarten Math','1st Grade Math','2nd Grade Math','3rd Grade Math','4th Grade Math','5th Grade Math','Middle School Math','Pre-Algebra','Algebra 1','Geometry','Algebra 2','Pre-Calculus','Calculus','Statistics','Personal Finance','Consumer Math','Other']}
                  values={child.mathTopics}
                  onChange={v => toggleChildCheck('mathTopics', v)}
                />
                {child.mathTopics.includes('Other') && (
                  <div className="mt-2">
                    <Field label="Please describe:">
                      <input type="text" value={child.mathTopicsOther} onChange={e => setChildField('mathTopicsOther', e.target.value)} placeholder="Other math topic..." className={inputCls} />
                    </Field>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Science */}
          <div>
            <label className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border-2 cursor-pointer text-sm font-semibold transition-all ${child.coreSubjects.includes('Science') ? 'bg-[#eaf7fb] border-[#55b6ca] text-[#1c1c1c]' : 'bg-white border-[#ddd8cc] text-[#5c5c5c] hover:border-[#55b6ca]'}`}>
              <input type="checkbox" checked={child.coreSubjects.includes('Science')} onChange={() => toggleChildCheck('coreSubjects', 'Science')} className="mt-0.5 accent-[#ed7c5a] flex-shrink-0 w-4 h-4" />
              <span>Science</span>
            </label>
            {child.coreSubjects.includes('Science') && (
              <div className="mt-2 ml-6 p-4 bg-[#f5f1e9] rounded-xl border-l-4 border-[#55b6ca] space-y-2">
                <p className="text-xs font-bold text-[#55b6ca] mb-1">Which science topic(s)?</p>
                <CheckList
                  options={['Life Science','Earth Science','Weather and Atmosphere','Physical Science','Space & Astronomy','Biology','Chemistry','Physics','Environmental Science','Geology','Forensic Science','Marine Biology','Other']}
                  values={child.scienceTopics}
                  onChange={v => toggleChildCheck('scienceTopics', v)}
                />
                {child.scienceTopics.includes('Other') && (
                  <div className="mt-2">
                    <Field label="Please describe:">
                      <input type="text" value={child.scienceTopicsOther} onChange={e => setChildField('scienceTopicsOther', e.target.value)} placeholder="Other science topic..." className={inputCls} />
                    </Field>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* History/Geography/Social Studies */}
          <div>
            <label className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border-2 cursor-pointer text-sm font-semibold transition-all ${child.coreSubjects.includes('History/Geography/Social Studies') ? 'bg-[#eaf7fb] border-[#55b6ca] text-[#1c1c1c]' : 'bg-white border-[#ddd8cc] text-[#5c5c5c] hover:border-[#55b6ca]'}`}>
              <input type="checkbox" checked={child.coreSubjects.includes('History/Geography/Social Studies')} onChange={() => toggleChildCheck('coreSubjects', 'History/Geography/Social Studies')} className="mt-0.5 accent-[#ed7c5a] flex-shrink-0 w-4 h-4" />
              <span>History/Geography/Social Studies</span>
            </label>
            {child.coreSubjects.includes('History/Geography/Social Studies') && (
              <div className="mt-2 ml-6 p-4 bg-[#f5f1e9] rounded-xl border-l-4 border-[#55b6ca] space-y-2">
                <p className="text-xs font-bold text-[#55b6ca] mb-1">Which topic(s)?</p>
                <CheckList
                  options={['US History','World History','Civics & Government','Economics','Current Events','Sociology','Psychology','Philosophy','Community & Citizenship','Map Skills','U.S. Geography','World Geography','Other']}
                  values={child.historyTopics}
                  onChange={v => toggleChildCheck('historyTopics', v)}
                />
                {child.historyTopics.includes('Other') && (
                  <div className="mt-2">
                    <Field label="Please describe:">
                      <input type="text" value={child.historyTopicsOther} onChange={e => setChildField('historyTopicsOther', e.target.value)} placeholder="Other topic..." className={inputCls} />
                    </Field>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* English Language Arts */}
          <div>
            <label className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border-2 cursor-pointer text-sm font-semibold transition-all ${child.coreSubjects.includes('English Language Arts') ? 'bg-[#eaf7fb] border-[#55b6ca] text-[#1c1c1c]' : 'bg-white border-[#ddd8cc] text-[#5c5c5c] hover:border-[#55b6ca]'}`}>
              <input type="checkbox" checked={child.coreSubjects.includes('English Language Arts')} onChange={() => toggleChildCheck('coreSubjects', 'English Language Arts')} className="mt-0.5 accent-[#ed7c5a] flex-shrink-0 w-4 h-4" />
              <span>English Language Arts</span>
            </label>
            {child.coreSubjects.includes('English Language Arts') && (
              <div className="mt-2 ml-6 p-4 bg-[#f5f1e9] rounded-xl border-l-4 border-[#55b6ca] space-y-2">
                <p className="text-xs font-bold text-[#55b6ca] mb-1">Which ELA topic(s)?</p>
                <CheckList
                  options={['Phonics','Reading (early/fluency)','Spelling','Handwriting','Vocabulary','Grammar','Writing (sentences/paragraphs)','Writing (essays)','Writing (creative)','Reading Comprehension','Literature (American, British, World, Classical)','Research Skills','Note Taking','SAT Vocab','Other']}
                  values={child.elaTopics}
                  onChange={v => toggleChildCheck('elaTopics', v)}
                />
                {child.elaTopics.includes('Other') && (
                  <div className="mt-2">
                    <Field label="Please describe:">
                      <input type="text" value={child.elaTopicsOther} onChange={e => setChildField('elaTopicsOther', e.target.value)} placeholder="Other ELA topic..." className={inputCls} />
                    </Field>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Foreign Language */}
          <div>
            <label className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border-2 cursor-pointer text-sm font-semibold transition-all ${child.coreSubjects.includes('Foreign Language') ? 'bg-[#eaf7fb] border-[#55b6ca] text-[#1c1c1c]' : 'bg-white border-[#ddd8cc] text-[#5c5c5c] hover:border-[#55b6ca]'}`}>
              <input type="checkbox" checked={child.coreSubjects.includes('Foreign Language')} onChange={() => toggleChildCheck('coreSubjects', 'Foreign Language')} className="mt-0.5 accent-[#ed7c5a] flex-shrink-0 w-4 h-4" />
              <span>Foreign Language</span>
            </label>
            {child.coreSubjects.includes('Foreign Language') && (
              <div className="mt-2 ml-6 p-4 bg-[#f5f1e9] rounded-xl border-l-4 border-[#55b6ca] space-y-2">
                <p className="text-xs font-bold text-[#55b6ca] mb-1">Which language(s)?</p>
                <CheckList
                  options={['French','Spanish','Italian','German','Mandarin','Japanese','Latin','American Sign Language (ASL)','Other']}
                  values={child.foreignLanguages}
                  onChange={v => toggleChildCheck('foreignLanguages', v)}
                />
                {child.foreignLanguages.includes('Other') && (
                  <div className="mt-2">
                    <Field label="Please describe:">
                      <input type="text" value={child.foreignLanguagesOther} onChange={e => setChildField('foreignLanguagesOther', e.target.value)} placeholder="Other language..." className={inputCls} />
                    </Field>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </QBlock>

      <QBlock num={18} label={`Which of the following skills does ${n} need extra practice in?`} note="Pick all that apply">
        <CheckList
          options={['Gross Motor Skills','Fine Motor Skills','Memory','Critical Thinking','Attention & Focus','Visual-Spatial Awareness','Logic, If/Then','Problem Solving','Processing Speed','Other']}
          values={child.skillsPractice}
          onChange={v => toggleChildCheck('skillsPractice', v)}
        />
        {child.skillsPractice.includes('Other') && (
          <div className="mt-3">
            <Field label="Please describe:">
              <input type="text" value={child.skillsPracticeOther} onChange={e => setChildField('skillsPracticeOther', e.target.value)} placeholder="Other skill..." className={inputCls} />
            </Field>
          </div>
        )}
      </QBlock>
    </>
  )
}
