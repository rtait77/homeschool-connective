import Image from 'next/image'
import Link from 'next/link'

const featuredGames = [
  {
    title: 'Solar System Sizzle',
    desc: 'Learn three facts about each object in the solar system through themed drag-and-drop meals. First stop: Sunshine Soup!',
    thumb: '/thumb-sss.png',
    url: 'https://view.genially.com/68b468a36df9dbd6433fe511',
  },
  {
    title: 'Ordering the Planets',
    desc: 'Click the planets in order from the Sun. Watch them line up one by one as you get each correct, then finish with a drag-and-drop challenge!',
    thumb: '/thumb-otp.png',
    url: 'https://view.genially.com/68164fbb7306f160f7843510',
  },
]

const miniGames = [
  { title: 'Planets Puzzle – Easy', thumb: '/thumb-puzzle-easy.png', url: 'https://view.genially.com/699b8c77ce57456e07ab6ec6' },
  { title: 'Planets Puzzle – Medium', thumb: '/thumb-puzzle-medium.png', url: 'https://view.genially.com/69a5d5b1282f9454912a042b' },
  { title: 'Planets Puzzle – Hard', thumb: '/thumb-puzzle-hard.png', url: 'https://view.genially.com/69a5df176426fe803ea50975' },
  { title: 'Planets Puzzle – Very Hard', thumb: '/thumb-puzzle-vhard.png', url: 'https://view.genially.com/69a5df422695874f19c26146' },
]

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
            <Link href="/games" className="inline-flex items-center font-bold text-sm px-6 py-3 rounded-lg bg-[#ed7c5a] text-white border-2 border-[#ed7c5a] hover:bg-white hover:text-[#ed7c5a] transition-all">
              Browse Our Games
            </Link>
            <Link href="/about" className="inline-flex items-center font-bold text-sm px-6 py-3 rounded-lg bg-[#55b6ca] text-white border-2 border-[#55b6ca] hover:bg-white hover:text-[#238FA4] transition-all">
              About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Games */}
      <section className="max-w-[1100px] mx-auto px-6 py-14">
        <h2 className="text-[1.75rem] font-extrabold mb-8">Play Now</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredGames.map((game) => (
            <div key={game.title} className="bg-white rounded-[14px] overflow-hidden flex flex-col" style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
              <a href={game.url} target="_blank" rel="noopener noreferrer">
                <div className="relative h-48 w-full bg-[#e8e4dc]">
                  <Image src={game.thumb} alt={game.title} fill className="object-cover" />
                </div>
              </a>
              <div className="p-5 flex flex-col flex-1">
                <a href={game.url} target="_blank" rel="noopener noreferrer" className="font-extrabold text-lg hover:text-[#ed7c5a] transition-colors mb-2">
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

        <p className="text-sm font-extrabold text-[#5c5c5c] uppercase tracking-widest mt-10 mb-4">Mini Games</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {miniGames.map((game) => (
            <a key={game.title} href={game.url} target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-[14px] overflow-hidden hover:shadow-lg transition-shadow"
              style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
              <div className="relative h-32 w-full bg-[#e8e4dc]">
                <Image src={game.thumb} alt={game.title} fill className="object-cover" />
              </div>
              <div className="p-3">
                <p className="font-bold text-sm">{game.title}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="flex gap-4 mt-8">
          <Link href="/games" className="inline-flex items-center font-bold text-sm px-6 py-2.5 rounded-lg bg-[#55b6ca] text-white border-2 border-[#55b6ca] hover:bg-white hover:text-[#238FA4] transition-all">
            See all games →
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[#f5f1e9] py-14 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="sender-form-field" data-sender-form-id="bkR0lK"></div>
        </div>
      </section>
    </>
  )
}
