# RepoTrackr AI

RepoTrackr AI is a backend-first tool for ingesting GitHub repositories and reasoning about them. You save a repository link, and (in later parts) it clones the repo, builds a deterministic index and static analysis of the code with `file:line` evidence, and only then lets an AI layer explain what is connected, where to start reading, what is done versus a plan, and how to prompt for what you want to build next.

**Design rule:** deterministic analysis decides what is true (AST, graph, static checks); the AI only retrieves, reasons over evidence and explains. Every AI claim cites `file:line`. If the AI is unavailable, the index and static checks still work.

The project is built in four parts (see `docs/RepoTrackr-AI-Execution-Plan.md`). **Part 1 (this repo's current state)** is the full-stack foundation with no pipeline and no AI: accounts, email verification, password reset, saved repo links, and Part 2–4 stubs.

## Tech stack

- **Node.js 22+** / **TypeScript**
- **Express 5** (HTTP server & routing)
- **In-memory data store** (`Map`/`Array` persistence)
- **bcryptjs** (password hashing), **jsonwebtoken** (JWT access/refresh tokens)
- **cors** (cross-origin resource sharing)
- **tsx** (zero-config TypeScript execution and dev server)

## What works today (Part 1)

- Full email/password auth: signup, email verification, resend, login, refresh, logout, forgot/reset/change password, delete account, `GET /auth/me`.
- Repo records: add, list, get and delete saved GitHub links (per-user, duplicate-blocked).
- Stub endpoints for Parts 2–4 are registered so the frontend can wire them now; each returns `501 {"status": "not_implemented"}`.
- Consistent JSON error envelope, CORS, and an interactive system test dashboard on `GET /`.

## Setup from scratch

Prerequisites: Node.js 22+ and `npm`.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional, defaults provided)
cp .env.example .env

# 3. Start development server
npm run dev
```

Server starts on `http://0.0.0.0:3000`.

## API Endpoints

- API base URL: `http://localhost:3000`
- System dashboard: `GET /`
- Health check: `GET /health` -> `{"status":"ok"}`
- Auth routes: `/auth/signup`, `/auth/verify-email`, `/auth/login`, `/auth/refresh`, `/auth/me`, etc.
- Repos routes: `POST /repos`, `GET /repos`, `GET /repos/:repo_id`, `DELETE /repos/:repo_id`
- Pipeline & AI stubs: `/repos/:repo_id/index`, `/repos/:repo_id/plan`, `/repos/:repo_id/reader`, `/repos/:repo_id/context`, `/repos/:repo_id/query`, `/repos/:repo_id/agent/trace`, `GET /evals`

See `docs/api_contract.md` for the full schema and request/response specifications.
