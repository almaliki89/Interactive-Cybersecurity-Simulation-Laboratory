/**
 * OMEGA ULTRA REALITY V1.1.1 — Deterministic Physical Connectivity Engine
 *
 * Evaluates true physical layer (L1) reachability between any two endpoints
 * in the enterprise digital twin topology (cables, keystone patch panels,
 * wall drops, switches, and active device power states).
 *
 * Consequences:
 * Disconnecting or powering down any hop along a physical path deterministicly
 * cuts physical connectivity, providing a verified gate for higher-level services.
 */

import { CableState, DigitalTwinDevice } from './digitalTwinTypes';

export interface PhysicalHop {
  fromDevice: string;
  fromPort: string;
  cableId: string;
  toDevice: string;
  toPort: string;
}

export interface PhysicalPathResult {
  available: boolean;
  sourceId: string;
  targetId: string;
  hops: PhysicalHop[];
  brokenAt?: {
    type: 'DEVICE_POWER' | 'CABLE_DISCONNECTED' | 'PORT_DOWN' | 'NO_ROUTE';
    elementId: string;
    description: string;
  };
}

export class PhysicalConnectivityEngine {
  /**
   * Determine whether a continuous, powered physical path exists between source and target devices.
   */
  public static isPhysicalPathAvailable(
    sourceId: string,
    targetId: string,
    devices: Record<string, DigitalTwinDevice>,
    cables: Record<string, CableState>
  ): boolean {
    const result = this.getPhysicalPath(sourceId, targetId, devices, cables);
    return result.available;
  }

  /**
   * Deterministically traverses the physical topology graph from source to target.
   */
  public static getPhysicalPath(
    sourceId: string,
    targetId: string,
    devices: Record<string, DigitalTwinDevice>,
    cables: Record<string, CableState>
  ): PhysicalPathResult {
    // 1. Validate source existence & power
    const sourceDev = devices[sourceId];
    if (!sourceDev) {
      return {
        available: false,
        sourceId,
        targetId,
        hops: [],
        brokenAt: {
          type: 'NO_ROUTE',
          elementId: sourceId,
          description: `Source device '${sourceId}' does not exist in inventory`,
        },
      };
    }

    if (sourceDev.powerStatus !== 'ONLINE') {
      return {
        available: false,
        sourceId,
        targetId,
        hops: [],
        brokenAt: {
          type: 'DEVICE_POWER',
          elementId: sourceId,
          description: `Source device '${sourceId}' is powered OFFLINE`,
        },
      };
    }

    // 2. Validate target existence & power
    const targetDev = devices[targetId];
    if (!targetDev) {
      return {
        available: false,
        sourceId,
        targetId,
        hops: [],
        brokenAt: {
          type: 'NO_ROUTE',
          elementId: targetId,
          description: `Target device '${targetId}' does not exist in inventory`,
        },
      };
    }

    if (targetDev.powerStatus !== 'ONLINE') {
      return {
        available: false,
        sourceId,
        targetId,
        hops: [],
        brokenAt: {
          type: 'DEVICE_POWER',
          elementId: targetId,
          description: `Target device '${targetId}' is powered OFFLINE`,
        },
      };
    }

    // Trivial case: source is target
    if (sourceId === targetId) {
      return {
        available: true,
        sourceId,
        targetId,
        hops: [],
      };
    }

    // 3. Build adjacency graph of connected cables
    // A cable connects deviceA:portA <-> deviceB:portB
    interface Edge {
      cableId: string;
      cable: CableState;
      neighborId: string;
      fromPort: string;
      toPort: string;
    }

    const adjacency: Map<string, Edge[]> = new Map();

    const addEdge = (u: string, v: string, edge: Edge) => {
      if (!adjacency.has(u)) adjacency.set(u, []);
      adjacency.get(u)!.push(edge);
    };

    Object.values(cables).forEach((cable) => {
      // Normal direction
      addEdge(cable.sourceDeviceId, cable.targetDeviceId, {
        cableId: cable.id,
        cable,
        neighborId: cable.targetDeviceId,
        fromPort: cable.sourcePort,
        toPort: cable.targetPort,
      });
      // Reverse direction
      addEdge(cable.targetDeviceId, cable.sourceDeviceId, {
        cableId: cable.id,
        cable,
        neighborId: cable.sourceDeviceId,
        fromPort: cable.targetPort,
        toPort: cable.sourcePort,
      });
    });

    // 4. Breadth-First Search (BFS) for physical traversal
    // Queue elements: { currentId: string, hops: PhysicalHop[] }
    const queue: { currentId: string; hops: PhysicalHop[] }[] = [{ currentId: sourceId, hops: [] }];
    const visited = new Set<string>([sourceId]);

    // Track reasons for failure if a path was blocked by cable disconnect or intermediate power down
    let firstBrokenReason: PhysicalPathResult['brokenAt'] | undefined;

    while (queue.length > 0) {
      const { currentId, hops } = queue.shift()!;

      if (currentId === targetId) {
        return {
          available: true,
          sourceId,
          targetId,
          hops,
        };
      }

      const edges = adjacency.get(currentId) || [];

      for (const edge of edges) {
        const nextDevId = edge.neighborId;
        const nextDev = devices[nextDevId];

        // Check cable state
        if (!edge.cable.connected || edge.cable.status === 'DISCONNECTED') {
          if (!firstBrokenReason) {
            firstBrokenReason = {
              type: 'CABLE_DISCONNECTED',
              elementId: edge.cableId,
              description: `Physical cable '${edge.cableId}' is disconnected between ${currentId} and ${nextDevId}`,
            };
          }
          continue;
        }

        // Check if intermediate device is powered (Patch panels are passive unpowered; switches/servers require power)
        if (nextDev && nextDev.category !== 'patch-panel' && nextDevId !== targetId) {
          if (nextDev.powerStatus !== 'ONLINE') {
            if (!firstBrokenReason) {
              firstBrokenReason = {
                type: 'DEVICE_POWER',
                elementId: nextDevId,
                description: `Intermediate network device '${nextDevId}' is powered OFFLINE`,
              };
            }
            continue;
          }
        }

        if (!visited.has(nextDevId)) {
          visited.add(nextDevId);
          queue.push({
            currentId: nextDevId,
            hops: [
              ...hops,
              {
                fromDevice: currentId,
                fromPort: edge.fromPort,
                cableId: edge.cableId,
                toDevice: nextDevId,
                toPort: edge.toPort,
              },
            ],
          });
        }
      }
    }

    return {
      available: false,
      sourceId,
      targetId,
      hops: [],
      brokenAt: firstBrokenReason || {
        type: 'NO_ROUTE',
        elementId: targetId,
        description: `No physical cabling path found connecting '${sourceId}' to '${targetId}'`,
      },
    };
  }
}
