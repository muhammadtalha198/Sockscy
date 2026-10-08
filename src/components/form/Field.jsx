import { cx } from '../../lib/cx'

/*
  Labelled form controls with hint + error wiring (aria-invalid / aria-describedby).
  <Field id="phone" label="phone" error={errors.phone} hint="we'll whatsapp you">
    <input … />   ← receives id / aria props automatically via render-prop
  </Field>
*/
function describe(id, hint, error) {
  return [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
}

function Wrap({ id, label, hint, error, optional, className, children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {optional && <span className="font-semibold"> (optional)</span>}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm font-semibold lowercase">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error lowercase">
          ✕ {error}
        </p>
      )}
    </div>
  )
}

export function TextField({ id, label, hint, error, optional, className, inputClassName, ...props }) {
  return (
    <Wrap id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <input
        id={id}
        name={id}
        className={cx('field', inputClassName)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe(id, hint, error)}
        required={!optional}
        {...props}
      />
    </Wrap>
  )
}

export function TextArea({ id, label, hint, error, optional, className, ...props }) {
  return (
    <Wrap id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <textarea
        id={id}
        name={id}
        rows={4}
        className="field resize-y"
        aria-invalid={error ? true : undefined}
        aria-describedby={describe(id, hint, error)}
        required={!optional}
        {...props}
      />
    </Wrap>
  )
}

export function SelectField({ id, label, hint, error, optional, className, options, placeholder = 'choose…', ...props }) {
  return (
    <Wrap id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <select
        id={id}
        name={id}
        className="field"
        aria-invalid={error ? true : undefined}
        aria-describedby={describe(id, hint, error)}
        required={!optional}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )
        })}
      </select>
    </Wrap>
  )
}

/** Shown above a form after a failed submit; links jump to each field. */
export function ErrorSummary({ errors, labels, innerRef }) {
  const entries = Object.entries(errors)
  if (!entries.length) return null
  return (
    <div ref={innerRef} tabIndex={-1} role="alert" className="rounded-2xl border-2 border-black bg-red p-5 text-black shadow-hard">
      <p className="text-lg font-black uppercase">fix {entries.length === 1 ? 'this' : `these ${entries.length}`} first:</p>
      <ul className="mt-2 list-['✕_'] space-y-1 pl-5 text-[0.95rem] font-bold lowercase">
        {entries.map(([key, msg]) => (
          <li key={key}>
            <a href={`#${key}`} className="underline underline-offset-2">
              {labels?.[key] ? `${labels[key]}: ` : ''}
              {msg}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
