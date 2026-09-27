/**
 * OMEGA ULTRA REALITY V1.1 — Digital Twin Store
 * Physical Infrastructure, Cable Topology Engine, Power Dependencies & RealityEngine Sync.
 */

import { create } from 'zustand';
import {
  DigitalTwinState,
  DigitalTwinDevice,
  ServerRack,
  BuildingRoom,
  CableState,
  RoomId,
  CameraViewMode,
} from './digitalTwinTypes';
import { globalRealityEngine } from './RealityEngine';
import { globalSimulationRuntime } from '../runtime/SimulationRuntime';

interface DigitalTwinActions {
  selectDevice: (deviceId: string | null) => void;
  selectCable: (cableId: string | null) => void;
  selectRoom: (roomId: RoomId) => void;
  setCameraMode: (mode: CameraViewMode) => void;
  setRenderMode: (mode: '3d-webgl' | '2d-schematic') => void;
  toggleDevicePower: (deviceId: string) => void;
  disconnectCable: (cableId: string) => void;
  connectCable: (cableId: string) => void;
  selectPort: (portNumber: number | null) => void;
  syncWithRealityEngine: () => void;
  setAmbientNoiseMuted: (muted: boolean) => void;
}

const INITIAL_ROOMS: Record<RoomId, BuildingRoom> = {
  'server-room': {
    id: 'server-room',
    nameEn: 'Data Center & Server Room',
    nameAr: 'غرفة الخوادم ومركز البيانات',
    sector: 'Zone-A (Secure Core)',
    floor: 1,
    ambientTempCelsius: 20.5,
    accessLevel: 'Restricted Airgap',
    racks: ['RACK-01'],
    devices: ['PP-01', 'FW-01', 'CORE-SW01', 'DC01', 'FILE01', 'PDU-01', 'UPS-01'],
  },
  'finance-dept': {
    id: 'finance-dept',
    nameEn: 'Finance Department',
    nameAr: 'قسم المالية والمحاسبة',
    sector: 'Zone-B (Corporate)',
    floor: 2,
    ambientTempCelsius: 22.0,
    accessLevel: 'Employee',
    racks: [],
    devices: ['FIN-WS01'],
  },
  'it-dept': {
    id: 'it-dept',
    nameEn: 'IT Operations & Infrastructure',
    nameAr: 'عمليات البنية التحتية وتكنولوجيا المعلومات',
    sector: 'Zone-B (Corporate)',
    floor: 2,
    ambientTempCelsius: 21.8,
    accessLevel: 'Confidential',
    racks: [],
    devices: ['IT-WS01'],
  },
  soc: {
    id: 'soc',
    nameEn: 'Security Operations Center (SOC)',
    nameAr: 'مركز عمليات الأمن السيبراني',
    sector: 'Zone-A (Defense Core)',
    floor: 1,
    ambientTempCelsius: 21.0,
    accessLevel: 'Restricted Airgap',
    racks: [],
    devices: [],
  },
  netops: {
    id: 'netops',
    nameEn: 'Network Operations Room (NOC)',
    nameAr: 'غرفة إدارة الشبكات NOC',
    sector: 'Zone-A (Network Hub)',
    floor: 1,
    ambientTempCelsius: 21.2,
    accessLevel: 'Confidential',
    racks: [],
    devices: [],
  },
  reception: {
    id: 'reception',
    nameEn: 'Headquarters Reception',
    nameAr: 'استقبال المقر الرئيسي',
    sector: 'Zone-C (Public Intake)',
    floor: 1,
    ambientTempCelsius: 23.0,
    accessLevel: 'Public',
    racks: [],
    devices: [],
  },
  'hr-dept': {
    id: 'hr-dept',
    nameEn: 'Human Resources Department',
    nameAr: 'قسم الموارد البشرية',
    sector: 'Zone-B (Corporate)',
    floor: 2,
    ambientTempCelsius: 22.2,
    accessLevel: 'Employee',
    racks: [],
    devices: ['HR-WS01'],
  },
  'data-center': {
    id: 'data-center',
    nameEn: 'Primary Ingress Vault',
    nameAr: 'خزينة الاتصال الخارجي والمزودات',
    sector: 'Zone-A (Telco DMZ)',
    floor: 1,
    ambientTempCelsius: 19.8,
    accessLevel: 'Restricted Airgap',
    racks: [],
    devices: [],
  },
};

const INITIAL_RACKS: Record<string, ServerRack> = {
  'RACK-01': {
    id: 'RACK-01',
    name: 'RACK-01 (Primary Core Rack 42U)',
    roomId: 'server-room',
    totalUnits: 42,
    temperatureCelsius: 21.4,
    intakeTempCelsius: 19.2,
    exhaustTempCelsius: 27.8,
    totalPowerWatts: 1135,
    fanRpm: 3200,
    pduOnline: true,
    upsOnline: true,
    devices: ['PP-01', 'FW-01', 'CORE-SW01', 'DC01', 'FILE01', 'PDU-01', 'UPS-01'],
  },
};

// 48-port switch port array generator
const generateSwitchPorts = () => {
  const ports = [];
  for (let i = 1; i <= 48; i++) {
    let linkState: 'UP' | 'DOWN' = 'DOWN';
    let vlan = 30; // Default workstations
    let connectedDevice: string | undefined = undefined;
    let connectedPort: string | undefined = undefined;
    let connectedCableId: string | undefined = undefined;
    let macLearned: string | undefined = undefined;
    let speed = '1000 Mbps Full-Duplex';

    if (i === 1) {
      // Uplink to Firewall
      linkState = 'UP';
      vlan = 1;
      connectedDevice = 'FW-01';
      connectedPort = 'ge-0/0/1';
      connectedCableId = 'CAB-UPLINK-01';
      macLearned = '00:50:56:A1:B2:C1';
      speed = '10 Gbps SFP+';
    } else if (i === 10) {
      // DC01
      linkState = 'UP';
      vlan = 20; // Server VLAN
      connectedDevice = 'DC01';
      connectedPort = 'NIC1 (Ethernet0)';
      connectedCableId = 'CAB-SRV-DC01';
      macLearned = '00:50:56:DC:01:01';
    } else if (i === 12) {
      // FILE01
      linkState = 'UP';
      vlan = 20; // Server VLAN
      connectedDevice = 'FILE01';
      connectedPort = 'NIC1 (Ethernet0)';
      connectedCableId = 'CAB-SRV-FL01';
      macLearned = '00:50:56:FL:01:01';
    } else if (i === 24) {
      // FIN-WS01 (via Patch Panel PP-01 Port 24)
      linkState = 'UP';
      vlan = 30; // Client VLAN
      connectedDevice = 'PP-01';
      connectedPort = 'Port 24';
      connectedCableId = 'CAB-PATCH-WS01';
      macLearned = '00:1A:2B:3C:4D:5E';
    } else if (i === 48) {
      // Out-of-band management
      linkState = 'UP';
      vlan = 10;
      connectedDevice = 'PDU-01';
      connectedPort = 'MGMT-ETH';
      connectedCableId = 'CAB-MGMT-01';
      speed = '100 Mbps Fast-Ethernet';
    }

    ports.push({
      portNumber: i,
      label: `Gi1/0/${i}`,
      linkState,
      speed,
      vlan,
      macLearned,
      txPackets: linkState === 'UP' ? 14200 + i * 340 : 0,
      rxPackets: linkState === 'UP' ? 28900 + i * 620 : 0,
      errors: 0,
      connectedDevice,
      connectedPort,
      connectedCableId,
      stateOrigin: 'DERIVED' as const,
    });
  }
  return ports;
};

// 48-port Patch Panel ports
const generatePatchPanelPorts = () => {
  const ports = [];
  for (let i = 1; i <= 48; i++) {
    let rearDestination = `Office Wall Drop Zone-B #${i}`;
    let frontConnectedCableId: string | undefined = undefined;
    let linkActive = false;

    if (i === 24) {
      rearDestination = 'Finance Dept Desk-01 (Sara / FIN-WS01)';
      frontConnectedCableId = 'CAB-PATCH-WS01';
      linkActive = true;
    }

    ports.push({
      portNumber: i,
      label: `PP-P${i}`,
      rearDestination,
      frontConnectedCableId,
      linkActive,
    });
  }
  return ports;
};

const INITIAL_DEVICES: Record<string, DigitalTwinDevice> = {
  'PP-01': {
    id: 'PP-01',
    name: 'PP-01 — 48-Port Cat6A Keystone Distribution Patch Panel',
    category: 'patch-panel',
    roomId: 'server-room',
    rackId: 'RACK-01',
    rackUnitStart: 40,
    rackUnitHeight: 1,
    model: 'Nexora PatchPro 48-Port Cat6A 1U Unshielded Keystone',
    serialNumber: 'NX-PP-2026-01-48P',
    powerStatus: 'ONLINE',
    healthStatus: 'HEALTHY',
    temperatureCelsius: 20.5,
    fanRpm: 0,
    powerWatts: 0, // Passive hardware
    leds: {
      power: 'off',
      activity: 'off',
      network: 'off',
    },
    patchPanelPorts: generatePatchPanelPorts(),
    stateOrigin: 'SEEDED_BASELINE',
  },
  'FW-01': {
    id: 'FW-01',
    name: 'FW-01 — Next-Gen Perimeter Firewall & Threat Gateway',
    category: 'firewall',
    roomId: 'server-room',
    rackId: 'RACK-01',
    rackUnitStart: 38,
    rackUnitHeight: 1,
    model: 'Nexora SecureWall EdgePro 600F (1U NGFW)',
    serialNumber: 'NX-FW-2026-ED01-NGF',
    powerStatus: 'ONLINE',
    healthStatus: 'HEALTHY',
    poweredBy: 'PDU-01',
    temperatureCelsius: 36.4,
    fanRpm: 4600,
    powerWatts: 195,
    leds: {
      power: 'green',
      activity: 'blink',
      network: 'green',
    },
    interfaces: [
      { name: 'ge-0/0/0 (WAN Ingress)', ip: '198.51.100.254', mac: '00:50:56:A1:B2:C0', status: 'UP', speedMbps: 10000, stateOrigin: 'DERIVED' },
      { name: 'ge-0/0/1 (LAN Core Trunk)', ip: '10.10.1.1', mac: '00:50:56:A1:B2:C1', status: 'UP', speedMbps: 10000, connectedCableId: 'CAB-UPLINK-01', stateOrigin: 'DERIVED' },
      { name: 'ge-0/0/2 (DMZ Services)', ip: '172.16.1.1', mac: '00:50:56:A1:B2:C2', status: 'UP', speedMbps: 1000, stateOrigin: 'DERIVED' },
      { name: 'mgmt0 (Out-of-Band)', ip: '192.168.1.1', mac: '00:50:56:A1:B2:C3', status: 'UP', speedMbps: 1000, stateOrigin: 'DERIVED' },
    ],
    firewallState: {
      zones: [
        { name: 'WAN', interfaces: ['ge-0/0/0'], defaultAction: 'DROP', activeSessions: 84 },
        { name: 'INTERNAL-SERVERS', interfaces: ['ge-0/0/1'], defaultAction: 'ALLOW', activeSessions: 320 },
        { name: 'DMZ', interfaces: ['ge-0/0/2'], defaultAction: 'DROP', activeSessions: 18 },
      ],
      activeSessions: 422,
      blockedPackets: 1849,
      inspectionThroughputMbps: 840,
    },
    stateOrigin: 'DERIVED',
  },
  'CORE-SW01': {
    id: 'CORE-SW01',
    name: 'CORE-SW01 — Layer-3 Enterprise Distribution Core Switch',
    category: 'switch',
    roomId: 'server-room',
    rackId: 'RACK-01',
    rackUnitStart: 36,
    rackUnitHeight: 1,
    model: 'Nexora CoreNexus Catalyst 4800X (48-Port GbE + 4x 10G SFP+)',
    serialNumber: 'NX-SW-2026-CR01-CAT',
    powerStatus: 'ONLINE',
    healthStatus: 'HEALTHY',
    poweredBy: 'PDU-01',
    temperatureCelsius: 34.0,
    fanRpm: 4200,
    powerWatts: 180,
    leds: {
      power: 'green',
      activity: 'blink',
      network: 'green',
    },
    ports: generateSwitchPorts(),
    stateOrigin: 'DERIVED',
  },
  DC01: {
    id: 'DC01',
    name: 'DC01 — Primary Active Directory & DNS Domain Controller',
    category: 'server',
    roomId: 'server-room',
    rackId: 'RACK-01',
    rackUnitStart: 30,
    rackUnitHeight: 2,
    model: 'Nexora ProServer Enterprise R740 (2U Rack Server)',
    serialNumber: 'NX-SRV-2026-DC01-PRO',
    powerStatus: 'ONLINE',
    healthStatus: 'HEALTHY',
    realityMachineId: 'DC01',
    poweredBy: 'PDU-01',
    temperatureCelsius: 38.5,
    fanRpm: 4800,
    powerWatts: 340,
    leds: {
      power: 'green',
      activity: 'blink',
      network: 'blink',
      storage: 'blink',
    },
    interfaces: [
      { name: 'Ethernet0 (NIC1)', ip: '10.10.10.10', mac: '00:50:56:DC:01:01', status: 'UP', speedMbps: 10000, connectedCableId: 'CAB-SRV-DC01', stateOrigin: 'REALITY_ENGINE' },
      { name: 'Ethernet1 (NIC2)', ip: '10.10.10.11', mac: '00:50:56:DC:01:02', status: 'DOWN', speedMbps: 10000, stateOrigin: 'REALITY_ENGINE' },
    ],
    stateOrigin: 'REALITY_ENGINE',
  },
  FILE01: {
    id: 'FILE01',
    name: 'FILE01 — Enterprise SMB Share & Volume Storage Array',
    category: 'server',
    roomId: 'server-room',
    rackId: 'RACK-01',
    rackUnitStart: 26,
    rackUnitHeight: 2,
    model: 'Nexora StoreVault StorageArray S3200 (2U 12-Bay SAS)',
    serialNumber: 'NX-SRV-2026-FL01-STG',
    powerStatus: 'ONLINE',
    healthStatus: 'HEALTHY',
    realityMachineId: 'FILE01',
    poweredBy: 'PDU-01',
    temperatureCelsius: 41.2,
    fanRpm: 5100,
    powerWatts: 420,
    leds: {
      power: 'green',
      activity: 'blink',
      network: 'blink',
      storage: 'blink',
    },
    interfaces: [
      { name: 'Ethernet0 (NIC1)', ip: '10.10.20.10', mac: '00:50:56:FL:01:01', status: 'UP', speedMbps: 10000, connectedCableId: 'CAB-SRV-FL01', stateOrigin: 'REALITY_ENGINE' },
      { name: 'iSCSI-SAN0', ip: '192.168.100.10', mac: '00:50:56:FL:01:03', status: 'UP', speedMbps: 10000, stateOrigin: 'REALITY_ENGINE' },
    ],
    stateOrigin: 'REALITY_ENGINE',
  },
  'PDU-01': {
    id: 'PDU-01',
    name: 'PDU-01 — Rack Metered Power Distribution Unit',
    category: 'pdu',
    roomId: 'server-room',
    rackId: 'RACK-01',
    rackUnitStart: 1,
    rackUnitHeight: 2,
    model: 'Nexora PowerEdge Metered PDU 32A 230V',
    serialNumber: 'NX-PDU-2026-01',
    powerStatus: 'ONLINE',
    healthStatus: 'HEALTHY',
    poweredBy: 'UPS-01',
    temperatureCelsius: 24.1,
    fanRpm: 0,
    powerWatts: 25, // Internal logic power
    leds: {
      power: 'green',
      activity: 'green',
      network: 'green',
    },
    stateOrigin: 'DERIVED',
  },
  'UPS-01': {
    id: 'UPS-01',
    name: 'UPS-01 — Rack Smart-Online Battery Backup Unit',
    category: 'ups',
    roomId: 'server-room',
    rackId: 'RACK-01',
    rackUnitStart: 3,
    rackUnitHeight: 2,
    model: 'Nexora SmartOnline 3000VA RT 2U Battery Backup',
    serialNumber: 'NX-UPS-2026-01',
    powerStatus: 'ONLINE',
    healthStatus: 'HEALTHY',
    temperatureCelsius: 26.5,
    fanRpm: 2100,
    powerWatts: 45,
    leds: {
      power: 'green',
      activity: 'green',
      network: 'green',
    },
    stateOrigin: 'DERIVED',
  },
  'FIN-WS01': {
    id: 'FIN-WS01',
    name: 'FIN-WS01 — Finance Lead Workstation (Sara / Accounting)',
    category: 'workstation',
    roomId: 'finance-dept',
    model: 'Nexora Precision Tower 5820 + UltraSharp 32" 4K',
    serialNumber: 'NX-WS-2026-FN01-SARA',
    powerStatus: 'ONLINE',
    healthStatus: 'HEALTHY',
    realityMachineId: 'FIN-WS01',
    temperatureCelsius: 32.1,
    fanRpm: 1800,
    powerWatts: 145,
    leds: {
      power: 'green',
      activity: 'blink',
      network: 'blink',
      storage: 'blink',
    },
    interfaces: [
      { name: 'Realtek PCIe GbE', ip: '10.10.30.15', mac: '00:1A:2B:3C:4D:5E', status: 'UP', speedMbps: 1000, connectedCableId: 'CAB-WALL-WS01', stateOrigin: 'REALITY_ENGINE' },
    ],
    stateOrigin: 'REALITY_ENGINE',
  },
};

// First-Class Physical Cable Objects
const INITIAL_CABLES: Record<string, CableState> = {
  'CAB-UPLINK-01': {
    id: 'CAB-UPLINK-01',
    type: 'FIBER_MM',
    sourceDeviceId: 'FW-01',
    sourcePort: 'ge-0/0/1',
    targetDeviceId: 'CORE-SW01',
    targetPort: 'Gi1/0/1',
    status: 'CONNECTED',
    linkSpeedMbps: 10000,
    lengthMeters: 0.5,
    colorLabel: 'aqua', // Fiber optic OM4
    connected: true,
    stateOrigin: 'DERIVED',
  },
  'CAB-SRV-DC01': {
    id: 'CAB-SRV-DC01',
    type: 'CAT6A',
    sourceDeviceId: 'CORE-SW01',
    sourcePort: 'Gi1/0/10',
    targetDeviceId: 'DC01',
    targetPort: 'Ethernet0 (NIC1)',
    status: 'CONNECTED',
    linkSpeedMbps: 10000,
    lengthMeters: 1.2,
    colorLabel: 'red', // Mission-critical DC link
    connected: true,
    stateOrigin: 'DERIVED',
  },
  'CAB-SRV-FL01': {
    id: 'CAB-SRV-FL01',
    type: 'CAT6A',
    sourceDeviceId: 'CORE-SW01',
    sourcePort: 'Gi1/0/12',
    targetDeviceId: 'FILE01',
    targetPort: 'Ethernet0 (NIC1)',
    status: 'CONNECTED',
    linkSpeedMbps: 10000,
    lengthMeters: 1.5,
    colorLabel: 'red', // Mission-critical Storage link
    connected: true,
    stateOrigin: 'DERIVED',
  },
  'CAB-PATCH-WS01': {
    id: 'CAB-PATCH-WS01',
    type: 'CAT6',
    sourceDeviceId: 'PP-01',
    sourcePort: 'Port 24',
    targetDeviceId: 'CORE-SW01',
    targetPort: 'Gi1/0/24',
    status: 'CONNECTED',
    linkSpeedMbps: 1000,
    lengthMeters: 0.8,
    colorLabel: 'blue', // Client LAN
    connected: true,
    stateOrigin: 'DERIVED',
  },
  'CAB-WALL-WS01': {
    id: 'CAB-WALL-WS01',
    type: 'CAT6',
    sourceDeviceId: 'FIN-WS01',
    sourcePort: 'Realtek PCIe GbE',
    targetDeviceId: 'PP-01',
    targetPort: 'Rear-Drop 24',
    status: 'CONNECTED',
    linkSpeedMbps: 1000,
    lengthMeters: 28.0,
    colorLabel: 'blue', // Structured horizontal cabling
    connected: true,
    stateOrigin: 'DERIVED',
  },
  'CAB-MGMT-01': {
    id: 'CAB-MGMT-01',
    type: 'CAT6',
    sourceDeviceId: 'CORE-SW01',
    sourcePort: 'Gi1/0/48',
    targetDeviceId: 'PDU-01',
    targetPort: 'MGMT-ETH',
    status: 'CONNECTED',
    linkSpeedMbps: 100,
    lengthMeters: 2.2,
    colorLabel: 'yellow', // Out-of-band management
    connected: true,
    stateOrigin: 'DERIVED',
  },
};

// Helper: Calculate total rack power draw and derived temperature
function computeRackThermodynamics(devices: Record<string, DigitalTwinDevice>, rack: ServerRack): { totalPowerWatts: number; temperatureCelsius: number } {
  let totalWatts = 0;
  rack.devices.forEach((devId) => {
    const dev = devices[devId];
    if (dev && dev.powerStatus === 'ONLINE') {
      totalWatts += dev.powerWatts;
    }
  });

  // Thermodynamics: Ambient 20.5°C + heat dissipation proportional to active wattage
  const fanCoolingFactor = rack.pduOnline ? 0.0035 : 0.0085;
  const temp = 20.5 + totalWatts * fanCoolingFactor;

  return {
    totalPowerWatts: totalWatts,
    temperatureCelsius: Math.min(Math.round(temp * 10) / 10, 48.0),
  };
}

export const useDigitalTwinStore = create<DigitalTwinState & DigitalTwinActions>((set, get) => ({
  selectedDeviceId: 'DC01',
  selectedCableId: null,
  selectedRoomId: 'server-room',
  cameraMode: 'rack-front',
  renderMode: '3d-webgl',
  rooms: INITIAL_ROOMS,
  racks: INITIAL_RACKS,
  devices: INITIAL_DEVICES,
  cables: INITIAL_CABLES,
  ambientNoiseMuted: true,
  isInspectingPort: null,

  selectDevice: (deviceId) => {
    if (!deviceId) {
      set({ selectedDeviceId: null });
      return;
    }
    const device = get().devices[deviceId];
    if (device) {
      set({
        selectedDeviceId: deviceId,
        selectedCableId: null,
        selectedRoomId: device.roomId,
        cameraMode: device.category === 'workstation' ? 'workstation' : 'device',
      });
    }
  },

  selectCable: (cableId) => {
    if (!cableId) {
      set({ selectedCableId: null });
      return;
    }
    set({ selectedCableId: cableId });
  },

  selectRoom: (roomId) => {
    const room = get().rooms[roomId];
    if (!room) return;
    set({
      selectedRoomId: roomId,
      cameraMode: 'room',
      selectedDeviceId: room.devices.length > 0 ? room.devices[0] : null,
      selectedCableId: null,
    });
  },

  setCameraMode: (mode) => set({ cameraMode: mode }),

  setRenderMode: (mode) => set({ renderMode: mode }),

  setAmbientNoiseMuted: (muted) => set({ ambientNoiseMuted: muted }),

  selectPort: (portNumber) => set({ isInspectingPort: portNumber }),

  toggleDevicePower: (deviceId) => {
    const currentDevice = get().devices[deviceId];
    if (!currentDevice) return;

    const isCurrentlyOnline = currentDevice.powerStatus === 'ONLINE';
    const newStatus = isCurrentlyOnline ? 'OFFLINE' : 'ONLINE';
    const vTime = globalSimulationRuntime.clock.getVirtualTime();

    const devices = { ...get().devices };
    const racks = { ...get().racks };

    // 1. If this device is PDU-01 and it's being turned OFF:
    // Power dependency cascade: All rack devices powered by PDU-01 are powered down!
    if (deviceId === 'PDU-01' && isCurrentlyOnline) {
      Object.keys(devices).forEach((id) => {
        const d = devices[id];
        if (d.poweredBy === 'PDU-01' && d.powerStatus === 'ONLINE') {
          devices[id] = {
            ...d,
            powerStatus: 'OFFLINE',
            healthStatus: 'CRITICAL',
            fanRpm: 0,
            powerWatts: 0,
            leds: { power: 'off', activity: 'off', network: 'off', storage: 'off' },
          };
          if (d.realityMachineId) {
            const machine = globalRealityEngine.registry.getMachine(d.realityMachineId);
            if (machine) machine.shutdown(vTime);
          }
        }
      });
      racks['RACK-01'] = {
        ...racks['RACK-01'],
        pduOnline: false,
        fanRpm: 0,
      };
    } else if (deviceId === 'PDU-01' && !isCurrentlyOnline) {
      racks['RACK-01'] = {
        ...racks['RACK-01'],
        pduOnline: true,
        fanRpm: 3200,
      };
    }

    // 2. Synchronize with underlying RealityEngine if device has a backing WindowsMachine
    if (currentDevice.realityMachineId) {
      const machine = globalRealityEngine.registry.getMachine(currentDevice.realityMachineId);
      if (machine) {
        if (isCurrentlyOnline) {
          machine.shutdown(vTime);
        } else {
          machine.boot(vTime);
        }
      }
    }

    // 3. Update target device state
    devices[deviceId] = {
      ...currentDevice,
      powerStatus: newStatus,
      healthStatus: newStatus === 'ONLINE' ? 'HEALTHY' : 'CRITICAL',
      fanRpm: newStatus === 'ONLINE' ? (currentDevice.category === 'workstation' ? 1800 : 4800) : 0,
      powerWatts: newStatus === 'ONLINE' ? (currentDevice.category === 'workstation' ? 145 : (deviceId === 'PDU-01' ? 25 : 340)) : 0,
      leds: {
        power: newStatus === 'ONLINE' ? 'green' : 'off',
        activity: newStatus === 'ONLINE' ? 'blink' : 'off',
        network: newStatus === 'ONLINE' ? 'blink' : 'off',
        storage: newStatus === 'ONLINE' ? 'blink' : 'off',
      },
    };

    // 4. Recompute Rack-01 total wattage and derived temperature
    const thermo = computeRackThermodynamics(devices, racks['RACK-01']);
    racks['RACK-01'] = {
      ...racks['RACK-01'],
      totalPowerWatts: thermo.totalPowerWatts,
      temperatureCelsius: thermo.temperatureCelsius,
    };

    // 5. Dispatch physical telemetry event
    globalSimulationRuntime.dispatch({
      type: newStatus === 'ONLINE' ? 'HW_POWER_ON' : 'HW_POWER_OFF',
      category: 'HARDWARE',
      source: currentDevice.id,
      target: currentDevice.model,
      severity: newStatus === 'ONLINE' ? 'info' : 'warn',
      description: `Physical power state transition on ${currentDevice.id} -> ${newStatus}`,
      payload: {
        deviceId: currentDevice.id,
        rackId: currentDevice.rackId,
        newPowerStatus: newStatus,
        virtualTime: vTime,
      },
    });

    set({ devices, racks });
  },

  disconnectCable: (cableId) => {
    const cables = { ...get().cables };
    const cable = cables[cableId];
    if (!cable || !cable.connected) return;

    cables[cableId] = {
      ...cable,
      status: 'DISCONNECTED',
      connected: false,
    };

    const devices = { ...get().devices };
    const vTime = globalSimulationRuntime.clock.getVirtualTime();

    // Propagate DOWN to source device port/interface
    const srcDev = devices[cable.sourceDeviceId];
    if (srcDev && srcDev.ports) {
      srcDev.ports = srcDev.ports.map((p) => {
        if (p.connectedCableId === cableId) {
          return { ...p, linkState: 'DOWN' as const, txPackets: p.txPackets, rxPackets: p.rxPackets };
        }
        return p;
      });
    }
    if (srcDev && srcDev.interfaces) {
      srcDev.interfaces = srcDev.interfaces.map((i) => {
        if (i.connectedCableId === cableId) {
          return { ...i, status: 'DOWN' as const };
        }
        return i;
      });
    }

    // Propagate DOWN to target device port/interface
    const tgtDev = devices[cable.targetDeviceId];
    if (tgtDev && tgtDev.ports) {
      tgtDev.ports = tgtDev.ports.map((p) => {
        if (p.connectedCableId === cableId) {
          return { ...p, linkState: 'DOWN' as const };
        }
        return p;
      });
    }
    if (tgtDev && tgtDev.interfaces) {
      tgtDev.interfaces = tgtDev.interfaces.map((i) => {
        if (i.connectedCableId === cableId) {
          return { ...i, status: 'DOWN' as const };
        }
        return i;
      });
    }

    // Dispatch safe runtime event
    globalSimulationRuntime.dispatch({
      type: 'CABLE_DISCONNECTED',
      category: 'HARDWARE',
      source: cable.sourceDeviceId,
      target: cable.targetDeviceId,
      severity: 'warn',
      description: `Physical cable ${cableId} disconnected between ${cable.sourceDeviceId}:${cable.sourcePort} and ${cable.targetDeviceId}:${cable.targetPort}`,
      payload: {
        cableId,
        source: cable.sourceDeviceId,
        target: cable.targetDeviceId,
        virtualTime: vTime,
      },
    });

    globalSimulationRuntime.dispatch({
      type: 'NET_LINK_DOWN',
      category: 'NETWORK',
      source: cable.sourceDeviceId,
      target: cable.targetDeviceId,
      severity: 'warn',
      description: `Physical link DOWN on ${cable.sourceDeviceId} <-> ${cable.targetDeviceId}`,
      payload: {
        cableId,
        virtualTime: vTime,
      },
    });

    set({ cables, devices });
  },

  connectCable: (cableId) => {
    const cables = { ...get().cables };
    const cable = cables[cableId];
    if (!cable || cable.connected) return;

    cables[cableId] = {
      ...cable,
      status: 'CONNECTED',
      connected: true,
    };

    const devices = { ...get().devices };
    const vTime = globalSimulationRuntime.clock.getVirtualTime();

    // Propagate UP to source and target if devices are online
    const srcDev = devices[cable.sourceDeviceId];
    const tgtDev = devices[cable.targetDeviceId];
    const bothPowered = srcDev?.powerStatus === 'ONLINE' && tgtDev?.powerStatus === 'ONLINE';

    if (srcDev && srcDev.ports) {
      srcDev.ports = srcDev.ports.map((p) => {
        if (p.connectedCableId === cableId) {
          return { ...p, linkState: (bothPowered ? 'UP' : 'DOWN') as 'UP' | 'DOWN' };
        }
        return p;
      });
    }
    if (srcDev && srcDev.interfaces) {
      srcDev.interfaces = srcDev.interfaces.map((i) => {
        if (i.connectedCableId === cableId) {
          return { ...i, status: (bothPowered ? 'UP' : 'DOWN') as 'UP' | 'DOWN' };
        }
        return i;
      });
    }

    if (tgtDev && tgtDev.ports) {
      tgtDev.ports = tgtDev.ports.map((p) => {
        if (p.connectedCableId === cableId) {
          return { ...p, linkState: (bothPowered ? 'UP' : 'DOWN') as 'UP' | 'DOWN' };
        }
        return p;
      });
    }
    if (tgtDev && tgtDev.interfaces) {
      tgtDev.interfaces = tgtDev.interfaces.map((i) => {
        if (i.connectedCableId === cableId) {
          return { ...i, status: (bothPowered ? 'UP' : 'DOWN') as 'UP' | 'DOWN' };
        }
        return i;
      });
    }

    // Dispatch safe runtime event
    globalSimulationRuntime.dispatch({
      type: 'CABLE_CONNECTED',
      category: 'HARDWARE',
      source: cable.sourceDeviceId,
      target: cable.targetDeviceId,
      severity: 'info',
      description: `Physical cable ${cableId} connected between ${cable.sourceDeviceId} and ${cable.targetDeviceId}`,
      payload: { cableId, virtualTime: vTime },
    });

    if (bothPowered) {
      globalSimulationRuntime.dispatch({
        type: 'NET_LINK_UP',
        category: 'NETWORK',
        source: cable.sourceDeviceId,
        target: cable.targetDeviceId,
        severity: 'info',
        description: `Physical link UP on ${cable.sourceDeviceId} <-> ${cable.targetDeviceId}`,
        payload: { cableId, virtualTime: vTime },
      });
    }

    set({ cables, devices });
  },

  syncWithRealityEngine: () => {
    const devices = { ...get().devices };
    let hasChanges = false;

    Object.keys(devices).forEach((devId) => {
      const dev = devices[devId];
      if (dev.realityMachineId) {
        const machine = globalRealityEngine.registry.getMachine(dev.realityMachineId);
        if (machine) {
          const isOnline = machine.status === 'ONLINE';
          if (dev.powerStatus !== machine.status) {
            hasChanges = true;
            devices[devId] = {
              ...dev,
              powerStatus: machine.status === 'ONLINE' ? 'ONLINE' : 'OFFLINE',
              healthStatus: machine.status === 'ONLINE' ? 'HEALTHY' : 'CRITICAL',
              fanRpm: isOnline ? (dev.category === 'workstation' ? 1800 : 4800) : 0,
              powerWatts: isOnline ? (dev.category === 'workstation' ? 145 : 340) : 0,
              leds: {
                power: isOnline ? 'green' : 'off',
                activity: isOnline ? 'blink' : 'off',
                network: isOnline ? 'blink' : 'off',
                storage: isOnline ? 'blink' : 'off',
              },
            };
          }
        }
      }
    });

    if (hasChanges) {
      set({ devices });
    }
  },
}));
