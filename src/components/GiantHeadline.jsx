import { useInView } from '../hooks/useInView'
import { cx } from '../lib/cx'

const SIZES = {
  mega: 'text-mega',
  giant: 'text-giant',
  huge: 'text-huge',
  display: 'text-display',
}

/*
  Giant uppercase Inter Black headline. Each line slides in from the side
  when it scrolls into view. Lines never wrap — the screen edge crops them.

  <GiantHeadline lines={['FRESH', { text: 'DROP', className: 'pl-[20vw] text-offwhite' }]} />
  A line with `letters: true` renders one span per letter (the physics hero shakes them).
*/
export default function GiantHeadline({ as: Tag = 'h2', lines, size = 'giant', className = '', id, ready = true, children }) {
  const [ref, inView] = useInView()
  return (
    <Tag ref={ref} id={id} className={cx('giant t-display relative', SIZES[size], inView && ready && 'is-in', className)}>
      {lines.map((line, i) => {
        const l = typeof line === 'string' ? { text: line } : line
        return (
          <span
            key={i}
            className={cx('slide-line', l.className)}
            data-from={l.from || (i % 2 ? 'right' : 'left')}
            style={{ transitionDelay: `${i * 90}ms`, ...l.style }}
          >
            {l.letters
              ? [...l.text].map((ch, k) => (
                  <span key={k} className="giant-letter">
                    {ch}
                  </span>
                ))
              : l.text}
            {i < lines.length - 1 && ' '}
          </span>
        )
      })}
      {children}
    </Tag>
  )
}
