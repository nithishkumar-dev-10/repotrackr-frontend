import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { EmailTokenType } from './db.js';

export const PASSWORD_MIN_LENGTH = 8;

export function validatePasswordStrength(password: string): void {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    throw new Error(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
  }
  if (!/[a-zA-Z]/.test(password)) {
    throw new Error('Password must contain at least one letter');
  }
  if (!/[0-9]/.test(password)) {
    throw new Error('Password must contain at least one digit');
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createAccessToken(userId: number): string {
  return jwt.sign(
    {
      sub: String(userId),
      type: 'access',
    },
    config.SECRET_KEY,
    {
      expiresIn: `${config.ACCESS_TOKEN_EXPIRE_MINUTES}m`,
    }
  );
}

export function createRefreshToken(userId: number): string {
  return jwt.sign(
    {
      sub: String(userId),
      type: 'refresh',
    },
    config.SECRET_KEY,
    {
      expiresIn: `${config.REFRESH_TOKEN_EXPIRE_DAYS}d`,
    }
  );
}

export function decodeToken(token: string, expectedType: 'access' | 'refresh'): { sub: string; type: string } {
  try {
    const payload = jwt.verify(token, config.SECRET_KEY) as { sub: string; type: string };
    if (payload.type !== expectedType) {
      throw new Error(`Expected a ${expectedType} token`);
    }
    return payload;
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    throw new Error(err.message || 'Token is invalid');
  }
}

export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export function generateEmailToken(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(32).toString('base64url');
  const tokenHash = hashToken(rawToken);
  return { rawToken, tokenHash };
}

export function getExpiresAt(type: EmailTokenType): Date {
  const now = new Date();
  if (type === 'verify') {
    return new Date(now.getTime() + config.VERIFY_TOKEN_EXPIRE_HOURS * 3600 * 1000);
  } else {
    return new Date(now.getTime() + config.RESET_TOKEN_EXPIRE_MINUTES * 60 * 1000);
  }
}

export function isTokenExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() <= Date.now();
}
