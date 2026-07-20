(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hero background video ---------- */
  var heroVideo = document.querySelector('.hero-video');
  if (heroVideo){
    if (reduce){ heroVideo.pause(); }
    else { heroVideo.play().catch(function(){}); }
  }

  /* ---------- Preloader (shown once per browser session, capped at 5s) ---------- */
  var preloader = document.getElementById('preloader');
  if (preloader && !document.documentElement.classList.contains('no-preload')){
    var markPreloaded = function(){ sessionStorage.setItem('lvd_preloaded', '1'); };
    var hidePreloader = function(){ preloader.classList.add('done'); markPreloaded(); };
    window.addEventListener('load', function(){
      setTimeout(hidePreloader, 450);
    });
    setTimeout(hidePreloader, 5000);
  }

  /* ---------- Header scroll state + progress + sticky bar ---------- */
  var header = document.getElementById('header');
  var progress = document.getElementById('progress');
  var sticky = document.getElementById('sticky-bar');
  var isHome = document.body.getAttribute('data-page') === 'home';
  function onScroll(){
    var y = window.scrollY || window.pageYOffset;
    if (header){ header.classList.toggle('scrolled', y > 40); }
    if (progress){
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
    if (sticky){ sticky.classList.toggle('show', y > 600); }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
  /* Non-home pages keep the solid header state from the start (short/no hero) */
  if (header && !isHome){ header.classList.add('solid'); }

  /* ---------- Shared scroll controller: eased anchor jumps + slow momentum wheel scroll ---------- */
  function easeInOutCubic(t){ return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2; }
  function headerOffset(){ return header ? header.offsetHeight : 0; }
  var scrollCtrl = { anchorActive: false, wheelRaf: null };

  function easeInQuad(t){ return t * t; }
  function animateScrollTo(targetY){
    var startY = window.pageYOffset;
    var diff = targetY - startY;
    if (Math.abs(diff) < 1) return;
    var duration = Math.min(1400, Math.max(500, Math.abs(diff) * 0.7));
    var startTime = null;
    scrollCtrl.anchorActive = true;
    function step(timestamp){
      if (!scrollCtrl.anchorActive) return;
      if (startTime === null) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      window.scrollTo({ top: startY + diff * easeInQuad(progress), left: 0, behavior: 'instant' });
      if (progress < 1){ requestAnimationFrame(step); } else { scrollCtrl.anchorActive = false; }
    }
    requestAnimationFrame(step);
  }

  document.querySelectorAll('a[href^="#"]').forEach(function(link){
    var id = link.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    link.addEventListener('click', function(e){
      e.preventDefault();
      closeDrawer();
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset();
      if (target.id === 'home') top = 0;
      if (reduce){ window.scrollTo({ top: top, left: 0, behavior: 'instant' }); }
      else { animateScrollTo(top); }
      history.replaceState(null, '', id);
    });
  });

  /* On the homepage, Home/logo links should smooth-scroll to top instead of reloading the page */
  if (isHome){
    document.querySelectorAll('a[href="index.html"]').forEach(function(link){
      link.addEventListener('click', function(e){
        e.preventDefault();
        closeDrawer();
        if (reduce){ window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }
        else { animateScrollTo(0); }
        history.replaceState(null, '', 'index.html');
      });
    });
  }

  /* If arriving with a hash (e.g. from another page), settle scroll under the fixed header */
  if (window.location.hash){
    var initTarget = document.querySelector(window.location.hash);
    if (initTarget){
      window.addEventListener('load', function(){
        setTimeout(function(){
          var top = initTarget.getBoundingClientRect().top + window.pageYOffset - headerOffset();
          window.scrollTo(0, Math.max(top,0));
        }, 60);
      });
    }
  }

  /* Mouse wheel: slow, trailing momentum scroll instead of an instant jump */
  if (!reduce && 'ontouchstart' in window === false){
    var virtualY = window.pageYOffset;
    var wheelTargetY = window.pageYOffset;
    function wheelLoop(){
      virtualY += (wheelTargetY - virtualY) * 0.11;
      if (Math.abs(wheelTargetY - virtualY) < 0.4){
        virtualY = wheelTargetY;
        window.scrollTo({ top: virtualY, left: 0, behavior: 'instant' });
        scrollCtrl.wheelRaf = null;
        return;
      }
      window.scrollTo({ top: virtualY, left: 0, behavior: 'instant' });
      scrollCtrl.wheelRaf = requestAnimationFrame(wheelLoop);
    }
    window.addEventListener('wheel', function(e){
      scrollCtrl.anchorActive = false;
      var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      virtualY = window.pageYOffset;
      wheelTargetY = Math.min(maxScroll, Math.max(0, wheelTargetY + e.deltaY * 0.7));
      e.preventDefault();
      if (!scrollCtrl.wheelRaf){ scrollCtrl.wheelRaf = requestAnimationFrame(wheelLoop); }
    }, { passive: false });
    window.addEventListener('scroll', function(){
      if (!scrollCtrl.wheelRaf && !scrollCtrl.anchorActive){ wheelTargetY = window.pageYOffset; }
    }, { passive: true });
  }

  /* ---------- Mobile drawer ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var drawer = document.getElementById('drawer');
  function closeDrawer(){
    if (!drawer) return;
    drawer.classList.remove('open'); if (menuBtn) menuBtn.classList.remove('open');
    document.body.style.overflow=''; drawer.setAttribute('aria-hidden','true');
    if (menuBtn) menuBtn.setAttribute('aria-expanded','false');
  }
  if (menuBtn && drawer){
    menuBtn.setAttribute('aria-expanded','false');
    menuBtn.addEventListener('click', function(){
      var open = drawer.classList.toggle('open');
      menuBtn.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeDrawer(); });
  }

  /* Mobile drawer accordion (Treatments / Practice) */
  document.querySelectorAll('#drawer .drawer-item').forEach(function(item){
    var row = item.querySelector('.drawer-row');
    var sub = item.querySelector('.drawer-sub');
    if (!row || !sub) return;
    var toggle = row.querySelector('.d-chev');
    function toggleSub(e){
      if (e.target.closest('a') && e.target.tagName === 'A' && e.target.parentElement !== row) return;
      e.preventDefault();
      var open = item.classList.toggle('open');
      sub.style.maxHeight = open ? sub.scrollHeight + 'px' : null;
    }
    if (toggle) toggle.addEventListener('click', toggleSub);
    row.addEventListener('click', function(e){
      if (e.target === toggle || toggle.contains(e.target)) return;
      toggleSub(e);
    });
  });

  /* ---------- Scroll reveal ---------- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (en.isIntersecting){ en.target.classList.add('visible'); io.unobserve(en.target); }
    });
  }, {threshold:0.12, rootMargin:'0px 0px -50px 0px'});
  document.querySelectorAll('.reveal, .rg').forEach(function(el){ io.observe(el); });

  /* ---------- Count up ---------- */
  var countIO = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (en.isIntersecting){
        var el = en.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        if (reduce){ el.textContent = target + suffix; countIO.unobserve(el); return; }
        var dur = 1600, startT = null;
        var startVal = target > 1000 ? Math.floor(target*0.985) : 0;
        function tick(ts){
          if (startT === null) startT = ts;
          var p = Math.min((ts - startT)/dur, 1);
          var val = Math.floor(startVal + (target - startVal) * easeInOutCubic(p));
          el.textContent = val + suffix;
          if (p < 1) requestAnimationFrame(tick); else el.textContent = target + suffix;
        }
        requestAnimationFrame(tick);
        countIO.unobserve(el);
      }
    });
  }, {threshold:0.5});
  document.querySelectorAll('[data-count]').forEach(function(el){ countIO.observe(el); });

  /* ---------- FAQ / accordion ---------- */
  document.querySelectorAll('.faq-q').forEach(function(btn){
    btn.setAttribute('aria-expanded','false');
    btn.addEventListener('click', function(){
      var item = btn.parentElement;
      var ans = btn.nextElementSibling;
      var open = item.classList.contains('open');
      var group = item.parentElement;
      group.querySelectorAll(':scope > .faq').forEach(function(f){
        f.classList.remove('open');
        f.querySelector('.faq-a').style.maxHeight = null;
        f.querySelector('.faq-q').setAttribute('aria-expanded','false');
      });
      if (!open){ item.classList.add('open'); ans.style.maxHeight = ans.scrollHeight + 'px'; btn.setAttribute('aria-expanded','true'); }
    });
  });
  window.addEventListener('resize', function(){
    document.querySelectorAll('.faq.open .faq-a').forEach(function(open){ open.style.maxHeight = open.scrollHeight + 'px'; });
  });

  /* ---------- Scroll-spy active nav (home page sections + jump-nav pills) ---------- */
  var navLinks = {};
  document.querySelectorAll('nav.main > a[href^="#"], nav.main .dropdown a[href^="#"]').forEach(function(a){
    var id = a.getAttribute('href').slice(1); navLinks[id] = navLinks[id] || []; navLinks[id].push(a);
  });
  /* The Home link points to index.html (not a hash) so it can still act as a full nav
     link from other pages, but while the hero (#home) is in view it should show active too. */
  var homeLink = document.querySelector('nav.main > a[href="index.html"]');
  if (homeLink && document.getElementById('home')){
    navLinks.home = navLinks.home || []; navLinks.home.push(homeLink);
  }
  var jumpLinks = {};
  document.querySelectorAll('.jump-row a').forEach(function(a){
    var href = a.getAttribute('href');
    var id = href.indexOf('#') > -1 ? href.split('#')[1] : null;
    if (id){ jumpLinks[id] = jumpLinks[id] || []; jumpLinks[id].push(a); }
  });
  var spySections = [];
  Object.keys(navLinks).forEach(function(id){ if (document.getElementById(id)) spySections.push(id); });
  Object.keys(jumpLinks).forEach(function(id){ if (document.getElementById(id) && spySections.indexOf(id) === -1) spySections.push(id); });
  if (spySections.length){
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting){
          var id = en.target.id;
          Object.keys(navLinks).forEach(function(k){ navLinks[k].forEach(function(a){ a.classList.toggle('active', k === id); }); });
          Object.keys(jumpLinks).forEach(function(k){ jumpLinks[k].forEach(function(a){ a.classList.toggle('active', k === id); }); });
        }
      });
    }, {rootMargin:'-45% 0px -50% 0px'});
    spySections.forEach(function(id){ spy.observe(document.getElementById(id)); });
  }

  /* ---------- Year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Graceful image fallback ---------- */
  document.querySelectorAll('img').forEach(function(img){
    img.addEventListener('error', function(){
      if (img.closest('.member-photo') || img.closest('.mf-photo')){
        img.style.display='none';
        img.parentElement.style.background='linear-gradient(135deg,#00ABBE,#017E8C)';
      }
    });
  });
})();
