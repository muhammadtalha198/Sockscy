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
        window.scrollTo(0, y)
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
  await context.close()
})

test('cart → checkout → order still works', async ({ page }) => {
  await page.goto('/checkout', { waitUntil: 'networkidle' })
  await page.fill('#name', 'Ayesha Khan')
  await page.fill('#phone', '03211234567')
  await page.fill('#address', 'House 12, Street 4, Gulberg III')
  await page.locator('#city').selectOption({ index: 1 })
  await page.locator('#province').selectOption({ index: 1 })
  await page.locator('button[form=checkout-form]').click()
  await expect(page).toHaveURL(/order-placed/, { timeout: 10_000 })
  await expect(page.getByText('ORDER', { exact: false }).first()).toBeVisible()
})
