# Homeschool Connective — Claude Code Context

## How We Work Together

**Rebecca** is the founder and vision-holder. Non-technical — no terminal, no code editing.
**Claude** acts as CTO, full-stack engineer, and designer. Rebecca describes what she wants; Claude figures out how to build it.

- Give step-by-step instructions when Rebecca needs to do something manually (e.g. Supabase, Stripe, Vercel dashboards)
- Don't ask Rebecca to write or edit code directly
- Keep explanations human — avoid jargon unless explaining something important
- Prefer concise, direct responses. No AI fluff.
- When something is already decided (stack, design, pricing), execute — don't re-litigate
- Claude handles all git commits and pushes via terminal (gh CLI is authenticated)

**Design & copy decisions:** Make a reasonable call, then ask Rebecca's opinion before shipping.

**After every change:** Provide a short summary of what changed and a checklist of what to test in the browser.

**Context discipline:** Always read CLAUDE.md and memory before starting work. Never suggest tools or services that are already in the stack. If unsure whether something exists, check the codebase first.

## What This Is

Game-based learning platform for homeschoolers. **Live at homeschoolconnective.com.**
- Free 7-day trial (no credit card) → paid subscription ($5/mo or $50/yr via Stripe)
- Games hosted on Genially, embedded via iframe
- `/learn` is the main paywall page (was `/games`, redirect exists)

## Stack (final — do not suggest alternatives)

| Layer | Tool |
|---|---|
| Framework | Next.js App Router + TypeScript |
| Auth + DB | Supabase (`@supabase/ssr`) |
| Payments | Stripe (Checkout + webhooks) |
| Styling | Tailwind CSS v4 |
| Hosting | Vercel |
| Email (newsletters + trial reminders) | Sender.net |
| Email (transactional — purchase confirmations, welcome emails) | Resend |

## Commands

```bash
npm run dev        # Dev server on localhost:3000
npm run build      # Build — run to catch errors before pushing
npx tsc --noEmit   # Type check only
# Test Stripe webhooks locally:
stripe listen --forward-to localhost:3000/api/webhook
```

## Site Structure

```
/ — Homepage (marketing, newsletter signup in footer)
/learn — Games + Lessons (paywall — requires trial or active subscription)
/games — Redirects to /learn
/pricing — Subscription plans
/signup — Start free trial
/login — Login
/dashboard — User dashboard
/subscribe/success — Post-payment success page
/tips — Blog listing
/tips/[slug] — Individual tip posts (hardcoded pages, not MDX)
/about, /contact — Info pages
```

## API Routes

```
/api/start-trial  — Creates trial record in Supabase
/api/checkout     — Creates Stripe Checkout session
/api/webhook      — Stripe webhook (subscription.created/updated/deleted + consulting checkout.session.completed)
/api/cron         — Sends trial reminder emails (Vercel cron, daily 10am UTC)
/auth/callback    — Supabase auth callback
```

## Database (Supabase)

Key tables: `public.profiles` (extends `auth.users`), `public.favorites`
Key profile fields: `subscription_status`, `trial_end`, `stripe_customer_id`
`subscription_status` allowed values: `free` | `trialing` | `active` | `canceled` | `inactive`
Access logic: user has access if `subscription_status = 'active'` OR `trial_end > now()`

## Design System

- Coral: `#ed7c5a` (primary buttons, CTAs)
- Teal: `#55b6ca` (secondary actions)
- Cream bg: `#f5f1e9` | Text: `#1c1c1c`
- Font: Nunito (extrabold headings)
- Rounded corners, playful but not chaotic
- Large touch targets (parents use tablets/phones with kids)
- Newsletter component always mounted — visible on `/` and `/tips` only

## Conventions

- Server components by default — `'use client'` only for interactivity
- API routes are thin — business logic lives in `lib/`
- `@/` path alias for all imports
- kebab-case filenames
- No `any` types — define proper TypeScript interfaces

## Consulting Recommendation Database

### Resources Table (Supabase)
283+ resources in `public.resources`. Key fields:
- `name`, `url`, `description`, `price_range`
- `subjects[]`, `grade_levels[]`, `learning_styles[]`, `good_for[]`
- `match_tags[]` — ALL tags go here: structural tags + topic/keyword tags
- `religious_pref`: `secular` | `christian` | `christian_lite` | `neutral`
- `approved`: always `true` on insert
- `category`: always `''` on insert (NOT NULL)

### match_tags Strategy
`match_tags` holds BOTH structural tags (subjects, grade levels, features) AND topic/keyword tags (e.g. `dinosaurs`, `ancient_egypt`, `baking`, `origami`). This lets Mel search by any keyword. Add rich topic tags every time a resource is inserted.

### Intake Form → Tag Mappings (Q16 + Q17)
Full mapping in memory file `project_consulting_tags.md`. Summary:
- Q16 Math topics → tags like `math`, `algebra`, `geometry`, `calculus`, `pre_algebra`, `statistics`, `personal_finance`
- Q16 Science topics → `life_science`, `earth_science`, `astronomy`, `biology`, `chemistry`, `physics`, `marine_biology`, etc.
- Q16 History/SS → `us_history`, `world_history`, `civics`, `economics`, `map_skills`, `geography`, etc.
- Q16 ELA → `phonics`, `reading`, `spelling`, `handwriting`, `grammar`, `writing`, `literature`, `vocabulary`, etc.
- Q16 Foreign Language → `spanish`, `french`, `latin`, `mandarin`, `japanese`, `asl`, etc.
- Q17 Skills → `gross_motor`, `fine_motor`, `memory`, `critical_thinking`, `focus`, `adhd`, `visual_spatial`, `logic`, `problem_solving`, `processing_speed`

### Write-in Keyword Scanning (to build)
Recommendation engine should extract keywords from write-in fields (`intenseInterests`, `lovesOther`, `primaryGoal`, `parentNotes`, topic Others) and match against `match_tags`.

### Inserting Resources
```bash
SUPA_URL="https://vbeieznywomwthngenyt.supabase.co/rest/v1/resources"
SUPA_KEY="[service_role_key from .env.local]"
curl -s -X POST "$SUPA_URL" \
  -H "apikey: $SUPA_KEY" -H "Authorization: Bearer $SUPA_KEY" \
  -H "Content-Type: application/json" -H "Prefer: return=representation" \
  -d '{...}' | jq '{id: .[0].id, name: .[0].name}'
```
**Always research every resource before inserting — even if you have prior knowledge.**

## Resources Database (Supabase `resources` table)

**Current count:** ~375 resources (as of 2026-04-03)

### Schema — CRITICAL insert requirements
- `category` column is NOT NULL — always include `"category": ""` (empty string)
- `requires_screen` — always include, default `"no"`
- `approved` — always include, default `true`
- Valid `resource_type` enum values: `app`, `board_game`, `book`, `curriculum`, `online_classes`, `online_game`, `online_lessons`, `online_school`, `subscription_box`, `toy`, `unit_study`, `video`, `website`, `workbook`
- "activity_kit" and "game" are NOT valid — map to `subscription_box` or `toy`/`board_game`
- For URL query strings with spaces: use `urllib.parse.quote("text", safe='')` before embedding

### Insert function pattern (Python, no external libs)
```python
import urllib.request, json

SUPABASE_URL = "https://vbeieznywomwthngenyt.supabase.co"
SERVICE_KEY = "<service_role_key>"

def insert(r):
    r.setdefault("category", "")
    r.setdefault("requires_screen", "no")
    r.setdefault("approved", True)
    body = json.dumps(r).encode()
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/resources", data=body, method='POST',
        headers={"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}",
                 "Content-Type": "application/json", "Prefer": "return=minimal"})
    with urllib.request.urlopen(req) as resp: return resp.status
```

### match_tags — how they work
All tags live in `match_tags[]` array — structural (grade levels, subjects) AND topic keywords all in the same array.
Standard grade tags: `preschool`, `early_elementary`, `elementary`, `middle`, `high_school`
Grade-level sync and subject sub-topic sync were completed 2026-04-03 (254 + 137 resources updated).

### Denison Math — single entry covers all levels
One "Denison Math" resource covers grades 7–12 with tags: `math`, `pre_algebra`, `algebra`, `middle`, `high_school`.
Do NOT add separate Denison Pre-Algebra or Denison Algebra entries.

### Research before insert — always
Every resource must be researched via agent/web before inserting. Verify URLs point to correct product pages (not blog posts, not UK stores for US sites).
