// Phone tilt → parallax. Asked for politely (a tap on the tilt chip or the hero's
// "tilt your phone" button), remembered per device, and always optional: when it is
// denied or unsupported the site simply stays scroll-only.
//
//   requestTilt()  must run inside a tap (iOS asks for motion permission there)
//   stopTilt()     back to scroll-only
//
// The neutral position is however the visitor holds the phone (the average of the first
// readings) and it drifts slowly toward the current pose, so leaning back on the sofa
// doesn't leave every layer pushed to one side. Values are mapped to screen axes,
// wrapped, given a small dead zone, clamped to ±--parallax-tilt-deg, low-pass filtered
// by time and then sprung by the engine. Note: `requestPermission` also exists in
// Chrome 151+ (it resolves from the site's motion-sensor setting, no prompt), so its
// presence is never treated as "this is iOS".

import { parallaxTokens, setTilt } from './engine'

const KEY = 'socksavvy-tilt' // 'on' | 'off'
let listening = false
let rest = null
let fx = 0
let fy = 0

export function tiltSupported() {
  return (
    typeof window !== 'undefined' &&
    'DeviceOrientationEvent' in window &&
    window.matchMedia('(pointer: coarse)').matches &&
    window.isSecureContext !== false
  )
}

export const tiltNeedsPermission = () =>
  typeof window !== 'undefined' && typeof window.DeviceOrientationEvent?.requestPermission === 'function'

export function tiltChoice() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}
function saveChoice(v) {
  try {
    localStorage.setItem(KEY, v)
  } catch {
    /* private mode — the choice lasts this visit */
  }
}

const clamp = (v) => Math.max(-1, Math.min(1, v))
const wrap = (d) => ((((d + 540) % 360) + 360) % 360) - 180
let samples = []
let lastAt = 0

function screenAxes(e) {
  const angle = window.screen?.orientation?.angle ?? window.orientation ?? 0
  // device frame → screen frame: x = left/right lean, y = toward/away
  if (angle === 90) return { x: e.beta, y: -e.gamma }
  if (angle === -90 || angle === 270) return { x: -e.beta, y: e.gamma }
  if (angle === 180) return { x: -e.gamma, y: -e.beta }
  return { x: e.gamma, y: e.beta }
}

function onOrient(e) {
  if (e.beta == null || e.gamma == null) return
  const now = performance.now()
  const dt = Math.min(100, now - (lastAt || now - 16))
  lastAt = now
  const { x, y } = screenAxes(e)
  // rest pose = the average of the first ~8 readings (how the visitor holds the phone)
  if (!rest) {
    samples.push({ x, y })
    if (samples.length < 8) return
    rest = { x: samples.reduce((a, s) => a + s.x, 0) / samples.length, y: samples.reduce((a, s) => a + s.y, 0) / samples.length }
    samples = []
  }
  // …and it follows posture changes slowly (τ ≈ 5 s)
  const k = 1 - Math.exp(-dt / 5000)
  rest.x += wrap(x - rest.x) * k
  rest.y += wrap(y - rest.y) * k
  const deg = parallaxTokens().tiltDeg
  const dead = (v) => (Math.abs(v) < 0.7 ? 0 : v - Math.sign(v) * 0.7)
  let nx = clamp(dead(wrap(x - rest.x)) / deg)
  const ny = clamp(dead(wrap(y - rest.y)) / deg)
  // near upright (|beta| > 70°) gamma flips over — fade the side-to-side axis out
  const upright = Math.abs(e.beta)
  if (upright > 70) nx *= Math.max(0, 1 - (upright - 70) / 15)
  // time-based low-pass (τ ≈ 110 ms) — same feel at 60 or 120 Hz
  const a = 1 - Math.exp(-dt / 110)
  fx += (nx - fx) * a
  fy += (ny - fy) * a
  setTilt({ x: fx, y: fy })
}

function recalibrate() {
  rest = null
  samples = []
}

function listen() {
  if (listening) return
  listening = true
  recalibrate()
  window.addEventListener('deviceorientation', onOrient, { passive: true })
  // a new orientation, or coming back to the tab, means a new neutral pose
  window.screen?.orientation?.addEventListener?.('change', recalibrate)
  document.addEventListener('visibilitychange', onVisibility)
}

function onVisibility() {
  if (!listening) return
  if (document.hidden) window.removeEventListener('deviceorientation', onOrient)
  else {
    recalibrate()
    window.addEventListener('deviceorientation', onOrient, { passive: true })
  }
}

/** Call from a tap. Resolves true when tilt parallax is running. */
export async function requestTilt() {
  if (!tiltSupported()) return false
  try {
    if (tiltNeedsPermission()) {
      const answer = await window.DeviceOrientationEvent.requestPermission()
      if (answer !== 'granted') {
        saveChoice('off')
        return false
      }
    }
    listen()
    saveChoice('on')
    return true
  } catch {
    saveChoice('off')
    return false
  }
}

export function stopTilt() {
  if (listening) {
    window.removeEventListener('deviceorientation', onOrient)
    document.removeEventListener('visibilitychange', onVisibility)
    window.screen?.orientation?.removeEventListener?.('change', recalibrate)
  }
  listening = false
  setTilt(null)
  saveChoice('off')
}

/**
 * On load: resume tilt if the visitor said yes before. (Listening is harmless where a new
 * permission would be needed — no events arrive until they tap the tilt sticker again.)
 */
export function resumeTilt() {
  if (tiltSupported() && tiltChoice() === 'on') listen()
}
