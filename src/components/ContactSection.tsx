import { motion } from "framer-motion";
import { useStore } from "@/lib/store";

const ContactSection = () => {
  const { lang } = useStore();

  return (
    <section id="contact" className="py-20 px-4">
      <div className="container mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-display font-bold mb-10 text-gradient"
        >
          {lang === "ar" ? "تواصل معنا" : "Contact Us"}
        </motion.h2>

        <div className="flex justify-center gap-4 flex-wrap">
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://wa.me/21623409356"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-lg"
            style={{ background: "#25D366", color: "white" }}
          >
            WhatsApp
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://www.instagram.com/vibe.market2"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-lg"
            style={{ background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)", color: "white" }}
          >
            Instagram
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
