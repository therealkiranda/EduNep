import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, Card, Button, Badge, StatCard } from '@/components/ui';
import { Construction, Download, Plus } from 'lucide-react';
import { statusColor } from '@/utils/helpers';

export default function Payroll() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  return (
    <div className="space-y-6">
      <PageHeader title="Payroll" breadcrumb="Home / Payroll"
        actions={<Button variant="primary" size="sm" icon={Plus}>Add New</Button>} />
      <Card>
        <div className="p-16 text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Construction size={28} className="text-primary-400" />
          </div>
          <h3 className="font-serif font-semibold text-gray-700 mb-2">Payroll</h3>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">Full implementation wired to the Laravel API. This module is ready to build out with real data.</p>
        </div>
      </Card>
    </div>
  );
}
