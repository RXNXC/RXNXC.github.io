/**
 * script.js — Data Analyst Portfolio Homepage
 *
 * Functions:
 *   1. initNavScroll   — adds .scrolled to nav past 60px
 *   2. initMobileNav   — hamburger toggle for .nav-links
 *   3. initSmoothScroll — animated jump for all #anchor links
 *   4. initActiveNav   — highlights current section's nav link
 *   5. initScrollReveal — fade-up on scroll for cards & sections
 *   6. initMarquee     — keyboard-accessible marquee pause
 *   7. initHeroGlow    — cursor-tracking radial glow in hero
 *   8. initCardTilt    — subtle 3-D tilt on project cards
 */

(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════════
     1. NAV SCROLL STATE
     Adds .scrolled to #nav once user scrolls past 60px,
     which darkens the backdrop via CSS.
  ════════════════════════════════════════════════════════════ */
  function initNavScroll() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    function update() {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }

    window.addEventListener('scroll', update, { passive: true });
    update(); // set correct state on page load without waiting for a scroll event
  }

  /* ════════════════════════════════════════════════════════════
     2. MOBILE NAV TOGGLE
     Targets .nav-links (ul) and .nav-toggle (button) by CLASS,
     not by ID — matching the HTML which has no IDs on these
     elements. Closes the menu when any nav link is clicked.
  ════════════════════════════════════════════════════════════ */
  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var links  = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    function openMenu() {
      links.classList.add('open');
      toggle.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
      // Trap focus: move focus to first link
      var first = links.querySelector('a');
      if (first) first.focus();
    }

    function closeMenu() {
      links.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      if (links.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close when any nav link is clicked
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });

    // Close when user clicks outside the nav area
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-inner')) {
        closeMenu();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  /* ════════════════════════════════════════════════════════════
     3. SMOOTH SCROLL
     Intercepts every <a href="#..."> click and animates the
     scroll, offsetting for the fixed nav height so section
     headings never sit behind the nav bar.
  ════════════════════════════════════════════════════════════ */
  function initSmoothScroll() {
    var nav = document.getElementById('nav');

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var hash   = link.getAttribute('href');
        if (!hash || hash === '#') return;
        var id     = hash.slice(1);
        var target = document.getElementById(id);
        if (!target) return;

        e.preventDefault();
        var navH = nav ? nav.getBoundingClientRect().height : 64;
        var top  = target.getBoundingClientRect().top
                 + window.pageYOffset
                 - navH - 12;

        window.scrollTo({ top: top, behavior: 'smooth' });

        // Update URL without triggering a jump
        if (history.replaceState) {
          history.replaceState(null, '', hash);
        }
      });
    });
  }

  /* ════════════════════════════════════════════════════════════
     4. ACTIVE NAV LINK
     Uses IntersectionObserver to track which section is in
     the central reading zone and highlights its nav link.

     rootMargin: a generous 30% top / 40% bottom window so
     the active state doesn't flicker on short sections.
  ════════════════════════════════════════════════════════════ */
  function initActiveNav() {
    if (!('IntersectionObserver' in window)) return;

    var sections   = document.querySelectorAll('section[id]');
    var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!sections.length || !navAnchors.length) return;

    // Track which section is active so we set all at once
    var activeId = '';

    function setActive(id) {
      if (id === activeId) return;
      activeId = id;
      navAnchors.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href').slice(1) === id);
      });
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    }, {
      // rootMargin: only 30% at top + 40% at bottom = 30% reading window
      rootMargin: '-30% 0px -40% 0px',
      threshold: 0
    });

    sections.forEach(function (sec) { observer.observe(sec); });
  }

  /* ════════════════════════════════════════════════════════════
     5. SCROLL REVEAL
     Content is VISIBLE by default — JS adds .sr-ready (which
     sets opacity:0 + translateY) only when IntersectionObserver
     is available. .sr-visible reverses the transform.

     This way the page is always readable even if JS is blocked
     or slow — no content ever stays hidden.

     Excluded from reveal: .section-header inside the hero
     viewport on load, to avoid a pop-in at page open.

     Stagger delay: grid siblings get a cascading delay so
     cards appear one after another rather than all at once.
  ════════════════════════════════════════════════════════════ */
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;

    var REVEAL_SELECTORS = [
      // Section headers — but NOT the first one (hero is already visible)
      '.section-work .section-header',
      '.section-process .section-header',
      '.section-about .section-header',
      '.section-skills .section-header',
      '.section-contact .contact-title',
      // Cards and repeating elements
      '.work-card',
      '.process-card',
      '.process-stats',
      '.astat',
      '.exp-row',
      '.skills-col',
      '.skill-pill',
      '.contact-item',
      '.btn-primary.btn-lg'
    ];

    var nodes = document.querySelectorAll(REVEAL_SELECTORS.join(','));
    if (!nodes.length) return;

    // Opt every matched element into the animation
    nodes.forEach(function (el) {
      el.classList.add('sr-ready');
    });

    // Stagger siblings that appear in grids/lists
    var STAGGER_CLASSES = [
      'work-card', 'process-card', 'astat',
      'skills-col', 'contact-item', 'skill-pill', 'exp-row'
    ];

    // Group siblings by their parent so stagger resets per group
    var groups = {};
    nodes.forEach(function (el) {
      var isStagger = STAGGER_CLASSES.some(function (cls) {
        return el.classList.contains(cls);
      });
      if (!isStagger) return;

      var key = el.parentNode ? el.parentNode.__revealKey : null;
      if (!key) {
        key = 'g' + Math.random();
        if (el.parentNode) el.parentNode.__revealKey = key;
        groups[key] = 0;
      }
      el.style.transitionDelay = (groups[key] * 75) + 'ms';
      groups[key]++;
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('sr-visible');
          observer.unobserve(entry.target); // fire once only
        }
      });
    }, {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.06
    });

    nodes.forEach(function (el) { observer.observe(el); });
  }

  /* ════════════════════════════════════════════════════════════
     6. MARQUEE PAUSE
     CSS already pauses the animation on :hover via
     animation-play-state. This adds keyboard focus pause
     so keyboard users can read individual items without
     them scrolling away.
  ════════════════════════════════════════════════════════════ */
  function initMarquee() {
    var track = document.querySelector('.marquee-track');
    if (!track) return;

    track.querySelectorAll('.mq-item').forEach(function (item) {
      item.setAttribute('tabindex', '0');
      item.addEventListener('focus', function () {
        track.style.animationPlayState = 'paused';
      });
      item.addEventListener('blur', function () {
        track.style.animationPlayState = '';
      });
    });
  }

  /* ════════════════════════════════════════════════════════════
     7. HERO CURSOR GLOW
     Tracks the mouse position inside the hero section and
     updates the CSS custom properties --gx / --gy which drive
     the radial-gradient in hero::after. Skipped if the user
     prefers reduced motion.
  ════════════════════════════════════════════════════════════ */
  function initHeroGlow() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Skip on touch devices — no mouse to track
    if (!window.matchMedia('(pointer: fine)').matches) return;

    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width)  * 100;
      var y = ((e.clientY - rect.top)  / rect.height) * 100;
      hero.style.setProperty('--gx', x.toFixed(1) + '%');
      hero.style.setProperty('--gy', y.toFixed(1) + '%');
    });

    // Reset glow when cursor leaves the hero
    hero.addEventListener('mouseleave', function () {
      hero.style.setProperty('--gx', '65%');
      hero.style.setProperty('--gy', '35%');
    });
  }

  /* ════════════════════════════════════════════════════════════
     8. CARD TILT
     Applies a subtle CSS perspective tilt to .work-card as the
     cursor moves across it. Uses a CSS transition for the
     RESET (mouseleave) but direct style for the tilt itself
     so the tilt tracks the cursor in real-time without lag.

     Fix: transition-property on the card only lists
     border-color and box-shadow in CSS — so the tilt set
     via inline style doesn't fight with a CSS transform
     transition. On mouseleave we set a short inline
     transition just for the reset, then clear it after.
  ════════════════════════════════════════════════════════════ */
  function initCardTilt() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.innerWidth < 900) return;

    document.querySelectorAll('.work-card').forEach(function (card) {

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var cx   = rect.width  / 2;
        var cy   = rect.height / 2;
        var dx   = (e.clientX - rect.left - cx) / cx;
        var dy   = (e.clientY - rect.top  - cy) / cy;

        // Clamp to ±1 to prevent extreme angles
        dx = Math.max(-1, Math.min(1, dx));
        dy = Math.max(-1, Math.min(1, dy));

        card.style.transition = 'border-color 0.22s ease, box-shadow 0.22s ease';
        card.style.transform  =
          'perspective(800px) translateY(-4px) '
          + 'rotateX(' + (-dy * 5).toFixed(2) + 'deg) '
          + 'rotateY(' +  (dx * 5).toFixed(2) + 'deg)';
      });

      card.addEventListener('mouseleave', function () {
        // Smooth reset back to flat — add transform to transition just for this
        card.style.transition =
          'border-color 0.22s ease, box-shadow 0.22s ease, transform 0.3s ease';
        card.style.transform  = '';

        // Remove the inline transition after reset so CSS takes over again
        var timer = setTimeout(function () {
          card.style.transition = '';
        }, 320);

        // If cursor re-enters before timer fires, clear it
        card.addEventListener('mouseenter', function clearTimer() {
          clearTimeout(timer);
          card.removeEventListener('mouseenter', clearTimer);
        }, { once: true });
      });
    });
  }

  /* ════════════════════════════════════════════════════════════
     BOOT
  ════════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {
    initNavScroll();
    initMobileNav();
    initSmoothScroll();
    initActiveNav();
    initScrollReveal();
    initMarquee();
    initHeroGlow();
    initCardTilt();
  });

}());
