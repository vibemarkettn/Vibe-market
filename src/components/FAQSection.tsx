import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "How can I order a product?", qAr: "كيف يمكنني طلب منتج؟", a: "Add the product to your cart, fill in your details, and follow the checkout steps. We'll contact you to confirm.", aAr: "أضف المنتج للسلة ثم املأ المعلومات الخاصة بك واتبع خطوات الطلب. سنتواصل معك لتأكيد الطلب." },
  { q: "What payment methods are available?", qAr: "ما هي طرق الدفع المتاحة؟", a: "We accept cash on delivery across Tunisia.", aAr: "نحن نقبل الدفع عند الاستلام لجميع أنحاء تونس." },
  { q: "How long does delivery take?", qAr: "كم تستغرق مدة التوصيل؟", a: "Delivery takes 2-5 business days depending on your location.", aAr: "مدة التوصيل تتراوح بين 2-5 أيام عمل حسب الموقع." },
  { q: "Do products come with warranty?", qAr: "هل المنتجات عليها ضمان؟", a: "Yes, all products have a 6-month warranty against manufacturing defects.", aAr: "نعم، جميع منتجاتنا عليها ضمان لمدة 6 أشهر ضد عيوب التصنيع." },
];

const FAQSection = () => {
  const { lang } = useStore();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 px-4 bg-card/50">
      <div className="container mx-auto max-w-3xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-display font-bold text-center mb-12 text-gradient"
        >
          {lang === "ar" ? "الأسئلة الشائعة" : "FAQ"}
        </motion.h2>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm hover:text-primary transition-colors"
              >
                <span>{lang === "ar" ? faq.qAr : faq.q}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                      {lang === "ar" ? faq.aAr : faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
