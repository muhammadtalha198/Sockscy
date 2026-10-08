import { Link } from 'react-router'
import { COLLECTIONS, SITE } from '../lib/constants'
import NewsletterForm from './NewsletterForm'

const col = 'text-[0.95rem] font-semibold lowercase hover:text-yellow hover:underline underline-offset-4'

export default function Footer() {
  const wa = `https://wa.me/${SITE.whatsapp}`
  return (
    <footer className="tone-black clip-x relative pt-section">
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
      <div aria-hidden="true" className="mt-16 flex select-none justify-center">
        <span className="giant shrink-0 text-[17vw] leading-[0.8] tracking-[-0.06em] text-yellow">SOCKSAVVY</span>
      </div>

      <div className="flex flex-col gap-2 border-t-2 border-offwhite/25 px-gutter py-6 text-sm font-semibold lowercase sm:flex-row sm:justify-between lg:pr-24">
        <p>© {new Date().getFullYear()} {SITE.domain} — weird socks for weird people</p>
        <p>prices in pkr · cash on delivery across pakistan</p>
      </div>
    </footer>
  )
}
