import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Plus, Download, Eye, CreditCard, ArrowUpRight } from 'lucide-react';
import { studentsApi } from '@/services/api';
import { PageHeader, DataTable, Badge, Avatar, Button } from '@/components/ui';
import { format } from 'date-fns';

const statusColor = { active:'green', inactive:'gray', graduated:'blue', transferred:'orange' };

export default function Students() {
  const { t } = useTranslation();
  const navigate  = useNavigate();
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState('');
  const [classId, setClassId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['students', page, search, classId],
    queryFn:  () => studentsApi.list({ page, search, class_id: classId, per_page: 20 }).then(r => r.data),
    keepPreviousData: true,
  });

  const columns = [
    {
      key: 'user', label: t('name'),
      render: (_, row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.user?.name} src={row.user?.avatar} size="sm" />
          <div>
            <p className="text-sm font-medium text-gray-800">{row.user?.name}</p>
            <p className="text-xs text-gray-400">{row.admission_number}</p>
          </div>
        </div>
      )
    },
    { key: 'class',   label: t('class'),   render: (_, r) => r.class?.name ?? '—' },
    { key: 'section', label: t('section'), render: (_, r) => r.section?.name ?? '—' },
    { key: 'gender',  label: t('gender'),  render: v => <span className="capitalize">{v}</span> },
    {
      key: 'status', label: t('status'),
      render: v => <Badge label={v} color={statusColor[v] ?? 'gray'} />
    },
    {
      key: 'created_at', label: 'Enrolled',
      render: v => v ? format(new Date(v), 'MMM d, yyyy') : '—'
    },
    {
      key: 'actions', label: t('actions'),
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => navigate(`/students/${row.id}`)}
            className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors" title="View">
            <Eye size={14} />
          </button>
          <button onClick={() => navigate(`/finance/invoices?student=${row.id}`)}
            className="p-1.5 rounded-lg hover:bg-gold-50 text-gold-600 transition-colors" title="Fees">
            <CreditCard size={14} />
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('students')}
        subtitle={`${data?.total ?? 0} students enrolled`}
        breadcrumb="Home / Students"
        actions={
          <>
            <Button variant="secondary" size="sm" icon={Download}>Export</Button>
            <Button variant="primary"   size="sm" icon={Plus} onClick={() => navigate('/students/add')}>
              {t('add_student')}
            </Button>
          </>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {['all','active','inactive','graduated','transferred'].map(s => (
          <button key={s}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize
              ${!classId && search === '' && s === 'all' ? 'bg-primary-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}
          >
            {s === 'all' ? 'All Students' : s}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data?.data}
        loading={isLoading}
        searchable
        onSearch={setSearch}
        pagination={data ? { total: data.total, per_page: data.per_page, current_page: data.current_page } : null}
        onPageChange={setPage}
      />
    </div>
  );
}
