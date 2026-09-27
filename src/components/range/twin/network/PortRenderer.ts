/**
 * OMEGA ULTRA REALITY V1.1 — Network Port Geometry & Contacts
 * Detailed RJ45 modular jack cavities, 8P8C gold contact pins, and SFP+ transceiver cages.
 */

import * as THREE from 'three';

export interface PortMeshOptions {
  type: 'RJ45' | 'SFP_PLUS';
  shielded?: boolean;
}

export function createPortMesh(options: PortMeshOptions): THREE.Group {
  const group = new THREE.Group();

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.95,
    roughness: 0.2,
  });

  const cavityMat = new THREE.MeshBasicMaterial({
    color: 0x05070a,
  });

  const pinMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // Gold plated phosphor bronze contact pins
    metalness: 1.0,
    roughness: 0.15,
  });

  if (options.type === 'RJ45') {
    // Outer metal shield
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.014, 0.016), metalMat);
    group.add(shield);

    // Inner cavity
    const cavity = new THREE.Mesh(new THREE.BoxGeometry(0.011, 0.01, 0.01), cavityMat);
    cavity.position.set(0, 0, 0.004);
    group.add(cavity);

    // Gold pins in top of cavity
    for (let p = 0; p < 8; p++) {
      const pin = new THREE.Mesh(new THREE.BoxGeometry(0.0006, 0.002, 0.006), pinMat);
      pin.position.set(-0.0035 + p * 0.001, 0.003, 0.004);
      group.add(pin);
    }
  } else {
    // SFP+ 10G Cage
    const cage = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.024, 0.022), metalMat);
    group.add(cage);

    const cavity = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.018, 0.014), cavityMat);
    cavity.position.set(0, 0, 0.005);
    group.add(cavity);
  }

  return group;
}
