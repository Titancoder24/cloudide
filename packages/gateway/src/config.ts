import type { GatewayConfig } from './types.js';

export function loadConfig(): GatewayConfig {
  return {
    port: parseInt(process.env.GATEWAY_PORT || '3001', 10),
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    redisUrl: process.env.REDIS_URL,
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(
      ','
    ),
  };
}
