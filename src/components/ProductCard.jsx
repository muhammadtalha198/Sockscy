import { Link } from 'react-router'
import { TILE_BG, TILE_CYCLE } from '../lib/constants'
import { cx } from '../lib/cx'
import { formatPKR, totalStock } from '../lib/format'
import ProductImage from './ProductImage'

/*
  Product card on a flat colour tile.
  Hover / focus: the sock tilts and the tile switches colour (hard cut, no fade).
*/
export default function ProductCard({ product, index = 0, priority = false }) {
  const stock = totalStock(product)
  const soldOut = stock === 0
  const oneOfOne = stock === 1
  const tile = product.tile || 'yellow'
  const tilt = index % 2 ? 'group-hover:rotate-[9deg] group-focus-visible:rotate-[9deg]' : 'group-hover:-rotate-[9deg] group-focus-visible:-rotate-[9deg]'

  return (
    <article className="relative">
      <Link to={`/product/${product.id}`} className="group block rounded-[1.75rem] focus-visible:outline-offset-4">
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border-2 border-black bg-(--tile) group-hover:bg-(--tile-hover) group-focus-visible:bg-(--tile-hover)"
          style={{ '--tile': TILE_BG[tile], '--tile-hover': TILE_BG[TILE_CYCLE[tile] || 'pink'] }}
        >
          <div className={cx('h-full w-full transition-transform duration-300 ease-snap group-hover:scale-105', tilt)}>
            <ProductImage product={product} view="single" priority={priority} decorative artClassName="h-[84%] w-[84%]" />
          </div>

          {(oneOfOne || soldOut) && (
            <span
              className={cx(
                'absolute left-3 top-3 -rotate-6 rounded-full border-2 border-black px-3 py-1 text-xs font-black uppercase shadow-hard',
                soldOut ? 'bg-black text-offwhite' : 'bg-offwhite text-black',
              )}
            >
              {soldOut ? 'sold out' : '1 of 1'}
            </span>
          )}
        </div>

        <div className="mt-3 px-1">
          <h3 className="text-base font-black uppercase leading-none tracking-tight [overflow-wrap:anywhere] md:text-xl">{product.name}</h3>
          <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
            <p className="text-base font-black md:text-lg">{formatPKR(product.price)}</p>
            <p className="text-sm font-semibold lowercase">{product.collection}</p>
          </div>
        </div>
      </Link>
    </article>
  )
}
