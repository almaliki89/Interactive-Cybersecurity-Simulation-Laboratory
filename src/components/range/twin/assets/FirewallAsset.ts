/**
 * OMEGA ULTRA REALITY V1.1 — Next-Gen Firewall Asset (FW-01)
 * High-detail 1U enterprise security appliance with status LEDs, WAN/LAN copper and SFP+ ports.
 */

import * as THREE from 'three';

export interface FirewallAssetResult {
  group: THREE.Group;
  leds: { mesh: THREE.Mesh; type: 'power' | 'activity' | 'network' | 'storage' }[];
  portPositions: Map<string, THREE.Vector3>;
}

export function createFirewallAsset(): FirewallAssetResult {
  const group = new THREE.Group();
  const leds: { mesh: THREE.Mesh; type: 'power' | 'activity' | 'network' | 'storage' }[] = [];
  const portPositions = new Map<string, THREE.Vector3>();

  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x1f191f, // Deep charcoal with subtle enterprise security tint
    metalness: 0.85,
    roughness: 0.35,
  });

  const faceplateMat = new THREE.MeshStandardMaterial({
    color: 0x2e1822, // Deep security maroon faceplate accent
    metalness: 0.8,
    roughness: 0.35,
  });

  const trimMat = new THREE.MeshStandardMaterial({
    color: 0xe11d48, // Crimson brand accent stripe
    metalness: 0.4,
    roughness: 0.3,
  });

  const portMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.95,
    roughness: 0.2,
  });

  const earMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.95,
    roughness: 0.2,
  });

  const ledGreenMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x10b981,
    emissiveIntensity: 2.0,
    roughness: 0.3,
  });

  const ledRedMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 1.8,
    roughness: 0.3,
  });

  const width = 0.68;
  const height = 0.065;
  const depth = 0.75;

  // Main 1U Chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), chassisMat);
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  group.add(chassis);

  // Front Faceplate
  const faceplate = new THREE.Mesh(new THREE.BoxGeometry(width - 0.04, height - 0.006, 0.012), faceplateMat);
  faceplate.position.set(0, 0, depth / 2 + 0.006);
  group.add(faceplate);

  // Horizontal Crimson Trim Line across faceplate
  const trim = new THREE.Mesh(new THREE.BoxGeometry(width - 0.06, 0.004, 0.002), trimMat);
  trim.position.set(0, 0.024, depth / 2 + 0.013);
  group.add(trim);

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

  // Appliance Status LEDs (PWR, STAT, HA, ALARM)
  const statusLedConfigs = [
    { label: 'PWR', color: ledGreenMat, type: 'power' as const },
    { label: 'STAT', color: ledGreenMat, type: 'activity' as const },
    { label: 'HA', color: ledGreenMat, type: 'activity' as const },
    { label: 'ALARM', color: ledRedMat, type: 'storage' as const },
  ];

  statusLedConfigs.forEach((cfg, idx) => {
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.0035, 6, 6), cfg.color);
    led.position.set(-0.28 + idx * 0.014, 0.01, depth / 2 + 0.013);
    group.add(led);
    leds.push({ mesh: led, type: cfg.type });
  });

  // RJ45 Ports (ge-0/0/0 WAN, ge-0/0/1 Internal LAN Uplink, ge-0/0/2 DMZ, etc.)
  for (let p = 0; p < 8; p++) {
    const x = -0.16 + p * 0.032;
    const portName = `ge-0/0/${p}`;

    const port = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.016, 0.016), portMat);
    port.position.set(x, -0.006, depth / 2 + 0.013);
    group.add(port);

    const portLed = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.003, 0.002), ledGreenMat);
    portLed.position.set(x, 0.009, depth / 2 + 0.014);
    group.add(portLed);
    leds.push({ mesh: portLed, type: 'network' });

    portPositions.set(portName, new THREE.Vector3(x, -0.006, depth / 2 + 0.02));
  }

  // Dual 10G SFP+ WAN Ports (xe-0/1/0, xe-0/1/1)
  [0.16, 0.195].forEach((xPos, idx) => {
    const sfp = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.024, 0.02), portMat);
    sfp.position.set(xPos, -0.004, depth / 2 + 0.013);
    group.add(sfp);

    const sfpLed = new THREE.Mesh(new THREE.SphereGeometry(0.0035, 6, 6), ledGreenMat);
    sfpLed.position.set(xPos, 0.015, depth / 2 + 0.014);
    group.add(sfpLed);
    leds.push({ mesh: sfpLed, type: 'network' });

    portPositions.set(`xe-0/1/${idx}`, new THREE.Vector3(xPos, -0.004, depth / 2 + 0.02));
  });

  return { group, leds, portPositions };
}
