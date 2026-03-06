import Image from 'next/image'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="max-w-[780px] mx-auto px-6 py-12">
      <Link href="/tips" className="text-sm font-bold text-[#238FA4] hover:underline">← Back to Homeschool Tips</Link>
      <p className="text-sm text-[#5c5c5c] mt-6 mb-2">November 11, 2025</p>
      <h1 className="text-3xl font-extrabold mb-8">Learning Styles</h1>

      <div className="relative w-full h-64 mb-8 rounded-xl overflow-hidden">
        <Image src="/blog-ls-banner.avif" alt="Learning Styles" fill className="object-cover" />
      </div>

      <p className="mb-4 leading-relaxed">Ah, the wild world of homeschooling! Back when I started, the idea of learning styles was as mysterious to me as finding socks in the dryer. My son and I were flying by the seat of our pants! 🤣 It wasn't until I found myself teaching in a homeschool co-op years later that I stumbled upon the revelation that we all dance to different educational beats!</p>

      <p className="mb-4 leading-relaxed">Cue the research montage! I dove headfirst into learning about various styles and began the epic quest of assessing not only my own kids but also my students. Once I cracked the code on their individual learning styles, it was like unlocking a treasure chest! Their behavior improved, frustration decreased, and they were as happy as clams during their lessons! And let me tell you, I was over the moon, too! No more pulling my hair out – teaching became a joy ride!</p>

      <p className="mb-4 leading-relaxed">But wait, there's more! Along the way, I uncovered my own learning style, turning me into a superhero teacher-mom combo! 💪 I've since sprinkled my newfound knowledge like fairy dust, enchanting my grandkids' learning journeys!</p>

      <p className="mb-4 leading-relaxed">Here's the scoop on my kiddos' learning styles: my daughter's a visual wizard, my oldest son's got the moves with kinesthetic flair, my middle son's also rocking the visual vibe, and my youngest son's a kinesthetic dynamo. And guess what? I'm a proud member of the kinesthetic club myself!</p>

      <p className="mb-8 leading-relaxed">I hope you enjoy unlocking your kids' learning style!</p>

      <div className="text-center mb-8">
        <a
          href="/learning-styles.pdf"
          download
          className="inline-flex items-center font-bold text-sm px-6 py-3 rounded-lg bg-[#55b6ca] text-white border-2 border-[#55b6ca] hover:bg-white hover:text-[#238FA4] transition-all"
        >
          ⬇ Download free Learning Styles PDF
        </a>
      </div>

      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-[500px] h-72 rounded-xl overflow-hidden">
          <Image src="/blog-ls-infographic.avif" alt="Learning Styles infographic" fill className="object-contain" />
        </div>
      </div>

      <div className="relative w-full h-40 rounded-xl overflow-hidden">
        <Image src="/blog-thanks.avif" alt="Thanks for reading" fill className="object-cover" />
      </div>

      <div className="mt-10 pt-8 border-t border-[#ddd8cc]">
        <div className="sender-form-field" data-sender-form-id="bkR0lK"></div>
      </div>
    </div>
  )
}
