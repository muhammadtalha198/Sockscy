import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import Collections from '../components/home/Collections'
import FeaturedDrop from '../components/home/FeaturedDrop'
import InstagramStrip from '../components/home/InstagramStrip'
import SockFactory from '../components/home/SockFactory'
import SockOfTheDay from '../components/home/SockOfTheDay'
import WhySocksavvy from '../components/home/WhySocksavvy'
import Hero from '../components/Hero'
import Marquee from '../components/Marquee'
import { whenIdle } from '../lib/motion'

const BELOW_FOLD = 7

/**
 * Below-the-fold sections mount one per idle slot after first paint (they're ~1,500
 * mostly-SVG nodes), so the hero paints sooner. A #hash link or the first scroll
 * mounts everything at once. Visually identical; nothing on screen moves.
 */
function useStagedMount(total) {
  const { hash } = useLocation()
  const [stage, setStage] = useState(0)
  useEffect(() => {
    if (stage >= total) return
    const all = () => setStage(total)
    window.addEventListener('scroll', all, { passive: true, once: true })
    const cancel = whenIdle(() => setStage((n) => n + 1), 600)
    return () => {
      cancel()
      window.removeEventListener('scroll', all)
    }
  }, [stage, total])
  return hash ? total : stage
}

/*
  Home — colour order on scroll (hard cuts, no gradients):
  yellow hero → black marquee → red featured → green collections
  → "be unique, be you" band → pink sock of the day → black sock factory (pinned scroll scene)
  → yellow why → off-white instagram → black footer
*/
export default function Home() {
  const stage = useStagedMount(BELOW_FOLD)
  return (
    <>
      <title>SOCKSAVVY — weird socks for weird people</title>
      <Hero />
      <Marquee className="tone-black" items={['THRIFTED', 'AESTHETIC', 'ONE OF A KIND']} />
      {stage > 0 && <FeaturedDrop />}
      {stage > 1 && <Collections />}
      {stage > 2 && (
        <div className="clip-x relative z-30 -my-10 py-6 md:-my-14">
          <div className="-ml-[5%] w-[110%] -rotate-3 border-y-2 border-black bg-black">
            <Marquee items={['BE UNIQUE', 'BE YOU']} textClassName="text-pink" flower="#f4d500" reverse speed={90} />
          </div>
        </div>
      )}
      {stage > 3 && <SockOfTheDay />}
      {stage > 4 && <SockFactory />}
      {stage > 5 && <WhySocksavvy />}
      {stage > 6 && <InstagramStrip />}
      {/* keeps the footer out of view until everything has mounted */}
      {stage < BELOW_FOLD && <div className="h-[200svh]" aria-hidden="true" />}
    </>
  )
}
