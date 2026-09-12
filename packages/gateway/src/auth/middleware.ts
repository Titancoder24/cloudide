import type { Context, Next } from 'hono';
import { verifyToken } from './jwt.js';

/**
 * Auth middleware — validates Bearer token and attaches user payload to context.
 * Returns 401 if token is missing or invalid.
 */
export async function authMiddleware(c: Context, next: Next): Promise<Response | void> {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token);
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
}

/**
 * Optional auth — doesn't fail if no token, but attaches payload if present.
 */
export async function optionalAuth(c: Context, next: Next): Promise<void> {
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = await verifyToken(authHeader.slice(7));
      c.set('user', payload);
    } catch {
      // Ignore invalid tokens for optional auth
    }
  }
  await next();
}
