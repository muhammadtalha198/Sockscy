import { cx } from '../lib/cx'

/** Diagonal black corner ribbon ("NEW DROP"). Parent must be position: relative. */
export default function Ribbon({ children = 'NEW DROP', side = 'right', className = '' }) {
  const right = side === 'right'
  return (
    <div
      className={cx(
        'pointer-events-none absolute z-30 h-36 w-36 overflow-hidden',
        right ? 'right-0' : 'left-0',
        className,
      )}
    >
      <div
        className={cx(
          'absolute top-[30px] w-[220px] border-y-2 border-yellow bg-black py-2 text-center text-[0.95rem] font-black uppercase tracking-wide text-yellow',
          right ? '-right-[56px] rotate-45' : '-left-[56px] -rotate-45',
        )}
      >
        {children}
      </div>
    </div>
  )
}
