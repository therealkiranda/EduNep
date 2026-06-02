import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Users, UserCheck, CheckSquare, DollarSign, AlertTriangle, BookOpen, Bell, Calendar } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { StatCard, Card, Badge, Avatar } from '@/components/ui';
import { format } from 'date-fns';
import clsx from 'clsx';

const COLORS = ['#1B6CA8','#C8A951','#10B981','#EF4444','#8B5CF6'];

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();

  const { data: dash, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  () => dashboardApi.index().then(r => r.data),
    refetchInterval: 60_000,
  });

  const { data: charts } = useQuery({
    queryKey: ['dashboard-charts'],
    queryFn:  () => dashboardApi.charts().then(r => r.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn:  () => dashboardApi.stats().then(r => r.data),
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return i18n.language === 'ne' ? 'शुभ बिहान' : 'Good Morning';
    if (h < 17) return i18n.language === 'ne' ? 'शुभ दिउँसो' : 'Good Afternoon';
    return i18n.language === 'ne' ? 'शुभ साँझ' : 'Good Evening';
  };

  const formatNPR = (v) => `NPR ${Number(v || 0).toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-800 to-primary-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -right-4 bottom-0 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative">
          <p className="text-white/70 text-sm mb-1">{greeting()},</p>
          <h2 className="text-2xl font-serif font-bold mb-1">{user?.name} 👋</h2>
          <p className="text-white/60 text-sm">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} · {i18n.language === 'ne' ? 'एडुनेप विद्यालय व्यवस्थापन' : 'EduNep School Management'}
          </p>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('total_students')}   value={dash?.stats?.total_students}   icon={Users}       color="blue"  loading={isLoading} />
        <StatCard title={t('total_staff')}       value={dash?.stats?.total_staff}       icon={UserCheck}   color="green" loading={isLoading} />
        <StatCard title={t('today_attendance')}  value={`${dash?.stats?.today_attendance ?? 0}%`} icon={CheckSquare} color="purple" loading={isLoading} />
        <StatCard title={t('fees_this_month')}   value={formatNPR(dash?.stats?.fees_this_month)} icon={DollarSign} color="gold" loading={isLoading} />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending Invoices', value: dash?.stats?.pending_invoices, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Fee Defaulters',   value: dash?.stats?.fee_defaulters,   color: 'text-red-600',    bg: 'bg-red-50'    },
          { label: 'Library Overdue',  value: '—',   color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Leave Pending',    value: '—',   color: 'text-blue-600',   bg: 'bg-blue-50'   },
        ].map(s => (
          <div key={s.label} className={clsx('rounded-xl p-4 border border-gray-100', s.bg)}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={clsx('text-xl font-serif font-bold', s.color)}>{s.value ?? '—'}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Fee collection line chart */}
        <Card title="Fee Collection Trend" className="lg:col-span-2">
          <div className="px-5 pb-5">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={charts?.monthly ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`NPR ${Number(v).toLocaleString()}`, 'Fees']} />
                <Line type="monotone" dataKey="fees" stroke="#1B6CA8" strokeWidth={2.5} dot={{ fill: '#1B6CA8', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Gender breakdown */}
        <Card title="Student Gender Breakdown">
          <div className="px-5 pb-5 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={stats?.gender_breakdown ?? []} dataKey="total" nameKey="gender" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                  {(stats?.gender_breakdown ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              {(stats?.gender_breakdown ?? []).map((g, i) => (
                <div key={g.gender} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-xs text-gray-600 capitalize">{g.gender}: {g.total}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Attendance + Enrollment charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Weekly Attendance Rate (%)">
          <div className="px-5 pb-5">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats?.attendance_this_week ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip formatter={v => [`${v}%`, 'Attendance']} />
                <Bar dataKey="rate" fill="#1B6CA8" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Enrollment by Class">
          <div className="px-5 pb-5">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats?.enrollment_by_class ?? []} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis dataKey="class.name" type="category" tick={{ fontSize: 10, fill: '#9CA3AF' }} width={70} />
                <Tooltip />
                <Bar dataKey="total" fill="#C8A951" radius={[0,6,6,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent payments */}
        <Card title={t('recent_payments')} className="lg:col-span-2">
          <div className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({length:4}).map((_,i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                    <div className="h-2.5 bg-gray-100 rounded animate-pulse w-1/3" />
                  </div>
                </div>
              ))
            ) : dash?.recentPayments?.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-400">No recent payments</p>
            ) : (
              dash?.recentPayments?.map(p => (
                <div key={p.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.student?.user?.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.student?.user?.name}</p>
                      <p className="text-xs text-gray-400">{p.method?.replace('_',' ')} · {format(new Date(p.paid_at), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">NPR {Number(p.amount).toLocaleString()}</p>
                    <Badge label="Paid" color="green" />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming events */}
        <Card title={t('upcoming_events')}>
          <div className="px-5 pb-5 space-y-3">
            {dash?.upcomingEvents?.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-4">No upcoming events</p>
            )}
            {dash?.upcomingEvents?.map(e => (
              <div key={e.id} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-center shrink-0"
                  style={{ background: e.color + '22', color: e.color }}>
                  <span className="text-xs font-bold leading-none">{format(new Date(e.start_date),'d')}</span>
                  <span className="text-[9px] leading-none">{format(new Date(e.start_date),'MMM')}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 leading-tight">{e.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">{e.type}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Latest announcements */}
      <Card title={t('latest_announcements')}>
        <div className="divide-y divide-gray-50">
          {dash?.announcements?.map(a => (
            <div key={a.id} className="px-5 py-4 flex items-start gap-3 hover:bg-gray-50/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                <Bell size={14} className="text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{a.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge label={a.audience} color="blue" />
                  <span className="text-xs text-gray-400">{format(new Date(a.published_at), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
