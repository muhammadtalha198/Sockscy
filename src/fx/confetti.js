// Confetti of doodle flowers, stars and (baked) socks on one fixed canvas.
// burst() for celebrations at a point, rain() for full-screen sock showers.
// Lazy-loaded by callers; does nothing with reduced motion.
import { prefersReducedMotion } from '../hooks/useReducedMotion'

const COLOURS = ['#e63a3f', '#ff52a1', '#f4d500', '#1c7d56', '#f5f1e8']
let canvas = null
let ctx = null
let dpr = 1
let particles = []
let raf = 0
let sockSprites = []

function ensureCanvas() {
  if (canvas) return
  canvas = document.createElement('canvas')
  canvas.className = 'fx-confetti'
  canvas.setAttribute('aria-hidden', 'true')
  document.body.appendChild(canvas)
  ctx = canvas.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
}

function resize() {
  if (!canvas) return
  dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 640 ? 1.5 : 2)
  canvas.width = Math.round(window.innerWidth * dpr)
  canvas.height = Math.round(window.innerHeight * dpr)
}

function teardown() {
  cancelAnimationFrame(raf)
  raf = 0
  window.removeEventListener('resize', resize)
  canvas?.remove()
  canvas = null
  ctx = null
}

function drawFlower(p) {
  ctx.fillStyle = p.color
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 1.6
  for (let i = 0; i < 5; i++) {
    ctx.save()
    ctx.rotate((i / 5) * Math.PI * 2)
    ctx.beginPath()
    ctx.ellipse(0, -p.size * 0.42, p.size * 0.26, p.size * 0.42, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
  ctx.beginPath()
  ctx.arc(0, 0, p.size * 0.2, 0, Math.PI * 2)
  ctx.fillStyle = p.color === '#f4d500' ? '#ff52a1' : '#f4d500'
  ctx.fill()
  ctx.stroke()
}

function drawStar(p) {
  const r = p.size * 0.55
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2
    const rr = i % 2 ? r * 0.45 : r
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
  }
  ctx.closePath()
  ctx.fillStyle = p.color
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 1.6
  ctx.fill()
  ctx.stroke()
}

function frame() {
  if (!ctx) return
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const h = window.innerHeight + 80
  particles = particles.filter((p) => p.y < h && p.life > 0)
  for (const p of particles) {
    p.vx *= p.drag
    p.vy = p.vy * p.drag + p.gravity
    p.x += p.vx
    p.y += p.vy
    p.rot += p.vr
    p.life -= 1
    const fade = Math.min(1, p.life / 25)
    ctx.setTransform(dpr, 0, 0, dpr, p.x * dpr, p.y * dpr)
    ctx.rotate(p.rot)
    ctx.globalAlpha = fade
    if (p.shape === 'sock' && p.sprite) {
      const s = p.sprite
      ctx.drawImage(s.canvas, -s.w / 2, -s.h / 2, s.w, s.h)
    } else if (p.shape === 'star') drawStar(p)
    else drawFlower(p)
  }
  ctx.globalAlpha = 1
  if (particles.length) raf = requestAnimationFrame(frame)
  else teardown()
}

function start() {
  if (!raf) raf = requestAnimationFrame(frame)
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

/** Burst at a viewport point. `direction` (radians) + `spread` aim it; default is upward. */
export function burst({ x, y, count = 26, shapes = ['flower', 'star'], power = 9, direction = -Math.PI / 2, spread = Math.PI * 0.9, size = [12, 22] } = {}) {
  if (prefersReducedMotion()) return
  ensureCanvas()
  for (let i = 0; i < count; i++) {
    const a = direction + (Math.random() - 0.5) * spread
    const v = power * (0.55 + Math.random() * 0.75)
    const shape = pick(shapes)
    particles.push({
      x, y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.35,
      size: size[0] + Math.random() * (size[1] - size[0]),
      color: pick(COLOURS),
      shape,
      sprite: shape === 'sock' ? pick(sockSprites) : null,
      gravity: 0.32,
      drag: 0.985,
      life: 150 + Math.random() * 40,
    })
  }
  start()
}

/** Full-screen shower (Konami code, order placed). */
export async function rain({ duration = 3200, perFrame = 1.4, shapes = ['sock', 'flower', 'star'] } = {}) {
  if (prefersReducedMotion()) return
  if (shapes.includes('sock')) await loadSocks()
  ensureCanvas()
  const end = performance.now() + duration
  let carry = 0
  const spawn = () => {
    if (!ctx) ensureCanvas()
    carry += perFrame * (window.innerWidth < 640 ? 0.6 : 1)
    while (carry >= 1) {
      carry -= 1
      const shape = pick(shapes)
      particles.push({
        x: Math.random() * window.innerWidth,
        y: -40,
        vx: (Math.random() - 0.5) * 2,
        vy: 2 + Math.random() * 3,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.12,
        size: 16 + Math.random() * 14,
        color: pick(COLOURS),
        shape,
        sprite: shape === 'sock' ? pick(sockSprites) : null,
        gravity: 0.12,
        drag: 0.99,
        life: 600,
      })
    }
    start()
    if (performance.now() < end) requestAnimationFrame(spawn)
  }
  spawn()
}

/** Bake a handful of small sock stickers once (used by rain + sock bursts). */
export async function loadSocks() {
  if (sockSprites.length) return
  const [{ bakeElement }, { default: SockArt }, { createElement }] = await Promise.all([
    import('./sprites'),
    import('../components/art/SockArt'),
    import('react'),
  ])
  const arts = [
    { pattern: 'eggs', base: '#111111', trim: '#f4d500' },
    { pattern: 'hearts', base: '#ff52a1', trim: '#e63a3f' },
    { pattern: 'checker', base: '#ffffff', trim: '#111111' },
    { pattern: 'smiley', base: '#111111', trim: '#f4d500' },
    { pattern: 'avocado', base: '#b9d77a', trim: '#1c7d56' },
    { pattern: 'pizza', base: '#e63a3f', trim: '#f4d500' },
  ]
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  sockSprites = await Promise.all(
    arts.map((art) => bakeElement(createElement(SockArt, { art, view: 'upright' }), { width: 34, height: 51, outline: 2.5, dpr: ratio, shadow: false })),
  )
}
