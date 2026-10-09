import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import SockArt from '../components/art/SockArt'
import { useDialog } from '../hooks/useDialog'
import { prefersReducedMotion } from '../hooks/useReducedMotion'
import { DISCOUNTS, hasWonToday, recordWin, usedToday } from '../lib/discount'
import { cx } from '../lib/cx'
import { play } from '../fx/sound'
import { useCart } from '../store/cart'

/*
  "Find the Pair": socks scatter on screen, exactly two are identical. Tap both within
  20 seconds to win PAIRUP10 (10% off, applied to the cart automatically). One win per
  visitor per day (localStorage); you can keep playing just for fun.
*/
const SECONDS = 20
const PRIZE = DISCOUNTS.PAIRUP10

const PATTERNS = {
  eggs: 'fried eggs', matcha: 'matcha cups', avocado: 'avocados', peach: 'peaches', pizza: 'pizza slices',
  hearts: 'hearts', flowers: 'daisies', checker: 'checkerboard', smiley: 'smileys', stripes: 'stripes',
  cats: 'cat faces', blobs: 'blob monsters',
}
const OPAQUE = new Set(['checker', 'stripes']) // base colour hidden by the pattern
const COLOURS = {
  '#111111': 'black', '#ff52a1': 'pink', '#f5f1e8': 'cream', '#1c7d56': 'green',
  '#e63a3f': 'red', '#f4d500': 'yellow', '#a7d3f0': 'sky blue', '#c9b6ff': 'lilac',
}
const BASES = ['#111111', '#ff52a1', '#f5f1e8', '#1c7d56', '#a7d3f0', '#c9b6ff']
const TRIMS = ['#f4d500', '#e63a3f', '#111111', '#1c7d56', '#ff52a1']

const rand = (n) => Math.floor(Math.random() * n)
const sockCount = () => (typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 16)

/**
 * Where today's prize stands, read from the cart (the truth) and the local win record:
 *   fresh   — not won today          → a win applies it
 *   applied — PAIRUP10 is in the cart → just for fun
 *   removed — won today, not in cart, not used → a win puts it back
 *   used    — went into an order today → just for fun until tomorrow
 */
function prizeState() {
  if (usedToday()) return 'used'
  if (useCart.getState().discount?.code === PRIZE.code) return 'applied'
  return hasWonToday() ? 'removed' : 'fresh'
}
const INTRO = {
  fresh: [`win ${PRIZE.percent}% off`, `find the matching pair before the timer runs out and ${PRIZE.code} goes straight into your cart.`, 'start'],
  applied: [`${PRIZE.code} is in your cart`, 'you already won today. come back tomorrow for another prize — or play just for fun.', 'play for fun'],
  removed: ['win it back', `you won ${PRIZE.code} today but it’s not in your cart any more. find the pair again to put it back.`, 'start'],
  used: ['prize used today', `${PRIZE.code} is one win per day and you’ve used today’s. come back tomorrow — or play just for fun.`, 'play for fun'],
}
const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const keyOf = (s) => `${s.pattern}|${OPAQUE.has(s.pattern) ? '' : s.base}|${s.trim}`
const describe = (s) =>
  `${PATTERNS[s.pattern]}${OPAQUE.has(s.pattern) ? '' : ` on ${COLOURS[s.base]}`}, ${COLOURS[s.trim]} cuff`

function makeBoard(count) {
  const patterns = Object.keys(PATTERNS)
  const pick = () => ({ pattern: patterns[rand(patterns.length)], base: BASES[rand(BASES.length)], trim: TRIMS[rand(TRIMS.length)] })
  const target = pick()
  const socks = [target, { ...target }]
  const seen = new Set([keyOf(target)])
  // near misses: same pattern, different colours
  let guard = 0
  while (socks.length < 5 && guard++ < 200) {
    const s = { ...target, base: BASES[rand(BASES.length)], trim: TRIMS[rand(TRIMS.length)] }
    if (!seen.has(keyOf(s))) {
      seen.add(keyOf(s))
      socks.push(s)
    }
  }
  while (socks.length < count && guard++ < 2000) {
    const s = pick()
    if (!seen.has(keyOf(s))) {
      seen.add(keyOf(s))
      socks.push(s)
    }
  }
  // scatter on a jittered grid so they never fully cover each other
  const cols = count <= 10 ? 3 : 6
  const rows = Math.ceil(count / cols) + (count <= 10 ? 1 : 0)
  const cells = shuffle(Array.from({ length: cols * rows }, (_, i) => i)).slice(0, socks.length)
  return shuffle(socks.map((s, i) => ({ ...s, id: i, pair: i < 2 }))).map((s, i) => {
    const c = cells[i]
    return {
      ...s,
      x: ((c % cols) + 0.5 + (Math.random() - 0.5) * 0.4) / cols,
      y: (Math.floor(c / cols) + 0.5 + (Math.random() - 0.5) * 0.35) / rows,
      rot: Math.random() * 70 - 35,
      scale: 0.85 + Math.random() * 0.25,
      float: 4 + Math.random() * 3,
    }
  })
}

export default function FindThePair({ onClose }) {
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  const applyDiscount = useCart((s) => s.applyDiscount)
  const [prize, setPrize] = useState(prizeState)
  const canWin = prize === 'fresh' || prize === 'removed'
  const [phase, setPhase] = useState('intro') // intro | play | won | lost
  const [round, setRound] = useState(0)
  const [selected, setSelected] = useState(null)
  const [wrong, setWrong] = useState([])
  const [left, setLeft] = useState(SECONDS)
  const [live, setLive] = useState('')
  // the sock count is fixed per round — rotating the phone must not deal a new board
  const [count, setCount] = useState(sockCount)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const board = useMemo(() => makeBoard(count), [round])
  useDialog(true, { onClose, panelRef, initialFocusRef: closeRef })

  // countdown
  useEffect(() => {
    if (phase !== 'play') return
    const end = performance.now() + SECONDS * 1000
    const id = setInterval(() => {
      const s = Math.max(0, Math.ceil((end - performance.now()) / 1000))
      setLeft(s)
      if (s === 10 || s === 5) setLive(`${s} seconds left`)
      if (s === 0) {
        setPhase('lost')
        setLive('time’s up! the pair is highlighted.')
      }
    }, 200)
    return () => clearInterval(id)
  }, [phase, round])

  function start() {
    setPrize(prizeState())
    setCount(sockCount())
    setRound((r) => r + 1)
    setSelected(null)
    setWrong([])
    setLeft(SECONDS)
    setPhase('play')
    setLive(`go! find the two matching socks. ${SECONDS} seconds.`)
    play('pop')
  }

  function choose(sock, el) {
    if (phase !== 'play') return
    play('pop', { rate: 1.2 })
    if (selected === null) {
      setSelected(sock.id)
      return
    }
    if (selected === sock.id) {
      setSelected(null)
      return
    }
    const first = board.find((s) => s.id === selected)
    if (first.pair && sock.pair) {
      setPhase('won')
      setLive(canWin ? `you found the pair! ${PRIZE.code} is applied to your cart.` : 'you found the pair!')
      play('win')
      if (canWin) {
        recordWin()
        applyDiscount(PRIZE.code)
      }
      const r = el?.getBoundingClientRect()
      import('../fx/confetti').then(async ({ burst, loadSocks }) => {
        await loadSocks()
        burst({ x: r ? r.left + r.width / 2 : window.innerWidth / 2, y: r ? r.top : window.innerHeight / 2, count: 46, shapes: ['flower', 'star', 'sock'], power: 13, spread: Math.PI * 1.6 })
      })
    } else {
      setWrong([selected, sock.id])
      setSelected(null)
      setLive('not a pair, keep looking')
      setTimeout(() => setWrong([]), 450)
    }
  }

  const reduced = prefersReducedMotion()
  return (
    <div className="fixed inset-0 z-[70] flex items-stretch justify-center md:items-center md:p-6">
      <div className="qv-overlay absolute inset-0 bg-black/70" aria-hidden="true" />
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-title"
        tabIndex={-1}
        data-lenis-prevent
        className="game-panel qv-panel tone-green relative flex w-full max-w-5xl flex-col overflow-hidden border-2 border-black md:h-[min(46rem,92dvh)] md:rounded-[2rem] md:shadow-hard-lg"
      >
        <header className="relative z-10 flex items-start justify-between gap-4 px-5 pt-5 md:px-7">
          <div>
            <h2 id="game-title" className="giant text-[clamp(2.4rem,8vw,4.5rem)] leading-[0.85] tracking-[-0.05em] t-display">
              find the pair
            </h2>
            <p className="copy mt-2">two socks are identical. tap both in {SECONDS} seconds.</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="btn btn-sm btn-offwhite shrink-0" aria-label="close the game">
            close ✕
          </button>
        </header>

        {phase === 'play' && (
          <div className="relative z-10 mx-5 mt-3 flex items-center gap-3 md:mx-7" aria-hidden="true">
            <div className="h-4 flex-1 overflow-hidden rounded-full border-2 border-black bg-offwhite">
              <div className="game-timer h-full bg-yellow" style={{ animationDuration: `${SECONDS}s` }} key={round} />
            </div>
            <span className="w-10 text-right text-xl font-black tabular-nums">{left}s</span>
          </div>
        )}

        <div className="relative flex-1">
          {(phase === 'play' || phase === 'lost' || phase === 'won') && (
            <ul className="absolute inset-0 m-0 list-none p-0" aria-label="socks">
              {board.map((s) => {
                const isSel = selected === s.id
                const isWrong = wrong.includes(s.id)
                const reveal = (phase === 'lost' || phase === 'won') && s.pair
                return (
                  <li key={`${round}-${s.id}`} className="absolute" style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%` }}>
                    <button
                      type="button"
                      onClick={(e) => choose(s, e.currentTarget)}
                      disabled={phase !== 'play'}
                      aria-pressed={isSel}
                      aria-label={`sock: ${describe(s)}`}
                      data-cursor="grab"
                      className={cx('game-sock', isSel && 'is-selected', isWrong && 'is-wrong', reveal && 'is-pair', !reduced && 'is-floating')}
                      style={{ '--rot': `${s.rot}deg`, '--s': s.scale, '--float': `${s.float}s` }}
                    >
                      <span className="sticker block">
                        <SockArt art={{ pattern: s.pattern, base: s.base, trim: s.trim }} view="upright" fixed />
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {phase === 'intro' && (
            <div className="absolute inset-0 grid place-items-center p-6 text-center">
              <div className="max-w-md">
                <p className="text-display font-black">{INTRO[prize][0]}</p>
                <p className="copy mx-auto mt-3">{INTRO[prize][1]}</p>
                <button type="button" className="btn btn-yellow btn-lg mt-6" onClick={start}>
                  {INTRO[prize][2]}
                </button>
              </div>
            </div>
          )}
        </div>

        {(phase === 'won' || phase === 'lost') && (
          <div className="game-result absolute inset-x-4 bottom-4 z-20 rounded-[1.5rem] border-2 border-black bg-offwhite p-5 text-black shadow-hard-lg md:inset-x-auto md:right-6 md:w-[24rem]">
            {phase === 'won' ? (
              <>
                <p className="text-display font-black leading-none">pair found!</p>
                {canWin ? (
                  <p className="mt-3 inline-block -rotate-2 rounded-xl border-2 border-black bg-yellow px-4 py-2 text-xl font-black">
                    {PRIZE.code} · {PRIZE.percent}% off — {prize === 'removed' ? 'back in your cart' : 'applied to your cart'}
                  </p>
                ) : (
                  <p className="copy mt-2">
                    {prize === 'used' ? `nice. today’s ${PRIZE.code} is already used — new prize tomorrow.` : `nice. your ${PRIZE.code} is still in your cart.`}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link to="/shop" className="btn btn-pink" onClick={onClose}>
                    shop now
                  </Link>
                  <button type="button" className="font-extrabold lowercase underline decoration-2 underline-offset-4" onClick={start}>
                    play again
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-display font-black leading-none">time’s up!</p>
                <p className="copy mt-2">the pair is wiggling. one more go?</p>
                <button type="button" className="btn btn-yellow mt-4" onClick={start}>
                  try again
                </button>
              </>
            )}
          </div>
        )}

        <p className="sr-only" role="status" aria-live="polite">
          {live}
        </p>
      </section>
    </div>
  )
}
