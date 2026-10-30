/* Email from the website. Once FORM below is filled in, nothing opens Gmail: every form, email address and
   "Book a demo" button sends straight to the business inbox (sales@agilescitech.in) through the Google Apps Script
   (google-script-for-website-forms.txt), after Cloudflare Turnstile ("Verify you are human"), and a "Message sent"
   notice appears. Until then, email links and forms open Gmail's compose window (on a phone, the mail app). */
(function () {
  var INBOX = 'sales@agilescitech.in';
  var FORM = {
    endpoint: 'https://script.google.com/macros/s/AKfycbwvuVNW8GSWp5U95XO37AT26QEA27DzcXM6VYgoGLjNIour4RU4xeC3XyEwEdu1rcDY/exec',   // the Apps Script web app address
    sitekey: '1x00000000000000000000AA'     // the Turnstile site key (public); this one is Cloudflare's test key, for the GitHub test copy
  };
  var direct = function () { var c = window.AGILE_FORM || FORM; return c.endpoint && c.sitekey ? c : null; };
  var phone = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));

  // ---------- before the inbox is connected: Gmail's compose window, or the phone's mail app
  function gmail(mailto) {
    var u = new URL(mailto), p = new URLSearchParams(u.search);
    var q = new URLSearchParams({ view: 'cm', fs: '1', to: decodeURIComponent(u.pathname) });
    if (p.get('subject')) q.set('su', p.get('subject'));
    if (p.get('body')) q.set('body', p.get('body'));
    return 'https://mail.google.com/mail/?' + q.toString();
  }
  window.sendMail = function (mailto) {
    if (phone) { window.location.href = mailto; return; }
    var w = window.open(gmail(mailto), '_blank');
    if (w) w.opener = null;
    else window.location.href = mailto;   // pop-up blocked: fall back to the mail app
  };

  // email addresses and "Book a demo": a message box on the page once the inbox is connected, Gmail before that
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (direct()) openBox(a.href); else window.sendMail(a.href);
  });

  // ---------- "Message sent" notice
  var toastEl, toastTimer;
  function toast(text, ok) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'mail-toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = (ok ? '✓ ' : '') + text;
    toastEl.classList.toggle('bad', !ok);
    toastEl.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, ok ? 6000 : 8000);
  }

  // ---------- Cloudflare Turnstile, "Verify you are human"
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
  // the human check sits above the send button, and on its own line under a quote form's row;
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
  // a hidden field people never see: robots that fill in every box give themselves away
  function addTrap(form) {
    if (form.elements.website) return;
    var hp = document.createElement('input');
    hp.type = 'text'; hp.name = 'website'; hp.tabIndex = -1; hp.autocomplete = 'off'; hp.className = 'cf-hp'; hp.setAttribute('aria-hidden', 'true');
    form.appendChild(hp);
  }
  function note(form, text, ok) {
    var n = form.querySelector('.form-note, .cf-note');
    if (!n) { n = document.createElement('p'); n.className = 'cf-note full'; form.appendChild(n); }
    n.textContent = text; n.classList.toggle('cf-ok', !!ok);
  }

  // ---------- sendForm(form, { subject, body, email, name }, 'mailto:…', done): straight to the inbox
  window.sendForm = function (form, msg, mailto, done) {
    var c = direct(), id = widgets.get(form);
    if (!c) {
      window.sendMail(mailto);
      if (form.querySelector('.form-note')) note(form, 'Gmail (or your email app) should now be open with your message. If it is not, write to ' + INBOX + '.');
      return;
    }
    var token = id != null && window.turnstile ? window.turnstile.getResponse(id) : '';
    if (!token) { note(form, 'Please tick “Verify you are human” above the button, then send again.'); return; }
    var btn = form.querySelector('[type=submit]'), label = btn.innerHTML;
    btn.disabled = true; btn.textContent = 'Sending…';
    var data = new URLSearchParams({ subject: msg.subject, body: msg.body, email: msg.email || '', name: msg.name || '',
      page: location.href, website: (form.elements.website || {}).value || '', 'cf-turnstile-response': token });
    fetch(c.endpoint, { method: 'POST', body: data })
      .then(function (r) { return r.json(); })
      .then(function (r) {
        if (!r.ok) throw new Error(r.error || 'not sent');
        form.reset();
        if (form.elements.products) form.elements.products.value = '';
        note(form, 'Thank you — your message has reached our team at ' + INBOX + '. We will reply to you by email.', true);
        toast('Message sent — we will reply to you by email.', true);
        if (done) done();
      })
      .catch(function () {
        note(form, 'Your message was not sent. Please try again in a minute, or call +91 88661 01022.');
        toast('Not sent — please try again.', false);
      })
      .then(function () { btn.disabled = false; btn.innerHTML = label; window.turnstile.reset(id); });
  };

  // ---------- the message box for email addresses and "Book a demo"
  var box;
  function openBox(mailto) {
    var u = new URL(mailto), p = new URLSearchParams(u.search), subject = p.get('subject') || '';
    if (!box) {
      box = document.createElement('dialog');
      box.className = 'mail-box';
      box.setAttribute('aria-labelledby', 'mbTitle');
      box.innerHTML = '<form class="contact-form" id="mailBox" novalidate>' +
        '<button type="button" class="mb-x" aria-label="Close">×</button>' +
        '<h3 id="mbTitle">Write to us</h3>' +
        '<p class="mb-to full"></p>' +
        '<label>Name<input type="text" name="name" autocomplete="name" required></label>' +
        '<label>Email<input type="email" name="email" autocomplete="email" required></label>' +
        '<label class="full">Phone<input type="tel" name="phone" autocomplete="tel"></label>' +
        '<label class="full">Message<textarea name="message" required></textarea></label>' +
        '<button type="submit" class="btn btn-primary btn-lg full">Send message</button>' +
        '<p class="form-note">Goes straight to our team; we reply by email.</p></form>';
      document.body.appendChild(box);
      var f = box.querySelector('form');
      box.querySelector('.mb-x').addEventListener('click', function () { box.close(); });
      box.addEventListener('click', function (e) { if (e.target === box) box.close(); });   // click outside the card
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!f.checkValidity()) { f.reportValidity(); return; }
        var el = f.elements, subj = box.dataset.subject || 'Message from the website';
        var body = ['Name: ' + el.name.value, 'Email: ' + el.email.value, 'Phone: ' + el.phone.value, '', el.message.value].join('\n');
        window.sendForm(f, { subject: subj, body: body, email: el.email.value, name: el.name.value }, '', function () { box.close(); });
      });
      addTrap(f);
    }
    var form = box.querySelector('form');
    // a different button than last time starts a fresh message; reopening the same one keeps what was typed
    if (box.dataset.subject !== subject || !form.elements.message.value)
      form.elements.message.value = p.get('body') || (/^Demo request: (.+)/i.test(subject) ? 'I would like to book a demo of ' + subject.replace(/^Demo request: /i, '') + '.' : '');
    box.dataset.subject = subject;
    box.querySelector('#mbTitle').textContent = /^Demo request/i.test(subject) ? 'Book a demo' : 'Write to us';
    box.querySelector('.mb-to').textContent = 'To: Agile SciTech team (' + INBOX + ')' + (subject ? ' · ' + subject : '');
    note(form, 'Goes straight to our team; we reply by email.');
    box.showModal();
    addCheck(form);
    form.elements.name.focus();
  }

  // ---------- connect the page's forms: the human check once a form comes near the screen
  function setup() {
    if (!direct()) return;
    var forms = document.querySelectorAll('#contactForm, #rfq');
    forms.forEach(function (f) {
      addTrap(f);
      var n = f.querySelector('.form-note');
      if (n) n.textContent = 'Your message goes straight to our team at ' + INBOX + '.';
    });
    if (!('IntersectionObserver' in window)) { forms.forEach(addCheck); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); addCheck(e.target); } });
    }, { rootMargin: '600px 0px' });
    forms.forEach(function (f) { io.observe(f); f.addEventListener('focusin', function () { addCheck(f); }, { once: true }); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
