/* Magna Constructions - shared interactions */
(function(){
  'use strict';

  /* Called by js/gateway.js once the proposal gate is unlocked and #site-content
     is revealed - not bound to DOMContentLoaded since the site stays hidden
     (and unmeasurable) until then. */
  window.initMagnaSite = function(){
    var yr = document.getElementById('yr');
    if (yr) yr.textContent = new Date().getFullYear();

    /* Scroll reveal */
    var els = document.querySelectorAll('.reveal, .reveal-group');
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function(entries){
        entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('visible'); obs.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
      els.forEach(function(e){ obs.observe(e); });
    } else {
      els.forEach(function(e){ e.classList.add('visible'); });
    }

    /* Hero parallax (desktop only) */
    if (window.innerWidth >= 768) {
      var hb = document.querySelector('.hero-bg');
      if (hb) window.addEventListener('scroll', function(){
        hb.style.transform = 'translateY(' + (window.pageYOffset * 0.3) + 'px)';
      }, { passive: true });
    }

    /* Eased smooth scroll for all in-page anchor links (nav, drawer, footer, CTAs) */
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var anchorScrollActive = false;
    function easeInOutCubic(t){ return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }
    function smoothScrollTo(targetY, duration){
      var startY = window.pageYOffset;
      var distance = targetY - startY;
      if (!duration || reduceMotion) { window.scrollTo(0, targetY); return; }
      var startTime = null;
      anchorScrollActive = true;
      function step(timestamp){
        if (startTime === null) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        window.scrollTo(0, startY + distance * easeInOutCubic(progress));
        if (progress < 1) { window.requestAnimationFrame(step); }
        else { anchorScrollActive = false; }
      }
      window.requestAnimationFrame(step);
    }

    /* Slow, inertia-style easing for regular mouse-wheel / trackpad scrolling (desktop only) */
    var finePointer = window.matchMedia && window.matchMedia('(pointer:fine)').matches;
    if (finePointer && !reduceMotion) {
      var wheelCurrent = window.pageYOffset;
      var wheelTarget = window.pageYOffset;
      var wheelRaf = null;
      var wheelEase = 0.11;

      function maxScrollY(){ return document.documentElement.scrollHeight - window.innerHeight; }
      function clampY(y){ return Math.max(0, Math.min(maxScrollY(), y)); }

      function wheelStep(){
        wheelCurrent += (wheelTarget - wheelCurrent) * wheelEase;
        if (Math.abs(wheelTarget - wheelCurrent) < 0.5) {
          wheelCurrent = wheelTarget;
          window.scrollTo(0, wheelCurrent);
          wheelRaf = null;
          return;
        }
        window.scrollTo(0, wheelCurrent);
        wheelRaf = window.requestAnimationFrame(wheelStep);
      }

      window.addEventListener('wheel', function(e){
        if (e.ctrlKey || anchorScrollActive) return; // let pinch-zoom & anchor jumps through untouched
        e.preventDefault();
        if (!wheelRaf) { wheelCurrent = window.pageYOffset; wheelTarget = window.pageYOffset; }
        wheelTarget = clampY(wheelTarget + e.deltaY);
        if (!wheelRaf) wheelRaf = window.requestAnimationFrame(wheelStep);
      }, { passive: false });

      window.addEventListener('scroll', function(){
        if (!wheelRaf && !anchorScrollActive) { wheelTarget = window.pageYOffset; wheelCurrent = window.pageYOffset; }
      }, { passive: true });
    }

    var headerForScroll = document.querySelector('header');
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      var id = a.getAttribute('href').slice(1);
      var target = id && document.getElementById(id);
      if (!target) return;
      a.addEventListener('click', function(e){
        e.preventDefault();
        var offset = (headerForScroll ? headerForScroll.offsetHeight : 0) + 12;
        var targetY = Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - offset);
        var distance = Math.abs(targetY - window.pageYOffset);
        var duration = Math.min(1400, Math.max(600, distance * 0.6));
        if (history.pushState) history.pushState(null, '', '#' + id);
        smoothScrollTo(targetY, duration);
      });
    });

    /* Scroll-spy: highlight the nav link for the section in view */
    var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    var navSectionIds = Array.prototype.map.call(navLinks, function(a){ return a.getAttribute('href').slice(1); })
      .filter(function(id){ return document.getElementById(id); });
    var headerEl = document.querySelector('header');
    if (navLinks.length && navSectionIds.length) {
      var updateActiveNav = function(){
        var offset = (headerEl ? headerEl.offsetHeight : 0) + 20;
        var scrollPos = window.pageYOffset + offset;
        var atBottom = window.pageYOffset + window.innerHeight >= document.documentElement.scrollHeight - 2;
        var current = navSectionIds[0];
        navSectionIds.forEach(function(id){
          var el = document.getElementById(id);
          if (atBottom || el.offsetTop <= scrollPos) current = id;
        });
        navLinks.forEach(function(a){
          a.classList.toggle('active', a.getAttribute('href') === '#' + current);
        });
      };
      window.addEventListener('scroll', updateActiveNav, { passive: true });
      window.addEventListener('resize', updateActiveNav);
      updateActiveNav();
    }

    /* Mobile drawer */
    var hamb = document.querySelector('.hamb');
    var drawer = document.querySelector('.drawer');
    var scrim = document.querySelector('.scrim');
    var drawerClose = document.querySelector('.drawer-close');
    function closeDrawer(){ if(hamb){hamb.classList.remove('open');} if(drawer){drawer.classList.remove('open');} if(scrim){scrim.classList.remove('open');} document.body.style.overflow=''; }
    function toggleDrawer(){
      var open = drawer && drawer.classList.toggle('open');
      if(hamb) hamb.classList.toggle('open', open);
      if(scrim) scrim.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }
    if (hamb) hamb.addEventListener('click', toggleDrawer);
    if (scrim) scrim.addEventListener('click', closeDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (drawer) drawer.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeDrawer); });

    /* FAQ accordion */
    document.querySelectorAll('.faq-q').forEach(function(q){
      q.addEventListener('click', function(){
        var item = q.closest('.faq-item');
        var a = item.querySelector('.faq-a');
        var isOpen = item.classList.toggle('open');
        a.style.maxHeight = isOpen ? (a.scrollHeight + 'px') : '0px';
      });
    });

    /* Contact form (front-end demo, no backend) */
    var form = document.querySelector('form.enq');
    if (form) {
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var ok = form.querySelector('.form-ok');
        if (ok) { ok.style.display = 'block'; }
        form.querySelectorAll('input,textarea,select,button').forEach(function(el){ if(el.type!=='button') el.setAttribute('disabled',''); });
      });
    }

    /* Claim tracker demo */
    var input = document.getElementById('claimInput');
    if (input) {
      var DATA = {
        'MGN-2025-0148': { addr: 'Storm damage \u00b7 Baulkham Hills NSW', stage: 3 },
        'MGN-2025-0090': { addr: 'Fire reinstatement \u00b7 Lobethal SA', stage: 4 }
      };
      var STAGES = [
        ['Emergency make-safe', 'Property secured, further loss prevented'],
        ['Assessment & scope', 'Damage assessed, scope of works issued'],
        ['Repairs approved', 'Insurer approval received, trades scheduled'],
        ['Reinstatement underway', 'Works in progress with weekly updates'],
        ['Completed & handed over', 'Final inspection passed, home returned']
      ];
      var out = document.getElementById('steps');
      function render(ref){
        ref = (ref||'').trim().toUpperCase();
        var rec = DATA[ref]; var stage = rec ? rec.stage : 1;
        out.innerHTML = '';
        var note = document.createElement('div');
        note.style.cssText = 'font-size:13.5px;margin:2px 0 18px;';
        if (rec){ note.style.color='var(--text-muted)'; note.textContent = rec.addr; }
        else if (ref){ note.style.color='var(--accent)'; note.textContent='Reference not found in demo. Showing a sample claim.'; }
        else { note.textContent=''; }
        out.appendChild(note);
        STAGES.forEach(function(s,i){
          var li = document.createElement('li');
          li.className = 'step ' + (i<stage?'done':(i===stage?'active':''));
          li.innerHTML = '<div class="mk">' + (i<stage?'\u2713':(i+1)) + '</div>' +
            '<div class="st-body"><h5>'+s[0]+'</h5><p>'+s[1]+'</p></div>';
          out.appendChild(li);
        });
      }
      var btn = document.getElementById('trackBtn');
      if (btn) btn.addEventListener('click', function(){ render(input.value); });
      input.addEventListener('keydown', function(e){ if(e.key==='Enter') render(input.value); });
      document.querySelectorAll('[data-sample]').forEach(function(b){
        b.addEventListener('click', function(){ input.value = b.getAttribute('data-sample'); render(input.value); });
      });
      render(input.value);
    }
  };
})();
