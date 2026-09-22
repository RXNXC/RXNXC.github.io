/**
 * fraud-analysis.js
 * Page interactions for the Fraud Analysis SQL project page.
 *
 * Requires: ../script.js — handles mobile nav toggle
 *
 * Features:
 *   1. Scroll-reveal  — fade-up animation for all key components
 *   2. SQL copy       — one-click copy on every .sql-block
 *   3. Section spy    — highlights .proj-section-label while scrolling
 *   4. Smooth scroll  — nav-height-aware anchor jump
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     1. SCROLL-REVEAL
     Elements are VISIBLE by default. JS adds .sr-ready (opacity 0,
     translateY) only when IntersectionObserver is available, so
     content always shows if JS is slow or blocked.
  ═══════════════════════════════════════════════════════════════ */
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;

    var SELECTORS = [
      '.proj-section',
      '.tool-card',
      '.q-item',
      '.metric-block',
      '.insight-card',
      '.insight-callout',
      '.cleaning-step',
      '.sql-block'
    ];

    var targets = document.querySelectorAll(SELECTORS.join(','));
    if (!targets.length) return;

    /* Mark for animation — but keep visible until observer fires */
    targets.forEach(function (el) {
      el.classList.add('sr-ready');
    });

    var STAGGER = [
      'tool-card', 'q-item', 'insight-card', 'cleaning-step'
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
        el.style.transitionDelay = (i % 4) * 60 + 'ms';
      }
      observer.observe(el);
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     2. SQL COPY
     Adds copy-to-clipboard to every .sql-copy-btn inside a
     .sql-block. Copies the raw text content of the sibling
     .sql-code element, stripping HTML span tags.
     Shows "Copied!" briefly, then resets to "Copy".
  ═══════════════════════════════════════════════════════════════ */
  function initSqlCopy() {
    document.querySelectorAll('.sql-block').forEach(function (block) {
      var btn     = block.querySelector('.sql-copy-btn');
      var codeEl  = block.querySelector('.sql-code');
      if (!btn || !codeEl) return;

      btn.addEventListener('click', function (e) {
        e.stopPropagation();

        /* Strip HTML tags to get raw SQL text */
        var rawText = codeEl.innerText || codeEl.textContent;

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(rawText)
            .then(function ()  { showCopied(btn); })
            .catch(function () { fallbackCopy(rawText, btn); });
        } else {
          fallbackCopy(rawText, btn);
        }
      });
    });

    function showCopied(btn) {
      var orig = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('sql-copy-btn--done');
      setTimeout(function () {
        btn.textContent = orig;
        btn.classList.remove('sql-copy-btn--done');
      }, 1800);
    }

    function fallbackCopy(text, btn) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showCopied(btn);
      } catch (err) {
        btn.textContent = 'Error';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1800);
      }
      document.body.removeChild(ta);
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     3. SECTION SPY
     Adds .is-active to .proj-section-label when its parent
     section scrolls into the centre band of the viewport.
     Uses rootMargin to define the active band rather than
     computing scroll positions manually.
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
     offsetting by the sticky nav height so headings stay visible.
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
     BOOT
  ═══════════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {
    initScrollReveal();
    initSqlCopy();
    initSectionSpy();
    initSmoothScroll();
  });

}());
