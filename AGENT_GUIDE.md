# Agent Guide

This file exists for TicketPilot's Coder Agent. Read this before editing
anything in this repo.

## What this app is
A minimal notes app. Users enter a display name (no password), write notes,
delete notes. That's the entire feature set on purpose — this repo should
stay small and predictable so automated changes are low-risk.

## Stack
- Next.js 14, App Router, all client components (`"use client"` at the top
  of nearly every file — there is no server-side data fetching here)
- Firebase JS SDK v10 for Firestore (`lib/firebase.js` exports `db`)
- Tailwind CSS for styling — use existing tokens in `tailwind.config.js`
  (`paper`, `ink`, `ledger`, `ledger2`, `flag`, `line`) rather than
  introducing new colors
- Fonts: `font-display` (Fraunces, italic, used for headings), `font-body`
  (Inter, default text), `font-mono` (IBM Plex Mono, used for labels/UI
  chrome like buttons and eyebrows) — set up in `app/layout.jsx`

## Directory structure
```
app/            # pages (App Router). page.jsx is the only real page.
components/     # all UI components, one component per file
lib/            # firebase.js (Firestore client), identity.js (display name)
tests/          # vitest tests
```

## Data model
Two Firestore collections. **Never change field names without updating the
Person A / Person B shared schema doc.**

`notes/{id}`:
```
{ text: string, author: string, createdAt: Timestamp }
```

`tickets/{id}` — written by the feedback widget, read/updated by the agent
pipeline. Only touch this collection's *shape* if explicitly asked to; the
dashboard and the agent pipeline both depend on it staying stable:
```
{
  title: string, body: string, userId: string, createdAt: Timestamp,
  status: NEW | TRIAGED | APPROVED | IMPLEMENTED | VERIFIED | SHIPPED
        | NEEDS_HUMAN | REJECTED,
  triage?: { type, complexity, duplicateOf?, dupCount, spec },
  run?: { branch, prUrl, attempts, testLog, diffSummary },
  shippedVersion?: string, notifiedAt?: Timestamp
}
```

## Known gaps (intentional — these are demo tickets, not bugs to silently fix)
- **Export button** (`app/page.jsx`, `handleExport`) always shows an error.
  If a ticket asks to fix export, implement a real CSV/JSON export of the
  current user's notes — don't just remove the error.
- **No dark mode.** If a ticket asks for dark mode, add a toggle (persist
  choice in localStorage) and a `dark:` variant set using existing Tailwind
  tokens — don't introduce a new palette.
- **No search, no folders.** Fair game for future tickets.

## Conventions for changes
- Keep components small and colocated in `components/`; don't collapse
  everything back into `page.jsx`.
- Match existing style: rounded-lg borders, `border-line`, muted mono
  labels for UI chrome, Fraunces italic only for headings/emphasis.
- Every new interactive element needs visible keyboard focus (already
  handled globally by `:focus-visible` in `app/globals.css` — don't
  override `outline: none` anywhere).
- Respect `prefers-reduced-motion` (already handled globally) — don't add
  animations that ignore it.

## Running & testing
```bash
npm install
npm run dev      # local dev server, needs .env.local (see .env.local.example)
npm test         # vitest — run before opening any PR
npm run build    # must succeed before a PR is considered VERIFIED
```

A change is only ready to ship if `npm test` and `npm run build` both pass.
