// ================= FIREBASE SYNC SERVICE =================
// Vibe Market - Real-time data synchronization

// Firebase config - UPDATE THIS WITH YOUR CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCCLnaJMtWiU9j6P7NDFxi3LzPLicZKg",
  authDomain: "orders-system-4ac29.firebaseapp.com",
  projectId: "orders-system-4ac29",
  storageBucket: "orders-system-4ac29.firebasestorage.app",
  messagingSenderId: "1032273437960",
  appId: "1:1032273437960:web:0fd1e5ea15801bc80af8bd",
  measurementId: "G-RB1ME8L8WQ"
};

// Script dynamically loaded Firebase functions
let db = null;
let initialized = false;

// Initialize Firebase and get database reference
async function initFirebase() {
  if (initialized) return;
  
  // Dynamically import Firebase modules
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
  const { getDatabase, ref, set, push, update, remove, onValue, get, query, orderByChild } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js');
  
  initializeApp(firebaseConfig);
  db = { getDatabase, ref, set, push, update, remove, onValue, get, query, orderByChild };
  initialized = true;
  
  console.log('Firebase initialized!');
  return db;
}

// ================= ORDER SYNC SERVICE =================
const OrderSync = {
  // Initialize the service
  async init() {
    await initFirebase();
    return this;
  },

  // Subscribe to real-time order updates
  subscribe(callback) {
    if (!db) {
      console.warn('Firebase not initialized, initializing now...');
      initFirebase().then(() => this.subscribe(callback));
      return;
    }
    
    const { ref, onValue, query, orderByChild } = db;
    const ordersRef = query(ref(await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js').then(m => m.getDatabase()), 'orders'), orderByChild('date'));
    
    onValue(ordersRef, (snapshot) => {
      const orders = [];
      snapshot.forEach(child => {
        orders.push({ id: child.key, ...child.val() });
      });
      // Sort by date - newest first
      orders.sort((a, b) => new Date(b.date) - new Date(a.date));
      callback(orders);
    });
  },

  // Create new order (works on website)
  async create(orderData) {
    await initFirebase();
    const { ref, push, set } = db;
    
    const ordersRef = ref(await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js').then(m => m.getDatabase()), 'orders');
    const newOrderRef = push(ordersRef);
    
    const order = {
      ...orderData,
      id: newOrderRef.key,
      createdAt: Date.now()
    };
    
    await set(newOrderRef, order);
    console.log('Order created:', order.id);
    return order;
  },

  // Update order status (works on admin)
  async update(orderId, updates) {
    await initFirebase();
    const { ref, update } = db;
    
    const orderRef = ref(await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js').then(m => m.getDatabase()), `orders/${orderId}`);
    
    await update(orderRef, {
      ...updates,
      updatedAt: Date.now()
    });
    console.log('Order updated:', orderId);
  },

  // Delete order
  async delete(orderId) {
    await initFirebase();
    const { ref, remove } = db;
    
    const orderRef = ref(await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js').then(m => m.getDatabase()), `orders/${orderId}`);
    await remove(orderRef);
    console.log('Order deleted:', orderId);
  },

  // Get all orders (one-time fetch)
  async getAll() {
    await initFirebase();
    const { ref, get } = db;
    
    const snapshot = await get(ref(await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js').then(m => m.getDatabase()), 'orders'));
    const orders = [];
    snapshot.forEach(child => {
      orders.push({ id: child.key, ...child.val() });
    });
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    return orders;
  }
};

// ================= PRODUCT SYNC SERVICE =================
const ProductSync = {
  async init() {
    await initFirebase();
    return this;
  },

  subscribe(callback) {
    if (!db) {
      initFirebase().then(() => this.subscribe(callback));
      return;
    }
    
    const { ref, onValue } = db;
    onValue(ref(await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js').then(m => m.getDatabase()), 'products'), (snapshot) => {
      const products = {};
      snapshot.forEach(child => {
        products[child.key] = child.val();
      });
      callback(products);
    });
  },

  async update(productId, updates) {
    await initFirebase();
    const { ref, update } = db;
    await update(ref(await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js').then(m => m.getDatabase()), `products/${productId}`), updates);
  }
};

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Only init in browser environment
  if (typeof window !== 'undefined') {
    console.log('Initializing Firebase sync...');
  }
});

// Export for global use
window.OrderSync = OrderSync;
window.ProductSync = ProductSync;