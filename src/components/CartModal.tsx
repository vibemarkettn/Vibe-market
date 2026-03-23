import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { toast } from "sonner";

const CartModal = () => {
  const { isCartOpen, setCartOpen, cart, removeFromCart, updateQuantity, clearCart, cartTotal, addOrder } = useStore();
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", city: "" });

  const total = cartTotal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const order = {
      id: crypto.randomUUID(),
      customerName: `${form.firstName} ${form.lastName}`,
      ...form,
      items: cart,
      total,
      status: "pending" as const,
      date: new Date().toISOString(),
    };

    addOrder(order);
    clearCart();
    setCheckout(false);
    setCartOpen(false);
    setForm({ firstName: "", lastName: "", phone: "", email: "", city: "" });
    toast.success("Order placed successfully! 🎉");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setCartOpen(false); setCheckout(false); }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-display font-bold text-lg">
                {checkout ? "📝 Checkout" : "🛒 Cart"}
              </h3>
              <button onClick={() => { setCartOpen(false); setCheckout(false); }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {!checkout ? (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center text-sm mt-10">Cart is empty</p>
                  ) : (
                    cart.map(item => (
                      <div key={item.product.id} className="flex gap-3 bg-muted/50 rounded-xl p-3">
                        <img src={item.product.img} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold truncate">{item.product.name}</h4>
                          <p className="text-sm text-gradient font-bold">{item.product.price} DT</p>
                          <div className="flex items-center gap-2 mt-1">
                            <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.product.id)} className="text-destructive self-start">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-5 border-t border-border space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Total</span>
                    <span className="text-xl font-bold text-gradient">{total.toFixed(2)} DT</span>
                  </div>
                  {cart.length > 0 && (
                    <>
                      <button onClick={clearCart} className="w-full py-2.5 rounded-xl bg-destructive/10 text-destructive font-semibold text-sm hover:bg-destructive/20 transition-colors">
                        🗑️ Empty Cart
                      </button>
                      <button onClick={() => setCheckout(true)} className="w-full py-3 rounded-xl bg-gradient text-primary-foreground font-bold text-sm shadow-glow hover:shadow-glow-strong transition-shadow">
                        Checkout
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
                {["firstName", "lastName", "phone", "email", "city"].map(field => (
                  <input
                    key={field}
                    required
                    value={form[field as keyof typeof form]}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                    placeholder={field === "firstName" ? "First Name" : field === "lastName" ? "Last Name" : field === "phone" ? "Phone Number" : field === "email" ? "Email" : "City"}
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                ))}
                <div className="pt-2 space-y-2">
                  <button onClick={() => setCheckout(false)} type="button" className="w-full py-2.5 rounded-xl border border-border text-muted-foreground font-semibold text-sm hover:bg-muted transition-colors">
                    ← Back to Cart
                  </button>
                  <button type="submit" className="w-full py-3 rounded-xl bg-gradient text-primary-foreground font-bold text-sm shadow-glow hover:shadow-glow-strong transition-shadow">
                    ✅ Confirm Purchase
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartModal;
