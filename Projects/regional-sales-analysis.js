/**
 * regional-sales-analysis.js
 * Interactions for the Regional Sales Analysis project page.
 * Requires: ../script.js (mobile nav, scroll-active links)
 */

(function () {
  'use strict';

  /* ── 1. Scroll-reveal ──────────────────────────────────────────
     Fades sections and cards in as they enter the viewport.
     Key fix vs. previous version: elements are VISIBLE by default
     (no opacity:0 in CSS). JS adds the animation class only when
     IntersectionObserver is supported, so the page always shows
     content even if JS fails or is slow.
  ──────────────────────────────────────────────────────────────── */
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;

    var selectors = [
      '.proj-section',
      '.gallery-card',
      '.insight-card',
      '.tool-chip',
      '.cleaning-step'
    ];

    // Add base animation class so CSS can target them
    var targets = document.querySelectorAll(selectors.join(','));
    targets.forEach(function (el) {
      el.classList.add('sr-ready');
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('sr-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -48px 0px', threshold: 0.04 });

    targets.forEach(function (el, i) {
      // Stagger grid children slightly
      var isChild = el.classList.contains('insight-card') ||
                    el.classList.contains('tool-chip')    ||
                    el.classList.contains('gallery-card') ||
                    el.classList.contains('cleaning-step');
      if (isChild) {
        el.style.transitionDelay = (i % 4) * 55 + 'ms';
      }
      observer.observe(el);
    });
  }

  /* ── 2. Lightbox ───────────────────────────────────────────────
     Opens a full-screen modal when user clicks a gallery card.
     Scrollable so tall dashboard images can be fully viewed.
     Closes on backdrop click, close button, or Escape key.
  ──────────────────────────────────────────────────────────────── */
  function initLightbox() {
    var lightbox  = document.getElementById('lightbox');
    var lbImg     = document.getElementById('lightbox-img');
    var lbTitle   = document.getElementById('lightbox-title');
    var lbClose   = lightbox.querySelector('.lightbox-close');
    var lbBackdrop = lightbox.querySelector('.lightbox-backdrop');

    if (!lightbox || !lbImg) return;

    function openLightbox(imgSrc, title) {
      lbImg.src = imgSrc;
      lbImg.alt = title;
      lbTitle.textContent = title;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      lbImg.src = '';
    }

    // Attach click to every gallery card
    document.querySelectorAll('.gallery-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var img   = card.getAttribute('data-img');
        var title = card.getAttribute('data-title') || 'Dashboard Preview';
        openLightbox(img, title);
      });
      // Keyboard: Enter or Space opens it
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });

    lbClose.addEventListener('click', closeLightbox);
    lbBackdrop.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) {
        closeLightbox();
      }
    });
  }

  /* ── 3. Table row highlight ────────────────────────────────────
     Subtle row hover highlight on data and formula tables.
     (CSS :hover handles this now, so this is just a safety net
      for browsers that need explicit JS assist.)
  ──────────────────────────────────────────────────────────────── */
  function initTableHighlight() {
    // CSS handles hover now via tbody tr:hover — nothing needed here.
    // Kept as a placeholder for future interactive table features.
  }

  /* ── 4. Smooth scroll for in-page anchor links ─────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href').slice(1);
        var target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ── Boot ────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initScrollReveal();
    initLightbox();
    initTableHighlight();
    initSmoothScroll();
  });

}());
