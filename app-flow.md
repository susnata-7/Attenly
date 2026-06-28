# App Flow

## Screen Map

```
Dashboard (home)
  ├── History
  ├── Statistics
  └── Settings
        ├── Semester Management
        └── Subject Management
```

- **Dashboard**: default landing screen. Shows current semester's per-subject attendance %, attendance color (green/yellow/red), safe-classes-to-miss, and classes-needed-to-reach-target. Also has the quick "add today's attendance" action (must take only a few seconds — minimize taps).
- **History**: browsable log of all attendance records. Filterable by semester, subject, internal, month. Supports edit and delete on individual entries.
- **Statistics**: semester-wide view. Overall attendance, subject-wise breakdown, internal-wise breakdown (Internal 1 / Internal 2 / End Semester), cancelled-class count, total classes, classes attended, classes absent. Graphs optional, not required for MVP.
- **Settings**: attendance goal (e.g. 75/80/85%), dark mode toggle, JSON export/import (backup), entry points to Semester Management and Subject Management.
- **Semester Management**: create, rename, archive, switch semester. Multiple semesters supported.
- **Subject Management**: add, edit, delete subjects — scoped to the active semester.

Dashboard and Statistics are **separate screens** (not a single screen with a scope toggle): Dashboard is the quick daily-use glance, Statistics is the deeper breakdown view including internal-wise stats. Revisit this only if told otherwise — do not merge them.

---

## Primary user journeys

### 1. Logging today's attendance (most frequent action — optimize for speed)
```
Dashboard
  → tap subject
  → select status (Present / Absent / Cancelled)
  → optional note
  → save
  → returns to Dashboard, stats update immediately
```
Target: a few seconds total. Large touch targets, no unnecessary animation, no confirmation modal unless undo-relevant.

### 2. Reviewing/correcting history
```
Dashboard or bottom nav
  → History
  → apply filter (semester / subject / internal / month)
  → tap entry
  → edit fields or delete
  → list updates, stats recalculate
```

### 3. Checking semester-wide standing
```
Dashboard
  → Statistics
  → view overall %, subject-wise %, internal-wise breakdown
  → (optional) drill into a subject for its own internal-wise numbers
```

### 4. Starting a new semester
```
Settings
  → Semester Management
  → create new semester
  → switch active semester to it
  → Subject Management
  → add subjects for this semester
  → (optional) configure Internal 1 / Internal 2 / End Semester date ranges
```

### 5. Backup / restore
```
Settings
  → Export JSON (saves/share-sheets a file)
  
  or

Settings
  → Import JSON (select file → confirm overwrite or merge → reload data)
```

---

## Data flow rules for the coding agent

- Every screen reads from `expo-sqlite` queries scoped to the **active semester** (tracked in app state via Context).
- Attendance status is one of exactly three values: `Present`, `Absent`, `Cancelled`. `Cancelled` records are stored in history but **excluded from every percentage/stat calculation**.
- When a new attendance record is inserted, resolve and store its `internal_id` based on the record's date falling within an Internal's configured date range (see tech-stack.md for why this is stored, not recomputed live).
- All derived numbers (attendance %, safe-to-miss, classes-needed-for-target) are computed on read from `attendance_records` — never persisted as their own columns.
- Switching the active semester swaps the scope for Dashboard, History, and Statistics — Settings, Semester Management, and Subject Management are global/list views unaffected by active-semester scope (Subject Management still filters subjects to whichever semester you're editing).

## Navigation notes

- Bottom tab or drawer nav: Dashboard, History, Statistics, Settings (4 top-level destinations — do not overcomplicate).
- Semester Management and Subject Management are reached through Settings, not top-level tabs — they're infrequent actions.
- Minimize taps everywhere, especially for the "add attendance" flow from Dashboard.
