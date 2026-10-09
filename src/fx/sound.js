// Tiny sound manager. Sound is OFF by default; howler.js is only downloaded
// once the visitor switches sound on. Files: public/sounds/{name}.{webm,mp3}
// (regenerate with `node scripts/make-sounds.mjs`, each < 30 KB).
import { useUi } from '../store/ui'

const BASE = `${import.meta.env.BASE_URL}sounds/`
const VOLUME = { pop: 0.5, drop: 0.45, add: 0.6, win: 0.6 }
const MIN_GAP = { pop: 40, drop: 70, add: 120, win: 400 }

let howls = null
let loading = null
const last = {}

function load() {
  if (!loading) {
    loading = import('howler')
      .then(({ Howl }) => {
        howls = {}
        for (const name of Object.keys(VOLUME)) {
          howls[name] = new Howl({ src: [`${BASE}${name}.webm`, `${BASE}${name}.mp3`], volume: VOLUME[name], preload: true })
        }
      })
      .catch(() => {
        loading = null // allow a retry later (offline etc.)
      })
  }
  return loading
}

/** Play a named sound if the visitor has sound on. Never throws. */
export function play(name, { volume, rate } = {}) {
  if (!useUi.getState().soundOn) return
  if (!howls) {
    load()
    return
  }
  const howl = howls[name]
  if (!howl) return
  const now = performance.now()
  if (now - (last[name] || 0) < (MIN_GAP[name] || 0)) return
  last[name] = now
  try {
    const id = howl.play()
    if (volume != null) howl.volume(Math.max(0, Math.min(1, volume)) * VOLUME[name], id)
    if (rate != null) howl.rate(rate, id)
  } catch {
    /* audio is best-effort */
  }
}

// Start downloading as soon as sound is switched on (and on load if it was left on).
if (useUi.getState().soundOn) load()
useUi.subscribe((state, prev) => {
  if (state.soundOn && !prev.soundOn) load()
})
