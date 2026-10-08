import SockArt from './SockArt'

/** Pizza-box style gift pack illustration (lid open, a pair of socks inside) */
export default function PizzaBox({ className = '', art }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <svg viewBox="0 0 220 200" className="h-full w-full">
        {/* open lid */}
        <path d="M30 20H190L178 86H42Z" fill="#f5f1e8" stroke="#000" strokeWidth="5" strokeLinejoin="round" />
        <path d="M44 32H176L168 76H52Z" fill="none" stroke="#e63a3f" strokeWidth="4" strokeLinejoin="round" />
        <text x="110" y="52" textAnchor="middle" fontSize="15" fontWeight="900" fill="#000" letterSpacing="-0.5">
          SOCKSAVVY
        </text>
        <text x="110" y="69" textAnchor="middle" fontSize="9" fontWeight="800" fill="#e63a3f" letterSpacing="1">
          HOT · FRESH · SOCKS
        </text>
        {/* box base */}
        <path d="M14 104H206L194 186H26Z" fill="#e8962e" stroke="#000" strokeWidth="5" strokeLinejoin="round" />
        <path d="M42 86H178L206 104H14Z" fill="#c97a3a" stroke="#000" strokeWidth="5" strokeLinejoin="round" />
        <path d="M60 128H160M70 150H150" stroke="#000" strokeWidth="4" strokeLinecap="round" opacity="0.25" />
      </svg>
      <SockArt art={art || { pattern: 'pizza', base: '#e63a3f', trim: '#f4d500' }} view="pair" className="absolute left-[22%] top-[28%] w-[56%] -rotate-6" />
    </div>
  )
}
