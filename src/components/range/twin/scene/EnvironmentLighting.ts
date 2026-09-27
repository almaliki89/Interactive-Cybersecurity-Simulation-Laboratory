/**
 * OMEGA ULTRA REALITY V1.1 — Environment & Studio Lighting
 * Believable PBR architectural illumination for server room and corporate workstations.
 */

import * as THREE from 'three';

export interface LightingRig {
  ambientLight: THREE.AmbientLight;
  serverRoomSpot: THREE.SpotLight;
  officeSpot: THREE.SpotLight;
  hallwayRim: THREE.DirectionalLight;
  rackPointLight: THREE.PointLight;
}

export function createEnvironmentLighting(scene: THREE.Scene): LightingRig {
  // Soft ambient fill
  const ambientLight = new THREE.AmbientLight(0x1e2533, 1.2);
  scene.add(ambientLight);

  // Server room overhead linear LED luminaire (5500K cool daylight)
  const serverRoomSpot = new THREE.SpotLight(0xe0f2fe, 7.5);
  serverRoomSpot.position.set(-3.5, 4.8, 2.2);
  serverRoomSpot.target.position.set(-3.5, 1.8, 0);
  serverRoomSpot.angle = Math.PI / 3;
  serverRoomSpot.penumbra = 0.5;
  serverRoomSpot.castShadow = true;
  serverRoomSpot.shadow.mapSize.width = 1024;
  serverRoomSpot.shadow.mapSize.height = 1024;
  serverRoomSpot.shadow.bias = -0.0005;
  scene.add(serverRoomSpot);
  scene.add(serverRoomSpot.target);

  // Office workstation luminaire (4000K neutral warm)
  const officeSpot = new THREE.SpotLight(0xfef3c7, 5.5);
  officeSpot.position.set(4.2, 4.2, 2.0);
  officeSpot.target.position.set(4.2, 1.1, 0);
  officeSpot.angle = Math.PI / 3.4;
  officeSpot.penumbra = 0.6;
  officeSpot.castShadow = true;
  officeSpot.shadow.mapSize.width = 1024;
  officeSpot.shadow.mapSize.height = 1024;
  scene.add(officeSpot);
  scene.add(officeSpot.target);

  // Hallway architectural rim light (creates depth separation between room sectors)
  const hallwayRim = new THREE.DirectionalLight(0x0ea5e9, 0.9);
  hallwayRim.position.set(0, 6, -5);
  scene.add(hallwayRim);

  // Subtle interior rack point light simulating equipment status LED diffuse bounce
  const rackPointLight = new THREE.PointLight(0x10b981, 0.4, 2.5);
  rackPointLight.position.set(-3.5, 2.2, 0.4);
  scene.add(rackPointLight);

  return {
    ambientLight,
    serverRoomSpot,
    officeSpot,
    hallwayRim,
    rackPointLight,
  };
}
