import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, CreditCard, TrendingUp, CheckSquare } from 'lucide-react';
import { studentsApi } from '@/services/api';
import { PageHeader, Button, Card, Badge, Avatar, StatCard } from '@/components/ui';
import { statusColor, formatDate, getGradeColor } from '@/utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function StudentDetail() {
  const { id }    = useParams();
  const { t }     = useTranslation();
  const navigate  = useNavigate();
  const qc        = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn:  () => studentsApi.get(id).then(r => r.data.student),
  });
  const { data: balance } = useQuery({
    queryKey: ['student-balance', id],
    queryFn:  () => studentsApi.feeBalance(id).then(r => r.data),
  });
  const { data: grades } = useQuery({
    queryKey: ['student-grades', id],
    queryFn:  () => studentsApi.grades?.(id).then(r => r.data) ?? Promise.resolve(null),
  });

  const downloadIdCard = async () => {
    try {
      const res = await studentsApi.idCard(id);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url; a.download = `id-card-${id}.pdf`; a.click();
    } catch { toast.error('Failed to download ID card'); }
  };
  const downloadReportCard = async () => {
    try {
      const res = await studentsApi.reportCard(id);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url; a.download = `report-card-${id}.pdf`; a.click();
    } catch { toast.error('Failed to download report card'); }
  };

  const student = data;
  if (isLoading) return <div className="space-y-6"><PageHeader title="Loading..." breadcrumb="Home / Students" /><div className="h-48 bg-gray-100 rounded-2xl animate-pulse" /></div>;
  if (!student)  return <div className="text-center py-20 text-gray-400">Student not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title={student.user?.name}
        subtitle={`Admission: ${student.admission_number}`}
        breadcrumb="Home / Students / Detail"
        actions={
          <>
            <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => navigate('/students')}>Back</Button>
            <Button variant="secondary" size="sm" icon={Download} onClick={downloadIdCard}>ID Card</Button>
            <Button variant="primary"   size="sm" icon={Download} onClick={downloadReportCard}>Report Card</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Class"      value={student.class?.name ?? '—'}            icon={CheckSquare} color="blue"   />
        <StatCard title="Attendance" value="94%"                                    icon={CheckSquare} color="green"  />
        <StatCard title="GPA"        value={grades?.avg_gpa?.toFixed(2) ?? '—'}     icon={TrendingUp}  color="purple" />
        <StatCard title="Fee Balance" value={`NPR ${balance?.balance ?? 0}`}        icon={CreditCard}  color={balance?.balance > 0 ? 'red' : 'green'} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card>
          <div className="p-6 text-center border-b border-gray-100">
            <Avatar name={student.user?.name} src={student.user?.avatar} size="xl" />
            <p className="font-serif font-bold text-gray-900 mt-3">{student.user?.name}</p>
            <p className="text-sm text-gray-500">{student.class?.name} {student.section?.name}</p>
            <Badge label={student.status} color={statusColor(student.status)} />
          </div>
          <div className="p-4 space-y-3">
            {[['Email', student.user?.email],['Phone', student.user?.phone || '—'],['Gender', student.gender],['DOB', formatDate(student.dob)],['Blood Group', student.blood_group || '—'],['Nationality', student.nationality],['Address', student.address || '—']].map(([k,v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-400">{k}</span>
                <span className="text-gray-700 font-medium capitalize">{v}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Grades chart */}
        <Card title="Academic Performance" className="lg:col-span-2">
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
          <div className="px-5 pb-5">
            <div className="flex gap-3 flex-wrap">
              {[{label:'Promote',color:'primary'},{label:'Transfer',color:'secondary'},{label:'Fees',color:'gold'}].map(btn => (
                <Button key={btn.label} variant={btn.variant ?? 'secondary'} size="sm">{btn.label}</Button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
