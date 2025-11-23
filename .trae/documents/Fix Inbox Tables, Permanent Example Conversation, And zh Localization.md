## Errors Diagnosis
- The database reports `relation "incoming_messages" does not exist` during `GET /api/web/inbox`, returning 500.
- Root cause: the Postgres tables were never created on the deployed instance. Startup migrations and the admin migrate route are present but either:
  - The migrations folder is not in the image, so Drizzle migrator cannot run.
  - The fallback DDL did not run (older build or early crash) before inbox queries.
- Evidence: repeated 42P01 (missing relation) specifically for `incoming_messages` on the inbox read path.

## Implementation Plan

### 1) Ship real migrations with the app image
- Add `drizzle.config.ts` at repo root, pointing `schema: './shared/schema.ts'` and `out: './migrations'`.
- Generate migrations from the existing schema: `npx drizzle-kit generate` (locally) to produce `migrations/meta/_journal.json` and SQL files.
- Commit the `migrations` folder to the repo.
- Update Dockerfile build step to include `migrations` into the runtime image (`COPY migrations ./migrations`).

### 2) Run migrations at startup (before inbox routes execute)
- Keep the unified startup migrator in `server/index.ts` and run `await migrate(db, { migrationsFolder })` as early as possible in boot.
- Maintain conditional SSL for `pg` Pool (respect `sslmode=require` or `POSTGRES_SSL=true`).
- Log explicit success/failure and short-circuit fatal cases only when explicitly required.

### 3) Strengthen admin "Run Migrations" path
- Ensure POST `/api/admin/db/migrate` first attempts Drizzle migrations; if missing folder, apply DDL fallback for all core tables (including `incoming_messages`) and return success.
- Add detailed error messages to the response so the UI surfaces why a migration was not available.

### 4) Guarantee DDL fallback runs once on fresh DBs
- Keep the safe DDL fallback (CREATE TABLE IF NOT EXISTS) for: `users`, `api_keys`, `client_profiles`, `system_config`, `message_logs`, `credit_transactions`, `incoming_messages`, `client_contacts`, `contact_groups`, `contacts`.
- Ensure fallback executes before any storage calls in a first-run scenario.

### 5) Permanent example conversation for clients
- Auto-seed a multi-step back-and-forth example thread on first inbox fetch if the client inbox is empty.
- Make the example persistent for clients (no client delete); only admins can delete/reseed examples via endpoints.
- Ensure seeded messages include names and business (`firstname`, `lastname`, `business`) so cards and dialog show rich details.
- Auto-open the conversation dialog after seeding (client-side) the first time.

### 6) Full Chinese localization coverage
- Audit components for newly added labels and ensure zh keys exist:
  - Inbox empty-state buttons and messages (already present in zh).
  - ConversationDialog strings (`Press Enter to send` already covered).
  - Message History new column: `Business Name` (add zh: `企业名称`).
  - Admin Configuration additions: `Suggested Webhook URL`, `Configured Webhook URL`, `Secrets (Environment)`, `Secrets (DB)`, `Set to suggested`, and any new button labels.
- Add zh translations to `client/src/lib/i18n.ts` for these keys and update components to use the i18n keys instead of hardcoded text.

### 7) Validation
- Deploy latest build with migrations included; confirm startup logs show migrations applied.
- In Admin → Configuration: "Run Migrations" returns success; "DB Status" lists `incoming_messages`.
- As a client, open Inbox on an empty account; example thread appears and the 2‑way dialog opens.
- Verify admins can delete/reseed the example; clients cannot.
- Switch LanguageToggle to 中文; verify the dashboard, inbox, and conversation dialog show Chinese text.

### 8) Deliverables
- Commits containing:
  - `drizzle.config.ts`, committed `migrations` folder, Dockerfile update to copy migrations.
  - Confirmed startup migration order and logs.
  - Admin migrate robustness and clearer error surfacing.
  - Seed logic ensuring multi-message back-and-forth and permanence for clients.
  - i18n zh additions for all newly introduced labels.

If this plan looks good, I will implement the migrations, fallback safeguards, localization additions, and the example conversation behavior, then push the changes and guide you to redeploy to verify the fix end-to-end.