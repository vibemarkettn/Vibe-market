import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductsSection from "@/components/ProductsSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import TrackOrder from "@/components/TrackOrder";
import CartModal from "@/components/CartModal";
import Footer from "@/components/Footer";

const Index = () => (
  <>
    <Navbar />
    <CartModal />
    <Hero />
    <ProductsSection />
    <FAQSection />
    <ContactSection />
    <TrackOrder />
    <Footer />
  </>
);

export default Index;
