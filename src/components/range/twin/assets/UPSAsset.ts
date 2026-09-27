/**
 * OMEGA ULTRA REALITY V1.1 — Rack Power Assets (UPS & PDU)
 * High-detail 2U UPS with LCD display and 1U Metered PDU with current readout and C13 outlets.
 */

import * as THREE from 'three';

export interface PowerAssetResult {
  group: THREE.Group;
  leds: { mesh: THREE.Mesh; type: 'power' | 'activity' | 'network' | 'storage' }[];
}

export function createUPSAsset(): PowerAssetResult {
  const group = new THREE.Group();
  const leds: { mesh: THREE.Mesh; type: 'power' | 'activity' | 'network' | 'storage' }[] = [];

  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x141824,
    metalness: 0.8,
    roughness: 0.4,
  });

  const bezelMat = new THREE.MeshStandardMaterial({
    color: 0x090c12,
    metalness: 0.7,
    roughness: 0.5,
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
  });

  const width = 0.68;
  const height = 0.13; // 2U
  const depth = 0.7;

  // Main 2U Chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), chassisMat);
  chassis.castShadow = true;
  group.add(chassis);

  // Front Bezel
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(width - 0.04, height - 0.008, 0.015), bezelMat);
  bezel.position.set(0, 0, depth / 2 + 0.007);
  group.add(bezel);

  // Rack Ears
  [-width / 2 + 0.01, width / 2 - 0.01].forEach((xPos) => {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.025, height, 0.03), earMat);
    ear.position.set(xPos, 0, depth / 2 + 0.01);
    group.add(ear);
  });

  // LCD Telemetry Display Screen (Blue backlit)
  const lcdMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    emissive: 0x0369a1,
    emissiveIntensity: 1.4,
    roughness: 0.2,
  });
  const lcd = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.008), lcdMat);
  lcd.position.set(0.18, 0.015, depth / 2 + 0.016);
  group.add(lcd);

  // Status LEDs (Online, On Battery, Overload, Fault)
  [-0.04, -0.01, 0.02, 0.05].forEach((yPos, idx) => {
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.0035, 6, 6), ledGreenMat);
    led.position.set(0.26, yPos * 0.5, depth / 2 + 0.016);
    group.add(led);
    leds.push({ mesh: led, type: idx === 0 ? 'power' : 'activity' });
  });

  // Hot-swappable Battery Pack Access Cover
  const batDoor = new THREE.Mesh(new THREE.BoxGeometry(0.35, height - 0.02, 0.008), chassisMat);
  batDoor.position.set(-0.1, 0, depth / 2 + 0.015);
  group.add(batDoor);

  return { group, leds };
}

export function createPDUAsset(): PowerAssetResult {
  const group = new THREE.Group();
  const leds: { mesh: THREE.Mesh; type: 'power' | 'activity' | 'network' | 'storage' }[] = [];

  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x111622,
    metalness: 0.85,
    roughness: 0.35,
  });

  const outletMat = new THREE.MeshStandardMaterial({
    color: 0x05070a,
    metalness: 0.2,
    roughness: 0.8,
  });

  const meterMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 2.2,
    roughness: 0.2,
  });

  const width = 0.68;
  const height = 0.065; // 1U
  const depth = 0.65;

  // Main 1U Chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), chassisMat);
  chassis.castShadow = true;
  group.add(chassis);

  // Digital Ammeter / Voltmeter 7-Segment LED Screen
  const meter = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.03, 0.008), meterMat);
  meter.position.set(-0.22, 0, depth / 2 + 0.005);
  group.add(meter);

  // Circuit Breaker Rocker Switch
  const breakerMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
  const breaker = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.03, 0.015), breakerMat);
  breaker.position.set(-0.12, 0, depth / 2 + 0.008);
  group.add(breaker);

  // Row of 8x IEC C13 Outlets on front (for metered/switched PDU inspection)
  for (let i = 0; i < 8; i++) {
    const outlet = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.028, 0.01), outletMat);
    outlet.position.set(0.02 + i * 0.035, 0, depth / 2 + 0.006);
    group.add(outlet);
  }

  // Out-of-band Ethernet Management Port
  const mgmtPort = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.014, 0.01), chassisMat);
  mgmtPort.position.set(-0.28, 0, depth / 2 + 0.006);
  group.add(mgmtPort);

  return { group, leds };
}
