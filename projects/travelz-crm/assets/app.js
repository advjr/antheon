// Travelz CRM demo: renders every view from the sample data in data.js.
// Nothing is sent anywhere; actions that would change data show a note instead.
(function () {
  const D = window.TZ;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- Icons ----------
  const P = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    kanban: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 7v7M12 7v4M16 7v9"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    chev: '<path d="m9 18 6-6-6-6"/>', chevDown: '<path d="m6 9 6 6 6-6"/>', chevLeft: '<path d="m15 18-6-6 6-6"/>',
    more: '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
    note: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    spark: '<path d="m12 3 1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2-5.4A8.5 8.5 0 1 1 21 11.5z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
    insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    case: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    passport: '<rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8 17h8"/>',
    quote: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    bed: '<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    trend: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  };
  const I = (n) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ''}</svg>`;

  // ---------- Formatting ----------
  const aud = (n) => 'A$' + Math.round(n).toLocaleString('en-AU');
  const audK = (n) => (n >= 1e6 ? 'A$' + (n / 1e6).toFixed(2) + 'm' : n >= 1e4 ? 'A$' + (n / 1e3).toFixed(1) + 'k' : aud(n));
  const dm = (d) => d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  const wdm = (d) => d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
  const dmy = (d) => d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  const tm = (d) => d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' }).replace(' ', '').toLowerCase();
  const daysTo = (d) => Math.round((d - D.today) / D.DAY);
  const ago = (d) => {
    const m = Math.max(1, Math.round((D.today - d) / 6e4));
    if (m < 60) return m + 'm ago';
    const h = Math.round(m / 60);
    if (h < 24) return h + 'h ago';
    const dd = Math.round(h / 24);
    return dd === 1 ? 'Yesterday' : dd + ' days ago';
  };
  const hoursLabel = (h) => (h < 24 ? h + 'h' : Math.round(h / 24) + ' days');
  const av = (p, cls = '') => `<span class="av ${cls}" style="background:${p.color}" aria-hidden="true">${esc(p.initials)}</span>`;
  const ST = { 'Paid in full': 'st-paid', 'Deposit paid': 'st-deposit', 'Balance due': 'st-due', 'Awaiting deposit': 'st-await', Cancelled: 'st-cancel' };
  const status = (s) => `<span class="status ${ST[s] || 'st-await'}">${esc(s)}</span>`;
  const SRC = { Website: 'globe', Instagram: 'insta', Phone: 'phone', 'Travel agent': 'case', Email: 'mail', Referral: 'userPlus', WhatsApp: 'chat', 'Web chat': 'globe' };
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const fillColor = (f) => (f >= 1 ? '#15803d' : f >= 0.75 ? '#2563eb' : f >= 0.45 ? '#f59e0b' : '#dc2626');

  // ---------- Toast + drawer ----------
  const toastEl = $('#toast');
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }
  const DEMO_OFF = 'This is a demo, so changes are switched off.';
  const drawer = $('#drawer'), scrim = $('#scrim');
  function openDrawer(title, body, foot = '') {
    $('#drawerTitle').textContent = title;
    $('#drawerBody').innerHTML = body;
    $('#drawerFoot').innerHTML = foot;
    $('#drawerFoot').hidden = !foot;
    drawer.classList.add('open');
    scrim.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    $('#drawerClose').focus({ preventScroll: true });
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    scrim.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }
  $('#drawerClose').addEventListener('click', closeDrawer);
  scrim.addEventListener('click', closeDrawer);
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer(); });
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-demo]'); if (b) { e.preventDefault(); toast(b.dataset.demo || DEMO_OFF); } });
  const demoBtns = (a, b) => `<button type="button" class="btn btn-ghost" data-demo="">${a}</button><button type="button" class="btn btn-primary" data-demo="">${b}</button>`;

  // ---------- Header ----------
  const VIEWS = [
    { id: 'overview', label: 'Overview', icon: 'grid' },
    { id: 'pipeline', label: 'Pipeline', icon: 'kanban' },
    { id: 'departures', label: 'Departures', icon: 'calendar' },
    { id: 'travellers', label: 'Travellers', icon: 'users' },
    { id: 'inbox', label: 'Inbox', icon: 'inbox' },
    { id: 'insights', label: 'Insights', icon: 'chart' },
  ];
  const unread = D.threads.filter((t) => t.unread).length;
  $('#tabs').innerHTML = VIEWS.map((v) => `<button type="button" class="tab" role="tab" data-view="${v.id}" id="tab-${v.id}" aria-selected="false">${I(v.icon)}${v.label}${v.id === 'inbox' && unread ? `<span class="count">${unread}</span>` : ''}</button>`).join('');
  $('#team').innerHTML = D.team.map((m) => `<span class="av" style="background:${m.color}" title="${esc(m.name)}, ${esc(m.role)}">${m.initials}</span>`).join('') + `<button type="button" class="add" aria-label="Invite a teammate" data-demo="Inviting teammates is switched off in this demo.">${I('plus')}</button>`;
  $('#me').innerHTML = av(D.me);

  let view = 'overview';
  const rendered = {};
  function setView(v) {
    if (!VIEWS.some((x) => x.id === v)) v = 'overview';
    view = v;
    $$('.view').forEach((s) => { s.hidden = s.dataset.view !== v; });
    $$('#tabs .tab').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.view === v)));
    if (!rendered[v]) { RENDER[v]($('#v-' + v)); rendered[v] = true; }
    const tab = $('#tab-' + v);
    if (tab && tab.scrollIntoView) { const nav = $('#tabs'); if (nav.scrollWidth > nav.clientWidth) nav.scrollLeft = tab.offsetLeft - 40; }
    try { history.replaceState(null, '', v === 'overview' ? location.pathname : '#' + v); } catch (e) {}
  }
  $('#tabs').addEventListener('click', (e) => { const b = e.target.closest('.tab'); if (b) { setView(b.dataset.view); scrollTo({ top: 0 }); } });
  window.setView = setView;
  window.getView = () => view;

  $('#bellBtn').addEventListener('click', () => {
    const first = D.bookings.find((b) => b.status !== 'Cancelled');
    const jp = D.departures.find((d) => d.trip.id === 'jpn');
    const due = D.bookings.filter((b) => b.status === 'Balance due');
    const items = [
      { icon: 'plane', t: `New booking: ${first.traveller.name}`, s: `${first.dep.trip.name}, ${first.pax} ${first.pax > 1 ? 'travellers' : 'traveller'}, ${aud(first.total)}`, when: ago(first.bookedAt) },
      { icon: 'alert', t: `${jp.cap - jp.booked} seats left on ${jp.trip.name}`, s: `Departs ${wdm(jp.start)}`, when: '2h ago' },
      { icon: 'card', t: `${due.length} balances still due`, s: `${aud(due.reduce((s, b) => s + b.total - b.paid, 0))} outstanding`, when: 'Today' },
      { icon: 'star', t: 'New 5 star review', s: '"Our guide made the desert come alive."', when: 'Yesterday' },
    ];
    openDrawer('Notifications', items.map((n) => `<div class="task" style="grid-template-columns:34px 1fr;cursor:default"><span class="task-ic">${I(n.icon)}</span><span><span class="task-t">${esc(n.t)}</span><span class="task-s">${esc(n.s)} · ${esc(n.when)}</span></span></div>`).join(''));
  });

  // ---------- Booking drawer ----------
  function bookingDrawer(b) {
    const d = b.dep;
    const owing = b.total - b.paid;
    openDrawer(b.ref, `
      <div class="prof">${av(b.traveller)}<div><b>${esc(b.traveller.name)}</b><span>${esc(b.traveller.email)} · ${esc(b.traveller.city)}</span></div></div>
      <div class="kv">
        <div><span>Trip</span><b>${esc(d.trip.name)}</b></div>
        <div><span>Departs</span><b>${wdm(d.start)}</b></div>
        <div><span>Travellers</span><b>${b.pax}</b></div>
        <div><span>Status</span><b>${status(b.status)}</b></div>
        <div><span>Total</span><b>${aud(b.total)}</b></div>
        <div><span>Still to pay</span><b>${aud(owing)}</b></div>
      </div>
      ${b.note ? `<p class="sec-t">Note</p><p class="muted">${esc(b.note)}</p>` : ''}
      <p class="sec-t">History</p>
      <div class="timeline">
        <div>Booking made online<small>${dmy(b.bookedAt)}, ${tm(b.bookedAt)}</small></div>
        ${b.paid ? `<div>Payment received: ${aud(b.paid)}<small>${dmy(new Date(b.bookedAt.getTime() + D.DAY))}</small></div>` : ''}
        ${b.status === 'Balance due' ? `<div>Balance reminder sent<small>3 days ago</small></div>` : ''}
        ${b.status === 'Cancelled' ? `<div>Cancelled at the traveller's request<small>${dm(new Date(b.bookedAt.getTime() + 3 * D.DAY))}</small></div>` : ''}
      </div>`, demoBtns('Add note', b.status === 'Balance due' ? 'Send reminder' : 'Email traveller'));
  }

  // ---------- AI answers ----------
  const AI = {
    week() {
      const wk = D.bookings.filter((b) => b.status !== 'Cancelled' && daysTo(b.bookedAt) >= -6);
      const pax = wk.reduce((s, b) => s + b.pax, 0);
      const rev = wk.reduce((s, b) => s + b.total, 0);
      const byTrip = {};
      wk.forEach((b) => { byTrip[b.dep.trip.name] = (byTrip[b.dep.trip.name] || 0) + b.pax; });
      const top = Object.entries(byTrip).sort((a, b) => b[1] - a[1])[0];
      const leaving = D.departures.filter((d) => daysTo(d.start) >= 0 && daysTo(d.start) <= 7);
      const due = D.bookings.filter((b) => b.status === 'Balance due');
      return `Here is your week so far:\n\n<b>${wk.length} bookings</b> for ${pax} travellers, worth <b>${aud(rev)}</b>. ${top ? `${esc(top[0])} sold best with ${top[1]} seats.` : ''}\n\n<b>${D.pipeline.filter((p) => p.stage === 'New enquiry').length} new enquiries</b> are waiting in the pipeline.\n\n${leaving.length} ${leaving.length === 1 ? 'departure leaves' : 'departures leave'} in the next 7 days: ${leaving.map((d) => esc(d.trip.name)).join(', ') || 'none'}.\n\n<b>${due.length} balances</b> are still due, ${aud(due.reduce((s, b) => s + b.total - b.paid, 0))} in total.`;
    },
    draft() {
      const l = D.pipeline.filter((p) => p.stage === 'Quote sent').sort((a, b) => b.age - a.age)[0];
      const dep = D.departures.find((d) => d.trip === l.trip && daysTo(d.start) > 14);
      const left = dep ? dep.cap - dep.booked : 0;
      return `Here is a follow-up for <b>${esc(l.traveller.name)}</b>, whose quote for ${esc(l.trip.name)} went out ${hoursLabel(l.age)} ago:\n\nHi ${esc(l.traveller.first)},\n\nJust checking in on the ${esc(l.trip.name)} quote I sent through. ${dep ? `The ${dm(dep.start)} departure has ${left} ${left === 1 ? 'seat' : 'seats'} left, so I can hold ${l.pax > 1 ? l.pax + ' places' : 'a place'} for you for 48 hours if that helps.` : 'Happy to suggest dates that suit you.'}\n\nA ${aud(l.trip.price * 0.25 * l.pax)} deposit secures it, and the balance is due 60 days before departure.\n\nWarm regards,\n${esc(D.me.name)}`;
    },
    fill() {
      const c = D.departures.filter((d) => daysTo(d.start) >= 14 && daysTo(d.start) <= 75 && d.booked < d.cap).sort((a, b) => a.booked / a.cap - b.booked / b.cap)[0];
      const interested = D.pipeline.filter((p) => p.trip === c.trip).length;
      const subs = D.travellers.filter((t) => t.newsletter).length;
      return `<b>${esc(c.trip.name)}</b> on ${wdm(c.start)} is the emptiest departure coming up: <b>${c.booked} of ${c.cap} seats</b> sold with ${daysTo(c.start)} days to go.\n\nThree ideas:\n1. Email the ${interested} people who asked about this trip, with a 48 hour seat hold.\n2. Send a last-call note to ${subs} newsletter subscribers who have travelled with us before.\n3. Offer A$200 off when two book together. Pairs fill seats fastest on this trip.\n\nFilling ${c.cap - c.booked} seats adds about <b>${aud((c.cap - c.booked) * c.trip.price)}</b>.`;
    },
    risk() {
      const r = D.bookings.filter((b) => b.status === 'Balance due' || b.status === 'Awaiting deposit').sort((a, b) => a.dep.start - b.dep.start);
      const total = r.reduce((s, b) => s + b.total - b.paid, 0);
      return `<b>${r.length} bookings</b> still owe money, <b>${aud(total)}</b> in total. The most urgent:\n\n${r.slice(0, 4).map((b, i) => `${i + 1}. ${esc(b.traveller.name)}, ${esc(b.dep.trip.name)}, departs in ${daysTo(b.dep.start)} days: ${aud(b.total - b.paid)} (${b.status.toLowerCase()})`).join('\n')}\n\nI would call the first two today. They leave soonest and reminders by email have not worked yet.`;
    },
  };
  const AI_TILES = [
    { key: 'week', label: 'Summarise my week', icon: 'spark', bg: '#eef3ff', fg: '#2563eb' },
    { key: 'draft', label: 'Draft a follow-up', icon: 'pen', bg: '#fff5e1', fg: '#b45309' },
    { key: 'fill', label: 'Fill a departure', icon: 'users', bg: '#e7f6ec', fg: '#15803d' },
    { key: 'risk', label: 'Spot payment risks', icon: 'alert', bg: '#fdeceb', fg: '#dc2626' },
  ];

  // =====================================================================
  // Overview
  // =====================================================================
  function renderOverview(el) {
    const live = D.bookings.filter((b) => b.status !== 'Cancelled');
    const inRange = (b, a, z) => { const n = daysTo(b.bookedAt); return n > a && n <= z; };
    const rev30 = live.filter((b) => inRange(b, -30, 0)).reduce((s, b) => s + b.total, 0);
    const revPrev = live.filter((b) => inRange(b, -60, -30)).reduce((s, b) => s + b.total, 0);
    const pax30 = live.filter((b) => inRange(b, -30, 0)).reduce((s, b) => s + b.pax, 0);
    const paxPrev = live.filter((b) => inRange(b, -60, -30)).reduce((s, b) => s + b.pax, 0);
    const next60 = D.departures.filter((d) => daysTo(d.start) >= 0 && daysTo(d.start) <= 60);
    const seats = next60.reduce((s, d) => s + d.booked, 0), cap = next60.reduce((s, d) => s + d.cap, 0);
    const revD = pct(rev30 - revPrev, revPrev), paxD = paxPrev ? pax30 - paxPrev : 0;
    const nextDep = D.departures.find((d) => daysTo(d.start) >= 0);
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    el.innerHTML = `
      <div class="page-head">
        <div><h1>${greet}, ${esc(D.me.name.split(' ')[0])}</h1><p>Here is how Travelz is tracking on ${D.today.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}.</p></div>
        <div class="chips"><span class="chip">${I('plane')} Next departure <b>${esc(nextDep.trip.name)}</b> in ${daysTo(nextDep.start)} days</span></div>
      </div>
      <div class="ov">
        <div class="ov-stats" id="ovStats">
          <div class="card stat"><div class="stat-h">Revenue booked <span class="delta ${revD >= 0 ? 'up' : 'down'}">${revD >= 0 ? '+' : ''}${revD}%</span></div><div class="stat-v"><b>${audK(rev30)}</b><span>Last 30 days, vs ${audK(revPrev)}</span></div></div>
          <div class="card stat"><div class="stat-h">Travellers booked <span class="delta ${paxD >= 0 ? 'up' : 'down'}">${paxD >= 0 ? '+' : ''}${paxD}</span></div><div class="stat-v"><b>${pax30}</b><span>Last 30 days, vs ${paxPrev}</span></div></div>
          <div class="card stat"><div class="stat-h">Seats filled <span class="delta up">${next60.length} trips</span></div><div class="stat-v"><b>${pct(seats, cap)}%</b><span>${seats} of ${cap}, next 60 days</span></div><div class="stat-bar"><i style="width:${pct(seats, cap)}%"></i></div></div>
        </div>

        <div class="card ov-chart" id="ovChart">
          <div class="card-h"><h2>Revenue analytics</h2><div class="chips"><button type="button" class="select" data-demo="Other measures are switched off in this demo.">Bookings value ${I('chevDown')}</button><button type="button" class="select" data-demo="Other date ranges are switched off in this demo.">Last 21 days + forecast ${I('chevDown')}</button></div></div>
          <div class="rev">
            <div class="rev-side">
              <div class="legend"><span><i style="background:#2563eb"></i>Actual</span><span><i style="background:#f5b544"></i>AI projected</span></div>
              <div class="rev-total" id="revSel"></div>
              <div class="ai-tip">${I('spark')}<span id="revTip"></span></div>
              <button type="button" class="btn btn-primary" id="runAnalysis">${I('bolt')} Run analysis</button>
            </div>
            <div id="dotsWrap"></div>
          </div>
        </div>

        <div class="card ov-tasks" id="ovTasks">
          <div class="card-h"><h2>Priority tasks</h2><button type="button" class="link" data-demo="The full task list is switched off in this demo.">See all</button></div>
          <div class="tasks">${D.tasks.map((t, i) => {
            const f = t.total ? t.done / t.total : 0;
            const C = 2 * Math.PI * 9;
            return `<button type="button" class="task" data-i="${i}"><span class="task-ic">${I(t.icon)}</span><span><span class="task-t">${esc(t.title)} <span class="task-meta">${I('calendar')}${dm(t.date)}</span> <span class="task-meta"><svg class="ring" viewBox="0 0 22 22"><circle cx="11" cy="11" r="9" fill="none" stroke="#e5eaf4" stroke-width="3"/><circle cx="11" cy="11" r="9" fill="none" stroke="${f >= 1 ? '#15803d' : '#2563eb'}" stroke-width="3" stroke-dasharray="${C * f} ${C}" stroke-linecap="round" transform="rotate(-90 11 11)"/></svg>${t.done}/${t.total} done</span></span><span class="task-s">${esc(t.sub)}</span></span><span class="chev">${I('chev')}</span></button>`;
          }).join('')}</div>
        </div>

        <div class="card ov-table" id="ovTable">
          <div class="card-h"><h2>Manage bookings</h2><label class="search">${I('search')}<input type="search" id="bkSearch" placeholder="Search bookings" aria-label="Search bookings"></label></div>
          <div class="seg" id="bkSeg" style="margin-bottom:8px"></div>
          <div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Traveller</th><th>Trip</th><th>Note</th><th>Departs</th><th>Amount</th><th>Status</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody id="bkBody"></tbody></table></div>
          <div class="tbl-foot"><span id="bkCount"></span><button type="button" class="link" id="bkMore">Show all ${I('chevDown')}</button></div>
        </div>

        <div class="card ov-ai ai-card" id="ovAi"></div>
      </div>`;

    // ----- Dot chart -----
    let sel = D.daily.findIndex((x) => x.today);
    function drawDots() {
      const wrapW = $('#dotsWrap', el).clientWidth || 640;
      const W = Math.max(300, Math.min(700, wrapW)), H = W < 480 ? 200 : 236, L = 44, B = 26, T = 22;
      const n = D.daily.length, colW = (W - L) / n;
      const max = Math.max(...D.daily.map((x) => x.value));
      const step = Math.max(1000, Math.ceil(max / 12 / 1000) * 1000);
      const rows = Math.ceil(max / step);
      const dy = Math.min(15, (H - B - T) / rows);
      const r = Math.min(6.2, colW / 2 - 1.2, dy / 2 - 0.6);
      let s = `<svg class="dots-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Revenue booked per day for the last 21 days, and a projection for the next 9 days">`;
      [0, Math.round(rows / 2), rows].forEach((k) => {
        const y = H - B - k * dy;
        s += `<line class="axis" x1="${L}" x2="${W}" y1="${y - dy / 2}" y2="${y - dy / 2}"/><text x="0" y="${y - dy / 2 + 4}">${k ? 'A$' + Math.round((k * step) / 1000) + 'k' : 'A$0'}</text>`;
      });
      D.daily.forEach((x, i) => {
        const cx = L + colW * i + colW / 2;
        const k = Math.max(x.value ? 1 : 0, Math.round(x.value / step));
        const on = i === sel;
        const col = x.projected ? (on ? '#f59e0b' : '#fde3ae') : on ? '#2563eb' : '#a9c2fb';
        for (let j = 0; j < k; j++) s += `<circle cx="${cx}" cy="${H - B - j * dy - dy / 2}" r="${r}" fill="${col}"${x.projected && !on ? ' stroke="#f5b544" stroke-width="1"' : ''}/>`;
        if (!k) s += `<circle cx="${cx}" cy="${H - B - dy / 2}" r="${r * 0.45}" fill="#e5eaf4"/>`;
        s += `<rect x="${cx - colW / 2}" y="${T - 10}" width="${colW}" height="${H - T - 4}" fill="transparent" data-i="${i}" style="cursor:pointer"><title>${wdm(x.date)}: ${aud(x.value)}${x.projected ? ' (projected)' : ''}</title></rect>`;
        if (i % (W < 480 ? 7 : 5) === 0 || on) {
          const lbl = x.today ? 'Today' : dm(x.date);
          if (on) s += `<rect x="${cx - 26}" y="${H - 17}" width="52" height="17" rx="8.5" fill="${x.projected ? '#f59e0b' : '#2563eb'}"/><text x="${cx}" y="${H - 5}" text-anchor="middle" style="fill:#fff;font-weight:800">${lbl}</text>`;
          else if (Math.abs(i - sel) > 2) s += `<text x="${cx}" y="${H - 5}" text-anchor="middle">${lbl}</text>`;
        }
      });
      const sx = L + colW * sel + colW / 2;
      const top = H - B - Math.max(1, Math.round(D.daily[sel].value / step)) * dy;
      s += `<line x1="${L}" x2="${sx}" y1="${top}" y2="${top}" stroke="${D.daily[sel].projected ? '#f59e0b' : '#2563eb'}" stroke-dasharray="3 3"/>`;
      s += `<rect x="${L - 2}" y="${top - 9}" width="48" height="18" rx="6" fill="${D.daily[sel].projected ? '#f59e0b' : '#2563eb'}"/><text x="${L + 22}" y="${top + 4}" text-anchor="middle" style="fill:#fff;font-weight:800">${audK(D.daily[sel].value).replace('A$', '$')}</text>`;
      s += '</svg>';
      $('#dotsWrap', el).innerHTML = s;
      const x = D.daily[sel];
      const actual = D.daily.filter((d) => !d.projected).reduce((a, d) => a + d.value, 0);
      const proj = D.daily.filter((d) => d.projected).reduce((a, d) => a + d.value, 0);
      $('#revSel', el).innerHTML = `<b>${aud(x.value)}</b><span>${x.projected ? 'Projected for' : 'Booked on'} ${wdm(x.date)}</span>`;
      $('#revTip', el).textContent = `${aud(actual)} booked in 21 days. The next 9 days should add about ${audK(proj)}, mostly from Japan Autumn Colours and the Bali trips.`;
    }
    drawDots();
    let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(drawDots, 150); });
    $('#dotsWrap', el).addEventListener('click', (e) => { const r = e.target.closest('rect[data-i]'); if (r) { sel = +r.dataset.i; drawDots(); } });
    $('#runAnalysis', el).addEventListener('click', () => { askAI('fill', 'Which departure should we fill next?'); $('#ovAi').scrollIntoView({ behavior: 'smooth', block: 'center' }); });

    $$('.task', el).forEach((b) => b.addEventListener('click', () => { const t = D.tasks[+b.dataset.i]; setView(t.view); scrollTo({ top: 0 }); }));

    // ----- Bookings table -----
    const FILTERS = [
      { id: 'action', label: 'Needs action', test: (b) => b.status === 'Balance due' || b.status === 'Awaiting deposit' },
      { id: 'soon', label: 'Departing soon', test: (b) => b.status !== 'Cancelled' && daysTo(b.dep.start) >= 0 && daysTo(b.dep.start) <= 30 },
      { id: 'paid', label: 'Paid in full', test: (b) => b.status === 'Paid in full' },
      { id: 'cancel', label: 'Cancelled', test: (b) => b.status === 'Cancelled' },
      { id: 'all', label: 'All', test: () => true },
    ];
    let filt = 'action', all = false, q = '';
    $('#bkSeg', el).innerHTML = FILTERS.map((f) => `<button type="button" data-f="${f.id}" aria-pressed="${f.id === filt}">${f.label} <span class="n">${D.bookings.filter(f.test).length}</span></button>`).join('');
    function drawTable() {
      const f = FILTERS.find((x) => x.id === filt);
      let rows = D.bookings.filter(f.test);
      if (q) rows = rows.filter((b) => (b.traveller.name + ' ' + b.dep.trip.name + ' ' + b.ref).toLowerCase().includes(q));
      if (filt === 'soon' || filt === 'action') rows = rows.slice().sort((a, b) => a.dep.start - b.dep.start);
      const shown = all ? rows.slice(0, 40) : rows.slice(0, 6);
      $('#bkBody', el).innerHTML = shown.map((b) => `<tr data-ref="${b.ref}">
        <td class="c-who"><div class="who">${av(b.traveller)}<div><b>${esc(b.traveller.name)}</b><small>${esc(b.traveller.email)}</small></div></div></td>
        <td class="c-trip tcell"><b>${esc(b.dep.trip.name)}</b><small>${b.pax} ${b.pax > 1 ? 'travellers' : 'traveller'} · ${esc(b.ref)}</small></td>
        <td class="c-note"><span class="note-ic ${b.note ? 'has' : ''}" title="${esc(b.note || 'No note')}">${I('note')}</span></td>
        <td class="c-sm ind" data-l="Departs">${dm(b.dep.start)}</td>
        <td class="c-sm num" data-l="Amount">${aud(b.total)}</td>
        <td class="c-status">${status(b.status)}</td>
        <td class="c-more"><button type="button" class="more" aria-label="More actions" data-demo="">${I('more')}</button></td></tr>`).join('') || `<tr><td colspan="7" class="muted" style="padding:20px 10px">No bookings match.</td></tr>`;
      $('#bkCount', el).textContent = `Showing ${shown.length} of ${rows.length}`;
      $('#bkMore', el).hidden = rows.length <= 6;
      $('#bkMore', el).innerHTML = all ? `Show fewer ${I('chev')}` : `Show all ${I('chevDown')}`;
    }
    drawTable();
    $('#bkSeg', el).addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; filt = b.dataset.f; all = false; $$('#bkSeg button', el).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); drawTable(); });
    $('#bkSearch', el).addEventListener('input', (e) => { q = e.target.value.trim().toLowerCase(); drawTable(); });
    $('#bkMore', el).addEventListener('click', () => { all = !all; drawTable(); });
    $('#bkBody', el).addEventListener('click', (e) => { if (e.target.closest('.more')) return; const tr = e.target.closest('tr[data-ref]'); if (tr) bookingDrawer(D.bookings.find((b) => b.ref === tr.dataset.ref)); });

    // ----- AI assistant -----
    const ai = $('#ovAi', el);
    function aiHome() {
      ai.innerHTML = `
        <p class="ai-hi">Hi, ${esc(D.me.name.split(' ')[0])} 👋</p>
        <h2 class="ai-q">How can I help you?</h2>
        <div class="ai-modes" role="group" aria-label="Assistant"><button type="button" class="ai-mode" aria-pressed="true">${I('spark')} Travelz AI</button><button type="button" class="ai-mode" aria-pressed="false" data-demo="Saved templates are switched off in this demo.">${I('note')} Templates</button><button type="button" class="ai-mode" aria-pressed="false" data-demo="Chat history is switched off in this demo.">${I('clock')} History</button></div>
        <div class="ai-tiles">${AI_TILES.map((t) => `<button type="button" class="ai-tile" data-k="${t.key}"><span class="ti" style="background:${t.bg};color:${t.fg}">${I(t.icon)}</span>${t.label}</button>`).join('')}</div>
        <form class="ai-ask" id="aiForm"><input id="aiInput" placeholder="Ask something…" aria-label="Ask Travelz AI" autocomplete="off"><button type="submit" aria-label="Send">${I('send')}</button></form>`;
      $$('.ai-tile', ai).forEach((b) => b.addEventListener('click', () => askAI(b.dataset.k, b.textContent.trim())));
      $('#aiForm', ai).addEventListener('submit', (e) => {
        e.preventDefault();
        const v = $('#aiInput', ai).value.trim();
        if (!v) return;
        const k = /week|summar|how.*going/i.test(v) ? 'week' : /follow|email|draft|write/i.test(v) ? 'draft' : /fill|empty|seat|departure/i.test(v) ? 'fill' : /pay|owe|balance|risk|deposit/i.test(v) ? 'risk' : null;
        askAI(k, v);
      });
    }
    window.askAI = askAI;
    function askAI(k, question) {
      ai.innerHTML = `<button type="button" class="ai-back">${I('chevLeft')} New question</button><div class="ai-chat" id="aiChat"><div class="bubble me">${esc(question)}</div><div class="bubble bot"><span class="typing"><i></i><i></i><i></i></span></div></div>
        <form class="ai-ask" id="aiForm2"><input placeholder="Ask a follow-up…" aria-label="Ask a follow-up" autocomplete="off"><button type="submit" aria-label="Send">${I('send')}</button></form>`;
      $('.ai-back', ai).addEventListener('click', aiHome);
      $('#aiForm2', ai).addEventListener('submit', (e) => { e.preventDefault(); toast('In this demo the assistant answers its four suggested questions.'); });
      setTimeout(() => {
        const bot = $('.bubble.bot', ai);
        if (!bot) return;
        bot.innerHTML = k ? AI[k]() : 'In this demo I can answer the four suggested questions: a summary of your week, a follow-up email, which departure to fill, and who still owes money. Pick one and I will work it out from the live numbers.';
      }, 1100);
    }
    aiHome();
  }

  // =====================================================================
  // Pipeline
  // =====================================================================
  function renderPipeline(el) {
    const COLORS = { 'New enquiry': '#2563eb', 'Quote sent': '#8b5cf6', 'Following up': '#f59e0b', 'Ready to book': '#15803d' };
    const total = D.pipeline.reduce((s, p) => s + p.value, 0);
    const sources = ['All', ...new Set(D.pipeline.map((p) => p.source))];
    let src = 'All';
    el.innerHTML = `
      <div class="page-head"><div><h1>Pipeline</h1><p>Every enquiry, from first message to booking. Hot leads are the ones to call first.</p></div>
        <div class="chips"><span class="chip">Open enquiries <b>${D.pipeline.length}</b></span><span class="chip">Pipeline value <b>${audK(total)}</b></span><span class="chip">${I('clock')} Average first reply <b>1h 48m</b></span></div></div>
      <div class="seg" id="srcSeg" style="margin:0 2px 12px">${sources.map((s) => `<button type="button" data-s="${s}" aria-pressed="${s === src}">${s !== 'All' ? I(SRC[s]) : ''}${s}</button>`).join('')}</div>
      <div class="board" id="board"></div>`;
    function draw() {
      const list = D.pipeline.filter((p) => src === 'All' || p.source === src);
      $('#board', el).innerHTML = D.stages.map((st) => {
        const items = list.filter((p) => p.stage === st);
        return `<div class="col" data-stage="${esc(st)}"><div class="col-h"><b><i style="background:${COLORS[st]}"></i>${st}</b><span>${items.length} · ${audK(items.reduce((s, p) => s + p.value, 0))}</span></div>
          ${items.map((p) => `<button type="button" class="lead" data-id="${p.id}"><div class="lead-top"><span class="src">${I(SRC[p.source])}${p.source}</span>${p.hot ? '<span class="hot">Hot</span>' : ''}</div><h3>${esc(p.traveller.name)}</h3><p>${esc(p.trip.name)} · ${p.pax} ${p.pax > 1 ? 'people' : 'person'}</p><div class="lead-foot"><b class="num">${aud(p.value)}</b><span class="muted">${hoursLabel(p.age)}</span>${av(p.owner)}</div></button>`).join('') || '<p class="muted" style="padding:10px 4px;font-size:13px">Nothing here.</p>'}</div>`;
      }).join('');
    }
    draw();
    $('#srcSeg', el).addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; src = b.dataset.s; $$('#srcSeg button', el).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); });
    $('#board', el).addEventListener('click', (e) => {
      const c = e.target.closest('.lead'); if (!c) return;
      const p = D.pipeline.find((x) => x.id === c.dataset.id);
      const next = { 'New enquiry': 'Reply within the hour with two departure options and a seat hold.', 'Quote sent': 'Follow up with a short note. Quotes answered within 3 days convert twice as often.', 'Following up': 'Call rather than email. Mention how many seats are left.', 'Ready to book': 'Send the deposit link and hold the seats for 48 hours.' }[p.stage];
      openDrawer('Enquiry', `
        <div class="prof">${av(p.traveller)}<div><b>${esc(p.traveller.name)}</b><span>${esc(p.traveller.city)} · ${esc(p.traveller.phone)}</span></div></div>
        <div class="kv"><div><span>Interested in</span><b>${esc(p.trip.name)}</b></div><div><span>Group size</span><b>${p.pax}</b></div><div><span>Value</span><b>${aud(p.value)}</b></div><div><span>Stage</span><b>${esc(p.stage)}</b></div></div>
        <p class="sec-t">They asked</p><p class="muted">"${esc(p.ask)}"</p>
        <div class="suggest" style="margin:14px 0"><div class="suggest-h"><span>${I('spark')} Suggested next step</span></div>${esc(next)}</div>
        <p class="sec-t">Timeline</p>
        <div class="timeline"><div>Enquiry via ${esc(p.source.toLowerCase())}<small>${hoursLabel(p.age)} ago</small></div>${p.stage !== 'New enquiry' ? `<div>Quote sent by ${esc(p.owner.name)}<small>${hoursLabel(Math.max(1, p.age - 20))} ago</small></div>` : ''}${p.stage === 'Following up' || p.stage === 'Ready to book' ? '<div>Follow-up call<small>Yesterday</small></div>' : ''}</div>`,
        demoBtns('Send quote', 'Mark as booked'));
    });
  }

  // =====================================================================
  // Departures
  // =====================================================================
  function renderDepartures(el) {
    const upcoming = D.departures.filter((d) => daysTo(d.start) >= -1);
    let sel = upcoming[0];
    let month = new Date(D.today.getFullYear(), D.today.getMonth(), 1);
    const n60 = D.departures.filter((d) => daysTo(d.start) >= 0 && daysTo(d.start) <= 60);
    el.innerHTML = `
      <div class="page-head"><div><h1>Departures</h1><p>Every trip on the calendar, how full it is and what still needs doing before it leaves.</p></div>
        <div class="chips"><span class="chip">Next 60 days <b>${n60.length} departures</b></span><span class="chip">Seats filled <b>${pct(n60.reduce((s, d) => s + d.booked, 0), n60.reduce((s, d) => s + d.cap, 0))}%</b></span><span class="chip">Sold out <b>${D.departures.filter((d) => d.booked >= d.cap).length}</b></span></div></div>
      <div class="dep-grid">
        <div class="card" id="calCard">
          <div class="cal-h"><h2 id="calTitle"></h2><div class="cal-nav"><button type="button" class="icon-btn" id="calPrev" aria-label="Previous month">${I('chevLeft')}</button><button type="button" class="icon-btn" id="calNext" aria-label="Next month">${I('chev')}</button></div></div>
          <div class="cal" id="cal"></div>
          <p class="sec-t" style="margin-top:18px">Coming up</p>
          <div class="up-list" id="upList"></div>
        </div>
        <div class="card" id="depDetail"></div>
      </div>`;
    function drawCal() {
      $('#calTitle', el).textContent = month.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
      const first = new Date(month);
      const start = new Date(first); start.setDate(1 - ((first.getDay() + 6) % 7));
      let h = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => `<div class="dow">${d}</div>`).join('');
      for (let k = 0; k < 42; k++) {
        const day = new Date(start); day.setDate(start.getDate() + k);
        if (k >= 35 && day.getMonth() !== month.getMonth()) break;
        const out = day.getMonth() !== month.getMonth();
        const isToday = day.toDateString() === D.today.toDateString();
        const deps = D.departures.filter((d) => d.start.toDateString() === day.toDateString());
        h += `<div class="d${out ? ' out' : ''}${isToday ? ' today' : ''}"><span class="n">${day.getDate()}</span>${deps.map((d) => `<button type="button" class="dchip" data-id="${d.id}" style="background:${d.trip.color}" aria-pressed="${d === sel}" title="${esc(d.trip.name)}, ${d.booked}/${d.cap} seats">${esc(d.trip.name.split(' ').slice(0, 2).join(' '))}</button>`).join('')}</div>`;
      }
      $('#cal', el).innerHTML = h;
    }
    function drawList() {
      $('#upList', el).innerHTML = upcoming.slice(0, 8).map((d) => {
        const f = d.booked / d.cap;
        return `<button type="button" class="upc" data-id="${d.id}" aria-pressed="${d === sel}"><span class="datebox"><b>${d.start.getDate()}</b><span>${d.start.toLocaleDateString('en-AU', { month: 'short' })}</span></span><span><h3>${esc(d.trip.name)}</h3><p>${d.trip.days} days · ${esc(d.trip.dest)} · in ${daysTo(d.start)} days</p></span><span class="seats" style="color:${fillColor(f)}">${d.booked >= d.cap ? 'Sold out' : d.booked + '/' + d.cap}<small class="muted">seats</small><span class="minibar"><i style="width:${Math.min(100, f * 100)}%;background:${fillColor(f)}"></i></span></span></button>`;
      }).join('');
    }
    function drawDetail() {
      const d = sel, f = d.booked / d.cap, C = 2 * Math.PI * 40;
      const rev = d.bookings.reduce((s, b) => s + b.total, 0), paid = d.bookings.reduce((s, b) => s + b.paid, 0);
      const intl = d.trip.country !== 'Australia';
      const dt = daysTo(d.start);
      const checks = [
        { t: `Final payments collected (${d.bookings.filter((b) => b.status === 'Paid in full').length}/${d.bookings.length})`, ok: d.bookings.every((b) => b.status === 'Paid in full') },
        intl ? { t: 'Passport details received', ok: dt > 60 || d.trip.id !== 'jpn' } : { t: 'Park passes booked', ok: true },
        { t: `Room list sent to ${intl ? 'hotels' : 'the lodge'}`, ok: d.hotel === 'Confirmed' },
        { t: 'Pre-departure pack emailed', ok: dt < 30 },
        { t: `Guide confirmed: ${d.guide}`, ok: true },
      ];
      $('#depDetail', el).innerHTML = `
        <div class="dep-top"><div class="fill-ring"><svg viewBox="0 0 96 96"><circle cx="48" cy="48" r="40" fill="none" stroke="#eef3ff" stroke-width="10"/><circle cx="48" cy="48" r="40" fill="none" stroke="${fillColor(f)}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C * Math.min(1, f)} ${C}"/></svg><b>${pct(d.booked, d.cap)}%</b><small>${d.booked}/${d.cap}</small></div>
          <div><h2>${esc(d.trip.name)}</h2><p>${wdm(d.start)} to ${wdm(d.end)} · ${d.trip.days} days</p><p>${I('pin').replace('class="i"', 'class="i" style="width:14px;height:14px;vertical-align:-2px"')} ${esc(d.trip.dest)}, ${esc(d.trip.country)}</p></div></div>
        <div class="kv"><div><span>Revenue</span><b>${aud(rev)}</b></div><div><span>Paid so far</span><b>${pct(paid, rev)}%</b></div><div><span>Price per person</span><b>${aud(d.trip.price)}</b></div><div><span>Leaves in</span><b>${dt} days</b></div></div>
        <p class="sec-t">Before departure</p>
        <div class="checklist">${checks.map((c) => `<div class="check ${c.ok ? 'ok' : ''}"><i>${c.ok ? I('check') : ''}</i>${esc(c.t)}</div>`).join('')}</div>
        <p class="sec-t">Travellers <span class="muted">${d.booked} booked</span></p>
        <div class="manifest">${d.bookings.map((b) => `<div class="mrow"><div class="who">${av(b.traveller)}<div><b style="font-size:13.5px">${esc(b.traveller.name)}${b.pax > 1 ? ' +1' : ''}</b></div></div>${status(b.status)}</div>`).join('')}</div>`;
    }
    function select(id) {
      sel = D.departures.find((x) => x.id === id);
      drawCal(); drawList(); drawDetail();
      if (innerWidth < 1100) $('#depDetail', el).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    drawCal(); drawList(); drawDetail();
    $('#calPrev', el).addEventListener('click', () => { month.setMonth(month.getMonth() - 1); drawCal(); });
    $('#calNext', el).addEventListener('click', () => { month.setMonth(month.getMonth() + 1); drawCal(); });
    el.addEventListener('click', (e) => { const b = e.target.closest('.dchip, .upc'); if (b) select(b.dataset.id); });
  }

  // =====================================================================
  // Travellers
  // =====================================================================
  function renderTravellers(el) {
    const T = D.travellers.slice().sort((a, b) => b.spend - a.spend);
    const FILTERS = [
      { id: 'all', label: 'All', test: () => true },
      { id: 'repeat', label: 'Repeat', test: (t) => t.repeat },
      { id: 'vip', label: 'VIP', test: (t) => t.vip },
      { id: 'news', label: 'Newsletter', test: (t) => t.newsletter },
    ];
    let f = 'all', q = '';
    const avgLtv = T.reduce((s, t) => s + t.spend, 0) / T.length;
    el.innerHTML = `
      <div class="page-head"><div><h1>Travellers</h1><p>Everyone who has booked with Travelz, what they have spent and where they are going next.</p></div>
        <div class="chips"><span class="chip">Travellers <b>${T.length}</b></span><span class="chip">Come back again <b>${pct(T.filter((t) => t.repeat).length, T.length)}%</b></span><span class="chip">Average lifetime value <b>${audK(avgLtv)}</b></span></div></div>
      <div class="card">
        <div class="trav-tools"><div class="seg" id="tvSeg">${FILTERS.map((x) => `<button type="button" data-f="${x.id}" aria-pressed="${x.id === f}">${x.label} <span class="n">${T.filter(x.test).length}</span></button>`).join('')}</div>
          <label class="search">${I('search')}<input type="search" id="tvSearch" placeholder="Search travellers" aria-label="Search travellers"></label></div>
        <div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Traveller</th><th>Next trip</th><th>City</th><th>Trips</th><th>Lifetime value</th><th>Tags</th></tr></thead><tbody id="tvBody"></tbody></table></div>
      </div>`;
    const nextTrip = (t) => t.trips.filter((b) => b.status !== 'Cancelled' && daysTo(b.dep.start) >= 0).sort((a, b) => a.dep.start - b.dep.start)[0];
    function draw() {
      const rows = T.filter(FILTERS.find((x) => x.id === f).test).filter((t) => !q || (t.name + ' ' + t.city + ' ' + t.email).toLowerCase().includes(q));
      $('#tvBody', el).innerHTML = rows.map((t) => {
        const n = nextTrip(t);
        return `<tr data-id="${t.id}"><td class="c-who"><div class="who">${av(t)}<div><b>${esc(t.name)}</b><small>${esc(t.email)}</small></div></div></td>
          <td class="c-trip tcell">${n ? `<b>${esc(n.dep.trip.name)}</b><small>${dm(n.dep.start)}</small>` : '<span class="muted">None booked</span>'}</td>
          <td class="c-sm ind" data-l="City">${esc(t.city)}</td><td class="c-sm" data-l="Trips">${t.pastTrips + t.trips.filter((b) => b.status !== 'Cancelled').length}</td>
          <td class="c-sm num" data-l="Value">${aud(t.spend)}</td>
          <td class="c-status">${t.vip ? '<span class="tag vip">VIP</span>' : ''}${t.repeat ? '<span class="tag repeat">Repeat</span>' : ''}${t.newsletter && !t.vip && !t.repeat ? '<span class="tag news">Newsletter</span>' : ''}</td></tr>`;
      }).join('') || '<tr><td colspan="6" class="muted" style="padding:20px 10px">No travellers match.</td></tr>';
    }
    draw();
    $('#tvSeg', el).addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; f = b.dataset.f; $$('#tvSeg button', el).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); });
    $('#tvSearch', el).addEventListener('input', (e) => { q = e.target.value.trim().toLowerCase(); draw(); });
    $('#tvBody', el).addEventListener('click', (e) => {
      const tr = e.target.closest('tr[data-id]'); if (!tr) return;
      const t = D.travellers.find((x) => x.id === tr.dataset.id);
      const ups = t.trips.filter((b) => b.status !== 'Cancelled').sort((a, b) => a.dep.start - b.dep.start);
      openDrawer('Traveller', `
        <div class="prof">${av(t)}<div><b>${esc(t.name)}</b><span>${esc(t.city)}</span></div></div>
        <div class="kv"><div><span>Email</span><b style="font-size:13px;word-break:break-all">${esc(t.email)}</b></div><div><span>Phone</span><b style="font-size:13.5px">${esc(t.phone)}</b></div><div><span>Lifetime value</span><b>${aud(t.spend)}</b></div><div><span>Trips taken</span><b>${t.pastTrips}</b></div></div>
        <p class="sec-t">Upcoming</p>
        ${ups.length ? ups.map((b) => `<div class="mrow"><span><b style="font-size:13.5px">${esc(b.dep.trip.name)}</b><br><span class="muted" style="font-size:12.5px">${wdm(b.dep.start)} · ${b.pax} ${b.pax > 1 ? 'travellers' : 'traveller'}</span></span>${status(b.status)}</div>`).join('') : '<p class="muted">No trips booked yet.</p>'}
        ${t.lastTrip ? `<p class="sec-t">Last trip</p><p class="muted">${esc(t.lastTrip)}</p>` : ''}
        <p class="sec-t">Preferences</p><p class="muted">${t.newsletter ? 'Subscribed to the newsletter.' : 'Not on the newsletter.'} ${t.vip ? 'VIP: offer early access to new trips.' : ''}</p>`,
        demoBtns('Add note', 'Send email'));
    });
  }

  // =====================================================================
  // Inbox
  // =====================================================================
  function renderInbox(el) {
    const CH = ['All', 'Email', 'WhatsApp', 'Web chat', 'Instagram', 'Phone'];
    let ch = 'All', sel = D.threads[0];
    el.innerHTML = `
      <div class="page-head"><div><h1>Inbox</h1><p>Email, WhatsApp, web chat and Instagram in one place, with a suggested reply for each message.</p></div>
        <div class="chips"><span class="chip">Unread <b>${D.threads.filter((t) => t.unread).length}</b></span><span class="chip">${I('clock')} Average reply <b>38 min</b></span></div></div>
      <div class="card inbox" id="inbox">
        <div class="ib-ch"><h3>Channels</h3>${CH.map((c) => `<button type="button" data-c="${c}" aria-pressed="${c === ch}">${I(c === 'All' ? 'inbox' : SRC[c])}${c}<span class="n">${c === 'All' ? D.threads.length : D.threads.filter((t) => t.channel === c).length}</span></button>`).join('')}</div>
        <div class="ib-list" id="ibList"></div>
        <div class="ib-view" id="ibView"></div>
      </div>`;
    function drawList() {
      $('#ibList', el).innerHTML = D.threads.filter((t) => ch === 'All' || t.channel === ch).map((t) => `
        <button type="button" class="thread ${t.unread ? 'unread' : ''}" data-id="${t.id}" aria-pressed="${t === sel}">${av(t.who)}<span style="min-width:0"><span class="thread-top"><b>${esc(t.who.name)}</b><span>${ago(t.time)}</span></span><span class="subj">${esc(t.subject)}</span><span class="prev">${esc(t.messages[t.messages.length - 1].text)}</span><span class="meta"><span class="chan">${I(SRC[t.channel])}${t.channel}</span><span class="chan">${esc(t.tag)}</span></span></span></button>`).join('') || '<p class="muted" style="padding:16px">No messages here.</p>';
    }
    function drawView() {
      const t = sel;
      $('#ibView', el).innerHTML = `
        <div class="ib-head"><button type="button" class="icon-btn ib-back" aria-label="Back to messages">${I('chevLeft')}</button>${av(t.who)}<div style="min-width:0"><h2>${esc(t.who.name)}</h2><p>${esc(t.subject)} · ${t.channel}</p></div></div>
        <div class="ib-msgs">${t.messages.map((m) => `<div class="msg ${m.from}">${esc(m.text)}<small>${m.from === 'us' ? esc(D.me.name.split(' ')[0]) + ' · ' : ''}${wdm(m.time)}, ${tm(m.time)}</small></div>`).join('')}</div>
        ${t.suggestion ? `<div class="suggest"><div class="suggest-h"><span>${I('spark')} Suggested reply</span><button type="button" class="link" id="useReply">Use this reply</button></div>${esc(t.suggestion)}</div>` : ''}
        <form class="composer" id="composer"><input id="replyBox" placeholder="Write a reply…" aria-label="Write a reply"><button type="submit" class="btn btn-primary">${I('send')} Send</button></form>`;
      const use = $('#useReply', el);
      if (use) use.addEventListener('click', () => { $('#replyBox', el).value = t.suggestion; $('#replyBox', el).focus(); });
      $('#composer', el).addEventListener('submit', (e) => { e.preventDefault(); toast('Sending is switched off in this demo.'); });
      $('.ib-back', el).addEventListener('click', () => { $('#inbox', el).classList.remove('reading'); });
    }
    drawList(); drawView();
    $('.ib-ch', el).addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; ch = b.dataset.c; $$('.ib-ch button', el).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); drawList(); });
    $('#ibList', el).addEventListener('click', (e) => {
      const b = e.target.closest('.thread'); if (!b) return;
      sel = D.threads.find((t) => t.id === b.dataset.id);
      sel.unread = false;
      drawList(); drawView();
      $('#inbox', el).classList.add('reading');
      if (innerWidth < 760) scrollTo({ top: $('#inbox', el).getBoundingClientRect().top + scrollY - 90 });
    });
  }

  // =====================================================================
  // Insights
  // =====================================================================
  function renderInsights(el) {
    const ty = D.monthly.reduce((s, m) => s + m.thisYear, 0), ly = D.monthly.reduce((s, m) => s + m.lastYear, 0);
    el.innerHTML = `
      <div class="page-head"><div><h1>Insights</h1><p>How the business is tracking over the last 12 months, where bookings come from and what travellers think.</p></div>
        <div class="chips"><span class="chip">Revenue, 12 months <b>${audK(ty)}</b></span><span class="chip">${I('trend')} vs last year <b style="color:var(--green)">+${pct(ty - ly, ly)}%</b></span><span class="chip">${I('star')} Rating <b>4.8</b></span></div></div>
      <div class="ins">
        <div class="card w8" id="insRev"><div class="card-h"><h2>Revenue by month</h2><div class="legend" style="flex-direction:row;gap:14px"><span><i style="background:#2563eb"></i>This year</span><span><i style="background:#f59e0b"></i>Last year</span></div></div><div id="revBars"></div></div>
        <div class="card w4" id="insCh"><div class="card-h"><h2>Where bookings come from</h2></div><div class="donut-wrap"><div id="donut"></div><div class="dl">${D.channels.map((c) => `<div><i style="background:${c.color}"></i>${c.name}<b>${c.share}%</b></div>`).join('')}</div></div></div>
        <div class="card w7" id="insCamp"><div class="card-h"><h2>Marketing campaigns</h2><span class="sub">Last 30 days</span></div>
          <div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Campaign</th><th>Spend</th><th>Enquiries</th><th>Bookings</th><th>Revenue</th><th>Cost per booking</th></tr></thead><tbody>${D.campaigns.map((c) => `<tr data-demo="Campaign details are switched off in this demo."><td class="c-who tcell"><b>${esc(c.name)}</b><small>${esc(c.channel)}</small></td><td class="c-sm" data-l="Spend">${aud(c.spend)}</td><td class="c-sm" data-l="Enquiries">${c.enquiries}</td><td class="c-sm" data-l="Bookings">${c.bookings}</td><td class="c-sm" data-l="Revenue">${audK(c.revenue)}</td><td class="c-status"><span class="roas ${c.cpb <= 350 ? 'good' : c.cpb <= 700 ? 'ok' : 'bad'}">${aud(c.cpb)}</span></td></tr>`).join('')}</tbody></table></div></div>
        <div class="card w5" id="insSat"><div class="card-h"><h2>Traveller happiness</h2><span class="sub">After every trip</span></div>
          <div class="sat"><div class="score">4.8</div><div><div class="stars" aria-label="4.8 out of 5">★★★★★</div><div class="muted" style="font-size:13px">214 reviews · 92% would recommend us</div></div></div>
          ${D.reviews.map((r) => `<div class="review"><b>${esc(r.who)}</b> · ${esc(r.trip)} <span class="stars" style="font-size:12px">${'★'.repeat(r.stars)}</span><br>"${esc(r.text)}"</div>`).join('')}</div>
        <div class="card w12" id="insTrips"><div class="card-h"><h2>Revenue booked by trip</h2><span class="sub">Upcoming departures</span></div>
          ${D.destRevenue.map((x) => `<div class="hbar"><span>${esc(x.trip.name)}</span><span class="track"><i style="width:${(x.value / D.destRevenue[0].value) * 100}%;background:${x.trip.color}"></i></span><b>${audK(x.value)}</b></div>`).join('')}</div>
      </div>`;
    // Bars
    const W = 760, H = 240, L = 46, B = 26, T = 10;
    const max = Math.ceil((Math.max(...D.monthly.map((m) => Math.max(m.thisYear, m.lastYear))) * 1.05) / 50000) * 50000;
    const bw = (W - L) / D.monthly.length;
    let s = `<svg class="bars" viewBox="0 0 ${W} ${H}" role="img" aria-label="Revenue by month this year compared with last year">`;
    [0, 0.5, 1].forEach((k) => { const y = H - B - (H - B - T) * k; s += `<line x1="${L}" x2="${W}" y1="${y}" y2="${y}" stroke="#e5eaf4" stroke-dasharray="3 4"/><text x="0" y="${y + 4}">${k ? 'A$' + Math.round((max * k) / 1000) + 'k' : 'A$0'}</text>`; });
    let line = '';
    D.monthly.forEach((m, i) => {
      const h = ((H - B - T) * m.thisYear) / max, x = L + i * bw + bw * 0.2;
      s += `<rect x="${x}" y="${H - B - h}" width="${bw * 0.6}" height="${h}" rx="6" fill="${i === D.monthly.length - 1 ? '#2563eb' : '#a9c2fb'}"><title>${m.month.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}: ${aud(m.thisYear)} (last year ${aud(m.lastYear)})</title></rect>`;
      const ly = H - B - ((H - B - T) * m.lastYear) / max;
      line += `${i ? 'L' : 'M'}${L + i * bw + bw / 2} ${ly}`;
      s += `<text x="${L + i * bw + bw / 2}" y="${H - 6}" text-anchor="middle">${m.month.toLocaleDateString('en-AU', { month: 'short' })}</text>`;
    });
    s += `<path d="${line}" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    D.monthly.forEach((m, i) => { s += `<circle cx="${L + i * bw + bw / 2}" cy="${H - B - ((H - B - T) * m.lastYear) / max}" r="3.5" fill="#fff" stroke="#f59e0b" stroke-width="2"/>`; });
    $('#revBars', el).innerHTML = s + '</svg>';
    // Donut
    let a0 = -Math.PI / 2, d = '';
    D.channels.forEach((c) => {
      const a1 = a0 + (c.share / 100) * Math.PI * 2;
      const large = a1 - a0 > Math.PI ? 1 : 0;
      const p = (a, r) => `${75 + r * Math.cos(a)} ${75 + r * Math.sin(a)}`;
      d += `<path d="M${p(a0, 70)} A70 70 0 ${large} 1 ${p(a1 - 0.02, 70)} L${p(a1 - 0.02, 46)} A46 46 0 ${large} 0 ${p(a0, 46)}Z" fill="${c.color}"><title>${c.name}: ${c.share}%</title></path>`;
      a0 = a1;
    });
    $('#donut', el).innerHTML = `<svg class="donut" viewBox="0 0 150 150" role="img" aria-label="Bookings by channel">${d}<text x="75" y="72" text-anchor="middle" style="font-size:20px;font-weight:800;fill:#0f1b33">${D.bookings.length}</text><text x="75" y="90" text-anchor="middle" style="font-size:11px;fill:#74819a">bookings</text></svg>`;
  }

  const RENDER = { overview: renderOverview, pipeline: renderPipeline, departures: renderDepartures, travellers: renderTravellers, inbox: renderInbox, insights: renderInsights };
  setView((location.hash || '').slice(1) || 'overview');
})();
