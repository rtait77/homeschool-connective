import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

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

type TagProfile = {
  tags: Set<string>
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
  const subjectBoosts = new Set<string>()
  const deprioritizeTags = new Set<string>()

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
    tags.add('video_friendly'); tags.add('requires_screen')
  }

  // Why homeschooling
  if (has(why, "My child has learning differences or special needs that school wasn't meeting")) {
    tags.add('dyslexia'); tags.add('ADHD'); tags.add('gentle_pacing'); tags.add('step_by_step'); tags.add('encouraging_format')
  }
  if (has(why, 'We want more flexibility in our schedule and lifestyle')) {
    tags.add('flexible_schedule'); tags.add('self_paced')
  }
  if (has(why, 'We had a bad experience with traditional school')) {
    tags.add('gentle_pacing'); tags.add('low_structure'); tags.add('encouraging_format')
  }
  if (has(why, 'Academic reasons — we want more rigour or a different approach')) {
    tags.add('gifted'); tags.add('structured')
  }
  if (has(why, 'Religious or values-based reasons')) { tags.add('christian') }
  if (has(why, 'My child has anxiety, social struggles, or was not thriving in school')) {
    tags.add('gentle_pacing'); tags.add('encouraging_format'); tags.add('no_time_pressure')
  }
  if (has(why, 'We want to travel or live an unconventional lifestyle')) {
    tags.add('flexible_schedule'); tags.add('self_paced'); tags.add('minimal_time')
  }
  if (has(why, 'My child asked to be homeschooled')) { tags.add('child_led'); tags.add('interest_led') }

  // Experience length
  if (expLen === "We haven't started yet — we're planning ahead" || expLen === 'Less than 6 months') {
    tags.add('structured'); tags.add('low_prep'); tags.add('step_by_step'); tags.add('teacher_led')
  }
  if (expLen === '6 months to 1 year') { tags.add('structured'); tags.add('low_prep') }
  if (expLen === 'More than 5 years') { tags.add('flexible_schedule'); tags.add('project_based'); tags.add('child_led') }

  // Starting feelings
  if (has(startFeelings, 'Scared or nervous') || has(startFeelings, 'Uncertain — not sure what to expect') ||
      has(startFeelings, "Totally lost — I don't know where to begin")) {
    tags.add('structured'); tags.add('low_prep'); tags.add('step_by_step'); tags.add('encouraging_format')
  }

  // Curriculum experience
  if (has(currExp, "Yes — and it didn't work well for us") ||
      has(currExp, "We've tried a few things and are still figuring it out")) {
    tags.add('flexible_schedule'); tags.add('low_prep')
  }

  // Biggest challenges → subject boosts + tags
  if (has(challenges, 'Math')) subjectBoosts.add('math')
  if (has(challenges, 'Reading / Language Arts')) {
    subjectBoosts.add('reading'); subjectBoosts.add('language_arts'); tags.add('reading'); tags.add('language_arts')
  }
  if (has(challenges, 'Science')) subjectBoosts.add('science')
  if (has(challenges, 'History / Social Studies')) subjectBoosts.add('history')
  if (has(challenges, 'Writing')) { subjectBoosts.add('writing'); tags.add('writing'); tags.add('reluctant_writer') }
  if (has(challenges, 'Scheduling and consistency')) { tags.add('structured'); tags.add('low_prep') }
  if (has(challenges, "My child's motivation")) { tags.add('game_based'); tags.add('interest_led'); tags.add('encouraging_format') }
  if (has(challenges, 'My own confidence as a teacher')) { tags.add('teacher_led'); tags.add('low_prep'); tags.add('step_by_step') }

  // Days per week
  if (daysPerWeek === '2–3 days per week' || daysPerWeek === 'It varies a lot week to week') {
    tags.add('flexible_schedule'); tags.add('minimal_time'); tags.add('self_paced')
  }
  if (daysPerWeek === '4 days per week') { tags.add('minimal_time'); tags.add('flexible_schedule') }

  // Hours per day
  if (hoursPerDay === 'Less than 1 hour') { tags.add('minimal_time'); tags.add('short_lessons'); tags.add('low_prep') }
  if (hoursPerDay === '1–2 hours') { tags.add('minimal_time'); tags.add('short_lessons') }
  if (hoursPerDay === '3–4 hours' || hoursPerDay === '4+ hours') { tags.add('full_week_ok') }

  // Number of children
  if (numChildren === 'Two') tags.add('multi_child_friendly')
  if (numChildren === 'Three') { tags.add('multi_child_friendly'); tags.add('low_prep') }
  if (numChildren === 'Four or more') { tags.add('multi_child_friendly'); tags.add('low_prep'); tags.add('self_paced') }

  // Other demands
  if (has(otherDemands, 'I work part-time during school hours') ||
      has(otherDemands, 'I work full-time — homeschooling happens around my work schedule')) {
    tags.add('minimal_time'); tags.add('self_paced'); tags.add('independent_learner'); tags.add('low_prep')
  }
  if (has(otherDemands, 'I have a baby or toddler at home') ||
      has(otherDemands, 'I have significant caregiving responsibilities for another family member')) {
    tags.add('minimal_time'); tags.add('self_paced'); tags.add('short_lessons'); tags.add('low_prep')
  }
  if (has(otherDemands, 'My time is mostly free during school hours')) tags.add('full_week_ok')

  // Ideal day
  if (has(idealDay, 'A structured schedule — same subjects, same order, every day')) {
    tags.add('structured'); tags.add('teacher_led'); tags.add('full_week_ok')
  }
  if (has(idealDay, 'A loose rhythm — a general flow but flexible day to day')) {
    tags.add('flexible_schedule'); tags.add('low_structure')
  }
  if (has(idealDay, "Child-led — we follow what they're interested in that day")) {
    tags.add('child_led'); tags.add('interest_led'); tags.add('project_based'); tags.add('low_structure')
  }
  if (has(idealDay, 'A mix of structured core subjects plus free exploration time')) {
    tags.add('structured'); tags.add('project_based'); tags.add('flexible_schedule')
  }
  if (has(idealDay, 'We do school in short bursts throughout the day rather than one block')) {
    tags.add('short_lessons'); tags.add('flexible_schedule'); tags.add('self_paced')
  }
  if (has(idealDay, 'We do intense school days some days and take other days off completely')) {
    tags.add('flexible_schedule'); tags.add('self_paced'); tags.add('minimal_time')
  }

  // Teaching style
  if (has(teachingStyle, 'Sitting down and teaching directly — explaining, questioning, discussing')) {
    tags.add('teacher_led'); tags.add('discussion_based')
  }
  if (has(teachingStyle, 'Setting up activities and materials and stepping back')) {
    tags.add('hands_on'); tags.add('project_based'); tags.add('child_led')
  }
  if (has(teachingStyle, 'Reading aloud together and discussing')) {
    tags.add('read_aloud'); tags.add('literature_based'); tags.add('discussion_based')
  }
  if (has(teachingStyle, 'Finding experiences — field trips, documentaries, real-world projects')) {
    tags.add('project_based'); tags.add('hands_on'); tags.add('video_friendly')
  }
  if (has(teachingStyle, 'I prefer to let the curriculum or a video do the teaching and I support')) {
    tags.add('self_paced'); tags.add('low_prep'); tags.add('video_friendly')
    if (screenMode !== 'no_screen') tags.add('requires_screen')
  }
  if (has(teachingStyle, "I'm still figuring out what kind of teacher I am")) {
    tags.add('structured'); tags.add('low_prep'); tags.add('step_by_step'); tags.add('teacher_led')
  }

  // Progress measurement
  if (has(progressMeasurement, "I need clear grade levels and scope-and-sequence — I need to know we're on track")) {
    tags.add('structured'); tags.add('mastery_based')
  }
  if (has(progressMeasurement, "I care more about mastery than grade level — they move when they're ready")) {
    tags.add('mastery_based'); tags.add('no_time_pressure'); tags.add('self_paced')
  }
  if (has(progressMeasurement, 'Testing and grades make me anxious — I prefer portfolio or narrative assessment')) {
    tags.add('gentle_pacing'); tags.add('no_time_pressure'); tags.add('low_structure')
  }
  if (has(progressMeasurement, "I trust the process — I'm not focused on measuring progress formally")) {
    tags.add('child_led'); tags.add('low_structure'); tags.add('interest_led')
  }

  // Prep willingness
  if (prepWillingness === 'I need something I can open and use with minimal prep — done for me') {
    tags.add('low_prep'); deprioritizeTags.add('teacher_intensive')
  }
  if (prepWillingness === "I'm happy to do some planning — maybe an hour a week") {
    tags.add('low_prep'); tags.add('teacher_led')
  }
  if (prepWillingness === 'I enjoy planning and can invest significant time in designing our school') {
    tags.add('teacher_intensive'); tags.add('project_based')
  }
  if (prepWillingness === 'I want a spine or framework I can build around with my own additions') {
    tags.add('structured'); tags.add('flexible_schedule')
  }

  // Learning environment
  if (has(learningEnv, 'A dedicated school room or space')) { tags.add('structured'); tags.add('teacher_led') }
  if (has(learningEnv, 'Kitchen table or shared living space') ||
      has(learningEnv, 'Wherever they feel like that day — we move around')) {
    tags.add('flexible_schedule'); tags.add('self_paced')
  }
  if (has(learningEnv, 'Outdoors as much as possible')) {
    tags.add('hands_on'); tags.add('project_based'); tags.add('kinesthetic')
  }
  if (has(learningEnv, 'We travel and school on the road')) {
    tags.add('flexible_schedule'); tags.add('self_paced'); tags.add('minimal_time'); tags.add('low_prep')
  }
  if (has(learningEnv, "It's noisy and busy — younger siblings, pets, distractions")) {
    tags.add('self_paced'); tags.add('independent_learner'); tags.add('short_lessons')
  }

  // Co-op
  if (has(coop, "Yes — we attend regularly and it's important to us")) {
    tags.add('discussion_based'); tags.add('project_based')
  }
  if (has(coop, 'No — we prefer to homeschool independently')) {
    tags.add('self_paced'); tags.add('independent_learner')
  }
  if (has(coop, 'We use online classes or communities instead of in-person co-ops')) {
    tags.add('video_friendly')
    if (screenMode !== 'no_screen') tags.add('requires_screen')
  }

  // Parent personality
  if (has(personality, "I'm a planner — I like structure and knowing what comes next")) {
    tags.add('structured'); tags.add('teacher_led'); tags.add('full_week_ok')
  }
  if (has(personality, "I'm a go-with-the-flow type — rigidity stresses me out")) {
    tags.add('low_structure'); tags.add('flexible_schedule'); tags.add('child_led')
  }
  if (has(personality, 'I get excited about new ideas but struggle with follow-through')) {
    tags.add('low_prep'); tags.add('self_paced'); tags.add('structured')
  }
  if (has(personality, "I'm consistent and persistent — I finish what I start")) tags.add('teacher_intensive')
  if (has(personality, "I get overwhelmed easily when there's too much on my plate")) {
    tags.add('low_prep'); tags.add('minimal_time'); tags.add('self_paced'); tags.add('short_lessons')
  }
  if (has(personality, 'I have my own learning differences or challenges that affect how I teach')) {
    tags.add('low_prep'); tags.add('step_by_step')
  }
  if (has(personality, 'I have anxiety that sometimes affects our homeschool')) {
    tags.add('low_prep'); tags.add('low_structure'); tags.add('gentle_pacing'); tags.add('encouraging_format')
  }

  // === PER-CHILD SECTIONS ===
  for (const child of children) {
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
    if (has(cReg, 'They need to move — run, jump, pace, or do something physical')) {
      tags.add('movement_friendly'); tags.add('kinesthetic'); tags.add('hands_on')
    }
    if (has(cReg, 'They need quiet and low stimulation — a calm space, dim light, no noise')) {
      tags.add('sensory_friendly'); tags.add('gentle_pacing')
    }
    if (has(cReg, 'They need to talk it through with someone')) {
      tags.add('discussion_based'); tags.add('read_aloud'); tags.add('teacher_led')
    }
    if (has(cReg, 'They need to be left alone')) { tags.add('self_paced'); tags.add('independent_learner') }
    if (has(cReg, 'They need something to squeeze, chew, or fidget with')) {
      tags.add('sensory_friendly'); tags.add('hands_on'); tags.add('kinesthetic')
    }
    if (has(cReg, 'They need a complete change of activity — something totally different')) {
      tags.add('short_lessons'); tags.add('flexible_schedule')
    }

    // Frustration - child
    if (has(cFrustChild, 'Shuts down completely — refuses, cries, or walks away')) {
      tags.add('gentle_pacing'); tags.add('mastery_based'); tags.add('no_time_pressure'); tags.add('encouraging_format'); tags.add('short_lessons')
    }
    if (has(cFrustChild, 'Gets upset but pushes through if I stay with them')) {
      tags.add('teacher_led'); tags.add('step_by_step')
    }
    if (has(cFrustChild, 'Gets physical — slams things, tenses up, or acts out')) {
      tags.add('short_lessons'); tags.add('movement_friendly'); tags.add('sensory_friendly')
    }
    if (has(cFrustChild, 'Becomes anxious — worried about being wrong, not just frustrated')) {
      tags.add('gentle_pacing'); tags.add('no_time_pressure'); tags.add('encouraging_format'); tags.add('mastery_based')
    }
    if (has(cFrustChild, 'Quietly gives up without making a fuss')) {
      tags.add('encouraging_format'); tags.add('gentle_pacing'); tags.add('game_based')
    }
    if (has(cFrustChild, 'Takes a break on their own and comes back to it')) {
      tags.add('self_paced'); tags.add('flexible_schedule')
    }

    // Frustration - parent
    if (has(cFrustParent, 'Stay close and coach them through it')) { tags.add('teacher_led'); tags.add('step_by_step') }
    if (has(cFrustParent, 'Give them space and let them come back when ready')) { tags.add('self_paced'); tags.add('independent_learner') }
    if (has(cFrustParent, 'Redirect to something completely different')) { tags.add('short_lessons'); tags.add('flexible_schedule') }
    if (has(cFrustParent, 'Offer movement or a sensory break')) { tags.add('movement_friendly'); tags.add('kinesthetic') }
    if (has(cFrustParent, 'Simplify the task or break it into smaller steps')) { tags.add('step_by_step'); tags.add('mastery_based'); tags.add('gentle_pacing') }
    if (has(cFrustParent, 'Put it away for the day entirely')) { tags.add('short_lessons'); tags.add('flexible_schedule'); tags.add('no_time_pressure') }

    // New tasks
    if (has(cNewTasks, 'Jumps in immediately — excited and curious')) { tags.add('child_led'); tags.add('interest_led') }
    if (has(cNewTasks, 'Watches or observes first before trying')) { tags.add('video_friendly'); tags.add('step_by_step') }
    if (has(cNewTasks, "Asks a lot of questions before they'll start")) { tags.add('discussion_based'); tags.add('teacher_led') }
    if (has(cNewTasks, 'Resists or refuses until they feel safe enough') || has(cNewTasks, 'Gets anxious — worries about doing it wrong')) {
      tags.add('gentle_pacing'); tags.add('mastery_based'); tags.add('encouraging_format'); tags.add('no_time_pressure')
    }
    if (has(cNewTasks, 'Depends entirely on whether it interests them')) { tags.add('interest_led'); tags.add('child_led') }

    // Hard tasks
    if (has(cHardTasks, "Avoids it even if it's something they want to achieve")) {
      tags.add('step_by_step'); tags.add('encouraging_format'); tags.add('game_based')
    }
    if (has(cHardTasks, 'Needs someone alongside them to keep going')) tags.add('teacher_led')
    if (has(cHardTasks, 'Pushes through independently once they start')) { tags.add('self_paced'); tags.add('independent_learner') }
    if (has(cHardTasks, 'Gives up quickly regardless of interest')) {
      tags.add('game_based'); tags.add('short_lessons'); tags.add('gentle_pacing'); tags.add('short_attention')
    }
    if (has(cHardTasks, 'Has big goals but struggles to do the work required to get there')) {
      tags.add('step_by_step'); tags.add('mastery_based'); tags.add('short_lessons')
    }

    // Read aloud
    if (has(cReadAloud, "They absorb almost everything, even when they look like they're not listening")) {
      tags.add('read_aloud'); tags.add('literature_based'); tags.add('auditory_learner')
    }
    if (has(cReadAloud, 'They retain it better if their hands are busy at the same time')) {
      tags.add('sensory_friendly'); tags.add('hands_on'); tags.add('kinesthetic')
    }
    if (has(cReadAloud, 'They want to stop and discuss as you go')) {
      tags.add('discussion_based'); tags.add('read_aloud')
    }
    if (has(cReadAloud, "They drift and can't recall much afterwards")) {
      deprioritizeTags.add('read_aloud'); deprioritizeTags.add('literature_based')
      tags.add('video_friendly'); tags.add('hands_on')
    }

    // Video engagement
    if (has(cVideoEng, 'They retain information well from videos — it sticks')) {
      tags.add('video_friendly'); tags.add('visual_learner')
    }
    if (has(cVideoEng, "Videos feel more like entertainment — they enjoy it but don't absorb much") ||
        has(cVideoEng, 'They zone out during videos, even ones they chose')) {
      deprioritizeTags.add('video_friendly')
      tags.add('hands_on'); tags.add('game_based')
    }
    if (has(cVideoEng, "We limit screens significantly — this isn't really an option for us")) tags.add('no_screen')
    if (has(cVideoEng, 'They ask questions and want to discuss what they watched')) {
      tags.add('discussion_based'); tags.add('video_friendly')
    }

    // Screen use
    if (has(cScreenUse, 'They use screens to watch educational videos')) tags.add('video_friendly')
    if (has(cScreenUse, 'They use screens to play educational games')) tags.add('game_based')
    if (has(cScreenUse, "They're not particularly drawn to screens — they prefer other activities") ||
        has(cScreenUse, 'Screen time is limited or restricted in our home')) tags.add('no_screen')

    // Games
    if (has(cGames, 'Yes — board games or card games')) tags.add('game_based')
    if (has(cGames, 'Yes — strategy or puzzle video games (e.g. chess-style, logic puzzles)') ||
        has(cGames, 'Yes — adventure or narrative video games')) {
      tags.add('game_based')
      if (screenMode !== 'no_screen') tags.add('requires_screen')
    }
    if (has(cGames, 'Yes — creative or building games (e.g. Minecraft, Roblox)')) {
      tags.add('hands_on'); tags.add('stem'); tags.add('game_based')
    }
    if (has(cGames, "They don't enjoy board games or card games")) deprioritizeTags.add('game_based')

    // Reading level
    if (cReadingLevel === 'Not yet reading — working on letters and sounds') tags.add('pre_reading')
    if (cReadingLevel === 'Beginning to read — sounding out short words') {
      tags.add('early_reading'); tags.add('developing_reading')
    }
    if (cReadingLevel === 'Reading simple books with some effort') tags.add('developing_reading')
    if (cReadingLevel === 'Reading independently at or around grade level') tags.add('grade_level_reading')
    if (cReadingLevel === 'Reading above grade level or voraciously') tags.add('advanced_reading')
    if (cReadingFeel === 'They need to improve') {
      tags.add('struggling_reader'); tags.add('reading'); subjectBoosts.add('reading')
    }

    // Writing
    if (cWritingStage === 'Not yet writing — working on pencil grip and pre-writing shapes' ||
        cWritingStage === 'Writing individual letters') tags.add('pre_writing')
    if (cWritingStage === 'Writing short words or simple phrases' || cWritingStage === 'Writing full sentences') {
      tags.add('early_writing'); tags.add('developing_writing')
    }
    if (cWritingStage === 'Writing paragraphs' || cWritingStage === 'Writing multi-paragraph pieces or short essays') {
      tags.add('developing_writing')
    }
    if (cWritingStage === 'Writing longer pieces, stories, or structured essays') tags.add('advanced_writing')
    if (cWritingFeel === 'They need to improve') {
      tags.add('reluctant_writer'); tags.add('writing'); subjectBoosts.add('writing')
    }
    if (has(cPhysicalWriting, "They have a lot to say but their handwriting can't keep up with their ideas — this causes real frustration") ||
        has(cPhysicalWriting, 'They have ideas but freeze when it comes to getting them onto paper') ||
        has(cPhysicalWriting, 'The physical act of writing is slow, painful, or messy despite real effort')) {
      tags.add('reluctant_writer'); tags.add('gentle_pacing')
    }
    if (has(cWritingTypes, 'They avoid writing in any form')) tags.add('reluctant_writer')

    // Spelling
    if (cSpellingLevel === 'Learning basic phonetic spelling — sounding words out') tags.add('early_spelling')
    if (cSpellingLevel === 'Spelling is a significant struggle — words spelled differently every time') {
      tags.add('struggling_spelling'); tags.add('dyslexia'); subjectBoosts.add('spelling')
    }
    if (cSpellingFeel === 'They need to improve') {
      tags.add('struggling_spelling'); subjectBoosts.add('spelling')
    }

    // Focus span
    if (cFocusSpan === '5 minutes or less') {
      tags.add('short_lessons'); tags.add('game_based'); tags.add('movement_friendly'); tags.add('short_attention')
    }
    if (cFocusSpan === 'Around 10–15 minutes with some redirection') {
      tags.add('short_lessons'); tags.add('short_attention')
    }
    if (cFocusSpan === "Around 20–30 minutes if I'm engaged with them") tags.add('teacher_led')
    if (cFocusSpan === 'Completely depends on the topic — night and day difference') tags.add('interest_led')
    if (cIntenseInterests === 'Yes — one or two things they are completely fixated on') {
      tags.add('interest_led'); tags.add('child_led')
    }

    // Demonstrates understanding
    if (has(cDemonstrates, 'Explaining it back in their own words — verbally') ||
        has(cDemonstrates, 'Answering questions verbally') ||
        has(cDemonstrates, 'Teaching it to someone else (or a pet!)')) {
      tags.add('discussion_based'); tags.add('auditory_learner')
    }
    if (has(cDemonstrates, 'Drawing, building, or creating something connected to it')) {
      tags.add('hands_on'); tags.add('kinesthetic'); tags.add('visual_learner')
    }
    if (has(cDemonstrates, 'Acting it out or turning it into a game')) {
      tags.add('game_based'); tags.add('kinesthetic'); tags.add('hands_on')
    }
    if (has(cDemonstrates, 'Going off and finding more information on their own')) {
      tags.add('interest_led'); tags.add('independent_learner')
    }

    // Loves subjects → subject boosts
    if (has(cLoves, 'Science and how things work') || has(cLoves, 'Animals and nature') || has(cLoves, 'Space and the universe')) {
      subjectBoosts.add('science')
    }
    if (has(cLoves, 'History and stories from the past')) subjectBoosts.add('history')
    if (has(cLoves, 'Math and numbers and patterns')) subjectBoosts.add('math')
    if (has(cLoves, 'Reading and stories')) { subjectBoosts.add('reading'); tags.add('literature_based') }
    if (has(cLoves, 'Building and engineering') || has(cLoves, 'Technology and computers')) {
      subjectBoosts.add('stem'); tags.add('hands_on'); tags.add('stem')
    }
    if (has(cLoves, 'Sports, movement, and the body')) { tags.add('movement_friendly'); tags.add('kinesthetic') }

    // Diagnosis (free text — fuzzy match)
    if (cDiagnosis.includes('dyslexia') || cExtraOther.includes('dyslexia')) {
      tags.add('dyslexia'); tags.add('struggling_reader'); tags.add('struggling_spelling'); tags.add('gentle_pacing'); tags.add('step_by_step')
    }
    if (cDiagnosis.includes('adhd') || cExtraOther.includes('adhd')) {
      tags.add('ADHD'); tags.add('short_lessons'); tags.add('movement_friendly'); tags.add('game_based'); tags.add('short_attention'); tags.add('kinesthetic')
    }
    if (cDiagnosis.includes('autism') || cExtraOther.includes('autism')) {
      tags.add('sensory_friendly'); tags.add('structured'); tags.add('step_by_step'); tags.add('no_time_pressure')
    }
    if (cDiagnosis.includes('spd') || cExtraOther.includes('spd') || cDiagnosis.includes('sensory') || cExtraOther.includes('sensory')) {
      tags.add('sensory_friendly'); tags.add('movement_friendly'); tags.add('gentle_pacing')
    }
    if (cDiagnosis.includes('anxiety') || cExtraOther.includes('anxiety')) {
      tags.add('gentle_pacing'); tags.add('no_time_pressure'); tags.add('encouraging_format'); tags.add('mastery_based')
    }
    if (cDiagnosis.includes('gifted') || cDiagnosis.includes('2e') || cExtraOther.includes('gifted') || cExtraOther.includes('2e')) {
      tags.add('gifted'); tags.add('advanced_reading'); tags.add('interest_led'); tags.add('independent_learner')
    }

    // Extract any extra info for Mel (logged separately)
    if (has(cExtraInfo, 'Is currently in speech, OT, or another therapy')) {
      tags.add('gentle_pacing') // therapy involvement → favor gentle pacing
    }
  }

  // Tried curricula list for exclusion
  const triedCurricula = s(responses.curriculumTried)
    .split(/[,\n]+/)
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 3)

  return { tags, subjectBoosts, religiousPref, screenMode, deprioritizeTags, triedCurricula }
}

function scoreResource(resource: Resource, profile: TagProfile): {
  score: number; matchedTags: string[]; excluded: boolean; warning: boolean
} {
  const { religiousPref, screenMode, tags, subjectBoosts, deprioritizeTags, triedCurricula } = profile

  // Hard exclude: secular family + christian resource
  if (religiousPref === 'secular' && resource.religious_pref === 'christian') {
    return { score: 0, matchedTags: [], excluded: true, warning: false }
  }

  const warning = religiousPref === 'secular' && resource.religious_pref === 'christian_lite'

  // Check if family tried this curriculum
  const nameLower = resource.name.toLowerCase()
  const wasTried = triedCurricula.some(t => nameLower.includes(t) || t.includes(nameLower.split(' ')[0]))

  // Tag match score
  const resourceTags = resource.match_tags || []
  const matchedTags = resourceTags.filter(tag => tags.has(tag))
  let score = matchedTags.length

  // Subject boost (+2 per matching subject that the family has boosted)
  const resourceSubjects = resource.subjects || []
  for (const boost of subjectBoosts) {
    if (resourceSubjects.includes(boost) || resourceTags.includes(boost)) score += 2
  }

  // Screen penalties/bonuses
  if (screenMode === 'no_screen' && resource.requires_screen === 'yes') score -= 8
  if (screenMode === 'no_screen' && resource.requires_screen === 'optional') score -= 2
  if (screenMode === 'any' && resource.requires_screen === 'yes' && tags.has('requires_screen')) score += 1

  // Deprioritize tags penalty (-2 per matching deprioritized tag)
  const deprioritizedMatches = resourceTags.filter(tag => deprioritizeTags.has(tag))
  score -= deprioritizedMatches.length * 2

  // Previously tried: heavy penalty (show last)
  if (wasTried) score -= 10

  // Christian family bonus for faith-based resources
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
}

function generateReason(resource: Resource, matchedTags: string[], warning: boolean): string {
  const HIGH_VALUE = ['dyslexia', 'ADHD', 'gifted', 'reluctant_writer', 'struggling_reader',
    'struggling_spelling', 'mastery_based', 'gentle_pacing', 'hands_on', 'game_based',
    'low_prep', 'short_lessons', 'no_screen', 'movement_friendly', 'multi_child_friendly',
    'self_paced', 'independent_learner', 'encouraging_format', 'no_time_pressure']

  const sorted = [
    ...HIGH_VALUE.filter(t => matchedTags.includes(t)),
    ...matchedTags.filter(t => !HIGH_VALUE.includes(t)),
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

  const profile = extractTagProfile(intake.responses as Record<string, unknown>)

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
      christian_lite_warning: warning,
      reason: generateReason(resource, matchedTags, warning),
    }))

  return NextResponse.json({
    recommendations,
    total_resources: resources.length,
    excluded_count: resources.length - recommendations.length,
    tag_profile: Array.from(profile.tags),
  })
}
