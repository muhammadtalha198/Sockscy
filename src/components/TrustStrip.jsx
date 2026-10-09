import { SITE } from '../lib/constants'
import { cx } from '../lib/cx'

// doodle icons, drawn like the stickers (thick black outline, flat fill)
const Cash = () => (
  <svg viewBox="0 0 32 24" className="h-5 w-6 shrink-0" aria-hidden="true">
    <rect x="2" y="3" width="28" height="18" rx="3" fill="#f4d500" stroke="#000" strokeWidth="2.5" />
    <circle cx="16" cy="12" r="4.5" fill="#1c7d56" stroke="#000" strokeWidth="2.2" />
  </svg>
)
const Swap = () => (
  <svg viewBox="0 0 28 28" className="h-5 w-5 shrink-0" aria-hidden="true">
    <path d="M5 11a9 9 0 0 1 16-4l2-3v8h-8l3-3a6 6 0 0 0-10 3z" fill="#ff52a1" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
    <path d="M23 17a9 9 0 0 1-16 4l-2 3v-8h8l-3 3a6 6 0 0 0 10-3z" fill="#f4d500" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
  </svg>
)
const Chat = () => (
  <svg viewBox="0 0 28 28" className="h-5 w-5 shrink-0" aria-hidden="true">
    <path d="M14 3a11 11 0 0 0-9.6 16.4L3 25l5.8-1.4A11 11 0 1 0 14 3z" fill="#1c7d56" stroke="#000" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M10 10.5c.4 3 2.6 5.6 6 6.6" fill="none" stroke="#f5f1e8" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
)

const pill =
  'inline-flex items-center gap-2 rounded-full border-2 border-black px-3 py-1.5 text-sm font-black lowercase leading-none text-black shadow-hard'

/**
 * Trust strip next to every add-to-cart / checkout button: cash on delivery,
 * easy returns, WhatsApp. Copy lives in SITE (lib/constants) so the owner can edit it.
 */
export default function TrustStrip({ className = '', bg = 'bg-offwhite' }) {
  const wa = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('hi socksavvy! i have a question about a pair')}`
  return (
    <ul className={cx('flex flex-wrap gap-2.5', className)} aria-label="why it’s safe to order">
      <li className={cx(pill, bg)}>
        <Cash />
        cash on delivery
      </li>
      <li className={cx(pill, bg)}>
        <Swap />
        {SITE.returns}
      </li>
      <li>
        <a href={wa} target="_blank" rel="noopener noreferrer" className={cx(pill, bg, 'underline-offset-4 hover:underline')}>
          <Chat />
          questions? whatsapp us
          <span className="sr-only"> (opens whatsapp)</span>
        </a>
      </li>
    </ul>
  )
}
