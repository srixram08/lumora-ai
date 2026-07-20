/* ══════════════════════════════════════════════════
   LUMORA ANALYTICS — Application JavaScript Engine
   1. Colorlib Inspired Auth & Quick Demo Profiles
   2. Interactive Sales Creation & Live Revenue Calculation
   3. Working Notification Tray Dropdown
   4. Supabase Project Integration (lumora)
   ══════════════════════════════════════════════════ */

'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ─── SUPABASE INTEGRATION ─────────────────────────
const SUPABASE_PROJECT_URL = 'https://tacegqonwgjbsfvbbtrc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Xlynrw0UPR4FphVMeIm8cQ_stD3s';

let supabaseClient = null;

function initSupabase() {
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY);
      console.log('⚡ Connected to Supabase Project: lumora (tacegqonwgjbsfvbbtrc)');
    } catch (err) {
      console.warn('Supabase notice:', err);
    }
  }
}

// User Roles Config
const Profiles = {
  admin: {
    email: 'sarah.chen@lumora.ai',
    name: 'Sarah Chen',
    role: 'VP of Operations',
    initials: 'SC',
    badgeText: 'Admin Login',
  },
  manager: {
    email: 'alex.morgan@lumora.ai',
    name: 'Alex Morgan',
    role: 'Sales Manager',
    initials: 'AM',
    badgeText: 'Manager Login',
  }
};

let currentRole = 'admin';
let unreadNotifications = 3;

// State Data (In Rupees ₹)
let totalRevenueVal = 5000000.00; // ₹50.0 Lakhs
let totalProfitVal = 1850000.00;  // ₹18.5 Lakhs
let totalOrdersCount = 1420;
let totalCustomersCount = 4500;

// ─── AUTH & DEMO PROFILES ──────────────────────────
function initAuth() {
  const loginForm = $('#login-form');
  const signupForm = $('#signup-form');
  const loginScreen = $('#login-screen');
  const appLayout = $('#app-layout');

  window.switchAuthTab = function(tabKey) {
    const signinContainer = $('#auth-signin-container');
    const signupContainer = $('#auth-signup-container');

    if (tabKey === 'signup') {
      if (signinContainer) signinContainer.style.display = 'none';
      if (signupContainer) signupContainer.style.display = 'block';
    } else {
      if (signupContainer) signupContainer.style.display = 'none';
      if (signinContainer) signinContainer.style.display = 'block';
    }
  };

  window.quickDemoLogin = function(roleKey) {
    if (!Profiles[roleKey]) return;
    currentRole = roleKey;

    $('#demo-admin-chip')?.classList.toggle('active', roleKey === 'admin');
    $('#demo-manager-chip')?.classList.toggle('active', roleKey === 'manager');

    const emailInput = $('#login-email');
    if (emailInput) emailInput.value = Profiles[roleKey].email;

    doLogin(roleKey);
  };

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailVal = $('#login-email')?.value;
    const passVal = $('#login-password')?.value;

    if (supabaseClient && supabaseClient.auth) {
      try {
        await supabaseClient.auth.signInWithPassword({ email: emailVal, password: passVal });
      } catch (err) {
        console.warn('Auth notice:', err);
      }
    }
    doLogin(currentRole);
  });

  signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#signup-name')?.value || 'New User';
    const email = $('#signup-email')?.value || 'user@lumora.ai';
    const roleKey = $('#signup-role')?.value || 'manager';
    const password = $('#signup-password')?.value;

    Profiles['custom'] = {
      email,
      name,
      role: roleKey === 'admin' ? 'VP of Operations' : roleKey === 'manager' ? 'Sales Manager' : 'Data Analyst',
      initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'NU',
      badgeText: 'New User'
    };

    if (supabaseClient && supabaseClient.auth) {
      try {
        await supabaseClient.auth.signUp({ email, password });
      } catch (err) {
        console.warn('SignUp notice:', err);
      }
    }
    doLogin('custom');
  });

  window.doLogin = function(roleKey = 'admin') {
    const p = Profiles[roleKey] || Profiles.admin;

    const userAvatarEl = $('#topbar-user-avatar');
    const sbAvatarEl = $('#sidebar-user-avatar');
    const sbNameEl = $('#sidebar-user-name');
    const sbRoleEl = $('#sidebar-user-role');
    const profAvatarEl = $('#profile-page-avatar');
    const profNameEl = $('#profile-page-name');
    const profRoleEl = $('#profile-page-role');

    if (userAvatarEl) userAvatarEl.textContent = p.initials;
    if (sbAvatarEl) sbAvatarEl.textContent = p.initials;
    if (sbNameEl) sbNameEl.textContent = p.name;
    if (sbRoleEl) sbRoleEl.textContent = p.role;
    if (profAvatarEl) profAvatarEl.textContent = p.initials;
    if (profNameEl) profNameEl.textContent = p.name;
    if (profRoleEl) profRoleEl.textContent = p.role;

    const ls = $('#login-screen');
    const al = $('#app-layout');
    if (ls) ls.style.display = 'none';
    if (al) al.style.display = 'flex';

    setTimeout(() => {
      initHeroChart();
      initHeroDonut();
    }, 100);
  };

  window.logout = function() {
    if (confirm('Log out of Lumora Analytics?')) {
      appLayout.style.display = 'none';
      loginScreen.style.display = 'flex';
      $('#notif-dropdown')?.classList.remove('open');
    }
  };
}

// ─── WORKING NOTIFICATION TRAY DROPDOWN ───────────
function initNotificationTray() {
  const bellBtn = $('#topbar-bell');
  const dropdown = $('#notif-dropdown');
  const markAllBtn = $('#btn-mark-all-read');

  bellBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown?.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (dropdown && !dropdown.contains(e.target) && !bellBtn.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });

  markAllBtn?.addEventListener('click', () => {
    unreadNotifications = 0;
    updateNotificationBadges();
    $$('.nd-item').forEach(item => item.classList.remove('unread'));
  });

  window.markItemRead = function(itemEl) {
    if (itemEl.classList.contains('unread')) {
      itemEl.classList.remove('unread');
      if (unreadNotifications > 0) {
        unreadNotifications--;
        updateNotificationBadges();
      }
    }
  };

  window.openNotifView = function() {
    dropdown?.classList.remove('open');
    const notifBtn = $('#nav-notifications');
    if (notifBtn) notifBtn.click();
  };
}

function updateNotificationBadges() {
  const bellBadge = $('#bell-count');
  const sbBadge = $('#sidebar-notif-count');
  const ndUnreadBadge = $('#nd-unread-count');

  if (unreadNotifications <= 0) {
    if (bellBadge) bellBadge.style.display = 'none';
    if (sbBadge) sbBadge.style.display = 'none';
    if (ndUnreadBadge) ndUnreadBadge.textContent = 'All caught up';
  } else {
    if (bellBadge) { bellBadge.style.display = 'flex'; bellBadge.textContent = unreadNotifications; }
    if (sbBadge) { sbBadge.style.display = 'inline-block'; sbBadge.textContent = unreadNotifications; }
    if (ndUnreadBadge) ndUnreadBadge.textContent = `${unreadNotifications} unread`;
  }
}

// ─── VIEW TITLES & ROUTING ────────────────────────
const ViewTitles = {
  'dashboard': 'Dashboard Overview',
  'analytics': 'Sales & Revenue Analytics (₹)',
  'sales': 'Sales Pipeline (₹)',
  'customers': 'Customer Directory',
  'products': 'Products & Pricing (₹)',
  'orders': 'Orders & Transactions (₹)',
  'revenue': 'Revenue Breakdown (₹)',
  'ai-insights': '🤖 Lumora AI Insights',
  'forecast': '📅 Financial Forecast',
  'reports': '📄 Business Reports',
  'notifications': '🔔 System Notifications',
  'settings': '⚙️ Settings',
  'profile': '👤 User Profile',
};

function initNavigation() {
  const navItems = $$('.nav-item[data-view]');
  const viewTitle = $('#view-title');
  const sidebar = $('#sidebar');
  const sidebarToggle = $('#sidebar-toggle');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetView = item.dataset.view;
      if (!targetView) return;

      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      if (viewTitle && ViewTitles[targetView]) {
        viewTitle.textContent = ViewTitles[targetView];
      }

      $$('.view-panel').forEach(panel => panel.classList.remove('active'));
      const targetPanel = $(`#view-${targetView}-panel`);
      if (targetPanel) targetPanel.classList.add('active');

      sidebar?.classList.remove('open');

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

  sidebarToggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
  });

  $('#nav-logout')?.addEventListener('click', () => {
    window.logout();
  });
}

// ─── REALTIME SALES & REVENUE CALCULATION ENGINE ────
window.openAddSaleModal = function() {
  $('#add-sale-modal').style.display = 'flex';
  recalculateSaleTotal();
};

window.closeAddSaleModal = function() {
  $('#add-sale-modal').style.display = 'none';
};

window.recalculateSaleTotal = function() {
  const unitPrice = parseFloat($('#sale-product')?.value || 499999);
  const qty = parseInt($('#sale-qty')?.value || 1, 10);
  const rev = unitPrice * qty;
  const profit = rev * 0.37;

  const revEl = $('#calc-rev-val');
  const profitEl = $('#calc-profit-val');

  if (revEl) revEl.textContent = `₹${rev.toLocaleString('en-IN')}`;
  if (profitEl) profitEl.textContent = `₹${Math.round(profit).toLocaleString('en-IN')}`;
};

window.handleCreateSale = async function(event) {
  event.preventDefault();
  const customer = $('#sale-customer')?.value || 'New Client';
  const prodSelect = $('#sale-product');
  const prodName = prodSelect?.options[prodSelect.selectedIndex]?.dataset?.name || 'Lumora Enterprise Suite';
  const unitPrice = parseFloat(prodSelect?.value || 499999);
  const qty = parseInt($('#sale-qty')?.value || 1, 10);
  const region = $('#sale-region')?.value || 'Bengaluru';

  const saleRevenue = unitPrice * qty;
  const saleProfit = saleRevenue * 0.37;

  // 1. Update State & Metrics
  totalRevenueVal += saleRevenue;
  totalProfitVal += saleProfit;
  totalOrdersCount += 1;

  // 2. Format In Lakhs/Crores
  const revLakhs = (totalRevenueVal / 100000).toFixed(1);
  const profitLakhs = (totalProfitVal / 100000).toFixed(1);

  const kpiRev = $('#kpi-val-revenue');
  const kpiProfit = $('#kpi-val-profit');
  const kpiOrders = $('#kpi-val-orders');
  const revMrr = $('#rev-view-mrr');

  if (kpiRev) kpiRev.textContent = `₹${revLakhs} Lakhs`;
  if (kpiProfit) kpiProfit.textContent = `₹${profitLakhs} Lakhs`;
  if (kpiOrders) kpiOrders.textContent = totalOrdersCount.toLocaleString('en-IN');
  if (revMrr) revMrr.textContent = `₹${revLakhs} Lakhs`;

  // 3. Append to Orders Table
  const ordersTbody = $('#orders-tbody');
  if (ordersTbody) {
    const orderId = `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${orderId}</td>
      <td>${customer}</td>
      <td>Just now</td>
      <td>₹${saleRevenue.toLocaleString('en-IN')}</td>
      <td><span class="badge-active">Completed</span></td>
    `;
    ordersTbody.insertBefore(tr, ordersTbody.firstChild);
  }

  // 4. Append to Live Feed
  const feed = $('#live-feed');
  if (feed) {
    const item = document.createElement('div');
    item.className = 'lf-item';
    item.innerHTML = `
      <span class="lf-icon">💰</span>
      <div class="lf-text">
        <div class="lf-title">New sale recorded</div>
        <div class="lf-sub">${customer} purchased ${prodName} (${qty}x)</div>
      </div>
      <span class="lf-val">+₹${saleRevenue.toLocaleString('en-IN')}</span>
    `;
    feed.insertBefore(item, feed.firstChild);
  }

  // 5. Insert Record to Supabase Database if available
  if (supabaseClient) {
    try {
      await supabaseClient.from('sales').insert({
        revenue: saleRevenue,
        profit: saleProfit,
        region: region
      });
      console.log('⚡ Sale recorded in Supabase!');
    } catch (err) {
      console.warn('Supabase sale insert notice:', err);
    }
  }

  closeAddSaleModal();
  alert(`✨ Sale Recorded Successfully!\nRevenue: +₹${saleRevenue.toLocaleString('en-IN')}\nDashboard metrics updated live.`);
};

// ─── CHARTS ───────────────────────────────────────
function normalizePoints(data, w, h, padding = 10) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return data.map((v, i) => ({
    x: padding + (i / (data.length - 1)) * (w - padding * 2),
    y: (h - padding) - ((v - min) / range) * (h - padding * 2),
  }));
}

function initHeroChart() {
  const canvas = $('#hero-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const datasets = {
    '1M': [32, 38, 34, 42, 39, 46, 44, 52, 49, 58, 56, 64, 61, 70, 68, 76, 74, 82],
    '3M': [20, 24, 22, 28, 31, 29, 36, 34, 40, 38, 45, 42, 50, 48, 56, 53, 61, 58, 66, 64, 72],
    '1Y': [10, 13, 12, 16, 15, 19, 18, 23, 22, 28, 27, 34, 32, 40, 39, 47, 45, 54, 52, 61, 59, 68, 66, 75],
  };

  let currentKey = '1M';

  function draw(key) {
    const data = datasets[key] || datasets['1M'];
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 600;
    const h = 220;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = (h / 4) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    const points = normalizePoints(data, w, h, 12);
    if (points.length < 2) return;

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

    ctx.save();
    ctx.beginPath(); ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#2ECC71'; ctx.fill();
    ctx.beginPath(); ctx.arc(last.x, last.y, 9, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(46,204,113,0.25)'; ctx.fill();
    ctx.restore();
  }

  draw(currentKey);

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

function initFeatureChart() {
  const canvas = $('#fc-chart-1');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const data = [12, 14.5, 13.2, 16.8, 15.5, 18.9, 17.5, 21.0, 19.5, 23.5, 22.0, 26.0];

  function render() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 500;
    const h = 200;
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
    ctx.strokeStyle = '#2ECC71';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
  }
  render();
  window.addEventListener('resize', render);
}

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
    const h = 180;
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

function initLiveFeed() {
  const feed = $('#live-feed');
  if (!feed) return;

  const events = [
    { icon: '💰', title: 'New sale recorded', detail: 'Mahindra Group purchased Enterprise Suite', val: '+₹4,99,999' },
    { icon: '👤', title: 'New enterprise user', detail: 'Added 12 team seats', val: '+12 Seats' },
    { icon: '📈', title: 'Revenue milestone', detail: 'Monthly target reached ₹50.0 Lakhs', val: '₹50.0 Lakhs' },
    { icon: '⭐', title: '5-Star Review', detail: 'Reliance Retail rated Lumora 5/5', val: '5.0 ★' },
    { icon: '🤖', title: 'AI Insight Alert', detail: 'Demand forecast spike in Bengaluru', val: '+34% Proj' },
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

  for (let i = 0; i < 3; i++) addItem();
}

// ─── INIT ──────────────────────────────────────────
function init() {
  initSupabase();
  initAuth();
  initNotificationTray();
  initNavigation();
  initLiveFeed();

  console.log(
    '%c✦ Lumora Analytics Engine (Colorlib Login & Revenue Calculator) Initialized',
    'color:#2ECC71;font-size:14px;font-weight:700;'
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
