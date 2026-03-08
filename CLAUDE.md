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

**Context discipline:** Always read CLAUDE.md and memory before starting work. Never suggest tools or services that are already in the stack (e.g. Sender.net is the email provider — already integrated, do not suggest alternatives). If unsure whether something exists, check the codebase first.

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
| Email | Sender.net (newsletter + trial reminders) |

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
/api/webhook      — Stripe webhook (subscription.created/updated/deleted)
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
