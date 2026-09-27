/**
 * OMEGA ULTRA REALITY V1.0 — Enterprise Digital Twin Tests
 * Verification of stateful synchronization between Digital Twin Store and RealityEngine.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useDigitalTwinStore } from '../reality/digitalTwinStore';
import { globalRealityEngine } from '../reality/RealityEngine';

describe('Digital Twin Foundation & RealityEngine Synchronization', () => {
  beforeEach(() => {
    // Reset baseline state
    globalRealityEngine.initEnterpriseEnvironment();
    useDigitalTwinStore.getState().syncWithRealityEngine();
  });

  it('initializes NEXORA Headquarters with Server Room and RACK-01', () => {
    const store = useDigitalTwinStore.getState();

    // Verify rooms
    expect(store.rooms['server-room']).toBeDefined();
    expect(store.rooms['finance-dept']).toBeDefined();
    expect(store.rooms['server-room'].racks).toContain('RACK-01');

    // Verify RACK-01 42U
    const rack = store.racks['RACK-01'];
    expect(rack).toBeDefined();
    expect(rack.totalUnits).toBe(42);
    expect(rack.devices).toContain('DC01');
    expect(rack.devices).toContain('FILE01');
    expect(rack.devices).toContain('CORE-SW01');
    expect(rack.devices).toContain('FW-01');
  });

  it('maps visual devices directly to authentic RealityEngine machines', () => {
    const store = useDigitalTwinStore.getState();
    const dc01 = store.devices['DC01'];
    expect(dc01).toBeDefined();
    expect(dc01.realityMachineId).toBe('DC01');

    // Verify backing WindowsMachine in RealityEngine
    const realMachine = globalRealityEngine.registry.getMachine('DC01');
    expect(realMachine).toBeDefined();
    expect(realMachine?.hostname).toBe('DC01');
    expect(realMachine?.domain).toBe('NEXORA.LOCAL');
    expect(realMachine?.ipAddress).toBe('10.10.10.10');
    expect(realMachine?.status).toBe('ONLINE');

    // Check active processes
    const procs = realMachine?.getProcesses() || [];
    expect(procs.length).toBeGreaterThan(0);
    expect(procs.some((p) => p.name === 'System')).toBe(true);
  });

  it('synchronizes power state: shutting down DC01 halts RealityEngine processes', () => {
    const store = useDigitalTwinStore.getState();
    const dc01Before = store.devices['DC01'];
    expect(dc01Before.powerStatus).toBe('ONLINE');

    // Toggle power off
    store.toggleDevicePower('DC01');

    const dc01After = useDigitalTwinStore.getState().devices['DC01'];
    expect(dc01After.powerStatus).toBe('OFFLINE');
    expect(dc01After.leds.power).toBe('off');
    expect(dc01After.fanRpm).toBe(0);

    // Verify RealityEngine machine is OFFLINE and processes are terminated
    const realMachine = globalRealityEngine.registry.getMachine('DC01');
    expect(realMachine?.status).toBe('OFFLINE');
    const runningProcs = (realMachine?.getProcesses() || []).filter((p) => p.status === 'Running');
    expect(runningProcs.length).toBe(0);

    // Toggle power back on (Boot)
    store.toggleDevicePower('DC01');
    const dc01Rebooted = useDigitalTwinStore.getState().devices['DC01'];
    expect(dc01Rebooted.powerStatus).toBe('ONLINE');
    expect(dc01Rebooted.leds.power).toBe('green');
    expect(realMachine?.status).toBe('ONLINE');
    expect((realMachine?.getProcesses() || []).filter((p) => p.status === 'Running').length).toBeGreaterThan(0);
  });

  it('manages 48-port switch matrix on CORE-SW01', () => {
    const store = useDigitalTwinStore.getState();
    const sw = store.devices['CORE-SW01'];
    expect(sw).toBeDefined();
    expect(sw.ports).toBeDefined();
    expect(sw.ports?.length).toBe(48);

    // Port 10 is connected to DC01 on server VLAN 20
    const port10 = sw.ports?.find((p) => p.portNumber === 10);
    expect(port10).toBeDefined();
    expect(port10?.linkState).toBe('UP');
    expect(port10?.vlan).toBe(20);
    expect(port10?.connectedDevice).toBe('DC01');

    // Port 24 is patched to PP-01 (which links to FIN-WS01) on workstation VLAN 30
    const port24 = sw.ports?.find((p) => p.portNumber === 24);
    expect(port24).toBeDefined();
    expect(port24?.linkState).toBe('UP');
    expect(port24?.vlan).toBe(30);
    expect(port24?.connectedDevice).toBe('PP-01');
  });

  it('supports camera mode and accessible 2D schematic toggles', () => {
    const store = useDigitalTwinStore.getState();

    // Default 3D WebGL mode
    expect(store.renderMode).toBe('3d-webgl');

    // Switch to 2D schematic
    store.setRenderMode('2d-schematic');
    expect(useDigitalTwinStore.getState().renderMode).toBe('2d-schematic');

    // Switch camera modes
    store.setCameraMode('building');
    expect(useDigitalTwinStore.getState().cameraMode).toBe('building');

    store.setCameraMode('rack');
    expect(useDigitalTwinStore.getState().cameraMode).toBe('rack');

    // Selecting workstation sets camera mode to workstation
    store.selectDevice('FIN-WS01');
    expect(useDigitalTwinStore.getState().cameraMode).toBe('workstation');
    expect(useDigitalTwinStore.getState().selectedDeviceId).toBe('FIN-WS01');
  });

  it('manages first-class physical cable topology and disconnect/reconnect simulation', () => {
    const store = useDigitalTwinStore.getState();

    // Verify initial cable topology
    expect(store.cables['CAB-UPLINK-01']).toBeDefined();
    expect(store.cables['CAB-SRV-DC01']).toBeDefined();
    expect(store.cables['CAB-SRV-FL01']).toBeDefined();
    expect(store.cables['CAB-PATCH-WS01']).toBeDefined();

    const dcCable = store.cables['CAB-SRV-DC01'];
    expect(dcCable.status).toBe('CONNECTED');
    expect(dcCable.linkSpeedMbps).toBe(10000);

    // Switch port 10 is UP initially
    const swBefore = store.devices['CORE-SW01'];
    const p10Before = swBefore.ports?.find((p) => p.portNumber === 10);
    expect(p10Before?.linkState).toBe('UP');

    // Disconnect physical cable CAB-SRV-DC01
    store.disconnectCable('CAB-SRV-DC01');

    const storeAfterDisconnect = useDigitalTwinStore.getState();
    const dcCableAfter = storeAfterDisconnect.cables['CAB-SRV-DC01'];
    expect(dcCableAfter.status).toBe('DISCONNECTED');
    expect(dcCableAfter.connected).toBe(false);

    // Switch port 10 must now be DOWN
    const swAfter = storeAfterDisconnect.devices['CORE-SW01'];
    const p10After = swAfter.ports?.find((p) => p.portNumber === 10);
    expect(p10After?.linkState).toBe('DOWN');

    // DC01 interface must now be DOWN
    const dc01After = storeAfterDisconnect.devices['DC01'];
    const dcNic = dc01After.interfaces?.find((i) => i.connectedCableId === 'CAB-SRV-DC01');
    expect(dcNic?.status).toBe('DOWN');

    // Reconnect the physical cable
    store.connectCable('CAB-SRV-DC01');
    const storeReconnected = useDigitalTwinStore.getState();
    expect(storeReconnected.cables['CAB-SRV-DC01'].status).toBe('CONNECTED');
    const p10Restored = storeReconnected.devices['CORE-SW01'].ports?.find((p) => p.portNumber === 10);
    expect(p10Restored?.linkState).toBe('UP');
  });

  it('supports camera view transitions including rack-front and rack-rear', () => {
    const store = useDigitalTwinStore.getState();
    store.setCameraMode('rack-front');
    expect(useDigitalTwinStore.getState().cameraMode).toBe('rack-front');

    store.setCameraMode('rack-rear');
    expect(useDigitalTwinStore.getState().cameraMode).toBe('rack-rear');
  });
});
