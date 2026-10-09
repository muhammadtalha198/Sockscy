import { useParallax } from '../../hooks/useParallax'

/**
 * Giant words that drift sideways against the scroll (and lean with scroll speed).
 *   <ParallaxText dir={-1}>SOCK OF THE DAY</ParallaxText>
 * drift: px across the screen (default 12% of the width, max 220) · dir: ±1 · skew: lean
 * Keep body copy out of this — only giant display type should travel.
 */
export default function ParallaxText({ as: Tag = 'div', dir = 1, drift, skew = true, own, children, ...rest }) {
  const amount = drift ?? (typeof window !== 'undefined' ? Math.min(220, window.innerWidth * 0.12) : 120)
  const ref = useParallax({ depth: 'far', axis: 'x', drift: amount, dir, skew, pointer: false, own })
  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  )
}
