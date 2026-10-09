// Scroll velocity tracker (no dependencies, main bundle).
// Runs a rAF loop only while the page is scrolling; subscribers get
// (velocity px/frame, smoothed, + = down) every frame until it settles.
import { prefersReducedMotion } from '../hooks/useReducedMotion'

const subs = new Set()
let raf = 0
let lastY = 0
let velocity = 0
let still = 0

function frame() {
  const y = window.scrollY
  const raw = y - lastY
  lastY = y
  velocity += (raw - velocity) * 0.22
  if (Math.abs(raw) < 0.1 && Math.abs(velocity) < 0.05) still++
  else still = 0
  for (const fn of subs) fn(velocity)
  if (still > 12) {
    velocity = 0
    for (const fn of subs) fn(0)
    raf = 0
    return
  }
  raf = requestAnimationFrame(frame)
}

function onScroll() {
  if (!raf) {
    still = 0
    raf = requestAnimationFrame(frame)
  }
}

/** subscribe(fn) → unsubscribe. fn(velocity) each frame while scrolling. */
export function subscribeVelocity(fn) {
  if (prefersReducedMotion()) return () => {}
  if (subs.size === 0) {
    lastY = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
  }
  subs.add(fn)
  return () => {
    subs.delete(fn)
    if (subs.size === 0) {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
      raf = 0
    }
  }
}

export const getVelocity = () => velocity
