import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CheckSquare, Save } from 'lucide-react';
import { attendanceApi } from '@/services/api';
import { PageHeader, Button, Card, Badge } from '@/components/ui';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const mockStudents = [
  { id:1, name:'Aarav Sharma',     admission:'EDU-2025-0001' },
  { id:2, name:'Sita Thapa',       admission:'EDU-2025-0002' },
  { id:3, name:'Ram Bahadur KC',   admission:'EDU-2025-0003' },
  { id:4, name:'Puja Gurung',      admission:'EDU-2025-0004' },
  { id:5, name:'Bikash Shrestha',  admission:'EDU-2025-0005' },
];

const statusOptions = [
  { value:'present', label:'Present', color:'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { value:'absent',  label:'Absent',  color:'bg-red-100 text-red-700 border-red-300'             },
  { value:'late',    label:'Late',    color:'bg-amber-100 text-amber-700 border-amber-300'        },
  { value:'excused', label:'Excused', color:'bg-blue-100 text-blue-700 border-blue-300'           },
];

export default function AttendanceMark() {
  const { t } = useTranslation();
  const [date]     = useState(new Date().toISOString().split('T')[0]);
  const [statuses, setStatuses] = useState(Object.fromEntries(mockStudents.map(s => [s.id, 'present'])));
  const mutation = useMutation({
    mutationFn: attendanceApi.bulkMark,
    onSuccess: () => toast.success('Attendance saved!'),
    onError:   () => toast.error('Failed to save attendance'),
  });

  const markAll = (status) => setStatuses(Object.fromEntries(mockStudents.map(s => [s.id, status])));

  const handleSubmit = () => {
    const records = mockStudents.map(s => ({ student_id: s.id, date, status: statuses[s.id] }));
    mutation.mutate({ records });
  };

  const presentCount = Object.values(statuses).filter(s => s === 'present').length;

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Mark Attendance" subtitle={`Date: ${date}`} breadcrumb="Home / Attendance / Mark"
        actions={<Button variant="primary" icon={Save} onClick={handleSubmit} loading={mutation.isPending}>Save Attendance</Button>} />

      <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 shadow-card">
        <div className="flex items-center gap-4">
          <div className="text-center"><p className="text-2xl font-bold text-primary-600">{presentCount}/{mockStudents.length}</p><p className="text-xs text-gray-400">Present</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-emerald-600">{Math.round((presentCount/mockStudents.length)*100)}%</p><p className="text-xs text-gray-400">Rate</p></div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => markAll('present')} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors">Mark All Present</button>
          <button onClick={() => markAll('absent')}  className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors">Mark All Absent</button>
        </div>
      </div>

      <Card>
        <div className="divide-y divide-gray-50">
          {mockStudents.map((student, i) => (
            <div key={student.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 font-bold text-sm flex items-center justify-center">{i+1}</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{student.name}</p>
                  <p className="text-xs text-gray-400">{student.admission}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {statusOptions.map(opt => (
                  <button key={opt.value} onClick={() => setStatuses(s => ({ ...s, [student.id]: opt.value }))}
                    className={clsx('px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all', statuses[student.id] === opt.value ? opt.color : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300')}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
