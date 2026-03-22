// ================= DATA INITIALIZATION =================
const DEFAULT_PRODUCTS = {
  led:{id:"led",name:"LED RGB متعدد الألوان",price:25,img:"images/ledd.jpg",stock:10,category:"led",desc:"شريط LED RGB متعدد الألوان مع تحكم عن بُعد",specs:["ألوان متعددة","تحكم عن بُعد","سهل التركيب"],active:true},
  casque:{id:"casque",name:"Casque Bluetooth CAT EAR",price:25,img:"images/casque.jpg",stock:5,category:"audio",desc:"سماعات رأس بلوتوث على شكل آذان القط",specs:["بلوتوث 5.0","بطارية طويلة","إضاءة LED"],active:true},
  mouse:{id:"mouse",name:"Elite RGB Wireless Mouse",price:30,img:"images/mouse.jpg",stock:7,category:"accessories",desc:"ماوس لاسلكي RGB احترافي",specs:["لاسلكي","RGB إضاءة","دقة عالية"],active:true},
  projector:{id:"projector",name:"LED star projector with Bluetooth",price:25,img:"images/star.jpg",stock:7,category:"led",desc:"مشروع النجوم LED مع بلوتوث",specs:["بلوتوث","مكبر صوت","تغيير الألوان"],active:true},
  mong:{id:"mong",name:"T800 Ultra Smart Watch",price:30,img:"images/mong.jpg",stock:7,category:"accessories",desc:"ساعة ذكية T800 Ultra",specs:["49mm","مقاومة للماء","شاشة AMOLED"],active:true},
  mic:{id:"mic",name:"Professional Studio Kit",price:35.900,img:"images/mic.jpg",stock:7,category:"audio",desc:"مجموعة استوديو احترافية",specs:["جودة عالية","متين","سهل الاستخدام"],active:true},
  bafle:{id:"bafle",name:"HAUT PARLEUR RGB",price:75,img:"images/bafle.jpg",stock:7,category:"audio",desc:"مكبر صوت RGB",specs:["Bass قوي","RGB إضاءة","بلوتوث"],active:true},
  kit:{id:"kit",name:"AirPod A9 Pro",price:45,img:"images/icot.jpg",stock:7,category:"audio",desc:"سماعات لاسلكية A9 Pro",specs:["شاشة لمسية","عزل ضوضاء","بطارية طويلة"],active:true},
  cass:{id:"cass",name:"BH02 BlackWave Headset",price:34,img:"images/cass.jpg",stock:7,category:"audio",desc:"سماعة رأس BH02",specs:["Surround Sound","ميكروفون","مريحة"],active:true}
};

const DEFAULT_ADMIN = {
  username: "admin",
  password: "admin123"
};

const DEFAULT_SETTINGS = {
  storeName: "Vibe Market",
  storePhone: "21623409356",
  storeWhatsapp: "https://wa.me/21623409356",
  storeInstagram: "https://www.instagram.com/vibe.market2",
  currency: "DT",
  defaultLang: "ar",
  enableMusic: true
};

const DEFAULT_CATEGORIES = {
  audio: { id: "audio", name: "صوتيات", nameEn: "Audio", icon: "🎧", active: true },
  led: { id: "led", name: "إضاءة LED", nameEn: "LED", icon: "💡", active: true },
  accessories: { id: "accessories", name: "إكسسوارات", nameEn: "Accessories", icon: "⌚", active: true }
};

const CATEGORY_ICONS = ["🎧", "💡", "⌚", "📱", "💻", "🎮", "📷", "🚗", "🏠", "🎁"];

// ================= STATE MANAGEMENT =================
let products = JSON.parse(localStorage.getItem("products")) || DEFAULT_PRODUCTS;
let orders = [];
let customers = [];
let admin = JSON.parse(localStorage.getItem("admin")) || DEFAULT_ADMIN;
let settings = JSON.parse(localStorage.getItem("settings")) || DEFAULT_SETTINGS;
let categories = JSON.parse(localStorage.getItem("categories")) || DEFAULT_CATEGORIES;

// ================= FIREBASE REAL-TIME SYNC =================
function initFirebaseSync() {
  // Subscribe to orders - real-time sync
  if (typeof OrderSync !== 'undefined') {
    OrderSync.subscribe((firebaseOrders) => {
      console.log('Orders synced:', firebaseOrders.length);
      orders = firebaseOrders;
      
      // Update all UI components that show orders
      if (document.getElementById("totalOrders")) {
        document.getElementById("totalOrders").innerText = orders.length;
      }
      if (document.getElementById("recentOrders")) {
        const recent = orders.slice(0, 5);
        document.getElementById("recentOrders").innerHTML = recent.map(order => `
          <div class="order-card" style="padding: 15px; margin-bottom: 10px;">
            <div class="order-info">
              <h4>${order.customerName}</h4>
              <p>${order.items.length} products - ${Number.isInteger(order.total) ? order.total : order.total.toFixed(3)} DT</p>
            </div>
            <span class="order-status order-${order.status}">${getStatusText(order.status)}</span>
          </div>
        `).join("");
      }
      
      // Update pending orders badge
      const pendingOrders = orders.filter(o => o.status === "pending").length;
      if (document.getElementById("ordersBadge")) {
        document.getElementById("ordersBadge").innerText = pendingOrders;
      }
      
      // Update customers count
      const uniqueCustomers = [...new Set(orders.map(o => o.phone))].length;
      if (document.getElementById("totalCustomers")) {
        document.getElementById("totalCustomers").innerText = uniqueCustomers;
      }
      
      // Update revenue
      const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
      if (document.getElementById("totalRevenue")) {
        document.getElementById("totalRevenue").innerText = Number.isInteger(totalRevenue) ? totalRevenue : totalRevenue.toFixed(3);
      }
    });
  }
  
  // Subscribe to products sync
  if (typeof ProductSync !== 'undefined') {
    ProductSync.subscribe((firebaseProducts) => {
      products = firebaseProducts;
      if (document.getElementById("totalProducts")) {
        document.getElementById("totalProducts").innerText = Object.keys(products).length;
      }
    });
  }
}

// ================= INITIALIZATION =================
document.addEventListener("DOMContentLoaded", () => {
  // Wait for Firebase to be ready
  setTimeout(() => {
    initFirebaseSync();
  }, 500);
  
  initLogin();
  initNavigation();
  initForms();
  updateDate();
});

function updateDate() {
  const date = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById("currentDate").innerText = date.toLocaleDateString('en-US', options);
}

// ================= LOGIN =================
function initLogin() {
  const isLoggedIn = sessionStorage.getItem("adminLoggedIn");
  if (isLoggedIn === "true") {
    showAdminPanel();
  }
}

document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("adminUsername").value;
  const password = document.getElementById("adminPassword").value;
  
  if (username === admin.username && password === admin.password) {
    sessionStorage.setItem("adminLoggedIn", "true");
    showAdminPanel();
  } else {
    alert("اسم المستخدم أو كلمة المرور غير صحيحة");
  }
});

function showAdminPanel() {
  // Reload all data from localStorage to get latest orders
  products = JSON.parse(localStorage.getItem("products")) || DEFAULT_PRODUCTS;
  orders = JSON.parse(localStorage.getItem("orders")) || [];
  categories = JSON.parse(localStorage.getItem("categories")) || DEFAULT_CATEGORIES;
  
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("adminPanel").style.display = "flex";
  loadDashboard();
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    sessionStorage.removeItem("adminLoggedIn");
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("adminPanel").style.display = "none";
    document.getElementById("adminUsername").value = "";
    document.getElementById("adminPassword").value = "";
  }
}

// ================= NAVIGATION =================
function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item[data-page]");
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      showPage(page);
    });
  });
}

function showPage(pageName) {
  // Reload orders from localStorage to get latest data
  orders = JSON.parse(localStorage.getItem("orders")) || [];
  
  // Update nav
  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.remove("active");
    if (item.dataset.page === pageName) {
      item.classList.add("active");
    }
  });
  
  // Update pages
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });
  
  const pageElement = document.getElementById(pageName + "Page");
  if (pageElement) {
    pageElement.classList.add("active");
  }
  
  // Update title
  const titles = {
    dashboard: "Dashboard",
    products: "Products Management",
    categories: "Categories Management",
    orders: "Orders Management",
    customers: "Customers",
    inventory: "Inventory",
    settings: "Settings",
    analytics: "Analytics",
    preview: "Preview Site"
  };
  document.getElementById("pageTitle").innerText = titles[pageName] || pageName;
  
  // Load page data
  switch(pageName) {
    case "dashboard": loadDashboard(); break;
    case "products": loadProducts(); break;
    case "categories": loadCategories(); break;
    case "orders": loadOrders(); break;
    case "customers": loadCustomers(); break;
    case "inventory": loadInventory(); break;
    case "analytics": loadAnalytics(); break;
  }
  
  // Close mobile menu
  document.querySelector(".sidebar").classList.remove("active");
}

function toggleSidebar() {
  document.querySelector(".sidebar").classList.toggle("active");
}

function refreshPreview() {
  const iframe = document.getElementById("sitePreview");
  if (iframe) {
    iframe.src = iframe.src;
  }
}

// ================= DASHBOARD =================
function loadDashboard() {
  // Reload orders to get latest data from localStorage
  orders = JSON.parse(localStorage.getItem("orders")) || [];
  
  // Stats
  document.getElementById("totalProducts").innerText = Object.keys(products).length;
  document.getElementById("totalOrders").innerText = orders.length;
  document.getElementById("totalCustomers").innerText = [...new Set(orders.map(o => o.phone))].length;
  
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  document.getElementById("totalRevenue").innerText = Number.isInteger(totalRevenue) ? totalRevenue : totalRevenue.toFixed(3);
  
  // Visitors stats
  const visits = JSON.parse(localStorage.getItem("siteVisits")) || { total: 0, today: 0 };
  document.getElementById("totalVisitors").innerText = visits.today || 0;
  document.getElementById("totalAllVisitors").innerText = visits.total || 0;
  
  // Recent orders
  const recentOrdersEl = document.getElementById("recentOrders");
  if (orders.length === 0) {
    recentOrdersEl.innerHTML = '<p class="empty-state">لا توجد طلبات</p>';
  } else {
    const recent = orders.slice(-5).reverse();
    recentOrdersEl.innerHTML = recent.map(order => `
      <div class="order-card" style="padding: 15px; margin-bottom: 10px;">
        <div class="order-info">
          <h4>${order.customerName}</h4>
          <p>${order.items.length} منتجات - ${Number.isInteger(order.total) ? order.total : order.total.toFixed(3)} DT</p>
        </div>
        <span class="order-status order-${order.status}">${getStatusText(order.status)}</span>
      </div>
    `).join("");
  }
  
  // Low stock
  const lowStockEl = document.getElementById("lowStockProducts");
  const lowStock = Object.values(products).filter(p => p.stock <= 3);
  if (lowStock.length === 0) {
    lowStockEl.innerHTML = '<p class="empty-state">لا توجد منتجات منخفضة المخزون</p>';
  } else {
    lowStockEl.innerHTML = lowStock.map(p => `
      <div style="display: flex; justify-content: space-between; padding: 10px; background: rgba(255,184,77,0.1); border-radius: 8px; margin-bottom: 8px;">
        <span>${p.name}</span>
        <span style="color: var(--warning);">${p.stock} باقي</span>
      </div>
    `).join("");
  }
  
  // Update orders badge
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  document.getElementById("ordersBadge").innerText = pendingOrders;
}

function getStatusText(status) {
  const texts = {
    pending: "Pending",
    confirmed: "Confirmed",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled"
  };
  return texts[status] || status;
}

// ================= PRODUCTS =================
function loadProducts() {
  // Populate category filter
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.innerHTML = '<option value="all">All Categories</option>' + 
    Object.values(categories).map(c => `<option value="${c.id}">${c.nameEn || c.name}</option>`).join("");
  
  renderProductsTable(products);
}

function renderProductsTable(productsData) {
  const tbody = document.getElementById("productsTableBody");
  tbody.innerHTML = Object.values(productsData).map(p => `
    <tr>
      <td><img src="${p.img}" alt="${p.name}"></td>
      <td>${p.name}</td>
      <td>${Number.isInteger(p.price) ? p.price : p.price.toFixed(3)} DT</td>
      <td>
        <span class="stock-badge ${p.stock > 5 ? 'stock-ok' : p.stock > 0 ? 'stock-low' : 'stock-out'}">
          ${p.stock}
        </span>
      </td>
      <td>${getCategoryText(p.category)}</td>
      <td>
        <span class="status-badge ${p.active ? 'status-active' : 'status-inactive'}">
          ${p.active ? 'نشط' : 'غير نشط'}
        </span>
      </td>
      <td>
        <div class="action-btns">
          <button class="edit-btn" onclick="editProduct('${p.id}')">تعديل</button>
          <button class="delete-btn" onclick="deleteProduct('${p.id}')">حذف</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function getCategoryText(cat) {
  if (categories[cat]) {
    return categories[cat].nameEn || categories[cat].name || cat;
  }
  return cat;
}

// ================= CATEGORIES =================
function loadCategories() {
  renderCategoriesGrid();
}

function renderCategoriesGrid() {
  const grid = document.getElementById("categoriesGrid");
  const cats = Object.values(categories);
  
  if (cats.length === 0) {
    grid.innerHTML = '<p class="empty-state">لا توجد فئات</p>';
    return;
  }
  
  // Count products per category
  const catProductCount = {};
  Object.values(products).forEach(p => {
    if (p.category) {
      catProductCount[p.category] = (catProductCount[p.category] || 0) + 1;
    }
  });
  
  grid.innerHTML = cats.map(cat => `
    <div class="category-card">
      <div class="category-icon">${cat.icon || "📦"}</div>
      <div class="category-info">
        <h4>${cat.name}</h4>
        <p>${cat.nameEn}</p>
        <span class="category-count">${catProductCount[cat.id] || 0} products</span>
      </div>
      <div class="category-actions">
        <span class="status-badge ${cat.active ? 'status-active' : 'status-inactive'}">
          ${cat.active ? 'نشط' : 'غير نشط'}
        </span>
        <button class="edit-btn" onclick="openCategoryModal('${cat.id}')">تعديل</button>
        <button class="delete-btn" onclick="deleteCategory('${cat.id}')">حذف</button>
      </div>
    </div>
  `).join("");
}

function openCategoryModal(categoryId = null) {
  const modal = document.getElementById("categoryModal");
  const title = document.getElementById("categoryModalTitle");
  const form = document.getElementById("categoryForm");
  
  form.reset();
  
  if (categoryId) {
    const cat = categories[categoryId];
    title.innerText = "Edit Category";
    document.getElementById("categoryId").value = cat.id;
    document.getElementById("categoryNameAr").value = cat.name;
    document.getElementById("categoryNameEn").value = cat.nameEn || "";
    document.getElementById("categoryIcon").value = cat.icon || "📦";
    document.getElementById("categoryActive").checked = cat.active !== false;
  } else {
    title.innerText = "Add New Category";
    document.getElementById("categoryId").value = "";
    document.getElementById("categoryIcon").value = "📦";
    document.getElementById("categoryActive").checked = true;
  }
  
  modal.classList.add("active");
}

function closeCategoryModal() {
  document.getElementById("categoryModal").classList.remove("active");
}

function deleteCategory(categoryId) {
  const productCount = Object.values(products).filter(p => p.category === categoryId).length;
  
  if (productCount > 0) {
    alert(`Cannot delete! ${productCount} products are using this category.`);
    return;
  }
  
  if (confirm("Are you sure you want to delete this category?")) {
    delete categories[categoryId];
    saveCategories();
    loadCategories();
  }
}

document.getElementById("categoryForm").addEventListener("submit", (e) => {
  e.preventDefault();
  
  const categoryId = document.getElementById("categoryId").value;
  const name = document.getElementById("categoryNameAr").value.trim();
  const nameEn = document.getElementById("categoryNameEn").value.trim();
  const icon = document.getElementById("categoryIcon").value.trim() || "📦";
  const active = document.getElementById("categoryActive").checked;
  
  const id = categoryId || "cat_" + Date.now();
  
  categories[id] = {
    id: id,
    name: name,
    nameEn: nameEn,
    icon: icon,
    active: active
  };
  
  saveCategories();
  closeCategoryModal();
  loadCategories();
  alert("✅ Category saved successfully!");
});

function saveCategories() {
  localStorage.setItem("categories", JSON.stringify(categories));
}

function filterProducts() {
  const search = document.getElementById("productSearch").value.toLowerCase();
  const category = document.getElementById("categoryFilter").value;
  
  let filtered = Object.values(products);
  
  if (category !== "all") {
    filtered = filtered.filter(p => p.category === category);
  }
  
  if (search) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(search));
  }
  
  renderProductsTable(filtered);
}

function openProductModal(productId = null) {
  const modal = document.getElementById("productModal");
  const title = document.getElementById("productModalTitle");
  const form = document.getElementById("productForm");
  
  form.reset();
  
  // Populate category dropdown
  const categorySelect = document.getElementById("productCategory");
  categorySelect.innerHTML = Object.values(categories).map(c => 
    `<option value="${c.id}">${c.nameEn || c.name}</option>`
  ).join("");
  
  if (productId) {
    const product = products[productId];
    title.innerText = "Edit Product";
    document.getElementById("productId").value = product.id;
    document.getElementById("productName").value = product.name;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productStock").value = product.stock;
    document.getElementById("productCategory").value = product.category;
    document.getElementById("productImage").value = product.img || "";
    document.getElementById("productDesc").value = product.desc || "";
    document.getElementById("productSpecs").value = (product.specs || []).join(", ");
    document.getElementById("productActive").checked = product.active !== false;
  } else {
    title.innerText = "Add New Product";
    document.getElementById("productId").value = "";
    document.getElementById("productImage").value = "images/";
    document.getElementById("productActive").checked = true;
  }
  
  modal.classList.add("active");
}

function closeProductModal() {
  document.getElementById("productModal").classList.remove("active");
}

function editProduct(id) {
  openProductModal(id);
}

function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    delete products[id];
    saveProducts();
    loadProducts();
    loadDashboard();
  }
}

document.getElementById("productForm").addEventListener("submit", (e) => {
  e.preventDefault();
  
  const productId = document.getElementById("productId").value;
  const specs = document.getElementById("productSpecs").value.split(",").map(s => s.trim()).filter(s => s);
  
  let id;
  if (productId) {
    // Edit existing product
    id = productId;
  } else {
    // Add new product - generate unique ID
    id = "prod_" + Date.now();
  }
  
  products[id] = {
    id: id,
    name: document.getElementById("productName").value,
    price: parseFloat(document.getElementById("productPrice").value),
    stock: parseInt(document.getElementById("productStock").value),
    category: document.getElementById("productCategory").value,
    img: document.getElementById("productImage").value || "images/logo.jpg",
    desc: document.getElementById("productDesc").value,
    specs: specs,
    active: document.getElementById("productActive").checked
  };
  
  saveProducts();
  closeProductModal();
  loadProducts();
  loadDashboard();
  alert("✅ Product saved successfully!");
});

// ================= ORDERS =================
function loadOrders() {
  renderOrdersList(orders);
}

function renderOrdersList(ordersData) {
  const container = document.getElementById("ordersList");
  
  if (ordersData.length === 0) {
    container.innerHTML = '<p class="empty-state">لا توجد طلبات</p>';
    return;
  }
  
  container.innerHTML = ordersData.reverse().map(order => `
    <div class="order-card">
      <div class="order-info">
        <h4>${order.customerName}</h4>
        <p>📞 ${order.phone} | 📍 ${order.city}</p>
        <p>📅 ${new Date(order.date).toLocaleDateString('en-US')}</p>
      </div>
      <div>
        <p class="order-total">${Number.isInteger(order.total) ? order.total : order.total.toFixed(3)} DT</p>
      </div>
      <select class="status-select" onchange="updateOrderStatus('${order.id}', this.value)">
        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
        <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>تم التأكيد</option>
        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>تم الشحن</option>
        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>تم التسليم</option>
        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>ملغى</option>
      </select>
      <button class="btn-small btn-secondary" onclick="viewOrderDetail('${order.id}')">عرض</button>
    </div>
  `).join("");
}

function filterOrders() {
  const search = document.getElementById("orderSearch").value.toLowerCase();
  const status = document.getElementById("orderStatusFilter").value;
  
  let filtered = orders;
  
  if (status !== "all") {
    filtered = filtered.filter(o => o.status === status);
  }
  
  if (search) {
    filtered = filtered.filter(o => 
      o.customerName.toLowerCase().includes(search) || 
      o.phone.includes(search)
    );
  }
  
  renderOrdersList(filtered);
}

function updateOrderStatus(orderId, newStatus) {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    order.lastUpdated = new Date().toISOString();
    
    // Sync to Firebase - ALL admins will see this update instantly!
    if (typeof OrderSync !== 'undefined') {
      OrderSync.update(orderId, { status: newStatus, lastUpdated: order.lastUpdated });
    }
    
    loadDashboard();
  }
}

function viewOrderDetail(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  const modal = document.getElementById("orderModal");
  const details = document.getElementById("orderDetails");
  
  details.innerHTML = `
    <div style="padding: 25px;">
      <div style="margin-bottom: 20px;">
        <h4 style="color: var(--primary);">معلومات العميل</h4>
        <p>الاسم: ${order.customerName}</p>
        <p>الهاتف: ${order.phone}</p>
        <p>الإيميل: ${order.email}</p>
        <p>المدينة: ${order.city}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h4 style="color: var(--primary);">المنتجات</h4>
        ${order.items.map(item => `
          <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--darker); border-radius: 8px; margin-bottom: 8px;">
            <span>${item.name} × ${item.qty}</span>
            <span style="color: var(--primary);">${Number.isInteger(item.price * item.qty) ? (item.price * item.qty) : (item.price * item.qty).toFixed(3)} DT</span>
          </div>
        `).join("")}
      </div>
      
      <div style="text-align: left; font-size: 20px; font-weight: bold;">
        الإجمالي: ${Number.isInteger(order.total) ? order.total : order.total.toFixed(3)} DT
      </div>
      
      <div style="margin-top: 20px;">
        <h4 style="color: var(--primary);">الحالة</h4>
        <select onchange="updateOrderStatus('${order.id}', this.value)" style="width: 100%; padding: 12px; border-radius: 8px; background: var(--darker); color: var(--light); border: 2px solid var(--border);">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
          <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>تم التأكيد</option>
          <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>تم الشحن</option>
          <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>تم التسليم</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>ملغى</option>
        </select>
      </div>
    </div>
  `;
  
  modal.classList.add("active");
}

function closeOrderModal() {
  document.getElementById("orderModal").classList.remove("active");
}

function restartOrders() {
  if (confirm("⚠️ Restart all orders? This will clear all orders for testing purposes!")) {
    orders = [];
    localStorage.setItem("orders", JSON.stringify(orders));
    loadOrders();
    loadDashboard();
    loadAnalytics();
    alert("✅ All orders have been cleared!");
  }
}

// ================= CUSTOMERS =================
function loadCustomers() {
  const customersGrid = document.getElementById("customersGrid");
  
  // Get unique customers from orders
  const customerMap = {};
  orders.forEach(order => {
    if (!customerMap[order.phone]) {
      customerMap[order.phone] = {
        name: order.customerName,
        phone: order.phone,
        email: order.email,
        city: order.city,
        orders: [],
        totalSpent: 0
      };
    }
    customerMap[order.phone].orders.push(order.id);
    customerMap[order.phone].totalSpent += order.total;
  });
  
  const customersList = Object.values(customerMap);
  
  if (customersList.length === 0) {
    customersGrid.innerHTML = '<p class="empty-state">لا يوجد عملاء</p>';
    return;
  }
  
  customersGrid.innerHTML = customersList.map(c => `
    <div class="customer-card">
      <h4>${c.name}</h4>
      <p>📞 ${c.phone}</p>
      <p>📧 ${c.email || 'Not available'}</p>
      <p>📍 ${c.city}</p>
      <p>🛒 ${c.orders.length} طلبات</p>
      <p style="color: var(--primary); font-weight: bold;">💰 ${Number.isInteger(c.totalSpent) ? c.totalSpent : c.totalSpent.toFixed(3)} DT</p>
    </div>
  `).join("");
}

// ================= INVENTORY =================
function loadInventory() {
  const productsList = Object.values(products);
  
  // Stats
  document.getElementById("inStockCount").innerText = productsList.filter(p => p.stock > 5).length;
  document.getElementById("lowStockCount").innerText = productsList.filter(p => p.stock > 0 && p.stock <= 5).length;
  document.getElementById("outOfStockCount").innerText = productsList.filter(p => p.stock === 0).length;
  
  // Table
  const tbody = document.getElementById("inventoryTableBody");
  tbody.innerHTML = productsList.map(p => `
    <tr>
      <td>${p.name}</td>
      <td>
        <span class="stock-badge ${p.stock > 5 ? 'stock-ok' : p.stock > 0 ? 'stock-low' : 'stock-out'}">
          ${p.stock}
        </span>
      </td>
      <td>${p.stock > 5 ? 'متوفر' : p.stock > 0 ? 'منخفض' : 'نفد'}</td>
      <td>
        <div style="display: flex; gap: 5px;">
          <button class="btn-small btn-secondary" onclick="updateStock('${p.id}', -1)">-</button>
          <span style="padding: 8px 15px;">${p.stock}</span>
          <button class="btn-small btn-primary" onclick="updateStock('${p.id}', 1)">+</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function updateStock(productId, change) {
  if (products[productId]) {
    products[productId].stock = Math.max(0, products[productId].stock + change);
    saveProducts();
    loadInventory();
    loadDashboard();
  }
}

// ================= SETTINGS =================
function initForms() {
  // Store Settings
  document.getElementById("storeSettingsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    settings.storeName = document.getElementById("storeName").value;
    settings.storePhone = document.getElementById("storePhone").value;
    settings.storeWhatsapp = document.getElementById("storeWhatsapp").value;
    settings.storeInstagram = document.getElementById("storeInstagram").value;
    saveSettings();
    alert("Settings saved successfully!");
  });
  
  // Admin Settings
  document.getElementById("adminSettingsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const newUsername = document.getElementById("newUsername").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    if (newUsername) admin.username = newUsername;
    if (newPassword) admin.password = newPassword;
    
    localStorage.setItem("admin", JSON.stringify(admin));
    alert("Account updated successfully!");
    document.getElementById("adminSettingsForm").reset();
  });
  
  // Site Settings
  document.getElementById("siteSettingsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    settings.currency = document.getElementById("currency").value;
    settings.defaultLang = document.getElementById("defaultLang").value;
    settings.enableMusic = document.getElementById("enableMusic").checked;
    saveSettings();
    alert("Settings saved successfully!");
  });
  
  // Load current settings
  document.getElementById("storeName").value = settings.storeName;
  document.getElementById("storePhone").value = settings.storePhone;
  document.getElementById("storeWhatsapp").value = settings.storeWhatsapp;
  document.getElementById("storeInstagram").value = settings.storeInstagram;
  document.getElementById("currency").value = settings.currency;
  document.getElementById("defaultLang").value = settings.defaultLang;
  document.getElementById("enableMusic").checked = settings.enableMusic;
}

function resetAllData() {
  if (confirm("⚠️ Are you sure you want to delete all data? This action cannot be undone!")) {
    if (confirm("Final confirmation: All products and orders will be deleted!")) {
      localStorage.clear();
      products = DEFAULT_PRODUCTS;
      orders = [];
      admin = DEFAULT_ADMIN;
      settings = DEFAULT_SETTINGS;
      saveProducts();
      localStorage.setItem("orders", JSON.stringify(orders));
      localStorage.setItem("admin", JSON.stringify(admin));
      localStorage.setItem("settings", JSON.stringify(settings));
      location.reload();
    }
  }
}

function exportData() {
  const data = {
    products,
    orders,
    customers,
    admin,
    settings,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vibe-market-backup-" + new Date().toISOString().split("T")[0] + ".json";
  a.click();
  URL.revokeObjectURL(url);
}

function importData() {
  document.getElementById("importFile").click();
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.products) {
        products = data.products;
        saveProducts();
      }
      if (data.orders) {
        orders = data.orders;
        localStorage.setItem("orders", JSON.stringify(orders));
      }
      if (data.settings) {
        settings = data.settings;
        saveSettings();
      }
      alert("تم استيراد البيانات بنجاح!");
      location.reload();
    } catch (err) {
      alert("خطأ في استيراد البيانات!");
    }
  };
  reader.readAsText(file);
}

// ================= ANALYTICS =================
function loadAnalytics() {
  // Reload orders from localStorage to ensure we have latest data
  orders = JSON.parse(localStorage.getItem("orders")) || [];
  
  try {
    // Calculate stats
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const uniqueCustomers = orders.length > 0 ? [...new Set(orders.map(o => o.phone))].length : 0;
    const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    document.getElementById("analyticsRevenue").innerText = Number.isInteger(totalRevenue) ? totalRevenue : totalRevenue.toFixed(3);
    document.getElementById("analyticsOrders").innerText = totalOrders;
    document.getElementById("analyticsCustomers").innerText = uniqueCustomers;
    document.getElementById("analyticsAvgOrder").innerText = Number.isInteger(avgOrder) ? avgOrder : avgOrder.toFixed(3);
  } catch(e) {
    console.error("Analytics stats error:", e);
  }
  
  // Top Products
  try {
    const productSales = {};
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const itemName = item.name || 'Unknown Product';
          if (!productSales[itemName]) {
            productSales[itemName] = { qty: 0, revenue: 0 };
          }
          productSales[itemName].qty += (item.qty || 1);
          productSales[itemName].revenue += (item.price || 0) * (item.qty || 1);
        });
      }
    });
    
    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 5);
    
    document.getElementById("topProducts").innerHTML = topProducts.length > 0 ?
      topProducts.map(([name, data], i) => `
        <div class="analytics-item">
          <div class="analytics-item-rank">${i + 1}</div>
          <div class="analytics-item-info">
            <span class="analytics-item-name">${name}</span>
            <span class="analytics-item-stats">${data.qty} مبيع | ${Number.isInteger(data.revenue) ? data.revenue : data.revenue.toFixed(3)} DT</span>
          </div>
        </div>
      `).join("") : '<p class="empty-state">لا توجد بيانات</p>';
  } catch(e) {
    console.error("Top products error:", e);
    document.getElementById("topProducts").innerHTML = '<p class="empty-state">خطأ في التحميل</p>';
  }
  
  // Category Distribution
  try {
    const categoryCount = {};
    Object.values(products).forEach(p => {
      if (p && p.category) {
        if (!categoryCount[p.category]) categoryCount[p.category] = 0;
        categoryCount[p.category]++;
      }
    });
    
    document.getElementById("categoryDistribution").innerHTML = Object.keys(categoryCount).length > 0 ?
      Object.entries(categoryCount).map(([cat, count]) => `
        <div class="analytics-item">
          <span>${getCategoryText(cat)}</span>
          <span style="color: var(--primary); font-weight: bold;">${count} منتج</span>
        </div>
      `).join("") : '<p class="empty-state">لا توجد منتجات</p>';
  } catch(e) {
    console.error("Category distribution error:", e);
    document.getElementById("categoryDistribution").innerHTML = '<p class="empty-state">خطأ في التحميل</p>';
  }
  
  // Order Stats
  try {
    const orderStats = {};
    orders.forEach(o => {
      const status = o.status || 'pending';
      if (!orderStats[status]) orderStats[status] = 0;
      orderStats[status]++;
    });
    
    const statusColors = {
      pending: 'var(--warning)',
      confirmed: 'var(--primary)',
      shipped: 'var(--secondary)',
      delivered: 'var(--success)',
      cancelled: 'var(--danger)'
    };
    
    document.getElementById("orderStats").innerHTML = Object.keys(orderStats).length > 0 ?
      Object.entries(orderStats).map(([status, count]) => `
        <div class="analytics-item">
          <span style="color: ${statusColors[status] || 'var(--light)'}">${getStatusText(status)}</span>
          <span style="font-weight: bold;">${count}</span>
        </div>
      `).join("") : '<p class="empty-state">لا توجد طلبات</p>';
  } catch(e) {
    console.error("Order stats error:", e);
    document.getElementById("orderStats").innerHTML = '<p class="empty-state">خطأ في التحميل</p>';
  }
  
  // Category Revenue
  try {
    const categoryRevenue = {};
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const cat = item.category || 'other';
          if (!categoryRevenue[cat]) categoryRevenue[cat] = 0;
          categoryRevenue[cat] += (item.price || 0) * (item.qty || 1);
        });
      }
    });
    
    const categoryNames = { audio: "صوتيات", led: "إضاءة LED", accessories: "إكسسوارات", other: "أخرى" };
    document.getElementById("categoryRevenue").innerHTML = Object.keys(categoryRevenue).length > 0 ?
      Object.entries(categoryRevenue).map(([cat, revenue]) => `
        <div class="analytics-item">
          <span>${categoryNames[cat] || cat}</span>
          <span style="color: var(--primary); font-weight: bold;">${Number.isInteger(revenue) ? revenue : revenue.toFixed(3)} DT</span>
        </div>
      `).join("") : '<p class="empty-state">لا توجد بيانات</p>';
  } catch(e) {
    console.error("Category revenue error:", e);
    document.getElementById("categoryRevenue").innerHTML = '<p class="empty-state">خطأ في التحميل</p>';
  }
  
  // Daily Sales Chart (last 7 days)
  try {
    const now = new Date();
    const dailySales = [];
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dailySales.push({
        date: date,
        key: date.toISOString().split("T")[0],
        total: 0,
        orders: 0
      });
    }
    
    // Aggregate orders
    orders.forEach(order => {
      if (order && order.date) {
        const orderDate = new Date(order.date);
        const orderKey = orderDate.toISOString().split("T")[0];
        
        // Find matching day
        const dayData = dailySales.find(d => d.key === orderKey);
        if (dayData) {
          dayData.total += (order.total || 0);
          dayData.orders += 1;
        }
      }
    });
    
    const maxSale = Math.max(...dailySales.map(d => d.total), 1);
    const chartContainer = document.getElementById("dailySalesChart");
    
    if (chartContainer) {
      if (dailySales.every(d => d.total === 0)) {
        chartContainer.innerHTML = '<p class="empty-state">لا توجد مبيعات فيآخر 7 أيام</p>';
      } else {
        chartContainer.innerHTML = dailySales.map(data => {
          const percentage = Math.round((data.total / maxSale) * 100);
          const saleDisplay = Number.isInteger(data.total) ? data.total : data.total.toFixed(3);
          const dayName = data.date.toLocaleDateString('ar-SA', { weekday: 'short' });
          const orderCount = data.orders > 0 ? `<br><span style="font-size:10px;color:var(--light-dim)">(${data.orders} طلب)</span>` : '';
          return `
            <div class="chart-bar-wrapper">
              <div class="chart-bar-value">${saleDisplay} DT${orderCount}</div>
              <div class="chart-bar" style="width: ${percentage}%;">
                <span class="chart-bar-percent">${percentage}%</span>
              </div>
              <div class="chart-bar-label">${dayName}</div>
            </div>
          `;
        }).join("");
      }
    }
  } catch(e) {
    console.error("Daily sales chart error:", e);
    const chartContainer = document.getElementById("dailySalesChart");
    if (chartContainer) chartContainer.innerHTML = '<p class="empty-state">خطأ في التحميل</p>';
  }
}

// ================= HELPERS =================
function saveProducts() {
  localStorage.setItem("products", JSON.stringify(products));
}

function saveSettings() {
  localStorage.setItem("settings", JSON.stringify(settings));
}

// Close modals on outside click
window.onclick = function(event) {
  if (event.target.classList.contains("modal")) {
    event.target.classList.remove("active");
  }
};
