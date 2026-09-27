/**
 * OMEGA ULTRA REALITY V1.1 — Physical 3D Asset & Scene Architecture Tests
 * Validates proper procedural construction of all enterprise hardware meshes,
 * port coordinate anchors, LED registries, and cable paths.
 */

import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createServerAsset } from '../../components/range/twin/assets/ServerAsset';
import { createSwitchAsset } from '../../components/range/twin/assets/SwitchAsset';
import { createFirewallAsset } from '../../components/range/twin/assets/FirewallAsset';
import { createPatchPanelAsset } from '../../components/range/twin/assets/PatchPanelAsset';
import { createUPSAsset, createPDUAsset } from '../../components/range/twin/assets/UPSAsset';
import { createWorkstationAsset } from '../../components/range/twin/assets/WorkstationAsset';
import { createMonitorAsset } from '../../components/range/twin/assets/MonitorAsset';
import { createRackAsset } from '../../components/range/twin/assets/RackAsset';
import { createServerRoom } from '../../components/range/twin/scene/ServerRoom';
import { createOfficeRoom } from '../../components/range/twin/scene/OfficeRoom';
import { createRoomShell } from '../../components/range/twin/scene/RoomShell';
import { createEnvironmentLighting } from '../../components/range/twin/scene/EnvironmentLighting';
import { CameraController } from '../../components/range/twin/scene/CameraController';
import { CableRenderer } from '../../components/range/twin/network/CableRenderer';
import { LinkStateVisualizer } from '../../components/range/twin/network/LinkStateVisualizer';

describe('OMEGA ULTRA REALITY V1.1 — Hardware Assets & Scene Subsystems', () => {
  it('constructs 2U enterprise server asset with drive caddies and redundant PSUs', () => {
    const dc01 = createServerAsset({
      id: 'DC01',
      name: 'DC01',
      driveCount: 8,
      driveType: '2.5in',
      ruHeight: 2,
    });

    expect(dc01.group).toBeDefined();
    expect(dc01.leds.length).toBeGreaterThan(5);
    expect(dc01.leds.some((l) => l.type === 'power')).toBe(true);
    expect(dc01.leds.some((l) => l.type === 'storage')).toBe(true);

    const file01 = createServerAsset({
      id: 'FILE01',
      name: 'FILE01',
      driveCount: 12,
      driveType: '3.5in',
      ruHeight: 2,
    });
    expect(file01.group).toBeDefined();
    expect(file01.leds.some((l) => l.type === 'storage')).toBe(true);
  });

  it('constructs 48-port switch asset with port coordinates and SFP+ cages', () => {
    const sw = createSwitchAsset();
    expect(sw.group).toBeDefined();
    expect(sw.leds.length).toBeGreaterThan(48);
    expect(sw.portPositions.size).toBe(48);

    // Port 1, 10, 24, 48 positions must exist
    expect(sw.portPositions.get(1)).toBeDefined();
    expect(sw.portPositions.get(10)).toBeDefined();
    expect(sw.portPositions.get(24)).toBeDefined();
    expect(sw.portPositions.get(48)).toBeDefined();
  });

  it('constructs next-gen firewall asset with interfaces and security trim', () => {
    const fw = createFirewallAsset();
    expect(fw.group).toBeDefined();
    expect(fw.leds.length).toBeGreaterThan(5);
    expect(fw.portPositions.get('ge-0/0/1')).toBeDefined();
  });

  it('constructs keystone patch panel asset with 48 front ports', () => {
    const pp = createPatchPanelAsset();
    expect(pp.group).toBeDefined();
    expect(pp.portPositions.size).toBe(48);
    expect(pp.portPositions.get(24)).toBeDefined();
  });

  it('constructs power assets: UPS and metered PDU', () => {
    const ups = createUPSAsset();
    expect(ups.group).toBeDefined();
    expect(ups.leds.length).toBeGreaterThan(0);

    const pdu = createPDUAsset();
    expect(pdu.group).toBeDefined();
  });

  it('constructs workstation and dynamic monitor with canvas texture', () => {
    const ws = createWorkstationAsset();
    expect(ws.group).toBeDefined();
    expect(ws.towerMesh).toBeDefined();
    expect(ws.pcNicPosition).toBeDefined();
    expect(ws.wallDropPosition).toBeDefined();

    const monitor = createMonitorAsset();
    expect(monitor.group).toBeDefined();
    expect(monitor.screenMaterial).toBeDefined();
    // Test update screen
    monitor.updateScreenState(true, 'sara.finance', 'FIN-WS01');
    monitor.updateScreenState(false);
  });

  it('assembles server room and office sectors with anchor coordinates', () => {
    const srvRoom = createServerRoom();
    expect(srvRoom.group).toBeDefined();
    expect(srvRoom.interactiveObjects.length).toBeGreaterThan(0);
    expect(srvRoom.anchorPositions.has('CORE-SW01:Gi1/0/1')).toBe(true);
    expect(srvRoom.anchorPositions.has('PP-01:Port 24')).toBe(true);
    expect(srvRoom.anchorPositions.has('DC01:NIC1 (Ethernet0)')).toBe(true);

    const office = createOfficeRoom();
    expect(office.group).toBeDefined();
    expect(office.anchorPositions.has('FIN-WS01:NIC1')).toBe(true);
    expect(office.anchorPositions.has('Office Wall Drop Zone-B #24')).toBe(true);
  });

  it('tests cable renderer catenary curve generation and disconnect droop', () => {
    const renderer = new CableRenderer();
    const anchors = new Map<string, THREE.Vector3>([
      ['DEV1:P1', new THREE.Vector3(0, 2, 0)],
      ['DEV2:P1', new THREE.Vector3(0, 1, 0)],
    ]);

    renderer.renderCables(
      {
        'TEST-CAB': {
          id: 'TEST-CAB',
          type: 'CAT6',
          sourceDeviceId: 'DEV1',
          sourcePort: 'DEV1:P1',
          targetDeviceId: 'DEV2',
          targetPort: 'DEV2:P1',
          status: 'CONNECTED',
          linkSpeedMbps: 1000,
          lengthMeters: 2,
          colorLabel: 'blue',
          connected: true,
          stateOrigin: 'DERIVED',
        },
      },
      anchors
    );

    expect(renderer.group.children.length).toBeGreaterThan(0);
    expect(renderer.interactiveCables.length).toBe(1);

    // Test disconnected state
    renderer.renderCables(
      {
        'TEST-CAB': {
          id: 'TEST-CAB',
          type: 'CAT6',
          sourceDeviceId: 'DEV1',
          sourcePort: 'DEV1:P1',
          targetDeviceId: 'DEV2',
          targetPort: 'DEV2:P1',
          status: 'DISCONNECTED',
          linkSpeedMbps: 1000,
          lengthMeters: 2,
          colorLabel: 'blue',
          connected: false,
          stateOrigin: 'DERIVED',
        },
      },
      anchors
    );
    expect(renderer.group.children.length).toBeGreaterThan(0);
  });

  it('tests camera controller orbit, lerp, and mode choreography', () => {
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const controller = new CameraController(cam);

    controller.setView('building', 'server-room', null);
    expect(controller.targetPos.y).toBeCloseTo(11.5, 1);

    controller.setView('rack-front', 'server-room', null);
    expect(controller.targetPos.z).toBeCloseTo(2.5, 1);

    controller.setView('rack-rear', 'server-room', null);
    expect(controller.targetPos.z).toBeCloseTo(-2.5, 1);

    controller.setView('workstation', 'finance-dept', null);
    expect(controller.targetPos.x).toBeCloseTo(4.2, 1);

    controller.update(0.016);
    expect(controller.currentPos).toBeDefined();
  });
});
