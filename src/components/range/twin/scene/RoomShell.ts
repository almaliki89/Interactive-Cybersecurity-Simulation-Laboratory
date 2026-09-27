/**
 * OMEGA ULTRA REALITY V1.1 — Architectural Room Shell
 * Realistic raised floor tiles, drop ceiling grid, overhead cable ladder trays, signage, and environmental sensors.
 */

import * as THREE from 'three';

export function createRoomShell(scene: THREE.Scene): THREE.Group {
  const roomGroup = new THREE.Group();
  scene.add(roomGroup);

  // 1. Materials
  const serverFloorMat = new THREE.MeshStandardMaterial({
    color: 0x0c1017,
    roughness: 0.35,
    metalness: 0.25,
  });

  const officeFloorMat = new THREE.MeshStandardMaterial({
    color: 0x151c28,
    roughness: 0.85,
    metalness: 0.08,
  });

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x090d14,
    roughness: 0.9,
    metalness: 0.05,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x93c5fd,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.85,
    transparent: true,
    opacity: 0.35,
  });

  const cableTrayMat = new THREE.MeshStandardMaterial({
    color: 0xca8a04, // Enterprise yellow powder-coat cable basket
    metalness: 0.7,
    roughness: 0.4,
  });

  const aluminumTrimMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.9,
    roughness: 0.3,
  });

  // 2. Floors
  // Server room raised floor with perforated tiles
  const serverFloor = new THREE.Mesh(new THREE.BoxGeometry(7, 0.2, 8), serverFloorMat);
  serverFloor.position.set(-3.5, -0.1, 0);
  serverFloor.receiveShadow = true;
  roomGroup.add(serverFloor);

  // Perforated cold-aisle intake tile in front of RACK-01
  const perforatedTile = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.01, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.5 })
  );
  perforatedTile.position.set(-3.5, 0.005, 1.2);
  roomGroup.add(perforatedTile);

  // Office carpet floor
  const officeFloor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 8), officeFloorMat);
  officeFloor.position.set(4.0, -0.1, 0);
  officeFloor.receiveShadow = true;
  roomGroup.add(officeFloor);

  // 3. Walls
  // Back Wall
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(16, 4.5, 0.2), wallMat);
  backWall.position.set(0.5, 2.15, -4.0);
  backWall.receiveShadow = true;
  roomGroup.add(backWall);

  // Divider Wall between Server Room & Office
  const dividerWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.5, 8), wallMat);
  dividerWall.position.set(0, 2.15, 0);
  dividerWall.receiveShadow = true;
  roomGroup.add(dividerWall);

  // Observation Glass Panel
  const glassWindow = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.2, 4.0), glassMat);
  glassWindow.position.set(0, 2.2, 0);
  roomGroup.add(glassWindow);

  // Glass Window Frame
  const frameTop = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 4.1), aluminumTrimMat);
  frameTop.position.set(0, 3.32, 0);
  roomGroup.add(frameTop);

  const frameBottom = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 4.1), aluminumTrimMat);
  frameBottom.position.set(0, 1.08, 0);
  roomGroup.add(frameBottom);

  // 4. Overhead Yellow Cable Ladder Tray
  // Runs from ceiling above RACK-01 through partition wall
  const trayMain = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.05, 0.4), cableTrayMat);
  trayMain.position.set(0, 3.9, 0);
  roomGroup.add(trayMain);

  // Ladder rung cross-bars
  for (let r = -3.5; r <= 3.5; r += 0.4) {
    const rung = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.42), cableTrayMat);
    rung.position.set(r, 3.93, 0);
    roomGroup.add(rung);
  }

  // 5. Environmental Sensor Box on Server Room Wall
  const sensorBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.28, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 })
  );
  sensorBox.position.set(-6.5, 1.8, -3.88);
  roomGroup.add(sensorBox);

  // Sensor LCD Display
  const sensorLcd = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.1, 0.01),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 0.6 })
  );
  sensorLcd.position.set(-6.5, 1.84, -3.85);
  roomGroup.add(sensorLcd);

  // 6. Server Room Halon Fire Suppression Tank Cylinder
  const tank = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 1.1, 16),
    new THREE.MeshStandardMaterial({ color: 0x991b1b, metalness: 0.7, roughness: 0.3 })
  );
  tank.position.set(-6.6, 0.65, 3.2);
  tank.castShadow = true;
  roomGroup.add(tank);

  return roomGroup;
}
