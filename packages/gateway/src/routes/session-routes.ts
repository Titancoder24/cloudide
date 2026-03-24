import { Hono } from 'hono';
import { authMiddleware } from '../auth/middleware.js';
import { SessionStore } from '../sessions/session-store.js';
import type { AuthPayload } from '../types.js';

const sessions = new Hono();
const sessionStore = new SessionStore();

export async function initSessionStore(redisUrl?: string): Promise<void> {
  await sessionStore.init(redisUrl);
}

/**
 * POST /sessions — create a new workspace session.
 */
sessions.post('/', authMiddleware, async (c) => {
  const user = c.get('user' as never) as unknown as AuthPayload;
  const body = (await c.req.json().catch(() => ({}))) as { workspaceId?: string };
  const workspaceId =
    body.workspaceId || `ws_${Math.random().toString(36).slice(2, 10)}`;

  const session = await sessionStore.create(user.userId, workspaceId);
  return c.json(session, 201);
});

/**
 * GET /sessions/:id
 */
sessions.get('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id') as string;
  const session = await sessionStore.get(id);
  if (!session) return c.json({ error: 'Session not found' }, 404);
  return c.json(session);
});

/**
 * DELETE /sessions/:id
 */
sessions.delete('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id') as string;
  const session = await sessionStore.get(id);
  if (!session) return c.json({ error: 'Session not found' }, 404);
  await sessionStore.update(id, { status: 'terminated' });
  return c.json({ message: 'Session terminated' });
});

/**
 * GET /sessions — list user's sessions.
 */
sessions.get('/', authMiddleware, async (c) => {
  const user = c.get('user' as never) as unknown as AuthPayload;
  const userSessions = await sessionStore.listByUser(user.userId);
  return c.json(userSessions);
});

export { sessions as sessionRoutes };
