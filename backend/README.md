# School Management System Backend

The existing Express API is served locally by `backend/index.js` and as the
Vercel Node function exported from `api/[...path].js`. Application database
queries use the server-side PostgreSQL driver and the Supabase connection
string configured as `DATABASE_URL`. The existing custom bcrypt/JWT
authentication remains in use; the application does not use Supabase Auth.

## Setup

1. Copy the root `.env.local.example` file to `.env.local`.
2. Set `DATABASE_URL` to the Supabase Transaction Pooler connection string and
   set `JWT_SECRET` to a long, unique secret. Never expose either value to
   browser code.
3. From the repository root, install dependencies with `npm install`.
4. Run `npm run backend:dev` from the repository root. The API listens on port
   3000 by default.
5. To run the focused database-adapter tests, run `npm test --prefix backend`.

Optional mail settings used for password-reset email can remain in
`backend/.env`: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and
`EMAIL_FROM`.

See the root [deployment guide](../DEPLOYMENT.md) for running the Next.js
frontend and configuring Vercel.

## Legacy database utilities

Some one-off scripts and schema files in this directory still target the
original MySQL database. They are not used by the Express API runtime or the
Vercel function. Do not run MySQL migration or seed scripts against Supabase.
