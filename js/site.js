/* buburo.com — no dependencies. */
(function () {
  'use strict';

  const GA_MEASUREMENT_ID = 'G-640LF1B0LE';
  const CONSENT_KEY = 'buburo.consent';

  /* localStorage throws in some privacy modes; never let that break the page. */
  function readConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch (e) {
      return null;
    }
  }

  function saveConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch (e) {
      /* session-only */
    }
  }

  window.gtag = window.gtag || function () {
    (window.dataLayer = window.dataLayer || []).push(arguments);
  };

  let analyticsLoaded = false;

  function loadAnalytics() {
    if (analyticsLoaded || !GA_MEASUREMENT_ID) return;

    analyticsLoaded = true;

    gtag('consent', 'default', {analytics_storage: 'granted'});
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);

    const ga = document.createElement('script');
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;

    document.head.appendChild(ga);
  }

  function grantAnalyticsConsent() {
    saveConsent('granted');

    if (analyticsLoaded) {
      gtag('consent', 'update', {analytics_storage: 'granted'});
    } else {
      loadAnalytics();
    }
  }

  function denyAnalyticsConsent() {
    saveConsent('denied');

    if (analyticsLoaded) gtag('consent', 'update', {analytics_storage: 'denied'});
  }

  /* Public hook, in case consent is triggered elsewhere. */
  window.grantAnalyticsConsent = grantAnalyticsConsent;

  function buildBanner(persist) {
    const el = document.createElement('aside');

    el.className = 'cc';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'false');
    el.setAttribute('aria-labelledby', 'cc-title');

    el.innerHTML = '<h2 id="cc-title">Cookie settings</h2>' + '<p>This site needs no cookies to work. With your permission I also use ' + 'analytics cookies to see which pages people read. ' + '<a href="/privacy/">Privacy &amp; cookies</a></p>' + '<div class="cc-actions">' + '<button class="cc-btn" type="button" data-cc="deny">Only necessary</button>' + '<button class="cc-btn accept" type="button" data-cc="accept">Accept</button>' + '</div>';

    el.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-cc]');
      if (!btn) return;

      if (persist) {
        if (btn.dataset.cc === 'accept') {
          grantAnalyticsConsent();
        } else {
          denyAnalyticsConsent();
        }
      }

      el.remove();
    });

    document.body.appendChild(el);

    const acceptButton = el.querySelector('[data-cc="accept"]');
    if (acceptButton) acceptButton.focus();
  }

  function showBannerIfNeeded() {
    if (!GA_MEASUREMENT_ID) return;
    if (document.querySelector('.cc')) return;

    buildBanner(true);
  }

  /*
   * Visual preview only.
   * Does not save consent and does not enable Analytics.
   *
   * Run showCookieBanner() from the console
   * or load any page with ?cookie-preview in the URL.
   */
  window.showCookieBanner = function () {
    if (document.querySelector('.cc')) return;

    buildBanner(false);
  };

  if (location.search.indexOf('cookie-preview') !== -1) window.showCookieBanner();

  if (GA_MEASUREMENT_ID) {
    const consent = readConsent();

    if (consent === 'granted') {
      loadAnalytics();
    } else if (consent !== 'denied') {
      showBannerIfNeeded();
    }

    /*
     * Let people change their mind.
     * Only shown when Analytics is configured.
     */
    const footerLinks = document.querySelector('.foot-links');

    if (footerLinks) {
      const btn = document.createElement('button');

      btn.type = 'button';
      btn.className = 'cc-reopen';
      btn.textContent = 'Cookie settings';
      btn.addEventListener('click', showBannerIfNeeded);

      footerLinks.appendChild(btn);
    }
  }

  /* ---- mobile menu ---- */
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      const open = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    document.addEventListener('click', function (e) {
      if (!navLinks.classList.contains('open')) return;
      if (e.target.closest('.nav')) return;

      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* ---- install page: copyable commands and URLs ---- */
  const copyButtons = document.querySelectorAll('[data-copy]');

  if (copyButtons.length) {
    function copyText(value) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(value);
      }

      const helper = document.createElement('textarea');
      helper.value = value;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();

      let copied = false;
      try {
        copied = document.execCommand('copy');
      } finally {
        helper.remove();
      }

      return copied ? Promise.resolve() : Promise.reject(new Error('Copy unavailable'));
    }

    copyButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        const originalLabel = button.textContent;

        copyText(button.dataset.copy).then(function () {
          button.textContent = 'Copied';
          button.setAttribute('data-copied', 'true');
          window.setTimeout(function () {
            button.textContent = originalLabel;
            button.removeAttribute('data-copied');
          }, 1600);
        }).catch(function () {
          button.textContent = 'Select text';
          window.setTimeout(function () {
            button.textContent = originalLabel;
          }, 1600);
        });
      });
    });
  }

  /* ---- work index filter ---- */
  const filters = document.getElementById('filters');
  const rows = document.getElementById('projRows');

  if (filters && rows) {
    filters.addEventListener('click', function (e) {
      const btn = e.target.closest('.chip');
      if (!btn) return;

      const filter = btn.dataset.filter;

      filters.querySelectorAll('.chip').forEach(function (chip) {
        chip.setAttribute('aria-pressed', String(chip === btn));
      });

      rows.querySelectorAll('tr').forEach(function (row) {
        row.hidden = !(filter === 'all' || row.dataset.type === filter);
      });
    });
  }

  /* ---- install page: device tabs, reflected in the URL ---- */
  const ptabs = document.getElementById('ptabs');

  if (ptabs) {
    const pane = document.getElementById('platform');
    const VALID_PLATFORMS = ['ios', 'macos'];

    function setPlatform(platform, pushHash) {
      if (VALID_PLATFORMS.indexOf(platform) === -1) platform = 'ios';

      pane.dataset.platform = platform;

      ptabs.querySelectorAll('button').forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.dataset.platform === platform));
      });

      if (pushHash && location.hash !== '#' + platform) history.replaceState(null, '', '#' + platform);
    }

    ptabs.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-platform]');
      if (!btn) return;

      setPlatform(btn.dataset.platform, true);
    });

    /*
     * /webink/install/#macos opens directly on the Mac tab.
     */
    window.addEventListener('hashchange', function () {
      setPlatform(location.hash.replace('#', ''), false);
    });

    setPlatform(location.hash.replace('#', ''), false);
  }

  /* ---- iPhone/iPad guide: switch between SideStore setup and Webink install ---- */
  const installGuide = document.getElementById('installGuide');
  const installGuideTabs = document.getElementById('installGuideTabs');

  if (installGuide && installGuideTabs) {
    const INSTALL_STEPS = ['sidestore', 'webink'];

    function setInstallStep(step) {
      if (INSTALL_STEPS.indexOf(step) === -1) return;

      installGuide.dataset.activeStep = step;

      installGuideTabs.querySelectorAll('[data-install-step]').forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.dataset.installStep === step));
      });
    }

    installGuideTabs.addEventListener('click', function (e) {
      const button = e.target.closest('[data-install-step]');
      if (!button) return;

      setInstallStep(button.dataset.installStep);
    });

    /* Keep the first-time SideStore setup as the default panel. */
    setInstallStep('sidestore');
  }

  /* ---- install page: OS tabs ---- */
  const ostabs = document.getElementById('ostabs');

  if (ostabs) {
    const setup = document.getElementById('setup');

    ostabs.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-os]');
      if (!btn) return;

      setup.dataset.os = btn.dataset.os;

      ostabs.querySelectorAll('button').forEach(function (button) {
        button.setAttribute('aria-pressed', String(button === btn));
      });
    });

    /* Preselect the visitor's platform. */
    const ua = navigator.userAgent;
    const guess = /Windows/i.test(ua) ? 'win' : /Linux|X11/i.test(ua) && !/Android/i.test(ua) ? 'linux' : 'mac';
    const preselected = ostabs.querySelector('[data-os="' + guess + '"]');

    if (preselected) preselected.click();
  }

  /* ---- Webink carousel ---- */
  const track = document.getElementById('carTrack');

  if (track) {
    const carousel = document.getElementById('car');
    const slides = track.querySelectorAll('.car-slide');
    const dots = document.querySelectorAll('.car-dot');

    let index = 0;
    let timer = null;
    let touchStartX = null;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function render() {
      track.style.transform = 'translateX(' + (-index * 100) + '%)';

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      if (reduceMotion) return;

      clearInterval(timer);

      timer = setInterval(function () {
        go(index + 1);
      }, 5000);
    }

    function go(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      render();
      restart();
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        go(dotIndex);
      });
    });

    slides.forEach(function (slide) {
      slide.addEventListener('click', function () {
        go(index + 1);
      });
    });

    carousel.addEventListener('mouseenter', function () {
      clearInterval(timer);
    });

    carousel.addEventListener('mouseleave', restart);

    carousel.addEventListener('focusin', function () {
      clearInterval(timer);
    });

    carousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') {
        go(index + 1);
      } else if (e.key === 'ArrowLeft') {
        go(index - 1);
      }
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        clearInterval(timer);
      } else {
        restart();
      }
    });

    track.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, {passive: true});

    track.addEventListener('touchend', function (e) {
      if (touchStartX === null) return;

      const deltaX = e.changedTouches[0].clientX - touchStartX;

      if (Math.abs(deltaX) > 40) go(deltaX < 0 ? index + 1 : index - 1);

      touchStartX = null;
    }, {passive: true});

    render();
    restart();
  }
})();
