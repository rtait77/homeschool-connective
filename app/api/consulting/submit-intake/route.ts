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
  type Child = Record<string, unknown>
  const children: Child[] = Array.isArray(r.children) ? r.children as Child[] : []
  const arrStr = (v: unknown): string => Array.isArray(v) ? (v as string[]).filter(Boolean).join(', ') || '—' : '—'
  const s = (v: unknown): string => (typeof v === 'string' && v) ? v : '—'

  const row = (label: string, val: string) => val && val !== '—' ? `<p style="margin:3px 0"><strong>${label}:</strong> ${val}</p>` : ''

  const childHtml = children.map((c, i) => `
    <h3 style="font-size:15px;margin:16px 0 8px;color:#238FA4">${s(c.name) !== '—' ? s(c.name) : `Child ${i + 1}`} — Age ${s(c.age)}</h3>
    ${row('Reading', `${s(c.readingLevel)} — feels ${s(c.readingFeel)}`)}
    ${row('Writing', `${s(c.writingStage)} — feels ${s(c.writingFeel)}`)}
    ${row('Physical writing', arrStr(c.physicalWriting))}
    ${row('Spelling', `${s(c.spellingLevel)} — feels ${s(c.spellingFeel)}`)}
    ${row('Grammar', `${s(c.grammarLevel)} — feels ${s(c.grammarFeel)}`)}
    ${row('Grammar struggles', arrStr(c.grammarStruggles))}
    ${row('Focus span', s(c.focusSpan))}
    ${row('Regulation', arrStr(c.regulation))}
    ${row('Frustration (child)', arrStr(c.frustrationChild))}
    ${row('Frustration (parent)', arrStr(c.frustrationParent))}
    ${row('Frustration works?', s(c.frustrationWorks))}
    ${row('New tasks', arrStr(c.newTasks))}
    ${row('Hard tasks', arrStr(c.hardTasks))}
    ${row('Demonstrates learning', arrStr(c.demonstratesUnderstanding))}
    ${row('Loves', `${arrStr(c.lovesSubjects)}${s(c.lovesOther) !== '—' ? ` + ${c.lovesOther}` : ''}`)}
    ${row('Avoids', arrStr(c.avoidsSubjects))}
    ${row('Games', arrStr(c.games))}
    ${row('Video/screens', arrStr(c.videoEngagement))}
    ${row('Extra info', `${arrStr(c.extraInfo)}${s(c.diagnosis) !== '—' ? ` — Diagnosis: ${c.diagnosis}` : ''}${s(c.extraOther) !== '—' ? ` — ${c.extraOther}` : ''}`)}
  `).join('<hr style="border:none;border-top:1px solid #e2ddd5;margin:12px 0" />')

  const hr = '<hr style="border:none;border-top:1px solid #e2ddd5;margin:20px 0" />'

  return `
    <div style="font-family:sans-serif;max-width:700px;margin:0 auto;padding:32px;color:#1c1c1c">
      <h2 style="color:#ed7c5a;margin-bottom:4px">New Intake Form Submission</h2>
      <p style="color:#5c5c5c;font-size:14px"><strong>Customer:</strong> ${email} &nbsp;|&nbsp; <strong>Submitted:</strong> ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      ${hr}
      <h3 style="font-size:16px;margin-bottom:8px">Family</h3>
      ${row('Parent', s(r.parentName))}
      ${row('State', s(r.parentState))}
      ${row('Children', children.map((c, i) => `${s(c.name) !== '—' ? s(c.name) : `Child ${i+1}`} (age ${s(c.age)})`).join(', ') || '—')}
      ${hr}
      <h3 style="font-size:16px;margin-bottom:8px">About the Parent</h3>
      ${row('Why homeschooling', `${arrStr(r.whyHomeschooling)}${s(r.whyOther) !== '—' ? ` — ${r.whyOther}` : ''}`)}
      ${row('Experience', s(r.experienceLength))}
      ${row('Current experience', s(r.currentExperience))}
      ${row('#1 goal', s(r.primaryGoal))}
      ${row('Starting feelings', arrStr(r.startingFeelings))}
      ${row('Biggest challenges', `${arrStr(r.biggestChallenges)}${s(r.biggestChallengesOther) !== '—' ? ` — ${r.biggestChallengesOther}` : ''}`)}
      ${row('Curriculum experience', `${arrStr(r.curriculumExperience)}${s(r.curriculumHappened) !== '—' ? ` | ${r.curriculumHappened}` : ''}${s(r.curriculumTried) !== '—' ? ` | Tried: ${r.curriculumTried}` : ''}`)}
      ${hr}
      <h3 style="font-size:16px;margin-bottom:8px">Schedule &amp; Approach</h3>
      ${row('Days/week', s(r.daysPerWeek))}
      ${row('Hours/day', s(r.hoursPerDay))}
      ${row('Other demands', arrStr(r.otherDemands))}
      ${row('Ideal day', arrStr(r.idealDay))}
      ${row('Teaching style', arrStr(r.teachingStyle))}
      ${row('Screens', arrStr(r.screenAttitude))}
      ${row('Progress measurement', arrStr(r.progressMeasurement))}
      ${row('Prep willingness', s(r.prepWillingness))}
      ${row('Environment', arrStr(r.learningEnvironment))}
      ${row('Co-op', arrStr(r.coopParticipation))}
      ${row('Personality', arrStr(r.parentPersonality))}
      ${hr}
      <h3 style="font-size:16px;margin-bottom:8px">Vision &amp; Context</h3>
      ${row('Success in 6 months', s(r.successVision))}
      ${row('How they heard', s(r.howHeard))}
      ${row('Parent notes', s(r.parentNotes))}
      ${hr}
      <h3 style="font-size:16px;margin-bottom:12px">Per Child</h3>
      ${childHtml || '<p>No child data submitted.</p>'}
    </div>
  `
}

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

  const isResubmit = existing?.status === 'submitted'

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

  const firstChildName = Array.isArray(responses.children) && responses.children[0]?.name
    ? responses.children[0].name
    : (responses.parentName || user.email)
  const parentName = typeof responses.parentName === 'string' && responses.parentName
    ? responses.parentName.split(' ')[0]
    : 'there'

  // Email Mel with formatted summary
  try {
    await titanTransport.sendMail({
      from: '"Homeschool Connective" <consulting@homeschoolconnective.com>',
      to: 'consulting@homeschoolconnective.com',
      subject: `${isResubmit ? '[Updated] ' : ''}Intake form submitted — ${firstChildName}`,
      html: formatSummaryEmail(user.email ?? '', responses),
    })
  } catch (emailErr) {
    console.error('Failed to send intake notification email:', emailErr)
  }

  // Confirmation email to client
  const clientSubject = isResubmit
    ? 'Your intake form has been updated'
    : 'We received your intake form!'
  const clientHtml = isResubmit
    ? `
      <div style="font-family:'Helvetica Neue',Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;background:#f5f1e9;">
        <div style="text-align:center;margin-bottom:28px;">
          <img src="https://homeschoolconnective.com/Logo.png" alt="Homeschool Connective" style="height:48px;" />
        </div>
        <div style="background:#fff;border-radius:16px;padding:32px;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
          <h2 style="font-size:22px;font-weight:800;color:#1c1c1c;margin-bottom:12px;">Got your update, ${parentName}!</h2>
          <p style="font-size:15px;line-height:1.7;color:#444;margin-bottom:16px;">We've received your updated intake form. Mel will take another look at your answers and be in touch!</p>
          <p style="font-size:15px;line-height:1.7;color:#444;margin-bottom:24px;">In the meantime, if you have questions or anything you'd like to add, just reply to this email.</p>
          <p style="font-size:14px;color:#888;">— Mel &amp; the Homeschool Connective team</p>
          <p style="font-size:13px;color:#aaa;">consulting@homeschoolconnective.com</p>
        </div>
        <p style="text-align:center;font-size:12px;color:#aaa;margin-top:24px;">Homeschool Connective · <a href="https://homeschoolconnective.com" style="color:#aaa;">homeschoolconnective.com</a></p>
      </div>`
    : `
      <div style="font-family:'Helvetica Neue',Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;background:#f5f1e9;">
        <div style="text-align:center;margin-bottom:28px;">
          <img src="https://homeschoolconnective.com/Logo.png" alt="Homeschool Connective" style="height:48px;" />
        </div>
        <div style="background:#fff;border-radius:16px;padding:32px;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
          <h2 style="font-size:22px;font-weight:800;color:#1c1c1c;margin-bottom:12px;">We got it, ${parentName}!</h2>
          <p style="font-size:15px;line-height:1.7;color:#444;margin-bottom:16px;">Thanks so much for filling out your intake form! Mel will review your answers and put together your personalized curriculum recommendations.</p>
          <p style="font-size:15px;line-height:1.7;color:#444;margin-bottom:24px;">You'll receive an email when your report is ready. In the meantime, if you have questions or anything you'd like to add, just reply to this email.</p>
          <p style="font-size:14px;color:#888;">— Mel &amp; the Homeschool Connective team</p>
          <p style="font-size:13px;color:#aaa;">consulting@homeschoolconnective.com</p>
        </div>
        <p style="text-align:center;font-size:12px;color:#aaa;margin-top:24px;">Homeschool Connective · <a href="https://homeschoolconnective.com" style="color:#aaa;">homeschoolconnective.com</a></p>
      </div>`

  try {
    await titanTransport.sendMail({
      from: '"Mel at Homeschool Connective" <consulting@homeschoolconnective.com>',
      to: user.email!,
      subject: clientSubject,
      html: clientHtml,
    })
  } catch (emailErr) {
    console.error('Failed to send client confirmation email:', emailErr)
  }

  return NextResponse.json({ ok: true })
}
