import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type QuizAnswers = {
  age: string
  toughDay: string[]
  engagement: string[]
  timeAvailable: string
  involvement: string
  screens: string
  resourceTypes: string[]
  religiousPref: string
  childNeeds: string
  subjects: string[]
}

type Resource = {
  id: string
  name: string
  description: string
  url: string
  resource_type: string
  match_tags: string[]
  grade_levels: string[]
  requires_screen: string
  religious_pref: string
  subjects: string[]
}

const TAG_LABELS: Record<string, string> = {
  game_based: 'game-based learning',
  hands_on: 'hands-on activities',
  kinesthetic: 'movement-friendly',
  short_lessons: 'short lessons',
  independent_learner: 'independent learning',
  open_and_go: 'minimal prep',
  video_based: 'video-based',
  visual_learner: 'visual learning',
  engaging: 'engaging format',
  structured: 'structured approach',
  self_paced: 'self-paced',
  low_prep: 'low prep',
  creative: 'creative',
  movement_friendly: 'movement-friendly',
  focus: 'focus support',
  gentle_approach: 'gentle approach',
  book: 'book-based',
  read_aloud: 'read-aloud friendly',
  curriculum: 'full curriculum',
  math: 'math',
  reading: 'reading',
  science: 'science',
  writing: 'writing',
  history: 'history',
  foreign_language: 'foreign language',
}

function ageToGrades(age: string): string[] {
  switch (age) {
    case '3-5': return ['preschool', 'early_elementary']
    case '6-8': return ['early_elementary', 'elementary']
    case '9-11': return ['elementary', 'middle']
    case '12-14': return ['middle', 'high_school']
    case '15-18': return ['high_school']
    default: return []
  }
}

function ageToLabel(age: string): string {
  switch (age) {
    case '3-5': return '3–5-year-old'
    case '6-8': return '6–8-year-old'
    case '9-11': return '9–11-year-old'
    case '12-14': return '12–14-year-old'
    case '15-18': return '15–18-year-old'
    default: return 'child'
  }
}

// Map quiz resource type choices to DB resource_type values
const RESOURCE_TYPE_MAP: Record<string, string[]> = {
  books: ['book', 'workbook'],
  games: ['board_game', 'toy'],
  curriculum: ['curriculum', 'unit_study'],
  apps: ['app', 'online_game'],
  videos: ['online_lessons', 'online_classes', 'video', 'online_school'],
  hands_on: ['subscription_box', 'toy'],
}

function buildTags(answers: QuizAnswers): { tags: Set<string>; screenMode: string; religiousPref: string; preferredTypes: Set<string> } {
  const tags = new Set<string>()

  // Q2: Tough day
  for (const ans of answers.toughDay) {
    if (ans === 'meltdowns') { tags.add('gentle_approach'); tags.add('gentle_pacing'); tags.add('encouraging_format'); tags.add('mastery_based') }
    if (ans === 'bored') { tags.add('engaging'); tags.add('game_based'); tags.add('interest_led') }
    if (ans === 'cant_sit') { tags.add('kinesthetic'); tags.add('movement_friendly'); tags.add('hands_on'); tags.add('short_lessons') }
    if (ans === 'takes_long') { tags.add('short_lessons'); tags.add('self_paced'); tags.add('step_by_step') }
    if (ans === 'fights_writing') { tags.add('reluctant_writer'); tags.add('hands_on'); tags.add('gentle_pacing') }
    if (ans === 'wont_work_alone') { tags.add('teacher_led'); tags.add('read_aloud'); tags.add('discussion_based') }
    if (ans === 'pretty_good') { tags.add('structured'); tags.add('engaging') }
  }

  // Q3: Engagement style
  for (const ans of answers.engagement) {
    if (ans === 'talks') { tags.add('discussion_based'); tags.add('read_aloud') }
    if (ans === 'draws_builds') { tags.add('hands_on'); tags.add('kinesthetic'); tags.add('creative'); tags.add('visual_learner') }
    if (ans === 'reads') { tags.add('book'); tags.add('independent_learner'); tags.add('read_aloud') }
    if (ans === 'watches') { tags.add('video_friendly'); tags.add('visual_learner') }
    if (ans === 'experiments') { tags.add('hands_on'); tags.add('kinesthetic'); tags.add('STEM') }
    if (ans === 'teaches') { tags.add('discussion_based'); tags.add('mastery_based') }
  }

  // Q4: Time available
  if (answers.timeAvailable === 'less_than_1') { tags.add('short_lessons'); tags.add('open_and_go'); tags.add('minimal_time') }
  if (answers.timeAvailable === '1_2') { tags.add('short_lessons'); tags.add('open_and_go') }
  if (answers.timeAvailable === '2_3') { tags.add('structured') }
  if (answers.timeAvailable === '3_plus') { tags.add('structured'); tags.add('full_week_ok') }

  // Q5: Parent involvement
  if (answers.involvement === 'teach_myself') { tags.add('teacher_led'); tags.add('discussion_based') }
  if (answers.involvement === 'guide_done_for_me') { tags.add('open_and_go'); tags.add('low_prep'); tags.add('step_by_step') }
  if (answers.involvement === 'independent') { tags.add('independent_learner'); tags.add('self_paced') }
  if (answers.involvement === 'someone_else') { tags.add('video_friendly'); tags.add('online_classes') }

  // Q6: Screens
  let screenMode = 'any'
  if (answers.screens === 'love') { tags.add('video_friendly'); tags.add('requires_screen') }
  if (answers.screens === 'mix') { screenMode = 'screen_optional' }
  if (answers.screens === 'minimal') { screenMode = 'no_screen'; tags.add('no_screen'); tags.add('hands_on'); tags.add('book') }

  // Q7: Resource types → build preferred types set
  const preferredTypes = new Set<string>()
  for (const rt of (answers.resourceTypes || [])) {
    const mapped = RESOURCE_TYPE_MAP[rt]
    if (mapped) mapped.forEach(t => preferredTypes.add(t))
  }

  // Q8: Religious preference
  const religiousPref = answers.religiousPref || 'either'

  // Q9: What child needs most
  if (answers.childNeeds === 'catch_up') { tags.add('step_by_step'); tags.add('mastery_based'); tags.add('structured') }
  if (answers.childNeeds === 'on_track') { tags.add('structured'); tags.add('comprehensive') }
  if (answers.childNeeds === 'challenge') { tags.add('gifted'); tags.add('rigorous'); tags.add('enrichment') }
  if (answers.childNeeds === 'engage') { tags.add('game_based'); tags.add('engaging'); tags.add('interest_led'); tags.add('hands_on') }
  if (answers.childNeeds === 'explore') { tags.add('interest_led'); tags.add('child_led'); tags.add('creative'); tags.add('project_based') }

  // Q10: Subjects
  for (const subj of answers.subjects) {
    if (subj === 'math') tags.add('math')
    if (subj === 'reading') { tags.add('reading'); tags.add('language_arts'); tags.add('phonics') }
    if (subj === 'science') tags.add('science')
    if (subj === 'history') { tags.add('history'); tags.add('social_studies') }
    if (subj === 'writing') { tags.add('writing'); tags.add('grammar') }
    if (subj === 'geography') { tags.add('geography'); tags.add('map_skills') }
    if (subj === 'foreign_language') tags.add('foreign_language')
  }

  return { tags, screenMode, religiousPref, preferredTypes }
}

function generateProfile(answers: QuizAnswers): string {
  const ageLabel = ageToLabel(answers.age)
  const parts: string[] = []

  // Learning modality
  const modalities: string[] = []
  if (answers.engagement.includes('draws_builds') || answers.engagement.includes('experiments'))
    modalities.push('hands-on')
  if (answers.engagement.includes('watches'))
    modalities.push('visual')
  if (answers.engagement.includes('reads'))
    modalities.push('reading-based')
  if (answers.engagement.includes('talks') || answers.engagement.includes('teaches'))
    modalities.push('discussion-driven')

  const modalityStr = modalities.length > 0
    ? modalities.slice(0, 2).join(' and ')
    : 'multi-modal'

  // Lesson length
  const shortBurst = answers.timeAvailable === 'less_than_1' || answers.timeAvailable === '1_2' ||
    answers.toughDay.includes('cant_sit') || answers.toughDay.includes('takes_long')

  parts.push(`Your ${ageLabel} thrives with ${modalityStr}${shortBurst ? ', short-burst' : ''} learning`)

  // Screen preference
  if (answers.screens === 'minimal') parts[0] += ' and needs minimal screen time'
  else if (answers.screens === 'mix') parts[0] += ' with a balanced mix of screen and offline time'
  parts[0] += '.'

  // Parent involvement (parent's preference, not child's)
  if (answers.involvement === 'teach_myself') {
    parts.push('You prefer to be hands-on with teaching, so resources that support direct instruction and discussion will fit your style.')
  } else if (answers.involvement === 'guide_done_for_me') {
    parts.push('You want something mostly done-for-you, so open-and-go resources that need minimal prep are the way to go.')
  } else if (answers.involvement === 'independent') {
    parts.push('You need your child to work independently, so self-paced resources they can do on their own are key.')
  } else if (answers.involvement === 'someone_else') {
    parts.push('You\'d rather have someone else do the teaching, so video lessons and online classes are a great fit for your family.')
  }

  // Pain point acknowledgment
  const painPoints: string[] = []
  if (answers.toughDay.includes('meltdowns')) painPoints.push('building confidence with gentler, mastery-based approaches')
  if (answers.toughDay.includes('bored')) painPoints.push('tapping into their natural curiosity with engaging, interest-led resources')
  if (answers.toughDay.includes('cant_sit')) painPoints.push('incorporating movement and hands-on activities')
  if (answers.toughDay.includes('fights_writing')) painPoints.push('finding creative, low-pressure approaches to writing')
  if (answers.toughDay.includes('wont_work_alone')) painPoints.push('building toward more independence with scaffolded support')

  if (painPoints.length > 0) {
    parts.push(`They\'d especially benefit from ${painPoints.slice(0, 2).join(' and ')}.`)
  }

  // Child needs
  if (answers.childNeeds === 'catch_up') parts.push('Right now, the priority is closing gaps — structured, step-by-step resources will help them build confidence.')
  if (answers.childNeeds === 'challenge') parts.push('They\'re ready to be challenged — look for resources that go deeper and move faster.')
  if (answers.childNeeds === 'engage') parts.push('The key right now is re-engaging them — fun, interest-driven resources will help reignite their spark.')
  if (answers.childNeeds === 'explore') parts.push('They\'re in an exploration phase — following their interests will keep the love of learning alive.')

  return parts.join(' ')
}

function scoreResource(
  resource: Resource,
  tags: Set<string>,
  grades: string[],
  screenMode: string,
  religiousPref: string,
  preferredTypes: Set<string>,
  subjects: string[]
): number {
  const rTags = resource.match_tags || []
  let score = 0

  // Tag overlap
  for (const t of rTags) {
    if (tags.has(t)) score += 1
  }

  // Grade match bonus
  const hasGrade = grades.some(g => rTags.includes(g))
  if (hasGrade) score += 3
  else score -= 5 // wrong grade = big penalty

  // Subject match bonus
  for (const subj of subjects) {
    if (rTags.includes(subj)) score += 2
  }

  // Resource type preference — boost preferred types, penalize others
  if (preferredTypes.size > 0) {
    if (preferredTypes.has(resource.resource_type)) score += 4
    else score -= 3
  }

  // Screen filter
  if (screenMode === 'no_screen' && resource.requires_screen === 'yes') score -= 10

  // Religious preference filter
  const rp = resource.religious_pref || 'neutral'
  if (religiousPref === 'secular' && (rp === 'christian' || rp === 'christian_lite')) score -= 15
  if (religiousPref === 'christian' && rp === 'christian') score += 3

  return score
}

export async function POST(req: NextRequest) {
  try {
    const answers: QuizAnswers = await req.json()

    const { tags, screenMode, religiousPref, preferredTypes } = buildTags(answers)
    const grades = ageToGrades(answers.age)
    const profile = generateProfile(answers)

    // Fetch resources
    const { data: resources, error } = await supabase
      .from('resources')
      .select('id, name, description, url, resource_type, match_tags, grade_levels, requires_screen, religious_pref, subjects')
      .eq('approved', true)

    if (error) throw error

    // Map quiz subject values to the tags used in match_tags
    const subjectTagMap: Record<string, string[]> = {
      math: ['math'],
      reading: ['reading', 'language_arts', 'phonics'],
      writing: ['writing', 'grammar'],
      science: ['science', 'life_science', 'earth_science', 'chemistry', 'physics', 'biology', 'astronomy'],
      history: ['history', 'social_studies', 'us_history', 'world_history', 'civics'],
      geography: ['geography', 'map_skills'],
      foreign_language: ['foreign_language', 'spanish', 'french', 'latin', 'mandarin', 'japanese', 'asl'],
    }
    const allowedSubjectTags = new Set<string>()
    for (const subj of answers.subjects) {
      const mapped = subjectTagMap[subj]
      if (mapped) mapped.forEach(t => allowedSubjectTags.add(t))
    }

    // Score and rank — only include resources that match at least one selected subject
    const scored = (resources as Resource[])
      .map(r => ({ ...r, score: scoreResource(r, tags, grades, screenMode, religiousPref, preferredTypes, answers.subjects) }))
      .filter(r => {
        if (r.score <= 0) return false
        // Resource must match at least one of the selected subjects
        const rTags = r.match_tags || []
        return rTags.some(t => allowedSubjectTags.has(t))
      })
      .sort((a, b) => b.score - a.score)

    // Pick top 3: one per resource type AND spread across subjects
    const picks: typeof scored = []
    const usedTypes = new Set<string>()
    const usedSubjects = new Set<string>()

    // First pass: try to get one per type AND one per subject
    for (const r of scored) {
      if (picks.length >= 3) break
      if (usedTypes.has(r.resource_type)) continue
      // Check which selected subjects this resource covers
      const rTags = r.match_tags || []
      const coveredSubj = answers.subjects.filter(s => rTags.includes(s === 'writing' ? 'writing' : s === 'reading' ? 'reading' : s))
      // Prefer resources that cover a subject we haven't shown yet
      const coversNew = coveredSubj.some(s => !usedSubjects.has(s))
      if (picks.length >= 1 && !coversNew && picks.length < 2) continue
      picks.push(r)
      usedTypes.add(r.resource_type)
      coveredSubj.forEach(s => usedSubjects.add(s))
    }

    // Second pass: fill remaining slots with different types (relax subject constraint)
    if (picks.length < 3) {
      for (const r of scored) {
        if (picks.length >= 3) break
        if (picks.some(p => p.id === r.id)) continue
        if (usedTypes.has(r.resource_type)) continue
        picks.push(r)
        usedTypes.add(r.resource_type)
      }
    }

    // Third pass: if still not enough, just fill with best remaining
    if (picks.length < 3) {
      for (const r of scored) {
        if (picks.length >= 3) break
        if (!picks.some(p => p.id === r.id)) picks.push(r)
      }
    }

    // Only count resources with a meaningful match (top half of max score)
    const topScore = scored.length > 0 ? scored[0].score : 0
    const threshold = Math.max(topScore * 0.5, 5)
    const totalMatches = scored.filter(r => r.score >= threshold).length

    // Save quiz submission (anonymous — no email collected)
    await supabase.from('quiz_submissions').insert({
      responses: answers,
      results: {
        profile,
        resources: picks.map(r => ({ id: r.id, name: r.name })),
        totalMatches,
      },
    }).then(() => {}) // fire and forget

    return NextResponse.json({
      profile,
      resources: picks.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        url: r.url,
        resourceType: r.resource_type,
      })),
      totalMatches,
    })
  } catch (err) {
    console.error('Quiz submit error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
