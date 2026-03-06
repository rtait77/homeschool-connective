# Homeschool Connective — Claude Code Context

**Read this entire file before doing anything.** This is your project blueprint. All architectural decisions have been made. Your job is to execute, not to deliberate on stack choices.

## What This Is

**Homeschool Connective** is an interactive, game-based learning platform for homeschoolers and educators. The site hosts educational browser games (drag-and-drop activities, jigsaw puzzles, ordering games, etc.) organized by topic (solar system, marine biology, etc.), along with video walkthroughs and demos.

**Business model:** Some games are free. A monthly subscription unlocks access to all games and video content.

**Current state:** The site exists on Squarespace with games built in Genially (embedded via iframe). We are rebuilding it as a Next.js application to have full programmatic control.

## The Stack (these decisions are final)

| Layer | Tool | Purpose |
|-------|------|---------|
| Framework | **Next.js 14+ (App Router)** | Full-stack React framework |
| Language | **TypeScript** | All code is TypeScript, no plain JS |
| Auth | **Supabase Auth** | Email/password signup, session management |
| Database | **Supabase Postgres** | Users, games catalog, subscription status, progress |
| Payments | **Stripe** (Checkout + Customer Portal + Webhooks) | Free + paid subscription tiers |
| Video | **Cloudflare Stream** | Upload, transcode, adaptive streaming, signed URLs |
| Styling | **Tailwind CSS** | Utility-first CSS |
| Hosting | **Vercel** | Deployment, auto-deploy from git |
| Games | **Genially embeds** (phase 1), custom React components (later) | Interactive educational games |

**Do not suggest alternative tools.** Do not recommend Prisma instead of Drizzle, Auth0 instead of Supabase, Mux instead of Cloudflare Stream, etc. The stack is chosen. Build with it.

## Project Structure

```
homeschool-connective/
├── app/
│   ├── layout.tsx                  # Root layout (nav, footer, auth provider)
│   ├── page.tsx                    # Homepage
│   ├── games/
│   │   ├── page.tsx                # Games browse/catalog page
│   │   └── [slug]/
│   │       └── page.tsx            # Individual game page (embed + video)
│   ├── topics/
│   │   ├── page.tsx                # Topics overview
│   │   └── [slug]/
│   │       └── page.tsx            # Topic page (filtered games)
│   ├── blog/
│   │   ├── page.tsx                # Blog listing
│   │   └── [slug]/
│   │       └── page.tsx            # Blog post
│   ├── about/
│   │   └── page.tsx                # About page
│   ├── pricing/
│   │   └── page.tsx                # Pricing / subscribe page
│   ├── account/
│   │   ├── page.tsx                # User dashboard (my games, subscription status)
│   │   └── manage/
│   │       └── page.tsx            # Redirects to Stripe Customer Portal
│   ├── auth/
│   │   ├── login/page.tsx          # Login page
│   │   ├── signup/page.tsx         # Signup page
│   │   └── callback/route.ts      # Supabase auth callback
│   └── api/
│       ├── webhooks/
│       │   └── stripe/route.ts     # Stripe webhook handler
│       └── video/
│           └── sign/route.ts       # Generate signed Cloudflare Stream URLs
├── components/
│   ├── layout/
│   │   ├── navbar.tsx              # Site navigation
│   │   └── footer.tsx              # Site footer
│   ├── games/
│   │   ├── game-card.tsx           # Game preview card
│   │   ├── game-embed.tsx          # Genially iframe embed wrapper
│   │   └── lock-overlay.tsx        # "Subscribe to play" overlay for premium games
│   ├── video/
│   │   └── video-player.tsx        # Cloudflare Stream player component
│   ├── auth/
│   │   └── auth-provider.tsx       # Supabase auth context provider
│   └── ui/                         # Shared UI components (buttons, cards, etc.)
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser Supabase client
│   │   ├── server.ts               # Server-side Supabase client
│   │   └── middleware.ts           # Auth middleware (refreshes session)
│   ├── stripe/
│   │   ├── client.ts               # Stripe client instance
│   │   ├── checkout.ts             # Create checkout session
│   │   └── webhooks.ts             # Webhook event handlers
│   ├── video/
│   │   └── cloudflare.ts           # Cloudflare Stream API helpers
│   └── db/
│       ├── schema.sql              # Database schema (run in Supabase SQL editor)
│       └── queries.ts              # Database query functions
├── public/
│   └── images/                     # Static images
├── middleware.ts                    # Next.js middleware (auth session refresh)
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Database Schema

Run this in the Supabase SQL Editor to create the tables:

```sql
-- Users table is managed by Supabase Auth (auth.users)
-- This table extends it with app-specific data

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_url text,
  stripe_customer_id text unique,
  subscription_status text default 'free' check (subscription_status in ('free', 'active', 'canceled', 'past_due')),
  subscription_tier text default 'free' check (subscription_tier in ('free', 'monthly', 'annual')),
  subscription_current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Games catalog
create table public.games (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  description text,
  topic text not null,                    -- e.g., 'solar-system', 'marine-biology'
  difficulty text check (difficulty in ('easy', 'medium', 'hard', 'very-hard')),
  game_type text check (game_type in ('full', 'mini')),
  is_premium boolean default false,       -- false = free, true = subscribers only
  genially_embed_url text,                -- Genially embed URL (phase 1)
  thumbnail_url text,
  video_id text,                          -- Cloudflare Stream video ID (walkthrough)
  sort_order integer default 0,
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Anyone can view published games (metadata), but playing is gated in the UI
alter table public.games enable row level security;

create policy "Anyone can view published games"
  on public.games for select
  using (published = true);

-- Topics
create table public.topics (
  slug text primary key,
  title text not null,
  description text,
  thumbnail_url text,
  sort_order integer default 0
);

alter table public.topics enable row level security;

create policy "Anyone can view topics"
  on public.topics for select
  using (true);

-- Optional: track which games a user has played
create table public.game_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  game_id uuid references public.games(id) on delete cascade not null,
  played_at timestamptz default now(),
  unique(user_id, game_id)
);

alter table public.game_progress enable row level security;

create policy "Users can view own progress"
  on public.game_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.game_progress for insert
  with check (auth.uid() = user_id);
```

## How Auth Works

Use `@supabase/ssr` for Next.js App Router integration. Follow the official Supabase guide for Next.js.

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options))
        },
      },
    }
  )
}
```

```typescript
// middleware.ts — refresh auth session on every request
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options))
        },
      },
    }
  )
  await supabase.auth.getUser()
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

## How Subscriptions Work

**Stripe products to create (in Stripe Dashboard):**
- Product: "Homeschool Connective All Access"
  - Price 1: Monthly ($X/month, recurring)
  - Price 2: Annual ($X/year, recurring)

**Flow:**
1. User clicks "Subscribe" on pricing page
2. Server creates a Stripe Checkout Session (creates Stripe Customer if needed, stores `stripe_customer_id` in profiles)
3. User completes payment on Stripe-hosted checkout page
4. Stripe sends `checkout.session.completed` webhook
5. Webhook handler updates `profiles.subscription_status` to `'active'`
6. For managing/canceling: redirect to Stripe Customer Portal (Stripe hosts this too)

**Webhook events to handle:**
- `checkout.session.completed` → set subscription active
- `customer.subscription.updated` → sync status changes
- `customer.subscription.deleted` → set status to canceled
- `invoice.payment_failed` → set status to past_due

```typescript
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Use service role key for webhook (no user session)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
      await supabase.from('profiles').update({
        stripe_customer_id: session.customer as string,
        subscription_status: 'active',
        subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      }).eq('id', session.metadata!.user_id)
      break
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      await supabase.from('profiles').update({
        subscription_status: subscription.status === 'active' ? 'active' : subscription.status,
        subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      }).eq('stripe_customer_id', subscription.customer as string)
      break
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await supabase.from('profiles').update({
        subscription_status: 'canceled',
      }).eq('stripe_customer_id', subscription.customer as string)
      break
    }
  }

  return new Response('OK', { status: 200 })
}
```

## How Video Works

**Cloudflare Stream** handles video hosting, transcoding, and delivery. Videos are walkthrough/demo content paired with games.

**Setup:** Create a Cloudflare account, enable Stream ($5/mo base). Get your Account ID and API Token from the dashboard.

**Uploading videos:** Use the Cloudflare Stream dashboard to upload, or the API:
```typescript
// lib/video/cloudflare.ts
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!
const CF_API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN!

// For signed URLs (gate video behind subscription)
const CF_SIGNING_KEY_ID = process.env.CLOUDFLARE_STREAM_SIGNING_KEY_ID!
const CF_SIGNING_KEY_JWK = process.env.CLOUDFLARE_STREAM_SIGNING_KEY_JWK!
```

**Playing videos:** Use the Cloudflare Stream embed player. For premium content, generate signed URLs server-side (only for authenticated subscribers).

```typescript
// components/video/video-player.tsx
'use client'

export function VideoPlayer({ videoId, signedToken }: { videoId: string; signedToken?: string }) {
  const src = signedToken
    ? `https://customer-${process.env.NEXT_PUBLIC_CF_CUSTOMER_CODE}.cloudflarestream.com/${signedToken}/iframe`
    : `https://customer-${process.env.NEXT_PUBLIC_CF_CUSTOMER_CODE}.cloudflarestream.com/${videoId}/iframe`

  return (
    <div className="aspect-video w-full">
      <iframe
        src={src}
        className="w-full h-full rounded-lg"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
```

## How Games Are Embedded

Phase 1: Genially games are embedded via iframe. The `genially_embed_url` field in the games table holds the URL.

```typescript
// components/games/game-embed.tsx
'use client'

export function GameEmbed({ embedUrl, title }: { embedUrl: string; title: string }) {
  return (
    <div className="aspect-video w-full">
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full rounded-lg border-0"
        allowFullScreen
      />
    </div>
  )
}
```

**Gating premium games:** The game page checks the user's subscription status. If the game is premium and the user isn't subscribed, show the lock overlay instead of the embed.

```typescript
// app/games/[slug]/page.tsx (simplified logic)
const game = await getGameBySlug(slug)
const user = await getUser()
const profile = user ? await getProfile(user.id) : null
const hasAccess = !game.is_premium || profile?.subscription_status === 'active'

// If hasAccess, render GameEmbed. Otherwise, render LockOverlay with subscribe CTA.
```

## How Content Is Managed

**Phase 1: Database seeding.** Games and topics are managed by inserting/updating rows directly in Supabase. Use a seed script or the Supabase table editor.

**Phase 2 (later):** Build a simple admin page at `/admin` (protected by checking if the user's email matches an admin list) to add/edit games, upload thumbnails, and manage the catalog.

**Blog posts:** For the blog, use MDX files in the repo (file-based content). This keeps content in git and is easy to manage with Claude Code.

```
content/
  blog/
    homeschooling-101.mdx
    gameschooling-tips.mdx
```

## Environment Variables

Create a `.env.local` file with these values. **Never commit this file.**

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_ANNUAL_PRICE_ID=price_...

# Cloudflare Stream
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_STREAM_API_TOKEN=your-api-token
CLOUDFLARE_STREAM_SIGNING_KEY_ID=your-key-id
CLOUDFLARE_STREAM_SIGNING_KEY_JWK=your-jwk
NEXT_PUBLIC_CF_CUSTOMER_CODE=your-customer-code
```

## Design System

The current site uses these brand colors. Maintain them:

- **Primary (coral/salmon):** `#E8734A` (buttons, CTAs, accents)
- **Secondary (teal):** `#2A9D8F` (links, secondary actions)
- **Background:** White (`#FFFFFF`)
- **Text:** Dark gray (`#333333`)
- **Footer:** Dark (`#2D2D2D`)

The site targets kids and parents. Keep the design:
- Playful but not chaotic
- Large touch targets (parents use tablets/phones with kids)
- Rounded corners on cards and buttons
- Generous whitespace
- Clear visual hierarchy between free and premium content

Use the existing logo and mascot assets from the current site.

## Implementation Phases

### Phase 1: Foundation (do this first)
1. Initialize Next.js project with TypeScript + Tailwind
2. Set up Supabase project and run the schema SQL
3. Implement auth (signup, login, logout, middleware)
4. Build the layout (navbar with auth state, footer)
5. Build the homepage (hero, featured games grid, newsletter signup)
6. Build the games catalog page (grid of game cards)
7. Build individual game pages with Genially embeds
8. Build the topics page and topic filter pages

### Phase 2: Subscriptions
1. Set up Stripe products and prices
2. Build the pricing page
3. Implement Stripe Checkout flow (create session, redirect)
4. Implement the Stripe webhook handler
5. Build the account/dashboard page (subscription status)
6. Add Stripe Customer Portal redirect for managing subscriptions
7. Implement the lock overlay for premium games
8. Test the full subscribe/cancel/resubscribe flow

### Phase 3: Video
1. Set up Cloudflare Stream account
2. Upload walkthrough videos via dashboard
3. Store video IDs in the games table
4. Build the video player component
5. Implement signed URLs for premium video content
6. Add video sections to game pages

### Phase 4: Content & Polish
1. Set up MDX blog
2. Migrate blog posts from Squarespace
3. Build the about page
4. Add SEO metadata (title, description, og:image per page)
5. Add newsletter signup (keep Sender.net or switch to a simple solution)
6. Mobile responsive testing and fixes
7. Performance optimization (image optimization, lazy loading)

### Phase 5: Admin (when ready)
1. Simple admin page to manage games (add/edit/delete/reorder)
2. Video upload from admin
3. Analytics dashboard (subscriber count, popular games)

## Conventions

- **All components are functional components** using hooks. No class components.
- **Server components by default.** Only add `'use client'` when you need interactivity (clicks, forms, state).
- **Keep API routes thin.** Business logic goes in `lib/`, routes just wire up request/response.
- **Error handling:** Show user-friendly error messages. Log details server-side. Never swallow errors silently.
- **File naming:** kebab-case for all files (`game-card.tsx`, not `GameCard.tsx`).
- **Imports:** Use `@/` path alias for absolute imports (`import { createClient } from '@/lib/supabase/server'`).
- **No `any` types.** Define proper TypeScript interfaces for all data shapes.

## Key Commands

```bash
# Development
npm run dev                    # Start dev server on localhost:3000

# Build (run before committing to catch errors)
npm run build

# Type check
npx tsc --noEmit

# Install a package
npm install <package-name>

# Stripe CLI (for testing webhooks locally)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Accounts to Set Up

Before starting, create accounts and get credentials for:

1. **Supabase** (supabase.com) — create a new project, get URL + anon key + service role key
2. **Stripe** (stripe.com) — create account, get test keys, create products/prices
3. **Cloudflare** (cloudflare.com) — create account, enable Stream, get API credentials
4. **Vercel** (vercel.com) — connect to GitHub repo for deployment

Use **test mode** for Stripe during development (test keys start with `sk_test_` and `pk_test_`).
