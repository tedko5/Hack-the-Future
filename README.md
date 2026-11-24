# Guardians of the Grid

Challenge brief: [docs/challenge.md](docs/challenge.md)

TanStack Start, PostgreSQL and Drizzle.

## Run locally

Needs Node 22.18+, pnpm and Docker.

```bash
cp .env.example .env   # then fill in the two Clerk keys
pnpm install
pnpm db:up
pnpm db:setup
pnpm dev
```

Open http://localhost:3000. `/api/health` returns 200 when Postgres answers and 503 when it does not.

After changing `src/db/schema.ts`, run `pnpm db:generate` and `pnpm db:migrate`, then commit the `drizzle` folder.

`/status` shows the database connection. `pnpm db:seed` adds the sample glitches and never overwrites existing rows.

## Login

Clerk handles accounts and sessions. The `guardians` table holds the codename and role, and everyone starts as `defender`. Server functions must start with `requireGuardian()` or `requireCommander()` from `src/lib/guardian.server.ts`, because anyone can call them directly.

Make the first commander in the database, then use the Guardians page:

```sql
UPDATE guardians SET role = 'commander' WHERE codename = 'YourCodename';
```

## CI

GitHub Actions typechecks, builds, migrates a throwaway Postgres and checks `/api/health`. It needs no secrets.

## Deploy on Railway

1. New Project, Deploy from GitHub repo, pick this repo.
2. In the same project: Create, Database, PostgreSQL.
3. App service, Variables:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (the name before the dot is the database service's name)
   - `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from Clerk. The first is built into the client, so redeploy after changing it.
   - `CLERK_AUTHORIZED_PARTIES` = the site's origin, e.g. `https://your-app.up.railway.app`
4. App service, Settings: under Networking generate a domain, and under Source turn on "Wait for CI".

`pnpm start` applies pending migrations before it starts the server. `railway.json` holds the build, start and health check settings. Railway deploys every push to `main`.
