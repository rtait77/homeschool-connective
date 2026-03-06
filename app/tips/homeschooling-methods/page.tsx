import Image from 'next/image'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="max-w-[780px] mx-auto px-6 py-12">
      <Link href="/tips" className="text-sm font-bold text-[#238FA4] hover:underline">← Back to Homeschool Tips</Link>
      <p className="text-sm text-[#5c5c5c] mt-6 mb-2">November 11, 2025</p>
      <h1 className="text-3xl font-extrabold mb-8">Homeschooling Methods</h1>

      <div className="relative w-full h-64 mb-8 rounded-xl overflow-hidden">
        <Image src="/blog-methods-banner.avif" alt="Homeschooling Methods" fill className="object-cover" />
      </div>

      <p className="mb-4 leading-relaxed">Lately, homeschooling has been getting pretty popular. More and more families are into it, wanting to customize education to match their kids' needs and interests. And with this trend, there are tons of ways to do homeschooling. They've all got their own styles and ideas about teaching. So, whether you're just starting out or wanting to tweak what you're already doing, checking out different methods can help you figure out what works best for your fam's learning adventure.</p>

      <p className="mb-4 leading-relaxed">In the beginning of our homeschooling journey, we tried several methods. After much trial and error, we decided an eclectic method would be the right fit for our family. Having four kids with four different learning styles, made it difficult to execute other method choices. I enjoy pulling resources together from a variety of curriculum, downloadable resources, unit studies and board games.</p>

      <p className="mb-8 leading-relaxed">As you check out these homeschooling methods, just remember there's no one-size-fits-all deal when it comes to education. Each method has its perks and quirks, and what clicks for one family might not do the trick for another. So, think about what your family values, your goals, and how your kid learns best. You might even find that mixing it up or doing your own thing works out best. The cool thing about homeschooling is you can bend and flex to make it work for you, giving your kid(s) a custom learning experience that sparks their curiosity and helps them grow. Whether you choose the traditional, classical, Montessori, free-flowing unschooling, or Charlotte Mason styles—or maybe even a mash-up of a few—just roll with it and enjoy the ride of homeschooling.</p>

      <div className="text-center mb-8">
        <a
          href="/homeschooling-methods.pdf"
          download
          className="inline-flex items-center font-bold text-sm px-6 py-3 rounded-lg bg-[#55b6ca] text-white border-2 border-[#55b6ca] hover:bg-white hover:text-[#238FA4] transition-all"
        >
          ⬇ Download Homeschooling Methods PDF
        </a>
      </div>

      <img src="/blog-thanks.avif" alt="Thanks for reading" className="w-full rounded-xl" />

      <div className="mt-10 pt-8 border-t border-[#ddd8cc]">
        <div className="sender-form-field" data-sender-form-id="bkR0lK"></div>
      </div>
    </div>
  )
}
