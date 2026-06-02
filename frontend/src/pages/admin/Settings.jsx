import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, Save, Globe, Palette, Bell } from 'lucide-react';
import { settingsApi } from '@/services/api';
import { PageHeader, Card, Button, FormField, Input, Select } from '@/components/ui';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

const tabs = [
  { id:'general',      label:'General',      icon:SettingsIcon },
  { id:'language',     label:'Language',     icon:Globe        },
  { id:'grading',      label:'Grading',      icon:Palette      },
  { id:'notifications',label:'Notifications',icon:Bell         },
];

export default function Settings() {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const [tab, setTab] = useState('general');
  const { register, handleSubmit, reset } = useForm();
  const { data, isLoading } = useQuery({ queryKey:['settings'], queryFn: () => settingsApi.get().then(r => r.data) });
  const mutation = useMutation({ mutationFn: settingsApi.update, onSuccess: () => { qc.invalidateQueries(['settings']); toast.success('Settings saved!'); } });
  useEffect(() => { if (data) reset(data); }, [data]);
  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title={t('settings')} subtitle="Institution configuration" breadcrumb="Home / Settings" />
      <div className="flex gap-2 bg-white border border-gray-100 rounded-2xl p-1.5 shadow-card w-fit">
        {tabs.map(({ id, label, icon:Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab===id ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
            <Icon size={14}/>{label}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit(d => mutation.mutate(d))}>
        {tab === 'general' && (
          <Card title="General Settings">
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Institution Name"><Input {...register('name')} /></FormField>
              <FormField label="नाम (नेपाली)"><Input {...register('name_ne')} className="font-devanagari" /></FormField>
              <FormField label="Phone"><Input {...register('phone')} /></FormField>
              <FormField label="Email"><Input type="email" {...register('email')} /></FormField>
              <FormField label="Address"><Input {...register('address')} /></FormField>
              <FormField label="District"><Input {...register('district')} /></FormField>
              <FormField label="Currency">
                <Select {...register('currency')}><option value="NPR">NPR — Nepali Rupee</option><option value="USD">USD</option></Select>
              </FormField>
              <FormField label="Timezone">
                <Select {...register('timezone')}><option value="Asia/Kathmandu">Asia/Kathmandu</option><option value="UTC">UTC</option></Select>
              </FormField>
            </div>
          </Card>
        )}
        {tab === 'language' && (
          <Card title="Language Settings">
            <div className="p-5 space-y-4">
              <FormField label="Default Language">
                <Select {...register('language')}><option value="en">English</option><option value="ne">नेपाली (Nepali)</option></Select>
              </FormField>
              <FormField label="Default Calendar">
                <Select {...register('calendar')}><option value="ad">Gregorian (AD)</option><option value="bs">Bikram Sambat (BS)</option></Select>
              </FormField>
              <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
                <p className="text-sm text-primary-700 font-medium mb-1">Current Interface Language</p>
                <div className="flex gap-2 mt-2">
                  {['en','ne'].map(l => (
                    <button key={l} type="button" onClick={() => i18n.changeLanguage(l)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${i18n.language===l ? 'bg-primary-500 text-white border-primary-500' : 'bg-white border-gray-200 text-gray-600'}`}>
                      {l === 'en' ? '🇬🇧 English' : '🇳🇵 नेपाली'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
        {tab === 'grading' && (
          <Card title="Grading Scale">
            <div className="p-5">
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr>{['Grade','GPA','Min Marks','Max Marks','Label'].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {[['A+','4.0','90','100','Outstanding'],['A','3.6','80','89','Excellent'],['B+','3.2','70','79','Very Good'],['B','2.8','60','69','Good'],['C+','2.4','50','59','Satisfactory'],['C','2.0','40','49','Acceptable'],['D','1.6','35','39','Partial'],['F','0.0','0','34','Failed']].map(([g,gpa,min,max,label]) => (
                      <tr key={g} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2"><span className="font-bold text-primary-700">{g}</span></td>
                        <td className="px-4 py-2 text-gray-600">{gpa}</td>
                        <td className="px-4 py-2 text-gray-600">{min}</td>
                        <td className="px-4 py-2 text-gray-600">{max}</td>
                        <td className="px-4 py-2 text-gray-600">{label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}
        <div className="flex justify-end mt-4">
          <Button variant="primary" type="submit" icon={Save} loading={mutation.isPending}>Save Settings</Button>
        </div>
      </form>
    </div>
  );
}
