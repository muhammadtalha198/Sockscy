import { cx } from '../lib/cx'
import ProductCard from './ProductCard'

const COLS = {
  4: 'grid-cols-2 lg:grid-cols-4',
  3: 'grid-cols-2 lg:grid-cols-3',
}

export default function ProductGrid({ products, loading = false, skeletons = 4, cols = 4, className = '', empty }) {
  const grid = cx('grid gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12', COLS[cols] || COLS[4], className)

  if (loading && !products?.length) {
    return (
      <div className={grid} aria-busy="true" aria-label="loading socks">
        {Array.from({ length: skeletons }, (_, i) => (
          <div key={i}>
            <div className="aspect-[4/5] animate-pulse rounded-[1.75rem] border-2 border-black bg-offwhite/40" />
            {/* same height as a card's name + price rows, so nothing shifts when they load */}
            <div className="mt-3 px-1">
              <div className="h-4 w-2/3 rounded-full bg-black/15 md:h-5" />
              <div className="mt-1.5 flex h-6 items-center md:h-7">
                <div className="h-4 w-1/3 rounded-full bg-black/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!products?.length) return empty || null

  return (
    <ul className={cx(grid, loading && 'opacity-60')} aria-busy={loading || undefined}>
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} index={i} priority={i < 2} />
        </li>
      ))}
    </ul>
  )
}
