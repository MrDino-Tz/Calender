# Calendar UI Styles Reference (Scraped/Compiled)

**Purpose:** Consolidated UI style and pattern reference for the Calendar Web App, gathered from public design references and documentation.  
**Compiled:** 2026-11-16  
**Project context:** Use as inspiration for `/home/mrdino/Desktop/DTC/1/Calender/web` (React/Vite template cloned) and align with `docs/Calendar Web App Product and Technical Documentation.md`.

**Sources (summarized):**
- Google Calendar iOS/web design-system notes (Material-inspired): https://github.com/Meliwat/awesome-ios-design-md/blob/main/design-md/productivity/google-calendar/DESIGN.md
- "Warm Editorial Week Planner" calendar prompt/pattern: https://github.com/superdesigndev/superdesign-prompts/blob/main/prompts/calendar-ui-warm-editorial-week-planner/README.md
- Outlook web calendar personalization (color/customization patterns): https://support.microsoft.com/.../personalize-your-calendar-experience...
- General calendar UI patterns (week planner grids, day/week/month views, drag/resize, overlaps, mini-month, agenda, current-time line) from common examples/search results.

---

## 1. Common Layout & Information Architecture

### 1.1 Shell (matches product doc sec. 9.1)
- **Top bar:** menu/sidebar toggle, **Today** button, prev/next period arrows, current period title (e.g. "November 2026"), view switcher (**Day / Week / Month / Agenda**), search, settings, profile/account.
  - Guest state: small "Sign in to sync" link + dismissible banner (never blocking). Signed-in: account/status affordances.
- **Left sidebar:** primary **Create** action, **mini month** picker, "My calendars" and "Other calendars" lists with color indicators and show/hide toggles/checks. (Signed-in adds **Accounts** section with status: Active / Needs attention / Paused + Add account.)
- **Main area:** active calendar view.

### 1.2 Core view patterns
- **Month:** 7-column grid, day numbers in cells, event chips/dots/bars; other-month days muted; today highlighted.
- **Week:** 7 day columns + time gutter, hourly/half-hour gridlines, all-day row, events positioned by time/duration, overlaps shown side-by-side.
- **Day:** single (or few) day column(s) + time gutter, detailed timeline.
- **Agenda/List (Schedule):** chronological list grouped by day banners/headers; good mobile default.
- **Shared elements:** current-time indicator (line/dot) in day/week "today" column; all-day/multi-day spanning row above time grid; quick-create on empty-slot click; event details popover; drag to move/resize (Phase 2).

### 1.3 Responsive behavior (product doc sec. 9.3)
- **Mobile:** default to agenda or day view, collapsible sidebar/drawer, floating create button.
- **Desktop:** full layout with persistent sidebar.
- Hide/collapse sidebar at narrower widths; on very small screens prefer single-day timeline/agenda over dense week grid.

---

## 2. Interaction Patterns
- **Create:** click/tap empty slot → quick-create (title, time, "More options"); primary create button/FAB.
- **Event details:** click event → popup/panel (title, time, location, calendar, guests, reminders, edit/delete).
- **Drag & drop (later):** move events across slots/days; drag edge to resize duration.
- **Recurring edits:** scope dialog — this event / this and following / all events.
- **Selection/navigation:** today highlight ring/pill; mini-month selects/jumps date; keyboard shortcuts `c, t, d/w/m, j/k/arrows, /, Esc` (product doc 9.4).
- **Conflicts:** overlapping timed events split into side-by-side columns within the day.
- **Visibility:** per-calendar color dots/checkboxes toggle display; per-account colors/badges in unified view.

---

## 3. Style Direction A — Google / Material-Inspired (clean, neutral, color-as-content)

### 3.1 Visual character
- White/light neutral canvas with subtle gray surfaces/dividers; **event/calendar color carries meaning**.
- Rounded corners (small on cards/controls), clear spacing, restrained elevation (shadows) or flat surfaces with hairlines.
- Dense but scannable: tight event-card padding, breathable day banners/headers.
- Dark mode variant: near-black warm canvas (not pure #000), raised surfaces, brighter accent/blue for contrast.

### 3.2 Reference color tokens (Google Calendar-inspired)
| Role | Light | Dark (ref) | Notes |
|---|---:|---:|---|
| Canvas / background | `#FFFFFF` | `#202124` | Primary surface |
| Surface / fill | `#F1F3F4`, `#F8F9FA` | `#2D2E30`, `#3C4043` | Banners, inputs, selected rows |
| Divider / gridline | `#DADCE0` | `#3C4043` | 0.5–1px hairlines |
| Text primary | `#202124` | `#E8EAED` | Warm near-black, not pure black |
| Text secondary | `#5F6368` | `#9AA0A6` | Times, meta |
| Text tertiary/disabled | `#80868B` | — | Placeholders, muted |
| Primary action/accent | `#1A73E8` | `#8AB4F8` | Today, primary buttons/links, FAB |
| Accent pressed | `#1557B0` | — | Active state |
| Accent tint (selected) | `#E8F0FE` | — | Selected backgrounds/rings |
| Current-time indicator | `#D93025` | — | Red line + dot (common pattern) |
| Success / warning / error | `#188038` / `#F9AB00` / `#D93025` | — | Semantic states |

**Event/calendar palette approach:** allow a set of user-selectable calendar colors (Google-like swatches e.g. Tomato `#D50000`, Tangerine `#F4511E`, Banana `#F6BF26`, Sage `#33B679`, Basil `#0B8043`, Peacock `#039BE5`, Blueberry `#3F51B5`, Lavender `#7986CB`, Grape `#8E24AA`, Graphite `#616161`, etc.). In time-grid blocks use **tinted fill (~20% saturation) + solid left accent bar (full color) + text in/near accent**; in lists use a **4px left color bar**. Distinguish system/task/goal states sparingly if needed.

### 3.3 Typography (reference)
- **Sans-first, clean hierarchy:** display/title sans for period titles & large numerals; UI/body sans for labels, event text, times.
- **Weights:** prefer Regular (400) and Medium (500) for hierarchy; avoid heavy Bold everywhere.
- **Tabular numerals** for all times, day numbers, and gutter labels so columns align (`font-variant-numeric: tabular-nums`).
- Example scale (adapt to web): nav/period title ~20–22px/500; schedule day number large ~32–36px; event title ~13–14px/500; event time/meta ~12–13px/400; weekday headers/gutter ~11–12px/500 uppercase or small caps with slight tracking.
- Use the cloned template's font stack unless/until a deliberate choice is made; prioritize legibility on mobile/low-bandwidth.

### 3.4 Component treatments
- **Event card (list/schedule):** white surface, ~4px left color bar (calendar color), title + time (+ location), subtle hover/press state.
- **Event block (day/week grid):** absolute-positioned by start/duration, tinted background, ~3px left accent bar, rounded ~4px, title + time (collapse when short), overlaps split horizontally with small gap.
- **Today marker:** filled accent circle/pill behind today's date number (white text) or tinted column/header.
- **Current time:** 2px horizontal line across today's column with a dot at gutter edge.
- **Month cell:** day number top-left; today = filled circle; event dots/mini-bars below; selected day ring/tint.
- **Mini month:** compact month grid, today filled, visible week range subtly highlighted.
- **Primary create affordance:** prominent button; on mobile consider floating action button (FAB) bottom-right.
- **Buttons:** clear primary (filled/accent) vs secondary/tonal/outline/text; comfortable tap targets (>= ~40–48px).
- **Calendars list:** color dot/swatch + name + checkbox/toggle; disabled/hidden state obvious.
- **Elevation/shadow:** subtle, warm-gray shadows for popovers/modals/floating actions; most surfaces flat with dividers.

### 3.5 Spacing & radii (reference scale)
- **Base spacing:** 4px grid (4, 8, 12, 16, 24, 32…); standard horizontal padding ~16px mobile / 16–24px desktop.
- **Radii:** 0 (grid cells/lines), 2–4px (event bars/cards/inputs), 8–12px (modals/sheets), pill/full (today marker, chips), circle (FAB/dots).

---

## 4. Style Direction B — Warm Editorial (differentiated, "paper planner" feel)

A distinct alternative if the product wants a warmer, human/premium tone (useful for differentiator/brand exploration).

- **Palette:** ivory/cream canvas (e.g. `#FAF7F2`), warm near-black text (`#1A1714`), warm grays (`#8B8178`), **single saturated accent** (e.g. terracotta `#C4623D`) for today/primary CTA/current-time line only.
- **Event families (muted):** terracotta, sage `#7A8A6F`, dusty blue `#6F8299`, amber `#CF9749` as soft tints + solid left accent bar + darkened family text (avoid neon/saturated fills).
- **Typography pairing:** serif display for month title/date numerals/section headers (e.g. Fraunces) + clean sans for UI/body/times/labels (e.g. Inter).
- **Surfaces/details:** 1px warm hairlines, generous spacing, calm rhythm; segmented view switcher, "Up next" agenda in sidebar, all-day spanning chips.
- **Caution:** ensure contrast/accessibility (WCAG AA target per product doc) when using warm tints.

---

## 5. Outlook / Enterprise Patterns (relevant notes)
- **Per-calendar & per-event color:** whole calendars have a base color; individual events can be categorized/colored (categories) — supports dual model (calendar color + optional override/category).
- **Custom colors:** allow picking from presets and optionally a custom color (with preview; store hex/RGB) — useful for linked/external calendars and user calendars.
- **Density & settings:** configurable time scale, week start, date/time format, time zones, work hours — aligns with product settings (Phase 2).

---

## 6. Accessibility & Quality Checklist (apply to chosen style)
- **Contrast:** text/icons meet WCAG 2.1 AA against backgrounds and tinted event fills; don't rely on color alone (pair color with labels/icons/bars).
- **Keyboard:** full navigation/focus states, shortcuts (`c,t,d/w/m,j/k,/,Esc`), visible focus rings.
- **Hit targets:** >= ~44px touch targets on mobile (buttons, day cells, list rows).
- **Time clarity:** tabular numerals for times; clear AM/PM or 24h per setting; timezone-aware display; visible current-time indicator.
- **States:** hover/active/selected/disabled for calendars, events, buttons; loading/empty states (e.g. "No events"); "Needs attention" for account sync issues.
- **Dark mode:** plan token pairs (light/dark) early; keep event colors legible on dark surfaces.
- **Performance:** render only visible date range (+ buffer), virtualize long agenda/lists if needed (per NFR).

---

## 7. Mapping to Product Doc (quick alignment)
- **MVP (Phase 1):** month/week/day/agenda, today/prev/next/mini-month, current-time line, quick-create/details, event colors, browser reminders UX, guest-first with non-blocking sign-in prompt, `.ics` import/export affordance, responsive/mobile agenda-day, shortcuts.
- **Phase 2+:** per-calendar toggles, accounts section with sync status, unified multi-account colors/badges, drag-drop/resize, RSVP/guests UI, sharing/permissions UI, settings (language incl. Swahili, week start, 12/24h, default view, working hours), dark mode.
- **Market fit:** leave room for SMS/WhatsApp reminder channels, booking pages, Islamic calendar/prayer overlays, PWA/offline cues in visual system.

---

## 8. Suggested Implementation Notes (for `/web`)
- **Adopt/extend design tokens** in SCSS (`src/assets/scss/_variables.scss`, `_custom.scss`): define color roles (canvas/surface/text/border/accent/semantic), calendar/event palette, spacing/radii, typography scale, and dark-mode overrides.
- **Build primitives:** AppShell (topbar/sidebar/main), MiniMonth, CalendarList (color+toggle), ViewSwitcher, TimeGrid (gutter, hour/half-hour lines, now-line, all-day row), EventChip/EventBlock, Popover/Modal, AgendaList.
- **Libraries:** evaluate FullCalendar or `react-big-calendar` (recommended in product doc) vs custom grid for MVP speed; ensure support for month/week/day/agenda, event rendering, and later drag/drop.
- **Keep template infra:** Vite/React Router/SCSS structure from cloned sample; replace Mwandishi-specific pages/branding/routes with calendar screens incrementally.
- **Assets:** plan icon set (Tabler already in deps) and accessible color choices for calendars/events.

> Note: Web fetch/scrape access to some design sites is limited; this doc synthesizes verifiable open design notes (Google Calendar design-md, prompt patterns) and common calendar UI conventions. Treat token values as a starting reference to be tuned into project-specific design tokens.