/* Home hero: one product in the spotlight, a new one every 4 seconds; the thumbnails below jump to any product. */
(function () {
  var root = document.getElementById('heroSpot');
  if (!root) return;

  // [picture, name (| marks the line break), brand, page]
  var P = [
    ['dac.webp', 'Production Scale|EX-HPLC & DAC Systems', 'Welch Materials', 'cat-preparative-flash-dac.html'],
    ['dpcr.webp', 'Digital PCR|Systems', 'RainSure', 'partner-rainsure.html'],
    ['hplc-columns.webp', 'HPLC|Columns', 'Welch Materials', 'cat-hplc-uhplc-gc-columns.html'],
    ['hplc-system.webp', 'HPLC / UHPLC|Systems', 'S6000 · Acchrom Tech', 'products.html'],
    ['fplc.webp', 'Protein Purification|FPLC Systems', 'Inscinstech', 'partner-inscinstech.html'],
    ['reference-standards.webp', 'Impurities, CRMs|& Nitrosamines', 'TLC Pharmaceutical Standards', 'partner-tlc-pharmaceutical-standards.html'],
    ['prep-column.webp', 'Preparative &|Flash Columns', 'Welch Materials', 'cat-preparative-flash-dac.html'],
    ['cell-media.webp', 'Cell Culture|Media & Feeds', 'Ajinomoto CELLiST', 'partner-ajinomoto-cellist-korea.html'],
    ['lc.webp', 'Chromatography|Solutions', 'Welch Materials', 'partner-welch-materials.html'],
    ['bio-research.webp', 'Bio Research|Products', 'Bio-Techne', 'partner-bio-techne.html'],
    ['flowcam.webp', 'Particle Analysis|& Imaging', 'FlowCam', 'partner-flowcam.html'],
    ['consumables.webp', 'Chromatography|Consumables', 'Welch Materials', 'cat-lab-consumables-equipment.html'],
    ['stunner.webp', 'Life Sciences|Instruments', 'Unchained Labs', 'partner-unchained-labs.html']
  ];
  var DIR = 'images/products/', MS = 4000;
  var noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pic = document.getElementById('hspPic'), img = pic.querySelector('img'), info = document.getElementById('hspInfo');
  var name = document.getElementById('hspT'), brand = document.getElementById('hspB');
  var go = document.getElementById('hspGo'), thumbs = document.getElementById('hspThumbs');
  var plain = function (i) { return P[i][1].replace('|', ' '); };
  var esc = function (s) { return s.replace(/&/g, '&amp;'); };

  P.forEach(function (p, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', plain(i) + ' — ' + p[2]);
    b.innerHTML = '<img src="' + DIR + p[0] + '" alt="" loading="lazy">';
    b.addEventListener('click', function () { show(i); restart(); });
    thumbs.appendChild(b);
  });

  var cur = 0, timer, held = false;
  function mark() {
    [].forEach.call(thumbs.children, function (b, i) {
      b.classList.toggle('on', i === cur);
      b.setAttribute('aria-pressed', String(i === cur));
    });
    var b = thumbs.children[cur];
    if (thumbs.scrollWidth > thumbs.clientWidth) thumbs.scrollTo({ left: b.offsetLeft - (thumbs.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });
  }
  function show(i) {
    if (i === cur) return;
    cur = i;
    var p = P[i], next = new Image();
    next.src = DIR + p[0];
    mark();
    // old product sinks away and the text fades; the new one drops in once its picture is ready
    img.classList.add('out'); info.classList.add('out');
    var ready = next.decode ? next.decode().catch(function () {}) : Promise.resolve();
    Promise.all([ready, new Promise(function (r) { setTimeout(r, noMotion ? 200 : 450); })]).then(function () {
      if (cur !== i) return;
      img.src = next.src; img.alt = plain(i) + ' — ' + p[2];
      img.removeAttribute('width'); img.removeAttribute('height');
      pic.href = go.href = p[3];
      name.innerHTML = esc(p[1]).replace('|', '<br> ');
      brand.textContent = p[2];
      img.classList.remove('out'); img.classList.add('pre');
      void img.offsetWidth;
      img.classList.remove('pre'); info.classList.remove('out');
    });
  }
  function restart() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      if (held || document.hidden) return restart();
      show((cur + 1) % P.length); restart();
    }, MS);
  }
  root.addEventListener('mouseenter', function () { held = true; });
  root.addEventListener('mouseleave', function () { held = false; });
  root.addEventListener('focusin', function () { held = true; });
  root.addEventListener('focusout', function () { held = false; });
  mark(); restart();

  // fetch the other big pictures once the page has settled, so each change is instant
  window.addEventListener('load', function () {
    setTimeout(function () { P.forEach(function (p) { new Image().src = DIR + p[0]; }); }, 1200);
  });
})();
