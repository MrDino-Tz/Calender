# Calendar Web App: Product and Technical Documentation

Version 0.2 (draft) | Status: Planning

## 1. Overview

### 1.1 Purpose

This document describes a web-based calendar application inspired by Google Calendar. It defines the product vision, feature scope by phase, architecture, data model, API, security and delivery plan, so that design and development can proceed from one shared reference.

### 1.2 Product vision

A fast, simple calendar that lets people plan their time, share it with others and get reminded through the channels they actually use. For the East African market this means Swahili support, local holidays, SMS/WhatsApp reminders and mobile-money paid bookings.

### 1.3 Goals

- Let anyone open the app and use the calendar immediately, with no sign-up (guest mode).
- Make sign-in optional and later: it adds backup, cross-device sync and linked accounts, but is never required to use the core calendar.
- Let users connect their existing Google, Microsoft and other calendar and email accounts and see everything in one place.
- Deliver a reliable core calendar (views, events, reminders, recurrence) in the MVP.
- Make time zones and recurring events correct from day one.
- Be responsive and usable on slow mobile connections.

### 1.4 Non-goals (initially)

- Replacing enterprise suites (room booking, domain-wide administration).
- Account sign-in and linked-account sync in the MVP; both arrive in Phase 2.
- Native mobile apps (the web app is responsive and later installable as a PWA).

### 1.5 Open decision

Is this a **Google Calendar clone** (learning/portfolio project) or a **product with a differentiator**? The scope below supports both: Phases 1 to 2 form a solid clone, Phase 3 onward adds the differentiators.

## 2. Target users and use cases

| User | Typical need |
| --- | --- |
| Student | Class timetable, assignment deadlines, exam reminders |
| Professional | Meetings, availability sharing, recurring work events |
| Small business (clinic, salon, tutor) | Booking pages with paid appointments |
| Community or team organizer | Shared event calendars, RSVPs |

## 3. Feature scope by phase

### Phase 1: MVP (guest mode, no sign-in)

**Calendar views**

- Month, week, day views; agenda/list view
- Today button, previous/next navigation, mini month calendar
- Current-time indicator in week and day views

**Events**

- Create, edit, delete events: title, description, location, start/end, all-day flag, color
- Quick-create popup on clicking an empty slot; full editor for more options
- Event details popup on click
- Time zone support (store UTC, display in user's zone)

**Recurrence**

- Daily, weekly, monthly, yearly repeats
- Edit scope prompt: this event / this and following / all events

**Guest mode (no account needed)**

- The app opens straight to the calendar; there is no sign-up or login wall
- Calendars, events and settings are saved in the browser (IndexedDB)
- Time zone is detected from the browser and can be changed
- Export and import `.ics` files so guests can back up or move their data
- A small, dismissible Sign in to sync prompt; never a blocking screen

**Reminders**

- Browser notifications at configurable offsets (for example 10 minutes before); email reminders arrive with accounts in Phase 2

**Other**

- Search events by title
- Responsive layout, keyboard shortcuts (`c` create, `t` today, `d/w/m` views)

### Phase 2: Optional accounts, linked accounts and collaboration

- Optional sign-in (email and password, Google, Microsoft) to back up and sync across devices; guests keep working without it
- Guest-to-account migration: local calendars and events are uploaded on first sign-in, with no data loss
- Linked accounts: connect several external accounts at once (Google Calendar, Microsoft Outlook/365, Apple iCloud, Yahoo and any CalDAV or iCal URL)
- Unified view: events from every linked account shown together, with per-account colors and badges
- Sync modes per account: read-only import first, then two-way sync (changes made here are written back)
- Linked email accounts: send invitations and reminders from the user's own address
- Manage accounts: choose which calendars to sync, pause, reconnect or disconnect and revoke access
- Multiple calendars per user with color and show/hide toggles
- Drag and drop to move events; drag edges to resize them
- Guests and email invitations with RSVP (yes/no/maybe)
- Calendar sharing by email with permission levels (view free/busy, view details, edit, manage)
- Tasks shown on the calendar
- Public holidays calendar (Tanzania built in)
- Settings: language, week start day, 12/24h clock, default view, working hours
- Dark mode

### Phase 3: Differentiators and market fit

- Swahili and English UI
- SMS and WhatsApp reminders
- Booking pages (appointment schedules) with availability rules, buffers and optional mobile-money payment (M-Pesa and similar)
- Islamic calendar and prayer-time overlays
- "Find a time" availability checker across guests
- PWA with offline viewing and sync

### Phase 4: Advanced

- Near-real-time sync of linked accounts through provider push notifications, plus more providers
- Video meeting links (Meet, Zoom)
- Team/organization calendars with roles; resource booking
- Comments and attachments on events
- Real-time updates (WebSockets)
- Public API and webhooks
- AI assistance: natural-language event creation, weekly summaries, auto-scheduling
- Audit logs, data export, admin controls

## 4. Functional requirements

IDs are stable references for tickets and tests. Priority: **M** = must, **S** = should, **C** = could.

| ID | Requirement | Phase | Priority |
| --- | --- | --- | --- |
| FR-01 | Anyone can open the app and use the calendar without registering (guest mode) | 1 | M |
| FR-02 | Guest data is stored locally in the browser and can be exported and imported as `.ics` | 1 | M |
| FR-03 | User can view events in month, week, day and agenda views | 1 | M |
| FR-04 | User can create, update and delete events | 1 | M |
| FR-05 | Events support all-day and time-ranged modes | 1 | M |
| FR-06 | Events are stored in UTC and rendered in the user's time zone | 1 | M |
| FR-07 | User can create recurring events using standard rules | 1 | M |
| FR-08 | Editing a recurring event offers this / following / all scopes | 1 | M |
| FR-09 | User receives browser notification reminders | 1 | M |
| FR-10 | User can search events by title | 1 | S |
| FR-11 | User can optionally sign up and log in (email, Google, Microsoft) | 2 | M |
| FR-12 | On first sign-in, local guest data is migrated to the account without loss or duplicates | 2 | M |
| FR-13 | Signed-in user can link multiple external accounts (Google, Microsoft, iCloud/CalDAV, iCal URL) | 2 | M |
| FR-14 | Events from linked accounts appear in one unified view with per-account colors | 2 | M |
| FR-15 | Each linked account supports read-only import; two-way sync can be enabled per account | 2 | M |
| FR-16 | User can link email accounts to send invitations and reminders from their own address | 2 | S |
| FR-17 | User can pause, reconnect or disconnect an account, revoking tokens and optionally removing its imported events | 2 | M |
| FR-18 | User can create multiple calendars and toggle their visibility | 2 | M |
| FR-19 | User can drag events to reschedule and resize them | 2 | S |
| FR-20 | User can invite guests; guests can RSVP | 2 | M |
| FR-21 | User can share a calendar with permission levels | 2 | M |
| FR-22 | System shows Tanzanian public holidays | 2 | S |
| FR-23 | UI is available in English and Swahili | 3 | S |
| FR-24 | Reminders can be sent by SMS or WhatsApp (signed-in users) | 3 | S |
| FR-25 | Users can publish a booking page and accept paid bookings | 3 | S |
| FR-26 | App is installable and works offline, syncing on reconnect | 3 | C |

## 5. Non-functional requirements

| Area | Requirement |
| --- | --- |
| Performance | Calendar view loads in under 2 seconds on a 3G-class connection; event queries limited to the visible date range |
| Availability | Target 99.5% uptime for MVP |
| Security | HTTPS only, hashed passwords (bcrypt/argon2), CSRF and XSS protection, rate limiting on auth and notification endpoints; OAuth tokens of linked accounts encrypted at rest and requested with least-privilege scopes |
| Privacy | Guest data stays in the browser unless the user signs in; users can export and delete their data; linked-account access can be revoked at any time; event data visible only to owner and permitted users |
| Accessibility | Keyboard navigable, sufficient color contrast, screen-reader labels (WCAG 2.1 AA as target) |
| Compatibility | Latest two versions of Chrome, Firefox, Safari, Edge; mobile browsers |
| Reliability | Reminders are delivered at most once per event instance and offset (idempotent jobs) |
| Maintainability | Automated tests for recurrence and time zone logic; CI on every pull request |

## 6. System architecture

### 6.1 High-level components

```
[Browser: React SPA]
   |-- Guest mode: local store (IndexedDB), browser notifications, .ics import/export
        |  HTTPS (REST/JSON), only after optional sign-in
[API: Spring Boot]
   |-- Auth module (optional sign-in: email, Google, Microsoft; JWT / sessions)
   |-- Calendar & Event module (CRUD, recurrence expansion)
   |-- Linked Accounts module (OAuth connections, encrypted token vault)
   |-- Sync engine (provider adapters, pull/push workers, webhooks, conflict handling)
   |-- Sharing & Invitation module
   |-- Reminder scheduler (queue + workers)
   |-- Notification module (email, push, SMS/WhatsApp)
   |-- Booking & Payment module (Phase 3)
        |
[PostgreSQL]    [Redis (optional: cache, rate limit, queues)]
        |
[External: Google Calendar API, Microsoft Graph, iCloud/CalDAV, email providers,
           SMS/WhatsApp gateway, M-Pesa gateway]
```

### 6.2 Recommended technology

| Layer | Choice | Notes |
| --- | --- | --- |
| Frontend | React with FullCalendar or `react-big-calendar` | Fastest path to views and drag-and-drop; custom grid is possible but slow to build; IndexedDB (for example via Dexie) for guest-mode storage |
| Backend | Spring Boot (Java) | Fits existing stack |
| Database | PostgreSQL (or Supabase) | Strong date/time types, JSONB, indexing |
| Recurrence | `ical4j` | RFC 5545 RRULE parsing and expansion |
| Background jobs | Spring Scheduler plus a queue (Redis or database-backed) | For reminders and invitations |
| Auth | Spring Security with JWT or session cookies; Google and Microsoft OAuth 2.0 (optional sign-in and account linking) |  |
| Hosting | Docker on a VPS or cloud platform | Add a CDN for static assets |

### 6.3 Key design decisions

1. **Store timestamps in UTC** with the event's original IANA time zone (for example `Africa/Dar_es_Salaam`) so recurring events keep their local time across daylight-saving changes.
2. **Store recurrence as an RRULE string** on the parent event; do not create a row per occurrence.
3. **Expand occurrences at query time** for the requested date range, then merge with stored exceptions.
4. **Store exceptions separately** (modified or cancelled single occurrences).
5. **Query by visible range only** (for example the current month plus a buffer), never load all events.
6. **Local-first:** the browser store and the server use the same event model and client-generated UUIDs, so guest data can move into an account unchanged.
7. **Provider adapters:** Google Calendar, Microsoft Graph and CalDAV sit behind one sync interface, so adding a provider does not change the rest of the app.
8. **Incremental sync:** use each provider's sync token or delta link, store the provider's event id and ETag, and never re-download whole calendars.
9. **Never store third-party passwords:** use OAuth where available and app-specific passwords for CalDAV, all encrypted at rest.

## 7. Data model

### 7.1 Entities

| Table | Purpose |
| --- | --- |
| `users` | Optional account: profile, locale, default time zone (guests have no row) |
| `calendars` | A calendar owned by a user (name, color, time zone, local or linked) |
| `calendar_shares` | Who has access to a calendar and at what level |
| `events` | Event or recurring series master, with source and external ids for linked events |
| `event_exceptions` | Overrides or cancellations for one occurrence of a series |
| `event_attendees` | Guests, RSVP status, invitation tokens |
| `reminders` | Reminder rules per event (offset, channel) |
| `reminder_jobs` | Scheduled deliveries with status, for idempotency |
| `tasks` | To-do items with optional due date |
| `linked_accounts` | A connected external account: provider, address, encrypted tokens, sync mode, status |
| `external_calendars` | A calendar found in a linked account, whether it is selected for sync, and its sync token |
| `sync_log` | One row per sync run: status, counts, errors |
| `booking_pages` | Public booking configuration (Phase 3) |
| `bookings` | A booked slot, payer details and payment status |

### 7.2 Core table: `events`

| Column | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| calendar\_id | UUID | FK to `calendars` |
| title | varchar(255) | Required |
| description | text | Optional |
| location | varchar(500) | Optional |
| start\_utc | timestamptz | Start instant |
| end\_utc | timestamptz | End instant |
| all\_day | boolean | If true, use date semantics |
| timezone | varchar(64) | IANA zone of the event |
| rrule | text | RFC 5545 rule, null if not recurring |
| recurrence\_end\_utc | timestamptz | Optional cap to speed up range queries |
| color | varchar(16) | Overrides calendar color |
| visibility | enum | default, private, public |
| status | enum | confirmed, tentative, cancelled |
| created\_by | UUID | FK to `users` |
| created\_at, updated\_at | timestamptz | Audit |

Indexes: `(calendar_id, start_utc)`, `(calendar_id, recurrence_end_utc)`, and a full-text index on `title`.

### 7.3 `event_exceptions`

| Column | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| event\_id | UUID | FK to the series master |
| original\_start\_utc | timestamptz | Which occurrence this overrides |
| is\_cancelled | boolean | True if this occurrence was deleted |
| override\_fields | jsonb | Changed title, time, location and so on |

### 7.4 Editing recurring events

| User choice | System behavior |
| --- | --- |
| This event only | Insert an exception for that occurrence |
| This and following | Add `UNTIL` to the original rule, create a new series from that date |
| All events | Update the master event and keep exceptions where valid |

### 7.5 Guest storage and migration

Guests use the same event model locally. The browser store (IndexedDB) holds calendars, events, exceptions, reminders and settings, keyed by client-generated UUIDs so records can be uploaded later without renaming. Guests are warned that clearing browser data deletes their calendar, and are offered a one-click `.ics` export.

### 7.6 Linked accounts and sync

Linked events are stored in the same `events` table with these extra columns:

| Column | Type | Notes |
| --- | --- | --- |
| source | enum | local, google, microsoft, caldav |
| linked\_account\_id | UUID | Null for local events |
| external\_calendar\_id | UUID | FK to `external_calendars` |
| external\_id | varchar(255) | The provider's event id |
| external\_etag | varchar(255) | The provider's version tag, used to detect conflicts |
| read\_only | boolean | True for one-way accounts or when the provider denies edits |

`linked_accounts`:

| Column | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| user\_id | UUID | FK to `users` |
| provider | enum | google, microsoft, icloud, caldav, ics\_url |
| account\_email | varchar(255) | Address of the connected account |
| access\_token\_enc, refresh\_token\_enc | bytea | Encrypted at rest |
| scopes | text | Scopes the user granted |
| sync\_mode | enum | read\_only, two\_way |
| status | enum | active, needs\_reauth, error, paused |
| last\_synced\_at | timestamptz | Last successful sync |

`external_calendars` holds `id`, `linked_account_id`, `external_id`, `name`, `color`, `selected` (boolean) and `sync_token` (the provider's incremental token).

## 8. API specification (REST, v1)

Base path: `/api/v1`. Guest mode makes no API calls. After sign-in, all endpoints require authentication except auth and public booking pages. Responses are JSON; dates are ISO 8601.

### 8.1 Auth (optional sign-in)

| Method | Path | Description |
| --- | --- | --- |
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Log in, returns token or sets cookie |
| POST | `/auth/logout` | End session |
| POST | `/auth/google` | Exchange Google token |
| POST | `/auth/forgot-password` | Send reset email |
| POST | `/auth/reset-password` | Complete reset |

### 8.1.1 Guest migration, linked accounts and sync

| Method | Path | Description |
| --- | --- | --- |
| POST | `/me/migrate-guest-data` | Upload local calendars and events after first sign-in (idempotent by client UUID) |
| GET | `/linked-accounts` | List connected accounts with sync status |
| POST | `/linked-accounts/{provider}/connect` | Start the OAuth flow (google, microsoft) |
| GET | `/linked-accounts/{provider}/callback` | OAuth callback |
| POST | `/linked-accounts/caldav` | Connect with a CalDAV URL and app password |
| POST | `/linked-accounts/ics` | Subscribe to a read-only iCal URL |
| PATCH | `/linked-accounts/{id}` | Choose calendars, colors and sync mode (read-only or two-way) |
| POST | `/linked-accounts/{id}/sync` | Trigger a manual sync |
| DELETE | `/linked-accounts/{id}` | Disconnect, revoke tokens, optionally remove imported events |
| POST | `/webhooks/{provider}` | Receive provider change notifications |

### 8.2 Calendars

| Method | Path | Description |
| --- | --- | --- |
| GET | `/calendars` | List calendars the user can access |
| POST | `/calendars` | Create calendar |
| PATCH | `/calendars/{id}` | Rename, recolor, change time zone |
| DELETE | `/calendars/{id}` | Delete calendar |
| POST | `/calendars/{id}/shares` | Share with a user |
| DELETE | `/calendars/{id}/shares/{userId}` | Remove access |

### 8.3 Events

| Method | Path | Description |
| --- | --- | --- |
| GET | `/events?from=&to=&calendarIds=` | Events and expanded occurrences in range |
| POST | `/events` | Create event |
| GET | `/events/{id}` | Event details |
| PATCH | `/events/{id}?scope=this\|following\|all&occurrence=` | Update with recurrence scope |
| DELETE | `/events/{id}?scope=this\|following\|all&occurrence=` | Delete with recurrence scope |
| POST | `/events/{id}/rsvp` | Guest responds |
| GET | `/events/search?q=` | Search by title |

### 8.4 Other

| Method | Path | Description |
| --- | --- | --- |
| GET/POST | `/tasks` | List and create tasks |
| GET/PUT | `/settings` | User settings (language, time zone, week start) |
| POST | `/import/ics` | Import iCalendar file |
| GET | `/calendars/{id}/export.ics` | Export calendar |
| GET | `/public/booking/{slug}/slots` | Available slots (Phase 3) |
| POST | `/public/booking/{slug}/book` | Create booking and start payment (Phase 3) |

### 8.5 Example: create event

```json
POST /api/v1/events
{
  "calendarId": "c1f4...",
  "title": "CTC Team weekly meeting",
  "start": "2026-11-23T14:00:00",
  "end": "2026-11-23T15:00:00",
  "timezone": "Africa/Dar_es_Salaam",
  "allDay": false,
  "rrule": "FREQ=WEEKLY;BYDAY=MO",
  "reminders": [{ "offsetMinutes": 10, "channel": "EMAIL" }]
}
```

### 8.6 Error format

```json
{ "status": 400, "code": "VALIDATION_ERROR", "message": "end must be after start", "fields": { "end": "must be after start" } }
```

## 9. User interface specification

### 9.1 Layout

- **Top bar:** menu toggle, Today, previous/next arrows, current period title, view switcher (Day, Week, Month, Agenda), search, settings, profile.
- **Left sidebar:** Create button, mini month calendar, "My calendars" and "Other calendars" with color checkboxes.
- **Main area:** the active calendar view.

Guests see a small Sign in to sync link in the top bar and a dismissible banner, never a blocking login screen. After sign-in the sidebar gains an Accounts section that lists linked accounts with their sync status (Active, Needs attention, Paused) and an Add account button.

### 9.2 Key interactions

- Click empty slot: quick-create popup with title, time and "More options".
- Click event: details popup with edit, delete, guests and reminders.
- Drag event: reschedule; drag bottom edge: change duration.
- Recurring edit or delete: scope dialog (this / following / all).
- Current-time red line in day and week views.

### 9.3 Responsive behavior

- Mobile: default to agenda or day view, collapsible sidebar, floating create button.
- Desktop: full layout with sidebar visible.

### 9.4 Keyboard shortcuts

| Key | Action |
| --- | --- |
| `c` | Create event |
| `t` | Go to today |
| `d` / `w` / `m` | Day / Week / Month view |
| `j` / `k` or arrows | Next / previous period |
| `/` | Focus search |
| `Esc` | Close dialog |

## 10. Key workflows

### 10.1 Reminder delivery

1. When an event or reminder is created or changed, compute the next trigger times (for recurring events, only the next N occurrences).
2. Write rows to `reminder_jobs` with status `PENDING`.
3. A scheduler polls for due jobs every minute and locks them to avoid duplicates.
4. The notification module sends via the chosen channel and marks the job `SENT` or `FAILED` with retry and backoff.
5. A nightly job extends the trigger window for recurring series.

### 10.2 Inviting guests

1. Organizer adds guest emails to an event.
2. System creates `event_attendees` rows and sends an email containing an `.ics` attachment and RSVP links.
3. Guest responds; status updates and the organizer is notified.
4. If the organizer changes time or location, guests are notified of the update.

### 10.3 Paid booking (Phase 3)

1. Visitor opens the public booking page and sees available slots (working hours minus existing events, respecting buffers).
2. Visitor selects a slot and enters details; the slot is held for a short period.
3. System initiates mobile-money payment and waits for the provider's callback.
4. On success: create the event on the owner's calendar, mark booking `CONFIRMED`, send confirmations. On failure or timeout: release the slot.

### 10.4 Guest to account migration

1. The guest uses the app; all data lives in the browser store.
2. The guest chooses Sign in; after authentication the app offers to keep their local calendars (the default).
3. The client uploads calendars and events using their client-generated UUIDs, so retrying never creates duplicates.
4. On confirmation the client marks the data as synced and keeps its local copy as a cache.
5. If the account already has data, records are merged and matching ids are skipped.

### 10.5 Connecting and syncing a linked account

1. A signed-in user taps Add account and picks a provider.
2. The user approves access on the provider's consent screen with minimal scopes (read first, write only when two-way sync is chosen); CalDAV uses a URL and app password.
3. The server stores the tokens encrypted, lists the account's calendars and the user picks which to show and the sync mode.
4. An initial import runs in the background (for example the last month and the next 12 months); later syncs use the provider's incremental token.
5. Changes are detected through provider webhooks where available, otherwise by polling every 5 to 15 minutes.
6. In two-way mode, local edits are pushed with an ETag check; on conflict the latest change wins and the user is notified.
7. If a token expires or access is revoked, the account is marked Needs attention and the user is asked to reconnect.

## 11. Security and privacy

- Hash passwords with bcrypt or argon2; never store plain text.
- Use short-lived access tokens with refresh tokens, or secure HttpOnly cookies with CSRF protection.
- Enforce authorization on every read and write: check calendar ownership or share permission server-side.
- Validate and sanitize all text fields (title, description, location) to prevent XSS.
- Rate limit login, password reset, invitation and booking endpoints.
- Use signed, expiring tokens for RSVP and booking links.
- Verify payment callbacks with signatures and make them idempotent.
- Provide account data export and deletion.
- Keep secrets out of the repository; use environment variables or a secret manager.

* Encrypt OAuth access and refresh tokens at rest, and request only the scopes each sync mode needs.
* Never store a user's password for another provider; CalDAV uses app-specific passwords, also encrypted.
* Let users disconnect and revoke access at any time; deleting an account removes all stored tokens.
* Guest data never leaves the browser until the user signs in and chooses to sync.

## 12. Testing strategy

| Level | Focus |
| --- | --- |
| Unit | Recurrence expansion, exception handling, time zone conversion, permission checks |
| Integration | API endpoints with a real PostgreSQL (for example Testcontainers) |
| End-to-end | Use the app as a guest, create event, edit recurring series, sign in and migrate data, link an account and sync, share calendar, receive reminder |
| Edge cases | Daylight-saving transitions (test with zones that use DST even if Tanzania does not), events crossing midnight, leap days, month-end repeats (the 31st), all-day events across zones, sync conflicts, duplicate events across linked accounts |
| Performance | Month view with thousands of events and many recurring series |

## 13. Deployment and operations

- Containerize frontend and backend with Docker; use `docker-compose` for local development.
- CI pipeline: lint, test, build, then deploy on merge to main.
- Environments: local, staging, production.
- Monitoring: application logs, error tracking, uptime checks, and alerts on failed reminder jobs.
- Database: daily backups with a tested restore procedure.

## 14. Delivery roadmap

| Milestone | Scope | Indicative duration |
| --- | --- | --- |
| M1 | Project setup, guest mode with local storage, event CRUD, month/week/day views, `.ics` import and export | 3 to 4 weeks |
| M2 | Time zones, recurrence with exceptions, browser reminders | 3 to 4 weeks |
| M3 | Optional sign-in, guest data migration, multiple calendars, email reminders | 3 to 4 weeks |
| M4 | Linked accounts: Google and Microsoft, read-only import then two-way sync | 4 to 6 weeks |
| M5 | Sharing, guests and RSVP, drag and drop, iCloud/CalDAV and iCal URLs | 4 to 5 weeks |
| M6 | Swahili UI, holidays, SMS/WhatsApp reminders, PWA | 3 to 4 weeks |
| M7 | Booking pages and mobile-money payments | 4 to 6 weeks |
| M8 | Public API, AI features, more providers | Ongoing |

Durations assume one to two developers and should be adjusted after M1.

## 15. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Recurrence and time zone bugs | Use `ical4j`, store IANA zones, write extensive tests early |
| Scope creep toward Google Calendar parity | Hold to the phase plan; ship each phase before starting the next |
| Reminder reliability | Idempotent jobs, retries, monitoring and alerts |
| SMS and payment provider costs and approvals | Start with email and push; add paid channels after validating demand |
| Slow networks | Range-limited queries, compressed assets, PWA caching |
| Guest data lost when browser data is cleared | Request persistent storage, remind guests to export `.ics`, nudge sign-in for backup |
| Provider approvals and limits (Google OAuth verification, Microsoft app registration, API quotas) | Start with read-only minimal scopes, apply for verification early, use incremental sync |
| Sync conflicts and duplicate events | Store external ids and ETags, deterministic merge, notify the user on conflict |
| Token leakage | Encrypt tokens, rotate keys, support revocation, audit access |

## 16. Glossary

| Term | Meaning |
| --- | --- |
| RRULE | The recurrence rule format defined in RFC 5545 (for example `FREQ=WEEKLY;BYDAY=MO`) |
| iCalendar (.ics) | Standard file format for exchanging calendar data |
| IANA time zone | Named zone such as `Africa/Dar_es_Salaam` |
| Occurrence | One instance of a recurring event |
| Exception | A changed or cancelled occurrence of a recurring series |
| PWA | Progressive Web App: a web app that can be installed and work offline |
| Guest mode | Using the app without an account; data is stored only in the browser |
| Linked account | An external account (Google, Microsoft, iCloud and so on) connected to sync calendars or send email |
| CalDAV | Open protocol for reading and writing calendars on a server |
| Sync token | A provider's marker that lets the app fetch only changes since the last sync |

## 17. Open questions

1. Clone or product with a differentiator (see 1.5)?
2. Which SMS/WhatsApp and mobile-money providers will be used first?
3. Will the app target individuals only at launch, or teams and organizations as well?
4. Is a free tier with paid plans planned (for example paid reminders or booking pages)?
5. Which providers come first for linked accounts: Google and Microsoft, then iCloud/CalDAV?
6. Should linked email accounts only send invitations and reminders, or also detect invitations in the inbox (which needs broader permissions)?
7. Should guests be able to move data between devices without signing in, for example with a file or a code?
