// Reference-counted page scroll lock shared by the cart drawer, quick view,
// game and intro. Smooth-scroll engines can register stop/start hooks.
let locks = 0
let saved = ''
const hooks = new Set()

export function lockScroll() {
  if (locks++ === 0) {
    saved = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    hooks.forEach((h) => h.stop?.())
  }
}

export function unlockScroll() {
  if (locks === 0) return
  if (--locks === 0) {
    document.documentElement.style.overflow = saved
    hooks.forEach((h) => h.start?.())
  }
}

/** e.g. registerScrollHooks({ stop: () => lenis.stop(), start: () => lenis.start() }) */
export function registerScrollHooks(hook) {
  hooks.add(hook)
  return () => hooks.delete(hook)
}
