import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { BookOpen, CheckSquare, DollarSign, Award, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { StatCard, Card, Badge } from '@/components/ui';
import { useNepaliDate } from '@/hooks/useNepaliDate';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatNPR } from '@/utils/helpers';

export default function StudentDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const { todayFormatted } = useNepaliDate();
  const isNe = i18n.language === 'ne';

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-800 to-primary-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
        <p className="text-white/70 text-sm mb-1">{isNe ? 'नमस्ते,' : 'Hello,'}</p>
        <h2 className="text-xl font-serif font-bold mb-1">{user?.name} 👋</h2>
        <p className="text-white/60 text-sm">{todayFormatted()}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Attendance"       value="94%"     icon={CheckSquare} color="green"  />
        <StatCard title="Assignments Due"  value="3"       icon={BookOpen}    color="gold"   />
        <StatCard title="Fee Balance"      value="NPR 0"   icon={DollarSign}  color="blue"   />
        <StatCard title="GPA"              value="3.6"     icon={Award}       color="purple" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card title="My Grades" className="lg:col-span-2">
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[{s:'Math',m:85},{s:'English',m:78},{s:'Science',m:92},{s:'Nepali',m:88},{s:'Social',m:75}]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>
                <XAxis dataKey="s" tick={{fontSize:11}}/>
                <YAxis domain={[0,100]} tick={{fontSize:11}}/>
                <Tooltip formatter={v=>[`${v}%`,'Marks']}/>
                <Bar dataKey="m" fill="#1B6CA8" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Upcoming">
          <div className="px-5 pb-5 space-y-3 mt-2">
            {[{label:'Mathematics Assignment',date:'Tomorrow',type:'assignment',color:'text-amber-600 bg-amber-50'},{label:'Science Exam',date:'Fri, Jun 7',type:'exam',color:'text-red-600 bg-red-50'},{label:'Fee Due',date:'Jun 15',type:'fee',color:'text-primary-600 bg-primary-50'}].map(item => (
              <div key={item.label} className={`flex items-start gap-3 p-3 rounded-xl ${item.color.split(' ')[1]}`}>
                <Bell size={14} className={`mt-0.5 shrink-0 ${item.color.split(' ')[0]}`}/>
                <div><p className={`text-xs font-semibold ${item.color.split(' ')[0]}`}>{item.label}</p><p className="text-[11px] text-gray-500 mt-0.5">{item.date}</p></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
