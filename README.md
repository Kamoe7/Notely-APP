# Notely

Tiny notes app. It's the "customer's product" in TicketPilot's demo — the app
that gets fixed live by the agent pipeline. Two things are intentionally
broken/missing so there's something real for a "user" to complain about:

- **Export button** exists but always fails (see `handleExport` in `app/page.jsx`)
- **No dark mode** — nothing to fix here, it's just absent

Auth is "magic-name" only — enter a display name, no password, stored in
`localStorage` (see `lib/identity.js`, `components/NameGate.jsx`). Notes are
tagged with an `author` field.

The feedback widget (bottom-right "?" button) writes tickets straight into
the `tickets` Firestore collection using the **frozen schema** — see
`AGENT_GUIDE.md` for the exact shape. Don't change field names without
updating that doc and telling Person B.

When one of your own tickets ships, a banner appears at the top of the app
("🎉 Your request shipped") — see `components/ShipNotifications.jsx`. This
is wired to `status: SHIPPED` + `notifiedAt` being set on a ticket, which
happens later, from the agent pipeline side.

## 1. Local setup

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local` with values from **Firebase console → Project settings →
General → Your apps → Web app**. If you haven't added a web app yet:

1. Go to https://console.firebase.google.com
2. Select the **same project** as your GCP hackathon project (Firebase just
   sits on top of GCP — search your GCP project name in the Firebase project
   picker, it'll be there once Firestore is enabled)
3. Project settings (gear icon) → General → scroll to "Your apps" → click
   the `</>` web icon → register an app (any nickname) → copy the config
   values into `.env.local`

Then:

```bash
npm run dev
```

Open http://localhost:3000 — enter a name, add a note, try the feedback
widget, confirm a doc shows up in Firestore under `tickets`.

Run tests before any push (agents will run this too):

```bash
npm test
```

**First run only:** the ship-notification query in `ShipNotifications.jsx`
needs a Firestore composite index (userId + status). Trigger it once by
opening the app — Firestore will throw an error in the browser console with
a direct link to create the index with one click. Do this once per project,
it's a one-time setup step.

## 2. Firestore security rules (do this before anyone else can use it)

In Firebase console → Firestore Database → Rules, start permissive for the
hackathon (lock down later if you have time):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{noteId} {
      allow read, write: if true;
    }
    match /tickets/{ticketId} {
      allow read, write: if true;
    }
  }
}
```

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Notely scaffold"
git branch -M main
git remote add origin https://github.com/<your-org>/notely.git
git push -u origin main
```

## 4. Wire up Cloud Build → Cloud Run (the CI/CD part)

1. Console → **Cloud Build → Triggers → Create Trigger**
2. Connect your GitHub repo (authorize GitHub if prompted)
3. Event: **Push to a branch**, branch: `^main$`
4. Configuration: **Cloud Build configuration file** → `/cloudbuild.yaml`
5. Under **Substitution variables**, add the six `_NEXT_PUBLIC_FIREBASE_*`
   variables (same values as your `.env.local` — these are public web keys,
   fine to put in a build trigger)
6. Save. Push a commit. Watch it build in Cloud Build → History.
7. First deploy: Cloud Run will create a `notely` service automatically from
   the `gcloud run deploy` step. After it finishes, find the live URL in
   **Cloud Run → notely → top of page**.

From here on, every push to `main` auto-deploys. This is the wiring that
makes "Coder Agent merges a PR → site updates itself" work later without any
manual deploy step.

## 5. Hand off to TicketPilot

Once tickets are landing in Firestore, Person B's Triage Agent (Eventarc
trigger on `tickets/{ticketId}` create) picks them up from here. Nothing
else in this repo changes — TicketPilot works against this same GCP project's
Firestore, and eventually opens PRs against a *separate* `notely` repo
checkout to make the actual code changes (see `ticketpilot` repo).
