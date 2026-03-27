import Image from 'next/image'
import Link from 'next/link'
import HeroVideo from '@/components/hero-video'
import { createClient } from '@supabase/supabase-js'

export default async function PreviewHomePage() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s+/g, '')
  )
  const { count: resourceCount } = await admin
    .from('resources')
    .select('*', { count: 'exact', head: true })
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
          <h1 className="font-normal leading-tight mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
            Learning That Feels Like <em className="not-italic text-[#ed7c5a]">Playing</em>
          </h1>
          <p className="text-xl text-[#5c5c5c] mb-8">
            Plus, personalized homeschooling support for parents.{' '}
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
              <h2 className="text-2xl">Educational Games and Interactive Lessons</h2>
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
                <span className="absolute top-2 left-2 bg-[#55b6ca] text-white text-xs font-extrabold px-2.5 py-1 rounded-full">Lesson</span>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="text-sm leading-tight mb-2">All About Mars</h3>
                <span className="mt-auto text-xs font-bold text-[#ed7c5a]">Start →</span>
              </div>
            </a>

            {/* 2 — Ordering the Planets */}
            <a href="https://view.genially.com/68164fbb7306f160f7843510" target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-[14px] overflow-hidden flex flex-col border border-[#e8e4dc] hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div className="relative h-32 w-full bg-[#e8e4dc]">
                <Image src="/ordering-the-planets-thumbnail.png" alt="Ordering the Planets" fill className="object-cover" />
                <span className="absolute top-2 left-2 bg-[#ed7c5a] text-white text-xs font-extrabold px-2.5 py-1 rounded-full">Free</span>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="text-sm leading-tight mb-2">Ordering the Planets</h3>
                <span className="mt-auto text-xs font-bold text-[#ed7c5a]">Play →</span>
              </div>
            </a>

            {/* 3 — Solar System Sizzle */}
            <a href="https://view.genially.com/69b83b3bc0b7be2f9910da3e" target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-[14px] overflow-hidden flex flex-col border border-[#e8e4dc] hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div className="relative h-32 w-full bg-[#e8e4dc]">
                <Image src="/thumb-sss.png" alt="Solar System Sizzle" fill className="object-cover" />
                <span className="absolute top-2 left-2 bg-[#ed7c5a] text-white text-xs font-extrabold px-2.5 py-1 rounded-full">Free Demo</span>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="text-sm leading-tight mb-2">Solar System Sizzle</h3>
                <span className="mt-auto text-xs font-bold text-[#ed7c5a]">Play →</span>
              </div>
            </a>

            {/* 4 — Saturn Puzzle */}
            <a href="/puzzle-saturn-medium.html"
              className="bg-white rounded-[14px] overflow-hidden flex flex-col border border-[#e8e4dc] hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div className="relative h-32 w-full bg-[#e8e4dc]">
                <Image src="/saturn-with-background.png" alt="Saturn Puzzle" fill className="object-cover" />
                <span className="absolute top-2 left-2 bg-[#8b72be] text-white text-xs font-extrabold px-2.5 py-1 rounded-full">Puzzle</span>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="text-sm leading-tight mb-2">Saturn Puzzle</h3>
                <span className="mt-auto text-xs font-bold text-[#ed7c5a]">Play →</span>
              </div>
            </a>

            {/* 5 — Asteroid Blast */}
            <a href="/asteroid-blast-planets.html"
              className="bg-white rounded-[14px] overflow-hidden flex flex-col border border-[#e8e4dc] hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div className="relative h-32 w-full bg-[#e8e4dc]">
                <Image src="/asteroid-thumbnail-planets.jpg" alt="Asteroid Blast" fill className="object-cover" />
                <span className="absolute top-2 left-2 bg-[#d94f4f] text-white text-xs font-extrabold px-2.5 py-1 rounded-full">Arcade</span>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="text-sm leading-tight mb-2">Blast the Planets</h3>
                <span className="mt-auto text-xs font-bold text-[#ed7c5a]">Play →</span>
              </div>
            </a>

            {/* 6 — Inner Solar System Word Search */}
            <a href="/word-search-inner-solar-system.html"
              className="bg-white rounded-[14px] overflow-hidden flex flex-col border border-[#e8e4dc] hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div className="relative h-32 w-full bg-[#e8e4dc]">
                <Image src="/word-search-inner-solar-system-thumbnail.png" alt="Inner Solar System Word Search" fill className="object-cover" />
                <span className="absolute top-2 left-2 bg-[#4a90c4] text-white text-xs font-extrabold px-2.5 py-1 rounded-full">Word Search</span>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="text-sm leading-tight mb-2">Inner Solar System Word Search</h3>
                <span className="mt-auto text-xs font-bold text-[#ed7c5a]">Play →</span>
              </div>
            </a>

            {/* 7 — Find a Pair: Dwarf Planets */}
            <a href="/matching-dwarf-planets.html"
              className="bg-white rounded-[14px] overflow-hidden flex flex-col border border-[#e8e4dc] hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div className="relative h-32 w-full bg-[#e8e4dc]">
                <Image src="/dwarf-planets-matching-game-thumbnail.png" alt="Find a Pair: Dwarf Planets" fill className="object-cover" />
                <span className="absolute top-2 left-2 bg-[#5bab8a] text-white text-xs font-extrabold px-2.5 py-1 rounded-full">Find a Pair</span>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="text-sm leading-tight mb-2">Find a Pair: Dwarf Planets</h3>
                <span className="mt-auto text-xs font-bold text-[#ed7c5a]">Play →</span>
              </div>
            </a>

            {/* 8 — Word Sort: Planet Types */}
            <a href="/word-sort-planet-types.html"
              className="bg-white rounded-[14px] overflow-hidden flex flex-col border border-[#e8e4dc] hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div className="relative h-32 w-full bg-[#e8e4dc]">
                <Image src="/word-sort-planet-types-thumbnail.png" alt="Word Sort: Planet Types" fill className="object-cover" />
                <span className="absolute top-2 left-2 bg-[#c4607a] text-white text-xs font-extrabold px-2.5 py-1 rounded-full">Word Sort</span>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="text-sm leading-tight mb-2">Word Sort: Planet Types</h3>
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
      <section className="px-6 py-16 relative overflow-hidden bg-[#f5f1e9]">
        {/* Decorative circles for depth */}
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-10 bg-white pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full opacity-10 bg-white pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full opacity-5 bg-white pointer-events-none" />

        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center gap-10 relative">
          <div className="w-full md:w-2/5 flex-shrink-0" style={{ minHeight: '420px', position: 'relative' }}>
            <div className="relative w-full h-full rounded-2xl overflow-hidden" style={{ minHeight: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.15)' }}>
              <Image src="/new-hero-image-homepage.jpg" alt="Homeschool consulting" fill className="object-cover" style={{ objectPosition: 'center 40%' }} />
            </div>
          </div>
          <div className="md:w-3/5">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#55b6ca] mb-3">Homeschool Help</p>
            <h2 className="text-3xl leading-tight mb-4 text-[#1c1c1c]">Struggling with homeschooling?</h2>
            <p className="text-lg leading-relaxed text-[#5c5c5c] mb-8">
              Use our deep matching system to get curriculum recommendations and uncover your child&apos;s learning style, your teaching style, and which homeschool methods may be best for your family. Plus ongoing homeschool support.
            </p>
            {resourceCount && (
              <p className="text-sm text-[#5c5c5c] mb-6">
                <span className="text-2xl font-extrabold text-[#ed7c5a]">{resourceCount}</span>{' '}
                curated resources in our database
              </p>
            )}
            <Link
              href="/consulting"
              className="inline-flex items-center font-extrabold text-sm px-6 py-3 rounded-xl bg-[#ed7c5a] text-white hover:opacity-90 transition"
            >
              Learn More →
            </Link>
          </div>
        </div>
      </section>

      {/* Printables grid */}
      <section className="bg-white px-6 py-14 border-t border-[#ddd8cc]">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
            <div>
              <h2 className="text-2xl">Printables</h2>
              <p className="text-[#5c5c5c] mt-1">Ready-to-use worksheets and activities for your homeschool.</p>
            </div>
            <a href="#newsletter" className="text-sm font-bold text-[#55b6ca] hover:underline whitespace-nowrap mt-1 sm:mt-0 flex-shrink-0">
              Get notified of new printables →
            </a>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 max-w-2xl">
            {[
              { title: 'Layers of the Sun', file: 'website-pdf-layers-sun-coloring.pdf', thumb: '/website-pdf-layers-sun-coloring.png' },
              { title: 'Red Spot Weather Report', file: 'website-pdf-red-spot-weather-report.pdf', thumb: '/website-pdf-red-spot-weather-report.png' },
              { title: 'Create a Solar System', file: 'website-pdf-create-a-solar-system.pdf', thumb: '/website-pdf-create-a-solar-system.png' },
            ].map(({ title, file, thumb }) => (
              <a key={title} href={`/printable?file=${file}&title=${encodeURIComponent(title)}`}
                className="bg-white rounded-[14px] overflow-hidden flex flex-col border border-[#e8e4dc] hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                <div className="relative w-full" style={{ aspectRatio: '8.5/11' }}>
                  <Image src={thumb} alt={title} fill className="object-contain" />
                </div>
                <div className="p-3 bg-[#f5f1e9]">
                  <p className="text-xs font-bold leading-snug">{title}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-8 text-center">
            <span className="text-sm font-bold text-[#55b6ca] cursor-pointer hover:underline">See all printables →</span>
          </div>
        </div>
      </section>

      {/* Coming Soon topics block */}
      <section className="bg-[#ed7c5a] px-6 py-10">
        <div className="max-w-[1100px] mx-auto text-center">

          <h2 className="text-3xl text-white leading-tight mb-10">New Topics Coming Soon</h2>

          {/* Topic list — plain text, not clickable */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-white text-base">
            {['Ocean Animals', 'Dinosaurs', 'The 7 Continents', 'Extreme Environments', 'Natural Disasters'].map((topic) => (
              <span key={topic}>{topic}</span>
            ))}
          </div>

        </div>
      </section>

      {/* Homeschool Tips */}
      <section className="bg-white px-6 py-14 border-t border-[#ddd8cc]">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
            <div>
              <h2 className="text-2xl">Homeschool Tips</h2>
              <p className="text-[#5c5c5c] mt-1">Ideas, strategies, and inspiration for your homeschool journey.</p>
            </div>
            <Link href="/tips" className="text-sm font-bold text-[#55b6ca] hover:underline whitespace-nowrap mt-1 sm:mt-0 flex-shrink-0">
              See all posts →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <Link href="/tips/why-play-is-important" className="bg-white rounded-[14px] overflow-hidden flex flex-col border border-[#e8e4dc] hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div className="relative w-full bg-[#f5f1e9]" style={{ height: '300px' }}>
                <Image src="/blog-play-blocks.avif" alt="Why Play is Important" fill className="object-cover" />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p className="text-xs text-[#a09890] mb-1">October 21, 2025 · Game-Based Learning</p>
                <h3 className="text-base mb-2">Why Play is Important</h3>
                <p className="text-sm text-[#5c5c5c] flex-1 line-clamp-3">Play&apos;s essential function in homeschooling: fostering development and education through curiosity and hands-on exploration.</p>
                <span className="mt-4 text-sm font-bold text-[#ed7c5a]">Read more →</span>
              </div>
            </Link>

            <Link href="/tips/learning-styles" className="bg-white rounded-[14px] overflow-hidden flex flex-col border border-[#e8e4dc] hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div className="relative w-full bg-[#f5f1e9]" style={{ height: '300px' }}>
                <Image src="/blog-ls-infographic.avif" alt="Learning Styles" fill className="object-cover" />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p className="text-xs text-[#a09890] mb-1">August 5, 2025 · Homeschool Planning</p>
                <h3 className="text-base mb-2">Learning Styles</h3>
                <p className="text-sm text-[#5c5c5c] flex-1 line-clamp-3">Understanding how your child learns best — and how to build a homeschool around their natural strengths.</p>
                <span className="mt-4 text-sm font-bold text-[#ed7c5a]">Read more →</span>
              </div>
            </Link>

            <Link href="/tips/deschooling" className="bg-white rounded-[14px] overflow-hidden flex flex-col border border-[#e8e4dc] hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div className="relative w-full bg-[#f5f1e9]" style={{ height: '300px' }}>
                <Image src="/blog-deschooling-kids-log.avif" alt="Deschooling" fill className="object-cover" />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p className="text-xs text-[#a09890] mb-1">April 28, 2025 · Getting Started</p>
                <h3 className="text-base mb-2">Deschooling</h3>
                <p className="text-sm text-[#5c5c5c] flex-1 line-clamp-3">Making the switch to homeschooling? Deschooling is the often-overlooked first step — and skipping it is one of the most common mistakes new homeschoolers make.</p>
                <span className="mt-4 text-sm font-bold text-[#ed7c5a]">Read more →</span>
              </div>
            </Link>

          </div>
        </div>
      </section>

    </>
  )
}
