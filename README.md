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

## Where things live

| Folder | What it holds |
|---|---|
| `src/routes` | Pages, and HTTP endpoints under `routes/api`. Pages under `routes/_app` need a guardian. |
| `src/components` | UI components |
| `src/lib/*.ts` | Types and Zod schemas, shared by browser and server |
| `src/lib/*.functions.ts` | Server functions: the API the pages call |
| `src/i18n` | The texts in English (`en.ts`) and Dutch (`nl.ts`), and the language choice |
| `src/middleware` | Login and role checks, and error translation and hiding |
| `src/server/*.server.ts` | Database queries and other server-only code |
| `src/db` | Connection and table definitions |
| `drizzle` | Generated migrations, plus the live update triggers |

A call goes page, server function (access check, validation, rules), query, Postgres.

To add a server function:

1. Put its Zod schema in `src/lib/<entity>.ts`.
2. Put its query in `src/server/<entities>.server.ts`.
3. Add it to `src/lib/<entities>.functions.ts` with `guardianMiddleware` or `commanderMiddleware` and `validate(schema)`. Take the user from `context.guardian`, never from the input.

Changes to glitches, echoes, messages and notifications reach every open page under `routes/_app` live, through `useLiveEvents` in `routes/_app.tsx`.

## Languages

Put every text in `src/i18n/en.ts` and `nl.ts`, and use it in a component as `useT().echoes.title`. TypeScript refuses a text that is missing in one of them. Dates go through `useFormat()`.

Server errors are thrown in English and translated by `src/i18n/errors.ts` on their way out. The Oracle's answers are in `src/lib/knowledge.ts` and `knowledge.nl.ts`. The choice is kept in a cookie, and without one the browser's language decides.

## Login

Clerk handles accounts and sessions. The `guardians` table holds the codename and role, and everyone starts as `defender`. Every server function uses a middleware from `src/middleware/auth.ts`, because anyone can call them directly.

Make the first commander in the database, then use the Guardians section at the bottom of mission control:

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
