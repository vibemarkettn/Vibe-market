import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Menu, X, Globe } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toggleCart, cartCount, lang, toggleLang, isAdminLoggedIn, adminLogout } = useStore();
  const count = cartCount();

  const links = [
    { to: "/", label: lang === "ar" ? "الرئيسية" : "Home" },
    { to: "/Vibe-market/#products", label: lang === "ar" ? "المنتجات" : "Products" },
    { to: "/Vibe-market/#faq", label: lang === "ar" ? "الأسئلة" : "FAQ" },
    { to: "/Vibe-market/#contact", label: lang === "ar" ? "تواصل" : "Contact" },
    { to: "/Vibe-market/#track", label: lang === "ar" ? "تتبع" : "Track" },
  ];

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border"
    >
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src="/Vibe-market/images/logo.jpg" alt="Vibe Market" className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30" />
          <span className="font-display text-xl font-bold text-gradient">VIBE MARKET</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <a
              key={l.to}
              href={l.to}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient group-hover:w-full transition-all duration-300" />
            </a>
          ))}
          {isAdminLoggedIn && (
            <Link
              to="/admin"
              className="text-sm font-medium text-primary hover:text-foreground transition-colors relative group"
            >
              ⚙️ Admin
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient group-hover:w-full transition-all duration-300" />
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={toggleLang} className="bg-gradient text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full hover:shadow-glow transition-all">
            {lang === "en" ? "AR" : "EN"}
          </button>
          <button onClick={toggleCart} className="relative p-2 rounded-full hover:bg-muted transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </button>
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass border-t border-border p-4 flex flex-col gap-3"
        >
          {links.map(l => (
            <a key={l.to} href={l.to} onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground py-2">
              {l.label}
            </a>
          ))}
          {isAdminLoggedIn && (
            <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-primary hover:text-foreground py-2">
              ⚙️ Admin
            </Link>
          )}
        </motion.nav>
      )}
    </motion.header>
  );
};

export default Navbar;
