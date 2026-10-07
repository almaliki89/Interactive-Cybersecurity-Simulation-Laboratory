/**
 * OMEGA ULTRA REALITY — Sound & Sensory Reality Engine
 * Pure client-side Web Audio API synthesizer for authentic physical & operational cybersecurity immersion.
 * Generates server rack acoustics, mechanical keyboard clicks, RJ45 relay snaps, and BIOS POST beeps.
 * Zero external audio assets, zero latency, zero bandwidth.
 */

class SoundRealityEngine {
  private ctx: AudioContext | null = null;
  private fanGain: GainNode | null = null;
  private fanSource: AudioBufferSourceNode | null = null;
  private isMuted: boolean = true;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Initializes or toggles ambient server room ventilation & fan hum.
   */
  public setAmbientMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      if (this.fanGain) {
        this.fanGain.gain.setTargetAtTime(0, this.ctx?.currentTime || 0, 0.1);
      }
    } else {
      this.startFanHum();
    }
  }

  private startFanHum(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    if (!this.fanGain) {
      this.fanGain = ctx.createGain();
      this.fanGain.gain.setValueAtTime(0, ctx.currentTime);
      this.fanGain.connect(ctx.destination);
    }

    // Generate 4 seconds of looping pink/server room airflow noise
    if (!this.fanSource) {
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      this.fanSource = ctx.createBufferSource();
      this.fanSource.buffer = buffer;
      this.fanSource.loop = true;

      // Lowpass filter to simulate cold-aisle air circulation
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(220, ctx.currentTime);
      lowpass.Q.setValueAtTime(1.5, ctx.currentTime);

      // Subtle 120Hz motor harmonic oscillator
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.015, ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(this.fanGain);
      osc.start();

      this.fanSource.connect(lowpass);
      lowpass.connect(this.fanGain);
      this.fanSource.start();
    }

    if (!this.isMuted) {
      this.fanGain.gain.setTargetAtTime(0.12, ctx.currentTime, 0.4);
    }
  }

  /**
   * Synthesizes mechanical keyboard switch clack (Cherry MX Blue / tactile).
   */
  public playKeyClick(type: 'clack' | 'enter' | 'space' = 'clack'): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    filter.type = 'bandpass';

    if (type === 'enter') {
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.04);
      filter.frequency.setValueAtTime(1200, t);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    } else if (type === 'space') {
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.035);
      filter.frequency.setValueAtTime(900, t);
      gain.gain.setValueAtTime(0.035, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    } else {
      // High-speed keypress
      const freq = 650 + Math.random() * 200;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.025);
      filter.frequency.setValueAtTime(2400, t);
      gain.gain.setValueAtTime(0.025, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  /**
   * Synthesizes an authentic RJ45 Ethernet latch snap click.
   */
  public playCableSnap(connected: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'square';
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1800, t);

    osc.frequency.setValueAtTime(connected ? 1400 : 900, t);
    osc.frequency.exponentialRampToValueAtTime(connected ? 300 : 200, t + 0.035);

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  /**
   * Synthesizes Windows User Account Control / Access Denied chime.
   */
  public playErrorDing(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, t); // D5
    osc.frequency.setValueAtTime(440.0, t + 0.08); // A4

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  /**
   * Synthesizes BIOS POST single beep.
   */
  public playPostBeep(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, t);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  /**
   * Synthesizes authentic Windows multi-note logon chord chime.
   */
  public playLogonChime(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const notes = [
      { freq: 261.63, delay: 0.0, dur: 1.2, gain: 0.06 },   // C4
      { freq: 392.00, delay: 0.12, dur: 1.1, gain: 0.06 },  // G4
      { freq: 523.25, delay: 0.24, dur: 1.4, gain: 0.07 },  // C5
      { freq: 659.25, delay: 0.38, dur: 1.6, gain: 0.08 },  // E5
    ];

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, t + note.delay);

      gain.gain.setValueAtTime(0, t + note.delay);
      gain.gain.linearRampToValueAtTime(note.gain, t + note.delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + note.delay + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t + note.delay);
      osc.stop(t + note.delay + note.dur + 0.05);
    }
  }

  /**
   * Synthesizes a clean enterprise system notification chime.
   */
  public playNotification(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(880, t); // A5
    osc1.frequency.setValueAtTime(1318.51, t + 0.08); // E6
    osc2.frequency.setValueAtTime(1760, t + 0.08);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(t);
    osc2.start(t + 0.08);
    osc1.stop(t + 0.36);
    osc2.stop(t + 0.36);
  }

  /**
   * Synthesizes subtle SAS/SATA magnetic head arm seek activity.
   */
  public playDiskSeek(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const clickTime = t + i * 0.025 + Math.random() * 0.01;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'square';
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400 + Math.random() * 800, clickTime);

      gain.gain.setValueAtTime(0.02, clickTime);
      gain.gain.exponentialRampToValueAtTime(0.0005, clickTime + 0.012);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(clickTime);
      osc.stop(clickTime + 0.015);
    }
  }
}

export const globalSoundRealityEngine = new SoundRealityEngine();
