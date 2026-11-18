import React from 'react';
import { NavLink } from 'react-router-dom';
import Modal from '../components/Modal.jsx';
import { useTheme } from '../context.jsx';
import logoUrl from '../assets/images/logo-leaf.png';

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
  { id: 'agenda', label: 'Agenda' },
];

const VALID_VIEWS = VIEWS.map((v) => v.id);

const DEFAULT_CALENDARS = [
  { id: 'work', name: 'Work', color: '#1A73E8', visible: true, group: 'my' },
  { id: 'personal', name: 'Personal', color: '#188038', visible: true, group: 'my' },
  { id: 'family', name: 'Family', color: '#F9AB00', visible: true, group: 'my' },
  { id: 'tz-holidays', name: 'Holidays in Tanzania', color: '#0F9D58', visible: true, group: 'other' },
];

export function getTanzaniaHolidays(year) {
  const easterMap = {
    2025: { gfMonth: 3, gfDay: 18, emMonth: 3, emDay: 21 },
    2026: { gfMonth: 3, gfDay: 3, emMonth: 3, emDay: 6 },
    2027: { gfMonth: 2, gfDay: 26, emMonth: 2, emDay: 29 },
  };
  const islamicMap = {
    2025: { fitrM: 2, fitrD: 31, adhaM: 5, adhaD: 7, maulidM: 8, maulidD: 5 },
    2026: { fitrM: 2, fitrD: 20, adhaM: 4, adhaD: 27, maulidM: 7, maulidD: 25 },
    2027: { fitrM: 2, fitrD: 10, adhaM: 4, adhaD: 17, maulidM: 7, maulidD: 15 },
  };

  const day = (m, d) => new Date(year, m, d);
  const nextDay = (m, d) => new Date(year, m, d + 1);

  const holidays = [
    { id: `tz-newyear-${year}`, title: "New Year's Day (Mwaka Mpya)", m: 0, d: 1 },
    { id: `tz-mapinduzi-${year}`, title: "Zanzibar Revolution Day (Mapinduzi ya Zanzibar)", m: 0, d: 12 },
    { id: `tz-karume-${year}`, title: "Karume Day (Kumbukumbu ya Karume)", m: 3, d: 7 },
    { id: `tz-union-${year}`, title: "Union Day (Siku ya Muungano)", m: 3, d: 26 },
    { id: `tz-workers-${year}`, title: "Labour Day (Mei Mosi)", m: 4, d: 1 },
    { id: `tz-sabasaba-${year}`, title: "Saba Saba Day (Trade Fair Day)", m: 6, d: 7 },
    { id: `tz-nanenane-${year}`, title: "Nane Nane Day (Farmers' Day)", m: 7, d: 8 },
    { id: `tz-nyerere-${year}`, title: "Nyerere Day (Kumbukumbu ya Mwalimu Nyerere)", m: 9, d: 14 },
    { id: `tz-uhuru-${year}`, title: "Independence & Republic Day (Siku ya Uhuru)", m: 11, d: 9 },
    { id: `tz-xmas-${year}`, title: "Christmas Day (Sikukuu ya Krismasi)", m: 11, d: 25 },
    { id: `tz-boxing-${year}`, title: "Boxing Day (Sikukuu ya Ndondi)", m: 11, d: 26 },
  ];

  const e = easterMap[year] || easterMap[2026];
  holidays.push({ id: `tz-gf-${year}`, title: "Good Friday (Ijumaa Kuu)", m: e.gfMonth, d: e.gfDay });
  holidays.push({ id: `tz-em-${year}`, title: "Easter Monday (Jumatatu ya Pasaka)", m: e.emMonth, d: e.emDay });

  const isl = islamicMap[year] || islamicMap[2026];
  holidays.push({ id: `tz-fitr-${year}`, title: "Eid al-Fitr (Sikukuu ya Idi el-Fitr)", m: isl.fitrM, d: isl.fitrD });
  holidays.push({ id: `tz-adha-${year}`, title: "Eid al-Adha (Sikukuu ya Idi el-Hajj)", m: isl.adhaM, d: isl.adhaD });
  holidays.push({ id: `tz-maulid-${year}`, title: "Maulid Day (Mazazi ya Mtume)", m: isl.maulidM, d: isl.maulidD });

  return holidays.map((h) => ({
    id: h.id,
    title: h.title,
    calendarId: 'tz-holidays',
    allDay: true,
    start: day(h.m, h.d),
    end: nextDay(h.m, h.d),
    location: 'Tanzania',
    description: 'Tanzania National Public Holiday',
  }));
}

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
function MiniMonth({ cursor, onSelect, onChangeMonth }) {
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
        {days.map((day) => (
          <button
            key={day.toISOString()}
            type="button"
            className={`${day.getMonth() !== cursor.getMonth() ? 'other' : ''}${sameDay(day, today) ? ' today' : ''}${sameDay(day, cursor) && !sameDay(day, today) ? ' selected' : ''}`.trim()}
            onClick={() => onSelect(day)}
          >
            {day.getDate()}
          </button>
        ))}
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

  const myCalendars = calendars.filter((c) => c.group !== 'other');
  const otherCalendars = calendars.filter((c) => c.group === 'other');
  const tzHolidaysCal = calendars.find((c) => c.id === 'tz-holidays');

  const addOrToggleTzHolidays = () => {
    if (tzHolidaysCal) {
      setCalendars((prev) => prev.map((c) => (c.id === 'tz-holidays' ? { ...c, visible: !c.visible } : c)));
    } else {
      const today = new Date();
      const tzEvents = [
        ...getTanzaniaHolidays(today.getFullYear() - 1),
        ...getTanzaniaHolidays(today.getFullYear()),
        ...getTanzaniaHolidays(today.getFullYear() + 1),
      ];
      setCalendars((prev) => [
        ...prev,
        { id: 'tz-holidays', name: 'Holidays in Tanzania', color: '#0F9D58', visible: true, group: 'other' },
      ]);
      setEvents((prev) => [...prev.filter((e) => e.calendarId !== 'tz-holidays'), ...tzEvents]);
    }
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
          <button type="button" className="cal-icon-btn" title="Settings"><i className="ti ti-settings"></i></button>
          <button type="button" className="cal-avatar" title="Account">M</button>
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
                  <span className="cal-cal-name">{cal.name}</span>
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
                  <span className="cal-cal-name">{cal.name}</span>
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
            <NavLink to="/signin"><i className="ti ti-cloud"></i><span>Sign in to sync</span></NavLink>
            <NavLink to="/dashboard"><i className="ti ti-layout-dashboard"></i><span>Dashboard</span></NavLink>
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
        footer={(
          <button type="button" className="btn btn-light" onClick={() => setAddCalOpen(false)}>Close</button>
        )}
      >
        <div className="text-start">
          <div className="mb-4">
            <h6 className="fw-semibold mb-2">Regional & Public Calendars</h6>
            <div className="p-3 border rounded d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3" style={{ background: 'var(--cal-surface-2)' }}>
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span style={{ fontSize: '1.25rem' }}>🇹🇿</span>
                  <strong>Holidays in Tanzania</strong>
                  <span className="badge bg-success-subtle text-success border border-success-subtle">Official</span>
                </div>
                <div className="small text-secondary">
                  National public holidays (Sikukuu za Kitaifa) including Union Day, Nyerere Day, Karume Day, Eid al-Fitr, Eid al-Adha, Saba Saba, Nane Nane, and Independence Day.
                </div>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${tzHolidaysCal?.visible ? 'btn-outline-danger' : 'btn-success'} text-nowrap`}
                onClick={addOrToggleTzHolidays}
              >
                {tzHolidaysCal ? (tzHolidaysCal.visible ? 'Hide from calendar' : 'Show on calendar') : '+ Add calendar'}
              </button>
            </div>
          </div>

          <hr />

          <div>
            <h6 className="fw-semibold mb-2">Create new calendar</h6>
            <div className="mb-3">
              <label className="form-label" htmlFor="new-cal-name">Calendar name</label>
              <input
                id="new-cal-name"
                className="form-control"
                placeholder="e.g. Football matches, University, Projects"
                value={newCalName}
                onChange={(e) => setNewCalName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label d-block">Calendar color</label>
              <div className="d-flex gap-2 align-items-center flex-wrap">
                {['#1A73E8', '#188038', '#0F9D58', '#F9AB00', '#D93025', '#A142F4', '#E37400', '#0097A7'].map((c) => (
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
    </div>
  );
}
