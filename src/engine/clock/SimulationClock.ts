export type ClockStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface ClockListener {
  (deltaTimeMs: number, virtualTime: number): void;
}

export class SimulationClock {
  private status: ClockStatus = 'idle';
  private speed: number = 1.0;
  private virtualTimeMs: number = 0;
  private lastRealTimeMs: number = 0;
  private animFrameId: number | null = null;
  private listeners: Set<ClockListener> = new Set();

  constructor(initialSpeed = 1.0) {
    this.speed = initialSpeed;
  }

  public getStatus(): ClockStatus {
    return this.status;
  }

  public getSpeed(): number {
    return this.speed;
  }

  public getVirtualTime(): number {
    return this.virtualTimeMs;
  }

  public setSpeed(newSpeed: number) {
    this.speed = Math.max(0.1, Math.min(newSpeed, 10.0));
  }

  public subscribe(listener: ClockListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public start() {
    if (this.status === 'running') return;
    this.status = 'running';
    this.lastRealTimeMs = performance.now();
    this.loop();
  }

  public pause() {
    this.status = 'paused';
    if (this.animFrameId !== null) {
      if (typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(this.animFrameId);
      } else {
        clearTimeout(this.animFrameId);
      }
      this.animFrameId = null;
    }
  }

  public resume() {
    if (this.status === 'paused' || this.status === 'idle') {
      this.status = 'running';
      this.lastRealTimeMs = performance.now();
      this.loop();
    }
  }

  public reset(initialTime = 0) {
    this.pause();
    this.status = 'idle';
    this.virtualTimeMs = initialTime;
    this.notify(0, this.virtualTimeMs);
  }

  /**
   * Advances clock by exact virtual time stepMs regardless of current playback speed.
   * Playback speed multiplier (speed) affects continuous clock progression loops only.
   */
  public stepForward(stepMs: number = 100) {
    if (this.status === 'running') {
      this.pause();
    }
    const delta = stepMs;
    this.virtualTimeMs += delta;
    this.notify(delta, this.virtualTimeMs);
  }

  public seek(targetVirtualTimeMs: number) {
    const delta = targetVirtualTimeMs - this.virtualTimeMs;
    this.virtualTimeMs = Math.max(0, targetVirtualTimeMs);
    this.notify(delta, this.virtualTimeMs);
  }

  private loop = () => {
    if (this.status !== 'running') return;

    const now = performance.now();
    const realDelta = now - this.lastRealTimeMs;
    this.lastRealTimeMs = now;

    // Cap frame delta to prevent huge jumps when tab was inactive
    const clampedDelta = Math.min(realDelta, 100);
    const virtualDelta = clampedDelta * this.speed;
    this.virtualTimeMs += virtualDelta;

    this.notify(virtualDelta, this.virtualTimeMs);

    if (typeof requestAnimationFrame !== 'undefined') {
      this.animFrameId = requestAnimationFrame(this.loop);
    } else {
      this.animFrameId = setTimeout(this.loop, 16) as unknown as number;
    }
  };

  private notify(delta: number, vTime: number) {
    this.listeners.forEach((listener) => {
      try {
        listener(delta, vTime);
      } catch (err) {
        console.error('SimulationClock listener error:', err);
      }
    });
  }

  public destroy() {
    this.pause();
    this.listeners.clear();
  }
}
