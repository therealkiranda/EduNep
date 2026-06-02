import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/api';
import toast from 'react-hot-toast';

export function useAuth() {
  const store    = useAuthStore();
  const navigate = useNavigate();

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    store.logout();
    navigate('/login');
    toast.success('Logged out successfully.');
  };

  const can  = (permission) => store.hasPermission(permission);
  const is   = (role)       => store.hasRole(role);
  const isAny= (roles)      => roles.includes(store.user?.role);

  return {
    user:        store.user,
    token:       store.token,
    language:    store.language,
    isLoggedIn:  store.isLoggedIn(),
    logout,
    can,
    is,
    isAny,
    setLanguage: store.setLanguage,
  };
}
