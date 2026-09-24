import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationRuntime } from '../runtime/SimulationRuntime';
import { Rule } from '../rules/RuleEngine';

describe('Firewall Scenario Integration', () => {
  let runtime: SimulationRuntime;

  beforeEach(() => {
    runtime = new SimulationRuntime();

    const rules: Rule[] = [
      {
        id: 'rule-allow-https',
        name: 'Allow HTTPS',
        order: 1,
        enabled: true,
        action: 'ALLOW',
        hitCount: 0,
        matches: (ctx) => ctx.destinationPort === 443,
      },
      {
        id: 'rule-deny-http',
        name: 'Deny Cleartext HTTP',
        order: 2,
        enabled: true,
        action: 'DENY',
        hitCount: 0,
        matches: (ctx) => ctx.destinationPort === 80,
      },
      {
        id: 'rule-implicit-drop',
        name: 'Default Deny All',
        order: 3,
        enabled: true,
        action: 'DROP',
        hitCount: 0,
        matches: () => true,
      },
    ];

    runtime.rules.setRules(rules);
  });

  it('allows port 443, denies port 80, drops unmatched ports like 22 or 3389', () => {
    // Port 443
    const eval443 = runtime.rules.evaluateFirstMatch({ sourceIp: '203.0.113.1', destinationPort: 443, protocol: 'TCP' });
    expect(eval443.action).toBe('ALLOW');
    expect(eval443.matchedRule?.id).toBe('rule-allow-https');

    // Port 80
    const eval80 = runtime.rules.evaluateFirstMatch({ sourceIp: '203.0.113.1', destinationPort: 80, protocol: 'TCP' });
    expect(eval80.action).toBe('DENY');
    expect(eval80.matchedRule?.id).toBe('rule-deny-http');

    // Port 3389
    const eval3389 = runtime.rules.evaluateFirstMatch({ sourceIp: '203.0.113.1', destinationPort: 3389, protocol: 'TCP' });
    expect(eval3389.action).toBe('DROP');
    expect(eval3389.matchedRule?.id).toBe('rule-implicit-drop');
  });

  it('logs security events according to rule evaluation actions', () => {
    runtime.dispatch({
      type: 'FIREWALL_RULE_MATCHED',
      source: 'firewall',
      description: 'Ingress packet matched Rule 2 (DENY)',
    });

    const logs = runtime.logs.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].message).toContain('matched Rule 2');
  });
});
