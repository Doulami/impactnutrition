# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Impact** is a modern, headless e-commerce platform for sports nutrition, replacing the existing WooCommerce site (impactnutrition.com.tn). The platform is built with Medusa v2 (commerce backend) and Next.js 16 (storefront), following a phased development approach.

**Architecture:** Multi-tenant with shared schema; HQ manages master catalog, tenants opt-in with pricing overrides.

**Current Phase:** Phase 2 — Multi-Tenant Foundation & Domain Modeling (Documentation Complete)

**Tech Stack:**
- Commerce Backend: Medusa v2 (Node.js/TypeScript)
- Database: PostgreSQL 16
- Cache/Session: Redis 7
- Storefront: Next.js 16 App Router (React 19, TypeScript)
- Styling: Tailwind CSS v4
- Package Manager: pnpm

## Project Documentation

**Essential docs** (read before making changes):
- `/docs/charter.md` — Project scope, metrics, constraints, stakeholders
- `/docs/risks.md` — Risk register and mitigation strategies
- `/docs/decisions/` — Architecture Decision Records (ADRs)
  - `001-stack-selection.md` — Why Medusa v2 + Next.js
  - `002-multi-tenant-architecture.md` — Shared schema, tenant isolation, master catalog
  - `003-rbac-model.md` — Roles, permissions, capability toggles
- `/docs/multi-tenant-design.md` — Multi-tenant implementation guide
- `/docs/data-dictionary.md` — Complete schema reference
- `/docs/medusa-docs/` — Downloaded Medusa v2 documentation (modules, services, data-models)
- `/docs/phase-2-implementation-notes.md` — Current Phase 2 status and refactoring plan

**Phase gating:** All code changes require approval per phase plan. Check charter for current phase deliverables.

## Development Commands

### Start Development Services
```bash
# Start PostgreSQL + Redis
cd dev-services
sudo docker compose --env-file .env.db up -d
```

### Start Medusa Backend
```bash
cd backend
npm run dev
```
API runs at http://localhost:9000
- Health: http://localhost:9000/health
- Admin: http://localhost:9000/app
- Store API: http://localhost:9000/store

### Start Next.js Storefront
```bash
# From project root
pnpm dev
```
Storefront runs at http://localhost:3000

### Build for Production
```bash
pnpm build
```

### Start Production Server
```bash
pnpm start
```
Run this after `pnpm build`

### Linting
```bash
pnpm lint
```
Uses ESLint with Next.js config (core-web-vitals + TypeScript rules)

### Stop Services
```bash
# Stop Medusa (Ctrl+C in terminal)
# Stop Next.js (Ctrl+C in terminal)

# Stop Docker services
cd dev-services
sudo docker compose down
```

**Database connection details:**
- PostgreSQL: `localhost:5432`
- Database: `medusa_dev`
- User: `medusa`
- Password: `medusa`
- Redis: `localhost:6379`

Configuration is in `dev-services/.env.db`

## Architecture

### Next.js App Router Structure
- Uses the `src/app` directory for routes and layouts
- Server Components by default (React 19)
- File-based routing with layout nesting
- React Compiler enabled in `next.config.ts`

### Path Aliases
TypeScript path aliases configured in `tsconfig.json`:
- `@/*` → `./src/*`

Use these when importing from src directory.

### Styling
- Tailwind CSS v4 with PostCSS
- Global styles in `src/app/globals.css`
- Dark mode support via CSS classes

### Fonts
Project uses Next.js font optimization with Geist (sans and mono) fonts loaded in the root layout.

## Key Files

### Storefront (Next.js)
- `src/app/layout.tsx` - Root layout with metadata and font configuration
- `src/app/page.tsx` - Home page component
- `next.config.ts` - Next.js configuration (React Compiler enabled)
- `tsconfig.json` - TypeScript config with strict mode
- `eslint.config.mjs` - ESLint configuration (flat config format)
- `.env.local` - Storefront environment variables (create from `.env.local.example`)

### Backend (Medusa v2)
- `backend/medusa-config.ts` - Medusa configuration and modules
- `backend/src/` - Custom API routes, workflows, and modules
- `backend/.env` - Backend environment variables (see `.env.example`)
- `backend/package.json` - Backend dependencies

### Infrastructure
- `dev-services/docker-compose.yml` - PostgreSQL + Redis containers
- `dev-services/.env.db` - Database credentials

### Documentation
- `docs/charter.md` - Project scope and metrics
- `docs/risks.md` - Risk register
- `docs/decisions/` - Architecture Decision Records
- `docs/runbooks/local-setup.md` - Local development guide

## TypeScript Configuration

- Strict mode enabled
- Target: ES2017
- JSX: react-jsx (React 19 automatic runtime)
- Module resolution: bundler
