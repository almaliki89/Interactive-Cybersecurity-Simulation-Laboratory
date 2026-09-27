/**
 * OMEGA ULTRA REALITY V1.1 — Workstation Desk & PC Hardware Asset
 * High-fidelity enterprise desk, mid-tower PC, mechanical keyboard, mouse, and cable drops.
 */

import * as THREE from 'three';
import { createMonitorAsset, MonitorAssetResult } from './MonitorAsset';

export interface WorkstationAssetResult {
  group: THREE.Group;
  towerMesh: THREE.Mesh;
  powerLed: THREE.Mesh;
  monitor: MonitorAssetResult;
  pcNicPosition: THREE.Vector3;
  wallDropPosition: THREE.Vector3;
}

export function createWorkstationAsset(): WorkstationAssetResult {
  const group = new THREE.Group();

  const deskWoodMat = new THREE.MeshStandardMaterial({
    color: 0x241d1d, // Premium dark walnut desk surface
    roughness: 0.65,
    metalness: 0.1,
  });

  const deskFrameMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.85,
    roughness: 0.35,
  });

  const pcCaseMat = new THREE.MeshStandardMaterial({
    color: 0x141820,
    metalness: 0.8,
    roughness: 0.4,
  });

  const pcMeshGrilleMat = new THREE.MeshStandardMaterial({
    color: 0x090b10,
    metalness: 0.9,
    roughness: 0.6,
  });

  const keyboardMat = new THREE.MeshStandardMaterial({
    color: 0x0f131a,
    metalness: 0.7,
    roughness: 0.4,
  });

  const ledGreenMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x10b981,
    emissiveIntensity: 2.2,
  });

  // 1. Desk Surface (1.8m x 0.9m x 0.05m at 0.75m height)
  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.045, 0.9), deskWoodMat);
  deskTop.position.set(0, 0.73, 0);
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;
  group.add(deskTop);

  // Cable Management Grommet Hole in Desk
  const grommetMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
  const grommet = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 16), grommetMat);
  grommet.position.set(0.15, 0.73, -0.3);
  group.add(grommet);

  // Steel Legs & Crossbar
  const legPositions = [
    [-0.8, 0.365, -0.36],
    [-0.8, 0.365, 0.36],
    [0.8, 0.365, -0.36],
    [0.8, 0.365, 0.36],
  ];
  legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.73, 0.06), deskFrameMat);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    group.add(leg);
  });

  // 2. Mid-Tower PC Case (Right side of desk)
  const towerWidth = 0.22;
  const towerHeight = 0.46;
  const towerDepth = 0.48;
  const towerX = 0.62;
  const towerY = 0.75 + towerHeight / 2 + 0.005;
  const towerZ = 0.08;

  const tower = new THREE.Mesh(new THREE.BoxGeometry(towerWidth, towerHeight, towerDepth), pcCaseMat);
  tower.position.set(towerX, towerY, towerZ);
  tower.castShadow = true;
  tower.receiveShadow = true;
  group.add(tower);

  // Front Mesh Intake Grille
  const grille = new THREE.Mesh(
    new THREE.BoxGeometry(towerWidth - 0.02, towerHeight - 0.08, 0.01),
    pcMeshGrilleMat
  );
  grille.position.set(towerX, towerY - 0.02, towerZ + towerDepth / 2 + 0.006);
  group.add(grille);

  // Power Button with glowing green ring
  const powerBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 16), deskFrameMat);
  powerBtn.rotation.x = Math.PI / 2;
  powerBtn.position.set(towerX, towerY + towerHeight / 2 - 0.03, towerZ + towerDepth / 2 + 0.006);
  group.add(powerBtn);

  const powerLed = new THREE.Mesh(new THREE.SphereGeometry(0.004, 8, 8), ledGreenMat);
  powerLed.position.set(towerX, towerY + towerHeight / 2 - 0.03, towerZ + towerDepth / 2 + 0.009);
  group.add(powerLed);

  // Front USB 3.0 Ports
  for (let u = 0; u < 2; u++) {
    const usb = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.006, 0.004), deskFrameMat);
    usb.position.set(towerX + 0.04 + u * 0.022, towerY + towerHeight / 2 - 0.03, towerZ + towerDepth / 2 + 0.006);
    group.add(usb);
  }

  // Rear RJ45 NIC Port Position on PC
  const pcNicPosition = new THREE.Vector3(towerX, towerY - 0.08, towerZ - towerDepth / 2 - 0.01);

  // 3. Monitor
  const monitor = createMonitorAsset();
  monitor.group.position.set(-0.1, 0.755, -0.05);
  group.add(monitor.group);

  // 4. Backlit Mechanical Keyboard
  const kb = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.016, 0.14), keyboardMat);
  kb.position.set(-0.1, 0.76, 0.22);
  kb.castShadow = true;
  group.add(kb);

  // 5. Mousepad & Optical Mouse
  const padMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
  const pad = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.003, 0.28), padMat);
  pad.position.set(0.28, 0.754, 0.22);
  group.add(pad);

  const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.028, 0.11), keyboardMat);
  mouse.position.set(0.28, 0.77, 0.22);
  mouse.castShadow = true;
  group.add(mouse);

  // 6. Wall Data Drop Plate on rear baseboard
  const wallPlateMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
  const wallPlate = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.01), wallPlateMat);
  wallPlate.position.set(0.62, 0.25, -0.44);
  group.add(wallPlate);

  const wallDropPosition = new THREE.Vector3(0.62, 0.25, -0.43);

  return {
    group,
    towerMesh: tower,
    powerLed,
    monitor,
    pcNicPosition,
    wallDropPosition,
  };
}
