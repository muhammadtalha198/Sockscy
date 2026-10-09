# Version 2 — what changed, page by page

Branch `version-2` (from `version-1` @ `f8e2eba`). Look, palette, type, stickers, cart,
checkout, routes and product data are unchanged; v2 adds depth. Screens: `before/` (v1) and
`after/` (v2), each at 390 / 768 / 1440.

## The system (every page)

- **Five depth planes** (`src/styles/tokens.css`): back −0.3 · far −0.15 · mid 0 · near 0.2 ·
  front 0.45. Plus knobs: `--parallax-travel` 0.42, `-clamp` 0.3 vh, `-pointer` 70 px,
  `-tilt-deg` 22°, `-calm` 0.15, `-phone` 0.65, `--dof-blur` 2.5 px.
- **One engine** (`src/parallax/engine.js`, ~5 KB, no new dependency). Scroll runs as CSS
  scroll-driven animations (compositor, Chrome/Edge/Safari 26+) with a lerped JS fallback
  (Firefox, `?parallax=js`). Pointer (desktop), phone tilt and page transitions are JS on one
  loop (gsap.ticker after Lenis), springs with a small overshoot, frame-rate independent.
  Geometry is cached; there are no layout reads per frame; off-screen layers sleep; the loop
  stops when settled.
- **Components** (`src/components/parallax/`): `ParallaxSection` (anchors its layers; `rest="top"`
  = still on first paint), `ParallaxLayer`, `ParallaxText`, `ParallaxSticker`, `TiltCard`,
  `StoryBlock`, `SoftBackdrop` + `DriftSticker`; hook `useParallax`. `<Sticker depth>` takes the
  plane names.
- **Inputs**: scroll; pointer on desktop; phone tilt only after a tap ("tilt" sticker, or the
  one-time chip), calibrated to how the phone is held, falling back to scroll only.
- **Calm mode**: a sticker in the bottom-right cluster (with sound, and tilt on phones). 15%
  strength, float/spin loops paused, tilt off, confetti halved. Remembered per device.
- **prefers-reduced-motion**: nothing registers. No scroll animations, no transforms, no
  confetti, no curtain. Tested on every page.

## Home

- **Hero** (5 planes): the giant headline is the slowest plane (−0.1). Doodles are far. The
  sock cutouts are near and hand over to the physics socks (the physics is kept). The copy,
  CTA and badge stay still, because the socks land on them. One big blurred foreground sock
  sits on the front plane (desktop). Everything is at rest on first paint and separates as the
  hero scrolls away.
- **Featured drop / collections / why / sock of the day**: each is a `ParallaxSection`. Tags
  are on the far and back planes; stickers are near or front. Giant words drift sideways
  against the scroll and lean a little on fast flicks. The colour cuts stay hard.
- **Sock factory**: a pinned diorama. The word drifts across the back plane, doodles are
  back/far, and fried eggs float in on the near/front planes at the PRINT step.
- **Instagram**: a masonry strip where columns trail at two speeds and realign at rest.
- **Footer**: on desktop the page lifts off a sticky footer, and the yellow SOCKSAVVY rises from
  behind its clip line (a curtain reveal). This only happens when the footer fits the screen;
  otherwise it stays in normal flow.

## Shop

- Product tiles are `TiltCard`s: the card tilts toward the pointer (or a finger while
  pressed), the sock inside moves against it, and the urgency sticker pops out in front.
- Filters and the grid enter with a staggered spring. Changing a filter re-deals the grid.
- The hero is a rest-top section.

## Product

- Every carousel slide is a diorama with, from back to front: a tilted paper sheet, the giant
  product name, a floor shadow, the sock (drag-to-spin still works) and one doodle.
- "You might also like" is a parallax rail: on desktop it drifts as one row; on phones it is a
  snap scroller whose cards sit at two depths.

## Cart / Checkout (subtle on purpose)

- Three soft tone-on-tone paper sheets sit far behind the content. They respond to scroll
  only (not pointer or tilt), so nothing moves while someone types.
- One sticker drifts sideways as the header leaves.
- Form fields, lines, summary and buttons never move. A test checks that the name field does
  not move under pointer motion.

## About / Contact / Orders

- The story is told in layers. Each paragraph block (`StoryBlock`) enters at its own depth:
  far ones rise further and start smaller. Once in place they barely move (≤ 0.04).
- Giant words and tags sit on back/far planes. On About, a sock cutout sits on the front
  plane.
- Order tracking (demo `SS-10234`) is unchanged.

## 404

- Four planes: a ghost "404" in the same tone (back), doodles (far), the headline, copy and
  buttons (mid, still), and a doodle at the front.
- The lost sock drifts *through* the planes: small and behind the headline's "A", then
  forward past it to the front and back again (9 s each way). Under the hood it is two copies
  on one CSS path that swap at mid-path, where nothing overlaps them. This uses transform and
  opacity only.
- The other sock still peeks out from under the page. The section now clips its bottom edge,
  so this also works with the sticky footer.

## Order placed

- Sock confetti falls at three depths. Far pieces are small, slow and faint; near pieces are
  big, fast and drawn in front. If you scroll mid-shower, each band moves at a different rate.
- The stickers sit on their planes.

## Page transitions

- The torn-paper curtain is unchanged.
- While it covers the page, the old page's planes move away at their own speeds: near ones
  rush up and toward you, far ones sink back.
- The new page's planes start lower and smaller, as if from behind, and spring home with
  about 8% overshoot as the curtain wipes off.
- The spring waits until the new page has actually rendered (lazy pages commit late). If you
  press Back mid-way, the planes spring back.

## Also fixed (v1 handoff bugs, commit 50cae0e)

- Stuck curtain on a second fast navigation.
- Game prize messages out of sync with the cart.
- The game board regenerating on rotate.
- Old saved carts with impossible lines (persist v2 migration).
- "Nothing to pay" flashing under the curtain after an order.
- JS-path rest-top layers started offset in short first screens (Firefox).

## Placeholders and the real files to add

Every layer works today with original SVG art (stickers, socks, doodles) and CSS shapes
(paper sheets, ghost type, floor shadows). Nothing is a stock photo. To swap in real files:

| path | size · format | transparent | plane / where | code change |
| --- | --- | --- | --- | --- |
| `public/cutouts/<product-id>.webp` + `"cutout"` on the product | ~600–800 px tall, WebP, < 80 KB | yes, sock only | hero near stickers + physics socks; product diorama near plane | none (already read) |
| product photos via `npm run images` | 1200 + 600 px wide, 4:5 WebP | no | shop tiles (inner image moves against the card), carousel | none. Note: an opaque photo fills the diorama's near plane, so the sheet and name behind it show less. Prefer cutouts for slide 1. |
| `public/layers/hero-front.webp` | ~760 × 1000, WebP, < 90 KB, **blur baked in (2–3 px)** | yes | hero front plane (desktop) | `Hero.jsx` front plane: replace the SMILE `<SockArt>` with `<img>` and drop `.dof-blur` |
| `public/layers/about-sock.webp` | ~500 × 600, WebP, < 60 KB | yes | About "thrifted" front plane | `About.jsx`: `<img>` in place of the checker `<SockArt>` |
| `public/layers/lost-sock.webp` | ~600 × 700, WebP, < 60 KB | yes | 404 drifting sock (both copies) | `NotFound.jsx` `LostSock`: `<img>` in place of `<SockArt>` |
| `public/instagram/1.webp … 6.webp` | 800 × 800, WebP, < 90 KB | no | Instagram masonry tiles | `InstagramStrip.jsx` (comment at the top) |
| `public/confetti/sock-1.webp … 6.webp` (optional) | 68 × 102 (2× of 34 × 51), WebP, < 6 KB | yes | order-placed confetti sprites | `fx/confetti.js` `loadSocks()` |
| `public/spin/<id>/01–24.webp` (optional) | 800 × 1000, WebP, < 40 KB each | no | product drag-to-spin | none (`"spin"` on the product) |

Copy to replace: the About story, `SITE.returns`, the WhatsApp number (`VITE_WHATSAPP_NUMBER`).
