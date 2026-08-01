/**
 * script.js — Data Analyst Portfolio Homepage
 * Handles: nav scroll state, mobile toggle, scroll-reveal,
 *          active nav link tracking, smooth scroll, marquee pause
 */

(function () {
  'use strict';

  /* ── NAV SCROLL STATE ──────────────────────────────────────
     Adds .scrolled to the nav when the page is scrolled past
     the hero, making the background more opaque.
  ─────────────────────────────────────────────────────────── */
  function initNavScroll() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    function update() {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ── MOBILE NAV TOGGLE ─────────────────────────────────────
     Toggles .open on .nav-links and .active on the toggle
     button when the hamburger is clicked on small screens.
  ─────────────────────────────────────────────────────────── */
  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var links  = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('open');
      toggle.classList.toggle('active', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close when any link is clicked
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── SMOOTH SCROLL ─────────────────────────────────────────
     Animates all in-page anchor links, offsetting for the
     fixed nav bar height so headings aren't hidden behind it.
  ─────────────────────────────────────────────────────────── */
  function initSmoothScroll() {
    var nav = document.getElementById('nav');

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id     = link.getAttribute('href').slice(1);
        var target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        var navH = nav ? nav.getBoundingClientRect().height : 64;
        var top  = target.getBoundingClientRect().top + window.pageYOffset - navH - 8;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* ── ACTIVE NAV LINK ───────────────────────────────────────
     Highlights the matching nav link as sections scroll into
     the centre of the viewport.
  ─────────────────────────────────────────────────────────── */
  function initActiveNav() {
    if (!('IntersectionObserver' in window)) return;

    var sections  = document.querySelectorAll('section[id]');
    var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!sections.length || !navAnchors.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navAnchors.forEach(function (a) {
          var href = a.getAttribute('href').slice(1);
          a.classList.toggle('active', href === id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(function (sec) { observer.observe(sec); });
  }

  /* ── SCROLL REVEAL ─────────────────────────────────────────
     Fades elements in as they enter the viewport.
     Elements are VISIBLE by default — JS adds .sr-ready
     only when IntersectionObserver is available, so content
     is never hidden if JS is slow or blocked.

     Targets every major card/block on the page:
     .work-card  .process-card  .astat  .exp-row  .skill-pill
     .skills-col  .section-header  .vis-chip
  ─────────────────────────────────────────────────────────── */
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;

    var SELECTORS = [
      '.section-header',
      '.work-card',
      '.process-card',
      '.process-stats',
      '.astat',
      '.exp-row',
      '.skill-pill',
      '.skills-col',
      '.vis-chip',
      '.contact-item',
      '.btn-primary.btn-lg'
    ];

    var nodes = document.querySelectorAll(SELECTORS.join(','));
    if (!nodes.length) return;

    // Opt into animation — visible until observer fires
    nodes.forEach(function (el) {
      el.classList.add('sr-ready');
    });

    // Stagger grid siblings (cards)
    var STAGGER = ['work-card', 'process-card', 'astat', 'skills-col', 'contact-item', 'skill-pill'];

    nodes.forEach(function (el, i) {
      var shouldStagger = STAGGER.some(function (cls) {
        return el.classList.contains(cls);
      });
      if (shouldStagger) {
        el.style.transitionDelay = (i % 4) * 70 + 'ms';
      }
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('sr-visible');
          observer.unobserve(entry.target); // fire once
        }
      });
    }, { rootMargin: '0px 0px -56px 0px', threshold: 0.05 });

    nodes.forEach(function (el) { observer.observe(el); });
  }

  /* ── MARQUEE PAUSE ON HOVER ────────────────────────────────
     CSS handles the pause via animation-play-state, but this
     adds keyboard focus pause for accessibility.
  ─────────────────────────────────────────────────────────── */
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

  /* ── LIVE CURSOR-GLOW ON HERO ──────────────────────────────
     The hero visual follows the cursor with a subtle radial
     glow effect, adding depth to the static SVG dashboard.
  ─────────────────────────────────────────────────────────── */
  function initHeroGlow() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width)  * 100;
      var y = ((e.clientY - rect.top)  / rect.height) * 100;
      hero.style.setProperty('--gx', x + '%');
      hero.style.setProperty('--gy', y + '%');
    });
  }

  /* ── WORK CARD TILT ────────────────────────────────────────
     Subtle 3-D tilt on project cards following the cursor,
     reinforcing the depth of the dark-glass aesthetic.
  ─────────────────────────────────────────────────────────── */
  function initCardTilt() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 860) return; // skip on mobile

    document.querySelectorAll('.work-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var cx   = rect.left + rect.width  / 2;
        var cy   = rect.top  + rect.height / 2;
        var dx   = (e.clientX - cx) / (rect.width  / 2);
        var dy   = (e.clientY - cy) / (rect.height / 2);
        card.style.transform = 'translateY(-4px) rotateX(' + (-dy * 4) + 'deg) rotateY(' + (dx * 4) + 'deg)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ── BOOT ──────────────────────────────────────────────────── */
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
