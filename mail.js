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
})();
