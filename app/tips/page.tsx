const posts = [
  {
    href: '/tips/why-play-is-important',
    img: '/blog-play-blocks.avif',
    date: 'November 11, 2025',
    tag: 'Game-Based Learning',
    title: 'Why Play is Important',
    excerpt: "Play's Essential Function in Homeschooling: Fostering Development and Education. Homeschooling provides a distinctive and adaptable educational path, enabling parents to customize their child's learning...",
  },
  {
    href: '/tips/homeschooling-101',
    img: '/blog-101-coloring.avif',
    date: 'November 11, 2025',
    tag: 'Homeschool Planning',
    title: 'Homeschooling 101',
    excerpt: 'How to Homeschool: Six Steps to Get Started. Getting started with homeschooling can be very overwhelming! We are here to help!',
  },
  {
    href: '/tips/learning-styles',
    img: '/blog-ls-infographic.avif',
    date: 'November 11, 2025',
    tag: 'Homeschool Planning',
    title: 'Learning Styles',
    excerpt: "Ah, the wild world of homeschooling! Back when I started, the idea of learning styles was as mysterious to me as finding socks in the dryer. My son and I were flying by the seat of our pants! 🤣",
  },
  {
    href: '/tips/homeschool-beginnings',
    img: '/blog-beginnings-mel-family.avif',
    date: 'November 10, 2025',
    tag: 'Our Story',
    title: 'Homeschool Beginnings',
    excerpt: "Hi! I'm Mel! I've been married to my wonderful husband for 30 years, and together we've raised four amazing kids. These days, we're enjoying a whole new chapter as grandparents to four grandkids...",
  },
  {
    href: '/tips/homeschooling-methods',
    img: '/blog-methods-coloring.avif',
    date: 'November 11, 2025',
    tag: 'Homeschool Planning',
    title: 'Homeschooling Methods',
    excerpt: "Lately, homeschooling has been getting pretty popular. More and more families are into it, wanting to customize education to match their kids' needs and interests...",
  },
  {
    href: '/tips/deschooling',
    img: '/blog-deschooling-kids-log.avif',
    date: 'November 11, 2025',
    tag: 'Homeschool Planning',
    title: 'Deschooling',
    excerpt: 'Deschooling is the process of adjusting to a learning environment outside of traditional schooling. It involves both children and parents transitioning from structured conventional methods...',
  },
]

import Image from 'next/image'

export default function TipsPage() {
  return (
    <>
      <div className="max-w-[1100px] mx-auto px-6 py-14">
        <h1 className="text-3xl font-extrabold mb-2">Homeschool Tips</h1>
        <p className="text-[#5c5c5c] mb-10">Ideas, strategies, and inspiration for your homeschool journey.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.href} className="bg-white rounded-[14px] overflow-hidden flex flex-col" style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
              <div className="relative w-full bg-[#f5f1e9]" style={{ height: '300px' }}>
                <Image src={post.img} alt={post.title} fill className="object-cover object-center" />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p className="text-xs text-[#5c5c5c] mb-1">{post.date}</p>
                <p className="text-xs font-bold text-[#238FA4] uppercase tracking-wide mb-2">{post.tag}</p>
                <h3 className="font-extrabold text-base mb-2">
                  <a href={post.href} className="hover:text-[#ed7c5a] transition-colors">{post.title}</a>
                </h3>
                <p className="text-sm text-[#5c5c5c] flex-1">{post.excerpt}</p>
                <a href={post.href} className="mt-4 text-sm font-bold text-[#ed7c5a] hover:underline">Read more →</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="bg-[#3d3d3d] py-14 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="sender-form-field" data-sender-form-id="bkR0lK"></div>
        </div>
      </section>
    </>
  )
}
