# Project Jimvis — Agent & Developer Guide

## Overview
Project Jimvis is a full-stack React 19 + Hono + tRPC prototype for an AI business-report chatbot workspace featuring an animated companion named **Jim** (`@ui-sdk/react` behavior primitives + `motion/react`).

- **Focus**: Login / 7-day free-trial onboarding (`/login`) and the conversational report workspace (`/app`, `/app/library`, `/app/report/:reportId`). Root `/` routes directly into `/app` (which redirects unauthenticated sessions to `/login`), bypassing the unused marketing landing page (`src/pages/Home.tsx`).

## Local Setup & Commands
Run all commands from `Project Jimvis/` (the inner project directory containing `package.json`):

- `npm install` — install dependencies
- `npm run dev` — start Vite + `@hono/vite-dev-server` on `http://localhost:3000`
- `npm run check` — TypeScript project-references check (`tsc -b`)
- `npm run lint` — ESLint check (`eslint .`)
- `npm run build` — build client (`dist/public`) and bundle server (`dist/boot.js`)
- `npm start` — run production server (`NODE_ENV=production node dist/boot.js`)

## Environment & Persistence
- `.env` is gitignored; see `.env.example` for optional Kimi OAuth and MySQL variables.
- **Database**: When `DATABASE_URL` is set, Drizzle ORM (`mysql2`) is used. When `DATABASE_URL` is empty/unset locally, `api/queries/connection.ts` automatically persists users and reports to `.local-data/jimvis-store.json` (gitignored) so local sign-up, sign-in, demo workspaces, report generation, saving, and workspace renaming work with zero external database setup.
- **Auth**: Supports trial sign-up (`auth.startTrial`), email sign-in (`auth.signIn`), one-click demo (`auth.demo`), and Kimi OAuth (shown on `/login` only when `VITE_KIMI_AUTH_URL` and `VITE_APP_ID` are configured).
