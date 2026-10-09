import { useId } from 'react'

/*
  Placeholder product art: an SVG crew sock filled with one of 12 patterns.
  Used until real photos are added (see ProductImage + README → "Product photos").

  views:
    single — one sock, slightly tilted (cutouts, thumbnails)
    upright — one sock, untilted and tightly cropped (physics sprites)
    pair   — flat-lay pair
    kick   — two legs in the air wearing the socks
    detail — zoomed-in pattern
*/

export const SOCK_PATH =
  'M48 12H124V156C124 170 136 176 156 181L170 185C198 192 200 238 172 241L86 243C54 245 44 222 46 196Z'
const SKIN = '#c98d63'
const S = { stroke: '#000', strokeWidth: 1.6, strokeLinejoin: 'round', strokeLinecap: 'round' }

const motifs = {
  eggs: () => (
    <>
      <path d="M-1-12C9-14 15-6 14 1 13 9 5 14-4 13-12 12-15 4-13-3-11-10-7-11-1-12Z" fill="#fff" {...S} />
      <circle cx="1" r="5.2" fill="#f4d500" {...S} />
      <circle cx="-0.6" cy="-1.8" r="1.4" fill="#fff" />
    </>
  ),
  matcha: () => (
    <>
      <path d="M-10-6H10L8 9Q7 12 4 12H-4Q-7 12-8 9Z" fill="#fff" {...S} />
      <ellipse cy="-6" rx="10" ry="3" fill="#7fae3c" {...S} />
      <path d="M10-2C16-2 16 6 9 6" fill="none" {...S} />
      <path d="M-3-6.4C-1.5-8 1.5-8 3-6.4" fill="none" stroke="#fff" strokeWidth="1.2" />
    </>
  ),
  avocado: () => (
    <>
      <path d="M0-15C7-15 9-7 11 0 14 9 8 15 0 15-8 15-14 9-11 0-9-7-7-15 0-15Z" fill="#2f6b2f" {...S} />
      <path d="M0-11C5-11 6-5 8 1 10 8 6 11 0 11-6 11-10 8-8 1-6-5-5-11 0-11Z" fill="#e7f0a6" />
      <circle cy="3" r="4.8" fill="#8a4b2a" {...S} />
    </>
  ),
  peach: () => (
    <>
      <circle r="10" fill="#ff9a76" {...S} />
      <path d="M0-10C-3-4-3 4 0 9" fill="none" {...S} strokeWidth="1.2" />
      <path d="M1-10C4-16 10-16 12-13 9-10 4-9 1-10Z" fill="#1c7d56" {...S} />
    </>
  ),
  pizza: () => (
    <>
      <path d="M-12-10H12L0 14Z" fill="#f4d500" {...S} />
      <rect x="-13.5" y="-14" width="27" height="5.5" rx="2.7" fill="#c97a3a" {...S} />
      <circle cx="-4" cy="-3" r="2.6" fill="#b3261e" {...S} strokeWidth="1" />
      <circle cx="4" cy="-2" r="2.6" fill="#b3261e" {...S} strokeWidth="1" />
      <circle cy="5" r="2.1" fill="#b3261e" {...S} strokeWidth="1" />
    </>
  ),
  hearts: () => (
    <path
      d="M0 8C-13-1-14-10-8-13-4-14-1-12 0-9 1-12 4-14 8-13 14-10 13-1 0 8Z"
      fill="#e63a3f"
      {...S}
    />
  ),
  flowers: () => (
    <>
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cy="-6.5" rx="4" ry="6.5" fill="#fff" {...S} strokeWidth="1.2" transform={`rotate(${r})`} />
      ))}
      <circle r="3.8" fill="#f4d500" {...S} strokeWidth="1.2" />
    </>
  ),
  smiley: () => (
    <>
      <circle r="10.5" fill="#f4d500" {...S} />
      <ellipse cx="-3.6" cy="-3" rx="1.5" ry="2.5" fill="#000" />
      <ellipse cx="3.6" cy="-3" rx="1.5" ry="2.5" fill="#000" />
      <path d="M-6 2.2Q0 9 6 2.2" fill="none" {...S} strokeWidth="1.8" />
    </>
  ),
  cats: () => (
    <>
      <path d="M-11-2V-14L-4-8H4L11-14V-2C11 7 6 11 0 11-6 11-11 7-11-2Z" fill="#111" {...S} />
      <ellipse cx="-4.5" cy="-1" rx="2.3" ry="2.9" fill="#f4d500" />
      <ellipse cx="4.5" cy="-1" rx="2.3" ry="2.9" fill="#f4d500" />
      <rect x="-5" y="-2.6" width="1" height="3.2" rx="0.5" fill="#000" />
      <rect x="4" y="-2.6" width="1" height="3.2" rx="0.5" fill="#000" />
      <path d="M-1.6 4H1.6L0 5.8Z" fill="#ff52a1" />
      <path d="M-3 5.5H-12M-3 7-11 9.5M3 5.5H12M3 7 11 9.5" stroke="#fff" strokeWidth="0.9" />
    </>
  ),
  blobs: () => (
    <>
      <path d="M0-13C9-14 14-6 13 2 12 10 6 14-1 13-9 12-14 6-13-2-12-9-7-12 0-13Z" fill="#ff52a1" {...S} />
      <circle cx="-4.5" cy="-4" r="3.3" fill="#fff" {...S} strokeWidth="1.2" />
      <circle cx="-4" cy="-3.6" r="1.4" fill="#e63a3f" />
      <circle cx="4.5" cy="-4" r="3.3" fill="#fff" {...S} strokeWidth="1.2" />
      <circle cx="5" cy="-3.6" r="1.4" fill="#e63a3f" />
      <path d="M-6.5 3Q0 12 6.5 3Z" fill="#f4d500" {...S} strokeWidth="1.3" />
      <path d="M-2.6 3.2H-0.4V5.8H-2.6ZM0.4 3.2H2.6V5.8H0.4Z" fill="#fff" stroke="#000" strokeWidth="0.8" />
    </>
  ),
}

// tile size + rotation for each repeating pattern
const PATTERN_TILE = {
  eggs: [60, -12],
  matcha: [52, 8],
  avocado: [58, -10],
  peach: [46, 10],
  pizza: [56, -14],
  hearts: [40, 0],
  flowers: [44, 12],
  smiley: [48, -8],
  cats: [54, 0],
  blobs: [60, 10],
}

function PatternDef({ id, pattern }) {
  if (pattern === 'checker') {
    return (
      <pattern id={id} width="36" height="36" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
        <rect width="36" height="36" fill="#fff" />
        <rect width="18" height="18" fill="#111" />
        <rect x="18" y="18" width="18" height="18" fill="#111" />
      </pattern>
    )
  }
  if (pattern === 'stripes') {
    return (
      <pattern id={id} width="20" height="56" patternUnits="userSpaceOnUse">
        <rect width="20" height="56" fill="#f5f1e8" />
        <rect width="20" height="14" fill="#2f6fd1" />
        <rect y="20" width="20" height="10" fill="#ff8a2b" />
        <rect y="36" width="20" height="4" fill="#111" />
      </pattern>
    )
  }
  const Motif = motifs[pattern] || motifs.smiley
  const [size, rot] = PATTERN_TILE[pattern] || [48, 0]
  return (
    <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse" patternTransform={`rotate(${rot})`}>
      <g transform={`translate(${size / 4} ${size / 4})`}>
        <Motif />
      </g>
      <g transform={`translate(${(size * 3) / 4} ${(size * 3) / 4}) rotate(18)`}>
        <Motif />
      </g>
    </pattern>
  )
}

function Sock({ uid, art, transform, leg = false }) {
  return (
    <g transform={transform}>
      {leg && <rect x="54" y="-300" width="64" height="330" rx="30" fill={SKIN} stroke="#000" strokeWidth="5" />}
      <g clipPath={`url(#${uid}-clip)`}>
        <rect x="30" y="0" width="190" height="260" fill={art.base} />
        <rect x="30" y="0" width="190" height="260" fill={`url(#${uid}-pat)`} />
        <rect x="40" y="8" width="92" height="38" fill={art.trim} />
        {[58, 67, 76, 85, 94, 103, 112].map((x) => (
          <line key={x} x1={x} y1="14" x2={x} y2="42" stroke="#000" strokeOpacity="0.22" strokeWidth="2" />
        ))}
        <line x1="40" y1="46" x2="132" y2="46" stroke="#000" strokeWidth="3" />
        <circle cx="50" cy="244" r="36" fill={art.trim} stroke="#000" strokeWidth="3" />
        <circle cx="198" cy="214" r="34" fill={art.trim} stroke="#000" strokeWidth="3" />
      </g>
      <path d={SOCK_PATH} fill="none" stroke="#000" strokeWidth="5" strokeLinejoin="round" />
    </g>
  )
}

const VIEWS = {
  single: { viewBox: '0 0 240 300', socks: [{ t: 'translate(110 150) rotate(-8) translate(-86 -128)' }] },
  pair: {
    viewBox: '0 0 320 300',
    socks: [
      { t: 'translate(112 148) rotate(-8) translate(-86 -128)' },
      { t: 'translate(204 156) rotate(6) translate(-86 -128)' },
    ],
  },
  kick: {
    viewBox: '0 0 300 340',
    socks: [
      { t: 'translate(118 148) rotate(172) translate(-86 -128)', leg: true },
      { t: 'translate(186 164) rotate(190) scale(-1 1) translate(-86 -128)', leg: true },
    ],
  },
  detail: { viewBox: '52 70 128 128', socks: [{ t: '' }] },
  // un-rotated, cropped tight to the sock — used for physics bodies & stickers
  upright: { viewBox: '40 6 164 244', socks: [{ t: '' }] },
}

export default function SockArt({ art, view = 'single', title, className = '' }) {
  const uid = `sock${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const v = VIEWS[view] || VIEWS.single
  const a = art || { pattern: 'smiley', base: '#111', trim: '#f4d500' }

  return (
    <svg
      viewBox={v.viewBox}
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <clipPath id={`${uid}-clip`}>
          <path d={SOCK_PATH} />
        </clipPath>
        <PatternDef id={`${uid}-pat`} pattern={a.pattern} />
      </defs>
      {v.socks.map((s, i) => (
        <Sock key={i} uid={uid} art={a} transform={s.t} leg={s.leg} />
      ))}
    </svg>
  )
}
