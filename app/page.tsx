import Image from 'next/image'
import Link from 'next/link'
import HeroButtons from '@/components/hero-buttons'
import HeroVideo from '@/components/hero-video'

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-[#ddd8cc]">
        <div className="relative w-full bg-black" style={{ lineHeight: 0 }}>
          <HeroVideo />
        </div>
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="font-extrabold leading-tight mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
            Learning That Feels Like <em className="not-italic text-[#ed7c5a]">Playing</em>
          </h1>
          <p className="text-xl text-[#5c5c5c] mb-4">Interactive, game-based learning for homeschoolers and educators</p>
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="bg-[#f5f1e9] text-[#1c1c1c] text-sm font-bold px-4 py-1.5 rounded-full border border-[#ddd8cc]">Grades K–3</span>
            <span className="bg-[#f5f1e9] text-[#1c1c1c] text-sm font-bold px-4 py-1.5 rounded-full border border-[#ddd8cc]">100% Secular</span>
          </div>
          <HeroButtons />
        </div>
      </section>

      {/* Free Samples */}
      <section id="free-games" className="bg-[#f5f1e9] px-6 py-14">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-extrabold text-lg mb-8 text-center">Try these free — no account needed</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Free Game */}
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

            {/* Free Mini Game */}
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

            {/* Free Lesson */}
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

      {/* Feature: Full Games */}
      <section className="py-14 px-6">
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
      <section className="bg-[#f5f1e9] py-14 px-6">
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
      <section className="py-14 px-6">
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
      <section className="bg-[#f5f1e9] py-14 px-6">
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
