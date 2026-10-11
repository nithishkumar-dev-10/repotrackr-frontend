import { Router, Response } from 'express';
import { requireAuth, requireOwnedRepo, AuthenticatedRequest } from '../middleware/auth.js';

export const stubsRouter = Router();

// Part 2 - Pipeline Stubs
stubsRouter.post('/repos/:repo_id/index', requireAuth, requireOwnedRepo, (_req: AuthenticatedRequest, res: Response) => {
  return res.status(501).json({ status: 'not_implemented' });
});

stubsRouter.get('/repos/:repo_id/index/status', requireAuth, requireOwnedRepo, (_req: AuthenticatedRequest, res: Response) => {
  return res.status(501).json({ status: 'not_implemented' });
});

stubsRouter.get('/repos/:repo_id/index/summary', requireAuth, requireOwnedRepo, (_req: AuthenticatedRequest, res: Response) => {
  return res.status(501).json({ status: 'not_implemented' });
});

// Part 3 - AI Feature Stubs
stubsRouter.post('/repos/:repo_id/plan', requireAuth, requireOwnedRepo, (_req: AuthenticatedRequest, res: Response) => {
  return res.status(501).json({ status: 'not_implemented' });
});

stubsRouter.get('/repos/:repo_id/plan', requireAuth, requireOwnedRepo, (_req: AuthenticatedRequest, res: Response) => {
  return res.status(501).json({ status: 'not_implemented' });
});

stubsRouter.get('/repos/:repo_id/reader', requireAuth, requireOwnedRepo, (_req: AuthenticatedRequest, res: Response) => {
  return res.status(501).json({ status: 'not_implemented' });
});

stubsRouter.post('/repos/:repo_id/context', requireAuth, requireOwnedRepo, (_req: AuthenticatedRequest, res: Response) => {
  return res.status(501).json({ status: 'not_implemented' });
});

stubsRouter.post('/repos/:repo_id/query', requireAuth, requireOwnedRepo, (_req: AuthenticatedRequest, res: Response) => {
  return res.status(501).json({ status: 'not_implemented' });
});

// Part 4 - Agent & Evals Stubs
stubsRouter.get('/repos/:repo_id/agent/trace', requireAuth, requireOwnedRepo, (_req: AuthenticatedRequest, res: Response) => {
  return res.status(501).json({ status: 'not_implemented' });
});

stubsRouter.get('/evals', (_req, res: Response) => {
  return res.status(501).json({ status: 'not_implemented' });
});
