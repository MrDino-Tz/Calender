// ---------------------------------------------------------------------------
// Public & Curated Calendars Catalog:
// - Regional (Tanzania, Kenya, Uganda, Rwanda)
// - Continental (African Union & Africa Days)
// - International (UN Observances & Worldwide Days)
// - Major Worldwide Countries (US, UK)
// ---------------------------------------------------------------------------

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

const day = (year, m, d) => new Date(year, m, d);
const nextDay = (year, m, d) => new Date(year, m, d + 1);

// Nth weekday helper (e.g. 3rd Monday of Jan)
function nthWeekday(year, month, targetDayOfWeek, nth) {
  let count = 0;
  for (let d = 1; d <= 31; d++) {
    const dt = new Date(year, month, d);
    if (dt.getMonth() !== month) break;
    if (dt.getDay() === targetDayOfWeek) {
      count++;
      if (count === nth) return d;
    }
  }
  return 1;
}

// Last weekday helper (e.g. last Monday of May)
function lastWeekday(year, month, targetDayOfWeek) {
  let last = 1;
  for (let d = 1; d <= 31; d++) {
    const dt = new Date(year, month, d);
    if (dt.getMonth() !== month) break;
    if (dt.getDay() === targetDayOfWeek) last = d;
  }
  return last;
}

export function getTanzaniaHolidays(year) {
  const e = easterMap[year] || easterMap[2026];
  const isl = islamicMap[year] || islamicMap[2026];
  const holidays = [
    { id: `tz-newyear-${year}`, title: "New Year's Day (Mwaka Mpya)", m: 0, d: 1 },
    { id: `tz-mapinduzi-${year}`, title: "Zanzibar Revolution Day (Mapinduzi ya Zanzibar)", m: 0, d: 12 },
    { id: `tz-karume-${year}`, title: "Karume Day (Kumbukumbu ya Karume)", m: 3, d: 7 },
    { id: `tz-gf-${year}`, title: "Good Friday (Ijumaa Kuu)", m: e.gfMonth, d: e.gfDay },
    { id: `tz-em-${year}`, title: "Easter Monday (Jumatatu ya Pasaka)", m: e.emMonth, d: e.emDay },
    { id: `tz-fitr-${year}`, title: "Eid al-Fitr (Sikukuu ya Idi el-Fitr)", m: isl.fitrM, d: isl.fitrD },
    { id: `tz-union-${year}`, title: "Union Day (Siku ya Muungano)", m: 3, d: 26 },
    { id: `tz-workers-${year}`, title: "Labour Day (Mei Mosi)", m: 4, d: 1 },
    { id: `tz-adha-${year}`, title: "Eid al-Adha (Sikukuu ya Idi el-Hajj)", m: isl.adhaM, d: isl.adhaD },
    { id: `tz-sabasaba-${year}`, title: "Saba Saba Day (Trade Fair Day)", m: 6, d: 7 },
    { id: `tz-nanenane-${year}`, title: "Nane Nane Day (Farmers' Day)", m: 7, d: 8 },
    { id: `tz-maulid-${year}`, title: "Maulid Day (Mazazi ya Mtume)", m: isl.maulidM, d: isl.maulidD },
    { id: `tz-nyerere-${year}`, title: "Nyerere Day (Kumbukumbu ya Mwalimu Nyerere)", m: 9, d: 14 },
    { id: `tz-uhuru-${year}`, title: "Independence & Republic Day (Siku ya Uhuru)", m: 11, d: 9 },
    { id: `tz-xmas-${year}`, title: "Christmas Day (Sikukuu ya Krismasi)", m: 11, d: 25 },
    { id: `tz-boxing-${year}`, title: "Boxing Day (Sikukuu ya Ndondi)", m: 11, d: 26 },
  ];

  return holidays.map((h) => ({
    id: h.id,
    title: h.title,
    calendarId: 'tz-holidays',
    allDay: true,
    start: day(year, h.m, h.d),
    end: nextDay(year, h.m, h.d),
    location: 'Tanzania',
    description: 'Official National Public Holiday in Tanzania',
  }));
}

export function getAfricaEvents(year) {
  const events = [
    { id: `af-day-${year}`, title: "Africa Day (Siku ya Afrika)", m: 4, d: 25, desc: "Commemorates the founding of the Organization of African Unity (AU) in 1963." },
    { id: `af-child-${year}`, title: "Day of the African Child", m: 5, d: 16, desc: "Honors the 1976 Soweto student uprising and advocates for children's rights across Africa." },
    { id: `af-mandela-${year}`, title: "Nelson Mandela International Day", m: 6, d: 18, desc: "Global call to action celebrating Mandela's 67-year fight for human rights." },
    { id: `af-women-${year}`, title: "Pan African Women's Day", m: 6, d: 31, desc: "Celebrates the role of women in the liberation and development of Africa." },
    { id: `af-union-${year}`, title: "African Union Day", m: 8, d: 9, desc: "Marks the landmark Sirte Declaration establishing the African Union in 1999." },
    { id: `af-youth-${year}`, title: "Africa Youth Day", m: 10, d: 1, desc: "Celebrates young African innovators, leaders, and agents of change." },
    { id: `af-ind-${year}`, title: "Africa Industrialization Day", m: 10, d: 20, desc: "Focuses on economic transformation and sustainable manufacturing across Africa." },
  ];

  return events.map((h) => ({
    id: h.id,
    title: h.title,
    calendarId: 'africa-events',
    allDay: true,
    start: day(year, h.m, h.d),
    end: nextDay(year, h.m, h.d),
    location: 'African Union',
    description: h.desc,
  }));
}

export function getIntlEvents(year) {
  const events = [
    { id: `intl-edu-${year}`, title: "International Day of Education", m: 0, d: 24, desc: "UN observance in celebration of the role of education for peace and development." },
    { id: `intl-lang-${year}`, title: "International Mother Language Day", m: 1, d: 21, desc: "Promotes linguistic and cultural diversity and multilingualism." },
    { id: `intl-women-${year}`, title: "International Women's Day", m: 2, d: 8, desc: "Global celebration of the social, economic, cultural, and political achievements of women." },
    { id: `intl-forest-${year}`, title: "International Day of Forests", m: 2, d: 21, desc: "Raises awareness of the importance of all types of forests and green cover." },
    { id: `intl-health-${year}`, title: "World Health Day (WHO)", m: 3, d: 7, desc: "Global health awareness day under the sponsorship of the WHO." },
    { id: `intl-earth-${year}`, title: "Earth Day (Siku ya Dunia)", m: 3, d: 22, desc: "International event to demonstrate support for environmental protection." },
    { id: `intl-press-${year}`, title: "World Press Freedom Day", m: 4, d: 3, desc: "Celebrates the fundamental principles of press freedom and independent journalism." },
    { id: `intl-env-${year}`, title: "World Environment Day", m: 5, d: 5, desc: "UN flagship platform for encouraging worldwide awareness and action for the environment." },
    { id: `intl-refugee-${year}`, title: "World Refugee Day", m: 5, d: 20, desc: "Honors the courage and strength of millions forced to flee conflict or persecution." },
    { id: `intl-youth-${year}`, title: "International Youth Day", m: 7, d: 12, desc: "Celebrates young people's voices, actions, and initiatives globally." },
    { id: `intl-peace-${year}`, title: "International Day of Peace", m: 8, d: 21, desc: "Global ceasefire and non-violence observance dedicated to world peace." },
    { id: `intl-teachers-${year}`, title: "World Teachers' Day", m: 9, d: 5, desc: "Celebrates how teachers are transforming education and shaping the future." },
    { id: `intl-un-${year}`, title: "United Nations Day (Siku ya UN)", m: 9, d: 24, desc: "Marks the anniversary of the entry into force in 1945 of the UN Charter." },
    { id: `intl-children-${year}`, title: "World Children's Day", m: 10, d: 20, desc: "Promotes international togetherness and awareness among children worldwide." },
    { id: `intl-aids-${year}`, title: "World AIDS Day", m: 11, d: 1, desc: "Dedicated to raising awareness of the AIDS pandemic caused by HIV infection." },
    { id: `intl-rights-${year}`, title: "Human Rights Day (Siku ya Haki za Binadamu)", m: 11, d: 10, desc: "Commemorates the adoption of the Universal Declaration of Human Rights in 1948." },
  ];

  return events.map((h) => ({
    id: h.id,
    title: h.title,
    calendarId: 'intl-events',
    allDay: true,
    start: day(year, h.m, h.d),
    end: nextDay(year, h.m, h.d),
    location: 'United Nations / Global',
    description: h.desc,
  }));
}

export function getKenyaHolidays(year) {
  const e = easterMap[year] || easterMap[2026];
  const isl = islamicMap[year] || islamicMap[2026];
  const holidays = [
    { id: `ke-newyear-${year}`, title: "New Year's Day", m: 0, d: 1 },
    { id: `ke-gf-${year}`, title: "Good Friday", m: e.gfMonth, d: e.gfDay },
    { id: `ke-em-${year}`, title: "Easter Monday", m: e.emMonth, d: e.emDay },
    { id: `ke-fitr-${year}`, title: "Eid al-Fitr", m: isl.fitrM, d: isl.fitrD },
    { id: `ke-labour-${year}`, title: "Labour Day", m: 4, d: 1 },
    { id: `ke-madaraka-${year}`, title: "Madaraka Day (Self-Governance)", m: 5, d: 1 },
    { id: `ke-adha-${year}`, title: "Eid al-Adha", m: isl.adhaM, d: isl.adhaD },
    { id: `ke-utamaduni-${year}`, title: "Utamaduni Day (Cultural Heritage)", m: 9, d: 10 },
    { id: `ke-mashujaa-${year}`, title: "Mashujaa Day (Heroes' Day)", m: 9, d: 20 },
    { id: `ke-jamhuri-${year}`, title: "Jamhuri Day (Independence Day)", m: 11, d: 12 },
    { id: `ke-xmas-${year}`, title: "Christmas Day", m: 11, d: 25 },
    { id: `ke-boxing-${year}`, title: "Boxing Day", m: 11, d: 26 },
  ];

  return holidays.map((h) => ({
    id: h.id,
    title: h.title,
    calendarId: 'ke-holidays',
    allDay: true,
    start: day(year, h.m, h.d),
    end: nextDay(year, h.m, h.d),
    location: 'Kenya',
    description: 'Official National Public Holiday in Kenya',
  }));
}

export function getUgandaHolidays(year) {
  const e = easterMap[year] || easterMap[2026];
  const holidays = [
    { id: `ug-newyear-${year}`, title: "New Year's Day", m: 0, d: 1 },
    { id: `ug-liberation-${year}`, title: "NRM Liberation Day", m: 0, d: 26 },
    { id: `ug-luwum-${year}`, title: "Archbishop Janani Luwum Day", m: 1, d: 16 },
    { id: `ug-women-${year}`, title: "International Women's Day", m: 2, d: 8 },
    { id: `ug-gf-${year}`, title: "Good Friday", m: e.gfMonth, d: e.gfDay },
    { id: `ug-em-${year}`, title: "Easter Monday", m: e.emMonth, d: e.emDay },
    { id: `ug-labour-${year}`, title: "Labour Day", m: 4, d: 1 },
    { id: `ug-martyrs-${year}`, title: "Uganda Martyrs' Day", m: 5, d: 3 },
    { id: `ug-heroes-${year}`, title: "National Heroes' Day", m: 5, d: 9 },
    { id: `ug-indep-${year}`, title: "Independence Day", m: 9, d: 9 },
    { id: `ug-xmas-${year}`, title: "Christmas Day", m: 11, d: 25 },
    { id: `ug-boxing-${year}`, title: "Boxing Day", m: 11, d: 26 },
  ];

  return holidays.map((h) => ({
    id: h.id,
    title: h.title,
    calendarId: 'ug-holidays',
    allDay: true,
    start: day(year, h.m, h.d),
    end: nextDay(year, h.m, h.d),
    location: 'Uganda',
    description: 'Official National Public Holiday in Uganda',
  }));
}

export function getRwandaHolidays(year) {
  const holidays = [
    { id: `rw-newyear-${year}`, title: "New Year's Day", m: 0, d: 1 },
    { id: `rw-newyear2-${year}`, title: "Day after New Year's Day", m: 0, d: 2 },
    { id: `rw-heroes-${year}`, title: "National Heroes Day (Intwari)", m: 1, d: 1 },
    { id: `rw-kwibuka-${year}`, title: "Genocide Memorial Day (Kwibuka)", m: 3, d: 7 },
    { id: `rw-labour-${year}`, title: "Labour Day", m: 4, d: 1 },
    { id: `rw-indep-${year}`, title: "Independence Day", m: 6, d: 1 },
    { id: `rw-liberation-${year}`, title: "Liberation Day (Kwibohora)", m: 6, d: 4 },
    { id: `rw-umuganura-${year}`, title: "Umuganura (National Thanksgiving)", m: 7, d: nthWeekday(year, 7, 5, 1) },
    { id: `rw-xmas-${year}`, title: "Christmas Day", m: 11, d: 25 },
    { id: `rw-boxing-${year}`, title: "Boxing Day", m: 11, d: 26 },
  ];

  return holidays.map((h) => ({
    id: h.id,
    title: h.title,
    calendarId: 'rw-holidays',
    allDay: true,
    start: day(year, h.m, h.d),
    end: nextDay(year, h.m, h.d),
    location: 'Rwanda',
    description: 'Official National Public Holiday in Rwanda',
  }));
}

export function getUsHolidays(year) {
  const holidays = [
    { id: `us-newyear-${year}`, title: "New Year's Day", m: 0, d: 1 },
    { id: `us-mlk-${year}`, title: "Martin Luther King Jr. Day", m: 0, d: nthWeekday(year, 0, 1, 3) },
    { id: `us-presidents-${year}`, title: "Presidents' Day (Washington's Birthday)", m: 1, d: nthWeekday(year, 1, 1, 3) },
    { id: `us-memorial-${year}`, title: "Memorial Day", m: 4, d: lastWeekday(year, 4, 1) },
    { id: `us-juneteenth-${year}`, title: "Juneteenth National Independence Day", m: 5, d: 19 },
    { id: `us-independence-${year}`, title: "Independence Day (4th of July)", m: 6, d: 4 },
    { id: `us-labor-${year}`, title: "Labor Day", m: 8, d: nthWeekday(year, 8, 1, 1) },
    { id: `us-columbus-${year}`, title: "Columbus / Indigenous Peoples' Day", m: 9, d: nthWeekday(year, 9, 1, 2) },
    { id: `us-veterans-${year}`, title: "Veterans Day", m: 10, d: 11 },
    { id: `us-thanksgiving-${year}`, title: "Thanksgiving Day", m: 10, d: nthWeekday(year, 10, 4, 4) },
    { id: `us-xmas-${year}`, title: "Christmas Day", m: 11, d: 25 },
  ];

  return holidays.map((h) => ({
    id: h.id,
    title: h.title,
    calendarId: 'us-holidays',
    allDay: true,
    start: day(year, h.m, h.d),
    end: nextDay(year, h.m, h.d),
    location: 'United States',
    description: 'Federal Holiday in the United States',
  }));
}

export function getUkHolidays(year) {
  const e = easterMap[year] || easterMap[2026];
  const holidays = [
    { id: `uk-newyear-${year}`, title: "New Year's Day", m: 0, d: 1 },
    { id: `uk-gf-${year}`, title: "Good Friday", m: e.gfMonth, d: e.gfDay },
    { id: `uk-em-${year}`, title: "Easter Monday", m: e.emMonth, d: e.emDay },
    { id: `uk-maybank-${year}`, title: "Early May Bank Holiday", m: 4, d: nthWeekday(year, 4, 1, 1) },
    { id: `uk-spring-${year}`, title: "Spring Bank Holiday", m: 4, d: lastWeekday(year, 4, 1) },
    { id: `uk-summer-${year}`, title: "Summer Bank Holiday", m: 7, d: lastWeekday(year, 7, 1) },
    { id: `uk-xmas-${year}`, title: "Christmas Day", m: 11, d: 25 },
    { id: `uk-boxing-${year}`, title: "Boxing Day", m: 11, d: 26 },
  ];

  return holidays.map((h) => ({
    id: h.id,
    title: h.title,
    calendarId: 'uk-holidays',
    allDay: true,
    start: day(year, h.m, h.d),
    end: nextDay(year, h.m, h.d),
    location: 'United Kingdom',
    description: 'Official Bank Holiday in the United Kingdom',
  }));
}

// ---------------------------------------------------------------------------
// PUBLIC CALENDARS CATALOG REGISTRY
// ---------------------------------------------------------------------------
export const PUBLIC_CALENDARS_CATALOG = [
  {
    id: 'tz-holidays',
    name: 'Holidays in Tanzania',
    flag: '🇹🇿',
    category: 'East Africa',
    color: '#0F9D58',
    badge: 'Official',
    description: 'National public holidays in Tanzania (Sikukuu za Kitaifa) including Union Day, Nyerere Day, Karume Day, Eid al-Fitr, Eid al-Adha, Saba Saba, Nane Nane, and Independence Day.',
    getEvents: (years) => years.flatMap((y) => getTanzaniaHolidays(y)),
  },
  {
    id: 'africa-events',
    name: 'African Union & Continental Days',
    flag: '🌍',
    category: 'Continental',
    color: '#E37400',
    badge: 'Continental',
    description: 'Major pan-African celebrations and observances including Africa Day (May 25), Day of the African Child (June 16), Mandela Day, and African Union Day.',
    getEvents: (years) => years.flatMap((y) => getAfricaEvents(y)),
  },
  {
    id: 'intl-events',
    name: 'UN & International Observances',
    flag: '🌐',
    category: 'International',
    color: '#1A73E8',
    badge: 'Global',
    description: 'Worldwide UN and global observances including International Women’s Day, Earth Day, World Health Day, International Peace Day, and Human Rights Day.',
    getEvents: (years) => years.flatMap((y) => getIntlEvents(y)),
  },
  {
    id: 'ke-holidays',
    name: 'Holidays in Kenya',
    flag: '🇰🇪',
    category: 'East Africa',
    color: '#D93025',
    badge: 'Regional',
    description: 'Official national public holidays in Kenya including Madaraka Day, Mashujaa Day, Jamhuri Day, Labour Day, and Utamaduni Day.',
    getEvents: (years) => years.flatMap((y) => getKenyaHolidays(y)),
  },
  {
    id: 'ug-holidays',
    name: 'Holidays in Uganda',
    flag: '🇺🇬',
    category: 'East Africa',
    color: '#F9AB00',
    badge: 'Regional',
    description: 'Official national public holidays in Uganda including NRM Liberation Day, Uganda Martyrs’ Day, Heroes’ Day, and Independence Day.',
    getEvents: (years) => years.flatMap((y) => getUgandaHolidays(y)),
  },
  {
    id: 'rw-holidays',
    name: 'Holidays in Rwanda',
    flag: '🇷🇼',
    category: 'East Africa',
    color: '#0097A7',
    badge: 'Regional',
    description: 'National holidays in Rwanda including National Heroes’ Day (Intwari), Kwibuka Genocide Memorial, Liberation Day (Kwibohora), and Umuganura.',
    getEvents: (years) => years.flatMap((y) => getRwandaHolidays(y)),
  },
  {
    id: 'us-holidays',
    name: 'Holidays in United States',
    flag: '🇺🇸',
    category: 'Worldwide Countries',
    color: '#3949AB',
    badge: 'Country',
    description: 'Federal public holidays in the United States including MLK Day, Memorial Day, Juneteenth, 4th of July, Labor Day, and Thanksgiving.',
    getEvents: (years) => years.flatMap((y) => getUsHolidays(y)),
  },
  {
    id: 'uk-holidays',
    name: 'Holidays in United Kingdom',
    flag: '🇬🇧',
    category: 'Worldwide Countries',
    color: '#7B1FA2',
    badge: 'Country',
    description: 'Official Bank Holidays across the United Kingdom including Early May, Spring Bank, Summer Bank, Good Friday, and Easter Monday.',
    getEvents: (years) => years.flatMap((y) => getUkHolidays(y)),
  },
];
