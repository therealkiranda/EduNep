import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token:    null,
      user:     null,
      language: 'en',

      setToken: (token) => set({ token }),
      setUser:  (user)  => set({ user, language: user?.language || 'en' }),

      login: (token, user) => set({ token, user, language: user?.language || 'en' }),

      logout: () => set({ token: null, user: null }),

      setLanguage: (lang) => {
        set({ language: lang });
        localStorage.setItem('language', lang);
        if (get().user) set(s => ({ user: { ...s.user, language: lang } }));
      },

      hasPermission: (perm) => {
        const perms = get().user?.permissions ?? [];
        return perms.includes(perm);
      },

      hasRole: (role) => get().user?.role === role,

      isLoggedIn: () => !!get().token && !!get().user,
    }),
    {
      name:    'edunep-auth',
      partialize: (s) => ({ token: s.token, user: s.user, language: s.language }),
    }
  )
);
