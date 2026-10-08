import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from './useReducedMotion'

/*
  Scroll parallax for stickers. One shared, rAF-throttled scroll listener
  drives every registered element: all rects are read first, then all
  transforms are written, so there's no layout thrashing.
*/
const items = new Set()
let frame = 0

function update() {
  frame = 0
  const vh = window.innerHeight
  const reads = []
  for (const item of items) {
    const rect = item.el.getBoundingClientRect()
    reads.push([item, rect.top - item.y + rect.height / 2, rect])
  }
  for (const [item, center, rect] of reads) {
    if (rect.bottom < -300 || rect.top > vh + 300) continue
    const y = Math.max(-140, Math.min(140, (vh / 2 - center) * item.speed))
    item.y = y
    item.el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`
  }
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(update)
}

export function useParallax(speed = 0) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !speed || prefersReducedMotion()) return
    const item = { el, speed, y: 0 }
    items.add(item)
    if (items.size === 1) {
      window.addEventListener('scroll', schedule, { passive: true })
      window.addEventListener('resize', schedule)
    }
    schedule()
    return () => {
      items.delete(item)
      el.style.transform = ''
      if (items.size === 0) {
        window.removeEventListener('scroll', schedule)
        window.removeEventListener('resize', schedule)
      }
    }
  }, [speed])

  return ref
}
