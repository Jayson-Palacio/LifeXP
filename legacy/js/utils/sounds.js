// ============================================
// AUDIO SYSTEM (Web Audio API)
// ============================================

const AudioContext = window.AudioContext || window.webkitAudioContext;
let ctx;

function initAudio() {
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch(e) {
      console.warn("AudioContext not supported");
      return;
    }
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
}

// Ensure audio context is started on first user interaction
document.addEventListener('click', initAudio, { once: true });
document.addEventListener('touchstart', initAudio, { once: true });

function playTone(freq, type, duration, vol=0.1) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + duration + 0.1);
}

export function playClick() {
  initAudio();
  playTone(400, 'sine', 0.1, 0.05);
}

export function playSuccess() {
  initAudio();
  playTone(523.25, 'sine', 0.1, 0.1); // C5
  setTimeout(() => playTone(659.25, 'sine', 0.2, 0.1), 100); // E5
  setTimeout(() => playTone(783.99, 'sine', 0.3, 0.1), 200); // G5
}

export function playCoin() {
  initAudio();
  playTone(987.77, 'sine', 0.1, 0.1); // B5
  setTimeout(() => playTone(1318.51, 'sine', 0.3, 0.1), 100); // E6
}

export function playLevelUp() {
  initAudio();
  // Triumphant arpeggio
  const notes = [
    { freq: 440.00, time: 0 },    // A4
    { freq: 554.37, time: 150 },  // C#5
    { freq: 659.25, time: 300 },  // E5
    { freq: 880.00, time: 450 },  // A5
    { freq: 880.00, time: 600 },  // A5
    { freq: 1108.73, time: 700 }  // C#6
  ];
  
  notes.forEach(note => {
    setTimeout(() => playTone(note.freq, 'square', 0.4, 0.05), note.time);
  });
}
