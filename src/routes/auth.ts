import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  createAccessToken,
  createRefreshToken,
  decodeToken,
  generateEmailToken,
  hashToken,
  getExpiresAt,
  isTokenExpired,
} from '../security.js';
import { errorPayload } from '../schemas.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const authRouter = Router();

const RESEND_MESSAGE = 'If the account exists and is unverified, a new verification email has been sent.';
const FORGOT_MESSAGE = 'If an account exists for that email, a password reset link has been sent.';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /auth/signup
authRouter.post('/signup', async (req: Request, res: Response) => {
  const { email, password } = req.body || {};

  if (!email || !isValidEmail(email)) {
    return res.status(422).json(errorPayload('validation_error', 'Invalid email address', [{ field: 'email', message: 'Valid email is required' }]));
  }

  try {
    validatePasswordStrength(password);
  } catch (err: any) {
    return res.status(422).json(errorPayload('validation_error', err.message, [{ field: 'password', message: err.message }]));
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (db.findUserByEmail(normalizedEmail)) {
    return res.status(409).json(errorPayload('http_error', 'Email is already registered'));
  }

  const hashedPassword = await hashPassword(password);
  const user = db.createUser(normalizedEmail, hashedPassword);

  const { rawToken, tokenHash } = generateEmailToken();
  db.createToken(user.id, 'verify', tokenHash, getExpiresAt('verify'));
  console.log(`[RepoTrackr AI Dev] Verification token for ${user.email}: ${rawToken}`);

  return res.status(201).json({
    message: 'Account created. Check your email to verify your account.',
    // Include devToken in development for easy browser testing
    dev_token: rawToken,
  });
});

// POST /auth/verify-email
authRouter.post('/verify-email', (req: Request, res: Response) => {
  const { token } = req.body || {};
  if (!token) {
    return res.status(422).json(errorPayload('validation_error', 'Token is required'));
  }

  const tokenRecord = db.findTokenByHashAndType(hashToken(token), 'verify');
  if (!tokenRecord || tokenRecord.used_at || isTokenExpired(tokenRecord.expires_at)) {
    return res.status(400).json(errorPayload('http_error', 'Invalid or expired verification token'));
  }

  db.markTokenUsed(tokenRecord.id);
  db.updateUser(tokenRecord.user_id, { is_verified: true });

  return res.json({ message: 'Email verified. You can now log in.' });
});

// POST /auth/resend-verification
authRouter.post('/resend-verification', (req: Request, res: Response) => {
  const { email } = req.body || {};
  if (!email || !isValidEmail(email)) {
    return res.status(422).json(errorPayload('validation_error', 'Invalid email address'));
  }

  const user = db.findUserByEmail(email);
  if (!user || user.is_verified) {
    return res.json({ message: RESEND_MESSAGE });
  }

  db.invalidateActiveTokens(user.id, 'verify');
  const { rawToken, tokenHash } = generateEmailToken();
  db.createToken(user.id, 'verify', tokenHash, getExpiresAt('verify'));
  console.log(`[RepoTrackr AI Dev] Resent verification token for ${user.email}: ${rawToken}`);

  return res.json({
    message: RESEND_MESSAGE,
    dev_token: rawToken,
  });
});

// POST /auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(422).json(errorPayload('validation_error', 'Email and password are required'));
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(401).json(errorPayload('http_error', 'Invalid email or password'));
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return res.status(401).json(errorPayload('http_error', 'Invalid email or password'));
  }

  if (!user.is_verified) {
    return res.status(403).json(errorPayload('http_error', 'Email not verified. Please verify your email before logging in.'));
  }

  return res.json({
    access_token: createAccessToken(user.id),
    refresh_token: createRefreshToken(user.id),
    token_type: 'bearer',
  });
});

// POST /auth/refresh
authRouter.post('/refresh', (req: Request, res: Response) => {
  const { refresh_token } = req.body || {};
  if (!refresh_token) {
    return res.status(422).json(errorPayload('validation_error', 'Refresh token is required'));
  }

  try {
    const payload = decodeToken(refresh_token, 'refresh');
    const userId = parseInt(payload.sub, 10);
    const user = db.findUserById(userId);

    if (!user || !user.is_verified) {
      return res.status(401).json(errorPayload('http_error', 'Invalid or expired refresh token'));
    }

    return res.json({
      access_token: createAccessToken(user.id),
      refresh_token: createRefreshToken(user.id),
      token_type: 'bearer',
    });
  } catch {
    return res.status(401).json(errorPayload('http_error', 'Invalid or expired refresh token'));
  }
});

// POST /auth/logout
authRouter.post('/logout', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  return res.json({ message: 'Logged out.' });
});

// GET /auth/me
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  return res.json({
    id: user.id,
    email: user.email,
    is_verified: user.is_verified,
    created_at: user.created_at,
  });
});

// POST /auth/forgot-password
authRouter.post('/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body || {};
  if (!email || !isValidEmail(email)) {
    return res.status(422).json(errorPayload('validation_error', 'Invalid email address'));
  }

  const user = db.findUserByEmail(email);
  let rawToken: string | undefined;
  if (user) {
    db.invalidateActiveTokens(user.id, 'reset');
    const generated = generateEmailToken();
    rawToken = generated.rawToken;
    db.createToken(user.id, 'reset', generated.tokenHash, getExpiresAt('reset'));
    console.log(`[RepoTrackr AI Dev] Password reset token for ${user.email}: ${rawToken}`);
  }

  return res.json({
    message: FORGOT_MESSAGE,
    ...(rawToken ? { dev_token: rawToken } : {}),
  });
});

// POST /auth/reset-password
authRouter.post('/reset-password', async (req: Request, res: Response) => {
  const { token, new_password } = req.body || {};
  if (!token || !new_password) {
    return res.status(422).json(errorPayload('validation_error', 'Token and new_password are required'));
  }

  try {
    validatePasswordStrength(new_password);
  } catch (err: any) {
    return res.status(422).json(errorPayload('validation_error', err.message));
  }

  const tokenRecord = db.findTokenByHashAndType(hashToken(token), 'reset');
  if (!tokenRecord || tokenRecord.used_at || isTokenExpired(tokenRecord.expires_at)) {
    return res.status(400).json(errorPayload('http_error', 'Invalid or expired reset token'));
  }

  const user = db.findUserById(tokenRecord.user_id);
  if (!user) {
    return res.status(400).json(errorPayload('http_error', 'Invalid or expired reset token'));
  }

  const newHash = await hashPassword(new_password);
  db.updateUser(user.id, { password_hash: newHash });
  db.markTokenUsed(tokenRecord.id);

  return res.json({ message: 'Password has been reset. You can now log in.' });
});

// POST /auth/change-password
authRouter.post('/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { current_password, new_password } = req.body || {};

  if (!current_password || !new_password) {
    return res.status(422).json(errorPayload('validation_error', 'Current and new password are required'));
  }

  try {
    validatePasswordStrength(new_password);
  } catch (err: any) {
    return res.status(422).json(errorPayload('validation_error', err.message));
  }

  const currentMatch = await verifyPassword(current_password, user.password_hash);
  if (!currentMatch) {
    return res.status(400).json(errorPayload('http_error', 'Current password is incorrect'));
  }

  const sameMatch = await verifyPassword(new_password, user.password_hash);
  if (sameMatch) {
    return res.status(400).json(errorPayload('http_error', 'New password must be different from the current password'));
  }

  const newHash = await hashPassword(new_password);
  db.updateUser(user.id, { password_hash: newHash });

  return res.json({ message: 'Password changed.' });
});

// DELETE /auth/account
authRouter.delete('/account', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  db.deleteUser(user.id);
  return res.json({ message: 'Account deleted.' });
});
