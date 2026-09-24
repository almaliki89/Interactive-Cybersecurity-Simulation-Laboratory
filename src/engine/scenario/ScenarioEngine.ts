import { SimulationNode, ConnectionLink, Challenge } from '../../types/simulation';
import { ScheduledEvent } from '../events/EventEngine';
import { Rule } from '../rules/RuleEngine';

export interface ScenarioDefinition {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  nodes: SimulationNode[];
  connections: ConnectionLink[];
  scheduledEvents?: ScheduledEvent[];
  initialRules?: Rule[];
  challenge?: Challenge;
  metadata?: Record<string, any>;
}

export class ScenarioEngine {
  private scenarios: Map<string, ScenarioDefinition> = new Map();
  private activeScenarioId: string | null = null;

  public register(scenario: ScenarioDefinition): void {
    this.scenarios.set(scenario.id, scenario);
  }

  public registerBatch(scenarios: ScenarioDefinition[]): void {
    scenarios.forEach((s) => this.register(s));
  }

  public getScenario(id: string): ScenarioDefinition | undefined {
    return this.scenarios.get(id);
  }

  public getActiveScenario(): ScenarioDefinition | undefined {
    if (!this.activeScenarioId) return undefined;
    return this.scenarios.get(this.activeScenarioId);
  }

  public setActiveScenario(id: string): ScenarioDefinition | undefined {
    const sc = this.scenarios.get(id);
    if (sc) {
      this.activeScenarioId = id;
    }
    return sc;
  }

  public getAllScenarios(): ScenarioDefinition[] {
    return Array.from(this.scenarios.values());
  }
}
