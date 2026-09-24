# OMEGA V5 — Cybersecurity Simulation Engine Architecture

## Overview

The OMEGA V5 engine provides a unified, deterministic, and event-driven foundation for all interactive cybersecurity simulations across the 10 macro domains and 60 cyber worlds.

Instead of individual React components implementing their own timers and state machines, all simulations share a standardized runtime.

---

## Core Components (`src/engine/`)

### 1. Simulation Runtime (`src/engine/runtime/SimulationRuntime.ts`)
The orchestrator that coordinates clock ticks, event queues, packet motion, rule evaluations, log streams, and challenge evaluations.

```ts
import { globalSimulationRuntime } from '../engine';

// Start / Pause / Step / Speed
globalSimulationRuntime.start();
globalSimulationRuntime.pause();
globalSimulationRuntime.step(150); // step forward by 150ms
globalSimulationRuntime.setSpeed(2.0); // 0.25x - 4.0x
```

### 2. Virtual Simulation Clock (`src/engine/clock/SimulationClock.ts`)
A single authoritative clock driven by `requestAnimationFrame` with virtual time delta scaling.
- States: `idle`, `running`, `paused`, `completed`
- Speeds: `0.25x`, `0.5x`, `1.0x`, `2.0x`, `4.0x`
- Supports deterministic seeking and step execution.

### 3. Event Engine (`src/engine/events/EventEngine.ts`)
A deterministic event queue that processes scheduled events at exact virtual time timestamps.
- Features causal event lineage (`causedByEventId`) for the **Trace Event** debugger.
- Emits structured events: `PACKET_SENT`, `FIREWALL_RULE_MATCHED`, `TCP_SYN`, `TLS_ESTABLISHED`, `LOGIN_FAILED`, `ALERT_CREATED`.

### 4. Packet Engine (`src/engine/packets/PacketEngine.ts`)
Manages multi-hop network packet routes (`Client -> Router -> Firewall -> Server`).
- Visual progress is derived from virtual time:
  $$\text{Progress} = \frac{\text{VirtualTime} - \text{StartTime}}{\text{EndTime} - \text{StartTime}}$$
- Automatically accelerates when speed is changed.
- Freezes instantly when simulation is paused.

### 5. Rule Engine (`src/engine/rules/RuleEngine.ts`)
Provides generic ordered rule evaluation for:
- Network Firewalls (First-Match: ALLOW / DENY / DROP)
- Identity & Access Management (RBAC / Kerberos tickets)
- Zero Trust Policy Engines (Continuous Verification)
- Web Application Firewalls (WAF injection filters)

### 6. Log Engine (`src/engine/logs/LogEngine.ts`)
Generates structured log records causally tied to events and packets (`relatedEventId`, `relatedPacketId`).
- Ensures logs have demonstrable origins rather than random text.

### 7. Replay Engine (`src/engine/replay/ReplayEngine.ts`)
Captures deterministic state snapshots at key checkpoints, allowing fast-forward seeking and timeline scrub.

### 8. Challenge Engine (`src/engine/challenges/ChallengeEngine.ts`)
Evaluates operational mission objectives against live runtime state (e.g. `isPortAllowed(443) === true`).

---

## Authoring a New Simulation in 3 Steps

### Step 1: Define the Scenario
```ts
import { ScenarioDefinition } from '../../engine';

export const tcpScenario: ScenarioDefinition = {
  id: 'tcp-handshake',
  titleAr: 'المصافحة الثلاثية TCP',
  titleEn: 'TCP 3-Way Handshake',
  nodes: [
    { id: 'client', name: 'Client', type: 'client', ip: '192.168.1.100', position: { x: 20, y: 50 }, status: 'online' },
    { id: 'server', name: 'Web Server', type: 'server', ip: '93.184.216.34', position: { x: 80, y: 50 }, status: 'online' }
  ],
  connections: [
    { id: 'c1', source: 'client', target: 'server', latencyMs: 250, status: 'active' }
  ],
  scheduledEvents: [
    { at: 0, type: 'TCP_SYN', source: 'client', target: 'server' },
    { at: 500, type: 'TCP_SYN_ACK', source: 'server', target: 'client' },
    { at: 1000, type: 'TCP_ACK', source: 'client', target: 'server' }
  ]
};
```

### Step 2: Register in `src/simulations/registry.ts`
```ts
export const simulationRegistry = {
  // ...
  my_new_sim: {
    id: 'my_new_sim',
    nameAr: 'اسم المختبر',
    nameEn: 'Lab Name',
    domain: 'infrastructure',
    component: MyNewSimulation,
    category: 'lab'
  }
};
```

### Step 3: Render via `<Workspace>` and `<StageCanvas>`
The component focuses exclusively on UI controls and visual presentation while the engine handles execution.

---

## Global Hotkeys
- `Space`: Pause / Resume virtual clock
- `R`: Reset virtual time & scenario
- `Cmd/Ctrl + K` or `/`: Open universal command palette & search
