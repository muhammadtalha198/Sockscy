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
      const seek = () => {
        const el = document.getElementById(decodeURIComponent(hash.slice(1)))
        if (el) scrollToTarget(el, { immediate: true })
        else if (tries++ < 20) setTimeout(seek, 50)
      }
      seek()
      return
    }
    scrollToTarget(0, { immediate: true })
  }, [pathname, hash])

  return null
}
