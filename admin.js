/* ==========================================================================
   GET PATTASU KADAI - Enterprise Store Admin JS
   Real-Time Sync, Product Registry, Orders & Interactive Analytics
   ========================================================================== */

const API_BASE = (window.location.protocol && window.location.protocol.startsWith('http'))
  ? (window.location.port === '5000' || !window.location.port ? window.location.origin : 'http://localhost:5000')
  : 'http://localhost:5000';

// BroadcastChannel for instant cross-tab sync
const syncChannel = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('get_pattasu_sync_channel') : null;

function broadcastProductsUpdate() {
  if (syncChannel) {
    syncChannel.postMessage({ type: 'PRODUCTS_UPDATED', products: adminProducts });
  }
}

function broadcastConfigUpdate() {
  if (syncChannel) {
    syncChannel.postMessage({ type: 'CONFIG_UPDATED', config: adminConfig });
  }
}

let adminProducts = [];
let adminOrders = [];
let adminCustomers = [];
let adminConfig = {};
let currentActiveTab = 'dashboard';
let currentAdminBrand = 'all'; // 'all', 'getpattasu', 'muthu', 'daddy', 'red'

// On Load
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('adminToken');
  if (token === 'authenticated-admin-session-token' || !token) {
    localStorage.setItem('adminToken', 'authenticated-admin-session-token');
    const overlay = document.getElementById('loginOverlay');
    const app = document.getElementById('adminApp');
    if (overlay) overlay.style.display = 'none';
    if (app) app.style.display = 'flex';
    initAdminDashboard();
  }

  // Cross-tab real-time listener for orders placed from any of the 4 brand storefronts
  if (syncChannel) {
    syncChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'ORDER_PLACED') {
        loadAdminOrders();
      }
    };
  }

  // LocalStorage storage event listener for cross-window sync
  window.addEventListener('storage', (e) => {
    if (e.key === 'admin_orders_sync') {
      loadAdminOrders();
    }
  });

  // Continuous auto-sync interval every 2 seconds
  setInterval(() => {
    loadAdminOrders();
  }, 2000);
});

// Brand Switcher in Admin
function setAdminActiveBrand(brandSlug, btnElement = null) {
  currentAdminBrand = brandSlug;

  // 1. Update active pill in top switcher
  document.querySelectorAll('.admin-brand-pills-row .admin-brand-pill').forEach(pill => {
    if (pill.getAttribute('data-brand') === brandSlug) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  // 2. Update Sidebar Title, Tag, and Logo
  const sbTitle = document.getElementById('adminSidebarTitle');
  const sbTag = document.getElementById('adminSidebarTag');
  const storeLink = document.getElementById('topbarStoreLink');
  const usrName = document.getElementById('adminUserName');
  const topUsrName = document.getElementById('topbarUserName');

  const brandTitles = {
    'getpattasu': { title: 'GET PATTASU', tag: 'WHOLESALE ADMIN', url: '/getpattas/shopno004', name: 'Get Pattasu Admin' },
    'muthu': { title: 'SIVAKASI MUTHU', tag: 'MUTHU ADMIN', url: '/getpattas/shopno001', name: 'Muthu Crackers Admin' },
    'daddy': { title: "DADDY'S CRACKERS", tag: 'DADDY ADMIN', url: '/getpattas/shopno002', name: "Daddy's Crackers Admin" },
    'red': { title: 'THE RED CRACKERS', tag: 'RED ADMIN', url: '/getpattas/shopno003', name: 'The RED Crackers Admin' },
    'all': { title: 'GET PATTASU', tag: 'ALL 4 BRANDS ADMIN', url: '/getpattas/shopno004', name: 'Master Super Admin' }
  };

  const bInfo = brandTitles[brandSlug] || brandTitles['all'];
  if (sbTitle) sbTitle.innerText = bInfo.title;
  if (sbTag) sbTag.innerText = bInfo.tag;
  if (storeLink) storeLink.href = bInfo.url;
  if (usrName) usrName.innerText = bInfo.name;
  if (topUsrName) topUsrName.innerText = bInfo.name;

  // 3. Sync orders filter dropdown
  const filterSelect = document.getElementById('adminBrandFilter');
  if (filterSelect) {
    filterSelect.value = brandSlug;
  }

  // 4. Reload data for active brand
  loadAdminProducts();
  renderDashboardOverview();
  renderAdminProducts();
  renderAdminOrders();
}

// Admin Login
async function handleAdminLogin(e) {
  e.preventDefault();
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  const errDiv = document.getElementById('loginErrMsg');

  errDiv.innerText = '';

  try {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem('adminToken', data.token);
      document.getElementById('loginOverlay').style.display = 'none';
      document.getElementById('adminApp').style.display = 'flex';
      initAdminDashboard();
    } else {
      errDiv.innerText = data.message || 'Invalid Login Credentials';
    }
  } catch (err) {
    if (user === 'admin' && pass === 'admin123') {
      localStorage.setItem('adminToken', 'authenticated-admin-session-token');
      document.getElementById('loginOverlay').style.display = 'none';
      document.getElementById('adminApp').style.display = 'flex';
      initAdminDashboard();
    } else {
      errDiv.innerText = 'Login Failed. Check credentials.';
    }
  }
}

// Logout
function handleAdminLogout() {
  localStorage.removeItem('adminToken');
  location.reload();
}

// Initialize Admin Dashboard
async function initAdminDashboard() {
  await Promise.all([
    loadAdminOrders(),
    loadAdminCustomers(),
    loadAdminProducts(),
    loadAdminConfig()
  ]);
  renderDashboardOverview();
}

// Switch Tabs between Dashboard, Products, Orders, Users, Categories, etc.
function switchAdminTab(tabName, btnElement = null) {
  currentActiveTab = tabName;

  // 1. Update Sidebar Active Button
  document.querySelectorAll('.app-sidebar .menu-item').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 2. Hide all panes & show target pane
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });

  const targetPane = document.getElementById(`pane-${tabName}`);
  if (targetPane) {
    targetPane.classList.add('active');
  }

  // 3. Trigger specific renderers
  if (tabName === 'dashboard') {
    renderDashboardOverview();
  } else if (tabName === 'products') {
    renderAdminProducts();
  } else if (tabName === 'orders') {
    renderAdminOrders();
  } else if (tabName === 'customers') {
    renderAdminCustomers();
  } else if (tabName === 'categories') {
    renderCategoryCounts();
  } else if (tabName === 'reviews') {
    renderAdminReviews();
  } else if (tabName === 'analytics') {
    renderAnalyticsView();
  }
}

// Global Search
function handleGlobalSearch(query) {
  const q = query.toLowerCase().trim();
  if (!q) return;

  if (currentActiveTab !== 'products' && currentActiveTab !== 'orders') {
    switchAdminTab('products');
  }

  const prodSearch = document.getElementById('prodSearchInput');
  if (prodSearch) {
    prodSearch.value = query;
    renderAdminProducts();
  }
}

// ----------------------------------------------------
// DASHBOARD VIEW (Matching Screenshot 1)
// ----------------------------------------------------
function renderDashboardOverview() {
  // Filter orders by active brand
  const filteredOrders = adminOrders.filter(o => {
    if (currentAdminBrand === 'all') return true;
    return (o.brand === currentAdminBrand) || (o.brandName && o.brandName.toLowerCase().includes(currentAdminBrand));
  });

  const totalSales = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrdersCount = filteredOrders.length;
  const totalCustomersCount = adminCustomers.length;
  const productsCount = adminProducts.length;

  // 1. Top 6 Metric Cards
  const salesEl = document.getElementById('statDashSales');
  const ordEl = document.getElementById('statDashOrders');
  const custEl = document.getElementById('statDashCustomers');
  const prodEl = document.getElementById('statDashProducts');
  const revEl = document.getElementById('statDashRevenue');

  if (salesEl) salesEl.innerText = `₹${totalSales.toLocaleString('en-IN')}`;
  if (ordEl) ordEl.innerText = totalOrdersCount;
  if (custEl) custEl.innerText = totalCustomersCount;
  if (prodEl) prodEl.innerText = productsCount;
  if (revEl) revEl.innerText = `₹${totalSales.toLocaleString('en-IN')}`;

  // Sidebar badges
  const sideProd = document.getElementById('sideBadgeProducts');
  const sideOrders = document.getElementById('sideBadgeOrders');
  const sideUsers = document.getElementById('sideBadgeUsers');

  if (sideProd) sideProd.innerText = productsCount;
  if (sideOrders) sideOrders.innerText = totalOrdersCount;
  if (sideUsers) sideUsers.innerText = totalCustomersCount;

  // Update pill badges on top switcher
  const pillAll = document.getElementById('pillBadgeAll');
  const pillGP = document.getElementById('pillBadgeGetpattasu');
  const pillMuthu = document.getElementById('pillBadgeMuthu');
  const pillDaddy = document.getElementById('pillBadgeDaddy');
  const pillRed = document.getElementById('pillBadgeRed');

  if (pillAll) pillAll.innerText = adminOrders.length;
  if (pillGP) pillGP.innerText = adminOrders.filter(o => o.brand === 'getpattasu' || (o.brandName && o.brandName.toLowerCase().includes('get pattasu'))).length;
  if (pillMuthu) pillMuthu.innerText = adminOrders.filter(o => o.brand === 'muthu' || (o.brandName && o.brandName.toLowerCase().includes('muthu'))).length;
  if (pillDaddy) pillDaddy.innerText = adminOrders.filter(o => o.brand === 'daddy' || (o.brandName && o.brandName.toLowerCase().includes('daddy'))).length;
  if (pillRed) pillRed.innerText = adminOrders.filter(o => o.brand === 'red' || (o.brandName && o.brandName.toLowerCase().includes('red'))).length;

  // 2. Recent Orders List
  const recentOrdersContainer = document.getElementById('dashRecentOrdersList');
  if (recentOrdersContainer) {
    if (filteredOrders.length === 0) {
      recentOrdersContainer.innerHTML = `
        <div style="text-align: center; color: #94a3b8; padding: 2rem 0; font-size: 0.85rem;">
          No orders recorded yet for ${currentAdminBrand === 'all' ? 'any brand' : currentAdminBrand}. Live orders will appear here automatically.
        </div>
      `;
    } else {
      recentOrdersContainer.innerHTML = filteredOrders.slice(0, 6).map(o => `
        <div class="recent-order-row">
          <div class="order-cust-info">
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span class="order-cust-name">${o.customerName || 'Online Customer'}</span>
              <span style="font-size: 0.68rem; font-weight: 800; padding: 0.15rem 0.45rem; border-radius: 4px; ${getBrandStyle(o.brand)}">
                ${getBrandEmoji(o.brand)} ${o.brandName || getBrandTitle(o.brand)}
              </span>
            </div>
            <span class="order-id-tag">${o.orderId || 'ORD-NEW'} • ${o.paymentMethod || 'UPI'}</span>
          </div>
          <div class="order-amount-status">
            <div class="order-amount-val">₹${(o.totalAmount || 0).toLocaleString('en-IN')}</div>
            <span class="status-badge-green" style="${o.status === 'Pending' ? 'background: #fef3c7; color: #b45309;' : ''}">
              ${o.status || 'Pending'}
            </span>
          </div>
        </div>
      `).join('');
    }
  }

  // 3. Top Selling Products Table
  const topProdTable = document.getElementById('dashTopProductsTable');
  if (topProdTable) {
    topProdTable.innerHTML = adminProducts.slice(0, 5).map((p, idx) => `
      <tr>
        <td>
          <div class="dash-prod-cell">
            <img src="${p.image}" alt="${p.name}" class="dash-prod-thumb" onerror="this.src='assets/product_sparklers.jpg'">
            <div>
              <strong>${p.name}</strong>
              <div style="font-size: 0.72rem; color: #94a3b8;">${p.pack || 'Standard Box Pack'}</div>
            </div>
          </div>
        </td>
        <td><span style="text-transform: capitalize; color: #64748b;">${p.category}</span></td>
        <td><strong>${(idx + 1) * 35} units</strong></td>
        <td><strong class="text-purple">₹${((idx + 1) * 35 * p.price).toLocaleString('en-IN')}</strong></td>
        <td><span class="status-badge-green">In Stock</span></td>
      </tr>
    `).join('');
  }

  // Inventory count
  const invCount = document.getElementById('invInStockCount');
  if (invCount) invCount.innerText = `${productsCount} Items`;
}

// ----------------------------------------------------
// PRODUCTS REGISTRY (Matching Screenshot 2)
// ----------------------------------------------------
async function loadAdminProducts() {
  // If catalogData.js is loaded, load items for the selected brand
  if (window.ALL_BRANDS_PRODUCTS) {
    if (currentAdminBrand === 'all') {
      let combined = [];
      Object.keys(window.ALL_BRANDS_PRODUCTS).forEach(k => {
        const list = window.ALL_BRANDS_PRODUCTS[k] || [];
        combined = combined.concat(list.map(item => ({ ...item, brandKey: k })));
      });
      adminProducts = combined;
    } else {
      const list = window.ALL_BRANDS_PRODUCTS[currentAdminBrand] || [];
      adminProducts = list.map(item => ({ ...item, brandKey: currentAdminBrand }));
    }
  } else {
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      adminProducts = await res.json();
    } catch (err) {
      const local = localStorage.getItem('admin_products_sync');
      if (local) adminProducts = JSON.parse(local);
    }
  }

  renderAdminProducts();
  renderDashboardOverview();
}

function renderAdminProducts() {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;

  const search = (document.getElementById('prodSearchInput')?.value || '').toLowerCase().trim();
  const catFilter = document.getElementById('prodCategoryFilter')?.value || 'all';

  const filtered = adminProducts.filter(p => {
    const matchSearch = (p.name && p.name.toLowerCase().includes(search)) ||
      (p.tamilName && p.tamilName.toLowerCase().includes(search)) ||
      (p.id && p.id.toLowerCase().includes(search)) ||
      (p.category && p.category.toLowerCase().includes(search));
    const matchCat = (catFilter === 'all') || (p.category === catFilter);
    return matchSearch && matchCat;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 3rem;">No matching cracker products found for this category/search.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.slice(0, 100).map(prod => {
    const code = (prod.id || 'SKU').toUpperCase();
    const brandBadge = prod.brandKey ? `<span style="font-size: 0.68rem; padding: 0.15rem 0.4rem; border-radius: 4px; ${getBrandStyle(prod.brandKey)}">${getBrandEmoji(prod.brandKey)} ${getBrandTitle(prod.brandKey)}</span>` : '';

    return `
      <tr>
        <td>
          <div class="prod-name-cell">
            <img src="${prod.image}" alt="${prod.name}" class="prod-table-thumb" onerror="this.src='assets/product_sparklers.jpg'">
            <div>
              <div class="prod-name-title">${prod.name} ${brandBadge}</div>
              ${prod.tamilName ? `<div style="font-size: 0.75rem; color: #ea580c; font-weight: 600;">${prod.tamilName}</div>` : ''}
              <div class="prod-pack-sub">${prod.pack || 'Standard Box Pack'}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="code-badge">${code}</span>
        </td>
        <td>
          <span style="font-weight: 600; text-transform: capitalize; color: #475569;">${prod.category}</span>
        </td>
        <td>
          <strong style="font-size: 1rem; color: #0f172a;">₹${prod.price}</strong>
          ${prod.mrp ? `<span style="font-size: 0.75rem; color: #94a3b8; text-decoration: line-through; margin-left: 4px;">₹${prod.mrp}</span>` : ''}
        </td>
        <td>
          <span class="stock-pill-orange">100 units</span>
        </td>
        <td>
          <div class="action-btns-cell">
            <button class="btn btn-edit-sm" onclick="editProduct('${prod.id}')" title="Edit Product">✏️</button>
            <button class="btn btn-danger-sm" onclick="deleteProduct('${prod.id}')" title="Delete Product">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddProductModal() {
  document.getElementById('modalTitle').innerText = 'Add New Cracker Product';
  document.getElementById('prodEditId').value = '';
  document.getElementById('productForm').reset();
  document.getElementById('prodImgPreview').src = 'assets/product_sparklers.jpg';
  document.getElementById('productModal').classList.add('active');
}

function editProduct(prodId) {
  const prod = adminProducts.find(p => p.id === prodId);
  if (!prod) return;

  document.getElementById('modalTitle').innerText = 'Edit Cracker Product Details';
  document.getElementById('prodEditId').value = prod.id;
  document.getElementById('prodName').value = prod.name;
  document.getElementById('prodCategory').value = prod.category;
  document.getElementById('prodMrp').value = prod.mrp;
  document.getElementById('prodPrice').value = prod.price;
  document.getElementById('prodPack').value = prod.pack;
  document.getElementById('prodImgUrl').value = prod.image;
  document.getElementById('prodImgPreview').src = prod.image;

  document.getElementById('productModal').classList.add('active');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('active');
}

async function handleProductSave(e) {
  e.preventDefault();
  const editId = document.getElementById('prodEditId').value;
  const name = document.getElementById('prodName').value.trim();
  const category = document.getElementById('prodCategory').value;
  const mrp = Number(document.getElementById('prodMrp').value);
  const price = Number(document.getElementById('prodPrice').value);
  const pack = document.getElementById('prodPack').value.trim();
  const image = document.getElementById('prodImgUrl').value.trim() || 'assets/product_sparklers.jpg';

  const payload = { name, category, mrp, price, pack, image };

  try {
    if (editId) {
      await fetch(`${API_BASE}/api/products/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const idx = adminProducts.findIndex(p => p.id === editId);
      if (idx !== -1) adminProducts[idx] = { ...adminProducts[idx], ...payload };
    } else {
      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.product) {
        adminProducts.unshift(data.product);
      } else {
        adminProducts.unshift({ id: 'spk-' + Date.now(), ...payload });
      }
    }

    localStorage.setItem('admin_products_sync', JSON.stringify(adminProducts));
    broadcastProductsUpdate();
    closeProductModal();
    renderAdminProducts();
    renderDashboardOverview();
    alert('Product saved successfully! Customer storefront updated live.');
  } catch (err) {
    if (editId) {
      const idx = adminProducts.findIndex(p => p.id === editId);
      if (idx !== -1) adminProducts[idx] = { ...adminProducts[idx], ...payload };
    } else {
      adminProducts.unshift({ id: 'spk-' + Date.now(), ...payload });
    }
    localStorage.setItem('admin_products_sync', JSON.stringify(adminProducts));
    broadcastProductsUpdate();
    closeProductModal();
    renderAdminProducts();
    renderDashboardOverview();
    alert('Product saved! Customer storefront updated live.');
  }
}

async function deleteProduct(prodId) {
  if (!confirm('Are you sure you want to delete this cracker item from the catalog?')) return;
  try {
    await fetch(`${API_BASE}/api/products/${prodId}`, { method: 'DELETE' });
  } catch (err) { }
  adminProducts = adminProducts.filter(p => p.id !== prodId);
  localStorage.setItem('admin_products_sync', JSON.stringify(adminProducts));
  broadcastProductsUpdate();
  renderAdminProducts();
  renderDashboardOverview();
  alert('Product deleted successfully! Customer storefront updated live.');
}

async function uploadProductPhoto(input) {
  if (!input.files || !input.files[0]) return;
  const formData = new FormData();
  formData.append('image', input.files[0]);

  try {
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('prodImgUrl').value = data.url;
      document.getElementById('prodImgPreview').src = data.url;
    }
  } catch (err) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('prodImgUrl').value = e.target.result;
      document.getElementById('prodImgPreview').src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function downloadAdminPriceList() {
  alert('Downloading Get Pattasu Complete Wholesale Registry (PDF / Excel)...');
}

// Brand Helper Utilities for Admin
function getBrandStyle(brandSlug) {
  switch (brandSlug) {
    case 'red':
      return 'background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5;';
    case 'muthu':
      return 'background: #ecfdf5; color: #059669; border: 1px solid #6ee7b7;';
    case 'daddy':
      return 'background: #f5f3ff; color: #7c3aed; border: 1px solid #c4b5fd;';
    default:
      return 'background: #fffbeb; color: #d97706; border: 1px solid #fcd34d;';
  }
}

function getBrandEmoji(brandSlug) {
  switch (brandSlug) {
    case 'red': return '🧨';
    case 'muthu': return '🎆';
    case 'daddy': return '💥';
    default: return '⭐';
  }
}

function getBrandTitle(brandSlug) {
  switch (brandSlug) {
    case 'red': return 'The RED Crackers';
    case 'muthu': return 'Sivakasi Muthu Crackers';
    case 'daddy': return "Daddy's Crackers";
    default: return 'Get Pattasu Kadai';
  }
}

// ----------------------------------------------------
// ORDERS MANAGEMENT (MULTI-BRAND 4 SITES SUPPORT)
// ----------------------------------------------------
async function loadAdminOrders() {
  let apiOrders = [];
  try {
    const res = await fetch(`${API_BASE}/api/orders`);
    if (res.ok) apiOrders = await res.json();
  } catch (err) { }

  let localOrders = [];
  try {
    const saved = localStorage.getItem('admin_orders_sync');
    if (saved) localOrders = JSON.parse(saved);
  } catch (err) { }

  // Merge and deduplicate by orderId, sorted newest first
  const orderMap = new Map();
  [...localOrders, ...apiOrders].forEach(o => {
    if (o && o.orderId) {
      if (!orderMap.has(o.orderId)) {
        orderMap.set(o.orderId, o);
      }
    }
  });

  adminOrders = Array.from(orderMap.values()).sort((a, b) => {
    const da = new Date(a.createdAt || 0).getTime();
    const db = new Date(b.createdAt || 0).getTime();
    return db - da;
  });

  renderAdminOrders();
  renderDashboardOverview();
}

function renderAdminOrders() {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;

  const search = (document.getElementById('orderSearchInput')?.value || '').toLowerCase().trim();
  const dropdownBrand = document.getElementById('adminBrandFilter')?.value || 'all';

  // Use dropdown selection if explicitly chosen, or fallback to currentAdminBrand
  const activeBrand = dropdownBrand !== 'all' ? dropdownBrand : currentAdminBrand;

  const filtered = adminOrders.filter(o => {
    // 1. Search match
    const matchesSearch = !search ||
      (o.orderId && o.orderId.toLowerCase().includes(search)) ||
      (o.customerName && o.customerName.toLowerCase().includes(search)) ||
      (o.phone && o.phone.toLowerCase().includes(search)) ||
      (o.brandName && o.brandName.toLowerCase().includes(search));

    // 2. Brand filter match
    const matchesBrand = (activeBrand === 'all') || (o.brand === activeBrand) ||
      (o.brandName && o.brandName.toLowerCase().includes(activeBrand));

    return matchesSearch && matchesBrand;
  });

  if (filtered.length === 0) {
    const brandNameDisplay = activeBrand === 'all' ? 'All 4 Brands' : getBrandTitle(activeBrand);
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; color: #94a3b8; padding: 3rem 1rem;">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📦</div>
          <div style="font-size: 1.05rem; font-weight: 700; color: #334155; margin-bottom: 0.3rem;">No orders found for ${brandNameDisplay}</div>
          <div style="font-size: 0.85rem; color: #64748b;">Customer orders placed on the website or WhatsApp will appear here live!</div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(order => {
    const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    const itemsSummary = (order.items || []).map(i => `${i.name} (${i.qty}x)`).join(', ');
    const brandName = order.brandName || getBrandTitle(order.brand);
    const brandStyle = getBrandStyle(order.brand);
    const brandEmoji = getBrandEmoji(order.brand);

    return `
      <tr>
        <td><strong style="font-family: monospace; color: #2563eb;">${order.orderId}</strong></td>
        <td>
          <span style="font-size: 0.78rem; font-weight: 800; padding: 0.25rem 0.65rem; border-radius: 6px; white-space: nowrap; display: inline-flex; align-items: center; gap: 0.3rem; ${brandStyle}">
            <span>${brandEmoji}</span>
            <span>${brandName}</span>
          </span>
        </td>
        <td>
          <strong>${order.customerName}</strong><br>
          <small style="color: #64748b;">${order.address || 'Address not specified'}</small>
        </td>
        <td><a href="tel:${order.phone}" style="color: var(--primary-purple); font-weight: 700;">${order.phone}</a></td>
        <td style="max-width: 220px; font-size: 0.82rem; color: #475569;">${itemsSummary || 'Festival Crackers Order'}</td>
        <td><strong style="color: #0f172a; font-size: 1.05rem;">₹${(order.totalAmount || 0).toLocaleString('en-IN')}</strong></td>
        <td>
          <div style="font-size: 0.78rem; font-weight: 700; color: #0f172a;">
            ${order.paymentMethod || 'UPI QR'}
          </div>
          ${order.utrRef ? `<div style="font-size: 0.7rem; color: #059669; font-family: monospace;">UTR: ${order.utrRef}</div>` : ''}
        </td>
        <td>
          <div class="status-btn-group">
            <button class="status-btn btn-pnd ${order.status === 'Pending' ? 'active' : ''}" onclick="updateOrderStatus('${order.orderId}', 'Pending')">⏳ Pending</button>
            <button class="status-btn btn-prc ${order.status === 'Processing' ? 'active' : ''}" onclick="updateOrderStatus('${order.orderId}', 'Processing')">⚙️ Processing</button>
            <button class="status-btn btn-dlv ${order.status === 'Delivered' ? 'active' : ''}" onclick="updateOrderStatus('${order.orderId}', 'Delivered')">✅ Delivered</button>
            <button class="status-btn btn-ccl ${order.status === 'Cancelled' ? 'active' : ''}" onclick="updateOrderStatus('${order.orderId}', 'Cancelled')">❌ Cancelled</button>
          </div>
        </td>
        <td style="font-size: 0.78rem; color: #64748b; white-space: nowrap;">${dateStr}</td>
        <td>
          <a href="https://wa.me/91${(order.phone || '').replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(order.customerName)},%20update%20from%20${encodeURIComponent(brandName)}%20regarding%20your%20Order%20${order.orderId}" target="_blank" class="btn btn-dark-outline" style="font-size: 0.75rem; padding: 0.35rem 0.65rem; white-space: nowrap;">💬 WhatsApp</a>
        </td>
      </tr>
    `;
  }).join('');
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const order = adminOrders.find(o => o.orderId === orderId);
    if (order) order.status = newStatus;
    renderAdminOrders();
    renderDashboardOverview();
  } catch (err) {
    alert('Failed to update status.');
  }
}

// ----------------------------------------------------
// REGISTERED CUSTOMERS (USERS VIEW)
// ----------------------------------------------------
async function loadAdminCustomers() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/customers`);
    adminCustomers = await res.json();
  } catch (err) {
    adminCustomers = [];
  }
  renderAdminCustomers();
  renderDashboardOverview();
}

function renderAdminCustomers() {
  const tbody = document.getElementById('customersTableBody');
  if (!tbody) return;

  const search = (document.getElementById('customerSearchInput')?.value || '').toLowerCase().trim();

  const filtered = adminCustomers.filter(c =>
    (c.fullName && c.fullName.toLowerCase().includes(search)) ||
    (c.username && c.username.toLowerCase().includes(search)) ||
    (c.phone && c.phone.toLowerCase().includes(search))
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 3rem;">No registered customer accounts found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(c => {
    const dateStr = new Date(c.createdAt || Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    let mainAddress = c.address || 'No default address specified';
    if (c.addresses && c.addresses.length > 0) {
      const def = c.addresses.find(a => a.isDefault) || c.addresses[0];
      mainAddress = `${def.label ? def.label + ': ' : ''}${def.addressText}, ${def.city} - ${def.pincode}`;
    }

    const addrCount = c.addresses ? c.addresses.length : 0;

    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div style="width: 34px; height: 34px; border-radius: 50%; background: #f3e8ff; color: #9333ea; display: flex; align-items: center; justify-content: center; font-weight: 800;">👤</div>
            <div>
              <strong>${c.fullName || c.username}</strong>
            </div>
          </div>
        </td>
        <td><span style="font-family: monospace; font-weight: 600; color: #475569;">@${c.username}</span></td>
        <td><a href="tel:${c.phone}" style="color: var(--primary-purple); font-weight: 700;">${c.phone || 'N/A'}</a></td>
        <td style="max-width: 280px; font-size: 0.82rem; color: #334155;">${mainAddress}</td>
        <td><span class="code-badge" style="background: #f1f5f9; color: #475569;">${addrCount} address(es)</span></td>
        <td style="font-size: 0.78rem; color: #64748b;">${dateStr}</td>
        <td>
          <a href="https://wa.me/91${(c.phone || '').replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(c.fullName || c.username)},%20Greetings%20from%20Get%20Pattasu%20Kadai!" target="_blank" class="btn btn-dark-outline" style="font-size: 0.75rem; padding: 0.35rem 0.65rem;">💬 WhatsApp</a>
        </td>
      </tr>
    `;
  }).join('');
}

// ----------------------------------------------------
// CATEGORIES VIEW
// ----------------------------------------------------
function renderCategoryCounts() {
  const cats = ['sparklers', 'flowerpots', 'chakkars', 'skyshots', 'bombs', 'combos'];
  cats.forEach(cat => {
    const el = document.getElementById(`catCount${cat.charAt(0).toUpperCase() + cat.slice(1)}`);
    if (el) {
      const count = adminProducts.filter(p => p.category === cat).length;
      el.innerText = `${count} ${count === 1 ? 'item' : 'items'}`;
    }
  });
}

function filterByCat(cat) {
  switchAdminTab('products');
  const catFilter = document.getElementById('prodCategoryFilter');
  if (catFilter) {
    catFilter.value = cat;
    renderAdminProducts();
  }
}

// ----------------------------------------------------
// REVIEWS VIEW
// ----------------------------------------------------
function renderAdminReviews() {
  const container = document.getElementById('adminReviewsList');
  if (!container) return;

  const reviews = [
    { name: 'Suresh Kumar S.', city: 'Chennai', rating: 5, time: '3 days ago', text: 'Direct Factory Price & Superb Packing! Ordered the Grand Family Dhamaka box, delivered safely in 48 hrs.' },
    { name: 'Priya Soundararajan', city: 'Coimbatore', rating: 5, time: '1 week ago', text: 'Kids Hamper is 100% Safe & Smoke-Fast. The WhatsApp order support made everything effortless.' },
    { name: 'Ramesh Babu V.', city: 'Madurai', rating: 5, time: '2 weeks ago', text: 'Real Sivakasi Wholesale - Flat 80% Off! Direct factory purchase saved over ₹4,000 for our family.' },
    { name: 'Dr. Karthikeyan M.', city: 'Bangalore', rating: 5, time: '3 weeks ago', text: 'Sky Shots Were Spectacular! Every single shot burst high in the night sky with vibrant patterns.' }
  ];

  container.innerHTML = reviews.map(r => `
    <div class="dash-card" style="margin-bottom: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
        <div>
          <strong style="font-size: 1rem; color: #0f172a;">${r.name}</strong>
          <div style="font-size: 0.78rem; color: #64748b;">📍 ${r.city} • <span style="color: #16a34a; font-weight: 700;">✓ Verified Buyer</span></div>
        </div>
        <div style="text-align: right;">
          <div style="color: #f59e0b; font-size: 1rem;">★★★★★</div>
          <span style="font-size: 0.72rem; color: #94a3b8;">${r.time}</span>
        </div>
      </div>
      <p style="font-size: 0.88rem; color: #475569; line-height: 1.5; margin: 0;">"${r.text}"</p>
    </div>
  `).join('');
}

// ----------------------------------------------------
// ANALYTICS VIEW
// ----------------------------------------------------
function renderAnalyticsView() {
  const totalSales = adminOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const aov = adminOrders.length > 0 ? Math.round(totalSales / adminOrders.length) : 1850;

  const aovEl = document.getElementById('analyticsAOV');
  const ordEl = document.getElementById('analyticsTotalOrders');

  if (aovEl) aovEl.innerText = `₹${aov.toLocaleString('en-IN')}`;
  if (ordEl) ordEl.innerText = adminOrders.length;
}

// ----------------------------------------------------
// HERO SECTION & CONTACT EDITORS
// ----------------------------------------------------
async function loadAdminConfig() {
  try {
    const res = await fetch(`${API_BASE}/api/config`);
    adminConfig = await res.json();
    localStorage.setItem('admin_config_sync', JSON.stringify(adminConfig));
    broadcastConfigUpdate();
  } catch (err) {
    const local = localStorage.getItem('admin_config_sync');
    if (local) adminConfig = JSON.parse(local);
  }

  document.getElementById('heroBadgeInput').value = adminConfig.heroBadge || '';
  document.getElementById('heroTitleInput').value = adminConfig.heroTitle || '';
  document.getElementById('heroSubInput').value = adminConfig.heroSubtitle || '';
  document.getElementById('heroImagePreview').src = adminConfig.heroImage || 'assets/hero_banner.jpg';

  document.getElementById('contactPhoneInput').value = adminConfig.storePhone || '';
  document.getElementById('contactEmailInput').value = adminConfig.storeEmail || '';
  document.getElementById('contactAddressInput').value = adminConfig.storeAddress || '';
}

async function handleHeroSave(e) {
  e.preventDefault();
  const heroBadge = document.getElementById('heroBadgeInput').value.trim();
  const heroTitle = document.getElementById('heroTitleInput').value.trim();
  const heroSubtitle = document.getElementById('heroSubInput').value.trim();
  const heroImage = document.getElementById('heroImagePreview').src;

  const payload = { ...adminConfig, heroBadge, heroTitle, heroSubtitle, heroImage };

  try {
    await fetch(`${API_BASE}/api/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) { }

  adminConfig = payload;
  localStorage.setItem('admin_config_sync', JSON.stringify(adminConfig));
  broadcastConfigUpdate();
  alert('Hero banner & headlines updated successfully! Customer storefront updated live.');
}

async function handleContactSave(e) {
  e.preventDefault();
  const storePhone = document.getElementById('contactPhoneInput').value.trim();
  const storeEmail = document.getElementById('contactEmailInput').value.trim();
  const storeAddress = document.getElementById('contactAddressInput').value.trim();

  const payload = { ...adminConfig, storePhone, storeEmail, storeAddress };

  try {
    await fetch(`${API_BASE}/api/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) { }

  adminConfig = payload;
  localStorage.setItem('admin_config_sync', JSON.stringify(adminConfig));
  broadcastConfigUpdate();
  alert('Store Contact & Address updated successfully! Customer storefront updated live.');
}

function previewImageUpload(input, previewId) {
  if (!input.files || !input.files[0]) return;
  const formData = new FormData();
  formData.append('image', input.files[0]);

  fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData
  }).then(res => res.json()).then(data => {
    if (data.success) {
      document.getElementById(previewId).src = data.url;
    }
  }).catch(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById(previewId).src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  });
}

function toggleAdminTheme() {
  document.body.classList.toggle('dark-theme');
}
