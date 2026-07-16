/* Proposal gateway - client must enter credentials before the site reveals.
   Placed at the end of <body> so the DOM is already parsed when this runs. */
(function(){
  'use strict';

  var CREDENTIALS = { username: 'MagnaConstructions', password: 'Magna2026' };
  var STORAGE_KEY = 'antheon_unlocked_magna';

  var PRELOADER_DURATION = 2000;

  var gatewayContainer = document.getElementById('gateway-container');
  var siteContent = document.getElementById('site-content');
  var preloader = document.getElementById('buildPreloader');
  var overlay = document.getElementById('gwOverlay');
  var card = document.getElementById('gwCard');
  var gatekeeperForm = document.getElementById('gwGatekeeper');
  var feedback = document.getElementById('error-msg');
  var togglePwd = document.getElementById('gwTogglePwd');
  var passInput = document.getElementById('gwPasskey');
  var userInput = document.getElementById('gwUsername');

  if (!gatewayContainer || !siteContent || !gatekeeperForm) return;

  var EYE_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>';
  var EYE_OFF_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a19.4 19.4 0 0 1 5.06-5.94M9.9 4.24A10.9 10.9 0 0 1 12 4c7 0 11 7 11 7a19.5 19.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>';
  if (togglePwd) togglePwd.innerHTML = EYE_ICON;

  function revealSite(){
    siteContent.classList.add('gw-visible');
    if (window.initMagnaSite) window.initMagnaSite();
  }

  function runBuildPreloader(){
    if (!preloader) { revealSite(); return; }
    gatewayContainer.style.display = 'none';
    preloader.style.display = 'flex';
    setTimeout(function(){
      preloader.classList.add('fade-out');
      setTimeout(function(){
        preloader.style.display = 'none';
        revealSite();
      }, 700);
    }, PRELOADER_DURATION);
  }

  // Returning visitor within the same session - skip straight to the site
  if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
    runBuildPreloader();
  }

  if (togglePwd) {
    togglePwd.addEventListener('click', function(){
      var isPassword = passInput.getAttribute('type') === 'password';
      passInput.setAttribute('type', isPassword ? 'text' : 'password');
      togglePwd.innerHTML = isPassword ? EYE_OFF_ICON : EYE_ICON;
      togglePwd.setAttribute('aria-label', isPassword ? 'Hide passkey' : 'Show passkey');
    });
  }

  gatekeeperForm.addEventListener('submit', function(e){
    e.preventDefault();
    var userVal = (userInput.value || '').trim();
    var passVal = passInput.value || '';

    if (userVal === CREDENTIALS.username && passVal === CREDENTIALS.password) {
      feedback.style.color = '#4ade80';
      feedback.textContent = 'Authorized. Welcome.';
      sessionStorage.setItem(STORAGE_KEY, 'true');

      setTimeout(function(){
        card.style.opacity = '0';
        overlay.classList.add('active');

        setTimeout(function(){
          runBuildPreloader();
          setTimeout(function(){ overlay.classList.remove('active'); }, 60);
        }, 650);
      }, 400);
    } else {
      feedback.style.color = '';
      feedback.textContent = 'Invalid credentials. Please try again.';
    }
  });
})();
