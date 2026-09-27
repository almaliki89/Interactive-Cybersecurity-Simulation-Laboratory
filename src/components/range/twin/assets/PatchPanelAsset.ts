/**
 * OMEGA ULTRA REALITY V1.1 — Keystone Patch Panel Asset (PP-01)
 * High-detail 1U 48-Port Cat6A unshielded keystone patch panel with port markers and cable bar.
 */

import * as THREE from 'three';

export interface PatchPanelAssetResult {
  group: THREE.Group;
  portPositions: Map<number, THREE.Vector3>;
}

export function createPatchPanelAsset(): PatchPanelAssetResult {
  const group = new THREE.Group();
  const portPositions = new Map<number, THREE.Vector3>();

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x111620,
    metalness: 0.9,
    roughness: 0.35,
  });

  const keystoneMat = new THREE.MeshStandardMaterial({
    color: 0x05070a,
    metalness: 0.2,
    roughness: 0.8,
  });

  const labelMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.1,
    roughness: 0.5,
  });

  const earMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.95,
    roughness: 0.2,
  });

  const width = 0.68;
  const height = 0.055;
  const depth = 0.12;

  // 1U Steel Panel Body
  const panel = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.008), metalMat);
  panel.castShadow = true;
  group.add(panel);

  // Rack Mounting Ears
  [-width / 2 + 0.01, width / 2 - 0.01].forEach((xPos) => {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.025, height, 0.02), earMat);
    ear.position.set(xPos, 0, 0.005);
    group.add(ear);

    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.01, 12), earMat);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(xPos, 0, 0.015);
    group.add(screw);
  });

  // White Silk-screen Label Strips across top and bottom
  const labelStripTop = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.005, 0.001), labelMat);
  labelStripTop.position.set(0, 0.02, 0.005);
  group.add(labelStripTop);

  const labelStripBottom = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.005, 0.001), labelMat);
  labelStripBottom.position.set(0, -0.02, 0.005);
  group.add(labelStripBottom);

  // 48 Keystone Ports in 2 rows of 24
  const startX = -0.235;
  const colSpacing = 0.0205;

  for (let col = 0; col < 24; col++) {
    for (let row = 0; row < 2; row++) {
      const portNumber = row === 0 ? col * 2 + 1 : col * 2 + 2;
      const x = startX + col * colSpacing;
      const y = row === 0 ? 0.009 : -0.009;

      // Keystone frame
      const jack = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.014, 0.018), keystoneMat);
      jack.position.set(x, y, 0.005);
      group.add(jack);

      // Cavity hole
      const cavity = new THREE.Mesh(new THREE.BoxGeometry(0.011, 0.01, 0.006), metalMat);
      cavity.position.set(x, y, 0.014);
      group.add(cavity);

      portPositions.set(portNumber, new THREE.Vector3(x, y, 0.018));
    }
  }

  // Rear Cable Management Bar (Stretches back behind panel)
  const barMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.85,
    roughness: 0.3,
  });

  const mgmtBar = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, width - 0.1, 8), barMat);
  mgmtBar.rotation.z = Math.PI / 2;
  mgmtBar.position.set(0, -0.01, -depth);
  group.add(mgmtBar);

  // Side support arms
  [-width / 2 + 0.06, width / 2 - 0.06].forEach((xPos) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.01, depth), barMat);
    arm.position.set(xPos, -0.01, -depth / 2);
    group.add(arm);
  });

  return { group, portPositions };
}
