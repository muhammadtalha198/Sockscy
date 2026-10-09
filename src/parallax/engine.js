// SOCKSAVVY parallax engine — one system for the whole site.
//
// A layer is an element on a depth plane (tokens in src/styles/tokens.css):
//   back -0.3 · far -0.15 · mid 0 (the page: text, forms) · near 0.2 · front 0.45
// Three inputs move it:
//   scroll  — offset = (anchor centre − viewport centre) × depth × travel, so every layer
//             sits exactly where it was laid out when its anchor (its section, or itself)
//             is centred on screen, and the planes spread apart as it scrolls past.
//   pointer — desktop mouse (−1…1): near layers follow it, rear layers move against it.
//   tilt    — phone gyroscope (−1…1) after the visitor opts in (./tilt.js).
//
// Scroll path, two implementations with identical maths:
//   CSS  (Chrome/Edge 115+, Safari 26+): a scroll-driven animation on the `translate`
//        property (animation-timeline: view() or the section's named view timeline).
//        Runs off the main thread, so layers never trail native touch scrolling. The JS
//        only writes the end points (CSS variables) when geometry changes.
//   JS   (Firefox, or ?parallax=js): cached geometry, lerped per layer every frame.
// Pointer, tilt and velocity skew are always JS, written to `transform` (which composes
// with `translate`), through a slightly under-damped spring with frame-rate independent
// damping. One loop (gsap.ticker right after Lenis once it is loaded, rAF before that),
// zero layout reads per frame, off-screen layers sleep, the loop stops when settled.
// prefers-reduced-motion → nothing registers, everything is static. Calm mode → 15%.

import { prefersReducedMotion } from '../hooks/useReducedMotion'

const FALLBACK = {
  depth: { back: -0.3, far: -0.15, mid: 0, near: 0.2, front: 0.45 },
  travel: 0.42,
  clamp: 0.3,
  pointer: 70,
  tiltDeg: 22,
  calm: 0.15,
  phone: 0.65,
}
let T = null
function tokens() {
  if (T) return T
  T = structuredClone(FALLBACK)
  if (typeof document === 'undefined') return T
  const cs = getComputedStyle(document.documentElement)
  const num = (name, d) => {
    const v = parseFloat(cs.getPropertyValue(name))
    return Number.isFinite(v) ? v : d
  }
  for (const k of Object.keys(T.depth)) T.depth[k] = num(`--depth-${k}`, T.depth[k])
  T.travel = num('--parallax-travel', T.travel)
  T.clamp = num('--parallax-clamp', T.clamp)
  T.pointer = num('--parallax-pointer', T.pointer)
  T.tiltDeg = num('--parallax-tilt-deg', T.tiltDeg)
  T.calm = num('--parallax-calm', T.calm)
  T.phone = num('--parallax-phone', T.phone)
  return T
}

/** 'near' → 0.2, 0.3 → 0.3 */
export function resolveDepth(depth) {
  if (typeof depth === 'number') return depth
  return tokens().depth[depth] ?? 0
}

function cssScrollSupported() {
  if (typeof window === 'undefined' || typeof CSS === 'undefined') return false
  try {
    const forced = new URLSearchParams(window.location.search).get('parallax') || localStorage.getItem('socksavvy-parallax')
    if (forced === 'js') return false
  } catch {
    /* storage blocked */
  }
  return CSS.supports('animation-timeline: view()') && CSS.supports('animation-range: cover')
}

// ---------------------------------------------------------------- state
const layers = new Set()
const visible = new Set()
const sections = new Set()
const tilters = new Set()
const listeners = new Set()

let io = null
let raf = 0
let ticker = null
let lastT = 0
let lastScroll = -1
let velocity = 0
let vw = 0
let vh = 0
let measureQueued = true
let started = false
let useCss = false

let calm = false
let reduced = false
let strength = 0
let targetStrength = 0

// page transitions: 0 = at rest, 1 = fully "away" (see setTransition)
const trans = { phase: null, t: 0, target: 0 }

const look = { tx: 0, ty: 0, x: 0, y: 0, vx: 0, vy: 0 }
let pointerOn = false
let tiltOn = false

const isPhone = () => vw < 640

function computeTarget() {
  const t = tokens()
  if (reduced) return 0
  if (calm) return t.calm
  return isPhone() ? t.phone : 1
}

function notify() {
  const state = getState()
  for (const fn of listeners) fn(state)
}

export function getState() {
  return { calm, reduced, tilt: tiltOn, active: !reduced, mode: useCss ? 'css' : 'js' }
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// ---------------------------------------------------------------- lifecycle
function start() {
  if (started || typeof window === 'undefined') return
  started = true
  reduced = prefersReducedMotion()
  useCss = cssScrollSupported()
  document.documentElement.dataset.parallax = useCss ? 'css' : 'js'
  vw = window.innerWidth
  vh = window.innerHeight
  targetStrength = computeTarget()
  strength = targetStrength

  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const layer = e.target.__parallax
        if (!layer) continue
        if (e.isIntersecting) {
          visible.add(layer)
          layer.el.style.willChange = useCss ? 'translate, transform' : 'transform'
        } else {
          visible.delete(layer)
          layer.el.style.willChange = ''
        }
      }
      kick()
    },
    { rootMargin: '25% 0px 25% 0px' },
  )

  const remeasure = () => {
    measureQueued = true
    vw = window.innerWidth
    vh = window.innerHeight
    const next = computeTarget()
    if (next !== targetStrength) {
      targetStrength = next
      strength = next
    }
    kick()
  }
  window.addEventListener('resize', remeasure, { passive: true })
  window.addEventListener('scroll', kick, { passive: true })
  let lastH = 0
  new ResizeObserver(() => {
    const h = document.body.scrollHeight
    if (Math.abs(h - lastH) > 1) {
      lastH = h
      remeasure()
    }
  }).observe(document.body)
  document.fonts?.ready?.then(remeasure)

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
  if (fine.matches) {
    window.addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerType !== 'mouse' || tiltOn) return
        pointerOn = true
        look.tx = (e.clientX / vw) * 2 - 1
        look.ty = (e.clientY / vh) * 2 - 1
        kick()
      },
      { passive: true },
    )
    const centre = () => {
      look.tx = 0
      look.ty = 0
      kick()
    }
    document.documentElement.addEventListener('mouseleave', centre)
    window.addEventListener('blur', centre)
  }

  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    reduced = e.matches
    targetStrength = strength = computeTarget()
    if (reduced) resetAll()
    else for (const l of layers) io.observe(l.el)
    measureQueued = true
    notify()
    kick()
  })
  document.addEventListener('visibilitychange', () => !document.hidden && kick())
}

export function kick() {
  if (!started || reduced) return
  if (ticker) {
    ticker.wake = true
    return
  }
  if (!raf) raf = requestAnimationFrame(frame)
}

/** Lenis scrolls inside gsap.ticker — run right after it so JS layers never lag the page. */
export function attachTicker(gsapTicker) {
  if (ticker || !gsapTicker) return
  if (raf) cancelAnimationFrame(raf)
  raf = 0
  ticker = { wake: true, fn: () => ticker.wake && frame(performance.now()) }
  gsapTicker.add(ticker.fn)
}

function clearLayer(l) {
  l.el.style.transform = ''
  delete l.el.dataset.pxScroll
  for (const p of ['--px-x0', '--px-x1', '--px-y0', '--px-y1', '--px-s0', '--px-s1', '--px-r0', '--px-r1']) l.el.style.removeProperty(p)
  l.cx = l.cy = 0
  l.written = ''
}

function resetAll() {
  for (const l of layers) clearLayer(l)
  for (const t of tilters) t.reset()
}

// ---------------------------------------------------------------- geometry
// Scroll offset for a layer whose anchor centre is `d` px below the viewport centre.
function scrollOffset(l, d, anchorH) {
  const t = tokens()
  let tx = 0
  let ty = 0
  if (l.rest === 'top') {
    // the first screen: at rest until its anchor starts to leave (exit range), then the
    // planes separate over one viewport of scroll. d here = progress 0…1 through the exit.
    const p = Math.min(1, Math.max(0, d))
    const max = vh * t.clamp
    const off = Math.max(-max, Math.min(max, -p * vh * l.depth * t.travel * 1.6 * strength))
    if (l.axis === 'x') tx = off
    else ty = off
    const s = 1 + p * l.scale * strength
    return { tx, ty, s, r: p * l.rotate * strength }
  }
  if (l.pin) {
    // pinned scene: d runs from +(h−vh)/2 to −(h−vh)/2 while the stage is stuck
    const span = Math.max(1, anchorH - vh)
    const p = Math.min(1, Math.max(0, 0.5 - d / span))
    const off = l.drift ? (0.5 - p) * 2 * l.drift * l.dir * strength : (0.5 - p) * 2 * l.depth * vh * t.travel * strength
    if (l.axis === 'x') tx = off
    else ty = off
  } else if (l.axis === 'x' || l.drift) {
    const n = Math.max(-1, Math.min(1, d / (vh / 2 + anchorH / 2)))
    tx = n * (l.drift || l.depth * vw * 0.3) * l.dir * strength
  } else {
    const max = vh * t.clamp
    ty = Math.max(-max, Math.min(max, d * l.depth * t.travel * strength))
  }
  const n = Math.max(-1.5, Math.min(1.5, d / vh))
  return { tx, ty, s: 1 + n * l.scale * strength, r: n * l.rotate * strength }
}

function measure() {
  measureQueued = false
  const sy = window.scrollY
  for (const s of sections) {
    if (!s.el) continue
    const r = s.el.getBoundingClientRect()
    s.top = r.top + sy
    s.height = r.height
  }
  const own = [...layers].filter((l) => !l.section)
  // JS path: our transform shifts the box, drop it for the read. (CSS path: view timelines
  // and our end points only need the untransformed size, which offsetHeight gives.)
  if (!useCss) for (const l of own) l.el.style.transform = 'none'
  for (const l of layers) {
    if (l.section) {
      l.hidden = !l.el.getClientRects().length
      continue
    }
    if (useCss) {
      l.height = l.el.offsetHeight
      l.hidden = !l.el.getClientRects().length
    } else {
      const r = l.el.getBoundingClientRect()
      l.top = r.top + sy
      l.height = r.height
      l.hidden = r.width === 0 && r.height === 0
    }
  }
  if (!useCss) for (const l of own) l.el.style.transform = l.written

  if (useCss) {
    // write the two end points of each layer's scroll animation (cover: anchor top at
    // the viewport bottom → anchor bottom at the viewport top; contain for pinned scenes)
    for (const l of layers) {
      if (!l.scroll || l.hidden) continue
      const h = l.section ? l.section.height : l.height
      const d0 = l.pin ? Math.max(0, h - vh) / 2 : (vh + h) / 2
      const a = l.rest === 'top' ? scrollOffset(l, 0, h) : scrollOffset(l, d0, h)
      const b = l.rest === 'top' ? scrollOffset(l, 1, h) : scrollOffset(l, -d0, h)
      const st = l.el.style
      st.setProperty('--px-x0', `${a.tx.toFixed(1)}px`)
      st.setProperty('--px-x1', `${b.tx.toFixed(1)}px`)
      st.setProperty('--px-y0', `${a.ty.toFixed(1)}px`)
      st.setProperty('--px-y1', `${b.ty.toFixed(1)}px`)
      if (l.scale || l.rotate) {
        st.setProperty('--px-s0', a.s.toFixed(4))
        st.setProperty('--px-s1', b.s.toFixed(4))
        st.setProperty('--px-r0', `${a.r.toFixed(2)}deg`)
        st.setProperty('--px-r1', `${b.r.toFixed(2)}deg`)
      }
      // a data attribute, not a class: React rewrites className on re-render
      l.el.dataset.pxScroll = l.scale || l.rotate ? 'sr' : 'y'
    }
  }
}

// ---------------------------------------------------------------- the loop
function frame(now) {
  raf = 0
  if (document.hidden) return
  const f = Math.min(3, Math.max(0.5, (now - (lastT || now - 16.7)) / 16.667))
  lastT = now
  if (measureQueued) measure()

  const y = window.scrollY
  const dy = lastScroll < 0 ? 0 : y - lastScroll
  lastScroll = y
  velocity += (dy - velocity) * (1 - Math.pow(0.78, f))
  if (Math.abs(velocity) < 0.01) velocity = 0

  // spring: under-damped (≈5% overshoot), frame-rate independent
  const damp = Math.pow(0.8, f)
  look.vx = (look.vx + (look.tx - look.x) * 0.05 * f) * damp
  look.vy = (look.vy + (look.ty - look.y) * 0.05 * f) * damp
  look.x += look.vx * f
  look.y += look.vy * f

  // page transition progress (spring toward its target)
  if (trans.phase) trans.t += (trans.target - trans.t) * (1 - Math.pow(0.82, f))

  const t = tokens()
  const lookRange = t.pointer * strength * (pointerOn || tiltOn ? 1 : 0)
  let moving =
    Math.abs(velocity) > 0.05 ||
    Math.abs(look.tx - look.x) + Math.abs(look.ty - look.y) > 0.001 ||
    Math.abs(look.vx) + Math.abs(look.vy) > 0.0005 ||
    (trans.phase && Math.abs(trans.target - trans.t) > 0.002)

  for (const l of visible) {
    if (l.hidden) continue
    let tx = 0
    let ty = 0
    let scale = 1
    let rot = 0

    if (!useCss && l.scroll) {
      const anchor = l.section || l
      const d =
        l.rest === 'top'
          ? (y + vh - (anchor.top + anchor.height)) / vh // exit progress
          : anchor.top + anchor.height / 2 - (y + vh / 2)
      const o = scrollOffset(l, d, anchor.height)
      tx = o.tx
      ty = o.ty
      scale = o.s
      rot = o.r
      // lerp the scroll part; front layers carry a little more weight
      const a = 1 - Math.pow(1 - l.ease, f)
      l.cx += (tx - l.cx) * a
      l.cy += (ty - l.cy) * a
      if (Math.abs(tx - l.cx) + Math.abs(ty - l.cy) > 0.05) moving = true
      tx = l.cx
      ty = l.cy
    }
    if (l.pointer && lookRange) {
      tx += look.x * l.depth * lookRange
      ty += look.y * l.depth * lookRange * 0.6
    }
    if (trans.phase && trans.t > 0.001) {
      // leaving: near planes rush up and away, far planes sink; arriving: the reverse
      const k = trans.t * (trans.phase === 'leave' ? -1 : 1)
      ty += k * (0.15 + l.depth) * vh * 0.35
    }
    const skew = l.skew && !isPhone() ? Math.max(-8, Math.min(8, -velocity * 0.3)) * strength : 0

    let out = tx || ty ? `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)` : ''
    if (scale !== 1) out += ` scale(${scale.toFixed(4)})`
    if (rot) out += ` rotate(${rot.toFixed(3)}deg)`
    if (Math.abs(skew) > 0.05) out += ` skewX(${skew.toFixed(2)}deg)`
    if (out !== l.written) {
      l.el.style.transform = out
      l.written = out
    }
  }

  for (const c of tilters) if (c.step(f)) moving = true

  if (ticker) ticker.wake = moving
  else if (moving) raf = requestAnimationFrame(frame)
}

// ---------------------------------------------------------------- public API
/**
 * Register an element as a parallax layer. Returns an unregister function.
 *   depth   'back'|'far'|'mid'|'near'|'front' or a number (default 'near')
 *   axis    'y' (default) | 'x'
 *   section handle from createSection() — anchor to the section (all its layers rest
 *           when it is centred); otherwise the element is its own anchor
 *   pin     with section: progress through a pinned (sticky) scene drives the offset
 *   rest    'top': at rest until the anchor starts to leave (first screen of a page)
 *   drift   px of sideways drift for giant words, dir ±1 · skew: lean with scroll speed
 *   scale / rotate  extra scale / degrees per viewport of distance
 *   pointer false: ignore pointer/tilt · scroll false: ignore scroll
 */
export function addLayer(el, o = {}) {
  start()
  const depth = resolveDepth(o.depth ?? 'near')
  const layer = {
    el,
    depth,
    axis: o.axis || 'y',
    section: o.section || null,
    pin: !!(o.pin && o.section),
    rest: o.rest || o.section?.rest || null,
    drift: o.drift || 0,
    dir: o.dir || 1,
    skew: !!o.skew,
    scale: o.scale || 0,
    rotate: o.rotate || 0,
    scroll: o.scroll !== false,
    pointer: o.pointer !== false,
    ease: o.ease ?? 0.2 - Math.min(1, Math.abs(depth) / 0.45) * 0.08,
    top: 0,
    height: 0,
    hidden: false,
    cx: 0,
    cy: 0,
    written: '',
  }
  el.__parallax = layer
  el.dataset.depth = typeof o.depth === 'string' ? o.depth : String(depth)
  if (layer.section) el.dataset.pxAnchor = 'section'
  if (layer.pin) el.dataset.pxPin = ''
  if (layer.rest) el.dataset.pxRest = layer.rest
  el.style.setProperty('--depth', String(depth))
  layers.add(layer)
  measureQueued = true
  if (!reduced) io.observe(el)
  kick()
  return () => {
    io?.unobserve(el)
    layers.delete(layer)
    visible.delete(layer)
    clearLayer(layer)
    el.style.willChange = ''
    delete el.dataset.pxAnchor
    delete el.dataset.pxPin
    delete el.dataset.pxRest
    delete el.__parallax
  }
}

/** rest: 'top' for the first screen of a page (layers sit still until it starts to leave) */
export function createSection(rest = null) {
  return { el: null, top: 0, height: 0, rest }
}
export function attachSection(section, el) {
  start()
  section.el = el
  if (el) sections.add(section)
  else sections.delete(section)
  measureQueued = true
  kick()
}

export function addTilter(t) {
  start()
  tilters.add(t)
  return () => tilters.delete(t)
}

export function setCalm(on) {
  start()
  calm = !!on
  targetStrength = strength = computeTarget()
  document.documentElement.toggleAttribute('data-calm', calm)
  measureQueued = true // CSS end points carry the strength
  notify()
  kick()
}

/** Phone tilt (−1…1 per axis, already filtered); null = off. */
export function setTilt(v) {
  const was = tiltOn
  tiltOn = !!v
  look.tx = v ? v.x : 0
  look.ty = v ? v.y : 0
  if (was !== tiltOn) notify()
  kick()
}

/**
 * Page-transition depth: 'leave' sends the current page's planes away at their own
 * speeds while the curtain covers it; 'arrive' starts the new page's planes displaced
 * and lets them spring home; null ends it.
 */
export function setTransition(phase) {
  if (!started || reduced) return
  if (phase === 'leave') Object.assign(trans, { phase, t: 0, target: 1 })
  else if (phase === 'arrive') Object.assign(trans, { phase, t: 1, target: 0 })
  else Object.assign(trans, { phase: null, t: 0, target: 0 })
  kick()
}

/** Re-measure now (e.g. after a layout change no observer can see). */
export function refreshParallax() {
  measureQueued = true
  kick()
}

export const parallaxTokens = tokens

if (typeof window !== 'undefined') {
  window.__parallax = { layers, visible, sections, getState, look, trans }
}
