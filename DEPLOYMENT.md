# Local and Vercel deployment

The repository root is the Vercel project root. Next.js serves the interface,
and `api/[...path].js` exposes the existing Express API as a Vercel Node
function. The API connects to Supabase PostgreSQL through the server-only
`DATABASE_URL`; it does not use Supabase Auth or a browser-side database client.

## Local development

1. In Supabase, open **Project Settings → Database → Connect** and copy the
   **Transaction Pooler** connection string. Use the transaction pooler for
   serverless-compatible connections.
2. Copy `.env.local.example` to `.env.local` in the repository root.
3. Set `DATABASE_URL` to the connection string and set `JWT_SECRET` to a
   long, unique random value. Keep both values server-side; never add a
   `NEXT_PUBLIC_` prefix.
4. From the repository root, run `npm install`.
5. In one terminal run `npm run backend:dev`.
6. In another terminal run `npm run dev`, then open `http://localhost:3001`.
   The frontend calls the Express API at `http://localhost:3000/api`.
7. Run `npm run db:check --prefix backend` or check
   `http://localhost:3000/api/health` for API/database connectivity.

The backend also reads existing optional mail settings from `backend/.env`.
Password-reset email requires `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
`SMTP_PASS`, and `EMAIL_FROM`.

## Vercel deployment

1. Import the repository into Vercel and leave **Root Directory** set to the
   repository root. Vercel detects Next.js and uses `npm run build`.
2. Add the following server-side environment variables in the Vercel project:
   - `DATABASE_URL`: Supabase Transaction Pooler connection string copied from
     **Project Settings → Database → Connect**.
   - `JWT_SECRET`: a long, unique production signing secret. Do not reuse a
     development value.
   - `BLOB_READ_WRITE_TOKEN`: required for uploads on Vercel.
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM` if
     password-reset email is required.
3. Apply the variables to the appropriate Vercel environments, then deploy
   when you are ready.

Do not configure `SUPABASE_SERVICE_ROLE_KEY`, a database password, or
`DATABASE_URL` as a `NEXT_PUBLIC_` variable. This application uses direct
server-side PostgreSQL access, so it does not require the Supabase anon or
publishable key.

The API stores new Vercel uploads in Blob because function filesystems are
temporary. Existing files in `backend/uploads` are local data and must be
migrated to Blob separately if they need to remain available in production.
The deployment uses a serverless PostgreSQL pool; it does not depend on XAMPP
or a local MySQL service.

## Database and authentication notes

- The existing `users` table, IDs, `password_hash` values, bcrypt verification,
  and JWT login flow are preserved. No users are copied, reset, or migrated to
  Supabase Auth.
- No schema or data migration is run by the application. The schema supplied
  for this integration must already exist in Supabase.
- Parent feedback (`feedback`), messaging (`admin_messages`), and exam summaries
  (`academic_records`) are queried by existing API controllers but are not
  present in the supplied 20-table schema. The schema also omits
  `users.profile_photo` and `parents.address`; profile-photo persistence and
  parent feedback/address features therefore need schema/code reconciliation
  before those parts can be considered operational. No missing tables or
  columns were added.
- The supplied schema has no unique constraint on `(student_id, date)` in
  `attendance` or `(exam_id, student_id)` in `results`. Their existing MySQL
  duplicate-key statements therefore do not provide logical upsert behavior
  for those keys. The PostgreSQL adaptation does not add constraints or change
  the Supabase schema.
- If existing IDs were imported explicitly, verify that each PostgreSQL
  identity sequence is positioned above the table's current maximum ID before
  allowing new inserts. Do not run sequence adjustments against production
  without reviewing the target database first.
