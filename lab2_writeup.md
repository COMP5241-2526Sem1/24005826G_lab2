# Lab 2 Write-up – Deploying SkyNotes to Vercel

> _Draft authored with Copilot. Replace placeholder screenshots with your own captures before submission._

## Overview

SkyNotes is a serverless-ready notetaking app built with Next.js 15, Prisma, and Postgres. The goal of this lab was to migrate persistence away from SQLite (which is incompatible with Vercel's serverless file system) to a managed Postgres database, add an AI-assisted feature, and document the deployment process to Vercel.

## Step-by-step journal

### 1. Project scaffolding
- Generated a new Next.js App Router project with Tailwind CSS for styling.
- Converted the repository into a TypeScript-first codebase to enable static analysis and better tooling support.
- ✅ _Screenshot placeholder_: `![Project scaffold](./docs/screenshots/step1.png)`

### 2. Database refactor to Postgres
- Added Prisma as the ORM and modelled the `Note` entity with tags, optional summary, and timestamps.
- Introduced a dual-mode Prisma client that uses the Neon serverless driver when targeting Neon-hosted databases, but falls back to the standard Postgres adapter locally.
- Documented `.env` expectations and provided `.env.example` for safe sharing.
- ✅ _Screenshot placeholder_: `![Prisma schema](./docs/screenshots/step2.png)`

### 3. API and data layer
- Implemented RESTful API routes under `/api/notes` with full CRUD support.
- Created a reusable `noteService` module that wraps Prisma calls with Zod validation.
- Added an optional `/api/notes/[id]/summary` endpoint that updates a note using an OpenAI Chat Completions call when an API key is present.
- ✅ _Screenshot placeholder_: `![API routes](./docs/screenshots/step3.png)`

### 4. Frontend experience
- Replaced the default landing page with a responsive dashboard (`<NoteBoard />`) offering note creation, editing, deletion, and AI summarisation.
- Implemented optimistic UI feedback (loading states, disable buttons) for better UX in serverless latency scenarios.
- ✅ _Screenshot placeholder_: `![Frontend UI](./docs/screenshots/step4.png)`

### 5. Deployment readiness
- Added `next.config.ts` tweaks (`output: "standalone"`, whitelisted serverless packages) to ensure compatibility with Vercel's runtime.
- Created `docker-compose.yml` and helper scripts (`npm run db:push`, `npm run db:seed`, `npm test`) to streamline local testing against Postgres.
- Verified database connectivity with the automated smoke test and captured logs.
- ✅ _Screenshot placeholder_: `![Vercel env variables](./docs/screenshots/step5.png)`

### 6. Optional enhancements
- AI summary endpoint gracefully degrades when no API key is provided, showing a helpful message instead of failing.
- Tagged notes provide lightweight categorisation that can be filtered or searched in future iterations.
- Documented troubleshooting tips and common pitfalls in the README.

## Challenges and lessons learned
- **Database connectivity in serverless contexts**: Prisma requires specialised drivers (e.g. Neon) for edge/serverless deployments because standard connection pooling is unavailable. Detecting the database host allows the same code to run locally and in production.
- **Environment validation**: Parsing environment variables with Zod catches misconfiguration early, but it also means every build/run must supply the required variables. The solution was to keep validation but document the process and provide `.env.example` so teammates know what to set.
- **Cold start latency**: Serverless functions spin up on demand, so UI feedback (spinners, disabled buttons) is essential for good UX even if operations take a little longer than a local server.

## Deployment summary
- Create a Neon (or Supabase) Postgres instance and copy the connection string.
- Configure `DATABASE_URL` (and optionally `OPENAI_API_KEY`) in Vercel project settings.
- Push the repository to GitHub and import it into Vercel.
- Vercel builds with `npm run build` and serves the standalone output; Prisma generates clients during `postinstall`.
- After deployment, confirm persistence either via `npm test` (pointed to the production database) or by creating notes in the deployed UI.

## Next steps / ideas
- Add authentication (Supabase Auth or Clerk) to provide per-user note storage.
- Implement tag-based filtering and search powered by Postgres `GIN` indexes.
- Enable offline support using Service Workers for capturing notes while disconnected.

---

_Replace the screenshot placeholders with actual images in `docs/screenshots/` before submitting._
