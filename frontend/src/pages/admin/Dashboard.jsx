import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, CheckSquare, DollarSign, AlertTriangle, Bell, ArrowRight } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { StatCard, Card, Badge, Avatar } from '@/components/ui';
import { adToBs, MONTHS_NE, MONTHS_EN, toDevanagari } from '@/hooks/useNepaliDate';
import { format } from 'date-fns';
import clsx from 'clsx';

const COLORS = ['#1B6CA8','#C8A951','#10B981','#EF4444','#8B5CF6'];

export default function Dashboard() {
  const {t,i18n} = useTranslation();
  const {user}   = useAuthStore();
  const navigate = useNavigate();
  const isNe     = i18n.language === 'ne';

  const {data:dash, isLoading} = useQuery({
    queryKey:['dashboard'],
    queryFn:()=>dashboardApi.index().then(r=>r.data),
    refetchInterval:60000,
  });
  const {data:charts} = useQuery({
    queryKey:['dashboard-charts'],
    queryFn:()=>dashboardApi.charts().then(r=>r.data),
  });
  const {data:stats} = useQuery({
    queryKey:['dashboard-stats'],
    queryFn:()=>dashboardApi.stats().then(r=>r.data),
  });

  const todayBs = adToBs(new Date().toISOString().split('T')[0]);
  const todayBsStr = todayBs
    ? isNe
      ? `${toDevanagari(todayBs.year)} ${MONTHS_NE[todayBs.month-1]} ${toDevanagari(todayBs.day)}`
      : `${todayBs.year} ${MONTHS_EN[todayBs.month-1]} ${todayBs.day} BS`
    : '';

  const greeting = () => {
    const h = new Date().getHours();
    if (isNe) return h<12?'शुभ बिहान':h<17?'नमस्ते':'शुभ साँझ';
    return h<12?'Good Morning':h<17?'Good Afternoon':'Good Evening';
  };

  const noAcademicYear = !isLoading && !dash?.stats?.total_students && dash?.stats?.total_students !== 0;

  return (
    <div className="space-y-4 md:space-y-6">

      {/* Academic year warning */}
      {noAcademicYear && (
        <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5"/>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">{isNe?'शैक्षिक वर्ष सेट गरिएको छैन!':'No Academic Year Set!'}</p>
            <p className="text-xs text-amber-600 mt-0.5">{isNe?'प्रणाली राम्रोसँग काम गर्न शैक्षिक वर्ष सेट गर्नुहोस्।':'Set a current Academic Year and Term for the system to work properly.'}</p>
          </div>
          <button onClick={()=>navigate('/settings')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition-colors shrink-0">
            Fix <ArrowRight size={12}/>
          </button>
        </motion.div>
      )}

      {/* Welcome */}
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
        className="bg-gradient-to-r from-primary-800 to-primary-500 rounded-2xl p-4 md:p-6 text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full"/>
        <div className="relative">
          <p className="text-white/70 text-sm">{greeting()},</p>
          <h2 className="text-xl md:text-2xl font-serif font-bold mt-1">{user?.name} 👋</h2>
          <p className="text-white/60 text-xs md:text-sm mt-1">
            {format(new Date(),'EEEE, MMMM d, yyyy')}
            {todayBsStr && <span className="ml-2 font-devanagari">· {todayBsStr}</span>}
          </p>
        </div>
      </motion.div>

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard title={isNe?'कुल विद्यार्थी':t('total_students')} value={dash?.stats?.total_students} icon={Users} color="blue" loading={isLoading}/>
        <StatCard title={isNe?'कुल कर्मचारी':t('total_staff')} value={dash?.stats?.total_staff} icon={UserCheck} color="green" loading={isLoading}/>
        <StatCard title={isNe?'आजको उपस्थिति':t('today_attendance')} value={`${dash?.stats?.today_attendance??0}%`} icon={CheckSquare} color="purple" loading={isLoading}/>
        <StatCard title={isNe?'यो महिनाको शुल्क':t('fees_this_month')} value={`NPR ${Number(dash?.stats?.fees_this_month||0).toLocaleString('en-IN')}`} icon={DollarSign} color="gold" loading={isLoading}/>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {label:isNe?'बाँकी बिल':'Pending Invoices', value:dash?.stats?.pending_invoices, bg:'bg-orange-50',text:'text-orange-600',border:'border-orange-100'},
          {label:isNe?'बक्यौता':'Fee Defaulters',      value:dash?.stats?.fee_defaulters,   bg:'bg-red-50',   text:'text-red-600',   border:'border-red-100'},
          {label:isNe?'लाइब्रेरी':'Lib Overdue',        value:'—',                           bg:'bg-purple-50',text:'text-purple-600',border:'border-purple-100'},
          {label:isNe?'बिदा':'Leave Pending',           value:'—',                           bg:'bg-blue-50',  text:'text-blue-600',  border:'border-blue-100'},
        ].map(s=>(
          <div key={s.label} className={clsx('rounded-xl p-3 border',s.bg,s.border)}>
            <p className="text-xs text-gray-500 mb-1 truncate">{s.label}</p>
            <p className={clsx('text-xl font-serif font-bold',s.text)}>{s.value??'—'}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        <Card title={isNe?'शुल्क संकलन':'Fee Collection'} className="lg:col-span-2">
          <div className="px-4 pb-5">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={charts?.monthly??[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>
                <XAxis dataKey="label" tick={{fontSize:11,fill:'#9CA3AF'}}/>
                <YAxis tick={{fontSize:11,fill:'#9CA3AF'}} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
                <Tooltip formatter={v=>[`NPR ${Number(v).toLocaleString()}`,isNe?'शुल्क':'Fees']}/>
                <Line type="monotone" dataKey="fees" stroke="#1B6CA8" strokeWidth={2.5} dot={{fill:'#1B6CA8',r:3}} activeDot={{r:5}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title={isNe?'लिङ्ग वितरण':'Gender'}>
          <div className="px-5 pb-5 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={stats?.gender_breakdown??[]} dataKey="total" nameKey="gender" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                  {(stats?.gender_breakdown??[]).map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-3 flex-wrap justify-center mt-1">
              {(stats?.gender_breakdown??[]).map((g,i)=>(
                <div key={g.gender} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{background:COLORS[i]}}/>
                  <span className="text-xs text-gray-600 capitalize">{g.gender}: {g.total}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Attendance + Enrollment */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        <Card title={isNe?'साप्ताहिक उपस्थिति':'Weekly Attendance (%)'}>
          <div className="px-4 pb-5">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats?.attendance_this_week??[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>
                <XAxis dataKey="label" tick={{fontSize:11,fill:'#9CA3AF'}}/>
                <YAxis domain={[0,100]} tick={{fontSize:11,fill:'#9CA3AF'}}/>
                <Tooltip formatter={v=>[`${v}%`,isNe?'उपस्थिति':'Attendance']}/>
                <Bar dataKey="rate" fill="#1B6CA8" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title={isNe?'कक्षाअनुसार':'Enrollment by Class'}>
          <div className="px-4 pb-5">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats?.enrollment_by_class??[]} layout="vertical">
                <XAxis type="number" tick={{fontSize:11,fill:'#9CA3AF'}}/>
                <YAxis dataKey="class.name" type="category" tick={{fontSize:10,fill:'#9CA3AF'}} width={60}/>
                <Tooltip/>
                <Bar dataKey="total" fill="#C8A951" radius={[0,4,4,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent payments + events */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        <Card title={isNe?'हालका भुक्तानी':t('recent_payments')} className="lg:col-span-2">
          <div className="divide-y divide-gray-50">
            {isLoading ? Array.from({length:4}).map((_,i)=>(
              <div key={i} className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse"/>
                <div className="flex-1 space-y-1.5"><div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"/><div className="h-2.5 bg-gray-100 rounded animate-pulse w-1/3"/></div>
              </div>
            )) : !dash?.recentPayments?.length
              ? <p className="px-5 py-8 text-center text-sm text-gray-400">{isNe?'कुनै भुक्तानी छैन':'No recent payments'}</p>
              : dash.recentPayments.map(p=>(
                <div key={p.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.student?.user?.name} size="sm"/>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.student?.user?.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{p.method?.replace('_',' ')} · {p.paid_at?format(new Date(p.paid_at),'MMM d'):'—'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">NPR {Number(p.amount).toLocaleString()}</p>
                    <Badge label="Paid" color="green"/>
                  </div>
                </div>
              ))
            }
          </div>
        </Card>
        <Card title={isNe?'आगामी कार्यक्रम':t('upcoming_events')}>
          <div className="px-4 pb-5 space-y-3">
            {!dash?.upcomingEvents?.length
              ? <p className="text-center text-sm text-gray-400 py-4">{isNe?'कुनै कार्यक्रम छैन':'No upcoming events'}</p>
              : dash.upcomingEvents.map(e=>{
                  const color=e.type==='holiday'?'#EF4444':e.type==='exam'?'#F59E0B':'#1B6CA8';
                  return (
                    <div key={e.id} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0" style={{background:color+'22',color}}>
                        <span className="text-xs font-bold leading-none">{format(new Date(e.start_date),'d')}</span>
                        <span className="text-[9px] leading-none">{format(new Date(e.start_date),'MMM')}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 leading-tight">{e.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 capitalize">{e.type}</p>
                        {e.start_bs_formatted&&<p className="text-[10px] text-gray-400 font-devanagari">{e.start_bs_formatted}</p>}
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </Card>
      </div>

      {/* Announcements */}
      {dash?.announcements?.length>0&&(
        <Card title={isNe?'नवीनतम सूचना':t('latest_announcements')}>
          <div className="divide-y divide-gray-50">
            {dash.announcements.map(a=>(
              <div key={a.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0"><Bell size={14} className="text-primary-500"/></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{isNe&&a.title_ne?a.title_ne:a.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Badge label={a.audience} color="blue"/>
                    <span className="text-xs text-gray-400">{a.published_at?format(new Date(a.published_at),'MMM d, yyyy'):''}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
