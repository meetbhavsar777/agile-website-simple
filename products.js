// Products section: catalogue index, category pages, product detail and the quote list.
(function () {
  'use strict';
  var DATA = window.CATALOG || { categories: [], products: [], logos: {} };
  var ARROW = '<svg><use href="#ic-arrow"/></svg>';
  var KEY = 'agile-quote-list';

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function byId(id) { return DATA.products.filter(function (p) { return p.id === id; })[0]; }
  function cat(slug) { return DATA.categories.filter(function (c) { return c.slug === slug; })[0]; }

  // ---------- quote list (kept in this browser)
  function getList() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function setList(l) { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (e) {} paintCount(); }
  function inList(id) { return getList().indexOf(id) > -1; }
  function toggle(id) {
    var l = getList(), i = l.indexOf(id);
    if (i > -1) l.splice(i, 1); else l.push(id);
    setList(l);
    toast(i > -1 ? 'Removed from quote list' : 'Added to quote list');
    return i === -1;
  }
  function paintCount() {
    var n = getList().length;
    document.querySelectorAll('[data-qcount]').forEach(function (e) { e.textContent = n; });
  }
  var toastTimer;
  function toast(msg) {
    var t = $('toast'); if (!t) return;
    t.textContent = msg; t.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('on'); }, 1800);
  }
  function mail(subject, lines) {
    window.location.href = 'mailto:sales@agilescitech.in?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
  }

  // ---------- product card
  function media(p, cls) {
    var box = el('span', cls + (p.image ? '' : ' no-img'));
    if (p.image) { var im = document.createElement('img'); im.src = p.image; im.alt = ''; im.loading = 'lazy'; box.appendChild(im); }
    else if (DATA.logos[p.partner]) { var lg = document.createElement('img'); lg.src = 'images/partners/' + DATA.logos[p.partner] + '.png'; lg.alt = ''; lg.loading = 'lazy'; box.appendChild(lg); }
    else box.appendChild(el('b', 'wordmark', p.partner));
    return box;
  }
  function card(p) {
    var a = el('article', 'pc');
    var link = el('a', 'pc-link'); link.href = 'product.html?id=' + p.id;
    var pic = media(p, 'pc-pic'); pic.title = 'Quick view';
    pic.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); flip(p, pic); });
    link.appendChild(pic);
    var meta = el('span', 'pc-meta'); meta.appendChild(el('small', '', p.partner)); meta.appendChild(el('i', '', p.tag)); link.appendChild(meta);
    link.appendChild(el('strong', '', p.name)); link.appendChild(el('span', 'pc-desc', p.desc));
    a.appendChild(link);
    var row = el('div', 'pc-act');
    var d = el('a', 'btn btn-primary', 'Details'); d.href = link.href; row.appendChild(d);
    var q = el('button', 'btn btn-line'); q.type = 'button';
    function label() { q.textContent = inList(p.id) ? '✓ In quote' : '+ Quote'; q.classList.toggle('on', inList(p.id)); }
    q.addEventListener('click', function () { toggle(p.id); label(); renderQuote(); });
    label(); row.appendChild(q); a.appendChild(row);
    return a;
  }
  function fill(grid, list) { grid.textContent = ''; list.forEach(function (p) { grid.appendChild(card(p)); }); }
  function matches(p, words) {
    var hay = (p.name + ' ' + p.desc + ' ' + p.partner + ' ' + p.tag + ' ' + p.filter + ' ' + (cat(p.cat) || {}).name).toLowerCase();
    return words.every(function (w) { return hay.indexOf(w) > -1; });
  }
  function words(q) { return q.toLowerCase().split(/\s+/).filter(Boolean); }

  // ---------- quick view: the card picture flips over and grows into a detail panel
  var fx = null;
  function flip(p, source) {
    if (fx) return;
    var c = cat(p.cat), reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var wrap = el('div', 'fx'); wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-label', p.name);
    var card = el('div', 'fx-card');
    var front = el('div', 'fx-face fx-front'); front.appendChild(media(p, 'fx-thumb'));
    var back = el('div', 'fx-face fx-back');

    var pic = el('div', 'fx-pic' + (p.image ? '' : ' no-img'));
    if (p.image) {
      var im = document.createElement('img'); im.src = p.image; im.alt = p.name; pic.appendChild(im);
      var hint = el('span', 'fx-zoom', 'Click image to zoom'); pic.appendChild(hint);
      pic.addEventListener('click', function () { var z = pic.classList.toggle('zoom'); hint.textContent = z ? 'Click to zoom out' : 'Click image to zoom'; });
      pic.addEventListener('mousemove', function (e) { var r = pic.getBoundingClientRect(); im.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%'; });
    } else if (DATA.logos[p.partner]) { var lg = document.createElement('img'); lg.src = 'images/partners/' + DATA.logos[p.partner] + '.png'; lg.alt = p.partner; pic.appendChild(lg); }
    else pic.appendChild(el('b', 'wordmark', p.partner));
    back.appendChild(pic);

    var info = el('div', 'fx-info');
    var top = el('p', 'fx-top'); top.appendChild(el('b', '', p.partner)); top.appendChild(el('span', '', p.tag)); info.appendChild(top);
    info.appendChild(el('h2', '', p.name));
    info.appendChild(el('p', 'fx-lead', p.lead || p.desc));
    var ul = el('ul', 'fx-points');
    (p.points || []).concat(['Authorised supply in India by Agile SciTech', 'Demo, installation, training and AMC by our field team']).forEach(function (t) { ul.appendChild(el('li', '', t)); });
    info.appendChild(ul);
    var dl = el('dl', 'fx-spec');
    [['Manufacturer', p.partner], ['Category', c.name], ['Type', p.tag]].concat(p.specs || []).forEach(function (r) { var d = el('div'); d.appendChild(el('dt', '', r[0])); d.appendChild(el('dd', '', r[1])); dl.appendChild(d); });
    info.appendChild(dl);
    var row = el('div', 'fx-act');
    var add = el('button', 'btn btn-primary btn-lg'); add.type = 'button';
    function label() { add.textContent = inList(p.id) ? '✓ In your quote list' : 'Add to quote list'; }
    add.addEventListener('click', function () { toggle(p.id); label(); renderQuote(); if (window.__refresh) window.__refresh(); });
    label(); row.appendChild(add);
    var full = el('a', 'btn btn-line btn-lg', 'Full details'); full.href = 'product.html?id=' + p.id; row.appendChild(full);
    info.appendChild(row);
    back.appendChild(info);
    var x = el('button', 'fx-close', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close'); back.appendChild(x);

    card.appendChild(front); card.appendChild(back); wrap.appendChild(card); document.body.appendChild(wrap);
    document.documentElement.classList.add('fx-open');

    // start exactly on top of the picture that was clicked, facing forward; end centred, turned over
    var s = source.getBoundingClientRect(), t = card.getBoundingClientRect();
    var from = 'translate(' + (s.left + s.width / 2 - (t.left + t.width / 2)) + 'px,' + (s.top + s.height / 2 - (t.top + t.height / 2)) + 'px) scale(' + (s.width / t.width) + ',' + (s.height / t.height) + ') rotateY(0deg)';
    var to = 'translate(0,0) scale(1,1) rotateY(180deg)';
    var timing = { duration: reduce ? 1 : 850, easing: 'cubic-bezier(.2,.9,.25,1)', fill: 'both' };
    card.animate([{ transform: from }, { transform: 'translate(0,-20px) scale(.8,.8) rotateY(95deg)', offset: .5 }, { transform: to }], timing);
    wrap.animate([{ backgroundColor: 'rgba(10,20,56,0)' }, { backgroundColor: 'rgba(10,20,56,.62)' }], { duration: reduce ? 1 : 500, fill: 'both' });
    source.style.visibility = 'hidden';
    [].forEach.call(info.children, function (ch, i) { ch.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: reduce ? 1 : 450, delay: reduce ? 0 : 480 + i * 60, fill: 'both', easing: 'ease-out' }); });

    function close() {
      if (!fx) return;
      document.removeEventListener('keydown', onKey);
      var s2 = source.getBoundingClientRect(), t2 = card.getBoundingClientRect();
      var back2 = 'translate(' + (s2.left + s2.width / 2 - (t2.left + t2.width / 2)) + 'px,' + (s2.top + s2.height / 2 - (t2.top + t2.height / 2)) + 'px) scale(' + (s2.width / t2.width) + ',' + (s2.height / t2.height) + ') rotateY(0deg)';
      wrap.animate([{ backgroundColor: 'rgba(10,20,56,.62)' }, { backgroundColor: 'rgba(10,20,56,0)' }], { duration: reduce ? 1 : 450, fill: 'both' });
      var ended = false;
      function done() {
        if (ended) return; ended = true;
        source.style.visibility = ''; wrap.remove(); document.documentElement.classList.remove('fx-open'); fx = null;
        var f = source.closest('a, button'); if (f) f.focus({ preventScroll: true });
      }
      card.animate([{ transform: to }, { transform: back2 }], { duration: reduce ? 1 : 600, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' }).onfinish = done;
      setTimeout(done, reduce ? 50 : 700);   // also clean up if the browser never reports the animation as finished
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    x.addEventListener('click', close);
    wrap.addEventListener('click', function (e) { if (e.target === wrap) close(); });
    fx = { close: close }; x.focus({ preventScroll: true });
  }

  // ---------- quote panel on the index page
  function renderQuote() {
    var ul = $('quoteList'); if (!ul) return;
    ul.textContent = '';
    getList().map(byId).filter(Boolean).forEach(function (p) {
      var li = el('li'); li.appendChild(el('span', '', p.name)); li.appendChild(el('small', '', p.partner));
      var x = el('button', '', 'Remove'); x.type = 'button';
      x.addEventListener('click', function () { toggle(p.id); renderQuote(); if (window.__refresh) window.__refresh(); });
      li.appendChild(x); ul.appendChild(li);
    });
  }

  function common() {
    paintCount();
    var t = $('menuToggle'), nav = $('mainNav');
    if (t) t.addEventListener('click', function () { var o = nav.classList.toggle('open'); t.setAttribute('aria-expanded', String(o)); });
    var f = $('rfq');
    if (f) f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      mail('Quote request: ' + (f.dataset.subject || document.title.split(' | ')[0]), ['Email: ' + f.elements.email.value, 'Details: ' + f.elements.what.value]);
    });
  }

  window.CatalogPage = {
    simple: common,
    index: function () {
      common(); renderQuote();
      var search = $('catSearch'), results = $('results'), browse = $('browse'), grid = $('resGrid');
      var partner = new URLSearchParams(location.search).get('partner') || '';
      function run() {
        var q = search.value.trim();
        var on = q || partner;
        results.hidden = !on; browse.hidden = !!on;
        if (!on) return;
        var list = DATA.products.filter(function (p) { return (!partner || p.partner === partner) && matches(p, words(q)); });
        $('resTitle').textContent = list.length + (list.length === 1 ? ' product' : ' products') + (partner ? ' from ' + partner : '') + (q ? ' matching “' + q + '”' : '');
        fill(grid, list); $('resEmpty').hidden = list.length > 0;
      }
      window.__refresh = run;
      search.addEventListener('input', run);
      document.querySelectorAll('.cat-try button').forEach(function (b) { b.addEventListener('click', function () { search.value = b.textContent; run(); search.focus(); }); });
      $('resClear').addEventListener('click', function () { search.value = ''; partner = ''; history.replaceState(null, '', location.pathname); run(); });
      $('quoteSend').addEventListener('click', function (e) {
        e.preventDefault();
        var items = getList().map(byId).filter(Boolean);
        if (!items.length) { toast('Your quote list is empty'); return; }
        mail('Quote request: ' + items.length + ' products', ['Please send pricing for:', ''].concat(items.map(function (p) { return '- ' + p.name + ' (' + p.partner + ')'; })).concat(['', 'Name:', 'Company:', 'Phone:']));
      });
      // category explorer: list on the left, live preview on the right
      var view = $('cxView'), links = [].slice.call(document.querySelectorAll('#cxList a'));
      function show(slug) {
        var c = cat(slug), items = DATA.products.filter(function (p) { return p.cat === slug; });
        links.forEach(function (l) { l.classList.toggle('on', l.dataset.cat === slug); });
        view.textContent = '';
        var head = el('div', 'cx-head');
        head.appendChild(el('small', '', 'Category ' + ('0' + c.n).slice(-2) + ' · ' + c.count + ' product lines'));
        head.appendChild(el('h3', '', c.name)); head.appendChild(el('p', '', c.blurb));
        view.appendChild(head);
        var pics = el('div', 'cx-pics'), seen = {};
        var withImg = items.filter(function (p) { if (!p.image || seen[p.image]) return false; seen[p.image] = 1; return true; }).slice(0, 4);
        withImg.forEach(function (p) {
          var a = el('a'); a.href = 'product.html?id=' + p.id;
          var im = document.createElement('img'); im.src = p.image; im.alt = ''; a.appendChild(im); a.appendChild(el('span', '', p.name)); pics.appendChild(a);
        });
        if (withImg.length) view.appendChild(pics);
        var chips = el('div', 'cx-chips');
        items.filter(function (p) { return withImg.indexOf(p) < 0; }).slice(0, withImg.length ? 5 : 9).forEach(function (p) { var a = el('a', '', p.name); a.href = 'product.html?id=' + p.id; chips.appendChild(a); });
        if (chips.children.length) view.appendChild(chips);
        var foot = el('div', 'cx-foot'), lg = el('div', 'cx-logos');
        c.partners.forEach(function (p) {
          if (DATA.logos[p]) { var im = document.createElement('img'); im.src = 'images/partners/' + DATA.logos[p] + '.png'; im.alt = p; lg.appendChild(im); }
          else lg.appendChild(el('b', 'wordmark', p));
        });
        foot.appendChild(lg);
        var go = el('a', 'btn btn-primary btn-lg', 'View all ' + c.count + ' '); go.href = 'cat-' + slug + '.html'; go.insertAdjacentHTML('beforeend', ARROW); foot.appendChild(go);
        view.appendChild(foot);
        view.classList.remove('in'); void view.offsetWidth; view.classList.add('in');
      }
      links.forEach(function (l) {
        l.addEventListener('mouseenter', function () { show(l.dataset.cat); });
        l.addEventListener('focus', function () { show(l.dataset.cat); });
      });
      if (links.length) show(links[0].dataset.cat);

      run();
      if (location.hash === '#quote') $('quote').scrollIntoView();
    },

    category: function (slug) {
      common();
      var all = DATA.products.filter(function (p) { return p.cat === slug; });
      var search = $('catSearch'), grid = $('grid');
      function checked(id) { return [].map.call(document.querySelectorAll('#' + id + ' input:checked'), function (i) { return i.value; }); }
      function run() {
        var ps = checked('fPartner'), ts = checked('fType'), w = words(search.value);
        var list = all.filter(function (p) { return (!ps.length || ps.indexOf(p.partner) > -1) && (!ts.length || ts.indexOf(p.filter) > -1) && matches(p, w); });
        fill(grid, list);
        $('catCount').textContent = 'Showing ' + list.length + ' of ' + all.length + ' product lines';
        $('resEmpty').hidden = list.length > 0;
      }
      search.addEventListener('input', run);
      document.querySelectorAll('.side input[type=checkbox]').forEach(function (i) { i.addEventListener('change', run); });
      run();
    },

    product: function () {
      common();
      var p = byId(new URLSearchParams(location.search).get('id'));
      if (!p) { location.replace('products.html'); return; }
      var c = cat(p.cat);
      document.title = p.name + ' | Agile SciTech';
      var crumb = $('crumb');
      [['Home', 'home-2.html'], ['Products', 'products.html'], [c.name, 'cat-' + c.slug + '.html']].forEach(function (x) { var a = el('a', '', x[0]); a.href = x[1]; crumb.appendChild(a); crumb.appendChild(document.createTextNode(' / ')); });
      crumb.appendChild(el('span', '', p.name));
      $('pdMedia').appendChild(media(p, 'pd-pic'));
      var pp = $('pdPartner'); pp.appendChild(el('b', '', p.partner)); pp.appendChild(el('span', '', 'Authorized distributor'));
      $('pdName').textContent = p.name;
      $('pdLead').textContent = p.lead || p.desc;
      (p.points || [p.desc, p.tag + ' · ' + c.name]).concat(['Demo, installation, training and AMC by Agile’s field team']).forEach(function (t) { $('pdPoints').appendChild(el('li', '', t)); });
      $('pdCat').textContent = c.name;
      var add = $('pdAdd');
      function label() { add.firstChild.textContent = inList(p.id) ? '✓ In your quote list ' : 'Add to quote list '; }
      add.addEventListener('click', function () { toggle(p.id); label(); }); label();
      $('pdDemo').href = 'mailto:sales@agilescitech.in?subject=' + encodeURIComponent('Demo request: ' + p.name);
      $('ovTitle').textContent = 'Why labs choose ' + p.name;
      $('ovText').textContent = p.why || (p.desc + ' Supplied in India by Agile SciTech as an authorised partner of ' + p.partner + ', with application support, installation and service from our own team.');
      (p.tiles || []).forEach(function (t) { var d = el('div'); d.appendChild(el('small', '', t[0])); d.appendChild(el('strong', '', t[1])); d.appendChild(el('span', '', t[2])); $('ovTiles').appendChild(d); });
      [['Manufacturer', p.partner], ['Category', c.name], ['Type', p.tag]].concat(p.specs || []).concat([['Supply & service', 'Agile SciTech, India']]).forEach(function (r) {
        var tr = el('tr'); tr.appendChild(el('th', '', r[0])); tr.appendChild(el('td', '', r[1])); $('specTable').appendChild(tr);
      });
      c.apps.forEach(function (a, i) { var x = el('a'); x.href = (c.applinks && c.applinks[i]) || 'applications.html'; x.textContent = a + ' '; x.insertAdjacentHTML('beforeend', ARROW); $('appList').appendChild(x); });
      fill($('relGrid'), DATA.products.filter(function (x) { return x.cat === p.cat && x.id !== p.id; }).slice(0, 4));
      $('rfqTitle').textContent = 'Get ' + p.name + ' pricing';
      $('rfq').dataset.subject = p.name + ' (' + p.partner + ')';
    }
  };
})();
