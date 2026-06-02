import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CheckSquare, Download } from 'lucide-react';
import { attendanceApi } from '@/services/api';
import { PageHeader, DataTable, Badge, Button, StatCard, Card } from '@/components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { statusColor } from '@/utils/helpers';

export default function Attendance() {
  const { t } = useTranslation();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { data: today, isLoading } = useQuery({
    queryKey: ['attendance-today', date],
    queryFn: () => attendanceApi.today().then(r => r.data),
    refetchInterval: 60000,
  });
  const { data: summary } = useQuery({
    queryKey: ['attendance-summary'],
    queryFn: () => attendanceApi.summary({}).then(r => r.data),
  });
  const columns = [
    { key: 'student', label: 'Student', render: (_, r) => <div><p className="font-medium text-sm">{r.student?.user?.name}</p><p className="text-xs text-gray-400">{r.student?.admission_number}</p></div> },
    { key: 'class', label: 'Class', render: (_, r) => r.class?.name || '—' },
    { key: 'status', label: 'Status', render: v => <Badge label={v} color={statusColor(v)} /> },
    { key: 'marked_by', label: 'Marked By', render: (_, r) => r.marker?.name || '—' },
    { key: 'date', label: 'Date', render: v => v ? format(new Date(v), 'MMM d, yyyy') : '—' },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title={t('attendance')} subtitle="Daily attendance tracking" breadcrumb="Home / Attendance"
        actions={<><input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-200" /><Button variant="secondary" size="sm" icon={Download}>Export</Button></>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Present Today"  value={today?.present  ?? '—'} icon={CheckSquare} color="green" />
        <StatCard title="Absent Today"   value={today?.absent   ?? '—'} icon={CheckSquare} color="red"   />
        <StatCard title="Late Today"     value={today?.late     ?? '—'} icon={CheckSquare} color="gold"  />
        <StatCard title="Attendance Rate" value={`${today?.rate ?? 0}%`} icon={CheckSquare} color="blue"  />
      </div>
      <Card title="Weekly Attendance Trend">
        <div className="p-5">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={summary?.weekly ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis domain={[0,100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => [`${v}%`]} />
              <Bar dataKey="rate" fill="#1B6CA8" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <DataTable columns={columns} data={today?.records ?? []} loading={isLoading} />
    </div>
  );
}
