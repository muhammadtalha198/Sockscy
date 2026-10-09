import { useEffect, useState } from 'react'
import { useParallax } from '../../hooks/useParallax'
import ParallaxLayer from '../parallax/ParallaxLayer'
import ProductCard from '../ProductCard'
import ProductGrid from '../ProductGrid'

/**
 * "You might also like" as a parallax rail (inside a <ParallaxSection>):
 *   desktop — four cards in a row on alternating planes, the whole rail drifting
 *             sideways against the scroll
 *   phones  — a swipeable snap rail (no drift: it would fight the finger), cards on
 *             alternating planes
 */
export default function RelatedRail({ products, loading }) {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 64rem)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 64rem)')
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  // registers once the list is actually rendered (the first render is the loading grid)
  const ready = !loading && !!products?.length
  const railRef = useParallax({ depth: 'far', axis: 'x', drift: 70, dir: -1, pointer: false, enabled: wide && ready })

  if (loading || !products?.length) return <ProductGrid products={products} loading={loading} skeletons={4} />

  return (
    <ul
      ref={railRef}
      aria-label="you might also like"
      className="no-scrollbar -mx-gutter flex snap-x snap-mandatory gap-4 overflow-x-auto px-gutter pb-10 pt-4 lg:mx-0 lg:grid lg:snap-none lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0"
    >
      {products.map((p, i) => (
        <ParallaxLayer
          as="li"
          key={p.id}
          // cards are links with prices: scroll only (never chase the pointer), and on the
          // phone scroller shallow enough to stay inside its 16px top padding (no clipped
          // card tops or focus rings)
          depth={wide ? (i % 2 ? 0.14 : -0.05) : i % 2 ? 0.05 : -0.02}
          pointer={false}
          decorative={false}
          className="w-[62vw] max-w-[17rem] shrink-0 snap-start lg:w-auto lg:max-w-none"
        >
          <ProductCard product={p} index={i} />
        </ParallaxLayer>
      ))}
    </ul>
  )
}
