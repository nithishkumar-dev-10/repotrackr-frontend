import { Router, Response } from 'express';
import { db } from '../db.js';
import { parseGithubUrl, errorPayload } from '../schemas.js';
import { requireAuth, requireOwnedRepo, AuthenticatedRequest } from '../middleware/auth.js';

export const reposRouter = Router();

// POST /repos
reposRouter.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { url } = req.body || {};

  if (!url) {
    return res.status(422).json(errorPayload('validation_error', 'Repo URL is required', [{ field: 'url', message: 'Repo URL must not be empty' }]));
  }

  let parsed: { owner: string; name: string; url: string };
  try {
    parsed = parseGithubUrl(url);
  } catch (err: any) {
    return res.status(422).json(errorPayload('validation_error', err.message, [{ field: 'url', message: err.message }]));
  }

  const existing = db.findRepoByUserAndUrl(user.id, parsed.url);
  if (existing) {
    return res.status(409).json(errorPayload('http_error', 'Repo already added'));
  }

  const repo = db.createRepo(user.id, parsed.url, parsed.owner, parsed.name);
  return res.status(201).json(repo);
});

// GET /repos
reposRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const repos = db.listReposByUserId(user.id);
  return res.json({ repos });
});

// GET /repos/:repo_id
reposRouter.get('/:repo_id', requireAuth, requireOwnedRepo, (req: AuthenticatedRequest, res: Response) => {
  return res.json(req.repo);
});

// DELETE /repos/:repo_id
reposRouter.delete('/:repo_id', requireAuth, requireOwnedRepo, (req: AuthenticatedRequest, res: Response) => {
  db.deleteRepo(req.repo!.id);
  return res.json({ message: 'Repo deleted.' });
});
