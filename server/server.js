// ================= VIBE MARKET REAL-TIME SERVER =================
// This server provides real-time data synchronization for all admins
// Uses Socket.IO for instant updates across all connected clients

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for testing
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors());
app.use(express.json());

// ================= IN-MEMORY DATABASE =================
// In production, replace this with MongoDB, MySQL, or Firebase
// This serves as a shared data store for ALL admins
let db = {
  orders: [],
  products: {},
  categories: {},
  settings: {},
  users: [
    { id: "admin", username: "admin", password: "admin123", role: "admin" }
  ]
};

// ================= API ROUTES =================

// Get all orders
app.get('/api/orders', (req, res) => {
  res.json(db.orders);
});

// Get all products
app.get('/api/products', (req, res) => {
  res.json(db.products);
});

// Get all categories
app.get('/api/categories', (req, res) => {
  res.json(db.categories);
});

// Create new order
app.post('/api/orders', (req, res) => {
  const { customerName, phone, email, city, items, total } = req.body;
  
  const order = {
    id: "order_" + Date.now(),
    customerName,
    phone,
    email,
    city,
    items,
    total,
    status: "pending",
    date: new Date().toISOString()
  };
  
  db.orders.push(order);
  
  // Broadcast to ALL connected admins - NEW ORDER
  io.emit('order:created', order);
  
  res.json({ success: true, order });
});

// Update order status
app.put('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const orderIndex = db.orders.findIndex(o => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: "Order not found" });
  }
  
  db.orders[orderIndex] = { ...db.orders[orderIndex], ...updates };
  
  // Broadcast to ALL connected admins - ORDER UPDATED
  io.emit('order:updated', db.orders[orderIndex]);
  
  res.json({ success: true, order: db.orders[orderIndex] });
});

// Delete order
app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  
  const orderIndex = db.orders.findIndex(o => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: "Order not found" });
  }
  
  const deleted = db.orders.splice(orderIndex, 1)[0];
  
  // Broadcast to ALL connected admins - ORDER DELETED
  io.emit('order:deleted', { id });
  
  res.json({ success: true });
});

// Update product
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  db.products[id] = { ...db.products[id], ...updates };
  
  // Broadcast to ALL connected admins
  io.emit('product:updated', { id, product: db.products[id] });
  
  res.json({ success: true, product: db.products[id] });
});

// Update category
app.put('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  db.categories[id] = { ...db.categories[id], ...updates };
  
  io.emit('category:updated', { id, category: db.categories[id] });
  
  res.json({ success: true, category: db.categories[id] });
});

// ================= WEBSOCKET CONNECTION =================
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send current data immediately on connection
  socket.emit('init:data', {
    orders: db.orders,
    products: db.products,
    categories: db.categories
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║   Vibe Market Real-Time Server                  ║
║   Running on http://localhost:${PORT}             ║
║                                                   ║
║   Socket.IO enabled for real-time sync          ║
║   All admins will see the same data!             ║
╚═══════════════════════════════════════════════════╝
  `);
});

// ================= HOW TO USE WITH YOUR FRONTEND =================
/*
1. Run this server: npm start

2. In your client (website), add Socket.IO client:
   <script src="/socket.io/socket.io.js"></script>
   <script>
     const socket = io('http://localhost:3000');
     
     // Listen for new orders (from other admins)
     socket.on('order:created', (order) => {
       console.log('New order received:', order);
       // Update your orders UI instantly
     });
     
     socket.on('order:updated', (order) => {
       console.log('Order updated:', order);
     });
     
     socket.on('order:deleted', ({ id }) => {
       console.log('Order deleted:', id);
     });
     
     // Fetch initial data
     fetch('/api/orders').then(r => r.json()).then(orders => {
       // Render orders
     });
   </script>

3. To create an order from website:
   fetch('/api/orders', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       customerName: "John",
       phone: "12345678",
       items: [...],
       total: 150
     })
   })
   
   -> ALL admins will get the order instantly!

4. For production:
   - Replace in-memory db with MongoDB/MySQL
   - Add authentication
   - Use SSL/HTTPS
*/