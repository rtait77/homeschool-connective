import Image from 'next/image'

const fullGames = [
  {
    title: 'Solar System Sizzle',
    desc: 'Learn three facts about each object in the solar system through themed drag-and-drop meals. First stop: Sunshine Soup!',
    thumb: '/thumb-sss.png',
    url: 'https://view.genially.com/68b468a36df9dbd6433fe511',
    topic: 'Solar System',
  },
  {
    title: 'Ordering the Planets',
    desc: 'Click the planets in order from the Sun. Watch them line up one by one as you get each correct, then finish with a drag-and-drop challenge!',
    thumb: '/thumb-otp.png',
    url: 'https://view.genially.com/68164fbb7306f160f7843510',
    topic: 'Solar System',
  },
]

const miniGames = [
  {
    title: 'Planets Puzzle – Easy',
    desc: 'Piece together the planets of the solar system in this beginner-friendly jigsaw puzzle.',
    thumb: '/thumb-puzzle-easy.png',
    url: 'https://view.genially.com/699b8c77ce57456e07ab6ec6',
  },
  {
    title: 'Planets Puzzle – Medium',
    desc: 'A step up in difficulty — can you put all the planets together from memory?',
    thumb: '/thumb-puzzle-medium.png',
    url: 'https://view.genially.com/69a5d5b1282f9454912a042b',
  },
  {
    title: 'Planets Puzzle – Hard',
    desc: 'Think you know the solar system? This harder jigsaw will put you to the test!',
    thumb: '/thumb-puzzle-hard.png',
    url: 'https://view.genially.com/69a5df176426fe803ea50975',
  },
  {
    title: 'Planets Puzzle – Very Hard',
    desc: 'The ultimate planets jigsaw challenge. Only the most dedicated space explorers need apply!',
    thumb: '/thumb-puzzle-vhard.png',
    url: 'https://view.genially.com/69a5df422695874f19c26146',
  },
]

export default function GamesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-2">Games</h1>
      <p className="text-[#6b7280] mb-10">
        Browse all our interactive educational games. New games added regularly!
      </p>

      {/* Solar System Section */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🪐</span>
          <h2 className="text-xl font-extrabold">Solar System</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {fullGames.map((game) => (
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
        <h3 className="text-sm font-extrabold mb-4 text-[#6b7280] uppercase tracking-wide" id="mini-games">
          Mini Games
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {miniGames.map((game) => (
            <div key={game.title} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <a href={game.url} target="_blank" rel="noopener noreferrer">
                <div className="relative h-32 w-full bg-[#e8e4dc]">
                  <Image src={game.thumb} alt={game.title} fill className="object-cover" />
                </div>
              </a>
              <div className="p-4 flex flex-col flex-1">
                <a
                  href={game.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-sm hover:text-[#ed7c5a] transition-colors mb-1"
                >
                  {game.title}
                </a>
                <p className="text-xs text-[#6b7280] flex-1">{game.desc}</p>
                <a
                  href={game.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block bg-[#ed7c5a] hover:bg-[#d4623f] text-white font-bold px-4 py-1.5 rounded-full text-xs transition-colors text-center"
                >
                  ▶ Play Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Coming Soon */}
      <section className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-[#e5e7eb]">
        <p className="text-2xl mb-2">🌊 🦋 🌿</p>
        <h2 className="text-xl font-extrabold mb-2">More Topics Coming Soon</h2>
        <p className="text-[#6b7280] text-sm">
          Marine Biology, Weather, Plants, and more are in the works. Subscribe to our newsletter to be the first to know!
        </p>
      </section>
    </div>
  )
}
