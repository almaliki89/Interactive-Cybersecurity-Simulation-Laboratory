import { SimulationClock } from '../clock/SimulationClock';
import { RuleEngine } from '../rules/RuleEngine';
import { SimulationRuntime } from '../runtime/SimulationRuntime';

// Light assertion helper
function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runEngineTests() {
  // Test 1: Simulation Clock
  const clock = new SimulationClock(1.0);
  assert(clock.getVirtualTime() === 0, 'Clock initial time should be 0');
  clock.stepForward(100);
  assert(clock.getVirtualTime() === 100, 'Clock step 100ms');
  clock.setSpeed(2.0);
  clock.stepForward(100);
  assert(clock.getVirtualTime() === 200, 'Clock 2x speed step 100ms');
  clock.pause();

  // Test 2: Scheduled Event Step
  const runtime = new SimulationRuntime();
  let executed = false;
  runtime.schedule({
    at: 100,
    type: 'TEST_EVENT',
  });
  runtime.events.on('TEST_EVENT', () => {
    executed = true;
  });
  runtime.step(50);
  assert(!executed, 'Event should not execute before target time');
  runtime.step(60);
  assert(executed, 'Event should execute once target time reached');

  // Test 3: Rule Engine & Firewall First Match
  const rules = [
    { id: 'r1', name: 'Allow HTTPS', order: 1, enabled: true, action: 'ALLOW', hitCount: 0, matches: (ctx: any) => ctx.destinationPort === 443 },
    { id: 'r2', name: 'Deny HTTP', order: 2, enabled: true, action: 'DENY', hitCount: 0, matches: (ctx: any) => ctx.destinationPort === 80 },
    { id: 'r3', name: 'Default Drop', order: 3, enabled: true, action: 'DROP', hitCount: 0, matches: () => true },
  ];
  const ruleEngine = new RuleEngine(rules);
  assert(ruleEngine.evaluateFirstMatch({ destinationPort: 443 }).action === 'ALLOW', '443 should ALLOW');
  assert(ruleEngine.evaluateFirstMatch({ destinationPort: 80 }).action === 'DENY', '80 should DENY');
  assert(ruleEngine.evaluateFirstMatch({ destinationPort: 22 }).action === 'DROP', '22 should DROP');

  // Test 4: TCP Handshake Sequence
  const tcpRuntime = new SimulationRuntime();
  const eventLog: string[] = [];
  tcpRuntime.events.on('*', (evt) => eventLog.push(evt.type));
  tcpRuntime.dispatch({ type: 'TCP_SYN', source: 'client', target: 'server' });
  tcpRuntime.schedule({ at: 200, type: 'TCP_SYN_ACK', source: 'server', target: 'client' });
  tcpRuntime.schedule({ at: 400, type: 'TCP_ACK', source: 'client', target: 'server' });
  tcpRuntime.schedule({ at: 450, type: 'CONNECTION_OPENED' });
  tcpRuntime.step(500);

  assert(eventLog.includes('TCP_SYN'), 'Contains TCP_SYN');
  assert(eventLog.includes('TCP_SYN_ACK'), 'Contains TCP_SYN_ACK');
  assert(eventLog.includes('TCP_ACK'), 'Contains TCP_ACK');
  assert(eventLog.includes('CONNECTION_OPENED'), 'Contains CONNECTION_OPENED');

  // Test 5: Replay Determinism
  const runScenario = () => {
    const rt = new SimulationRuntime();
    rt.dispatch({ type: 'PACKET_CREATED' });
    rt.schedule({ at: 100, type: 'PACKET_SENT' });
    rt.schedule({ at: 200, type: 'PACKET_DELIVERED' });
    rt.step(300);
    return rt.events.getHistory().map((e) => e.type);
  };
  const run1 = runScenario();
  const run2 = runScenario();
  assert(JSON.stringify(run1) === JSON.stringify(run2), 'Replay deterministic event ordering');
}
