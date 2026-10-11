import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { reposRouter } from './routes/repos.js';
import { stubsRouter } from './routes/stubs.js';
import { errorPayload } from './schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

// GET /health
app.get('/health', (_req: Request, res: Response) => {
  return res.json({ status: 'ok' });
});

// API Routes
app.use('/auth', authRouter);
app.use('/repos', reposRouter);
app.use('/', stubsRouter);

// Frontend SPA Mount
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(rootDir, 'dist/index.html'))) {
    app.use(express.static(path.join(rootDir, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(rootDir, 'dist/index.html'));
    });
  } else {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
        root: rootDir,
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.error('[RepoTrackr AI] Failed to initialize Vite middleware:', err);
    }
  }

  // Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[RepoTrackr AI Error]', err);
    return res.status(err.status || 500).json(errorPayload('internal_error', err.message || 'Internal server error'));
  });

  const PORT = config.PORT;
  const HOST = '0.0.0.0';

  app.listen(PORT, HOST, () => {
    console.log(`[RepoTrackr AI] Server running on http://${HOST}:${PORT}`);
  });
}

startServer();
