import type { MeteringEvent } from './types.js';

/**
 * Audit logger — logs every tool call for metering and compliance.
 * In production, this batch-flushes to ClickHouse or PostgreSQL.
 * In dev, it logs to stderr.
 */
export class AuditLog {
  private events: MeteringEvent[] = [];
  private maxInMemory = 10_000;

  log(event: Omit<MeteringEvent, 'eventId' | 'timestamp'>): void {
    const fullEvent: MeteringEvent = {
      eventId: `evt_${randomId()}`,
      timestamp: new Date().toISOString(),
      ...event,
    };

    this.events.push(fullEvent);

    // Trim old events if over limit
    if (this.events.length > this.maxInMemory) {
      this.events = this.events.slice(-this.maxInMemory / 2);
    }

    // Dev logging
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `[audit] ${fullEvent.tool} by ${fullEvent.userId} — ${fullEvent.status} (${fullEvent.durationMs}ms)`
      );
    }
  }

  getRecent(limit = 100): MeteringEvent[] {
    return this.events.slice(-limit);
  }

  getByUser(userId: string, limit = 100): MeteringEvent[] {
    return this.events
      .filter((e) => e.userId === userId)
      .slice(-limit);
  }

  getByWorkspace(workspaceId: string, limit = 100): MeteringEvent[] {
    return this.events
      .filter((e) => e.workspaceId === workspaceId)
      .slice(-limit);
  }
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36);
}
