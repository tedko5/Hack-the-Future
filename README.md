# Guardians of the Grid

Challenge brief: [docs/challenge.md](docs/challenge.md)

TanStack Start, PostgreSQL and Drizzle.

## Run locally

Needs Node 22.18+, pnpm and Docker.

```bash
cp .env.example .env
pnpm install
pnpm db:up
pnpm db:setup
pnpm dev
```

Open http://localhost:3000. `/api/health` returns 200 when Postgres answers and 503 when it does not.

After changing `src/db/schema.ts`, run `pnpm db:generate` and `pnpm db:migrate`, then commit the `drizzle` folder.

`/status` shows the database connection. `pnpm db:seed` adds the sample glitches and never overwrites existing rows.

## CI

GitHub Actions typechecks, builds, migrates a throwaway Postgres and checks `/api/health`. It needs no secrets.

## Deploy on Railway

1. New Project, Deploy from GitHub repo, pick this repo.
2. In the same project: Create, Database, PostgreSQL.
3. App service, Variables: `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (the name before the dot is the database service's name).
4. App service, Settings: under Networking generate a domain, and under Source turn on "Wait for CI".

`railway.json` holds the build, migration, start and health check settings. Railway deploys every push to `main`.
