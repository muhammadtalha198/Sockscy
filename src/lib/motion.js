// Shared motion language (mirrors the motion tokens in src/styles/tokens.css).
// Springs that overshoot slightly, 0.4–0.7s, nothing linear.

/** Damped spring (~8% overshoot) as a CSS linear() easing — usable in CSS, WAAPI and transitions. */
export const SPRING =
  'linear(0, 0.046, 0.159, 0.307, 0.466, 0.618, 0.753, 0.864, 0.95, 1.012, 1.052, 1.075, 1.083, 1.082, 1.074, 1.062, 1.049, 1.036, 1.024, 1.014, 1.006, 1, 0.996, 0.994, 0.993, 0.993, 0.994, 0.995, 1)'
export const OVERSHOOT = 'cubic-bezier(0.34, 1.56, 0.64, 1)'
export const SNAP = 'cubic-bezier(0.16, 1, 0.3, 1)'

export const DUR = { fast: 400, med: 550, slow: 700 }

/** Feature-detect linear() easing (older Safari) so WAAPI calls never throw. */
let linearOk
export function springEasing() {
  if (linearOk === undefined) {
    linearOk = typeof CSS !== 'undefined' && CSS.supports?.('transition-timing-function', 'linear(0, 1)')
  }
  return linearOk ? SPRING : OVERSHOOT
}

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
export const lerp = (a, b, t) => a + (b - a) * t

/** requestIdleCallback with a timeout fallback (Safari) */
export function whenIdle(fn, timeout = 1500) {
  if (typeof window === 'undefined') return () => {}
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(fn, { timeout })
    return () => window.cancelIdleCallback(id)
  }
  const id = setTimeout(fn, 200)
  return () => clearTimeout(id)
}
