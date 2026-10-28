# Next.js and Vercel deployment

The repository root is the Vercel project root. The current React interface is
served by Next.js, and the existing Express API is exposed as a Vercel Node
function. The MySQL schema and existing API routes are retained.

## Local development with XAMPP

1. Start MySQL in XAMPP and make sure the values in `backend/.env` point to the
   local database.
2. Copy `.env.local.example` to `.env.local`.
3. From the repository root, install the root dependencies with `npm install`.
4. In one terminal run `npm run backend:dev`.
5. In another terminal run `npm run dev`, then open `http://localhost:3001`.

The frontend uses `NEXT_PUBLIC_API_BASE_URL` to call the local Express server.
Do not put database credentials in any `NEXT_PUBLIC_` variable.

## Vercel production setup

1. Import the repository into Vercel and leave **Root Directory** set to the
   repository root. Vercel detects Next.js and runs `npm run build`.
2. Create a hosted MySQL database reachable from Vercel. A MySQL server running
   only in XAMPP on a personal computer is not reachable by Vercel. Keep XAMPP
   for local development if desired, and migrate the production schema and data
   to the hosted database.
3. Configure these server-side environment variables in Vercel:
   - `DB_HOST`
   - `DB_PORT` (normally `3306`)
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `DB_SSL=true` if required by the database provider
   - `JWT_SECRET` (use a long, unique random value)
   - `BLOB_READ_WRITE_TOKEN` (create a Vercel Blob store and add its token)
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM` if
     password-reset email is required
4. Redeploy after setting the environment variables.

Database credentials and the Blob token must not use the `NEXT_PUBLIC_` prefix.
Leave `NEXT_PUBLIC_API_BASE_URL` unset in Vercel so the frontend calls the
same-origin API function.
The deployment uses Blob for new uploads because Vercel function filesystems
are temporary. Existing files in `backend/uploads` are local data and must be
migrated to Blob separately if they need to remain available in production.

## Notes

- The API uses the same routes as the local Express server; `/api/*` requests
  are handled by the Vercel function in `api/[...path].js`.
- XAMPP remains supported for local development. Vercel production requires a
  hosted MySQL endpoint and will not connect to a local-only XAMPP service.
