# Version 2 — parallax techniques taken (technique only, no designs or code copied)

Sources: Codrops demo source (SmoothScrollAnimations, ElasticGridScroll, ScrollTextMotion,
interlude), GSAP docs/skills, Lenis source, Chrome "performant parallaxing" + "animated blur",
Keith Clark's CSS parallax, WCAG 2.3.3, Awwwards parallax collections (Telescope zoom intro,
Firewatch-style layered heroes). Several award pages were unreachable from this environment, so
their details are second-hand (UNVERIFIED).

| # | technique | how SOCKSAVVY uses it |
| --- | --- | --- |
| 1 | **Depth planes, not per-element speeds** — 5 fixed planes, offset = (anchor centre − viewport centre) × depth, so the layout is exactly as designed when it is centred | `--depth-back … --depth-front`; `<ParallaxSection>` anchors all its layers |
| 2 | **Frame-rate-independent damping, one ticker** — lerp factor from elapsed time, not per frame; one loop on gsap.ticker after Lenis | engine `frame()`; `attachTicker()` |
| 3 | **Pointer parallax with counter-motion** — far planes move against the cursor, near planes with it, small amplitude, eased back on leave | `look` spring, `--parallax-pointer` |
| 4 | **Calibrated gyroscope** — rest pose = how the phone is held, slow re-centre, screen-axis mapping, clamp, low-pass, ask inside a tap | `src/parallax/tilt.js` |
| 5 | **Inner-image parallax in a frame** — the card stays put, the picture inside moves against it | `<TiltCard>` `data-tilt-depth` |
| 6 | **Column lag (elastic grid)** — columns trail slightly at alternating speeds, realign at rest; never counter-scrolling product grids | Instagram strip masonry |
| 7 | **Giant type drifting against the scroll + velocity skew** — linear mapping, skew only on fast flicks | `<ParallaxText>`, GiantHeadline |
| 8 | **Pinned diorama / camera dolly** — one short pin, children move at plane rates | sock factory |
| 9 | **Footer reveal from behind** — the page lifts off, the footer was underneath | Footer |
| 10 | **Faked depth of field** — never animate blur; blur baked into the foreground art, dropped on phones | `.dof-blur` |
| 11 | **Page transitions with depth** — the old page's planes move away at their own speeds, the new ones arrive from behind | curtain + `setTransition()` |
| 12 | **CSS scroll-driven animations as the scroll path** — compositor-run, never trail native touch scroll | `[data-px-scroll]` |
| 13 | **Reduced motion + calm mode** — OS setting = static; a remembered site toggle = minimum | `ParallaxRoot`, `CalmToggle` |

What makes parallax feel cheap (avoided on purpose): a speed per element, parallax on body copy /
prices / buttons, layers offset on first paint, fixed per-frame lerp (twice as fast on 120 Hz),
raw cursor/gyro input, animated blur, more than ~6 moving planes per screen, long scroll hijacks.
