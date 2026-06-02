import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download } from 'lucide-react';
import { staffApi } from '@/services/api';
import { PageHeader, Button, Card, Badge, Avatar } from '@/components/ui';
import { statusColor, formatDate } from '@/utils/helpers';

export default function StaffDetail() {
  const { id }   = useParams();
  const { t }    = useTranslation();
  const navigate = useNavigate();
  const { data: staff, isLoading } = useQuery({
    queryKey: ['staff', id],
    queryFn:  () => staffApi.get(id).then(r => r.data.staff),
  });

  if (isLoading) return <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />;
  if (!staff)    return <div className="text-center py-20 text-gray-400">Staff not found.</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title={staff.user?.name} subtitle={staff.designation} breadcrumb="Home / Staff / Detail"
        actions={<Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => navigate('/staff')}>Back</Button>} />
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <div className="p-6 text-center border-b border-gray-100">
            <Avatar name={staff.user?.name} src={staff.user?.avatar} size="xl" />
            <p className="font-serif font-bold text-gray-900 mt-3">{staff.user?.name}</p>
            <p className="text-sm text-gray-500">{staff.designation}</p>
            <Badge label={staff.status} color={statusColor(staff.status)} />
          </div>
          <div className="p-4 space-y-3">
            {[['Staff No.', staff.staff_number],['Email', staff.user?.email],['Phone', staff.user?.phone || '—'],['Department', staff.department?.name || '—'],['Type', staff.employment_type],['Joined', formatDate(staff.join_date)]].map(([k,v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-400">{k}</span>
                <span className="text-gray-700 font-medium capitalize">{v}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Payroll Summary" className="lg:col-span-2">
          <div className="p-5 text-center text-gray-400 py-16">Payroll history will appear here.</div>
        </Card>
      </div>
    </div>
  );
}
