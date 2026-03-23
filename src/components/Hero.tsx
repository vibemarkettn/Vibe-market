import { motion } from "framer-motion";
import { useStore } from "@/lib/store";

const Hero = () => {
  const { lang } = useStore();

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden px-4 pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-48 h-48 md:w-56 md:h-56 mx-auto mb-8 rounded-full bg-gradient p-1.5 shadow-glow-strong"
        >
          <img src="/images/logo.jpg" alt="Vibe Market" className="w-full h-full rounded-full object-cover bg-background" />
        </motion.div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold text-gradient mb-4">
          {lang === "ar" ? "طوّر الـ VIBE متاعك" : "Upgrade Your VIBE"}
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl tracking-[0.2em] mb-10">
          Electronics • LED • Accessories
        </p>

        <motion.a
          href="#products"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block bg-gradient text-primary-foreground font-bold px-8 py-3.5 rounded-full shadow-glow hover:shadow-glow-strong transition-shadow text-sm tracking-wide"
        >
          {lang === "ar" ? "تسوّق الآن" : "SHOP NOW"}
        </motion.a>
      </motion.div>
    </section>
  );
};

export default Hero;
