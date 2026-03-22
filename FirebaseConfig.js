<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js"></script>

<script>
// ================= FIREBASE SYNC SERVICE =================
const firebaseConfig = {
  apiKey: "AIzaSyCCLnaJMtWiU9j6P7NDFxi3LzPLicZKg",
  authDomain: "orders-system-4ac29.firebaseapp.com",
  projectId: "orders-system-4ac29",
  storageBucket: "orders-system-4ac29.firebasestorage.app",
  messagingSenderId: "1032273437960",
  appId: "1:1032273437960:web:0fd1e5ea15801bc80af8bd",
  measurementId: "G-RB1ME8L8WQ"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const OrderSync = {
  subscribe(callback) {
    const ordersRef = db.ref('orders');
    ordersRef.on('value', (snapshot) => {
      const orders = [];
      snapshot.forEach(child => {
        orders.push({ id: child.key, ...child.val() });
      });
      orders.sort((a, b) => new Date(b.date) - new Date(a.date));
      callback(orders);
    });
  },

  async create(orderData) {
    const ordersRef = db.ref('orders');
    const newOrderRef = ordersRef.push();
    const order = { ...orderData, id: newOrderRef.key, createdAt: Date.now() };
    await newOrderRef.set(order);
    return order;
  },

  async update(orderId, updates) {
    await db.ref(`orders/${orderId}`).update({ ...updates, updatedAt: Date.now() });
  },

  async delete(orderId) {
    await db.ref(`orders/${orderId}`).remove();
  },

  async getAll() {
    const snapshot = await db.ref('orders').once('value');
    const orders = [];
    snapshot.forEach(child => orders.push({ id: child.key, ...child.val() }));
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    return orders;
  }
};

console.log('Firebase Sync Ready!');
</script>