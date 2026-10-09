import { useState } from 'react'
import { Link } from 'react-router'
import { play } from '../fx/sound'
import SockArt from '../components/art/SockArt'
import GiantHeadline from '../components/GiantHeadline'
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

  return (
    <section aria-labelledby="lost-title" className="tone-pink clip-x relative min-h-[100svh] pb-section pt-28 md:pt-36">
      <title>oops, lost a sock — SOCKSAVVY</title>
      <Sticker
        className="absolute right-[4%] top-[46%] z-20 w-40 md:right-[10%] md:top-[24%] md:w-72"
        rotate={-18}
        depth="near"
        duration={6}
      >
        <SockArt art={LOST} view="single" />
      </Sticker>

      <GiantHeadline
        as="h1"
        id="lost-title"
        lines={[
          { text: 'OOPS,', from: 'left', className: 'pl-gutter' },
          { text: 'LOST A', from: 'right', className: 'pl-[10vw]' },
          { text: 'SOCK', from: 'left', className: 'pl-gutter' },
        ]}
      />
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
    </section>
  )
}
