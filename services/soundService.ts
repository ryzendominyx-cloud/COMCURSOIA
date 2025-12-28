
class SoundService {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1) {
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playClick() {
    this.playTone(400, 'sine', 0.1, 0.05);
  }

  playCorrect() {
    this.playTone(600, 'sine', 0.1, 0.1);
    setTimeout(() => this.playTone(800, 'sine', 0.2, 0.1), 50);
  }

  playIncorrect() {
    this.playTone(200, 'triangle', 0.3, 0.1);
  }

  playXpTick(pitch: number = 400) {
    this.playTone(pitch, 'sine', 0.05, 0.03);
  }

  playLevelUp() {
    const tones = [440, 554, 659, 880];
    tones.forEach((t, i) => {
      setTimeout(() => this.playTone(t, 'square', 0.4, 0.05), i * 100);
    });
  }

  playSuccess() {
    this.playTone(523.25, 'sine', 0.1, 0.1);
    setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.1), 100);
    setTimeout(() => this.playTone(783.99, 'sine', 0.3, 0.1), 200);
  }
}

export const soundService = new SoundService();
