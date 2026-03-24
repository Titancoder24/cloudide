export interface GatewayConfig {
  port: number;
  jwtSecret: string;
  redisUrl?: string;
  corsOrigins: string[];
}

export interface AuthPayload {
  userId: string;
  email: string;
  tier: 'free' | 'starter' | 'pro' | 'team' | 'enterprise';
  iat: number;
  exp: number;
}

export interface Session {
  id: string;
  userId: string;
  workspaceId: string;
  createdAt: string;
  lastActiveAt: string;
  status: 'active' | 'suspended' | 'terminated';
}

export interface ApiToken {
  tokenId: string;
  userId: string;
  workspaceId: string;
  tier: string;
  permissions: TokenPermissions;
  rateLimits: RateLimits;
  usageQuota: UsageQuota;
  createdAt: string;
  expiresAt: string;
  revoked: boolean;
}

export interface TokenPermissions {
  fileRead: boolean;
  fileWrite: boolean;
  terminalExec: boolean;
  npmInstall: boolean;
  scaffold: boolean;
  gitPush: boolean;
}

export interface RateLimits {
  requestsPerMinute: number;
  requestsPerHour: number;
  maxFileSizeBytes: number;
  maxCommandTimeoutSeconds: number;
  maxConcurrentProcesses: number;
}

export interface UsageQuota {
  toolCallsPerMonth: number;
  storageBytes: number;
  computeMinutesPerMonth: number;
}

export interface MeteringEvent {
  eventId: string;
  timestamp: string;
  tokenId: string;
  userId: string;
  workspaceId: string;
  tool: string;
  durationMs: number;
  resultSizeBytes: number;
  status: 'success' | 'error';
  costUnits: number;
}
