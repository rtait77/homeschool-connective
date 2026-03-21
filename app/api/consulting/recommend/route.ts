import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const ADMIN_EMAIL = 'support@homeschoolconnective.com'

function buildPrompt(responses: Record<string, unknown>, resources: Resource[]): string {
  type Child = Record<string, unknown>
  const children: Child[] = Array.isArray(responses.children) ? responses.children as Child[] : []
  const arr = (v: unknown): string => Array.isArray(v) ? (v as string[]).filter(Boolean).join(', ') || '—' : '—'
  const s = (v: unknown): string => (typeof v === 'string' && v) ? v : '—'

  const parentSection = `
PARENT PROFILE
--------------
Name: ${s(responses.parentName)}
State: ${s(responses.parentState)}
Why homeschooling: ${arr(responses.whyHomeschooling)}${s(responses.whyOther) !== '—' ? ` (${responses.whyOther})` : ''}
Experience: ${s(responses.experienceLength)}
Current experience: ${s(responses.currentExperience)}
Primary goal: ${s(responses.primaryGoal)}
Biggest challenges: ${arr(responses.biggestChallenges)}${s(responses.biggestChallengesOther) !== '—' ? ` (${responses.biggestChallengesOther})` : ''}
Curriculum history: ${arr(responses.curriculumExperience)}${s(responses.curriculumHappened) !== '—' ? ` — ${responses.curriculumHappened}` : ''}${s(responses.curriculumTried) !== '—' ? ` — Previously tried: ${responses.curriculumTried}` : ''}
Days/week: ${s(responses.daysPerWeek)}
Hours/day: ${s(responses.hoursPerDay)}
Other demands: ${arr(responses.otherDemands)}
Ideal day: ${arr(responses.idealDay)}
Teaching style: ${arr(responses.teachingStyle)}
Screen attitude: ${arr(responses.screenAttitude)}
Progress measurement: ${arr(responses.progressMeasurement)}
Prep willingness: ${s(responses.prepWillingness)}
Learning environment: ${arr(responses.learningEnvironment)}
Co-op participation: ${arr(responses.coopParticipation)}
Parent personality: ${arr(responses.parentPersonality)}
Religious preference: ${s(responses.religiousPreference)}
Success vision (6 months): ${s(responses.successVision)}
Additional parent notes: ${s(responses.parentNotes)}
`

  const childrenSection = children.map((c, i) => `
CHILD ${i + 1}: ${s(c.name) !== '—' ? s(c.name) : `Child ${i + 1}`}, Age ${s(c.age)}
${'-'.repeat(40)}
Reading: ${s(c.readingLevel)} — feels like: ${s(c.readingFeel)}
Writing: ${s(c.writingStage)} — feels like: ${s(c.writingFeel)}
Physical writing: ${arr(c.physicalWriting)}
Spelling: ${s(c.spellingLevel)} — feels like: ${s(c.spellingFeel)}
Grammar: ${s(c.grammarLevel)} — feels like: ${s(c.grammarFeel)}
Grammar struggles: ${arr(c.grammarStruggles)}
Focus span: ${s(c.focusSpan)}
Regulation needs: ${arr(c.regulation)}
Frustration (child): ${arr(c.frustrationChild)}
Frustration (parent response): ${arr(c.frustrationParent)}
New tasks: ${arr(c.newTasks)}
Hard tasks: ${arr(c.hardTasks)}
Demonstrates learning by: ${arr(c.demonstratesUnderstanding)}
Loves: ${arr(c.lovesSubjects)}${s(c.lovesOther) !== '—' ? ` + ${c.lovesOther}` : ''}
Avoids: ${arr(c.avoidsSubjects)}
Games: ${arr(c.games)}
Video/screen engagement: ${arr(c.videoEngagement)}
Screen use: ${arr(c.screenUse)}
Extra info / diagnosis: ${arr(c.extraInfo)}${s(c.diagnosis) !== '—' ? ` — Diagnosis: ${c.diagnosis}` : ''}${s(c.extraOther) !== '—' ? ` — ${c.extraOther}` : ''}
`).join('\n')

  const resourceList = resources.map(r =>
    `- ID: ${r.id} | Name: "${r.name}" | Subjects: ${r.subjects?.join(', ')} | Grades: ${r.grade_levels?.join(', ')} | Price: ${r.price_range} | Screen: ${r.requires_screen} | Prep: ${r.parent_prep} | Time: ${r.time_per_lesson} | Religious: ${r.religious_pref} | Tags: ${r.match_tags?.join(', ')}`
  ).join('\n')

  return `You are a homeschool curriculum consultant. A family has submitted an intake form. Based on their profile, recommend the best-fit resources from the database below.

${parentSection}
${childrenSection}

AVAILABLE RESOURCES DATABASE
${resourceList}

RELIGIOUS PREFERENCE RULES:
- secular → recommend secular + neutral resources only. christian_lite resources MAY be included but MUST be flagged with christian_lite_warning: true
- christian/faith-based → recommend christian + christian_lite + neutral (all ok)
- either/no preference → recommend anything

INSTRUCTIONS:
- Return 5–10 recommendations ordered from best fit to least fit
- For each recommendation, use the exact resource name and ID from the database
- Write a short, warm, specific "reason" (2–3 sentences) explaining why this fits THIS specific family — reference their actual answers
- Set priority to "primary" for core curriculum picks, "supplement" for supporting resources, "optional" for enrichment
- If a resource is christian_lite and the parent chose secular, set christian_lite_warning: true
- Do NOT recommend resources that conflict hard with stated preferences (e.g. screen-heavy resources for a no-screen family)
- If the family mentions curriculum they already tried and it didn't work, exclude it

Respond with ONLY valid JSON in this exact format:
{
  "recommendations": [
    {
      "resource_id": "uuid from database",
      "name": "resource name",
      "subjects": ["subject"],
      "grade_fit": "grade range relevant to this child",
      "priority": "primary|supplement|optional",
      "reason": "Warm, specific explanation referencing this family's answers.",
      "christian_lite_warning": false
    }
  ]
}`
}

type Resource = {
  id: string
  name: string
  subjects: string[]
  grade_levels: string[]
  price_range: string
  requires_screen: string
  parent_prep: string
  time_per_lesson: string
  religious_pref: string
  match_tags: string[]
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await authClient.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { customer_id } = await req.json()
  if (!customer_id) return NextResponse.json({ error: 'customer_id required' }, { status: 400 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s+/g, '')
  )

  // Load intake responses
  const { data: intake } = await admin
    .from('consulting_intake_responses')
    .select('responses')
    .eq('customer_id', customer_id)
    .single()

  if (!intake?.responses) {
    return NextResponse.json({ error: 'No intake responses found for this customer' }, { status: 404 })
  }

  // Load all resources
  const { data: resources } = await admin
    .from('resources')
    .select('id, name, subjects, grade_levels, price_range, requires_screen, parent_prep, time_per_lesson, religious_pref, match_tags')

  if (!resources || resources.length === 0) {
    return NextResponse.json({ error: 'No resources in database' }, { status: 500 })
  }

  const prompt = buildPrompt(intake.responses as Record<string, unknown>, resources as Resource[])

  // Call Claude API
  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!anthropicRes.ok) {
    const err = await anthropicRes.text()
    console.error('Anthropic API error:', err)
    return NextResponse.json({ error: 'AI recommendation failed' }, { status: 500 })
  }

  const aiData = await anthropicRes.json()
  const text = aiData.content?.[0]?.text ?? ''

  let recommendations
  try {
    const parsed = JSON.parse(text)
    recommendations = parsed.recommendations
  } catch {
    console.error('Failed to parse AI response:', text)
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }

  return NextResponse.json({ recommendations })
}
