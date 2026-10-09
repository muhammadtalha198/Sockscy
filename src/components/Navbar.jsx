import { Link, NavLink } from 'react-router'
import { selectCount, useCart } from '../store/cart'
import { cx } from '../lib/cx'

// Nav text colour per background. Links are 19px bold (WCAG "large text"),
// so every pair here passes at least 3:1.
const INK = {
  yellow: 'text-green',
  green: 'text-yellow',
  red: 'text-black',
  pink: 'text-black',
  offwhite: 'text-red',
  black: 'text-yellow',
}
const FOCUS = {
  yellow: '#000',
  green: 'var(--color-yellow)',
  red: '#000',
  pink: '#000',
  offwhite: '#000',
  black: 'var(--color-yellow)',
}

const link =
  'inline-block py-1 underline-offset-[6px] decoration-[3px] hover:underline aria-[current=page]:underline aria-[current=page]:decoration-wavy'

/** Small lowercase coloured nav, staggered like the reference. Sits over the first section. */
export default function Navbar({ tone = 'yellow' }) {
  const count = useCart(selectCount)
  return (
    <header
      className={cx('absolute inset-x-0 top-0 z-40 px-gutter pt-3 md:pt-5', INK[tone])}
      style={{ '--tone-focus': FOCUS[tone] }}
    >
      <nav aria-label="main" className="flex items-start justify-between gap-4 lg:pr-28">
        <ul className="flex max-w-[14rem] flex-wrap gap-x-5 text-label font-extrabold lowercase md:max-w-none md:gap-x-8">
          <li>
            <NavLink to="/shop" className={link}>
              shop
            </NavLink>
          </li>
          <li>
            <Link to="/#collections" className={link}>
              collections
            </Link>
          </li>
          <li className="ml-8 md:ml-0 md:translate-y-4">
            <NavLink to="/about" className={link}>
              about
            </NavLink>
          </li>
          <li className="md:translate-y-1">
            <NavLink to="/cart" className={link} aria-label={`cart, ${count} ${count === 1 ? 'item' : 'items'}`}>
              cart ({count})
            </NavLink>
          </li>
        </ul>
        <Link to="/" data-logo className="py-1 text-label font-black lowercase tracking-tight" aria-label="socksavvy home">
          socksavvy.co
        </Link>
      </nav>
    </header>
  )
}
