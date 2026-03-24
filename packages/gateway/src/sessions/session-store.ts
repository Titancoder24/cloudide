import type { Session } from '../types.js';

interface RedisLike {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ...args: unknown[]): Promise<unknown>;
  del(key: string): Promise<unknown>;
}

/**
 * Session store — manages workspace sessions.
 * Falls back to in-memory Map when Redis is unavailable.
 */
export class SessionStore {
  private sessions: Map<string, Session> = new Map();
  private redis: RedisLike | null = null;

  async init(redisUrl?: string): Promise<void> {
    if (redisUrl) {
      try {
        const ioredis = await import('ioredis');
        const RedisConstructor = ioredis.default as unknown as new (url: string) => RedisLike;
        this.redis = new RedisConstructor(redisUrl);
        console.error('Session store: using Redis');
      } catch {
        console.error('Session store: Redis unavailable, using in-memory');
      }
    } else {
      console.error('Session store: using in-memory (no REDIS_URL)');
    }
  }

  async create(userId: string, workspaceId: string): Promise<Session> {
    const session: Session = {
      id: `sess_${randomId()}`,
      userId,
      workspaceId,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      status: 'active',
    };

    if (this.redis) {
      await this.redis.set(
        `session:${session.id}`,
        JSON.stringify(session),
        'EX',
        86400
      );
    } else {
      this.sessions.set(session.id, session);
    }

    return session;
  }

  async get(sessionId: string): Promise<Session | null> {
    if (this.redis) {
      const data = await this.redis.get(`session:${sessionId}`);
      return data ? (JSON.parse(data) as Session) : null;
    }
    return this.sessions.get(sessionId) || null;
  }

  async update(
    sessionId: string,
    updates: Partial<Session>
  ): Promise<Session | null> {
    const session = await this.get(sessionId);
    if (!session) return null;

    const updated = {
      ...session,
      ...updates,
      lastActiveAt: new Date().toISOString(),
    };

    if (this.redis) {
      await this.redis.set(
        `session:${sessionId}`,
        JSON.stringify(updated),
        'EX',
        86400
      );
    } else {
      this.sessions.set(sessionId, updated);
    }

    return updated;
  }

  async delete(sessionId: string): Promise<boolean> {
    if (this.redis) {
      await this.redis.del(`session:${sessionId}`);
      return true;
    }
    return this.sessions.delete(sessionId);
  }

  async listByUser(userId: string): Promise<Session[]> {
    if (this.redis) {
      return [];
    }
    return Array.from(this.sessions.values()).filter(
      (s) => s.userId === userId
    );
  }
}

function randomId(): string {
  return (
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  );
}
