# Ledger — Expense & Asset Tracker

Mobile-first, responsive personal finance tracker (usable on both phone and
desktop browsers). Solo personal-use project. **Zero-cost
constraint is a hard requirement** — every service used must stay on its free
tier permanently, not just during a trial.

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (Postgres + Auth + auto REST API) — free tier
- **Charts:** Recharts
- **PDF export:** jsPDF + jspdf-autotable (client-side only, no server)
- **Hosting (not yet set up):** Vercel free tier, deploying from GitHub
- No custom backend server — the frontend talks to Supabase directly via
  `supabase-js`, with Row-Level Security enforcing per-user data isolation.

## Where things live

- `supabase/schema.sql` — full DB schema + RLS policies. Source of truth
  for the shape of the DB, but **not necessarily already run on the live
  project** — check with the user before assuming a table/column exists;
  several changes here (e.g. `user_settings`) required the user to run SQL
  manually since only the anon key is available, never a service-role key.
  Four tables: `expenses`, `budgets`, `assets`, `user_settings`.
- `src/lib/supabaseClient.ts` — Supabase client, reads keys from
  `.env.local` (never commit this file — see `.gitignore`).
- `src/lib/auth-context.tsx` — React context exposing `session`/`loading`/
  `signOut()` app-wide via `useAuth()`.
- `src/lib/expenses.ts`, `src/lib/assets.ts`, `src/lib/budgets.ts`,
  `src/lib/settings.ts`, `src/lib/charts.ts` — data access + pure
  calculation helpers per domain, kept out of components. Follow this
  pattern for any new domain.
- `src/lib/settings.ts` — per-user customizable category list
  (`user_settings.categories`, falls back to `CATEGORIES` in
  `expenses.ts` for users who haven't customized it). Payment methods are
  intentionally **not** customizable — the `method` column has a fixed DB
  check constraint and the user explicitly chose not to loosen it.
- `src/components/RequireAuth.tsx` — wraps every protected page, redirects
  to `/login` if there's no session.
- `src/components/BottomNav.tsx` — fixed bottom tab bar: Home / Total Asset
  / Breakdown / Charts / Settings (Settings must stay last — explicit
  user requirement).
- `src/components/ExpenseForm.tsx` / `AssetForm.tsx` — shared by both the
  add flow (`AddExpenseForm`/`AddAssetForm`) and inline edit (in
  `ExpenseList`/`ExpenseTable`/`AssetList`). Take a `categories`/options
  prop rather than importing constants directly, since categories are
  per-user now.
- `src/app/home/page.tsx`, `src/app/assets/page.tsx`,
  `src/app/history/page.tsx`, `src/app/charts/page.tsx`,
  `src/app/settings/page.tsx` — one page per tab.

## Design conventions — keep new UI consistent with these

- **Colors** (in `tailwind.config.ts`): `ink` (#F2F4F3, primary text — near-
  white), `paper` (#0B0E10, background — near-black), `ledger` (#2FE6C8,
  accent — electric teal, positive/active/focus), `rust` (#FF5B4A, negative/
  delete/overspend — bright coral-red), `line` (#242B2E, hairline borders),
  `surface` (#14181B, boxed-section background — sits just above `paper`).
  This is a dark theme — `bg-ink`/`text-paper` on primary buttons means
  light-button-dark-text, not the reverse.
- **Type:** `font-display` (Space Grotesk, geometric sans) for headings and
  big summary numbers only. `font-body` (Inter) for everything else —
  labels, forms, body text, buttons. (Superseded Fraunces/serif — a warm
  editorial serif read as the opposite of "futuristic.")
- **Aesthetic — dark, minimal, one neon accent, boxed sections:** every
  top-level section on every tab is wrapped in `src/components/Card.tsx`
  (rounded-2xl, `border-line` border, `bg-surface`, optional title +
  hairline divider above its content) — page content is `space-y-5` of
  `Card`s, not a flat list of `border-b`-divided blocks. (This reverses an
  earlier documented rule — "hairline dividers instead of card containers" —
  which held even through the dark redesign; the user later explicitly
  asked for boxed sections. Login is unaffected — it's not one of the
  bottom-nav tabs.) Inputs stay underline-style inside cards (`border-b`,
  no boxed/rounded inputs with shadows) — cards box *sections*, not
  individual fields. No gradients. The only "glow" in the whole app is the
  shared `.btn-glow` class (in `globals.css`, a soft teal box-shadow on
  hover) applied to every primary `bg-ink` button, plus a matching glow on
  the active bottom-nav indicator dot and the teal `:focus-visible` ring —
  deliberately not applied anywhere else, to keep the minimalism the user
  explicitly asked to preserve alongside the futuristic redesign and the
  new boxed sections. Avoid: all-caps labels, middle-dot-joined meta
  strings ("A · B · C"), em-dash label patterns ("WORD — fragment"). Keep
  secondary/meta info as separate flex items with spacing, not
  punctuation-joined strings.
- Buttons: solid `bg-ink`, hover `bg-ledger` (+ `btn-glow`), no gradients.
- **Category badges:** `src/components/CategoryBadge.tsx` + `getCategoryColor()`
  in `src/lib/charts.ts` give every category a color from the same validated
  `CATEGORY_PALETTE` used by the pie chart, picked via a deterministic hash
  of the category string — not by list position/index, since categories are
  a user-editable list (Settings) and a position-based scheme would make a
  category's color shift whenever the list is reordered or edited. Used
  wherever a category is displayed as a label (`ExpenseList`, `ExpenseTable`)
  — not for Method, which the user chose to keep non-badged/non-colorful.
- **z-index tiers:** persistent chrome (`Header`, `BottomNav`) uses `z-40` —
  deliberately the highest tier in the app, since they must never be
  visually overlapped by scrolling content. Transient overlays (`Select`'s
  dropdown) use `z-30`. `Card`'s root div is `relative z-0` specifically so
  it establishes its *own* stacking context — its internal `z-10` layers
  (title row / content, stacked above the card's own liquid-fill layer)
  stay contained there and can never leak out to compete with Header/
  BottomNav at the document root. (This leak is exactly what caused a real
  bug once: Card content briefly painted *above* the sticky header while
  scrolling, because neither `main` nor the card grid wrapper established
  an intervening stacking context, so the card's `z-10` tied with Header's
  z-index at the root and later DOM order won.) If you add a new
  `position` + `z-index` element anywhere, check whether it needs its own
  contained stacking context the same way, rather than picking a bigger
  number and hoping.
- **Responsive strategy — wider single column, not a multi-column reflow:**
  every page's `<main>` (and `Header`'s inner row, and `BottomNav`'s `<ul>`,
  so they align with it) uses
  `max-w-md md:max-w-2xl lg:max-w-4xl` — mobile is unchanged (448px), and
  the same centered column just gets wider at `md`/`lg` rather than
  reflowing into side-by-side panels or swapping the bottom tab bar for a
  sidebar (a bigger dashboard-style overhaul was considered and explicitly
  declined). **Every top-level `Card` on a page shares that exact same
  width and resizes in sync** — no card (including Add-expense/Add-asset
  forms and the category pie chart) gets an extra width cap of its own.
  (An earlier version of this capped form-cards narrower at `max-w-xl` for
  reading comfort — the user explicitly asked for uniform width across all
  sections instead, so don't reintroduce a per-card cap without checking
  first.) Stat-card grids (e.g. Home's month/year cards) stay at their
  natural column count within that same shared width and just get more
  breathing room from the wider container — don't add columns just
  because there's space, only if a new stat genuinely warrants one.
  **Login is no longer an exception to this** (an earlier version of this
  note said it was, and that held for a while, but it was later explicitly
  reversed) — see the "Login liquid glass panel" entry below for its own
  `lg:` breakpoint jump to ~2x size, added because a merely-narrow centered
  card looked small/lost on an actual desktop-sized viewport once the
  panel had real visual weight (the glass treatment, the diagonal chart
  line behind it). Below `lg:` (1024px), Login still renders at its
  original compact size.
- **Login intro animation** (`src/app/login/page.tsx` + the `.anim-fade-up`/
  `.anim-word-in`/`.anim-draw-line` keyframes in `globals.css`): a small
  teal sparkline draws in next to the "Personal finance" eyebrow, the
  tagline reveals word-by-word (dim → bright), and a small monospace status
  line ("ledger synced" / "tracking active") fades in below it — loosely
  modeled on a reference animation the user shared (a Dribbble shot with a
  sci-fi satellite-tracking theme), deliberately reinterpreted with
  finance-appropriate copy/motifs instead of copying its content or its
  sage-green two-panel layout. Kept intentionally short (full sequence
  well under 1.5s, form usable within ~200ms) since — unlike a one-off
  promo shot — this plays every time a real user logs in; the form itself
  is never gated behind the animation finishing. Respects
  `prefers-reduced-motion` for free via the existing blanket override
  below. If this pattern gets reused elsewhere, extract it into a
  component rather than copy-pasting the keyframes/markup. Tagline copy
  is currently "We're watching your money so you don't have to." — the
  per-word stagger delay is computed from the word count
  (`280 + i * 60`ms), so if the copy changes, the HUD status line's own
  delay (currently `950ms`, set to land just before the last word
  finishes) may need a nudge to match. There's also an ambient background
  chart line plus three floating line-art icons (`CardIcon`, `RupeeIcon`,
  `ChartIcon` — plain outline shapes / a real "₹" glyph, no filled
  icon-avatar style, consistent with the rest of the app never using icon
  avatars) that drift slowly (`.anim-float`) and each periodically get a
  camera-autofocus-style corner-bracket "ping" (`.anim-scan`, staggered
  per icon) — reads as the tagline's "watching" being literal, cards/
  currency/charts visibly getting tracked. All generated markup/CSS, no
  images, so it stays zero-cost. **This decorative layer is two separate
  regions, not one**, because the login layout itself changes shape at
  the `sm:` breakpoint (bottom-anchored on mobile vs. vertically centered
  on `sm:`+): a `sm:hidden` band above the card on mobile with a
  horizontal zigzag, and a `hidden sm:block` full-viewport-spanning
  region on `sm:`+ with one diagonal zigzag rising from the bottom-left
  corner to the top-right corner (`viewBox="0 0 1000 600"`, path starts
  near `0,580` and ends near `1000,20`) — deliberately full-bleed and
  passing *behind* the card/text (it's `z-0` against the content
  wrapper's `z-10`, confirmed with `elementFromPoint` sampling across the
  headline/tagline so real content still wins hit-testing there) rather
  than confined to the side margins. An earlier version kept the desktop
  line in two narrow side gutters to avoid the card entirely, and before
  that a single fixed top band at all sizes — both were explicitly
  replaced (the gutter version read as "vertical, looking bad"; the fixed
  top band cut through the heading once centered) — don't reintroduce
  either without checking with the user first, this shape was iterated on
  deliberately. Also: the pulsing dots along each zigzag are deliberately
  plain positioned `<div>`s (`PulseDot`), not SVG `<circle>` elements
  inside the path's own `<svg>` — that svg uses `preserveAspectRatio="none"`
  to stretch its path to fill a container whose aspect ratio doesn't match
  the viewBox, and circles inside a non-uniformly-stretched SVG render as
  ellipses (caught by actually looking at a wide-viewport screenshot — a
  real bug, not a style choice; don't reintroduce `<circle>` here without
  re-checking at a wide aspect ratio).
- **Login "liquid glass" panel**: the login content column (`src/app/login/page.tsx`)
  is a frosted glass card — `rounded-2xl border border-ink/10 border-t-ink/25
  bg-ink/5 backdrop-blur-sm shadow-[...]` — sitting on top of the diagonal
  chart line above, so the line reads as visibly moving/softened *through*
  the glass rather than just being covered by it. Deliberately **no gradient
  sheen** even though most glassmorphism references use one — this app's
  "no gradients, one neon accent" rule (below) still holds; the glass read
  comes entirely from blur + translucency + the brighter top border, not a
  gradient highlight. The blur amount is deliberately light
  (`backdrop-blur-sm`, not `-xl`/`-2xl`): a stronger blur was tried first and
  it diffused the thin, low-opacity line into near-invisibility, defeating
  the point of the graph being visible through the glass — if this panel's
  blur is ever increased, re-check that the line behind it is still
  actually visible in a screenshot, not just that the panel "looks glassy."
  This panel currently sits over empty background on mobile (nothing
  decorative shares that screen region there — see above), so the
  through-glass motion effect is a desktop/tablet-only payoff by
  construction, not a bug. **At `lg:` (1024px) and up, the panel and its
  spacing/padding/icon-size are somewhat larger — deliberately NOT the
  font size.** A first attempt scaled text up too (`lg:text-7xl` heading,
  etc., aiming for a literal 2x) and both the text growth and the ~2x
  container growth were explicitly reverted/dialed back as "too big" —
  current state: no `lg:text-*` anywhere in this file (every piece of text
  is the same size at every breakpoint), while the container/padding/gaps
  get a modest bump (e.g. `max-w-sm → lg:max-w-xl`, `rounded-2xl → lg:rounded-3xl`,
  roughly 1.3–1.5x on spacing, not 2x). If asked to enlarge this again,
  increase container/spacing modestly and leave font sizes alone unless
  explicitly asked to change those too — the two are independent knobs
  here, not one "scale everything" toggle. Deliberately gated at `lg:`,
  not `sm:`, since even this smaller `lg:max-w-xl` width needs the room
  `sm:`-width viewports (640px) don't reliably have; 640–1023px keeps the
  original compact panel size (still with the desktop-mode diagonal
  line/icons behind it) and only `lg:`+ gets the larger one. Re-verify at
  exactly 1024px (the tightest fit) that nothing clips before widening
  further.
- Native `<select>` elements were replaced app-wide with a custom
  `src/components/Select.tsx` (button trigger + absolutely-positioned
  listbox) — native selects render via the OS/browser and can't be
  restyled or repositioned, which broke on some mobile viewports. Use
  `Select`, not `<select>`, for any new dropdown.
- **`SlideToConfirm` (`src/components/SlideToConfirm.tsx`) needs
  `touch-action: none`** (`touch-none`) on both the track and the
  draggable thumb — without it, mouse-drag works fine but a real
  touchscreen drag gets silently cancelled (the browser treats it as an
  ambiguous scroll gesture and fires `pointercancel` before the drag
  registers), which is exactly why this shipped working and then got
  reported as "can't slide the sliders on mobile" — desktop testing alone
  won't catch it. Verified with a real touch-event drag via CDP
  (`Input.dispatchTouchEvent`) against both the pre-fix and post-fix code
  to confirm this specific property was the cause, not just correlation.
  Any new custom drag/swipe element needs the same property from the
  start.
- Recharts components (`CategoryPieChart`, `InstrumentBarChart`,
  `TrendLineChart`, `BudgetVsActualChart`) style gridlines/ticks/tooltips
  via hardcoded hex, not Tailwind classes — Recharts props take raw
  color/style objects, not classNames. If the palette changes again, these
  4 files need updating by hand alongside `tailwind.config.ts` and
  `src/lib/charts.ts`'s `CATEGORY_PALETTE` (which is validated per the
  dataviz skill — re-run `scripts/validate_palette.js` against the new
  surface before changing it).

## Decisions made along the way

- **Credit vs Debit spend type** — `debit` is money spent; `credit` is money
  coming back (refund/cashback). Net spend = debit − credit. This net figure
  is what's used everywhere: month/year totals, per-instrument totals, and
  budget-pending (`budget − net spend`). (Superseded an earlier decision from
  Phase 2 that summed both the same way — corrected during Phase 4 build;
  this file is the source of truth now.)
- Categories and Card/UPI names are both per-user editable dropdown lists
  (Settings tab), backed by `user_settings` — see `src/lib/settings.ts`.
  Categories fall back to a fixed default list; Card/UPI names fall back to
  names auto-detected from the user's past entries (or `["Cash"]` if none).
  Superseded free-text-with-`<datalist>` for instrument name and the fixed
  `CATEGORIES` constant as the only source for categories.
- Payment **Method** (Card/UPI/Wallet/Bank Transfer) stays fixed/non-editable
  — the user explicitly chose not to make it customizable, since the DB
  has a hard check constraint on it and loosening that constraint was
  judged not worth it for this one field.

## Phase status

- [x] **Phase 1** — Project skeleton, Supabase auth (sign up/in/reset),
      route protection, bottom nav shell, DB schema + RLS.
- [x] **Phase 2** — Home tab: add-expense form, month-to-date/year-to-date
      totals, recent transactions list (with delete).
- [x] **Phase 3** — Budgets: input for monthly budget amount (`budgets`
      table already exists), "budget pending" = budget − month-to-date
      spend, shown on Home tab, red when overspent.
- [x] **Phase 4** — Per-card/UPI monthly totals: group current month's
      expenses by `instrument_name`, show as a small table/list on Home,
      sorted highest-spend-first. (Note: current month's data is already
      fetched in `home/page.tsx` as `monthExpenses` — this phase is mostly
      a display addition, minimal new querying needed.) Split into one
      section per payment method (Card/UPI/Wallet/Bank Transfer), each
      hidden when it has no entries this month.
- [x] **Phase 5** — Total Asset tab: form (Asset Name, Type: FD/MF/PF/PPF/
      Stocks/Bonds/RSU/ESPP, Status: Active/Dormant/Closed, Start/End date,
      Account/Folio number, Amount invested, Amount expected at maturity)
      + a single full-column table (all fields, one header row, not split
      by type — an earlier grouped-by-type layout was tried and explicitly
      reverted) + summary totals.
- [x] **Phase 6** — Charts tab: spend-by-category pie, spend-by-instrument
      bar, spend trend line (last 6–12 months), budget-vs-actual bar.
      Use Recharts (already a dependency). Trend line shows both a rolling
      6-month view and a Jan–Dec current-year view.
- [x] **Phase 7** — Polish: PWA manifest ("Add to Home Screen"), edit
      flows (not just add/delete), empty states, loading states audit.

## Working agreement

Build one phase at a time; check in before starting the next. Don't
introduce paid services or dependencies without flagging the cost impact
first, since staying free is a hard constraint here.
