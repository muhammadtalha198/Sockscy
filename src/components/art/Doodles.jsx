// Hand-drawn style doodles & sticker art. All decorative (aria-hidden).
// Black outline, flat fill, no gradients — matches the reference stickers.

const base = { 'aria-hidden': true, focusable: 'false' }

/** 4- or 5-petal doodle flower with a centre dot */
export function Flower({ petals = 5, fill = '#f4d500', center = '#ff8a2b', className = '' }) {
  const angles = Array.from({ length: petals }, (_, i) => (360 / petals) * i)
  const petal = 'M0-6C-24-18-21-47 0-47 21-47 24-18 0-6Z'
  return (
    <svg viewBox="-54 -54 108 108" className={className} {...base}>
      {/* stroke pass, then fill pass on top → one clean outer outline */}
      {angles.map((a) => (
        <path key={`s${a}`} d={petal} transform={`rotate(${a})`} fill={fill} stroke="#000" strokeWidth="7" strokeLinejoin="round" />
      ))}
      {angles.map((a) => (
        <path key={`f${a}`} d={petal} transform={`rotate(${a})`} fill={fill} />
      ))}
      <circle r="11" fill={center} stroke="#000" strokeWidth="4" />
    </svg>
  )
}

export function Star({ fill = '#ffc6dd', className = '' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} {...base}>
      <path
        d="M50 6 61 38 95 38 67 58 78 92 50 71 22 92 33 58 5 38 39 38Z"
        fill={fill}
        stroke="#000"
        strokeWidth="5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Flame-like squiggle (like the yellow doodles in the pink reference section) */
export function Squiggle({ fill = '#f4d500', className = '' }) {
  return (
    <svg viewBox="0 0 110 70" className={className} {...base}>
      <path
        d="M6 60C26 44 26 22 46 26 59 29 55 45 68 42 80 39 78 16 98 6 90 25 96 53 72 57 57 60 57 43 47 45 35 47 41 66 6 60Z"
        fill={fill}
        stroke="#000"
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Smiley({ fill = '#f4d500', className = '' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} {...base}>
      <circle cx="50" cy="50" r="44" fill={fill} stroke="#000" strokeWidth="5" />
      <ellipse cx="36" cy="40" rx="6" ry="10" fill="#000" />
      <ellipse cx="64" cy="40" rx="6" ry="10" fill="#000" />
      <path d="M26 58Q50 86 74 58" fill="none" stroke="#000" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

/** The brand mascot: a sock with googly eyes and a toothy grin */
export function SockMonster({ fill = '#ff52a1', trim = '#f4d500', className = '' }) {
  return (
    <svg viewBox="0 0 160 200" className={className} {...base}>
      <path
        d="M34 10H108V112C108 122 116 128 128 132 152 140 156 178 128 186L70 190C38 192 26 170 28 146Z"
        fill={fill}
        stroke="#000"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path d="M34 10H108V40H31Z" fill={trim} stroke="#000" strokeWidth="6" strokeLinejoin="round" />
      <circle cx="56" cy="78" r="17" fill="#fff" stroke="#000" strokeWidth="5" />
      <circle cx="88" cy="74" r="13" fill="#fff" stroke="#000" strokeWidth="5" />
      <circle cx="60" cy="82" r="7" fill="#000" />
      <circle cx="85" cy="78" r="5.5" fill="#000" />
      <path d="M44 118Q76 150 108 112Z" fill="#e63a3f" stroke="#000" strokeWidth="5" strokeLinejoin="round" />
      <path d="M60 122H72V134H60ZM78 122H90V132H78Z" fill="#fff" stroke="#000" strokeWidth="3" />
    </svg>
  )
}

export function Heart({ fill = '#e63a3f', className = '' }) {
  return (
    <svg viewBox="0 0 100 92" className={className} {...base}>
      <path
        d="M50 84C14 60 4 38 12 22 20 6 40 6 50 24 60 6 80 6 88 22 96 38 86 60 50 84Z"
        fill={fill}
        stroke="#000"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M24 26C27 20 33 18 37 20" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

export function Sparkle({ fill = '#f5f1e8', className = '' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} {...base}>
      <path
        d="M50 4C54 34 66 46 96 50 66 54 54 66 50 96 46 66 34 54 4 50 34 46 46 34 50 4Z"
        fill={fill}
        stroke="#000"
        strokeWidth="5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function FriedEgg({ className = '' }) {
  return (
    <svg viewBox="0 0 120 110" className={className} {...base}>
      <path
        d="M58 6C86 2 112 22 110 48 108 70 118 92 88 102 62 110 40 100 22 92 0 82 4 58 10 40 16 20 34 9 58 6Z"
        fill="#fff"
        stroke="#000"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="54" r="22" fill="#f4d500" stroke="#000" strokeWidth="5" />
      <path d="M50 44C53 40 58 38 62 39" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

export function Arrow({ className = '' }) {
  return (
    <svg viewBox="0 0 120 60" className={className} fill="none" {...base}>
      <path d="M4 40C30 10 64 6 104 26" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M86 12 106 27 84 38" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
