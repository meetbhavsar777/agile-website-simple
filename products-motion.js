// Motion for the Products section. Everything is visible without this file; it only adds movement.
// Uses Motion (the vanilla-JS library from the makers of Framer Motion).
import { animate, inView, scroll, stagger } from 'https://cdn.jsdelivr.net/npm/motion@11.18.2/+esm';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (!reduce) {
  const spring = { type: 'spring', stiffness: 130, damping: 18 };
  const all = (s, root = document) => [...root.querySelectorAll(s)];
  const clear = (els) => () => els.forEach((e) => { e.style.transform = ''; e.style.opacity = ''; e.style.filter = ''; });

  // reveal a group once, then hand control back to CSS so hover effects keep working
  function reveal(rootSel, itemSel, from, opts = {}) {
    all(rootSel).forEach((root) => {
      const els = itemSel ? all(itemSel, root) : [root];
      if (!els.length) return;
      els.forEach((e) => { e.style.opacity = 0; });
      inView(root, () => {
        const to = { opacity: [0, 1] };
        for (const k in from) to[k] = [from[k], k === 'scale' ? 1 : (k === 'filter' ? 'blur(0px)' : 0)];
        animate(els, to, { ...spring, delay: stagger(opts.gap ?? 0.06, { startDelay: opts.delay ?? 0 }) }).then(clear(els));
      }, { amount: opts.amount ?? 0.12 });
    });
  }

  // ---------- page top: headline rises word by word
  all('.cat-hero h1, .pd-info h1').forEach((h) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((w) => {
            if (!w.trim()) { frag.appendChild(document.createTextNode(w)); return; }
            const s = document.createElement('span'); s.className = 'mw'; s.textContent = w; frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains('grad')) walk(n);
        else if (n.nodeType === 1) n.classList.add('mw');
      });
    };
    walk(h);
    const words = all('.mw', h);
    // on Partner / Application pages the coloured part wraps across lines, so it stays inline and only fades
    const wraps = !!h.closest('.sx-hero');
    words.forEach((w) => { if (!(wraps && w.classList.contains('grad'))) w.style.display = 'inline-block'; w.style.opacity = 0; });
    animate(words, { opacity: [0, 1], y: [34, 0], filter: ['blur(8px)', 'blur(0px)'] }, { duration: 0.7, ease: [0.2, 0.8, 0.2, 1], delay: stagger(0.045) }).then(clear(words));
  });
  reveal('.cat-hero .container', ':scope > .crumb, :scope > .eyebrow, :scope > .cat-sub, :scope > .cat-search, :scope > .cat-try', { y: 22 }, { gap: 0.07, delay: 0.25, amount: 0 });
  reveal('.pd-media', null, { scale: 0.9, y: 30 }, { amount: 0 });
  reveal('.pd-info', ':scope > .pd-partner, :scope > .pd-lead, .pd-points li, :scope > .btn-row, :scope > .pd-meta', { x: 30 }, { gap: 0.06, delay: 0.3, amount: 0 });

  // ---------- grids
  reveal('.sub-h', null, { y: 20 });
  reveal('.ct-grid', '.ctile', { y: 56, scale: 0.94 }, { gap: 0.07, amount: 0.05 });
  reveal('.bp-grid', '.bp', { y: 24, scale: 0.96 }, { gap: 0.05 });
  reveal('.quote', null, { y: 40, scale: 0.97 });
  reveal('.side', ':scope > *', { x: -24 }, { gap: 0.07, delay: 0.2, amount: 0 });
  reveal('#grid', '.pc', { y: 44, scale: 0.95 }, { gap: 0.05, delay: 0.15, amount: 0 });
  reveal('#relGrid', '.pc', { y: 40, scale: 0.95 }, { gap: 0.07 });
  reveal('.used', ':scope a', { y: 16 }, { gap: 0.05 });
  reveal('.rfq', null, { y: 36, scale: 0.97 });
  reveal('.tiles', ':scope > div', { y: 26, scale: 0.95 }, { gap: 0.08 });
  reveal('.spec', 'tr', { x: -18 }, { gap: 0.04 });

  // ---------- Partners and Applications pages
  reveal('.sx-hero .container', ':scope > div > .crumb, :scope > div > .eyebrow, :scope > div > .sx-badges, :scope > div > .cat-sub, :scope > div > .btn-row', { y: 22 }, { gap: 0.07, delay: 0.25, amount: 0 });
  reveal('.sx-visual', ':scope > *', { y: 40, scale: 0.92 }, { gap: 0.14, delay: 0.2, amount: 0 });
  reveal('.sx-glance', null, { x: 40, scale: 0.96 }, { delay: 0.25, amount: 0 });
  reveal('.sx-head', null, { y: 20 });
  reveal('.sx-table', '.sx-tr', { x: -22 }, { gap: 0.04, amount: 0.05 });
  reveal('.sx-cards', '.sx-card', { y: 34, scale: 0.96 }, { gap: 0.08 });
  reveal('.sx-steps', 'li', { y: 44, scale: 0.94 }, { gap: 0.1 });
  reveal('.sx-band', null, { y: 40, scale: 0.97 });
  reveal('.sx-band', 'li', { y: 20 }, { gap: 0.1, delay: 0.25 });
  reveal('.sx-pairs', '.sx-pair', { y: 26 }, { gap: 0.07 });
  reveal('.sx-pgrid', '.sx-pc', { y: 56, scale: 0.94 }, { gap: 0.07, amount: 0.05 });
  reveal('.sx-matrix', 'tbody tr', { x: -18 }, { gap: 0.03, amount: 0.05 });

  // category tile pictures drift in a little later than their card
  all('.ctile').forEach((t, i) => {
    const pic = t.querySelector('.ct-pic img, .ct-pic svg[viewBox="0 0 32 32"]');
    if (!pic) return;
    inView(t, () => { animate(pic, { scale: [0.6, 1], rotate: [-8, 0], opacity: [0, 1] }, { type: 'spring', stiffness: 170, damping: 14, delay: 0.25 + (i % 3) * 0.07 }).then(clear([pic])); }, { amount: 0.3 });
  });

  // ---------- scroll-linked: progress line and a slow drift on the page-top background
  const bar = document.getElementById('scrollBar');
  if (bar) scroll(animate(bar, { scaleX: [0, 1] }, { ease: 'linear' }));
  const hero = document.querySelector('.cat-hero, .pd-top');
  if (hero) scroll(animate(hero, { backgroundPositionY: ['0px', '120px'] }, { ease: 'linear' }), { target: hero, offset: ['start start', 'end start'] });

  // ---------- pointer: cards tilt toward the cursor and carry a soft light
  if (fine) {
    const tiltable = '.ctile, .pc, .bp';
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest && e.target.closest(tiltable);
      if (!card) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      card.style.setProperty('--rx', ((0.5 - py) * 7).toFixed(2) + 'deg');
      card.style.setProperty('--ry', ((px - 0.5) * 7).toFixed(2) + 'deg');
      card.classList.add('tilt');
    }, { passive: true });
    document.addEventListener('pointerout', (e) => {
      const card = e.target.closest && e.target.closest(tiltable);
      if (card && !card.contains(e.relatedTarget)) { card.classList.remove('tilt'); card.style.removeProperty('--rx'); card.style.removeProperty('--ry'); }
    }, { passive: true });

    // buttons pull slightly toward the cursor
    all('.btn-primary.btn-lg, .cat-hero .btn, .quote .btn, .rfq .btn').forEach((b) => {
      b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.translate = ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px'; });
      b.addEventListener('pointerleave', () => { b.style.translate = ''; });
    });
  }

  // ---------- the quote counter pops when it changes
  all('[data-qcount]').forEach((n) => {
    new MutationObserver(() => animate(n, { scale: [1.6, 1] }, { type: 'spring', stiffness: 400, damping: 12 })).observe(n, { childList: true, characterData: true, subtree: true });
    n.style.display = 'inline-block';
  });
}
