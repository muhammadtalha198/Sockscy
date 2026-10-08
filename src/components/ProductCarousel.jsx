import { useRef, useState } from 'react'
import { prefersReducedMotion } from '../hooks/useReducedMotion'
import { TILE_BG, TILE_CYCLE } from '../lib/constants'
import { cx } from '../lib/cx'
import ProductImage from './ProductImage'

/** Swipeable image carousel (scroll-snap) with arrows, thumbnails and arrow-key support. */
export default function ProductCarousel({ product, badge }) {
  const images = product.images?.length ? product.images : [{ src: null, view: 'single', alt: product.name }]
  const [index, setIndex] = useState(0)
  const trackRef = useRef(null)
  const t1 = product.tile || 'yellow'
  const t2 = TILE_CYCLE[t1] || 'pink'
  const tiles = [t1, t2, TILE_CYCLE[t2] || 'green']

  function go(i) {
    const n = (i + images.length) % images.length
    const track = trackRef.current
    track?.scrollTo({ left: n * track.clientWidth, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    setIndex(n)
  }

  function onScroll() {
    const track = trackRef.current
    if (!track) return
    const n = Math.round(track.scrollLeft / track.clientWidth)
    if (n !== index) setIndex(n)
  }

  function onKeyDown(e) {
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
        aria-label={`photo ${index + 1} of ${images.length}, use arrow keys to browse`}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-[2rem] border-2 border-black"
      >
        {images.map((img, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${images.length}`}
            aria-hidden={i !== index || undefined}
            className="aspect-[4/5] w-full shrink-0 snap-start md:aspect-square"
            style={{ background: TILE_BG[tiles[i % tiles.length]] }}
          >
            <ProductImage
              product={product}
              image={img}
              priority={i === 0}
              sizes="(min-width: 1024px) 58vw, 100vw"
              artClassName="h-[88%] w-[88%]"
            />
          </div>
        ))}
      </div>

      {badge}

      {images.length > 1 && (
        <>
          <div className="absolute bottom-4 right-4 flex gap-3">
            <button type="button" onClick={() => go(index - 1)} className="btn btn-offwhite h-12 w-12 p-0 text-xl" aria-label="previous photo">
              ←
            </button>
            <button type="button" onClick={() => go(index + 1)} className="btn btn-offwhite h-12 w-12 p-0 text-xl" aria-label="next photo">
              →
            </button>
          </div>
          <ul className="mt-4 flex gap-3" aria-label="choose photo">
            {images.map((img, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`show photo ${i + 1}`}
                  aria-current={i === index || undefined}
                  className={cx(
                    'h-20 w-16 overflow-hidden rounded-xl border-2 border-black md:h-24 md:w-20',
                    i === index ? 'shadow-none ring-4 ring-black ring-offset-2 ring-offset-offwhite' : 'shadow-hard',
                  )}
                  style={{ background: TILE_BG[tiles[i % tiles.length]] }}
                >
                  <ProductImage product={product} image={img} decorative artClassName="h-[90%] w-[90%]" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
