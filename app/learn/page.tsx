'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const games = [
  {
    title: 'Solar System Sizzle',
    desc: 'Learn three facts about each object in the solar system through themed drag-and-drop meals. First stop: Sunshine Soup!',
    thumb: '/thumb-sss.png',
    url: 'https://view.genially.com/68b468a36df9dbd6433fe511',
    topic: 'solar-system',
    mini: false,
    types: [],
  },
  {
    title: 'Ordering the Planets',
    desc: 'Click the planets in order from the Sun. Watch them line up one by one as you get each correct, then finish with a drag-and-drop challenge!',
    thumb: '/ordering-the-planets-thumbnail.png',
    url: 'https://view.genially.com/68164fbb7306f160f7843510',
    topic: 'solar-system',
    mini: false,
    types: [],
  },
  {
    title: 'Planets Puzzle – Easy',
    desc: 'Piece together the planets of the solar system in this beginner-friendly jigsaw puzzle.',
    thumb: '/thumb-puzzle-easy.png',
    url: 'https://view.genially.com/699b8c77ce57456e07ab6ec6',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
  },
  {
    title: 'Planets Puzzle – Medium',
    desc: 'A step up in difficulty — can you put all the planets together from memory?',
    thumb: '/thumb-puzzle-medium.png',
    url: 'https://view.genially.com/69a5d5b1282f9454912a042b',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
  },
  {
    title: 'Planets Puzzle – Hard',
    desc: 'Think you know the solar system? This harder jigsaw will put you to the test!',
    thumb: '/thumb-puzzle-hard.png',
    url: 'https://view.genially.com/69a5df176426fe803ea50975',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
  },
  {
    title: 'Planets Puzzle – Very Hard',
    desc: 'The ultimate planets jigsaw challenge. Only the most dedicated space explorers need apply!',
    thumb: '/thumb-puzzle-vhard.png',
    url: 'https://view.genially.com/69a5df422695874f19c26146',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
  },
  {
    title: 'The Sun Puzzle – Easy',
    desc: 'A fun circular jigsaw — put the Sun back together in 4 pieces. Perfect for little space explorers!',
    thumb: '/thumb-sun-circle-easy.png',
    url: '/puzzle-sun-circle-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'The Sun Puzzle – Easy (v2)',
    desc: 'Same puzzle, different piece style — the sun\'s own shape shows through the pieces. Which do you prefer?',
    thumb: '/thumb-sun-circle-easy.png',
    url: '/puzzle-sun-shape-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Dwarf Planets Word Search',
    desc: 'Hunt for the names of dwarf planets hidden in the grid. How many can you find?',
    thumb: '/thumb-word-search.png',
    url: 'https://view.genially.com/69a8a17cf434d87dab6ea745',
    topic: 'solar-system',
    mini: true,
    types: ['word-search'],
  },
  {
    title: 'Find the Pair – Inner Planets',
    desc: 'Match the inner planets to their clues in this fun memory-style matching game.',
    thumb: '/thumb-find-pair-inner.png',
    url: 'https://view.genially.com/69aa4a75a347d5c7ec89f688',
    topic: 'solar-system',
    mini: true,
    types: ['matching'],
  },
  {
    title: 'Find the Pair – Outer Planets',
    desc: 'Test your memory with the outer planets in this matching card game.',
    thumb: '/thumb-find-pair-outer.png',
    url: 'https://view.genially.com/69aa4d04ff9600b3345ea524',
    topic: 'solar-system',
    mini: true,
    types: ['matching'],
  },
  {
    title: 'Find the Pair – The Planets',
    desc: 'Match all the planets in this full solar system memory challenge.',
    thumb: '/thumb-find-pair-planets.png',
    url: 'https://view.genially.com/69aa4e62910b799784be2a4c',
    topic: 'solar-system',
    mini: true,
    types: ['matching'],
  },
  {
    title: 'Word Sort – Planet Types',
    desc: 'Sort the planets into the correct categories — can you tell your rocky planets from your gas giants?',
    thumb: '/thumb-word-sort.png',
    url: 'https://view.genially.com/69aa439aa347d5c7ec863318',
    topic: 'solar-system',
    mini: true,
    types: ['word-sort'],
  },
  {
    title: 'Mission to Mars',
    desc: 'Explore the Red Planet — learn about Mars, its moons, and the rovers that have explored it. Features voiceover narration, a gamified quiz, and a rover puzzle.',
    thumb: '/thumb-lesson-mars.png',
    url: 'https://view.genially.com/699e69be43a96797318311da',
    topic: 'solar-system',
    mini: false,
    types: ['lesson'],
  },
]

const topics = [
  { id: 'all', label: 'All Topics' },
  { id: 'solar-system', label: '🪐 Solar System' },
]

const typeFilters = [
  { id: 'lesson', label: 'Lessons' },
  { id: 'mini', label: 'Mini' },
  { id: 'puzzle', label: 'Puzzles' },
  { id: 'word-search', label: 'Word Search' },
  { id: 'matching', label: 'Matching' },
  { id: 'word-sort', label: 'Word Sort' },
]

export default function GamesPage() {
  const [topic, setTopic] = useState('all')
  const [topicOpen, setTopicOpen] = useState(false)
  const [activeTypes, setActiveTypes] = useState<string[]>([])
  const [hasAccess, setHasAccess] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setAuthChecked(true); return }

      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('trial_end, subscription_status')
        .eq('id', user.id)
        .single()

      const status = profile?.subscription_status
      const trialEnd = profile?.trial_end ? new Date(profile.trial_end) : null
      const trialActive = trialEnd && trialEnd > new Date()

      setHasAccess(status === 'active' || !!trialActive)
      setAuthChecked(true)

      const { data: favData } = await supabase
        .from('favorites')
        .select('game_title')
        .eq('user_id', user.id)
      setFavorites(favData?.map(f => f.game_title) ?? [])
    }
    checkAccess()
  }, [])

  async function toggleFavorite(title: string) {
    if (!userId) return
    if (favorites.includes(title)) {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('game_title', title)
      setFavorites(prev => prev.filter(f => f !== title))
    } else {
      await supabase.from('favorites').insert({ user_id: userId, game_title: title })
      setFavorites(prev => [...prev, title])
    }
  }

  function toggleType(id: string) {
    setActiveTypes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const filtered = games.filter(g => {
    const topicMatch = topic === 'all' || g.topic === topic
    if (!topicMatch) return false
    if (activeTypes.length === 0) return true
    if (activeTypes.includes('mini') && g.mini) return true
    return g.types.some(t => activeTypes.includes(t))
  })

  const fullGames = filtered.filter(g => !g.mini && !g.types.includes('lesson'))
  const miniGames = filtered.filter(g => g.mini)
  const lessons = filtered.filter(g => g.types.includes('lesson'))

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-14">
      <h1 className="text-3xl font-extrabold mb-2">Learn</h1>
      <p className="text-[#5c5c5c] mb-8">Browse our games and lessons. New content added regularly!</p>

      {/* Paywall banner */}
      {authChecked && !hasAccess && (
        <div className="bg-[#f5f1e9] border-2 border-[#ddd8cc] rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-extrabold text-lg mb-1">Start your free 7-day trial to access all games and lessons</p>
            <p className="text-sm text-[#5c5c5c]">No credit card required. Full access. Cancel anytime.</p>
          </div>
          <Link href="/signup" className="flex-shrink-0 bg-[#ed7c5a] text-white font-bold px-6 py-3 rounded-lg hover:opacity-90 transition whitespace-nowrap">
            Start 7 Day Free Trial
          </Link>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-10">

        {/* Topic dropdown */}
        <div className="relative">
          <button
            onClick={() => setTopicOpen(o => !o)}
            className="flex items-center gap-2 font-bold text-sm px-5 py-2 rounded-full border-2 border-[#ddd8cc] bg-white hover:border-[#55b6ca] transition-all"
          >
            {topics.find(t => t.id === topic)?.label}
            <span className="text-xs">▾</span>
          </button>
          {topicOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-[#ddd8cc] rounded-xl shadow-lg z-10 min-w-[180px]">
              {topics.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTopic(t.id); setTopicOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-[#f5f1e9] transition-colors first:rounded-t-xl last:rounded-b-xl ${topic === t.id ? 'text-[#55b6ca]' : ''}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <span className="text-[#ddd8cc] hidden sm:block">|</span>

        {/* Type filters */}
        {typeFilters.map(f => (
          <button
            key={f.id}
            onClick={() => toggleType(f.id)}
            className={`font-bold text-sm px-4 py-2 rounded-full border-2 transition-all ${
              activeTypes.includes(f.id)
                ? 'bg-[#55b6ca] border-[#55b6ca] text-white'
                : 'bg-white border-[#ddd8cc] text-[#1c1c1c] hover:border-[#55b6ca] hover:text-[#238FA4]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Full games */}
      {fullGames.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {fullGames.map(game => (
            <GameCard key={game.title} game={game} hasAccess={hasAccess} isFavorited={favorites.includes(game.title)} onToggleFavorite={() => toggleFavorite(game.title)} />
          ))}
        </div>
      )}

      {/* Mini games */}
      {miniGames.length > 0 && (
        <>
          {fullGames.length > 0 && (
            <p className="text-sm font-extrabold text-[#5c5c5c] uppercase tracking-widest mb-4">Mini Games</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {miniGames.map(game => (
              <GameCard key={game.title} game={game} hasAccess={hasAccess} isFavorited={favorites.includes(game.title)} onToggleFavorite={() => toggleFavorite(game.title)} />
            ))}
          </div>
        </>
      )}

      {/* Lessons */}
      {lessons.length > 0 && (
        <>
          {(fullGames.length > 0 || miniGames.length > 0) && (
            <p className="text-sm font-extrabold text-[#5c5c5c] uppercase tracking-widest mb-4 mt-10">Lessons</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map(game => (
              <GameCard key={game.title} game={game} hasAccess={hasAccess} isFavorited={favorites.includes(game.title)} onToggleFavorite={() => toggleFavorite(game.title)} />
            ))}
          </div>
        </>
      )}

      {filtered.length === 0 && (
        <p className="text-[#5c5c5c] text-sm py-12 text-center">No games match your filters. Try selecting different options!</p>
      )}

      {/* Coming Soon */}
      <div className="mt-12 bg-white rounded-[14px] p-8 text-center border-2 border-dashed border-[#ddd8cc]">
        <p className="text-2xl mb-2">🌊 🪸 🐠</p>
        <h2 className="text-lg font-extrabold mb-2">More Topics Coming Soon</h2>
        <p className="text-[#5c5c5c] text-sm">Ocean Animals and more are in the works. Subscribe to our newsletter to be the first to know!</p>
      </div>
    </div>
  )
}

function GameCard({ game, hasAccess, isFavorited, onToggleFavorite }: { game: typeof games[0], hasAccess: boolean, isFavorited: boolean, onToggleFavorite: () => void }) {
  return (
    <div className="bg-white rounded-[14px] overflow-hidden flex flex-col" style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
      <div className="relative h-44 w-full bg-[#e8e4dc]">
        <Image src={game.thumb} alt={game.title} fill className="object-cover" />
        {game.mini && (
          <span className="absolute top-3 left-3 bg-[#55b6ca] text-white text-xs font-bold px-2.5 py-1 rounded-full">
            Mini
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="font-extrabold text-base mb-2">{game.title}</p>
        <p className="text-sm text-[#5c5c5c] flex-1">{game.desc}</p>
        {hasAccess ? (
          <div className="mt-4 flex gap-2">
            <a href={game.url} {...(game.newTab === false ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              className="flex-1 inline-flex items-center justify-center font-bold text-sm px-4 py-2.5 rounded-lg bg-[#ed7c5a] text-white border-2 border-[#ed7c5a] hover:bg-white hover:text-[#ed7c5a] transition-all">
              {game.types.includes('lesson') ? '▶ Start Lesson' : '▶ Play Now'}
            </a>
            <button onClick={onToggleFavorite}
              className={`px-3 py-2.5 rounded-lg border-2 transition-all text-base ${isFavorited ? 'border-[#ed7c5a] text-[#ed7c5a] bg-[#fff5f2]' : 'border-[#ddd8cc] text-[#5c5c5c] hover:border-[#ed7c5a] hover:text-[#ed7c5a]'}`}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}>
              {isFavorited ? '♥' : '♡'}
            </button>
          </div>
        ) : (
          <Link href="/signup"
            className="mt-4 inline-flex items-center justify-center font-bold text-sm px-6 py-2.5 rounded-lg bg-[#55b6ca] text-white border-2 border-[#55b6ca] hover:bg-white hover:text-[#238FA4] transition-all">
            Start Free Trial
          </Link>
        )}
      </div>
    </div>
  )
}
