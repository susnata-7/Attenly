# UI Design Spec — Attendance Tracker ("Terminal Retro" theme)

This document describes the exact visual design, layout, and interaction behavior for all 4 screens, derived from approved HTML/Tailwind mockups. Build the React Native app to match this as closely as RN allows. Where Tailwind/web-only effects don't translate (text-shadow glow, CSS scanline animation, backdrop blend), implement the closest RN equivalent or drop gracefully — noted per-case below.

---

## 1. Design Language

**Aesthetic**: retro CRT terminal / hacker console. Dark mode only (no light theme in MVP). Monospace font throughout, bracketed labels (`[ LIKE THIS ]`), uppercase tracking-wide section headers, thin 1px borders instead of shadows/elevation.

### Colors (single dark theme — use as RN theme constants)

| Token | Hex | Usage |
|---|---|---|
| `background` | `#0a0a0a` (Dashboard) / `#131313` (other screens) | App background |
| `surface` | `#131313` | Card background |
| `surface-container-low` | `#1c1b1b` | Elevated card / header strip |
| `surface-container` | `#201f1f` | Slightly higher elevation |
| `surface-container-high` | `#2a2a2a` | Table header row, stat tile bg |
| `surface-container-highest` | `#353534` | Hover state bg |
| `surface-container-lowest` | `#0e0e0e` | Recessed panel (log box, density map bg) |
| `primary` | `#ffd597` | Primary text accent, headings, glow text |
| `primary-container` | `#ffb000` | Amber accent — progress bars, active nav pill, highlight numbers |
| `on-primary-container` | `#6a4700` | Text on amber pill (active nav label) |
| `text-main` | `#eeeeee` | Main body text on dark surfaces |
| `on-surface` | `#e5e2e1` | Default body text |
| `secondary` | `#c8c6c5` | Inactive nav icons/labels |
| `text-dim` | `#888888` | Muted labels, captions, timestamps |
| `border-muted` | `#333333` | Default 1px borders everywhere |
| `success` | `#4caf50` | Present / safe status, "+X% trend" |
| `error` | `#ffb4ab` | Absent / critical status |
| `danger` | `#f44336` | Reserved alt error tone |
| Cancelled chip | bg `#333333`, text `#ffffff`, border `#555555` | Cancelled status only (not `error`, not `success`) |
| Present chip (history) | bg `#1b5e20`, text `#a5d6a7`, border `#2e7d32` | History timeline status pill |
| Absent chip (history) | bg `#b71c1c`, text `#ffcdd2`, border `#d32f2f` | History timeline status pill |

> Note: Dashboard cards use `success`/`error` directly for percentages and buttons; History timeline uses a darker saturated variant for status pills (different from Dashboard's chip colors). Keep both — they're visually distinct contexts (live action vs. historical log) and that's intentional, not a bug to "fix."

### Typography

- Font: **JetBrains Mono** (use a monospace font in RN — `JetBrainsMono-Regular/Medium/Bold` or system monospace fallback).
- Scale:
  - `label-sm`: 10px, weight 500, letter-spacing 0.1em — micro labels, timestamps, table headers
  - `body-md`: 14px, weight 400 — body text, button labels
  - `headline-md`: 20px, weight 600 — card titles, section headers
  - `label-lg`: 12px, weight 500, letter-spacing 0.05em — settings row text, stat labels
  - `body-lg`: 16px, weight 400 — settings primary row text
  - `headline-lg`: 24px, weight 700, letter-spacing -0.02em — profile name
  - `code-display`: 32px, weight 700 — big stat numbers (e.g. `82.4%`). Statistics screen overall % uses 64px, a one-off larger variant of this same style.
- Text is consistently **uppercase** for labels/buttons/section headers. Body/note text (history notes, telemetry text) is normal case.
- Bracket convention: section headers and stateful labels are wrapped in `[ TEXT ]` — e.g. `[ SESSION: SEMESTER_1 ]`, `[ ATTENDANCE GOAL: 75% ]`, `[ FILTER: ALL SUBJECTS ]`. Apply this convention to all comparable new labels for consistency.

### Borders, spacing, radius

- Border radius is nearly flat: default `2px`, `lg` 4px, `xl` 8px, `full` 12px (only for pill-shaped nav active state). Most cards/buttons use the 2px default — this is NOT a rounded-corner design.
- Borders: 1px solid `border-muted` (`#333333`) by default; switches to `primary`/`primary-container` on hover/focus/active where noted.
- Spacing scale: `xs` 4px, `sm` 8px, `unit` 8px, `md` 16px, `lg` 24px, `xl` 32px, screen horizontal margin 16px.

### Iconography

Material Symbols Outlined, weight 300 default (400 on Settings), unfilled outline style, filled (`FILL 1`) only for the active bottom-nav icon. Map to closest RN icon library (e.g. `react-native-vector-icons/MaterialSymbolsOutlined` or `@expo/vector-icons` MaterialIcons as fallback) — icons used: `terminal`, `grid_view`, `history`, `equalizer`, `settings`, `search`, `expand_more`, `sync`, `adjust`, `date_range`, `book`, `palette`, `file_upload`, `file_download`.

### Ambient effects (web-only — handle per note)

- **Scanline animation**: a thin amber horizontal line or gradient band sweeping top-to-bottom on loop (6–8s), low opacity (~0.03–0.1). Optional in RN — implement with a simple `Animated.Value` translateY loop on a thin `View` if low-cost; otherwise omit. Not load-bearing for function.
- **CRT overlay / flicker** (Dashboard's RGB-split overlay, Statistics' opacity flicker): cosmetic only, **skip in RN MVP** — not worth the render cost on mobile, no functional value.
- **Amber glow text-shadow**: translates to nothing native in RN Text easily; approximate by setting `primary` text color and optionally a very subtle `textShadow` (RN supports `textShadowColor/Radius/Offset` on Text) — low priority polish, not required for MVP.

---

## 2. Global Layout Shell

Every screen shares:

- **Top app bar** (fixed/sticky, 56px height, `background` color, bottom border `border-muted`):
  - Left: terminal icon + `[ SESSION: <SEMESTER_NAME> ]` in `primary`, `headline-md`/`code-display` style.
  - Right: contextual — Dashboard shows desktop-only nav links (ignore on mobile), History shows a search icon button, Statistics shows a sync icon button, Settings shows a `SYS_STATUS: OK` badge.
  - This bar reflects the **currently active semester** — wire it to global state, not per-screen hardcoded text.
- **Bottom tab navigation** (fixed, 4 tabs, `background` color, top border `border-muted`):
  - Tabs in order: **Dashboard** (`grid_view`), **History** (`history`), **Stats** (`equalizer`), **Settings** (`settings`).
  - Active tab: icon filled, wrapped in a pill (`primary-container` bg, `on-primary-container` text/icon, `full` radius, small padding).
  - Inactive tabs: `secondary` color, no pill, hover/press → `primary` color transition.
- **Main content** scrolls between the two bars; top padding ~80px (clear of header), bottom padding ~96px (clear of nav).
- Screen max-width on larger viewports: constrain content to ~672px centered (Dashboard mockup does this; apply consistently).

This confirms the navigation structure already settled: Dashboard ↔ History ↔ Statistics ↔ Settings, all siblings under the bottom tab bar; Semester/Subject management are pushed screens reached via Settings, not their own tabs.

---

## 3. Screen: Dashboard

**Purpose**: daily quick-glance + fast logging. This is the home tab.

**Layout, top to bottom:**

1. **Global stats header card** (bordered box, `surface-container-low` bg, padding `md`):
   - Row 1: `SYSTEM STATUS` label (dim, uppercase) on left, `ONLINE` (success color) on right.
   - Row 2: left side shows `TOTAL ATTENDANCE` label + big `[ 82.4% ]` number in `code-display`/`primary` with glow; right side shows semester name (dim label) + a thin horizontal progress bar (`border-muted` track, `primary-container` fill, width = attendance %).
   - This is the **overall current-semester attendance %**, computed live from all records, not stored.

2. **Subject cards list** (vertical stack, gap `md`). Each card (bordered, `surface` bg, hover border → `primary-container`):
   - Header row: `> SUBJECT_CODE: SUBJECT NAME` (truncated if long, `primary` color, `headline-md`) on left; big % number on right in `code-display`/`headline-md` — color is `primary` if attendance is healthy, `error` if below goal threshold. **Threshold = the user's configured attendance goal (default 75%)**, not a hardcoded color split.
   - Two-tile stat row below header (grid of 2, each tile bordered `surface-container-high` bg):
     - Left tile: `ATTENDED` label + `X / Y` (attended / total held classes, cancelled classes excluded from denominator per the core philosophy).
     - Right tile: `STATUS` label + dynamic message:
       - If above goal with margin to spare: `SAFE TO MISS: N` (success color) — N = classes that can still be missed while staying ≥ goal.
       - If below goal: `REQUIRED: N` (error color) — N = consecutive classes needed to reach goal.
       - If exactly on track with no margin either way: `ON TRACK: 0` (neutral/text-main color).
       - (The exact formula for these two N values must be specified in `data-model.md`/`features.md` — flag as a dependency, don't invent it here.)
   - Action row: 3 equal-width buttons, bordered, uppercase, `[ P ] PRESENT`, `[ A ] ABSENT`, `[ C ] CANCEL`. On press: brief highlight/glow flash (150ms) and the card border briefly tints to match the action (success green / error red / secondary gray) as immediate feedback that the tap registered, then reverts. Tapping logs an attendance record for **today's date** for that subject with one tap — no extra screen, per the "minimize taps" UX requirement.

3. **Recent activity log** (small panel, `surface-container-lowest` bg, bordered): last ~3 events as monospace lines, format `[ HH:MM:SS ] EVENT_DESCRIPTION`, timestamp in `primary`, rest in `text-dim`. Purely informational, generated from the most recent attendance records / threshold-crossing events. Not critical-path — nice-to-have feed, can be lowest implementation priority.

**Interaction notes:**
- Card border color changes on action tap are transient visual feedback, not persistent state — persistent state (the % and stat tiles) updates immediately after the record is saved, full card re-renders with fresh numbers.
- No swipe/long-press gestures implied by the mockup — keep interaction to direct taps for MVP.

---

## 4. Screen: History (file: `AttendanceLog.html`)

**Purpose**: browse, filter, and review past attendance records as a timeline/log.

**Layout, top to bottom:**

1. **Filter bar**: horizontally scrollable row of filter chip-buttons (bordered, `surface-container-high` bg, hover border → `primary`), each showing `[ FILTER: <VALUE> ]` + a dropdown chevron icon. Mockup shows two filters visible: subject filter (`ALL SUBJECTS` default) and month filter (`MARCH` example). Per the spec's filterable-by list, also support **semester** and **internal** filters — represent as additional chips in the same scrollable row, or a "more filters" overflow if 4 chips don't fit one row on small screens (your call on RN layout, but all 4 filter dimensions — semester, subject, internal, month — must be reachable from this screen).
   - Thin divider line below the filter row.

2. **Timeline list** (vertical stack, gap `sm`). Each entry (bordered, `surface-container-low` bg, hover → `surface-container`):
   - Top row: left side stacked — date in `DATE_CODE` style e.g. `2024-03-12 TU` (`code-display`/`label-lg`, `primary`, letter-spaced) above the subject name (uppercase, `headline-md`, `on-surface`); right side a status pill: `[ PRESENT ]` green variant, `[ ABSENT ]` red variant, or `[ CANCELLED ]` gray variant (exact colors in §1 color table — these are distinct from Dashboard's status colors, keep separate).
   - Optional note row below a thin top divider: `# <note text>` in italic `text-dim`, `#` prefix in bold `primary`. Entries without a note (mockup's 5th item) simply omit this row — don't render an empty note block.
   - Tapping an entry is the edit/expand affordance (mockup logs a console message and does a subtle press-scale; in RN this should open an edit sheet/screen for that record, since history must support edit and delete per spec).

3. **Monthly summary card** (bordered, `primary`-colored border to stand out, `surface-container-highest` bg): shown at the bottom of the currently filtered range.
   - Header row: `Monthly Summary // <MONTH>` label + big % number.
   - Thin progress bar matching that %.
   - 3-column stat row: `PRESENT` count, `ABSENT` count, `TOTAL` count, divided by thin vertical rules. (Cancelled classes are deliberately excluded from this 3-column summary, consistent with "cancelled excluded from calculations" — don't add a 4th cancelled column here unless explicitly asked.)
   - This card's numbers must recompute based on whatever filter is currently active (it's a summary of the filtered view, not always literally "this calendar month" — the mockup's literal month framing is the default/example state when month filter = current month).

**Empty/loading states**: not shown in mockup — use a simple centered `text-dim` message (e.g. `NO RECORDS FOUND`) styled consistently with the terminal aesthetic; don't introduce illustrations or a different visual language for empty states.

---

## 5. Screen: Statistics (file: `Statistics.html`)

**Purpose**: semester-wide analytics, deeper than Dashboard's per-subject glance.

**Layout, top to bottom:**

1. **Overall standing section**: header `[ OVERALL STANDING ]`. Card (`surface-container-low`, bordered, padding `lg`):
   - Big number, 64px `code-display`, `primary-container` color — overall cumulative attendance % for the semester.
   - Label below: `CUMULATIVE ATTENDANCE` (dim, tracked).
   - Right side (hidden on small/mobile widths per mockup's `hidden md:block` — so this trend indicator is a **tablet/desktop-only enhancement**, not required on phone): `STATUS: OPTIMAL` (success) + a "+X% from last week" trend line. Trend computation is a nice-to-have; don't block MVP on it.
   - Simple two-segment bar below the card: filled portion = overall % in `primary-container`, remainder in `border-muted`. This is a simplified duplicate of the big-card percentage as a visual bar — same data, just a second representation.

2. **Subject breakdown table**: header `[ SUBJECT BREAKDOWN ]`. A horizontally-scrollable table (bordered container):
   - Columns: `SUBJECT_ID`, `ATTND` (e.g. `24/28`), `GOAL` (e.g. `75%`), `STATUS` (right-aligned chip).
   - Status chip values and coloring: `SAFE` (success bg/text/border at low opacity), `WARN` (amber/`primary-container` at low opacity — used when close to but not yet below goal), `CRIT` (error at low opacity — meaningfully below goal). **Three tiers, not two** — flag to the coding agent that the exact numeric thresholds between WARN and CRIT need defining in `features.md` (e.g. WARN = within 5% of goal, CRIT = below goal by more than that — pick a concrete rule, don't leave it ambiguous in code).
   - Row tap = drill into that subject's detail (mockup logs to console; in RN, navigate to a subject detail view if one exists, otherwise treat as inert for MVP).

3. **Internal assessment breakdown**: header `[ INTERNAL ASSESSMENT BREAKDOWN ]`. Grid of cards, one per internal (3 in mockup: `INTERNAL_01`, `INTERNAL_02`, `END_SEM_PROJ`), responsive to 1 column on mobile / 3 on wider screens:
   - Each card: internal name + date-range label (e.g. `AUG-SEP`) top row; `AVG_ATTND` % + thin progress bar; small dim stat block with `CLASSES_TOTAL`, `PRESENT`, `ABSENT` counts.
   - **Not-yet-started internal state** (the `END_SEM_PROJ` card): progress bar rendered at near-0 opacity/empty, main % replaced with `--%`, and the stat block replaced with a centered italic `PERIOD NOT COMMENCED` message instead of the 3 counts. Implement this as an explicit state, not just "zero values" — it should read clearly as "hasn't started" vs. "started with 0% attendance," which are different things.
   - Card count is dynamic per semester (semester spec allows N internals, mockup just shows 3 as example) — don't hardcode "3 cards."

4. **Attendance density map**: header `[ ATTENDANCE_DENSITY_MAP ]`. A bordered panel containing a simple bar-per-day visualization, grouped into week blocks, each bar's height/opacity scaled to that day's attendance intensity for the week, with Sat/Sun rendered as flat minimal bars (no classes). Week labels (`WEEK_01`, `WEEK_02`, ...) below. This is explicitly the "graphs are optional" feature from spec — implement as a simple heatmap-style bar row; no axis labels, tooltips, or interactivity required beyond what's shown. Treat this as lowest priority polish if time-constrained.

---

## 6. Screen: Settings

**Purpose**: configuration hub + gateway to Semester/Subject management (per the navigation flow already agreed — Settings is the infrequent-access gateway, not the daily surface).

**Layout, top to bottom:**

1. **Profile header card** (bordered, `surface-container-low` bg): avatar image (64×64, bordered `primary`) + display name (`headline-lg`) + a secondary ID line (`label-sm`, dim). For MVP with no auth/accounts, this can be a static local "device profile" — name editable, avatar optional/default placeholder — not a real user-account system. Don't build backend-style profile infra for this.

2. **Settings list** — single bordered container, rows separated by `border-muted` dividers, each row a full-width pressable (hover/press → `surface-container-highest` bg, label text → `primary`):
   - `[ ATTENDANCE GOAL: <N>% ]` + adjust icon — tapping opens a goal-setting control (the spec's example goals: 75/80/85%, but should accept any value the user picks).
   - `[ SEMESTER MANAGEMENT > ]` + calendar icon — navigates to semester CRUD screen (create/rename/archive/switch).
   - `[ SUBJECT MANAGEMENT > ]` + book icon — navigates to subject CRUD screen, scoped to the active semester.
   - `[ THEME: <NAME> ]` + palette icon, with a secondary dim line showing the active "protocol" name — for MVP this is the only theme (Amber Terminal / Retro Glow), so this row can be inert/display-only or a no-op until a second theme exists. Don't build a theme picker UI for one option.
   - `[ EXPORT DATA (.JSON) ]` + upload icon — triggers JSON export per spec's backup feature.
   - `[ IMPORT DATA (.JSON) ]` + download icon — triggers JSON import.

3. **System telemetry banner** (left-accent border in `primary`, subtle tinted bg): small status text block — e.g. sync confirmation, local cache size, a hash/version string. This is flavor text reinforcing the "terminal" theme; populate with real-ish info if cheap (e.g. actual local DB file size), otherwise keep static placeholder text. Not a functional requirement.

4. **Footer**: version string in a small bordered pill (e.g. `v1.0.4`), and a dim tracked-out `End of line.` sign-off line. Purely cosmetic branding — keep it, it's part of the theme's personality.

**Note on icons-as-affordance**: every settings row's trailing icon is decorative/reinforcing, not functionally distinct from tapping the row text — the whole row is the tap target.

---

## 7. Cross-screen consistency rules for the coding agent

- **One shared component library**, not per-screen one-off styles: build a `StatusChip` (present/absent/cancelled/safe/warn/crit variants), a `BorderedCard`, a `StatTile`, a `ProgressBar`, and a `BottomNav` once, reuse everywhere. The 4 mockups share ~90% of their visual language — don't duplicate styling logic per screen.
- **Numbers shown are always derived, never stored** — every percentage, count, and status label on every screen is computed from the underlying attendance-event records at render/query time, consistent with the project's core "store events not counters" philosophy. This UI spec describes *presentation only*; calculation rules belong in `data-model.md` / `features.md`.
- **Goal threshold drives color** across Dashboard (%, color), Statistics (SAFE/WARN/CRIT chip) — implement as one shared utility function (`getAttendanceStatus(attended, total, goal)`), not duplicated per-screen logic.
- **Dark mode only for MVP** — don't build a light theme or theme-switching infrastructure beyond the inert placeholder row in Settings.
- Mockups are HTML/Tailwind reference only — they are not literal source to port; reproduce the visual outcome in RN/Expo idioms (Flexbox views, RN `Text`, a charting/bar approach without Tailwind classes).
