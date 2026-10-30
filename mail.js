/* Email: on a computer every email link and enquiry opens Gmail's compose window with the address,
   subject and message filled in. Phones keep the normal email link, which opens the mail app (usually Gmail). */
(function () {
  var phone = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));

  function gmail(mailto) {
    var u = new URL(mailto), p = new URLSearchParams(u.search);
    var q = new URLSearchParams({ view: 'cm', fs: '1', to: decodeURIComponent(u.pathname) });
    if (p.get('subject')) q.set('su', p.get('subject'));
    if (p.get('body')) q.set('body', p.get('body'));
    return 'https://mail.google.com/mail/?' + q.toString();
  }

  // sendMail('mailto:…?subject=…&body=…')
  window.sendMail = function (mailto) {
    if (phone) { window.location.href = mailto; return; }
    var w = window.open(gmail(mailto), '_blank');
    if (w) w.opener = null;
    else window.location.href = mailto;   // pop-up blocked: fall back to the mail app
  };

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    window.sendMail(a.href);
  });

  /* Forms straight to the company inbox. With both values below filled in, an enquiry or quote request is sent
     by the Google Apps Script (contact-form-google-script.txt) to sales@agilescitech.in once Cloudflare Turnstile
     ("Verify you are human") has passed. Until then, or if sending fails, the form opens Gmail as above. */
  var FORM = {
    endpoint: '',   // the Apps Script web app address, https://script.google.com/macros/s/…/exec
    sitekey: ''     // the Turnstile site key (public)
  };
  var direct = function () { var c = window.AGILE_FORM || FORM; return c.endpoint && c.sitekey ? c : null; };

  var widgets = new Map(), loading;
  function turnstile() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (!loading) loading = new Promise(function (ok, no) {
      var s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true; s.onload = function () { ok(window.turnstile); }; s.onerror = no;
      document.head.appendChild(s);
    });
    return loading;
  }
  // the human check sits above the enquiry form's send button, and on its own line under a quote form's row;
  // dark forms get the dark version, and narrow phones the compact one
  function addCheck(form) {
    if (widgets.has(form)) return;
    var box = document.createElement('div');
    box.className = 'cf-human full';
    var btn = form.querySelector('[type=submit]');
    if (form.id === 'rfq') form.appendChild(box); else form.insertBefore(box, btn);
    widgets.set(form, null);
    var rgb = (getComputedStyle(form).color.match(/\d+/g) || [0, 0, 0]).map(Number);
    var light = rgb[0] * .299 + rgb[1] * .587 + rgb[2] * .114 > 150;
    var compact = box.clientWidth < 300;
    box.style.minHeight = compact ? '140px' : '65px';   // keep its space, so nothing jumps when it appears
    turnstile().then(function (t) {
      widgets.set(form, t.render(box, { sitekey: direct().sitekey, theme: light ? 'dark' : 'light', size: compact ? 'compact' : 'flexible', appearance: 'always' }));
    }).catch(function () { box.remove(); });
  }
  function note(form, text, ok) {
    var n = form.querySelector('.form-note, .cf-note');
    if (!n) { n = document.createElement('p'); n.className = 'cf-note full'; form.appendChild(n); }
    n.textContent = text; n.classList.toggle('cf-ok', !!ok);
  }
  var GMAIL_NOTE = 'Gmail (or your email app) should now be open with your message. If it is not, write to sales@agilescitech.in.';

  // sendForm(form, { subject, body, email, name }, 'mailto:…') sends straight to the inbox, or opens Gmail
  window.sendForm = function (form, msg, mailto) {
    var c = direct(), id = widgets.get(form);
    if (!c || id == null || !window.turnstile) {
      window.sendMail(mailto);
      if (form.querySelector('.form-note')) note(form, GMAIL_NOTE);
      return;
    }
    var token = window.turnstile.getResponse(id);
    if (!token) { note(form, 'Please tick “Verify you are human” above the button, then send again.'); return; }
    var btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    var data = new URLSearchParams({ subject: msg.subject, body: msg.body, email: msg.email || '', name: msg.name || '',
      page: location.href, website: (form.elements.website || {}).value || '', 'cf-turnstile-response': token });
    fetch(c.endpoint, { method: 'POST', body: data })
      .then(function (r) { return r.json(); })
      .then(function (r) {
        if (!r.ok) throw new Error(r.error || 'not sent');
        form.reset();
        if (form.elements.products) form.elements.products.value = '';
        note(form, 'Thank you — your message has reached our sales team at sales@agilescitech.in. We will reply to you by email.', true);
      })
      .catch(function () {
        note(form, 'It could not be sent from here, so Gmail (or your email app) has opened with your message — please press Send there.');
        window.sendMail(mailto);
      })
      .then(function () { btn.disabled = false; window.turnstile.reset(id); });
  };

  // add the human check to each enquiry and quote form once it comes near the screen
  function setup() {
    if (!direct()) return;
    var forms = document.querySelectorAll('#contactForm, #rfq');
    forms.forEach(function (f) {
      // a hidden field people never see: robots that fill in every box give themselves away
      if (!f.elements.website) {
        var hp = document.createElement('input');
        hp.type = 'text'; hp.name = 'website'; hp.tabIndex = -1; hp.autocomplete = 'off'; hp.className = 'cf-hp'; hp.setAttribute('aria-hidden', 'true');
        f.appendChild(hp);
      }
      var n = f.querySelector('.form-note');
      if (n) n.textContent = 'Your message goes straight to our sales team at sales@agilescitech.in.';
    });
    if (!('IntersectionObserver' in window)) { forms.forEach(addCheck); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); addCheck(e.target); } });
    }, { rootMargin: '600px 0px' });
    forms.forEach(function (f) { io.observe(f); f.addEventListener('focusin', function () { addCheck(f); }, { once: true }); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
