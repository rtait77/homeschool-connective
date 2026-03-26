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
            <Link href="/consulting" className="text-[#238FA4] font-bold hover:underline">
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

      {/* Two Services */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-2xl font-extrabold text-center mb-2">Two Ways We Can Help</h2>
          <p className="text-center text-[#5c5c5c] mb-10">Whether you need engaging content for your kids or a personalized plan for your family — we've got you.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Games card */}
            <div className="bg-[#f5f1e9] rounded-2xl p-8 flex flex-col border border-[#e2ddd5]">
              <div className="text-3xl mb-4">🎮</div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#55b6ca] mb-2">Games & Lessons</p>
              <h3 className="text-xl font-extrabold mb-3">Learning That Feels Like Playing</h3>
              <p className="text-sm text-[#5c5c5c] leading-relaxed mb-6 flex-1">
                Interactive games, mini challenges, and bite-sized lessons designed for K–3 homeschoolers. New content added regularly. Start with a free 7-day trial — no credit card needed.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center font-extrabold text-sm px-5 py-3 rounded-xl bg-[#ed7c5a] text-white hover:opacity-90 transition"
              >
                Start Free Trial →
              </Link>
            </div>

            {/* Consulting card */}
            <div className="bg-[#f5f1e9] rounded-2xl p-8 flex flex-col border border-[#e2ddd5]">
              <div className="text-3xl mb-4">💬</div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#55b6ca] mb-2">1-on-1 Consulting</p>
              <h3 className="text-xl font-extrabold mb-3">Your Homeschool, Figured Out</h3>
              <p className="text-sm text-[#5c5c5c] leading-relaxed mb-6 flex-1">
                Not sure which curriculum to use or where to start? Mel will review your family's needs and give you a personalized recommendation — plus 3 months of email support.
              </p>
              <Link
                href="/consulting"
                className="inline-flex items-center justify-center font-extrabold text-sm px-5 py-3 rounded-xl border-2 border-[#ed7c5a] text-[#ed7c5a] bg-white hover:bg-[#ed7c5a] hover:text-white transition"
              >
                Book a Consult →
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Free Samples */}
      <section className="bg-[#f5f1e9] px-6 py-14 border-t border-[#ddd8cc]">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-extrabold text-lg mb-8 text-center">Try these free — no account needed</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="bg-white rounded-[14px] overflow-hidden flex flex-col" style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
              <div className="relative h-44 w-full bg-[#e8e4dc]">
                <Image src="/ordering-the-planets-thumbnail.png" alt="Ordering the Planets" fill className="object-cover" />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-extrabold text-base mb-2">Ordering the Planets</h3>
                <p className="text-sm text-[#5c5c5c] flex-1 mb-5">Click the planets in order from the Sun. Watch them line up one by one, then finish with a drag-and-drop challenge!</p>
                <a href="https://view.genially.com/68164fbb7306f160f7843510" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center font-bold text-sm px-6 py-2.5 rounded-lg bg-[#ed7c5a] text-white border-2 border-[#ed7c5a] hover:bg-white hover:text-[#ed7c5a] transition-all">
                  ▶ Play Now
                </a>
              </div>
            </div>

            <div className="bg-white rounded-[14px] overflow-hidden flex flex-col" style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
              <div className="relative h-44 w-full bg-[#e8e4dc]">
                <Image src="/the-sun-with-background.png" alt="Sun Puzzle" fill className="object-cover" />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-extrabold text-base mb-2">Sun Puzzle – Medium</h3>
                <p className="text-sm text-[#5c5c5c] flex-1 mb-5">A 9-piece sun jigsaw — can you put it back together and learn a new fact along the way?</p>
                <a href="/puzzle-sun-medium.html?back=home"
                  className="inline-flex items-center justify-center font-bold text-sm px-6 py-2.5 rounded-lg bg-[#ed7c5a] text-white border-2 border-[#ed7c5a] hover:bg-white hover:text-[#ed7c5a] transition-all">
                  ▶ Play Now
                </a>
              </div>
            </div>

            <div className="bg-white rounded-[14px] overflow-hidden flex flex-col" style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
              <div className="relative h-44 w-full bg-[#e8e4dc]">
                <Image src="/thumb-lesson-mars.png" alt="Mission to Mars" fill className="object-cover" />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-extrabold text-base mb-2">Mission to Mars</h3>
                <p className="text-sm text-[#5c5c5c] flex-1 mb-5">Explore the Red Planet — learn about Mars, its moons, and the rovers that have explored it. Includes a gamified quiz and rover puzzle.</p>
                <a href="https://view.genially.com/699e69be43a96797318311da" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center font-bold text-sm px-6 py-2.5 rounded-lg bg-[#ed7c5a] text-white border-2 border-[#ed7c5a] hover:bg-white hover:text-[#ed7c5a] transition-all">
                  ▶ Start Lesson
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Consulting spotlight */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-[700px] mx-auto text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#55b6ca] mb-3">Homeschool Help</p>
          <h2 className="text-2xl font-extrabold mb-4">Not sure where to start with your homeschool?</h2>
          <p className="text-[#5c5c5c] leading-relaxed mb-3">
            Mel has helped hundreds of homeschool families find their footing — figuring out the right curriculum, approach, and rhythm for their unique kids.
          </p>
          <p className="text-[#5c5c5c] leading-relaxed mb-8">
            For $47, you'll get a personalized recommendation report based on your family's needs, learning styles, and goals — plus 3 months of follow-up support by email.
          </p>
          <Link
            href="/consulting"
            className="inline-flex items-center justify-center font-extrabold text-sm px-6 py-3 rounded-xl border-2 border-[#ed7c5a] text-[#ed7c5a] hover:bg-[#ed7c5a] hover:text-white transition"
          >
            Learn More →
          </Link>
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
