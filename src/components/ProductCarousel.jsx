import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../hooks/useReducedMotion'
import { TILE_BG, TILE_CYCLE } from '../lib/constants'
import { cx } from '../lib/cx'
import SockArt from './art/SockArt'
import ProductImage from './ProductImage'
import SockSpinner from './product/SockSpinner'
import ParallaxLayer from './parallax/ParallaxLayer'
import { Flower, Sparkle, Star } from './art/Doodles'

// one small doodle per slide on the front plane
const FRONT = [<Sparkle key="s" fill="#f5f1e8" />, <Flower key="f" fill="#ff52a1" center="#f4d500" />, <Star key="t" fill="#f5f1e8" />]

/**
 * Product media: slide 1 is the drag-to-spin 3D sock (in the chosen colourway),
 * then the photos. Scroll-snap swipe, arrows, thumbnails and arrow keys.
 * `spinKey` changes (colourway picked) jump back to the 3D slide.
 *
 * v2: every slide is a little diorama (layers anchored to the product section):
 *   back  a cut-paper sheet · far  the giant product name in the tile's display colour
 *   mid   a soft floor shadow · near  the sock (overlaps the name, moves faster)
 *   front one small doodle
 * Real photos: use transparent cutouts so the layers behind the sock stay visible.
 */
export default function ProductCarousel({ product, badge, art, spinKey }) {
  const images = product.images?.length ? product.images : [{ src: null, view: 'single', alt: product.name }]
  const slides = [{ kind: 'spin' }, ...images.map((img) => ({ kind: 'img', img }))]
  const [index, setIndex] = useState(0)
  const trackRef = useRef(null)
  const firstKey = useRef(spinKey)
  const t1 = product.tile || 'yellow'
  const t2 = TILE_CYCLE[t1] || 'pink'
  const tiles = [t1, t2, TILE_CYCLE[t2] || 'green', t1]

  function go(i) {
    const n = (i + slides.length) % slides.length
    const track = trackRef.current
    track?.scrollTo({ left: n * track.clientWidth, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    setIndex(n)
  }

  useEffect(() => {
    if (spinKey !== firstKey.current) {
      firstKey.current = spinKey
      if (index !== 0) go(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinKey])

  function onScroll() {
    const track = trackRef.current
    if (!track) return
    const n = Math.round(track.scrollLeft / track.clientWidth)
    if (n !== index) setIndex(n)
  }

  function onKeyDown(e) {
    if (e.target !== e.currentTarget) return // the 3D sock uses the arrow keys itself
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(index + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(index - 1)
    }
  }

  return (
    <div aria-roledescription="carousel" aria-label={`${product.name} photos`} className="relative">
      <div
        ref={trackRef}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        tabIndex={0}
        aria-label={`slide ${index + 1} of ${slides.length}, use arrow keys to browse`}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-[2rem] border-2 border-black"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={slide.kind === 'spin' ? `3D view, ${i + 1} of ${slides.length}` : `${i + 1} of ${slides.length}`}
            inert={i !== index}
            className={cx('slide-diorama relative aspect-[4/5] w-full shrink-0 snap-start overflow-hidden md:aspect-square', `tone-${tiles[i % tiles.length]}`)}
            style={{ background: TILE_BG[tiles[i % tiles.length]] }}
          >
            <ParallaxLayer depth="back" className="pointer-events-none absolute inset-[13%_11%_17%]">
              <span className="slide-sheet block h-full w-full" style={{ rotate: i % 2 ? '4deg' : '-5deg' }} />
            </ParallaxLayer>
            <ParallaxLayer depth="far" className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              {product.name.toUpperCase().split(' ').map((w) => (
                <span key={w} className="giant t-display block text-[clamp(3.6rem,17vw,8.5rem)] leading-[0.82] lg:text-[clamp(4rem,8.5vw,9.5rem)]">
                  {w}
                </span>
              ))}
            </ParallaxLayer>
            {slide.kind !== 'spin' && <span className="slide-floor" aria-hidden="true" />}
            {/* the sock you drag: scroll depth only, so it never slides under the finger/pointer */}
            <ParallaxLayer depth="near" pointer={false} decorative={false} className="relative h-full w-full">
              {slide.kind === 'spin' ? (
                <SockSpinner art={art || product.art} label={`${product.name} sock in 3D`} frames={product.spin} />
              ) : (
                <ProductImage
                  product={{ ...product, art: art || product.art }}
                  image={slide.img}
                  priority={i === 1}
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  artClassName="h-[88%] w-[88%]"
                />
              )}
            </ParallaxLayer>
            <ParallaxLayer depth="front" className="pointer-events-none absolute right-[9%] top-[9%] w-10 md:w-14">
              <span className="block" style={{ rotate: `${i % 2 ? 14 : -12}deg` }}>
                {FRONT[i % FRONT.length]}
              </span>
            </ParallaxLayer>
          </div>
        ))}
      </div>

      {badge}

      <div className="absolute bottom-4 right-4 flex gap-3">
        <button type="button" onClick={() => go(index - 1)} className="btn btn-offwhite h-12 w-12 p-0 text-xl" aria-label="previous slide">
          ←
        </button>
        <button type="button" onClick={() => go(index + 1)} className="btn btn-offwhite h-12 w-12 p-0 text-xl" aria-label="next slide">
          →
        </button>
      </div>
      <ul className="mt-4 flex gap-3" aria-label="choose slide">
        {slides.map((slide, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => go(i)}
              aria-label={slide.kind === 'spin' ? 'show 3D view' : `show photo ${i}`}
              aria-current={i === index || undefined}
              className={cx(
                'relative h-20 w-16 overflow-hidden rounded-xl border-2 border-black md:h-24 md:w-20',
                i === index ? 'shadow-none ring-4 ring-black ring-offset-2 ring-offset-offwhite' : 'shadow-hard',
              )}
              style={{ background: TILE_BG[tiles[i % tiles.length]] }}
            >
              {slide.kind === 'spin' ? (
                <>
                  <SockArt art={art || product.art} view="upright" className="mx-auto h-[78%] w-auto" />
                  <span className="absolute inset-x-0 bottom-0 bg-black py-0.5 text-[0.65rem] font-black text-yellow">360°</span>
                </>
              ) : (
                <ProductImage product={{ ...product, art: art || product.art }} image={slide.img} decorative artClassName="h-[90%] w-[90%]" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
