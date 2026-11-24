# How the application works

Answers to what the jury may ask.

## What it is

### What is it?

Mission control for Achrona. Guardians report **echoes**. A new echo opens a **glitch**, and later updates move it from leaked to assessing, containing and fixed.

Open glitches drain magic. Each one leaves 85% (leaked), 90% (assessing) or 95% (containing) of what remained.

### Which features are there?

- Dashboard with the magic level, echoes and glitches
- Reports and updates with images
- Assigning, taking and releasing glitches
- Map of Achrona with hacking
- Chat with replies, reactions and images
- Notifications
- Leaderboard with badges
- PDF report for the High Council
- Search, sorting and keyboard shortcuts
- Dark and light theme, English and Dutch
- The Oracle

### What can each role do?

- **Defenders** report echoes, take or release glitches, and change the status of their own glitches.
- **Commanders** assign, edit, remove and hack glitches, and change roles.

The first commander was set in the database.

## How it is built

### What is the stack?

TypeScript everywhere. TanStack Start (React) renders the first page on the server and is also our backend. PostgreSQL stores everything, Drizzle queries it, Clerk does login, and Railway hosts it.

### How does a click reach the database?

The page calls a *server function*, which is a typed HTTP call. It checks login and role, Zod validates the input, and then a query runs. The acting user always comes from the session, never from the input.

### Do you use polling or websockets?

Neither, for live updates. We use **Server-Sent Events**: one open connection per browser, from server to browser only.

1. Database triggers send `NOTIFY` when something changes.
2. Our server `LISTEN`s and tells the browsers.
3. The signal holds no content. Browsers refetch through the normal access checks.

Browsers reconnect by themselves. Sending uses normal requests, so websockets were not needed. Only the hidden `/status` page polls, every 5 seconds.

### What are the database migrations?

Numbered SQL files in `drizzle/`, 18 so far, that change the database step by step. We edit `schema.ts`, Drizzle generates the SQL, and triggers are written by hand.

Drizzle records which ones ran, so each runs once per database. They are in git and run at every start, before the server.

### What happens when two people do something at once?

Transactions and row locks. Taking a glitch is one conditional update, so only one person wins. Glitch numbers come from a database sequence. A hack gets one try, decided on the server, with a 55% chance.

### How do images work?

Photos are shrunk in the browser, which also drops their location data (GIFs stay as they are). They are stored in PostgreSQL. Private chat images are checked per request.

### How do notifications work?

They are saved in the same transaction as the change. Email or push can be added as a "channel", but none is yet.

### Is the Oracle AI?

No. It matches your question to 38 prepared answers per language by shared words, in the browser. It cannot make things up.

### How do the languages work?

Two text files that TypeScript keeps in sync. The choice is in a cookie. What people type is not translated.

## Security and deployment

### How do login and security work?

Clerk keeps passwords and sessions. We store only the Clerk ID, codename and role. Roles are read fresh on every call, and hidden buttons are never the protection.

There are also CSRF checks, parameterised queries, upload size limits, image types read from the file itself, and hidden database errors.

### What does the CI/CD do?

GitHub Actions type-checks, builds, migrates a throwaway database, starts the app, and checks health and the login redirect. Railway deploys `main`. Its "Wait for CI" setting holds deploys until the checks pass, if it is turned on.

## Weak spots, if asked

- Clerk is in development mode.
- There is no rate limiting.
- There is no automated test suite in the repository.
- The dashboard loads all echoes before showing 10.

**Next steps:** pagination on the server, a production login, and email notifications.
