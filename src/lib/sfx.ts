/*
 * Tiny Web Audio synth for the roast arena — every cue is synthesized,
 * so there are no audio assets to load. All functions are safe to call
 * on the server (they no-op without `window`).
 */

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(value: boolean) {
  muted = value;
}

function getCtx(): AudioContext | null {
  if (muted || typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Percussive gain envelope: fast attack, exponential decay. */
function envelope(c: AudioContext, t0: number, peak: number, duration: number) {
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  gain.connect(c.destination);
  return gain;
}

function noiseSource(c: AudioContext, duration: number) {
  const buffer = c.createBuffer(1, Math.ceil(c.sampleRate * duration), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  return src;
}

/** The show starts — a quick rising whoosh, like a mic being switched on. */
export function playStart() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const duration = 0.45;

  const noise = noiseSource(c, duration);
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(280, t);
  filter.frequency.exponentialRampToValueAtTime(2600, t + duration);

  noise.connect(filter).connect(envelope(c, t, 0.12, duration));
  noise.start(t);
  noise.stop(t + duration);
}

/** One panelist wraps up — a soft pluck, pitched up per agent (C5 E5 G5 C6). */
export function playAgentDone(step = 0) {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const scale = [523.25, 659.25, 783.99, 1046.5];
  const freq = scale[Math.min(step, scale.length - 1)];

  const body = c.createOscillator();
  body.type = "triangle";
  body.frequency.value = freq;
  body.connect(envelope(c, t, 0.13, 0.5));
  body.start(t);
  body.stop(t + 0.5);

  const shimmer = c.createOscillator();
  shimmer.type = "sine";
  shimmer.frequency.value = freq * 2;
  shimmer.connect(envelope(c, t, 0.045, 0.32));
  shimmer.start(t);
  shimmer.stop(t + 0.32);
}

/** The judge rules — a gavel thud with a short crack of noise. */
export function playVerdict() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;

  const thud = c.createOscillator();
  thud.type = "sine";
  thud.frequency.setValueAtTime(180, t);
  thud.frequency.exponentialRampToValueAtTime(52, t + 0.22);
  thud.connect(envelope(c, t, 0.3, 0.32));
  thud.start(t);
  thud.stop(t + 0.32);

  const crack = noiseSource(c, 0.07);
  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 2200;
  crack.connect(filter).connect(envelope(c, t, 0.08, 0.07));
  crack.start(t);
  crack.stop(t + 0.07);
}

/** Something broke — a small sad womp, descending. */
export function playError() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const duration = 0.55;

  const womp = c.createOscillator();
  womp.type = "sawtooth";
  womp.frequency.setValueAtTime(233, t);
  womp.frequency.exponentialRampToValueAtTime(155, t + duration);
  const gain = envelope(c, t, 0.07, duration);
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  womp.connect(filter).connect(gain);
  womp.start(t);
  womp.stop(t + duration);
}
