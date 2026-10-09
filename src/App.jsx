import { lazy, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import Curtain from './components/fx/Curtain'
import Layout from './components/Layout'
import { lessMotion } from './hooks/useLessMotion'
import { PAGE_LOADERS, loaderFor, toneFor } from './lib/routes'
import { setTransition } from './parallax/engine'
import Home from './pages/Home'

// Home ships in the main bundle; every other page is code-split.
const Shop = lazy(PAGE_LOADERS.shop)
const Product = lazy(PAGE_LOADERS.product)
const Cart = lazy(PAGE_LOADERS.cart)
const Checkout = lazy(PAGE_LOADERS.checkout)
const OrderPlaced = lazy(PAGE_LOADERS.orderPlaced)
const About = lazy(PAGE_LOADERS.about)
const Contact = lazy(PAGE_LOADERS.contact)
const NotFound = lazy(PAGE_LOADERS.notFound)

const COVER_MS = 460

/*
  Page transitions: when the path changes, a torn-paper curtain in the next page's
  colour wipes across; the new page (its chunk preloaded meanwhile) is swapped in
  while the screen is covered, then the curtain wipes off. Search/hash-only changes
  (shop filters, /#collections on the home page) swap instantly. Reduced motion / calm: instant.
  v2 depth: as the curtain comes in, the old page's planes move away at their own speeds
  (near ones rush up, far ones sink); the new page's planes arrive from behind and spring
  home as it wipes off (src/parallax/engine.js setTransition).
*/
export default function App() {
  const location = useLocation()
  const [display, setDisplay] = useState(location)
  const [curtain, setCurtain] = useState(null)

  useEffect(() => {
    if (location === display) return
    if (location.pathname === display.pathname || lessMotion()) {
      setDisplay(location)
      // a wipe already in flight (e.g. Back pressed mid-transition) must still leave,
      // otherwise the curtain stays over the page and swallows every click
      setCurtain((c) => (!c ? c : lessMotion() ? null : c.phase === 'in' ? { ...c, phase: 'out' } : c))
      setTransition(null)
      return
    }
    let cancelled = false
    const tone = toneFor(location.pathname)
    setCurtain({ tone, phase: 'in', key: location.key })
    setTransition('leave')
    const loader = loaderFor(location.pathname)
    const ready = Promise.race([
      loader ? loader().catch(() => {}) : Promise.resolve(),
      new Promise((r) => setTimeout(r, 1600)),
    ])
    const covered = new Promise((r) => setTimeout(r, COVER_MS))
    Promise.all([ready, covered]).then(() => {
      if (cancelled) return
      setDisplay(location)
      // two frames so the new page has painted under the curtain
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (cancelled) return
          setCurtain({ tone, phase: 'out', key: location.key })
          setTransition('arrive')
        }),
      )
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  return (
    <>
      <Routes location={display}>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:id" element={<Product />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-placed" element={<OrderPlaced />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="orders" element={<Contact focus="track" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Curtain curtain={curtain} onDone={() => setCurtain(null)} />
    </>
  )
}
