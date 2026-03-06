'use client'

import Image from 'next/image'
import { useState } from 'react'

const games = [
  {
    title: 'Solar System Sizzle',
    desc: 'Learn three facts about each object in the solar system through themed drag-and-drop meals. First stop: Sunshine Soup!',
    thumb: '/thumb-sss.png',
    url: 'https://view.genially.com/68b468a36df9dbd6433fe511',
    topic: 'solar-system',
    mini: false,
  },
  {
    title: 'Ordering the Planets',
    desc: 'Click the planets in order from the Sun. Watch them line up one by one as you get each correct, then finish with a drag-and-drop challenge!',
    thumb: '/thumb-otp.png',
    url: 'https://view.genially.com/68164fbb7306f160f7843510',
    topic: 'solar-system',
    mini: false,
  },
  {
    title: 'Planets Puzzle – Easy',
    desc: 'Piece together the planets of the solar system in this beginner-friendly jigsaw puzzle.',
    thumb: '/thumb-puzzle-easy.png',
    url: 'https://view.genially.com/699b8c77ce57456e07ab6ec6',
    topic: 'solar-system',
    mini: true,
  },
  {
    title: 'Planets Puzzle – Medium',
    desc: 'A step up in difficulty — can you put all the planets together from memory?',
    thumb: '/thumb-puzzle-medium.png',
    url: 'https://view.genially.com/69a5d5b1282f9454912a042b',
    topic: 'solar-system',
    mini: true,
  },
  {
    title: 'Planets Puzzle – Hard',
    desc: 'Think you know the solar system? This harder jigsaw will put you to the test!',
    thumb: '/thumb-puzzle-hard.png',
    url: 'https://view.genially.com/69a5df176426fe803ea50975',
    topic: 'solar-system',
    mini: true,
  },
  {
    title: 'Planets Puzzle – Very Hard',
    desc: 'The ultimate planets jigsaw challenge. Only the most dedicated space explorers need apply!',
    thumb: '/thumb-puzzle-vhard.png',
    url: 'https://view.genially.com/69a5df422695874f19c26146',
    topic: 'solar-system',
    mini: true,
  },
]

const filters = [
  { id: 'all', label: 'All' },
  { id: 'solar-system', label: '🪐 Solar System' },
]

export default function GamesPage() {
  const [active, setActive] = useState('all')

  const filtered = active === 'all' ? games : games.filter(g => g.topic === active)

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-14">
      <h1 className="text-3xl font-extrabold mb-2">Games</h1>
      <p className="text-[#5c5c5c] mb-8">Browse all our interactive educational games. New games added regularly!</p>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-10">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setActive(f.id)}
            className={`font-bold text-sm px-5 py-2 rounded-full border-2 transition-all ${
              active === f.id
                ? 'bg-[#55b6ca] border-[#55b6ca] text-white'
                : 'bg-white border-[#ddd8cc] text-[#1c1c1c] hover:border-[#55b6ca] hover:text-[#238FA4]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Games grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((game) => (
          <div key={game.title} className="bg-white rounded-[14px] overflow-hidden flex flex-col" style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
            <a href={game.url} target="_blank" rel="noopener noreferrer">
              <div className="relative h-44 w-full bg-[#e8e4dc]">
                <Image src={game.thumb} alt={game.title} fill className="object-cover" />
                {game.mini && (
                  <span className="absolute top-3 left-3 bg-[#55b6ca] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    Mini
                  </span>
                )}
              </div>
            </a>
            <div className="p-5 flex flex-col flex-1">
              <a href={game.url} target="_blank" rel="noopener noreferrer" className="font-extrabold text-base hover:text-[#ed7c5a] transition-colors mb-2">
                {game.title}
              </a>
              <p className="text-sm text-[#5c5c5c] flex-1">{game.desc}</p>
              <a href={game.url} target="_blank" rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center font-bold text-sm px-6 py-2.5 rounded-lg bg-[#ed7c5a] text-white border-2 border-[#ed7c5a] hover:bg-white hover:text-[#ed7c5a] transition-all">
                ▶ Play Now
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Coming Soon */}
      <div className="mt-12 bg-white rounded-[14px] p-8 text-center border-2 border-dashed border-[#ddd8cc]">
        <p className="text-2xl mb-2">🌊 🦋 🌿</p>
        <h2 className="text-lg font-extrabold mb-2">More Topics Coming Soon</h2>
        <p className="text-[#5c5c5c] text-sm">Marine Biology, Weather, Plants, and more are in the works. Subscribe to our newsletter to be the first to know!</p>
      </div>
    </div>
  )
}
