import { Hono } from 'hono';
import { signToken } from '../auth/jwt.js';
import { authMiddleware } from '../auth/middleware.js';
import type { AuthPayload } from '../types.js';

const auth = new Hono();

/**
 * POST /auth/login
 * Demo login — accepts email and returns JWT.
 */
auth.post('/login', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { email?: string };
  const email = body.email || 'demo@llm-ide.dev';

  const token = await signToken({
    userId: `usr_${email.split('@')[0]}`,
    email,
    tier: 'pro',
  });

  return c.json({
    token,
    user: { id: `usr_${email.split('@')[0]}`, email, tier: 'pro' },
  });
});

/**
 * GET /auth/me
 */
auth.get('/me', authMiddleware, async (c) => {
  const user = c.get('user' as never) as unknown as AuthPayload;
  return c.json({ user });
});

/**
 * POST /auth/refresh
 */
auth.post('/refresh', authMiddleware, async (c) => {
  const user = c.get('user' as never) as unknown as AuthPayload;
  const token = await signToken({
    userId: user.userId,
    email: user.email,
    tier: user.tier,
  });
  return c.json({ token });
});

export { auth as authRoutes };
