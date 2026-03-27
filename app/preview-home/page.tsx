import Image from 'next/image'
import Link from 'next/link'
import HeroVideo from '@/components/hero-video'

export default function PreviewHomePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-[#ddd8cc]">
        <div className="relative w-full bg-black" style={{ lineHeight: 0 }}>
          <HeroVideo />
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{ height: '40%', background: 'linear-gradient(to bottom, transparent, #ffffff)' }}
          />
        </div>
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="font-extrabold leading-tight mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
            Learning That Feels Like <em className="not-italic text-[#ed7c5a]">Playing</em>
          </h1>
          <p className="text-xl text-[#5c5c5c] mb-8">
            Plus, customized homeschooling support.{' '}
            <Link href="/consulting" className="text-[#55b6ca] font-bold hover:underline">
              Learn More »
            </Link>
          </p>
          <Link
            href="/learn"
            className="inline-flex items-center font-bold text-sm px-6 py-3 rounded-lg bg-[#ed7c5a] text-white border-2 border-[#ed7c5a] hover:bg-white hover:text-[#ed7c5a] transition-all"
          >
            Play & Learn →
          </Link>
        </div>
      </section>

      {/* Games Grid */}
      <section className="bg-white px-6 py-14 border-b border-[#ddd8cc]">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
            <div>
              <h2 className="text-2xl font-extrabold">Educational Games and Interactive Lessons</h2>
              <p className="text-[#5c5c5c] mt-1">Our games and lessons break down big topics into small, manageable chunks.</p>
            </div>
            <a href="#newsletter" className="text-sm font-bold text-[#55b6ca] hover:underline whitespace-nowrap mt-1 sm:mt-0 flex-shrink-0">
              Get notified of new games →
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">

            {/* 1 — Mars Lesson */}
            <a href="https://view.genially.com/699e69be43a96797318311da"
              className="bg-white rounded-[14px] overflow-hidden flex flex-col border border-[#e8e4dc] hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div className="relative h-32 w-full bg-[#e8e4dc]">
                <Image src="/thumb-lesson-mars.png" alt="Mission to Mars" fill className="object-cover" />
                <span className="absolute top-2 left-2 bg-[#55b6ca] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">Lesson</span>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-extrabold text-sm leading-tight mb-2">Mission to Mars</h3>
                <span className="mt-auto text-xs font-bold text-[#ed7c5a]">Start →</span>
              </div>
            </a>

            {/* 2 — Ordering the Planets */}
            <a href="https://view.genially.com/68164fbb7306f160f7843510" target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-[14px] overflow-hidden flex flex-col border border-[#e8e4dc] hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div className="relative h-32 w-full bg-[#e8e4dc]">
                <Image src="/ordering-the-planets-thumbnail.png" alt="Ordering the Planets" fill className="object-cover" />
                <span className="absolute top-2 left-2 bg-[#55b6ca] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">Free</span>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-extrabold text-sm leading-tight mb-2">Ordering the Planets</h3>
                <span className="mt-auto text-xs font-bold text-[#ed7c5a]">Play →</span>
              </div>
            </a>

            {/* 3 — Solar System Sizzle */}
            <a href="https://view.genially.com/69b83b3bc0b7be2f9910da3e" target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-[14px] overflow-hidden flex flex-col border border-[#e8e4dc] hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div className="relative h-32 w-full bg-[#e8e4dc]">
                <Image src="/thumb-sss.png" alt="Solar System Sizzle" fill className="object-cover" />
                <span className="absolute top-2 left-2 bg-[#55b6ca] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">Free Demo</span>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-extrabold text-sm leading-tight mb-2">Solar System Sizzle</h3>
                <span className="mt-auto text-xs font-bold text-[#ed7c5a]">Play →</span>
              </div>
            </a>

            {/* 4 — Saturn Puzzle */}
            <a href="/puzzle-saturn-medium.html"
              className="bg-white rounded-[14px] overflow-hidden flex flex-col border border-[#e8e4dc] hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div className="relative h-32 w-full bg-[#e8e4dc]">
                <Image src="/saturn-with-background.png" alt="Saturn Puzzle" fill className="object-cover" />
                <span className="absolute top-2 left-2 bg-[#55b6ca] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">Puzzle</span>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-extrabold text-sm leading-tight mb-2">Saturn Puzzle</h3>
                <span className="mt-auto text-xs font-bold text-[#ed7c5a]">Play →</span>
              </div>
            </a>

            {/* 5 — Asteroid Blast */}
            <a href="/asteroid-blast-planets.html"
              className="bg-white rounded-[14px] overflow-hidden flex flex-col border border-[#e8e4dc] hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div className="relative h-32 w-full bg-[#e8e4dc]">
                <Image src="/asteroid-thumbnail-planets.jpg" alt="Asteroid Blast" fill className="object-cover" />
                <span className="absolute top-2 left-2 bg-[#55b6ca] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">Arcade</span>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-extrabold text-sm leading-tight mb-2">Blast the Planets</h3>
                <span className="mt-auto text-xs font-bold text-[#ed7c5a]">Play →</span>
              </div>
            </a>

            {/* 6 — Inner Solar System Word Search */}
            <a href="/word-search-inner-solar-system.html"
              className="bg-white rounded-[14px] overflow-hidden flex flex-col border border-[#e8e4dc] hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div className="relative h-32 w-full bg-[#e8e4dc]">
                <Image src="/word-search-inner-solar-system-thumbnail.png" alt="Inner Solar System Word Search" fill className="object-cover" />
                <span className="absolute top-2 left-2 bg-[#55b6ca] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">Word Search</span>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-extrabold text-sm leading-tight mb-2">Inner Solar System Word Search</h3>
                <span className="mt-auto text-xs font-bold text-[#ed7c5a]">Play →</span>
              </div>
            </a>

            {/* 7 — Find a Pair: Dwarf Planets */}
            <a href="/matching-dwarf-planets.html"
              className="bg-white rounded-[14px] overflow-hidden flex flex-col border border-[#e8e4dc] hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div className="relative h-32 w-full bg-[#e8e4dc]">
                <Image src="/thumb-find-pair-dwarf-planets.png" alt="Find a Pair: Dwarf Planets" fill className="object-cover" />
                <span className="absolute top-2 left-2 bg-[#55b6ca] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">Find a Pair</span>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-extrabold text-sm leading-tight mb-2">Find a Pair: Dwarf Planets</h3>
                <span className="mt-auto text-xs font-bold text-[#ed7c5a]">Play →</span>
              </div>
            </a>

            {/* 8 — Word Sort: Planet Types */}
            <a href="/word-sort-planet-types.html"
              className="bg-white rounded-[14px] overflow-hidden flex flex-col border border-[#e8e4dc] hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div className="relative h-32 w-full bg-[#e8e4dc]">
                <Image src="/word-sort-planet-types-thumbnail.png" alt="Word Sort: Planet Types" fill className="object-cover" />
                <span className="absolute top-2 left-2 bg-[#55b6ca] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">Word Sort</span>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-extrabold text-sm leading-tight mb-2">Word Sort: Planet Types</h3>
                <span className="mt-auto text-xs font-bold text-[#ed7c5a]">Play →</span>
              </div>
            </a>

          </div>

          <div className="mt-8 text-center">
            <Link href="/learn" className="text-sm font-bold text-[#55b6ca] hover:underline">See all games →</Link>
          </div>
        </div>
      </section>

      {/* Consulting interrupt */}
      <section className="px-6 py-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #c95f3a 0%, #ed7c5a 45%, #f2976e 100%)' }}>
        {/* Decorative circles for depth */}
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-10 bg-white pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full opacity-10 bg-white pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full opacity-5 bg-white pointer-events-none" />

        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center gap-10 relative">
          <div className="w-full md:w-2/5 flex-shrink-0" style={{ minHeight: '300px', position: 'relative' }}>
            <div className="relative w-full h-full rounded-2xl overflow-hidden" style={{ minHeight: '300px', boxShadow: '0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.15)' }}>
              <Image src="/consulting-hero.jpg" alt="Homeschool consulting" fill className="object-cover" style={{ objectPosition: 'center 65%' }} />
            </div>
          </div>
          <div className="md:w-3/5 text-white">
            <p className="text-xs font-extrabold uppercase tracking-widest opacity-80 mb-3">Homeschool Help</p>
            <h2 className="text-3xl font-extrabold leading-tight mb-4">Struggling with homeschooling?</h2>
            <p className="text-lg leading-relaxed opacity-90 mb-8">
              Get recommendations for curriculum and supplements that are matched to your family — plus ongoing homeschool support.
            </p>
            <Link
              href="/consulting"
              className="inline-flex items-center font-extrabold text-sm px-6 py-3 rounded-xl bg-white text-[#ed7c5a] hover:bg-[#f5f1e9] transition"
            >
              Learn More →
            </Link>
          </div>
        </div>
      </section>

      {/* Feature: Full Games */}
      <section className="bg-[#f5f1e9] py-14 px-6 border-t border-[#ddd8cc]">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="relative w-full md:w-1/2 rounded-2xl overflow-hidden" style={{ minHeight: '280px' }}>
            <Image src="/thumb-sss.png" alt="Solar System Sizzle" fill className="object-cover" />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl font-extrabold mb-4">Immersive Learning Adventures</h2>
            <p className="text-[#5c5c5c] leading-relaxed mb-4">Our educational games use drag-and-drop challenges, voiceover narration, and bite-sized facts to teach kids real content — not just trivia.</p>
            <p className="text-[#5c5c5c] leading-relaxed mb-6">Each game is built around a specific topic so it fits right into your homeschool curriculum or works as a fun stand-alone lesson.</p>
            <a href="https://view.genially.com/69b83b3bc0b7be2f9910da3e" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center font-bold text-sm px-6 py-2.5 rounded-lg bg-[#ed7c5a] text-white border-2 border-[#ed7c5a] hover:bg-white hover:text-[#ed7c5a] transition-all">
              ▶ Play Demo
            </a>
          </div>
        </div>
      </section>

      {/* Feature: Mini Games */}
      <section className="py-14 px-6">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row-reverse items-center gap-10">
          <div className="relative w-full md:w-1/2 rounded-2xl overflow-hidden" style={{ minHeight: '280px' }}>
            <Image src="/thumb-find-pair-outer.png" alt="Mini Games" fill className="object-cover" />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl font-extrabold mb-4">Quick Wins, Big Learning</h2>
            <p className="text-[#5c5c5c] leading-relaxed mb-4">Short on time? Our mini games are perfect for a quick learning boost. Puzzles, word searches, matching games, and word sorts that kids can complete in just a few minutes.</p>
            <p className="text-[#5c5c5c] leading-relaxed">Mini games are a great way to reinforce what kids have already learned, or to introduce a new topic in a low-pressure, fun way.</p>
          </div>
        </div>
      </section>

      {/* Feature: Lessons */}
      <section className="bg-[#f5f1e9] py-14 px-6">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="relative w-full md:w-1/2 rounded-2xl overflow-hidden" style={{ minHeight: '280px' }}>
            <Image src="/thumb-lesson-mars.png" alt="Interactive Lessons" fill className="object-cover" />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl font-extrabold mb-4">Bite-Sized Lessons That Stick</h2>
            <p className="text-[#5c5c5c] leading-relaxed mb-4">Our lessons break big topics down into small, manageable chunks — with voiceover narration to guide kids through each one.</p>
            <p className="text-[#5c5c5c] leading-relaxed">Each lesson uses elements like animations, drag-and-drop, and sound effects (varies by lesson).</p>
          </div>
        </div>
      </section>

      {/* Blurb + CTA */}
      <section className="py-14 px-6 border-t border-[#ddd8cc]">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row md:items-center gap-6">
          <p className="text-base leading-relaxed flex-1">
            Game-based learning improves retention and keeps kids engaged far longer than traditional methods. Every game on this site is designed to build real knowledge — through play.
          </p>
          <Link href="/learn" className="flex-shrink-0 inline-flex items-center font-bold text-sm px-6 py-2.5 rounded-lg bg-[#55b6ca] text-white border-2 border-[#55b6ca] hover:bg-white hover:text-[#238FA4] transition-all">
            See all games →
          </Link>
        </div>
      </section>
    </>
  )
}
