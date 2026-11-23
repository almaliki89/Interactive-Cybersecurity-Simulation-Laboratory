import { describe, expect, it } from 'vitest';
import {
  advanceDigitalTwinMinute,
  blockDigitalTwinEgress,
  createInitialDigitalTwinWorld,
  inspectDigitalTwinNode,
  isolateDigitalTwinEndpoint,
  resolveDigitalTwinIncident,
} from './DigitalTwinEngine';

describe('ZORG digital twin incident engine', () => {
  it('starts with a coherent synthetic enterprise and an open SOC alert', () => {
    const world = createInitialDigitalTwinWorld();
    const workstation = world.nodes.find((node) => node.id === 'hr-ws-04');
    const suspiciousPath = world.connections.find((link) => link.id === 'hr-external');

    expect(world.scenarioId).toBe('nexora-incident-01');
    expect(workstation?.status).toBe('watch');
    expect(suspiciousPath?.status).toBe('active');
    expect(world.alerts[0].status).toBe('open');
    expect(world.nodes.find((node) => node.id === 'db-server')?.status).toBe('healthy');
  });

  it('requires inspection, then synchronizes isolation, firewall, SOC, and event state', () => {
    let world = createInitialDigitalTwinWorld();

    world = isolateDigitalTwinEndpoint(world);
    expect(world.progress.endpointIsolated).toBe(false);
    expect(world.events[0].type).toBe('ACTION_REQUIRES_INSPECTION');

    world = inspectDigitalTwinNode(world, 'hr-ws-04');
    expect(world.progress.alertInspected).toBe(true);
    expect(world.alerts[0].status).toBe('investigating');

    world = isolateDigitalTwinEndpoint(world);
    expect(world.nodes.find((node) => node.id === 'hr-ws-04')?.status).toBe('isolated');
    expect(world.connections.find((link) => link.id === 'hr-external')?.status).toBe('isolated');

    world = blockDigitalTwinEgress(world);
    expect(world.progress.egressBlocked).toBe(true);
    expect(world.firewallRules.some((rule) => rule.id === 'FW-019' && rule.enabled)).toBe(true);
    expect(world.connections.find((link) => link.id === 'hr-external')?.status).toBe('blocked');
    expect(world.incidentStatus).toBe('contained');
    expect(world.alerts[0].status).toBe('contained');

    world = resolveDigitalTwinIncident(world);
    expect(world.incidentStatus).toBe('resolved');
    expect(world.alerts[0].status).toBe('resolved');
    expect(world.score).toBe(100);
    expect(world.nodes.find((node) => node.id === 'app-server')?.status).toBe('healthy');
    expect(world.nodes.find((node) => node.id === 'db-server')?.status).toBe('healthy');
  });

  it('advances the virtual clock and records repeated synthetic activity', () => {
    const initial = createInitialDigitalTwinWorld();
    const next = advanceDigitalTwinMinute(initial);

    expect(next.virtualMinutes).toBe(initial.virtualMinutes + 1);
    expect(next.generatedFlowCount).toBe(initial.generatedFlowCount + 1);
    expect(next.events[0].type).toBe('SIMULATED_FLOW_REPEATED');
    expect(next.events[0].level).toBe('warning');
  });

  it('reconciles containment when the precise block is applied before isolation', () => {
    let world = inspectDigitalTwinNode(createInitialDigitalTwinWorld(), 'hr-ws-04');
    world = blockDigitalTwinEgress(world);
    expect(world.incidentStatus).toBe('investigating');

    world = isolateDigitalTwinEndpoint(world);
    expect(world.incidentStatus).toBe('contained');
    expect(world.alerts[0].status).toBe('contained');
    expect(world.events.some((event) => event.type === 'INCIDENT_CONTAINED')).toBe(true);
  });

  it('does not allow incident closure before containment requirements are met', () => {
    const initial = createInitialDigitalTwinWorld();
    const attempted = resolveDigitalTwinIncident(initial);

    expect(attempted.incidentStatus).toBe('investigating');
    expect(attempted.score).toBe(0);
    expect(attempted.events[0].type).toBe('RESOLUTION_REJECTED');
  });
});
