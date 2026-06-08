

/* ── GLOBAL UTILS ──────────────────── */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const raf = cb => requestAnimationFrame(cb);
const rand = (a, b) => Math.random() * (b - a) + a;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ── GLOBAL MOUSE ──────────────────── */
const mouse = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0 };
document.addEventListener('mousemove', e => {
  mouse.x  = e.clientX;
  mouse.y  = e.clientY;
  mouse.nx = (e.clientX / innerWidth)  * 2 - 1;
  mouse.ny = (e.clientY / innerHeight) * 2 - 1;
});

/* ══════════════════════════════════════
   CUSTOM CURSOR
   (runs immediately — always active)
══════════════════════════════════════ */
(function initCursor() {
  const dot  = $('cur-dot');
  const ring = $('cur-ring');
  if (!dot) return;

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
   CINEMATIC BOOT SEQUENCE
══════════════════════════════════════ */
(function initBoot() {
  const screen = $('boot-screen');
  const bcanv  = $('boot-canvas');
  const fill   = $('boot-fill');
  const pctEl  = $('boot-pct');
  const lines  = $('boot-lines');
  const skip   = $('boot-skip');
  if (!screen) { initAll(); return; }

  /* ── boot canvas: animated grid + scanline ── */
  const bctx = bcanv.getContext('2d');
  bcanv.width  = innerWidth;
  bcanv.height = innerHeight;
  let alive = true;

  (function bootDraw() {
    if (!alive) return;
    bctx.clearRect(0, 0, bcanv.width, bcanv.height);
    const gs = 50;
    bctx.strokeStyle = 'rgba(0,212,255,0.035)';
    bctx.lineWidth = 1;
    for (let x = 0; x < bcanv.width; x += gs) {
      bctx.beginPath(); bctx.moveTo(x, 0); bctx.lineTo(x, bcanv.height); bctx.stroke();
    }
    for (let y = 0; y < bcanv.height; y += gs) {
      bctx.beginPath(); bctx.moveTo(0, y); bctx.lineTo(bcanv.width, y); bctx.stroke();
    }
    for (let i = 0; i < 5; i++) {
      const gx = Math.floor(Math.random() * Math.floor(bcanv.width / gs)) * gs;
      const gy = Math.floor(Math.random() * Math.floor(bcanv.height / gs)) * gs;
      bctx.fillStyle = `rgba(0,212,255,${Math.random() * 0.04})`;
      bctx.fillRect(gx, gy, gs, gs);
    }
    // Scanning line
    bctx.fillStyle = `rgba(0,212,255,0.03)`;
    const sl = (Date.now() / 6) % bcanv.height;
    bctx.fillRect(0, sl, bcanv.width, 2);
    raf(bootDraw);
  })();

  /* ── boot log messages ── */
  const msgs = [
    ['init', 'Initializing RAM_OS v3.0.0...'],
    ['ok',   'BIOS checksum: PASS'],
    ['ok',   'Memory allocation: 16.0 GB cleared'],
    ['init', 'Loading neural subsystems...'],
    ['ok',   'GPU driver: WebGL 2.0 active'],
    ['warn', 'Establishing encrypted tunnel...'],
    ['ok',   'Portfolio engine v3 mounted'],
    ['init', 'Rendering holographic layer...'],
    ['ok',   'Particle simulation: online'],
    ['warn', 'Connecting AI assistant (MAHESH.AI)...'],
    ['ok',   'MAHESH.AI core loaded — context ready'],
    ['ok',   'All systems nominal — launching ✓'],
  ];

  let pct = 0, msgIdx = 0, finished = false;
  const DURATION = 2800;
  const t0 = Date.now();

  function bootTick() {
    if (finished) return;
    pct = Math.min(((Date.now() - t0) / DURATION) * 100, 100);
    fill.style.width  = pct + '%';
    pctEl.textContent = Math.floor(pct) + '%';

    const want = Math.min(Math.floor((pct / 100) * msgs.length), msgs.length);
    while (msgIdx < want) {
      const [type, text] = msgs[msgIdx++];
      const el = document.createElement('div');
      el.className = 'boot-line-item ' + type;
      el.textContent = text;
      lines.appendChild(el);
      lines.scrollTop = lines.scrollHeight;
    }

    if (pct < 100) {
      setTimeout(bootTick, 14);
    } else {
      setTimeout(done, 380);
    }
  }

  function done() {
    if (finished) return;
    finished = true;
    alive = false;
    screen.classList.add('done');
    setTimeout(initAll, 50);
  }

  skip.addEventListener('click', done, { once: true });
  document.addEventListener('keydown', done, { once: true });
  bootTick();
})();

/* ══════════════════════════════════════
   INIT ALL  (called after boot fades)
══════════════════════════════════════ */
function initAll() {
  initScrollProgress();
  initNav();
  initHeroCanvas();
  initTyped();
  initHoloPortrait();
  initHoloParticles();
  initGlitchLoop();
  initScrollReveal();
  initRevealObserver();
  initCounters();
  initSkillGalaxy();
  initSkillGrid();
  initProjectTilt();
  initMagnetic();
  initContact();
  initAI();
  initFooterCanvas();
  initHeroNameGlitch();
  initClickRipple();
  initParallax();
}

/* ══════════════════════════════════════
   SCROLL PROGRESS BAR
══════════════════════════════════════ */
function initScrollProgress() {
  const bar = $('scroll-prog');
  if (!bar) return;
  const update = () => {
    const max = document.body.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ══════════════════════════════════════
   NAVIGATION
══════════════════════════════════════ */
function initNav() {
  const nav    = $('nav');
  const burger = $('nav-burger');
  const list   = $('nav-list');
  const logo   = nav && nav.querySelector('.nav-logo');
  if (!nav) return;

  /* Scroll shrink */
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 40);
    updateActiveNav();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Logo → hero */
  if (logo) {
    logo.addEventListener('click', () => {
      $('hero') && $('hero').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* Mobile burger */
  if (burger && list) {
    burger.addEventListener('click', () => {
      const open = list.classList.toggle('open');
      const spans = burger.querySelectorAll('span');
      spans[0].style.transform = open ? 'rotate(45deg) translate(5px,5px)'  : '';
      spans[1].style.opacity   = open ? '0' : '';
      spans[2].style.transform = open ? 'rotate(-45deg) translate(5px,-5px)' : '';
    });
  }

  /* Smooth anchor scroll */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        list && list.classList.remove('open');
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function updateActiveNav() {
  const secs  = $$('section[id]');
  const links = $$('.nav-link');
  let cur = '';
  secs.forEach(s => { if (scrollY >= s.offsetTop - 230) cur = s.id; });
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
}

/* ══════════════════════════════════════
   HERO CANVAS  — particles + streaks + grid
══════════════════════════════════════ */
function initHeroCanvas() {
  const canvas = $('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;

  function resize() {
    W = canvas.width  = innerWidth;
    H = canvas.height = innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* -- Particle -- */
  class Particle {
    constructor() { this.reset(true); }
    reset(scatter) {
      this.x  = scatter ? rand(0, W) : rand(0, W);
      this.y  = scatter ? rand(0, H) : H + 10;
      this.vx = rand(-0.18, 0.18);
      this.vy = rand(-0.5, -0.12);
      this.r  = rand(0.4, 1.8);
      this.a  = rand(0.25, 0.7);
      this.col = Math.random() > 0.5 ? '0,212,255' : '123,47,255';
    }
    update() {
      this.x += this.vx + mouse.nx * 0.1;
      this.y += this.vy;
      if (this.y < -4) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.col},${this.a})`;
      ctx.fill();
    }
  }

  /* -- Light Streak -- */
  class Streak {
    constructor() { this.init(); }
    init() {
      this.x   = rand(0, W);
      this.y   = rand(-100, H * 0.5);
      this.len = rand(60, 220);
      this.spd = rand(1.5, 4.5);
      this.a   = rand(0.05, 0.2);
      this.w   = rand(0.25, 1);
      this.col = Math.random() > 0.5 ? '0,212,255' : '0,255,200';
    }
    update() { this.y += this.spd; if (this.y - this.len > H) this.init(); }
    draw() {
      const g = ctx.createLinearGradient(this.x, this.y - this.len, this.x, this.y);
      g.addColorStop(0, `rgba(${this.col},0)`);
      g.addColorStop(1, `rgba(${this.col},${this.a})`);
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - this.len);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = g; ctx.lineWidth = this.w; ctx.stroke();
    }
  }

  /* -- Neural Edge -- */
  class NeuralNode {
    constructor() { this.reset(); }
    reset() {
      this.x  = rand(0, W); this.y = rand(0, H);
      this.vx = rand(-0.2, 0.2); this.vy = rand(-0.2, 0.2);
      this.r  = rand(1.5, 3);
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
  }

  const particles  = Array.from({ length: 180 }, () => new Particle());
  const streaks    = Array.from({ length: 30  }, () => new Streak());
  const neurals    = Array.from({ length: 40  }, () => new NeuralNode());
  const NEURAL_D   = 160;
  let gridOffset   = 0;

  function drawGrid() {
    const gs = 60;
    gridOffset = (gridOffset + 0.18) % gs;
    ctx.strokeStyle = 'rgba(0,212,255,0.022)';
    ctx.lineWidth = 1;
    for (let x = (gridOffset * 0.5) % gs - gs; x < W + gs; x += gs) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = gridOffset % gs - gs; y < H + gs; y += gs) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  function drawNeurals() {
    for (let i = 0; i < neurals.length; i++) {
      const a = neurals[i];
      for (let j = i + 1; j < neurals.length; j++) {
        const b   = neurals[j];
        const dx  = b.x - a.x, dy = b.y - a.y;
        const d   = Math.sqrt(dx * dx + dy * dy);
        if (d < NEURAL_D) {
          const alpha = (1 - d / NEURAL_D) * 0.12;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
      neurals[i].update();
      // tiny dot
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,212,255,0.12)';
      ctx.fill();
    }
  }

  function drawMouseBlob() {
    const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 280);
    g.addColorStop(0, 'rgba(0,212,255,0.065)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    drawNeurals();
    drawMouseBlob();
    streaks.forEach(s  => { s.update(); s.draw(); });
    particles.forEach(p => { p.update(); p.draw(); });
    raf(loop);
  })();
}

/* ══════════════════════════════════════
   TYPED TEXT EFFECT
══════════════════════════════════════ */
function initTyped() {
  const el = $('typed-output');
  if (!el) return;
  const words = [
    'futuristic web apps.',
    'full-stack systems.',
    'AI-powered products.',
    'immersive experiences.',
    'pixel-perfect UIs.',
    'scalable backends.',
    'digital solutions.',
  ];
  let wi = 0, ci = 0, del = false;
  const TS = 68, DS = 38, PAUSE = 2000;

  function tick() {
    const w = words[wi];
    if (!del) {
      el.textContent = w.slice(0, ++ci);
      if (ci === w.length) { del = true; return setTimeout(tick, PAUSE); }
    } else {
      el.textContent = w.slice(0, --ci);
      if (ci === 0) { del = false; wi = (wi + 1) % words.length; }
    }
    setTimeout(tick, del ? DS : TS);
  }
  setTimeout(tick, 1300);
}

/* ══════════════════════════════════════
   HOLOGRAPHIC PORTRAIT — mouse parallax
══════════════════════════════════════ */
function initHoloPortrait() {
  const frame = document.getElementById('portrait-frame');
  if (!frame) return;

  let rx = 0;
  let ry = 0;

  function animate() {
    rx += ((mouse.ny * -18) - rx) * 0.08;
    ry += ((mouse.nx * 18) - ry) * 0.08;

    frame.style.transform = `
      translate(-50%, -50%)
      perspective(1200px)
      rotateX(${rx}deg)
      rotateY(${ry}deg)
      translateZ(30px)
    `;

    frame.style.setProperty('--mx', `${50 + mouse.nx * 50}%`);
    frame.style.setProperty('--my', `${50 + mouse.ny * 50}%`);

    requestAnimationFrame(animate);
  }

  animate();
}

/* ══════════════════════════════════════
   HOLOGRAPHIC FLOATING PARTICLES
══════════════════════════════════════ */
function initHoloParticles() {
  const wrap = $('holo-particles');
  if (!wrap) return;
  const N = 28;
  const colors = ['var(--cyan)', 'var(--purple)', 'var(--cyan2)'];
  for (let i = 0; i < N; i++) {
    const angle  = (i / N) * Math.PI * 2;
    const radius = rand(75, 145);
    const cx = 50 + Math.cos(angle) * (radius / 3.8);
    const cy = 50 + Math.sin(angle) * (radius / 4.5);
    const d  = document.createElement('div');
    d.className = 'holo-dot';
    d.style.cssText = `
      left:${cx}%;top:${cy}%;
      width:${rand(2,5)}px;height:${rand(2,5)}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      box-shadow:0 0 8px ${colors[Math.floor(Math.random()*colors.length)]};
      --fx:${(rand(-22,22)).toFixed(1)}px;
      --fy:${(rand(-32,-8)).toFixed(1)}px;
      animation-duration:${rand(2.2,5.5).toFixed(1)}s;
      animation-delay:${rand(0,5).toFixed(1)}s;
    `;
    wrap.appendChild(d);
  }
}

/* ══════════════════════════════════════
   PORTRAIT GLITCH LOOP
══════════════════════════════════════ */
function initGlitchLoop() {
  const g = $('p-glitch');
  if (!g) return;
  function trigger() {
    g.classList.add('glitch-active');
    setTimeout(() => g.classList.remove('glitch-active'), 220);
    setTimeout(trigger, rand(3200, 10000));
  }
  setTimeout(trigger, 4000);
}

/* ══════════════════════════════════════
   SECTION SCROLL REVEAL (fade-in)
══════════════════════════════════════ */
function initScrollReveal() {
  const secs = $$('.reveal-section');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity   = '1';
        e.target.style.transform = 'translateY(0)';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.06 });

  secs.forEach(s => {
    if (s.id !== 'hero') {
      s.style.opacity    = '0';
      s.style.transform  = 'translateY(55px)';
      s.style.transition = 'opacity .9s ease, transform .9s ease';
    }
    io.observe(s);
  });
}

/* ══════════════════════════════════════
   [data-reveal] STAGGER OBSERVER
══════════════════════════════════════ */
function initRevealObserver() {
  const els = $$('[data-reveal]');
  const io  = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      // compute stagger by sibling index
      const siblings = Array.from(el.parentElement.querySelectorAll('[data-reveal]'));
      const idx = siblings.indexOf(el);
      el.style.transitionDelay = (idx * 0.09) + 's';
      el.classList.add('revealed');
      io.unobserve(el);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -50px 0px' });

  els.forEach(el => io.observe(el));
}

/* ══════════════════════════════════════
   ANIMATED COUNTERS
══════════════════════════════════════ */
function initCounters() {
  const all = $$('[data-count]');
  const io  = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const host   = e.target;
      const target = parseInt(host.dataset.count, 10);
      const suffix = host.dataset.suffix || '';
      // find the numeric element inside (sh-val or mc-val) or use host itself
      const valEl  = host.querySelector('.sh-val, .mc-val') || host;
      const dur    = 1800;
      const t0     = performance.now();

      (function step(now) {
        const p    = Math.min((now - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        valEl.textContent = Math.floor(ease * target) + (p >= 1 ? suffix : '');
        if (p < 1) raf(step);
      })(performance.now());

      io.unobserve(host);
    });
  }, { threshold: 0.5 });
  all.forEach(el => io.observe(el));
}

/* ══════════════════════════════════════
   SKILL GALAXY CANVAS
══════════════════════════════════════ */
function initSkillGalaxy() {
  const canvas = $('skill-canvas');
  const tooltip = $('skill-tooltip');

  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  let W = 0;
  let H = 0;

  const SKILLS = [
    { name:'HTML5',      color:'#e34c26', r:28 },
    { name:'CSS3',       color:'#264de4', r:26 },
    { name:'JavaScript', color:'#f7df1e', r:30 },
    { name:'React',      color:'#61dafb', r:27 },
    { name:'Node.js',    color:'#339933', r:25 },
    { name:'SQL',        color:'#00758f', r:23 },
    { name:'Java',       color:'#f89820', r:24 },
    { name:'Git',        color:'#f05032', r:22 },
    { name:'Bootstrap',       color:'#00d4ff', r:32 },
    { name:'Tailwind CSS',    color:'#38bdf8', r:29 },
  { name:'MySQL',     color:'#306998', r:27 }
  ];

  let nodes = [];
  let hovNode = null;

  function buildNodes() {

    const baseRadius = Math.min(W, H) * 0.14;

    nodes = SKILLS.map((skill, i) => ({
      ...skill,

      angle: (i / SKILLS.length) * Math.PI * 2,

      orbitRadius: baseRadius + i * 28,

      orbitSpeed: 0.0018 + i * 0.00015,

      pulse: rand(0, Math.PI * 2),

      hov: false,

      x: 0,
      y: 0
    }));
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();

    W = canvas.width = rect.width;
    H = canvas.height = rect.height;

    buildNodes();
  }

  resize();

  window.addEventListener(
    'resize',
    resize,
    { passive: true }
  );

  canvas.addEventListener('mousemove', e => {

    const rect = canvas.getBoundingClientRect();

    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    hovNode = null;

    nodes.forEach(node => {

      node.hov =
        Math.hypot(
          node.x - mx,
          node.y - my
        ) < node.r + 12;

      if (node.hov) hovNode = node;
    });

    if (hovNode) {

      tooltip.style.left =
        `${hovNode.x + 18}px`;

      tooltip.style.top =
        `${hovNode.y - 12}px`;

      tooltip.textContent =
        hovNode.name;

      tooltip.style.opacity = '1';

      canvas.style.cursor = 'pointer';

    } else {

      tooltip.style.opacity = '0';

      canvas.style.cursor = '';
    }
  });

  canvas.addEventListener(
    'mouseleave',
    () => tooltip.style.opacity = '0'
  );

  (function loop() {

    ctx.clearRect(0, 0, W, H);

    const centerX = W / 2;
    const centerY = H / 2;

    /* ==========================
       SUN / CORE GLOW
    ========================== */

    const coreGlow = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      180
    );

    coreGlow.addColorStop(
      0,
      'rgba(0,212,255,0.35)'
    );

    coreGlow.addColorStop(
      1,
      'transparent'
    );

    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY,
      180,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = coreGlow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY,
      35,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = '#00d4ff';
    ctx.fill();

    /* ==========================
       ORBIT RINGS
    ========================== */

    nodes.forEach(node => {

      ctx.beginPath();

      ctx.ellipse(
        centerX,
        centerY,
        node.orbitRadius,
        node.orbitRadius * 0.65,
        0,
        0,
        Math.PI * 2
      );

      ctx.strokeStyle =
        'rgba(255,255,255,0.06)';

      ctx.lineWidth = 1;

      ctx.stroke();
    });

    /* ==========================
       PLANETS / SKILLS
    ========================== */

    nodes.forEach(node => {

      node.pulse += 0.03;

      node.angle += node.orbitSpeed;

      const orbitX = node.orbitRadius;
      const orbitY = node.orbitRadius * 0.65;

      node.x =
        centerX +
        Math.cos(node.angle) * orbitX;

      node.y =
        centerY +
        Math.sin(node.angle) * orbitY;

      const radius =
        node.r +
        Math.sin(node.pulse) * 2 +
        (node.hov ? 6 : 0);

      /* glow */

      const glow =
        ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          radius * 3
        );

      glow.addColorStop(
        0,
        node.color + '40'
      );

      glow.addColorStop(
        1,
        'transparent'
      );

      ctx.beginPath();
      ctx.arc(
        node.x,
        node.y,
        radius * 3,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = glow;
      ctx.fill();

      /* planet */

      ctx.beginPath();
      ctx.arc(
        node.x,
        node.y,
        radius,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        node.color + '22';

      ctx.fill();

      ctx.strokeStyle =
        node.color +
        (node.hov ? 'ff' : '88');

      ctx.lineWidth =
        node.hov ? 2 : 1;

      ctx.stroke();

      /* text */

      ctx.font =
        `${node.hov ? '700' : '500'} ${
          Math.round(radius * 0.52)
        }px 'Share Tech Mono'`;

      ctx.fillStyle =
        node.hov
          ? '#ffffff'
          : node.color;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillText(
        node.name,
        node.x,
        node.y
      );
    });

    raf(loop);

  })();
}
/* ══════════════════════════════════════
   SKILL GRID CARDS (injected)
══════════════════════════════════════ */
function initSkillGrid() {
  const grid = $('skill-grid');
  if (!grid) return;

  const SKILLS = [
    { name:'HTML5',      img:'https://cdn-icons-png.flaticon.com/512/732/732212.png',  pct:'92%' },
    { name:'CSS3',       img:'https://cdn-icons-png.flaticon.com/512/732/732190.png',  pct:'88%' },
    { name:'JS',         img:'https://cdn-icons-png.flaticon.com/512/5968/5968292.png',pct:'85%' },
    { name:'React.js',   img:'https://cdn-icons-png.flaticon.com/512/919/919851.png',  pct:'78%' },
    { name:'Java',       img:'https://cdn-icons-png.flaticon.com/512/226/226777.png',  pct:'70%' },
    { name:'SQL',        img:'https://cdn-icons-png.flaticon.com/512/919/919836.png',  pct:'75%' },
    { name:'GitHub',     img:'https://cdn-icons-png.flaticon.com/512/733/733553.png',  pct:'82%', inv:true },
    { name:'MERN',       img:'https://cdn-icons-png.flaticon.com/512/919/919825.png',  pct:'76%' },
    { name:'Bootstrap',  img:'https://cdn-icons-png.flaticon.com/512/5968/5968672.png',pct:'80%' },
    { name:'Tailwind',   img:'https://tse3.mm.bing.net/th/id/OIP.9r9hL_rHXZnRcoVHBcIZxgAAAA?w=360&h=360&rs=1&pid=ImgDetMain&o=7&rm=3',pct:'74%' },
    { name:'MySQL',      img:'https://cdn-icons-png.flaticon.com/512/919/919836.png',  pct:'77%' },
  ];

  SKILLS.forEach(s => {
    const div = document.createElement('div');
    div.className = 'sn';
    div.setAttribute('data-reveal', '');
    div.style.setProperty('--pct', s.pct);
    div.innerHTML = `
      <div class="sn-spot"></div>
      <img class="sn-img" src="${s.img}" alt="${s.name}" loading="lazy"
           ${s.inv ? 'style="filter:invert(1)"' : ''}
           onerror="this.style.opacity='.3'">
      <span class="sn-name">${s.name}</span>
      <div class="sn-bar"><div class="sn-fill"></div></div>
    `;
    // mouse spotlight
    div.addEventListener('mousemove', e => {
      const r = div.getBoundingClientRect();
      div.style.background =
        `radial-gradient(circle at ${e.clientX-r.left}px ${e.clientY-r.top}px,rgba(0,212,255,.1) 0%,rgba(0,212,255,.02) 60%)`;
    });
    div.addEventListener('mouseleave', () => { div.style.background = ''; });
    grid.appendChild(div);
  });

  // observe for bar animation
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  grid.querySelectorAll('.sn').forEach(n => io.observe(n));
}

/* ══════════════════════════════════════
   PROJECT CARD 3-D TILT
══════════════════════════════════════ */
function initProjectTilt() {
  $$('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width  - 0.5;
      const y  = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform =
        `perspective(1000px) rotateY(${x*10}deg) rotateX(${-y*8}deg) scale(1.015)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ══════════════════════════════════════
   MAGNETIC BUTTONS
══════════════════════════════════════ */
function initMagnetic() {
  $$('.mag-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) * 0.28;
      const dy = (e.clientY - (r.top  + r.height / 2)) * 0.28;
      btn.style.transform = `translate(${dx}px,${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ══════════════════════════════════════
   CONTACT FORM + EmailJS
══════════════════════════════════════ */
function initContact() {
  const form  = $('contactForm');
  const btn   = $('cf-btn');
  const msgEl = $('cf-msg');
  if (!form) return;

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     HOW TO ENABLE LIVE EMAIL:
     1. Create a FREE account at emailjs.com
     2. Add a service (Gmail, Outlook, etc.)
     3. Create an email template using variables:
           {{from_name}}  {{from_email}}  {{message}}
     4. Replace the three placeholder strings below
        with your real keys from the EmailJS dashboard
     5. Uncomment:  emailjs.init(...)  line
     6. Uncomment:  await emailjs.sendForm(...)  line
     7. Remove or comment out the fake 1.8s delay line
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const EMAILJS_PUBLIC_KEY  = '1y4BAxPj5CvYl3Wp';   // e.g. 'user_xxxxxxxxxxxx'
  const EMAILJS_SERVICE_ID  = 'service_ow6r049';   // e.g. 'service_abc123'
  const EMAILJS_TEMPLATE_ID = 'template_3wdfzou';  // e.g. 'template_xyz789'

  emailjs.init(EMAILJS_PUBLIC_KEY);  

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name  = $('from_name').value.trim();
    const email = $('from_email').value.trim();
    const msg   = $('message').value.trim();

    if (!name || !email || !msg)
      return setMsg('⚠ All fields are required.', 'err');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setMsg('⚠ Enter a valid email address.', 'err');

    btn.classList.add('loading');
    btn.disabled = true;
    setMsg('', '');

    try {
      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form);
      setMsg('✓ Message transmitted. I\'ll respond within 24 hours.', 'ok');
      form.reset();
    } catch(err) {
      console.error('EmailJS error:', err);
      setMsg('⚠ Transmission failed. Please try again.', 'err');
    } finally {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  });

  function setMsg(text, cls) {
    msgEl.textContent = text;
    msgEl.className   = 'cf-msg ' + cls;
  }
}

/* ══════════════════════════════════════
   AI ASSISTANT — RAM.AI
══════════════════════════════════════ */
function initAI() {
  const panel = $('ai-panel'), toggle = $('ai-toggle'), close = $('ai-close');
  const input = $('ai-input'), send = $('ai-send'), msgs = $('ai-messages');
  if (!panel) return;

  const bind = (el, ev, fn) => el.addEventListener(ev, fn);
  bind(toggle, 'click', () => panel.classList.toggle('open'));
  bind(close, 'click', () => panel.classList.remove('open'));
  bind(send, 'click', handleQuery);
  bind(input, 'keydown', e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleQuery()));

const responses = {
  about: '👨‍💻 Mahesh Mochi is a B.Sc. IT student and aspiring Frontend Developer passionate about creating modern web applications and continuously improving his development skills through real-world projects and problem-solving.',

  skills: '🔥 Mahesh is skilled in HTML5, CSS3, JavaScript, React.js, Web Development, Database Management, Git/GitHub, and Responsive Design. He is actively learning advanced frontend technologies and modern development practices.',

  projects: '🛠️ Mahesh\'s projects include:\n🌐 Frontend Web Applications\n📚 Academic IT Projects\n💻 Personal Portfolio Projects\n🚀 React-based Development Projects',

  contact: '📬 Reach Mahesh here:\n🔗 LinkedIn: mahesh-mochi-05357b357\n📍 Bhabhar, Gujarat, India\n📧 Contact through LinkedIn for collaborations and opportunities.',

  leetcode: '📈 Mahesh continuously practices problem-solving and programming concepts to strengthen his technical skills and development knowledge.',

  education: '🎓 Mahesh Mochi is pursuing a B.Sc. in Information Technology and is focused on building a strong foundation in software development, web technologies, and database systems.',

  hiring: '💼 Mahesh is open to internships, frontend development opportunities, freelance projects, and collaborative tech initiatives.'
};

// LinkedIn-Based Keyword Association Map
const keywordMap = {
  // About
  mahesh: 'about',
  mochi: 'about',
  about: 'about',
  bio: 'about',
  profile: 'about',
  who: 'about',
  developer: 'about',
  frontend: 'about',
  student: 'about',
  introduction: 'about',
  info: 'about',

  // Skills
  skill: 'skills',
  skills: 'skills',
  tech: 'skills',
  technology: 'skills',
  technologies: 'skills',
  html: 'skills',
  html5: 'skills',
  css: 'skills',
  css3: 'skills',
  javascript: 'skills',
  js: 'skills',
  react: 'skills',
  reactjs: 'skills',
  web: 'skills',
  frontend: 'skills',
  database: 'skills',
  git: 'skills',
  github: 'skills',
  coding: 'skills',
  programming: 'skills',

  // Projects
  project: 'projects',
  projects: 'projects',
  app: 'projects',
  apps: 'projects',
  website: 'projects',
  websites: 'projects',
  portfolio: 'projects',
  build: 'projects',
  built: 'projects',
  create: 'projects',
  created: 'projects',
  work: 'projects',
  works: 'projects',
  development: 'projects',

  // Contact
  contact: 'contact',
  linkedin: 'contact',
  connect: 'contact',
  reach: 'contact',
  message: 'contact',
  mail: 'contact',
  email: 'contact',
  social: 'contact',
  location: 'contact',
  gujarat: 'contact',
  bhabhar: 'contact',

  // Problem Solving
  leetcode: 'leetcode',
  dsa: 'leetcode',
  problem: 'leetcode',
  problems: 'leetcode',
  coding: 'leetcode',
  algorithm: 'leetcode',
  algorithms: 'leetcode',
  practice: 'leetcode',
  solve: 'leetcode',
  solved: 'leetcode',

  // Education
  education: 'education',
  college: 'education',
  university: 'education',
  degree: 'education',
  bsc: 'education',
  it: 'education',
  student: 'education',
  study: 'education',
  studying: 'education',
  academic: 'education',

  // Opportunities
  hire: 'hiring',
  hiring: 'hiring',
  internship: 'hiring',
  internships: 'hiring',
  opportunity: 'hiring',
  opportunities: 'hiring',
  job: 'hiring',
  jobs: 'hiring',
  freelance: 'hiring',
  available: 'hiring',
  collaboration: 'hiring',
  collaborate: 'hiring'
};

function getReply(q) {
  q = q.toLowerCase().trim();

  // 1. TARGETED GUARDRAIL A: Strict Personal Prying
  const personalRegex = /\b(wife|married|marriage|girlfriend|boyfriend|relationship|age|old|salary|money|income|pay|cash|religion|caste|political|politics|party|address|home)\b/i;

  if (personalRegex.test(q)) {
    return `FAAAAAHHHH! 💀💀💀💀

Nice try, but Mahesh's personal information is private. Let's stick to his projects, skills, education, and professional journey. 🚀`;
  }

  // 2. TARGETED GUARDRAIL B: Academic Dishonesty / Malicious Requests
  const exploitRegex = /\b(hack|hacking|crack|cracking|cheat|cheating|exam|assignment|homework|do my project|write my project)\b/i;

  if (exploitRegex.test(q)) {
    return `FAAAAAHHHH! 💀💀💀💀

I am Mahesh's portfolio assistant, not a hacking or cheating bot. Ask me about his web development skills, projects, or learning journey instead! 🚀`;
  }

  // 3. High-Priority Intent Routing (Greetings)
  if (/^(hi|hello|hey|hii|hola|who are you|yo|greetings)$/i.test(q)) {
    return `👋 Yo! I'm MAHESH.AI. Ask me about Mahesh's projects, technical skills, education, or career opportunities!`;
  }

  // 4. Token-Based Scoring Engine
  const tokens = q.match(/\b\w+\b/g) || [];
  const scores = {};

  tokens.forEach(token => {
    const category = keywordMap[token];

    if (category) {
      scores[category] = (scores[category] || 0) + 1;
    }
  });

  const matches = Object.keys(scores)
    .map(cat => ({
      cat,
      score: scores[cat]
    }))
    .sort((a, b) => b.score - a.score);

  if (matches.length > 0) {
    if (
      matches.length > 1 &&
      matches[0].score >= 1 &&
      matches[1].score >= 1
    ) {
      return `I got you. Here's the info:

${responses[matches[0].cat]}

${responses[matches[1].cat]}`;
    }

    return responses[matches[0].cat];
  }

  // 5. Absolute Fallback
  return `FAAAAAHHHH! 💀💀💀💀

I have no idea what you just said.

My knowledge base only covers Mahesh's professional portfolio.

Try asking about:
• Skills
• Projects
• Education
• Contact
• Coding Practice
• Career Opportunities 🚀`;
}

  function appendMsg(text, type) {
    const d = document.createElement('div');
    d.className = `ai-msg ai-msg-${type}`;
    const s = document.createElement('span');
    type === 'user' ? (s.textContent = text) : (s.innerHTML = text.replace(/\n/g, '<br>'));
    d.appendChild(s);
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  async function handleQuery() {
    const q = input.value.trim();
    if (!q) return;

    appendMsg(q, 'user');
    input.value = '';
    send.disabled = true;

    const t = document.createElement('div');
    t.className = 'ai-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(t);
    msgs.scrollTop = msgs.scrollHeight;

    const reply = getReply(q);
    const delay = Math.min(Math.max(reply.length * 2.5, 500), 1500);
    
    await new Promise(r => setTimeout(r, delay));
    t.remove();
    appendMsg(reply, 'bot');
    
    send.disabled = false;
    input.focus();
  }
}

/* ══════════════════════════════════════
   FOOTER CANVAS — animated wave pulse
══════════════════════════════════════ */
function initFooterCanvas() {
  const canvas = $('foot-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    const r = canvas.parentElement.getBoundingClientRect();
    canvas.width  = Math.round(r.width);
    canvas.height = Math.round(r.height);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  let t = 0;
  (function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    t += 0.018;
    const W = canvas.width, H = canvas.height;
    for (let i = 0; i < 4; i++) {
      const baseY = H * 0.5 + Math.sin(t + i * 0.9) * 14;
      const g = ctx.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0,             'transparent');
      g.addColorStop(0.3 + 0.1 * i, `rgba(0,212,255,${0.14 - i * 0.028})`);
      g.addColorStop(1,             'transparent');
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 4) {
        ctx.lineTo(x, baseY + Math.sin(x * 0.007 + t * 1.2 + i) * 9);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = g;
      ctx.fill();
    }
    raf(loop);
  })();
}

/* ══════════════════════════════════════
   HERO NAME GLITCH (hover)
══════════════════════════════════════ */
function initHeroNameGlitch() {
  const el = document.querySelector('.h1-name');
  if (!el) return;
  const ORIGINAL = el.textContent;
  const CHARS    = '!<>-_\\/[]{}=+*^?#@%&$~';
  let running = false, timer = null;

  el.addEventListener('mouseenter', () => {
    if (running) return;
    running = true;
    let iter = 0;
    timer = setInterval(() => {
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
   CLICK RIPPLE EFFECT
══════════════════════════════════════ */
function initClickRipple() {
  // inject keyframe once
  const s = document.createElement('style');
  s.textContent = `@keyframes rexp{to{width:130px;height:130px;opacity:0;border-color:transparent}}`;
  document.head.appendChild(s);

  document.addEventListener('click', e => {
    const r = document.createElement('div');
    r.style.cssText = `
      position:fixed;pointer-events:none;z-index:9900;
      width:0;height:0;border-radius:50%;
      border:1.5px solid rgba(0,212,255,.65);
      left:${e.clientX}px;top:${e.clientY}px;
      transform:translate(-50%,-50%);
      animation:rexp .75s ease-out forwards;
    `;
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 800);
  });
}

/* ══════════════════════════════════════
   HERO PARALLAX (subtle)
══════════════════════════════════════ */
function initParallax() {
  const content = document.querySelector('.hero-text');
  if (!content) return;
  window.addEventListener('scroll', () => {
    const y = scrollY * 0.22;
    content.style.transform = `translateY(${y}px)`;
  }, { passive: true });
}
