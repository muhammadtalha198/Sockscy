// Physics hero: socks + stickers fall into the yellow hero, pile up, and can be
// grabbed, thrown and stacked (mouse + touch). The cursor pushes them, tilting a
// phone shifts gravity, shaking drops more, and the giant letters shake when hit.
// Rendering: one <canvas>, every sticker pre-baked once (fx/sprites) → 60fps.
import Matter from 'matter-js'
import SockArt from '../components/art/SockArt'
import { Flower, FriedEgg, Heart, Smiley, SockMonster, Star } from '../components/art/Doodles'
import { bakeElement, bakeSticker } from '../fx/sprites'
import { play } from '../fx/sound'
import { clamp } from '../lib/motion'
import { totalStock } from '../lib/format'

const { Engine, Bodies, Body, Composite, Constraint, Query, Events, Sleeping, Vertices } = Matter

const STEP = 1000 / 60
const WALL = 400
// a sock drawn behind a button/link must never steal its press
const INTERACTIVE = 'a, button, input, select, textarea, label, [role="button"]'
const SOCK_VIEWBOX = { x: 40, y: 6, w: 164, h: 244 } // SockArt view="upright"
const SOCK_HULL = [[48, 12], [124, 12], [196, 214], [186, 238], [150, 243], [86, 245], [52, 240], [44, 210]]
const MONSTER_HULL = [[34, 10], [108, 10], [152, 150], [150, 178], [128, 186], [70, 190], [36, 178], [28, 146]]

// stickers that fall with the socks (size relative to sock width)
const STICKERS = [
  { key: 'egg', make: () => <FriedEgg />, vb: [120, 110], size: 1.0, shape: 'circle', r: 0.43 },
  { key: 'monster', make: () => <SockMonster />, vb: [160, 200], size: 1.05, shape: 'hull', hull: MONSTER_HULL },
  { key: 'smiley', make: () => <Smiley />, vb: [100, 100], size: 0.85, shape: 'circle', r: 0.46 },
  { key: 'flower', make: () => <Flower fill="#ff52a1" center="#f4d500" />, vb: [108, 108], size: 0.85, shape: 'circle', r: 0.4 },
  { key: 'heart', make: () => <Heart />, vb: [100, 92], size: 0.8, shape: 'circle', r: 0.4 },
  { key: 'star', make: () => <Star fill="#f5f1e8" />, vb: [100, 100], size: 0.8, shape: 'circle', r: 0.36 },
]

function settings(width) {
  const dpr = window.devicePixelRatio || 1
  if (width < 640) return { socks: 6, stickers: 3, sockW: 60, outline: 3, dpr: Math.min(1.5, dpr), push: 0 }
  if (width < 1024) return { socks: 8, stickers: 4, sockW: 82, outline: 4, dpr: Math.min(1.75, dpr), push: 1 }
  return { socks: 11, stickers: 5, sockW: 104, outline: 5, dpr: Math.min(2, dpr), push: 1 }
}

const rand = (a, b) => a + Math.random() * (b - a)

/** expand a convex polygon outward by `by` px around its centre */
function inflate(points, by) {
  const c = Vertices.centre(points)
  return points.map((p) => {
    const dx = p.x - c.x
    const dy = p.y - c.y
    const d = Math.hypot(dx, dy) || 1
    return { x: c.x + (dx / d) * (d + by), y: c.y + (dy / d) * (d + by) }
  })
}

class HeroWorld {
  constructor({ section, canvas, products, onQuickView }) {
    this.section = section
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.products = products
    this.onQuickView = onQuickView
    this.engine = Engine.create({ enableSleeping: true })
    this.engine.gravity.scale = 0.0013
    this.statics = []
    this.letters = []
    this.dynamic = []
    this.pool = []
    this.drag = null
    this.pointer = { x: -999, y: -999, vx: 0, vy: 0, t: 0, inside: false }
    this.running = false
    this.visible = true
    this.pageVisible = !document.hidden
    this.raf = 0
    this.idleSince = 0
    this.suppressClick = false
    this.timers = []
    this.lastShake = 0
    this.lastMag = 0
    this.destroyed = false
    for (const k of ['loop', 'onDown', 'onMove', 'onUp', 'onClickCapture', 'onTouchMove', 'onLeave', 'onVisibility', 'onOrient', 'onMotion']) {
      this[k] = this[k].bind(this)
    }
  }

  // ---------------------------------------------------------------- setup
  async init() {
    this.measure()
    this.cfg = settings(this.w)
    await this.bakeAll()
    if (this.destroyed) return
    this.resizeCanvas()
    this.buildStatics()
    Events.on(this.engine, 'collisionStart', (e) => this.onCollide(e))
    Events.on(this.engine, 'beforeUpdate', () => this.capSpeed())

    const s = this.section
    s.addEventListener('pointerdown', this.onDown, { capture: true })
    s.addEventListener('click', this.onClickCapture, { capture: true })
    s.addEventListener('touchmove', this.onTouchMove, { passive: false })
    s.addEventListener('pointerleave', this.onLeave)
    window.addEventListener('pointermove', this.onMove, { passive: true })
    window.addEventListener('pointerup', this.onUp)
    window.addEventListener('pointercancel', this.onUp)
    document.addEventListener('visibilitychange', this.onVisibility)

    this.io = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting
      this.updateRunning()
    })
    this.io.observe(s)
    let resizeTimer = 0
    let lastW = this.w
    this.ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        // the hero is sized in svh, so the mobile URL bar never resizes it — any change is real
        if (s.clientWidth === lastW && s.clientHeight === this.h) return
        lastW = s.clientWidth
        this.relayout()
      }, 180)
    })
    this.ro.observe(s)
    // letters finish sliding in after the intro — re-measure their sensors then
    this.timers.push(setTimeout(() => this.buildStatics(), 1300))

    this.spawnInitial()
    this.updateRunning()
    s.__heroWorld = this // handle for browser tests / debugging
  }

  measure() {
    this.w = this.section.clientWidth
    this.h = this.section.clientHeight
  }

  resizeCanvas() {
    const { dpr } = this.cfg
    this.canvas.width = Math.round(this.w * dpr)
    this.canvas.height = Math.round(this.h * dpr)
    this.dirty = true // resizing clears the bitmap
  }

  async bakeAll() {
    const { sockW, outline, dpr } = this.cfg
    const sockH = Math.round((sockW * SOCK_VIEWBOX.h) / SOCK_VIEWBOX.w)
    const scale = sockW / SOCK_VIEWBOX.w
    const socks = [...this.products]
      .sort((a, b) => Number(totalStock(b) > 0) - Number(totalStock(a) > 0) || Number(b.featured) - Number(a.featured))
      .slice(0, this.cfg.socks)

    for (const product of socks) {
      if (this.destroyed) return
      const sprite = product.cutout
        ? await bakeSticker(product.cutout, { width: sockW, height: sockH, outline, dpr })
        : await bakeElement(<SockArt art={product.art} view="upright" />, { width: sockW, height: sockH, outline, dpr })
      const pts = SOCK_HULL.map(([x, y]) => ({
        x: sprite.pad + (x - SOCK_VIEWBOX.x) * scale,
        y: sprite.pad + (y - SOCK_VIEWBOX.y) * scale,
      }))
      const hull = inflate(pts, outline * 0.6)
      this.pool.push({ kind: 'sock', product, sprite, shape: 'hull', hull, anchor: Vertices.centre(hull) })
    }
    for (const st of STICKERS.slice(0, this.cfg.stickers)) {
      if (this.destroyed) return
      const width = Math.round(sockW * st.size * 1.15)
      const height = Math.round((width * st.vb[1]) / st.vb[0])
      const sprite = await bakeElement(st.make(), { width, height, outline, dpr })
      const item = { kind: 'sticker', key: st.key, sprite, shape: st.shape }
      if (st.shape === 'circle') {
        item.radius = width * st.r + outline
        item.anchor = { x: sprite.pad + width / 2, y: sprite.pad + height / 2 }
      } else {
        const s = width / st.vb[0]
        const pts = st.hull.map(([x, y]) => ({ x: sprite.pad + x * s, y: sprite.pad + y * s }))
        item.hull = inflate(pts, outline * 0.6)
        item.anchor = Vertices.centre(item.hull)
      }
      this.pool.push(item)
    }
  }

  /** floor/walls + DOM colliders ([data-physics-solid], [data-physics-floor]) + letter sensors */
  buildStatics() {
    if (this.destroyed) return
    const world = this.engine.world
    if (this.statics.length) Composite.remove(world, this.statics)
    const { w, h } = this
    const sr = this.section.getBoundingClientRect()
    const local = (el) => {
      const r = el.getBoundingClientRect()
      return { x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height }
    }
    const opts = { isStatic: true, friction: 0.5, restitution: 0.2 }
    const statics = [
      Bodies.rectangle(w / 2, h + WALL / 2, w * 4, WALL, { ...opts, label: 'floor' }),
      Bodies.rectangle(-WALL / 2, -h / 2, WALL, h * 5, { ...opts, label: 'wall' }),
      Bodies.rectangle(w + WALL / 2, -h / 2, WALL, h * 5, { ...opts, label: 'wall' }),
    ]
    if (this.ceiling) statics.push(Bodies.rectangle(w / 2, -WALL / 2, w * 4, WALL, { ...opts, label: 'ceiling' }))

    this.section.querySelectorAll('[data-physics-floor]').forEach((el) => {
      const r = local(el)
      if (!r.w) return
      statics.push(Bodies.rectangle(w / 2, r.y + r.h + WALL / 2, w * 4, WALL, { ...opts, label: 'floor' }))
    })
    this.section.querySelectorAll('[data-physics-solid]').forEach((el) => {
      const r = local(el)
      if (!r.w || !r.h) return
      const body =
        el.dataset.physicsSolid === 'circle'
          ? Bodies.circle(r.x + r.w / 2, r.y + r.h / 2, Math.min(r.w, r.h) / 2, { ...opts, label: 'solid' })
          : Bodies.rectangle(r.x + r.w / 2, r.y + r.h / 2, r.w, r.h, { ...opts, label: 'solid', chamfer: { radius: Math.min(16, r.h / 2) } })
      statics.push(body)
    })
    this.letters = []
    this.section.querySelectorAll('.giant-letter').forEach((el) => {
      const r = local(el)
      if (!r.w) return
      const body = Bodies.rectangle(r.x + r.w / 2, r.y + r.h / 2, r.w * 0.82, r.h * 0.72, {
        isStatic: true,
        isSensor: true,
        label: 'letter',
      })
      body.plugin.el = el
      this.letters.push(body)
      statics.push(body)
    })
    this.statics = statics
    Composite.add(world, statics)
  }

  relayout() {
    this.measure()
    this.resizeCanvas()
    this.buildStatics()
    // the floor and copy/CTA colliders moved: wake every body (matter never wakes a
    // sleeping body when its support disappears) and lift any that now sit inside a
    // solid back to the drop height so they fall onto the new layout
    const solids = this.statics.filter((b) => !b.isSensor)
    for (const b of this.dynamic) {
      const inside = Query.collides(b, solids).length > 0
      const x = clamp(b.position.x, 40, this.w - 40)
      const y = inside ? this.dropY() : Math.min(b.position.y, this.h - 80)
      if (inside || x !== b.position.x || y !== b.position.y) {
        Body.setPosition(b, { x, y })
        Body.setVelocity(b, { x: 0, y: 0 })
      }
      Sleeping.set(b, false)
    }
    this.kick()
  }

  /** spawn height: above the hero, or just under the ceiling once tilt has added one */
  dropY() {
    return this.ceiling ? rand(30, 140) : rand(-260, -80)
  }

  // ---------------------------------------------------------------- bodies
  makeBody(item, x, y) {
    const opts = { restitution: 0.32, friction: 0.35, frictionAir: 0.012, density: 0.0016, sleepThreshold: 50 }
    let body
    if (item.shape === 'circle') {
      body = Bodies.circle(x, y, item.radius, opts)
    } else {
      // vertices relative to the sprite; fromVertices recentres them on their centroid
      body = Bodies.fromVertices(x, y, [item.hull.map((p) => ({ ...p }))], opts)
    }
    body.plugin.item = item
    Body.setAngle(body, rand(-0.7, 0.7))
    Body.setAngularVelocity(body, rand(-0.12, 0.12))
    return body
  }

  spawn(item, delay, x = rand(0.08, 0.92) * this.w, y = this.dropY()) {
    this.timers.push(
      setTimeout(() => {
        if (this.destroyed) return
        const body = this.makeBody(item, x, y)
        Composite.add(this.engine.world, body)
        this.dynamic.push(body)
        this.kick()
      }, delay),
    )
  }

  spawnInitial() {
    // interleave socks and stickers, spread across the width with the golden ratio
    const socks = this.pool.filter((p) => p.kind === 'sock')
    const stickers = this.pool.filter((p) => p.kind === 'sticker')
    const order = []
    while (socks.length || stickers.length) {
      if (socks.length) order.push(socks.shift())
      if (socks.length) order.push(socks.shift())
      if (stickers.length) order.push(stickers.shift())
    }
    order.forEach((item, i) => {
      const x = this.w * (0.1 + 0.8 * ((i * 0.618 + 0.2) % 1))
      this.spawn(item, 120 + i * 110, x, -80 - (i % 3) * 110)
    })
    this.maxBodies = order.length + 8
  }

  /** shake / badge tap → drop a few more */
  dropMore(n = 3) {
    for (let i = 0; i < n; i++) {
      const item = this.pool[Math.floor(Math.random() * this.pool.length)]
      this.spawn(item, i * 120)
    }
    this.timers.push(
      setTimeout(() => {
        // over the cap: drop anything that escaped off-screen first, then the oldest
        const gone = this.dynamic.filter((b) => b.position.y < -40 || b.position.y > this.h + 200)
        for (const b of gone.slice(0, this.dynamic.length - this.maxBodies)) {
          this.dynamic.splice(this.dynamic.indexOf(b), 1)
          Composite.remove(this.engine.world, b)
        }
        while (this.dynamic.length > this.maxBodies) {
          const old = this.dynamic.shift()
          Composite.remove(this.engine.world, old)
        }
      }, n * 120 + 50),
    )
    play('pop')
  }

  capSpeed() {
    for (const b of this.dynamic) {
      if (b.speed > 38) Body.setVelocity(b, { x: (b.velocity.x / b.speed) * 38, y: (b.velocity.y / b.speed) * 38 })
    }
  }

  onCollide(e) {
    for (const { bodyA, bodyB } of e.pairs) {
      const letter = bodyA.label === 'letter' ? bodyA : bodyB.label === 'letter' ? bodyB : null
      if (letter) {
        const other = letter === bodyA ? bodyB : bodyA
        if (!other.isStatic && other.speed > 2.2) this.shakeLetter(letter.plugin.el, other.speed)
        continue
      }
      if (bodyA.isSensor || bodyB.isSensor) continue
      const rel = Math.hypot(bodyA.velocity.x - bodyB.velocity.x, bodyA.velocity.y - bodyB.velocity.y)
      if (rel > 4.5) play('drop', { volume: clamp(rel / 18, 0.15, 1), rate: rand(0.85, 1.15) })
    }
  }

  shakeLetter(el, speed) {
    if (!el?.animate) return
    const now = performance.now()
    if (now - (el._hitAt || 0) < 160) return
    el._hitAt = now
    const a = clamp(speed * 1.3, 3, 15)
    const dir = Math.random() < 0.5 ? -1 : 1
    el.animate(
      [
        { transform: 'translate(0, 0) rotate(0deg)' },
        { transform: `translate(${dir * a * 0.5}px, ${a}px) rotate(${dir * a * 0.6}deg) scale(1.04, 0.94)` },
        { transform: `translate(${-dir * a * 0.35}px, ${-a * 0.4}px) rotate(${-dir * a * 0.35}deg)` },
        { transform: `translate(${dir * a * 0.12}px, 0) rotate(${dir * a * 0.12}deg)` },
        { transform: 'translate(0, 0) rotate(0deg)' },
      ],
      { duration: 520, easing: 'ease-out' },
    )
  }

  // ---------------------------------------------------------------- input
  local(e) {
    const r = this.section.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  hitTest(p) {
    const hits = Query.point(this.dynamic, p)
    if (!hits.length) return null
    // topmost = drawn last
    let best = hits[0]
    for (const b of hits) if (this.dynamic.indexOf(b) > this.dynamic.indexOf(best)) best = b
    return best
  }

  onDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (this.drag) return // one sock at a time — a second finger must not orphan the first constraint
    if (e.target.closest?.(INTERACTIVE)) return
    const p = this.local(e)
    const body = this.hitTest(p)
    if (!body) return
    e.preventDefault()
    const offset = { x: p.x - body.position.x, y: p.y - body.position.y }
    const cos = Math.cos(-body.angle)
    const sin = Math.sin(-body.angle)
    const constraint = Constraint.create({
      pointA: { ...p },
      bodyB: body,
      pointB: { x: offset.x * cos - offset.y * sin, y: offset.x * sin + offset.y * cos },
      stiffness: 0.18,
      damping: 0.08,
      length: 0,
    })
    Composite.add(this.engine.world, constraint)
    Sleeping.set(body, false)
    // bring to front
    this.dynamic.splice(this.dynamic.indexOf(body), 1)
    this.dynamic.push(body)
    this.drag = { body, constraint, id: e.pointerId, start: p, t0: performance.now(), moved: false }
    this.suppressClick = true
    this.section.dataset.cursor = 'grabbing'
    this.kick()
  }

  onMove(e) {
    const now = performance.now()
    const p = this.local(e)
    const dt = Math.max(8, now - this.pointer.t)
    this.pointer.vx = (p.x - this.pointer.x) / dt
    this.pointer.vy = (p.y - this.pointer.y) / dt
    this.pointer.x = p.x
    this.pointer.y = p.y
    this.pointer.t = now

    if (this.drag && e.pointerId === this.drag.id) {
      this.drag.constraint.pointA = { ...p }
      if (Math.hypot(p.x - this.drag.start.x, p.y - this.drag.start.y) > 7) this.drag.moved = true
      this.kick()
      return
    }
    if (e.pointerType !== 'mouse' || p.y < 0 || p.y > this.h) return

    // cursor pushes nearby bodies away — but never the one under the pointer,
    // so it can still be hovered, clicked and grabbed
    const hover = e.target?.closest?.(INTERACTIVE) ? null : this.hitTest(p)
    const speed = Math.hypot(this.pointer.vx, this.pointer.vy)
    if (this.cfg.push && speed > 0.08) {
      const R = 130
      for (const b of this.dynamic) {
        if (b === hover) continue
        const dx = b.position.x - p.x
        const dy = b.position.y - p.y
        const d = Math.hypot(dx, dy)
        if (d > R || d < 1) continue
        const f = (1 - d / R) * Math.min(speed, 3) * 0.0011 * b.mass
        Body.applyForce(b, b.position, { x: (dx / d) * f, y: (dy / d) * f - f * 0.3 })
        Sleeping.set(b, false)
        this.kick()
      }
    }
    const state = hover ? (hover.plugin.item.kind === 'sock' ? 'view' : 'grab') : null
    if (state) this.section.dataset.cursor = state
    else delete this.section.dataset.cursor
  }

  onUp(e) {
    const drag = this.drag
    if (!drag || e.pointerId !== drag.id) return
    Composite.remove(this.engine.world, drag.constraint)
    this.drag = null
    delete this.section.dataset.cursor
    const quick = !drag.moved && performance.now() - drag.t0 < 350
    if (quick) {
      const item = drag.body.plugin.item
      if (item.kind === 'sock') {
        this.onQuickView?.(item.product.id)
      } else {
        Body.setVelocity(drag.body, { x: rand(-3, 3), y: -13 })
        Body.setAngularVelocity(drag.body, rand(-0.3, 0.3))
        play('pop')
      }
    } else {
      // a little extra fling on release
      const v = drag.body.velocity
      Body.setVelocity(drag.body, { x: v.x * 1.25, y: v.y * 1.25 })
    }
    setTimeout(() => (this.suppressClick = false), 0)
    this.kick()
  }

  onClickCapture(e) {
    if (this.suppressClick) {
      e.preventDefault()
      e.stopPropagation()
      this.suppressClick = false
    }
  }

  onTouchMove(e) {
    if (this.drag) e.preventDefault() // dragging a sock — don't scroll the page
  }

  onLeave() {
    delete this.section.dataset.cursor
  }

  // ---------------------------------------------------------------- tilt / shake
  async enableTilt() {
    try {
      if (typeof window.DeviceOrientationEvent?.requestPermission === 'function') {
        const res = await window.DeviceOrientationEvent.requestPermission()
        if (res !== 'granted') return false
      }
      if (typeof window.DeviceMotionEvent?.requestPermission === 'function') {
        await window.DeviceMotionEvent.requestPermission().catch(() => {})
      }
    } catch {
      return false
    }
    window.addEventListener('deviceorientation', this.onOrient)
    window.addEventListener('devicemotion', this.onMotion)
    this.tilt = true
    this.addCeilingWhenClear()
    return true
  }

  addCeilingWhenClear() {
    if (this.destroyed || this.ceiling) return
    if (this.dynamic.some((b) => b.bounds.min.y < 4)) {
      this.timers.push(setTimeout(() => this.addCeilingWhenClear(), 400))
      return
    }
    this.ceiling = true
    this.buildStatics()
  }

  onOrient(e) {
    if (e.beta == null || e.gamma == null) return
    const angle = screen.orientation?.angle ?? window.orientation ?? 0
    let gx = e.gamma
    let gy = e.beta
    if (angle === 90) [gx, gy] = [e.beta, -e.gamma]
    else if (angle === 270 || angle === -90) [gx, gy] = [-e.beta, e.gamma]
    else if (angle === 180) [gx, gy] = [-e.gamma, -e.beta]
    const toRad = Math.PI / 180
    const tx = clamp(Math.sin(gx * toRad) * 1.6, -1, 1)
    const ty = clamp(Math.sin(gy * toRad) * 1.6, -1, 1)
    const g = this.engine.gravity
    const changed = Math.abs(tx - g.x) + Math.abs(ty - g.y) > 0.06
    g.x += (tx - g.x) * 0.3
    g.y += (ty - g.y) * 0.3
    if (changed) {
      for (const b of this.dynamic) Sleeping.set(b, false)
      this.kick()
    }
  }

  onMotion(e) {
    const a = e.accelerationIncludingGravity
    if (!a || a.x == null) return
    const mag = Math.hypot(a.x, a.y, a.z)
    const now = performance.now()
    if (this.lastMag && Math.abs(mag - this.lastMag) > 16 && now - this.lastShake > 900) {
      this.lastShake = now
      this.dropMore(3)
    }
    this.lastMag = mag
  }

  // ---------------------------------------------------------------- loop
  onVisibility() {
    this.pageVisible = !document.hidden
    this.updateRunning()
  }

  updateRunning() {
    const should = this.visible && this.pageVisible && !this.destroyed
    if (should) this.kick()
    else this.stop()
  }

  /** (re)start the loop — it stops by itself once everything is asleep */
  kick() {
    this.idleSince = 0
    if (this.running || !this.visible || !this.pageVisible || this.destroyed) return
    this.running = true
    this.last = performance.now()
    this.acc = 0
    this.raf = requestAnimationFrame(this.loop)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  loop(now) {
    if (!this.running) return
    const dt = Math.min(now - this.last, 64)
    this.last = now
    this.acc += dt
    let steps = 0
    while (this.acc >= STEP && steps < 3) {
      Engine.update(this.engine, STEP)
      this.acc -= STEP
      steps++
    }
    if (steps === 3) this.acc = 0
    // 90/120Hz screens get rAFs with no physics step — nothing moved, skip the redraw
    if (steps || this.dirty) {
      this.draw()
      this.dirty = false
    }

    if (this.drag) Sleeping.set(this.drag.body, false)
    const awake = this.drag || this.dynamic.some((b) => !b.isSleeping)
    if (!awake) {
      if (!this.idleSince) this.idleSince = now
      if (now - this.idleSince > 800) {
        this.stop() // everything asleep — save the battery
        return
      }
    } else {
      this.idleSince = 0
    }
    this.raf = requestAnimationFrame(this.loop)
  }

  draw() {
    const { ctx } = this
    const { dpr } = this.cfg
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    for (const b of this.dynamic) {
      const { sprite, anchor } = b.plugin.item
      const c = Math.cos(b.angle) * dpr
      const s = Math.sin(b.angle) * dpr
      ctx.setTransform(c, s, -s, c, b.position.x * dpr, b.position.y * dpr)
      ctx.drawImage(sprite.canvas, -anchor.x, -anchor.y, sprite.w, sprite.h)
    }
  }

  destroy() {
    this.destroyed = true
    this.stop()
    this.timers.forEach(clearTimeout)
    this.io?.disconnect()
    this.ro?.disconnect()
    const s = this.section
    s.removeEventListener('pointerdown', this.onDown, { capture: true })
    s.removeEventListener('click', this.onClickCapture, { capture: true })
    s.removeEventListener('touchmove', this.onTouchMove)
    s.removeEventListener('pointerleave', this.onLeave)
    window.removeEventListener('pointermove', this.onMove)
    window.removeEventListener('pointerup', this.onUp)
    window.removeEventListener('pointercancel', this.onUp)
    window.removeEventListener('deviceorientation', this.onOrient)
    window.removeEventListener('devicemotion', this.onMotion)
    document.removeEventListener('visibilitychange', this.onVisibility)
    delete s.dataset.cursor
    delete s.__heroWorld
    Composite.clear(this.engine.world, false)
    Engine.clear(this.engine)
  }
}

export async function createHeroWorld(options) {
  const world = new HeroWorld(options)
  await world.init()
  return world
}
