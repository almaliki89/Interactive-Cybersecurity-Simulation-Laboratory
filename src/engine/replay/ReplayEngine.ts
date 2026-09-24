export interface StateSnapshot<TState = any> {
  virtualTime: number;
  timestamp: number;
  state: TState;
  triggerEventId?: string;
}

export class ReplayEngine<TState = any> {
  private snapshots: StateSnapshot<TState>[] = [];
  private maxSnapshots = 100;

  public recordSnapshot(virtualTime: number, state: TState, triggerEventId?: string): void {
    // Deep clone state to prevent reference mutation
    const stateCopy = JSON.parse(JSON.stringify(state));
    this.snapshots.push({
      virtualTime,
      timestamp: Date.now(),
      state: stateCopy,
      triggerEventId,
    });

    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }
  }

  public getSnapshotClosestTo(virtualTime: number): StateSnapshot<TState> | undefined {
    if (this.snapshots.length === 0) return undefined;

    let closest = this.snapshots[0];
    for (const snap of this.snapshots) {
      if (snap.virtualTime <= virtualTime) {
        closest = snap;
      } else {
        break;
      }
    }
    return closest;
  }

  public getAllSnapshots(): StateSnapshot<TState>[] {
    return [...this.snapshots];
  }

  public clear(): void {
    this.snapshots = [];
  }
}
