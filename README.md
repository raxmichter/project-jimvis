# Project Jimvis

Project Jimvis is a full-stack product prototype for an AI business-report workspace. It combines an animated companion named Jim with conversational report creation, interactive analysis, action recommendations, a persistent library, and a seven-day trial model.

## Core flow

1. Start a trial with Kimi authentication, or open a server-backed demo workspace.
2. Choose a prompt or describe a business question in the composer.
3. Generate a performance, retention, or market report.
4. Explore the overview, analysis, and action tabs.
5. Save, share, export, or revisit reports from the library.

The report generator is deterministic and uses illustrative figures. No company data source or billing provider is connected.

## Stack

- React 19, TypeScript, Vite, Tailwind CSS
- UI SDK behavior components and Motion
- Hono, tRPC, Drizzle ORM, MySQL
- OAuth sessions and server-backed demo accounts
- Installable PWA with network-only navigation

## Commands

- `npm run dev` — development server on port 3000
- `npm run check` — TypeScript validation
- `npm run build` — production frontend and bundled server
- `npm start` — production server
- `npm run db:push` — synchronize the database schema

## Assets and fonts

Jim, the interface artwork, and app icons are original to this prototype. Bricolage Grotesque and Space Mono are distributed through Fontsource. Interface icons are from Lucide. UI behavior components use UI SDK.
