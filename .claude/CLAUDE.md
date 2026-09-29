# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

Only the Mutual NDA is currently implemented, via freeform AI chat (manual form on GitHub Pages, which has no backend) — see Implementation Status below.

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a Docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.  
The frontend should be in frontend/  
The database should use SQLLite and be created from scratch each time the Docker container is brought up, allowing for a users table with sign up and sign in.  
Consider statically building the frontend and serving it via FastAPI, if that will work.  
There should be scripts in scripts/ for:  
```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

## Color Scheme
- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`

## Implementation Status (PL-5, merged to main)

- **Backend**: FastAPI app in `backend/` (uv project). SQLite `users` table only
  (`backend/app/db.py`); no `documents` table or persistence yet — the AI chat
  endpoint is stateless (see below).
- **Auth**: fake login only (`frontend/lib/auth.ts`) — any non-empty
  email/password sets a localStorage flag. Not wired to the backend `users`
  table; no real sign up / sign in yet.
- **Documents**: only Mutual NDA (`mutual-nda`) is wired up
  (`frontend/components/MndaCreator.tsx`), with a live preview and
  client-side PDF download either way. The other 10 catalog entries show
  "Coming soon" (`frontend/lib/catalog.ts`).
- **AI chat / Cerebras / OpenRouter**: implemented for the Mutual NDA only,
  via two interchangeable transports behind the shared `MndaChat` UI
  (`frontend/components/MndaChat.tsx`, `frontend/lib/mndaChatTypes.ts`):
  - **Docker/local app**: `POST /api/mnda-chat` (`backend/app/mnda_chat.py`,
    called from `frontend/lib/mndaChatBackend.ts`) takes the full message
    history plus the fields collected so far, calls
    `openrouter/openai/gpt-oss-120b` via LiteLLM with Cerebras as the
    inference provider using Structured Outputs, and returns an assistant
    reply plus the merged field values. Stateless — no conversation
    persistence, lost on page refresh. Requires `OPENROUTER_API_KEY` in the
    process environment; loaded from the root `.env` via `python-dotenv` for
    local `uv run uvicorn`, and passed into the Docker container via
    `--env-file .env` in `scripts/start-*`.
  - **GitHub Pages (no backend)**: defaults to the manual form
    (`frontend/components/MndaForm.tsx`) instead of chat. A visitor can
    optionally paste their own OpenRouter API key into
    `frontend/components/MndaKeySettings.tsx`, stored only in that browser's
    `localStorage` (`frontend/lib/openRouterKey.ts`) and never sent to any
    server we control; once set, the page switches to the same chat UI, now
    calling OpenRouter's REST API directly from the browser with that key
    (`frontend/lib/mndaChatOpenRouter.ts`). This duplicates the backend's
    system prompt and Structured Outputs JSON schema by hand in TypeScript,
    since GitHub Pages has no backend to share that logic with — keep the two
    in sync manually when either changes. Which mode a build uses is decided
    at build time by `frontend/lib/deployment.ts` reading
    `NEXT_PUBLIC_GITHUB_PAGES`, set alongside the existing `GITHUB_PAGES` flag
    in `.github/workflows/deploy-pages.yml`.
- **Docker**: `Dockerfile` and `scripts/start-*` / `stop-*` exist, but Docker
  build/run is unverified on machines without virtualization enabled. Fallback
  for local dev without Docker: `cd frontend && npm run build`, then
  `cd backend && uv run uvicorn app.main:app --port 8000` with
  `PRELEGAL_FRONTEND_DIST` pointing at `frontend/out` — same SQLite
  recreate-from-scratch behavior, just no container.
- GitHub Pages (`.github/workflows/deploy-pages.yml`) deploys the frontend
  static export independently of the Docker/FastAPI app above.