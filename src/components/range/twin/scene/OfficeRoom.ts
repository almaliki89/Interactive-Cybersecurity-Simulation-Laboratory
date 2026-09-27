/**
 * OMEGA ULTRA REALITY V1.1 — Finance Department Office Room Environment
 * Corporate flooring, executive desk, workstation PC, 32" dynamic monitor, and network drops.
 */

import * as THREE from 'three';
import { createWorkstationAsset, WorkstationAssetResult } from '../assets/WorkstationAsset';
import { LedRegistration } from '../network/LinkStateVisualizer';

export interface OfficeRoomResult {
  group: THREE.Group;
  workstation: WorkstationAssetResult;
  interactiveObjects: THREE.Object3D[];
  ledRegistry: Map<string, LedRegistration[]>;
  anchorPositions: Map<string, THREE.Vector3>;
}

export function createOfficeRoom(): OfficeRoomResult {
  const group = new THREE.Group();
  group.name = 'OfficeSector';

  const interactiveObjects: THREE.Object3D[] = [];
  const ledRegistry = new Map<string, LedRegistration[]>();
  const anchorPositions = new Map<string, THREE.Vector3>();

  // 1. Office Carpet Floor (Zone-B)
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.88,
    metalness: 0.08,
  });

  const floor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 8), floorMat);
  floor.position.set(4.0, -0.1, 0);
  floor.receiveShadow = true;
  group.add(floor);

  // Baseboard trim along walls
  const baseboardMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
  const baseboard = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.1, 0.02), baseboardMat);
  baseboard.position.set(4.0, 0.05, -3.89);
  group.add(baseboard);

  // 2. Workstation Furniture & Hardware (FIN-WS01)
  const workstation = createWorkstationAsset();
  const wsOffset = new THREE.Vector3(4.2, 0, 0);
  workstation.group.position.copy(wsOffset);

  // Register interactive device for FIN-WS01
  workstation.group.userData = { isDevice: true, deviceId: 'FIN-WS01' };
  workstation.group.traverse((child) => {
    child.userData = { isDevice: true, deviceId: 'FIN-WS01' };
    if (child instanceof THREE.Mesh) {
      interactiveObjects.push(child);
    }
  });

  group.add(workstation.group);

  // Register LEDs
  ledRegistry.set('FIN-WS01', [
    { mesh: workstation.powerLed, type: 'power' },
    { mesh: workstation.monitor.powerLed, type: 'power' },
  ]);

  // Register Network Anchor Positions
  const nicWorld = workstation.pcNicPosition.clone().add(wsOffset);
  const wallDropWorld = workstation.wallDropPosition.clone().add(wsOffset);

  anchorPositions.set('FIN-WS01:NIC1', nicWorld);
  anchorPositions.set('FIN-WS01', nicWorld);
  anchorPositions.set('Office Wall Drop Zone-B #24', wallDropWorld);

  return {
    group,
    workstation,
    interactiveObjects,
    ledRegistry,
    anchorPositions,
  };
}
