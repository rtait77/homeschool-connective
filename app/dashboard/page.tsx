'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

type Game = {
  title: string
  thumb: string
  url: string
  types: string[]
}

const allGames: Game[] = [
  { title: 'Solar System Sizzle', thumb: '/thumb-sss.png', url: 'https://view.genially.com/68b468a36df9dbd6433fe511', types: [] },
  { title: 'Ordering the Planets', thumb: '/ordering-the-planets-thumbnail.png', url: 'https://view.genially.com/68164fbb7306f160f7843510', types: [] },
  { title: 'The Sun Puzzle – Easy', thumb: '/thumb-sun-easy.png', url: '/puzzle-sun-shape-easy.html', types: ['puzzle'] },
  { title: 'The Sun Puzzle – Medium', thumb: '/the-sun-with-background.png', url: '/puzzle-sun-medium.html', types: ['puzzle'] },
  { title: 'The Sun Puzzle – Hard', thumb: '/the-sun-with-background.png', url: '/puzzle-sun-hard.html', types: ['puzzle'] },
  { title: 'Mercury Puzzle – Easy', thumb: '/mercury-with-background.png', url: '/puzzle-mercury-easy.html', types: ['puzzle'] },
  { title: 'Mercury Puzzle – Medium', thumb: '/mercury-with-background.png', url: '/puzzle-mercury-medium.html', types: ['puzzle'] },
  { title: 'Mercury Puzzle – Hard', thumb: '/mercury-with-background.png', url: '/puzzle-mercury-hard.html', types: ['puzzle'] },
  { title: 'Venus Puzzle – Easy', thumb: '/venus-with-background.png', url: '/puzzle-venus-easy.html', types: ['puzzle'] },
  { title: 'Venus Puzzle – Medium', thumb: '/venus-with-background.png', url: '/puzzle-venus-medium.html', types: ['puzzle'] },
  { title: 'Venus Puzzle – Hard', thumb: '/venus-with-background.png', url: '/puzzle-venus-hard.html', types: ['puzzle'] },
  { title: 'Earth Puzzle – Easy', thumb: '/earth-with-background.png', url: '/puzzle-earth-easy.html', types: ['puzzle'] },
  { title: 'Earth Puzzle – Medium', thumb: '/earth-with-background.png', url: '/puzzle-earth-medium.html', types: ['puzzle'] },
  { title: 'Earth Puzzle – Hard', thumb: '/earth-with-background.png', url: '/puzzle-earth-hard.html', types: ['puzzle'] },
  { title: 'The Moon Puzzle – Easy', thumb: '/moon-with-background.png', url: '/puzzle-moon-easy.html', types: ['puzzle'] },
  { title: 'The Moon Puzzle – Medium', thumb: '/moon-with-background.png', url: '/puzzle-moon-medium.html', types: ['puzzle'] },
  { title: 'The Moon Puzzle – Hard', thumb: '/moon-with-background.png', url: '/puzzle-moon-hard.html', types: ['puzzle'] },
  { title: 'Mars Puzzle – Easy', thumb: '/mars-with-background.png', url: '/puzzle-mars-easy.html', types: ['puzzle'] },
  { title: 'Mars Puzzle – Medium', thumb: '/mars-with-background.png', url: '/puzzle-mars-medium.html', types: ['puzzle'] },
  { title: 'Mars Puzzle – Hard', thumb: '/mars-with-background.png', url: '/puzzle-mars-hard.html', types: ['puzzle'] },
  { title: 'Vesta Puzzle – Easy', thumb: '/vesta-with-background.png', url: '/puzzle-vesta-easy.html', types: ['puzzle'] },
  { title: 'Vesta Puzzle – Medium', thumb: '/vesta-with-background.png', url: '/puzzle-vesta-medium.html', types: ['puzzle'] },
  { title: 'Vesta Puzzle – Hard', thumb: '/vesta-with-background.png', url: '/puzzle-vesta-hard.html', types: ['puzzle'] },
  { title: 'Jupiter Puzzle – Easy', thumb: '/jupiter-with-background.png', url: '/puzzle-jupiter-easy.html', types: ['puzzle'] },
  { title: 'Jupiter Puzzle – Medium', thumb: '/jupiter-with-background.png', url: '/puzzle-jupiter-medium.html', types: ['puzzle'] },
  { title: 'Jupiter Puzzle – Hard', thumb: '/jupiter-with-background.png', url: '/puzzle-jupiter-hard.html', types: ['puzzle'] },
  { title: 'Saturn Puzzle – Easy', thumb: '/saturn-with-background.png', url: '/puzzle-saturn-easy.html', types: ['puzzle'] },
  { title: 'Saturn Puzzle – Medium', thumb: '/saturn-with-background.png', url: '/puzzle-saturn-medium.html', types: ['puzzle'] },
  { title: 'Saturn Puzzle – Hard', thumb: '/saturn-with-background.png', url: '/puzzle-saturn-hard.html', types: ['puzzle'] },
  { title: 'Uranus Puzzle – Easy', thumb: '/uranus-with-background.png', url: '/puzzle-uranus-easy.html', types: ['puzzle'] },
  { title: 'Uranus Puzzle – Medium', thumb: '/uranus-with-background.png', url: '/puzzle-uranus-medium.html', types: ['puzzle'] },
  { title: 'Uranus Puzzle – Hard', thumb: '/uranus-with-background.png', url: '/puzzle-uranus-hard.html', types: ['puzzle'] },
  { title: 'Neptune Puzzle – Easy', thumb: '/neptune-with-background.png', url: '/puzzle-neptune-easy.html', types: ['puzzle'] },
  { title: 'Neptune Puzzle – Medium', thumb: '/neptune-with-background.png', url: '/puzzle-neptune-medium.html', types: ['puzzle'] },
  { title: 'Neptune Puzzle – Hard', thumb: '/neptune-with-background.png', url: '/puzzle-neptune-hard.html', types: ['puzzle'] },
  { title: 'Arrokoth Puzzle – Easy', thumb: '/arrokoth-with-background.png', url: '/puzzle-arrokoth-easy.html', types: ['puzzle'] },
  { title: 'Arrokoth Puzzle – Medium', thumb: '/arrokoth-with-background.png', url: '/puzzle-arrokoth-medium.html', types: ['puzzle'] },
  { title: 'Arrokoth Puzzle – Hard', thumb: '/arrokoth-with-background.png', url: '/puzzle-arrokoth-hard.html', types: ['puzzle'] },
  { title: 'Find a Pair – Inner Planets', thumb: '/thumb-find-pair-inner.png', url: '/matching-inner-planets.html', types: ['matching'] },
  { title: 'Find a Pair – Outer Planets', thumb: '/thumb-find-pair-outer.png', url: '/matching-outer-planets.html', types: ['matching'] },
  { title: 'Find a Pair – Dwarf Planets', thumb: '/dwarf-planets-matching-game-thumbnail.png', url: '/matching-dwarf-planets.html', types: ['matching'] },
  { title: 'Word Sort – Planet Types', thumb: '/word-sort-planet-types-thumbnail.png', url: '/word-sort-planet-types.html', types: ['word-sort'] },
  { title: 'Word Sort – Has Moons vs No Moons', thumb: '/word-sort-moons-no-moons-thumbnail.png', url: '/word-sort-moons.html', types: ['word-sort'] },
  { title: 'Word Sort – Has Rings vs No Rings', thumb: '/word-sort-rings-no-rings-thumbnail.png', url: '/word-sort-rings.html', types: ['word-sort'] },
  { title: 'Word Sort – Has Atmosphere vs No Atmosphere', thumb: '/word-sort-atmosphere-no-atmosphere-thumbnail.png', url: '/word-sort-atmosphere.html', types: ['word-sort'] },
  { title: 'Word Sort – Jupiter/Saturn Moons', thumb: '/word-sort-jupiter-saturn-moons-thumbnail.png', url: '/word-sort-jupiter-saturn-moons.html', types: ['word-sort'] },
  { title: 'Word Search – The Planets', thumb: '/planets-word-search-thumbnail.png', url: '/word-search-planets.html', types: ['word-search'] },
  { title: 'Word Search – Dwarf Planets', thumb: '/word-search-dwarf-planets-thumbnail.png', url: '/word-search-dwarf-planets.html', types: ['word-search'] },
  { title: 'Word Search – The Inner Solar System', thumb: '/word-search-inner-solar-system-thumbnail.png', url: '/word-search-inner-solar-system.html', types: ['word-search'] },
  { title: 'Mission to Mars', thumb: '/thumb-lesson-mars.png', url: 'https://view.genially.com/699e69be43a96797318311da', types: ['lesson'] },
]

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [trialEnd, setTrialEnd] = useState<Date | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [billingLoading, setBillingLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [hasStripe, setHasStripe] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setEmail(user.email ?? '')

      const { data: profile } = await supabase
        .from('profiles')
        .select('trial_end, subscription_status, stripe_customer_id')
        .eq('id', user.id)
        .single()

      setStatus(profile?.subscription_status ?? '')
      setTrialEnd(profile?.trial_end ? new Date(profile.trial_end) : null)
      setHasStripe(!!profile?.stripe_customer_id)

      const { data: favData } = await supabase
        .from('favorites')
        .select('game_title')
        .eq('user_id', user.id)

      setFavorites(favData?.map(f => f.game_title) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function toggleFavorite(title: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (favorites.includes(title)) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('game_title', title)
      setFavorites(prev => prev.filter(f => f !== title))
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, game_title: title })
      setFavorites(prev => [...prev, title])
    }
  }

  async function openBillingPortal() {
    setBillingLoading(true)
    const res = await fetch('/api/billing-portal', { method: 'POST' })
    const { url, error } = await res.json()
    if (url) window.location.href = url
    else { alert(error || 'Could not open billing portal.'); setBillingLoading(false) }
  }

  async function deleteAccount() {
    setDeleteLoading(true)
    const res = await fetch('/api/delete-account', { method: 'POST' })
    if (res.ok) {
      await supabase.auth.signOut()
      router.push('/')
    } else {
      alert('Something went wrong. Please contact support@homeschoolconnective.com.')
      setDeleteLoading(false)
    }
  }

  if (loading) return <div className="max-w-[1100px] mx-auto px-6 py-14 text-[#5c5c5c]">Loading...</div>

  const firstName = email.split('@')[0]
  const favoriteGames = allGames.filter(g => favorites.includes(g.title))

  const daysLeft = trialEnd ? Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
  const isTrialing = status === 'trialing' && daysLeft && daysLeft > 0
  const isActive = status === 'active'

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-14">

      {/* Welcome */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold mb-2">Welcome back, {firstName}!</h1>
        <div className="flex items-center gap-3 flex-wrap">
          {isActive && (
            <span className="text-sm font-bold bg-[#55b6ca] text-white px-3 py-1 rounded-full">Active Subscriber</span>
          )}
          {isTrialing && (
            <span className="text-sm font-bold bg-[#f5f1e9] text-[#ed7c5a] border border-[#ed7c5a] px-3 py-1 rounded-full">
              {daysLeft} day{daysLeft === 1 ? '' : 's'} left in trial
            </span>
          )}
          {isTrialing && (
            <Link href="/pricing" className="text-sm font-bold text-[#238FA4] hover:underline">
              Subscribe to keep access →
            </Link>
          )}
        </div>
      </div>

      {/* Favorites */}
      <div className="mb-12">
        <h2 className="text-xl font-extrabold mb-4">⭐ Your Favorites</h2>
        {favoriteGames.length === 0 ? (
          <div className="bg-[#f5f1e9] rounded-2xl p-8 text-center">
            <p className="text-[#5c5c5c] text-sm mb-4">You haven't saved any favorites yet.</p>
            <Link href="/learn" className="inline-block bg-[#ed7c5a] text-white font-bold px-6 py-2.5 rounded-lg text-sm hover:opacity-90 transition">
              Browse Games & Lessons
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteGames.map(game => (
              <FavoriteCard key={game.title} game={game} isFavorited={true} onToggleFavorite={() => toggleFavorite(game.title)} />
            ))}
          </div>
        )}
      </div>

      {/* Your Account */}
      <div className="mb-12">
        <h2 className="text-xl font-extrabold mb-4">Your Account</h2>
        <div className="bg-white rounded-2xl p-6 border border-[#e2ddd5] flex flex-col gap-5" style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>

          {/* Account info */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs text-[#5c5c5c] font-bold uppercase tracking-wide mb-0.5">Email</p>
              <p className="font-semibold text-sm">{email}</p>
            </div>
            <div>
              <p className="text-xs text-[#5c5c5c] font-bold uppercase tracking-wide mb-0.5">Plan</p>
              {isActive && <span className="text-sm font-bold bg-[#55b6ca] text-white px-3 py-1 rounded-full">Active Subscriber</span>}
              {isTrialing && <span className="text-sm font-bold bg-[#f5f1e9] text-[#ed7c5a] border border-[#ed7c5a] px-3 py-1 rounded-full">{daysLeft} day{daysLeft === 1 ? '' : 's'} left in trial</span>}
              {!isActive && !isTrialing && <span className="text-sm text-[#5c5c5c]">No active plan</span>}
            </div>
          </div>

          <hr className="border-[#e2ddd5]" />

          {/* Billing portal */}
          {hasStripe ? (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-bold text-sm mb-0.5">Billing & Subscription</p>
                <p className="text-xs text-[#5c5c5c]">Update your payment method, view invoices, or cancel your subscription.</p>
              </div>
              <button
                onClick={openBillingPortal}
                disabled={billingLoading}
                className="text-sm font-bold px-5 py-2.5 rounded-lg border-2 border-[#55b6ca] text-[#55b6ca] hover:bg-[#55b6ca] hover:text-white transition disabled:opacity-50 whitespace-nowrap"
              >
                {billingLoading ? 'Loading...' : 'Manage Billing'}
              </button>
            </div>
          ) : isTrialing ? (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-bold text-sm mb-0.5">Subscribe</p>
                <p className="text-xs text-[#5c5c5c]">Keep access after your trial ends.</p>
              </div>
              <Link href="/pricing" className="text-sm font-bold px-5 py-2.5 rounded-lg border-2 border-[#ed7c5a] text-[#ed7c5a] hover:bg-[#ed7c5a] hover:text-white transition whitespace-nowrap">
                View Plans
              </Link>
            </div>
          ) : null}

          <hr className="border-[#e2ddd5]" />

          {/* Delete account */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-bold text-sm mb-0.5">Delete Account</p>
              <p className="text-xs text-[#5c5c5c]">Permanently delete your account and all your data. This cannot be undone.</p>
            </div>
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="text-sm font-bold px-5 py-2.5 rounded-lg border-2 border-[#ddd8cc] text-[#5c5c5c] hover:border-red-400 hover:text-red-500 transition whitespace-nowrap"
              >
                Delete Account
              </button>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs text-red-500 font-bold">Are you sure?</p>
                <button
                  onClick={deleteAccount}
                  disabled={deleteLoading}
                  className="text-sm font-bold px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, delete'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="text-sm font-bold px-4 py-2 rounded-lg border-2 border-[#ddd8cc] text-[#5c5c5c] hover:border-[#1c1c1c] transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* New Games */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold">New Games & Lessons</h2>
          <Link href="/learn" className="text-sm font-bold text-[#238FA4] hover:underline">Browse all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allGames.slice(-3).map(game => (
            <FavoriteCard key={game.title} game={game} isFavorited={favorites.includes(game.title)} onToggleFavorite={() => toggleFavorite(game.title)} />
          ))}
        </div>
      </div>

    </div>
  )
}

function FavoriteCard({ game, isFavorited, onToggleFavorite }: { game: Game, isFavorited: boolean, onToggleFavorite: () => void }) {
  const external = game.url.startsWith('http')
  return (
    <a
      href={game.url}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group bg-white rounded-[14px] overflow-hidden flex flex-col border border-[#e2ddd5] cursor-pointer transition-all hover:shadow-xl hover:-translate-y-0.5"
      style={{ boxShadow: '0 3px 18px rgba(0,0,0,0.11)' }}
    >
      <div className="relative h-44 w-full bg-[#e8e4dc]">
        <Image src={game.thumb} alt={game.title} fill className="object-cover" />
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleFavorite() }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-base transition-all ${
            isFavorited
              ? 'bg-[#ed7c5a] text-white'
              : 'bg-white/80 text-[#5c5c5c] hover:bg-[#ed7c5a] hover:text-white'
          }`}
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorited
            ? <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          }
        </button>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="font-extrabold text-base">{game.title}</p>
      </div>
    </a>
  )
}
