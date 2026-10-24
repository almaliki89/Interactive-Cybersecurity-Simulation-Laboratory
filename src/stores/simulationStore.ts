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
import { CURRICULUM_LEVELS, CURRICULUM_LESSONS } from '../data/curriculumData';

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
  | 'devsecops'
  | 'chain_of_custody'
  | 'volatility'
  | 'registry'
  | 'incident_response'
  | 'reporting'
  | 'sql_injection'
  | 'xss'
  | 'sast'
  | 'secrets_scan'
  | 'sca'
  | 'sbom'
  | 'cloud_iam'
  | 'kubernetes'
  | 'mitre_attack'
  | 'cloud_trail';

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
  onboardingProgress: OnboardingRequirements;
  landingFirewallMode: 'strict' | 'permissive' | 'block_all';

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
  recordOnboardingAction: (action: 'inspect_firewall' | 'alter_policy') => void;
  setLandingFirewallMode: (mode: 'strict' | 'permissive' | 'block_all') => void;
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

  completeChallenge: (challengeId: string, verificationResult: ChallengeVerificationResult) => void;
  setActiveChallengeId: (challengeId: string | null) => void;
  registerChallengeValidator: (challengeId: string, validator: ChallengeValidatorFn) => void;
  unregisterChallengeValidator: (challengeId: string) => void;
  reloadFromStorage: () => void;
}

export interface ChallengeVerificationResult {
  success: boolean;
  score?: number;
  message?: string;
  details?: any;
  validatorProof?: string | Record<string, any>;
  [key: string]: any;
}

export type ChallengeValidatorFn = () => ChallengeVerificationResult;

/**
 * ARCHITECTURAL NOTICE — Client-Side Verification vs. Authoritative Attestation:
 *
 * IMPORTANT: In this client-only web application (SPA), all logic, state, and achievements
 * exist solely within the user's browser sandbox. There is NO server-authoritative backend
 * for cryptographic attestation or session-based verification.
 *
 * CONSEQUENTLY:
 * 1. PERSISTENCE & TRUST: The "Integrity" protections implemented here (whitelist filtering,
 *    live validator binding, sequential gating, activity evidence verification) are designed to
 *    prevent accidental state corruption, malformed inputs, and casual "skipping" of the
 *    learning experience.
 * 2. MANIPULATION: A determined user can easily inspect and manipulate any part of this state
 *    via browser DevTools, memory modification, or manual editing of localStorage.
 * 3. NO PROOF: These checks DO NOT constitute a cryptographically secure proof of achievement.
 *
 * For high-stakes certification, competitive rankings, or authoritative compliance tracking,
 * a server-side evaluator with persistent database verification is required.
 */

// Active validator registry binding challenge validation directly to live simulation state
const activeChallengeValidators = new Map<string, ChallengeValidatorFn>();

export const registerChallengeValidator = (challengeId: string, validator: ChallengeValidatorFn): void => {
  activeChallengeValidators.set(challengeId, validator);
};

export const unregisterChallengeValidator = (challengeId: string): void => {
  activeChallengeValidators.delete(challengeId);
};

export const clearChallengeValidators = (): void => {
  activeChallengeValidators.clear();
};

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

// Dynamically derive the canonical curriculum lesson sequence directly from CURRICULUM_LEVELS modules
export const LESSON_SEQUENCE: string[] = CURRICULUM_LEVELS.flatMap((level) =>
  level.modules.flatMap((module) => module.lessonIds)
);

export const VALID_CURRICULUM_LESSON_IDS = new Set<string>(
  LESSON_SEQUENCE.length > 0 ? LESSON_SEQUENCE : Object.keys(CURRICULUM_LESSONS)
);
// Ensure any additional lessons declared in CURRICULUM_LESSONS are also included
for (const id of Object.keys(CURRICULUM_LESSONS)) {
  VALID_CURRICULUM_LESSON_IDS.add(id);
}

export const INSTRUCTIONAL_CHALLENGES = new Set<string>([
  'orientation-guided-challenge',
]);

export type ChallengeVerificationType = 'technical' | 'instructional';

export const getChallengeVerificationType = (challengeId: string): ChallengeVerificationType => {
  if (INSTRUCTIONAL_CHALLENGES.has(challengeId)) {
    return 'instructional';
  }
  return 'technical';
};

export const VALID_CHALLENGE_IDS = new Set([
  // Core curriculum interactive challenges
  'cia-balance-challenge',
  'internals-memory-challenge',
  'subnet-routing-challenge',
  'firewall-rule-mastery',
  'crypto-avalanche-challenge',
  'kerberos-ticket-challenge',
  'brute-force-triage-challenge',
  'evidence-preservation-challenge',
  'memory-analysis-challenge',
  'timeline-mastery-challenge',
  'web-vulnerability-challenge',
  'pipeline-gate-challenge',
  'supply-chain-challenge',
  'iam-hardening-challenge',
  'k8s-hardening-challenge',
  'threat-hunting-hypothesis-challenge',
  // Lab interactive challenges
  'tcp-handshake-mastery',
  'dns-resolution-challenge',
  'http-lifecycle-mastery',
  'tls-handshake-challenge',
  'siem-correlation-challenge',
  'zero-trust-challenge',
  // Master hardening challenges
  'linux-hardening',
  'windows_hardening',
  'soc_master',
  'appsec_master',
  'nexora_master',
  'ad_nexora_migration_master',
  // Instructional / guided challenges
  'orientation-guided-challenge',
]);

export const MASTER_HARDENING_CHALLENGE_IDS = new Set([
  'linux-hardening',
  'windows_hardening',
  'soc_master',
  'appsec_master',
  'nexora_master',
  'ad_nexora_migration_master',
]);

// Map challengeId to the simulationId(s) that must be active to complete it
export const CHALLENGE_TO_SIMULATION_MAP: Record<string, SimulationId | SimulationId[]> = {
  'cia-balance-challenge': 'cia_triad',
  'internals-memory-challenge': 'system_internals',
  'subnet-routing-challenge': 'subnet_routing',
  'firewall-rule-mastery': 'firewall',
  'crypto-avalanche-challenge': 'crypto',
  'kerberos-ticket-challenge': 'active_directory',
  'brute-force-triage-challenge': 'soc',
  'evidence-preservation-challenge': 'forensics',
  'memory-analysis-challenge': 'forensics',
  'timeline-mastery-challenge': 'forensics',
  'web-vulnerability-challenge': 'devsecops',
  'pipeline-gate-challenge': 'devsecops',
  'supply-chain-challenge': 'devsecops',
  'iam-hardening-challenge': ['threat_hunting', 'cloud_iam', 'cloud'],
  'k8s-hardening-challenge': ['threat_hunting', 'kubernetes', 'containers'],
  'threat-hunting-hypothesis-challenge': 'threat_hunting',
  'tcp-handshake-mastery': 'tcp',
  'dns-resolution-challenge': 'dns',
  'http-lifecycle-mastery': 'http',
  'tls-handshake-challenge': 'tls',
  'siem-correlation-challenge': 'siem',
  'zero-trust-challenge': 'zero_trust',
  'linux-hardening': 'linux',
  'windows_hardening': 'windows',
  'soc_master': 'soc',
  'appsec_master': 'appsec_api',
  'nexora_master': ['nexora_master', 'range'],
  'ad_nexora_migration_master': 'active_directory',
  'orientation-guided-challenge': 'landing',
};


export const sanitizeCompletedLessonsSequence = (rawLessons: string[]): string[] => {
  const completed: string[] = [];

  // If orientation is completed, include it
  if (rawLessons.includes('lesson-00-orientation')) {
    completed.push('lesson-00-orientation');
  }

  // The primary sequential learning chain starts from lesson-01-cia-triad
  const coreSequence = LESSON_SEQUENCE.filter((id) => id !== 'lesson-00-orientation');
  for (const lId of coreSequence) {
    if (rawLessons.includes(lId)) {
      completed.push(lId);
    } else {
      // If a predecessor in the sequence is missing, stop to prevent jumped sequence tampering
      break;
    }
  }
  return completed;
};

export const safeParseCompletedChallenges = (
  raw: string | null,
  whitelist?: Set<string>
): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    let items: string[] = [];
    if (Array.isArray(parsed)) {
      items = parsed.filter((c): c is string => typeof c === 'string' && c.trim().length > 0);
    } else if (parsed && typeof parsed === 'object') {
      if (Array.isArray((parsed as any).completed)) {
        items = (parsed as any).completed.filter((c: any): c is string => typeof c === 'string' && c.trim().length > 0);
      } else {
        items = Object.entries(parsed)
          .filter(([key, val]) => val === true && typeof key === 'string' && key.trim().length > 0)
          .map(([key]) => key);
      }
    }
    const clean = items.map((s) => s.trim()).filter((s) => s.length > 0);
    return whitelist ? clean.filter((s) => whitelist.has(s)) : clean;
  } catch {
    // Corrupted storage recovery - fallback gracefully without crashing
  }
  return [];
};

export const safeParseCompletedLessons = (
  raw: string | null,
  whitelist?: Set<string>
): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const clean = parsed
        .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      return whitelist ? clean.filter((s) => whitelist.has(s)) : clean;
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
  if (!raw) {
    return {};
  }
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

      let current = typeof typedItem.currentStage === 'number'
        ? Math.max(0, Math.min(6, Math.floor(typedItem.currentStage)))
        : 0;

      const isQuizPassed = typeof typedItem.isQuizPassed === 'boolean'
        ? typedItem.isQuizPassed
        : undefined;

      const isTaskPassed = typeof typedItem.isTaskPassed === 'boolean'
        ? typedItem.isTaskPassed
        : undefined;

      // Strict Integrity Check:
      // A lesson progress entry is verified completed ONLY IF it is listed in completedLessons
      // AND explicitly records isQuizPassed === true AND isTaskPassed === true.
      // Absent or corrupt progress entries NEVER synthesize passed quiz/task flags or stage 6.
      const verifiedCompleted = isCompleted && isQuizPassed === true && isTaskPassed === true;

      if (!verifiedCompleted && furthest > 5) {
        furthest = 5;
      }
      if (!verifiedCompleted && current > furthest) {
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
        currentStage: verifiedCompleted ? 6 : current,
        furthestUnlockedStage: verifiedCompleted ? 6 : furthest,
        quizAnswers,
        quizSubmitted,
        checkedTaskSteps,
        manualConfirmationChecked,
        isQuizPassed: verifiedCompleted ? true : isQuizPassed,
        isTaskPassed: verifiedCompleted ? true : isTaskPassed,
      };
    }

    return validated;
  } catch {
    return {};
  }
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

export interface OnboardingRequirements {
  firewallInspected: boolean;
  policyAltered: boolean;
}

export const safeParseOnboardingProgress = (raw: string | null): OnboardingRequirements => {
  if (!raw) return { firewallInspected: false, policyAltered: false };
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return {
        firewallInspected: parsed.firewallInspected === true,
        policyAltered: parsed.policyAltered === true,
      };
    }
  } catch {
    // Corrupted storage recovery - fallback gracefully
  }
  return { firewallInspected: false, policyAltered: false };
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
    landingFirewallMode: 'strict',
    onboardingProgress: safeParseOnboardingProgress(getStoredItem('omega_onboarding_progress')),
    onboardingStep: safeParseOnboardingProgress(getStoredItem('omega_onboarding_progress')).firewallInspected
      ? (safeParseOnboardingProgress(getStoredItem('omega_onboarding_progress')).policyAltered ? 3 : 2)
      : 1,

    selectedEntity: null,
    completedChallenges: safeParseCompletedChallenges(
      getStoredItem('omega_completed_challenges'),
      VALID_CHALLENGE_IDS
    ).filter((cId) => {
      if (cId === 'orientation-guided-challenge') {
        const prog = safeParseOnboardingProgress(getStoredItem('omega_onboarding_progress'));
        return prog.firewallInspected === true && prog.policyAltered === true;
      }
      return true;
    }),
    activeChallengeId: null,

    activeLessonId: safeParseActiveLessonId(getStoredItem('omega_active_lesson_id')),
    completedLessons: sanitizeCompletedLessonsSequence(
      safeParseCompletedLessons(
        getStoredItem('omega_completed_lessons'),
        VALID_CURRICULUM_LESSON_IDS
      )
    ),
    lessonProgress: safeParseLessonProgress(
      getStoredItem('omega_lesson_progress'),
      sanitizeCompletedLessonsSequence(
        safeParseCompletedLessons(
          getStoredItem('omega_completed_lessons'),
          VALID_CURRICULUM_LESSON_IDS
        )
      )
    ),

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
  recordOnboardingAction: (action) => {
    const currentProgress = get().onboardingProgress;
    let firewallInspected = currentProgress.firewallInspected;
    let policyAltered = currentProgress.policyAltered;

    if (action === 'inspect_firewall') {
      // Evidence-based check: firewall entity must be actually selected in the store
      const selection = get().selectedEntity;
      if (selection?.id !== 'fw-01') {
        console.warn('[Integrity] inspect_firewall rejected: Firewall (fw-01) not selected.');
        return;
      }
      firewallInspected = true;
    } else if (action === 'alter_policy') {
      // Evidence-based check: current firewall mode must be different from the default 'strict'
      const mode = get().landingFirewallMode;
      if (mode === 'strict') {
        console.warn('[Integrity] alter_policy rejected: Firewall policy is still in default "strict" mode.');
        return;
      }
      if (!firewallInspected) {
        console.warn('[Integrity] Cannot record policyAltered action before inspecting firewall.');
        return;
      }
      policyAltered = true;
    }

    const updatedProgress = { firewallInspected, policyAltered };
    let calculatedStep = 1;
    if (firewallInspected) calculatedStep = 2;
    if (firewallInspected && policyAltered) calculatedStep = 3;

    setStoredItem('omega_onboarding_progress', JSON.stringify(updatedProgress));
    set({
      onboardingProgress: updatedProgress,
      onboardingStep: calculatedStep,
    });
  },

  setLandingFirewallMode: (landingFirewallMode) => set({ landingFirewallMode }),

  setOnboardingStep: (onboardingStep) => {
    if (typeof onboardingStep !== 'number' || !Number.isFinite(onboardingStep) || Number.isNaN(onboardingStep)) {
      console.warn('[Integrity] Invalid onboardingStep value rejected.');
      return;
    }
    const currentStep = get().onboardingStep;
    const targetStep = Math.floor(onboardingStep);
    const prog = get().onboardingProgress;

    // Evidence-driven gating: step number cannot advance beyond verified activities!
    if (targetStep >= 2 && !prog.firewallInspected) {
      console.warn('[Integrity] Cannot set onboardingStep >= 2 without verified inspect_firewall activity.');
      return;
    }
    if (targetStep >= 3 && (!prog.firewallInspected || !prog.policyAltered)) {
      console.warn('[Integrity] Cannot set onboardingStep >= 3 without verified alter_policy activity.');
      return;
    }

    // Sequential step gating: step can only reset to 0 or 1, or advance by at most 1 step at a time
    if (targetStep > 1 && targetStep > currentStep + 1) {
      console.warn(
        `[Integrity] Cannot jump onboarding step from ${currentStep} to ${targetStep}. Sequential progression required.`
      );
      return;
    }

    set({ onboardingStep: Math.max(0, Math.min(3, targetStep)) });
  },

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

  completeChallenge: (challengeId, verificationResult) => {
    if (typeof challengeId !== 'string' || !challengeId.trim()) {
      console.warn('[Integrity] Challenge rejected: invalid challenge ID format.');
      return;
    }
    const cleanId = challengeId.trim();

    // 1. Explicit verification result required (must be an object with success === true)
    if (
      !verificationResult ||
      typeof verificationResult !== 'object' ||
      verificationResult.success !== true
    ) {
      console.warn(
        `[Integrity] Challenge ${cleanId} rejected because validation criteria were not met or verification outcome was omitted.`
      );
      return;
    }

    // 2. Whitelist Verification
    if (!VALID_CHALLENGE_IDS.has(cleanId)) {
      console.warn(`[Integrity] Attempted to complete unregistered challenge: ${cleanId}`);
      return;
    }

    // 3. Context Verification: Only allow completion if the relevant simulation is active
    const requiredSim = CHALLENGE_TO_SIMULATION_MAP[cleanId];
    const activeSim = get().activeSimulationId;
    if (requiredSim) {
      const allowedSims = Array.isArray(requiredSim) ? requiredSim : [requiredSim];
      if (!allowedSims.includes(activeSim)) {
        console.warn(
          `[Integrity] Challenge ${cleanId} cannot be completed in simulation ${activeSim}. Required: ${allowedSims.join(' or ')}`
        );
        return;
      }
    }

    // 4. Authoritative Verification Mode & Live Validator Binding:
    const verificationType = getChallengeVerificationType(cleanId);
    const registeredValidator = activeChallengeValidators.get(cleanId);
    let authoritativeOutcome = verificationResult;

    if (verificationType === 'technical') {
      // Technical challenges strictly require an active registered validator bound to live simulation state.
      // Callers cannot bypass technical validation by passing verificationMode flags in the payload.
      if (!registeredValidator) {
        console.warn(
          `[Integrity] Challenge ${cleanId} rejected: technical challenge strictly requires an active registered validator.`
        );
        return;
      }

      try {
        const liveOutcome = registeredValidator();
        if (!liveOutcome || typeof liveOutcome !== 'object' || liveOutcome.success !== true) {
          console.warn(
            `[Integrity] Challenge ${cleanId} rejected: live simulation state does not satisfy verification criteria.`
          );
          return;
        }
        authoritativeOutcome = liveOutcome;
      } catch (err) {
        console.error(`[Integrity] Error during live verification for challenge ${cleanId}:`, err);
        return;
      }
    } else if (verificationType === 'instructional') {
      // Instructional/guided challenges require authoritative step progression in store
      if (registeredValidator) {
        try {
          const liveOutcome = registeredValidator();
          if (!liveOutcome || typeof liveOutcome !== 'object' || liveOutcome.success !== true) {
            console.warn(`[Integrity] Instructional challenge ${cleanId} failed registered validation.`);
            return;
          }
          authoritativeOutcome = liveOutcome;
        } catch (err) {
          console.error(`[Integrity] Error verifying instructional challenge ${cleanId}:`, err);
          return;
        }
      }

      // Store-authoritative step completion verification for instructional challenges
      if (cleanId === 'orientation-guided-challenge') {
        const currentStep = get().onboardingStep;
        const prog = get().onboardingProgress;
        if (
          typeof currentStep !== 'number' ||
          currentStep < 3 ||
          !prog.firewallInspected ||
          !prog.policyAltered
        ) {
          console.warn(
            `[Integrity] Instructional challenge ${cleanId} rejected: required onboarding activities unverified (firewallInspected: ${prog.firewallInspected}, policyAltered: ${prog.policyAltered}, step: ${currentStep}).`
          );
          return;
        }
      } else {
        // Any other instructional challenge must also have a registered validator or verified step state
        if (!registeredValidator) {
          console.warn(
            `[Integrity] Instructional challenge ${cleanId} rejected: missing registered validator or verified step state.`
          );
          return;
        }
      }
    }

    // 5. Master Challenge Score Verification:
    // Master hardening challenges require a verified audit outcome with a finite score >= 100 from the authoritative validator
    if (MASTER_HARDENING_CHALLENGE_IDS.has(cleanId)) {
      const score = authoritativeOutcome.score;
      if (typeof score !== 'number' || !Number.isFinite(score) || Number.isNaN(score) || score < 100) {
        console.warn(
          `[Integrity] Master challenge ${cleanId} rejected: authoritative score (${score}) is missing, non-finite, or below 100%.`
        );
        return;
      }
    }

    const existing = get().completedChallenges;
    if (!existing.includes(cleanId)) {
      const updated = [...existing, cleanId];
      setStoredItem('omega_completed_challenges', JSON.stringify(updated));
      set({ completedChallenges: updated });
    }
  },
  setActiveChallengeId: (activeChallengeId) => set({ activeChallengeId }),
  registerChallengeValidator: (challengeId, validator) => {
    activeChallengeValidators.set(challengeId, validator);
  },
  unregisterChallengeValidator: (challengeId) => {
    activeChallengeValidators.delete(challengeId);
  },

  setActiveLessonId: (activeLessonId) => {
    if (!activeLessonId || typeof activeLessonId !== 'string') {
      console.warn('[Integrity] setActiveLessonId rejected: invalid format.');
      return;
    }
    const trimmed = activeLessonId.trim();
    if (!VALID_CURRICULUM_LESSON_IDS.has(trimmed)) {
      console.warn(`[Integrity] setActiveLessonId rejected: unknown lessonId "${trimmed}".`);
      return;
    }
    setStoredItem('omega_active_lesson_id', trimmed);
    set({ activeLessonId: trimmed });
  },
  completeLesson: (lessonId) => {
    if (!VALID_CURRICULUM_LESSON_IDS.has(lessonId)) return;
    
    // Integrity Check: Cannot complete if quiz or task are not fulfilled
    const progress = get().lessonProgress[lessonId];
    if (!progress?.isQuizPassed || !progress?.isTaskPassed) {
      console.warn(`[Integrity] Cannot complete lesson ${lessonId}: Quiz or Task unfulfilled.`);
      return;
    }

    // Integrity Check: Cannot complete if previous lesson is not completed
    if (lessonId !== 'lesson-00-orientation' && lessonId !== 'lesson-01-cia-triad') {
      const lessonIdx = LESSON_SEQUENCE.indexOf(lessonId);
      if (lessonIdx > 0) {
        const prevLessonId = LESSON_SEQUENCE[lessonIdx - 1];
        if (prevLessonId !== 'lesson-00-orientation' && !get().completedLessons.includes(prevLessonId)) {
          console.warn(`[Integrity] Cannot complete lesson ${lessonId} before ${prevLessonId}`);
          return;
        }
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
      if (lessonId !== 'lesson-00-orientation' && lessonId !== 'lesson-01-cia-triad') {
        const lessonIdx = LESSON_SEQUENCE.indexOf(lessonId);
        if (lessonIdx > 0 && stage > 0) {
          const prevLessonId = LESSON_SEQUENCE[lessonIdx - 1];
          if (prevLessonId !== 'lesson-00-orientation' && !state.completedLessons.includes(prevLessonId)) {
            // Allow only stage 0 (Intro) if predecessor not done
            return state;
          }
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
    const rawCompletedChallenges = safeParseCompletedChallenges(
      getStoredItem('omega_completed_challenges'),
      VALID_CHALLENGE_IDS
    );
    const storedOnboardingProgress = safeParseOnboardingProgress(getStoredItem('omega_onboarding_progress'));

    // Sanitize completed challenges: Reject orientation-guided-challenge if onboarding activities are missing/incomplete
    const verifiedCompletedChallenges = rawCompletedChallenges.filter((cId) => {
      if (cId === 'orientation-guided-challenge') {
        return storedOnboardingProgress.firewallInspected === true && storedOnboardingProgress.policyAltered === true;
      }
      return true;
    });

    let restoredStep = 1;
    if (storedOnboardingProgress.firewallInspected) restoredStep = 2;
    if (storedOnboardingProgress.firewallInspected && storedOnboardingProgress.policyAltered) restoredStep = 3;

    const rawCompletedLessons = safeParseCompletedLessons(
      getStoredItem('omega_completed_lessons'),
      VALID_CURRICULUM_LESSON_IDS
    );
    const sanitizedLessons = sanitizeCompletedLessonsSequence(rawCompletedLessons);
    const parsedProgress = safeParseLessonProgress(getStoredItem('omega_lesson_progress'), sanitizedLessons);

    // Sanitize completedLessons against parsedProgress to reject forged completions where quiz or task was not passed
    const verifiedCompletedLessons = sanitizeCompletedLessonsSequence(
      sanitizedLessons.filter((lId) => {
        const prog = parsedProgress[lId];
        return prog && prog.isQuizPassed === true && prog.isTaskPassed === true;
      })
    );

    const activeLesson = safeParseActiveLessonId(getStoredItem('omega_active_lesson_id'));

    if (typeof document !== 'undefined') {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
    set({
      language: lang,
      completedChallenges: verifiedCompletedChallenges,
      completedLessons: verifiedCompletedLessons,
      activeLessonId: activeLesson,
      lessonProgress: parsedProgress,
      onboardingProgress: storedOnboardingProgress,
      onboardingStep: restoredStep,
    });
  },
};
});
