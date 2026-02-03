const fs = require("fs");
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const ordersFile = "./orders.json";

// إضافة طلب
app.post("/order", (req, res) => {
  const order = req.body;
  try {
    let orders = [];
    if (fs.existsSync(ordersFile)) {
      const data = fs.readFileSync(ordersFile, "utf-8");
      orders = JSON.parse(data || "[]");
    }
    orders.push(order);
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
    console.log("طلب جديد:", order);
    res.json({ message: "تم تسجيل الطلب ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "هناك خطأ حاول مرة أخرى" });
  }
});

// جلب الطلبات للـ Admin
app.get("/admin-orders", (req, res) => {
  try {
    let orders = [];
    if (fs.existsSync(ordersFile)) {
      const data = fs.readFileSync(ordersFile, "utf-8");
      orders = JSON.parse(data || "[]");
    }
    res.json(orders);
  } catch (err) {
    console.error("فشل في جلب الطلبات:", err);
    res.status(500).json({ error: "فشل في جلب الطلبات" });
  }
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
