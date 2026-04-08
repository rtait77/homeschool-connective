import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { scoreStyleProfile } from '@/app/lib/scoreStyleProfile'

const ADMIN_EMAIL = 'support@homeschoolconnective.com'

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

type TagSource = { question: string; answer: string }

type TagProfile = {
  tags: Set<string>
  tagSources: Map<string, TagSource[]>
  subjectBoosts: Set<string>
  religiousPref: 'secular' | 'christian' | 'either'
  screenMode: 'no_screen' | 'screen_optional' | 'any'
  deprioritizeTags: Set<string>
  triedCurricula: string[]
}

const a = (v: unknown): string[] => Array.isArray(v) ? v.filter(Boolean) as string[] : []
const s = (v: unknown): string => typeof v === 'string' ? v : ''
const has = (list: string[], value: string): boolean => list.includes(value)

function extractTagProfile(responses: Record<string, unknown>): TagProfile {
  const tags = new Set<string>()
  const tagSources = new Map<string, TagSource[]>()
  const subjectBoosts = new Set<string>()
  const deprioritizeTags = new Set<string>()

  // Helper: add a tag and record its source question/answer
  function addTag(tag: string, question: string, answer: string) {
    tags.add(tag)
    const existing = tagSources.get(tag) ?? []
    if (!existing.some(s => s.question === question && s.answer === answer)) {
      tagSources.set(tag, [...existing, { question, answer }])
    }
  }
  function addTags(tagList: string[], question: string, answer: string) {
    for (const tag of tagList) addTag(tag, question, answer)
  }

  const why = a(responses.whyHomeschooling)
  const expLen = s(responses.experienceLength)
  const startFeelings = a(responses.startingFeelings)
  const currExp = a(responses.curriculumExperience)
  const challenges = a(responses.biggestChallenges)
  const daysPerWeek = s(responses.daysPerWeek)
  const hoursPerDay = s(responses.hoursPerDay)
  const numChildren = s(responses.numChildrenHomeschooling)
  const otherDemands = a(responses.otherDemands)
  const idealDay = a(responses.idealDay)
  const teachingStyle = a(responses.teachingStyle)
  const screenAttitude = a(responses.screenAttitude)
  const progressMeasurement = a(responses.progressMeasurement)
  const prepWillingness = s(responses.prepWillingness)
  const learningEnv = a(responses.learningEnvironment)
  const coop = a(responses.coopParticipation)
  const personality = a(responses.parentPersonality)
  const religiousPreferenceRaw = s(responses.religiousPreference)
  const children = Array.isArray(responses.children) ? responses.children as Record<string, unknown>[] : []

  // Religious preference
  let religiousPref: 'secular' | 'christian' | 'either' = 'either'
  if (religiousPreferenceRaw === 'Secular only — I prefer no religious content') religiousPref = 'secular'
  else if (religiousPreferenceRaw === 'Christian / faith-based — I prefer resources that reflect our faith') religiousPref = 'christian'

  // Screen mode
  let screenMode: 'no_screen' | 'screen_optional' | 'any' = 'any'
  if (has(screenAttitude, 'I prefer minimal screens — I want physical books and hands-on work') ||
      has(screenAttitude, 'I use screens as a reward, not a learning tool')) {
    screenMode = 'no_screen'
  } else if (has(screenAttitude, "I'm open to it but want to be selective") ||
             has(screenAttitude, 'My child would do everything on a screen if I let them — I need a balance') ||
             has(screenAttitude, 'I prefer a mix — some screen-based learning alongside physical books and hands-on activities')) {
    screenMode = 'screen_optional'
  } else if (has(screenAttitude, "I'm fully on board — video lessons and apps are great tools") ||
             has(screenAttitude, 'Screen-based curriculum is a practical necessity for us given my schedule')) {
    addTags(['video_friendly', 'requires_screen'], 'Screen attitude', screenAttitude.join('; '))
  }

  // Why homeschooling
  for (const ans of why) {
    const q = 'Why homeschooling'
    if (ans === "My child has learning differences or special needs that school wasn't meeting")
      addTags(['dyslexia', 'ADHD', 'gentle_pacing', 'step_by_step', 'encouraging_format'], q, ans)
    if (ans === 'We want more flexibility in our schedule and lifestyle')
      addTags(['flexible_schedule', 'self_paced'], q, ans)
    if (ans === 'We had a bad experience with traditional school')
      addTags(['gentle_pacing', 'low_structure', 'encouraging_format'], q, ans)
    if (ans === 'Academic reasons — we want more rigour or a different approach')
      addTags(['gifted', 'structured'], q, ans)
    if (ans === 'Religious or values-based reasons') addTag('christian', q, ans)
    if (ans === 'My child has anxiety, social struggles, or was not thriving in school')
      addTags(['gentle_pacing', 'encouraging_format', 'no_time_pressure'], q, ans)
    if (ans === 'We want to travel or live an unconventional lifestyle')
      addTags(['flexible_schedule', 'self_paced', 'minimal_time'], q, ans)
    if (ans === 'My child asked to be homeschooled') addTags(['child_led', 'interest_led'], q, ans)
  }

  // Experience length
  const q_exp = 'Experience level'
  if (expLen === "We haven't started yet — we're planning ahead" || expLen === 'Less than 6 months')
    addTags(['structured', 'low_prep', 'step_by_step', 'teacher_led'], q_exp, expLen)
  if (expLen === '6 months to 1 year') addTags(['structured', 'low_prep'], q_exp, expLen)
  if (expLen === 'More than 5 years') addTags(['flexible_schedule', 'project_based', 'child_led'], q_exp, expLen)

  // Starting feelings
  for (const ans of startFeelings) {
    const q = 'Starting feelings'
    if (ans === 'Scared or nervous' || ans === 'Uncertain — not sure what to expect' ||
        ans === "Totally lost — I don't know where to begin")
      addTags(['structured', 'low_prep', 'step_by_step', 'encouraging_format'], q, ans)
  }

  // Curriculum experience
  for (const ans of currExp) {
    const q = 'Curriculum experience'
    if (ans === "Yes — and it didn't work well for us" || ans === "We've tried a few things and are still figuring it out")
      addTags(['flexible_schedule', 'low_prep'], q, ans)
  }

  // Biggest challenges
  for (const ans of challenges) {
    const q = 'Biggest challenges'
    if (ans === 'Math') subjectBoosts.add('math')
    if (ans === 'Reading / Language Arts') {
      subjectBoosts.add('reading'); subjectBoosts.add('language_arts')
      addTags(['reading', 'language_arts'], q, ans)
    }
    if (ans === 'Science') subjectBoosts.add('science')
    if (ans === 'History / Social Studies') subjectBoosts.add('history')
    if (ans === 'Writing') {
      subjectBoosts.add('writing')
      addTags(['writing', 'reluctant_writer'], q, ans)
    }
    if (ans === 'Scheduling and consistency') addTags(['structured', 'low_prep'], q, ans)
    if (ans === "My child's motivation") addTags(['game_based', 'interest_led', 'encouraging_format'], q, ans)
    if (ans === 'My own confidence as a teacher') addTags(['teacher_led', 'low_prep', 'step_by_step'], q, ans)
  }

  // Days per week
  const q_days = 'Days per week'
  if (daysPerWeek === '2–3 days per week' || daysPerWeek === 'It varies a lot week to week')
    addTags(['flexible_schedule', 'minimal_time', 'self_paced'], q_days, daysPerWeek)
  if (daysPerWeek === '4 days per week') addTags(['minimal_time', 'flexible_schedule'], q_days, daysPerWeek)

  // Hours per day
  const q_hrs = 'Hours per day'
  if (hoursPerDay === 'Less than 1 hour') addTags(['minimal_time', 'short_lessons', 'low_prep'], q_hrs, hoursPerDay)
  if (hoursPerDay === '1–2 hours') addTags(['minimal_time', 'short_lessons'], q_hrs, hoursPerDay)
  if (hoursPerDay === '3–4 hours' || hoursPerDay === '4+ hours') addTag('full_week_ok', q_hrs, hoursPerDay)

  // Number of children
  const q_num = 'Number of children homeschooling'
  if (numChildren === 'Two') addTag('multi_child_friendly', q_num, numChildren)
  if (numChildren === 'Three') addTags(['multi_child_friendly', 'low_prep'], q_num, numChildren)
  if (numChildren === 'Four or more') addTags(['multi_child_friendly', 'low_prep', 'self_paced'], q_num, numChildren)

  // Other demands
  for (const ans of otherDemands) {
    const q = 'Other demands on your time'
    if (ans === 'I work part-time during school hours' ||
        ans === 'I work full-time — homeschooling happens around my work schedule')
      addTags(['minimal_time', 'self_paced', 'independent_learner', 'low_prep'], q, ans)
    if (ans === 'I have a baby or toddler at home' ||
        ans === 'I have significant caregiving responsibilities for another family member')
      addTags(['minimal_time', 'self_paced', 'short_lessons', 'low_prep'], q, ans)
    if (ans === 'My time is mostly free during school hours') addTag('full_week_ok', q, ans)
  }

  // Ideal day
  for (const ans of idealDay) {
    const q = 'Ideal school day'
    if (ans === 'A structured schedule — same subjects, same order, every day')
      addTags(['structured', 'teacher_led', 'full_week_ok'], q, ans)
    if (ans === 'A loose rhythm — a general flow but flexible day to day')
      addTags(['flexible_schedule', 'low_structure'], q, ans)
    if (ans === "Child-led — we follow what they're interested in that day")
      addTags(['child_led', 'interest_led', 'project_based', 'low_structure'], q, ans)
    if (ans === 'A mix of structured core subjects plus free exploration time')
      addTags(['structured', 'project_based', 'flexible_schedule'], q, ans)
    if (ans === 'We do school in short bursts throughout the day rather than one block')
      addTags(['short_lessons', 'flexible_schedule', 'self_paced'], q, ans)
    if (ans === 'We do intense school days some days and take other days off completely')
      addTags(['flexible_schedule', 'self_paced', 'minimal_time'], q, ans)
  }

  // Teaching style
  for (const ans of teachingStyle) {
    const q = 'Teaching style'
    if (ans === 'Sitting down and teaching directly — explaining, questioning, discussing')
      addTags(['teacher_led', 'discussion_based'], q, ans)
    if (ans === 'Setting up activities and materials and stepping back')
      addTags(['hands_on', 'project_based', 'child_led'], q, ans)
    if (ans === 'Reading aloud together and discussing')
      addTags(['read_aloud', 'literature_based', 'discussion_based'], q, ans)
    if (ans === 'Finding experiences — field trips, documentaries, real-world projects')
      addTags(['project_based', 'hands_on', 'video_friendly'], q, ans)
    if (ans === 'I prefer to let the curriculum or a video do the teaching and I support') {
      addTags(['self_paced', 'low_prep', 'video_friendly'], q, ans)
      if (screenMode !== 'no_screen') addTag('requires_screen', q, ans)
    }
    if (ans === "I'm still figuring out what kind of teacher I am")
      addTags(['structured', 'low_prep', 'step_by_step', 'teacher_led'], q, ans)
  }

  // Progress measurement
  for (const ans of progressMeasurement) {
    const q = 'Progress measurement'
    if (ans === "I need clear grade levels and scope-and-sequence — I need to know we're on track")
      addTags(['structured', 'mastery_based'], q, ans)
    if (ans === "I care more about mastery than grade level — they move when they're ready")
      addTags(['mastery_based', 'no_time_pressure', 'self_paced'], q, ans)
    if (ans === 'Testing and grades make me anxious — I prefer portfolio or narrative assessment')
      addTags(['gentle_pacing', 'no_time_pressure', 'low_structure'], q, ans)
    if (ans === "I trust the process — I'm not focused on measuring progress formally")
      addTags(['child_led', 'low_structure', 'interest_led'], q, ans)
  }

  // Prep willingness
  const q_prep = 'Prep willingness'
  if (prepWillingness === 'I need something I can open and use with minimal prep — done for me') {
    addTag('low_prep', q_prep, prepWillingness)
    deprioritizeTags.add('teacher_intensive')
  }
  if (prepWillingness === "I'm happy to do some planning — maybe an hour a week")
    addTags(['low_prep', 'teacher_led'], q_prep, prepWillingness)
  if (prepWillingness === 'I enjoy planning and can invest significant time in designing our school')
    addTags(['teacher_intensive', 'project_based'], q_prep, prepWillingness)
  if (prepWillingness === 'I want a spine or framework I can build around with my own additions')
    addTags(['structured', 'flexible_schedule'], q_prep, prepWillingness)

  // Learning environment
  for (const ans of learningEnv) {
    const q = 'Learning environment'
    if (ans === 'A dedicated school room or space') addTags(['structured', 'teacher_led'], q, ans)
    if (ans === 'Kitchen table or shared living space' || ans === 'Wherever they feel like that day — we move around')
      addTags(['flexible_schedule', 'self_paced'], q, ans)
    if (ans === 'Outdoors as much as possible') addTags(['hands_on', 'project_based', 'kinesthetic'], q, ans)
    if (ans === 'We travel and school on the road') addTags(['flexible_schedule', 'self_paced', 'minimal_time', 'low_prep'], q, ans)
    if (ans === "It's noisy and busy — younger siblings, pets, distractions")
      addTags(['self_paced', 'independent_learner', 'short_lessons'], q, ans)
  }

  // Co-op
  for (const ans of coop) {
    const q = 'Co-op participation'
    if (ans === "Yes — we attend regularly and it's important to us") addTags(['discussion_based', 'project_based'], q, ans)
    if (ans === 'No — we prefer to homeschool independently') addTags(['self_paced', 'independent_learner'], q, ans)
    if (ans === 'We use online classes or communities instead of in-person co-ops') {
      addTag('video_friendly', q, ans)
      if (screenMode !== 'no_screen') addTag('requires_screen', q, ans)
    }
  }

  // Parent personality
  for (const ans of personality) {
    const q = 'Parent personality'
    if (ans === "I'm a planner — I like structure and knowing what comes next")
      addTags(['structured', 'teacher_led', 'full_week_ok'], q, ans)
    if (ans === "I'm a go-with-the-flow type — rigidity stresses me out")
      addTags(['low_structure', 'flexible_schedule', 'child_led'], q, ans)
    if (ans === 'I get excited about new ideas but struggle with follow-through')
      addTags(['low_prep', 'self_paced', 'structured'], q, ans)
    if (ans === "I'm consistent and persistent — I finish what I start") addTag('teacher_intensive', q, ans)
    if (ans === "I get overwhelmed easily when there's too much on my plate")
      addTags(['low_prep', 'minimal_time', 'self_paced', 'short_lessons'], q, ans)
    if (ans === 'I have my own learning differences or challenges that affect how I teach')
      addTags(['low_prep', 'step_by_step'], q, ans)
    if (ans === 'I have anxiety that sometimes affects our homeschool')
      addTags(['low_prep', 'low_structure', 'gentle_pacing', 'encouraging_format'], q, ans)
  }

  // === PER-CHILD SECTIONS ===
  for (const child of children) {
    const childName = s(child.name) || 'Child'
    const cn = (q: string) => children.length > 1 ? `${q} (${childName})` : q

    const cReg = a(child.regulation)
    const cFrustChild = a(child.frustrationChild)
    const cFrustParent = a(child.frustrationParent)
    const cNewTasks = a(child.newTasks)
    const cHardTasks = a(child.hardTasks)
    const cReadAloud = a(child.readAloud)
    const cVideoEng = a(child.videoEngagement)
    const cScreenUse = a(child.screenUse)
    const cGames = a(child.games)
    const cReadingLevel = s(child.readingLevel)
    const cReadingFeel = s(child.readingFeel)
    const cWritingStage = s(child.writingStage)
    const cWritingFeel = s(child.writingFeel)
    const cPhysicalWriting = a(child.physicalWriting)
    const cWritingTypes = a(child.writingTypes)
    const cSpellingLevel = s(child.spellingLevel)
    const cSpellingFeel = s(child.spellingFeel)
    const cFocusSpan = s(child.focusSpan)
    const cIntenseInterests = s(child.intenseInterests)
    const cDemonstrates = a(child.demonstratesUnderstanding)
    const cLoves = a(child.lovesSubjects)
    const cExtraInfo = a(child.extraInfo)
    const cDiagnosis = s(child.diagnosis).toLowerCase()
    const cExtraOther = s(child.extraOther).toLowerCase()

    // Regulation
    for (const ans of cReg) {
      const q = cn('Regulation / sensory needs')
      if (ans === 'They need to move — run, jump, pace, or do something physical')
        addTags(['movement_friendly', 'kinesthetic', 'hands_on'], q, ans)
      if (ans === 'They need quiet and low stimulation — a calm space, dim light, no noise')
        addTags(['sensory_friendly', 'gentle_pacing'], q, ans)
      if (ans === 'They need to talk it through with someone')
        addTags(['discussion_based', 'read_aloud', 'teacher_led'], q, ans)
      if (ans === 'They need to be left alone') addTags(['self_paced', 'independent_learner'], q, ans)
      if (ans === 'They need something to squeeze, chew, or fidget with')
        addTags(['sensory_friendly', 'hands_on', 'kinesthetic'], q, ans)
      if (ans === 'They need a complete change of activity — something totally different')
        addTags(['short_lessons', 'flexible_schedule'], q, ans)
    }

    // Frustration - child
    for (const ans of cFrustChild) {
      const q = cn('How child handles frustration')
      if (ans === 'Shuts down completely — refuses, cries, or walks away')
        addTags(['gentle_pacing', 'mastery_based', 'no_time_pressure', 'encouraging_format', 'short_lessons'], q, ans)
      if (ans === 'Gets upset but pushes through if I stay with them')
        addTags(['teacher_led', 'step_by_step'], q, ans)
      if (ans === 'Gets physical — slams things, tenses up, or acts out')
        addTags(['short_lessons', 'movement_friendly', 'sensory_friendly'], q, ans)
      if (ans === 'Becomes anxious — worried about being wrong, not just frustrated')
        addTags(['gentle_pacing', 'no_time_pressure', 'encouraging_format', 'mastery_based'], q, ans)
      if (ans === 'Quietly gives up without making a fuss')
        addTags(['encouraging_format', 'gentle_pacing', 'game_based'], q, ans)
      if (ans === 'Takes a break on their own and comes back to it')
        addTags(['self_paced', 'flexible_schedule'], q, ans)
    }

    // Frustration - parent
    for (const ans of cFrustParent) {
      const q = cn('How parent handles frustration')
      if (ans === 'Stay close and coach them through it') addTags(['teacher_led', 'step_by_step'], q, ans)
      if (ans === 'Give them space and let them come back when ready') addTags(['self_paced', 'independent_learner'], q, ans)
      if (ans === 'Redirect to something completely different') addTags(['short_lessons', 'flexible_schedule'], q, ans)
      if (ans === 'Offer movement or a sensory break') addTags(['movement_friendly', 'kinesthetic'], q, ans)
      if (ans === 'Simplify the task or break it into smaller steps')
        addTags(['step_by_step', 'mastery_based', 'gentle_pacing'], q, ans)
      if (ans === 'Put it away for the day entirely')
        addTags(['short_lessons', 'flexible_schedule', 'no_time_pressure'], q, ans)
    }

    // New tasks
    for (const ans of cNewTasks) {
      const q = cn('Approach to new tasks')
      if (ans === 'Jumps in immediately — excited and curious') addTags(['child_led', 'interest_led'], q, ans)
      if (ans === 'Watches or observes first before trying') addTags(['video_friendly', 'step_by_step'], q, ans)
      if (ans === "Asks a lot of questions before they'll start") addTags(['discussion_based', 'teacher_led'], q, ans)
      if (ans === 'Resists or refuses until they feel safe enough' || ans === 'Gets anxious — worries about doing it wrong')
        addTags(['gentle_pacing', 'mastery_based', 'encouraging_format', 'no_time_pressure'], q, ans)
      if (ans === 'Depends entirely on whether it interests them') addTags(['interest_led', 'child_led'], q, ans)
    }

    // Hard tasks
    for (const ans of cHardTasks) {
      const q = cn('Approach to hard tasks')
      if (ans === "Avoids it even if it's something they want to achieve")
        addTags(['step_by_step', 'encouraging_format', 'game_based'], q, ans)
      if (ans === 'Needs someone alongside them to keep going') addTag('teacher_led', q, ans)
      if (ans === 'Pushes through independently once they start') addTags(['self_paced', 'independent_learner'], q, ans)
      if (ans === 'Gives up quickly regardless of interest')
        addTags(['game_based', 'short_lessons', 'gentle_pacing', 'short_attention'], q, ans)
      if (ans === 'Has big goals but struggles to do the work required to get there')
        addTags(['step_by_step', 'mastery_based', 'short_lessons'], q, ans)
    }

    // Read aloud
    for (const ans of cReadAloud) {
      const q = cn('Read-aloud engagement')
      if (ans === "They absorb almost everything, even when they look like they're not listening")
        addTags(['read_aloud', 'literature_based', 'auditory_learner'], q, ans)
      if (ans === 'They retain it better if their hands are busy at the same time')
        addTags(['sensory_friendly', 'hands_on', 'kinesthetic'], q, ans)
      if (ans === 'They want to stop and discuss as you go') addTags(['discussion_based', 'read_aloud'], q, ans)
      if (ans === "They drift and can't recall much afterwards") {
        deprioritizeTags.add('read_aloud'); deprioritizeTags.add('literature_based')
        addTags(['video_friendly', 'hands_on'], q, ans)
      }
    }

    // Video engagement
    for (const ans of cVideoEng) {
      const q = cn('Video engagement')
      if (ans === 'They retain information well from videos — it sticks')
        addTags(['video_friendly', 'visual_learner'], q, ans)
      if (ans === "Videos feel more like entertainment — they enjoy it but don't absorb much" ||
          ans === 'They zone out during videos, even ones they chose') {
        deprioritizeTags.add('video_friendly')
        addTags(['hands_on', 'game_based'], q, ans)
      }
      if (ans === "We limit screens significantly — this isn't really an option for us") addTag('no_screen', q, ans)
      if (ans === 'They ask questions and want to discuss what they watched')
        addTags(['discussion_based', 'video_friendly'], q, ans)
    }

    // Screen use
    for (const ans of cScreenUse) {
      const q = cn('Screen use')
      if (ans === 'They use screens to watch educational videos') addTag('video_friendly', q, ans)
      if (ans === 'They use screens to play educational games') addTag('game_based', q, ans)
      if (ans === "They're not particularly drawn to screens — they prefer other activities" ||
          ans === 'Screen time is limited or restricted in our home') addTag('no_screen', q, ans)
    }

    // Games
    for (const ans of cGames) {
      const q = cn('Games')
      if (ans === 'Yes — board games or card games') addTag('game_based', q, ans)
      if (ans === 'Yes — strategy or puzzle video games (e.g. chess-style, logic puzzles)' ||
          ans === 'Yes — adventure or narrative video games') {
        addTag('game_based', q, ans)
        if (screenMode !== 'no_screen') addTag('requires_screen', q, ans)
      }
      if (ans === 'Yes — creative or building games (e.g. Minecraft, Roblox)')
        addTags(['hands_on', 'stem', 'game_based'], q, ans)
      if (ans === "They don't enjoy board games or card games") deprioritizeTags.add('game_based')
    }

    // Reading level
    const q_read = cn('Reading level')
    if (cReadingLevel === 'Not yet reading — working on letters and sounds') addTag('pre_reading', q_read, cReadingLevel)
    if (cReadingLevel === 'Beginning to read — sounding out short words')
      addTags(['early_reading', 'developing_reading'], q_read, cReadingLevel)
    if (cReadingLevel === 'Reading simple books with some effort') addTag('developing_reading', q_read, cReadingLevel)
    if (cReadingLevel === 'Reading independently at or around grade level') addTag('grade_level_reading', q_read, cReadingLevel)
    if (cReadingLevel === 'Reading above grade level or voraciously') addTag('advanced_reading', q_read, cReadingLevel)
    if (cReadingFeel === 'They need to improve') {
      addTags(['struggling_reader', 'reading'], cn('Reading — how it feels'), cReadingFeel)
      subjectBoosts.add('reading')
    }

    // Writing
    const q_write = cn('Writing stage')
    if (cWritingStage === 'Not yet writing — working on pencil grip and pre-writing shapes' ||
        cWritingStage === 'Writing individual letters') addTag('pre_writing', q_write, cWritingStage)
    if (cWritingStage === 'Writing short words or simple phrases' || cWritingStage === 'Writing full sentences')
      addTags(['early_writing', 'developing_writing'], q_write, cWritingStage)
    if (cWritingStage === 'Writing paragraphs' || cWritingStage === 'Writing multi-paragraph pieces or short essays')
      addTag('developing_writing', q_write, cWritingStage)
    if (cWritingStage === 'Writing longer pieces, stories, or structured essays') addTag('advanced_writing', q_write, cWritingStage)
    if (cWritingFeel === 'They need to improve') {
      addTags(['reluctant_writer', 'writing'], cn('Writing — how it feels'), cWritingFeel)
      subjectBoosts.add('writing')
    }
    for (const ans of cPhysicalWriting) {
      const q = cn('Physical writing challenges')
      if (ans === "They have a lot to say but their handwriting can't keep up with their ideas — this causes real frustration" ||
          ans === 'They have ideas but freeze when it comes to getting them onto paper' ||
          ans === 'The physical act of writing is slow, painful, or messy despite real effort')
        addTags(['reluctant_writer', 'gentle_pacing'], q, ans)
    }
    if (has(cWritingTypes, 'They avoid writing in any form')) addTag('reluctant_writer', cn('Writing types'), 'They avoid writing in any form')

    // Spelling
    const q_spell = cn('Spelling level')
    if (cSpellingLevel === 'Learning basic phonetic spelling — sounding words out') addTag('early_spelling', q_spell, cSpellingLevel)
    if (cSpellingLevel === 'Spelling is a significant struggle — words spelled differently every time') {
      addTags(['struggling_spelling', 'dyslexia'], q_spell, cSpellingLevel)
      subjectBoosts.add('spelling')
    }
    if (cSpellingFeel === 'They need to improve') {
      addTag('struggling_spelling', cn('Spelling — how it feels'), cSpellingFeel)
      subjectBoosts.add('spelling')
    }

    // Focus span
    const q_focus = cn('Focus span')
    if (cFocusSpan === '5 minutes or less')
      addTags(['short_lessons', 'game_based', 'movement_friendly', 'short_attention'], q_focus, cFocusSpan)
    if (cFocusSpan === 'Around 10–15 minutes with some redirection')
      addTags(['short_lessons', 'short_attention'], q_focus, cFocusSpan)
    if (cFocusSpan === "Around 20–30 minutes if I'm engaged with them") addTag('teacher_led', q_focus, cFocusSpan)
    if (cFocusSpan === 'Completely depends on the topic — night and day difference') addTag('interest_led', q_focus, cFocusSpan)
    if (cIntenseInterests === 'Yes — one or two things they are completely fixated on')
      addTags(['interest_led', 'child_led'], cn('Intense interests'), cIntenseInterests)

    // Demonstrates understanding
    for (const ans of cDemonstrates) {
      const q = cn('How they demonstrate understanding')
      if (ans === 'Explaining it back in their own words — verbally' ||
          ans === 'Answering questions verbally' ||
          ans === 'Teaching it to someone else (or a pet!)')
        addTags(['discussion_based', 'auditory_learner'], q, ans)
      if (ans === 'Drawing, building, or creating something connected to it')
        addTags(['hands_on', 'kinesthetic', 'visual_learner'], q, ans)
      if (ans === 'Acting it out or turning it into a game')
        addTags(['game_based', 'kinesthetic', 'hands_on'], q, ans)
      if (ans === 'Going off and finding more information on their own')
        addTags(['interest_led', 'independent_learner'], q, ans)
    }

    // Loves subjects
    for (const ans of cLoves) {
      const q = cn('Loves subjects')
      if (ans === 'Science and how things work' || ans === 'Animals and nature' || ans === 'Space and the universe')
        subjectBoosts.add('science')
      if (ans === 'History and stories from the past') subjectBoosts.add('history')
      if (ans === 'Math and numbers and patterns') subjectBoosts.add('math')
      if (ans === 'Reading and stories') { subjectBoosts.add('reading'); addTag('literature_based', q, ans) }
      if (ans === 'Building and engineering' || ans === 'Technology and computers') {
        subjectBoosts.add('stem'); addTags(['hands_on', 'stem'], q, ans)
      }
      if (ans === 'Sports, movement, and the body') addTags(['movement_friendly', 'kinesthetic'], q, ans)
    }

    // Diagnosis
    const q_diag = cn('Diagnosis / extra info')
    if (cDiagnosis.includes('dyslexia') || cExtraOther.includes('dyslexia'))
      addTags(['dyslexia', 'struggling_reader', 'struggling_spelling', 'gentle_pacing', 'step_by_step'], q_diag, cDiagnosis || cExtraOther)
    if (cDiagnosis.includes('adhd') || cExtraOther.includes('adhd'))
      addTags(['ADHD', 'short_lessons', 'movement_friendly', 'game_based', 'short_attention', 'kinesthetic'], q_diag, cDiagnosis || cExtraOther)
    if (cDiagnosis.includes('autism') || cExtraOther.includes('autism'))
      addTags(['sensory_friendly', 'structured', 'step_by_step', 'no_time_pressure'], q_diag, cDiagnosis || cExtraOther)
    if (cDiagnosis.includes('spd') || cExtraOther.includes('spd') || cDiagnosis.includes('sensory') || cExtraOther.includes('sensory'))
      addTags(['sensory_friendly', 'movement_friendly', 'gentle_pacing'], q_diag, cDiagnosis || cExtraOther)
    if (cDiagnosis.includes('anxiety') || cExtraOther.includes('anxiety'))
      addTags(['gentle_pacing', 'no_time_pressure', 'encouraging_format', 'mastery_based'], q_diag, cDiagnosis || cExtraOther)
    if (cDiagnosis.includes('gifted') || cDiagnosis.includes('2e') || cExtraOther.includes('gifted') || cExtraOther.includes('2e'))
      addTags(['gifted', 'advanced_reading', 'interest_led', 'independent_learner'], q_diag, cDiagnosis || cExtraOther)

    for (const ans of cExtraInfo) {
      if (ans === 'Is currently in speech, OT, or another therapy')
        addTag('gentle_pacing', cn('Extra info'), ans)
    }

    // Level flexibility (per child)
    const cLevelFlex = s(child.levelFlexibility)
    const q_level = cn('Level flexibility')
    if (cLevelFlex === 'Yes — we need the ability to move up or down levels freely')
      addTag('level_flexible', q_level, cLevelFlex)
    if (cLevelFlex === 'It would be helpful, but is not essential')
      addTag('level_flexible', q_level, cLevelFlex)

    // Reading preference (fiction vs nonfiction) — checkboxes, multiple possible
    const cReadingPref = a(child.readingPreference)
    const q_readpref = cn('Reading preference')
    if (has(cReadingPref, 'Fiction and stories — characters, adventure, and imagination'))
      addTag('fiction_rich', q_readpref, 'Fiction and stories')
    if (has(cReadingPref, 'Nonfiction — real facts about animals, science, history, or how things work'))
      addTag('nonfiction_rich', q_readpref, 'Nonfiction')
    if (has(cReadingPref, 'Graphic novels or comics — pictures are as important as the words'))
      addTags(['visual_heavy', 'fiction_rich'], q_readpref, 'Graphic novels or comics')

    // Book format (visual vs text) — checkboxes, multiple possible
    const cBookFormat = a(child.bookFormat)
    const q_bookfmt = cn('Book format')
    if (has(cBookFormat, 'Highly illustrated — lots of pictures, and visual layout matters a lot'))
      addTag('visual_heavy', q_bookfmt, 'Highly illustrated')
    if (has(cBookFormat, 'Mostly text — they do not need many pictures'))
      addTag('text_heavy', q_bookfmt, 'Mostly text')

    // Independence level
    const cIndependence = s(child.independenceLevel)
    const q_indep = cn('Independence level')
    if (cIndependence === 'Very independently — they can work through most things on their own')
      addTag('independent_learner', q_indep, cIndependence)
    if (cIndependence === 'I need to sit with them for most of the session')
      addTags(['teacher_led', 'needs_parent_support'], q_indep, cIndependence)
    if (cIndependence === 'With occasional check-ins — I need to be nearby but not always actively involved') {
      // Mild signal — no strong push either way, skip
    }
  }

  const triedCurricula = s(responses.curriculumTried)
    .split(/[,\n]+/)
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 3)

  return { tags, tagSources, subjectBoosts, religiousPref, screenMode, deprioritizeTags, triedCurricula }
}

function scoreResource(resource: Resource, profile: TagProfile): {
  score: number
  matchedTags: { tag: string; sources: TagSource[] }[]
  excluded: boolean
  warning: boolean
} {
  const { religiousPref, screenMode, tags, tagSources, subjectBoosts, deprioritizeTags, triedCurricula } = profile

  if (religiousPref === 'secular' && resource.religious_pref === 'christian') {
    return { score: 0, matchedTags: [], excluded: true, warning: false }
  }

  const warning = religiousPref === 'secular' && resource.religious_pref === 'christian_lite'
  const nameLower = resource.name.toLowerCase()
  const wasTried = triedCurricula.some(t => nameLower.includes(t) || t.includes(nameLower.split(' ')[0]))

  const resourceTags = resource.match_tags || []
  const matchedTags = resourceTags
    .filter(tag => tags.has(tag))
    .map(tag => ({ tag, sources: tagSources.get(tag) ?? [] }))

  let score = matchedTags.length

  const resourceSubjects = resource.subjects || []
  for (const boost of subjectBoosts) {
    if (resourceSubjects.includes(boost) || resourceTags.includes(boost)) score += 2
  }

  if (screenMode === 'no_screen' && resource.requires_screen === 'yes') score -= 8
  if (screenMode === 'no_screen' && resource.requires_screen === 'optional') score -= 2
  if (screenMode === 'any' && resource.requires_screen === 'yes' && tags.has('requires_screen')) score += 1

  const deprioritizedMatches = resourceTags.filter(tag => deprioritizeTags.has(tag))
  score -= deprioritizedMatches.length * 2

  if (wasTried) score -= 10

  if (religiousPref === 'christian' && (resource.religious_pref === 'christian' || resource.religious_pref === 'christian_lite')) {
    score += 2
  }

  return { score, matchedTags, excluded: false, warning }
}

const TAG_LABELS: Record<string, string> = {
  dyslexia: 'great for learners with dyslexia',
  ADHD: 'designed to work well for kids with ADHD',
  gentle_pacing: 'uses a gentle, no-pressure pace',
  step_by_step: 'breaks concepts into small, manageable steps',
  encouraging_format: 'has a warm, encouraging format that builds confidence',
  mastery_based: 'uses mastery-based progression — move forward when ready, not on a timer',
  no_time_pressure: 'removes time pressure entirely',
  hands_on: 'is hands-on and tactile',
  kinesthetic: 'is great for kids who learn by doing and moving',
  game_based: 'turns learning into a game',
  visual_learner: 'is highly visual',
  auditory_learner: 'works well for auditory learners',
  discussion_based: 'is built around conversation and discussion',
  read_aloud: 'is designed to be read aloud together',
  literature_based: 'uses real books and stories',
  self_paced: 'is fully self-paced',
  independent_learner: 'can run independently with minimal parent involvement',
  teacher_led: 'is teacher-led — works well when a parent stays involved',
  low_prep: 'requires very little prep — just open and go',
  structured: 'provides clear structure and a predictable daily plan',
  flexible_schedule: 'fits a flexible or irregular schedule',
  short_lessons: 'uses short lessons — great for variety and short attention spans',
  minimal_time: 'works well in a shorter school day',
  multi_child_friendly: 'works well across multiple grade levels at once',
  gifted: 'is well-suited for advanced or gifted learners',
  interest_led: 'follows the child\'s natural interests',
  project_based: 'is project-based and exploratory',
  no_screen: 'is completely screen-free',
  movement_friendly: 'works well for kids who need to move',
  short_attention: 'is designed for shorter attention spans',
  reluctant_writer: 'is great for reluctant or resistant writers',
  struggling_reader: 'is specifically designed for struggling readers',
  struggling_spelling: 'is highly effective for spelling struggles',
  early_reading: 'is designed for early readers',
  pre_reading: 'is perfect for building pre-reading foundations',
  stem: 'covers STEM through hands-on activities',
  video_friendly: 'includes video instruction',
  teacher_intensive: 'rewards significant parent involvement',
  level_flexible: 'can be used above or below grade level — great for families who need flexibility',
  fiction_rich: 'is story- and fiction-driven — great for kids who love characters and narrative',
  nonfiction_rich: 'is information-rich — great for kids drawn to real facts, science, and history',
  visual_heavy: 'is highly visual and illustrated — perfect for visual learners and graphic novel fans',
  text_heavy: 'is text-based and reading-forward — suits strong, confident readers',
  needs_parent_support: 'works best with a parent actively involved in each session',
}

function generateReason(resource: Resource, matchedTags: { tag: string }[], warning: boolean): string {
  const HIGH_VALUE = ['dyslexia', 'ADHD', 'gifted', 'reluctant_writer', 'struggling_reader',
    'struggling_spelling', 'mastery_based', 'gentle_pacing', 'hands_on', 'game_based',
    'low_prep', 'short_lessons', 'no_screen', 'movement_friendly', 'multi_child_friendly',
    'self_paced', 'independent_learner', 'encouraging_format', 'no_time_pressure']

  const sorted = [
    ...HIGH_VALUE.filter(t => matchedTags.some(m => m.tag === t)),
    ...matchedTags.map(m => m.tag).filter(t => !HIGH_VALUE.includes(t)),
  ].slice(0, 3)

  const explanations = sorted.map(t => TAG_LABELS[t]).filter(Boolean)
  const subjectStr = resource.subjects?.length ? resource.subjects.join(' and ') : ''

  let reason = explanations.length > 0
    ? `This ${subjectStr ? subjectStr + ' resource ' : 'resource '}${explanations.length === 1
        ? explanations[0]
        : explanations.slice(0, -1).join(', ') + ' and ' + explanations[explanations.length - 1]}.`
    : `May be a good fit based on this family's overall profile.`

  if (warning) {
    reason += ' ⚠️ Note: This resource has light faith-based content. It is widely used by secular families, but worth previewing first.'
  }

  return reason.charAt(0).toUpperCase() + reason.slice(1)
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

  const { data: intake } = await admin
    .from('consulting_intake_responses')
    .select('responses')
    .eq('customer_id', customer_id)
    .single()

  if (!intake?.responses) {
    return NextResponse.json({ error: 'No intake responses found for this customer' }, { status: 404 })
  }

  const { data: resources } = await admin
    .from('resources')
    .select('id, name, subjects, grade_levels, price_range, requires_screen, parent_prep, time_per_lesson, religious_pref, match_tags')

  if (!resources || resources.length === 0) {
    return NextResponse.json({ error: 'No resources in database' }, { status: 500 })
  }

  const responses = intake.responses as Record<string, unknown>
  const intakeChildren = Array.isArray(responses.children) ? responses.children as Record<string, unknown>[] : []
  const childNames = intakeChildren.map((c, i) => (typeof c.name === 'string' && c.name) ? c.name : `Child ${i + 1}`)
  const hasMultipleChildren = childNames.length > 1

  const CHILD_QUESTION_PREFIXES = [
    'Regulation', 'How child handles', 'How parent handles', 'Approach to new tasks',
    'Approach to hard tasks', 'Read-aloud', 'Video engagement', 'Screen use', 'Games',
    'Reading level', 'Reading —', 'Writing stage', 'Writing —', 'Physical writing',
    'Writing types', 'Spelling level', 'Spelling —', 'Focus span', 'Intense interests',
    'How they demonstrate', 'Loves subjects', 'Diagnosis', 'Extra info',
  ]

  function getSuggestedFor(matchedTags: { tag: string; sources: { question: string }[] }[]): string[] {
    const people = new Set<string>()
    for (const { sources } of matchedTags) {
      for (const { question } of sources) {
        if (hasMultipleChildren) {
          let foundChild = false
          for (const name of childNames) {
            if (question.includes(`(${name})`)) { people.add(name); foundChild = true }
          }
          if (!foundChild) people.add('Parent')
        } else {
          const isChildQ = CHILD_QUESTION_PREFIXES.some(p => question.startsWith(p))
          if (isChildQ && childNames.length > 0) people.add(childNames[0])
          else people.add('Parent')
        }
      }
    }
    return Array.from(people)
  }

  const profile = extractTagProfile(responses)
  const styleProfile = scoreStyleProfile(responses)

  // Inject style profile signals into the tag engine so resource recommendations reflect
  // the child's learning style, parent teaching style, and best-fit method.
  const { learningStyles, methods, teachingStyle: tStyle } = styleProfile
  // Learning styles → tags (top style gets full boost, others partial)
  if (learningStyles.includes('Visual')) profile.tags.add('visual_learner')
  if (learningStyles.includes('Auditory')) {
    profile.tags.add('auditory_learner')
    profile.tags.add('read_aloud')
    profile.tags.add('discussion_based')
  }
  if (learningStyles.includes('Kinesthetic')) {
    profile.tags.add('kinesthetic')
    profile.tags.add('hands_on')
    profile.tags.add('movement_friendly')
  }
  if (learningStyles.includes('Tactile')) {
    profile.tags.add('hands_on')
    profile.tags.add('kinesthetic')
  }
  // Teaching style → tags
  if (tStyle === 'Direct Teacher') { profile.tags.add('teacher_led'); profile.tags.add('discussion_based') }
  if (tStyle === 'Facilitator') { profile.tags.add('child_led'); profile.tags.add('hands_on') }
  if (tStyle === 'Read-aloud & Discussion') { profile.tags.add('read_aloud'); profile.tags.add('literature_based'); profile.tags.add('discussion_based') }
  if (tStyle === 'Experience-based') { profile.tags.add('project_based'); profile.tags.add('hands_on') }
  if (tStyle === 'Resource-dependent') { profile.tags.add('low_prep'); profile.tags.add('self_paced'); profile.tags.add('independent_learner') }
  // Method → tags
  if (methods.includes('Charlotte Mason')) { profile.tags.add('read_aloud'); profile.tags.add('literature_based'); profile.tags.add('hands_on') }
  if (methods.includes('Classical')) { profile.tags.add('discussion_based'); profile.tags.add('literature_based'); profile.tags.add('structured') }
  if (methods.includes('Montessori')) { profile.tags.add('hands_on'); profile.tags.add('child_led'); profile.tags.add('self_paced') }
  if (methods.includes('Traditional')) { profile.tags.add('structured'); profile.tags.add('teacher_led') }
  if (methods.includes('Unschooling')) { profile.tags.add('child_led'); profile.tags.add('interest_led'); profile.tags.add('low_structure') }
  if (methods.includes('Eclectic')) { profile.tags.add('flexible_schedule') }
  if (methods.includes('Lifestyle Learning')) { profile.tags.add('project_based'); profile.tags.add('hands_on'); profile.tags.add('flexible_schedule') }
  if (methods.includes('Waldorf')) { profile.tags.add('hands_on'); profile.tags.add('project_based') }

  // Persist style profile to consulting_customers
  await admin
    .from('consulting_customers')
    .update({ style_profile: styleProfile })
    .eq('id', customer_id)

  const recommendations = (resources as Resource[])
    .map(resource => {
      const { score, matchedTags, excluded, warning } = scoreResource(resource, profile)
      return { resource, score, matchedTags, excluded, warning }
    })
    .filter(r => !r.excluded)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map(({ resource, score, matchedTags, warning }) => ({
      resource_id: resource.id,
      name: resource.name,
      subjects: resource.subjects,
      grade_levels: resource.grade_levels,
      price_range: resource.price_range,
      requires_screen: resource.requires_screen,
      time_per_lesson: resource.time_per_lesson,
      parent_prep: resource.parent_prep,
      religious_pref: resource.religious_pref,
      score,
      matched_tag_count: matchedTags.length,
      matched_tags: matchedTags,
      christian_lite_warning: warning,
      reason: generateReason(resource, matchedTags, warning),
      suggested_for: getSuggestedFor(matchedTags),
    }))

  return NextResponse.json({
    recommendations,
    total_resources: resources.length,
    excluded_count: resources.length - recommendations.length,
    tag_profile: Array.from(profile.tags),
    style_profile: styleProfile,
  })
}
