import { createContext, useContext, useEffect, useRef } from 'react'
import { addLayer } from '../parallax/engine'
import { prefersReducedMotion } from './useReducedMotion'

/** Set by <ParallaxSection>: layers inside share the section as their anchor. */
export const ParallaxSectionContext = createContext(null)

/**
 * Make an element a parallax layer (see src/parallax/engine.js for every option).
 *   const ref = useParallax({ depth: 'near' })
 *   <div ref={ref}>…</div>
 * depth: 'back' | 'far' | 'mid' | 'near' | 'front' | number. `false`/0 depth = no layer.
 * Inside a <ParallaxSection> the layer is anchored to the section unless `own: true`.
 * Pass `ref` to reuse a ref you already have (e.g. from useInView).
 */
export function useParallax({
  depth = 'near',
  axis,
  pin,
  drift,
  dir,
  skew,
  scale,
  rotate,
  pointer,
  scroll,
  own = false,
  enabled = true,
  ref: external,
} = {}) {
  const local = useRef(null)
  const ref = external || local
  const section = useContext(ParallaxSectionContext)
  const anchor = own ? null : section

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled || depth === false || depth === 0 || prefersReducedMotion()) return
    return addLayer(el, { depth, axis, pin, drift, dir, skew, scale, rotate, pointer, scroll, section: anchor })
  }, [ref, depth, axis, pin, drift, dir, skew, scale, rotate, pointer, scroll, anchor, enabled])

  return ref
}
