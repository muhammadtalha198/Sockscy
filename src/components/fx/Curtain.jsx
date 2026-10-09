import { TILE_BG } from '../../lib/constants'
import SockArt from '../art/SockArt'

// jagged torn-paper edge (viewBox 0 0 10 100, stretched to the screen height)
const EDGE =
  '10,0 4,0 6,4 2,8 5,12 1,17 6,21 3,26 7,30 2,35 5,40 1,45 6,49 3,54 7,58 2,63 5,68 1,72 6,77 2,82 5,86 1,91 4,96 2,100 10,100'

/** Torn-paper curtain that wipes across between routes (phase: in = covering, out = leaving). */
export default function Curtain({ curtain, onDone }) {
  if (!curtain) return null
  const bg = TILE_BG[curtain.tone] || TILE_BG.yellow
  return (
    <div
      key={curtain.key}
      className="curtain"
      data-phase={curtain.phase}
      style={{ '--curtain-bg': bg }}
      aria-hidden="true"
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget && curtain.phase === 'out') onDone()
      }}
    >
      <svg className="curtain-edge" viewBox="0 0 10 100" preserveAspectRatio="none">
        <polygon points={EDGE} fill="var(--curtain-bg)" stroke="#000" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="curtain-body">
        <div className="curtain-mark">
          <span className="sticker block w-16 md:w-20">
            <SockArt art={{ pattern: 'eggs', base: '#111111', trim: '#f4d500' }} view="upright" />
          </span>
          <span className="curtain-word">socksavvy</span>
        </div>
      </div>
      <svg className="curtain-edge curtain-edge-trail" viewBox="0 0 10 100" preserveAspectRatio="none">
        <polygon points={EDGE} fill="var(--curtain-bg)" stroke="#000" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}
