import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { USE_MOCK } from '../api/client'
import { createOrder } from '../api/orders'
import { Star } from '../components/art/Doodles'
import CartSummary from '../components/cart/CartSummary'
import GiftPackToggle from '../components/cart/GiftPackToggle'
import { ErrorSummary, SelectField, TextArea, TextField } from '../components/form/Field'
import GiantHeadline from '../components/GiantHeadline'
import ParallaxSection from '../components/parallax/ParallaxSection'
import SoftBackdrop, { DriftSticker } from '../components/parallax/SoftBackdrop'
import { useCart } from '../store/cart'
import { CITIES, PROVINCES } from '../lib/constants'
import { cx } from '../lib/cx'
import { formatPKR, isValidEmail, isValidPkMobile, normalisePhone } from '../lib/format'
import { markUsed } from '../lib/discount'
import { getTotals } from '../lib/pricing'

const EMPTY = {
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  cityOther: '',
  province: '',
  postalCode: '',
  notes: '',
  payment: 'cod',
}

const LABELS = {
  name: 'full name',
  phone: 'mobile number',
  email: 'email',
  address: 'address',
  city: 'city',
  cityOther: 'city name',
  province: 'province',
  postalCode: 'postal code',
}

function validate(f) {
  const e = {}
  if (f.name.trim().length < 2) e.name = 'tell us your name'
  if (!isValidPkMobile(f.phone)) e.phone = 'use a pakistani mobile number, like 0300 1234567'
  if (f.email.trim() && !isValidEmail(f.email)) e.email = 'that email doesn’t look right'
  if (f.address.trim().length < 8) e.address = 'add your full address — house, street, area'
  if (!f.city) e.city = 'pick your city'
  if (f.city === 'other' && f.cityOther.trim().length < 2) e.cityOther = 'type your city'
  if (!f.province) e.province = 'pick your province'
  if (f.postalCode.trim() && !/^\d{5}$/.test(f.postalCode.trim())) e.postalCode = 'postal codes are 5 digits'
  return e
}

export default function Checkout() {
  const cart = useCart(
    useShallow((s) => ({ items: s.items, giftPack: s.giftPack, setGiftPack: s.setGiftPack, discount: s.discount, clear: s.clear })),
  )
  // once the order is placed the cart is emptied straight away (so Back, a reload or a
  // cancelled page swap can never leave it full); this page keeps showing what was ordered
  // while the curtain covers it, instead of flashing "nothing to pay"
  const [placed, setPlaced] = useState(null)
  const { items, giftPack, discount } = placed || cart
  const { setGiftPack } = cart
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const summaryRef = useRef(null)
  const navigate = useNavigate()
  const totals = getTotals(items, giftPack, discount)

  const set = (key) => (e) => {
    const value = e.target.value
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(({ [key]: _gone, ...rest }) => rest)
  }

  async function onSubmit(e) {
    e.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length) {
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    setSubmitting(true)
    setServerError('')
    try {
      const res = await createOrder({
        customer: { name: form.name.trim(), phone: normalisePhone(form.phone), email: form.email.trim() || undefined },
        shipping: {
          address: form.address.trim(),
          city: form.city === 'other' ? form.cityOther.trim() : form.city,
          province: form.province,
          postalCode: form.postalCode.trim() || undefined,
          notes: form.notes.trim() || undefined,
        },
        payment: form.payment,
        giftPack,
        discountCode: totals.discountCode || undefined,
        items: items.map((i) => ({ id: i.id, size: i.size, qty: i.qty, colorway: i.colorway?.id })),
      })
      if (res.paymentUrl) {
        window.location.assign(res.paymentUrl) // card: hand off to the payment gateway
        return
      }
      const order = { ...res, phone: normalisePhone(form.phone), total: res.total ?? totals.total }
      if (totals.discountCode === 'PAIRUP10') markUsed()
      setPlaced({ items, giftPack, discount })
      cart.clear()
      navigate('/order-placed', { replace: true, state: { order } })
      // stay "submitting" while the page swaps, so the order can't be placed twice
    } catch (err) {
      setServerError(err.message || 'something went wrong — please try again')
      setSubmitting(false)
    }
  }

  if (!items.length) {
    return (
      <section className="tone-offwhite clip-x relative isolate min-h-[80svh] pb-section pt-28 md:pt-36">
        <title>checkout — SOCKSAVVY</title>
        <SoftBackdrop />
        <GiantHeadline as="h1" lines={[{ text: 'NOTHING', className: 'pl-gutter' }, { text: 'TO PAY', className: 'pl-[18vw]' }]} />
        <div className="mt-8 flex flex-col items-start gap-5 px-gutter">
          <p className="copy">your cart is empty, so there’s nothing to check out (yet).</p>
          <Link to="/shop" className="btn btn-pink btn-lg">
            shop socks
          </Link>
        </div>
      </section>
    )
  }

  return (
    // v2: subtle only — soft paper behind, one drifting sticker; the form never moves
    <section aria-labelledby="checkout-title" className="tone-offwhite clip-x relative isolate pb-section">
      <title>checkout — SOCKSAVVY</title>
      <SoftBackdrop />
      <ParallaxSection as="div" rest="top" className="pt-28 md:pt-36">
        <DriftSticker className="absolute right-[6%] top-[84px] z-20 w-16 md:w-24" rotate={12}>
          <Star fill="#f4d500" />
        </DriftSticker>

        <GiantHeadline
          as="h1"
          id="checkout-title"
          lines={[
            { text: 'CHECK', from: 'left', className: 'pl-gutter' },
            { text: 'OUT', from: 'right', className: 'pl-[30vw]' },
          ]}
        />
        <p className="copy mt-4 px-gutter">one page. no account. cash on delivery anywhere in pakistan.</p>
      </ParallaxSection>

      <div className="mt-10 grid gap-10 px-gutter lg:grid-cols-12 lg:gap-14 lg:pr-24">
        <form id="checkout-form" onSubmit={onSubmit} noValidate className="space-y-10 lg:col-span-7">
          <ErrorSummary errors={errors} labels={LABELS} innerRef={summaryRef} />

          <fieldset className="space-y-5">
            <legend className="giant mb-5 text-display">
              <span className="tag mr-2 align-middle">01</span>you
            </legend>
            <TextField id="name" label="full name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
            <TextField
              id="phone"
              label="mobile number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0300 1234567"
              hint="we’ll whatsapp or call you to confirm the order"
              value={form.phone}
              onChange={set('phone')}
              error={errors.phone}
            />
            <TextField
              id="email"
              label="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              optional
              hint="for your receipt"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
            />
          </fieldset>

          <fieldset className="space-y-5">
            <legend className="giant mb-5 text-display">
              <span className="tag mr-2 align-middle">02</span>delivery
            </legend>
            <TextArea
              id="address"
              label="address"
              rows={3}
              autoComplete="street-address"
              placeholder="house #, street, block / sector, area"
              value={form.address}
              onChange={set('address')}
              error={errors.address}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                id="city"
                label="city"
                options={[...CITIES, { value: 'other', label: 'other city…' }]}
                value={form.city}
                onChange={set('city')}
                error={errors.city}
              />
              <SelectField id="province" label="province" options={PROVINCES} value={form.province} onChange={set('province')} error={errors.province} />
            </div>
            {form.city === 'other' && (
              <TextField id="cityOther" label="city name" autoComplete="address-level2" value={form.cityOther} onChange={set('cityOther')} error={errors.cityOther} />
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                id="postalCode"
                label="postal code"
                inputMode="numeric"
                autoComplete="postal-code"
                optional
                maxLength={5}
                value={form.postalCode}
                onChange={set('postalCode')}
                error={errors.postalCode}
              />
            </div>
            <TextArea
              id="notes"
              label="delivery notes"
              optional
              rows={2}
              placeholder="landmark, best time to call, gate colour…"
              value={form.notes}
              onChange={set('notes')}
            />
          </fieldset>

          <fieldset>
            <legend className="giant mb-5 text-display">
              <span className="tag mr-2 align-middle">03</span>payment
            </legend>
            <div className="grid gap-4">
              <PaymentOption
                value="cod"
                checked={form.payment === 'cod'}
                onChange={set('payment')}
                title="cash on delivery"
                text={`pay the rider ${formatPKR(totals.total)} in cash when your socks arrive.`}
              />
              <PaymentOption
                value="card"
                checked={form.payment === 'card'}
                onChange={set('payment')}
                title="debit / credit card"
                text={
                  USE_MOCK
                    ? 'visa, mastercard & unionpay. demo mode: payment is simulated — connect your gateway in api/orders.js.'
                    : 'visa, mastercard & unionpay. you’ll be sent to our secure payment page — we never see your card number.'
                }
              />
            </div>
          </fieldset>
        </form>

        <aside aria-labelledby="order-summary-title" className="lg:col-span-5">
          <div className="space-y-5 rounded-[2rem] border-2 border-black bg-yellow p-5 shadow-hard-lg md:p-7 lg:sticky lg:top-8">
            <h2 id="order-summary-title" className="giant text-display">
              your order
            </h2>
            <ul className="space-y-2 text-[0.95rem] font-bold lowercase">
              {items.map((i) => (
                <li key={i.key} className="flex justify-between gap-4">
                  <span>
                    {i.qty} × {i.name} <span className="font-semibold">({i.size}{i.colorway ? `, ${i.colorway.label}` : ''})</span>
                  </span>
                  <span className="shrink-0">{formatPKR(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <GiftPackToggle compact checked={giftPack} onChange={setGiftPack} />
            <CartSummary items={items} giftPack={giftPack} />
            {serverError && (
              <p role="alert" className="rounded-xl border-2 border-black bg-red p-3 text-sm font-bold lowercase">
                {serverError}
              </p>
            )}
            <button type="submit" form="checkout-form" className="btn btn-pink btn-lg w-full" disabled={submitting}>
              {submitting ? 'placing order…' : form.payment === 'cod' ? `place order · ${formatPKR(totals.total)}` : `pay ${formatPKR(totals.total)}`}
            </button>
            <p className="text-center text-xs font-bold lowercase">
              by placing an order you agree we’ll message you on whatsapp about it. that’s it.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}

function PaymentOption({ value, checked, onChange, title, text }) {
  return (
    <label
      className={cx(
        'flex cursor-pointer items-start gap-4 rounded-2xl border-2 border-black p-4 transition-transform',
        checked ? 'translate-x-1 translate-y-1 bg-black text-offwhite [--tone-focus:var(--color-yellow)]' : 'bg-white shadow-hard',
      )}
    >
      <input type="radio" name="payment" value={value} checked={checked} onChange={onChange} className="mt-1 h-5 w-5 shrink-0 accent-yellow" />
      <span>
        <span className="block text-lg font-black uppercase leading-tight">{title}</span>
        <span className="mt-1 block text-sm font-semibold lowercase">{text}</span>
      </span>
    </label>
  )
}
