// For every route at every width: no console errors, no horizontal page scroll,
// a scroll pass from top to bottom without long stalls, and a full-page
// screenshot in test-results/screens/<width>/<page>.png for a human to look at.
import { expect, test } from '@playwright/test'

const PAGES = [
  ['home', '/'],
  ['shop', '/shop'],
  ['product', '/product/sunny-side-up'],
  ['about', '/about'],
  ['contact', '/contact'],
  ['orders', '/orders'],
  ['cart', '/cart'],
  ['checkout', '/checkout'],
  ['404', '/nope'],
]

const CART = {
  state: {
    items: [
      {
        key: 'checkmate:M:classic', id: 'checkmate', name: 'Checkmate', price: 1250, size: 'M', qty: 1, maxQty: 1,
        sizeStock: 2, lineStock: 1, colorway: { id: 'classic', label: 'classic' }, tile: 'red',
        art: { pattern: 'checker', base: '#ffffff', trim: '#111111' }, image: null,
      },
    ],
    giftPack: false,
    discount: null,
  },
  version: 2,
}

test.beforeEach(async ({ context }) => {
  await context.addInitScript((cart) => {
    sessionStorage.setItem('socksavvy-intro', '1') // the intro has its own test below
    if (!localStorage.getItem('socksavvy-cart')) localStorage.setItem('socksavvy-cart', JSON.stringify(cart))
  }, CART)
})

for (const [name, path] of PAGES) {
  test(`${name}: renders, scrolls, no overflow`, async ({ page }, info) => {
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    await page.goto(path, { waitUntil: 'networkidle' })
    await page.waitForTimeout(900)

    // scroll pass: wheel down through the page, recording frame gaps
    const frames = await page.evaluate(async () => {
      const gaps = []
      let last = performance.now()
      let run = true
      const tick = (t) => { gaps.push(t - last); last = t; if (run) requestAnimationFrame(tick) }
      requestAnimationFrame(tick)
      const H = document.documentElement.scrollHeight
      for (let y = 0; y < H; y += Math.round(innerHeight * 0.5)) {
        window.scrollTo({ top: y, behavior: 'instant' }) // html has scroll-behavior: smooth
        await new Promise((r) => setTimeout(r, 120))
      }
      run = false
      return gaps.slice(2)
    })
    const sorted = [...frames].sort((a, b) => a - b)
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0
    info.annotations.push({ type: 'frames', description: `n=${frames.length} p95=${p95.toFixed(1)}ms` })

    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(1200)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    // full-page capture keeps the real viewport, so the sticky footer (which lies under the
    // page on desktop) would be painted behind <main>: put it back in flow for the picture
    await page.addStyleTag({ content: '.site-footer[data-fits]{position:relative!important}' })
    await page.screenshot({ path: `test-results/screens/${info.project.name}/${name}.png`, fullPage: true })

    expect(errors, 'console / page errors').toEqual([])
    expect(overflow, 'horizontal page scroll (px)').toBeLessThanOrEqual(0)
    expect(p95, 'p95 frame gap while scrolling (ms) — gross stalls only').toBeLessThan(250)
  })
}

test('reduced motion: nothing animates, no canvas, no curtain', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.evaluate(() => window.scrollTo(0, 2500))
  await page.waitForTimeout(800)
  const state = await page.evaluate(() => ({
    running: document.getAnimations().filter((a) => a.playState === 'running').length,
    canvas: document.querySelectorAll('.hero canvas').length,
    intro: !!document.querySelector('.intro'),
    moved: [...document.querySelectorAll('[data-depth]')].filter((el) => el.style.transform && el.style.transform !== 'none').length,
  }))
  expect(state).toEqual({ running: 0, canvas: 0, intro: false, moved: 0 })
  await page.locator('header a', { hasText: 'shop' }).first().click()
  await expect(page.locator('.curtain')).toHaveCount(0)

  // every other page is static too: no running animation, no layer offset, no CSS scroll animation
  for (const [name, path] of PAGES) {
    await page.goto(path, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2))
    await page.waitForTimeout(500)
    const still = await page.evaluate(() => ({
      running: document.getAnimations().filter((a) => a.playState === 'running').length,
      moved: [...document.querySelectorAll('[data-depth]')].filter((el) => el.style.transform && el.style.transform !== 'none').length,
      scrollAnimated: document.querySelectorAll('[data-px-scroll]').length,
    }))
    expect(still, `${name} under reduced motion`).toEqual({ running: 0, moved: 0, scrollAnimated: 0 })
  }
  await context.close()
})

test('calm mode toggle: visible, pressable, turns the planes down', async ({ page }) => {
  await page.goto('/about', { waitUntil: 'networkidle' })
  const calm = page.getByRole('button', { name: 'calm mode', exact: true })
  await expect(calm).toBeVisible()
  await expect(calm).toHaveAttribute('aria-pressed', 'false')
  await calm.click()
  await expect(calm).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('html')).toHaveAttribute('data-calm', '')
  expect(await page.evaluate(() => window.__parallax.getState().calm)).toBe(true)
  await calm.click()
  await expect(page.locator('html')).not.toHaveAttribute('data-calm', '')
})

test('cart → checkout → order still works', async ({ page }) => {
  await page.goto('/checkout', { waitUntil: 'networkidle' })
  // the form never moves: pointer motion shifts only the soft backdrop
  const before = await page.locator('#name').boundingBox()
  await page.mouse.move(40, 40)
  await page.mouse.move(900, 600, { steps: 8 })
  await page.waitForTimeout(400)
  expect(await page.locator('#name').boundingBox()).toEqual(before)
  await page.fill('#name', 'Ayesha Khan')
  await page.fill('#phone', '03211234567')
  await page.fill('#address', 'House 12, Street 4, Gulberg III')
  await page.locator('#city').selectOption({ index: 1 })
  await page.locator('#province').selectOption({ index: 1 })
  await page.locator('button[form=checkout-form]').click()
  await expect(page).toHaveURL(/order-placed/, { timeout: 10_000 })
  await expect(page.getByText('ORDER', { exact: false }).first()).toBeVisible()
})

test('keyboard focus in the footer is never hidden under the page', async ({ page }) => {
  await page.goto('/about', { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  // tab order: the last link of the page, then on into the footer form
  const field = page.locator('footer input').first()
  await field.focus()
  // the browser may smooth-scroll to it; it must end up on screen and on top
  await expect
    .poll(
      () =>
        field.evaluate((el) => {
          const r = el.getBoundingClientRect()
          const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
          return r.bottom <= innerHeight && r.top >= 0 && (hit === el || el.contains(hit))
        }),
      { timeout: 4000 },
    )
    .toBe(true)
})

test('after an order, a new cart survives going Back to the order page', async ({ page }) => {
  const lines = () => page.evaluate(() => JSON.parse(localStorage.getItem('socksavvy-cart') || '{}').state?.items?.length ?? 0)
  await page.goto('/checkout', { waitUntil: 'networkidle' })
  await page.fill('#name', 'Ayesha Khan')
  await page.fill('#phone', '03211234567')
  await page.fill('#address', 'House 12, Street 4, Gulberg III')
  await page.locator('#city').selectOption({ index: 1 })
  await page.locator('#province').selectOption({ index: 1 })
  await page.locator('button[form=checkout-form]').click()
  await expect(page).toHaveURL(/order-placed/, { timeout: 10_000 })
  await expect.poll(lines).toBe(0) // emptied at submit

  // shop again: a new pair in the cart
  await page.goto('/product/checkmate', { waitUntil: 'networkidle' })
  await page.locator('input[type=radio][name^=size]:not([disabled])').first().check({ force: true })
  await page.locator('form button[type=submit][data-cursor=add]').click()
  await expect.poll(lines).toBe(1)

  // Back to the confirmation (its order is still in history state): the new cart stays
  await page.goBack()
  await expect(page).toHaveURL(/order-placed/)
  await expect(page.getByText('order number')).toBeVisible()
  await page.waitForTimeout(800)
  expect(await lines()).toBe(1)
})
