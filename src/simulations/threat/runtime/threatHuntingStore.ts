/**
 * OMEGA V16 — Threat Hunting & Detection Engineering Zustand Store
 * State management for Hypotheses, Telemetry, Queries, Correlations, Intel, Findings, and Detections.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { create } from 'zustand';
import { SecurityTelemetryEvent } from '../../soc/logic/telemetry';
import { normalizeRuntimeEvent, RawSimulationEvent } from '../../soc/logic/normalization';
import { SimulationRuntime, globalSimulationRuntime } from '../../../engine/runtime/SimulationRuntime';
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
  ConfidenceLevel,
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
  executedQueriesByHunt: Record<string, string[]>;

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

  addFinding: (
    finding: Omit<HuntFinding, 'id' | 'createdAtVirtualTime' | 'confidenceScore' | 'confidenceBreakdown' | 'huntId' | 'confidence'> & {
      huntId?: string;
      confidence?: ConfidenceLevel;
    }
  ) => void;
  validateFinding: (findingId: string) => boolean;
  dismissFinding: (findingId: string) => void;

  addDetectionRule: (rule: Omit<DetectionRule, 'id' | 'createdAtVirtualTime'>) => string;
  updateDetectionRule: (rule: DetectionRule) => void;
  validateDetectionRule: (ruleId: string) => DetectionValidationResult;
  publishDetectionRuleToSoc: (ruleId: string) => void;

  dispatchSocHandoff: (findingId: string, ruleId?: string) => SocHandoffPackage;
  dispatchForensicsHandoff: (findingId: string, caseId?: string) => ForensicsHandoffPackage;

  // SimulationRuntime Integration
  ingestRuntimeEvents: (rawEvents: RawSimulationEvent[]) => number;
  syncWithSimulationRuntime: (runtime?: SimulationRuntime) => number;
  connectRuntime: (runtime?: SimulationRuntime) => () => void;

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
  executedQueriesByHunt: {},

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

  setActiveHunt: (rawHuntId: string) => {
    const scenarioKey = HUNT_SCENARIOS[rawHuntId] ? rawHuntId : 'HUNT-01';
    const scenario = HUNT_SCENARIOS[scenarioKey];
    const matchedIntel = ThreatIntelMatcher.matchTelemetry(SIMULATION_THREAT_INDICATORS, scenario.events);

    set((state) => ({
      activeHuntId: scenario.hunt.id,
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
        [scenario.hunt.id]: { ...scenario.hunt },
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
    const activeId = get().activeHuntId;

    const isValidQuery = typeof query === 'string' && query.trim().length > 0 && !result.error;

    set((state) => {
      const prevHuntQueries = state.executedQueriesByHunt?.[activeId] || [];
      const updatedHuntQueries = isValidQuery
        ? Array.from(new Set([...prevHuntQueries, query.trim()]))
        : prevHuntQueries;

      return {
        currentQueryResult: result,
        queryHistory: [result, ...state.queryHistory.slice(0, 19)],
        executedQueryStrings: Array.from(new Set([...state.executedQueryStrings, query])),
        executedQueriesByHunt: {
          ...(state.executedQueriesByHunt || {}),
          [activeId]: updatedHuntQueries,
        },
      };
    });

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

    // Sanitize and deduplicate event IDs against active telemetry to prevent artificial score inflation
    const distinctEventIds = Array.from(new Set(findingData.eventIds || []));
    const validEvents = state.telemetryEvents.filter((e) => distinctEventIds.includes(e.id));
    const uniqueValidEventIds = validEvents.map((e) => e.id);
    const uniqueRawEventIds = Array.from(
      new Set(
        validEvents
          .map((e) => e.rawEventId || e.id)
          .concat(
            (findingData.rawEventIds || []).filter((rid) =>
              validEvents.some((e) => e.rawEventId === rid || e.id === rid)
            )
          )
      )
    );

    // Calculate deterministic confidence breakdown using deduplicated verified signals
    const signalCount = uniqueValidEventIds.length;
    const sourceDiversity = new Set(validEvents.map((e) => e.sourceWorld)).size;

    const matchedIntelCount = state.intelIndicators.filter((i) =>
      i.matchedEventIds?.some((id) => uniqueValidEventIds.includes(id))
    ).length;

    const signalScore = Math.min(30, signalCount * 10);
    const diversityScore = Math.min(30, sourceDiversity * 15);
    const intelScore = Math.min(40, matchedIntelCount * 20);
    const totalConfidenceScore = signalScore + diversityScore + intelScore;

    let confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (totalConfidenceScore >= 70) confidenceLevel = 'HIGH';
    else if (totalConfidenceScore >= 40) confidenceLevel = 'MEDIUM';

    const newFinding: HuntFinding = {
      ...findingData,
      id: findingId,
      huntId: state.activeHuntId,
      eventIds: uniqueValidEventIds,
      rawEventIds: uniqueRawEventIds,
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
    const state = get();
    const finding = state.findings.find((f) => f.id === findingId);
    if (!finding) return false;

    // Strict ownership: Must belong to active hunt
    if (finding.huntId !== state.activeHuntId) return false;

    // Must contain at least 2 distinct non-blank event IDs
    const distinctEventIds = Array.from(
      new Set((finding.eventIds || []).filter((id) => typeof id === 'string' && id.trim().length > 0))
    );
    if (distinctEventIds.length < 2) return false;

    // All event IDs must exist in active hunt telemetry
    const allEventsExist = distinctEventIds.every((id) =>
      state.telemetryEvents.some((e) => e.id === id)
    );
    if (!allEventsExist) return false;

    // Raw event IDs must be present and all exist in active telemetry
    const distinctRawIds = Array.from(
      new Set((finding.rawEventIds || []).filter((id) => typeof id === 'string' && id.trim().length > 0))
    );
    if (distinctRawIds.length === 0) return false;
    const allRawExist = distinctRawIds.every((rid) =>
      state.telemetryEvents.some((e) => e.rawEventId === rid || e.id === rid)
    );
    if (!allRawExist) return false;

    set((s) => ({
      findings: s.findings.map((f) =>
        f.id === findingId ? { ...f, status: 'VALIDATED' as const } : f
      ),
    }));

    return true;
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
      ...ruleData,
      id: ruleId,
      huntId: state.activeHuntId,
      createdAtVirtualTime: 0,
    };

    set({
      detections: [newRule, ...state.detections],
    });

    return ruleId;
  },

  updateDetectionRule: (rule) => {
    set((state) => ({
      detections: state.detections.map((d) => {
        if (d.id !== rule.id) return d;
        return {
          ...rule,
          huntId: d.huntId || rule.huntId || state.activeHuntId,
        };
      }),
    }));
  },

  validateDetectionRule: (ruleId) => {
    const state = get();
    const rule = state.detections.find((d) => d.id === ruleId);
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    // Ownership check: Rule must belong to active hunt
    if (rule.huntId && rule.huntId !== state.activeHuntId) {
      throw new Error(`Rule ${ruleId} does not belong to active hunt ${state.activeHuntId}`);
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
    const state = get();
    const rule = state.detections.find((d) => d.id === ruleId);
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    // Enforce hunt ownership
    if (rule.huntId && rule.huntId !== state.activeHuntId) {
      throw new Error(`Cannot publish rule ${ruleId}: belongs to ${rule.huntId}, not active hunt ${state.activeHuntId}`);
    }

    // Enforce valid recent test evaluation
    const result = state.detectionResults[ruleId];
    if (!result || result.ruleId !== ruleId) {
      throw new Error(`Cannot publish rule ${ruleId} to SOC: rule has not been tested or validated against telemetry`);
    }

    // Enforce strict 0 false positives and at least 1 true positive
    if (!result.isValid || result.truePositives < 1 || result.falsePositives !== 0) {
      throw new Error(
        `Cannot publish rule ${ruleId} to SOC: rule failed required validation criteria (TP: ${result.truePositives}, FP: ${result.falsePositives})`
      );
    }

    // Enforce matched telemetry event validity
    const matched = result.matchedEventIds || [];
    if (matched.length === 0 || !matched.every((id) => state.telemetryEvents.some((e) => e.id === id))) {
      throw new Error(`Cannot publish rule ${ruleId} to SOC: matched events do not exist in current telemetry`);
    }

    set((s) => ({
      detections: s.detections.map((d) =>
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

    // Strict ownership: finding must belong to active hunt
    if (finding.huntId !== state.activeHuntId) {
      throw new Error(`Finding ${findingId} belongs to ${finding.huntId}, not active hunt ${state.activeHuntId}`);
    }

    // Must be validated
    if (finding.status !== 'VALIDATED') {
      throw new Error(`Cannot dispatch unvalidated finding ${findingId} to SOC`);
    }

    // Verify all finding events exist in telemetry
    const validEvents = (finding.eventIds || []).filter((id) => state.telemetryEvents.some((e) => e.id === id));
    if (validEvents.length === 0 || validEvents.length !== finding.eventIds.length) {
      throw new Error(`Finding ${findingId} contains invalid or unverified telemetry references`);
    }

    // If ruleId is supplied, verify rule belongs to same hunt and is validated with 0 false positives
    if (ruleId) {
      const rule = state.detections.find((d) => d.id === ruleId);
      if (!rule) throw new Error(`Detection rule ${ruleId} not found`);
      if (rule.huntId && rule.huntId !== state.activeHuntId) {
        throw new Error(`Rule ${ruleId} belongs to ${rule.huntId}, not active hunt ${state.activeHuntId}`);
      }
      const ruleResult = state.detectionResults[ruleId];
      if (!ruleResult || !ruleResult.isValid || ruleResult.truePositives < 1 || ruleResult.falsePositives !== 0) {
        throw new Error(`Rule ${ruleId} has not achieved 0 false positives validation required for handoff`);
      }
    }

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

    // Strict ownership: finding must belong to active hunt
    if (finding.huntId !== state.activeHuntId) {
      throw new Error(`Finding ${findingId} belongs to ${finding.huntId}, not active hunt ${state.activeHuntId}`);
    }

    // Must be validated
    if (finding.status !== 'VALIDATED') {
      throw new Error(`Cannot dispatch unvalidated finding ${findingId} to Forensics`);
    }

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

  ingestRuntimeEvents: (rawEvents) => {
    if (!rawEvents || rawEvents.length === 0) return 0;

    const normalizedNew = rawEvents.map((evt) => normalizeRuntimeEvent(evt));

    set((state) => {
      const existingIds = new Set(state.telemetryEvents.map((e) => e.id));
      const deduplicated = normalizedNew.filter((e) => !existingIds.has(e.id));

      if (deduplicated.length === 0) return state;

      const updatedTelemetry = [...deduplicated, ...state.telemetryEvents];
      const matchedIntel = ThreatIntelMatcher.matchTelemetry(SIMULATION_THREAT_INDICATORS, updatedTelemetry);

      return {
        ...state,
        telemetryEvents: updatedTelemetry,
        intelIndicators: matchedIntel,
      };
    });

    return normalizedNew.length;
  },

  syncWithSimulationRuntime: (runtime = globalSimulationRuntime) => {
    const rawHistory = runtime.events.getHistory();
    const rawQueue = runtime.events.getQueue() || [];
    const allRaw = [...rawHistory, ...rawQueue];
    return get().ingestRuntimeEvents(allRaw as any);
  },

  connectRuntime: (runtime = globalSimulationRuntime) => {
    // Initial sync
    get().syncWithSimulationRuntime(runtime);

    // Subscribe to live events on SimulationRuntime
    const unsubscribe = runtime.events.on('*', (evt) => {
      get().ingestRuntimeEvents([evt as any]);
    });

    return unsubscribe;
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
