import Image from 'next/image'
import Link from 'next/link'

const featuredGames = [
  {
    title: 'Solar System Sizzle',
    desc: 'Learn three facts about each object in the solar system through themed drag-and-drop meals.',
    thumb: '/thumb-sss.png',
    url: 'https://view.genially.com/68b468a36df9dbd6433fe511',
  },
  {
    title: 'Ordering the Planets',
    desc: 'Click the planets in order from the Sun. Watch them line up one by one as you get each correct!',
    thumb: '/thumb-otp.png',
    url: 'https://view.genially.com/68164fbb7306f160f7843510',
  },
]

const miniGames = [
  {
    title: 'Planets Puzzle – Easy',
    thumb: '/thumb-puzzle-easy.png',
    url: 'https://view.genially.com/699b8c77ce57456e07ab6ec6',
  },
  {
    title: 'Planets Puzzle – Medium',
    thumb: '/thumb-puzzle-medium.png',
    url: 'https://view.genially.com/69a5d5b1282f9454912a042b',
  },
  {
    title: 'Planets Puzzle – Hard',
    thumb: '/thumb-puzzle-hard.png',
    url: 'https://view.genially.com/69a5df176426fe803ea50975',
  },
  {
    title: 'Planets Puzzle – Very Hard',
    thumb: '/thumb-puzzle-vhard.png',
    url: 'https://view.genially.com/69a5df422695874f19c26146',
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#f5f1e9] py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Learning That Feels Like{' '}
            <em className="text-[#ed7c5a] not-italic">Playing</em>
          </h1>
          <p className="text-lg text-[#6b7280] mb-8">
            Interactive, game-based learning for homeschoolers and educators
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/games"
              className="bg-[#ed7c5a] hover:bg-[#d4623f] text-white font-bold px-8 py-3 rounded-full transition-colors"
            >
              Browse Our Games
            </Link>
            <Link
              href="/about"
              className="bg-white border-2 border-[#55b6ca] text-[#3a9aae] hover:bg-[#55b6ca] hover:text-white font-bold px-8 py-3 rounded-full transition-colors"
            >
              About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Games */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-extrabold mb-6">Play Now</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredGames.map((game) => (
            <div key={game.title} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <a href={game.url} target="_blank" rel="noopener noreferrer">
                <div className="relative h-48 w-full bg-[#e8e4dc]">
                  <Image src={game.thumb} alt={game.title} fill className="object-cover" />
                </div>
              </a>
              <div className="p-5 flex flex-col flex-1">
                <a
                  href={game.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-extrabold text-lg hover:text-[#ed7c5a] transition-colors mb-2"
                >
                  {game.title}
                </a>
                <p className="text-sm text-[#6b7280] flex-1">{game.desc}</p>
                <a
                  href={game.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block bg-[#ed7c5a] hover:bg-[#d4623f] text-white font-bold px-6 py-2 rounded-full text-sm transition-colors text-center"
                >
                  ▶ Play Now
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Mini Games */}
        <h3 className="text-sm font-extrabold mt-10 mb-4 text-[#6b7280] uppercase tracking-wide">
          Mini Games
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {miniGames.map((game) => (
            <a
              key={game.title}
              href={game.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative h-32 w-full bg-[#e8e4dc]">
                <Image src={game.thumb} alt={game.title} fill className="object-cover" />
              </div>
              <div className="p-3">
                <p className="font-bold text-sm">{game.title}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/games"
            className="border-2 border-[#55b6ca] text-[#3a9aae] hover:bg-[#55b6ca] hover:text-white font-bold px-6 py-2 rounded-full text-sm transition-colors"
          >
            See all games →
          </Link>
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="bg-[#ed7c5a] text-white py-14 px-4 text-center mt-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-3">Join Our Newsletter</h2>
          <p className="mb-6 text-white/90">
            Get new games, homeschool tips, and resources delivered to your inbox.
          </p>
          <div className="sender-form-field" data-sender-form-id="bkR0lK"></div>
        </div>
      </section>
    </>
  )
}
