// ==========================================
// 電競戰術 Web Audio 音效引擎 (Zero Dependency)
// ==========================================
const SoundSystem = (function () {
  let ctx = null;
  let isMuted = localStorage.getItem('rivals_audio_muted') === 'true';

  function init() {
    if (!ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        ctx = new AudioContext();
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  function playTone(freq, type, duration, gainVal = 0.15) {
    if (isMuted) return;
    try {
      init();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  return {
    init,
    toggleMute() {
      isMuted = !isMuted;
      localStorage.setItem('rivals_audio_muted', isMuted);
      return isMuted;
    },
    isMuted() {
      return isMuted;
    },
    // 按鈕戰術短音
    click() {
      playTone(800, 'sine', 0.05, 0.08);
    },
    // 加入購物車 (清脆科技雙音)
    addToCart() {
      if (isMuted) return;
      init();
      playTone(523.25, 'triangle', 0.08, 0.12);
      setTimeout(() => playTone(783.99, 'sine', 0.12, 0.1), 60);
    },
    // 數量增減
    qty() {
      playTone(600, 'sine', 0.04, 0.06);
    },
    // 移除商品
    remove() {
      playTone(280, 'sawtooth', 0.08, 0.05);
    },
    // 下單成功 (勝利大調和弦)
    success() {
      if (isMuted) return;
      init();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => playTone(freq, 'triangle', 0.35, 0.15), idx * 80);
      });
    }
  };
})();

window.SoundSystem = SoundSystem;
