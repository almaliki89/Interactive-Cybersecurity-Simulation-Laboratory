export interface Rule<TContext = any> {
  id: string;
  name: string;
  order: number;
  enabled: boolean;
  action: 'ALLOW' | 'DENY' | 'DROP' | 'AUDIT' | 'REQUIRE_STEP_UP' | string;
  hitCount: number;
  description?: string;
  matches: (context: TContext) => boolean;
  execute?: (context: TContext) => { action: string; reason: string };
}

export interface RuleEvaluationResult {
  action: 'ALLOW' | 'DENY' | 'DROP' | 'AUDIT' | 'REQUIRE_STEP_UP' | 'NO_MATCH';
  matchedRule: Rule | null;
  reason: string;
}

export class RuleEngine<TContext = any> {
  private rules: Rule<TContext>[] = [];

  constructor(initialRules: Rule<TContext>[] = []) {
    this.setRules(initialRules);
  }

  public setRules(rules: Rule<TContext>[]): void {
    this.rules = [...rules].sort((a, b) => a.order - b.order);
  }

  public getRules(): Rule<TContext>[] {
    return [...this.rules];
  }

  public addRule(rule: Rule<TContext>): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => a.order - b.order);
  }

  public removeRule(id: string): void {
    this.rules = this.rules.filter((r) => r.id !== id);
  }

  public toggleRule(id: string): void {
    const r = this.rules.find((rule) => rule.id === id);
    if (r) {
      r.enabled = !r.enabled;
    }
  }

  public moveRule(id: string, direction: 'up' | 'down'): void {
    const idx = this.rules.findIndex((r) => r.id === id);
    if (idx === -1) return;

    if (direction === 'up' && idx > 0) {
      const temp = this.rules[idx];
      this.rules[idx] = this.rules[idx - 1];
      this.rules[idx - 1] = temp;
    } else if (direction === 'down' && idx < this.rules.length - 1) {
      const temp = this.rules[idx];
      this.rules[idx] = this.rules[idx + 1];
      this.rules[idx + 1] = temp;
    }

    // Re-index orders
    this.rules.forEach((r, i) => {
      r.order = i + 1;
    });
  }

  /**
   * Evaluates context against rules using First-Match semantics.
   */
  public evaluateFirstMatch(context: TContext): RuleEvaluationResult {
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      try {
        if (rule.matches(context)) {
          rule.hitCount++;
          if (rule.execute) {
            const res = rule.execute(context);
            return {
              action: res.action as any,
              matchedRule: rule,
              reason: res.reason,
            };
          }
          return {
            action: rule.action as any,
            matchedRule: rule,
            reason: `Matched Rule #${rule.order}: "${rule.name}" (${rule.action})`,
          };
        }
      } catch (err) {
        console.error(`Error evaluating rule ${rule.id}:`, err);
      }
    }

    return {
      action: 'NO_MATCH',
      matchedRule: null,
      reason: 'No rules matched the evaluation context.',
    };
  }

  public restoreState(restoredRules: Rule<TContext>[]): void {
    if (!restoredRules) return;
    restoredRules.forEach((restored) => {
      const existing = this.rules.find((r) => r.id === restored.id);
      if (existing) {
        existing.enabled = restored.enabled;
        existing.hitCount = restored.hitCount;
        existing.order = restored.order;
      }
    });
    this.rules.sort((a, b) => a.order - b.order);
  }

  public resetHitCounts(): void {
    this.rules.forEach((r) => {
      r.hitCount = 0;
    });
  }
}
