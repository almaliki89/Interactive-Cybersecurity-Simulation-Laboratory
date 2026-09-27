/**
 * OMEGA ULTRA REALITY — Enterprise Digital Twin Types
 * Pure deterministic state definitions for hardware, racks, rooms, and physical infrastructure.
 */

export type RoomId =
  | 'reception'
  | 'finance-dept'
  | 'hr-dept'
  | 'it-dept'
  | 'soc'
  | 'netops'
  | 'server-room'
  | 'data-center';

export type CameraViewMode = 'building' | 'room' | 'rack' | 'device' | 'workstation' | 'topology';

export type DeviceCategory =
  | 'server'
  | 'switch'
  | 'firewall'
  | 'workstation'
  | 'pdu'
  | 'ups'
  | 'patch-panel';

export interface DeviceLedState {
  power: 'green' | 'amber' | 'red' | 'off';
  activity: 'green' | 'amber' | 'blink' | 'off';
  network: 'green' | 'amber' | 'blink' | 'off';
  storage?: 'green' | 'amber' | 'blink' | 'off';
}

export interface NetworkInterfaceState {
  name: string;
  ip: string;
  mac: string;
  status: 'UP' | 'DOWN';
  speedMbps: number;
}

export interface SwitchPortState {
  portNumber: number;
  label: string;
  linkState: 'UP' | 'DOWN';
  speed: string;
  vlan: number;
  macLearned?: string;
  txPackets: number;
  rxPackets: number;
  errors: number;
  connectedDevice?: string;
  connectedPort?: string;
}

export interface FirewallZoneState {
  name: string;
  interfaces: string[];
  defaultAction: 'ALLOW' | 'DROP' | 'REJECT';
  activeSessions: number;
}

export interface DigitalTwinDevice {
  id: string;
  name: string;
  category: DeviceCategory;
  roomId: RoomId;
  rackId?: string;
  rackUnitStart?: number; // e.g. 30
  rackUnitHeight?: number; // e.g. 2 for 2U
  model: string;
  serialNumber: string;
  powerStatus: 'ONLINE' | 'OFFLINE';
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  realityMachineId?: string; // Links to WindowsMachine in RealityEngine
  temperatureCelsius: number;
  fanRpm: number;
  powerWatts: number;
  leds: DeviceLedState;
  interfaces?: NetworkInterfaceState[];
  ports?: SwitchPortState[];
  firewallState?: {
    zones: FirewallZoneState[];
    activeSessions: number;
    blockedPackets: number;
    inspectionThroughputMbps: number;
  };
}

export interface ServerRack {
  id: string;
  name: string;
  roomId: RoomId;
  totalUnits: number; // standard 42U
  temperatureCelsius: number;
  intakeTempCelsius: number;
  exhaustTempCelsius: number;
  totalPowerWatts: number;
  fanRpm: number;
  pduOnline: boolean;
  upsOnline: boolean;
  devices: string[]; // device IDs
}

export interface BuildingRoom {
  id: RoomId;
  nameEn: string;
  nameAr: string;
  sector: string;
  floor: number;
  ambientTempCelsius: number;
  accessLevel: 'Public' | 'Employee' | 'Confidential' | 'Restricted Airgap';
  racks: string[];
  devices: string[];
}

export interface DigitalTwinState {
  selectedDeviceId: string | null;
  selectedRoomId: RoomId;
  cameraMode: CameraViewMode;
  renderMode: '3d-webgl' | '2d-schematic';
  rooms: Record<RoomId, BuildingRoom>;
  racks: Record<string, ServerRack>;
  devices: Record<string, DigitalTwinDevice>;
  ambientNoiseMuted: boolean;
  isInspectingPort: number | null;
}
