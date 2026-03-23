import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, ShoppingCart, Users, Settings, Eye, LogOut, Package, DollarSign, TrendingUp, Trash2, Download, Shield, Key, User, AlertTriangle } from "lucide-react";
import { useStore, PRODUCTS } from "@/lib/store";
import { toast } from "sonner";

type Page = "dashboard" | "orders" | "customers" | "settings" | "analytics";

const AdminPage = () => {
  const navigate = useNavigate();
  const { orders, updateOrderStatus, deleteOrder, clearAllOrders, isAdminLoggedIn, adminLogin, adminLogout, adminCredentials, updateAdminCredentials } = useStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [page, setPage] = useState<Page>("dashboard");

  // Settings form state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(username, password)) {
      toast.success("Welcome back, admin! 🎉");
    } else {
      toast.error("Invalid credentials");
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate("/");
    toast.success("Logged out successfully");
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold">VIBE <span className="text-gradient">MARKET</span></h1>
            <p className="text-muted-foreground text-sm mt-1">Admin Panel</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4 bg-card border border-border rounded-2xl p-6">
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary" />
            <button type="submit" className="w-full py-3 rounded-xl bg-gradient text-primary-foreground font-bold text-sm shadow-glow">Login</button>
            <p className="text-xs text-muted-foreground text-center">Default: admin / admin123</p>
          </form>
          <Link to="/" className="block text-center text-sm text-muted-foreground mt-4 hover:text-foreground">← Back to Site</Link>
        </motion.div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const uniqueCustomers = new Set(orders.map(o => o.phone)).size;
  const productsList = Object.values(PRODUCTS);

  const navItems: { id: Page; icon: React.ReactNode; label: string }[] = [
    { id: "dashboard", icon: <BarChart3 className="w-4 h-4" />, label: "Dashboard" },
    { id: "orders", icon: <ShoppingCart className="w-4 h-4" />, label: "Orders" },
    { id: "customers", icon: <Users className="w-4 h-4" />, label: "Customers" },
    { id: "analytics", icon: <TrendingUp className="w-4 h-4" />, label: "Analytics" },
    { id: "settings", icon: <Settings className="w-4 h-4" />, label: "Settings" },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500",
    confirmed: "bg-blue-500",
    shipped: "bg-purple-500",
    delivered: "bg-accent",
    cancelled: "bg-destructive",
  };

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayOrders = orders.filter(o => o.date.startsWith(dateStr));
    return { day: d.toLocaleDateString("en", { weekday: "short" }), revenue: dayOrders.reduce((s, o) => s + o.total, 0) };
  });
  const maxRevenue = Math.max(...last7Days.map(d => d.revenue), 1);

  // Settings handlers
  const handleUpdateUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) { toast.error("Username cannot be empty"); return; }
    if (newUsername.length < 3) { toast.error("Username must be at least 3 characters"); return; }
    updateAdminCredentials({ username: newUsername.trim() });
    setNewUsername("");
    toast.success("Username updated successfully! ✅");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPassword !== adminCredentials.password) { toast.error("Current password is incorrect"); return; }
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords don't match"); return; }
    updateAdminCredentials({ password: newPassword });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password updated successfully! 🔒");
  };

  const handleExportOrders = () => {
    if (orders.length === 0) { toast.error("No orders to export"); return; }
    const csv = [
      "ID,Customer,Phone,Email,City,Status,Total,Date,Items",
      ...orders.map(o =>
        `${o.id},"${o.customerName}",${o.phone},${o.email},"${o.city}",${o.status},${o.total.toFixed(2)},${o.date},"${o.items.map(i => `${i.product.name}x${i.quantity}`).join('; ')}"`
      )
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vibe-orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Orders exported! 📥");
  };

  const handleClearAllOrders = () => {
    clearAllOrders();
    setShowDeleteConfirm(false);
    toast.success("All orders cleared! 🗑️");
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 bg-card border-r border-border flex-col">
        <div className="p-5 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <img src="/images/logo.jpg" alt="Logo" className="w-8 h-8 rounded-full" />
            <span className="font-display font-bold text-gradient">VIBE ADMIN</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                page === item.id ? "bg-gradient text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.icon} {item.label}
              {item.id === "orders" && orders.length > 0 && (
                <span className="ml-auto bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full font-bold">{orders.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
            <Eye className="w-4 h-4" /> View Site
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <header className="sticky top-0 z-10 glass border-b border-border px-6 py-4 flex items-center justify-between">
          <h1 className="font-display font-bold text-lg capitalize">{page}</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" /> {adminCredentials.username}</span>
            <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</span>
          </div>
        </header>

        <div className="p-6">
          {/* Dashboard */}
          {page === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: <Package className="w-5 h-5" />, value: productsList.length, label: "Products" },
                  { icon: <ShoppingCart className="w-5 h-5" />, value: orders.length, label: "Orders" },
                  { icon: <Users className="w-5 h-5" />, value: uniqueCustomers, label: "Customers" },
                  { icon: <DollarSign className="w-5 h-5" />, value: `${totalRevenue.toFixed(0)} DT`, label: "Revenue" },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border rounded-xl p-5"
                  >
                    <div className="flex items-center gap-3 mb-2 text-primary">{stat.icon}</div>
                    <p className="text-2xl font-bold font-display">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-display font-bold mb-4">Recent Orders</h3>
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders yet</p>
                ) : (
                  <div className="space-y-2">
                    {orders.slice(0, 5).map(o => (
                      <div key={o.id} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                        <div>
                          <p className="text-sm font-semibold">{o.customerName}</p>
                          <p className="text-xs text-muted-foreground">{new Date(o.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gradient">{o.total.toFixed(2)} DT</p>
                          <span className={`${statusColors[o.status]} text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold`}>{o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders */}
          {page === "orders" && (
            <div className="space-y-3">
              {orders.length > 0 && (
                <div className="flex justify-end gap-2 mb-4">
                  <button onClick={handleExportOrders} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-sm font-medium hover:bg-muted/80 transition-colors">
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                </div>
              )}
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">No orders yet</p>
              ) : (
                orders.map(o => (
                  <div key={o.id} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{o.customerName}</p>
                        <p className="text-xs text-muted-foreground">📞 {o.phone} • 📧 {o.email} • 📍 {o.city}</p>
                        <p className="text-xs text-muted-foreground">📅 {new Date(o.date).toLocaleString()}</p>
                      </div>
                      <span className={`${statusColors[o.status]} text-primary-foreground text-xs px-3 py-1 rounded-full font-bold`}>{o.status}</span>
                    </div>
                    <div className="space-y-1 mb-3">
                      {o.items.map(item => (
                        <p key={item.product.id} className="text-xs text-muted-foreground">
                          • {item.product.name} x{item.quantity} — {(item.product.price * item.quantity).toFixed(2)} DT
                        </p>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gradient text-lg">{o.total.toFixed(2)} DT</p>
                      <div className="flex items-center gap-2">
                        <select
                          value={o.status}
                          onChange={e => updateOrderStatus(o.id, e.target.value as any)}
                          className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                        >
                          {["pending", "confirmed", "shipped", "delivered", "cancelled"].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <button onClick={() => deleteOrder(o.id)} className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Customers */}
          {page === "customers" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground col-span-full text-center py-10">No customers yet</p>
              ) : (
                Array.from(new Map(orders.map(o => [o.phone, o])).values()).map(o => (
                  <div key={o.phone} className="bg-card border border-border rounded-xl p-5">
                    <p className="font-semibold">{o.customerName}</p>
                    <p className="text-xs text-muted-foreground mt-1">📞 {o.phone}</p>
                    <p className="text-xs text-muted-foreground">📧 {o.email}</p>
                    <p className="text-xs text-muted-foreground">📍 {o.city}</p>
                    <p className="text-sm font-bold text-gradient mt-2">
                      {orders.filter(x => x.phone === o.phone).length} orders
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Analytics */}
          {page === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Revenue", value: `${totalRevenue.toFixed(0)} DT` },
                  { label: "Orders", value: orders.length },
                  { label: "Customers", value: uniqueCustomers },
                  { label: "Avg Order", value: orders.length ? `${(totalRevenue / orders.length).toFixed(0)} DT` : "0 DT" },
                ].map((s, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5">
                    <p className="text-2xl font-bold font-display">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-display font-bold mb-4">📈 Daily Sales (Last 7 Days)</h3>
                <div className="flex items-end gap-2 h-40">
                  {last7Days.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">{d.revenue > 0 ? `${d.revenue.toFixed(0)}` : ""}</span>
                      <div className="w-full bg-gradient rounded-t-md transition-all" style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 4)}%` }} />
                      <span className="text-[10px] text-muted-foreground">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-display font-bold mb-3">📋 Order Status</h3>
                  <div className="space-y-2">
                    {Object.entries(statusCounts).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${statusColors[status]}`} />
                          <span className="text-sm capitalize">{status}</span>
                        </div>
                        <span className="text-sm font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-display font-bold mb-3">🏆 Products</h3>
                  <div className="space-y-2">
                    {productsList.slice(0, 5).map(p => (
                      <div key={p.id} className="flex items-center justify-between">
                        <span className="text-sm truncate max-w-[180px]">{p.name}</span>
                        <span className="text-sm font-bold text-gradient">{p.price} DT</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {page === "settings" && (
            <div className="max-w-2xl space-y-6">
              {/* Change Username */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-soft flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold">Change Username</h3>
                    <p className="text-xs text-muted-foreground">Current: <span className="text-foreground font-medium">{adminCredentials.username}</span></p>
                  </div>
                </div>
                <form onSubmit={handleUpdateUsername} className="space-y-3">
                  <input
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    placeholder="New username (min 3 characters)"
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-gradient text-primary-foreground font-bold text-sm shadow-glow hover:shadow-glow-strong transition-shadow">
                    Update Username
                  </button>
                </form>
              </motion.div>

              {/* Change Password */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-soft flex items-center justify-center">
                    <Key className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold">Change Password</h3>
                    <p className="text-xs text-muted-foreground">Update your admin password</p>
                  </div>
                </div>
                <form onSubmit={handleUpdatePassword} className="space-y-3">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 characters)"
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-gradient text-primary-foreground font-bold text-sm shadow-glow hover:shadow-glow-strong transition-shadow">
                    Update Password
                  </button>
                </form>
              </motion.div>

              {/* Data Management */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-soft flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold">Data Management</h3>
                    <p className="text-xs text-muted-foreground">Export or clear your store data</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleExportOrders}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-muted border border-border text-sm font-medium hover:bg-muted/80 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Export Orders as CSV ({orders.length} orders)
                  </button>

                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Clear All Orders
                    </button>
                  ) : (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-bold">Are you sure? This cannot be undone.</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleClearAllOrders}
                          className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-bold text-sm"
                        >
                          Yes, Delete All
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 py-2.5 rounded-xl bg-muted text-foreground font-medium text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Session Info */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-display font-bold mb-4">Session Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Logged in as</span>
                    <span className="font-medium">{adminCredentials.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Orders</span>
                    <span className="font-medium">{orders.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Revenue</span>
                    <span className="font-medium text-gradient">{totalRevenue.toFixed(2)} DT</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </motion.div>
            </div>
          )}
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-border flex justify-around py-2 z-40">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] ${
                page === item.id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default AdminPage;
