/**
 * OMEGA V16 — Threat Hunting & Detection Engineering Zustand Store
 * State management for Hypotheses, Telemetry, Queries, Correlations, Intel, Findings, and Detections.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { create } from 'zustand';
import { SecurityTelemetryEvent } from '../../soc/logic/telemetry';
import {
  ThreatHunt,
  HuntHypothesis,
  QueryResult,
  EntityReference,
  HuntFinding,
  DetectionRule,
  DetectionValidationResult,
  ThreatIntelIndicator,
  ThreatActorProfile,
  SocHandoffPackage,
  ForensicsHandoffPackage,
} from '../logic/types';
import { HUNT_SCENARIOS } from '../logic/scenarios';
import { ThreatHuntQueryEngine } from '../logic/queryEngine';
import { ThreatIntelMatcher, SIMULATION_THREAT_INDICATORS, SIMULATION_THREAT_ACTORS } from '../logic/threatIntel';
import { DetectionEngine } from '../logic/detectionEngine';
import { ThreatHandoffBridge } from '../logic/handoff';

export interface ThreatHuntingState {
  activeHuntId: string;
  hunts: Record<string, ThreatHunt>;
  hypotheses: Record<string, HuntHypothesis>;
  telemetryEvents: SecurityTelemetryEvent[];

  // Telemetry Filters
  searchQuery: string;
  worldFilter: string;
  severityFilter: string;
  userFilter: string;
  hostFilter: string;

  // Query State
  rawQueryString: string;
  currentQueryResult: QueryResult | null;
  queryHistory: QueryResult[];
  executedQueryStrings: string[];

  // Selection
  selectedEventId: string | null;
  selectedEntity: EntityReference | null;

  // Findings & Detections
  findings: HuntFinding[];
  detections: DetectionRule[];
  detectionResults: Record<string, DetectionValidationResult>;

  // Intel
  intelIndicators: ThreatIntelIndicator[];
  threatActors: ThreatActorProfile[];

  // Handoffs
  socHandoffs: SocHandoffPackage[];
  forensicsHandoffs: ForensicsHandoffPackage[];

  // UI Panels
  activeTab: 'HYPOTHESIS' | 'TELEMETRY' | 'QUERY' | 'CORRELATION' | 'THREAT_INTEL' | 'FINDINGS' | 'DETECTION' | 'MASTER';
  bottomDrawerTab: 'RAW' | 'QUERY_DIAG' | 'DETECTION_TUNING' | 'HANDOFF_LOGS';
  isBottomDrawerOpen: boolean;
  isMobileNavOpen: boolean;
  isMobileInspectorOpen: boolean;

  // Actions
  setActiveHunt: (huntId: string) => void;
  setSearchQuery: (query: string) => void;
  setWorldFilter: (world: string) => void;
  setSeverityFilter: (severity: string) => void;
  setUserFilter: (user: string) => void;
  setHostFilter: (host: string) => void;
  resetFilters: () => void;

  setRawQueryString: (query: string) => void;
  executeQuery: (query?: string) => QueryResult;

  selectEvent: (eventId: string | null) => void;
  selectEntity: (entity: EntityReference | null) => void;

  updateHypothesisStatus: (status: HuntHypothesis['status'], reasonEn?: string, reasonAr?: string) => void;

  addFinding: (finding: Omit<HuntFinding, 'id' | 'createdAtVirtualTime' | 'confidenceScore' | 'confidenceBreakdown'>) => void;
  validateFinding: (findingId: string) => void;
  dismissFinding: (findingId: string) => void;

  addDetectionRule: (rule: Omit<DetectionRule, 'id' | 'createdAtVirtualTime'>) => string;
  updateDetectionRule: (rule: DetectionRule) => void;
  validateDetectionRule: (ruleId: string) => DetectionValidationResult;
  publishDetectionRuleToSoc: (ruleId: string) => void;

  dispatchSocHandoff: (findingId: string, ruleId?: string) => SocHandoffPackage;
  dispatchForensicsHandoff: (findingId: string, caseId?: string) => ForensicsHandoffPackage;

  setActiveTab: (tab: ThreatHuntingState['activeTab']) => void;
  setBottomDrawer: (open: boolean, tab?: ThreatHuntingState['bottomDrawerTab']) => void;
  toggleMobileNav: () => void;
  toggleMobileInspector: () => void;
  closeMobileDrawers: () => void;
}

// Initial hunts dictionary from definitions
const initialHunts: Record<string, ThreatHunt> = {};
const initialHypotheses: Record<string, HuntHypothesis> = {};

Object.values(HUNT_SCENARIOS).forEach((scenario) => {
  initialHunts[scenario.hunt.id] = { ...scenario.hunt };
  initialHypotheses[scenario.hypothesis.id] = { ...scenario.hypothesis };
});

const defaultHuntId = 'HUNT-01';
const defaultScenario = HUNT_SCENARIOS[defaultHuntId];
const initialMatchedIntel = ThreatIntelMatcher.matchTelemetry(
  SIMULATION_THREAT_INDICATORS,
  defaultScenario.events
);

export const useThreatHuntingStore = create<ThreatHuntingState>((set, get) => ({
  activeHuntId: defaultHuntId,
  hunts: initialHunts,
  hypotheses: initialHypotheses,
  telemetryEvents: defaultScenario.events,

  searchQuery: '',
  worldFilter: 'ALL',
  severityFilter: 'ALL',
  userFilter: 'ALL',
  hostFilter: 'ALL',

  rawQueryString: 'sourceWorld = WINDOWS AND outcome = FAILURE',
  currentQueryResult: null,
  queryHistory: [],
  executedQueryStrings: [],

  selectedEventId: null,
  selectedEntity: null,

  findings: [],
  detections: [],
  detectionResults: {},

  intelIndicators: initialMatchedIntel,
  threatActors: SIMULATION_THREAT_ACTORS,

  socHandoffs: [],
  forensicsHandoffs: [],

  activeTab: 'TELEMETRY',
  bottomDrawerTab: 'RAW',
  isBottomDrawerOpen: false,
  isMobileNavOpen: false,
  isMobileInspectorOpen: false,

  setActiveHunt: (huntId: string) => {
    const scenario = HUNT_SCENARIOS[huntId] || HUNT_SCENARIOS['HUNT-01'];
    const matchedIntel = ThreatIntelMatcher.matchTelemetry(SIMULATION_THREAT_INDICATORS, scenario.events);

    set((state) => ({
      activeHuntId: huntId,
      telemetryEvents: scenario.events,
      intelIndicators: matchedIntel,
      selectedEventId: null,
      selectedEntity: null,
      currentQueryResult: null,
      worldFilter: 'ALL',
      severityFilter: 'ALL',
      userFilter: 'ALL',
      hostFilter: 'ALL',
      searchQuery: '',
      isMobileNavOpen: false,
      isMobileInspectorOpen: false,
      hunts: {
        ...state.hunts,
        [huntId]: { ...scenario.hunt },
      },
      hypotheses: {
        ...state.hypotheses,
        [scenario.hypothesis.id]: { ...scenario.hypothesis },
      },
    }));
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setWorldFilter: (worldFilter) => set({ worldFilter }),
  setSeverityFilter: (severityFilter) => set({ severityFilter }),
  setUserFilter: (userFilter) => set({ userFilter }),
  setHostFilter: (hostFilter) => set({ hostFilter }),
  resetFilters: () =>
    set({
      searchQuery: '',
      worldFilter: 'ALL',
      severityFilter: 'ALL',
      userFilter: 'ALL',
      hostFilter: 'ALL',
    }),

  setRawQueryString: (rawQueryString) => set({ rawQueryString }),

  executeQuery: (queryStr) => {
    const query = queryStr !== undefined ? queryStr : get().rawQueryString;
    const events = get().telemetryEvents;
    const result = ThreatHuntQueryEngine.execute(query, events);

    set((state) => ({
      currentQueryResult: result,
      queryHistory: [result, ...state.queryHistory.slice(0, 19)],
      executedQueryStrings: Array.from(new Set([...state.executedQueryStrings, query])),
    }));

    return result;
  },

  selectEvent: (eventId) => {
    set((state) => ({
      selectedEventId: eventId,
      // If selected on mobile, open inspector
      isMobileInspectorOpen: !!eventId ? true : state.isMobileInspectorOpen,
      isMobileNavOpen: false,
    }));
  },

  selectEntity: (entity) => {
    set((state) => ({
      selectedEntity: entity,
      isMobileInspectorOpen: !!entity ? true : state.isMobileInspectorOpen,
      isMobileNavOpen: false,
    }));
  },

  updateHypothesisStatus: (status, reasonEn, reasonAr) => {
    const state = get();
    const currentHunt = state.hunts[state.activeHuntId];
    if (!currentHunt) return;

    const hypId = currentHunt.hypothesisId;
    const currentHyp = state.hypotheses[hypId];
    if (!currentHyp) return;

    set({
      hypotheses: {
        ...state.hypotheses,
        [hypId]: {
          ...currentHyp,
          status,
          validationReasonEn: reasonEn,
          validationReasonAr: reasonAr,
        },
      },
    });
  },

  addFinding: (findingData) => {
    const state = get();
    const vTime = state.telemetryEvents.length > 0 ? state.telemetryEvents[0].virtualTime : 0;
    const findingId = `FIND-${state.activeHuntId}-${state.findings.length + 1}`;

    // Calculate deterministic confidence breakdown
    const signalCount = findingData.eventIds.length;
    const sourceDiversity = new Set(
      state.telemetryEvents.filter((e) => findingData.eventIds.includes(e.id)).map((e) => e.sourceWorld)
    ).size;

    const matchedIntelCount = state.intelIndicators.filter((i) =>
      i.matchedEventIds?.some((id) => findingData.eventIds.includes(id))
    ).length;

    const signalScore = Math.min(30, signalCount * 10);
    const diversityScore = Math.min(30, sourceDiversity * 15);
    const intelScore = Math.min(40, matchedIntelCount * 20);
    const totalConfidenceScore = signalScore + diversityScore + intelScore;

    let confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (totalConfidenceScore >= 70) confidenceLevel = 'HIGH';
    else if (totalConfidenceScore >= 40) confidenceLevel = 'MEDIUM';

    const newFinding: HuntFinding = {
      id: findingId,
      ...findingData,
      createdAtVirtualTime: vTime,
      confidence: confidenceLevel,
      confidenceScore: totalConfidenceScore,
      confidenceBreakdown: {
        signalCountScore: signalScore,
        correlationStrengthScore: 25,
        intelMatchesScore: intelScore,
        sourceDiversityScore: diversityScore,
      },
    };

    set({
      findings: [newFinding, ...state.findings],
    });
  },

  validateFinding: (findingId) => {
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === findingId ? { ...f, status: 'VALIDATED' as const } : f
      ),
    }));
  },

  dismissFinding: (findingId) => {
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === findingId ? { ...f, status: 'DISMISSED' as const } : f
      ),
    }));
  },

  addDetectionRule: (ruleData) => {
    const state = get();
    const ruleId = `DET-${state.activeHuntId}-${state.detections.length + 1}`;
    const newRule: DetectionRule = {
      id: ruleId,
      ...ruleData,
      createdAtVirtualTime: 0,
    };

    set({
      detections: [newRule, ...state.detections],
    });

    return ruleId;
  },

  updateDetectionRule: (rule) => {
    set((state) => ({
      detections: state.detections.map((d) => (d.id === rule.id ? rule : d)),
    }));
  },

  validateDetectionRule: (ruleId) => {
    const state = get();
    const rule = state.detections.find((d) => d.id === ruleId);
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    const prevResult = state.detectionResults[ruleId];
    const validationResult = DetectionEngine.validateRule(rule, state.telemetryEvents, prevResult);

    set((s) => ({
      detectionResults: {
        ...s.detectionResults,
        [ruleId]: validationResult,
      },
      detections: s.detections.map((d) =>
        d.id === ruleId
          ? {
              ...d,
              status: validationResult.isValid ? 'VALIDATED' : 'TESTING',
              lastValidatedAtVirtualTime: 100,
            }
          : d
      ),
    }));

    return validationResult;
  },

  publishDetectionRuleToSoc: (ruleId) => {
    set((state) => ({
      detections: state.detections.map((d) =>
        d.id === ruleId
          ? {
              ...d,
              status: 'PUBLISHED' as const,
              publishedToSocAtVirtualTime: 200,
            }
          : d
      ),
    }));
  },

  dispatchSocHandoff: (findingId, ruleId) => {
    const state = get();
    const finding = state.findings.find((f) => f.id === findingId);
    if (!finding) throw new Error(`Finding ${findingId} not found`);

    const handoff = ThreatHandoffBridge.createSocHandoff(finding, ruleId, 150);

    set((s) => ({
      socHandoffs: [handoff, ...s.socHandoffs],
    }));

    return handoff;
  },

  dispatchForensicsHandoff: (findingId, caseId = 'CASE-NEXORA-FIN-001') => {
    const state = get();
    const finding = state.findings.find((f) => f.id === findingId);
    if (!finding) throw new Error(`Finding ${findingId} not found`);

    const handoff = ThreatHandoffBridge.createForensicsHandoff(
      finding,
      state.telemetryEvents,
      caseId,
      160
    );

    set((s) => ({
      forensicsHandoffs: [handoff, ...s.forensicsHandoffs],
    }));

    return handoff;
  },

  setActiveTab: (activeTab) => set({ activeTab }),
  setBottomDrawer: (open, tab) =>
    set((state) => ({
      isBottomDrawerOpen: open,
      bottomDrawerTab: tab || state.bottomDrawerTab,
    })),

  toggleMobileNav: () =>
    set((state) => ({
      isMobileNavOpen: !state.isMobileNavOpen,
      isMobileInspectorOpen: false,
    })),

  toggleMobileInspector: () =>
    set((state) => ({
      isMobileInspectorOpen: !state.isMobileInspectorOpen,
      isMobileNavOpen: false,
    })),

  closeMobileDrawers: () =>
    set({
      isMobileNavOpen: false,
      isMobileInspectorOpen: false,
    }),
}));
