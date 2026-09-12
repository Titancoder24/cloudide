import * as jose from 'jose';
import type { AuthPayload } from '../types.js';

let secretKey: Uint8Array;

export function initJwt(secret: string): void {
  secretKey = new TextEncoder().encode(secret);
}

export async function signToken(
  payload: Omit<AuthPayload, 'iat' | 'exp'>
): Promise<string> {
  return new jose.SignJWT(payload as unknown as jose.JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<AuthPayload> {
  const { payload } = await jose.jwtVerify(token, secretKey);
  return payload as unknown as AuthPayload;
}
