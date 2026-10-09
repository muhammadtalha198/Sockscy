import { useState } from 'react'
import { Link } from 'react-router'
import { play } from '../fx/sound'
import { Flower, Sparkle, Star } from '../components/art/Doodles'
import SockArt from '../components/art/SockArt'
import GiantHeadline from '../components/GiantHeadline'
import ParallaxLayer from '../components/parallax/ParallaxLayer'
import ParallaxSection from '../components/parallax/ParallaxSection'
import Sticker from '../components/Sticker'

const LOST = { pattern: 'smiley', base: '#111111', trim: '#f4d500' }

export default function NotFound() {
  // easter egg: the other sock of the pair is peeking out from behind the footer
  const [found, setFound] = useState(false)
  function find(e) {
    if (found) return
    setFound(true)
    play('win')
    const r = e.currentTarget.getBoundingClientRect()
    import('../fx/confetti').then(({ burst }) => burst({ x: r.left + r.width / 2, y: r.top, count: 34, shapes: ['flower', 'star'], power: 11 }))
  }

  /*
    Four planes (v2). The lost sock drifts between them: small and far behind the headline,
    then forward past the copy to the front and back again, like a sock in the drum.
      back   a ghost 404, tone on tone
      far    doodles, and the sock while it is behind the headline
      mid    headline, copy, buttons (still)
      front  the sock while it is in front, one near doodle
    The sock is two copies on one CSS path, each shown for its half; they swap at the
    middle of the path, where nothing overlaps them.
  */
  return (
    <ParallaxSection
      rest="top"
      aria-labelledby="lost-title"
      className="tone-pink relative min-h-[100svh] overflow-clip pb-section pt-28 md:pt-36"
    >
      <title>oops, lost a sock — SOCKSAVVY</title>
      <ParallaxLayer depth="back" className="giant lost-ghost pointer-events-none absolute right-[-4%] top-[16%] md:right-[2%] md:top-[12%]">
        404
      </ParallaxLayer>
      <Sticker className="absolute left-[58%] top-[14%] w-10 md:left-[52%] md:w-14" outline={false} rotate={14} depth="far">
        <Star fill="#f4d500" />
      </Sticker>
      <Sticker className="absolute bottom-[26%] right-[30%] hidden w-12 md:block" outline={false} rotate={-8} depth="far" delay={-3}>
        <Sparkle fill="#f5f1e8" />
      </Sticker>

      <LostSock plane="back" />
      <GiantHeadline
        as="h1"
        id="lost-title"
        className="z-10"
        lines={[
          { text: 'OOPS,', from: 'left', className: 'pl-gutter' },
          { text: 'LOST A', from: 'right', className: 'pl-[10vw]' },
          { text: 'SOCK', from: 'left', className: 'pl-gutter' },
        ]}
      />
      <LostSock plane="front" />
      <Sticker className="absolute bottom-[12%] left-[46%] z-20 hidden w-16 md:block" outline={false} rotate={-12} depth="front" delay={-1}>
        <Flower fill="#f4d500" center="#000" />
      </Sticker>
      <div className="relative z-10 mt-10 max-w-[60%] px-gutter md:max-w-none">
        <p className="copy">this page went missing in the wash. it happens to the best of us.</p>
        <p className="copy copy-offset mt-2">its other half is probably in the shop.</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/shop" className="btn btn-yellow btn-lg">
            back to shop
          </Link>
          <Link to="/" className="btn btn-offwhite btn-lg">
            home
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={find}
        className="lost-sock"
        data-found={found || undefined}
        data-cursor={found ? undefined : 'grab'}
        aria-label={found ? 'the other sock — found it!' : 'something is peeking out from under the page'}
      >
        <span className="sticker block">
          <SockArt art={LOST} view="upright" />
        </span>
      </button>
      <p className="lost-sock-msg" data-found={found || undefined} role="status" aria-live="polite">
        {found && 'found it! pair reunited ✦'}
      </p>
    </ParallaxSection>
  )
}

function LostSock({ plane }) {
  return (
    <ParallaxLayer depth="near" className={`lost-drift lost-drift-${plane} pointer-events-none absolute`}>
      <div className="lost-x">
        <div className="lost-y">
          <div className="sticker">
            <SockArt art={LOST} view="single" />
          </div>
        </div>
      </div>
    </ParallaxLayer>
  )
}
