import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { initJwt } from './auth/jwt.js';
import { authRoutes } from './routes/auth-routes.js';
import { sessionRoutes, initSessionStore } from './routes/session-routes.js';
import { RateLimiter } from './rate-limiter.js';
import { AuditLog } from './audit-log.js';
import type { GatewayConfig } from './types.js';

export async function createApp(config: GatewayConfig): Promise<Hono> {
  // Initialize auth
  initJwt(config.jwtSecret);

  // Initialize session store
  await initSessionStore(config.redisUrl);

  // Initialize rate limiter and audit log
  const rateLimiter = new RateLimiter(120, 2); // 120 burst, 2/sec refill
  const auditLog = new AuditLog();

  const app = new Hono();

  // Global middleware
  app.use(
    '*',
    cors({
      origin: config.corsOrigins,
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use('*', logger());

  // Rate limiting middleware
  app.use('/api/*', async (c, next) => {
    const token =
      c.req.header('Authorization')?.replace('Bearer ', '') || c.req.header('x-forwarded-for') || 'anonymous';

    if (!rateLimiter.check(token)) {
      return c.json(
        {
          error: 'Rate limit exceeded',
          remaining: rateLimiter.remaining(token),
          retryAfter: 1,
        },
        429
      );
    }

    await next();
  });

  // Health check
  app.get('/health', (c) =>
    c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    })
  );

  // API routes
  app.route('/api/auth', authRoutes);
  app.route('/api/sessions', sessionRoutes);

  // Audit log endpoint (admin only)
  app.get('/api/audit', (c) => {
    const limit = parseInt(c.req.query('limit') || '100', 10);
    return c.json(auditLog.getRecent(limit));
  });

  // 404 handler
  app.notFound((c) =>
    c.json({ error: 'Not found', path: c.req.path }, 404)
  );

  // Error handler
  app.onError((err, c) => {
    console.error('Gateway error:', err);
    return c.json(
      { error: 'Internal server error', message: err.message },
      500
    );
  });

  // Periodic cleanup
  setInterval(() => rateLimiter.cleanup(), 60_000);

  return app;
}
