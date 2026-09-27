import { create } from 'zustand';
import {
  SimulationNode,
  Packet,
  ConnectionLink,
  SimulationEvent,
  LogEntry,
  SimulationMode,
} from '../types/simulation';
import { Language } from '../i18n/translations';
import { MacroDomainId, CyberRangeLayer, CyberTimelineEvent } from '../types/universe';
import { globalEventBus } from '../engine/eventBus';
import { globalSimulationRuntime } from '../engine/runtime/SimulationRuntime';

export type SimulationId =
  | 'landing'
  | 'tcp'
  | 'dns'
  | 'firewall'
  | 'http'
  | 'tls'
  | 'linux'
  | 'windows'
  | 'crypto'
  | 'siem'
  | 'soc'
  | 'knowledge'
  | 'explorer'
  | 'range'
  | 'glossary'
  | 'paths'
  | 'cia_triad'
  | 'system_internals'
  | 'subnet_routing'
  | 'active_directory'
  | 'appsec_api'
  | 'cloud_containers'
  | 'threat_hunting'
  | 'zero_trust'
  | 'networking_map'
  | 'arp'
  | 'ipv4'
  | 'subnetting'
  | 'routing'
  | 'switching'
  | 'vlan'
  | 'dhcp'
  | 'nat'
  | 'udp'
  | 'ports_services'
  | 'nexora_master'
  | 'forensics'
  | 'cloud'
  | 'containers'
  | 'devsecops';

export interface SelectedEntity {
  type: 'node' | 'packet' | 'rule' | 'log' | 'event' | 'connection' | 'world' | 'concept';
  id: string;
  data: any;
}

interface SimulationStoreState {
  language: Language;
  activeSimulationId: SimulationId;
  selectedMacroDomainId: MacroDomainId | null;
  selectedWorldId: number | null;
  mode: SimulationMode;
  clockStatus: 'idle' | 'running' | 'paused' | 'completed';
  clockSpeed: number;
  virtualTime: number;

  isSearchOpen: boolean;
  searchQuery: string;

  nodes: SimulationNode[];
  connections: ConnectionLink[];
  packets: Packet[];
  logs: LogEntry[];
  events: SimulationEvent[];

  cyberRangeLayer: CyberRangeLayer;
  cyberTimelineEvents: CyberTimelineEvent[];

  // OMEGA V4 Signature Capabilities
  followedPacketId: string | null;
  tracedEventId: string | null;
  activeWorkspaceLayer: 'network' | 'application' | 'identity' | 'security' | 'logs' | 'infrastructure';
  explanationState: { title: string; reason: string; ruleOrCause?: string; visible: boolean } | null;
  whatChanged: { before: string; after: string; visible: boolean } | null;
  inspectorActiveTab: 'overview' | 'rules' | 'connections' | 'events' | 'logs' | 'security';
  onboardingStep: number;

  selectedEntity: SelectedEntity | null;
  completedChallenges: string[];
  activeChallengeId: string | null;

  // Actions
  setLanguage: (lang: Language) => void;
  setActiveSimulation: (id: SimulationId) => void;
  setSelectedMacroDomainId: (id: MacroDomainId | null) => void;
  setSelectedWorldId: (id: number | null) => void;
  setMode: (mode: SimulationMode) => void;
  setClockStatus: (status: 'idle' | 'running' | 'paused' | 'completed') => void;
  setClockSpeed: (speed: number) => void;
  setVirtualTime: (time: number) => void;

  // Signature Feature Actions
  setFollowedPacketId: (id: string | null) => void;
  setTracedEventId: (id: string | null) => void;
  setActiveWorkspaceLayer: (layer: 'network' | 'application' | 'identity' | 'security' | 'logs' | 'infrastructure') => void;
  setExplanation: (explanation: { title: string; reason: string; ruleOrCause?: string } | null) => void;
  setWhatChanged: (diff: { before: string; after: string } | null) => void;
  setInspectorActiveTab: (tab: 'overview' | 'rules' | 'connections' | 'events' | 'logs' | 'security') => void;
  setOnboardingStep: (step: number) => void;

  setIsSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;

  setCyberRangeLayer: (layer: CyberRangeLayer) => void;
  addCyberTimelineEvent: (event: Omit<CyberTimelineEvent, 'id' | 'timestamp'>) => void;
  clearCyberTimeline: () => void;

  setNodes: (nodes: SimulationNode[]) => void;
  updateNode: (id: string, updates: Partial<SimulationNode>) => void;
  setConnections: (connections: ConnectionLink[]) => void;

  setPackets: (packets: Packet[]) => void;
  addPacket: (packet: Packet) => void;
  updatePacket: (id: string, updates: Partial<Packet>) => void;
  removePacket: (id: string) => void;
  clearPackets: () => void;

  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) => void;
  clearLogs: () => void;

  addEvent: (event: Omit<SimulationEvent, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) => void;
  clearEvents: () => void;

  selectEntity: (type: SelectedEntity['type'], id: string, data: any) => void;
  clearSelection: () => void;

  completeChallenge: (challengeId: string) => void;
  setActiveChallengeId: (challengeId: string | null) => void;
}

export const useSimulationStore = create<SimulationStoreState>((set, get) => {
  // Subscribe Zustand to globalSimulationRuntime
  globalSimulationRuntime.subscribe((runtimeState) => {
    set({
      virtualTime: runtimeState.virtualTime,
      clockStatus: runtimeState.clockStatus,
      clockSpeed: runtimeState.speed,
      packets: runtimeState.packets,
      logs: runtimeState.logs,
      events: runtimeState.events,
      nodes: runtimeState.nodes.length > 0 ? runtimeState.nodes : get().nodes,
      connections: runtimeState.connections.length > 0 ? runtimeState.connections : get().connections,
    });
  });

  const getStoredItem = (key: string): string | null => {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch {
      // ignore
    }
    return null;
  };

  const setStoredItem = (key: string, value: string): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch {
      // ignore
    }
  };

  return {
    language: (getStoredItem('omega_language') as Language) || 'ar',
    activeSimulationId: (typeof window !== 'undefined' && window.location.hash.replace('#', '')) ? (window.location.hash.replace('#', '') as SimulationId) : 'landing',
    selectedMacroDomainId: null,
    selectedWorldId: null,
    mode: 'guided',
    clockStatus: 'running',
    clockSpeed: 1.0,
    virtualTime: 0,

    isSearchOpen: false,
    searchQuery: '',

    nodes: [],
    connections: [],
    packets: [],
    logs: [],
    events: [],

    cyberRangeLayer: 'soc',
    cyberTimelineEvents: [],

    followedPacketId: null,
    tracedEventId: null,
    activeWorkspaceLayer: 'network',
    explanationState: null,
    whatChanged: null,
    inspectorActiveTab: 'overview',
    onboardingStep: 0,

    selectedEntity: null,
    completedChallenges: JSON.parse(getStoredItem('omega_completed_challenges') || '[]'),
    activeChallengeId: null,

    setLanguage: (lang) => {
      setStoredItem('omega_language', lang);
      if (typeof document !== 'undefined') {
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
      }
      set({ language: lang });
    },

    setActiveSimulation: (id) => {
      globalSimulationRuntime.reset();
      set({
        activeSimulationId: id,
        packets: [],
        selectedEntity: null,
        virtualTime: 0,
        clockStatus: 'running',
        followedPacketId: null,
        tracedEventId: null,
        explanationState: null,
        whatChanged: null,
      });
      globalSimulationRuntime.start();
    },

    setSelectedMacroDomainId: (id) => set({ selectedMacroDomainId: id }),
    setSelectedWorldId: (id) => set({ selectedWorldId: id }),

    setMode: (mode) => set({ mode }),

    setClockStatus: (clockStatus) => {
      if (clockStatus === 'running') {
        globalSimulationRuntime.resume();
      } else if (clockStatus === 'paused') {
        globalSimulationRuntime.pause();
      } else if (clockStatus === 'idle') {
        globalSimulationRuntime.reset();
      } else {
        globalSimulationRuntime.pause();
      }
      set({ clockStatus });
    },

    setClockSpeed: (speed) => {
      globalSimulationRuntime.setSpeed(speed);
      set({ clockSpeed: speed });
    },

    setVirtualTime: (virtualTime) => {
      globalSimulationRuntime.clock.seek(virtualTime);
      set({ virtualTime });
    },

  setFollowedPacketId: (followedPacketId) => set({ followedPacketId }),
  setTracedEventId: (tracedEventId) => set({ tracedEventId }),
  setActiveWorkspaceLayer: (activeWorkspaceLayer) => set({ activeWorkspaceLayer }),
  setExplanation: (explanation) =>
    set({
      explanationState: explanation ? { ...explanation, visible: true } : null,
    }),
  setWhatChanged: (diff) =>
    set({
      whatChanged: diff ? { ...diff, visible: true } : null,
    }),
  setInspectorActiveTab: (inspectorActiveTab) => set({ inspectorActiveTab }),
  setOnboardingStep: (onboardingStep) => set({ onboardingStep }),

  setIsSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setCyberRangeLayer: (layer) => set({ cyberRangeLayer: layer }),

  addCyberTimelineEvent: (evt) => {
    const newEvt: CyberTimelineEvent = {
      id: `timeline-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      ...evt,
    };
    set((state) => ({
      cyberTimelineEvents: [newEvt, ...state.cyberTimelineEvents].slice(0, 100),
    }));
  },

  clearCyberTimeline: () => set({ cyberTimelineEvents: [] }),

  setNodes: (nodes) => set({ nodes }),
  updateNode: (id, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
    })),
  setConnections: (connections) => set({ connections }),

  setPackets: (packets) => set({ packets }),
  addPacket: (packet) => set((state) => ({ packets: [...state.packets, packet] })),
  updatePacket: (id, updates) =>
    set((state) => ({
      packets: state.packets.map((pkt) =>
        pkt.id === id ? { ...pkt, ...updates } : pkt
      ),
    })),
  removePacket: (id) =>
    set((state) => ({ packets: state.packets.filter((pkt) => pkt.id !== id) })),
  clearPackets: () => set({ packets: [] }),

  addLog: (log) => {
    const newLog: LogEntry = {
      id: log.id || `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: log.timestamp || get().virtualTime,
      ...log,
    };
    set((state) => ({
      logs: [newLog, ...state.logs].slice(0, 150),
    }));
  },
  clearLogs: () => set({ logs: [] }),

  addEvent: (event) => {
    const newEvent: SimulationEvent = {
      id: event.id || `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: event.timestamp || get().virtualTime,
      ...event,
    };
    set((state) => ({
      events: [newEvent, ...state.events].slice(0, 100),
    }));
    globalEventBus.emit(newEvent);
  },
  clearEvents: () => set({ events: [] }),

  selectEntity: (type, id, data) => set({ selectedEntity: { type, id, data } }),
  clearSelection: () => set({ selectedEntity: null }),

  completeChallenge: (challengeId) => {
    const existing = get().completedChallenges;
    if (!existing.includes(challengeId)) {
      const updated = [...existing, challengeId];
      setStoredItem('omega_completed_challenges', JSON.stringify(updated));
      set({ completedChallenges: updated });
    }
  },
  setActiveChallengeId: (activeChallengeId) => set({ activeChallengeId }),
};
});
