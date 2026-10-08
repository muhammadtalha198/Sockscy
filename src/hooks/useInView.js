import { useEffect, useRef, useState } from 'react'

/** Returns [ref, inView]. With `once`, stays true after first reveal. */
export function useInView({ once = true, rootMargin = '0px 0px -12% 0px', threshold = 0 } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin, threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [once, rootMargin, threshold])

  return [ref, inView]
}
