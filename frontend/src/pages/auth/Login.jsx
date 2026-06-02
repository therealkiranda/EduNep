import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Globe } from 'lucide-react';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const schema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  otp:      z.string().optional(),
});

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate     = useNavigate();
  const { login, setLanguage } = useAuthStore();
  const [showPass,  setShowPass]   = useState(false);
  const [need2FA,   setNeed2FA]    = useState(false);
  const [loading,   setLoading]    = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      if (res.data.two_factor_required) { setNeed2FA(true); setLoading(false); return; }
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Login failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleLang = () => {
    const lang = i18n.language === 'en' ? 'ne' : 'en';
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">{t('sign_in')}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {i18n.language === 'ne' ? 'आफ्नो खातामा प्रवेश गर्नुहोस्' : 'Sign in to your EduNep account'}
          </p>
        </div>
        <button onClick={toggleLang}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-semibold transition-colors">
          <Globe size={13} />
          {i18n.language === 'en' ? 'नेपाली' : 'English'}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('email_address')}</label>
          <input
            {...register('email')}
            type="email"
            placeholder="principal@school.edu.np"
            className={clsx(
              'w-full px-4 py-3 rounded-xl border bg-white text-sm transition-all outline-none',
              'focus:ring-2 focus:ring-primary-300 focus:border-primary-400',
              errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
            )}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('password')}</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              className={clsx(
                'w-full px-4 py-3 pr-11 rounded-xl border bg-white text-sm transition-all outline-none',
                'focus:ring-2 focus:ring-primary-300 focus:border-primary-400',
                errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              )}
            />
            <button type="button" onClick={() => setShowPass(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        {/* 2FA */}
        {need2FA && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('two_factor')}</label>
            <input
              {...register('otp')}
              type="text" maxLength={6} placeholder="000000"
              className="w-full px-4 py-3 rounded-xl border border-primary-300 bg-primary-50 text-sm text-center tracking-widest font-mono outline-none focus:ring-2 focus:ring-primary-300"
            />
          </motion.div>
        )}

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-500 accent-primary-500" />
            <span className="text-sm text-gray-600">{t('remember_me')}</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            {t('forgot_password')}
          </Link>
        </div>

        <button
          type="submit" disabled={loading}
          className={clsx(
            'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all',
            'bg-gradient-to-r from-primary-800 to-primary-500 text-white shadow-md shadow-primary-200',
            'hover:shadow-lg hover:shadow-primary-300 hover:-translate-y-0.5',
            loading && 'opacity-70 cursor-not-allowed'
          )}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <LogIn size={16} />
          )}
          {loading ? t('loading') : t('sign_in')}
        </button>
      </form>

      {/* Demo credentials */}
      <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
        <p className="text-xs font-semibold text-primary-700 mb-2">Demo Credentials:</p>
        {[
          ['Super Admin',  'superadmin@edunep.com'],
          ['Principal',    'principal@edunep.com'],
          ['Teacher',      'teacher@edunep.com'],
          ['Accountant',   'accountant@edunep.com'],
        ].map(([role, email]) => (
          <p key={role} className="text-xs text-primary-600 font-mono">
            {role}: <span className="font-semibold">{email}</span> / EduNep@2082
          </p>
        ))}
      </div>
    </div>
  );
}
