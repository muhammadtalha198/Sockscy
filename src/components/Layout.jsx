import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useCart } from '../store/cart'
import CartDrawer from './CartDrawer'
import Intro from './fx/Intro'
import Footer from './Footer'
import Navbar from './Navbar'
import ScrollManager from './ScrollManager'
import SideTab from './SideTab'

// Colour of each page's first section, so the nav picks a readable ink.
function toneFor(pathname) {
  if (pathname === '/') return 'yellow'
  if (pathname.startsWith('/shop')) return 'green'
  if (pathname.startsWith('/product')) return 'offwhite'
  if (pathname.startsWith('/cart')) return 'yellow'
  if (pathname.startsWith('/checkout')) return 'offwhite'
  if (pathname.startsWith('/order-placed')) return 'green'
  if (pathname.startsWith('/about')) return 'red'
  if (pathname.startsWith('/contact') || pathname.startsWith('/orders')) return 'green'
  return 'pink' // 404
}

function PageLoader() {
  return (
    <div className="tone-yellow grid min-h-[100svh] place-items-center" role="status">
      <p className="giant animate-pulse text-huge t-display">loading…</p>
    </div>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  const announcement = useCart((s) => s.announcement)

  return (
    <>
      <a href="#main" className="btn btn-black sr-only-focusable fixed left-4 top-4 z-[100]">
        skip to content
      </a>
      <Intro />
      <ScrollManager />
      <Navbar tone={toneFor(pathname)} />
      <main id="main" tabIndex={-1} className="outline-none">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <SideTab />
      <CartDrawer />
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </>
  )
}
