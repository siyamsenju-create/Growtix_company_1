# Growtix_company_1

MERN monorepo for Growtix: AI lead generation API (`packages/api`), BullMQ workers (`apps/workers`), and React web app (`apps/web`).

## Quick start

1. `docker compose up -d` (MongoDB + Redis)
2. Copy `.env.example` to `.env` and set secrets
3. `npm install` && `npm run build`
4. `npm run dev` (API, web, workers)

Optional admin seed: `npm run seed -w @growtix/api`
