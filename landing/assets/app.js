/* ==========================================================================
   Mirai Voice — landing behaviour. No dependencies.
   Everything here degrades to "static page" if JS never runs or motion is off.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = motionQuery.matches;
  motionQuery.addEventListener('change', function (e) { reduced = e.matches; });

  var css = function (name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  };

  /* ── Theme ─────────────────────────────────────────────────────────── */
  (function theme() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    var sync = function () {
      var dark = root.dataset.theme !== 'light';
      btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    };
    sync();
    btn.addEventListener('click', function () {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('mv-theme', root.dataset.theme); } catch (e) {}
      sync();
      window.dispatchEvent(new CustomEvent('mv:theme'));
    });
  })();

  /* ── Nav: material appears only once content slides under it ───────── */
  (function nav() {
    var el = document.getElementById('nav');
    if (!el) return;
    var on = false;
    var read = function () {
      var next = window.scrollY > 8;
      if (next !== on) { on = next; el.dataset.scrolled = String(on); }
    };
    read();
    addEventListener('scroll', read, { passive: true });
  })();

  /* ── Scroll reveals (staggered per group, once) ────────────────────── */
  (function reveals() {
    var items = [].slice.call(document.querySelectorAll('.reveal'));
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (n) { n.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var sibs = [].slice.call(el.parentElement.querySelectorAll(':scope > .reveal'));
        var i = Math.max(0, sibs.indexOf(el));
        el.style.setProperty('--rv-d', Math.min(i * 45, 225) + 'ms');
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (n) { io.observe(n); });
  })();

  /* ── Number tickers ────────────────────────────────────────────────── */
  (function counters() {
    var nodes = [].slice.call(document.querySelectorAll('[data-count]'));
    if (!nodes.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        var target = parseInt(el.dataset.count, 10) || 0;
        if (reduced || target === 0) { el.textContent = String(target); return; }
        var t0 = performance.now();
        var dur = 900;
        (function step(now) {
          var p = Math.min(1, (now - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.6 });
    nodes.forEach(function (n) { io.observe(n); });
  })();

  /* ── Code block: tabs, streamed typing, copy ───────────────────────── */
  (function codeblock() {
    var out = document.getElementById('code-out');
    var caret = document.getElementById('caret');
    var tabs = [].slice.call(document.querySelectorAll('.code__tab'));
    var line = document.getElementById('tabline');
    var verb = document.getElementById('code-verb');
    var path = document.getElementById('code-path');
    var copyBtn = document.getElementById('copy-btn');
    var pre = document.querySelector('.code__pre');
    if (!out || !tabs.length) return;

    var sources = [].slice.call(document.querySelectorAll('[data-snippet]')).map(function (n) {
      return n.textContent.replace(/^\n/, '');
    });

    /* --- tiny highlighter -------------------------------------------- */
    var RE = new RegExp([
      '(#[^\\n]*)',                                  // comment
      '(^[A-Za-z][\\w-]*:(?= ))',                    // http header name
      '("(?:[^"\\\\]|\\\\.)*"(?=\\s*:))',            // json key
      '("(?:[^"\\\\]|\\\\.)*")',                     // string
      '(\\bhttps?:\\/\\/[^\\s"\']+)',                // url
      '(^curl\\b|\\bPOST\\b|\\bGET\\b)',             // command / verb
      '(\\B-{1,2}[A-Za-z][\\w-]*)',                  // cli flag
      '(\\b\\d+\\b)'                                 // number
    ].join('|'), 'gm');
    var CLASSES = ['tok-com', 'tok-key', 'tok-key', 'tok-str', 'tok-url', 'tok-cmd', 'tok-flag', 'tok-num'];

    var esc = function (s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    var tokenize = function (src) {
      var toks = [], last = 0, m;
      RE.lastIndex = 0;
      while ((m = RE.exec(src))) {
        if (m.index > last) toks.push({ t: src.slice(last, m.index), c: null });
        var cls = null;
        for (var g = 1; g < m.length; g++) { if (m[g] !== undefined) { cls = CLASSES[g - 1]; break; } }
        toks.push({ t: m[0], c: cls });
        last = m.index + m[0].length;
        if (m[0].length === 0) RE.lastIndex++;
      }
      if (last < src.length) toks.push({ t: src.slice(last), c: null });
      return toks;
    };

    var render = function (toks, n) {
      var html = '', used = 0;
      for (var i = 0; i < toks.length && used < n; i++) {
        var t = toks[i], take = Math.min(t.t.length, n - used);
        var chunk = esc(t.t.slice(0, take));
        html += t.c ? '<span class="' + t.c + '">' + chunk + '</span>' : chunk;
        used += take;
      }
      return html;
    };

    var models = sources.map(function (s) { return { src: s, toks: tokenize(s), typed: false }; });
    var active = 0;
    var raf = 0;

    var measureLine = function () {
      var t = tabs[active];
      line.style.setProperty('--tab-x', t.offsetLeft + 'px');
      line.style.setProperty('--tab-w', t.offsetWidth);
    };

    var type = function (i, instant) {
      var m = models[i];
      cancelAnimationFrame(raf);
      if (instant || reduced) {
        out.innerHTML = render(m.toks, m.src.length);
        caret.dataset.on = 'false';
        m.typed = true;
        return;
      }
      var total = m.src.length;
      var dur = Math.max(520, Math.min(1500, total * 1.7));
      var t0 = performance.now();
      caret.dataset.on = 'true';
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur);
        out.innerHTML = render(m.toks, Math.round(total * p));
        if (p < 1) { raf = requestAnimationFrame(step); }
        else { m.typed = true; setTimeout(function () { caret.dataset.on = 'false'; }, 900); }
      })(t0);
    };

    var select = function (i, focus) {
      active = i;
      tabs.forEach(function (t, k) {
        t.classList.toggle('is-active', k === i);
        t.setAttribute('aria-selected', String(k === i));
        t.tabIndex = k === i ? 0 : -1;
      });
      verb.textContent = tabs[i].dataset.verb;
      path.textContent = tabs[i].dataset.path;
      pre.setAttribute('aria-labelledby', tabs[i].id);
      measureLine();
      /* Height is set to this snippet's final height before a character is
         streamed, so the panel never reflows mid-type. */
      if (heights[i]) pre.style.height = heights[i] + 'px';
      type(i, models[i].typed);
      if (focus) tabs[i].focus();
    };

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        select((active + d + tabs.length) % tabs.length, true);
      });
    });

    /* Measure each sample once so switching tabs animates height instead of snapping. */
    var heights = [];
    var measureHeights = function () {
      var keep = out.innerHTML;
      pre.style.height = 'auto';
      models.forEach(function (m, i) {
        out.innerHTML = render(m.toks, m.src.length);
        heights[i] = pre.scrollHeight + 2;
      });
      out.innerHTML = keep;
      pre.style.height = heights[active] + 'px';
    };

    if (copyBtn) {
      var revert;
      copyBtn.addEventListener('click', function () {
        var text = models[active].src;
        var done = function () {
          copyBtn.dataset.copied = 'true';
          clearTimeout(revert);
          revert = setTimeout(function () { copyBtn.dataset.copied = 'false'; }, 1600);
        };
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done);
        else done();
      });
    }

    var relayout = function () { measureHeights(); measureLine(); };
    addEventListener('resize', relayout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);

    measureHeights();
    select(0);

    /* Start the stream when the block is first seen, not on page load. */
    if ('IntersectionObserver' in window && !reduced) {
      models[0].typed = false;
      out.innerHTML = '';
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        type(0, false);
      }, { threshold: 0.25 });
      io.observe(document.querySelector('.code'));
    }
  })();

  /* ── Hero: a call, simulated ───────────────────────────────────────── */
  (function callcard() {
    var canvas = document.getElementById('wave');
    var list = document.getElementById('transcript');
    var timerEl = document.getElementById('call-timer');
    var statusEl = document.getElementById('call-status');
    var latencyEl = document.getElementById('latency-value');
    var card = document.getElementById('callcard');
    if (!canvas || !list) return;

    var ctx = canvas.getContext('2d');
    while (list.firstChild) list.removeChild(list.firstChild); // drop the no-JS fallback

    var script = [
      { who: 'agent',  text: 'नमस्ते! क्या मैं रोहित जी से बात कर रही हूँ?', dur: 2500 },
      { who: 'caller', text: 'जी हाँ, बोलिए।', dur: 1150 },
      { who: 'agent',  text: 'मैं मिराई से बोल रही हूँ — आपका ऑर्डर आज शाम डिलीवर होगा।', dur: 3600 },
      { who: 'caller', text: 'ठीक है, पर पता बदल गया है।', dur: 1750 },
      { who: 'agent',  text: 'कोई बात नहीं — नया पता बता दीजिए, मैं अभी अपडेट कर देती हूँ।', dur: 3700 },
      { who: 'caller', text: 'फ़्लैट 402, ग्रीन पार्क।', dur: 1600 },
      { who: 'agent',  text: 'नोट कर लिया, धन्यवाद! आपका दिन शुभ हो।', dur: 2500 }
    ];
    var SEEDED = 2; // the two turns that already happened when you land on the page
    var GAP = 360;          // the turn gap the waveform draws as near-silence
    var LOOP_PAUSE = 2600;

    /* ---- waveform ---- */
    var BAR = 3, GUT = 3, STEP = 46;
    var bars = [], slots = 0, w = 0, h = 0, dpr = 1;
    var colors = {};

    var callerAlpha = 0.46;
    var readColors = function () {
      colors.agent = css('--accent');
      colors.caller = css('--fg');
      colors.idle = css('--fg-3');
      // the caller trace needs more weight on a light canvas to stay legible
      if (root.dataset.theme === 'light') {
        colors.caller = css('--fg-2');
        callerAlpha = 0.62;
      } else {
        callerAlpha = 0.46;
      }
    };
    readColors();
    addEventListener('mv:theme', readColors);

    var resize = function () {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      slots = Math.ceil(w / (BAR + GUT)) + 2;
      while (bars.length > slots) bars.pop();
    };

    var pushBar = function (amp, who) {
      bars.unshift({ a: amp, who: who });
      if (bars.length > slots) bars.pop();
    };

    var draw = function () {
      ctx.clearRect(0, 0, w, h);
      var mid = h / 2, max = h * 0.42;
      for (var i = 0; i < bars.length; i++) {
        var b = bars[i];
        var x = w - (i + 1) * (BAR + GUT) + subpixel;
        if (x < -BAR) break;
        var len = Math.max(2, b.a * max * 2);
        ctx.fillStyle = b.who === 'agent' ? colors.agent : b.who === 'caller' ? colors.caller : colors.idle;
        ctx.globalAlpha = b.who === 'agent' ? 0.92 : b.who === 'caller' ? callerAlpha : 0.2;
        var r = BAR / 2;
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(x, mid - len / 2, BAR, len, r);
          ctx.fill();
        } else {
          ctx.fillRect(x, mid - len / 2, BAR, len);
        }
      }
      ctx.globalAlpha = 1;
    };

    /* ---- transcript ---- */
    var addLine = function (turn) {
      var li = document.createElement('li');
      li.className = 'line line--' + turn.who;
      li.innerHTML = '<span class="line__who">' + (turn.who === 'agent' ? 'agent' : 'caller') + '</span>' +
                     '<span class="line__text" lang="hi"></span>';
      li.querySelector('.line__text').textContent = turn.text;
      [].forEach.call(list.children, function (n) { n.dataset.stale = 'true'; });
      list.appendChild(li);
      // next frame so the transition actually runs
      requestAnimationFrame(function () { requestAnimationFrame(function () { li.dataset.in = 'true'; }); });
      while (list.children.length > 3) list.removeChild(list.firstElementChild);
    };

    var setLatency = function (target) {
      if (reduced) { latencyEl.textContent = String(target); return; }
      var from = parseInt(latencyEl.textContent, 10) || target - 90;
      var t0 = performance.now();
      (function step(now) {
        var p = Math.min(1, (now - t0) / 280);
        var e = 1 - Math.pow(1 - p, 3);
        latencyEl.textContent = String(Math.round(from + (target - from) * e));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    };

    /* ---- clock ---- */
    /* The call is already 8s old when you arrive — a card that starts empty
       reads as broken, so we seed a plausible past. */
    var clock = 8200, last = 0, acc = 0, subpixel = 0;
    var idx = SEEDED - 1, phase = 'gap', phaseEnds = clock + 340, callStart = 0, running = false, rafId = 0;

    var advance = function () {
      if (phase === 'gap') {
        idx++;
        if (idx >= script.length) {
          phase = 'loop';
          phaseEnds = clock + LOOP_PAUSE;
          statusEl.textContent = 'completed';
          return;
        }
        var turn = script[idx];
        phase = 'turn';
        phaseEnds = clock + turn.dur;
        addLine(turn);
        if (turn.who === 'agent') setLatency(520 + Math.round(Math.random() * 230));
      } else if (phase === 'turn') {
        phase = 'gap';
        phaseEnds = clock + GAP;
      } else { // loop
        idx = -1;
        phase = 'gap';
        phaseEnds = clock + 500;
        callStart = clock;
        statusEl.textContent = 'in progress';
        while (list.firstChild) list.removeChild(list.firstChild);
      }
    };

    var speaker = function () {
      if (phase !== 'turn') return null;
      return script[idx] ? script[idx].who : null;
    };

    var envelope = function (t, who) {
      // syllabic rhythm + grain; agents speak a touch louder and steadier than a phone caller
      var rate = who === 'agent' ? 0.0125 : 0.0155;
      var base = who === 'agent' ? 0.5 : 0.34;
      var s = Math.abs(Math.sin(t * rate)) * 0.55 + Math.abs(Math.sin(t * rate * 0.41 + 1.3)) * 0.25;
      return Math.max(0.06, Math.min(1, base * (0.35 + s) + Math.random() * 0.16));
    };

    var tick = function (now) {
      if (!running) return;
      var dt = Math.min(64, now - last);
      last = now;
      clock += dt;
      acc += dt;

      while (clock >= phaseEnds) advance();

      while (acc >= STEP) {
        acc -= STEP;
        var who = speaker();
        pushBar(who ? envelope(clock, who) : 0.04 + Math.random() * 0.03, who || 'idle');
      }
      subpixel = (acc / STEP) * (BAR + GUT);

      var secs = Math.max(0, Math.floor((clock - callStart) / 1000));
      timerEl.textContent = String(Math.floor(secs / 60)).padStart(2, '0') + ':' + String(secs % 60).padStart(2, '0');

      draw();
      rafId = requestAnimationFrame(tick);
    };

    var start = function () {
      if (running || reduced) return;
      running = true;
      last = performance.now();
      rafId = requestAnimationFrame(tick);
    };
    var stop = function () {
      running = false;
      cancelAnimationFrame(rafId);
    };

    /* Fill the meter with a believable minute of history. */
    var seedHistory = function () {
      var pattern = [['agent', 20], ['idle', 6], ['caller', 17], ['idle', 5],
                     ['agent', 16], ['idle', 7], ['caller', 21], ['idle', 5]];
      var t = 0, i = 0;
      while (bars.length < slots) {
        var seg = pattern[i++ % pattern.length];
        for (var k = 0; k < seg[1] && bars.length < slots; k++) {
          t += STEP;
          pushBar(seg[0] === 'idle' ? 0.04 + Math.random() * 0.03 : envelope(t, seg[0]), seg[0]);
        }
      }
    };

    /* The turns that already happened — a call in progress, not one starting. */
    var seedTranscript = function () {
      script.slice(0, SEEDED).forEach(addLine);
      [].forEach.call(list.children, function (n) {
        n.dataset.in = 'true';
        n.dataset.stale = 'true';
      });
    };

    /* static, dignified fallback when motion is off */
    var staticFrame = function () {
      seedHistory();
      draw();
      script.slice(4).forEach(addLine);
      [].forEach.call(list.children, function (n) { n.dataset.in = 'true'; });
      timerEl.textContent = '00:24';
      latencyEl.textContent = '612';
    };

    resize();
    addEventListener('resize', function () {
      resize();
      if (bars.length < slots) seedHistory();
      draw();
    });

    if (reduced) {
      staticFrame();
      return;
    }

    seedHistory();
    seedTranscript();
    draw();
    latencyEl.textContent = '612';

    // Only run while it is on screen and the tab is in front.
    var visible = true, onscreen = true;
    var sync = function () { (visible && onscreen) ? start() : stop(); };
    document.addEventListener('visibilitychange', function () { visible = !document.hidden; sync(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onscreen = entries[0].isIntersecting;
        sync();
      }, { threshold: 0.05 }).observe(card);
    }
    sync();
  })();
})();
