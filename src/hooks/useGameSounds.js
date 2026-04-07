import { useCallback } from 'react';

/**
 * useGameSounds — Web Audio API hook that produces retro / casino-style
 * game sounds entirely via synthesis (no external audio files).
 *
 * Uses a module-level AudioContext singleton so it persists across
 * component mounts and can be unlocked by any user interaction.
 */

// ── Module-level singleton ──────────────────────────────────
let _audioCtx = null;
let _unlocked = false;

function getOrCreateCtx() {
  if (!_audioCtx || _audioCtx.state === 'closed') {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _audioCtx;
}

// Resume the AudioContext — returns true if it's running
export function unlockAudio() {
  const ctx = getOrCreateCtx();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  _unlocked = true;
  return ctx.state === 'running';
}

// Auto-unlock on first user interaction anywhere in the document
if (typeof document !== 'undefined') {
  const events = ['click', 'touchstart', 'keydown'];
  const handler = () => {
    unlockAudio();
    events.forEach(e => document.removeEventListener(e, handler, true));
  };
  events.forEach(e => document.addEventListener(e, handler, { capture: true, passive: true }));
}

export default function useGameSounds() {
  const getCtx = useCallback(() => {
    const ctx = getOrCreateCtx();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }, []);

  // ---- helpers ----
  const createOsc = (ctx, type, freq, startTime, duration, gainValue = 0.15) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(gainValue, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  // ---- sound generators ----

  const playClick = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      createOsc(ctx, 'sine', 800, t, 0.06, 0.12);
      createOsc(ctx, 'sine', 1200, t + 0.02, 0.04, 0.08);
    } catch { /* audio not available */ }
  }, [getCtx]);

  const playNav = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      createOsc(ctx, 'sine', 523, t, 0.08, 0.1);
      createOsc(ctx, 'sine', 659, t + 0.06, 0.08, 0.1);
      createOsc(ctx, 'sine', 784, t + 0.12, 0.1, 0.08);
    } catch { /* */ }
  }, [getCtx]);

  const playSuccess = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        createOsc(ctx, 'sine', freq, t + i * 0.1, 0.18, 0.12);
        createOsc(ctx, 'triangle', freq * 2, t + i * 0.1, 0.12, 0.04);
      });
    } catch { /* */ }
  }, [getCtx]);

  const playLoginLong = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      // A triumphant ascending fanfare ≈2s
      const melody = [
        { f: 392, d: 0.2, dt: 0 },      // G4
        { f: 440, d: 0.15, dt: 0.18 },   // A4
        { f: 523, d: 0.2, dt: 0.32 },    // C5
        { f: 587, d: 0.15, dt: 0.50 },   // D5
        { f: 659, d: 0.25, dt: 0.64 },   // E5
        { f: 784, d: 0.3, dt: 0.88 },    // G5
        { f: 880, d: 0.2, dt: 1.15 },    // A5
        { f: 1047, d: 0.5, dt: 1.35 },   // C6 (final long note)
      ];
      melody.forEach(({ f, d, dt }) => {
        createOsc(ctx, 'sine', f, t + dt, d, 0.13);
        createOsc(ctx, 'triangle', f * 0.5, t + dt, d * 0.8, 0.06);
      });
      // Sparkling shimmer on top
      for (let i = 0; i < 6; i++) {
        const shimmerFreq = 2000 + Math.random() * 2000;
        createOsc(ctx, 'sine', shimmerFreq, t + 0.8 + i * 0.15, 0.12, 0.03);
      }
    } catch { /* */ }
  }, [getCtx]);

  const playFirework = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      // Whoosh up
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.15);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);

      // Crackle burst
      const bufferSize = ctx.sampleRate * 0.25;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
      }
      const noise = ctx.createBufferSource();
      const noiseGain = ctx.createGain();
      noise.buffer = buffer;
      noiseGain.gain.setValueAtTime(0.12, t + 0.15);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      noise.connect(noiseGain).connect(ctx.destination);
      noise.start(t + 0.15);
    } catch { /* */ }
  }, [getCtx]);

  const playError = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      createOsc(ctx, 'square', 200, t, 0.15, 0.08);
      createOsc(ctx, 'square', 150, t + 0.12, 0.2, 0.08);
    } catch { /* */ }
  }, [getCtx]);

  const playCoin = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      createOsc(ctx, 'sine', 988, t, 0.08, 0.15);
      createOsc(ctx, 'sine', 1319, t + 0.07, 0.12, 0.12);
      createOsc(ctx, 'triangle', 1568, t + 0.14, 0.18, 0.06);
    } catch { /* */ }
  }, [getCtx]);

  const playSwoosh = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.18;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const d = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        d[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const src = ctx.createBufferSource();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3000, t);
      filter.frequency.exponentialRampToValueAtTime(600, t + 0.18);
      src.buffer = buffer;
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      src.connect(filter).connect(gain).connect(ctx.destination);
      src.start(t);
    } catch { /* */ }
  }, [getCtx]);

  const playElegant = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      // Soft, elegant chime — ascending thirds with reverb-like tail
      const notes = [
        { f: 523, dt: 0, d: 0.6 },   // C5
        { f: 659, dt: 0.25, d: 0.5 }, // E5
        { f: 784, dt: 0.5, d: 0.5 },  // G5
        { f: 1047, dt: 0.8, d: 0.8 }, // C6
      ];
      notes.forEach(({ f, dt, d }) => {
        createOsc(ctx, 'sine', f, t + dt, d, 0.09);
        createOsc(ctx, 'triangle', f * 2, t + dt + 0.05, d * 0.6, 0.025);
      });
      // Shimmer pad
      createOsc(ctx, 'sine', 1568, t + 1.1, 1.2, 0.02);
      createOsc(ctx, 'sine', 2093, t + 1.2, 1.0, 0.015);
    } catch { /* */ }
  }, [getCtx]);

  const playWhoosh = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      // Quick whoosh — filtered noise burst
      const bufferSize = ctx.sampleRate * 0.22;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const d = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
      }
      const src = ctx.createBufferSource();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(4000, t);
      filter.frequency.exponentialRampToValueAtTime(400, t + 0.2);
      filter.Q.setValueAtTime(1.5, t);
      src.buffer = buffer;
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      src.connect(filter).connect(gain).connect(ctx.destination);
      src.start(t);
      // Subtle tonal accent
      createOsc(ctx, 'sine', 600 + Math.random() * 400, t, 0.12, 0.06);
    } catch { /* */ }
  }, [getCtx]);

  const playBell = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      // Bright bell / chime — single strike with harmonics
      const fundamentals = [1047, 1319, 1568]; // C6, E6, G6
      fundamentals.forEach((f, i) => {
        createOsc(ctx, 'sine', f, t + i * 0.08, 1.0, 0.1);
        createOsc(ctx, 'sine', f * 2, t + i * 0.08, 0.6, 0.03);
        createOsc(ctx, 'sine', f * 3, t + i * 0.08, 0.3, 0.01);
      });
      // Metallic shimmer
      createOsc(ctx, 'triangle', 3136, t + 0.2, 0.8, 0.02);
    } catch { /* */ }
  }, [getCtx]);

  return {
    playClick,
    playNav,
    playSuccess,
    playLoginLong,
    playFirework,
    playError,
    playCoin,
    playSwoosh,
    playElegant,
    playWhoosh,
    playBell,
  };
}
