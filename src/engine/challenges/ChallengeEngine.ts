import { Challenge, ChallengeObjective } from '../../types/simulation';

export type ConditionType =
  | 'FIREWALL_PORT_STATE'
  | 'TCP_HANDSHAKE_STATE'
  | 'HOST_ISOLATION_STATE'
  | 'DNS_RECORD_VERIFIED'
  | 'TLS_SESSION_ESTABLISHED'
  | 'MALWARE_CONTAINED'
  | 'CUSTOM_EVALUATOR';

export interface ObjectiveCondition {
  objectiveId: string;
  type: ConditionType;
  expectedValue?: any;
  evaluator?: (state: any) => boolean;
  meta?: Record<string, any>;
}

export class ChallengeEngine {
  private activeChallenge: Challenge | null = null;
  private conditions: Map<string, ObjectiveCondition> = new Map();

  public setChallenge(challenge: Challenge, conditions?: ObjectiveCondition[]): void {
    this.activeChallenge = JSON.parse(JSON.stringify(challenge));
    this.conditions.clear();

    if (conditions) {
      conditions.forEach((c) => {
        this.conditions.set(c.objectiveId, c);
      });
    }
  }

  public getChallenge(): Challenge | null {
    return this.activeChallenge;
  }

  public evaluate(currentState: any): {
    completed: boolean;
    objectives: ChallengeObjective[];
    allPassed: boolean;
  } {
    if (!this.activeChallenge) {
      return { completed: false, objectives: [], allPassed: false };
    }

    let allPassed = true;

    this.activeChallenge.objectives.forEach((obj) => {
      const cond = this.conditions.get(obj.id);
      if (cond && cond.evaluator) {
        try {
          obj.isCompleted = cond.evaluator(currentState);
        } catch (e) {
          console.error(`Error evaluating condition for objective ${obj.id}:`, e);
          obj.isCompleted = false;
        }
      }

      if (!obj.isCompleted) {
        allPassed = false;
      }
    });

    return {
      completed: allPassed,
      objectives: this.activeChallenge.objectives,
      allPassed,
    };
  }

  public restoreState(challenge: Challenge | null): void {
    if (!challenge) {
      this.activeChallenge = null;
      return;
    }
    this.activeChallenge = JSON.parse(JSON.stringify(challenge));
  }

  public isObjectiveCompleted(objectiveId: string): boolean {
    if (!this.activeChallenge) return false;
    const obj = this.activeChallenge.objectives.find((o) => o.id === objectiveId);
    return !!obj?.isCompleted;
  }
}
