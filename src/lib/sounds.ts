let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// --- Mute state ---

const MUTE_KEY = "kalima_sound_muted";

function loadMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(MUTE_KEY) === "true";
  } catch {
    return false;
  }
}

let _muted: boolean | null = null;

function getMuted(): boolean {
  if (_muted === null) {
    _muted = loadMuted();
  }
  return _muted;
}

export function isMuted(): boolean {
  return getMuted();
}

export function toggleMute(): boolean {
  _muted = !getMuted();
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(MUTE_KEY, String(_muted));
    } catch {
      // silent fail
    }
  }
  return _muted;
}

// --- Helper to create an oscillator + gain pair ---

function makeOsc(
  ctx: AudioContext,
  type: OscillatorType,
  freq: number,
  gainVal: number,
  startTime: number
): { osc: OscillatorNode; gain: GainNode } {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(gainVal, startTime);
  return { osc, gain };
}

// --- Sound functions ---

/** Short click/pop for tile and key taps */
export function playTap() {
  if (getMuted()) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    const { osc, gain } = makeOsc(ctx, "sine", 600, 0.15, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.start(t);
    osc.stop(t + 0.08);
  } catch {
    /* silent fail */
  }
}

/** Satisfying ascending chime for correct placement */
export function playCorrect() {
  if (getMuted()) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    const notes = [523, 659, 784]; // C5, E5, G5
    const delays = [0, 0.08, 0.16];
    notes.forEach((freq, i) => {
      const start = t + delays[i];
      const { osc, gain } = makeOsc(ctx, "triangle", freq, 0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
      osc.start(start);
      osc.stop(start + 0.15);
    });
  } catch {
    /* silent fail */
  }
}

/** Low buzz/thud for wrong answer */
export function playWrong() {
  if (getMuted()) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    // Low thud
    const { osc: o1, gain: g1 } = makeOsc(ctx, "sine", 150, 0.2, t);
    o1.frequency.exponentialRampToValueAtTime(80, t + 0.2);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    o1.start(t);
    o1.stop(t + 0.25);
    // Subtle buzz layer
    const { osc: o2, gain: g2 } = makeOsc(ctx, "triangle", 110, 0.08, t);
    o2.frequency.exponentialRampToValueAtTime(70, t + 0.18);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o2.start(t);
    o2.stop(t + 0.2);
  } catch {
    /* silent fail */
  }
}

/** Celebration fanfare -- ascending notes */
export function playWin() {
  if (getMuted()) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    // C5 E5 G5 C6 -- major arpeggio
    const notes = [523, 659, 784, 1047];
    const delays = [0, 0.1, 0.2, 0.3];
    const durations = [0.15, 0.15, 0.15, 0.3];
    notes.forEach((freq, i) => {
      const start = t + delays[i];
      const dur = durations[i];
      // Main tone
      const { osc, gain } = makeOsc(ctx, "triangle", freq, 0.16, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.start(start);
      osc.stop(start + dur);
      // Soft harmonic
      const { osc: h, gain: hg } = makeOsc(ctx, "sine", freq * 2, 0.04, start);
      hg.gain.exponentialRampToValueAtTime(0.001, start + dur * 0.8);
      h.start(start);
      h.stop(start + dur);
    });
  } catch {
    /* silent fail */
  }
}

/** Swoosh sound for waffle tile swaps */
export function playSwap() {
  if (getMuted()) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    // Rising swoosh
    const { osc, gain } = makeOsc(ctx, "sine", 300, 0.12, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.start(t);
    osc.stop(t + 0.2);
    // Noise-like layer via detuned oscillator
    const { osc: o2, gain: g2 } = makeOsc(ctx, "triangle", 600, 0.05, t);
    o2.frequency.exponentialRampToValueAtTime(1200, t + 0.08);
    o2.frequency.exponentialRampToValueAtTime(500, t + 0.15);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o2.start(t);
    o2.stop(t + 0.18);
  } catch {
    /* silent fail */
  }
}

/** Short backspace/delete sound */
export function playDelete() {
  if (getMuted()) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    const { osc, gain } = makeOsc(ctx, "sine", 500, 0.1, t);
    osc.frequency.exponentialRampToValueAtTime(250, t + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.start(t);
    osc.stop(t + 0.08);
  } catch {
    /* silent fail */
  }
}

/** Quick flip sound for tile reveals */
export function playFlip() {
  if (getMuted()) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    const { osc, gain } = makeOsc(ctx, "sine", 800, 0.1, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.04);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.start(t);
    osc.stop(t + 0.12);
  } catch {
    /* silent fail */
  }
}
