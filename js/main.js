(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  /* ---- Theme ---- */
  var toggle = document.getElementById('theme-toggle');
  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      toggle.setAttribute('aria-label', next === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }

  /* ---- Mobile menu ---- */
  var menuBtn = document.getElementById('menu-btn');
  var nav = document.getElementById('nav');
  function closeMenu() {
    if (!nav || !menuBtn) return;
    nav.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeMenu(); });
  }

  /* ---- Portrait: fall back to the monogram if no photo is present ---- */
  var portrait = document.getElementById('portrait-img');
  if (portrait) {
    var ring = portrait.parentNode;
    var markMissing = function () { ring.classList.add('no-photo'); };
    portrait.addEventListener('error', markMissing);
    if (portrait.complete && portrait.naturalWidth === 0) markMissing();
  }

  /* ---- Header hairline ---- */
  var header = document.getElementById('site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Project filters ---- */
  var filters = document.querySelectorAll('.filter');
  var projects = document.querySelectorAll('.proj');
  var countEl = document.getElementById('count-live');
  var emptyEl = document.getElementById('proj-empty');

  function applyFilter(cat) {
    var shown = 0;
    Array.prototype.forEach.call(projects, function (card) {
      var cats = (card.getAttribute('data-cat') || '').split(/\s+/);
      var match = cat === 'all' || cats.indexOf(cat) !== -1;
      card.classList.toggle('is-hidden', !match);
      if (match) shown++;
    });
    if (countEl) countEl.textContent = shown + (shown === 1 ? ' project' : ' projects');
    if (emptyEl) emptyEl.hidden = shown !== 0;
  }

  Array.prototype.forEach.call(filters, function (btn) {
    btn.addEventListener('click', function () {
      Array.prototype.forEach.call(filters, function (b) { b.classList.remove('is-on'); });
      btn.classList.add('is-on');
      applyFilter(btn.getAttribute('data-filter'));
    });
  });
  if (projects.length) applyFilter('all');

  /* ---- Lightbox ---- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbCap = document.getElementById('lb-cap');
  var lbClose = document.getElementById('lb-close');
  var lastFocus = null;

  function openLb(src, cap, alt) {
    if (!lb) return;
    lastFocus = document.activeElement;
    lbImg.src = src;
    lbImg.alt = alt || '';
    lbCap.textContent = cap || '';
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }
  function closeLb() {
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    lbImg.src = '';
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  Array.prototype.forEach.call(document.querySelectorAll('.shot-btn'), function (btn) {
    btn.addEventListener('click', function () {
      var img = btn.querySelector('img');
      openLb(btn.getAttribute('data-full'), btn.getAttribute('data-cap'), img ? img.alt : '');
    });
  });
  if (lbClose) lbClose.addEventListener('click', closeLb);
  if (lb) lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeLb(); closeMenu(); }
  });

  /* ---- Reveal + active nav ---- */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fades = document.querySelectorAll('.fade');

  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(fades, function (el) { el.classList.add('is-in'); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
    Array.prototype.forEach.call(fades, function (el) { revealer.observe(el); });
  }

  var navLinks = nav ? nav.querySelectorAll('a[href^="#"]') : [];
  if (navLinks.length && 'IntersectionObserver' in window) {
    var linkFor = {};
    Array.prototype.forEach.call(navLinks, function (link) {
      linkFor[link.getAttribute('href').slice(1)] = link;
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkFor[entry.target.id];
        if (!link || !entry.isIntersecting) return;
        Array.prototype.forEach.call(navLinks, function (l) { l.classList.remove('is-active'); });
        link.classList.add('is-active');
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(linkFor).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }
})();
