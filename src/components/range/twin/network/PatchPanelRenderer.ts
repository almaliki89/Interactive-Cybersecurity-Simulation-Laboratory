/**
 * OMEGA ULTRA REALITY V1.1 — Patch Panel Port Renderer
 * Keystone jack housing, RJ45 latch slot, and cable strain relief boots.
 */

import * as THREE from 'three';

export function createKeystoneJack(): THREE.Group {
  const group = new THREE.Group();

  const plasticMat = new THREE.MeshStandardMaterial({
    color: 0x090d14,
    metalness: 0.1,
    roughness: 0.8,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.015, 0.018), plasticMat);
  group.add(body);

  // Tab release slot
  const tabSlot = new THREE.Mesh(
    new THREE.BoxGeometry(0.008, 0.004, 0.004),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  tabSlot.position.set(0, -0.005, 0.008);
  group.add(tabSlot);

  return group;
}

export function createStrainReliefBoot(color: string = '#2563eb'): THREE.Group {
  const group = new THREE.Group();

  const bootMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.5,
    metalness: 0.2,
  });

  // Tapered rubber boot
  const boot = new THREE.Mesh(new THREE.ConeGeometry(0.006, 0.025, 12), bootMat);
  boot.rotation.x = Math.PI / 2;
  group.add(boot);

  // Snagless latch protector bubble
  const bubble = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.004, 0.015), bootMat);
  bubble.position.set(0, 0.004, 0.005);
  group.add(bubble);

  return group;
}
