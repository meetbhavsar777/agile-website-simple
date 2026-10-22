// Partners, Applications and Services pages: filter chips, and "Send inquiry" buttons that pre-fill the form.
(function () {
  [].forEach.call(document.querySelectorAll('[data-chips]'), function (bar) {
    var target = document.getElementById(bar.dataset.chips);
    if (!target) return;
    var items = target.querySelectorAll('[data-g]'), buttons = bar.querySelectorAll('button');
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      [].forEach.call(buttons, function (x) { x.classList.toggle('on', x === b); });
      var f = b.dataset.f;
      [].forEach.call(items, function (it) {
        var show = !f || it.dataset.g.split('|').indexOf(f) > -1;
        it.classList.toggle('sx-off', !show);
        if (show && it.animate) it.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'ease-out' });
      });
    });
  });

  var what = document.getElementById('svWhat');
  [].forEach.call(document.querySelectorAll('[data-ask]'), function (a) {
    a.addEventListener('click', function () { if (what) { what.value = a.dataset.ask; setTimeout(function () { what.focus({ preventScroll: true }); }, 600); } });
  });

  // ---------- Services explorer: pick a service on the left, its panel cross-fades in on the right
  var svx = document.getElementById('svx');
  if (svx) {
    var tabs = svx.querySelectorAll('.svx-tab'), panels = svx.querySelectorAll('.svx-panel');
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function pick(id, scroll) {
      var found = false;
      [].forEach.call(panels, function (p) { if (p.id === id) found = true; });
      if (!found) return false;
      [].forEach.call(tabs, function (t) { var on = t.dataset.sv === id; t.classList.toggle('on', on); t.setAttribute('aria-selected', String(on)); if (on && t.scrollIntoView && t.parentNode.scrollWidth > t.parentNode.clientWidth) t.parentNode.scrollTo({ left: t.offsetLeft - 16, behavior: 'smooth' }); });
      [].forEach.call(panels, function (p) {
        var on = p.id === id, was = p.classList.contains('on');
        p.classList.toggle('on', on);
        if (on && !was && !calm && p.animate) [].forEach.call(p.querySelectorAll('.sv-main > *, .sv-main li'), function (el, i) {
          el.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: 120 + i * 35, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
        });
      });
      if (scroll) svx.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      return true;
    }
    svx.addEventListener('click', function (e) { var t = e.target.closest('.svx-tab'); if (t) pick(t.dataset.sv); });
    [].forEach.call(document.querySelectorAll('a[data-sv]'), function (a) { a.addEventListener('click', function (e) { if (pick(a.dataset.sv, true)) e.preventDefault(); }); });
    if (location.hash) pick(location.hash.slice(1), true);
  }
  [].forEach.call(document.querySelectorAll('[data-pick]'), function (b) {
    b.addEventListener('click', function () {
      [].forEach.call(document.querySelectorAll('[data-pick]'), function (x) { x.classList.toggle('on', x === b); });
      if (what) what.value = b.dataset.pick;
    });
  });

  // highlight the service in view in the jump bar
  var jump = document.querySelectorAll('.sv-jump a');
  if (jump.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) [].forEach.call(jump, function (j) { j.classList.toggle('on', j.getAttribute('href') === '#' + e.target.id); }); });
    }, { rootMargin: '-40% 0px -50% 0px' });
    [].forEach.call(document.querySelectorAll('.sv'), function (s) { io.observe(s); });
  }
  // enquiry form (same as the home page): opens Gmail (or the email app on a phone) with the message filled in
  var form = document.getElementById('contactForm');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var f = form.elements;
    // products from the quote list (products.js adds them to the form) go in the same message
    var products = f.products ? f.products.value : '';
    var count = products ? products.split('\n').length : 0;
    var body = ['Name: ' + f.name.value, 'Company: ' + f.company.value, 'Email: ' + f.email.value, 'Phone: ' + f.phone.value, 'Interested in: ' + f.interest.value]
      .concat(products ? ['', 'Products for quotation:', products] : []).concat(['', f.message.value]).join('\n');
    var subject = count ? 'Quote request: ' + count + (count === 1 ? ' product' : ' products') + ' — ' + (f.company.value || f.name.value) : 'Enquiry: ' + f.interest.value;
    (window.sendMail || window.location.assign.bind(window.location))('mailto:sales@agilescitech.in?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body));
    document.getElementById('formNote').textContent = 'Gmail (or your email app) should now be open with your message. If it is not, write to sales@agilescitech.in.';
  });
})();
