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
  }

  private initClockBinding() {
    this.unsubscribeClock = this.clock.subscribe((deltaTimeMs, virtualTime) => {
      this.tick(deltaTimeMs, virtualTime);
    });
  }

  private tick(deltaTimeMs: number, virtualTime: number) {
    // 1. Process scheduled events that have reached their virtualTime
    const newEvents = this.events.processUntil(virtualTime);

    // 2. Automatically generate logs for significant events
    newEvents.forEach((evt) => {
      if (evt.type === 'PACKET_BLOCKED' || evt.type === 'PACKET_DROPPED') {
        this.logs.log({
          level: 'WARN',
          source: evt.source || 'FIREWALL',
          message: evt.description || `Packet blocked on wire`,
          category: 'SECURITY',
          relatedEventId: evt.id,
          virtualTime,
        });
      } else if (evt.type === 'ALERT_CREATED') {
        this.logs.log({
          level: 'ALERT',
          source: evt.source || 'SIEM',
          message: evt.description || 'Critical security alert triggered',
          category: 'SECURITY',
          relatedEventId: evt.id,
          virtualTime,
        });
      }
    });

    // 3. Update packet progress and states
    this.packets.updateAtVirtualTime(virtualTime);

    // 4. Periodically capture replay snapshot at checkpoints or on events
    if (newEvents.length > 0) {
      this.replay.recordSnapshot(virtualTime, this.getState(), newEvents[0].id);
    }

    // 5. Notify state change listeners
    this.notifyState();
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
      this.nodes = snapshot.state.nodes;
      this.connections = snapshot.state.connections;
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
    this.clock.destroy();
    this.stateChangeListeners.clear();
  }
}

// Global runtime singleton instance
export const globalSimulationRuntime = new SimulationRuntime();
