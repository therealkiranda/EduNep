import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus, Eye, Download } from 'lucide-react';
import { staffApi } from '@/services/api';
import { PageHeader, DataTable, Badge, Avatar, Button } from '@/components/ui';
import { statusColor } from '@/utils/helpers';
import { format } from 'date-fns';

export default function Staff() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['staff', page, search],
    queryFn: () => staffApi.list({ page, search, per_page: 20 }).then(r => r.data),
    keepPreviousData: true,
  });
  const columns = [
    { key: 'user', label: t('name'), render: (_, r) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={r.user?.name} src={r.user?.avatar} size="sm" />
        <div><p className="text-sm font-medium text-gray-800">{r.user?.name}</p><p className="text-xs text-gray-400">{r.staff_number}</p></div>
      </div>
    )},
    { key: 'designation', label: 'Designation' },
    { key: 'department', label: 'Department', render: (_, r) => r.department?.name || '—' },
    { key: 'employment_type', label: 'Type', render: v => <span className="capitalize text-xs">{v?.replace('_',' ')}</span> },
    { key: 'status', label: t('status'), render: v => <Badge label={v} color={statusColor(v)} /> },
    { key: 'join_date', label: 'Joined', render: v => v ? format(new Date(v),'MMM yyyy') : '—' },
    { key: 'actions', label: '', render: (_, r) => (
      <button onClick={() => navigate(`/staff/${r.id}`)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600"><Eye size={14}/></button>
    )},
  ];
  return (
    <div className="space-y-6">
      <PageHeader title={t('staff')} subtitle={`${data?.total ?? 0} staff members`} breadcrumb="Home / Staff"
        actions={<><Button variant="secondary" size="sm" icon={Download}>Export</Button><Button variant="primary" size="sm" icon={UserPlus}>Add Staff</Button></>} />
      <DataTable columns={columns} data={data?.data} loading={isLoading} searchable onSearch={setSearch}
        pagination={data ? { total: data.total, per_page: data.per_page, current_page: data.current_page } : null} onPageChange={setPage} />
    </div>
  );
}
