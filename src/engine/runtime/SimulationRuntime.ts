import { SimulationClock, ClockStatus } from '../clock/SimulationClock';
import { EventEngine, SimulationEvent, ScheduledEvent, SimulationEventType } from '../events/EventEngine';
import { PacketEngine, EnginePacket } from '../packets/PacketEngine';
import { RuleEngine, Rule } from '../rules/RuleEngine';
import { LogEngine, EngineLogEntry } from '../logs/LogEngine';
import { ChallengeEngine, ObjectiveCondition } from '../challenges/ChallengeEngine';
import { ReplayEngine } from '../replay/ReplayEngine';
import { ScenarioEngine, ScenarioDefinition } from '../scenario/ScenarioEngine';
import { SimulationNode, ConnectionLink, Challenge } from '../../types/simulation';

export interface RuntimeState {
  virtualTime: number;
  clockStatus: ClockStatus;
  speed: number;
  nodes: SimulationNode[];
  connections: ConnectionLink[];
  packets: EnginePacket[];
  events: SimulationEvent[];
  eventQueue?: ScheduledEvent[];
  logs: EngineLogEntry[];
  rules: Rule[];
  activeScenarioId: string | null;
  activeChallenge: Challenge | null;
}

export class SimulationRuntime {
  public clock: SimulationClock;
  public events: EventEngine;
  public packets: PacketEngine;
  public rules: RuleEngine;
  public logs: LogEngine;
  public challenges: ChallengeEngine;
  public replay: ReplayEngine<RuntimeState>;
  public scenarios: ScenarioEngine;

  private nodes: SimulationNode[] = [];
  private connections: ConnectionLink[] = [];
  private unsubscribeClock: (() => void) | null = null;
  private unsubscribeEvents: (() => void) | null = null;
  private stateChangeListeners: Set<(state: RuntimeState) => void> = new Set();

  constructor() {
    this.clock = new SimulationClock();
    this.events = new EventEngine();
    this.packets = new PacketEngine();
    this.rules = new RuleEngine();
    this.logs = new LogEngine();
    this.challenges = new ChallengeEngine();
    this.replay = new ReplayEngine();
    this.scenarios = new ScenarioEngine();

    this.initClockBinding();
    this.initEventBinding();
  }

  private initClockBinding() {
    this.unsubscribeClock = this.clock.subscribe((deltaTimeMs, virtualTime) => {
      this.tick(deltaTimeMs, virtualTime);
    });
  }

  private initEventBinding() {
    this.unsubscribeEvents = this.events.on('*', (evt) => {
      this.handleEventLog(evt);
      this.replay.recordSnapshot(evt.virtualTime, this.getState(), evt.id);
    });
  }

  private tick(deltaTimeMs: number, virtualTime: number) {
    // 1. Process scheduled events that have reached their virtualTime
    this.events.processUntil(virtualTime);

    // 2. Update packet progress and states
    this.packets.updateAtVirtualTime(virtualTime);

    // 3. Notify state change listeners
    this.notifyState();
  }

  private handleEventLog(evt: SimulationEvent) {
    if (evt.type === 'PACKET_BLOCKED' || evt.type === 'PACKET_DROPPED' || evt.type === 'FIREWALL_RULE_MATCHED') {
      this.logs.log({
        level: 'WARN',
        source: evt.source || 'FIREWALL',
        message: evt.description || `Packet evaluated on wire`,
        category: 'FIREWALL',
        relatedEventId: evt.id,
        virtualTime: evt.virtualTime,
      });
    } else if (evt.type === 'ALERT_CREATED' || evt.type === 'THREAT_DETECTED') {
      this.logs.log({
        level: 'ALERT',
        source: evt.source || 'SIEM',
        message: evt.description || 'Critical security alert triggered',
        category: 'SECURITY',
        relatedEventId: evt.id,
        virtualTime: evt.virtualTime,
      });
    }
  }

  public subscribe(listener: (state: RuntimeState) => void): () => void {
    this.stateChangeListeners.add(listener);
    return () => {
      this.stateChangeListeners.delete(listener);
    };
  }

  private notifyState() {
    const currentState = this.getState();
    this.stateChangeListeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (err) {
        console.error('SimulationRuntime state listener error:', err);
      }
    });
  }

  public start(): void {
    this.clock.start();
  }

  public pause(): void {
    this.clock.pause();
  }

  public resume(): void {
    this.clock.resume();
  }

  public reset(): void {
    this.clock.reset(0);
    this.packets.clear();
    this.events.clear();
    this.logs.clear();
    this.replay.clear();

    const activeScenario = this.scenarios.getActiveScenario();
    if (activeScenario) {
      this.loadScenario(activeScenario);
    } else {
      this.notifyState();
    }
  }

  public step(stepMs: number = 150): void {
    this.clock.stepForward(stepMs);
  }

  public setSpeed(speed: number): void {
    this.clock.setSpeed(speed);
    this.notifyState();
  }

  public setNodes(nodes: SimulationNode[]): void {
    this.nodes = [...nodes];
    this.notifyState();
  }

  public setConnections(connections: ConnectionLink[]): void {
    this.connections = [...connections];
    this.notifyState();
  }

  public dispatch(event: Omit<SimulationEvent, 'id' | 'virtualTime' | 'timestamp'> & { id?: string; timestamp?: number }): SimulationEvent {
    return this.events.dispatch({
      ...event,
      virtualTime: this.clock.getVirtualTime(),
    });
  }

  public schedule(event: ScheduledEvent): void {
    this.events.schedule(event);
  }

  public loadScenario(scenario: ScenarioDefinition, conditions?: ObjectiveCondition[]): void {
    this.clock.reset(0);
    this.scenarios.setActiveScenario(scenario.id);
    this.nodes = JSON.parse(JSON.stringify(scenario.nodes));
    this.connections = JSON.parse(JSON.stringify(scenario.connections));
    this.packets.clear();
    this.events.clear();
    this.logs.clear();
    this.replay.clear();

    if (scenario.initialRules) {
      this.rules.setRules(JSON.parse(JSON.stringify(scenario.initialRules)));
    }

    if (scenario.scheduledEvents) {
      this.events.scheduleBatch(JSON.parse(JSON.stringify(scenario.scheduledEvents)));
    }

    if (scenario.challenge) {
      this.challenges.setChallenge(scenario.challenge, conditions);
    }

    this.replay.recordSnapshot(0, this.getState());
    this.notifyState();
  }

  public replayTo(virtualTime: number): void {
    this.pause();
    const snapshot = this.replay.getSnapshotClosestTo(virtualTime);
    if (snapshot) {
      this.clock.seek(snapshot.virtualTime);
      this.nodes = JSON.parse(JSON.stringify(snapshot.state.nodes));
      this.connections = JSON.parse(JSON.stringify(snapshot.state.connections));
      this.packets.restoreState(snapshot.state.packets);
      this.events.restoreState(snapshot.state.events, snapshot.state.eventQueue || []);
      this.logs.restoreState(snapshot.state.logs);
      this.rules.restoreState(snapshot.state.rules);
      if (snapshot.state.activeScenarioId) {
        this.scenarios.setActiveScenario(snapshot.state.activeScenarioId);
      }
      if (snapshot.state.activeChallenge) {
        this.challenges.restoreState(snapshot.state.activeChallenge);
      }
      this.packets.updateAtVirtualTime(snapshot.virtualTime);
      this.notifyState();
    } else {
      this.clock.seek(virtualTime);
      this.packets.updateAtVirtualTime(virtualTime);
      this.notifyState();
    }
  }

  public getState(): RuntimeState {
    return {
      virtualTime: this.clock.getVirtualTime(),
      clockStatus: this.clock.getStatus(),
      speed: this.clock.getSpeed(),
      nodes: [...this.nodes],
      connections: [...this.connections],
      packets: this.packets.getAllPackets(),
      events: this.events.getHistory(),
      eventQueue: this.events.getQueue(),
      logs: this.logs.getLogs(),
      rules: this.rules.getRules(),
      activeScenarioId: this.scenarios.getActiveScenario()?.id ?? null,
      activeChallenge: this.challenges.getChallenge(),
    };
  }

  public destroy(): void {
    if (this.unsubscribeClock) {
      this.unsubscribeClock();
    }
    if (this.unsubscribeEvents) {
      this.unsubscribeEvents();
    }
    this.clock.destroy();
    this.stateChangeListeners.clear();
  }
}

// Global runtime singleton instance
export const globalSimulationRuntime = new SimulationRuntime();
