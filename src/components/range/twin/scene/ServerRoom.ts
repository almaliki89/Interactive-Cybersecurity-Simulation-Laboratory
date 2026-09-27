/**
 * OMEGA ULTRA REALITY V1.1 — Server Room & RACK-01 Environment
 * Raised anti-static flooring, cable ladder trays, 42U rack, environmental sensor, and hardware mounts.
 */

import * as THREE from 'three';
import { createRackAsset, RackAssetResult } from '../assets/RackAsset';
import { createServerAsset } from '../assets/ServerAsset';
import { createSwitchAsset } from '../assets/SwitchAsset';
import { createFirewallAsset } from '../assets/FirewallAsset';
import { createPatchPanelAsset } from '../assets/PatchPanelAsset';
import { createUPSAsset, createPDUAsset } from '../assets/UPSAsset';
import { LedRegistration } from '../network/LinkStateVisualizer';

export interface ServerRoomResult {
  group: THREE.Group;
  rack: RackAssetResult;
  interactiveObjects: THREE.Object3D[];
  ledRegistry: Map<string, LedRegistration[]>;
  anchorPositions: Map<string, THREE.Vector3>;
}

export function createServerRoom(): ServerRoomResult {
  const group = new THREE.Group();
  group.name = 'ServerRoomSector';

  const interactiveObjects: THREE.Object3D[] = [];
  const ledRegistry = new Map<string, LedRegistration[]>();
  const anchorPositions = new Map<string, THREE.Vector3>();

  // 1. Raised Floor (Zone-A Server Room)
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x0a0e16,
    roughness: 0.35,
    metalness: 0.25,
  });

  const floor = new THREE.Mesh(new THREE.BoxGeometry(7, 0.2, 8), floorMat);
  floor.position.set(-3.5, -0.1, 0);
  floor.receiveShadow = true;
  group.add(floor);

  // Perforated airflow tile directly in front of RACK-01
  const perfMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.7,
    metalness: 0.8,
  });
  const perfTile = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.01, 0.9), perfMat);
  perfTile.position.set(-3.5, 0.005, 0.95);
  perfTile.receiveShadow = true;
  group.add(perfTile);

  // 2. Overhead Yellow Steel Cable Tray Basket
  const trayMat = new THREE.MeshStandardMaterial({
    color: 0xca8a04, // High-visibility enterprise cable ladder yellow
    metalness: 0.75,
    roughness: 0.35,
  });
  const tray = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 6.0), trayMat);
  tray.position.set(-3.5, 4.1, 0);
  tray.castShadow = true;
  group.add(tray);

  // 3. Wall Mounted Environmental Sensor (Temperature & Humidity)
  const sensorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 });
  const sensorDisplayMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 2.0,
  });
  const sensor = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.26, 0.04), sensorMat);
  sensor.position.set(-6.8, 1.8, -1.5);
  group.add(sensor);

  const sensorLcd = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.01), sensorDisplayMat);
  sensorLcd.position.set(-6.77, 1.84, -1.5);
  group.add(sensorLcd);

  // 4. Server Rack 42U Enclosure (RACK-01)
  const rack = createRackAsset();
  group.add(rack.group);

  // Helper: Register interactive hardware device group
  const registerDevice = (devGroup: THREE.Group, devId: string) => {
    devGroup.userData = { isDevice: true, deviceId: devId };
    devGroup.traverse((child) => {
      child.userData = { isDevice: true, deviceId: devId };
      if (child instanceof THREE.Mesh) {
        interactiveObjects.push(child);
      }
    });
    rack.group.add(devGroup);
  };

  // 5. Mount Rack Hardware
  const rackWorldOffset = new THREE.Vector3(-3.5, 0, 0);

  // --- A. Patch Panel (PP-01: RU 40, 1U) ---
  const pp = createPatchPanelAsset();
  const ppY = rack.ruToY(40, 1);
  pp.group.position.set(0, ppY, 0.1);
  registerDevice(pp.group, 'PP-01');

  // Register PP-01 Port 24 position
  const ppPort24 = pp.portPositions.get(24);
  if (ppPort24) {
    const pPos = ppPort24.clone().add(pp.group.position).add(rackWorldOffset);
    anchorPositions.set('PP-01:Port 24', pPos);
    anchorPositions.set('PP-01', pPos);
  }

  // --- B. Firewall (FW-01: RU 38, 1U) ---
  const fw = createFirewallAsset();
  const fwY = rack.ruToY(38, 1);
  fw.group.position.set(0, fwY, 0.1);
  ledRegistry.set('FW-01', fw.leds);
  registerDevice(fw.group, 'FW-01');

  const fwGe1 = fw.portPositions.get('ge-0/0/1');
  if (fwGe1) {
    const pPos = fwGe1.clone().add(fw.group.position).add(rackWorldOffset);
    anchorPositions.set('FW-01:ge-0/0/1', pPos);
    anchorPositions.set('FW-01', pPos);
  }

  // --- C. Core Switch (CORE-SW01: RU 36, 1U 48-Port) ---
  const sw = createSwitchAsset();
  const swY = rack.ruToY(36, 1);
  sw.group.position.set(0, swY, 0.1);
  ledRegistry.set('CORE-SW01', sw.leds);
  registerDevice(sw.group, 'CORE-SW01');

  // Register Switch Port Anchors
  [1, 10, 12, 24, 48].forEach((portNum) => {
    const portPos = sw.portPositions.get(portNum);
    if (portPos) {
      const pPos = portPos.clone().add(sw.group.position).add(rackWorldOffset);
      anchorPositions.set(`CORE-SW01:Gi1/0/${portNum}`, pPos);
    }
  });
  const swPort1Pos = sw.portPositions.get(1);
  if (swPort1Pos) {
    anchorPositions.set('CORE-SW01', swPort1Pos.clone().add(sw.group.position).add(rackWorldOffset));
  }

  // --- D. Domain Controller (DC01: RU 30-31, 2U Server) ---
  const dc = createServerAsset({
    id: 'DC01',
    name: 'DC01 — Windows Server 2022 Primary Domain Controller',
    driveCount: 8,
    driveType: '2.5in',
    ruHeight: 2,
  });
  const dcY = rack.ruToY(30, 2);
  dc.group.position.set(0, dcY, 0.1);
  ledRegistry.set('DC01', dc.leds);
  registerDevice(dc.group, 'DC01');

  const dcNicPos = new THREE.Vector3(0, dcY - 0.02, 0.1 + 0.42).add(rackWorldOffset);
  anchorPositions.set('DC01:NIC1 (Ethernet0)', dcNicPos);
  anchorPositions.set('DC01', dcNicPos);

  // --- E. File Server (FILE01: RU 26-27, 2U 12-Bay Storage Server) ---
  const fl = createServerAsset({
    id: 'FILE01',
    name: 'FILE01 — Windows Server 2022 Corporate File Storage Server',
    driveCount: 12,
    driveType: '3.5in',
    ruHeight: 2,
  });
  const flY = rack.ruToY(26, 2);
  fl.group.position.set(0, flY, 0.1);
  ledRegistry.set('FILE01', fl.leds);
  registerDevice(fl.group, 'FILE01');

  const flNicPos = new THREE.Vector3(0, flY - 0.02, 0.1 + 0.42).add(rackWorldOffset);
  anchorPositions.set('FILE01:NIC1 (Ethernet0)', flNicPos);
  anchorPositions.set('FILE01', flNicPos);

  // --- F. Power Units: UPS & Metered PDU (RU 1 to 4) ---
  const ups = createUPSAsset();
  const upsY = rack.ruToY(3, 2);
  ups.group.position.set(0, upsY, 0.1);
  ledRegistry.set('UPS-01', ups.leds);
  registerDevice(ups.group, 'UPS-01');

  const pdu = createPDUAsset();
  const pduY = rack.ruToY(1, 2);
  pdu.group.position.set(0, pduY, 0.1);
  ledRegistry.set('PDU-01', pdu.leds);
  registerDevice(pdu.group, 'PDU-01');

  const pduMgmtPos = new THREE.Vector3(-0.28, pduY, 0.1 + 0.33).add(rackWorldOffset);
  anchorPositions.set('PDU-01:MGMT-ETH', pduMgmtPos);
  anchorPositions.set('PDU-01', pduMgmtPos);

  return {
    group,
    rack,
    interactiveObjects,
    ledRegistry,
    anchorPositions,
  };
}
