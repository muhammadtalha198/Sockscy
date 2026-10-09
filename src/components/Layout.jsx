import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useCart } from '../store/cart'
import { whenIdle } from '../lib/motion'
import { loadScrollKit } from '../motion/scroll'
import { toneFor } from '../lib/routes'
import CartDrawer from './CartDrawer'
import CartToast from './CartToast'
import Cursor from './fx/Cursor'
import EasterEggs from './fx/EasterEggs'
import MotionControls from './fx/MotionControls'
import TiltChip from './fx/TiltChip'
import ParallaxRoot from '../parallax/ParallaxRoot'
import Intro from './fx/Intro'
import Footer from './Footer'
import Navbar from './Navbar'
import PlayButton from './PlayButton'
import QuickView from './QuickView'
import ScrollManager from './ScrollManager'
import SideTab from './SideTab'

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

  // smooth scroll + ScrollTrigger kit, after first paint
  useEffect(() => whenIdle(() => loadScrollKit(), 2000), [])

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
      <QuickView />
      <PlayButton />
      <MotionControls />
      <TiltChip />
      <ParallaxRoot />
      <CartToast />
      <Cursor />
      <EasterEggs />
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </>
  )
}
