# PTO Tracker

A small, private PTO / time-off tracker. Track balances, tenure-based accrual,
rollover, and requests across leave types (PTO, floating holidays, comp time,
or whatever you define). No accounts, no server — everything is stored in
your browser's local storage.

**Live:** deploy this yourself (see below) — it's just a static site.

## Features

- **Dashboard** — remaining balance per leave type, rollover, upcoming time off.
- **Requests** — add single days or a date range at once, filter by year/type/status.
- **Calendar** — month view color-coded by leave type.
- **Settings**
  - Leave types with custom names, colors, and how they're funded (tenure-based, fixed days/year, or manual).
  - A tenure → accrual-days table (e.g. "5th–9th year → 24 days").
  - Rollover hours per year.
  - **Import from spreadsheet** — drop in a legacy `.xlsx` PTO log (sheets like
    "PTO Tracking 2025" with Date/Hours/Type columns) and it's parsed locally
    in your browser, with messy/ambiguous rows flagged for manual review
    rather than silently dropped or guessed wrong.
  - Export/restore a full JSON backup.

All parsing and storage happens client-side — files you import are never
uploaded anywhere.

## Development

```bash
npm install
npm run dev      # start the dev server at http://localhost:5173
npm run build    # production build to dist/
npm run preview  # preview the production build locally
```

## Deploying

This is a static Vite app — `npm run build` produces a `dist/` folder you can
host anywhere (Vercel, Netlify, GitHub Pages, Cloudflare Pages, or just a
static file host). No backend or environment variables required.

## Stack

Vite · React · TypeScript · Tailwind CSS v4 · Zustand (persisted to
`localStorage`) · SheetJS (`xlsx`, lazy-loaded only when importing) ·
lucide-react icons.
