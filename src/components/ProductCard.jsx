import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useInView } from '../hooks/useInView'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { TILE_BG, TILE_CYCLE } from '../lib/constants'
import { cx } from '../lib/cx'
import { formatPKR, totalStock } from '../lib/format'
import ProductImage from './ProductImage'

/** urgency label for the peel-off corner sticker */
export function urgencyLabel(product) {
  const stock = totalStock(product)
  if (stock === 0) return 'sold out'
  if (stock === 1) return '1 of 1'
  if (stock === 2) return 'only 2 left'
  return 'thrifted'
}

// jagged tear for the paper that covers each card until it scrolls into view
const TEAR = [52, 47, 55, 46, 53, 44, 51, 48, 56, 45, 52, 49, 54, 47, 50]
const pts = TEAR.map((x, i) => `${x}% ${(i / (TEAR.length - 1)) * 100}%`)
const LEFT = `polygon(0 0, ${pts.join(', ')}, 0 100%)`
const RIGHT = `polygon(${pts[0]}, 100% 0, 100% 100%, ${[...pts].reverse().slice(0, -1).join(', ')})`

/*
  Product card on a flat colour tile.
  - hover: tile colour flips (hard cut), the sock tilts in 3D toward the pointer,
    the corner sticker peels, the price bounces like a ball
  - first view: a paper sheet tears apart to reveal the sock (or real photo once it loads)
*/
export default function ProductCard({ product, index = 0, priority = false }) {
  const reduced = useReducedMotion()
  const [ref, inView] = useInView({ rootMargin: '0px 0px -8% 0px' })
  const [loaded, setLoaded] = useState(!product.images?.[0]?.src)
  const [torn, setTorn] = useState(false)
  const [paperGone, setPaperGone] = useState(false)
  const label = urgencyLabel(product)
  const soldOut = label === 'sold out'
  const tile = product.tile || 'yellow'

  useEffect(() => {
    if (!inView || !loaded || torn) return
    const t = setTimeout(() => setTorn(true), 120 + (index % 4) * 90)
    return () => clearTimeout(t)
  }, [inView, loaded, torn, index])

  function tilt(e) {
    if (e.pointerType !== 'mouse' || reduced) return
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    e.currentTarget.style.setProperty('--ry', `${(px * 26).toFixed(2)}deg`)
    e.currentTarget.style.setProperty('--rx', `${(-py * 20).toFixed(2)}deg`)
  }
  function untilt(e) {
    e.currentTarget.style.setProperty('--ry', '0deg')
    e.currentTarget.style.setProperty('--rx', '0deg')
  }

  return (
    <article className="pcard relative">
      <Link to={`/product/${product.id}`} data-cursor="view" className="group block rounded-[1.75rem] focus-visible:outline-offset-4">
        <div
          ref={ref}
          onPointerMove={tilt}
          onPointerLeave={untilt}
          className="pcard-tile relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border-2 border-black bg-(--tile) group-hover:bg-(--tile-hover) group-focus-visible:bg-(--tile-hover)"
          style={{ '--tile': TILE_BG[tile], '--tile-hover': TILE_BG[TILE_CYCLE[tile] || 'pink'], '--lean': index % 2 ? '7deg' : '-7deg' }}
        >
          <div className="pcard-sock h-full w-full">
            <ProductImage
              product={product}
              view="single"
              priority={priority}
              decorative
              artClassName="h-[84%] w-[84%]"
              onLoad={() => setLoaded(true)}
            />
          </div>

          <span className={cx('peel', soldOut && 'peel-dark')} aria-hidden="true">
            <span className="peel-face">{label}</span>
            <span className="peel-flap" />
          </span>

          {!reduced && !paperGone && (
            <span className={cx('pcard-paper', torn && 'is-torn')} aria-hidden="true" onTransitionEnd={() => torn && setPaperGone(true)}>
              <span className="pcard-paper-half" style={{ clipPath: LEFT }} />
              <span className="pcard-paper-half pcard-paper-right" style={{ clipPath: RIGHT }} />
            </span>
          )}
        </div>

        <div className="mt-3 px-1">
          <h3 className="text-base font-black uppercase leading-none tracking-tight [overflow-wrap:anywhere] md:text-xl">{product.name}</h3>
          <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
            <p className="pcard-price text-base font-black md:text-lg">{formatPKR(product.price)}</p>
            <p className="text-sm font-semibold lowercase">
              {soldOut ? 'sold out' : label === 'thrifted' ? product.collection : label}
            </p>
          </div>
        </div>
      </Link>
    </article>
  )
}
