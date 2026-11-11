/* science: listen, print, mark as learnt (ticks kept in this browser), topic filter by word and class */
(function () {
  'use strict';
  var d = document, SYG = window.SYG;
  function learnt() { try { return JSON.parse(localStorage.getItem('sci-learnt')) || []; } catch (e) { return []; } }
  function save(a) { try { localStorage.setItem('sci-learnt', JSON.stringify(a)); } catch (e) {} }

  /* ticks in every list */
  var done = learnt();
  d.querySelectorAll('li[data-s]').forEach(function (li) { if (done.indexOf(li.getAttribute('data-s')) > -1) li.classList.add('done'); });
  var prog = d.querySelector('[data-progress]');
  if (prog && done.length) { prog.textContent = 'You have marked ' + done.length + ' of ' + d.querySelectorAll('[data-list] li').length + ' topics as learnt.'; prog.hidden = false; }

  var art = d.querySelector('.sci');
  if (art) {
    var slug = art.getAttribute('data-topic'), b = d.querySelector('[data-learnt]');
    function paint() { var on = learnt().indexOf(slug) > -1; b.setAttribute('aria-pressed', String(on)); b.textContent = on ? '✓ Learnt (tap to undo)' : 'Mark this topic as learnt'; b.classList.toggle('ghost', on); }
    b.addEventListener('click', function () { var a = learnt(), i = a.indexOf(slug); if (i > -1) a.splice(i, 1); else a.push(slug); save(a); paint(); if (i < 0) SYG.toast('Marked as learnt'); });
    paint();
    d.querySelector('[data-print]').addEventListener('click', function () { window.print(); });
    var say = d.querySelector('[data-say]'), speaking = false;
    function stop() { if (window.speechSynthesis) speechSynthesis.cancel(); speaking = false; say.textContent = 'Listen'; }
    say.addEventListener('click', function () {
      if (!window.speechSynthesis) { SYG.toast('Your browser cannot read aloud'); return; }
      if (speaking) { stop(); return; }
      var text = d.querySelector('h1').textContent + '. ' + [].map.call(d.querySelectorAll('.sci-text h2,.sci-text h3,.sci-text p,.sci-text li'), function (e) { return e.textContent; }).join('. ');
      /* long text is spoken in pieces, because some browsers stop after a few hundred characters */
      var parts = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text], i = 0;
      var v = speechSynthesis.getVoices().filter(function (x) { return /^en/i.test(x.lang); }), voice = v.filter(function (x) { return /IN/i.test(x.lang); })[0] || v[0];
      function next() {
        if (!speaking || i >= parts.length) { stop(); return; }
        var u = new SpeechSynthesisUtterance(parts[i++]); u.lang = 'en-IN'; u.rate = 0.92; if (voice) u.voice = voice;
        u.onend = next; u.onerror = stop; speechSynthesis.speak(u);
      }
      speaking = true; say.textContent = 'Stop'; next();
    });
    window.addEventListener('pagehide', function () { if (speaking) stop(); });
    if (window.speechSynthesis) speechSynthesis.getVoices();
  }

  /* filter on the home page */
  var q = d.querySelector('[data-filter]');
  if (q) {
    var items = d.querySelectorAll('[data-list] li'), none = d.querySelector('[data-none]'), band = '';
    function apply() {
      var words = q.value.toLowerCase().split(/\s+/).filter(Boolean), shown = 0;
      items.forEach(function (li) { var s = li.getAttribute('data-q'), ok = (!band || li.getAttribute('data-band') === band) && words.every(function (w) { return s.indexOf(w) > -1; }); li.hidden = !ok; if (ok) shown++; });
      d.querySelectorAll('[data-list]').forEach(function (ul) { var any = ul.querySelector('li:not([hidden])'), h = ul.previousElementSibling; ul.hidden = !any; if (h && h.tagName === 'H2') h.hidden = !any; });
      none.hidden = shown > 0;
    }
    q.addEventListener('input', apply);
    d.querySelectorAll('button[data-band]').forEach(function (b) {
      b.addEventListener('click', function () { band = b.getAttribute('data-band'); d.querySelectorAll('button[data-band]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); apply(); });
    });
  }
})();
