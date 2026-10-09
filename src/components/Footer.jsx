import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { prefersReducedMotion } from '../hooks/useReducedMotion'
import { COLLECTIONS, SITE } from '../lib/constants'
import { useUi } from '../store/ui'
import NewsletterForm from './NewsletterForm'

/*
  v2 footer reveal. On desktop screens tall enough to show the whole footer it sits
  *behind* the page (position: sticky; bottom: 0 under <main>), so the page lifts off it
  like a peeled sticker. On every screen the giant yellow SOCKSAVVY rises from behind
  the clip line as the footer is uncovered. Progress = how far <main>'s bottom edge has
  moved up past the viewport bottom, which works for both the sticky and normal footer.
*/
function useFooterReveal(footerRef, wordRef) {
  const calm = useUi((s) => s.calm)
  useEffect(() => {
    const footer = footerRef.current
    const word = wordRef.current
    if (!footer || !word || prefersReducedMotion() || calm) return
    let raf = 0
    let running = false
    // only lie underneath the page when the whole footer fits on screen (measured up
    // front and on resize — never while the visitor is looking at it)
    const fit = () => {
      const fits = footer.offsetHeight <= window.innerHeight - 24
      if (fits) footer.dataset.fits = ''
      else delete footer.dataset.fits
    }
    const update = () => {
      raf = 0
      const main = document.getElementById('main')
      if (!main) return
      const uncovered = window.innerHeight - main.getBoundingClientRect().bottom
      const p = Math.min(1, Math.max(0, uncovered / Math.max(1, footer.offsetHeight)))
      // ease out: the word finishes rising a little before the footer is fully shown
      const e = 1 - Math.pow(1 - Math.min(1, p * 1.25), 3)
      word.style.translate = `0 ${((1 - e) * 72).toFixed(2)}%`
      word.style.scale = (0.92 + 0.08 * e).toFixed(4)
    }
    const onScroll = () => {
      if (running && !raf) raf = requestAnimationFrame(update)
    }
    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting
      if (running) update()
    })
    io.observe(footer)
    const onResize = () => {
      fit()
      onScroll()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    fit()
    update()
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      word.style.translate = ''
      word.style.scale = ''
      delete footer.dataset.fits
    }
  }, [footerRef, wordRef, calm])
}

const col = 'text-[0.95rem] font-semibold lowercase hover:text-yellow hover:underline underline-offset-4'

export default function Footer() {
  const wa = `https://wa.me/${SITE.whatsapp}`
  const footerRef = useRef(null)
  const wordRef = useRef(null)
  useFooterReveal(footerRef, wordRef)
  return (
    <footer ref={footerRef} className="site-footer tone-black clip-x relative pt-section">
      <div className="grid gap-12 px-gutter md:grid-cols-12 lg:pr-24">
        <div className="md:col-span-5">
          <h2 className="giant text-display t-display">get weird mail</h2>
          <p className="copy mt-4">new drops hit email + instagram first. one email per drop, no spam, pinky promise.</p>
          <NewsletterForm />
        </div>

        <nav aria-label="footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7 md:justify-items-end">
          <div>
            <h3 className="tag mb-3">shop</h3>
            <ul className="space-y-2">
              <li><Link className={col} to="/shop">all socks</Link></li>
              {COLLECTIONS.map((c) => (
                <li key={c.id}>
                  <Link className={col} to={`/shop?collection=${c.id}`}>{c.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="tag mb-3">help</h3>
            <ul className="space-y-2">
              <li><Link className={col} to="/orders">track my order</Link></li>
              <li><Link className={col} to="/contact">contact</Link></li>
              <li><Link className={col} to="/cart">cart</Link></li>
              <li><Link className={col} to="/about">our story</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="tag mb-3">say hi</h3>
            <ul className="space-y-2">
              <li><a className={col} href={SITE.instagram} target="_blank" rel="noopener noreferrer">instagram</a></li>
              <li><a className={col} href={wa} target="_blank" rel="noopener noreferrer">whatsapp</a></li>
              <li><a className={col} href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
            </ul>
          </div>
        </nav>
      </div>

      {/* logo in giant yellow type, edge to edge */}
      <div aria-hidden="true" className="footer-word mt-16 flex select-none justify-center">
        <span ref={wordRef} className="giant shrink-0 text-[17vw] leading-[0.8] tracking-[-0.06em] text-yellow">
          SOCKSAVVY
        </span>
      </div>

      <div className="flex flex-col gap-2 border-t-2 border-offwhite/25 px-gutter py-6 text-sm font-semibold lowercase sm:flex-row sm:justify-between lg:pr-24">
        <p>© {new Date().getFullYear()} {SITE.domain} — weird socks for weird people</p>
        <p>prices in pkr · cash on delivery across pakistan</p>
      </div>
    </footer>
  )
}
