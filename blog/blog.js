// Antheon blog: shared behaviour for the listing page and every article.
// Each block checks for its own elements, so the same file works on both page types.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var headerEl = document.querySelector('header');

  // ---------- Mobile burger menu ----------
  (function () {
    var burger = document.querySelector('.nav-burger');
    var navLinks = document.querySelector('.nav-links');
    if (!burger || !navLinks) return;
    function closeMenu() {
      navLinks.classList.remove('mobile-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    burger.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('mobile-open');
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', closeMenu); });
    document.addEventListener('click', function (e) {
      if (navLinks.classList.contains('mobile-open') && !navLinks.contains(e.target) && !burger.contains(e.target)) closeMenu();
    });
  })();

  // ---------- Article: contents list built from the h2s ----------
  (function () {
    var prose = document.querySelector('.prose');
    if (!prose) return;
    var heads = Array.prototype.slice.call(prose.querySelectorAll('h2'));
    heads.forEach(function (h, i) {
      if (!h.id) h.id = (h.textContent || 'section-' + i).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    });
    var targets = document.querySelectorAll('.toc[data-toc]');
    if (heads.length < 2) {
      targets.forEach(function (t) { var wrap = t.closest('.toc-inline'); if (wrap) wrap.classList.add('is-empty'); else t.parentNode.innerHTML = ''; });
      return;
    }
    targets.forEach(function (t) {
      var ol = document.createElement('ol');
      heads.forEach(function (h) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        li.appendChild(a); ol.appendChild(li);
      });
      t.appendChild(ol);
    });
    // On mobile, fold the contents away again once a section is picked
    var inline = document.querySelector('.toc-inline');
    if (inline) inline.addEventListener('click', function (e) { if (e.target.closest('a')) inline.open = false; });

    if (!('IntersectionObserver' in window)) return;
    var links = document.querySelectorAll('.toc a');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id); });
      });
    }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });
    heads.forEach(function (h) { io.observe(h); });
  })();

  // ---------- Article: reading progress ----------
  (function () {
    var bar = document.querySelector('.read-progress');
    var prose = document.querySelector('.prose');
    if (!bar || !prose || reduce) return;
    var ticking = false;
    function update() {
      ticking = false;
      var r = prose.getBoundingClientRect();
      var start = r.top + window.pageYOffset - (headerEl ? headerEl.offsetHeight : 0);
      var end = r.bottom + window.pageYOffset - window.innerHeight;
      var p = end > start ? (window.pageYOffset - start) / (end - start) : 1;
      bar.style.transform = 'scaleX(' + Math.max(0, Math.min(1, p)) + ')';
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  })();

  // ---------- Article: share buttons ----------
  (function () {
    var share = document.querySelector('.share');
    if (!share) return;
    var canonical = document.querySelector('link[rel="canonical"]');
    var url = canonical ? canonical.href : location.href;
    var title = document.querySelector('h1') ? document.querySelector('h1').textContent.trim() : document.title;
    var enc = encodeURIComponent;
    var hrefs = {
      linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + enc(url),
      x: 'https://twitter.com/intent/tweet?url=' + enc(url) + '&text=' + enc(title),
      whatsapp: 'https://wa.me/?text=' + enc(title + ' ' + url)
    };
    share.querySelectorAll('a[data-share]').forEach(function (a) { a.href = hrefs[a.dataset.share] || url; });

    var toast = document.createElement('div');
    toast.className = 'toast'; toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
    function say(msg) {
      toast.textContent = msg; toast.classList.add('show');
      clearTimeout(say.t); say.t = setTimeout(function () { toast.classList.remove('show'); }, 2200);
    }
    var copyBtn = share.querySelector('[data-share="copy"]');
    if (copyBtn) copyBtn.addEventListener('click', function () {
      function fallback() {
        var ta = document.createElement('textarea'); ta.value = url; ta.setAttribute('readonly', '');
        ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); say('Link copied'); } catch (e) { say('Copy failed, use the address bar'); }
        ta.remove();
      }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(function () { say('Link copied'); }, fallback);
      else fallback();
    });
  })();

  // ---------- Scroll reveal with stagger ----------
  (function () {
    document.querySelectorAll('.post-grid, .rel-row').forEach(function (parent) {
      Array.prototype.forEach.call(parent.children, function (child, i) {
        child.classList.add('stagger-item');
        child.style.setProperty('--stagger', ((i % 3) * 110) + 'ms');
      });
    });
    var els = document.querySelectorAll('.reveal, .stagger-item');
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(function (el) { el.classList.add('visible'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  })();

  // ---------- Demo preview: cover photo fades into a muted walkthrough ----------
  // After 3 seconds the cover becomes a looping, muted video of the demo.
  // Once the cover scrolls away, the same video moves into a small player in
  // the corner so it keeps going while the article is read. The player hides
  // near the end of the page, can be closed, and both open the demo.
  (function () {
    var fig = document.querySelector('[data-demo]');
    if (!fig) return;
    var video = fig.querySelector('.demo-video');
    var link = fig.querySelector('.demo-link');
    var mini = document.querySelector('.demo-mini');
    var screen = mini && mini.querySelector('.demo-mini-screen');
    var saveData = navigator.connection && navigator.connection.saveData;
    if (!video || !link || reduce || saveData) { fig.classList.add('is-static'); return; }

    var started = false, closed = false, inMini = false, coverVisible = true;
    var ends = Array.prototype.slice.call(document.querySelectorAll('.post-cta, footer'));
    var endShown = ends.map(function () { return false; });

    function play() {
      var pr = video.play();
      if (pr && pr.catch) pr.catch(function () {
        // Autoplay refused (iPhone Low Power Mode, some data savers): keep the
        // photo and the demo link, and try again on the reader's first tap.
        if (!started) return;
        started = false; fig.classList.remove('is-playing'); fig.classList.add('is-static'); move(false);
        armRetry();
      });
    }
    var retryArmed = false;
    function armRetry() {
      if (retryArmed) return;
      retryArmed = true;
      var retry = function () {
        document.removeEventListener('touchend', retry);
        document.removeEventListener('click', retry);
        retryArmed = false;
        var pr = video.play();
        if (pr && pr.then) pr.then(function () { fig.classList.remove('is-static'); start(); }).catch(function () {});
      };
      document.addEventListener('touchend', retry, { passive: true });
      document.addEventListener('click', retry);
    }
    function move(toMini) {
      if (!mini || toMini === inMini) return;
      inMini = toMini;
      if (toMini) {
        screen.appendChild(video);
        mini.hidden = false;
        requestAnimationFrame(function () { requestAnimationFrame(function () { mini.classList.add('is-open'); }); });
      } else {
        link.insertBefore(video, link.firstChild);
        mini.classList.remove('is-open');
        setTimeout(function () { if (!inMini) mini.hidden = true; }, 380);
      }
    }
    function update() {
      if (!started) return;
      var below = fig.getBoundingClientRect().bottom < 0;
      var nearEnd = endShown.some(Boolean);
      move(!closed && !coverVisible && below && !nearEnd);
      if (inMini || coverVisible) play(); else video.pause();
    }

    // Start buffering straight away where the browser allows it (iPhone Safari
    // won't buffer ahead, so playback is simply started at 3 seconds rather than
    // waiting for a "ready" signal that Safari never sends). Until the first
    // frame arrives the video is transparent, so the photo stays in view.
    video.preload = 'auto';
    video.load();
    function start() {
      if (started) return;
      started = true;
      fig.classList.add('is-playing');
      update();
    }
    setTimeout(start, 3000);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { coverVisible = es[0].isIntersecting; update(); }, { threshold: 0 }).observe(fig);
      var endIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) { endShown[ends.indexOf(e.target)] = e.isIntersecting; });
        update();
      }, { threshold: 0 });
      ends.forEach(function (el) { endIO.observe(el); });
    }
    if (mini) mini.querySelector('.demo-mini-x').addEventListener('click', function () { closed = true; update(); });
  })();

  // ---------- Shared scroll controller (same pattern as index.htm) ----------
  // Eased anchor jumps + slow trailing momentum on desktop mouse wheels.
  (function () {
    var ctrl = { anchorActive: false, wheelRaf: null };
    function easeInQuad(t) { return t * t; }
    function animateScrollTo(targetY) {
      var startY = window.pageYOffset, diff = targetY - startY;
      if (Math.abs(diff) < 1) return;
      var duration = Math.min(1400, Math.max(500, Math.abs(diff) * 0.7)), startTime = null;
      ctrl.anchorActive = true;
      function step(ts) {
        if (!ctrl.anchorActive) return;
        if (startTime === null) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        window.scrollTo({ top: startY + diff * easeInQuad(progress), left: 0, behavior: 'instant' });
        if (progress < 1) requestAnimationFrame(step); else ctrl.anchorActive = false;
      }
      requestAnimationFrame(step);
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      if (!id) return;
      link.addEventListener('click', function (e) {
        var target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        var offset = (headerEl ? headerEl.offsetHeight : 0) + (id === 'top' ? 0 : 16);
        var targetY = id === 'top' ? 0 : target.getBoundingClientRect().top + window.pageYOffset - offset;
        if (reduce) window.scrollTo({ top: targetY, left: 0, behavior: 'instant' });
        else animateScrollTo(targetY);
        if (history.pushState) history.pushState(null, '', '#' + id);
      });
    });

    if (!reduce && 'ontouchstart' in window === false) {
      var virtualY = window.pageYOffset, targetY = window.pageYOffset;
      function wheelLoop() {
        virtualY += (targetY - virtualY) * 0.11;
        if (Math.abs(targetY - virtualY) < 0.4) {
          virtualY = targetY;
          window.scrollTo({ top: virtualY, left: 0, behavior: 'instant' });
          ctrl.wheelRaf = null;
          return;
        }
        window.scrollTo({ top: virtualY, left: 0, behavior: 'instant' });
        ctrl.wheelRaf = requestAnimationFrame(wheelLoop);
      }
      window.addEventListener('wheel', function (e) {
        // leave pinch-zoom and sideways trackpad swipes to the browser
        if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        ctrl.anchorActive = false;
        var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        virtualY = window.pageYOffset;
        targetY = Math.min(maxScroll, Math.max(0, targetY + e.deltaY * 0.7));
        e.preventDefault();
        if (!ctrl.wheelRaf) ctrl.wheelRaf = requestAnimationFrame(wheelLoop);
      }, { passive: false });
      window.addEventListener('scroll', function () {
        if (!ctrl.wheelRaf && !ctrl.anchorActive) targetY = window.pageYOffset;
      }, { passive: true });
    }
  })();

  // ---------- dataLayer CTA tracking (GTM) ----------
  window.dataLayer = window.dataLayer || [];
  document.querySelectorAll('[data-cta]').forEach(function (el) {
    el.addEventListener('click', function () { window.dataLayer.push({ event: 'cta_click', cta_id: el.getAttribute('data-cta') }); });
  });
})();
