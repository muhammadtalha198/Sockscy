# Version 2 — tools and skills

Verified 2026-10-09 (registry metadata, tarball contents, install scripts). Everything is pinned
exactly in `package.json`.

## Installed

| package | version | where | why |
| --- | --- | --- | --- |
| gsap (+ ScrollTrigger) | 3.15.0 (was ^3.15.0) | runtime, lazy | pinned scenes (sock factory), the shared ticker Lenis + parallax run on. Free "no charge" licence (Webflow) — fine for a shop. |
| lenis | 1.3.26 (was ^1.3.26) | runtime, lazy | smooth wheel scroll; latest stable. 2.0 is dev-only and breaks our API. |
| @playwright/test | 1.56.1 | dev | `npm run test:visual`. Only version line that matches the Chromium build already in the container (1194) → no browser download. No install scripts. |
| lighthouse | 13.5.0 | dev | `npm run lighthouse` (median of 3, mobile + desktop). Installed with `--ignore-scripts`; it has no lifecycle scripts anyway. |

No new runtime dependency: the parallax engine is ~4 KB of our own code.

## Skipped (and why)

| candidate | verdict |
| --- | --- |
| GSAP ScrollSmoother | Free now, but it moves the whole page in a fixed wrapper: breaks `position: sticky` (sock factory, buy bar) and every fixed element (cursor, side tab, stickers, curtain), and double-smooths with Lenis. |
| motion / framer-motion 14 | +17–43 KB gz and a second animation loop doing what GSAP + our springs already do. |
| vanilla-tilt 1.8.1 | Unmaintained since 2024; one loop per element. Replaced by `<TiltCard>` on the shared loop. |
| three / @react-three/fiber | +130–237 KB gz; a flat sticker diorama is 2D planes, which CSS transforms do on the compositor for free. |
| @lhci/cli 0.15.1 | Stale (June 2025), pins Lighthouse 12, 328 packages. |

## Claude Code skills

Installed into `.claude/skills/` (markdown only, read in full before copying, pinned to
`greensock/gsap-skills@aed9cfd3`, MIT): **gsap-core, gsap-scrolltrigger, gsap-performance,
gsap-react** — correct ScrollTrigger usage, cleanup and performance rules.

Reviewed, **not installed**:
- `pbakaus/impeccable` — its setup downloads a binary from GitHub releases and sends telemetry
  unless disabled. **Risky.**
- `vercel-labs/agent-skills` web-design-guidelines — fetches an unpinned remote prompt on every
  run (prompt-injection vector). **Risky.**
- `Community-Access/accessibility-agents` — installs hooks on every prompt and an MCP server.
- `addyosmani/web-quality-skills` — fine (MIT, read-only), but its checks duplicate our Lighthouse
  + Playwright scripts; not needed.
- Anthropic `frontend-design` — already built in; about choosing a new visual direction, which
  this project must not do.
- Aggregator collections (awesome-claude-skills etc.) — discovery only, supply-chain risk.
