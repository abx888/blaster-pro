import confetti from 'canvas-confetti';

export function fireConfetti() {
  const colors = ['#7c3aed', '#ec4899', '#06b6d4', '#fbbf24'];
  const end = Date.now() + 3000;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

// Sound effects using Web Audio API — reuse single context
type SoundType = 'chime' | 'pop' | 'coin' | 'none';

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSound(type: SoundType) {
  if (type === 'none') return;

  try {
    const ctx = getAudioCtx();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    if (type === 'chime') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1174, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'pop') {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'coin') {
      const osc1 = ctx.createOscillator();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(988, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc1.connect(gain);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.1);

      setTimeout(() => {
        try {
          const ctx2 = getAudioCtx();
          const g2 = ctx2.createGain();
          g2.connect(ctx2.destination);
          const osc2 = ctx2.createOscillator();
          osc2.type = 'square';
          osc2.frequency.setValueAtTime(1318, ctx2.currentTime);
          g2.gain.setValueAtTime(0.2, ctx2.currentTime);
          g2.gain.exponentialRampToValueAtTime(0.01, ctx2.currentTime + 0.2);
          osc2.connect(g2);
          osc2.start();
          osc2.stop(ctx2.currentTime + 0.2);
        } catch { /* audio not available */ }
      }, 100);
    }
  } catch { /* audio not available */ }
}
