# Tech Stack

## Summary

| Layer | Choice | Why |
|---|---|---|
| Framework | React Native + Expo | Cross-platform, no native build setup needed, single codebase |
| Language | TypeScript | Type safety for data model (semesters, subjects, records) |
| State | React Context + `useReducer` | App-wide state, no extra dependency |
| Storage | `expo-sqlite` | Local relational storage with indexed queries (see rationale below) |
| CI/CD | GitHub Actions | Auto-builds APK on push, publishes to GitHub Releases |
| Distribution | GitHub Releases | No app store, no backend — just download the APK |

No backend. No authentication. No cloud sync. No analytics. No ads.

---

## Why expo-sqlite (not AsyncStorage)

The original plan considered AsyncStorage for simplicity. It was rejected for this app specifically because:

- **Core philosophy is "store events, not counters."** Every stat (attendance %, safe-to-miss count, internal-wise breakdown) is calculated live from individual attendance records. That means frequent filtered queries: by semester, by subject, by internal, by month.
- AsyncStorage is a flat key-value string store. Filtered/grouped queries mean loading everything into memory, `JSON.parse`, then filtering in JS — every time a screen renders.
- `expo-sqlite` is a first-party Expo module. It does **not** require ejecting, custom native modules, or extra Gradle config — the original concern behind banning SQLite doesn't apply.
- SQLite gives indexed `WHERE`/`GROUP BY` queries for free, which this app's feature set (Dashboard, History filters, Statistics, Internal-wise breakdown) needs.
- Export/Import JSON backup still works fine — serialize from query results into JSON, parse JSON back into insert statements.

**Rule for the coding agent:** Use `expo-sqlite`. Do not introduce AsyncStorage, Firebase, Supabase, Redux, Zustand, or any backend service.

---

## Why NOT the alternatives

| Rejected | Reason |
|---|---|
| AsyncStorage | Can't do indexed/filtered queries — see above |
| Firebase / Supabase | Cloud backend explicitly out of scope, adds account/auth surface |
| Backend API | No server, no hosting — local-only by design |
| Redux / Zustand | Unnecessary dependency weight for this app's state complexity |
| Authentication | No login/signup required — single local user |
| Push notifications | Out of MVP scope (listed under future roadmap) |

---

## Key architectural decisions binding to this stack

1. **`internal_id` is stored on the attendance record at write time**, not recomputed live from date ranges on every read. If a user edits an Internal's date range later, run a one-time migration to reassign `internal_id` on affected records. Do not recompute internal membership on every query — this is a derived foreign key, not a calculated statistic, so storing it does not violate the "no counters" rule.
2. **All percentages, "safe to miss," and "classes needed to reach target" are calculated at render time** from `attendance_records` rows — never stored as columns.
3. Dark mode and Material Design conventions apply to all UI components.

---

## Build & Distribution Pipeline

```
Developer writes code
        ↓
git commit + push to GitHub
        ↓
GitHub Actions triggers (on push to main / on tag)
        ↓
Actions workflow builds APK (via EAS Build or local Gradle build inside CI)
        ↓
APK attached to a GitHub Release
        ↓
User downloads APK from Releases page
        ↓
User installs APK on Android (sideload)
```

No Vercel, no app store, no hosting provider involved at any step.
