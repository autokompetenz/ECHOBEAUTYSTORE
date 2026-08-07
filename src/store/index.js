import { create } from 'zustand';
import { cartAPI } from '../services/api';

// ─── Theme Store ─────────────────────────────────────────────────────────────
const savedTheme = localStorage.getItem('ak_theme') || 'light';
if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
else document.documentElement.removeAttribute('data-theme');

export const useThemeStore = create((set) => ({
  theme: savedTheme,
  toggle: () => {
    set((s) => {
      const newTheme = s.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('ak_theme', newTheme);
      if (newTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
      else document.documentElement.removeAttribute('data-theme');
      return { theme: newTheme };
    });
  },
}));

// ─── Language Store ───────────────────────────────────────────────────────────
export const useLangStore = create((set) => ({
  lang: localStorage.getItem('ak_lang') || 'fr',
  setLang: (lang) => {
    localStorage.setItem('ak_lang', lang);
    document.documentElement.lang = lang;
    set({ lang });
  },
}));

// ─── Auth Store ───────────────────────────────────────────────────────────────
export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('ak_user') || 'null'),
  token: localStorage.getItem('ak_token') || null,
  isAuthenticated: !!localStorage.getItem('ak_token'),

  login: (user, token) => {
    localStorage.setItem('ak_token', token);
    localStorage.setItem('ak_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('ak_token');
    localStorage.removeItem('ak_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
  updateUser: (updates) => {
    const updated = { ...get().user, ...updates };
    localStorage.setItem('ak_user', JSON.stringify(updated));
    set({ user: updated });
  },
  isAdmin: () => get().user?.role === 'ADMIN',
}));

// ─── Helpers panier local ─────────────────────────────────────────────────────
function loadGuestCart() {
  try { return JSON.parse(localStorage.getItem('ak_guest_cart') || '[]'); }
  catch { return []; }
}
function saveGuestCart(items) {
  localStorage.setItem('ak_guest_cart', JSON.stringify(items));
}
function calcTotal(items) {
  return items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
}

// ─── Cart Store ───────────────────────────────────────────────────────────────
export const useCartStore = create((set, get) => ({
  cartItems: [],
  cartCount: 0,
  total: 0,
  loading: false,

  // Charge le panier selon si connecté ou non
  fetchCart: async () => {
    const token = localStorage.getItem('ak_token');
    if (token) {
      try {
        set({ loading: true });
        const { data } = await cartAPI.get();
        set({ cartItems: data.cartItems, total: data.total, cartCount: data.count, loading: false });
        return;
      } catch (error) {
        if (error?.response?.status === 401) localStorage.removeItem('ak_token');
        set({ loading: false });
      }
    }
    const items = loadGuestCart();
    set({ cartItems: items, total: calcTotal(items), cartCount: items.length, loading: false });
  },

  fetchCount: async () => {
    const token = localStorage.getItem('ak_token');
    if (token) {
      try { const { data } = await cartAPI.count(); set({ cartCount: data.count }); return; } catch {}
    }
    const items = loadGuestCart();
    set({ cartCount: items.length });
  },

  // Ajoute un produit au panier
  addItem: async (product) => {
    const token = localStorage.getItem('ak_token');

    if (token) {
      const productId = typeof product === 'object' ? product.id : product;
      try {
        const { data } = await cartAPI.add({ productId });
        set({ cartItems: data.cartItems, cartCount: data.count, total: data.total });
        return data;
      } catch (error) {
        if (error?.response?.status === 401) {
          localStorage.removeItem('ak_token');
        } else {
          throw error;
        }
      }
    }

    // Invité → localStorage
    const productObj = typeof product === 'object' ? product : null;
    if (!productObj) throw new Error('Product object required for guest cart');

    const items = loadGuestCart();
    const existing = items.find(i => i.productId === productObj.id);
    let updated;
    if (existing) {
      updated = items.map(i =>
        i.productId === productObj.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      );
    } else {
      updated = [...items, {
        id: Date.now(),
        productId: productObj.id,
        quantity: 1,
        product: productObj,
      }];
    }
    saveGuestCart(updated);
    set({ cartItems: updated, total: calcTotal(updated), cartCount: updated.length });
    return { cartItems: updated };
  },

  removeItem: async (productId) => {
    const token = localStorage.getItem('ak_token');
    if (token) {
      const { data } = await cartAPI.remove(productId);
      const newItems = get().cartItems.filter(i => i.productId !== productId);
      const newTotal = calcTotal(newItems);
      set({ cartItems: newItems, total: newTotal, cartCount: data.cartCount });
    } else {
      const updated = get().cartItems.filter(i => i.productId !== productId);
      saveGuestCart(updated);
      set({ cartItems: updated, total: calcTotal(updated), cartCount: updated.length });
    }
  },

  clear: () => {
    localStorage.removeItem('ak_guest_cart');
    set({ cartItems: [], total: 0, cartCount: 0 });
  },
}));

// ─── Toast Store ──────────────────────────────────────────────────────────────
let toastId = 0;
export const useToastStore = create((set, get) => ({
  toasts: [],
  addToast: (message, type = 'success', duration = 3800) => {
    const id = ++toastId;
    set({ toasts: [...get().toasts, { id, message, type }] });
    setTimeout(() => set({ toasts: get().toasts.filter(t => t.id !== id) }), duration);
    return id;
  },
  removeToast: (id) => set({ toasts: get().toasts.filter(t => t.id !== id) }),
}));