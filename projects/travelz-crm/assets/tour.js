// Guided tour: shown once on the first visit, replayable from "Take the tour".
// On phones it becomes a compact sheet on the screen edge, away from what it
// points at, and pages scroll so their content sits in the open space.
(function () {
  const SEEN = 'travelzDemoTourSeen';
  const steps = [
    { kind: 'welcome', title: 'Welcome to Travelz CRM',
      body: 'This is the control room for a small-group tour company in Australia: bookings, enquiries, departures, travellers and messages, all on one screen. Take a one-minute tour to see how it works.',
      note: 'Everything you see is sample data.' },
    { view: 'overview', target: '#tabs', title: 'Six tabs, one place',
      body: 'Overview for the big picture, then Pipeline, Departures, Travellers, Inbox and Insights. Everything is one tap away.' },
    { view: 'overview', target: '#ovStats', title: 'The numbers that matter',
      body: 'Revenue and travellers booked in the last 30 days, compared with the 30 days before, and how full the next two months are.' },
    { view: 'overview', target: '#ovChart', title: 'Revenue, with a forecast',
      body: 'Each column is a day and each dot a slice of revenue. Blue is what came in, amber is what the AI expects over the next 9 days. Tap any day to see its total.' },
    { view: 'overview', target: '#ovTasks', title: 'Priority tasks',
      body: 'Payments, passports, quotes and room lists that need doing, with progress for each. Tap one to jump to the right page.' },
    { view: 'overview', target: '#ovTable', title: 'Manage bookings',
      body: 'Every booking with its traveller, trip and payment status. Start with "Needs action" to see who still owes money.' },
    { view: 'overview', target: '#ovAi', title: 'Ask Travelz AI',
      body: 'Ask in plain English and get an answer worked out from the numbers: a weekly summary, a follow-up email, which departure to fill, or who still owes money.',
      note: 'In this demo it answers its four suggested questions.' },
    { view: 'pipeline', target: '#board', title: 'Pipeline',
      body: 'Every enquiry moves from New to Quote sent, Following up and Ready to book. Hot leads are flagged so nobody waits too long for a reply.' },
    { view: 'departures', target: '#calCard', title: 'Departures',
      body: 'Every trip on a calendar. Tap one to see how full it is, who is going and what still needs doing before it leaves.' },
    { view: 'travellers', target: '#v-travellers .card', title: 'Travellers',
      body: 'Everyone who has booked, what they have spent and their next trip. Repeat travellers and VIPs are tagged.' },
    { view: 'inbox', target: '#inbox', title: 'Inbox',
      body: 'Email, WhatsApp, web chat and Instagram in one list, with a suggested reply ready for each message.' },
    { view: 'insights', target: '#insRev', title: 'Insights',
      body: 'Revenue by month against last year, where bookings come from, which campaigns pay off and what travellers say.' },
    { kind: 'done', view: 'overview', target: '#tourBtn', title: "You're all set",
      body: 'Click around, everything is live sample data. You can replay this tour any time from "Take the tour" at the top.',
      phoneBody: 'Tap around, everything is live sample data. You can replay this tour any time from the ? button at the top.' },
  ];

  const ui = document.createElement('div');
  ui.className = 'tour';
  ui.hidden = true;
  ui.innerHTML = `
    <div class="tour-shade"></div>
    <div class="tour-hole" aria-hidden="true"></div>
    <div class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tourTitle">
      <button type="button" class="tour-x" aria-label="Close the tour">×</button>
      <div class="tour-step"></div>
      <h2 class="tour-title" id="tourTitle"></h2>
      <p class="tour-body"></p>
      <p class="tour-note"></p>
      <div class="tour-bar"><i></i></div>
      <div class="tour-acts">
        <button type="button" class="tour-back">Back</button>
        <span class="tour-gap"></span>
        <button type="button" class="tour-skip">Not now</button>
        <button type="button" class="tour-next">Next</button>
      </div>
    </div>`;
  document.body.appendChild(ui);
  const q = (s) => ui.querySelector(s);
  const card = q('.tour-card');
  const hole = q('.tour-hole');
  let i = 0;
  let timers = [];

  const narrow = () => innerWidth < 760;
  const shown = (el) => el && !el.hidden && !el.closest('[hidden]') && el.getBoundingClientRect().height > 0;
  const find = (sel) => { const el = document.querySelector(sel); return shown(el) ? el : null; };
  const inView = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
  const setHole = (b) => Object.assign(hole.style, { top: b.top + 'px', left: b.left + 'px', width: b.right - b.left + 'px', height: Math.max(0, b.bottom - b.top) + 'px' });

  // Bring the target into view: near the top on phones (the sheet sits below),
  // centred on larger screens when it is not already on screen.
  function frame() {
    const s = steps[i];
    const el = s.target && find(s.target);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const head = document.querySelector('.top').getBoundingClientRect().bottom;
    if (narrow()) {
      if (r.top < innerHeight * 0.5 && r.top > head) return;
      scrollTo(0, Math.max(0, r.top + scrollY - head - 10));
    } else if (r.top < head + 8 || r.bottom > innerHeight - 8) {
      const y = r.height > innerHeight - head - 40 ? r.top + scrollY - head - 16 : r.top + scrollY - (innerHeight - r.height) / 2;
      scrollTo(0, Math.max(0, y));
    }
  }

  function place() {
    if (ui.hidden) return;
    const s = steps[i];
    const el = s.target && find(s.target);
    card.style.left = card.style.top = '';
    card.classList.remove('center', 'sheet', 'sheet-top');
    if (!el || !inView(el) || s.kind === 'welcome') {
      hole.hidden = true; ui.classList.add('dim'); card.classList.add('center'); return;
    }
    ui.classList.remove('dim');
    hole.hidden = false;
    const r = el.getBoundingClientRect();
    const pad = 6;
    const box = { top: Math.max(r.top - pad, 6), left: Math.max(r.left - pad, 6), right: Math.min(r.right + pad, innerWidth - 6), bottom: Math.min(r.bottom + pad, innerHeight - 6) };
    if (narrow()) {
      const low = r.top > innerHeight * 0.5;
      card.classList.add('sheet');
      card.classList.toggle('sheet-top', low);
      const ch = card.offsetHeight;
      if (low) box.top = Math.max(box.top, ch + 10); else box.bottom = Math.min(box.bottom, innerHeight - ch - 10);
      setHole(box);
      return;
    }
    setHole(box);
    const cw = card.offsetWidth, ch = card.offsetHeight, gap = 16;
    const clampY = (y) => Math.min(Math.max(y, 12), innerHeight - ch - 12);
    const clampX = (x) => Math.min(Math.max(x, 12), innerWidth - cw - 12);
    let x, y;
    if (box.right + gap + cw < innerWidth - 12) { x = box.right + gap; y = clampY(box.top); }
    else if (box.left - gap - cw > 12) { x = box.left - gap - cw; y = clampY(box.top); }
    else if (box.bottom + gap + ch < innerHeight - 12) { y = box.bottom + gap; x = clampX(box.left); }
    else if (box.top - gap - ch > 12) { y = box.top - gap - ch; x = clampX(box.left); }
    else {
      // Taller than the screen: highlight the part that fits and sit the card under it
      box.bottom = Math.max(box.top + 80, innerHeight - ch - 28);
      setHole(box);
      y = box.bottom + 12;
      x = clampX(box.left + (box.right - box.left - cw) / 2);
    }
    card.style.left = x + 'px';
    card.style.top = y + 'px';
  }

  function show(n) {
    i = Math.max(0, Math.min(n, steps.length - 1));
    const s = steps[i];
    timers.forEach(clearTimeout);
    timers = [];
    if (s.view && window.getView && window.getView() !== s.view) { window.setView(s.view); scrollTo(0, 0); }
    const welcome = s.kind === 'welcome', last = i === steps.length - 1;
    q('.tour-step').textContent = welcome ? 'Quick tour' : last ? 'Tour complete' : `Step ${i} of ${steps.length - 2}`;
    q('.tour-title').textContent = s.title;
    q('.tour-body').textContent = (narrow() && s.phoneBody) || s.body;
    q('.tour-note').hidden = !s.note;
    q('.tour-note').textContent = s.note || '';
    q('.tour-bar i').style.width = `${(i / (steps.length - 1)) * 100}%`;
    q('.tour-bar').hidden = welcome;
    q('.tour-back').hidden = i < 2;
    q('.tour-skip').hidden = !welcome;
    q('.tour-next').textContent = welcome ? 'Take the tour' : last ? 'Start exploring' : 'Next';
    card.classList.toggle('welcome', welcome);
    const settle = () => { frame(); place(); };
    settle();
    timers.push(setTimeout(settle, 120), setTimeout(place, 500));
    q('.tour-next').focus({ preventScroll: true });
  }

  function open(from = 0) {
    ui.hidden = false;
    document.documentElement.classList.add('touring');
    show(from);
  }
  function close() {
    ui.hidden = true;
    document.documentElement.classList.remove('touring');
    timers.forEach(clearTimeout);
    try { localStorage.setItem(SEEN, '1'); } catch (e) {}
  }

  q('.tour-next').addEventListener('click', () => {
    if (i === steps.length - 1) { close(); window.setView('overview'); scrollTo(0, 0); return; }
    show(i + 1);
  });
  q('.tour-back').addEventListener('click', () => show(i - 1));
  q('.tour-skip').addEventListener('click', close);
  q('.tour-x').addEventListener('click', close);
  q('.tour-shade').addEventListener('click', (e) => e.stopPropagation());
  addEventListener('keydown', (e) => {
    if (ui.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') q('.tour-next').click();
    else if (e.key === 'ArrowLeft' && i > 1) show(i - 1);
  });
  let sx = null, sy = null;
  card.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  card.addEventListener('touchend', (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    sx = null;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0) q('.tour-next').click(); else if (i > 1) show(i - 1);
  }, { passive: true });
  addEventListener('resize', place);
  addEventListener('scroll', place, { passive: true });

  document.getElementById('tourBtn').addEventListener('click', () => open(0));
  let seen = false;
  try { seen = localStorage.getItem(SEEN) === '1'; } catch (e) {}
  if (!seen) setTimeout(() => open(0), 900);
})();
