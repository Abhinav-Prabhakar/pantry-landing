// Pantry landing: reveals, the section aura, the nutrient tiles, and the two
// scroll-scrubbed pieces (the cook-once ribbon and the cook-mode screens).
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const root = document.documentElement;

  // ---- palettes: the same pastel auras and two-colour accents as cook mode
  const PAL = {
    mix:   ['#FFE2A6', '#FFC27A', '#FFF1D2', '#D98A1F', '#F2B544'],
    knead: ['#FFC4B0', '#FF9FBE', '#FFE3DA', '#E8577E', '#FF8A6B'],
    rise:  ['#C9BDFF', '#93CEFF', '#EAE5FF', '#6E56F0', '#3BA4FF'],
    sauce: ['#FF9C82', '#FF738B', '#FFD6C6', '#E5352B', '#FF6B4A'],
    shape: ['#8DEADB', '#86C3FF', '#D8F8F2', '#0E9CB5', '#22C3A6'],
    top:   ['#ACEEA2', '#5FDCA8', '#E3FAD6', '#1FA15A', '#7BC93C'],
    bake:  ['#FFB868', '#FF7650', '#FFE08F', '#F0531C', '#FF9A1F'],
    serve: ['#FFD875', '#FF9CC8', '#FFEFBE', '#E0871A', '#FF6FA5'],
  };
  const setAura = (k) => {
    const p = PAL[k]; if (!p) return;
    ['--a1', '--a2', '--a3', '--c1', '--c2'].forEach((v, i) => root.style.setProperty(v, p[i]));
  };
  const auraIO = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) setAura(e.target.dataset.aura); });
  }, { rootMargin: '-48% 0px -48% 0px' });
  $$('[data-aura]').forEach((s) => auraIO.observe(s));

  // ---- nutrient tiles
  const T = [
    ['A', '#F0617A', 100], ['B1', '#E85C5C', 100], ['B2', '#F07D45', 100], ['B3', '#F2A93B', 92], ['B5', '#E8C440', 86],
    ['B6', '#7DCB45', 100], ['B12', '#2FA866', 74], ['B9', '#2EC4A5', 100], ['C', '#1BA0BE', 100], ['D', '#3BA4FF', 22, 1],
    ['E', '#5B7CFA', 54, 1], ['K', '#8F7CF0', 100], ['Cho', '#C46BE0', 38, 1],
    ['Ca', '#FF7FA6', 64], ['Cu', '#F0617A', 100], ['Fe', '#E85C5C', 100], ['Mg', '#F07D45', 82], ['Mn', '#F2A93B', 100],
    ['P', '#E8C440', 100], ['K⁺', '#7DCB45', 78], ['Se', '#2FA866', 100], ['Na', '#2EC4A5', 30], ['Zn', '#1BA0BE', 70],
    ['His', '#7DCB45', 100], ['Ile', '#2FA866', 100], ['Leu', '#2EC4A5', 100], ['Lys', '#1BA0BE', 100], ['Met', '#3BA4FF', 100],
    ['Phe', '#5B7CFA', 100], ['Thr', '#8F7CF0', 100], ['Trp', '#C46BE0', 100], ['Val', '#FF7FA6', 100],
  ];
  const tiles = $('#tiles');
  if (tiles) {
    tiles.innerHTML = T.map(([n, c, v, s], i) =>
      `<div class="tile${s ? ' short' : ''}" style="--c:${c};--v:${v};--i:${i}"><span>${n}</span></div>`).join('');
  }

  // ---- reveals
  const roll = (el) => {
    const to = +el.dataset.count, t0 = performance.now(), dur = 1200;
    if (reduce) { el.textContent = to.toLocaleString('en-US'); return; }
    const step = (t) => {
      const k = clamp((t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = Math.round(to * e).toLocaleString('en-US');
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(roll);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: .12 });
  $$('.rv').forEach((el) => io.observe(el));

  // hero number rolls on load
  const heroN = $('.dial-num [data-count]');
  if (heroN && !reduce) { heroN.textContent = '0'; setTimeout(() => roll(heroN), 250); }

  // ---- glass sheen follows the pointer
  $$('[data-sheen]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--sx', `${e.clientX - r.left}px`);
      el.style.setProperty('--sy', `${e.clientY - r.top}px`);
    });
  });

  // ---- cook once: lanes scrubbed by scroll
  const TOTAL = 130;
  const LANES = [
    ['pasta', 'Roast veg pasta', [[0, 10, 'h', 'Chop and roast the veg'], [10, 26, 'o'], [36, 10, 'h', 'Toss the pasta']]],
    ['pizza', 'Margherita pizza', [[10, 9, 'h', 'Mix the dough'], [19, 9, 'h', 'Knead the dough'], [28, 60, 'o'], [88, 9, 'h', 'Shape the bases'], [97, 10, 'h', 'Top and bake'], [107, 8, 'o']]],
    ['chicken', 'Lemon chicken', [[28, 8, 'h', 'Marinate the chicken'], [36, 40, 'o'], [76, 10, 'h', 'Sear the chicken'], [86, 26, 'o']]],
    ['salad', 'Green salad jars', [[46, 16, 'h', 'Layer the salad jars']]],
    ['curry', 'Chickpea curry', [[62, 14, 'h', 'Start the curry'], [76, 32, 'o'], [108, 5, 'h', 'Finish the curry']]],
    ['oats', 'Overnight oats', [[116, 10, 'h', 'Jar the oats']]],
  ];
  const lanes = $('#lanes');
  const segs = [];
  if (lanes) {
    LANES.forEach(([e, name, ss], li) => {
      const lane = document.createElement('div');
      lane.className = 'lane';
      lane.innerHTML = `<div class="ln"><img src="./assets/emoji/${e}.webp" alt="" width="30" height="30" loading="lazy"><span>${name}</span></div><div class="track-l"></div>`;
      const tr = lane.lastChild;
      ss.forEach(([s, w, k, label]) => {
        const b = document.createElement('i');
        b.className = `seg-b ${k}`;
        b.style.setProperty('--s', (s / TOTAL) * 100);
        b.style.setProperty('--w', (w / TOTAL) * 100);
        tr.appendChild(b);
        segs.push({ b, s, e: s + w, k, label, li, emoji: e, lane });
      });
      lanes.appendChild(lane);
    });
  }
  const needle = $('#needle'), clock = $('#clock'), readout = $('#readout');
  let lastLabel = '';
  const paintSession = (t) => {
    const m = t * TOTAL;
    needle.style.setProperty('--t', t);
    clock.textContent = `${Math.floor(m / 60)}:${String(Math.floor(m % 60)).padStart(2, '0')}`;
    let cur = null;
    const act = new Set();
    segs.forEach((g) => {
      const done = g.e <= m, now = g.s <= m && m < g.e;
      g.b.classList.toggle('done', done);
      g.b.classList.toggle('now', now && g.k === 'h');
      if (now && g.k === 'h') cur = g;
      if (now) act.add(g.lane);
    });
    segs.forEach((g) => g.lane.classList.toggle('act', act.has(g.lane)));
    const label = t >= 1 ? 'done' : cur ? cur.label : 'free';
    if (label !== lastLabel) {
      lastLabel = label;
      readout.classList.toggle('free', !cur);
      readout.innerHTML = t >= 1
        ? '<img src="./assets/emoji/sparkles.webp" alt="" width="26" height="26">A week of food, done'
        : cur ? `<img src="./assets/emoji/${cur.emoji}.webp" alt="" width="26" height="26">${cur.label}` : 'Hands free';
    }
  };

  // ---- cook mode: screens step with scroll
  const cook = $('#cook'), shots = $$('#cook .shot'), steps = $$('#steps li');
  let lastStep = -1;
  const paintCook = (p) => {
    const i = Math.min(steps.length - 1, Math.floor(p * steps.length));
    if (i === lastStep) return;
    lastStep = i;
    steps.forEach((s, k) => s.classList.toggle('on', k === i));
    shots.forEach((s, k) => s.classList.toggle('on', k === i));
  };
  steps.forEach((s, k) => {
    s.addEventListener('click', () => {
      const r = cook.getBoundingClientRect();
      const y = scrollY + r.top + ((k + .5) / steps.length) * (r.height - innerHeight);
      scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  const session = $('#session');
  const progress = (el) => {
    const r = el.getBoundingClientRect();
    return { p: clamp(-r.top / (r.height - innerHeight)), near: r.top < innerHeight * 1.2 && r.bottom > -innerHeight * .2 };
  };
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      if (session && lanes) {
        const { p, near } = progress(session);
        if (near) paintSession(clamp((p - .04) / .88));
      }
      if (cook) {
        const { p, near } = progress(cook);
        if (near) paintCook(p);
      }
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  if (lanes) paintSession(0);
  onScroll();
})();
