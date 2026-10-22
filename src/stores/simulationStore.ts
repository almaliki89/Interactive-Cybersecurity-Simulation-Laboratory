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
import type { LessonProgressState } from '../types/curriculum';

export type SimulationId =
  | 'landing'
  | 'lesson'
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

  // Beginner-First Curriculum State
  activeLessonId: string;
  completedLessons: string[];
  lessonProgress: Record<string, LessonProgressState>;

  // Actions
  setLanguage: (lang: Language) => void;
  setActiveSimulation: (id: SimulationId) => void;
  setActiveLessonId: (id: string) => void;
  completeLesson: (lessonId: string) => void;
  setLessonStage: (lessonId: string, stage: number) => void;
  updateLessonProgressState: (lessonId: string, updates: Partial<LessonProgressState>) => void;
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
  reloadFromStorage: () => void;
}

export const getStoredItem = (key: string): string | null => {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {
    // ignore
  }
  return null;
};

export const safeParseCompletedChallenges = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((c): c is string => typeof c === 'string' && c.trim().length > 0);
    }
    // Handle legacy object schema e.g. { completed: string[] } or { challengeId: true }
    if (parsed && typeof parsed === 'object') {
      if (Array.isArray((parsed as any).completed)) {
        return (parsed as any).completed.filter((c: any): c is string => typeof c === 'string' && c.trim().length > 0);
      }
      return Object.entries(parsed)
        .filter(([key, val]) => val === true && typeof key === 'string' && key.trim().length > 0)
        .map(([key]) => key);
    }
  } catch {
    // Corrupted storage recovery - fallback gracefully without crashing
  }
  return [];
};

export const safeParseCompletedLessons = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((c): c is string => typeof c === 'string' && c.trim().length > 0);
    }
  } catch {
    // Corrupted storage recovery - fallback gracefully
  }
  return [];
};

export const safeParseLessonProgress = (
  raw: string | null,
  completedLessons: string[] = []
): Record<string, LessonProgressState> => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    const validated: Record<string, LessonProgressState> = {};
    for (const [lessonId, item] of Object.entries(parsed)) {
      if (!VALID_CURRICULUM_LESSON_IDS.has(lessonId)) continue;
      if (!item || typeof item !== 'object' || Array.isArray(item)) continue;

      const typedItem = item as Record<string, any>;
      const isCompleted = completedLessons.includes(lessonId);

      let furthest = typeof typedItem.furthestUnlockedStage === 'number'
        ? Math.max(0, Math.min(6, Math.floor(typedItem.furthestUnlockedStage)))
        : 0;

      // Safety check: if not completed, do not allow restoring final stage 6 unless conditions are met
      if (!isCompleted && furthest > 5) {
        furthest = 5;
      }

      let current = typeof typedItem.currentStage === 'number'
        ? Math.max(0, Math.min(6, Math.floor(typedItem.currentStage)))
        : 0;

      if (!isCompleted && current > furthest) {
        current = furthest;
      }

      // Sanitize quizAnswers
      let quizAnswers: Record<string, string> | undefined;
      if (typedItem.quizAnswers && typeof typedItem.quizAnswers === 'object' && !Array.isArray(typedItem.quizAnswers)) {
        quizAnswers = {};
        for (const [qId, optId] of Object.entries(typedItem.quizAnswers)) {
          if (typeof qId === 'string' && typeof optId === 'string') {
            quizAnswers[qId] = optId;
          }
        }
      }

      // Sanitize quizSubmitted
      let quizSubmitted: Record<string, boolean> | undefined;
      if (typedItem.quizSubmitted && typeof typedItem.quizSubmitted === 'object' && !Array.isArray(typedItem.quizSubmitted)) {
        quizSubmitted = {};
        for (const [qId, sub] of Object.entries(typedItem.quizSubmitted)) {
          if (typeof qId === 'string' && typeof sub === 'boolean') {
            quizSubmitted[qId] = sub;
          }
        }
      }

      // Sanitize checkedTaskSteps
      let checkedTaskSteps: Record<string, boolean> | undefined;
      if (typedItem.checkedTaskSteps && typeof typedItem.checkedTaskSteps === 'object' && !Array.isArray(typedItem.checkedTaskSteps)) {
        checkedTaskSteps = {};
        for (const [stepKey, checked] of Object.entries(typedItem.checkedTaskSteps)) {
          if (typeof stepKey === 'string' && typeof checked === 'boolean') {
            checkedTaskSteps[stepKey] = checked;
          }
        }
      }

      const manualConfirmationChecked = typeof typedItem.manualConfirmationChecked === 'boolean'
        ? typedItem.manualConfirmationChecked
        : undefined;

      validated[lessonId] = {
        currentStage: current,
        furthestUnlockedStage: isCompleted ? 6 : furthest,
        quizAnswers,
        quizSubmitted,
        checkedTaskSteps,
        manualConfirmationChecked,
      };
    }

    return validated;
  } catch {
    return {};
  }
};

export const VALID_CURRICULUM_LESSON_IDS = new Set([
  'lesson-01-cia-triad',
  'lesson-02-system-internals',
  'lesson-03-subnet-routing',
  'lesson-04-firewall-rules',
  'lesson-05-cryptography',
  'lesson-06-active-directory',
  'lesson-07-soc-monitoring',
  'lesson-08-forensics',
  'lesson-09-devsecops',
  'lesson-10-cyber-range',
]);

export const LESSON_SEQUENCE = [
  'lesson-01-cia-triad',
  'lesson-02-system-internals',
  'lesson-03-subnet-routing',
  'lesson-04-firewall-rules',
  'lesson-05-cryptography',
  'lesson-06-active-directory',
  'lesson-07-soc-monitoring',
  'lesson-08-forensics',
  'lesson-09-devsecops',
  'lesson-10-cyber-range',
];

export const VALID_CHALLENGE_IDS = new Set([
  'cia-balance-challenge',
  'internals-memory-challenge',
  'subnet-routing-challenge',
  'firewall-rule-mastery',
  'crypto-avalanche-challenge',
]);

// Map challengeId to the simulationId that must be active to complete it
export const CHALLENGE_TO_SIMULATION_MAP: Record<string, SimulationId> = {
  'cia-balance-challenge': 'cia_triad',
  'internals-memory-challenge': 'system_internals',
  'subnet-routing-challenge': 'subnet_routing',
  'firewall-rule-mastery': 'firewall',
  'crypto-avalanche-challenge': 'crypto',
};

export const DEFAULT_LESSON_ID = 'lesson-01-cia-triad';

export const safeParseActiveLessonId = (raw: string | null): string => {
  if (!raw || typeof raw !== 'string') return DEFAULT_LESSON_ID;
  const trimmed = raw.trim();
  if (VALID_CURRICULUM_LESSON_IDS.has(trimmed)) {
    return trimmed;
  }
  return DEFAULT_LESSON_ID;
};

export const setStoredItem = (key: string, value: string): void => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch (err) {
    // Handle QuotaExceededError or browser privacy sandbox errors gracefully
    console.warn(`[Storage] Set failed for key ${key}:`, err);
  }
};

export const safeParseLanguage = (raw: string | null): Language => {
  if (raw === 'en' || raw === 'ar') return raw;
  return 'ar';
};

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

  return {
    language: safeParseLanguage(getStoredItem('omega_language')),
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
    completedChallenges: safeParseCompletedChallenges(getStoredItem('omega_completed_challenges')),
    activeChallengeId: null,

    activeLessonId: safeParseActiveLessonId(getStoredItem('omega_active_lesson_id')),
    completedLessons: safeParseCompletedLessons(getStoredItem('omega_completed_lessons')),
    lessonProgress: safeParseLessonProgress(getStoredItem('omega_lesson_progress'), safeParseCompletedLessons(getStoredItem('omega_completed_lessons'))),

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
    if (typeof challengeId !== 'string' || !challengeId.trim()) return;
    const cleanId = challengeId.trim();
    
    // 1. Whitelist Verification
    if (!VALID_CHALLENGE_IDS.has(cleanId)) {
      console.warn(`[Integrity] Attempted to complete unregistered challenge: ${cleanId}`);
      return;
    }

    // 2. Context Verification: Only allow completion if the relevant simulation is active
    const requiredSim = CHALLENGE_TO_SIMULATION_MAP[cleanId];
    const activeSim = get().activeSimulationId;
    if (requiredSim && activeSim !== requiredSim) {
      console.warn(`[Integrity] Challenge ${cleanId} cannot be completed in simulation ${activeSim}. Required: ${requiredSim}`);
      return;
    }

    const existing = get().completedChallenges;
    if (!existing.includes(cleanId)) {
      const updated = [...existing, cleanId];
      setStoredItem('omega_completed_challenges', JSON.stringify(updated));
      set({ completedChallenges: updated });
    }
  },
  setActiveChallengeId: (activeChallengeId) => set({ activeChallengeId }),

  setActiveLessonId: (activeLessonId) => {
    const safeId = safeParseActiveLessonId(activeLessonId);
    setStoredItem('omega_active_lesson_id', safeId);
    set({ activeLessonId: safeId });
  },
  completeLesson: (lessonId) => {
    if (!VALID_CURRICULUM_LESSON_IDS.has(lessonId)) return;
    
    // Integrity Check: Cannot complete if previous lesson is not completed
    const lessonIdx = LESSON_SEQUENCE.indexOf(lessonId);
    if (lessonIdx > 0) {
      const prevLessonId = LESSON_SEQUENCE[lessonIdx - 1];
      if (!get().completedLessons.includes(prevLessonId)) {
        console.warn(`[Integrity] Cannot complete lesson ${lessonId} before ${prevLessonId}`);
        return;
      }
    }

    const existing = get().completedLessons;
    const updated = existing.includes(lessonId) ? existing : [...existing, lessonId];
    const currentProgress = get().lessonProgress[lessonId] || { currentStage: 6, furthestUnlockedStage: 6 };
    const updatedProgress = {
      ...get().lessonProgress,
      [lessonId]: {
        ...currentProgress,
        currentStage: 6,
        furthestUnlockedStage: 6,
      },
    };
    setStoredItem('omega_completed_lessons', JSON.stringify(updated));
    setStoredItem('omega_lesson_progress', JSON.stringify(updatedProgress));
    set({
      completedLessons: updated,
      lessonProgress: updatedProgress,
    });
  },
  setLessonStage: (lessonId, stage) => {
    if (!VALID_CURRICULUM_LESSON_IDS.has(lessonId)) return;
    if (typeof stage !== 'number' || stage < 0 || stage > 6) return;

    set((state) => {
      const isCompleted = state.completedLessons.includes(lessonId);
      const current = state.lessonProgress[lessonId] || { currentStage: 0, furthestUnlockedStage: 0 };
      const currentFurthest = isCompleted ? 6 : (current.furthestUnlockedStage ?? 0);

      // Strict gating:
      // Can review any already unlocked stage (stage <= currentFurthest)
      // Can advance only to the immediately next sequential stage (stage === currentFurthest + 1)
      if (!isCompleted && stage > currentFurthest + 1) {
        return state;
      }

      // Check if trying to advance in a lesson while previous lesson is not done
      const lessonIdx = LESSON_SEQUENCE.indexOf(lessonId);
      if (lessonIdx > 0 && stage > 0) {
        const prevLessonId = LESSON_SEQUENCE[lessonIdx - 1];
        if (!state.completedLessons.includes(prevLessonId)) {
          // Allow only stage 0 (Intro) if predecessor not done
          if (stage > 0) return state;
        }
      }

      const newFurthest = isCompleted ? 6 : Math.max(currentFurthest, stage);
      const updatedProgress = {
        ...state.lessonProgress,
        [lessonId]: {
          ...current,
          currentStage: stage,
          furthestUnlockedStage: newFurthest,
        },
      };
      setStoredItem('omega_lesson_progress', JSON.stringify(updatedProgress));
      return { lessonProgress: updatedProgress };
    });
  },
  updateLessonProgressState: (lessonId, updates) => {
    if (!VALID_CURRICULUM_LESSON_IDS.has(lessonId)) return;
    set((state) => {
      const current = state.lessonProgress[lessonId] || { currentStage: 0, furthestUnlockedStage: 0 };
      const updatedProgress = {
        ...state.lessonProgress,
        [lessonId]: {
          ...current,
          ...updates,
        },
      };
      setStoredItem('omega_lesson_progress', JSON.stringify(updatedProgress));
      return { lessonProgress: updatedProgress };
    });
  },

  reloadFromStorage: () => {
    const lang = safeParseLanguage(getStoredItem('omega_language'));
    const rawCompleted = safeParseCompletedChallenges(getStoredItem('omega_completed_challenges'));
    
    // Whitelist filter for challenges
    const completed = rawCompleted.filter(id => VALID_CHALLENGE_IDS.has(id));

    const rawCompletedLessons = safeParseCompletedLessons(getStoredItem('omega_completed_lessons')).filter((l) => VALID_CURRICULUM_LESSON_IDS.has(l));
    
    // Sanitize completed lessons sequence
    const completedLess: string[] = [];
    for (const lId of LESSON_SEQUENCE) {
      if (rawCompletedLessons.includes(lId)) {
        completedLess.push(lId);
      } else {
        // If one is missing, break to prevent "jumping"
        break;
      }
    }

    const activeLesson = safeParseActiveLessonId(getStoredItem('omega_active_lesson_id'));
    const parsedProgress = safeParseLessonProgress(getStoredItem('omega_lesson_progress'), completedLess);

    if (typeof document !== 'undefined') {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
    set({
      language: lang,
      completedChallenges: completed,
      completedLessons: completedLess,
      activeLessonId: activeLesson,
      lessonProgress: parsedProgress,
    });
  },
};
});
