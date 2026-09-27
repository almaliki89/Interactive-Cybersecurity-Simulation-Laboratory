/**
 * OMEGA V16 — Threat Hunting, Detection Engineering & Threat Intelligence Core Types
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { SecurityTelemetryEvent, TelemetrySourceWorld, TelemetrySeverity } from '../../soc/logic/telemetry';
import { ForensicEvidence } from '../../forensics/logic/evidence';

export type HuntStatus = 'DRAFT' | 'ACTIVE' | 'INVESTIGATING' | 'VALIDATING' | 'COMPLETED';
export type HypothesisStatus = 'DRAFT' | 'TESTING' | 'SUPPORTED' | 'REJECTED';
export type DetectionRuleStatus = 'DRAFT' | 'TESTING' | 'VALIDATED' | 'PUBLISHED';
export type FindingStatus = 'OPEN' | 'VALIDATED' | 'DISMISSED';
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ThreatHunt {
  id: string;
  scenarioId: string;
  titleEn: string;
  titleAr: string;
  hypothesisId: string;
  status: HuntStatus;
  createdAtVirtualTime: number;
  dataSources: TelemetrySourceWorld[];
  queryIds: string[];
  findingIds: string[];
  detectionIds: string[];
  notesEn: string[];
  notesAr: string[];
  targetEntities: {
    users?: string[];
    hosts?: string[];
    ips?: string[];
    resources?: string[];
    processes?: string[];
  };
  mitreTechniques: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  summaryEn: string;
  summaryAr: string;
}

export interface HuntHypothesis {
  id: string;
  huntId: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  behaviorEn: string;
  behaviorAr: string;
  scopeEn: string;
  scopeAr: string;
  expectedSignalsEn: string[];
  expectedSignalsAr: string[];
  requiredSources: TelemetrySourceWorld[];
  status: HypothesisStatus;
  validationReasonEn?: string;
  validationReasonAr?: string;
}

export type QueryOperator = '=' | '!=' | 'CONTAINS' | 'IN' | 'BETWEEN' | '>' | '<' | '>=' | '<=';

export interface QueryCondition {
  field: string;
  operator: QueryOperator;
  value: string | number | string[] | [number, number];
  inverted?: boolean;
}

export interface QueryGroup {
  logical: 'AND' | 'OR';
  conditions: (QueryCondition | QueryGroup)[];
  inverted?: boolean;
}

export interface QueryAST {
  root: QueryGroup;
  rawQueryString: string;
}

export interface QueryResult {
  queryId: string;
  queryString: string;
  executedAtVirtualTime: number;
  matchedCount: number;
  events: SecurityTelemetryEvent[];
  matchedEventIds: string[];
  executionTimeVirtualMs: number;
  fieldsUsed: string[];
  error?: string;
}

export interface CorrelatedCluster {
  id: string;
  titleEn: string;
  titleAr: string;
  rootEventId: string;
  eventIds: string[];
  rawEventIds: string[];
  commonEntities: {
    user?: string;
    host?: string;
    sourceIp?: string;
    process?: string;
    resource?: string;
    repository?: string;
    artifact?: string;
  };
  timeSpanVirtual: {
    start: number;
    end: number;
  };
  strength: 'STRONG' | 'MEDIUM' | 'EMERGING';
  narrativeEn: string;
  narrativeAr: string;
  sourceWorlds: TelemetrySourceWorld[];
  events: SecurityTelemetryEvent[];
}

export type IndicatorType =
  | 'IP'
  | 'DOMAIN'
  | 'HASH_SHA256'
  | 'PROCESS_NAME'
  | 'USER_AGENT'
  | 'CONTAINER_IMAGE'
  | 'PACKAGE_NAME'
  | 'BEHAVIORAL_PATTERN';

export interface ThreatIntelIndicator {
  id: string;
  type: IndicatorType;
  value: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  confidence: ConfidenceLevel;
  severity: TelemetrySeverity;
  actorName?: string;
  campaign?: string;
  mitreTechniques: string[];
  firstSeenVirtualTime: number;
  tags: string[];
  matchedEventIds?: string[];
}

export interface ThreatActorProfile {
  id: string;
  name: string;
  aliases: string[];
  origin: string;
  motivationEn: string;
  motivationAr: string;
  targetedSectors: string[];
  ttps: string[];
  activeCampaign: string;
  confidence: ConfidenceLevel;
}

export interface DetectionConditionRule {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'IN' | 'GREATER_THAN';
  value: string | number | string[];
}

export interface DetectionRule {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dataSources: TelemetrySourceWorld[];
  conditions: DetectionConditionRule[];
  mitreTechniques: string[];
  status: DetectionRuleStatus;
  ruleType: 'SINGLE_EVENT' | 'THRESHOLD' | 'SEQUENCE' | 'AGGREGATION';
  threshold?: number;
  windowVirtualSeconds?: number;
  exclusions?: {
    hosts?: string[];
    users?: string[];
    processes?: string[];
  };
  createdAtVirtualTime: number;
  lastValidatedAtVirtualTime?: number;
  publishedToSocAtVirtualTime?: number;
}

export interface DetectionValidationResult {
  ruleId: string;
  totalEvaluated: number;
  matchedEventIds: string[];
  truePositives: number;
  falsePositives: number;
  benignMatches: string[];
  maliciousMatches: string[];
  precision: number;
  recall: number;
  isValid: boolean;
  tuningAdviceEn: string;
  tuningAdviceAr: string;
  deltaExplanationEn?: string;
  deltaExplanationAr?: string;
}

export interface EntityReference {
  type: 'USER' | 'HOST' | 'IP' | 'PROCESS' | 'RESOURCE' | 'ARTIFACT' | 'CONTAINER' | 'REPOSITORY';
  value: string;
}

export interface HuntFinding {
  id: string;
  huntId: string;
  titleEn: string;
  titleAr: string;
  summaryEn: string;
  summaryAr: string;
  severity: TelemetrySeverity;
  eventIds: string[];
  rawEventIds: string[];
  entityRefs: EntityReference[];
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0 to 100
  confidenceBreakdown: {
    signalCountScore: number;
    correlationStrengthScore: number;
    intelMatchesScore: number;
    sourceDiversityScore: number;
  };
  status: FindingStatus;
  whyEn: string;
  whyAr: string;
  createdAtVirtualTime: number;
  detectionRuleId?: string;
}

export interface SocHandoffPackage {
  handoffId: string;
  huntId: string;
  findingId: string;
  ruleId?: string;
  rawEventIds: string[];
  eventIds: string[];
  summaryEn: string;
  summaryAr: string;
  priority: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';
  timestampVirtual: number;
  status: 'DISPATCHED' | 'INGESTED';
}

export interface ForensicsHandoffPackage {
  handoffId: string;
  huntId: string;
  findingId: string;
  caseId: string;
  evidenceList: ForensicEvidence[];
  rawEventIds: string[];
  acquiredAtVirtualTime: number;
}
