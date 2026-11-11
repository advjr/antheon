// Travelz demo data. Everything here is invented sample data for a fictional
// small-group tour company in Melbourne, Australia. Amounts are in AUD.
// Dates are worked out relative to today so the demo always looks current,
// and a fixed seed keeps the numbers the same on every visit.
(function () {
  let seed = 20261111;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));

  const DAY = 864e5;
  const today = new Date();
  today.setHours(9, 30, 0, 0);
  const at = (n, h = 9, m = 30) => { const d = new Date(today.getTime() + n * DAY); d.setHours(h, m, 0, 0); return d; };
  const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  // ---- Trip catalogue ----
  const trips = [
    { id: 'tas', name: 'Tasmania Wilderness Walk', dest: 'Tasmania', country: 'Australia', region: 'Australia', days: 7, price: 3490, cap: 14, color: '#0ea5e9' },
    { id: 'uluru', name: 'Red Centre & Uluru', dest: 'Northern Territory', country: 'Australia', region: 'Australia', days: 5, price: 2890, cap: 16, color: '#f97316' },
    { id: 'kim', name: 'Kimberley Coast Cruise', dest: 'Western Australia', country: 'Australia', region: 'Australia', days: 10, price: 8950, cap: 12, color: '#e11d48' },
    { id: 'reef', name: 'Great Barrier Reef Sail', dest: 'Queensland', country: 'Australia', region: 'Australia', days: 4, price: 1990, cap: 18, color: '#14b8a6' },
    { id: 'jpn', name: 'Japan Autumn Colours', dest: 'Kyoto & Tokyo', country: 'Japan', region: 'Asia', days: 12, price: 7450, cap: 16, color: '#8b5cf6' },
    { id: 'vn', name: 'Vietnam North to South', dest: 'Hanoi to Saigon', country: 'Vietnam', region: 'Asia', days: 14, price: 4990, cap: 16, color: '#22c55e' },
    { id: 'nz', name: 'New Zealand Alpine Trails', dest: 'South Island', country: 'New Zealand', region: 'Pacific', days: 9, price: 5690, cap: 14, color: '#2563eb' },
    { id: 'bali', name: 'Bali Food & Culture', dest: 'Ubud & Seminyak', country: 'Indonesia', region: 'Asia', days: 8, price: 3290, cap: 16, color: '#f59e0b' },
    { id: 'lk', name: 'Sri Lanka Tea Country', dest: 'Kandy & Ella', country: 'Sri Lanka', region: 'Asia', days: 11, price: 4450, cap: 14, color: '#10b981' },
    { id: 'ita', name: 'Italian Lakes by Rail', dest: 'Como & Garda', country: 'Italy', region: 'Europe', days: 12, price: 9850, cap: 14, color: '#6366f1' },
  ];
  const tripById = Object.fromEntries(trips.map((t) => [t.id, t]));

  // ---- Team ----
  const team = [
    { id: 'mia', name: 'Mia Collins', role: 'Operations lead', initials: 'MC', color: '#2563eb' },
    { id: 'josh', name: 'Josh Tran', role: 'Sales', initials: 'JT', color: '#f59e0b' },
    { id: 'priya', name: 'Priya Raman', role: 'Marketing', initials: 'PR', color: '#10b981' },
  ];

  // ---- Travellers ----
  const firsts = ['Olivia', 'Jack', 'Charlotte', 'Noah', 'Amelia', 'Oliver', 'Isla', 'William', 'Grace', 'Lucas', 'Chloe', 'Henry', 'Zoe', 'James', 'Ruby', 'Ethan', 'Harper', 'Leo', 'Sienna', 'Liam', 'Matilda', 'Archie', 'Ava', 'Hamish', 'Daniel', 'Mei', 'Arjun', 'Lachlan', 'Georgia', 'Angus', 'Ella', 'Tom', 'Hannah', 'Kai', 'Nina', 'Raj', 'Aisha', 'Ben', 'Lily', 'Sam', 'Jasmine', 'Max', 'Freya', 'Oscar', 'Evie', 'Felix', 'Maya', 'Callum'];
  const lasts = ['Nguyen', 'Smith', 'Williams', 'Brown', 'Wilson', 'Taylor', 'Johnson', 'White', 'Martin', 'Anderson', 'Thompson', 'Walker', 'Harris', 'Lee', 'Ryan', 'Robinson', 'Kelly', 'King', 'Patel', 'Chen', 'Murphy', 'Campbell', 'Clarke', 'Mitchell', 'Singh', 'Wright', 'Scott', 'Hughes', 'Young', 'Morgan'];
  const cities = ['Melbourne VIC', 'Sydney NSW', 'Brisbane QLD', 'Perth WA', 'Adelaide SA', 'Hobart TAS', 'Canberra ACT', 'Gold Coast QLD', 'Geelong VIC', 'Newcastle NSW', 'Sunshine Coast QLD', 'Darwin NT'];
  const avatarColors = ['#2563eb', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#0ea5e9', '#f97316', '#14b8a6', '#6366f1', '#e11d48'];
  const travellers = firsts.map((f, i) => {
    const l = lasts[(i * 7) % lasts.length];
    const id = 't' + i;
    return {
      id, first: f, last: l, name: `${f} ${l}`, initials: f[0] + l[0],
      email: `${f}.${l}`.toLowerCase().replace(/[^a-z.]/g, '') + '@example.com',
      phone: `+61 4${int(10, 99)} ${int(100, 999)} ${int(100, 999)}`,
      city: pick(cities), color: avatarColors[i % avatarColors.length],
      newsletter: rnd() < 0.62, pastTrips: 0, spend: 0, trips: [], lastContact: at(-int(0, 40)),
    };
  });

  // ---- Departures ----
  const offsets = { tas: [9, 37, 72], uluru: [4, 30, 58, 95], kim: [26, 84], reef: [6, 20, 48, 76], jpn: [16, 120], vn: [41, 103], nz: [33, 88], bali: [13, 55, 110], lk: [64], ita: [51, 140] };
  const guides = ['Ellie Ward', 'Marcus Doyle', 'Tama Rangi', 'Kenji Mori', 'Linh Pham', 'Ketut Ardana', 'Ruwan Perera', 'Giulia Rossi', 'Shane Cooper'];
  const departures = [];
  trips.forEach((t) => {
    (offsets[t.id] || []).forEach((o, k) => {
      const base = 1.02 - o / 170 + (rnd() - 0.4) * 0.28;
      let booked = Math.max(2, Math.min(t.cap, Math.round(t.cap * base)));
      if (t.id === 'jpn' && k === 0) booked = t.cap - 3;
      if (t.id === 'reef' && k === 0) booked = t.cap;
      if (t.id === 'kim' && k === 0) booked = 5;
      departures.push({ id: `${t.id}-${k}`, trip: t, start: at(o, 7, 0), end: at(o + t.days - 1, 17, 0), booked, cap: t.cap, guide: pick(guides), hotel: o < 30 ? (rnd() < 0.7 ? 'Confirmed' : 'Room list due') : 'Held', bookings: [] });
    });
  });
  departures.sort((a, b) => a.start - b.start);

  // ---- Bookings (one per traveller party) ----
  const notes = ['Vegetarian', 'Twin share requested', 'Celebrating 40th anniversary', 'Gluten free', 'Needs an early check-in', 'Travelling with a friend', 'First trip with us', 'Prefers ground floor room'];
  const bookings = [];
  let ref = 4810;
  departures.forEach((d) => {
    let left = d.booked;
    while (left > 0) {
      const pax = left >= 2 && rnd() < 0.45 ? 2 : 1;
      left -= pax;
      const tr = pick(travellers);
      const daysOut = Math.round((d.start - today) / DAY);
      // More bookings land in recent weeks, as they would for a growing business
      const range = Math.max(4, Math.min(120, 150 - daysOut));
      const bookedAt = at(-(1 + Math.floor(Math.pow(rnd(), 1.35) * (range - 1))), int(8, 20), int(0, 59));
      let status;
      if (daysOut > 60) status = rnd() < 0.85 ? 'Deposit paid' : 'Awaiting deposit';
      else status = rnd() < 0.8 ? 'Paid in full' : 'Balance due';
      const total = d.trip.price * pax;
      const paid = status === 'Paid in full' ? total : status === 'Awaiting deposit' ? 0 : Math.round(total * 0.25);
      const b = { ref: 'TZ-' + ref++, traveller: tr, dep: d, pax, total, paid, status, bookedAt, note: rnd() < 0.3 ? pick(notes) : '' };
      bookings.push(b);
      d.bookings.push(b);
      tr.trips.push(b);
    }
  });
  // A few recent cancellations, kept out of the seat counts
  for (let k = 0; k < 4; k++) {
    const d = departures[int(2, departures.length - 1)];
    const tr = pick(travellers);
    bookings.push({ ref: 'TZ-' + ref++, traveller: tr, dep: d, pax: 1, total: d.trip.price, paid: 0, status: 'Cancelled', bookedAt: at(-int(2, 25), int(9, 18), int(0, 59)), note: 'Changed travel dates' });
  }
  // A few bookings already came in this morning
  bookings.filter((b) => b.status === 'Deposit paid').slice(0, 3).forEach((b, k) => { b.bookedAt = at(0, 6 + k, 12 + k * 14); });
  bookings.sort((a, b) => b.bookedAt - a.bookedAt);

  // Past trips give each traveller a history
  travellers.forEach((tr) => {
    tr.pastTrips = rnd() < 0.42 ? int(1, 4) : 0;
    tr.spend = tr.trips.filter((b) => b.status !== 'Cancelled').reduce((s, b) => s + b.total, 0) + tr.pastTrips * int(2400, 6800);
    tr.repeat = tr.pastTrips > 0;
    tr.vip = tr.spend > 16000;
    tr.lastTrip = tr.pastTrips ? pick(trips).name : '';
  });

  // ---- Revenue by day: actual for the last 21 days, projected for the next 9 ----
  const live = bookings.filter((b) => b.status !== 'Cancelled');
  const byDay = {};
  live.forEach((b) => { const k = dayKey(b.bookedAt); byDay[k] = (byDay[k] || 0) + b.total; });
  const daily = [];
  for (let n = -20; n <= 9; n++) {
    const d = at(n);
    if (n <= 0) daily.push({ date: d, value: byDay[dayKey(d)] || 0, projected: false, today: n === 0 });
    else daily.push({ date: d, value: 0, projected: true });
  }
  const recent = daily.filter((x) => !x.projected).slice(-14);
  const avg = recent.reduce((s, x) => s + x.value, 0) / recent.length;
  daily.filter((x) => x.projected).forEach((x, i) => { x.value = Math.round(avg * (0.75 + rnd() * 0.6) * (i === 4 ? 1.5 : 1)); });

  // ---- Pipeline (enquiries not yet booked) ----
  const stages = ['New enquiry', 'Quote sent', 'Following up', 'Ready to book'];
  const sources = ['Website', 'Instagram', 'Phone', 'Travel agent', 'Email', 'Referral'];
  const asks = ['Is there a single supplement?', 'Can we add two nights in Tokyo?', 'Looking at the March departure for 4 people', 'Do you cater for coeliacs?', 'Interested in a private group of 8', 'What fitness level is needed?', 'Can I pay the deposit in two parts?', 'Travelling with my mum, any accessible rooms?'];
  const enquiryPeople = travellers.slice(18, 44);
  const pipeline = enquiryPeople.map((tr, i) => {
    const t = trips[(i * 3) % trips.length];
    const stage = stages[i < 7 ? 0 : i < 14 ? 1 : i < 20 ? 2 : 3];
    const pax = pick([1, 2, 2, 2, 3, 4]);
    return {
      id: 'e' + i, traveller: tr, trip: t, stage, source: pick(sources), pax, value: t.price * pax,
      age: stage === 'New enquiry' ? int(1, 20) : int(26, 240), owner: pick(team), ask: pick(asks),
      hot: rnd() < 0.3,
    };
  });

  // ---- Priority tasks ----
  const soon = departures.filter((d) => (d.start - today) / DAY <= 60);
  const due = bookings.filter((b) => b.status === 'Balance due');
  const balTotal = soon.reduce((s, d) => s + d.bookings.length, 0);
  const balDone = soon.reduce((s, d) => s + d.bookings.filter((b) => b.status === 'Paid in full').length, 0);
  const jp = departures.find((d) => d.trip.id === 'jpn');
  const tasDep = departures.find((d) => d.trip.id === 'tas');
  const quotes = pipeline.filter((p) => p.stage === 'Quote sent' && p.age > 72);
  const tasks = [
    { icon: 'card', title: 'Final payments', date: at(3), done: balDone, total: balTotal, sub: 'Balances due 60 days before each departure.', view: 'departures' },
    { icon: 'passport', title: 'Passport details', date: at(5), done: jp.booked - 4, total: jp.booked, sub: `${jp.trip.name} travellers still to send passports.`, view: 'departures' },
    { icon: 'quote', title: 'Quote follow-ups', date: at(1), done: 2, total: quotes.length + 2, sub: 'Quotes older than 3 days without a reply.', view: 'pipeline' },
    { icon: 'bed', title: 'Room list to lodge', date: at(2), done: 0, total: 1, sub: `${tasDep.trip.name}, Cradle Mountain lodge.`, view: 'departures' },
    { icon: 'star', title: 'Review requests', date: at(4), done: 9, total: 14, sub: 'Travellers home from Red Centre & Uluru.', view: 'insights' },
  ];

  // ---- Inbox ----
  const T = (name) => travellers.find((t) => t.first === name);
  const threads = [
    { id: 'm1', channel: 'Email', who: T('Charlotte'), subject: 'Japan Autumn Colours, single room', time: at(0, 8, 42), unread: true, tag: 'Booking',
      messages: [
        { from: 'them', text: 'Hi team, I am keen on Japan Autumn Colours but travelling solo. Is there a single room option and what does it cost?', time: at(0, 8, 42) },
      ],
      suggestion: 'Hi Charlotte, thanks for reaching out. Yes, single rooms are available on Japan Autumn Colours for an extra A$1,180, and there are only 3 seats left on the next departure. Would you like me to hold one for 48 hours while you decide?' },
    { id: 'm2', channel: 'WhatsApp', who: T('Jack'), subject: 'Tasmania walk gear list', time: at(0, 7, 55), unread: true, tag: 'Pre-departure',
      messages: [
        { from: 'them', text: 'Morning! Do I need my own walking poles for the Tasmania trip or are they supplied?', time: at(0, 7, 55) },
      ],
      suggestion: 'Morning Jack! Poles are supplied on the Tasmania Wilderness Walk, along with a dry bag and a rain shell. Just bring broken-in boots and a warm layer. The full gear list is in your pre-departure pack.' },
    { id: 'm3', channel: 'Web chat', who: T('Priya') || T('Mei'), subject: 'Group of 8 for Bali', time: at(-1, 16, 20), unread: true, tag: 'New enquiry',
      messages: [
        { from: 'them', text: 'We are a group of 8 friends looking at Bali Food & Culture in April. Do you do private departures?', time: at(-1, 16, 20) },
      ],
      suggestion: 'Thanks for asking! We can run Bali Food & Culture as a private departure for groups of 8 or more, on dates that suit you. For April the price is A$3,090 per person. Shall I send a quote with two date options?' },
    { id: 'm4', channel: 'Instagram', who: T('Sienna'), subject: 'Reef sail photos', time: at(-1, 12, 5), unread: false, tag: 'Feedback',
      messages: [
        { from: 'them', text: 'Just got back from the reef sail, best week ever! Can I tag you in my photos?', time: at(-1, 12, 5) },
        { from: 'us', text: 'So glad you loved it Sienna! Please do tag @travelz.tours, we would love to share them.', time: at(-1, 12, 40) },
      ],
      suggestion: 'Would you be happy to leave a quick review too? It helps other travellers find us.' },
    { id: 'm5', channel: 'Email', who: T('Hamish'), subject: 'Balance payment for Uluru', time: at(-2, 10, 14), unread: false, tag: 'Payment',
      messages: [
        { from: 'them', text: 'Can I split my balance for Red Centre & Uluru into two payments?', time: at(-2, 10, 14) },
        { from: 'us', text: 'Of course, Hamish. I have set up two instalments, the first due this Friday. You will get a payment link by email.', time: at(-2, 11, 2) },
      ],
      suggestion: 'Friendly reminder: your first instalment is due this Friday. Here is your secure payment link.' },
    { id: 'm6', channel: 'Phone', who: T('Ruby'), subject: 'Call back: Italian Lakes', time: at(-2, 15, 30), unread: false, tag: 'New enquiry',
      messages: [
        { from: 'them', text: 'Missed call. Voicemail: interested in Italian Lakes by Rail for two, please call back after 3pm.', time: at(-2, 15, 30) },
      ],
      suggestion: 'Call Ruby after 3pm. Have the May and September departures ready, and mention the early bird saving of A$400 per person.' },
    { id: 'm7', channel: 'WhatsApp', who: T('Lachlan'), subject: 'Flight times', time: at(-3, 9, 3), unread: false, tag: 'Pre-departure',
      messages: [
        { from: 'them', text: 'Our flight lands in Hobart at 11:40, is that OK for the group pick-up?', time: at(-3, 9, 3) },
        { from: 'us', text: 'Perfect timing, the group transfer leaves the airport at 12:30.', time: at(-3, 9, 20) },
      ],
      suggestion: '' },
    { id: 'm8', channel: 'Web chat', who: T('Arjun'), subject: 'Vietnam visa question', time: at(-4, 18, 47), unread: false, tag: 'Pre-departure',
      messages: [
        { from: 'them', text: 'Do Australians need a visa for Vietnam North to South?', time: at(-4, 18, 47) },
        { from: 'us', text: 'Yes, an e-visa. We will email the step-by-step guide 90 days before departure.', time: at(-4, 19, 10) },
      ],
      suggestion: '' },
  ];

  // ---- Insights ----
  const monthNames = [];
  for (let k = 11; k >= 0; k--) { const d = new Date(today.getFullYear(), today.getMonth() - k, 1); monthNames.push(d); }
  const season = [1.25, 1.1, 1.05, 0.85, 0.7, 0.62, 0.66, 0.8, 0.95, 1.12, 1.28, 1.35];
  const monthly = monthNames.map((d) => {
    const s = season[d.getMonth()];
    return { month: d, thisYear: Math.round(168000 * s * (0.92 + rnd() * 0.16)), lastYear: Math.round(141000 * s * (0.9 + rnd() * 0.16)) };
  });
  const channels = [
    { name: 'Website', share: 36, color: '#2563eb' },
    { name: 'Instagram', share: 22, color: '#f59e0b' },
    { name: 'Repeat travellers', share: 18, color: '#10b981' },
    { name: 'Travel agents', share: 14, color: '#8b5cf6' },
    { name: 'Phone & email', share: 10, color: '#94a3b8' },
  ];
  const campaigns = [
    { name: 'Japan in autumn', channel: 'Google Search', spend: 4200, enquiries: 96, bookings: 14 },
    { name: 'Walk Tasmania reels', channel: 'Instagram', spend: 3100, enquiries: 141, bookings: 11 },
    { name: 'Spring newsletter', channel: 'Email', spend: 380, enquiries: 64, bookings: 9 },
    { name: 'Kimberley lookalike', channel: 'Facebook', spend: 2650, enquiries: 38, bookings: 2 },
    { name: 'Bali food creators', channel: 'Instagram', spend: 1800, enquiries: 72, bookings: 6 },
  ].map((c) => {
    const avgValue = 4200;
    return { ...c, cpb: c.bookings ? Math.round(c.spend / c.bookings) : 0, revenue: c.bookings * avgValue };
  });
  const reviews = [
    { who: 'Grace H.', trip: 'Red Centre & Uluru', stars: 5, text: 'Our guide made the desert come alive. Every detail was handled, we just turned up and enjoyed it.' },
    { who: 'Oliver W.', trip: 'Great Barrier Reef Sail', stars: 5, text: 'Small group, great food on board and the snorkelling spots were incredible.' },
    { who: 'Nina P.', trip: 'Vietnam North to South', stars: 4, text: 'Loved it. A free afternoon in Hoi An would have been the cherry on top.' },
  ];
  const destRevenue = trips.map((t) => ({ trip: t, value: live.filter((b) => b.dep.trip === t).reduce((s, b) => s + b.total, 0) })).sort((a, b) => b.value - a.value);

  window.TZ = {
    today, at, DAY, trips, tripById, team, travellers, departures, bookings, daily, pipeline, stages, tasks, threads,
    monthly, channels, campaigns, reviews, destRevenue, me: team[0],
  };
})();
