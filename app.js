/* ══════════════════════════════════════════════════
   LUMORA ANALYTICS — Application JavaScript
   Modern Business Analytics Dashboard System
   ══════════════════════════════════════════════════ */

'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ─── View Titles Mapping ───────────────────────────
const ViewTitles = {
  'dashboard': 'Dashboard',
  'analytics': 'Sales & Revenue Analytics',
  'sales': 'Sales Management & Pipeline',
  'customers': 'Customer Directory & Retention',
  'products': 'Products & Inventory Performance',
  'orders': 'Orders & Real-time Transactions',
  'revenue': 'Revenue & Financial Breakdown',
  'ai-insights': '🤖 Lumora AI Intelligence',
  'forecast': '📅 Financial & Growth Forecast',
  'reports': '📄 Automated Business Reports',
  'notifications': '🔔 System Notifications & Alerts',
  'settings': '⚙️ System Settings',
  'profile': '👤 User Profile',
};

// ─── Navigation & View Switching ───────────────────
function initNavigation() {
  const navItems = $$('.nav-item[data-view]');
  const viewTitle = $('#view-title');
  const sidebar = $('#sidebar');
  const sidebarToggle = $('#sidebar-toggle');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetView = item.dataset.view;
      if (!targetView) return;

      // Update sidebar active item
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      // Update Topbar Title
      if (viewTitle && ViewTitles[targetView]) {
        viewTitle.textContent = ViewTitles[targetView];
      }

      // Switch View Panels
      $$('.view-panel').forEach(panel => panel.classList.remove('active'));
      const targetPanel = $(`#view-${targetView}-panel`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }

      // Close mobile sidebar if open
      sidebar?.classList.remove('open');

      // Trigger chart re-render if switching to dashboard or analytics
      setTimeout(() => {
        if (targetView === 'dashboard') {
          initHeroChart();
          initHeroDonut();
        } else if (targetView === 'analytics') {
          initFeatureChart();
        } else if (targetView === 'forecast') {
          initMetricsSparkline();
        }
      }, 50);
    });
  });

  // Sidebar toggle for smaller screens
  sidebarToggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
  });

  // Logout button demo
  $('#nav-logout')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to log out of Lumora Analytics?')) {
      alert('You have been logged out.');
    }
  });
}

// ─── Drawing Helpers ───────────────────────────────
function normalizePoints(data, w, h, padding = 10) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return data.map((v, i) => ({
    x: padding + (i / (data.length - 1)) * (w - padding * 2),
    y: (h - padding) - ((v - min) / range) * (h - padding * 2),
  }));
}

// ─── Hero Revenue Chart ────────────────────────────
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

  function draw(key) {
    const data = datasets[key] || datasets['1M'];
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 600;
    const h = 200;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = (h / 4) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    const points = normalizePoints(data, w, h, 12);
    if (points.length < 2) return;

    // Gradient fill
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const cx = (points[i].x + points[i + 1].x) / 2;
      const cy = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, cx, cy);
    }
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.lineTo(last.x, h);
    ctx.lineTo(points[0].x, h);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(46,204,113,0.25)');
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
    ctx.lineTo(last.x, last.y);
    ctx.strokeStyle = '#2ECC71';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // Last dot
    ctx.save();
    ctx.beginPath(); ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#2ECC71'; ctx.fill();
    ctx.beginPath(); ctx.arc(last.x, last.y, 9, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(46,204,113,0.25)'; ctx.fill();
    ctx.restore();
  }

  draw(currentKey);

  // Tabs
  $$('#view-dashboard-panel .dca-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      $$('#view-dashboard-panel .dca-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const key = this.textContent.trim();
      if (datasets[key]) {
        currentKey = key;
        draw(key);
      }
    });
  });

  window.addEventListener('resize', () => draw(currentKey));
}

// ─── Hero Donut Chart ──────────────────────────────
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
  const w = 140, h = 140;
  const cx = w / 2, cy = h / 2;
  const outer = w / 2 - 6;
  const inner = outer * 0.65;
  const gap = 0.04;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, w, h);
  let angle = -Math.PI / 2;

  segments.forEach(seg => {
    const slice = (seg.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, outer, angle + gap / 2, angle + slice - gap / 2);
    ctx.arc(cx, cy, inner, angle + slice - gap / 2, angle + gap / 2, true);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    angle += slice;
  });

  // Inner cutout label
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(22,27,34,0.95)';
  ctx.fill();

  ctx.fillStyle = '#2ECC71';
  ctx.font = 'bold 13px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('+24.8%', cx, cy - 4);
  ctx.fillStyle = '#A1A1AA';
  ctx.font = '9px Inter, sans-serif';
  ctx.fillText('MoM', cx, cy + 10);
}

// ─── Analytics Feature Chart ───────────────────────
function initFeatureChart() {
  const canvas = $('#fc-chart-1');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const data = [120, 145, 132, 168, 155, 189, 175, 210, 195, 235, 220, 260];

  function render() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 500;
    const h = 180;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const points = normalizePoints(data, w, h, 8);

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
    ctx.stroke();
    ctx.restore();
  }
  render();
  window.addEventListener('resize', render);
}

// ─── Metrics Sparkline (Forecast) ──────────────────
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
    const w = rect.width || 700;
    const h = 160;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const points = normalizePoints(data, w, h, 8);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const cx = (points[i].x + points[i + 1].x) / 2;
      const cy = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, cx, cy);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.strokeStyle = '#4ADE80';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
  render();
  window.addEventListener('resize', render);
}

// ─── Live Feed Generator ───────────────────────────
function initLiveFeed() {
  const feed = $('#live-feed');
  if (!feed) return;

  const events = [
    { icon: '💰', title: 'New sale recorded', detail: 'Meridian Corp purchased Enterprise Suite', val: '+$4,999' },
    { icon: '👤', title: 'New customer onboarding', detail: 'Sarah Chen registered 12 seats', val: '+12 Users' },
    { icon: '📈', title: 'Revenue milestone', detail: 'Monthly target reached 105%', val: '$8.42M' },
    { icon: '⭐', title: '5-Star CSAT Review', detail: 'Claravox LLC rated Lumora 5/5', val: '5.0 ★' },
    { icon: '🤖', title: 'AI Insight Alert', detail: 'High demand forecast for Q4', val: '+18% Proj' },
    { icon: '📦', title: 'Renewal completed', detail: 'Novaris Corp renewed annual license', val: '+$42,100' },
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
    if (feed.children.length > 5) feed.removeChild(feed.lastChild);
  }

  for (let i = 0; i < 4; i++) addItem();
  setInterval(addItem, 3500);
}

// ─── Init ──────────────────────────────────────────
function init() {
  initNavigation();
  initHeroChart();
  initHeroDonut();
  initLiveFeed();

  console.log(
    '%c✦ Lumora Analytics Dashboard App Initialized',
    'color:#2ECC71;font-size:14px;font-weight:700;'
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
