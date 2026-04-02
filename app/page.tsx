import Image from 'next/image'
import Link from 'next/link'
import { Nunito, DM_Sans } from 'next/font/google'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['800', '900'],
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '700'],
})

const ALL_TOPICS = [
  'Ocean Animals', 'Dinosaurs', 'The 7 Continents', 'Extreme Environments',
  'Natural Disasters', 'Aviation', 'Animal Homes', 'Arctic Animals',
  'Human Body', 'Insects', 'Rocks & Minerals', 'Sharks',
  'Simple Circuits', 'Seasons', 'The Sun', 'Weather',
]

export default async function PreviewHomePage() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s+/g, '')
  )
  const { count: resourceCount } = await admin
    .from('resources')
    .select('*', { count: 'exact', head: true })

  // Duplicate for seamless marquee loop
  const marqueeItems = [...ALL_TOPICS, ...ALL_TOPICS]

  return (
    <div className={`${nunito.variable} ${dmSans.variable}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .ph-page { font-family: var(--font-body), system-ui, sans-serif; }
        .ph-page p, .ph-page li { font-family: var(--font-body), system-ui, sans-serif; }
        .ph-display {
          font-family: var(--font-display), system-ui, sans-serif;
          font-weight: 900;
          font-style: normal;
          line-height: 1.1;
        }
        .ph-display-italic {
          font-family: var(--font-display), system-ui, sans-serif;
          font-weight: 900;
          font-style: italic;
        }
        .ph-section-heading {
          font-family: var(--font-display), system-ui, sans-serif;
          font-weight: 800;
          font-style: normal;
          line-height: 1.2;
        }
        .hero-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 24px 40px;
          display: grid;
          grid-template-columns: 38fr 62fr;
          gap: 48px;
          align-items: center;
        }
        .hero-video-col {
          min-width: 0;
        }
        .hero-video-depth-wrap {
          position: relative;
          padding-bottom: 12px;
          padding-right: 12px;
        }
        .hero-video-depth-block {
          position: absolute;
          bottom: 0;
          right: 0;
          width: calc(100% - 12px);
          height: calc(100% - 12px);
          background: rgba(85,182,202,0.3);
          border-radius: 16px;
          z-index: 0;
        }
        .hero-video-box {
          line-height: 0;
          position: relative;
          z-index: 1;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        }
        .hero-video-box video { width: 100%; height: auto; display: block; }
        .hero-ctas { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
        .hero-btn-primary {
          display: inline-flex; align-items: center;
          font-weight: 800; font-size: 0.875rem;
          padding: 12px 24px; border-radius: 10px;
          background: #ed7c5a; color: white;
          text-decoration: none; transition: opacity 0.15s;
        }
        .hero-btn-primary:hover { opacity: 0.88; }
        .hero-btn-secondary {
          display: inline-flex; align-items: center;
          font-weight: 700; font-size: 0.875rem;
          padding: 12px 24px; border-radius: 10px;
          background: transparent; color: #55b6ca;
          border: 2px solid #55b6ca;
          text-decoration: none; transition: all 0.15s;
        }
        .hero-btn-secondary:hover { background: #55b6ca; color: white; }
        @media (max-width: 900px) {
          .hero-wrap { grid-template-columns: 40fr 60fr; gap: 32px; padding: 40px 20px 32px; }
        }
        @media (max-width: 640px) {
          .hero-wrap { grid-template-columns: 1fr; gap: 28px; padding: 32px 20px 32px; }
          .hero-text { text-align: center; order: 1; }
          .hero-video-col { order: 2; }
          .hero-ctas { justify-content: center; }
        }
        /* Marquee */
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .marquee-outer {
          overflow: hidden;
          width: 100%;
          mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 38s linear infinite;
          will-change: transform;
        }
        .marquee-item {
          display: flex;
          align-items: center;
          gap: 0;
          white-space: nowrap;
          font-family: var(--font-body), system-ui, sans-serif;
          font-size: 1rem;
          font-weight: 400;
          color: #4a4a4a;
          padding: 0 20px;
        }
        .marquee-dot {
          color: #55b6ca;
          font-size: 1.2rem;
          margin-left: 20px;
        }
      `}} />

      <div className="ph-page">
        {/* Hero */}
        <section style={{ background: '#f5f1e9', paddingBottom: '0' }}>
          <div className="hero-wrap">
            <div className="hero-text">
              <h1 className="ph-display mb-4" style={{ fontSize: 'clamp(2.2rem, 3.2vw, 3.4rem)' }}>
                Learning That Feels Like{' '}
                <span className="ph-display-italic" style={{ color: '#ed7c5a' }}>Playing</span>
              </h1>
              <p style={{ fontSize: '1.125rem', color: '#5c5c5c', marginBottom: '28px', lineHeight: '1.7', fontFamily: 'var(--font-body)' }}>
                Plus, ongoing homeschool support for parents.
              </p>
              <div className="hero-ctas">
                <a href="/learn" className="hero-btn-primary">Play &amp; Learn</a>
                <a href="/consulting" className="hero-btn-secondary">Get Homeschool Help →</a>
              </div>
            </div>
            <div className="hero-video-col">
              <div className="hero-video-depth-wrap">
                <div className="hero-video-depth-block" />
                <div className="hero-video-box">
                  <video autoPlay muted playsInline loop style={{ width: '100%', height: 'auto', display: 'block' }}>
                    <source src="/new-hero-video.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
            </div>
          </div>
          {/* cream → white */}
          <div style={{ lineHeight: 0, marginTop: -2 }}>
            <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
              <path d="M0,56 L0,28 C360,56 1080,0 1440,32 L1440,56 Z" fill="#ffffff" />
            </svg>
          </div>
        </section>

        {/* Games Grid */}
        <section className="bg-white px-6 py-14 relative overflow-hidden">
          <div className="max-w-[1100px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: '#ed7c5a', letterSpacing: '0.1em' }}>Games &amp; Lessons</p>
                <h2 className="ph-section-heading text-2xl">Real content through play.</h2>
              </div>
              <a href="#newsletter" className="text-sm font-bold text-[#55b6ca] hover:underline whitespace-nowrap mt-1 sm:mt-0 flex-shrink-0 self-start">
                Get notified of new games →
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

              {/* Featured — Mars */}
              <a href="https://view.genially.com/699e69be43a96797318311da"
                className="col-span-2 bg-white rounded-[16px] overflow-hidden flex flex-col hover:shadow-lg transition-shadow" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.09)' }}>
                <div className="relative flex-1 min-h-[200px] w-full bg-[#0d1b2a]">
                  <Image src="/thumb-lesson-mars.png" alt="Mission to Mars" fill className="object-cover" />
                  <span className="absolute top-3 left-3 bg-[#55b6ca] text-white text-xs font-extrabold px-3 py-1 rounded-full">Lesson</span>
                </div>
                <div className="p-3 flex-shrink-0">
                  <h3 className="font-extrabold text-sm leading-tight mb-2">Mission to Mars</h3>
                  <span className="text-xs font-bold text-[#ed7c5a]">Start lesson →</span>
                </div>
              </a>

              {/* Ordering the Planets */}
              <a href="https://view.genially.com/68164fbb7306f160f7843510"
                className="bg-white rounded-[16px] overflow-hidden flex flex-col hover:shadow-lg transition-shadow" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.09)' }}>
                <div className="relative flex-1 min-h-[200px] w-full bg-[#e8e4dc]">
                  <Image src="/ordering-the-planets-thumbnail.png" alt="Ordering the Planets" fill className="object-cover" />
                  <span className="absolute top-2 left-2 bg-[#ed7c5a] text-white text-xs font-extrabold px-2.5 py-1 rounded-full">Free</span>
                </div>
                <div className="p-3 flex-shrink-0">
                  <h3 className="text-sm font-bold leading-tight mb-2">Ordering the Planets</h3>
                  <span className="text-xs font-bold text-[#ed7c5a]">Play →</span>
                </div>
              </a>

              {/* Solar System Sizzle */}
              <a href="https://view.genially.com/69b83b3bc0b7be2f9910da3e"
                className="bg-white rounded-[16px] overflow-hidden flex flex-col hover:shadow-lg transition-shadow" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.09)' }}>
                <div className="relative flex-1 min-h-[200px] w-full bg-[#e8e4dc]">
                  <Image src="/thumb-sss.png" alt="Solar System Sizzle" fill className="object-cover" />
                  <span className="absolute top-2 left-2 bg-[#ed7c5a] text-white text-xs font-extrabold px-2.5 py-1 rounded-full">Free Demo</span>
                </div>
                <div className="p-3 flex-shrink-0">
                  <h3 className="text-sm font-bold leading-tight mb-2">Solar System Sizzle</h3>
                  <span className="text-xs font-bold text-[#ed7c5a]">Play →</span>
                </div>
              </a>

              {/* Asteroid Blast */}
              <a href="/asteroid-blast-planets.html"
                className="bg-white rounded-[16px] overflow-hidden flex flex-col hover:shadow-lg transition-shadow" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.09)' }}>
                <div className="relative h-32 w-full bg-[#e8e4dc]">
                  <Image src="/asteroid-thumbnail-planets.jpg" alt="Asteroid Blast" fill className="object-cover" />
                  <span className="absolute top-2 left-2 bg-[#d94f4f] text-white text-xs font-extrabold px-2.5 py-1 rounded-full">Arcade</span>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="text-sm font-bold leading-tight mb-2">Blast the Planets</h3>
                  <span className="mt-auto text-xs font-bold text-[#ed7c5a]">Play →</span>
                </div>
              </a>

              {/* Saturn Puzzle */}
              <a href="/puzzle-saturn-medium.html"
                className="bg-white rounded-[16px] overflow-hidden flex flex-col hover:shadow-lg transition-shadow" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.09)' }}>
                <div className="relative h-32 w-full bg-[#e8e4dc]">
                  <Image src="/saturn-with-background.png" alt="Saturn Puzzle" fill className="object-cover" />
                  <span className="absolute top-2 left-2 bg-[#8b72be] text-white text-xs font-extrabold px-2.5 py-1 rounded-full">Puzzle</span>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="text-sm font-bold leading-tight mb-2">Saturn Puzzle</h3>
                  <span className="mt-auto text-xs font-bold text-[#ed7c5a]">Play →</span>
                </div>
              </a>

              {/* Word Search */}
              <a href="/word-search-inner-solar-system.html"
                className="bg-white rounded-[16px] overflow-hidden flex flex-col hover:shadow-lg transition-shadow" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.09)' }}>
                <div className="relative h-32 w-full bg-[#e8e4dc]">
                  <Image src="/word-search-inner-solar-system-thumbnail.png" alt="Word Search" fill className="object-cover" />
                  <span className="absolute top-2 left-2 bg-[#4a90c4] text-white text-xs font-extrabold px-2.5 py-1 rounded-full">Word Search</span>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="text-sm font-bold leading-tight mb-2">Inner Solar System Word Search</h3>
                  <span className="mt-auto text-xs font-bold text-[#ed7c5a]">Play →</span>
                </div>
              </a>

              {/* Find a Pair */}
              <a href="/matching-dwarf-planets.html"
                className="bg-white rounded-[16px] overflow-hidden flex flex-col hover:shadow-lg transition-shadow" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.09)' }}>
                <div className="relative h-32 w-full bg-[#e8e4dc]">
                  <Image src="/dwarf-planets-matching-game-thumbnail.png" alt="Find a Pair" fill className="object-cover" />
                  <span className="absolute top-2 left-2 bg-[#5bab8a] text-white text-xs font-extrabold px-2.5 py-1 rounded-full">Find a Pair</span>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="text-sm font-bold leading-tight mb-2">Find a Pair: Dwarf Planets</h3>
                  <span className="mt-auto text-xs font-bold text-[#ed7c5a]">Play →</span>
                </div>
              </a>

            </div>

            <div className="mt-8 text-center">
              <Link href="/learn" className="text-sm font-bold text-[#55b6ca] hover:underline">See all games and lessons →</Link>
            </div>
            <p className="text-xs text-[#a09890] mt-4">*Games and lessons are secular.</p>
          </div>
          {/* white → cream */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0, pointerEvents: 'none', zIndex: 2 }}>
            <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
              <path d="M0,56 L0,48 C360,0 1080,48 1440,16 L1440,56 Z" fill="#f5f1e9" />
            </svg>
          </div>
        </section>

        {/* Consulting */}
        <section className="px-6 py-16 relative overflow-hidden bg-[#f5f1e9]" style={{ marginTop: -2 }}>
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-10 bg-white pointer-events-none" />
          <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full opacity-10 bg-white pointer-events-none" />
          <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center gap-10 relative">
            <div className="w-full md:w-2/5 flex-shrink-0" style={{ minHeight: '420px', position: 'relative' }}>
              <div className="relative w-full h-full rounded-2xl overflow-hidden" style={{ minHeight: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.15)' }}>
                <Image src="/new-hero-image-homepage.jpg" alt="Homeschool consulting" fill className="object-cover" style={{ objectPosition: 'center 40%' }} />
              </div>
            </div>
            <div className="md:w-3/5">
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#55b6ca] mb-3" style={{ letterSpacing: '0.1em' }}>Homeschool Help</p>
              <h2 className="ph-section-heading text-3xl mb-4 text-[#3a3a3a]">Struggling with homeschooling?</h2>
              <p className="text-lg leading-relaxed text-[#5c5c5c] mb-8" style={{ fontFamily: 'var(--font-body)' }}>
                Use our deep matching system to get curriculum recommendations and uncover your child&apos;s learning style, your teaching style, and which homeschool methods may be best for your family. Plus ongoing homeschool support.
              </p>
              {resourceCount && (
                <p className="text-sm text-[#5c5c5c] mb-6" style={{ fontFamily: 'var(--font-body)' }}>
                  <span className="text-2xl font-extrabold text-[#238FA4]">{resourceCount}</span>{' '}
                  curated resources in our database (secular and Christian) ...and growing
                </p>
              )}
              <Link href="/consulting" className="inline-flex items-center font-extrabold text-sm px-6 py-3 rounded-xl bg-[#238FA4] text-white hover:opacity-90 transition">
                Learn More →
              </Link>
            </div>
          </div>
          {/* cream → white */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0, pointerEvents: 'none', zIndex: 2 }}>
            <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
              <path d="M0,56 L0,32 C480,56 960,8 1440,40 L1440,56 Z" fill="#fff" />
            </svg>
          </div>
        </section>

        {/* Printables */}
        <section id="printables" className="bg-white px-6 py-14 relative overflow-hidden" style={{ marginTop: -2 }}>
          <div className="max-w-[1100px] mx-auto">
            <div className="mb-8">
              <p className="text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: '#ed7c5a', letterSpacing: '0.1em' }}>Printables</p>
              <h2 className="ph-section-heading text-2xl">Take learning offline.</h2>
              <p className="text-[#5c5c5c] mt-1" style={{ fontFamily: 'var(--font-body)' }}>Ready-to-use worksheets and activities for your homeschool.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: 'Layers of the Sun', file: 'website-pdf-layers-sun-coloring.pdf', thumb: '/website-pdf-layers-sun-coloring.png' },
                { title: 'Red Spot Weather Report', file: 'website-pdf-red-spot-weather-report.pdf', thumb: '/website-pdf-red-spot-weather-report.png' },
                { title: 'Create a Solar System', file: 'website-pdf-create-a-solar-system.pdf', thumb: '/website-pdf-create-a-solar-system.png' },
                { title: 'Earth Puzzles', file: 'website-pdf-earth-puzzles.pdf', thumb: '/website-pdf-earth-puzzles.png' },
              ].map(({ title, file, thumb }) => (
                <div key={title} className="bg-white rounded-[14px] overflow-hidden flex flex-col" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                  <div className="relative w-full bg-white" style={{ aspectRatio: '8.5/11' }}>
                    <Image src={thumb} alt={title} fill className="object-contain" />
                  </div>
                  <div className="p-3 bg-[#f5f1e9] flex flex-col gap-1">
                    <p className="text-xs font-bold leading-snug">{title}</p>
                    <a href={`/${file}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#ed7c5a] hover:underline">Get PDF →</a>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#a09890] mt-4">*Full access to all printables with subscription.</p>
          </div>
          {/* white → cream (no coral wave) */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0, pointerEvents: 'none', zIndex: 2 }}>
            <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
              <path d="M0,56 L0,16 C360,56 1080,8 1440,48 L1440,56 Z" fill="#f5f1e9" />
            </svg>
          </div>
        </section>

        {/* Coming Soon — marquee */}
        <section className="bg-[#f5f1e9] px-6 py-12 relative overflow-hidden" style={{ marginTop: -2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', transform: 'translateY(-16px)' }}>
            <div style={{ textAlign: 'center' }}>
              <p className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: '#55b6ca', letterSpacing: '0.1em' }}>In the Works</p>
              <h2 className="ph-section-heading text-2xl" style={{ color: '#3a3a3a' }}>More topics are in discussion:</h2>
            </div>
          <div className="marquee-outer" style={{ width: '100%' }}>
            <div className="marquee-track">
              {marqueeItems.map((topic, i) => (
                <span key={i} className="marquee-item">
                  {topic}
                  <span className="marquee-dot">·</span>
                </span>
              ))}
            </div>
          </div>
          </div>
          {/* cream → white */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0, pointerEvents: 'none', zIndex: 2 }}>
            <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
              <path d="M0,56 L0,32 C480,56 960,8 1440,40 L1440,56 Z" fill="#fff" />
            </svg>
          </div>
        </section>

        {/* Homeschool Tips */}
        <section className="bg-white px-6 py-14 relative overflow-hidden" style={{ marginTop: -2 }}>
          <div className="max-w-[1100px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: '#ed7c5a', letterSpacing: '0.1em' }}>Homeschool Tips</p>
                <h2 className="ph-section-heading text-2xl">Ideas that work.</h2>
                <p className="text-[#5c5c5c] mt-1" style={{ fontFamily: 'var(--font-body)' }}>Strategies and inspiration for your homeschool journey.</p>
              </div>
              <Link href="/tips" className="text-sm font-bold text-[#55b6ca] hover:underline whitespace-nowrap mt-1 sm:mt-0 flex-shrink-0 self-start">
                See all posts →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/tips/why-play-is-important" className="bg-white rounded-[14px] overflow-hidden flex flex-col hover:shadow-lg transition-shadow" style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.13)' }}>
                <div className="relative w-full bg-[#f5f1e9]" style={{ height: '220px' }}>
                  <Image src="/blog-play-blocks.avif" alt="Why Play is Important" fill className="object-cover" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs text-[#a09890] mb-1" style={{ fontFamily: 'var(--font-body)' }}>October 21, 2025 · Game-Based Learning</p>
                  <h3 className="text-base font-bold mb-2">Why Play is Important</h3>
                  <p className="text-sm text-[#5c5c5c] flex-1 line-clamp-3" style={{ fontFamily: 'var(--font-body)' }}>Play&apos;s essential function in homeschooling: fostering development and education through curiosity and hands-on exploration.</p>
                  <span className="mt-4 text-sm font-bold text-[#ed7c5a]">Read more →</span>
                </div>
              </Link>
              <Link href="/tips/learning-styles" className="bg-white rounded-[14px] overflow-hidden flex flex-col hover:shadow-lg transition-shadow" style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.13)' }}>
                <div className="relative w-full bg-[#f5f1e9]" style={{ height: '220px' }}>
                  <Image src="/blog-ls-infographic.avif" alt="Learning Styles" fill className="object-cover" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs text-[#a09890] mb-1" style={{ fontFamily: 'var(--font-body)' }}>August 5, 2025 · Homeschool Planning</p>
                  <h3 className="text-base font-bold mb-2">Learning Styles</h3>
                  <p className="text-sm text-[#5c5c5c] flex-1 line-clamp-3" style={{ fontFamily: 'var(--font-body)' }}>Understanding how your child learns best — and how to build a homeschool around their natural strengths.</p>
                  <span className="mt-4 text-sm font-bold text-[#ed7c5a]">Read more →</span>
                </div>
              </Link>
              <Link href="/tips/deschooling" className="bg-white rounded-[14px] overflow-hidden flex flex-col hover:shadow-lg transition-shadow" style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.13)' }}>
                <div className="relative w-full bg-[#f5f1e9]" style={{ height: '220px' }}>
                  <Image src="/blog-deschooling-kids-log.avif" alt="Deschooling" fill className="object-cover" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs text-[#a09890] mb-1" style={{ fontFamily: 'var(--font-body)' }}>April 28, 2025 · Getting Started</p>
                  <h3 className="text-base font-bold mb-2">Deschooling</h3>
                  <p className="text-sm text-[#5c5c5c] flex-1 line-clamp-3" style={{ fontFamily: 'var(--font-body)' }}>Making the switch to homeschooling? Deschooling is the often-overlooked first step — and skipping it is one of the most common mistakes new homeschoolers make.</p>
                  <span className="mt-4 text-sm font-bold text-[#ed7c5a]">Read more →</span>
                </div>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
