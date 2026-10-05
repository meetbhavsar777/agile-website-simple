(function () {
  'use strict';

  // Header shadow on scroll
  var header = document.getElementById('siteHeader');
  var onScroll = function () {
    header.classList.toggle('scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('mainNav');
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Category strip <-> hero scene <-> technology cards
  var tabs = Array.prototype.slice.call(document.querySelectorAll('#catTabs button'));
  var techCards = Array.prototype.slice.call(document.querySelectorAll('#techRow .tech-card'));
  var sceneItems = Array.prototype.slice.call(document.querySelectorAll('#heroScene [data-cat]'));

  function setCategory(cat, scrollTabs) {
    tabs.forEach(function (t) {
      var on = t.dataset.cat === cat;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', String(on));
      if (on && scrollTabs && t.parentElement.scrollWidth > t.parentElement.clientWidth) {
        t.parentElement.scrollTo({ left: t.offsetLeft - 16, behavior: 'smooth' });
      }
    });
    techCards.forEach(function (c) {
      c.classList.toggle('active', c.dataset.cat === cat);
    });
    sceneItems.forEach(function (s) {
      s.classList.toggle('is-active', s.dataset.cat === cat);
    });
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () { setCategory(t.dataset.cat, true); });
  });
  techCards.forEach(function (c) {
    c.addEventListener('mouseenter', function () { setCategory(c.dataset.cat); });
    c.addEventListener('focus', function () { setCategory(c.dataset.cat); });
  });
  sceneItems.forEach(function (s) {
    s.addEventListener('mouseenter', function () { setCategory(s.dataset.cat); });
  });
  setCategory('bioprocessing');

  // Workflow cards: hover / focus moves the selected state
  var wfCards = Array.prototype.slice.call(document.querySelectorAll('#workflowRow .wf-card'));
  function setWorkflow(card) {
    wfCards.forEach(function (c) { c.classList.toggle('active', c === card); });
  }
  wfCards.forEach(function (c) {
    c.addEventListener('mouseenter', function () { setWorkflow(c); });
    c.addEventListener('focus', function () { setWorkflow(c); });
    c.addEventListener('click', function () { if (c.dataset.cat) setCategory(c.dataset.cat); });
  });

  // Arrow controls: scroll the row when it overflows, otherwise step the active item
  document.querySelectorAll('.arrows[data-target]').forEach(function (group) {
    var row = document.getElementById(group.dataset.target);
    if (!row) return;

    function step(dir) {
      if (group.dataset.mode === 'tabs') {
        var i = tabs.findIndex(function (t) { return t.classList.contains('active'); });
        var next = tabs[(i + dir + tabs.length) % tabs.length];
        setCategory(next.dataset.cat, true);
        return;
      }
      if (row.scrollWidth > row.clientWidth + 4) {
        var first = row.children[0];
        var gap = parseFloat(getComputedStyle(row).columnGap) || 14;
        row.scrollBy({ left: dir * (first.getBoundingClientRect().width + gap), behavior: 'smooth' });
        return;
      }
      var items = Array.prototype.slice.call(row.children);
      var cur = items.findIndex(function (el) { return el.classList.contains('active'); });
      var target = items[(cur + dir + items.length) % items.length];
      if (row.id === 'techRow') setCategory(target.dataset.cat);
      else if (row.id === 'workflowRow') setWorkflow(target);
      else {
        items.forEach(function (el) { el.classList.toggle('active', el === target); });
        target.focus({ preventScroll: true });
      }
    }

    group.querySelector('.prev').addEventListener('click', function () { step(-1); });
    group.querySelector('.next').addEventListener('click', function () { step(1); });
  });

  // Reveal on scroll
  var revealEls = document.querySelectorAll('.section-head, .card-row, .partners-inner, .services-head, .apps-grid, .about-inner, .svc-grid, .contact-inner, .sec-head, .prod-grid, .cat-grid, .partner-list, .bento, .pt-tabs, .pt-panels, .pg-row, .pp, .kc, .ab, .pl');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }

  // Enquiry form: opens the visitor's email app with the message filled in
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var f = form.elements;
      var body = ['Name: ' + f.name.value, 'Company: ' + f.company.value, 'Email: ' + f.email.value, 'Phone: ' + f.phone.value,
                  'Interested in: ' + f.interest.value, '', f.message.value].join('\n');
      window.location.href = 'mailto:sales@agilescitech.in?subject=' + encodeURIComponent('Enquiry: ' + f.interest.value) + '&body=' + encodeURIComponent(body);
      document.getElementById('formNote').textContent = 'Your email app should now be open. If it is not, write to sales@agilescitech.in.';
    });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
