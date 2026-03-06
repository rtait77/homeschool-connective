import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-[#ddd8cc]">
        <div className="relative w-full bg-black" style={{ lineHeight: 0 }}>
          <video
            autoPlay
            muted
            playsInline
            loop
            className="w-full block"
            style={{ maxHeight: '58vh', objectFit: 'cover', objectPosition: 'center 40%' }}
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{ height: '40%', background: 'linear-gradient(to bottom, transparent, #ffffff)' }}
          />
        </div>
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="font-extrabold leading-tight mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
            Learning That Feels Like <em className="not-italic text-[#ed7c5a]">Playing</em>
          </h1>
          <p className="text-xl text-[#5c5c5c] mb-8">Interactive, game-based learning for homeschoolers and educators</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="inline-flex items-center font-bold text-sm px-6 py-3 rounded-lg bg-[#ed7c5a] text-white border-2 border-[#ed7c5a] hover:bg-white hover:text-[#ed7c5a] transition-all">
              Start 7 Day Free Trial
            </Link>
            <Link href="/about" className="inline-flex items-center font-bold text-sm px-6 py-3 rounded-lg bg-[#55b6ca] text-white border-2 border-[#55b6ca] hover:bg-white hover:text-[#238FA4] transition-all">
              About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Free Game */}
      <section className="bg-[#f5f1e9] px-6 py-14">
        <div className="max-w-[700px] mx-auto text-center">
        <p className="font-extrabold text-lg mb-8">Try a game — no account needed</p>
        <div className="bg-white rounded-[14px] overflow-hidden text-left" style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
          <div className="relative h-56 w-full bg-[#e8e4dc]">
            <Image src="/thumb-otp.png" alt="Ordering the Planets" fill className="object-cover" />
          </div>
          <div className="p-6">
            <h3 className="font-extrabold text-lg mb-2">Ordering the Planets</h3>
            <p className="text-sm text-[#5c5c5c] mb-5">Click the planets in order from the Sun. Watch them line up one by one as you get each correct, then finish with a drag-and-drop challenge!</p>
            <a href="https://view.genially.com/68164fbb7306f160f7843510" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center font-bold text-sm px-6 py-2.5 rounded-lg bg-[#ed7c5a] text-white border-2 border-[#ed7c5a] hover:bg-white hover:text-[#ed7c5a] transition-all">
              ▶ Play Now
            </a>
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
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#55b6ca] mb-3">Educational Games</p>
            <h2 className="text-2xl font-extrabold mb-4">Immersive Learning Adventures</h2>
            <p className="text-[#5c5c5c] leading-relaxed mb-4">Our educational games use drag-and-drop challenges, voiceover narration, and bite-sized facts to teach kids real content — not just trivia.</p>
            <p className="text-[#5c5c5c] leading-relaxed">Each game is built around a specific topic so it fits right into your homeschool curriculum or works as a fun stand-alone lesson.</p>
          </div>
        </div>
      </section>

      {/* Feature: Mini Games */}
      <section className="bg-[#f5f1e9] py-14 px-6">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row-reverse items-center gap-10">
          <div className="relative w-full md:w-1/2 rounded-2xl overflow-hidden" style={{ minHeight: '280px' }}>
            <Image src="/thumb-puzzle-easy.png" alt="Mini Games" fill className="object-cover" />
          </div>
          <div className="md:w-1/2">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#55b6ca] mb-3">Mini Games</p>
            <h2 className="text-2xl font-extrabold mb-4">Quick Wins, Big Learning</h2>
            <p className="text-[#5c5c5c] leading-relaxed mb-4">Short on time? Our mini games are perfect for a quick learning boost. Puzzles, word searches, matching games, and word sorts that kids can complete in just a few minutes.</p>
            <p className="text-[#5c5c5c] leading-relaxed">Mini games are a great way to reinforce what kids have already learned, or to introduce a new topic in a low-pressure, fun way.</p>
          </div>
        </div>
      </section>

      {/* Blurb + CTA */}
      <section className="py-14 px-6">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row md:items-center gap-6">
          <p className="text-base leading-relaxed flex-1">
            Game-based learning improves retention and keeps kids engaged far longer than traditional methods. Every game on this site is designed to build real knowledge — through play.
          </p>
          <Link href="/games" className="flex-shrink-0 inline-flex items-center font-bold text-sm px-6 py-2.5 rounded-lg bg-[#55b6ca] text-white border-2 border-[#55b6ca] hover:bg-white hover:text-[#238FA4] transition-all">
            See all games →
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[#3d3d3d] py-14 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="sender-form-field" data-sender-form-id="bkR0lK"></div>
        </div>
      </section>
    </>
  )
}
