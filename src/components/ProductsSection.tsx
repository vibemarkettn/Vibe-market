import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingCart, Search, X } from "lucide-react";
import { PRODUCTS, CATEGORIES, useStore } from "@/lib/store";
import { toast } from "sonner";

const ProductsSection = () => {
  const { addToCart, lang } = useStore();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const products = Object.values(PRODUCTS).filter(p => {
    if (!p.active) return false;
    if (category !== "all" && p.category !== category) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <section id="products" className="py-20 px-4">
      <div className="container mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-display font-bold text-center mb-10 text-gradient"
        >
          {lang === "ar" ? "منتجاتنا" : "Our Products"}
        </motion.h2>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === "ar" ? "ابحث عن منتج..." : "Search products..."}
            className="w-full pl-10 pr-10 py-3 rounded-full border-2 border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex justify-center gap-2 flex-wrap mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                category === cat.id
                  ? "bg-gradient border-transparent text-primary-foreground shadow-glow"
                  : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"
              }`}
            >
              {cat.icon} {lang === "ar" ? cat.name : cat.nameEn}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all hover:shadow-[0_10px_40px_rgba(0,0,0,0.3)] relative"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              {p.stock <= 3 && (
                <span className="absolute top-3 left-3 z-10 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded animate-pulse">
                  LOW STOCK
                </span>
              )}
              <Link to={`/product/${p.id}`}>
                <div className="overflow-hidden">
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/product/${p.id}`}>
                  <h4 className="text-sm font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">{p.name}</h4>
                </Link>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gradient">{p.price} DT</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { addToCart(p); toast.success(`${p.name} added to cart!`); }}
                    className="w-10 h-10 rounded-full bg-gradient text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
