/**
 * telecom-churn.js
 * Page interactions for the Telecom Customer Churn project page.
 *
 * Requires: ../script.js — handles mobile nav toggle
 *
 * Features:
 *   1. Scroll-reveal  — fade-up for all key component types
 *   2. Lightbox       — full-screen scrollable dashboard viewer
 *   3. Section spy    — highlights active proj-section-label while scrolling
 *   4. Smooth scroll  — animated jump for any in-page anchor
 *   5. KPI counter    — animates KPI numbers counting up on first view
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     1. SCROLL-REVEAL
     Elements are VISIBLE by default. JS adds .sr-ready to opt into
     the fade-up animation, then .sr-visible when they enter the
     viewport. If JS is slow or blocked, the page stays fully visible.
  ═══════════════════════════════════════════════════════════════ */
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;

    var SELECTORS = [
      '.proj-section',
      '.gallery-card',
      '.tool-card',
      '.q-item',
      '.cleaning-step',
      '.metric-block',
      '.kpi-card',
      '.insight-callout',
      '.limitation-card',
      '.stat-pill',
      '.field-group-card'
    ];

    var targets = document.querySelectorAll(SELECTORS.join(','));
    if (!targets.length) return;

    targets.forEach(function (el) {
      el.classList.add('sr-ready');
    });

    var STAGGER = [
      'gallery-card', 'tool-card', 'q-item', 'kpi-card',
      'stat-pill', 'field-group-card', 'limitation-card',
      'cleaning-step', 'metric-block'
    ];

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('sr-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -52px 0px', threshold: 0.04 });

    targets.forEach(function (el, i) {
      var isStaggered = STAGGER.some(function (cls) {
        return el.classList.contains(cls);
      });
      if (isStaggered) {
        el.style.transitionDelay = (i % 5) * 55 + 'ms';
      }
      observer.observe(el);
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     2. LIGHTBOX
     Opens a full-screen modal when user clicks a .gallery-card.
     HTML already sets role="button" and tabindex="0" — not re-set here.
     Scrollable: .lightbox-img-wrap overflow-y: auto for tall images.
     Closes: backdrop click · close button · Escape key.
     Focus: returns to the element that opened the lightbox on close.
  ═══════════════════════════════════════════════════════════════ */
  function initLightbox() {
    var lightbox   = document.getElementById('lightbox');
    var lbImg      = document.getElementById('lightbox-img');
    var lbTitle    = document.getElementById('lightbox-title');
    if (!lightbox || !lbImg || !lbTitle) return;

    var lbClose    = lightbox.querySelector('.lightbox-close');
    var lbBackdrop = lightbox.querySelector('.lightbox-backdrop');
    var lastFocused = null;

    function openLightbox(src, title) {
      lastFocused = document.activeElement;
      lbImg.src = src;
      lbImg.alt = title;
      lbTitle.textContent = title;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (lbClose) lbClose.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(function () { lbImg.src = ''; }, 260);
      if (lastFocused) lastFocused.focus();
    }

    document.querySelectorAll('.gallery-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var src   = card.getAttribute('data-img');
        var title = card.getAttribute('data-title') || 'Dashboard Preview';
        if (src) openLightbox(src, title);
      });

      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });

    if (lbClose)    lbClose.addEventListener('click', closeLightbox);
    if (lbBackdrop) lbBackdrop.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) {
        closeLightbox();
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     3. SECTION SPY
     Highlights .proj-section-label with .is-active class as its
     parent section scrolls into the centre of the viewport.
     Targets only sections with an [id] attribute so only
     addressable, in-page sections participate.
  ═══════════════════════════════════════════════════════════════ */
  function initSectionSpy() {
    if (!('IntersectionObserver' in window)) return;

    var sections = document.querySelectorAll('.proj-section[id]');
    if (!sections.length) return;

    var labelMap = {};
    sections.forEach(function (sec) {
      var label = sec.querySelector('.proj-section-label');
      if (label) labelMap[sec.id] = label;
    });

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var label = labelMap[entry.target.id];
        if (!label) return;
        if (entry.isIntersecting) {
          label.classList.add('is-active');
        } else {
          label.classList.remove('is-active');
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

    sections.forEach(function (sec) { spy.observe(sec); });
  }

  /* ═══════════════════════════════════════════════════════════════
     4. SMOOTH SCROLL
     Intercepts <a href="#..."> clicks and scrolls smoothly,
     offsetting by the sticky nav height so headings aren't hidden.
  ═══════════════════════════════════════════════════════════════ */
  function initSmoothScroll() {
    var nav = document.querySelector('.nav');

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id     = link.getAttribute('href').slice(1);
        var target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        var navH = nav ? nav.getBoundingClientRect().height : 0;
        var top  = target.getBoundingClientRect().top + window.pageYOffset - navH - 16;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     5. KPI COUNTER ANIMATION
     Animates .kpi-value elements counting up from 0 to their
     final value when they first scroll into view.
     Handles numeric values including commas, currency prefixes ($),
     negative signs (−), decimal points, and non-numeric suffixes
     (e.g. "mo" for months).
     Uses requestAnimationFrame for smooth 60fps animation.
  ═══════════════════════════════════════════════════════════════ */
  function initKpiCounters() {
    if (!('IntersectionObserver' in window)) return;

    var kpiValues = document.querySelectorAll('.kpi-value');
    if (!kpiValues.length) return;

    var DURATION = 1200; // ms

    function parseValue(text) {
      // Strip commas, currency, negative signs; keep decimal
      var clean = text.replace(/,/g, '').replace(/\$/, '').replace(/−/, '-');
      // Extract leading number (may be negative, may have decimals)
      var match = clean.match(/^-?[\d.]+/);
      return match ? parseFloat(match[0]) : null;
    }

    function getSuffix(text, num) {
      // Everything after the number
      var numStr = String(Math.abs(num));
      var idx = text.replace(/,/g, '').replace(/\$/, '').replace(/−/, '-').indexOf(numStr);
      if (idx === -1) return '';
      return text.replace(/,/g, '').replace(/\$/, '').replace(/−/, '-').slice(idx + numStr.length);
    }

    function formatNum(num, originalText) {
      var hasComma   = /,/.test(originalText);
      var hasCurrency = /\$/.test(originalText);
      var hasNeg     = /−/.test(originalText);
      var decimals   = (originalText.match(/\.(\d+)/) || ['', ''])[1].length;

      var prefix = (hasNeg ? '−' : '') + (hasCurrency ? '$' : '');
      var absVal = Math.abs(num);
      var formatted;

      if (decimals > 0) {
        formatted = absVal.toFixed(decimals);
      } else {
        formatted = Math.round(absVal).toString();
      }

      if (hasComma) {
        formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }

      return prefix + formatted;
    }

    function animateCounter(el, finalVal, originalText, suffix) {
      var startTime = null;
      var startVal  = 0;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed  = timestamp - startTime;
        var progress = Math.min(elapsed / DURATION, 1);
        // Ease-out cubic
        var eased    = 1 - Math.pow(1 - progress, 3);
        var current  = startVal + (finalVal - startVal) * eased;

        el.textContent = formatNum(current, originalText) + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = formatNum(finalVal, originalText) + suffix;
        }
      }

      requestAnimationFrame(step);
    }

    var counterObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el   = entry.target;
        var text = el.getAttribute('data-original') || el.textContent.trim();
        el.setAttribute('data-original', text);

        var num    = parseValue(text);
        var suffix = num !== null ? getSuffix(text, num) : '';

        if (num !== null) {
          animateCounter(el, num, text, suffix);
        }

        counterObs.unobserve(el);
      });
    }, { threshold: 0.5 });

    kpiValues.forEach(function (el) {
      counterObs.observe(el);
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     BOOT
  ═══════════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {
    initScrollReveal();
    initLightbox();
    initSectionSpy();
    initSmoothScroll();
    initKpiCounters();
  });

}());
