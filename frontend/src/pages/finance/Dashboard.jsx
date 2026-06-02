import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { DollarSign, CreditCard, AlertTriangle, TrendingUp } from 'lucide-react';
import { feesApi, paymentsApi } from '@/services/api';
import { StatCard, Card, Badge, PageHeader } from '@/components/ui';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatNPR, paymentMethodIcon } from '@/utils/helpers';
import { format } from 'date-fns';

export default function FinanceDashboard() {
  const { t } = useTranslation();
  const { data: payments } = useQuery({ queryKey:['payments-recent'], queryFn: () => paymentsApi.history({ per_page:5 }).then(r => r.data) });
  const { data: defaulters } = useQuery({ queryKey:['defaulters'], queryFn: () => feesApi.defaulters({}).then(r => r.data) });

  return (
    <div className="space-y-6">
      <PageHeader title="Finance Dashboard" subtitle="Fee collection and financial overview" breadcrumb="Home / Finance" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Collected This Month" value="NPR 4.2L" icon={DollarSign}    color="green" />
        <StatCard title="Pending Invoices"     value="48"       icon={CreditCard}    color="gold"  />
        <StatCard title="Defaulters"           value="12"       icon={AlertTriangle} color="red"   />
        <StatCard title="Collection Rate"      value="87%"      icon={TrendingUp}    color="blue"  />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Monthly Fee Collection (NPR)">
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[{m:'Baisakh',v:320000},{m:'Jestha',v:280000},{m:'Ashadh',v:410000},{m:'Shrawan',v:360000},{m:'Bhadra',v:420000}]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>
                <XAxis dataKey="m" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:11}} tickFormatter={v=>`${v/1000}k`}/>
                <Tooltip formatter={v=>[formatNPR(v),'Collected']}/>
                <Bar dataKey="v" fill="#C8A951" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Recent Payments">
          <div className="divide-y divide-gray-50">
            {payments?.data?.map(p => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{paymentMethodIcon(p.method)}</span>
                  <div><p className="text-sm font-medium">{p.student?.user?.name}</p><p className="text-xs text-gray-400">{p.method?.replace('_',' ')}</p></div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-600">{formatNPR(p.amount)}</p>
                  <p className="text-xs text-gray-400">{p.paid_at ? format(new Date(p.paid_at),'MMM d') : '—'}</p>
                </div>
              </div>
            )) ?? <p className="px-5 py-8 text-center text-sm text-gray-400">No recent payments</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
