import { LucideIcon } from 'lucide-react';

export type MacroDomainId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J';

export interface MacroDomain {
  id: MacroDomainId;
  code: string;
  nameAr: string;
  nameEn: string;
  subtitleAr: string;
  subtitleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  color: string;
  worldIds: number[];
}

export interface ConceptItem {
  id: string;
  nameAr: string;
  nameEn: string;
  briefAr: string;
  briefEn: string;
  securityRelevanceAr: string;
  securityRelevanceEn: string;
  controlsAr: string[];
  controlsEn: string[];
}

export interface WorldDefinition {
  id: number;
  slug: string;
  macroDomainId: MacroDomainId;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  simulationType: string;
  iconName: string;
  prerequisites: number[]; // World IDs
  relatedWorlds: number[];
  concepts: ConceptItem[];
  practicalObjectivesAr: string[];
  practicalObjectivesEn: string[];
  challengeTitleAr: string;
  challengeTitleEn: string;
}

export interface LearningPath {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  roleAr: string;
  roleEn: string;
  iconName: string;
  color: string;
  targetWorldIds: number[];
}

export interface GlossaryTerm {
  id: string;
  termAr: string;
  termEn: string;
  category: string;
  definitionAr: string;
  definitionEn: string;
  exampleAr: string;
  exampleEn: string;
  relatedWorldId: number;
}

export type CyberRangeLayer = 'network' | 'endpoint' | 'identity' | 'application' | 'soc';

export interface CyberTimelineEvent {
  id: string;
  timestamp: number;
  layer: CyberRangeLayer;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  sourceEntity: string;
  targetEntity?: string;
  metadata?: Record<string, any>;
}
