import { lazy } from 'react'
import { Route, Routes } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'

// Home ships in the main bundle; every other page is code-split.
const Shop = lazy(() => import('./pages/Shop'))
const Product = lazy(() => import('./pages/Product'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderPlaced = lazy(() => import('./pages/OrderPlaced'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <Routes>
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
  )
}
