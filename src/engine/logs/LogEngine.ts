import { LogEntry } from '../../types/simulation';

export interface EngineLogEntry extends LogEntry {
  relatedEventId?: string;
  relatedPacketId?: string;
  relatedRuleId?: string;
  relatedEntityIds?: string[];
}

export class LogEngine {
  private logs: EngineLogEntry[] = [];
  private logIdCounter = 1;
  private maxLogs = 500;

  public log(entry: {
    level: 'INFO' | 'WARN' | 'ERROR' | 'ALERT' | 'DEBUG';
    source: string;
    message: string;
    category?: 'NETWORK' | 'AUTH' | 'FIREWALL' | 'SYSTEM' | 'SECURITY';
    virtualTime?: number;
    relatedEventId?: string;
    relatedPacketId?: string;
    relatedRuleId?: string;
    relatedEntityIds?: string[];
    timestamp?: number;
  }): EngineLogEntry {
    const fullLog: EngineLogEntry = {
      id: `log-${this.logIdCounter++}-${Date.now()}`,
      timestamp: entry.timestamp ?? Date.now(),
      level: entry.level,
      source: entry.source,
      message: entry.message,
      category: entry.category ?? 'SYSTEM',
      relatedEventId: entry.relatedEventId,
      relatedPacketId: entry.relatedPacketId,
      relatedRuleId: entry.relatedRuleId,
      relatedEntityIds: entry.relatedEntityIds,
    };

    this.logs.unshift(fullLog);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    return fullLog;
  }

  public getLogs(): EngineLogEntry[] {
    return [...this.logs];
  }

  public getLogsForEntity(entityId: string): EngineLogEntry[] {
    return this.logs.filter(
      (l) =>
        l.source === entityId ||
        l.relatedPacketId === entityId ||
        l.relatedEventId === entityId ||
        (l.relatedEntityIds && l.relatedEntityIds.includes(entityId))
    );
  }

  public clear(): void {
    this.logs = [];
  }
}
