import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { scrollToTarget } from '../motion/scroll'

/** Scroll to top on page change, or to #hash targets (e.g. /#collections). */
export default function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      // wait a frame so lazy pages / async sections have rendered
      let tries = 0
      let timer = 0
      let userScrolled = false
      const stop = () => (userScrolled = true)
      window.addEventListener('wheel', stop, { passive: true, once: true })
      window.addEventListener('touchstart', stop, { passive: true, once: true })
      // then keep it pinned for a moment in case late layout (data, fonts) moves it
      const settle = (left) => {
        const el = document.getElementById(decodeURIComponent(hash.slice(1)))
        if (!el || userScrolled) return
        if (Math.abs(el.getBoundingClientRect().top) > 2) scrollToTarget(el, { immediate: true })
        if (left > 0) timer = setTimeout(() => settle(left - 1), 120)
      }
      const seek = () => {
        const el = document.getElementById(decodeURIComponent(hash.slice(1)))
        if (el) {
          scrollToTarget(el, { immediate: true })
          timer = setTimeout(() => settle(8), 120)
        } else if (tries++ < 20) timer = setTimeout(seek, 50)
      }
      seek()
      return () => {
        clearTimeout(timer)
        window.removeEventListener('wheel', stop)
        window.removeEventListener('touchstart', stop)
      }
    }
    scrollToTarget(0, { immediate: true })
  }, [pathname, hash])

  return null
}
