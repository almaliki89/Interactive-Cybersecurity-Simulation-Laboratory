/**
 * OMEGA ULTRA REALITY — Digital Twin Store
 * State management for NEXORA HQ, RACK-01, hardware devices, and synchronized RealityEngine state.
 */

import { create } from 'zustand';
import {
  DigitalTwinState,
  DigitalTwinDevice,
  ServerRack,
  BuildingRoom,
  RoomId,
  CameraViewMode,
} from './digitalTwinTypes';
import { globalRealityEngine } from './RealityEngine';
import { globalSimulationRuntime } from '../runtime/SimulationRuntime';

interface DigitalTwinActions {
  selectDevice: (deviceId: string | null) => void;
  selectRoom: (roomId: RoomId) => void;
  setCameraMode: (mode: CameraViewMode) => void;
  setRenderMode: (mode: '3d-webgl' | '2d-schematic') => void;
  toggleDevicePower: (deviceId: string) => void;
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
    devices: ['DC01', 'FILE01', 'CORE-SW01', 'FW-01', 'PDU-01', 'UPS-01'],
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
    exhaustTempCelsius: 28.6,
    totalPowerWatts: 1840,
    fanRpm: 3200,
    pduOnline: true,
    upsOnline: true,
    devices: ['FW-01', 'CORE-SW01', 'DC01', 'FILE01', 'PDU-01', 'UPS-01'],
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
    let macLearned: string | undefined = undefined;
    let speed = '1000 Mbps Full-Duplex';

    if (i === 1) {
      // Uplink to Firewall
      linkState = 'UP';
      vlan = 1;
      connectedDevice = 'FW-01';
      connectedPort = 'ge-0/0/1';
      macLearned = '00:50:56:A1:B2:C1';
      speed = '10 Gbps SFP+';
    } else if (i === 10) {
      // DC01
      linkState = 'UP';
      vlan = 20; // Server VLAN
      connectedDevice = 'DC01';
      connectedPort = 'NIC1 (Ethernet0)';
      macLearned = '00:50:56:DC:01:01';
    } else if (i === 12) {
      // FILE01
      linkState = 'UP';
      vlan = 20; // Server VLAN
      connectedDevice = 'FILE01';
      connectedPort = 'NIC1 (Ethernet0)';
      macLearned = '00:50:56:FL:01:01';
    } else if (i === 24) {
      // FIN-WS01 (Sara)
      linkState = 'UP';
      vlan = 30; // Client VLAN
      connectedDevice = 'FIN-WS01';
      connectedPort = 'Realtek GbE Port';
      macLearned = '00:1A:2B:3C:4D:5E';
    } else if (i === 25) {
      // HR-WS01
      linkState = 'UP';
      vlan = 30;
      connectedDevice = 'HR-WS01';
      macLearned = '00:1A:2B:3C:4D:6F';
    } else if (i === 26) {
      // IT-WS01
      linkState = 'UP';
      vlan = 30;
      connectedDevice = 'IT-WS01';
      macLearned = '00:1A:2B:3C:4D:7A';
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
    });
  }
  return ports;
};

const INITIAL_DEVICES: Record<string, DigitalTwinDevice> = {
  DC01: {
    id: 'DC01',
    name: 'DC01 — Primary Active Directory & DNS Domain Controller',
    category: 'server',
    roomId: 'server-room',
    rackId: 'RACK-01',
    rackUnitStart: 30,
    rackUnitHeight: 2,
    model: 'Nexora ProServer Enterprise R740 (2U)',
    serialNumber: 'NX-SRV-2026-DC01-PRO',
    powerStatus: 'ONLINE',
    healthStatus: 'HEALTHY',
    realityMachineId: 'DC01',
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
      { name: 'Ethernet0 (NIC1)', ip: '10.10.10.10', mac: '00:50:56:DC:01:01', status: 'UP', speedMbps: 10000 },
      { name: 'Ethernet1 (NIC2)', ip: '10.10.10.11', mac: '00:50:56:DC:01:02', status: 'DOWN', speedMbps: 10000 },
    ],
  },
  FILE01: {
    id: 'FILE01',
    name: 'FILE01 — Enterprise SMB Share & Volume Storage Array',
    category: 'server',
    roomId: 'server-room',
    rackId: 'RACK-01',
    rackUnitStart: 26,
    rackUnitHeight: 2,
    model: 'Nexora StoreVault StorageArray S3200 (2U 12-Bay)',
    serialNumber: 'NX-SRV-2026-FL01-STG',
    powerStatus: 'ONLINE',
    healthStatus: 'HEALTHY',
    realityMachineId: 'FILE01',
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
      { name: 'Ethernet0 (NIC1)', ip: '10.10.20.10', mac: '00:50:56:FL:01:01', status: 'UP', speedMbps: 10000 },
      { name: 'iSCSI-SAN0', ip: '192.168.100.10', mac: '00:50:56:FL:01:03', status: 'UP', speedMbps: 10000 },
    ],
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
    temperatureCelsius: 34.0,
    fanRpm: 4200,
    powerWatts: 180,
    leds: {
      power: 'green',
      activity: 'blink',
      network: 'green',
    },
    ports: generateSwitchPorts(),
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
    temperatureCelsius: 36.4,
    fanRpm: 4600,
    powerWatts: 195,
    leds: {
      power: 'green',
      activity: 'blink',
      network: 'green',
    },
    interfaces: [
      { name: 'ge-0/0/0 (WAN Ingress)', ip: '198.51.100.254', mac: '00:50:56:A1:B2:C0', status: 'UP', speedMbps: 10000 },
      { name: 'ge-0/0/1 (LAN Core Trunk)', ip: '10.10.1.1', mac: '00:50:56:A1:B2:C1', status: 'UP', speedMbps: 10000 },
      { name: 'ge-0/0/2 (DMZ Services)', ip: '172.16.1.1', mac: '00:50:56:A1:B2:C2', status: 'UP', speedMbps: 1000 },
      { name: 'mgmt0 (Out-of-Band)', ip: '192.168.1.1', mac: '00:50:56:A1:B2:C3', status: 'UP', speedMbps: 1000 },
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
      { name: 'Realtek PCIe GbE', ip: '10.10.30.15', mac: '00:1A:2B:3C:4D:5E', status: 'UP', speedMbps: 1000 },
    ],
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
    temperatureCelsius: 24.1,
    fanRpm: 0,
    powerWatts: 1840,
    leds: {
      power: 'green',
      activity: 'green',
      network: 'off',
    },
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
    powerWatts: 1840,
    leds: {
      power: 'green',
      activity: 'green',
      network: 'green',
    },
  },
};

export const useDigitalTwinStore = create<DigitalTwinState & DigitalTwinActions>((set, get) => ({
  selectedDeviceId: 'DC01',
  selectedRoomId: 'server-room',
  cameraMode: 'rack',
  renderMode: '3d-webgl',
  rooms: INITIAL_ROOMS,
  racks: INITIAL_RACKS,
  devices: INITIAL_DEVICES,
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
        selectedRoomId: device.roomId,
        cameraMode: device.category === 'workstation' ? 'workstation' : 'device',
      });
    }
  },

  selectRoom: (roomId) => {
    const room = get().rooms[roomId];
    if (!room) return;
    set({
      selectedRoomId: roomId,
      cameraMode: 'room',
      selectedDeviceId: room.devices.length > 0 ? room.devices[0] : null,
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

    // 1. Synchronize with underlying RealityEngine if this device has a backing WindowsMachine
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

    // 2. Update visual twin device state
    const updatedDevice: DigitalTwinDevice = {
      ...currentDevice,
      powerStatus: newStatus,
      healthStatus: newStatus === 'ONLINE' ? 'HEALTHY' : 'CRITICAL',
      fanRpm: newStatus === 'ONLINE' ? (currentDevice.category === 'workstation' ? 1800 : 4800) : 0,
      powerWatts: newStatus === 'ONLINE' ? (currentDevice.category === 'workstation' ? 145 : 340) : 0,
      temperatureCelsius: newStatus === 'ONLINE' ? 38.0 : 21.0,
      leds: {
        power: newStatus === 'ONLINE' ? 'green' : 'off',
        activity: newStatus === 'ONLINE' ? 'blink' : 'off',
        network: newStatus === 'ONLINE' ? 'blink' : 'off',
        storage: newStatus === 'ONLINE' ? 'blink' : 'off',
      },
    };

    // 3. Dispatch telemetry event to Simulation Runtime
    globalSimulationRuntime.dispatch({
      type: newStatus === 'ONLINE' ? 'POWER_ON' : 'POWER_OFF',
      category: 'HARDWARE',
      source: currentDevice.id,
      target: currentDevice.model,
      severity: newStatus === 'ONLINE' ? 'info' : 'warn',
      description: `Physical device ${currentDevice.id} transitioned to state ${newStatus}`,
      payload: {
        deviceId: currentDevice.id,
        rackId: currentDevice.rackId,
        roomId: currentDevice.roomId,
        newPowerStatus: newStatus,
        virtualTime: vTime,
      },
    });

    set((state) => ({
      devices: {
        ...state.devices,
        [deviceId]: updatedDevice,
      },
    }));
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
