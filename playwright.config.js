// Visual + scroll checks at the three design widths.  `npm run test:visual`
// builds the site, serves it with `vite preview` and drives Chromium.
import { defineConfig, devices } from '@playwright/test'

const PORT = 4173

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results/artifacts',
  timeout: 90_000,
  fullyParallel: true,
  workers: 3,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'mobile-390', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 } },
    { name: 'tablet-768', use: { viewport: { width: 768, height: 1024 }, hasTouch: true, deviceScaleFactor: 1 } },
    { name: 'desktop-1440', use: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 } },
  ],
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
