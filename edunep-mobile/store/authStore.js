import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

// SecureStore adapter for zustand persist
const secureStorage = {
  getItem:    async (key) => await SecureStore.getItemAsync(key),
  setItem:    async (key, value) => await SecureStore.setItemAsync(key, value),
  removeItem: async (key) => await SecureStore.deleteItemAsync(key),
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token:    null,
      user:     null,
      language: 'en',
      biometricEnabled: false,

      login: (token, user) => set({
        token,
        user,
        language: user?.language || 'en',
      }),

      logout: () => set({ token: null, user: null }),

      setLanguage: (lang) => set({ language: lang }),

      setBiometric: (enabled) => set({ biometricEnabled: enabled }),

      updateUser: (updates) => set(s => ({ user: { ...s.user, ...updates } })),

      // Permission helpers
      can: (permission) => {
        const perms = get().user?.permissions ?? [];
        return perms.includes(permission);
      },

      is: (role) => get().user?.role === role,

      isAny: (roles) => roles.includes(get().user?.role),

      isLoggedIn: () => !!get().token && !!get().user,

      // Role shorthand
      role: () => get().user?.role,
    }),
    {
      name:    'edunep-auth',
      storage: createJSONStorage(() => secureStorage),
      partialize: (s) => ({
        token:            s.token,
        user:             s.user,
        language:         s.language,
        biometricEnabled: s.biometricEnabled,
      }),
    }
  )
);
