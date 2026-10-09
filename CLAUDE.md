# CLAUDE.md — SOCKSAVVY

1. **ALWAYS read PROJECT_CONTEXT.md fully before doing any task in this repo.
   Update PROJECT_CONTEXT.md whenever you change design tokens, pages, stack,
   or architecture.**
2. Work only on branch `version-2` (created from `version-1`). Never touch `main` or `version-1`
   (no commits, merges, rebases or force-pushes).
3. Never break cart, checkout, product data or routes. Run `npm run build` and fix
   errors before every commit.
4. Respect `prefers-reduced-motion`: every animation, physics scene, smooth scroll,
   custom cursor and page transition must switch off (or become static) when it is set.
5. Keep API calls inside `src/api/` so the Go backend can be plugged in later.
   Components never call `fetch` directly.
6. Be direct. Report problems plainly: what broke, what is faked, what is a placeholder.

## Working conventions
- Commit small and often on `version-2` with `feat:` / `fix:` / `perf:` / `chore:` / `docs:` prefixes.
- Mobile first (design at 390px, then desktop). No horizontal page scroll.
- Heavy modules (physics, game, sound, confetti) are lazy-loaded with dynamic `import()`.
- Body text keeps 4.5:1 contrast (see the tone table in `src/styles/tokens.css`).
- Ask the owner before changing the visual style (palette, type, sticker look).
