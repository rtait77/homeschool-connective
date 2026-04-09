# Homeschool Style Quiz — Full Build Spec

## Purpose
Free public quiz that gives parents a personalized learning profile + 3-5 sample resource recommendations, funneling them toward paid consulting with Melanie.

## Location
`/consulting/quiz` (public, no login required)

## Entry Points
1. **Homepage hero** — replace "Get Homeschool Help →" with "Find Your Homeschool Fit →" (teal outline button), links to `/consulting/quiz`
2. **Homepage consulting block** — add "Take the Free Quiz" button (teal outline) next to existing "Learn More →"
3. Both funnel to `/consulting/quiz`

---

## Quiz Flow

### Step 1: Landing/Intro (no questions yet)
- Headline: "What Does Your Child Actually Need?" or "Find Your Homeschool Fit"
- Subtext: "Answer 7 quick questions and we'll match your child with resources from our database of 1,100+ homeschool tools — books, games, curricula, apps, and more."
- Note: "Takes about 2 minutes. No account needed."
- Big CTA: "Start the Quiz"
- Design: cream/coral/teal, playful but not childish, matches site

### Step 2: Questions (one per screen, progress bar at top)
Show one question at a time with smooth transition. Progress bar shows 1/7, 2/7, etc.

**Q1: "How old is your child?"**
- Radio: 3-5, 6-8, 9-11, 12-14, 15-18
- Maps to: grade_levels filtering

**Q2: "What does a tough school day usually look like?"**
- Checkboxes (pick all):
  - Meltdowns or shutdowns over hard work
  - "I'm bored" on repeat
  - Can't sit still for more than a few minutes
  - Everything takes way longer than it should
  - Fights about writing specifically
  - Won't work unless I'm sitting right there
  - Honestly, most days are pretty good — I just want to optimize
- Maps to: ADHD/focus, engaging/game_based, short_lessons, independent_learner, hands_on tags

**Q3: "When your child is really into something, what do they do?"**
- Checkboxes (pick all):
  - Talk about it nonstop
  - Draw or build things related to it
  - Read everything they can find about it
  - Watch videos about it
  - Want to do hands-on experiments
  - Want to teach someone else about it
- Maps to: visual_learner, kinesthetic, hands_on, video, book, independent_learner

**Q4: "How much time do you realistically have for school each day?"**
- Radio: Less than 1 hour, 1-2 hours, 2-3 hours, 3+ hours
- Maps to: open_and_go, short_lessons vs structured, curriculum

**Q5: "How involved do you want to be in the teaching?"**
- Radio:
  - I want to teach it all myself
  - I'll guide, but I need something mostly done-for-me
  - My child needs to work independently — I can't sit with them
  - I want someone else to teach (online classes, videos)
- Maps to: parent_led, open_and_go, independent_learner, video_based, online_classes

**Q6: "Screens — what's your comfort level?"**
- Radio:
  - Love 'em — apps and videos are great tools
  - Some screens are fine, but I want a mix
  - Minimal screens — physical books and hands-on
- Maps to: requires_screen filtering, app/video/online vs book/no_screen/hands_on

**Q7: "What subjects are you most looking for help with?"**
- Checkboxes (pick up to 3):
  - Math
  - Reading / Language Arts
  - Science
  - History / Social Studies
  - Writing
  - Foreign Language
  - We need help with everything
- Maps to: subjects filtering

### Step 3: Email Capture (after Q7, before results)
- "Almost done! Where should we send your personalized results?"
- Fields: First name, Email address
- Small text: "We'll also send you a few free homeschool tips. Unsubscribe anytime."
- Button: "See My Results →"
- Optional: "Skip for now" link shows results but doesn't save (Rebecca to decide)

### Step 4: Results Page

**Section 1: "Your Child's Learning Profile"**
2-3 sentence personalized profile assembled from answer combinations. Example:
> "Your 8-year-old thrives with hands-on, short-burst learning and needs minimal screen time. They work best when a parent is nearby but guiding rather than lecturing, and they'd benefit from resources that tap into their natural curiosity and love of building things."

**Section 2: "3 Resources We'd Recommend"**
Pull 3 real resources from DB matching their filters (age, subjects, screen, type). Show:
- Resource name
- Resource type badge (book, app, game, etc.)
- 1-line description
- Link to resource

**Section 3: The Upsell (gentle)**
> "We found **[X] resources** in our database that match your child's profile. Want the full picture?"
>
> "Melanie works 1-on-1 with homeschool families to build a complete, personalized curriculum plan. She reviews every detail — learning style, challenges, interests, schedule — and hand-picks resources your child will actually love."
>
> [Book a Consulting Session — $XX] (coral CTA)

**Section 4: What consulting includes**
Bullet points: Full intake form, Personalized resource report (20-50+ matches), 1-on-1 session with Melanie, Ongoing support

---

## Technical Implementation

### Data Storage
- New `quiz_submissions` table in Supabase:
  - `id` (uuid), `email`, `first_name`, `responses` (jsonb), `created_at`, `converted` (boolean)
- OR use existing `intake_responses` table with `source: 'quiz'` flag

### Pre-population (key feature)
If someone takes quiz → later buys consulting → fills out full intake form:
- Check if their email matches a quiz submission
- Pre-fill overlapping fields (age, screen pref, subjects, time, teaching involvement)
- Show: "We pre-filled some answers from your earlier quiz. Feel free to update anything."

### Resource Matching
- Use existing recommendation engine logic, simplified
- Filter by: grade_levels (from age), subjects (from Q7), requires_screen (from Q6), resource_type preferences (from Q2-Q5)
- Return 3 resources + count of total matches

### Email Integration
- Add email to Sender.net with tag `quiz_completed`
- Trigger sequence:
  - Email 1 (immediate): "Here are your quiz results" with the 3 resources
  - Email 2 (3 days): Helpful tip related to their Q2 pain point
  - Email 3 (7 days): Soft consulting pitch with Melanie's story

---

## Design Notes
- One question per screen with big tappable answer cards (not tiny checkboxes)
- Progress bar at top (coral, fills as they go)
- Cream background, teal accents, coral CTAs — match site
- Mobile-first — most parents will take this on their phone
- Results page should feel like a reveal
- Consider subtle animation when results appear

## What NOT to do
- Don't gate ALL results behind email — show profile + 3 resources even without email
- Don't make it feel like a school test — warm, conversational language
- Don't ask more than 7-8 questions — completion drops after 3 minutes
- Don't use generic learning style labels ("you're a visual learner!") — be specific and actionable
