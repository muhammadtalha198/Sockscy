import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { USE_MOCK } from '../api/client'
import { sendContactMessage } from '../api/contact'
import { DEMO_ORDER_NUMBER, trackOrder } from '../api/orders'
import { Flower, Smiley, SockMonster, Sparkle } from '../components/art/Doodles'
import { TextArea, TextField } from '../components/form/Field'
import GiantHeadline from '../components/GiantHeadline'
import Sticker from '../components/Sticker'
import { SITE } from '../lib/constants'
import { cx } from '../lib/cx'
import { formatDate, formatPKR, isValidEmail, isValidPkMobile } from '../lib/format'

export default function Contact({ focus }) {
  const wa = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('hi socksavvy! ')}`

  return (
    <>
      <title>{focus === 'track' ? 'track your order — SOCKSAVVY' : 'contact — SOCKSAVVY'}</title>

      <section aria-labelledby="contact-title" className="tone-green clip-x relative pb-section pt-28 md:pt-36">
        <Sticker className="absolute right-[6%] top-[80px] z-20 w-24 md:right-[14%] md:w-36" rotate={-10} depth="near">
          <Smiley />
        </Sticker>
        <Sticker className="absolute left-[42%] top-[24%] hidden w-14 md:block" outline={false} rotate={12}>
          <Sparkle fill="#f4d500" />
        </Sticker>

        <GiantHeadline
          as="h1"
          id="contact-title"
          lines={[
            { text: 'SAY', from: 'left', className: 'pl-gutter' },
            { text: 'HI!', from: 'right', className: 'pl-[22vw] text-offwhite' },
          ]}
        />

        <div className="mt-10 grid gap-12 px-gutter lg:grid-cols-12 lg:pr-24">
          <div className="lg:col-span-5">
            <p className="copy">questions about sizes, an order, a collab or a very specific sock you saw once in 2009? we’re fastest on whatsapp.</p>
            <p className="copy copy-offset mt-2">usually replying within a few hours, 11am–9pm, mon–sat.</p>
            <div className="mt-8 flex flex-col items-start gap-4">
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-yellow btn-lg">
                chat on whatsapp ↗
              </a>
              <a href={`mailto:${SITE.email}`} className="text-label font-extrabold lowercase underline decoration-[3px] underline-offset-[6px]">
                {SITE.email}
              </a>
              <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="text-label font-extrabold lowercase underline decoration-[3px] underline-offset-[6px]">
                {SITE.instagramHandle} ↗
              </a>
            </div>
          </div>
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </section>

      <TrackOrder autoFocus={focus === 'track'} />
    </>
  )
}

function ContactForm() {
  const [form, setForm] = useState({ name: '', contact: '', orderNumber: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    const found = {}
    if (form.name.trim().length < 2) found.name = 'tell us your name'
    if (!isValidPkMobile(form.contact) && !isValidEmail(form.contact)) found.contact = 'add a mobile number (03…) or an email'
    if (form.message.trim().length < 5) found.message = 'write a little more'
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus()
      return
    }
    setStatus('sending')
    try {
      await sendContactMessage({ ...form, orderNumber: form.orderNumber.trim() || undefined })
      setStatus('sent')
      setForm({ name: '', contact: '', orderNumber: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-[2rem] border-2 border-black bg-offwhite p-5 text-black shadow-hard-lg [--tone-focus:#000] md:p-8">
      <h2 className="giant text-display">send a note</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <TextField id="c-name" label="name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
        <TextField
          id="c-contact"
          label="phone or email"
          autoComplete="email"
          placeholder="0300 1234567"
          value={form.contact}
          onChange={set('contact')}
          error={errors.contact}
        />
      </div>
      <TextField
        id="c-order"
        className="mt-5"
        label="order number"
        optional
        placeholder="SS-12345"
        value={form.orderNumber}
        onChange={set('orderNumber')}
      />
      <TextArea id="c-message" className="mt-5" label="message" value={form.message} onChange={set('message')} error={errors.message} />
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-pink btn-lg" disabled={status === 'sending'}>
          {status === 'sending' ? 'sending…' : 'send it'}
        </button>
        <p role="status" className="text-[0.95rem] font-bold lowercase">
          {status === 'sent' && 'got it! we’ll get back to you soon.'}
          {status === 'error' && 'that didn’t send — try whatsapp instead?'}
        </p>
      </div>
    </form>
  )
}

function TrackOrder({ autoFocus }) {
  const [params, setParams] = useSearchParams()
  const [number, setNumber] = useState(params.get('number') || '')
  const [phone, setPhone] = useState('')
  const [state, setState] = useState({ status: 'idle', order: null, error: '' })
  const inputRef = useRef(null)
  const resultRef = useRef(null)

  async function lookup(orderNumber, phoneNumber) {
    if (!orderNumber.trim()) {
      setState({ status: 'error', order: null, error: 'enter your order number' })
      inputRef.current?.focus()
      return
    }
    setState({ status: 'loading', order: null, error: '' })
    try {
      const order = await trackOrder(orderNumber, phoneNumber)
      setState({ status: 'done', order, error: '' })
      setParams({ number: order.orderNumber }, { replace: true, preventScrollReset: true })
      requestAnimationFrame(() => resultRef.current?.focus())
    } catch (err) {
      setState({ status: 'error', order: null, error: err.message || 'something went wrong' })
    }
  }

  useEffect(() => {
    if (autoFocus) {
      document.getElementById('track')?.scrollIntoView({ block: 'start' })
      inputRef.current?.focus({ preventScroll: true })
    }
    const initial = params.get('number')
    if (initial) lookup(initial, '')
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const order = state.order
  return (
    <section id="track" aria-labelledby="track-title" className="tone-yellow clip-x relative scroll-mt-4 py-section">
      <Sticker className="absolute right-[6%] top-[8%] z-20 w-24 md:w-36" rotate={10} depth="near">
        <SockMonster />
      </Sticker>
      <Sticker className="absolute bottom-[5%] left-[8%] hidden w-14 md:block" outline={false} rotate={-8}>
        <Flower fill="#ff52a1" center="#000" />
      </Sticker>

      <GiantHeadline
        id="track-title"
        lines={[
          { text: 'TRACK', from: 'right', className: 'pl-[18vw]' },
          { text: 'ORDER', from: 'left', className: 'pl-gutter' },
        ]}
      />

      <div className="mt-10 grid gap-10 px-gutter lg:grid-cols-12 lg:pr-24">
        <form
          className="space-y-5 lg:col-span-5"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            lookup(number, phone)
          }}
        >
          <TextField
            ref={inputRef}
            id="t-number"
            label="order number"
            placeholder="SS-12345"
            autoCapitalize="characters"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            error={state.status === 'error' ? state.error : undefined}
            hint={USE_MOCK ? `demo: try ${DEMO_ORDER_NUMBER}, or any order you place` : 'it’s in your confirmation message'}
          />
          <TextField
            id="t-phone"
            label="mobile number"
            type="tel"
            inputMode="tel"
            optional
            placeholder="0300 1234567"
            hint="the one you ordered with"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button type="submit" className="btn btn-black btn-lg" disabled={state.status === 'loading'}>
            {state.status === 'loading' ? 'looking…' : 'track it'}
          </button>
        </form>

        <div className="lg:col-span-7" aria-live="polite">
          {order && (
            <div ref={resultRef} tabIndex={-1} className="rounded-[2rem] border-2 border-black bg-offwhite p-5 shadow-hard-lg md:p-8">
              <p className="tag">order</p>
              <p className="giant text-display">{order.orderNumber}</p>
              <p className="mt-1 text-sm font-bold lowercase">
                placed {formatDate(order.createdAt)} · {order.payment === 'cod' ? 'cash on delivery' : 'card'}
                {order.total ? ` · ${formatPKR(order.total)}` : ''}
              </p>
              <ol className="mt-6 space-y-0">
                {order.timeline?.map((step, i) => {
                  const current = step.key === order.status
                  return (
                    <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
                      {i < order.timeline.length - 1 && (
                        <span aria-hidden="true" className={cx('absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-1', step.done ? 'bg-black' : 'bg-black/20')} />
                      )}
                      <span
                        aria-hidden="true"
                        className={cx(
                          'relative grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-black text-sm font-black',
                          step.done ? (current ? 'bg-pink' : 'bg-green text-offwhite') : 'bg-white',
                        )}
                      >
                        {step.done ? '✓' : ''}
                      </span>
                      <div className={cx(!step.done && 'opacity-60')}>
                        <p className={cx('font-black uppercase leading-tight', current && 'text-lg')}>
                          {step.label}
                          <span className="sr-only">{step.done ? (current ? ' — current status' : ' — done') : ' — not yet'}</span>
                        </p>
                        {step.done && <p className="text-sm font-semibold lowercase">{formatDate(step.at)}</p>}
                      </div>
                    </li>
                  )
                })}
              </ol>
              {order.items?.length > 0 && (
                <ul className="mt-6 border-t-2 border-black pt-4 text-sm font-bold lowercase">
                  {order.items.map((it) => (
                    <li key={`${it.id}-${it.size}`}>
                      {it.qty} × {it.name} ({it.size})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {!order && state.status !== 'loading' && (
            <div className="flex items-center gap-5">
              <Sticker className="w-24 shrink-0" rotate={-8} float={false}>
                <Smiley fill="#ff52a1" />
              </Sticker>
              <p className="copy">pop in your order number to see where your socks are. you’ll find it in your whatsapp confirmation.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
