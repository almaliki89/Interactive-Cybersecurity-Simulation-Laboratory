/**
 * OMEGA V16 — Deterministic Multi-World Correlation Engine & Entity Pivoting
 * Correlates real normalized telemetry across endpoints, identity, network, cloud, and supply-chain.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { SecurityTelemetryEvent, TelemetrySourceWorld } from '../../soc/logic/telemetry';
import { CorrelatedCluster, EntityReference } from './types';

export interface EntityGraphNode {
  id: string;
  label: string;
  type: 'USER' | 'HOST' | 'IP' | 'PROCESS' | 'RESOURCE' | 'ARTIFACT' | 'CONTAINER' | 'REPOSITORY';
  eventCount: number;
  threatLevel: 'info' | 'warn' | 'threat' | 'critical';
}

export interface EntityGraphEdge {
  id: string;
  source: string;
  target: string;
  relationship:
    | 'AUTHENTICATED_TO'
    | 'SPAWNED_ON'
    | 'CONNECTED_TO'
    | 'ACCESSED'
    | 'COMMITTED_TO'
    | 'DEPLOYED_TO'
    | 'ASSUMED_ROLE';
  eventIds: string[];
}

export interface CorrelatedEntitySummary {
  entity: EntityReference;
  totalEvents: number;
  events: SecurityTelemetryEvent[];
  associatedEntities: EntityReference[];
  sourceWorlds: TelemetrySourceWorld[];
  virtualTimeRange: { start: number; end: number };
  highestSeverity: 'info' | 'warn' | 'threat' | 'critical';
}

export class ThreatCorrelationEngine {
  /**
   * Clusters events into behavioral attack storylines based on shared entities and time proximity
   */
  public static correlateEvents(
    events: SecurityTelemetryEvent[],
    windowVirtualSeconds: number = 600
  ): CorrelatedCluster[] {
    if (!events || events.length === 0) return [];

    // Sort deterministically by virtualTime then id
    const sorted = [...events].sort((a, b) => a.virtualTime - b.virtualTime || a.id.localeCompare(b.id));

    const clusters: CorrelatedCluster[] = [];
    const visitedEventIds = new Set<string>();

    for (let i = 0; i < sorted.length; i++) {
      const rootEvent = sorted[i];
      if (visitedEventIds.has(rootEvent.id)) continue;

      const clusterEvents: SecurityTelemetryEvent[] = [rootEvent];
      visitedEventIds.add(rootEvent.id);

      const commonEntities = {
        user: rootEvent.user,
        host: rootEvent.host,
        sourceIp: rootEvent.sourceIp,
        process: rootEvent.process,
        resource: rootEvent.resource,
        repository: rootEvent.attributes?.repository ? String(rootEvent.attributes.repository) : undefined,
        artifact: rootEvent.attributes?.artifact ? String(rootEvent.attributes.artifact) : undefined,
      };

      const sourceWorlds = new Set<TelemetrySourceWorld>([rootEvent.sourceWorld]);

      for (let j = i + 1; j < sorted.length; j++) {
        const candidate = sorted[j];
        if (visitedEventIds.has(candidate.id)) continue;

        // Check virtual time window
        const timeDiff = Math.abs(candidate.virtualTime - rootEvent.virtualTime);
        if (timeDiff > windowVirtualSeconds) continue;

        // Correlation criteria: shared user, host, IP, resource, repo, or process relationship
        const sharesUser = commonEntities.user && candidate.user && commonEntities.user === candidate.user;
        const sharesHost = commonEntities.host && candidate.host && commonEntities.host === candidate.host;
        const sharesIp = commonEntities.sourceIp && candidate.sourceIp && commonEntities.sourceIp === candidate.sourceIp;
        const sharesResource = commonEntities.resource && candidate.resource && commonEntities.resource === candidate.resource;
        const sharesRepo =
          commonEntities.repository &&
          candidate.attributes?.repository &&
          commonEntities.repository === candidate.attributes.repository;

        if (sharesUser || sharesHost || sharesIp || sharesResource || sharesRepo) {
          clusterEvents.push(candidate);
          visitedEventIds.add(candidate.id);
          sourceWorlds.add(candidate.sourceWorld);

          // Merge entities
          if (!commonEntities.user && candidate.user) commonEntities.user = candidate.user;
          if (!commonEntities.host && candidate.host) commonEntities.host = candidate.host;
          if (!commonEntities.sourceIp && candidate.sourceIp) commonEntities.sourceIp = candidate.sourceIp;
          if (!commonEntities.process && candidate.process) commonEntities.process = candidate.process;
          if (!commonEntities.resource && candidate.resource) commonEntities.resource = candidate.resource;
        }
      }

      if (clusterEvents.length >= 2) {
        const startTime = clusterEvents[0].virtualTime;
        const endTime = clusterEvents[clusterEvents.length - 1].virtualTime;

        // Calculate correlation strength
        let strength: 'STRONG' | 'MEDIUM' | 'EMERGING' = 'EMERGING';
        if (clusterEvents.length >= 4 || sourceWorlds.size >= 2) {
          strength = 'STRONG';
        } else if (clusterEvents.length >= 2) {
          strength = 'MEDIUM';
        }

        const clusterId = `CORR-${rootEvent.sourceWorld}-${rootEvent.id}`;
        clusters.push({
          id: clusterId,
          titleEn: `Correlated Activity: ${commonEntities.user || commonEntities.host || 'Multi-Entity'} (${sourceWorlds.size} Sources)`,
          titleAr: `نشاط مترابط: ${commonEntities.user || commonEntities.host || 'متعدد الكيانات'} (${sourceWorlds.size} مصادر)`,
          rootEventId: rootEvent.id,
          eventIds: clusterEvents.map((e) => e.id),
          rawEventIds: clusterEvents.map((e) => e.rawEventId || e.id),
          commonEntities,
          timeSpanVirtual: { start: startTime, end: endTime },
          strength,
          narrativeEn: `Sequential behavior spanning ${clusterEvents.length} events from ${Array.from(sourceWorlds).join(', ')} between T+${startTime}s and T+${endTime}s.`,
          narrativeAr: `سلوك تسلسلي يمتد عبر ${clusterEvents.length} حدثاً من ${Array.from(sourceWorlds).join(', ')} بين T+${startTime}ث و T+${endTime}ث.`,
          sourceWorlds: Array.from(sourceWorlds),
          events: clusterEvents,
        });
      }
    }

    return clusters;
  }

  /**
   * Entity Pivot: Retrieves all telemetry events and connected entities linked to a specific entity
   */
  public static pivotEntity(
    entity: EntityReference,
    events: SecurityTelemetryEvent[]
  ): CorrelatedEntitySummary {
    const val = entity.value.toLowerCase();
    const matchingEvents = events.filter((e) => {
      switch (entity.type) {
        case 'USER':
          return e.user?.toLowerCase() === val || String(e.attributes?.username || '').toLowerCase() === val;
        case 'HOST':
          return e.host?.toLowerCase() === val || String(e.attributes?.workstation || '').toLowerCase() === val;
        case 'IP':
          return (
            e.sourceIp?.toLowerCase() === val ||
            e.destinationIp?.toLowerCase() === val ||
            String(e.attributes?.sourceIp || '').toLowerCase() === val
          );
        case 'PROCESS':
          return e.process?.toLowerCase() === val || e.parentProcess?.toLowerCase() === val;
        case 'RESOURCE':
          return e.resource?.toLowerCase() === val || String(e.attributes?.endpoint || '').toLowerCase() === val;
        case 'ARTIFACT':
          return String(e.attributes?.artifact || '').toLowerCase() === val || String(e.attributes?.hash || '').toLowerCase() === val;
        case 'REPOSITORY':
          return String(e.attributes?.repository || '').toLowerCase() === val;
        case 'CONTAINER':
          return String(e.attributes?.container || e.attributes?.pod || '').toLowerCase() === val;
        default:
          return false;
      }
    });

    const associatedEntitiesMap = new Map<string, EntityReference>();
    const sourceWorlds = new Set<TelemetrySourceWorld>();

    let highestSeverity: 'info' | 'warn' | 'threat' | 'critical' = 'info';
    let minTime = Infinity;
    let maxTime = 0;

    matchingEvents.forEach((e) => {
      sourceWorlds.add(e.sourceWorld);
      if (e.virtualTime < minTime) minTime = e.virtualTime;
      if (e.virtualTime > maxTime) maxTime = e.virtualTime;

      // Severity precedence
      if (e.severity === 'critical') highestSeverity = 'critical';
      else if (e.severity === 'threat' && highestSeverity !== 'critical') highestSeverity = 'threat';
      else if (e.severity === 'warn' && highestSeverity === 'info') highestSeverity = 'warn';

      if (e.user && entity.type !== 'USER') {
        associatedEntitiesMap.set(`USER:${e.user}`, { type: 'USER', value: e.user });
      }
      if (e.host && entity.type !== 'HOST') {
        associatedEntitiesMap.set(`HOST:${e.host}`, { type: 'HOST', value: e.host });
      }
      if (e.sourceIp && entity.type !== 'IP') {
        associatedEntitiesMap.set(`IP:${e.sourceIp}`, { type: 'IP', value: e.sourceIp });
      }
      if (e.process && entity.type !== 'PROCESS') {
        associatedEntitiesMap.set(`PROCESS:${e.process}`, { type: 'PROCESS', value: e.process });
      }
      if (e.resource && entity.type !== 'RESOURCE') {
        associatedEntitiesMap.set(`RESOURCE:${e.resource}`, { type: 'RESOURCE', value: e.resource });
      }
      if (e.attributes?.repository && entity.type !== 'REPOSITORY') {
        associatedEntitiesMap.set(`REPOSITORY:${e.attributes.repository}`, {
          type: 'REPOSITORY',
          value: String(e.attributes.repository),
        });
      }
    });

    return {
      entity,
      totalEvents: matchingEvents.length,
      events: matchingEvents,
      associatedEntities: Array.from(associatedEntitiesMap.values()),
      sourceWorlds: Array.from(sourceWorlds),
      virtualTimeRange: {
        start: minTime === Infinity ? 0 : minTime,
        end: maxTime,
      },
      highestSeverity,
    };
  }

  /**
   * Generates graph nodes and edges for visual entity relationship rendering
   */
  public static buildEntityGraph(events: SecurityTelemetryEvent[]): {
    nodes: EntityGraphNode[];
    edges: EntityGraphEdge[];
  } {
    const nodeMap = new Map<string, EntityGraphNode>();
    const edgeMap = new Map<string, EntityGraphEdge>();

    const getOrAddNode = (
      id: string,
      label: string,
      type: EntityGraphNode['type'],
      severity: EntityGraphNode['threatLevel']
    ) => {
      if (!nodeMap.has(id)) {
        nodeMap.set(id, {
          id,
          label,
          type,
          eventCount: 0,
          threatLevel: severity,
        });
      }
      const node = nodeMap.get(id)!;
      node.eventCount++;
      if (severity === 'critical') node.threatLevel = 'critical';
      else if (severity === 'threat' && node.threatLevel !== 'critical') node.threatLevel = 'threat';
      else if (severity === 'warn' && node.threatLevel === 'info') node.threatLevel = 'warn';
      return node;
    };

    events.forEach((e) => {
      const sev = e.severity;

      if (e.user && e.host) {
        getOrAddNode(`user-${e.user}`, e.user, 'USER', sev);
        getOrAddNode(`host-${e.host}`, e.host, 'HOST', sev);

        const edgeKey = `user-${e.user}->host-${e.host}`;
        if (!edgeMap.has(edgeKey)) {
          edgeMap.set(edgeKey, {
            id: edgeKey,
            source: `user-${e.user}`,
            target: `host-${e.host}`,
            relationship: 'AUTHENTICATED_TO',
            eventIds: [],
          });
        }
        edgeMap.get(edgeKey)!.eventIds.push(e.id);
      }

      if (e.host && e.process) {
        getOrAddNode(`host-${e.host}`, e.host, 'HOST', sev);
        getOrAddNode(`proc-${e.process}`, e.process, 'PROCESS', sev);

        const edgeKey = `host-${e.host}->proc-${e.process}`;
        if (!edgeMap.has(edgeKey)) {
          edgeMap.set(edgeKey, {
            id: edgeKey,
            source: `host-${e.host}`,
            target: `proc-${e.process}`,
            relationship: 'SPAWNED_ON',
            eventIds: [],
          });
        }
        edgeMap.get(edgeKey)!.eventIds.push(e.id);
      }

      if (e.sourceIp && e.host) {
        getOrAddNode(`ip-${e.sourceIp}`, e.sourceIp, 'IP', sev);
        getOrAddNode(`host-${e.host}`, e.host, 'HOST', sev);

        const edgeKey = `ip-${e.sourceIp}->host-${e.host}`;
        if (!edgeMap.has(edgeKey)) {
          edgeMap.set(edgeKey, {
            id: edgeKey,
            source: `ip-${e.sourceIp}`,
            target: `host-${e.host}`,
            relationship: 'CONNECTED_TO',
            eventIds: [],
          });
        }
        edgeMap.get(edgeKey)!.eventIds.push(e.id);
      }

      if (e.user && e.resource) {
        getOrAddNode(`user-${e.user}`, e.user, 'USER', sev);
        getOrAddNode(`res-${e.resource}`, e.resource, 'RESOURCE', sev);

        const edgeKey = `user-${e.user}->res-${e.resource}`;
        if (!edgeMap.has(edgeKey)) {
          edgeMap.set(edgeKey, {
            id: edgeKey,
            source: `user-${e.user}`,
            target: `res-${e.resource}`,
            relationship: 'ACCESSED',
            eventIds: [],
          });
        }
        edgeMap.get(edgeKey)!.eventIds.push(e.id);
      }
    });

    return {
      nodes: Array.from(nodeMap.values()),
      edges: Array.from(edgeMap.values()),
    };
  }
}
