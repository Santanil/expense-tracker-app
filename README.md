# Ledger — Expense & Asset Tracker (Phase 1: Skeleton + Auth)

Mobile-first personal finance tracker. Free stack: Next.js + Tailwind (frontend),
Supabase (Postgres + Auth, backend), Vercel (hosting).

## What's in Phase 1

- Full Next.js project skeleton (App Router, TypeScript, Tailwind)
- Supabase client + auth context (session handling across the app)
- Login page with Sign in / Create account / Forgot password, using proper
  `autocomplete` attributes so browser/password-manager autofill works
- Route protection: `/home`, `/assets`, `/charts` all redirect to `/login`
  if you're not signed in
- Bottom tab navigation (Home / Total Asset / Charts) — pages are stubs for now
- `supabase/schema.sql` — the full database schema (expenses, budgets, assets
  tables) with Row-Level Security already written, ready to run

## One-time setup (do this on whichever device has internet + Node.js)

### 1. Install dependencies
```bash
npm install
```

### 2. Create your free Supabase project
1. Go to https://supabase.com → Sign up (free, no card required) → New project
2. Wait ~2 minutes for it to provision
3. Go to **Project Settings → API** — you'll need the "Project URL" and the
   "anon public" key

### 3. Set up your environment variables
```bash
cp .env.local.example .env.local
```
Open `.env.local` and paste in your Project URL and anon key from step 2.
**Never commit this file** — it's already in `.gitignore`.

### 4. Create the database tables
1. In the Supabase dashboard, open **SQL Editor → New query**
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run**

This creates the `expenses`, `budgets`, and `assets` tables, plus
Row-Level Security policies so each user only ever sees their own data.

### 5. Run it locally
```bash
npm run dev
```
Open http://localhost:3000 — you should land on the login page. Create an
account, confirm the email Supabase sends you, and sign in.

## Next phases
- Phase 2: Home tab — add-expense form, month/year totals, recent transactions
- Phase 3: Budgets — set monthly budget, budget-pending calculation
- Phase 4: Per-card/UPI monthly totals
- Phase 5: Total Asset tab
- Phase 6: Charts tab
- Phase 7: Polish (PWA, edit/delete, empty states)
