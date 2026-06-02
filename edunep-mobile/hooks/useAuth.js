import { useAuthStore } from '../store/authStore';
import { useRouter } from 'expo-router';
import { authApi } from '../services/api';
import Toast from 'react-native-toast-message';

export function useAuth() {
  const store  = useAuthStore();
  const router = useRouter();

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    store.logout();
    router.replace('/auth/login');
    Toast.show({ type: 'success', text1: 'Logged out successfully.' });
  };

  return {
    user:        store.user,
    token:       store.token,
    language:    store.language,
    role:        store.user?.role,
    isLoggedIn:  store.isLoggedIn(),
    can:         store.can,
    is:          store.is,
    isAny:       store.isAny,
    logout,
    setLanguage: store.setLanguage,
    updateUser:  store.updateUser,
  };
}
