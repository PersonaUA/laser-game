// SOUND — Web Audio API synthesizer

let ctx = null

function getCtx() {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

/** Call on any user gesture to unlock AudioContext early */
export function unlockAudio() {
  getCtx()
}

function note(freq, start, duration, gain = 0.12, type = 'sine') {
  const c = getCtx()
  const osc = c.createOscillator()
  const env = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  env.gain.setValueAtTime(0, start)
  env.gain.linearRampToValueAtTime(gain, start + 0.015)
  env.gain.setValueAtTime(gain, start + duration - 0.04)
  env.gain.exponentialRampToValueAtTime(0.001, start + duration)
  osc.connect(env)
  env.connect(c.destination)
  osc.start(start)
  osc.stop(start + duration)
}

/** Short soft UI click — for navigation buttons */
export function playClick() {
  const c = getCtx()
  const t = c.currentTime
  note(880, t, 0.07, 0.07)
  note(1100, t + 0.03, 0.06, 0.04)
}

/** Rotate tick — subtle mechanical click */
export function playTick() {
  const c = getCtx()
  const t = c.currentTime
  // brief noise-like transient via detuned triangle
  note(220, t, 0.04, 0.05, 'triangle')
}

/** Locked level — brief descending "nope" */
export function playLocked() {
  const c = getCtx()
  const t = c.currentTime
  const osc = c.createOscillator()
  const env = c.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(440, t)
  osc.frequency.exponentialRampToValueAtTime(220, t + 0.18)
  env.gain.setValueAtTime(0.07, t)
  env.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
  osc.connect(env)
  env.connect(c.destination)
  osc.start(t)
  osc.stop(t + 0.2)
}

/** Pleasant "ta-daa" win fanfare */
export function playWin() {
  const c = getCtx()
  const t = c.currentTime + 0.04

  // "та" — E4+B4
  note(329.63, t,        0.16, 0.09)
  note(493.88, t,        0.16, 0.06)

  // "дааа" — G4+B4+E5
  note(392.00, t + 0.20, 0.60, 0.10)
  note(493.88, t + 0.20, 0.60, 0.08)
  note(659.25, t + 0.20, 0.60, 0.07)
}
