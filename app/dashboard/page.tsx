'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [trialEnd, setTrialEnd] = useState<Date | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [hasConsulting, setHasConsulting] = useState(false)
  const [consulting, setConsulting] = useState<{
    ends_at: string
    intake_completed: boolean
  } | null>(null)
  const [reportReady, setReportReady] = useState(false)


  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setEmail(user.email ?? '')

      const [{ data: profile }, { data: favData }, { data: consultingRecord }] = await Promise.all([
        supabase.from('profiles').select('trial_end, subscription_status').eq('id', user.id).single(),
        supabase.from('favorites').select('game_title').eq('user_id', user.id),
        supabase.from('consulting_customers').select('ends_at, intake_completed').eq('user_id', user.id).maybeSingle(),
      ])

      setStatus(profile?.subscription_status ?? '')
      setTrialEnd(profile?.trial_end ? new Date(profile.trial_end) : null)
      setFavorites(favData?.map((f: any) => f.game_title) ?? [])

      if (consultingRecord) {
        setHasConsulting(true)
        setConsulting({ ends_at: consultingRecord.ends_at, intake_completed: consultingRecord.intake_completed })
        fetch('/api/consulting/client-report')
          .then(r => r.json())
          .then(d => { if (d.report?.status === 'sent') setReportReady(true) })
          .catch(() => {})
      }

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

  const daysLeft = trialEnd ? Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
  const isTrialing = status === 'trialing' && daysLeft !== null && daysLeft > 0
  const isActive = status === 'active'
  const hasGames = isActive || isTrialing
  const firstName = email.split('@')[0]
  const favoriteGames = allGames.filter(g => favorites.includes(g.title))

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-14">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold mb-3">Welcome back, {firstName}!</h1>
        <div className="flex flex-wrap gap-3 items-center">
          {isActive && (
            <span className="text-sm font-bold bg-[#55b6ca] text-white px-3 py-1 rounded-full">Games — Active</span>
          )}
          {isTrialing && (
            <span className="text-sm font-bold bg-[#f5f1e9] text-[#ed7c5a] border border-[#ed7c5a] px-3 py-1 rounded-full">
              Games trial — {daysLeft} day{daysLeft === 1 ? '' : 's'} left
            </span>
          )}
          {hasConsulting && (
            <span className="text-sm font-bold bg-[#f0fafa] text-[#238FA4] border border-[#55b6ca] px-3 py-1 rounded-full">Consulting — Active</span>
          )}
          {isTrialing && (
            <Link href="/pricing" className="text-sm font-bold text-[#238FA4] hover:underline">Subscribe to keep access →</Link>
          )}
        </div>
      </div>

      {/* Games section — shown for games/both users */}
      {hasGames && (
        <>
          {/* Favorites */}
          <div className="mb-12">
            <h2 className="text-xl font-extrabold mb-4">Your Favorites</h2>
            {favoriteGames.length === 0 ? (
              <div className="bg-[#f5f1e9] rounded-2xl p-8 text-center">
                <p className="text-[#5c5c5c] text-sm mb-4">No favorites yet. Heart a game on the Learn page to save it here.</p>
                <Link href="/learn" className="inline-block bg-[#ed7c5a] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:opacity-90 transition">
                  Browse Games & Lessons
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteGames.map(game => (
                  <GameCard key={game.title} game={game} isFavorited={true} onToggleFavorite={() => toggleFavorite(game.title)} />
                ))}
              </div>
            )}
          </div>

          {/* New Games & Lessons */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold">New Games & Lessons</h2>
              <Link href="/learn" className="text-sm font-bold text-[#238FA4] hover:underline">Browse all →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allGames.slice(-3).map(game => (
                <GameCard key={game.title} game={game} isFavorited={favorites.includes(game.title)} onToggleFavorite={() => toggleFavorite(game.title)} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Consulting section — shown for consulting/both users */}
      {hasConsulting && consulting && (
        <div className="mb-12">
          <h2 className="text-xl font-extrabold mb-4">One-on-One Consulting with Mel</h2>
          <div className={`rounded-2xl p-6 border ${consulting.intake_completed ? 'bg-white border-[#e2ddd5]' : 'bg-[#fff9f7] border-[#ed7c5a]'}`} style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1">
                {/* Subscription terms */}
                {(() => {
                  const consultDaysLeft = Math.ceil((new Date(consulting.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  return (
                    <div className="flex flex-wrap gap-3 mb-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        reportReady ? 'bg-[#5bb87a] text-white'
                        : consulting.intake_completed ? 'bg-[#d1f5ea] text-[#1a7a52]'
                        : 'bg-[#ed7c5a] text-white'
                      }`}>
                        {reportReady ? 'Your report is ready'
                          : consulting.intake_completed ? 'Intake submitted — Mel is reviewing'
                          : 'Complete your intake form'}
                      </span>
                      {consultDaysLeft > 0
                        ? <span className="text-xs text-[#5c5c5c]">{consultDaysLeft} days left in your 3-month support window</span>
                        : <span className="text-xs text-[#991b1b]">3-month support window has ended</span>
                      }
                    </div>
                  )
                })()}

                {/* Intake form status */}
                {!consulting.intake_completed ? (
                  <div>
                    <p className="text-sm text-[#5c5c5c] mb-1">Mel is waiting on your intake form before she can get started. It saves as you go — pick it up anytime.</p>
                  </div>
                ) : reportReady ? (
                  <div>
                    <p className="text-sm text-[#5c5c5c] mb-3">Your personalized curriculum report from Mel is ready.</p>
                    <div className="flex flex-wrap gap-4">
                      <Link href="/dashboard/report" className="inline-block bg-[#5bb87a] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition">
                        View My Report →
                      </Link>
                      <Link href="/dashboard/intake" className="text-sm font-bold text-[#55b6ca] hover:underline self-center">Review intake answers →</Link>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-[#5c5c5c] mb-3">Mel has your answers and will be in touch within 3–5 business days.</p>
                    <Link href="/dashboard/intake" className="text-sm font-bold text-[#55b6ca] hover:underline">Review your submitted answers →</Link>
                  </div>
                )}
              </div>
              {!consulting.intake_completed && (
                <Link href="/dashboard/intake" className="inline-block bg-[#ed7c5a] text-white font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition whitespace-nowrap">
                  Complete Intake Form →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upsell: Consulting → for games-only users */}
      {hasGames && !hasConsulting && (
        <div className="mb-12">
          <div className="bg-[#f0fafa] rounded-2xl p-7 border border-[#55b6ca]">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#55b6ca] mb-2">Homeschool Help</p>
            <h2 className="text-xl font-extrabold mb-2">Looking for more personalized support?</h2>
            <p className="text-sm text-[#5c5c5c] mb-5">Get a personalized curriculum match, learning style analysis, and 3 months of email support from Mel. One-time, $47.</p>
            <Link href="/consulting" className="inline-block bg-[#55b6ca] text-white font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition">
              Learn About Consulting →
            </Link>
          </div>
        </div>
      )}

      {/* Upsell: Games → for consulting-only users */}
      {hasConsulting && !hasGames && (
        <div className="mb-12">
          <div className="bg-[#fff9f7] rounded-2xl p-7 border border-[#ed7c5a]">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#ed7c5a] mb-2">Games & Lessons</p>
            <h2 className="text-xl font-extrabold mb-2">Add interactive games for your kids</h2>
            <p className="text-sm text-[#5c5c5c] mb-5">Full access to all games, lessons, and printables. $5/month or $50/year. Cancel anytime.</p>
            <Link href="/pricing" className="inline-block bg-[#ed7c5a] text-white font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition">
              See Plans →
            </Link>
          </div>
        </div>
      )}

    </div>
  )
}

function GameCard({ game, isFavorited, onToggleFavorite }: { game: Game, isFavorited: boolean, onToggleFavorite: () => void }) {
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
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isFavorited ? 'bg-[#ed7c5a] text-white' : 'bg-white/80 text-[#5c5c5c] hover:bg-[#ed7c5a] hover:text-white'
          }`}
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorited
            ? <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          }
        </button>
      </div>
      <div className="p-5">
        <p className="font-extrabold text-base">{game.title}</p>
      </div>
    </a>
  )
}
