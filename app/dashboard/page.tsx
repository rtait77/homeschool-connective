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
        .select('trial_end, subscription_status')
        .eq('id', user.id)
        .single()

      setStatus(profile?.subscription_status ?? '')
      setTrialEnd(profile?.trial_end ? new Date(profile.trial_end) : null)

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

      {/* All Games */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold">All Games & Lessons</h2>
          <Link href="/learn" className="text-sm font-bold text-[#238FA4] hover:underline">Browse with filters →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allGames.map(game => (
            <FavoriteCard key={game.title} game={game} isFavorited={favorites.includes(game.title)} onToggleFavorite={() => toggleFavorite(game.title)} />
          ))}
        </div>
      </div>

    </div>
  )
}

function FavoriteCard({ game, isFavorited, onToggleFavorite }: { game: Game, isFavorited: boolean, onToggleFavorite: () => void }) {
  return (
    <div className="bg-white rounded-[14px] overflow-hidden flex flex-col" style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
      <div className="relative h-44 w-full bg-[#e8e4dc]">
        <Image src={game.thumb} alt={game.title} fill className="object-cover" />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="font-extrabold text-base mb-4 flex-1">{game.title}</p>
        <div className="flex gap-2">
          <a href={game.url} target="_blank" rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center font-bold text-sm px-4 py-2.5 rounded-lg bg-[#ed7c5a] text-white border-2 border-[#ed7c5a] hover:bg-white hover:text-[#ed7c5a] transition-all">
            {game.types.includes('lesson') ? '▶ Start Lesson' : '▶ Play Now'}
          </a>
          <button onClick={onToggleFavorite}
            className={`px-3 py-2.5 rounded-lg border-2 transition-all text-base ${isFavorited ? 'border-[#ed7c5a] text-[#ed7c5a] bg-[#fff5f2]' : 'border-[#ddd8cc] text-[#5c5c5c] hover:border-[#ed7c5a] hover:text-[#ed7c5a]'}`}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}>
            {isFavorited ? '♥' : '♡'}
          </button>
        </div>
      </div>
    </div>
  )
}
