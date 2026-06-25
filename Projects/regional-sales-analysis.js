/**
 * regional-sales-analysis.js
 * Page-specific interactions for the Regional Sales Analysis project page.
 * Depends on: ../script.js (mobile nav toggle, scroll-active nav links)
 */

(function () {
  'use strict';

  /* ── Scroll-reveal for sections ──────────────────────────────────────────
     Adds the class .visible to .proj-section and .insight-card elements
     as they enter the viewport, triggering a CSS fade-up transition.
  ──────────────────────────────────────────────────────────────────────── */
  function initScrollReveal () {
    var targets = document.querySelectorAll(
      '.proj-section, .insight-card, .tool-chip, .cleaning-step, .question-block'
    );

    if (!('IntersectionObserver' in window)) {
      // Fallback: just make everything visible immediately
      targets.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // fire once only
        }
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });

    targets.forEach(function (el, i) {
      // Stagger delay for grid children (insight cards, tool chips)
      var isGridChild =
        el.classList.contains('insight-card') ||
        el.classList.contains('tool-chip') ||
        el.classList.contains('cleaning-step');

      if (isGridChild) {
        el.style.transitionDelay = (i % 4) * 60 + 'ms';
      }

      observer.observe(el);
    });
  }

  /* ── Dashboard image expand on click ────────────────────────────────────
     Clicking the dashboard preview toggles an expanded height so the
     visitor can scroll through the full image without leaving the page.
  ──────────────────────────────────────────────────────────────────────── */
  function initDashboardExpand () {
    var wrap = document.querySelector('.dashboard-img-wrap');
    var img  = document.querySelector('.dashboard-img');
    var fade = document.querySelector('.dashboard-img-fade');
    var footer = document.querySelector('.dashboard-preview-footer');

    if (!wrap || !img) return;

    var expanded = false;

    // Add a hint label
    var hint = document.createElement('button');
    hint.className = 'dashboard-expand-btn';
    hint.textContent = 'Click to expand';
    hint.setAttribute('aria-label', 'Expand dashboard preview');
    footer.insertBefore(hint, footer.firstChild);

    function toggle () {
      expanded = !expanded;
      if (expanded) {
        wrap.style.maxHeight = img.naturalHeight + 'px';
        fade.style.opacity   = '0';
        hint.textContent     = 'Click to collapse';
        hint.setAttribute('aria-label', 'Collapse dashboard preview');
      } else {
        wrap.style.maxHeight = '';
        fade.style.opacity   = '1';
        hint.textContent     = 'Click to expand';
        hint.setAttribute('aria-label', 'Expand dashboard preview');
      }
    }

    hint.addEventListener('click', function (e) {
      e.stopPropagation();
      toggle();
    });

    wrap.addEventListener('click', toggle);
    wrap.style.cursor = 'pointer';
  }

  /* ── Table row highlight on hover ───────────────────────────────────────
     Highlights the hovered row across .data-table and .formula-summary
     tables for easier reading, especially on wide tables.
  ──────────────────────────────────────────────────────────────────────── */
  function initTableRowHighlight () {
    var tables = document.querySelectorAll('.data-table tbody, .formula-summary tbody');
    tables.forEach(function (tbody) {
      var rows = tbody.querySelectorAll('tr');
      rows.forEach(function (row) {
        row.addEventListener('mouseenter', function () {
          row.style.background = 'rgba(94, 230, 198, 0.04)';
        });
        row.addEventListener('mouseleave', function () {
          row.style.background = '';
        });
      });
    });
  }

  /* ── Smooth scroll for any in-page anchor links ─────────────────────── */
  function initSmoothScroll () {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ── Boot ────────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initScrollReveal();
    initDashboardExpand();
    initTableRowHighlight();
    initSmoothScroll();
  });

}());
