// Loading screen: stays at least ~1.1s so the logo animation can play, leaves once the page has loaded (never longer than 3.5s).
(function () {
  var el = document.getElementById('ld'), root = document.documentElement;
  if (!el || root.classList.contains('ld-skip')) { if (el) el.remove(); return; }
  root.classList.add('ld-on');
  try { sessionStorage.setItem('agile-ld', '1'); } catch (e) {}
  var start = Date.now(), gone = false;
  function hide() {
    if (gone) return; gone = true;
    var wait = Math.max(0, 1100 - (Date.now() - start));
    setTimeout(function () {
      el.classList.add('done'); root.classList.remove('ld-on');
      setTimeout(function () { el.remove(); }, 700);
    }, wait);
  }
  if (document.readyState === 'complete') hide(); else window.addEventListener('load', hide);
  setTimeout(hide, 3500);
})();
