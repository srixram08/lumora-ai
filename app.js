/* ══════════════════════════════════════════════════
   LUMORA ANALYTICS — Application JavaScript
   Warm, premium, human-centered analytics platform
   ══════════════════════════════════════════════════ */

'use strict';

// ─── Utility ─────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ─── State ─────────────────────────────────────────
const State = {
  pricingAnnual: false,
};

// ─── Navbar ────────────────────────────────────────
function initNavbar() {
  const navbar = $('#navbar');
  const hamburger = $('#nav-hamburger');
  const navLinks = $('#nav-links');

  // Scroll effect
  const observer = new IntersectionObserver(
    ([e]) => navbar.classList.toggle('scrolled', !e.isIntersecting),
    { threshold: 0.1 }
  );
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:80px;width:1px;height:1px;pointer-events:none';
  document.body.prepend(sentinel);
  observer.observe(sentinel);

  // Mobile toggle
  hamburger?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
  });

  // Close on link click
  $$('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger?.setAttribute('aria-expanded', 'false');
    });
  });

  // Active link on scroll
  const sections = $$('section[id]');
  const linkMap = {};
  $$('.nav-link').forEach(l => {
    const href = l.getAttribute('href')?.replace('#', '');
    if (href) linkMap[href] = l;
  });

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        Object.values(linkMap).forEach(l => l.classList.remove('active'));
        linkMap[e.target.id]?.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  sections.forEach(s => sectionObserver.observe(s));
}

// ─── Canvas Drawing Helpers ────────────────────────
function drawSmoothLine(ctx, points, color, width = 2, fill = false, fillOpacity = 0.12) {
  if (!points || points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i++) {
    const cx = (points[i].x + points[i + 1].x) / 2;
    const cy = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, cx, cy);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);

  if (fill) {
    const fillPath = new Path2D(ctx);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Fill gradient
    ctx.lineTo(last.x, ctx.canvas.height);
    ctx.lineTo(points[0].x, ctx.canvas.height);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    const rgb = color === '#2ECC71' ? '46,204,113' : '74,222,128';
    grad.addColorStop(0, `rgba(${rgb}, ${fillOpacity})`);
    grad.addColorStop(1, `rgba(${rgb}, 0)`);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

function normalizePoints(data, w, h, padding = 10) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return data.map((v, i) => ({
    x: padding + (i / (data.length - 1)) * (w - padding * 2),
    y: (h - padding) - ((v - min) / range) * (h - padding * 2),
  }));
}

// ─── Hero Chart ────────────────────────────────────
function initHeroChart() {
  const canvas = $('#hero-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const datasets = {
    '1M': [320, 380, 340, 420, 390, 460, 440, 520, 490, 580, 560, 640, 610, 700, 680, 760, 740, 820],
    '3M': [200, 240, 220, 280, 310, 290, 360, 340, 400, 380, 450, 420, 500, 480, 560, 530, 610, 580, 660, 640, 720],
    '1Y': [100, 130, 120, 160, 150, 190, 180, 230, 220, 280, 270, 340, 320, 400, 390, 470, 450, 540, 520, 610, 590, 680, 660, 750],
  };

  let currentKey = '1M';
  let animFrame = null;
  let progress = 0;

  function draw(key, prog) {
    const data = datasets[key];
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || canvas.clientWidth || 480;
    const h = 160;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const allPoints = normalizePoints(data, w, h, 8);
    const visCount = Math.max(2, Math.floor(allPoints.length * prog));
    const points = allPoints.slice(0, visCount);

    // Draw fill + line
    if (points.length >= 2) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i++) {
        const cx = (points[i].x + points[i + 1].x) / 2;
        const cy = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, cx, cy);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);

      // Area fill
      const fillCtx = new Path2D();
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i++) {
        const cx = (points[i].x + points[i + 1].x) / 2;
        const cy = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, cx, cy);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.lineTo(points[points.length - 1].x, h);
      ctx.lineTo(points[0].x, h);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(46,204,113,0.18)');
      grad.addColorStop(1, 'rgba(46,204,113,0)');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // Line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i++) {
        const cx = (points[i].x + points[i + 1].x) / 2;
        const cy = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, cx, cy);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.strokeStyle = '#2ECC71';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();

      // End dot
      const last = points[points.length - 1];
      ctx.save();
      ctx.beginPath();
      ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#2ECC71';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(last.x, last.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(46,204,113,0.2)';
      ctx.fill();
      ctx.restore();
    }
  }

  function animate(key) {
    cancelAnimationFrame(animFrame);
    progress = 0;
    const start = performance.now();
    const duration = 700;

    function step(now) {
      progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      draw(key, ease);
      if (progress < 1) animFrame = requestAnimationFrame(step);
    }
    animFrame = requestAnimationFrame(step);
  }

  animate(currentKey);

  // Tab switching
  $$('.dca-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      $$('.dca-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const key = this.textContent.trim();
      if (datasets[key]) {
        currentKey = key;
        animate(key);
      }
    });
  });

  // Resize
  window.addEventListener('resize', () => draw(currentKey, 1));
}

// ─── Hero Donut ────────────────────────────────────
function initHeroDonut() {
  const canvas = $('#hero-donut');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const segments = [
    { value: 42, color: '#2ECC71' },
    { value: 32, color: '#4ADE80' },
    { value: 26, color: '#86efac' },
  ];

  const total = segments.reduce((s, d) => s + d.value, 0);
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2, cy = h / 2;
  const outer = Math.min(w, h) / 2 - 4;
  const inner = outer * 0.62;
  const gap = 0.04;

  let animProg = 0;
  const start = performance.now();

  function draw(prog) {
    ctx.clearRect(0, 0, w, h);
    let angle = -Math.PI / 2;

    segments.forEach(seg => {
      const slice = (seg.value / total) * Math.PI * 2 * prog;
      ctx.beginPath();
      ctx.arc(cx, cy, outer, angle + gap / 2, angle + slice - gap / 2);
      ctx.arc(cx, cy, inner, angle + slice - gap / 2, angle + gap / 2, true);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      angle += slice;
    });

    // Shadow ring
    ctx.beginPath();
    ctx.arc(cx, cy, inner, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(22,27,34,0.9)';
    ctx.fill();
  }

  function animate() {
    const elapsed = performance.now() - start;
    animProg = Math.min(elapsed / 800, 1);
    const ease = 1 - Math.pow(1 - animProg, 3);
    draw(ease);
    if (animProg < 1) requestAnimationFrame(animate);
  }
  animate();
}

// ─── Sparklines (KPI Cards) ─────────────────────────
function drawSparkline(containerId, data, color = '#2ECC71') {
  const container = $(`#${containerId}`);
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block';
  container.appendChild(canvas);

  function render() {
    const rect = container.getBoundingClientRect();
    const w = rect.width || container.clientWidth || 80;
    const h = 32;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const points = normalizePoints(data, w, h, 2);

    // Fill
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const cx = (points[i].x + points[i + 1].x) / 2;
      const cy = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, cx, cy);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(points[points.length - 1].x, h);
    ctx.lineTo(points[0].x, h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, `rgba(46,204,113,0.2)`);
    grad.addColorStop(1, `rgba(46,204,113,0)`);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // Line
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const cx = (points[i].x + points[i + 1].x) / 2;
      const cy = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, cx, cy);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  }
  render();
  window.addEventListener('resize', render);
}

function initSparklines() {
  const revenueData = [38, 42, 39, 48, 45, 55, 52, 62, 58, 68, 65, 78];
  const customerData = [280, 310, 295, 330, 340, 360, 380, 400, 390, 420, 440, 450];
  const conversionData = [9, 9.5, 9.2, 10, 10.5, 11, 10.8, 11.5, 12, 11.8, 12.5, 12.7];

  drawSparkline('spark-revenue', revenueData);
  drawSparkline('spark-customers', customerData, '#4ADE80');
  drawSparkline('spark-conversion', conversionData);
}

// ─── Feature Chart ──────────────────────────────────
function initFeatureChart() {
  const canvas = $('#fc-chart-1');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const data = [120, 145, 132, 168, 155, 189, 175, 210, 195, 235, 220, 260];

  function render() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || canvas.clientWidth || 300;
    const h = 100;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const points = normalizePoints(data, w, h, 4);

    // Fill
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const cx = (points[i].x + points[i + 1].x) / 2;
      const cy = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, cx, cy);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(46,204,113,0.15)');
    grad.addColorStop(1, 'rgba(46,204,113,0)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // Line
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const cx = (points[i].x + points[i + 1].x) / 2;
      const cy = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, cx, cy);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.strokeStyle = '#2ECC71';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();

    // Month labels
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    ctx.fillStyle = 'rgba(107,114,128,0.8)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    [0, 3, 6, 9, 11].forEach(i => {
      const p = points[i];
      if (p) ctx.fillText(months[i], p.x, h - 2);
    });
  }
  render();
  window.addEventListener('resize', render);
}

// ─── Metrics Sparkline ──────────────────────────────
function initMetricsSparkline() {
  const canvas = $('#metrics-sparkline');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const data = [];
  for (let i = 0; i < 40; i++) {
    data.push(50 + Math.sin(i * 0.3) * 20 + Math.random() * 15);
  }

  function render() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || canvas.clientWidth || 380;
    const h = 100;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const points = normalizePoints(data, w, h, 4);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      const y = (h / 3) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Fill
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const cx = (points[i].x + points[i + 1].x) / 2;
      const cy = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, cx, cy);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(46,204,113,0.12)');
    grad.addColorStop(1, 'rgba(46,204,113,0)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const cx = (points[i].x + points[i + 1].x) / 2;
      const cy = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, cx, cy);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.strokeStyle = '#2ECC71';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  }
  render();
  window.addEventListener('resize', render);

  // Animate with new data
  setInterval(() => {
    data.shift();
    data.push(50 + Math.sin(Date.now() * 0.001) * 20 + Math.random() * 15);
    render();
  }, 1200);
}

// ─── Live Feed ──────────────────────────────────────
function initLiveFeed() {
  const feed = $('#live-feed');
  if (!feed) return;

  const events = [
    { icon: '💰', title: 'New sale', detail: 'Peakfield Technologies', val: '+$2,400' },
    { icon: '👤', title: 'New customer', detail: 'Sarah M. from London', val: '+1' },
    { icon: '📈', title: 'Revenue milestone', detail: 'Q3 goal 78% reached', val: '$8.4M' },
    { icon: '🎯', title: 'Conversion boost', detail: 'Campaign A performing', val: '+3.1%' },
    { icon: '⭐', title: 'New review', detail: '5-star from Meridian', val: '4.9★' },
    { icon: '🔄', title: 'Renewal', detail: 'Arclight Pro plan', val: '+$980' },
    { icon: '📊', title: 'Dashboard shared', detail: 'Q3 report to board', val: '14 views' },
    { icon: '🌍', title: 'New market', detail: 'First sale in Australia', val: '+$1,200' },
  ];

  function addItem() {
    const ev = events[Math.floor(Math.random() * events.length)];
    const item = document.createElement('div');
    item.className = 'lf-item';
    item.innerHTML = `
      <span class="lf-icon">${ev.icon}</span>
      <div class="lf-text">
        <div class="lf-title">${ev.title}</div>
        <div class="lf-sub">${ev.detail}</div>
      </div>
      <span class="lf-val">${ev.val}</span>
    `;
    feed.insertBefore(item, feed.firstChild);
    if (feed.children.length > 4) {
      feed.removeChild(feed.lastChild);
    }
  }

  // Seed 3 items
  for (let i = 0; i < 3; i++) addItem();
  setInterval(addItem, 3000);
}

// ─── Counter Animation ─────────────────────────────
function animateCounters() {
  const counters = $$('.sb-val');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const isDecimal = target % 1 !== 0;
      const duration = 1800;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const prog = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - prog, 3);
        const value = target * ease;
        el.textContent = prefix + (isDecimal ? value.toFixed(1) : Math.floor(value)) + suffix;
        if (prog < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// ─── Reveal on Scroll ──────────────────────────────
function initReveal() {
  const elements = $$('[data-reveal]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, 80 * (entry.target.dataset.revealDelay || 0));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach((el, i) => {
    el.dataset.revealDelay = i % 4;
    observer.observe(el);
  });
}

// ─── Pricing Toggle ────────────────────────────────
function initPricing() {
  const toggle = $('#pricing-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    State.pricingAnnual = !State.pricingAnnual;
    toggle.classList.toggle('active', State.pricingAnnual);
    toggle.setAttribute('aria-pressed', State.pricingAnnual);

    $$('.plan-amount').forEach(el => {
      const val = State.pricingAnnual ? el.dataset.annual : el.dataset.monthly;
      if (val !== undefined) {
        // Animate flip
        el.style.transform = 'translateY(-4px)';
        el.style.opacity = '0';
        setTimeout(() => {
          el.textContent = val;
          el.style.transform = 'translateY(0)';
          el.style.opacity = '1';
          el.style.transition = 'all 0.3s ease';
        }, 150);
      }
    });
  });
}

// ─── Parallax Mouse Effect ─────────────────────────
function initParallax() {
  const objects = [
    { el: $('#sphere1'), speed: 0.015 },
    { el: $('#sphere2'), speed: 0.02 },
    { el: $('#ring1'), speed: 0.01 },
    { el: $('#ring2'), speed: 0.018 },
    { el: $('#cube1'), speed: 0.025 },
    { el: $('#cube2'), speed: 0.012 },
    { el: $('#prism1'), speed: 0.022 },
  ].filter(o => o.el);

  let mouseX = 0, mouseY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function tick() {
    currentX += (mouseX - currentX) * 0.05;
    currentY += (mouseY - currentY) * 0.05;

    objects.forEach(({ el, speed }) => {
      const tx = currentX * speed * 80;
      const ty = currentY * speed * 80;
      el.style.transform = `translate(${tx}px, ${ty}px)`;
    });

    requestAnimationFrame(tick);
  }
  tick();
}

// ─── Hover effects for dashboard ────────────────────
function initDashInteractions() {
  // KPI card hover glow
  $$('.kpi-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.boxShadow = '0 0 20px rgba(46,204,113,0.08)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.boxShadow = '';
    });
  });

  // Button ripple
  $$('button').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute;
        left:${x}px;
        top:${y}px;
        width:0;
        height:0;
        border-radius:50%;
        background:rgba(255,255,255,0.15);
        transform:translate(-50%,-50%);
        animation:rippleAnim 0.5s ease-out forwards;
        pointer-events:none;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    });
  });

  // Add ripple keyframe
  if (!$('#ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes rippleAnim {
        to { width:200px; height:200px; opacity:0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// ─── Smooth Anchor Scrolling ───────────────────────
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = $(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ─── Initialize All ────────────────────────────────
function init() {
  initNavbar();
  initHeroChart();
  initHeroDonut();
  initSparklines();
  initFeatureChart();
  initMetricsSparkline();
  initLiveFeed();
  animateCounters();
  initReveal();
  initPricing();
  initParallax();
  initDashInteractions();
  initSmoothScroll();

  // Log branding
  console.log(
    '%c✦ Lumora Analytics%c — See clearly. Grow confidently.',
    'color:#2ECC71;font-size:16px;font-weight:700;',
    'color:#A1A1AA;font-size:12px;'
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
