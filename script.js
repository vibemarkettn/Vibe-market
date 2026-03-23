// ================= DATA =================
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

const DEFAULT_USERS = [
  { username: "admin", password: "admin123", isAdmin: true },
  { username: "test", password: "test123", isAdmin: false }
];

const DEFAULT_CATEGORIES = {
  audio: { id: "audio", name: "صوتيات", nameEn: "Audio", icon: "🎧", active: true },
  led: { id: "led", name: "إضاءة LED", nameEn: "LED", icon: "💡", active: true },
  accessories: { id: "accessories", name: "إكسسوارات", nameEn: "Accessories", icon: "⌚", active: true }
};

let categories = JSON.parse(localStorage.getItem("categories")) || DEFAULT_CATEGORIES;

let products = JSON.parse(localStorage.getItem("products")) || DEFAULT_PRODUCTS;
let users = JSON.parse(localStorage.getItem("users")) || DEFAULT_USERS;
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentCategory = "all";
let searchQuery = "";

// ================= VISITORS TRACKING =================
function trackVisit() {
  // Check if tracking from admin panel - don't count admin visits as visitors
  if (location.pathname.includes("admin")) return;
  
  // Check if already counted this session (prevent refresh counting)
  const sessionKey = 'visit_' + new Date().toISOString().split('T')[0];
  if (sessionStorage.getItem(sessionKey)) return;
  sessionStorage.setItem(sessionKey, 'true');
  
  const visits = JSON.parse(localStorage.getItem("siteVisits")) || { total: 0, today: 0, lastDate: null, history: [] };
  const today = new Date().toISOString().split("T")[0];
  
  visits.total += 1;
  
  if (visits.lastDate !== today) {
    visits.today = 1;
    visits.lastDate = today;
  } else {
    visits.today += 1;
  }
  
  visits.history.push({ date: new Date().toISOString(), page: location.pathname });
  
  // Keep only last 100 entries
  if (visits.history.length > 100) {
    visits.history = visits.history.slice(-100);
  }
  
  localStorage.setItem("siteVisits", JSON.stringify(visits));
}

function getVisits() {
  return JSON.parse(localStorage.getItem("siteVisits")) || { total: 0, today: 0, lastVisit: null };
}

// Reset session tracking (call this when user makes a purchase or returns after long time)
function resetSessionVisit() {
  const today = new Date().toISOString().split('T')[0];
  sessionStorage.removeItem('visit_' + today);
}

// ================= INITIALIZATION =================
document.addEventListener("DOMContentLoaded", () => {
  trackVisit();
  initNavbar();
  initMusic();
  initScrollTop();
  initLang();
  loadProducts();
  loadCart();
  initUserAuth();
  
  // Initialize on product page
  if (location.pathname.includes("product")) {
    loadProductPage();
  }
});

// ================= USER AUTH =================
function initUserAuth() {
  updateUserUI();
  initUserOrdersListener();
}

function updateUserUI() {
  const userLink = document.getElementById("userLink");
  const userLinkContainer = document.getElementById("userLinkContainer");
  
  if (currentUser) {
    if (userLinkContainer) {
      let html = `<button class="nav-link" onclick="logoutUser()" style="background: none; border: none; cursor: pointer; color: var(--light);">🚪 ${currentUser.username}</button>`;
      if (currentUser.isAdmin) {
        html = `<a href="admin.html" class="nav-link user-admin-link" style="color: var(--primary);">⚙️ Admin</a>` + html;
      }
      userLinkContainer.innerHTML = html;
    }
  } else {
    if (userLinkContainer) {
      userLinkContainer.innerHTML = `
        <button class="nav-link" onclick="showLoginModal()" style="background: none; border: none; cursor: pointer;">👤 Login</button>
      `;
    }
  }
}

// ================= USER ORDERS (Real-time) =================
var userOrdersUnsubscribe = null;

function initUserOrdersListener() {
  // Show/hide My Orders section based on login
  var myOrdersSection = document.getElementById('myorders');
  var myOrdersLink = document.getElementById('myOrdersLink');
  
  if (currentUser && !currentUser.isAdmin) {
    if (myOrdersSection) myOrdersSection.style.display = 'block';
    if (myOrdersLink) myOrdersLink.style.display = 'inline-block';
    setupUserOrdersListener();
  } else {
    if (myOrdersSection) myOrdersSection.style.display = 'none';
    if (myOrdersLink) myOrdersLink.style.display = 'none';
    if (userOrdersUnsubscribe) {
      userOrdersUnsubscribe();
      userOrdersUnsubscribe = null;
    }
  }
}

function setupUserOrdersListener() {
  if (!db || !currentUser) return;
  
  // Use createdBy field - real-time listener for user's orders only
  var username = currentUser.username;
  
  // Clean up previous listener
  if (userOrdersUnsubscribe) {
    userOrdersUnsubscribe();
  }
  
  // Real-time listener - ONLY fetches user's orders by username
  userOrdersUnsubscribe = db.collection('orders').where('createdBy', '==', username).onSnapshot(function(snapshot) {
    var orders = [];
    snapshot.forEach(function(doc) {
      var d = doc.data();
      var order = { id: doc.id };
      for (var key in d) order[key] = d[key];
      orders.push(order);
    });
    
    // Sort by date
    orders.sort(function(a, b) {
      return new Date(b.date || 0) - new Date(a.date || 0);
    });
    
    renderUserOrders(orders);
    console.log('My Orders synced:', orders.length);
  }, function(error) {
    console.error('Error fetching user orders:', error);
  });
}

function renderUserOrders(orders) {
  var container = document.getElementById('myOrdersList');
  if (!container) return;
  
  if (orders.length === 0) {
    container.innerHTML = '<p class="empty-state">No orders yet</p>';
    return;
  }
  
  var statusLabels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };
  
  var statusColors = {
    pending: '#f39c12',
    confirmed: '#3498db',
    shipped: '#9b59b6',
    delivered: '#27ae60',
    cancelled: '#e74c3c'
  };
  
  var html = '';
  orders.forEach(function(order) {
    var total = Number.isInteger(order.total) ? order.total : (order.total || 0).toFixed(3);
    var dateStr = order.date ? new Date(order.date).toLocaleDateString() : '-';
    var statusColor = statusColors[order.status] || '#95a5a6';
    
    html += '<div style="background:var(--darker);border-radius:8px;padding:15px;margin-bottom:15px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
      '<strong>' + (order.customerName || 'Order') + '</strong>' +
      '<span style="background:' + statusColor + ';padding:5px 10px;border-radius:5px;font-size:12px;">' + 
      (statusLabels[order.status] || order.status) + '</span></div>' +
      '<p style="color:var(--light-dim);font-size:14px;">📅 ' + dateStr + ' | 📦 ' + 
      (order.items ? order.items.length : 0) + ' items</p>' +
      '<p style="color:var(--primary);font-size:18px;font-weight:bold;">Total: ' + total + ' DT</p></div>';
  });
  
  container.innerHTML = html;
}

function showLoginModal() {
  const modal = document.getElementById("loginModal") || createLoginModal();
  modal.classList.add("active");
}

function createLoginModal() {
  const modal = document.createElement("div");
  modal.id = "loginModal";
  modal.className = "login-modal";
  modal.innerHTML = `
    <div class="login-modal-content">
      <span class="close-login" onclick="closeLoginModal()">✖</span>
      <h3>تسجيل الدخول</h3>
      <form id="loginForm" onsubmit="handleUserLogin(event)">
        <input type="text" id="loginUsername" placeholder="اسم المستخدم" required>
        <input type="password" id="loginPassword" placeholder="كلمة المرور" required>
        <button type="submit" class="checkout-btn">دخول</button>
      </form>
      <p style="margin-top: 15px; font-size: 12px; color: var(--light-dim);">
      </p>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

function closeLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.classList.remove("active");
}

function handleUserLogin(e) {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    closeLoginModal();
    updateUserUI();
    showToast(`مرحباً ${user.username}!`, "success");
  } else {
    showToast("اسم المستخدم أو كلمة المرور غير صحيحة", "error");
  }
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  updateUserUI();
  showToast("تم تسجيل الخروج", "success");
}

// ================= NAVBAR =================
function initNavbar() {
  window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }
  });
}

function toggleMobileMenu() {
  const nav = document.querySelector(".nav");
  nav.classList.toggle("active");
}

// ================= MUSIC =================
function initMusic() {
  const music = document.getElementById("bgMusic");
  const toggleBtn = document.getElementById("musicToggle");
  if (!music || !toggleBtn) return;
  
  music.volume = 0.3;
  music.muted = false;
  
  // Try to autoplay
  music.play().catch(() => {
    document.addEventListener('click', () => {
      music.muted = false;
      music.play().catch(() => {});
    }, { once: true });
  });
  
  toggleBtn.textContent = "🔊";
  
  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (music.paused) {
      music.muted = false;
      music.play();
      toggleBtn.textContent = "🔊";
    } else {
      music.pause();
      toggleBtn.textContent = "🔇";
    }
  });
}

// ================= SCROLL TOP =================
function initScrollTop() {
  window.addEventListener('scroll', () => {
    const scrollBtn = document.querySelector('.scroll-top');
    if (scrollBtn) {
      if (window.scrollY > 300) {
        scrollBtn.classList.add('visible');
      } else {
        scrollBtn.classList.remove('visible');
      }
    }
  });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================= PRODUCTS =================
function loadProducts() {
  const container = document.getElementById("productsContainer");
  if (!container) return;
  
  renderCategories();
  filterProducts();
}

function renderProducts(filteredProducts = products) {
  const container = document.getElementById("productsContainer");
  if (!container) return;
  
  if (Object.keys(filteredProducts).length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <h3>🔍 لم يتم العثور على منتجات</h3>
        <p>جرب البحث بكلمات أخرى أو اختر فئة مختلفة</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = Object.values(filteredProducts).map((p, index) => `
    <div class="product-card animate-fade" style="animation-delay: ${index * 0.1}s" onclick="goProduct('${p.id}')">
      ${p.stock <= 3 ? '<span class="stock-warning">Low Stock!</span>' : ''}
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      <h4>${p.name}</h4>
      <p class="price">${Number.isInteger(p.price) ? p.price : p.price.toFixed(3)} DT</p>
      <button class="add-to-cart" onclick="event.stopPropagation(); quickAddToCart('${p.id}')">➕</button>
    </div>
  `).join("");
}

function filterProducts() {
  let filtered = Object.values(products).filter(p => p.active !== false);
  
  if (currentCategory !== "all") {
    filtered = filtered.filter(p => p.category === currentCategory);
  }
  
  if (searchQuery) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchQuery) || 
      (p.desc && p.desc.toLowerCase().includes(searchQuery))
    );
  }
  
  renderProducts(filtered);
}

function renderCategories() {
  const container = document.getElementById("categoryContainer");
  if (!container) return;
  
  const productCategories = [...new Set(Object.values(products).map(p => p.category).filter(Boolean))];
  const activeCategories = productCategories.filter(cat => categories[cat] && categories[cat].active !== false);
  
  let html = `
    <button class="category-btn ${currentCategory === 'all' ? 'active' : ''}" onclick="selectCategory('all')">
      <span>🏠</span>
      <span>الكل</span>
    </button>
  `;
  
  activeCategories.forEach(cat => {
    const c = categories[cat];
    html += `
      <button class="category-btn ${currentCategory === cat ? 'active' : ''}" onclick="selectCategory('${cat}')">
        <span>${c?.icon || '📦'}</span>
        <span>${c?.name || cat}</span>
      </button>
    `;
  });

  container.innerHTML = html;
}

function selectCategory(categoryId) {
  currentCategory = categoryId;
  renderCategories();
  filterProducts();
}

// Search
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase();
    filterProducts();
  });
  
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Escape") {
      clearSearch();
    }
  });
}

function clearSearch() {
  searchInput.value = "";
  searchQuery = "";
  filterProducts();
}

// ================= CART =================
function loadCart() {
  updateCartUI();
}

function updateCartUI() {
  const countEl = document.getElementById("cartCount");
  const totalEl = document.getElementById("cartTotal");
  const itemsEl = document.getElementById("cartItems");
  
  // Always save to localStorage first, even if DOM elements don't exist
  if (cart.length === 0) {
    localStorage.removeItem("cart");
  } else {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  
  if (!countEl || !totalEl || !itemsEl) return;
  
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + (i.price * i.qty), 0);
  
  countEl.textContent = count;
  totalEl.textContent = Number.isInteger(total) ? total : total.toFixed(3);
  
  if (cart.length === 0) {
    itemsEl.innerHTML = "<li style='text-align:center;padding:20px;color:var(--light-dim)'>Cart is empty 🛒</li>";
    itemsEl.parentElement.parentElement.classList.add('cart-empty');
  } else {
    itemsEl.parentElement.parentElement.classList.remove('cart-empty');
    itemsEl.innerHTML = cart.map((item, i) => `
      <li>
        <div class="item-info">
          <strong>${item.name}</strong>
        </div>
        <div class="item-qty">
          <button onclick="changeQty(${i}, -1)">➖</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${i}, 1)">➕</button>
        </div>
        <span class="item-price">${Number.isInteger(item.price * item.qty) ? (item.price * item.qty) : (item.price * item.qty).toFixed(3)} DT</span>
        <button class="remove-btn" onclick="removeFromCart(${i})">✕</button>
      </li>
    `).join("");
  }
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty < 1) {
    cart.splice(index, 1);
  }
  updateCartUI();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
  if (cart.length === 0) {
    showToast("🛒 Cart emptied!", "success");
  } else {
    showToast("✅ Product removed from cart", "success");
  }
}

function quickAddToCart(productId) {
  const product = products[productId];
  if (!product) return;
  
  const found = cart.find(i => i.id === productId);
  if (found) {
    found.qty++;
  } else {
    cart.push({...product, qty: 1});
  }
  
  updateCartUI();
  showToast("✅ تم إضافة المنتج للسلة!", "success");
}

function addToCartQty() {
  const id = new URLSearchParams(location.search).get("id");
  if (!products[id]) return;
  
  const qty = parseInt(document.getElementById("qty")?.textContent) || 1;
  const found = cart.find(i => i.id === id);
  
  if (found) {
    found.qty += qty;
  } else {
    cart.push({...products[id], qty});
  }
  
  updateCartUI();
  showToast("✅ تم إضافة المنتج للسلة!", "success");
}

let qty = 1;
function changeQtyProduct(v) {
  qty += v;
  if (qty < 1) qty = 1;
  const qtyEl = document.getElementById("qty");
  if (qtyEl) qtyEl.textContent = qty;
}

function clearCart() {
  cart = [];
  updateCartUI();
  showToast("🛒 Cart cleared completely!", "success");
}

// ================= MODALS =================
function toggleCart() {
  const modal = document.getElementById("cartModal");
  modal.classList.toggle("active");
}

function toggleCheckout() {
  const modal = document.getElementById("checkoutModal");
  modal.classList.toggle("active");
}

function handleCheckout() {
  if (cart.length === 0) {
    showToast("السلة فارغة", "error");
    return;
  }
  toggleCart();
  setTimeout(toggleCheckout, 300);
}

// ================= CHECKOUT =================
const checkoutForm = document.getElementById("checkoutForm");
if (checkoutForm) {
  checkoutForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
    showToast("Cart is empty", "error");
    return;
  }
  const firstName = document.getElementById("cFirstName").value.trim();
  const lastName  = document.getElementById("cLastName").value.trim();
  const phone     = document.getElementById("cPhone").value.trim();
  const email     = document.getElementById("cEmail").value.trim();
  const city      = document.getElementById("cCountry").value.trim();

    if(!firstName || !lastName || !phone || !email || !city){
      showToast("Please fill in all fields", "error");
      return;
    }
    
    let total = cart.reduce((s, i) => s + (i.price * i.qty), 0);
    
    // Save order to admin panel
    const order = {
      id: "order_" + Date.now(),
      customerName: firstName + " " + lastName,
      phone: phone,
      email: email,
      city: city,
      items: cart.map(item => ({...item})),
      total: total,
      status: "pending",
      date: new Date().toISOString()
    };
    
    // Save to localStorage for fallback
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));
    
    // Sync to Firebase - ALL admins will see this order instantly!
    if (typeof OrderSync !== 'undefined') {
      try {
        await OrderSync.create({
          customerName: firstName + " " + lastName,
          phone: phone,
          email: email,
          city: city,
          items: cart.map(item => ({...item})),
          total: total,
          status: "pending",
          date: new Date().toISOString(),
          userId: phone, // Store phone as userId for filtering
          createdBy: currentUser ? currentUser.username : 'guest'
        });
        console.log('Order synced to Firebase!');
      } catch(e) {
        console.log('Firebase sync failed, using localStorage:', e);
      }
    }
    
    // Clear cart
    cart = [];
    localStorage.removeItem("cart");
    updateCartUI();
    checkoutForm.reset();
    toggleCheckout();
    showToast("✅ Order placed successfully! We'll contact you soon.", "success");
  });
}

// ================= PRODUCT PAGE =================
function loadProductPage() {
  const id = new URLSearchParams(location.search).get("id");
  if (!products[id]) return;
  
  const p = products[id];
  
  const mainImage = document.getElementById("mainImage");
  const pName = document.getElementById("pName");
  const pPrice = document.getElementById("pPrice");
  const pDesc = document.getElementById("pDesc");
  const pStock = document.getElementById("pStock");
  const pSpecsContainer = document.getElementById("pSpecsContainer");
  const pSpecs = document.getElementById("pSpecs");
  
  if (mainImage) mainImage.src = p.img;
  if (pName) pName.textContent = p.name;
  if (pPrice) pPrice.textContent = Number.isInteger(p.price) ? p.price : p.price.toFixed(3);
  if (pDesc) pDesc.textContent = p.desc || "";
  if (pStock) pStock.textContent = p.stock > 0 ? "✔ متوفر" : "❌ نفد";
  
  if (p.specs && pSpecs && pSpecsContainer) {
    pSpecsContainer.style.display = "block";
    pSpecs.innerHTML = p.specs.map(s => `<li>${s}</li>`).join('');
  }
}

function goProduct(id) {
  location.href = "product.html?id=" + id;
}

function goHome() {
  location.href = "index.html";
}

// ================= LANGUAGE =================
let lang = "en";

function initLang() {
  const elements = document.querySelectorAll('[data-ar]');
  const langBtn = document.querySelector('.lang-btn');
  
  if (lang === "en") {
    langBtn.textContent = "AR";
    document.documentElement.lang = "en";
    elements.forEach(el => {
      if (el.dataset.en) el.textContent = el.dataset.en;
    });
  }
}

function toggleLang() {
  const elements = document.querySelectorAll('[data-ar]');
  const langBtn = document.querySelector('.lang-btn');
  
  if (lang === "en") {
    lang = "ar";
    langBtn.textContent = "EN";
    document.documentElement.lang = "ar";
    elements.forEach(el => {
      if (el.dataset.ar) el.textContent = el.dataset.ar;
    });
  } else {
    lang = "en";
    langBtn.textContent = "AR";
    document.documentElement.lang = "en";
    elements.forEach(el => {
      if (el.dataset.en) el.textContent = el.dataset.en;
    });
  }
}

// ================= FAQ =================
function toggleFaq(element) {
  const faqItem = element.parentElement;
  faqItem.classList.toggle('active');
}

// ================= TOAST =================
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === "success" ? "✅" : "❌"}</span>
    <p>${message}</p>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ================= ORDER TRACKING =================
function trackOrder() {
  var phone = document.getElementById("trackPhone").value.trim();
  var resultDiv = document.getElementById("trackingResult");
  
  if (!phone) {
    showToast("Please enter your phone number", "error");
    return;
  }
  
  // Use Firestore for tracking
  if (db) {
    resultDiv.innerHTML = '<p style="text-align:center;color:var(--light-dim);">Searching...</p>';
    
    db.collection('orders').where('phone', '==', phone).get().then(function(snapshot) {
      var userOrders = [];
      snapshot.forEach(function(doc) {
        var d = doc.data();
        var order = { id: doc.id };
        for (var key in d) order[key] = d[key];
        userOrders.push(order);
      });
      
      if (userOrders.length === 0) {
        resultDiv.innerHTML = '<p class="no-orders">No orders found with this phone number</p>';
        return;
      }
      
      // Sort by date, newest first
      userOrders.sort(function(a, b) {
        return new Date(b.date || 0) - new Date(a.date || 0);
      });
      
      renderTrackingResult(userOrders, resultDiv);
    }).catch(function(e) {
      console.error('Error tracking order:', e);
      resultDiv.innerHTML = '<p class="no-orders">Error searching orders</p>';
    });
  } else {
    // Fallback to localStorage
    var orders = JSON.parse(localStorage.getItem("orders")) || [];
    var userOrders = orders.filter(function(o) { return o.phone === phone; });
    
    if (userOrders.length === 0) {
      resultDiv.innerHTML = '<p class="no-orders">No orders found with this phone number</p>';
      return;
    }
    
    userOrders.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    renderTrackingResult(userOrders, resultDiv);
  }
}

function renderTrackingResult(orders, resultDiv) {
  var statusIcons = {
    pending: "⏳",
    confirmed: "✓",
    shipped: "🚚",
    delivered: "✅",
    cancelled: "❌"
  };
  
  var statusLabels = {
    pending: "Pending",
    confirmed: "Confirmed",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled"
  };
  
  var html = '<div class="orders-list">';
  orders.forEach(function(order) {
    var total = Number.isInteger(order.total) ? order.total : (order.total || 0).toFixed(3);
    var dateStr = order.date ? new Date(order.date).toLocaleDateString() : '-';
    
    html += '<div class="order-card">' +
      '<div class="order-header">' +
      '<span class="order-id">#' + (order.id.slice ? order.id.slice(-6) : order.id) + '</span>' +
      '<span class="order-date">' + dateStr + '</span></div>' +
      '<div class="order-status status-' + order.status + '">' +
      '<span class="status-icon">' + (statusIcons[order.status] || "⏳") + '</span>' +
      '<span class="status-text">' + (statusLabels[order.status] || order.status) + '</span></div>' +
      '<div class="order-items">';
    
    if (order.items) {
      order.items.forEach(function(item) {
        var itemTotal = Number.isInteger(item.price * item.qty) ? (item.price * item.qty) : (item.price * item.qty).toFixed(3);
        html += '<div class="order-item"><span>' + (item.name || 'Product') + ' x' + item.qty + '</span>' +
          '<span>' + itemTotal + ' DT</span></div>';
      });
    }
    
    html += '</div><div class="order-total"><span>Total:</span><span>' + total + ' DT</span></div></div>';
  });
  
  html += '</div>';
  resultDiv.innerHTML = html;
}
          <div class="order-items">
            ${order.items.map(item => `
              <div class="order-item">
                <span>${item.name} x${item.qty}</span>
                <span>${Number.isInteger(item.price * item.qty) ? item.price * item.qty : (item.price * item.qty).toFixed(3)} DT</span>
              </div>
            `).join('')}
          </div>
          <div class="order-total">
            <span>Total:</span>
            <span>${Number.isInteger(order.total) ? order.total : order.total.toFixed(3)} DT</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ================= INIT =================
function initLazyLoading() {
  const images = document.querySelectorAll("img[loading='lazy']");
  images.forEach(img => {
    img.style.opacity = "0";
    img.style.transition = "opacity 0.5s ease";
    img.onload = () => img.style.opacity = "1";
    if (img.complete) img.style.opacity = "1";
  });
}

// Initialize
initLazyLoading();
