## SkyNotes – Cloud-native notetaking

This project refactors the original SQLite-powered notetaking lab into a fully serverless-ready Next.js 15 application. Data is stored in Postgres via Prisma, using the Neon serverless driver when deployed on Vercel (or any Neon-hosted database), and the standard Postgres driver for local development.

### Features

- ✅ CRUD notetaking interface with optimistic client UX
- ✅ Polished dashboard with live search, filter chips, keyboard shortcuts, and toast feedback
- ✅ AI-powered summaries backed by any OpenAI-compatible API (optional)
- ✅ Prisma data access layer with serverless-ready connection handling
- ✅ Automated smoke test to verify database connectivity

### UX highlights

- Friendly hero layout with glassmorphism card showcasing usage tips.
- Gradient background and subtle depth to keep focus on content.
- Keyboard shortcut (`⌘/Ctrl + Enter`) for rapid note creation.
- AI summary badge states (“updated” vs “pending”) with aria-live updates for assistive tech.
- Toast notifications for create/update/delete actions so you always know what happened.

---

## Prerequisites

- Node.js 20+
- Docker (for local Postgres via `docker compose`)
- A Postgres database (Neon, Supabase, etc.)
- Optional: OpenAI API key for AI summaries

---

## Local setup

1. Copy the example environment file and fill in credentials:

	```bash
	cp .env.example .env.local
	```

	- `DATABASE_URL`: use your Postgres connection string (`?sslmode=require` recommended for cloud DBs). For the provided Docker setup, use `postgresql://vercel:vercel@127.0.0.1:54322/vercel_notes`.
	- `OPENAI_API_KEY` (optional): enables AI summaries.

2. Start Postgres locally (skip if using an external database):

	```bash
	docker compose up -d
	```

3. Sync the schema and seed starter notes:

	```bash
	npm run db:push
	npm run db:seed
	```

4. Launch the development server:

	```bash
	npm run dev
	```

	Visit [http://localhost:3000](http://localhost:3000) to use the app.

---

## Testing the database connection

With the database running and `DATABASE_URL` exported, run:

```bash
npm test
```

This creates a note, reads it back, and then deletes it to confirm everything works end-to-end.

---

## Deploying to Vercel

1. Create a new project in Vercel and import this repository.
2. In **Environment Variables**, add at least:
	- `DATABASE_URL` – use your managed Postgres (Neon/Supabase/PlanetScale with pg rollup) connection string.
	- `OPENAI_API_KEY` – optional but recommended for summaries.
3. Trigger a deploy. The app uses the `standalone` Next.js output and serverless-friendly Prisma configuration, so no extra build settings are required.
4. After deploying, run `npm test` locally against the same database or create a manual note in production to ensure persistence.

> Tip: Neon provides a free serverless Postgres tier that works out-of-the-box with this project.

---

## Using Supabase (Postgres)

You can run this project entirely on Supabase Postgres. Steps:

1. Create a project in Supabase → copy the connection string from Settings → Database → Connection string.
	- Prefer the pooled connection string when available.
	- Ensure `?sslmode=require` is present for secure connections.
2. Set `DATABASE_URL` to that connection string in your local `.env.local` and in Vercel (Production & Preview environments).
3. Apply the schema and seed data against Supabase:
	- `npm run db:push`
	- `npm run db:seed`

That’s it — Prisma is already configured for PostgreSQL.

---

## GenAI features

This app can use any OpenAI-compatible API key to power:

- AI summaries (existing): click “Generate AI summary” on a note.
- Translate note: POST `/api/notes/[id]/translate` with `{ target: "fr", saveAsNew: true }` or use the UI control per note.
- Generate note from prompt: POST `/api/notes/generate` with `{ prompt: "..." }` or use the input next to “Save note”.

Environment variable:

- `OPENAI_API_KEY` (optional) — when omitted, the app degrades gracefully with clear messages.

---

## Useful scripts

| Script           | Description                                              |
| ---------------- | -------------------------------------------------------- |
| `npm run dev`    | Start Next.js locally.                                   |
| `npm run build`  | Create a production build (used by Vercel).              |
| `npm run start`  | Start the production server.                             |
| `npm run lint`   | Run ESLint checks.                                       |
| `npm run db:push`| Push Prisma schema to the configured database.           |
| `npm run db:seed`| Seed starter notes (idempotent if entries already exist).|
| `npm test`       | Smoke test verifying CRUD operations against Postgres.   |

---

## Troubleshooting

- **`DATABASE_URL` missing during build** – ensure it is provided in `.env.local` for local builds and in Vercel environment variables for cloud builds.
- **Connection refused locally** – confirm Docker is running and `docker compose ps` shows the Postgres service healthy. The provided compose file maps port `54322` to avoid conflicts with an existing Postgres installation.
- **AI summaries disabled** – you'll see a fallback message until `OPENAI_API_KEY` is set.

Happy shipping! 🚀

---

## Vercel: Make the project publicly accessible (disable Vercel Authentication)

If you want the deployed site to be accessible publicly (without requiring a Vercel team member to sign in), disable the "Vercel Authentication" option under Deployment Protection in your Vercel Project Settings. This repository's CI/builds and runtime will continue to work as normal; this just removes the requirement that visitors be authenticated in your Vercel team.

Quick steps (UI):

1. Sign in to https://vercel.com and open the project you deployed from this repo.
2. Click "Settings" in the project sidebar.
3. Find the "Deployment Protection" section (it may be under the "General" tab or a similarly-named settings group).
4. Locate the "Vercel Authentication" toggle and switch it to "Off" (disabled).
5. Save changes if required. Trigger a new deployment (or re-deploy the latest) to ensure the updated setting is applied to the active deployment.

Important notes:

- Disabling Vercel Authentication allows anyone on the public internet to view the site. Keep environment variables (like `DATABASE_URL` and `OPENAI_API_KEY`) secret — they are not exposed to clients when configured correctly in Vercel's Environment Variables UI.
- If you later need to restrict access again, re-enable the toggle in the same settings area.
- For screenshots and a step-by-step walkthrough, see `docs/vercel-disable-auth.md`.
