import { describe, it, expect, beforeEach } from 'vitest';
import { RuleEngine, Rule } from '../rules/RuleEngine';

describe('RuleEngine', () => {
  let ruleEngine: RuleEngine;

  beforeEach(() => {
    const rules: Rule[] = [
      {
        id: 'rule-https',
        name: 'Allow HTTPS',
        order: 1,
        enabled: true,
        action: 'ALLOW',
        hitCount: 0,
        matches: (ctx) => ctx.destinationPort === 443,
      },
      {
        id: 'rule-http',
        name: 'Deny HTTP',
        order: 2,
        enabled: true,
        action: 'DENY',
        hitCount: 0,
        matches: (ctx) => ctx.destinationPort === 80,
      },
      {
        id: 'rule-default',
        name: 'Default Drop',
        order: 3,
        enabled: true,
        action: 'DROP',
        hitCount: 0,
        matches: () => true,
      },
    ];

    ruleEngine = new RuleEngine(rules);
  });

  it('evaluates First-Match: 443 allowed, 80 denied, unmatched port dropped', () => {
    const res443 = ruleEngine.evaluateFirstMatch({ destinationPort: 443 });
    expect(res443.action).toBe('ALLOW');
    expect(res443.matchedRule?.id).toBe('rule-https');

    const res80 = ruleEngine.evaluateFirstMatch({ destinationPort: 80 });
    expect(res80.action).toBe('DENY');
    expect(res80.matchedRule?.id).toBe('rule-http');

    const res22 = ruleEngine.evaluateFirstMatch({ destinationPort: 22 });
    expect(res22.action).toBe('DROP');
    expect(res22.matchedRule?.id).toBe('rule-default');
  });

  it('increments hitCount on match', () => {
    ruleEngine.evaluateFirstMatch({ destinationPort: 443 });
    ruleEngine.evaluateFirstMatch({ destinationPort: 443 });

    const rules = ruleEngine.getRules();
    const httpsRule = rules.find((r) => r.id === 'rule-https');
    expect(httpsRule?.hitCount).toBe(2);
  });

  it('skips disabled rules', () => {
    ruleEngine.toggleRule('rule-https');
    const res443 = ruleEngine.evaluateFirstMatch({ destinationPort: 443 });
    // Since rule-https is disabled, 443 falls through to default drop!
    expect(res443.action).toBe('DROP');
    expect(res443.matchedRule?.id).toBe('rule-default');
  });

  it('reorders rules and updates orders', () => {
    ruleEngine.moveRule('rule-http', 'up');
    const rules = ruleEngine.getRules();
    expect(rules[0].id).toBe('rule-http');
    expect(rules[0].order).toBe(1);
    expect(rules[1].id).toBe('rule-https');
    expect(rules[1].order).toBe(2);
  });
});
