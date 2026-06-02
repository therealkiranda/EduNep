import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { authApi } from '@/services/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
      toast.success('Reset link sent to your email.');
    } catch { toast.error('Failed to send reset link.'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-8 transition-colors">
        <ArrowLeft size={15} /> Back to Login
      </Link>
      <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Forgot Password?</h1>
      <p className="text-gray-500 text-sm mb-8">Enter your email and we'll send you a reset link.</p>

      {sent ? (
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
          className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail size={22} className="text-emerald-600" />
          </div>
          <p className="font-semibold text-emerald-800 mb-1">Check your email</p>
          <p className="text-sm text-emerald-600">A password reset link has been sent to your email address.</p>
          <Link to="/login" className="mt-4 inline-block text-sm text-primary-600 font-semibold hover:underline">Back to Login</Link>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input {...register('email', { required: true, pattern: /^\S+@\S+$/ })} type="email"
              placeholder="your@email.com"
              className={clsx('w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-primary-300',
                errors.email ? 'border-red-400' : 'border-gray-200')} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary-800 to-primary-500 text-white font-semibold text-sm shadow-md disabled:opacity-70">
            {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send size={15} />}
            Send Reset Link
          </button>
        </form>
      )}
    </div>
  );
}
