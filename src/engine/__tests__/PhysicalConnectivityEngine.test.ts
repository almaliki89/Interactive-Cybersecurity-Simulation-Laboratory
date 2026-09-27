/**
 * OMEGA ULTRA REALITY V1.1.2 — Physical Connectivity Engine Tests
 *
 * Dedicated test suite verifying true physical layer (L1) reachability
 * across the enterprise digital twin topology (cables, patch panels, wall drops, switches, PDU/UPS dependencies).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useDigitalTwinStore } from '../reality/digitalTwinStore';
import { globalRealityEngine } from '../reality/RealityEngine';
import { PhysicalConnectivityEngine } from '../reality/PhysicalConnectivityEngine';

describe('PhysicalConnectivityEngine — L1 Physical Layer Reachability', () => {
  beforeEach(() => {
    // Reset baseline RealityEngine and DigitalTwinStore state
    globalRealityEngine.initEnterpriseEnvironment();
    useDigitalTwinStore.getState().syncWithRealityEngine();

    // Ensure initial baseline topology has all cables connected and devices online
    const store = useDigitalTwinStore.getState();
    Object.keys(store.cables).forEach((cId) => {
      store.connectCable(cId);
    });
    Object.keys(store.devices).forEach((dId) => {
      if (store.devices[dId].powerStatus !== 'ONLINE') {
        store.toggleDevicePower(dId);
      }
    });
  });

  it('FIN-WS01 -> DC01 initially available over multi-hop physical infrastructure', () => {
    const { devices, cables } = useDigitalTwinStore.getState();

    const isAvailable = PhysicalConnectivityEngine.isPhysicalPathAvailable(
      'FIN-WS01',
      'DC01',
      devices,
      cables
    );
    expect(isAvailable).toBe(true);

    const pathResult = PhysicalConnectivityEngine.getPhysicalPath(
      'FIN-WS01',
      'DC01',
      devices,
      cables
    );
    expect(pathResult.available).toBe(true);
    expect(pathResult.hops.length).toBeGreaterThanOrEqual(3);
    // Path traverses: FIN-WS01 -> PP-01 -> CORE-SW01 -> DC01
    expect(pathResult.hops[0].fromDevice).toBe('FIN-WS01');
    expect(pathResult.hops[pathResult.hops.length - 1].toDevice).toBe('DC01');
  });

  it('disconnecting CAB-SRV-DC01 renders FIN-WS01 -> DC01 unavailable', () => {
    const store = useDigitalTwinStore.getState();

    // Disconnect DC01 server cable
    store.disconnectCable('CAB-SRV-DC01');

    const { devices, cables } = useDigitalTwinStore.getState();
    const isAvailable = PhysicalConnectivityEngine.isPhysicalPathAvailable(
      'FIN-WS01',
      'DC01',
      devices,
      cables
    );
    expect(isAvailable).toBe(false);

    const pathResult = PhysicalConnectivityEngine.getPhysicalPath(
      'FIN-WS01',
      'DC01',
      devices,
      cables
    );
    expect(pathResult.available).toBe(false);
    expect(pathResult.brokenAt?.type).toBe('CABLE_DISCONNECTED');
  });

  it('reconnecting CAB-SRV-DC01 restores path availability', () => {
    const store = useDigitalTwinStore.getState();

    // Disconnect then reconnect
    store.disconnectCable('CAB-SRV-DC01');
    expect(
      PhysicalConnectivityEngine.isPhysicalPathAvailable(
        'FIN-WS01',
        'DC01',
        useDigitalTwinStore.getState().devices,
        useDigitalTwinStore.getState().cables
      )
    ).toBe(false);

    store.connectCable('CAB-SRV-DC01');
    const { devices, cables } = useDigitalTwinStore.getState();
    const isRestored = PhysicalConnectivityEngine.isPhysicalPathAvailable(
      'FIN-WS01',
      'DC01',
      devices,
      cables
    );
    expect(isRestored).toBe(true);
  });

  it('CORE-SW01 powered OFF: path unavailable due to intermediate device power down', () => {
    const store = useDigitalTwinStore.getState();

    // Power down the distribution core switch
    store.toggleDevicePower('CORE-SW01');

    const { devices, cables } = useDigitalTwinStore.getState();
    const isAvailable = PhysicalConnectivityEngine.isPhysicalPathAvailable(
      'FIN-WS01',
      'DC01',
      devices,
      cables
    );
    expect(isAvailable).toBe(false);

    const pathResult = PhysicalConnectivityEngine.getPhysicalPath(
      'FIN-WS01',
      'DC01',
      devices,
      cables
    );
    expect(pathResult.available).toBe(false);
    expect(pathResult.brokenAt?.type).toBe('DEVICE_POWER');
    expect(pathResult.brokenAt?.elementId).toBe('CORE-SW01');
  });

  it('PDU-01 OFF: rack power cascade renders rack path unavailable', () => {
    const store = useDigitalTwinStore.getState();

    // Power down PDU-01, cascading shutdown to CORE-SW01, DC01, FW-01, FILE01
    store.toggleDevicePower('PDU-01');

    const { devices, cables } = useDigitalTwinStore.getState();
    const isAvailable = PhysicalConnectivityEngine.isPhysicalPathAvailable(
      'FIN-WS01',
      'DC01',
      devices,
      cables
    );
    expect(isAvailable).toBe(false);

    const pathResult = PhysicalConnectivityEngine.getPhysicalPath(
      'FIN-WS01',
      'DC01',
      devices,
      cables
    );
    expect(pathResult.available).toBe(false);
    expect(pathResult.brokenAt?.type).toBe('DEVICE_POWER');
  });

  it('disconnected workstation wall cable: FIN-WS01 -> network unavailable', () => {
    const store = useDigitalTwinStore.getState();

    // Disconnect the horizontal structured wall cable for FIN-WS01
    store.disconnectCable('CAB-WALL-WS01');

    const { devices, cables } = useDigitalTwinStore.getState();
    const isAvailableToDC01 = PhysicalConnectivityEngine.isPhysicalPathAvailable(
      'FIN-WS01',
      'DC01',
      devices,
      cables
    );
    expect(isAvailableToDC01).toBe(false);

    const isAvailableToCore = PhysicalConnectivityEngine.isPhysicalPathAvailable(
      'FIN-WS01',
      'CORE-SW01',
      devices,
      cables
    );
    expect(isAvailableToCore).toBe(false);

    const pathResult = PhysicalConnectivityEngine.getPhysicalPath(
      'FIN-WS01',
      'DC01',
      devices,
      cables
    );
    expect(pathResult.available).toBe(false);
    expect(pathResult.brokenAt?.type).toBe('CABLE_DISCONNECTED');
    expect(pathResult.brokenAt?.elementId).toBe('CAB-WALL-WS01');
  });

  it('unknown device returns NO_ROUTE', () => {
    const { devices, cables } = useDigitalTwinStore.getState();

    const pathResult = PhysicalConnectivityEngine.getPhysicalPath(
      'UNKNOWN-DEVICE-999',
      'DC01',
      devices,
      cables
    );

    expect(pathResult.available).toBe(false);
    expect(pathResult.brokenAt?.type).toBe('NO_ROUTE');

    const reverseResult = PhysicalConnectivityEngine.getPhysicalPath(
      'FIN-WS01',
      'NON-EXISTENT-TARGET',
      devices,
      cables
    );

    expect(reverseResult.available).toBe(false);
    expect(reverseResult.brokenAt?.type).toBe('NO_ROUTE');
  });
});
