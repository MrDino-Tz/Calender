import React from 'react';
import { NavLink } from 'react-router-dom';
import Modal from '../components/Modal.jsx';
import { useTheme } from '../context.jsx';
import logoUrl from '../assets/images/logo-leaf.png';
import { PUBLIC_CALENDARS_CATALOG, getTanzaniaHolidays } from '../lib/publicCalendars.js';
import { GoogleIcon } from './Auth.jsx';

// ---------------------------------------------------------------------------
// Calendar — Google Calendar-style arrangement rendered with the template's
// Bootstrap/SCSS components (light/dark aware). Guest-mode prototype data is
// kept in local component state for now; it can be swapped for IndexedDB later.
// ---------------------------------------------------------------------------

const HOUR = 48;

const VIEWS = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'year', label: 'Year' },
  { id: 'agenda', label: 'Agenda' },
];

const VALID_VIEWS = VIEWS.map((v) => v.id);

const DEFAULT_CALENDARS = [
  { id: 'work', name: 'Work', color: '#1A73E8', visible: true, group: 'my' },
  { id: 'personal', name: 'Personal', color: '#188038', visible: true, group: 'my' },
  { id: 'family', name: 'Family', color: '#F9AB00', visible: true, group: 'my' },
  { id: 'tz-holidays', name: 'Holidays in Tanzania', color: '#0F9D58', visible: true, group: 'other', flag: '🇹🇿' },
];

// ---- date helpers ---------------------------------------------------------
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const addMonths = (d, n) => { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; };
const startOfWeek = (d) => { const x = startOfDay(d); const day = (x.getDay() + 6) % 7; return addDays(x, -day); };
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const atTime = (date, h, m = 0) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m, 0, 0);
const pad2 = (n) => String(n).padStart(2, '0');
const toDateInput = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const toTimeInput = (d) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
const parseDateInput = (s) => {
  const [y, m, d] = String(s || '').split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
};

const fmtTime = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const fmtLongDate = (d) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

function colorWithAlpha(hex, alpha) {
  if (!hex || !String(hex).startsWith('#')) return hex;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function monthDays(cursor) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

// Greedy overlap layout: events that overlap share the day column and are
// rendered side by side. Returns { [eventId]: { col, cols } }.
function layoutTimedEvents(events) {
  const sorted = [...events].sort((a, b) => a.start - b.start || b.end - a.end);
  const groups = [];
  let current = null;

  sorted.forEach((ev) => {
    if (!current || ev.start >= current.end) {
      current = { end: ev.end, events: [] };
      groups.push(current);
    } else if (ev.end > current.end) {
      current.end = ev.end;
    }
    current.events.push(ev);
  });

  const layout = new Map();
  groups.forEach((group) => {
    const colEnds = [];
    group.events.forEach((ev) => {
      let col = colEnds.findIndex((end) => ev.start >= end);
      if (col === -1) {
        col = colEnds.length;
        colEnds.push(ev.end);
      } else {
        colEnds[col] = ev.end;
      }
      layout.set(ev.id, { col, cols: 0 });
    });
    const total = colEnds.length;
    group.events.forEach((ev) => { layout.get(ev.id).cols = total; });
  });

  return layout;
}

function makeSeedEvents() {
  const today = startOfDay(new Date());
  const day = (offset) => addDays(today, offset);
  const ev = (id, title, startDay, sh, sm, eh, em, calendarId, extra = {}) => ({
    id,
    title,
    calendarId,
    start: atTime(startDay, sh, sm),
    end: atTime(startDay, eh, em),
    ...extra,
  });

  const tzHolidays = [
    ...getTanzaniaHolidays(today.getFullYear() - 1),
    ...getTanzaniaHolidays(today.getFullYear()),
    ...getTanzaniaHolidays(today.getFullYear() + 1),
  ];

  return [
    ...tzHolidays,
    ev('e1', 'Team stand-up', day(0), 9, 0, 9, 30, 'work', { location: 'Google Meet' }),
    ev('e2', 'Design review', day(0), 11, 0, 12, 0, 'work'),
    ev('e12', 'Product sync', day(0), 11, 30, 12, 30, 'personal'),
    ev('e3', '1:1 with Amina', day(0), 14, 0, 14, 45, 'personal'),
    ev('e4', 'Client call', day(1), 10, 0, 11, 0, 'work', { location: 'Zoom' }),
    ev('e5', 'Lunch with team', day(1), 13, 0, 14, 0, 'personal'),
    ev('e6', 'Gym', day(2), 17, 0, 18, 0, 'personal'),
    ev('e8', 'Sprint planning', day(4), 9, 30, 11, 0, 'work'),
    ev('e9', 'Family lunch', day(5), 12, 0, 13, 30, 'family'),
    ev('e10', 'Project retro', day(-2), 15, 0, 16, 0, 'work'),
    ev('e11', 'Dentist', day(-5), 10, 0, 11, 0, 'personal'),
  ];
}


// ---- mini month -----------------------------------------------------------
function MiniMonth({ cursor, onSelect, onChangeMonth, eventsForDay, calFor }) {
  const days = React.useMemo(() => monthDays(cursor), [cursor]);
  const today = new Date();
  return (
    <div className="cal-mini">
      <div className="cal-mini-head">
        <div className="cal-mini-title">{cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
        <div className="cal-mini-nav">
          <button type="button" onClick={() => onChangeMonth(-1)} title="Previous month"><i className="ti ti-chevron-left"></i></button>
          <button type="button" onClick={() => onChangeMonth(1)} title="Next month"><i className="ti ti-chevron-right"></i></button>
        </div>
      </div>
      <div className="cal-mini-weekdays">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="cal-mini-grid">
        {days.map((day) => {
          const list = eventsForDay ? eventsForDay(day) : [];
          const colors = [];
          for (const ev of list) {
            const cal = calFor ? calFor(ev.calendarId) : null;
            if (cal?.color && !colors.includes(cal.color)) {
              colors.push(cal.color);
            }
            if (colors.length >= 3) break;
          }
          const isToday = sameDay(day, today);
          const isSelected = sameDay(day, cursor) && !isToday;
          return (
            <button
              key={day.toISOString()}
              type="button"
              className={`${day.getMonth() !== cursor.getMonth() ? 'other' : ''}${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`.trim()}
              onClick={() => onSelect(day)}
            >
              <span className="cal-mini-num">{day.getDate()}</span>
              <span className="cal-mini-dots">
                {colors.map((c, idx) => (
                  <span
                    key={idx}
                    className="cal-mini-dot"
                    style={{ background: isToday ? '#ffffff' : c }}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- month view -----------------------------------------------------------
function MonthView({ cursor, now, eventsForDay, calFor, onOpenEvent, onCreate }) {
  const days = React.useMemo(() => monthDays(cursor), [cursor]);
  return (
    <div className="cal-month">
      <div className="cal-month-head">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="cal-month-grid">
        {days.map((day) => {
          const list = eventsForDay(day);
          const isMonth = day.getMonth() === cursor.getMonth();
          return (
            <div
              key={day.toISOString()}
              className={`cal-day-cell${isMonth ? '' : ' other'}${sameDay(day, now) ? ' today' : ''}`}
              onClick={() => onCreate(day)}
            >
              <span className="cal-day-num">{day.getDate()}</span>
              {list.slice(0, 3).map((ev) => {
                const cal = calFor(ev.calendarId);
                return (
                  <button
                    key={ev.id}
                    type="button"
                    className="cal-chip"
                    onClick={(e) => { e.stopPropagation(); onOpenEvent(ev); }}
                  >
                    <span className="cal-chip-dot" style={{ background: cal.color }}></span>
                    <span className="cal-chip-title">{ev.title}</span>
                    {!ev.allDay ? <span className="cal-chip-time">{fmtTime(ev.start)}</span> : null}
                  </button>
                );
              })}
              {list.length > 3 ? (
                <button type="button" className="cal-more" onClick={(e) => { e.stopPropagation(); onCreate(day); }}>
                  +{list.length - 3} more
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- week / day time grid -------------------------------------------------
function TimeView({ days, now, eventsForDay, calFor, onOpenEvent, onCreate, isDay }) {
  const scrollRef = React.useRef(null);
  const isToday = days.some((d) => sameDay(d, now));
  const nowTop = ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR;

  React.useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = Math.max(0, (now.getHours() - 1)) * HOUR;
  }, [days[0].toDateString(), now.getHours()]);

  const allDayFor = (day) => eventsForDay(day).filter((e) => e.allDay);
  const timedFor = (day) => eventsForDay(day).filter((e) => !e.allDay);

  return (
    <div className={`cal-week${isDay ? ' is-day' : ''}`}>
      <div className="cal-week-head">
        <div className="cal-week-gutter">{Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop()}</div>
        {days.map((day) => (
          <div key={day.toISOString()} className={`cal-week-day${sameDay(day, now) ? ' today' : ''}`}>
            <div className="dow">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className="dom">{day.getDate()}</div>
          </div>
        ))}
      </div>

      <div className="cal-allday">
        <div className="cal-allday-label">all-day</div>
        {days.map((day) => (
          <div key={day.toISOString()} className="cal-allday-cell">
            {allDayFor(day).map((ev) => {
              const cal = calFor(ev.calendarId);
              return (
                <button
                  key={ev.id}
                  type="button"
                  className="cal-allday-chip"
                  style={{ background: colorWithAlpha(cal.color, 0.18), borderLeft: `3px solid ${cal.color}` }}
                  onClick={() => onOpenEvent(ev)}
                >
                  {ev.title}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="cal-time-scroll" ref={scrollRef}>
        <div className="cal-time-inner" style={{ height: 24 * HOUR }}>
          <div className="cal-time-gutter">
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="cal-hour-label" style={{ top: h * HOUR }}>
                {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
              </div>
            ))}
          </div>
          <div className={`cal-time-cols ${isDay ? 'day' : 'week'}`}>
            {days.map((day) => {
              const dayToday = sameDay(day, now);
              const dayEvents = timedFor(day);
              const layout = layoutTimedEvents(dayEvents);
              return (
                <div
                  key={day.toISOString()}
                  className={`cal-time-col${dayToday ? ' today' : ''}`}
                  onClick={() => onCreate(day)}
                >
                  {Array.from({ length: 24 }, (_, h) => (
                    <React.Fragment key={h}>
                      <div className="cal-hour-line" style={{ top: h * HOUR }} />
                      <div className="cal-half-line" style={{ top: h * HOUR + HOUR / 2 }} />
                    </React.Fragment>
                  ))}
                  {dayEvents.map((ev) => {
                    const dayStart = startOfDay(day);
                    const startMin = Math.max(0, (ev.start - dayStart) / 60000);
                    const endMin = Math.min(24 * 60, (ev.end - dayStart) / 60000);
                    const top = (startMin / 60) * HOUR;
                    const height = Math.max(18, ((endMin - startMin) / 60) * HOUR);
                    const cal = calFor(ev.calendarId);
                    const { col = 0, cols = 1 } = layout.get(ev.id) || {};
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        className={`cal-time-event${height < 34 ? ' compact' : ''}`}
                        style={{
                          top,
                          height,
                          '--cal-event-left': `calc(${(100 / cols) * col}% + 2px)`,
                          '--cal-event-width': `calc(${100 / cols}% - 4px)`,
                          '--cal-event-color': cal.color,
                          '--cal-event-bg': colorWithAlpha(cal.color, 0.14),
                        }}
                        onClick={(e) => { e.stopPropagation(); onOpenEvent(ev); }}
                      >
                        <div className="te-title">{ev.title}</div>
                        <div className="te-time">{fmtTime(ev.start)} – {fmtTime(ev.end)}</div>
                      </button>
                    );
                  })}
                  {dayToday && isToday ? <div className="cal-now-line" style={{ top: nowTop }} /> : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- agenda ---------------------------------------------------------------
// ---------------------------------------------------------------------------
// YearView — 4×3 grid of mini month calendars for the selected year
// ---------------------------------------------------------------------------
const YEAR_WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function YearMiniMonth({ year, month, now, eventsForDay, calFor, onSelectDay, onSelectMonth }) {
  const firstDay = new Date(year, month, 1);
  // Monday-based: 0=Mon…6=Sun
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Build cell array: nulls for padding + day numbers
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="cal-year-month">
      <div
        className="cal-year-month-heading"
        role="button"
        tabIndex={0}
        onClick={() => onSelectMonth(month)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectMonth(month); }}
      >
        {MONTH_NAMES[month]}
      </div>
      <div className="cal-year-grid">
        {YEAR_WEEKDAYS.map((wd, i) => (
          <div key={i} className="cal-year-weekday">{wd}</div>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <div key={`pad-${idx}`} />;
          const date = new Date(year, month, day);
          const isToday = sameDay(date, now);
          const dayEvents = eventsForDay(date);
          const dots = dayEvents.slice(0, 3).map((ev) => calFor(ev.calendarId));
          return (
            <button
              key={day}
              type="button"
              className={`cal-year-day${isToday ? ' today' : ''}${dayEvents.length ? ' has-events' : ''}`}
              onClick={() => onSelectDay(date)}
              title={date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            >
              <span className="cal-year-day-num">{day}</span>
              {dots.length > 0 && (
                <span className="cal-year-dots">
                  {dots.map((cal, di) => (
                    <span key={di} className="cal-year-dot" style={{ background: cal.color }} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function YearView({ cursor, now, eventsForDay, calFor, onSelectDay, onSelectMonth, onNavigateYear, onSetYear }) {
  const year = cursor.getFullYear();
  const handleWheel = (e) => {
    e.preventDefault();
    const dir = e.deltaY > 0 ? 1 : -1;
    onNavigateYear(dir);
  };
  const handleHeaderClick = () => {
    const input = window.prompt('Enter year to view:', year);
    const y = Number(input);
    if (!isNaN(y)) onSetYear(y);
  };
  const [menuPos, setMenuPos] = React.useState(null);
  const handleHeaderContext = (e) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
  };
  const closeMenu = () => setMenuPos(null);
  const goToCurrent = () => {
    onSetYear(new Date().getFullYear());
    closeMenu();
  };
  const goToPrompt = () => {
    handleHeaderClick();
    closeMenu();
  };
  return (
    <div className="cal-year" onWheel={handleWheel}>
      <div className="cal-year-header" onClick={handleHeaderClick} onContextMenu={handleHeaderContext} role="button" tabIndex={0}>
        <div>Today</div>
        <div>{year}</div>
      </div>
      {menuPos && (
        <div className="year-context-menu" style={{ position: 'fixed', top: menuPos.y, left: menuPos.x, background: 'var(--cal-surface)', border: '1px solid var(--cal-border)', zIndex: 1000 }} onMouseLeave={closeMenu}>
          <button type="button" className="year-menu-item" onClick={goToCurrent}>Current year</button>
          <button type="button" className="year-menu-item" onClick={goToPrompt}>Jump to…</button>
        </div>
      )}
      {Array.from({ length: 12 }, (_, m) => (
        <YearMiniMonth
          key={m}
          year={year}
          month={m}
          now={now}
          eventsForDay={eventsForDay}
          calFor={calFor}
          onSelectDay={onSelectDay}
          onSelectMonth={onSelectMonth}
        />
      ))}
    </div>
  );
}



// ---------------------------------------------------------------------------
function AgendaView({ events, calFor, onOpenEvent }) {
  const groups = React.useMemo(() => {
    const today = startOfDay(new Date());
    const limit = addDays(today, 60);
    const upcoming = events
      .filter((e) => e.end > today && e.start < limit)
      .sort((a, b) => a.start - b.start);
    const map = new Map();
    upcoming.forEach((e) => {
      const key = startOfDay(e.start).toISOString();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    });
    return Array.from(map.entries());
  }, [events]);

  if (!groups.length) return <div className="cal-empty">No upcoming events.</div>;

  return (
    <div className="cal-agenda">
      {groups.map(([key, list]) => {
        const date = new Date(key);
        return (
          <div className="cal-agenda-day" key={key}>
            <div className="cal-agenda-date">
              {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              <span>{date.getFullYear()}</span>
            </div>
            {list.map((ev) => {
              const cal = calFor(ev.calendarId);
              return (
                <button key={ev.id} type="button" className="cal-agenda-event" onClick={() => onOpenEvent(ev)}>
                  <span className="ae-dot" style={{ background: cal.color }} />
                  <span className="ae-time">{ev.allDay ? 'All day' : `${fmtTime(ev.start)} – ${fmtTime(ev.end)}`}</span>
                  <span>
                    <span className="ae-title">{ev.title}</span>
                    {ev.location ? <span className="ae-meta d-block">{ev.location}</span> : null}
                  </span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
export default function Calendar() {
  const { theme, toggle: toggleTheme } = useTheme();
  const [view, setView] = React.useState(() => {
    if (typeof window === 'undefined') return 'month';
    const requested = new URLSearchParams(window.location.search).get('view');
    if (VALID_VIEWS.includes(requested)) return requested;
    return window.innerWidth < 640 ? 'day' : 'month';
  });
  const [cursor, setCursor] = React.useState(() => new Date());
  const [sidebarOpen, setSidebarOpen] = React.useState(() => (typeof window === 'undefined' ? true : window.innerWidth > 991));
  const [calendars, setCalendars] = React.useState(DEFAULT_CALENDARS);
  const [events, setEvents] = React.useState(makeSeedEvents);
  const [draft, setDraft] = React.useState(null);
  const [selected, setSelected] = React.useState(null);
  const [now, setNow] = React.useState(() => new Date());
  const [addCalOpen, setAddCalOpen] = React.useState(false);
  const [newCalName, setNewCalName] = React.useState('');
  const [newCalColor, setNewCalColor] = React.useState('#1A73E8');
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [displayName, setDisplayName] = React.useState(() => {
    try { return localStorage.getItem('cal.displayName') || 'Anonymous'; } catch (e) { return 'Anonymous'; }
  });
  const [calLanguage, setCalLanguage] = React.useState(() => {
    try { return localStorage.getItem('cal.lang') || 'EN'; } catch (e) { return 'EN'; }
  });
  const [timeFormat, setTimeFormat] = React.useState(() => {
    try { return localStorage.getItem('cal.timeFormat') || '12h'; } catch (e) { return '12h'; }
  });

  const [authOpen, setAuthOpen] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    const p = new URLSearchParams(window.location.search);
    return p.get('signin') === '1' || p.get('signin') === 'true' || p.get('signup') === '1' || p.get('signup') === 'true';
  });
  const [authMode, setAuthMode] = React.useState(() => {
    if (typeof window === 'undefined') return 'signin';
    const p = new URLSearchParams(window.location.search);
    return (p.get('signup') === '1' || p.get('signup') === 'true') ? 'signup' : 'signin';
  });
  const [authEmail, setAuthEmail] = React.useState('');
  const [authPassword, setAuthPassword] = React.useState('');
  const [authName, setAuthName] = React.useState('');
  const [authRemember, setAuthRemember] = React.useState(true);
  const [authSuccessMsg, setAuthSuccessMsg] = React.useState('');

  const [isSignedIn, setIsSignedIn] = React.useState(() => {
    try { return localStorage.getItem('cal.signedIn') === 'true'; } catch (e) { return false; }
  });
  const [userEmail, setUserEmail] = React.useState(() => {
    try { return localStorage.getItem('cal.userEmail') || ''; } catch (e) { return ''; }
  });
  const [authProvider, setAuthProvider] = React.useState(() => {
    try { return localStorage.getItem('cal.authProvider') || ''; } catch (e) { return ''; }
  });

  const [googleNotice, setGoogleNotice] = React.useState(false);

  const handleGoogleSignIn = () => {
    setGoogleNotice(true);
    setTimeout(() => setGoogleNotice(false), 5000);
  };

  const handleEmailAuth = (e) => {
    e.preventDefault();
    const nameToUse = authName.trim() || authEmail.split('@')[0] || 'User';
    setIsSignedIn(true);
    setAuthProvider('email');
    setUserEmail(authEmail);
    saveDisplayName(nameToUse);
    try {
      localStorage.setItem('cal.signedIn', 'true');
      localStorage.setItem('cal.authProvider', 'email');
      localStorage.setItem('cal.userEmail', authEmail);
    } catch (e) { /* ignore */ }
    setAuthSuccessMsg(authMode === 'signin' ? 'Signed in successfully! Calendar sync active.' : 'Account created and synced!');
    setTimeout(() => {
      setAuthOpen(false);
      setAuthSuccessMsg('');
    }, 1000);
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    setAuthProvider('');
    setUserEmail('');
    saveDisplayName('Anonymous');
    try {
      localStorage.removeItem('cal.signedIn');
      localStorage.removeItem('cal.authProvider');
      localStorage.removeItem('cal.userEmail');
      localStorage.setItem('cal.displayName', 'Anonymous');
    } catch (e) { /* ignore */ }
    setProfileOpen(false);
  };

  const saveDisplayName = (val) => {
    setDisplayName(val);
    try { localStorage.setItem('cal.displayName', val); } catch (e) { /* ignore */ }
  };

  const saveCalLanguage = (val) => {
    setCalLanguage(val);
    try { localStorage.setItem('cal.lang', val); } catch (e) { /* ignore */ }
  };

  const saveTimeFormat = (val) => {
    setTimeFormat(val);
    try { localStorage.setItem('cal.timeFormat', val); } catch (e) { /* ignore */ }
  };

  const exportCalendarData = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: { name: displayName, mode: 'guest' },
      calendars,
      events,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendar-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllEvents = () => {
    if (window.confirm('Are you sure you want to clear all custom events? (Tanzania holidays will remain).')) {
      const today = new Date();
      const tzEvents = [
        ...getTanzaniaHolidays(today.getFullYear() - 1),
        ...getTanzaniaHolidays(today.getFullYear()),
        ...getTanzaniaHolidays(today.getFullYear() + 1),
      ];
      setEvents(tzEvents);
      setSettingsOpen(false);
    }
  };

  const myCalendars = calendars.filter((c) => c.group !== 'other');
  const otherCalendars = calendars.filter((c) => c.group === 'other');
  const [catalogCategory, setCatalogCategory] = React.useState('All');

  const filteredCatalog = React.useMemo(() => {
    if (catalogCategory === 'All') return PUBLIC_CALENDARS_CATALOG;
    return PUBLIC_CALENDARS_CATALOG.filter((c) => c.category === catalogCategory);
  }, [catalogCategory]);

  const toggleSubscribePublicCalendar = (item) => {
    const existing = calendars.find((c) => c.id === item.id);
    if (existing) {
      setCalendars((prev) => prev.map((c) => (c.id === item.id ? { ...c, visible: !c.visible } : c)));
    } else {
      const today = new Date();
      const years = [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1];
      const newEvents = item.getEvents(years);
      setCalendars((prev) => [
        ...prev,
        {
          id: item.id,
          name: item.name,
          color: item.color,
          visible: true,
          group: 'other',
          flag: item.flag,
        },
      ]);
      setEvents((prev) => [...prev.filter((e) => e.calendarId !== item.id), ...newEvents]);
    }
  };

  const removePublicCalendar = (calendarId) => {
    setCalendars((prev) => prev.filter((c) => c.id !== calendarId));
    setEvents((prev) => prev.filter((e) => e.calendarId !== calendarId));
  };

  const createCustomCalendar = () => {
    if (!newCalName.trim()) return;
    const newId = 'cal-' + Date.now().toString(36);
    setCalendars((prev) => [
      ...prev,
      { id: newId, name: newCalName.trim(), color: newCalColor, visible: true, group: 'other' },
    ]);
    setNewCalName('');
    setAddCalOpen(false);
  };

  React.useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(id);
  }, []);

  const visibleEvents = React.useMemo(() => {
    const visible = new Set(calendars.filter((c) => c.visible).map((c) => c.id));
    return events.filter((e) => visible.has(e.calendarId));
  }, [events, calendars]);

  const calFor = React.useCallback(
    (id) => calendars.find((c) => c.id === id) || { name: 'Calendar', color: '#1A73E8' },
    [calendars],
  );

  const eventsForDay = React.useCallback((day) => {
    const dayStart = startOfDay(day);
    const dayEnd = addDays(dayStart, 1);
    return visibleEvents
      .filter((e) => e.start < dayEnd && e.end > dayStart)
      .sort((a, b) => {
        if (!!a.allDay !== !!b.allDay) return a.allDay ? -1 : 1;
        return a.start - b.start;
      });
  }, [visibleEvents]);

  const openCreate = React.useCallback((day = new Date()) => {
    setSelected(null);
    setDraft({
      date: toDateInput(day),
      start: '09:00',
      end: '10:00',
      title: '',
      calendarId: calendars.find((c) => c.visible && c.group !== 'other')?.id || calendars.find((c) => c.visible)?.id || calendars[0]?.id || 'work',
      allDay: false,
      location: '',
      description: '',
    });
  }, [calendars]);

  const openEdit = (event) => {
    setSelected(null);
    setDraft({
      id: event.id,
      date: toDateInput(event.start),
      start: toTimeInput(event.start),
      end: toTimeInput(event.end),
      title: event.title,
      calendarId: event.calendarId,
      allDay: !!event.allDay,
      location: event.location || '',
      description: event.description || '',
    });
  };

  const saveDraft = () => {
    if (!draft) return;
    const day = parseDateInput(draft.date);
    let start;
    let end;
    if (draft.allDay) {
      start = startOfDay(day);
      end = addDays(start, 1);
    } else {
      const [sh, sm] = draft.start.split(':').map(Number);
      const [eh, em] = draft.end.split(':').map(Number);
      start = atTime(day, sh, sm);
      end = atTime(day, eh, em);
      if (end <= start) end = new Date(start.getTime() + 60 * 60000);
    }
    const event = {
      id: draft.id || (window.crypto?.randomUUID?.() || String(Date.now())),
      title: draft.title.trim() || 'Untitled event',
      calendarId: draft.calendarId,
      start,
      end,
      allDay: !!draft.allDay,
      location: draft.location.trim(),
      description: draft.description.trim(),
    };
    setEvents((prev) => (draft.id ? prev.map((e) => (e.id === draft.id ? event : e)) : [...prev, event]));
    setDraft(null);
  };

  const deleteSelected = () => {
    if (!selected) return;
    setEvents((prev) => prev.filter((e) => e.id !== selected.id));
    setSelected(null);
  };

  const toggleCalendar = (id) => {
    setCalendars((prev) => prev.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c)));
  };

  const navigate = (dir) => {
    setCursor((c) => {
      if (view === 'week') return addDays(c, dir * 7);
      if (view === 'day') return addDays(c, dir);
      if (view === 'year') return new Date(c.getFullYear() + dir, c.getMonth(), 1);
      return addMonths(c, dir);
    });
  };

  const periodLabel = () => {
    if (view === 'month') return cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (view === 'week') {
      const start = startOfWeek(cursor);
      const end = addDays(start, 6);
      if (start.getMonth() === end.getMonth()) {
        return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
      }
      return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()} – ${end.toLocaleDateString('en-US', { month: 'short' })} ${end.getDate()}, ${end.getFullYear()}`;
    }
    if (view === 'day') return cursor.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (view === 'year') return String(cursor.getFullYear());
    return 'Agenda';
  };

  React.useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable) return;
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); openCreate(cursor); }
      else if (e.key === 't') { e.preventDefault(); setCursor(new Date()); }
      else if (e.key === 'd') setView('day');
      else if (e.key === 'w') setView('week');
      else if (e.key === 'm') setView('month');
      else if (e.key === 'y') setView('year');
      else if (e.key === 'a') setView('agenda');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cursor, openCreate]);

  const weekStart = startOfWeek(cursor);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="cal-app">
      <header className="cal-topbar">
        <button type="button" className="cal-menu-btn" onClick={() => setSidebarOpen((v) => !v)} title="Main menu">
          <i className="ti ti-menu-2"></i>
        </button>
        <NavLink to="/calendar" className="cal-brand">
          <img src={logoUrl} alt="" />
          <span>Calendar</span>
        </NavLink>

        <div className="cal-nav">
          <button type="button" className="cal-today-btn" onClick={() => setCursor(new Date())}>Today</button>
          <button type="button" className="cal-icon-btn" onClick={() => navigate(-1)} title="Previous period"><i className="ti ti-chevron-left"></i></button>
          <button type="button" className="cal-icon-btn" onClick={() => navigate(1)} title="Next period"><i className="ti ti-chevron-right"></i></button>
          <div className="cal-period">{periodLabel()}</div>
        </div>

        <div className="cal-topbar-right">
          <div className="cal-view-switch" role="group" aria-label="Calendar view">
            {VIEWS.map((v) => (
              <button key={v.id} type="button" className={view === v.id ? 'active' : ''} onClick={() => setView(v.id)}>
                {v.label}
              </button>
            ))}
          </div>
          <button type="button" className="cal-icon-btn" title="Light / dark theme" onClick={toggleTheme}>
            <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'}`}></i>
          </button>
          <button type="button" className="cal-icon-btn" title="Search"><i className="ti ti-search"></i></button>
          <button type="button" className="cal-icon-btn" title="Settings" onClick={() => setSettingsOpen(true)}>
            <i className="ti ti-settings"></i>
          </button>
          <button
            type="button"
            className="cal-profile-btn"
            title={isSignedIn ? `Profile (${displayName})` : 'Profile (Anonymous)'}
            onClick={() => setProfileOpen(true)}
          >
            <span className="cal-avatar" style={isSignedIn ? { background: 'var(--cal-accent)', color: '#fff' } : {}}>
              <i className="ti ti-user" style={{ fontSize: 14 }}></i>
            </span>
            <span className="d-none d-sm-inline fw-semibold text-truncate" style={{ maxWidth: 100 }}>
              {displayName || (isSignedIn ? 'User' : 'Anonymous')}
            </span>
          </button>
        </div>
      </header>

      <div className="cal-subbar">{periodLabel()}</div>

      <div className="cal-body">
        {sidebarOpen ? <div className="cal-sidebar-backdrop d-lg-none" onClick={() => setSidebarOpen(false)} /> : null}

        <aside className={`cal-sidebar${sidebarOpen ? ' open' : ''}`}>
          <button type="button" className="cal-create" onClick={() => openCreate(cursor)}>
            <i className="ti ti-plus"></i>
            <span>Create</span>
          </button>

          <div className="cal-side-views">
            <div className="cal-side-heading">View</div>
            <div className="btn-group w-100" role="group" aria-label="Calendar view">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={`btn btn-sm ${view === v.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => { setView(v.id); setSidebarOpen(false); }}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <MiniMonth
            cursor={cursor}
            onSelect={(d) => setCursor(d)}
            onChangeMonth={(dir) => setCursor((c) => addMonths(c, dir))}
            eventsForDay={eventsForDay}
            calFor={calFor}
          />

          <div className="cal-side-section">
            <div className="cal-side-heading">My calendars</div>
            <ul className="cal-cal-list">
              {myCalendars.map((cal) => (
                <li
                  key={cal.id}
                  className={`cal-cal-row${cal.visible ? ' is-on' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={cal.visible}
                  onClick={() => toggleCalendar(cal.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCalendar(cal.id); }
                  }}
                >
                  <span className="cal-cal-check" style={{ borderColor: cal.color, background: cal.visible ? cal.color : 'transparent' }}>
                    {cal.visible ? <i className="ti ti-check"></i> : null}
                  </span>
                  <span className="cal-cal-name">{cal.flag ? `${cal.flag} ` : ''}{cal.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="cal-side-section">
            <div className="cal-side-heading">Other calendars</div>
            <ul className="cal-cal-list">
              {otherCalendars.map((cal) => (
                <li
                  key={cal.id}
                  className={`cal-cal-row${cal.visible ? ' is-on' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={cal.visible}
                  onClick={() => toggleCalendar(cal.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCalendar(cal.id); }
                  }}
                >
                  <span className="cal-cal-check" style={{ borderColor: cal.color, background: cal.visible ? cal.color : 'transparent' }}>
                    {cal.visible ? <i className="ti ti-check"></i> : null}
                  </span>
                  <span className="cal-cal-name">{cal.flag ? `${cal.flag} ` : ''}{cal.name}</span>
                </li>
              ))}
              <li
                className="cal-cal-row"
                role="button"
                tabIndex={0}
                onClick={() => setAddCalOpen(true)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setAddCalOpen(true); } }}
              >
                <span className="cal-cal-check" style={{ borderColor: 'var(--cal-text-muted)' }}><i className="ti ti-plus" style={{ fontSize: 9 }}></i></span>
                <span className="cal-cal-name">Add calendar</span>
              </li>
            </ul>
          </div>

          <div className="cal-side-footer">
            {isSignedIn ? (
              <button
                type="button"
                className="cal-side-sync-btn text-success"
                onClick={() => setProfileOpen(true)}
                title="Calendar cloud sync active"
              >
                <i className="ti ti-cloud-check"></i>
                <span className="text-truncate">Synced: {displayName || 'Account'}</span>
              </button>
            ) : (
              <button
                type="button"
                className="cal-side-sync-btn"
                onClick={() => { setAuthMode('signin'); setAuthOpen(true); }}
                title="Sign in to sync"
              >
                <i className="ti ti-cloud"></i>
                <span>Sign in to sync</span>
              </button>
            )}
            <button type="button" onClick={() => setView('agenda')}><i className="ti ti-list"></i><span>Agenda</span></button>
          </div>
        </aside>

        <main className="cal-main">
          {view === 'month' ? (
            <MonthView
              cursor={cursor}
              now={now}
              eventsForDay={eventsForDay}
              calFor={calFor}
              onOpenEvent={setSelected}
              onCreate={openCreate}
            />
          ) : null}
          {view === 'week' ? (
            <TimeView
              days={weekDays}
              now={now}
              eventsForDay={eventsForDay}
              calFor={calFor}
              onOpenEvent={setSelected}
              onCreate={openCreate}
              isDay={false}
            />
          ) : null}
          {view === 'day' ? (
            <TimeView
              days={[startOfDay(cursor)]}
              now={now}
              eventsForDay={eventsForDay}
              calFor={calFor}
              onOpenEvent={setSelected}
              onCreate={openCreate}
              isDay
            />
          ) : null}
          {view === 'agenda' ? (
            <AgendaView events={visibleEvents} calFor={calFor} onOpenEvent={setSelected} />
          ) : null}
          {view === 'year' ? (
            <YearView
              cursor={cursor}
              now={now}
              eventsForDay={eventsForDay}
              calFor={calFor}
              onSelectDay={(d) => { setCursor(d); setView('month'); }}
              onSelectMonth={(m) => { setCursor(new Date(cursor.getFullYear(), m, 1)); setView('month'); }}
              onNavigateYear={navigate}
              onSetYear={(y) => setCursor(new Date(y, cursor.getMonth(), cursor.getDate()))}
            />
          ) : null}
        </main>

        <button type="button" className="cal-fab" onClick={() => openCreate(cursor)} title="Create event">
          <i className="ti ti-plus" style={{ fontSize: 24 }}></i>
        </button>
      </div>

      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'Edit event' : 'New event'}
        footer={(
          <React.Fragment>
            <button type="button" className="btn btn-light" onClick={() => setDraft(null)}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={saveDraft}>Save</button>
          </React.Fragment>
        )}
      >
        {draft ? (
          <div className="text-start">
            <label className="form-label" htmlFor="cal-title">Title</label>
            <input
              id="cal-title"
              className="form-control mb-3"
              autoFocus
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Add title"
            />

            <div className="row g-3 mb-3">
              <div className="col-12">
                <label className="form-label" htmlFor="cal-date">Date</label>
                <input
                  id="cal-date"
                  type="date"
                  className="form-control"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                />
              </div>
              {!draft.allDay ? (
                <React.Fragment>
                  <div className="col-6">
                    <label className="form-label" htmlFor="cal-start">Starts</label>
                    <input
                      id="cal-start"
                      type="time"
                      className="form-control"
                      value={draft.start}
                      onChange={(e) => setDraft({ ...draft, start: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label" htmlFor="cal-end">Ends</label>
                    <input
                      id="cal-end"
                      type="time"
                      className="form-control"
                      value={draft.end}
                      onChange={(e) => setDraft({ ...draft, end: e.target.value })}
                    />
                  </div>
                </React.Fragment>
              ) : null}
            </div>

            <div className="form-check mb-3">
              <input
                id="cal-allday"
                type="checkbox"
                className="form-check-input"
                checked={draft.allDay}
                onChange={(e) => setDraft({ ...draft, allDay: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="cal-allday">All day</label>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="cal-calendar">Calendar</label>
              <select
                id="cal-calendar"
                className="form-select"
                value={draft.calendarId}
                onChange={(e) => setDraft({ ...draft, calendarId: e.target.value })}
              >
                {calendars.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="cal-location">Location</label>
              <input
                id="cal-location"
                className="form-control"
                value={draft.location}
                onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                placeholder="Add location"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="cal-description">Description</label>
              <textarea
                id="cal-description"
                className="form-control"
                rows="3"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="Add description"
              />
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title || 'Event'}
        footer={(
          <React.Fragment>
            <button type="button" className="btn btn-outline-danger me-auto" onClick={deleteSelected}>Delete</button>
            <button type="button" className="btn btn-light" onClick={() => setSelected(null)}>Close</button>
            <button type="button" className="btn btn-primary" onClick={() => openEdit(selected)}>Edit</button>
          </React.Fragment>
        )}
      >
        {selected ? (
          <div className="text-start">
            <p className="mb-2"><i className="ti ti-calendar me-2"></i>{fmtLongDate(selected.start)}</p>
            <p className="mb-2"><i className="ti ti-clock me-2"></i>{selected.allDay ? 'All day' : `${fmtTime(selected.start)} – ${fmtTime(selected.end)}`}</p>
            {selected.location ? <p className="mb-2"><i className="ti ti-map-pin me-2"></i>{selected.location}</p> : null}
            {selected.description ? <p className="mb-2 text-secondary">{selected.description}</p> : null}
            <hr />
            <p className="mb-0 small text-secondary">
              <span className="cal-chip-dot d-inline-block me-2" style={{ background: calFor(selected.calendarId).color }} />
              {calFor(selected.calendarId).name}
            </p>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={addCalOpen}
        onClose={() => setAddCalOpen(false)}
        title="Add calendar"
        size="modal-lg"
        scrollable
        footer={(
          <button type="button" className="btn btn-light" onClick={() => setAddCalOpen(false)}>Close</button>
        )}
      >
        <div className="text-start">
          {/* Section: Public, Continental & Worldwide Calendars */}
          <div className="mb-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h6 className="fw-bold mb-0">Public, Regional & Worldwide Calendars</h6>
                  <span className="badge bg-success-subtle text-success border border-success-subtle">100% Free</span>
                </div>
                <div className="small text-secondary">
                  Free to subscribe and browse — no payment or registration required.
                </div>
              </div>
              <div className="btn-group btn-group-sm flex-wrap" role="group" aria-label="Catalog categories">
                {['All', 'East Africa', 'Continental', 'International', 'Worldwide Countries'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`btn btn-sm ${catalogCategory === cat ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setCatalogCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="d-flex flex-column gap-2" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {filteredCatalog.map((item) => {
                const subCal = calendars.find((c) => c.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="p-3 border rounded d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3"
                    style={{ background: 'var(--cal-surface-2)' }}
                  >
                    <div style={{ flex: 1 }}>
                      <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                        <span style={{ fontSize: '1.25rem' }}>{item.flag}</span>
                        <strong>{item.name}</strong>
                        <span className="badge bg-success-subtle text-success border border-success-subtle">Free</span>
                        <span className="badge bg-secondary-subtle text-secondary border">{item.badge}</span>
                        <span
                          className="cal-chip-dot d-inline-block"
                          style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }}
                          title={`Calendar color: ${item.color}`}
                        />
                      </div>
                      <div className="small text-secondary">{item.description}</div>
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                      {subCal ? (
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className={`btn btn-sm ${subCal.visible ? 'btn-outline-secondary' : 'btn-success'}`}
                            onClick={() => toggleSubscribePublicCalendar(item)}
                            title={subCal.visible ? 'Hide events from calendar view' : 'Show events on calendar view'}
                          >
                            <i className={`ti ${subCal.visible ? 'ti-eye-off' : 'ti-eye'} me-1`}></i>
                            {subCal.visible ? 'Hide' : 'Show'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removePublicCalendar(item.id)}
                            title="Unsubscribe and remove calendar"
                          >
                            <i className="ti ti-trash"></i>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-sm btn-primary text-nowrap"
                          onClick={() => toggleSubscribePublicCalendar(item)}
                        >
                          <i className="ti ti-plus me-1"></i>Subscribe Free
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <hr />

          {/* Section: Create New Custom Calendar */}
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <h6 className="fw-bold mb-0">Create new custom calendar</h6>
              <span className="badge bg-success-subtle text-success border border-success-subtle">Free</span>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="new-cal-name">Calendar name</label>
              <input
                id="new-cal-name"
                className="form-control"
                placeholder="e.g. Football matches, University exams, Work projects"
                value={newCalName}
                onChange={(e) => setNewCalName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label d-block">Calendar color</label>
              <div className="d-flex gap-2 align-items-center flex-wrap">
                {['#1A73E8', '#188038', '#0F9D58', '#F9AB00', '#D93025', '#A142F4', '#E37400', '#0097A7', '#3949AB', '#7B1FA2'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCalColor(c)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: c,
                      border: newCalColor === c ? '3px solid var(--cal-text)' : '2px solid transparent',
                      cursor: 'pointer',
                    }}
                    title={c}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={!newCalName.trim()}
              onClick={createCustomCalendar}
            >
              <i className="ti ti-plus me-1"></i>Create calendar
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Settings"
        footer={(
          <button type="button" className="btn btn-primary" onClick={() => setSettingsOpen(false)}>Done</button>
        )}
      >
        <div className="text-start">
          <div className="mb-3">
            <label className="form-label fw-semibold" htmlFor="cal-set-lang">Language / Lugha</label>
            <select
              id="cal-set-lang"
              className="form-select"
              value={calLanguage}
              onChange={(e) => saveCalLanguage(e.target.value)}
            >
              <option value="EN">English (US)</option>
              <option value="SW">Kiswahili (Tanzania)</option>
            </select>
            <div className="form-text">Choose your preferred UI language.</div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold" htmlFor="cal-set-time">Time Format</label>
            <select
              id="cal-set-time"
              className="form-select"
              value={timeFormat}
              onChange={(e) => saveTimeFormat(e.target.value)}
            >
              <option value="12h">12-hour (1:00 PM)</option>
              <option value="24h">24-hour (13:00)</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Appearance</label>
            <div className="d-flex align-items-center justify-content-between p-2 border rounded" style={{ background: 'var(--cal-surface-2)' }}>
              <span>Theme: <strong>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</strong></span>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={toggleTheme}>
                <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'} me-1`}></i>
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>

          <hr />

          <div className="mb-3">
            <label className="form-label fw-semibold">Data & Storage</label>
            <div className="small text-secondary mb-2">
              <i className="ti ti-shield-check me-1 text-success"></i>
              Guest Mode: All events and calendars are saved locally in this browser.
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <button type="button" className="btn btn-outline-primary btn-sm" onClick={exportCalendarData}>
                <i className="ti ti-download me-1"></i>Export Calendar (.json)
              </button>
              <button type="button" className="btn btn-outline-danger btn-sm" onClick={clearAllEvents}>
                <i className="ti ti-trash me-1"></i>Clear Events
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        title="Profile"
        footer={(
          <button type="button" className="btn btn-light" onClick={() => setProfileOpen(false)}>Close</button>
        )}
      >
        <div className="text-start">
          <div className="d-flex align-items-center gap-3 mb-3 p-3 border rounded" style={{ background: 'var(--cal-surface-2)' }}>
            <div className="cal-avatar" style={{ width: 44, height: 44, fontSize: '1.25rem', ...(isSignedIn ? { background: 'var(--cal-accent)', color: '#fff' } : {}) }}>
              <i className="ti ti-user"></i>
            </div>
            <div>
              <div className="fw-bold">{displayName || (isSignedIn ? 'User' : 'Anonymous Guest')}</div>
              <div className="d-flex align-items-center gap-1 mt-1">
                {isSignedIn ? (
                  <span className="badge bg-success-subtle text-success border">
                    <i className="ti ti-cloud-check me-1"></i>Synced ({authProvider === 'google' ? 'Google' : 'Email'})
                  </span>
                ) : (
                  <span className="badge bg-secondary-subtle text-secondary border">Unregistered (Guest Mode)</span>
                )}
              </div>
              {userEmail ? <div className="small text-muted mt-1">{userEmail}</div> : null}
            </div>
          </div>

          {!isSignedIn ? (
            <div className="alert alert-info py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <i className="ti ti-info-circle fs-5 flex-shrink-0"></i>
              <span>You have not registered an account yet. All calendar events and notes are saved directly in your browser without requiring a login.</span>
            </div>
          ) : (
            <div className="alert alert-success py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <i className="ti ti-circle-check fs-5 flex-shrink-0"></i>
              <span>Your calendar is synced and backed up with your {authProvider === 'google' ? 'Google Account' : 'account'}.</span>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label fw-semibold" htmlFor="cal-display-name">Display Name</label>
            <input
              id="cal-display-name"
              className="form-control"
              value={displayName}
              onChange={(e) => saveDisplayName(e.target.value)}
              placeholder="Anonymous"
            />
            <div className="form-text">Name shown on your local calendar header.</div>
          </div>

          <hr />

          {!isSignedIn ? (
            <React.Fragment>
              <h6 className="fw-semibold mb-2">Upgrade & Sync (Optional)</h6>
              <p className="small text-secondary mb-3">
                Want to access your calendar on other devices or link your Google Account?
              </p>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm flex-fill text-center"
                  onClick={() => { setProfileOpen(false); setAuthMode('signin'); setAuthOpen(true); }}
                >
                  <i className="ti ti-login me-1"></i>Sign In
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm flex-fill text-center"
                  onClick={() => { setProfileOpen(false); setAuthMode('signup'); setAuthOpen(true); }}
                >
                  <i className="ti ti-user-plus me-1"></i>Create Account
                </button>
              </div>
            </React.Fragment>
          ) : (
            <div>
              <button type="button" className="btn btn-outline-danger btn-sm w-100" onClick={handleSignOut}>
                <i className="ti ti-logout me-1"></i>Sign Out (Switch to Guest Mode)
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Sign in / Sign up Dialog Modal */}
      <Modal
        open={authOpen}
        onClose={() => { setAuthOpen(false); setAuthSuccessMsg(''); }}
      >
        <div className="text-start">
          <div className="text-center mb-3">
            <div className="d-inline-flex align-items-center gap-2 mb-2 text-decoration-none">
              <img src={logoUrl} alt="" width="32" height="32" />
              <span className="fw-bold fs-4 text-primary">Calendar</span>
            </div>
            <h5 className="modal-title fw-bold mb-1">
              {authMode === 'signin' ? 'Sign in to your account' : 'Create your account'}
            </h5>
            <p className="text-muted small mb-0">
              {authMode === 'signin'
                ? 'Sync your calendar across devices with Google or email'
                : 'Create a free account to back up and sync your calendar'}
            </p>
          </div>

          {authSuccessMsg ? (
            <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small mb-3">
              <i className="ti ti-circle-check fs-5 flex-shrink-0"></i>
              <span>{authSuccessMsg}</span>
            </div>
          ) : null}

          {/* Google account addition */}
          <button
            type="button"
            className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-between py-2 px-3 fw-semibold mb-3"
            onClick={handleGoogleSignIn}
            style={{
              background: 'var(--cal-surface)',
              borderColor: 'var(--cal-border)',
              color: 'var(--cal-text)',
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <GoogleIcon size={18} />
              <span>Continue with Google</span>
            </div>
            <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle" style={{ fontSize: '0.7rem' }}>
              Coming soon
            </span>
          </button>

          {googleNotice ? (
            <div className="alert alert-warning py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <i className="ti ti-clock fs-5 flex-shrink-0"></i>
              <span>Google Account Sync is coming soon! Please use email sign-in or guest mode for now.</span>
            </div>
          ) : null}

          <div className="d-flex align-items-center my-3">
            <hr className="flex-grow-1 my-0" />
            <span className="px-2 text-muted small">
              or {authMode === 'signin' ? 'sign in' : 'sign up'} with email
            </span>
            <hr className="flex-grow-1 my-0" />
          </div>

          <form onSubmit={handleEmailAuth}>
            {authMode === 'signup' ? (
              <div className="mb-3">
                <label htmlFor="auth-fullname" className="form-label small fw-semibold">Full name</label>
                <input
                  id="auth-fullname"
                  type="text"
                  className="form-control"
                  placeholder="Jane Doe"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                />
              </div>
            ) : null}

            <div className="mb-3">
              <label htmlFor="auth-email" className="form-label small fw-semibold">Email address</label>
              <input
                id="auth-email"
                type="email"
                className="form-control"
                placeholder="name@example.com"
                required
                autoFocus
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="auth-password" className="form-label small fw-semibold d-flex justify-content-between">
                <span>Password</span>
                {authMode === 'signin' ? (
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('A password reset link will be sent to your email.');
                    }}
                    className="small link-primary text-decoration-none"
                  >
                    Forgot Password?
                  </a>
                ) : null}
              </label>
              <input
                id="auth-password"
                type="password"
                className="form-control"
                placeholder="Password"
                required
                minLength={6}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
              />
            </div>

            {authMode === 'signin' ? (
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="form-check">
                  <input
                    id="auth-remember"
                    className="form-check-input"
                    type="checkbox"
                    checked={authRemember}
                    onChange={(e) => setAuthRemember(e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor="auth-remember">
                    Remember me
                  </label>
                </div>
              </div>
            ) : null}

            <button className="btn btn-primary w-100 py-2 fw-semibold" type="submit">
              {authMode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="text-center mt-3 small text-muted">
            {authMode === 'signin' ? (
              <span>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  className="btn btn-link p-0 small fw-semibold align-baseline text-decoration-none"
                  onClick={() => { setAuthMode('signup'); setAuthSuccessMsg(''); }}
                >
                  Sign up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  className="btn btn-link p-0 small fw-semibold align-baseline text-decoration-none"
                  onClick={() => { setAuthMode('signin'); setAuthSuccessMsg(''); }}
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
