import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  price: number;
  img: string;
  stock: number;
  category: string;
  desc: string;
  specs: string[];
  active: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
}

export const PRODUCTS: Record<string, Product> = {
  led: { id: "led", name: "LED RGB متعدد الألوان", price: 25, img: "/images/ledd.jpg", stock: 10, category: "led", desc: "شريط LED RGB متعدد الألوان مع تحكم عن بُعد", specs: ["ألوان متعددة", "تحكم عن بُعد", "سهل التركيب"], active: true },
  casque: { id: "casque", name: "Casque Bluetooth CAT EAR", price: 25, img: "/images/casque.jpg", stock: 5, category: "audio", desc: "سماعات رأس بلوتوث على شكل آذان القط", specs: ["بلوتوث 5.0", "بطارية طويلة", "إضاءة LED"], active: true },
  mouse: { id: "mouse", name: "Elite RGB Wireless Mouse", price: 30, img: "/images/mouse.jpg", stock: 7, category: "accessories", desc: "ماوس لاسلكي RGB احترافي", specs: ["لاسلكي", "RGB إضاءة", "دقة عالية"], active: true },
  projector: { id: "projector", name: "LED Star Projector + Bluetooth", price: 25, img: "/images/star.jpg", stock: 7, category: "led", desc: "مشروع النجوم LED مع بلوتوث", specs: ["بلوتوث", "مكبر صوت", "تغيير الألوان"], active: true },
  mong: { id: "mong", name: "T800 Ultra Smart Watch", price: 30, img: "/images/mong.jpg", stock: 7, category: "accessories", desc: "ساعة ذكية T800 Ultra", specs: ["49mm", "مقاومة للماء", "شاشة AMOLED"], active: true },
  mic: { id: "mic", name: "Professional Studio Kit", price: 35.9, img: "/images/mic.jpg", stock: 7, category: "audio", desc: "مجموعة استوديو احترافية", specs: ["جودة عالية", "متين", "سهل الاستخدام"], active: true },
  bafle: { id: "bafle", name: "HAUT PARLEUR RGB", price: 75, img: "/images/bafle.jpg", stock: 7, category: "audio", desc: "مكبر صوت RGB", specs: ["Bass قوي", "RGB إضاءة", "بلوتوث"], active: true },
  kit: { id: "kit", name: "AirPod A9 Pro", price: 45, img: "/images/icot.jpg", stock: 7, category: "audio", desc: "سماعات لاسلكية A9 Pro", specs: ["شاشة لمسية", "عزل ضوضاء", "بطارية طويلة"], active: true },
  cass: { id: "cass", name: "BH02 BlackWave Headset", price: 34, img: "/images/cass.jpg", stock: 7, category: "audio", desc: "سماعة رأس BH02", specs: ["Surround Sound", "ميكروفون", "مريحة"], active: true },
};

export const CATEGORIES = [
  { id: "all", name: "الكل", nameEn: "All", icon: "🔥" },
  { id: "audio", name: "صوتيات", nameEn: "Audio", icon: "🎧" },
  { id: "led", name: "إضاءة LED", nameEn: "LED", icon: "💡" },
  { id: "accessories", name: "إكسسوارات", nameEn: "Accessories", icon: "⌚" },
];

export interface AdminCredentials {
  username: string;
  password: string;
}

interface StoreState {
  cart: CartItem[];
  orders: Order[];
  lang: 'en' | 'ar';
  isCartOpen: boolean;
  isAdminLoggedIn: boolean;
  adminCredentials: AdminCredentials;
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  toggleLang: () => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  deleteOrder: (id: string) => void;
  clearAllOrders: () => void;
  adminLogin: (username: string, password: string) => boolean;
  adminLogout: () => void;
  updateAdminCredentials: (creds: Partial<AdminCredentials>) => void;
  cartTotal: () => number;
  cartCount: () => number;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      orders: [],
      lang: 'en',
      isCartOpen: false,
      isAdminLoggedIn: false,
      adminCredentials: { username: 'admin', password: 'admin123' },
      addToCart: (product, qty = 1) => {
        const cart = get().cart;
        const existing = cart.find(i => i.product.id === product.id);
        if (existing) {
          set({ cart: cart.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i) });
        } else {
          set({ cart: [...cart, { product, quantity: qty }] });
        }
      },
      removeFromCart: (productId) => set({ cart: get().cart.filter(i => i.product.id !== productId) }),
      updateQuantity: (productId, qty) => {
        if (qty <= 0) {
          get().removeFromCart(productId);
        } else {
          set({ cart: get().cart.map(i => i.product.id === productId ? { ...i, quantity: qty } : i) });
        }
      },
      clearCart: () => set({ cart: [] }),
      toggleCart: () => set({ isCartOpen: !get().isCartOpen }),
      setCartOpen: (open) => set({ isCartOpen: open }),
      toggleLang: () => set({ lang: get().lang === 'en' ? 'ar' : 'en' }),
      addOrder: (order) => set({ orders: [order, ...get().orders] }),
      updateOrderStatus: (id, status) => set({ orders: get().orders.map(o => o.id === id ? { ...o, status } : o) }),
      deleteOrder: (id) => set({ orders: get().orders.filter(o => o.id !== id) }),
      clearAllOrders: () => set({ orders: [] }),
      adminLogin: (username, password) => {
        const creds = get().adminCredentials;
        if (username === creds.username && password === creds.password) {
          set({ isAdminLoggedIn: true });
          return true;
        }
        return false;
      },
      adminLogout: () => set({ isAdminLoggedIn: false }),
      updateAdminCredentials: (creds) => set({ adminCredentials: { ...get().adminCredentials, ...creds } }),
      cartTotal: () => get().cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      cartCount: () => get().cart.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'vibe-market-store', partialize: (state) => ({ cart: state.cart, orders: state.orders, lang: state.lang, adminCredentials: state.adminCredentials, isAdminLoggedIn: state.isAdminLoggedIn }) }
  )
);
