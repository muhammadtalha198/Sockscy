// Smooth scroll + scroll-driven animation kit, loaded lazily after first paint:
// GSAP + ScrollTrigger + Lenis (wheel smoothing; touch stays native).
// Reduced motion → resolves to null and nothing is loaded.
import { prefersReducedMotion } from '../hooks/useReducedMotion'
import { registerScrollHooks } from '../lib/scrollLock'

let kit = null
let loading = null

export function loadScrollKit() {
  if (prefersReducedMotion()) return Promise.resolve(null)
  if (kit) return Promise.resolve(kit)
  if (!loading) {
    loading = Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('lenis')])
      .then(([{ gsap }, { ScrollTrigger }, { default: Lenis }]) => {
        gsap.registerPlugin(ScrollTrigger)
        ScrollTrigger.config({ ignoreMobileResize: true })
        const lenis = new Lenis({ duration: 1.1, smoothWheel: true, syncTouch: false })
        lenis.on('scroll', ScrollTrigger.update)
        gsap.ticker.add((t) => lenis.raf(t * 1000))
        gsap.ticker.lagSmoothing(0)
        registerScrollHooks({ stop: () => lenis.stop(), start: () => lenis.start() })
        // content above a trigger can load later (products, fonts) — re-measure when the page grows
        let refreshTimer = 0
        let lastHeight = document.body.scrollHeight
        new ResizeObserver(() => {
          const h = document.body.scrollHeight
          if (Math.abs(h - lastHeight) < 2) return
          lastHeight = h
          clearTimeout(refreshTimer)
          refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150)
        }).observe(document.body)
        kit = { gsap, ScrollTrigger, lenis }
        return kit
      })
      .catch(() => {
        loading = null
        return null
      })
  }
  return loading
}

/** Jump/scroll that cooperates with Lenis when it is running. */
export function scrollToTarget(target, { immediate = false, offset = 0 } = {}) {
  if (kit?.lenis) {
    kit.lenis.scrollTo(target, { immediate, offset, force: true })
    return
  }
  if (typeof target === 'number') window.scrollTo({ top: target, behavior: immediate ? 'instant' : 'smooth' })
  else target?.scrollIntoView?.({ block: 'start', behavior: immediate ? 'instant' : 'smooth' })
}
