import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Camera, Save, Lock, Shield } from 'lucide-react';
import { authApi } from '@/services/api';
import { PageHeader, Card, Button, FormField, Input, Select, Avatar } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function Profile() {
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();
  const qc = useQueryClient();
  const [tab, setTab] = useState('profile');
  const { register: reg1, handleSubmit: hs1 } = useForm({ defaultValues: user });
  const { register: reg2, handleSubmit: hs2, watch, reset: r2 } = useForm();

  const profileMut = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (res) => { setUser(res.data.user); toast.success(t('profile_updated')); },
  });
  const passMut = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => { r2(); toast.success('Password changed!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title={t('profile')} subtitle="Manage your account" breadcrumb="Home / Profile" />
      <div className="flex gap-2 bg-white border border-gray-100 rounded-2xl p-1.5 shadow-card w-fit">
        {[['profile','Profile',null],['password','Password',Lock],['security','Security',Shield]].map(([id,label,Icon]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab===id ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
            {Icon && <Icon size={14}/>}{label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <Card title="Profile Information">
          <div className="p-5 space-y-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar name={user?.name} src={user?.avatar} size="xl" />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center cursor-pointer shadow-md">
                  <Camera size={13} className="text-white" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{user?.name}</p>
                <p className="text-sm text-gray-500 capitalize">{user?.role?.replace('_',' ')}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
            <form onSubmit={hs1(d => profileMut.mutate(d))} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Full Name"><Input {...reg1('name')} /></FormField>
              <FormField label="Phone"><Input {...reg1('phone')} /></FormField>
              <FormField label="Language">
                <Select {...reg1('language')}><option value="en">English</option><option value="ne">नेपाली</option></Select>
              </FormField>
              <div className="md:col-span-2 flex justify-end">
                <Button variant="primary" type="submit" icon={Save} loading={profileMut.isPending}>Save Profile</Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {tab === 'password' && (
        <Card title="Change Password">
          <form onSubmit={hs2(d => passMut.mutate(d))} className="p-5 space-y-4">
            <FormField label="Current Password"><Input type="password" {...reg2('current_password', { required: true })} /></FormField>
            <FormField label="New Password"><Input type="password" {...reg2('password', { required: true, minLength: 8 })} /></FormField>
            <FormField label="Confirm New Password"><Input type="password" {...reg2('password_confirmation', { required: true, validate: v => v === watch('password') || 'Passwords do not match' })} /></FormField>
            <div className="flex justify-end">
              <Button variant="primary" type="submit" icon={Lock} loading={passMut.isPending}>Change Password</Button>
            </div>
          </form>
        </Card>
      )}

      {tab === 'security' && (
        <Card title="Two-Factor Authentication">
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-sm text-gray-800">2FA Status</p>
                <p className="text-xs text-gray-500 mt-0.5">{user?.two_factor_enabled ? 'Enabled and active' : 'Not enabled'}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user?.two_factor_enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                {user?.two_factor_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <p className="text-sm text-gray-500">Two-factor authentication adds an extra layer of security to your account using an authenticator app.</p>
            <Button variant={user?.two_factor_enabled ? 'danger' : 'primary'} icon={Shield}>
              {user?.two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
