import Image from 'next/image'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="max-w-[780px] mx-auto px-6 py-12">
      <Link href="/tips" className="text-sm font-bold text-[#238FA4] hover:underline">← Back to Homeschool Tips</Link>
      <p className="text-sm text-[#5c5c5c] mt-6 mb-2">November 10, 2025</p>
      <h1 className="text-3xl font-extrabold mb-8">Homeschool Beginnings</h1>

      <div className="relative w-full h-64 mb-8 rounded-xl overflow-hidden">
        <Image src="/blog-beginnings-banner.avif" alt="Homeschool Beginnings" fill className="object-cover" />
      </div>

      <h2 className="text-xl font-extrabold mb-4">Hi! I'm Mel!</h2>
      <p className="mb-4 leading-relaxed">I've been married to my wonderful husband for 30 years, and together we've raised four amazing kids. These days, we're enjoying a whole new chapter as grandparents to four grandkids—and yes, I'm back to homeschooling, this time with my teen granddaughter!</p>
      <p className="mb-4 leading-relaxed">Our homeschooling story began in 2000, but it wasn't something I planned or even saw coming. At the time, our oldest son was in second grade. One day, his teacher told me he was having trouble reading. That caught me off guard—he had been reading since he was four years old and never had issues in kindergarten or first grade. She also mentioned ADHD, which surprised me even more. This was a kid who could sit and build with LEGOS for hours. He had focus.</p>
      <p className="mb-4 leading-relaxed">I started paying closer attention to the work he brought home, and what I noticed concerned me. More and more often, I had to reteach what he was supposed to be learning in class. I remember joking with him one night, "I could just teach you during the day and have my evenings free!" It was said in jest, but something in my heart started to stir.</p>
      <p className="mb-4 leading-relaxed">By the end of the school year, I felt a strong calling to homeschool him. I didn't know a single thing about homeschooling—how it worked, what I needed to do, or even where to begin. But I had a friend at the time who was homeschooling her kids, and she walked me through the basics. She helped me withdraw him from school and pointed me in the right direction.</p>
      <p className="mb-4 leading-relaxed">That's when our homeschool adventure officially began.</p>
      <p className="mb-1 leading-relaxed">Was it easy? Not at all.</p>
      <p className="mb-1 leading-relaxed">Did I have any idea what I was doing? Definitely not.</p>
      <p className="mb-1 leading-relaxed">Did I buy those inexpensive School Zone workbooks from Walmart? Yep.</p>
      <p className="mb-1 leading-relaxed">Did I have family cheering me on? Nope.</p>
      <p className="mb-4 leading-relaxed">But did I keep going? I sure did.</p>
      <p className="mb-4 leading-relaxed">It was tough at times—especially since I struggled with reading myself due to dyslexia (more on that in another post). But we kept at it. I learned alongside my kids. We made mistakes, adjusted, and grew stronger as a family.</p>
      <p className="mb-8 leading-relaxed">Fast forward to today, and that little boy is now a helicopter mechanic, a Sergeant in the Army National Guard, and a regional commander for the Civil Air Patrol. My other three kids have all found careers they're passionate about and are doing well. And now, I have the joy of homeschooling the next generation—my granddaughter. Homeschooling changed the course of our lives in ways I never expected. It wasn't always easy, but it was worth every single moment.</p>

      <div className="relative w-full h-64 mb-10 rounded-xl overflow-hidden">
        <Image src="/blog-beginnings-mel-family.avif" alt="Mel's homeschool family" fill className="object-cover" />
      </div>

      <h2 className="text-xl font-extrabold mb-4">Hi! I'm Bec!</h2>
      <p className="mb-4 leading-relaxed">I have homeschooled all 3 of my children (still homeschooling the two youngest), and it's been an incredible journey of ups and downs, laughter and tears, productive days and lazy days...and I'm grateful for all the "bad" days just as much as the good ones.</p>
      <p className="mb-4 leading-relaxed">Our homeschooling journey began when my oldest entered 6th Grade (they're now 21!). 5th Grade was a rough year, just like all the others. My child was bored at school, and just about EVERY report card from EVERY teacher complained of them daydreaming all day. At the time, I didn't even know homeschooling was a real option.</p>
      <p className="mb-4 leading-relaxed">Our evenings continued to be a struggle, not only trying to convince my child to do their homework, but also trying to reteach them how to do the math — and this was a HUGE problem because I didn't know the "new" ways of teaching math, and with all the daydreaming, my child had no idea how to complete their homework.</p>
      <p className="mb-4 leading-relaxed">The last straw for me was when they came home and said, "I hate Science." I said, "Wait, what? How can you hate Science?" After some digging, I learned that all the class had done for Science was watch a potato grow for 3 days and take notes. That was it! Around this time, I was seeing more posts from my homeschooling friend, so I reached out to her and asked questions like "Do you get tired of being around your kids all day?" and "Do your kids have any friends?" She was very kind and patient and answered all of my questions with love, rather than annoyance.</p>
      <p className="mb-8 leading-relaxed">We did a trial run for a couple weeks, it went well, and we decided to withdraw our child from public school and start homeschooling that fall for 6th Grade. We never looked back. Even with the lack of support in the beginning, we knew this was the right decision for our family, and we are all so glad that my husband and I listened to our gut.</p>

      <div className="relative w-full h-64 mb-8 rounded-xl overflow-hidden">
        <Image src="/blog-beginnings-bec-family.avif" alt="Bec's homeschool family" fill className="object-cover" />
      </div>

      <p className="mb-8 leading-relaxed text-lg">We hope you enjoyed reading about our homeschooling beginnings. Stay tuned for more blog posts as we share more of our experiences, curriculum we've used, and supplements we enjoy like board games!</p>

      <div className="relative w-full h-40 rounded-xl overflow-hidden">
        <Image src="/blog-thanks.avif" alt="Thanks for reading" fill className="object-cover" />
      </div>

      <div className="mt-10 pt-8 border-t border-[#ddd8cc]">
        <div className="sender-form-field" data-sender-form-id="bkR0lK"></div>
      </div>
    </div>
  )
}
