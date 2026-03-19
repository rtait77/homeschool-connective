import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import nodemailer from 'nodemailer'

const titanTransport = nodemailer.createTransport({
  host: 'smtp.titan.email',
  port: 587,
  secure: false,
  auth: {
    user: 'consulting@homeschoolconnective.com',
    pass: process.env.TITAN_SMTP_PASSWORD,
  },
})

function formatSummaryEmail(email: string, r: Record<string, unknown>) {
  const learningStyles = Array.isArray(r.learningStyles) ? (r.learningStyles as string[]).join(', ') : '—'

  return `
    <div style="font-family: sans-serif; max-width: 640px; margin: 0 auto; padding: 32px; color: #1c1c1c;">
      <img src="https://homeschoolconnective.com/Logo.png" alt="Homeschool Connective" style="height: 44px; margin-bottom: 24px;" />
      <h2 style="color: #ed7c5a;">New Intake Form Submission</h2>
      <p style="color: #5c5c5c; font-size: 14px;"><strong>Customer:</strong> ${email} &nbsp;|&nbsp; <strong>Submitted:</strong> ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

      <hr style="border: none; border-top: 1px solid #e2ddd5; margin: 20px 0;" />

      <h3 style="font-size: 16px; margin-bottom: 8px;">Family</h3>
      <p style="margin: 4px 0;"><strong>Parent:</strong> ${r.parentName || '—'}</p>
      <p style="margin: 4px 0;"><strong>Child:</strong> ${r.childName || '—'}, Age ${r.childAge || '—'}, ${r.childGrade || '—'}</p>

      <hr style="border: none; border-top: 1px solid #e2ddd5; margin: 20px 0;" />

      <h3 style="font-size: 16px; margin-bottom: 8px;">Reading</h3>
      <p style="margin: 4px 0;"><strong>Level:</strong> ${formatOption(r.readingLevel as string, READING_LEVELS)}</p>
      <p style="margin: 4px 0;"><strong>Parent's thoughts:</strong> ${r.readingFeel || '—'}</p>

      <hr style="border: none; border-top: 1px solid #e2ddd5; margin: 20px 0;" />

      <h3 style="font-size: 16px; margin-bottom: 8px;">Writing</h3>
      <p style="margin: 4px 0;"><strong>Level:</strong> ${formatOption(r.writingLevel as string, WRITING_LEVELS)}</p>
      <p style="margin: 4px 0;"><strong>Parent's thoughts:</strong> ${r.writingFeel || '—'}</p>

      <hr style="border: none; border-top: 1px solid #e2ddd5; margin: 20px 0;" />

      <h3 style="font-size: 16px; margin-bottom: 8px;">Spelling & Grammar</h3>
      <p style="margin: 4px 0;"><strong>Spelling:</strong> ${formatOption(r.spellingFeel as string, FEEL_OPTIONS)}</p>
      <p style="margin: 4px 0;"><strong>Grammar:</strong> ${formatOption(r.grammarFeel as string, FEEL_OPTIONS)}</p>
      <p style="margin: 4px 0;"><strong>Notes:</strong> ${r.spellingNotes || '—'}</p>

      <hr style="border: none; border-top: 1px solid #e2ddd5; margin: 20px 0;" />

      <h3 style="font-size: 16px; margin-bottom: 8px;">Learning Profile</h3>
      <p style="margin: 4px 0;"><strong>Learning styles:</strong> ${learningStyles || '—'}</p>
      <p style="margin: 4px 0;"><strong>Biggest challenges:</strong> ${r.biggestChallenges || '—'}</p>
      <p style="margin: 4px 0;"><strong>Screen time:</strong> ${formatOption(r.screenTime as string, SCREEN_TIME_OPTIONS)}</p>
      <p style="margin: 4px 0;"><strong>Attention span:</strong> ${formatOption(r.attentionSpan as string, ATTENTION_OPTIONS)}</p>
      <p style="margin: 4px 0;"><strong>Loves:</strong> ${r.lovesSubjects || '—'}</p>
      <p style="margin: 4px 0;"><strong>Avoids:</strong> ${r.avoidsSubjects || '—'}</p>

      <hr style="border: none; border-top: 1px solid #e2ddd5; margin: 20px 0;" />

      <h3 style="font-size: 16px; margin-bottom: 8px;">Background & Goals</h3>
      <p style="margin: 4px 0;"><strong>Current curriculum:</strong> ${r.currentCurriculum || '—'}</p>
      <p style="margin: 4px 0;"><strong>How long homeschooling:</strong> ${formatOption(r.homeschoolingDuration as string, DURATION_OPTIONS)}</p>
      <p style="margin: 4px 0;"><strong>#1 goal:</strong> ${r.primaryGoal || '—'}</p>
      <p style="margin: 4px 0;"><strong>Additional notes:</strong> ${r.additionalNotes || '—'}</p>
    </div>
  `
}

function formatOption(value: string, options: { value: string; label: string }[]) {
  return options.find(o => o.value === value)?.label ?? value ?? '—'
}

const READING_LEVELS = [
  { value: 'not-yet-reading', label: 'Not yet reading' },
  { value: 'beginning-reader', label: 'Beginning reader' },
  { value: 'grade-level', label: 'At grade level' },
  { value: 'above-grade-level', label: 'Above grade level' },
]
const WRITING_LEVELS = [
  { value: 'not-yet-writing', label: 'Not yet writing' },
  { value: 'forming-letters', label: 'Forming letters' },
  { value: 'sentences', label: 'Writing sentences' },
  { value: 'paragraphs', label: 'Writing paragraphs' },
  { value: 'above-grade-level', label: 'Above grade level' },
]
const FEEL_OPTIONS = [
  { value: 'needs-work', label: 'Needs a lot of work' },
  { value: 'on-track', label: 'On track' },
  { value: 'ahead', label: 'Ahead of where I expected' },
]
const SCREEN_TIME_OPTIONS = [
  { value: 'under-1hr', label: 'Less than 1 hour' },
  { value: '1-2hrs', label: '1–2 hours' },
  { value: '2-3hrs', label: '2–3 hours' },
  { value: 'over-3hrs', label: 'More than 3 hours' },
]
const ATTENTION_OPTIONS = [
  { value: 'a-few-minutes', label: 'A few minutes' },
  { value: '10-15min', label: '10–15 minutes' },
  { value: '20-30min', label: '20–30 minutes' },
  { value: '30-plus', label: '30+ minutes' },
]
const DURATION_OPTIONS = [
  { value: 'just-starting', label: 'Just starting out' },
  { value: 'less-than-1yr', label: 'Less than 1 year' },
  { value: '1-2yrs', label: '1–2 years' },
  { value: '3-5yrs', label: '3–5 years' },
  { value: '5plus-yrs', label: '5+ years' },
]

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { responses } = await req.json()

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s+/g, '')
  )

  const { data: customer } = await admin
    .from('consulting_customers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!customer) return NextResponse.json({ error: 'No consulting record found' }, { status: 404 })

  const now = new Date().toISOString()

  // Upsert and mark as submitted
  const { data: existing } = await admin
    .from('consulting_intake_responses')
    .select('id, status')
    .eq('user_id', user.id)
    .single()

  if (existing?.status === 'submitted') {
    return NextResponse.json({ error: 'Already submitted' }, { status: 400 })
  }

  if (existing) {
    await admin
      .from('consulting_intake_responses')
      .update({ responses, status: 'submitted', submitted_at: now, last_saved_at: now })
      .eq('id', existing.id)
  } else {
    await admin
      .from('consulting_intake_responses')
      .insert({ customer_id: customer.id, user_id: user.id, responses, status: 'submitted', submitted_at: now, last_saved_at: now })
  }

  // Mark customer as completed
  await admin
    .from('consulting_customers')
    .update({ intake_completed: true, intake_submitted_at: now })
    .eq('id', customer.id)

  // Email Mel with formatted summary (via Titan SMTP)
  await titanTransport.sendMail({
    from: '"Homeschool Connective" <consulting@homeschoolconnective.com>',
    to: 'consulting@homeschoolconnective.com',
    subject: `Intake form submitted — ${responses.childName || user.email}`,
    html: formatSummaryEmail(user.email ?? '', responses),
  })

  return NextResponse.json({ ok: true })
}
