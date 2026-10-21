/* Showcase ideas: product list and the swap helper every idea shares */
const P = {
  dpcr:    { src: '../images/products/dpcr.webp',    t: 'Digital PCR|Systems',                      b: 'RainSure',              href: '../partner-rainsure.html' },
  dac:     { src: '../images/products/dac.webp',     t: 'Production Scale|EX-HPLC & DAC Systems',  b: 'Welch Materials',       href: '../cat-preparative-flash-dac.html' },
  fplc:    { src: '../images/products/fplc.webp',    t: 'Protein Purification|FPLC Systems',       b: 'Inscinstech',           href: '../partner-inscinstech.html' },
  lc:      { src: '../images/products/lc.webp',      t: 'Chromatography|Solutions',                b: 'Welch Materials',       href: '../partner-welch-materials.html' },
  flowcam: { src: '../images/products/flowcam.webp', t: 'Particle Analysis|& Imaging',             b: 'FlowCam',               href: '../partner-flowcam.html' },
  stunner: { src: '../images/products/stunner.webp', t: 'Life Sciences|Instruments',               b: 'Unchained Labs',        href: '../partner-unchained-labs.html' },
  cols:    { src: 'img/hplc-columns.webp',           t: 'HPLC|Columns',                            b: 'Welch Materials',       href: '../cat-hplc-uhplc-gc-columns.html' },
  hplc:    { src: 'img/hplc-system.webp',            t: 'HPLC / UHPLC|Systems',                    b: 'S6000 · Acchrom Tech',  href: '../products.html' },
  cons:    { src: 'img/consumables.webp',            t: 'Chromatography|Consumables',              b: 'Welch Materials',       href: '../cat-lab-consumables-equipment.html' },
  bio:     { src: 'img/bio-research.webp',           t: 'Bio Research|Products',                   b: 'Bio-Techne',            href: '../partner-bio-techne.html' },
  tlc:     { src: 'img/reference-standards.webp',    t: 'Impurities, CRMs|& Nitrosamines',         b: 'TLC Pharma Standards',  href: '../partner-tlc-pharmaceutical-standards.html' },
  prep:    { src: 'img/prep-column.webp',            t: 'Preparative &|Flash Columns',             b: 'Welch Materials',       href: '../cat-preparative-flash-dac.html' },
  media:   { src: 'img/cell-media.webp',             t: 'Cell Culture|Media & Feeds',              b: 'Ajinomoto CELLiST',     href: '../partner-ajinomoto-cellist-korea.html' },
  lunatic: { src: '../images/products/lunatic.webp', t: 'Microvolume|UV/Vis Quantification',      b: 'Unchained Labs',        href: '../partner-unchained-labs.html' },
  tff:     { src: '../images/products/tff.webp',     t: 'Tangential Flow|Filtration',              b: 'Inscinstech',           href: '../partner-inscinstech.html' },
  oligo:   { src: '../images/products/oligo.webp',   t: 'Oligonucleotide|Synthesizers',            b: 'Inscinstech',           href: '../cat-bioprocess-systems.html' },
  qpcr:    { src: '../images/products/qpcr.webp',    t: 'Real-Time|qPCR Systems',                  b: 'RainSure',              href: '../partner-rainsure.html' },
  welprep: { src: '../images/products/welprep.webp', t: 'Preparative|HPLC Systems',                b: 'Welch Materials',       href: '../cat-preparative-flash-dac.html' },
};
const ALL = Object.keys(P);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (location.hash === '#still') document.documentElement.classList.add('still');
const title = (k, one) => one ? P[k].t.replace('|', ' ') : P[k].t.replace('|', '<br>');

// warm pictures so a swap never shows a half-loaded image: on demand, and the rest once the page has loaded
const ready = {};
function load(k) {
  if (!ready[k]) { const i = new Image(); i.src = P[k].src; ready[k] = i.decode ? i.decode().catch(() => {}) : Promise.resolve(); }
  return ready[k];
}
addEventListener('load', () => setTimeout(() => ALL.forEach(load), 400));

/* a product on a plinth: <div class="stage slot"> picture, plinth, label */
function stage(slot, k, withLabel = true) {
  const s = document.createElement('div');
  s.className = 'stage ' + slot;
  s.innerHTML = '<div class="pic"><img alt=""></div><span class="plinth">' +
    (withLabel ? '<a class="lab"><b></b><i></i></a>' : '') + '</span>';
  fill(s, k);
  return s;
}
function fill(s, k) {
  const img = s.querySelector('img'), lab = s.querySelector('.lab');
  img.src = P[k].src; img.alt = title(k, true) + ' — ' + P[k].b;
  if (lab) { lab.href = P[k].href; lab.querySelector('b').innerHTML = title(k); lab.querySelector('i').textContent = P[k].b; }
  s.dataset.k = k;
}
/* old product sinks away, new one drops in */
function swap(s, k, delay = 0) {
  const img = s.querySelector('img'), lab = s.querySelector('.lab');
  return new Promise((done) => setTimeout(async () => {
    img.classList.add('out'); if (lab) lab.classList.add('out');
    // never wait more than 1.5 s for a picture to decode
    await Promise.all([Promise.race([load(k), new Promise((r) => setTimeout(r, 1500))]), new Promise((r) => setTimeout(r, REDUCED ? 250 : 480))]);
    img.classList.remove('out'); img.classList.add('pre');
    fill(s, k);
    void img.offsetWidth;
    img.classList.remove('pre'); if (lab) lab.classList.remove('out');
    done();
  }, delay));
}
/* timer that stops while the tab is hidden */
function every(ms, fn) {
  let id = setInterval(fn, ms);
  document.addEventListener('visibilitychange', () => { clearInterval(id); if (!document.hidden) id = setInterval(fn, ms); });
  return { reset() { clearInterval(id); id = setInterval(fn, ms); } };
}
