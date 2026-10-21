import { SimulationId } from '../stores/simulationStore';

export interface CurriculumObjective {
  textAr: string;
  textEn: string;
}

export interface CurriculumKeyTerm {
  termAr: string;
  termEn: string;
  definitionAr: string;
  definitionEn: string;
}

export interface CurriculumConcept {
  textAr: string;
  textEn: string;
  analogyAr: string;
  analogyEn: string;
  keyTerms: CurriculumKeyTerm[];
}

export interface CurriculumDemonstration {
  titleAr: string;
  titleEn: string;
  whatToLookForAr: string;
  whatToLookForEn: string;
  initialStateAr: string;
  initialStateEn: string;
}

export interface CurriculumGuidedTask {
  taskTitleAr: string;
  taskTitleEn: string;
  instructionsAr: string[];
  instructionsEn: string[];
  whyWeDoThisAr: string;
  whyWeDoThisEn: string;
  hintsAr: string[];
  hintsEn: string[];
  validationCriterionAr: string;
  validationCriterionEn: string;
  checkType: 'interactive_simulation' | 'guided_confirmation';
}

export interface CurriculumResultExplanation {
  whatHappenedAr: string;
  whatHappenedEn: string;
  securitySignificanceAr: string;
  securitySignificanceEn: string;
}

export interface QuizOption {
  id: string;
  textAr: string;
  textEn: string;
  isCorrect: boolean;
  explanationAr: string;
  explanationEn: string;
}

export interface QuizQuestion {
  id: string;
  questionAr: string;
  questionEn: string;
  options: QuizOption[];
}

export interface CurriculumNextStep {
  nextLessonId?: string;
  takeawayAr: string;
  takeawayEn: string;
}

export interface CurriculumLesson {
  id: string;
  milestoneId: number;
  order: number;
  titleAr: string;
  titleEn: string;
  whyItMattersAr: string;
  whyItMattersEn: string;
  estimatedMinutes: number;
  simulationId: SimulationId;
  worldId?: number;
  challengeId?: string;

  // The 7 Pedagogical Stages
  objectives: CurriculumObjective[];
  concept: CurriculumConcept;
  demonstration: CurriculumDemonstration;
  guidedTask: CurriculumGuidedTask;
  resultExplanation: CurriculumResultExplanation;
  knowledgeCheck: QuizQuestion[];
  nextStep: CurriculumNextStep;
}

export interface CurriculumMilestone {
  id: number;
  slug: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  estimatedMinutes: number;
  iconName: string;
  primarySimulationId: SimulationId;
  lessonIds: string[];
}

export interface LessonProgressState {
  currentStage: number;
  furthestUnlockedStage: number;
  quizAnswers?: Record<string, string>;
  quizSubmitted?: Record<string, boolean>;
  checkedTaskSteps?: Record<string, boolean>;
  manualConfirmationChecked?: boolean;
}
