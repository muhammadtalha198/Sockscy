import { useEffect } from 'react'
import { prefersReducedMotion } from '../hooks/useReducedMotion'
import { clamp } from '../lib/motion'
import { subscribeVelocity } from './velocity'

/*
  Giant words drift sideways as they cross the viewport and skew with scroll
  velocity. One shared velocity loop; only on-screen elements are touched.
*/
const active = new Map() // el → { dir, amount }
let unsub = null
let skew = 0

function update(v) {
  skew += (clamp(-v * 0.35, -12, 12) - skew) * 0.25
  const vh = window.innerHeight
  for (const [el, o] of active) {
    const r = el.getBoundingClientRect()
    const progress = (vh - r.top) / (vh + r.height) // 0 entering → 1 leaving
    const drift = (0.5 - progress) * o.amount * o.dir
    el.style.transform = `translate3d(${drift.toFixed(1)}px, 0, 0) skewX(${skew.toFixed(2)}deg)`
  }
}

function start() {
  if (!unsub) unsub = subscribeVelocity(update)
}
function stopIfIdle() {
  if (active.size === 0 && unsub) {
    unsub()
    unsub = null
  }
}

export function useScrollSkew(ref, { dir = 1, enabled = true } = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled || prefersReducedMotion()) return
    const amount = Math.min(220, window.innerWidth * 0.12)
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        active.set(el, { dir, amount })
        start()
        update(0)
      } else {
        active.delete(el)
        stopIfIdle()
      }
    })
    io.observe(el)
    return () => {
      io.disconnect()
      active.delete(el)
      el.style.transform = ''
      stopIfIdle()
    }
  }, [ref, dir, enabled])
}
