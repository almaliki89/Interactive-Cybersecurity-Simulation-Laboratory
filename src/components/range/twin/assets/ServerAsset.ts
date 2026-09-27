/**
 * OMEGA ULTRA REALITY V1.1 — Server Hardware Asset (DC01 & FILE01)
 * High-detail 2U enterprise chassis with drive bays, caddies, LEDs, and rack ears.
 */

import * as THREE from 'three';

export interface ServerAssetOptions {
  id: string;
  name: string;
  driveCount: 8 | 12;
  driveType: '2.5in' | '3.5in';
  ruHeight: number;
}

export interface ServerAssetResult {
  group: THREE.Group;
  leds: { mesh: THREE.Mesh; type: 'power' | 'activity' | 'network' | 'storage' }[];
}

export function createServerAsset(options: ServerAssetOptions): ServerAssetResult {
  const { driveCount, driveType } = options;
  const group = new THREE.Group();
  const leds: { mesh: THREE.Mesh; type: 'power' | 'activity' | 'network' | 'storage' }[] = [];

  // PBR Materials
  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x181e29,
    metalness: 0.82,
    roughness: 0.38,
  });

  const bezelMat = new THREE.MeshStandardMaterial({
    color: 0x0c0f14,
    metalness: 0.65,
    roughness: 0.55,
  });

  const caddyMat = new THREE.MeshStandardMaterial({
    color: 0x2b3342,
    metalness: 0.88,
    roughness: 0.28,
  });

  const leverMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.92,
    roughness: 0.25,
  });

  const earMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.95,
    roughness: 0.2,
  });

  const ledGreenMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x10b981,
    emissiveIntensity: 1.9,
    roughness: 0.3,
  });

  const ledAmberMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.8,
    roughness: 0.3,
  });

  const height = 0.14; // 2U height ~ 88.9mm scaled
  const width = 0.68;
  const depth = 0.82;

  // Main 2U Chassis
  const mainChassis = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), chassisMat);
  mainChassis.castShadow = true;
  mainChassis.receiveShadow = true;
  group.add(mainChassis);

  // Front Bezel Panel
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(width - 0.04, height - 0.008, 0.015), bezelMat);
  bezel.position.set(0, 0, depth / 2 + 0.007);
  group.add(bezel);

  // Rack Mounting Ears (Left & Right with thumb-screw bolt heads)
  [-width / 2 + 0.01, width / 2 - 0.01].forEach((xPos, idx) => {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.025, height, 0.03), earMat);
    ear.position.set(xPos, 0, depth / 2 + 0.01);
    group.add(ear);

    // Thumb screw cylinder
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.015, 12), earMat);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(xPos, 0, depth / 2 + 0.025);
    group.add(screw);

    if (idx === 0) {
      // Left Ear: Power Button & Status LEDs
      const pwrBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.005, 12), earMat);
      pwrBtn.rotation.x = Math.PI / 2;
      pwrBtn.position.set(xPos, 0.045, depth / 2 + 0.025);
      group.add(pwrBtn);

      const pwrLed = new THREE.Mesh(new THREE.SphereGeometry(0.005, 8, 8), ledGreenMat);
      pwrLed.position.set(xPos, 0.03, depth / 2 + 0.026);
      group.add(pwrLed);
      leds.push({ mesh: pwrLed, type: 'power' });

      // NIC Link LED
      const nicLed = new THREE.Mesh(new THREE.SphereGeometry(0.004, 8, 8), ledGreenMat);
      nicLed.position.set(xPos, 0.015, depth / 2 + 0.026);
      group.add(nicLed);
      leds.push({ mesh: nicLed, type: 'network' });

      // ID LED (Blue/Amber)
      const idLed = new THREE.Mesh(new THREE.SphereGeometry(0.004, 8, 8), ledAmberMat);
      idLed.position.set(xPos, -0.015, depth / 2 + 0.026);
      group.add(idLed);
      leds.push({ mesh: idLed, type: 'activity' });
    }
  });

  // Drive Bays
  if (driveType === '2.5in') {
    // 8x 2.5" SFF Drive Array in 1 horizontal row
    const baySpacing = 0.066;
    const startX = -((driveCount - 1) * baySpacing) / 2;

    for (let i = 0; i < driveCount; i++) {
      const x = startX + i * baySpacing;
      // Caddy frame
      const caddy = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.09, 0.02), caddyMat);
      caddy.position.set(x, -0.005, depth / 2 + 0.015);
      group.add(caddy);

      // Release latch lever
      const lever = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.075, 0.006), leverMat);
      lever.position.set(x - 0.02, -0.005, depth / 2 + 0.026);
      group.add(lever);

      // Drive Activity LED
      const driveLed = new THREE.Mesh(new THREE.SphereGeometry(0.004, 6, 6), ledAmberMat);
      driveLed.position.set(x + 0.018, 0.028, depth / 2 + 0.026);
      group.add(driveLed);
      leds.push({ mesh: driveLed, type: 'storage' });
    }
  } else {
    // 12x 3.5" LFF Drive Array in 3 rows of 4 bays
    const cols = 4;
    const rows = 3;
    const colSpacing = 0.138;
    const rowSpacing = 0.038;
    const startX = -((cols - 1) * colSpacing) / 2;
    const startY = 0.038;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * colSpacing;
        const y = startY - r * rowSpacing;

        const bay = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.032, 0.02), caddyMat);
        bay.position.set(x, y, depth / 2 + 0.015);
        group.add(bay);

        // LFF Release latch handle
        const latch = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.008, 0.005), leverMat);
        latch.position.set(x, y, depth / 2 + 0.026);
        group.add(latch);

        // Drive Activity LED
        const driveLed = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.004, 0.003), ledAmberMat);
        driveLed.position.set(x - 0.05, y, depth / 2 + 0.026);
        group.add(driveLed);
        leds.push({ mesh: driveLed, type: 'storage' });
      }
    }
  }

  // Rear I/O: Dual Redundant Hot-Swap Power Supplies (750W Titanium)
  [-0.2, 0.2].forEach((xPos) => {
    const psu = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.05), caddyMat);
    psu.position.set(xPos, -0.01, -depth / 2 - 0.02);
    group.add(psu);

    // PSU Handle
    const psuHandle = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.004, 8, 16), earMat);
    psuHandle.position.set(xPos, -0.01, -depth / 2 - 0.045);
    group.add(psuHandle);

    // C14 AC Inlet cavity
    const c14 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.015), bezelMat);
    c14.position.set(xPos - 0.035, -0.01, -depth / 2 - 0.04);
    group.add(c14);

    // PSU Status LED (Green)
    const psuLed = new THREE.Mesh(new THREE.SphereGeometry(0.004, 6, 6), ledGreenMat);
    psuLed.position.set(xPos + 0.035, -0.01, -depth / 2 - 0.045);
    group.add(psuLed);
    leds.push({ mesh: psuLed, type: 'power' });
  });

  // Rear Quad-Port 10G SFP+ / 1G RJ45 NIC block
  const nicBlock = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.02), earMat);
  nicBlock.position.set(0, -0.02, -depth / 2 - 0.01);
  group.add(nicBlock);

  return { group, leds };
}
