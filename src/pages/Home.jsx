import Collections from '../components/home/Collections'
import FeaturedDrop from '../components/home/FeaturedDrop'
import InstagramStrip from '../components/home/InstagramStrip'
import SockOfTheDay from '../components/home/SockOfTheDay'
import WhySocksavvy from '../components/home/WhySocksavvy'
import Hero from '../components/Hero'
import Marquee from '../components/Marquee'

/*
  Home — colour order on scroll (hard cuts, no gradients):
  yellow hero → black marquee → red featured → green collections
  → "be unique, be you" band → pink sock of the day → yellow why → off-white instagram → black footer
*/
export default function Home() {
  return (
    <>
      <title>SOCKSAVVY — weird socks for weird people</title>
      <Hero />
      <Marquee className="tone-black" items={['THRIFTED', 'AESTHETIC', 'ONE OF A KIND']} />
      <FeaturedDrop />
      <Collections />
      <div className="clip-x relative z-30 -my-10 py-6 md:-my-14">
        <div className="-ml-[5%] w-[110%] -rotate-3 border-y-2 border-black bg-black">
          <Marquee items={['BE UNIQUE', 'BE YOU']} textClassName="text-pink" flower="#f4d500" reverse duration={22} />
        </div>
      </div>
      <SockOfTheDay />
      <WhySocksavvy />
      <InstagramStrip />
    </>
  )
}
