import { useEffect, useState } from 'react'
import { subscribeVelocity } from '../motion/velocity'

/**
 * Phones: true while the visitor scrolls down (so floating stickers slide out of the
 * way of what they're reading), false again on scroll up or after a short pause.
 */
export function useTuckOnScroll() {
  const [tucked, setTucked] = useState(false)
  useEffect(() => {
    if (!window.matchMedia('(max-width: 47.99rem)').matches) return
    let timer = 0
    const unsub = subscribeVelocity((v) => {
      if (v > 2) setTucked(true)
      else if (v < -2) setTucked(false)
      clearTimeout(timer)
      timer = setTimeout(() => setTucked(false), 900)
    })
    return () => {
      unsub()
      clearTimeout(timer)
    }
  }, [])
  return tucked
}
