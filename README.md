# SEA-RBC Roster Builder

Standalone web app for building and saving crew rosters directly to the Airtable base.

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploying to Vercel

1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import from GitHub
3. Framework: **Vite**
4. No environment variables needed (PAT is entered at login)
5. Deploy

Done. Share the URL with your team.

## Authentication

The app requires an Airtable Personal Access Token (PAT) at login.
- PAT is stored in memory only — never persisted, never sent anywhere except Airtable's API
- Generate one at: https://airtable.com/create/tokens
- Required scopes: `data.records:read`, `data.records:write`
- Required base: SEA-RBC Production TEST BASE (`appLJLLEdSBYuAJf9`)

## Migrating to a New Base

If you move to a new Airtable account:

1. Update `BASE_ID` in `src/lib/airtable.js`
2. Update all `TABLES` IDs in `src/lib/airtable.js`
3. The app fetches staff and shows live — no static IDs to update for those
4. Update `TEMPLATES` in `src/lib/constants.js` if template counts change
5. Redeploy

## Architecture

```
src/
  lib/
    airtable.js     # Airtable API client (fetch, create, PAT management)
    constants.js    # Templates, dept config, static data
  components/
    LoginScreen.jsx # PAT entry + validation
    RosterBuilder.jsx # Main app: config panel + roster grid + save
    DeptCard.jsx    # Individual department slot card
    Toast.jsx       # Notification system
  App.jsx           # Root: auth gate + topbar
  index.css         # Full design system
  main.jsx          # Entry point
```

## Data Flow

1. Login → validate PAT against Airtable base
2. Load: Staff + Shows fetched on mount
3. User selects Show + Date + Day Category → template auto-loads
4. User reviews/edits dept cards
5. Save → creates: Show Day record, Crew Assignment records (one per person), Draft Call Sheet record

## Tables Written To

| Table | What gets created |
|---|---|
| Show Days | One record per roster save |
| Crew Assignments | One per assigned crew member |
| Call Sheets | One draft per save |
