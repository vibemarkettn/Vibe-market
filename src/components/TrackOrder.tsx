import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { Search } from "lucide-react";

const TrackOrder = () => {
  const { lang, orders } = useStore();
  const [phone, setPhone] = useState("");
  const [results, setResults] = useState<typeof orders | null>(null);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500",
    confirmed: "bg-blue-500",
    shipped: "bg-purple-500",
    delivered: "bg-accent",
    cancelled: "bg-destructive",
  };

  const handleTrack = () => {
    const found = orders.filter(o => o.phone === phone);
    setResults(found);
  };

  return (
    <section id="track" className="py-20 px-4 bg-card/50">
      <div className="container mx-auto max-w-xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-display font-bold text-center mb-10 text-gradient"
        >
          {lang === "ar" ? "تتبع طلبك" : "Track Your Order"}
        </motion.h2>

        <div className="flex gap-2 mb-6">
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder={lang === "ar" ? "أدخل رقم هاتفك" : "Enter your phone number"}
            className="flex-1 px-4 py-3 rounded-xl bg-card border-2 border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleTrack}
            className="px-6 py-3 bg-gradient text-primary-foreground rounded-xl font-bold text-sm"
          >
            <Search className="w-4 h-4" />
          </motion.button>
        </div>

        {results !== null && (
          <div className="space-y-3">
            {results.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm">
                {lang === "ar" ? "لم يتم العثور على طلبات" : "No orders found"}
              </p>
            ) : (
              results.map(order => (
                <div key={order.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{order.customerName}</span>
                    <span className={`${statusColors[order.status] || "bg-muted"} text-primary-foreground text-xs px-3 py-1 rounded-full font-bold`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    📅 {new Date(order.date).toLocaleDateString()} • 📦 {order.items.length} items
                  </p>
                  <p className="text-lg font-bold text-gradient mt-1">{order.total.toFixed(2)} DT</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrackOrder;
