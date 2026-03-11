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
    title: 'The Sun Puzzle – Easy',
    desc: 'Put the Sun back together in 4 pieces. Perfect for little space explorers!',
    thumb: '/thumb-sun-easy.png',
    url: '/puzzle-sun-shape-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'The Sun Puzzle – Medium',
    desc: 'A 9-piece sun jigsaw — can you put it back together and learn a new fact along the way?',
    thumb: '/the-sun-with-background.png',
    url: '/puzzle-sun-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'The Sun Puzzle – Hard',
    desc: 'Think you know the Sun? Take on the 16-piece challenge and test your skills!',
    thumb: '/the-sun-with-background.png',
    url: '/puzzle-sun-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  // Mercury
  {
    title: 'Mercury Puzzle – Easy',
    desc: 'Put Mercury back together in 9 pieces and learn a fun fact!',
    thumb: '/mercury-with-background.png',
    url: '/puzzle-mercury-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Mercury Puzzle – Medium',
    desc: 'A 16-piece Mercury jigsaw — can you put it back together?',
    thumb: '/mercury-with-background.png',
    url: '/puzzle-mercury-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Mercury Puzzle – Hard',
    desc: 'Think you know Mercury? Take on the 25-piece challenge!',
    thumb: '/mercury-with-background.png',
    url: '/puzzle-mercury-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  // Venus
  {
    title: 'Venus Puzzle – Easy',
    desc: 'Put Venus back together in 9 pieces and learn a fun fact!',
    thumb: '/venus-with-background.png',
    url: '/puzzle-venus-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Venus Puzzle – Medium',
    desc: 'A 16-piece Venus jigsaw — can you put it back together?',
    thumb: '/venus-with-background.png',
    url: '/puzzle-venus-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Venus Puzzle – Hard',
    desc: 'Think you know Venus? Take on the 25-piece challenge!',
    thumb: '/venus-with-background.png',
    url: '/puzzle-venus-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  // Earth
  {
    title: 'Earth Puzzle – Easy',
    desc: 'Put Earth back together in 9 pieces and learn a fun fact!',
    thumb: '/earth-with-background.png',
    url: '/puzzle-earth-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Earth Puzzle – Medium',
    desc: 'A 16-piece Earth jigsaw — can you put it back together?',
    thumb: '/earth-with-background.png',
    url: '/puzzle-earth-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Earth Puzzle – Hard',
    desc: 'Think you know Earth? Take on the 25-piece challenge!',
    thumb: '/earth-with-background.png',
    url: '/puzzle-earth-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  // The Moon
  {
    title: 'The Moon Puzzle – Easy',
    desc: 'Put the Moon back together in 9 pieces and learn a fun fact!',
    thumb: '/moon-with-background.png',
    url: '/puzzle-moon-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'The Moon Puzzle – Medium',
    desc: 'A 16-piece Moon jigsaw — can you put it back together?',
    thumb: '/moon-with-background.png',
    url: '/puzzle-moon-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'The Moon Puzzle – Hard',
    desc: 'Think you know the Moon? Take on the 25-piece challenge!',
    thumb: '/moon-with-background.png',
    url: '/puzzle-moon-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  // Mars
  {
    title: 'Mars Puzzle – Easy',
    desc: 'Put Mars back together in 9 pieces and learn a fun fact!',
    thumb: '/mars-with-background.png',
    url: '/puzzle-mars-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Mars Puzzle – Medium',
    desc: 'A 16-piece Mars jigsaw — can you put it back together?',
    thumb: '/mars-with-background.png',
    url: '/puzzle-mars-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Mars Puzzle – Hard',
    desc: 'Think you know Mars? Take on the 25-piece challenge!',
    thumb: '/mars-with-background.png',
    url: '/puzzle-mars-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  // Vesta
  {
    title: 'Vesta Puzzle – Easy',
    desc: 'Put Vesta back together in 9 pieces and learn about the Asteroid Belt!',
    thumb: '/vesta-with-background.png',
    url: '/puzzle-vesta-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Vesta Puzzle – Medium',
    desc: 'A 16-piece Vesta jigsaw — can you put it back together?',
    thumb: '/vesta-with-background.png',
    url: '/puzzle-vesta-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Vesta Puzzle – Hard',
    desc: 'Think you know the Asteroid Belt? Take on the 25-piece challenge!',
    thumb: '/vesta-with-background.png',
    url: '/puzzle-vesta-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  // Jupiter
  {
    title: 'Jupiter Puzzle – Easy',
    desc: 'Put Jupiter back together in 9 pieces and learn a fun fact!',
    thumb: '/jupiter-with-background.png',
    url: '/puzzle-jupiter-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Jupiter Puzzle – Medium',
    desc: 'A 16-piece Jupiter jigsaw — can you put it back together?',
    thumb: '/jupiter-with-background.png',
    url: '/puzzle-jupiter-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Jupiter Puzzle – Hard',
    desc: 'Think you know Jupiter? Take on the 25-piece challenge!',
    thumb: '/jupiter-with-background.png',
    url: '/puzzle-jupiter-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  // Saturn
  {
    title: 'Saturn Puzzle – Easy',
    desc: 'Put Saturn back together in 9 pieces and learn a fun fact!',
    thumb: '/saturn-with-background.png',
    url: '/puzzle-saturn-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Saturn Puzzle – Medium',
    desc: 'A 16-piece Saturn jigsaw — can you put it back together?',
    thumb: '/saturn-with-background.png',
    url: '/puzzle-saturn-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Saturn Puzzle – Hard',
    desc: 'Think you know Saturn? Take on the 25-piece challenge!',
    thumb: '/saturn-with-background.png',
    url: '/puzzle-saturn-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  // Uranus
  {
    title: 'Uranus Puzzle – Easy',
    desc: 'Put Uranus back together in 9 pieces and learn a fun fact!',
    thumb: '/uranus-with-background.png',
    url: '/puzzle-uranus-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Uranus Puzzle – Medium',
    desc: 'A 16-piece Uranus jigsaw — can you put it back together?',
    thumb: '/uranus-with-background.png',
    url: '/puzzle-uranus-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Uranus Puzzle – Hard',
    desc: 'Think you know Uranus? Take on the 25-piece challenge!',
    thumb: '/uranus-with-background.png',
    url: '/puzzle-uranus-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  // Neptune
  {
    title: 'Neptune Puzzle – Easy',
    desc: 'Put Neptune back together in 9 pieces and learn a fun fact!',
    thumb: '/neptune-with-background.png',
    url: '/puzzle-neptune-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Neptune Puzzle – Medium',
    desc: 'A 16-piece Neptune jigsaw — can you put it back together?',
    thumb: '/neptune-with-background.png',
    url: '/puzzle-neptune-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Neptune Puzzle – Hard',
    desc: 'Think you know Neptune? Take on the 25-piece challenge!',
    thumb: '/neptune-with-background.png',
    url: '/puzzle-neptune-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  // Arrokoth
  {
    title: 'Arrokoth Puzzle – Easy',
    desc: 'Put Arrokoth back together in 9 pieces and learn about the Kuiper Belt!',
    thumb: '/arrokoth-with-background.png',
    url: '/puzzle-arrokoth-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Arrokoth Puzzle – Medium',
    desc: 'A 16-piece Arrokoth jigsaw — can you put it back together?',
    thumb: '/arrokoth-with-background.png',
    url: '/puzzle-arrokoth-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Arrokoth Puzzle – Hard',
    desc: 'Think you know the Kuiper Belt? Take on the 25-piece challenge!',
    thumb: '/arrokoth-with-background.png',
    url: '/puzzle-arrokoth-hard.html',
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
    title: 'Find a Pair – Inner Planets',
    desc: 'Flip the cards and match each inner planet to its name. Mercury, Venus, Earth, and Mars!',
    thumb: '/thumb-find-pair-inner.png',
    url: '/matching-inner-planets.html',
    topic: 'solar-system',
    mini: true,
    types: ['matching'],
    newTab: false,
  },
  {
    title: 'Find a Pair – Outer Planets',
    desc: 'Flip the cards and match each outer planet to its name. Jupiter, Saturn, Uranus, and Neptune!',
    thumb: '/thumb-find-pair-outer.png',
    url: '/matching-outer-planets.html',
    topic: 'solar-system',
    mini: true,
    types: ['matching'],
    newTab: false,
  },
  {
    title: 'Find a Pair – Dwarf Planets',
    desc: 'Flip the cards and match each dwarf planet to its name. Pluto, Eris, Ceres, Makemake, and Haumea!',
    thumb: '/dwarf-planets-matching-game-thumbnail.png',
    url: '/matching-dwarf-planets.html',
    topic: 'solar-system',
    mini: true,
    types: ['matching'],
    newTab: false,
  },
  {
    title: 'Word Sort – Planet Types',
    desc: 'Sort the planets into the correct categories — can you tell your rocky planets from your gas giants?',
    thumb: '/word-sort-planet-types-thumbnail.png',
    url: '/word-sort-planet-types.html',
    topic: 'solar-system',
    mini: true,
    types: ['word-sort'],
    newTab: false,
  },
  {
    title: 'Word Sort – Has Moons vs No Moons',
    desc: 'Which planets have moons and which don\'t? Sort them into the right groups!',
    thumb: '/word-sort-moons-no-moons-thumbnail.png',
    url: '/word-sort-moons.html',
    topic: 'solar-system',
    mini: true,
    types: ['word-sort'],
    newTab: false,
  },
  {
    title: 'Word Sort – Has Rings vs No Rings',
    desc: 'Not just Saturn! Sort all eight planets by whether they have rings or not.',
    thumb: '/word-sort-rings-no-rings-thumbnail.png',
    url: '/word-sort-rings.html',
    topic: 'solar-system',
    mini: true,
    types: ['word-sort'],
    newTab: false,
  },
  {
    title: 'Word Sort – Has Atmosphere vs No Atmosphere',
    desc: 'Which planets have an atmosphere? Sort them and find out!',
    thumb: '/word-sort-atmosphere-no-atmosphere-thumbnail.png',
    url: '/word-sort-atmosphere.html',
    topic: 'solar-system',
    mini: true,
    types: ['word-sort'],
    newTab: false,
  },
  {
    title: 'Word Sort – Jupiter/Saturn Moons',
    desc: 'Sort the moons into the right planet — do you know which moons belong to Jupiter and which to Saturn?',
    thumb: '/word-sort-jupiter-saturn-moons-thumbnail.png',
    url: '/word-sort-jupiter-saturn-moons.html',
    topic: 'solar-system',
    mini: true,
    types: ['word-sort'],
    newTab: false,
  },
  {
    title: 'Word Search – The Planets',
    desc: 'Find all eight planets hidden in the grid — search across, down, and diagonally!',
    thumb: '/word-search-planets-thumbnail.png',
    url: '/word-search-planets.html',
    topic: 'solar-system',
    mini: true,
    types: ['word-search'],
    newTab: false,
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
  const [search, setSearch] = useState('')
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

      // Admin always has full access
      if (user.email === 'support@homeschoolconnective.com') {
        setHasAccess(true)
        setAuthChecked(true)
        return
      }

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
    if (activeTypes.length > 0) {
      const typeMatch = (activeTypes.includes('mini') && g.mini) || g.types.some(t => activeTypes.includes(t))
      if (!typeMatch) return false
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      const haystack = [
        g.title,
        g.desc,
        g.topic,
        ...g.types,
        g.mini ? 'mini' : '',
      ].join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
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

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa9a4] text-base pointer-events-none">🔍</span>
        <input
          type="search"
          placeholder="Search games… try &quot;sun puzzle&quot;, &quot;matching&quot;, &quot;easy&quot;"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#ddd8cc] bg-white text-sm font-semibold placeholder-[#aaa9a4] focus:outline-none focus:border-[#55b6ca] transition-colors"
        />
      </div>

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
        <p className="text-[#5c5c5c] text-sm py-12 text-center">No games match your search. Try different keywords or clear your filters!</p>
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
    <div className="bg-white rounded-[14px] overflow-hidden flex flex-col border border-[#e2ddd5]" style={{ boxShadow: '0 3px 18px rgba(0,0,0,0.11)' }}>
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
        {!game.mini && <p className="text-sm text-[#5c5c5c] flex-1">{game.desc}</p>}
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
