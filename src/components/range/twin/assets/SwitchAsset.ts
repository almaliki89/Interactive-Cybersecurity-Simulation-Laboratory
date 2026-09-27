/**
 * OMEGA ULTRA REALITY V1.1 — Enterprise 48-Port Switch Asset (CORE-SW01)
 * High-detail 1U switch with 48 RJ45 ports in 2 rows, SFP+ cages, status LEDs, and rack ears.
 */

import * as THREE from 'three';

export interface SwitchAssetResult {
  group: THREE.Group;
  leds: { mesh: THREE.Mesh; type: 'power' | 'activity' | 'network' | 'storage' }[];
  portPositions: Map<number, THREE.Vector3>;
}

export function createSwitchAsset(): SwitchAssetResult {
  const group = new THREE.Group();
  const leds: { mesh: THREE.Mesh; type: 'power' | 'activity' | 'network' | 'storage' }[] = [];
  const portPositions = new Map<number, THREE.Vector3>();

  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x1a212e,
    metalness: 0.85,
    roughness: 0.35,
  });

  const faceplateMat = new THREE.MeshStandardMaterial({
    color: 0x0e131d,
    metalness: 0.8,
    roughness: 0.4,
  });

  const portShieldMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.95,
    roughness: 0.2,
  });

  const portCavityMat = new THREE.MeshBasicMaterial({
    color: 0x05070a,
  });

  const earMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.95,
    roughness: 0.25,
  });

  const ledGreenMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x10b981,
    emissiveIntensity: 2.0,
    roughness: 0.3,
  });

  const ledAmberMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.8,
    roughness: 0.3,
  });

  const width = 0.68;
  const height = 0.065; // 1U ~ 44.45mm
  const depth = 0.72;

  // Main 1U Chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), chassisMat);
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  group.add(chassis);

  // Front Faceplate
  const faceplate = new THREE.Mesh(new THREE.BoxGeometry(width - 0.04, height - 0.006, 0.012), faceplateMat);
  faceplate.position.set(0, 0, depth / 2 + 0.006);
  group.add(faceplate);

  // Rack Mounting Ears
  [-width / 2 + 0.01, width / 2 - 0.01].forEach((xPos) => {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.025, height, 0.03), earMat);
    ear.position.set(xPos, 0, depth / 2 + 0.01);
    group.add(ear);

    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.015, 12), earMat);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(xPos, 0, depth / 2 + 0.025);
    group.add(screw);
  });

  // System Status LEDs (SYST, STAT, SPEED, DPLX) on Left
  const sysStatusLabels = ['SYST', 'STAT', 'SPEED', 'DPLX'];
  sysStatusLabels.forEach((label, idx) => {
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.003, 6, 6), ledGreenMat);
    led.position.set(-0.29 + idx * 0.012, 0.014, depth / 2 + 0.013);
    group.add(led);
    leds.push({ mesh: led, type: idx === 0 ? 'power' : 'activity' });
  });

  // RJ45 Console & MGMT Ports
  const consolePort = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.013, 0.015), portShieldMat);
  consolePort.position.set(-0.23, -0.01, depth / 2 + 0.013);
  group.add(consolePort);

  // 48 RJ45 Gigabit Ports in 2 stacked rows of 24
  const startX = -0.19;
  const colSpacing = 0.0175;
  const rowSpacing = 0.022;

  for (let col = 0; col < 24; col++) {
    for (let row = 0; row < 2; row++) {
      // 1-indexed port number (Top row odd: 1, 3, 5... Bottom row even: 2, 4, 6...)
      const portNumber = row === 0 ? col * 2 + 1 : col * 2 + 2;
      const x = startX + col * colSpacing;
      const y = row === 0 ? 0.011 : -0.011;
      const z = depth / 2 + 0.013;

      // Metal shielded socket
      const shield = new THREE.Mesh(new THREE.BoxGeometry(0.013, 0.012, 0.015), portShieldMat);
      shield.position.set(x, y, z);
      group.add(shield);

      // Cavity hole
      const cavity = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.008, 0.008), portCavityMat);
      cavity.position.set(x, y, z + 0.004);
      group.add(cavity);

      // Link / Activity LED above/below port
      const ledY = row === 0 ? y + 0.01 : y - 0.01;
      const portLed = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.0025, 0.002), ledGreenMat);
      portLed.position.set(x, ledY, z + 0.002);
      group.add(portLed);
      leds.push({ mesh: portLed, type: 'network' });

      // Save world-relative position for cable snapping
      portPositions.set(portNumber, new THREE.Vector3(x, y, z + 0.008));
    }
  }

  // 4x 10G SFP+ Uplink Cages on Right Side
  const sfpStartX = 0.245;
  for (let s = 0; s < 4; s++) {
    const sfpX = sfpStartX + s * 0.022;
    const sfpCage = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.024, 0.02), portShieldMat);
    sfpCage.position.set(sfpX, 0, depth / 2 + 0.013);
    group.add(sfpCage);

    const sfpCavity = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.018, 0.012), portCavityMat);
    sfpCavity.position.set(sfpX, 0, depth / 2 + 0.017);
    group.add(sfpCavity);

    const sfpLed = new THREE.Mesh(new THREE.SphereGeometry(0.003, 6, 6), ledAmberMat);
    sfpLed.position.set(sfpX, 0.018, depth / 2 + 0.014);
    group.add(sfpLed);
    leds.push({ mesh: sfpLed, type: 'network' });
  }

  return { group, leds, portPositions };
}
