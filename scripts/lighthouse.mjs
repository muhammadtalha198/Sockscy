// Lighthouse (mobile + desktop) for the main routes, median of N runs per page.
//   npm run build && npm run preview &   (serves http://localhost:4173)
//   npm run lighthouse -- --label=after [--runs=3] [--base=http://localhost:4173] [--pages=home,shop]
// Needs Chrome/Chromium: set CHROME_PATH, or it uses the Playwright build in /opt/pw-browsers.
// Writes docs/version-2/lighthouse-<label>.md + .json.
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import * as chromeLauncher from 'chrome-launcher'
import lighthouse from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'

const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split('=')[1] ?? d
const BASE = arg('base', 'http://localhost:4173')
const RUNS = Number(arg('runs', 3))
const LABEL = arg('label', 'run')
const ALL = { home: '/', shop: '/shop', product: '/product/sunny-side-up', about: '/about', cart: '/cart', checkout: '/checkout', 404: '/nope' }
const PAGES = arg('pages', Object.keys(ALL).join(',')).split(',')

if (!process.env.CHROME_PATH) {
  const root = '/opt/pw-browsers'
  const dir = existsSync(root) && readdirSync(root).find((d) => /^chromium-\d+$/.test(d))
  if (dir) process.env.CHROME_PATH = `${root}/${dir}/chrome-linux/chrome`
}

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]
const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox'] })
const rows = []
try {
  for (const form of ['mobile', 'desktop']) {
    for (const page of PAGES) {
      const runs = []
      for (let i = 0; i < RUNS; i++) {
        const { lhr } = await lighthouse(
          BASE + ALL[page],
          { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] },
          form === 'desktop' ? desktopConfig : undefined,
        )
        const a = lhr.audits
        runs.push({
          perf: Math.round(lhr.categories.performance.score * 100),
          a11y: Math.round(lhr.categories.accessibility.score * 100),
          bp: Math.round(lhr.categories['best-practices'].score * 100),
          seo: Math.round(lhr.categories.seo.score * 100),
          fcp: a['first-contentful-paint'].numericValue,
          lcp: a['largest-contentful-paint'].numericValue,
          tbt: a['total-blocking-time'].numericValue,
          cls: a['cumulative-layout-shift'].numericValue,
        })
      }
      const m = (k) => median(runs.map((r) => r[k]))
      const row = { form, page, perf: m('perf'), perfRuns: runs.map((r) => r.perf), a11y: m('a11y'), bp: m('bp'), seo: m('seo'), fcp: m('fcp'), lcp: m('lcp'), tbt: m('tbt'), cls: m('cls') }
      rows.push(row)
      console.log(`${form.padEnd(7)} ${page.padEnd(8)} perf ${row.perf} (${row.perfRuns.join('/')}) a11y ${row.a11y} LCP ${(row.lcp / 1000).toFixed(1)}s TBT ${Math.round(row.tbt)}ms CLS ${row.cls.toFixed(3)}`)
    }
  }
} finally {
  await chrome.kill()
}

mkdirSync('docs/version-2', { recursive: true })
const md = [
  `# Lighthouse — ${LABEL}`,
  '',
  `Median of ${RUNS} runs per page against \`${BASE}\` (vite preview, local, simulated throttling).`,
  '',
  '| form | page | perf (runs) | a11y | best pr. | seo | FCP | LCP | TBT | CLS |',
  '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ...rows.map((r) => `| ${r.form} | ${r.page} | **${r.perf}** (${r.perfRuns.join('/')}) | ${r.a11y} | ${r.bp} | ${r.seo} | ${(r.fcp / 1000).toFixed(1)} s | ${(r.lcp / 1000).toFixed(1)} s | ${Math.round(r.tbt)} ms | ${r.cls.toFixed(3)} |`),
  '',
]
writeFileSync(`docs/version-2/lighthouse-${LABEL}.md`, md.join('\n'))
writeFileSync(`docs/version-2/lighthouse-${LABEL}.json`, JSON.stringify(rows, null, 2))
