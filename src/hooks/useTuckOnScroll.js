import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { subscribeVelocity } from '../motion/velocity'

// big call-to-action buttons a floating sticker must never sit on
const CTAS = '.btn-lg, [data-avoid-float]'

/**
 * Phones: true while the visitor scrolls down (so floating stickers slide out of the
 * way of what they're reading) or while a big CTA sits under the sticker (`ref`, its
 * resting spot), false again on scroll up or after a short pause.
 */
export function useTuckOnScroll(ref) {
  const { pathname } = useLocation()
  const [scrolling, setScrolling] = useState(false)
  const [covering, setCovering] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 47.99rem)')
    if (!mq.matches) return
    let timer = 0
    let settle = 0
    // offsetTop/Left of a fixed element ignore its tuck transform → its resting spot
    const check = () => {
      const el = ref?.current
      if (!el) return
      const a = { l: el.offsetLeft - 8, t: el.offsetTop - 8, r: el.offsetLeft + el.offsetWidth + 8, b: el.offsetTop + el.offsetHeight + 8 }
      let hit = false
      for (const cta of document.querySelectorAll(CTAS)) {
        const c = cta.getBoundingClientRect()
        if (c.width && c.left < a.r && c.right > a.l && c.top < a.b && c.bottom > a.t) {
          hit = true
          break
        }
      }
      setCovering(hit)
    }
    const unsub = subscribeVelocity((v) => {
      if (v > 2) setScrolling(true)
      else if (v < -2) setScrolling(false)
      clearTimeout(timer)
      timer = setTimeout(() => setScrolling(false), 900)
    })
    const onScroll = () => {
      clearTimeout(settle)
      settle = setTimeout(check, 140)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    // new page / sections mounting / late layout
    const early = [setTimeout(check, 300), setTimeout(check, 1500)]
    window.addEventListener('resize', check)
    return () => {
      unsub()
      clearTimeout(timer)
      clearTimeout(settle)
      early.forEach(clearTimeout)
      window.removeEventListener('resize', check)
      window.removeEventListener('scroll', onScroll)
    }
  }, [ref, pathname])

  return scrolling || covering
}
