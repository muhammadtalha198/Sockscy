import { useUi } from '../store/ui'
import { prefersReducedMotion, useReducedMotion } from './useReducedMotion'

/**
 * "Less motion" = the OS reduce-motion setting OR the site's calm mode (ui.calm, the
 * sticker in the bottom-right cluster). Reduced motion makes everything static; calm keeps
 * the site alive but drops what moves on its own: page wipes, smooth wheel scroll, the
 * marquee, physics, fly-ins, cursor trail, entrance offsets; parallax runs at 15%.
 */
export function lessMotion() {
  return prefersReducedMotion() || useUi.getState().calm
}

export function useLessMotion() {
  const reduced = useReducedMotion()
  const calm = useUi((s) => s.calm)
  return reduced || calm
}
