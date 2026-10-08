import { useState } from 'react'
import { subscribeNewsletter } from '../api/contact'
import { isValidEmail } from '../lib/format'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState({ state: 'idle', message: '' })

  async function onSubmit(e) {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setStatus({ state: 'error', message: 'that email looks a bit weird (and not the good kind).' })
      return
    }
    setStatus({ state: 'loading', message: '' })
    try {
      await subscribeNewsletter(email.trim())
      setStatus({ state: 'done', message: 'you’re in. first dibs on every drop.' })
      setEmail('')
    } catch (err) {
      setStatus({ state: 'error', message: err.message || 'something broke — try again?' })
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-6">
      <label htmlFor="newsletter-email" className="field-label">
        your email
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@weird.pk"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={status.state === 'error' || undefined}
          aria-describedby="newsletter-status"
          className="field sm:flex-1"
          style={{ boxShadow: '4px 4px 0 0 var(--color-offwhite)' }}
        />
        <button type="submit" className="btn btn-yellow shrink-0" disabled={status.state === 'loading'} style={{ boxShadow: '4px 4px 0 0 var(--color-offwhite)' }}>
          {status.state === 'loading' ? 'joining…' : 'join'}
        </button>
      </div>
      <p id="newsletter-status" role="status" className="mt-3 min-h-[1.5em] text-sm font-bold lowercase">
        {status.message}
      </p>
    </form>
  )
}
