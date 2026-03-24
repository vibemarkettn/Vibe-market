import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Minus, Plus, ShoppingCart, Check } from "lucide-react";
import { PRODUCTS, useStore } from "@/lib/store";
import Navbar from "@/components/Navbar";
import CartModal from "@/components/CartModal";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const ProductPage = () => {
  const { id } = useParams();
  const product = id ? PRODUCTS[id] : null;
  const [qty, setQty] = useState(1);
  const { addToCart, lang } = useStore();

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Product not found</p>
        </div>
      </>
    );
  }

  const handleAdd = () => {
    addToCart(product, qty);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <>
      <Navbar />
      <CartModal />
      <section className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <Link to="/Vibe-market/#products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> {lang === "ar" ? "العودة" : "Back to products"}
          </Link>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <img
                src={product.img}
                alt={product.name}
                className="w-full max-h-[420px] object-cover rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <h1 className="text-2xl md:text-3xl font-display font-bold">{product.name}</h1>
              <p className="text-3xl font-extrabold text-gradient">{product.price} DT</p>
              <p className="text-muted-foreground text-sm leading-relaxed">{product.desc}</p>

              <p className={`text-sm font-semibold ${product.stock > 0 ? "text-accent" : "text-destructive"}`}>
                {product.stock > 0 ? `✔ ${lang === "ar" ? "متوفر" : "In stock"} (${product.stock})` : `❌ ${lang === "ar" ? "نفد" : "Out of stock"}`}
              </p>

              {product.specs.length > 0 && (
                <div className="bg-muted/50 rounded-xl p-5 border border-border">
                  <h4 className="text-sm font-bold text-primary mb-3">{lang === "ar" ? "المواصفات" : "Specifications"}</h4>
                  <ul className="space-y-2">
                    {product.specs.map((s, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 rounded-full bg-gradient text-primary-foreground flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  <span className="text-xl font-bold w-8 text-center">{qty}</span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQty(qty + 1)}
                    className="w-10 h-10 rounded-full bg-gradient text-primary-foreground flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAdd}
                  className="flex-1 py-3.5 rounded-full bg-gradient text-primary-foreground font-bold text-sm shadow-glow hover:shadow-glow-strong transition-shadow flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" /> {lang === "ar" ? "إضافة للسلة" : "Add to Cart"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default ProductPage;
