import { Request, Response, NextFunction } from 'express';
import { db, User, Repo } from '../db.js';
import { decodeToken } from '../security.js';
import { errorPayload } from '../schemas.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
  repo?: Repo;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(errorPayload('http_error', 'Not authenticated'));
  }

  const token = authHeader.slice(7).trim();
  try {
    const payload = decodeToken(token, 'access');
    const userId = parseInt(payload.sub, 10);
    const user = db.findUserById(userId);
    if (!user) {
      return res.status(401).json(errorPayload('http_error', 'Could not validate credentials'));
    }
    req.user = user;
    next();
  } catch (err: any) {
    return res.status(401).json(errorPayload('http_error', err.message || 'Could not validate credentials'));
  }
}

export function requireOwnedRepo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const repoIdRaw = req.params.repo_id;
  const repoIdParam = Array.isArray(repoIdRaw) ? repoIdRaw[0] : repoIdRaw;
  const repoId = parseInt(repoIdParam || '', 10);
  if (isNaN(repoId)) {
    return res.status(404).json(errorPayload('http_error', 'Repo not found'));
  }

  const repo = db.findRepoById(repoId);
  if (!repo || !req.user || repo.user_id !== req.user.id) {
    return res.status(404).json(errorPayload('http_error', 'Repo not found'));
  }

  req.repo = repo;
  next();
}
