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
  { title: 'Planets Puzzle – Easy', thumb: '/thumb-puzzle-easy.png', url: 'https://view.genially.com/699b8c77ce57456e07ab6ec6', types: ['puzzle'] },
  { title: 'Planets Puzzle – Medium', thumb: '/thumb-puzzle-medium.png', url: 'https://view.genially.com/69a5d5b1282f9454912a042b', types: ['puzzle'] },
  { title: 'Planets Puzzle – Hard', thumb: '/thumb-puzzle-hard.png', url: 'https://view.genially.com/69a5df176426fe803ea50975', types: ['puzzle'] },
  { title: 'Planets Puzzle – Very Hard', thumb: '/thumb-puzzle-vhard.png', url: 'https://view.genially.com/69a5df422695874f19c26146', types: ['puzzle'] },
  { title: 'Dwarf Planets Word Search', thumb: '/thumb-word-search.png', url: 'https://view.genially.com/69a8a17cf434d87dab6ea745', types: ['word-search'] },
  { title: 'Find the Pair – Inner Planets', thumb: '/thumb-find-pair-inner.png', url: 'https://view.genially.com/69aa4a75a347d5c7ec89f688', types: ['matching'] },
  { title: 'Find the Pair – Outer Planets', thumb: '/thumb-find-pair-outer.png', url: 'https://view.genially.com/69aa4d04ff9600b3345ea524', types: ['matching'] },
  { title: 'Find the Pair – The Planets', thumb: '/thumb-find-pair-planets.png', url: 'https://view.genially.com/69aa4e62910b799784be2a4c', types: ['matching'] },
  { title: 'Word Sort – Planet Types', thumb: '/thumb-word-sort.png', url: 'https://view.genially.com/69aa439aa347d5c7ec863318', types: ['word-sort'] },
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
          {[
            allGames.find(g => g.title === 'Solar System Sizzle')!,
            allGames.find(g => g.title === 'Mission to Mars')!,
            allGames.find(g => g.title === 'Find the Pair – The Planets')!,
          ].map(game => (
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
