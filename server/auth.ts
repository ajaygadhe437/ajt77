import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { sendError } from './response';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    return 'ajt77_production_fallback_jwt_secret_key_88219';
  }
  return secret;
}

export interface AdminTokenPayload {
  userId: string;
  email: string;
  role: 'SUPER_ADMIN' | 'EDITOR' | 'MODERATOR';
  exp: number;
}

export function createAdminToken(payload: Omit<AdminTokenPayload, 'exp'>, expiresInHours = 24): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const secret = getJwtSecret();
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;

    const secret = getJwtSecret();
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (expectedSignature !== signature) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as AdminTokenPayload;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  admin?: AdminTokenPayload;
  rawBody?: Buffer;
}

export function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  }

  if (!token) {
    return sendError(res, 'UNAUTHORIZED', 'Authentication token required for this admin endpoint', 401);
  }

  const payload = verifyAdminToken(token);
  if (!payload) {
    return sendError(res, 'SESSION_EXPIRED', 'Session expired or invalid token', 401);
  }

  req.admin = payload;
  next();
}
