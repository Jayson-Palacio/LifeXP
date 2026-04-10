"use client";

// Simple Web Audio API Synthesizer designed for LifeXP Celebration Moments
let audioCtx = null;

function getContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Chime Rise — two-note sine ascending (bright, celebratory)
function playChimeRise(ctx, time) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc2.type = 'sine';
  
  // Note 1: E5
  osc1.frequency.setValueAtTime(659.25, time);
  // Note 2: B5
  osc2.frequency.setValueAtTime(987.77, time + 0.15);

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.3, time + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(time);
  osc1.stop(time + 0.5);
  osc2.start(time + 0.15);
  osc2.stop(time + 0.5);
}

// 2. Power Pulse — square wave chromatic rise (bold, satisfying)
function playPowerPulse(ctx, time) {
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'square';
  filter.type = 'lowpass';
  
  // Sweep frequency
  osc.frequency.setValueAtTime(220, time);
  osc.frequency.exponentialRampToValueAtTime(880, time + 0.3);

  // Filter sweep
  filter.frequency.setValueAtTime(500, time);
  filter.frequency.exponentialRampToValueAtTime(3000, time + 0.3);

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.2, time + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.4);
}

// 3. Sparkle Fall — fast pentatonic sine cascade (playful)
function playSparkleFall(ctx, time) {
  const notes = [1046.50, 932.33, 783.99, 698.46, 523.25]; // C6, Bb5, G5, F5, C5
  
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const noteTime = time + (idx * 0.06);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteTime);

    gain.gain.setValueAtTime(0, noteTime);
    gain.gain.linearRampToValueAtTime(0.15, noteTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.2);
  });
}

// 4. Coin Ping — high sine with warm decay (clean, classic)
function playCoinPing(ctx, time) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  
  // Quick frequency drop for ping transient
  osc.frequency.setValueAtTime(1200, time);
  osc.frequency.exponentialRampToValueAtTime(987.77, time + 0.05); // Drops to B5

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.3, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.6);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.6);
}

// 5. Soft Bloom — layered sine chord swell (peaceful, proud)
function playSoftBloom(ctx, time) {
  const chord = [392.00, 493.88, 587.33]; // G4, B4, D5 (G Major chord)
  
  chord.forEach(freq => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.15, time + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 1.0);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 1.0);
  });
}

// Epic Orchestral Swell for Tier-Up
export function playTierUpSwell() {
  const ctx = getContext();
  if (!ctx) return;
  const time = ctx.currentTime;
  
  // A vast C Major 7 chord building up
  const chord = [261.63, 329.63, 392.00, 493.88, 523.25]; // C4, E4, G4, B4, C5
  
  chord.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Use triangle for a slightly richer horn/string hybrid tone
    osc.type = 'triangle'; 
    osc.frequency.setValueAtTime(freq, time);

    // Filter to make it swell from muffled to bright
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, time);
    filter.frequency.exponentialRampToValueAtTime(2000, time + 1.5);

    gain.gain.setValueAtTime(0, time);
    // Swell up slowly
    gain.gain.linearRampToValueAtTime(0.12, time + 1.5);
    // Hold and decay
    gain.gain.exponentialRampToValueAtTime(0.01, time + 3.5);

    // slight detune for richness
    osc.detune.setValueAtTime(Math.random() * 10 - 5, time); 

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 3.5);
  });
}

// Randomizer for standard completions
export function playRandomSuccessSound() {
  const ctx = getContext();
  if (!ctx) return;

  const time = ctx.currentTime;
  const roll = Math.floor(Math.random() * 5);

  switch (roll) {
    case 0: playChimeRise(ctx, time); break;
    case 1: playPowerPulse(ctx, time); break;
    case 2: playSparkleFall(ctx, time); break;
    case 3: playCoinPing(ctx, time); break;
    case 4: playSoftBloom(ctx, time); break;
  }
}
