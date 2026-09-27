/**
 * OMEGA ULTRA REALITY V1.1 — Enterprise Digital Twin Types
 * Pure deterministic state definitions for hardware, racks, cables, rooms, and physical infrastructure.
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

export type CameraViewMode =
  | 'building'
  | 'room'
  | 'rack'
  | 'rack-front'
  | 'rack-rear'
  | 'device'
  | 'workstation'
  | 'topology';

export type DeviceCategory =
  | 'server'
  | 'switch'
  | 'firewall'
  | 'workstation'
  | 'pdu'
  | 'ups'
  | 'patch-panel';

export type StateOrigin = 'REALITY_ENGINE' | 'DERIVED' | 'SEEDED_BASELINE';

export type CableType = 'CAT6' | 'CAT6A' | 'FIBER_SM' | 'FIBER_MM';

export type CableColor = 'blue' | 'yellow' | 'aqua' | 'red' | 'purple' | 'gray';

export interface CableState {
  id: string;
  type: CableType;
  sourceDeviceId: string;
  sourcePort: string; // e.g. "CORE-SW01:Gi1/0/10"
  targetDeviceId: string;
  targetPort: string; // e.g. "DC01:NIC1"
  status: 'CONNECTED' | 'DISCONNECTED';
  linkSpeedMbps: number;
  lengthMeters: number;
  colorLabel: CableColor;
  connected: boolean;
  stateOrigin: StateOrigin;
  // Waypoint paths for physical 3D routing
  pathKey?: string;
}

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
  connectedCableId?: string;
  stateOrigin: StateOrigin;
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
  connectedCableId?: string;
  stateOrigin: StateOrigin;
}

export interface PatchPanelPortState {
  portNumber: number;
  label: string;
  rearDestination: string; // e.g. "FIN-WS01 Wall Drop"
  frontConnectedCableId?: string;
  linkActive: boolean;
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
  poweredBy?: string; // e.g. "PDU-01"
  temperatureCelsius: number;
  fanRpm: number;
  powerWatts: number;
  leds: DeviceLedState;
  interfaces?: NetworkInterfaceState[];
  ports?: SwitchPortState[];
  patchPanelPorts?: PatchPanelPortState[];
  firewallState?: {
    zones: FirewallZoneState[];
    activeSessions: number;
    blockedPackets: number;
    inspectionThroughputMbps: number;
  };
  stateOrigin: StateOrigin;
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
  selectedCableId: string | null;
  selectedRoomId: RoomId;
  cameraMode: CameraViewMode;
  renderMode: '3d-webgl' | '2d-schematic';
  rooms: Record<RoomId, BuildingRoom>;
  racks: Record<string, ServerRack>;
  devices: Record<string, DigitalTwinDevice>;
  cables: Record<string, CableState>;
  ambientNoiseMuted: boolean;
  isInspectingPort: number | null;
}
