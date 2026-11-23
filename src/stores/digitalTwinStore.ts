import { create } from 'zustand';
import {
  advanceDigitalTwinMinute,
  blockDigitalTwinEgress,
  createInitialDigitalTwinWorld,
  inspectDigitalTwinNode,
  isolateDigitalTwinEndpoint,
  resolveDigitalTwinIncident,
  type DigitalTwinWorldState,
} from '../engine/digitalTwin/DigitalTwinEngine';

const STORAGE_KEY = 'zorg-digital-twin-world-v1';

function restoreWorld(): DigitalTwinWorldState {
  if (typeof window === 'undefined') return createInitialDigitalTwinWorld();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialDigitalTwinWorld();
    const parsed = JSON.parse(raw) as DigitalTwinWorldState;
    if (
      parsed?.schemaVersion !== 1 ||
      parsed?.scenarioId !== 'nexora-incident-01' ||
      !Array.isArray(parsed.nodes) ||
      !Array.isArray(parsed.connections) ||
      !Array.isArray(parsed.events) ||
      !parsed.progress
    ) {
      return createInitialDigitalTwinWorld();
    }
    return parsed;
  } catch {
    return createInitialDigitalTwinWorld();
  }
}

function persistWorld(world: DigitalTwinWorldState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(world));
  } catch {
    // The simulator remains usable when browser storage is unavailable.
  }
}

interface DigitalTwinStore {
  world: DigitalTwinWorldState;
  inspectNode: (nodeId: string) => void;
  isolateEndpoint: () => void;
  blockSuspiciousEgress: () => void;
  advanceMinute: () => void;
  resolveIncident: () => void;
  resetWorld: () => void;
}

export const useDigitalTwinStore = create<DigitalTwinStore>((set, get) => ({
  world: restoreWorld(),
  inspectNode: (nodeId) => {
    const world = inspectDigitalTwinNode(get().world, nodeId);
    persistWorld(world);
    set({ world });
  },
  isolateEndpoint: () => {
    const world = isolateDigitalTwinEndpoint(get().world);
    persistWorld(world);
    set({ world });
  },
  blockSuspiciousEgress: () => {
    const world = blockDigitalTwinEgress(get().world);
    persistWorld(world);
    set({ world });
  },
  advanceMinute: () => {
    const world = advanceDigitalTwinMinute(get().world);
    persistWorld(world);
    set({ world });
  },
  resolveIncident: () => {
    const world = resolveDigitalTwinIncident(get().world);
    persistWorld(world);
    set({ world });
  },
  resetWorld: () => {
    const world = createInitialDigitalTwinWorld();
    persistWorld(world);
    set({ world });
  },
}));
