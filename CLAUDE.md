# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite, localhost:5173)
npm run build      # Production build
npm run preview    # Preview production build
```

No test runner or linter is configured.

## Architecture

**DOGAN Progressive Overload** is a PWA workout tracker built with React + Vite, backed by Supabase (Postgres + Auth).

### Auth & Data Flow

`App.jsx` is the single stateful root. It:
1. Listens to Supabase auth state (`onAuthStateChange`)
2. On login, fetches all data in parallel from three Supabase tables
3. Holds `history`, `programs`, and `measurements` in state and passes them down as props
4. All CRUD operations live in `App.jsx` and are passed as callbacks

There is no client-side routing library — navigation is a `view` string in state (`'dashboard'`, `'history'`, `'detail'`, `'measurements'`, `'settings'`, `'records'`, `'profile'`).

### Supabase Tables

| Table | Description |
|---|---|
| `gym_history` | Workout entries (date, type, program_name, tag_class, data JSONB) |
| `gym_programs` | User programs (name, tag_class, exercises array) |
| `gym_measurements` | Body measurements (date, values JSONB) |

DB↔App conversion functions (`dbToEntry`, `entryToDb`, etc.) are at the top of `App.jsx`. The `data` field in `gym_history` is a JSONB blob keyed by exercise name.

### Workout Data Shape

Each exercise in `entry.data` is one of:
- **Strength**: `{ sets: [{ weight, reps }, ...] }`
- **Treadmill**: `{ speed, incline, duration }`
- **Jump Rope**: `{ jumps }`

`migrateEntry()` in `utils/workout.js` handles the old `{ w1, w2 }` format from before the sets refactor.

### Key Utilities

- `src/utils/workout.js` — exercise data helpers, PR detection, display name resolution
- `src/utils/date.js` — `formatDate`, `isSameDay`
- `src/utils/storage.js` — `safeParse` (localStorage helper, minimally used now)
- `src/lib/supabase.js` — Supabase client singleton
- `src/data/defaultPrograms.js` — seeded on first login if no programs exist
- `src/data/exerciseLibrary.js` — exercise name list for the picker

### Auth Behavior

- "Remember Me" opt-out: stored in `localStorage.gymNoRemember`; checked against `sessionStorage.gymActive` on page load to auto-sign-out
- Password reset flow: `PASSWORD_RECOVERY` auth event sets `resetMode=true`, rendering `<Auth resetMode />`
- Theme persisted in `localStorage.gymTheme` (`'dark'` | `'light'`), applied via `data-theme` attribute on `<html>`

### PWA

Configured via `vite-plugin-pwa` in `vite.config.js` with `autoUpdate` service worker strategy. Icons and manifest are in `public/`.
