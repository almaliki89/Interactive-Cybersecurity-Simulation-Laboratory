import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SimulationClock } from '../clock/SimulationClock';

describe('SimulationClock', () => {
  let clock: SimulationClock;

  beforeEach(() => {
    clock = new SimulationClock(1.0);
  });

  it('starts at virtualTime 0 in idle status', () => {
    expect(clock.getVirtualTime()).toBe(0);
    expect(clock.getStatus()).toBe('idle');
  });

  it('stepForward advances exact virtual amount regardless of playback speed', () => {
    clock.setSpeed(2.0);
    clock.stepForward(100);
    expect(clock.getVirtualTime()).toBe(100);

    clock.setSpeed(0.25);
    clock.stepForward(50);
    expect(clock.getVirtualTime()).toBe(150);
  });

  it('pausing clock prevents progression', () => {
    clock.start();
    expect(clock.getStatus()).toBe('running');
    clock.pause();
    expect(clock.getStatus()).toBe('paused');
  });

  it('reset sets virtual time to initial value and pauses', () => {
    clock.stepForward(200);
    expect(clock.getVirtualTime()).toBe(200);
    clock.reset(0);
    expect(clock.getVirtualTime()).toBe(0);
    expect(clock.getStatus()).toBe('idle');
  });

  it('seek sets virtual time to target and notifies listeners', () => {
    const listener = vi.fn();
    clock.subscribe(listener);
    clock.seek(500);
    expect(clock.getVirtualTime()).toBe(500);
    expect(listener).toHaveBeenCalledWith(500, 500);
  });
});
