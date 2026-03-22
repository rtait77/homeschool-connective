// scoreStyleProfile.ts
// Pure function — takes intake form responses, returns top-ranked learning styles,
// homeschooling methods, and teaching style.
// IMPORTANT: religious preference NEVER affects method scores.

export type LearningStyle = 'Visual' | 'Auditory' | 'Kinesthetic' | 'Tactile'
export type HomeschoolMethod = 'Traditional' | 'Classical' | 'Charlotte Mason' | 'Montessori' | 'Waldorf' | 'Unschooling' | 'Eclectic' | 'Lifestyle Learning'
export type TeachingStyle = 'Direct Teacher' | 'Facilitator' | 'Read-aloud & Discussion' | 'Experience-based' | 'Resource-dependent'

export type StyleProfile = {
  learningStyles: LearningStyle[]   // top 3 by score
  methods: HomeschoolMethod[]       // top 3 by score
  teachingStyle: TeachingStyle      // top 1
  rawScores: {
    learningStyles: Record<LearningStyle, number>
    methods: Record<HomeschoolMethod, number>
    teachingStyles: Record<TeachingStyle, number>
  }
}

const a = (v: unknown): string[] => Array.isArray(v) ? v.filter(Boolean) as string[] : []
const s = (v: unknown): string => typeof v === 'string' ? v : ''
const has = (list: string[], value: string): boolean => list.includes(value)

export function scoreStyleProfile(responses: Record<string, unknown>): StyleProfile {
  // ── Learning style scores ───────────────────────────────────────────────
  const ls: Record<LearningStyle, number> = {
    Visual: 0, Auditory: 0, Kinesthetic: 0, Tactile: 0,
  }

  // ── Homeschooling method scores ─────────────────────────────────────────
  const ms: Record<HomeschoolMethod, number> = {
    Traditional: 0, Classical: 0, 'Charlotte Mason': 0, Montessori: 0,
    Waldorf: 0, Unschooling: 0, Eclectic: 0, 'Lifestyle Learning': 0,
  }

  // ── Teaching style scores ───────────────────────────────────────────────
  const ts: Record<TeachingStyle, number> = {
    'Direct Teacher': 0, 'Facilitator': 0, 'Read-aloud & Discussion': 0,
    'Experience-based': 0, 'Resource-dependent': 0,
  }

  // ── Pull parent-level fields ────────────────────────────────────────────
  const idealDay       = a(responses.idealDay)
  const teachingStyle  = a(responses.teachingStyle)
  const screenAttitude = a(responses.screenAttitude)
  const prepWillingness = s(responses.prepWillingness)
  const learningEnv    = a(responses.learningEnvironment)
  const personality    = a(responses.parentPersonality)

  // ── Q4 ideal day → methods + teaching styles ────────────────────────────
  if (has(idealDay, 'Structured schedule — we follow a set plan each day')) {
    ms.Traditional += 3; ms.Classical += 2
    ts['Direct Teacher'] += 2
  }
  if (has(idealDay, 'Mostly child-led — we follow their interests and energy')) {
    ms.Montessori += 2; ms.Unschooling += 2
    ts['Facilitator'] += 2
  }
  if (has(idealDay, 'A loose rhythm — we have a general flow but stay flexible')) {
    ms.Traditional += 0; ms.Classical += 0; ms['Charlotte Mason'] += 1
    ms.Montessori += 1; ms.Waldorf += 1; ms.Unschooling += 1; ms.Eclectic += 1
  }
  if (has(idealDay, 'Short focused bursts — we work intensely then take breaks')) {
    ms['Charlotte Mason'] += 2; ms['Lifestyle Learning'] += 1
    ts['Facilitator'] += 1
  }
  if (has(idealDay, 'Intense days followed by days off — we sprint and rest')) {
    ms['Lifestyle Learning'] += 2
  }
  if (has(idealDay, 'A mix — some structured blocks plus open free time')) {
    ms.Eclectic += 2
  }

  // ── Q5 teaching style → methods + teaching styles ──────────────────────
  const tsMultiCount = teachingStyle.length
  if (has(teachingStyle, 'Direct teaching — I sit down and teach, explain, and ask questions')) {
    ms.Traditional += 2; ms.Classical += 1
    ts['Direct Teacher'] += 3
  }
  if (has(teachingStyle, 'Setting up activities and materials, then stepping back to let them explore')) {
    ms.Montessori += 3
    ts['Facilitator'] += 3
  }
  if (has(teachingStyle, 'Reading aloud together and discussing what we read')) {
    ms['Charlotte Mason'] += 3
    ts['Read-aloud & Discussion'] += 3
  }
  if (has(teachingStyle, 'Field trips, documentaries, and real-world experiences')) {
    ms['Lifestyle Learning'] += 3
    ts['Experience-based'] += 3
  }
  if (has(teachingStyle, "Letting the curriculum or video do the primary teaching — I support from the side")) {
    ms.Traditional += 2
    ts['Resource-dependent'] += 3
  }
  if (has(teachingStyle, "Still figuring out what works — I'm open to anything")) {
    ts['Resource-dependent'] += 1
  }
  if (has(teachingStyle, 'I love incorporating creativity, art, music, or storytelling into how we learn')) {
    ms.Waldorf += 3
  }
  // multiple selections = eclectic signal
  if (tsMultiCount >= 3) ms.Eclectic += 2

  // ── Q6 screens → methods ────────────────────────────────────────────────
  if (has(screenAttitude, 'I prefer minimal screens — I want physical books and hands-on work') ||
      has(screenAttitude, 'I use screens as a reward, not a learning tool')) {
    ms['Charlotte Mason'] += 1; ms.Waldorf += 2
  }
  if (has(screenAttitude, "I'm fully on board — video lessons and apps are great tools") ||
      has(screenAttitude, 'Screen-based curriculum is a practical necessity for us given my schedule')) {
    ms.Waldorf -= 1; ms['Lifestyle Learning'] += 1
  }

  // ── Q8 prep willingness → methods + teaching styles ────────────────────
  if (prepWillingness === 'Minimal — I want to open it and use it') {
    ms.Traditional += 2; ts['Resource-dependent'] += 2
  }
  if (prepWillingness === 'I enjoy planning — I can put in significant prep time') {
    ms.Classical += 2; ms['Charlotte Mason'] += 2
    ts['Direct Teacher'] += 1; ts['Read-aloud & Discussion'] += 1
  }
  if (prepWillingness === 'I want a spine to build around — some prep is fine') {
    ms.Traditional += 1; ms.Classical += 1; ms.Eclectic += 2
  }

  // ── Q9 learning environment → methods ───────────────────────────────────
  if (has(learningEnv, 'Outdoors as much as possible')) {
    ms['Charlotte Mason'] += 2; ms.Waldorf += 1; ms['Lifestyle Learning'] += 2
  }
  if (has(learningEnv, 'We travel frequently and learning happens on the road')) {
    ms['Lifestyle Learning'] += 3
  }
  if (has(learningEnv, 'We move around the house — different spots for different subjects')) {
    ms.Montessori += 1; ms['Lifestyle Learning'] += 1
  }
  if (has(learningEnv, 'We have a specific lifestyle — homesteading, travel, family business, ministry — that learning naturally happens inside')) {
    ms['Lifestyle Learning'] += 3
  }

  // ── Q11 parent personality → methods + teaching styles ─────────────────
  if (has(personality, 'Planner — I like to know what we are doing and when')) {
    ms.Traditional += 2; ms.Classical += 1; ts['Direct Teacher'] += 2
  }
  if (has(personality, 'Go-with-the-flow — I like to see where the day takes us')) {
    ms.Montessori += 1; ms.Unschooling += 2; ms.Eclectic += 1; ms['Lifestyle Learning'] += 1
    ts['Facilitator'] += 2; ts['Experience-based'] += 1
  }
  if (has(personality, 'Consistent and persistent — I follow through even when it is hard')) {
    ms.Traditional += 1; ms.Classical += 2
  }
  if (has(personality, 'Gets excited about new things but struggles to follow through')) {
    ms.Eclectic += 1
  }

  // ── Per-child signals ───────────────────────────────────────────────────
  const children = Array.isArray(responses.children)
    ? responses.children as Record<string, unknown>[]
    : []

  // Multiple children = eclectic signal
  if (children.length >= 2) ms.Eclectic += 1

  for (const child of children) {
    const regulation  = a(child.regulation)
    const frustration = a(child.frustrationResponse)
    const parentFrust = a(child.parentFrustrationResponse)
    const readAloud   = a(child.readAloud)
    const video       = a(child.videoLearning)
    const games       = a(child.gamesPlays)
    const demonstrates = a(child.demonstratesUnderstanding)
    const focusSpan   = s(child.focusSpan)
    const intenseInterests = s(child.intenseInterests)
    const loves       = a(child.lovesAvoids)

    // C1 — Regulation / sensory
    if (has(regulation, 'Needs to move — gets up, paces, bounces, fidgets')) {
      ls.Kinesthetic += 2
    }
    if (has(regulation, 'Needs quiet and low stimulation — noise and chaos throw them off')) {
      ls.Visual += 2
    }
    if (has(regulation, 'Needs to talk it through — verbal processing helps them reset')) {
      ls.Auditory += 2
    }
    if (has(regulation, 'Needs a fidget or sensory tool — something to squeeze, spin, or feel')) {
      ls.Tactile += 2
    }
    if (has(regulation, 'Needs a complete change of activity — switching gears helps')) {
      ls.Kinesthetic += 1
    }
    if (has(regulation, 'They need to touch or handle materials while learning — manipulatives, blocks, or textures help')) {
      ls.Tactile += 3; ms.Montessori += 1
    }
    if (has(regulation, 'They get deeply absorbed in things they choose and really dislike being interrupted')) {
      ms.Montessori += 3
    }

    // C2 — Frustration (child)
    if (has(frustration, 'Gets physical — throws things, stomps, slams')) {
      ls.Kinesthetic += 2
    }

    // C2 — Frustration (parent response)
    if (has(parentFrust, 'Offer a movement or sensory break')) {
      ls.Kinesthetic += 1; ls.Tactile += 1
    }

    // C4 — Read aloud
    if (has(readAloud, 'Absorbs everything — great memory for what was read')) {
      ls.Auditory += 3; ms['Charlotte Mason'] += 3
    }
    if (has(readAloud, 'Wants to stop and discuss — lots of questions and commentary')) {
      ls.Auditory += 2; ms['Charlotte Mason'] += 2; ms.Classical += 1
    }
    if (has(readAloud, 'Retains better when hands are busy — fidgets while listening')) {
      ls.Tactile += 2
    }
    if (has(readAloud, 'Drifts or can\'t recall much — it doesn\'t stick well')) {
      ls.Auditory -= 1; ms['Charlotte Mason'] -= 1
    }
    if (has(readAloud, 'They draw or doodle while listening — it actually helps them focus and retain')) {
      ls.Visual += 2
    }
    if (has(readAloud, 'Reading aloud together is one of our favorite things — they really come alive')) {
      ms['Charlotte Mason'] += 2; ls.Auditory += 1
    }

    // C5 — Video learning
    if (has(video, 'Retains really well from videos — they can repeat it back')) {
      ls.Visual += 3
    }
    if (has(video, 'Zones out or gets distracted')) {
      ls.Visual -= 1
    }
    if (has(video, 'Asks lots of questions or wants to discuss after')) {
      ls.Auditory += 2
    }

    // C6 — Games
    if (has(games, 'Board games or card games')) {
      ls.Tactile += 1
    }
    if (has(games, 'Creative or building games (LEGO, blocks, construction)')) {
      ls.Kinesthetic += 1; ls.Tactile += 2
    }
    if (has(games, 'Strategy or puzzle games')) {
      ls.Visual += 1
    }
    if (has(games, 'They love memorizing facts, chants, songs, or repetitive patterns — it energizes them')) {
      ls.Auditory += 2; ms.Classical += 3
    }

    // C8 — Demonstrates understanding
    if (has(demonstrates, 'Draws, builds, or creates something')) {
      ls.Visual += 1; ls.Tactile += 1
    }
    if (has(demonstrates, 'Explains it verbally — talks through it')) {
      ls.Auditory += 3
    }
    if (has(demonstrates, 'Acts it out or turns it into a game')) {
      ls.Kinesthetic += 3
    }
    if (has(demonstrates, 'Writes it down or makes a diagram')) {
      ls.Visual += 1
    }
    if (has(demonstrates, 'Teaches it to someone else')) {
      ls.Auditory += 2
    }
    if (has(demonstrates, 'Humming, singing, or putting things to a beat or rhythm')) {
      ls.Auditory += 2
    }
    if (has(demonstrates, 'Talking out loud to themselves while they work through it')) {
      ls.Auditory += 2
    }
    if (has(demonstrates, 'Debating or defending their ideas — they love being challenged to explain their thinking')) {
      ms.Classical += 2
    }

    // C9 — Focus span
    if (focusSpan === '5 minutes or less — constant redirection needed' ||
        focusSpan === '5–10 minutes — short bursts with breaks') {
      ls.Kinesthetic += 2
    }

    // C9 — Intense interests
    if (intenseInterests === 'Yes — they fixate on topics deeply' ||
        intenseInterests === 'Very much so — it becomes an all-consuming passion') {
      ms.Montessori += 1; ms.Unschooling += 3
    }

    // C10 — Loves/avoids
    if (has(loves, 'Sports, movement, or anything involving their body')) {
      ls.Kinesthetic += 3
    }
    if (has(loves, 'Building or engineering projects')) {
      ls.Kinesthetic += 1; ls.Tactile += 2
    }
    if (has(loves, 'Art, music, or creative projects')) {
      ls.Visual += 1; ls.Auditory += 1; ms.Waldorf += 3
    }
    if (has(loves, 'Nature, animals, or space')) {
      ms['Charlotte Mason'] += 2; ms['Lifestyle Learning'] += 2
    }
    if (has(loves, 'History, stories, and people from the past')) {
      ms.Classical += 2; ms['Charlotte Mason'] += 1
    }
    if (has(loves, 'Building, engineering, or taking things apart')) {
      ms.Montessori += 1
    }
    if (has(loves, 'Nature walks, animals, and outdoor exploration')) {
      ms['Charlotte Mason'] += 2; ms['Lifestyle Learning'] += 2
    }
  }

  // ── New parent-section questions (added to existing question checkboxes) ──

  // Waldorf signals
  if (has(personality, 'Does your child engage in elaborate imaginative play for long stretches?')) {
    ms.Waldorf += 2
  }
  // Intentionally limits screens (captured in screenAttitude)
  if (has(screenAttitude, 'I intentionally limit screens and prefer nature, stories, and handwork')) {
    ms.Waldorf += 2
  }
  // Loves debate / Classical
  // Already handled via C8 demonstrates debating option above

  // ── Rank and return ─────────────────────────────────────────────────────
  const topStyles = (Object.entries(ls) as [LearningStyle, number][])
    .sort((a, b) => b[1] - a[1])
    .filter(([, score]) => score > 0)
    .slice(0, 3)
    .map(([style]) => style)

  const topMethods = (Object.entries(ms) as [HomeschoolMethod, number][])
    .sort((a, b) => b[1] - a[1])
    .filter(([, score]) => score > 0)
    .slice(0, 3)
    .map(([method]) => method)

  const topTeachingStyle = (Object.entries(ts) as [TeachingStyle, number][])
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Resource-dependent'

  return {
    learningStyles: topStyles,
    methods: topMethods,
    teachingStyle: topTeachingStyle,
    rawScores: {
      learningStyles: ls,
      methods: ms,
      teachingStyles: ts,
    },
  }
}
