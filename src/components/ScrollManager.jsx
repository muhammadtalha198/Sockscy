import { useEffect } from 'react'
import { useLocation } from 'react-router'

/** Scroll to top on page change, or to #hash targets (e.g. /#collections). */
export default function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      // wait a frame so lazy pages / async sections have rendered
      let tries = 0
      const seek = () => {
        const el = document.getElementById(decodeURIComponent(hash.slice(1)))
        if (el) el.scrollIntoView({ block: 'start' })
        else if (tries++ < 20) setTimeout(seek, 50)
      }
      seek()
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}
