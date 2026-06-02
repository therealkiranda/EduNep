import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { BarChart3, Download, FileText, Users, DollarSign, CheckSquare } from 'lucide-react';
import { reportsApi } from '@/services/api';
import { PageHeader, Card, Button, StatCard } from '@/components/ui';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#1B6CA8','#C8A951','#10B981','#EF4444','#8B5CF6'];
const tabs = [
  { id:'academic',   label:'Academic',   icon:FileText },
  { id:'attendance', label:'Attendance', icon:CheckSquare },
  { id:'finance',    label:'Finance',    icon:DollarSign },
  { id:'enrollment', label:'Enrollment', icon:Users },
];

export default function Reports() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('academic');
  const { data, isLoading } = useQuery({
    queryKey: ['reports', tab],
    queryFn: () => reportsApi[tab]({}).then(r => r.data),
  });
  return (
    <div className="space-y-6">
      <PageHeader title={t('reports')} subtitle="Analytics and exportable reports" breadcrumb="Home / Reports"
        actions={<Button variant="secondary" size="sm" icon={Download}>Export PDF</Button>} />
      <div className="flex gap-2 bg-white border border-gray-100 rounded-2xl p-1.5 shadow-card w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab===id ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
            <Icon size={14}/>{label}
          </button>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Monthly Trend">
          <div className="p-5">
            {isLoading ? <div className="h-48 bg-gray-50 rounded-xl animate-pulse" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data?.monthly ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="label" tick={{ fontSize:11 }} />
                  <YAxis tick={{ fontSize:11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#1B6CA8" strokeWidth={2.5} dot={{ r:4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
        <Card title="Breakdown">
          <div className="p-5 flex flex-col items-center">
            {isLoading ? <div className="h-48 bg-gray-50 rounded-xl animate-pulse w-full" /> : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={data?.breakdown ?? []} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                      {(data?.breakdown ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                  {(data?.breakdown ?? []).map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} /><span className="text-xs text-gray-600">{item.label}: {item.value}</span></div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
      {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.summary.map((s, i) => <StatCard key={i} title={s.label} value={s.value} icon={BarChart3} color={['blue','green','gold','purple'][i] ?? 'blue'} />)}
        </div>
      )}
    </div>
  );
}
