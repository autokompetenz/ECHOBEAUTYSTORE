import { create } from 'zustand';

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