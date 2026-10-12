/* ==========================================================
   MAHESH MOCHI — PORTFOLIO SCRIPT (FINAL / COMPLETE)
   ========================================================== */

document.documentElement.classList.add('js');

/* ══════════════════════════════════════
   1. UTILS & CONSTANTS
══════════════════════════════════════ */
const $     = id  => document.getElementById(id);
const $$    = sel => document.querySelectorAll(sel);
const raf   = cb  => requestAnimationFrame(cb);
const rand  = (a, b) => Math.random() * (b - a) + a;
const lerp  = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE    = matchMedia('(hover: hover) and (pointer: fine)').matches;

const C = {
  primary: '139,140,255',
  coral:   '255,138,101',
  light:   '199,200,255',
};

const SKILLS = [
  { name: 'HTML5',        short: 'HTML',  color: '#e34c26', pct: 92, ring: 0, icon: 'html5/html5-original.svg' },
  { name: 'CSS3',         short: 'CSS',   color: '#3b82f6', pct: 88, ring: 0, icon: 'css3/css3-original.svg' },
  { name: 'JavaScript',   short: 'JS',    color: '#f7df1e', pct: 85, ring: 0, icon: 'javascript/javascript-original.svg' },
  { name: 'React',        short: 'React', color: '#61dafb', pct: 78, ring: 0, icon: 'react/react-original.svg' },
  { name: 'Bootstrap',    short: 'BS',    color: '#a78bfa', pct: 80, ring: 1, icon: 'bootstrap/bootstrap-original.svg' },
  { name: 'Tailwind CSS', short: 'TW',    color: '#38bdf8', pct: 74, ring: 1, icon: 'tailwindcss/tailwindcss-original.svg' },
  { name: 'Node.js',      short: 'Node',  color: '#6cc24a', pct: 76, ring: 1, icon: 'nodejs/nodejs-original.svg' },
  { name: 'Express.js',   short: 'Ex',    color: '#9aa4b2', pct: 76, ring: 1, icon: 'express/express-original.svg', invert: true },
  { name: 'MongoDB',      short: 'Mongo', color: '#47a248', pct: 76, ring: 2, icon: 'mongodb/mongodb-original.svg' },
  { name: 'MySQL',        short: 'MySQL', color: '#4aa3d8', pct: 77, ring: 2, icon: 'mysql/mysql-original.svg' },
  { name: 'Java',         short: 'Java',  color: '#f89820', pct: 70, ring: 2, icon: 'java/java-original.svg' },
  { name: 'Git & GitHub', short: 'Git',   color: '#f05032', pct: 82, ring: 2, icon: 'github/github-original.svg', invert: true },
];
const ICON_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/';

let _inited = false;

/* ══════════════════════════════════════
   2. HELPERS
══════════════════════════════════════ */
function fitCanvas(canvas, w, h) {
  const d = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width  = Math.round(w * d);
  canvas.height = Math.round(h * d);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(d, 0, 0, d, 0, 0);
  return ctx;
}

function onResize(el, cb) {
  let queued = false;
  new ResizeObserver(() => {
    if (queued) return;
    queued = true;
    raf(() => { queued = false; cb(); });
  }).observe(el);
}

function animateWhileVisible(el, draw) {
  if (REDUCED) { draw(0); return; }
  let inView = false, running = false;
  const frame = t => { if (!running) return; draw(t); raf(frame); };
  const sync = () => {
    const should = inView && !document.hidden;
    if (should && !running) { running = true; raf(frame); }
    if (!should) running = false;
  };
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }).observe(el);
  document.addEventListener('visibilitychange', sync);
}

/* ══════════════════════════════════════
   3. POINTER
══════════════════════════════════════ */
const mouse = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0 };
if (FINE) {
  document.addEventListener('pointermove', e => {
    mouse.x  = e.clientX;
    mouse.y  = e.clientY;
    mouse.nx = (e.clientX / innerWidth)  * 2 - 1;
    mouse.ny = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });
}

/* ══════════════════════════════════════
   4. CUSTOM CURSOR
══════════════════════════════════════ */
(function initCursor() {
  const dot  = $('cur-dot');
  const ring = $('cur-ring');
  if (!dot || !ring || !FINE || REDUCED) return;

  let rx = mouse.x, ry = mouse.y;

  document.addEventListener('mousemove', e => {
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
  });

  (function trail() {
    rx = lerp(rx, mouse.x, 0.13);
    ry = lerp(ry, mouse.y, 0.13);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    raf(trail);
  })();

  document.addEventListener('mouseover', e => {
    const t = e.target.closest('a,button,.sn,.proj-shell,.glass,.stat-hex,.metric-card,.pp-card,.cta-primary,.cta-ghost,.ai-toggle-btn');
    document.body.classList.toggle('cur-hover', !!t);
  });
})();

/* ══════════════════════════════════════
   5. BOOT SCREEN (once per session)
══════════════════════════════════════ */
(function initBoot() {
  const screen = $('boot-screen');
  let seen = false;
  try { seen = sessionStorage.getItem('booted') === '1'; } catch {}

  if (!screen || seen || REDUCED) {
    if (screen) screen.classList.add('done');
    initAll();
    return;
  }

  const bcanv = $('boot-canvas');
  const fill  = $('boot-fill');
  const pctEl = $('boot-pct');
  const lines = $('boot-lines');
  const skip  = $('boot-skip');

  const bctx = bcanv.getContext('2d');
  bcanv.width  = innerWidth;
  bcanv.height = innerHeight;
  let alive = true;

  (function draw() {
    if (!alive) return;
    bctx.clearRect(0, 0, bcanv.width, bcanv.height);
    const gs = 56;
    bctx.strokeStyle = `rgba(${C.primary},0.05)`;
    bctx.lineWidth = 1;
    for (let x = 0; x < bcanv.width; x += gs) { bctx.beginPath(); bctx.moveTo(x, 0); bctx.lineTo(x, bcanv.height); bctx.stroke(); }
    for (let y = 0; y < bcanv.height; y += gs) { bctx.beginPath(); bctx.moveTo(0, y); bctx.lineTo(bcanv.width, y); bctx.stroke(); }
    bctx.fillStyle = `rgba(${C.primary},0.05)`;
    bctx.fillRect(0, (Date.now() / 6) % bcanv.height, bcanv.width, 2);
    raf(draw);
  })();

  const msgs = [
    ['init', 'Starting portfolio...'],
    ['ok',   'Fonts and styles loaded'],
    ['ok',   'Animations ready'],
    ['init', 'Loading projects...'],
    ['ok',   'Skills ready'],
    ['ok',   'All set. Welcome!'],
  ];

  const DURATION = 2000;
  const t0 = Date.now();
  let msgIdx = 0, finished = false;

  function tick() {
    if (finished) return;
    const pct = Math.min(((Date.now() - t0) / DURATION) * 100, 100);
    fill.style.width = pct + '%';
    pctEl.textContent = Math.floor(pct) + '%';

    const want = Math.floor((pct / 100) * msgs.length);
    while (msgIdx < want) {
      const [type, text] = msgs[msgIdx++];
      const el = document.createElement('div');
      el.className = 'boot-line-item ' + type;
      el.textContent = text;
      lines.appendChild(el);
      lines.scrollTop = lines.scrollHeight;
    }
    pct < 100 ? setTimeout(tick, 16) : setTimeout(done, 300);
  }

  function done() {
    if (finished) return;
    finished = true;
    alive = false;
    try { sessionStorage.setItem('booted', '1'); } catch {}
    screen.classList.add('done');
    setTimeout(initAll, 50);
  }

  skip.addEventListener('click', done);
  document.addEventListener('keydown', done, { once: true });
  tick();
})();

/* ══════════════════════════════════════
   6. INIT ALL
══════════════════════════════════════ */
function initAll() {
  if (_inited) return;
  _inited = true;

  const steps = [
    initScrollProgress,
    initNav,
    initHeroCanvas,
    initTyped,
    initPortraitTilt,
    initHoloParticles,
    initHeroNameGlitch,
    initClickRipple,
    initParallax,
    initSkillGrid,
    initSkillGalaxy,
    initReveal,
    initCounters,
    initProjectTilt,
    initMagnetic,
    initContact,
    initAI,
    initFooterCanvas,
  ];

  steps.forEach(fn => {
    try { fn(); } catch (err) { console.error((fn.name || 'step') + ' failed:', err); }
  });

  setTimeout(() => {
    $$('[data-reveal]:not(.revealed)').forEach(el => {
      if (el.getBoundingClientRect().top < innerHeight * 1.5) el.classList.add('revealed');
    });
  }, 3000);
}

/* ══════════════════════════════════════
   7. SCROLL PROGRESS
══════════════════════════════════════ */
function initScrollProgress() {
  const bar = $('scroll-prog');
  if (!bar) return;
  let queued = false;
  const update = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; raf(update); } }, { passive: true });
  update();
}

/* ══════════════════════════════════════
   8. NAVIGATION
══════════════════════════════════════ */
function initNav() {
  const nav = $('nav'), burger = $('nav-burger'), list = $('nav-list');
  if (!nav) return;

  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setMenu = open => {
    if (!list || !burger) return;
    list.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    const s = burger.querySelectorAll('span');
    if (s[0]) s[0].style.transform = open ? 'translateY(7px) rotate(45deg)'   : '';
    if (s[1]) s[1].style.opacity   = open ? '0' : '';
    if (s[2]) s[2].style.transform = open ? 'translateY(-7px) rotate(-45deg)' : '';
  };
  if (burger && list) burger.addEventListener('click', () => setMenu(!list.classList.contains('open')));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    });
  });

  const links = $$('.nav-link');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  $$('main section[id]').forEach(s => io.observe(s));
}

/* ══════════════════════════════════════
   9. HERO CANVAS
══════════════════════════════════════ */
function initHeroCanvas() {
  const canvas = $('hero-canvas');
  if (!canvas) return;
  let ctx, W = 0, H = 0, nodes = [];
  const LINK = 150;

  const mk = () => ({
    x: rand(0, W), y: rand(0, H),
    vx: rand(-0.16, 0.16), vy: rand(-0.16, 0.16),
    r: rand(0.8, 2),
    a: rand(0.25, 0.65),
    col: Math.random() > 0.8 ? C.coral : C.primary,
  });

  function setup() {
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    ctx = fitCanvas(canvas, W, H);
    const count = clamp(Math.round((W * H) / 16000), 24, 90);
    nodes = Array.from({ length: count }, mk);
  }
  setup();
  onResize(canvas, setup);

  animateWhileVisible(canvas, () => {
    ctx.clearRect(0, 0, W, H);

    if (FINE) {
      const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 300);
      g.addColorStop(0, `rgba(${C.primary},0.08)`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      a.x += a.vx + mouse.nx * 0.05;
      a.y += a.vy;
      if (a.x < -10) a.x = W + 10; else if (a.x > W + 10) a.x = -10;
      if (a.y < -10) a.y = H + 10; else if (a.y > H + 10) a.y = -10;

      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < LINK * LINK) {
          const alpha = (1 - Math.sqrt(d2) / LINK) * 0.16;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${C.primary},${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${a.col},${a.a})`;
      ctx.fill();
    }
  });
}

/* ══════════════════════════════════════
   10. TYPED TEXT
══════════════════════════════════════ */
function initTyped() {
  const el = $('typed-output');
  if (!el) return;
  const words = [
    'Building responsive websites.',
    'Crafting clean, fast UIs.',
    'Learning React every day.',
    'Making full-stack projects.',
    'Designing smooth user experiences.',
  ];
  if (REDUCED) { el.textContent = words[0]; return; }

  let wi = 0, ci = 0, del = false;
  (function tick() {
    const w = words[wi];
    if (!del) {
      el.textContent = w.slice(0, ++ci);
      if (ci === w.length) { del = true; return setTimeout(tick, 1900); }
    } else {
      el.textContent = w.slice(0, --ci);
      if (ci === 0) { del = false; wi = (wi + 1) % words.length; }
    }
    setTimeout(tick, del ? 32 : 62);
  })();
}

/* ══════════════════════════════════════
   11. PORTRAIT TILT
══════════════════════════════════════ */
function initPortraitTilt() {
  const frame = $('portrait-frame');
  if (!frame || !FINE || REDUCED) return;
  let rx = 0, ry = 0;
  animateWhileVisible(frame, () => {
    rx = lerp(rx, mouse.ny * -12, 0.08);
    ry = lerp(ry, mouse.nx *  12, 0.08);
    frame.style.transform =
      `translate(-50%,-50%) perspective(1200px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(24px)`;
  });
}

/* ══════════════════════════════════════
   12. HOLO PARTICLES
══════════════════════════════════════ */
function initHoloParticles() {
  const wrap = $('holo-particles');
  if (!wrap || REDUCED) return;
  const colors = ['var(--primary)', 'var(--coral)', 'var(--primary-l)'];
  const N = 18;
  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2;
    const rad = rand(75, 145);
    const d = document.createElement('div');
    const col = colors[i % colors.length];
    d.className = 'holo-dot';
    d.style.cssText = `
      left:${50 + Math.cos(angle) * (rad / 3.8)}%;
      top:${50 + Math.sin(angle) * (rad / 4.5)}%;
      width:${rand(2, 5).toFixed(1)}px;height:${rand(2, 5).toFixed(1)}px;
      background:${col};box-shadow:0 0 8px ${col};
      --fx:${rand(-22, 22).toFixed(1)}px;--fy:${rand(-32, -8).toFixed(1)}px;
      animation-duration:${rand(2.4, 5.5).toFixed(1)}s;
      animation-delay:${rand(0, 5).toFixed(1)}s;`;
    wrap.appendChild(d);
  }
}

/* ══════════════════════════════════════
   13. HERO NAME GLITCH
══════════════════════════════════════ */
function initHeroNameGlitch() {
  const el = document.querySelector('.h1-name');
  if (!el || REDUCED) return;
  const ORIGINAL = el.textContent;
  const CHARS = '!<>-_\\/[]{}=+*^?#@%&$~';
  let running = false;

  el.addEventListener('mouseenter', () => {
    if (running) return;
    running = true;
    let iter = 0;
    const timer = setInterval(() => {
      el.textContent = ORIGINAL.split('').map((c, i) => {
        if (c === ' ') return ' ';
        if (i < iter)  return ORIGINAL[i];
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join('');
      if (iter >= ORIGINAL.length) {
        clearInterval(timer);
        el.textContent = ORIGINAL;
        running = false;
      }
      iter += 0.6;
    }, 32);
  });
}

/* ══════════════════════════════════════
   14. CLICK RIPPLE
══════════════════════════════════════ */
function initClickRipple() {
  if (REDUCED) return;
  const s = document.createElement('style');
  s.textContent = `@keyframes rexp{to{width:130px;height:130px;opacity:0;border-color:transparent}}`;
  document.head.appendChild(s);

  document.addEventListener('click', e => {
    const r = document.createElement('div');
    r.style.cssText = `
      position:fixed;pointer-events:none;z-index:9900;
      width:0;height:0;border-radius:50%;
      border:1.5px solid rgba(${C.primary},.65);
      left:${e.clientX}px;top:${e.clientY}px;
      transform:translate(-50%,-50%);
      animation:rexp .75s ease-out forwards;`;
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 800);
  });
}

/* ══════════════════════════════════════
   15. HERO PARALLAX
══════════════════════════════════════ */
function initParallax() {
  const content = document.querySelector('.hero-text');
  if (!content || REDUCED) return;
  addEventListener('scroll', () => {
    content.style.transform = `translateY(${scrollY * 0.22}px)`;
  }, { passive: true });
}

/* ══════════════════════════════════════
   16. SKILL GRID CARDS
══════════════════════════════════════ */
function initSkillGrid() {
  const grid = $('skill-grid');
  if (!grid) return;

  SKILLS.forEach(s => {
    const card = document.createElement('div');
    card.className = 'sn';
    card.setAttribute('data-reveal', '');
    card.style.setProperty('--pct', s.pct + '%');
    card.innerHTML = `
      <div class="sn-spot"></div>
      <img class="sn-img" src="${ICON_BASE}${s.icon}" alt="" width="42" height="42" loading="lazy"
           ${s.invert ? 'style="filter:invert(1)"' : ''} onerror="this.style.opacity='.25'">
      <span class="sn-name">${s.name}</span>
      <div class="sn-bar"><div class="sn-fill"></div></div>`;

    if (FINE) {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.background =
          `radial-gradient(circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, rgba(${C.primary},.14), rgba(${C.primary},.02) 65%)`;
      });
      card.addEventListener('pointerleave', () => { card.style.background = ''; });
    }
    grid.appendChild(card);
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
    });
  }, { threshold: 0.2 });
  grid.querySelectorAll('.sn').forEach(n => io.observe(n));
}

/* ══════════════════════════════════════
   17. SKILL GALAXY
══════════════════════════════════════ */
function initSkillGalaxy() {
  const canvas = $('skill-canvas');
  const tip = $('skill-tooltip');
  if (!canvas) return;

  let ctx, W = 0, H = 0, nodes = [], hov = null, t = 0;

  function build() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = rect.width; H = rect.height;
    ctx = fitCanvas(canvas, W, H);

    const small = W < 520;
    const pr = small ? 15 : 20;
    const outerRx = Math.min(W / 2 - pr - 14, 440);
    const outerRy = Math.min(H / 2 - pr - 10, outerRx * 0.62);
    const scale = [0.42, 0.72, 1];

    nodes = SKILLS.map(s => {
      const group = SKILLS.filter(x => x.ring === s.ring);
      const idx = group.indexOf(s);
      return {
        ...s,
        r: pr,
        rx: outerRx * scale[s.ring],
        ry: outerRy * scale[s.ring],
        angle: (idx / group.length) * Math.PI * 2 + s.ring * 0.6,
        speed: (0.0042 - s.ring * 0.0012) * (s.ring === 1 ? -1 : 1),
        x: 0, y: 0,
      };
    });
  }
  build();
  onResize(canvas.parentElement, build);

  canvas.addEventListener('pointermove', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    hov = nodes.find(n => Math.hypot(n.x - mx, n.y - my) < n.r + 8) || null;
    if (hov && tip) {
      tip.textContent = `${hov.name} · ${hov.pct}%`;
      tip.style.left = clamp(hov.x + 18, 8, W - 130) + 'px';
      tip.style.top  = clamp(hov.y - 14, 8, H - 34) + 'px';
      tip.style.opacity = '1';
      canvas.style.cursor = 'pointer';
    } else if (tip) {
      tip.style.opacity = '0';
      canvas.style.cursor = '';
    }
  });
  canvas.addEventListener('pointerleave', () => { hov = null; if (tip) tip.style.opacity = '0'; });

  animateWhileVisible(canvas, () => {
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;
    t += 0.02;

    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 170);
    glow.addColorStop(0, `rgba(${C.primary},0.28)`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, 170, 0, Math.PI * 2); ctx.fill();

    const core = ctx.createLinearGradient(cx - 28, cy - 28, cx + 28, cy + 28);
    core.addColorStop(0, `rgb(${C.primary})`);
    core.addColorStop(1, `rgb(${C.coral})`);
    ctx.beginPath(); ctx.arc(cx, cy, 26 + Math.sin(t) * 1.2, 0, Math.PI * 2);
    ctx.fillStyle = core; ctx.fill();
    ctx.fillStyle = '#0a0c14';
    ctx.font = "800 18px 'Sora', sans-serif";
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('M', cx, cy + 1);

    [0, 1, 2].forEach(ring => {
      const n = nodes.find(x => x.ring === ring);
      if (!n) return;
      ctx.beginPath();
      ctx.ellipse(cx, cy, n.rx, n.ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth = 1; ctx.stroke();
    });

    nodes.forEach(n => {
      n.angle += n.speed;
      n.x = cx + Math.cos(n.angle) * n.rx;
      n.y = cy + Math.sin(n.angle) * n.ry;
      const isHov = hov === n;
      const r = n.r + (isHov ? 4 : 0);

      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2.6);
      g.addColorStop(0, n.color + '44');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(n.x, n.y, r * 2.6, 0, Math.PI * 2); ctx.fill();

      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#121624'; ctx.fill();
      ctx.strokeStyle = n.color + (isHov ? 'ff' : '99');
      ctx.lineWidth = isHov ? 2 : 1.2; ctx.stroke();

      ctx.font = `600 ${W < 520 ? 8 : 10}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = isHov ? '#fff' : n.color;
      ctx.fillText(n.short, n.x, n.y + 0.5);
    });
  });
}

/* ══════════════════════════════════════
   18. SCROLL REVEAL
══════════════════════════════════════ */
function initReveal() {
  const els = $$('[data-reveal]');
  if (REDUCED) { els.forEach(el => el.classList.add('revealed')); return; }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const sibs = Array.from(el.parentElement.querySelectorAll(':scope > [data-reveal]'));
      const idx = Math.max(0, sibs.indexOf(el));
      el.style.transitionDelay = (idx * 0.08) + 's';
      el.classList.add('revealed');
      setTimeout(() => { el.style.transitionDelay = ''; }, 1000 + idx * 80);
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
}

/* ══════════════════════════════════════
   19. COUNTERS
══════════════════════════════════════ */
function initCounters() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const host = e.target;
      io.unobserve(host);

      const target = parseInt(host.dataset.count, 10);
      const valEl = host.querySelector('.sh-val, .mc-val') || host;
      if (Number.isNaN(target)) return;
      const suffix = host.dataset.suffix || '';
      if (REDUCED) { valEl.textContent = target + suffix; return; }

      const dur = 1600, t0 = performance.now();
      (function step(now) {
        const p = Math.min((now - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        valEl.textContent = Math.round(ease * target) + (p >= 1 ? suffix : '');
        if (p < 1) raf(step);
      })(t0);
    });
  }, { threshold: 0.5 });
  $$('[data-count]').forEach(el => io.observe(el));
}

/* ══════════════════════════════════════
   20. PROJECT TILT
══════════════════════════════════════ */
function initProjectTilt() {
  if (!FINE || REDUCED) return;
  $$('[data-tilt]').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(1000px) rotateY(${x * 7}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

/* ══════════════════════════════════════
   21. MAGNETIC BUTTONS
══════════════════════════════════════ */
function initMagnetic() {
  if (!FINE || REDUCED) return;
  $$('.mag-btn').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.2;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.2;
      btn.style.transform = `translate(${dx}px,${dy}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
}

/* ══════════════════════════════════════
   22. CONTACT FORM (EmailJS)
══════════════════════════════════════ */
function initContact() {
  const form = $('contactForm'), btn = $('cf-btn'), msgEl = $('cf-msg');
  if (!form) return;

  const EMAILJS_PUBLIC_KEY  = '1y4BAxPj5CvYl3Wp';
  const EMAILJS_SERVICE_ID  = 'service_ow6r049';
  const EMAILJS_TEMPLATE_ID = 'template_3wdfzou';

  const ready = typeof emailjs !== 'undefined';
  if (ready) emailjs.init(EMAILJS_PUBLIC_KEY);

  const setMsg = (text, cls = '') => { msgEl.textContent = text; msgEl.className = 'cf-msg ' + cls; };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name  = $('from_name').value.trim();
    const email = $('from_email').value.trim();
    const msg   = $('message').value.trim();

    if (!name || !email || !msg) return setMsg('Please fill in all fields.', 'err');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setMsg('Please enter a valid email address.', 'err');
    if (!ready) return setMsg('Email service could not load. Please try again later.', 'err');

    btn.classList.add('loading');
    btn.disabled = true;
    setMsg('');

    try {
      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form);
      setMsg("Message sent. I'll reply within 24 hours.", 'ok');
      form.reset();
    } catch (err) {
      console.error('EmailJS error:', err);
      setMsg('Something went wrong. Please try again or reach me on LinkedIn.', 'err');
    } finally {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  });
}

/* ══════════════════════════════════════
   23. AI ASSISTANT
══════════════════════════════════════ */
function initAI() {
  const panel = $('ai-panel'), toggle = $('ai-toggle'), close = $('ai-close');
  const input = $('ai-input'), send = $('ai-send'), msgs = $('ai-messages');
  if (!panel) return;

  const LINKEDIN = 'https://www.linkedin.com/in/mahesh-mochi-05357b357/';
  const GITHUB   = 'https://github.com/maheshmochi';

  const KB = {
    about: {
      keys: ['mahesh', 'mochi', 'about', 'bio', 'profile', 'who', 'introduce', 'introduction', 'yourself', 'intro'],
      reply: () => "👨‍💻 Mahesh Mochi is a B.Sc. IT student and aspiring frontend developer. He enjoys building modern, responsive web apps and keeps improving through real projects and problem-solving.",
    },
    skills: {
      keys: ['skill', 'skills', 'tech', 'technology', 'technologies', 'stack', 'html', 'css', 'javascript', 'js', 'react', 'reactjs', 'node', 'nodejs', 'express', 'expressjs', 'mongodb', 'mysql', 'sql', 'java', 'git', 'github', 'bootstrap', 'tailwind', 'tools', 'languages', 'know'],
      reply: () => `🔥 Mahesh works with ${SKILLS.map(s => s.name).join(', ')}. Scroll to the Skills section to see them orbit.`,
    },
    projects: {
      keys: ['project', 'projects', 'app', 'apps', 'website', 'websites', 'portfolio', 'built', 'build', 'demo', 'demos', 'made', 'created', 'source'],
      reply: () => `🛠️ Recent projects:<br>• <b>Online Sales Web UI</b> (React)<br>• <b>Zombyte Food Delivery</b> (React, Node.js, MongoDB)<br>• <b>Portfolio Website</b> (HTML, CSS, JS)<br>Live demos and source code are in the Projects section, or on <a href="${GITHUB}" target="_blank" rel="noopener noreferrer">GitHub</a>.`,
    },
    education: {
      keys: ['education', 'college', 'university', 'degree', 'bsc', 'study', 'studying', 'student', 'course', 'hngu', 'academic'],
      reply: () => '🎓 Mahesh is pursuing a B.Sc. in Information Technology at HNGU University, Gujarat, building a strong base in programming, web development and databases.',
    },
    practice: {
      keys: ['leetcode', 'dsa', 'algorithm', 'algorithms', 'problem', 'problems', 'practice', 'solve', 'solved', 'coding'],
      reply: () => '📈 Mahesh practices problem-solving regularly on <a href="https://leetcode.com/u/Maheshmochi/" target="_blank" rel="noopener noreferrer">LeetCode</a> to sharpen his logic and programming fundamentals.',
    },
    hiring: {
      keys: ['hire', 'hiring', 'internship', 'internships', 'job', 'jobs', 'freelance', 'available', 'availability', 'opportunity', 'opportunities', 'collaborate', 'collaboration'],
      reply: () => '💼 Yes! Mahesh is open to internships, frontend roles, freelance projects and collaborations. Use the contact form or message him on LinkedIn.',
    },
    contact: {
      keys: ['contact', 'linkedin', 'connect', 'reach', 'message', 'mail', 'email', 'location', 'gujarat', 'bhabhar', 'social'],
      reply: () => `📬 You can reach Mahesh here:<br>• <a href="${LINKEDIN}" target="_blank" rel="noopener noreferrer">LinkedIn</a><br>• <a href="${GITHUB}" target="_blank" rel="noopener noreferrer">GitHub</a><br>• The contact form at the bottom of this page<br>📍 Bhabhar, Gujarat, India`,
    },
    resume: {
      keys: ['resume', 'cv', 'download', 'curriculum'],
      reply: () => '📄 You can view or download the resume from the <a href="#resume">Resume section</a>.',
    },
  };

  const keywordMap = {};
  Object.entries(KB).forEach(([intent, { keys }]) => {
    keys.forEach(k => { if (!(k in keywordMap)) keywordMap[k] = intent; });
  });

  const HELP = `🤖 <b>I can tell you about:</b><br>• Mahesh and his background<br>• Skills and technologies<br>• Projects<br>• Education<br>• Coding practice<br>• Internships and hiring<br>• Contact details and resume<br><br>Just ask in your own words.`;

  const PRIVATE_RE = /\b(salary|income|married|marriage|wife|girlfriend|boyfriend|relationship|religion|caste|politics|political|address|age)\b/i;
  const MISUSE_RE  = /\b(hack|hacking|crack|cheat|cheating|homework|assignment)\b/i;

  function getReply(raw) {
    const q = raw.toLowerCase().trim().replace(/\.js\b/g, 'js');

    if (/^(help|menu|options|commands|what can you (do|answer))\??$/.test(q)) return HELP;
    if (PRIVATE_RE.test(q)) return "That's personal, so I can't share it. I'm happy to talk about Mahesh's skills, projects, education or how to work with him.";
    if (MISUSE_RE.test(q))  return "I can't help with that. I'm here to answer questions about Mahesh's portfolio, so try asking about his projects or skills.";
    if (/^(hi|hello|hey|hii|hola|yo|greetings)\b/.test(q) || /^good (morning|afternoon|evening)/.test(q)) {
      return "👋 Hi! Ask me about Mahesh's projects, skills, education or career opportunities.";
    }

    const scores = {};
    (q.match(/[a-z0-9.+#]+/g) || []).forEach(tok => {
      const intent = keywordMap[tok.replace(/\.$/, '')];
      if (intent) scores[intent] = (scores[intent] || 0) + 1;
    });
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    if (ranked.length === 0) {
      return "I only know about Mahesh's portfolio. Try asking about <b>skills</b>, <b>projects</b>, <b>education</b> or <b>contact</b>, or type <b>help</b>.";
    }
    if (ranked.length > 1) {
      return `${KB[ranked[0][0]].reply()}<br><br>${KB[ranked[1][0]].reply()}`;
    }
    return KB[ranked[0][0]].reply();
  }

  function appendMsg(html, type) {
    const d = document.createElement('div');
    d.className = `ai-msg ai-msg-${type}`;
    const s = document.createElement('span');
    type === 'user' ? (s.textContent = html) : (s.innerHTML = html);
    d.appendChild(s);
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function setOpen(open) {
    panel.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    if (open) setTimeout(() => input.focus(), 250);
  }

  async function handleQuery(text) {
    const q = (text ?? input.value).trim();
    if (!q) return;
    appendMsg(q, 'user');
    input.value = '';
    send.disabled = true;

    const typing = document.createElement('div');
    typing.className = 'ai-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;

    await new Promise(r => setTimeout(r, rand(450, 850)));
    typing.remove();
    appendMsg(getReply(q), 'bot');
    send.disabled = false;
    input.focus();
  }

  const chips = document.createElement('div');
  chips.className = 'ai-chips';
  ['Skills', 'Projects', 'Education', 'Contact', 'Resume'].forEach(label => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ai-chip';
    b.textContent = label;
    b.addEventListener('click', () => handleQuery(label));
    chips.appendChild(b);
  });
  msgs.appendChild(chips);

  toggle.setAttribute('aria-expanded', 'false');
  toggle.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
  close.addEventListener('click', () => setOpen(false));
  send.addEventListener('click', () => handleQuery());
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleQuery(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('open')) setOpen(false);
  });
}

/* ══════════════════════════════════════
   24. FOOTER WAVES
══════════════════════════════════════ */
function initFooterCanvas() {
  const canvas = $('foot-canvas');
  if (!canvas) return;
  let ctx, W = 0, H = 0, t = 0;

  const setup = () => {
    const r = canvas.parentElement.getBoundingClientRect();
    W = r.width; H = r.height;
    ctx = fitCanvas(canvas, W, H);
  };
  setup();
  onResize(canvas.parentElement, setup);

  animateWhileVisible(canvas, () => {
    ctx.clearRect(0, 0, W, H);
    t += 0.016;
    for (let i = 0; i < 3; i++) {
      const baseY = H * 0.55 + Math.sin(t + i * 0.9) * 12;
      const g = ctx.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, 'transparent');
      g.addColorStop(0.35 + 0.1 * i, `rgba(${i === 2 ? C.coral : C.primary},${0.16 - i * 0.04})`);
      g.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 6) ctx.lineTo(x, baseY + Math.sin(x * 0.007 + t * 1.2 + i) * 9);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = g;
      ctx.fill();
    }
  });
}