import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { DollarSign, Search, Receipt, CheckCircle } from 'lucide-react';
import { paymentsApi, feesApi, studentsApi } from '@/services/api';
import { PageHeader, DataTable, Badge, Button, Modal, FormField, Input, Select, Card } from '@/components/ui';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const methodColors = { cash:'green', bank_transfer:'blue', esewa:'purple', khalti:'orange', qr:'gold' };
const methods = [
  { value:'cash',          label:'💵 Cash',          labelNe:'नगद'            },
  { value:'bank_transfer', label:'🏦 Bank Transfer',  labelNe:'बैंक ट्रान्सफर' },
  { value:'esewa',         label:'🟣 eSewa',          labelNe:'eSewa'          },
  { value:'khalti',        label:'🟠 Khalti',         labelNe:'Khalti'         },
  { value:'qr',            label:'📱 QR Payment',     labelNe:'QR भुक्तानी'    },
];

export default function PaymentRecord() {
  const { t, i18n } = useTranslation();
  const qc           = useQueryClient();
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState('');
  const [method,     setMethod]     = useState('');
  const [addOpen,    setAddOpen]    = useState(false);
  const [selMethod,  setSelMethod]  = useState('cash');
  const [success,    setSuccess]    = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments', page, search, method],
    queryFn:  () => paymentsApi.history({ page, method, per_page: 20 }).then(r => r.data),
    keepPreviousData: true,
  });

  const cashMut = useMutation({
    mutationFn: paymentsApi.cash,
    onSuccess: (r) => { qc.invalidateQueries(['payments']); setSuccess(r.data.payment); setAddOpen(false); reset(); toast.success(t('payment_recorded')); },
    onError: (e) => toast.error(e.response?.data?.message || 'Payment failed'),
  });

  const bankMut = useMutation({
    mutationFn: paymentsApi.bank,
    onSuccess: (r) => { qc.invalidateQueries(['payments']); setSuccess(r.data.payment); setAddOpen(false); reset(); toast.success(t('payment_recorded')); },
    onError: (e) => toast.error(e.response?.data?.message || 'Payment failed'),
  });

  const esewaInitMut = useMutation({
    mutationFn: paymentsApi.esewaInit,
    onSuccess: (r) => {
      const { esewa_url, merchant_code, product_id, amount, success_url, failure_url } = r.data;
      const form = document.createElement('form');
      form.method = 'POST'; form.action = esewa_url;
      [['amt',amount],['txAmt',0],['psc',0],['pdc',0],['scd',merchant_code],['pid',product_id],['su',success_url],['fu',failure_url]]
        .forEach(([n,v]) => { const i = document.createElement('input'); i.type='hidden'; i.name=n; i.value=v; form.appendChild(i); });
      document.body.appendChild(form); form.submit();
    },
    onError: (e) => toast.error('eSewa init failed'),
  });

  const khaltiInitMut = useMutation({
    mutationFn: paymentsApi.khaltiInit,
    onSuccess: (r) => { window.location.href = r.data.payment_url; },
    onError: () => toast.error('Khalti init failed'),
  });

  const onSubmit = (data) => {
    const payload = { ...data, amount: parseFloat(data.amount) };
    if (selMethod === 'cash')          cashMut.mutate(payload);
    else if (selMethod === 'bank_transfer') bankMut.mutate(payload);
    else if (selMethod === 'esewa')    esewaInitMut.mutate(payload);
    else if (selMethod === 'khalti')   khaltiInitMut.mutate(payload);
    else toast.error('Payment method not supported yet');
  };

  const downloadReceipt = async (id) => {
    const res = await paymentsApi.receipt(id);
    const url = URL.createObjectURL(res.data);
    const a   = document.createElement('a'); a.href = url; a.download = `receipt-${id}.pdf`; a.click();
  };

  const columns = [
    {
      key: 'student', label: t('students'),
      render: (_, r) => (
        <div>
          <p className="text-sm font-medium text-gray-800">{r.student?.user?.name}</p>
          <p className="text-xs text-gray-400">{r.reference}</p>
        </div>
      )
    },
    {
      key: 'method', label: t('payment_method'),
      render: v => <Badge label={v?.replace('_',' ')} color={methodColors[v] ?? 'gray'} />
    },
    {
      key: 'amount', label: t('amount'),
      render: v => <span className="font-semibold text-emerald-600">NPR {Number(v).toLocaleString()}</span>
    },
    {
      key: 'status', label: t('status'),
      render: v => <Badge label={v} color={v==='completed'?'green':v==='pending'?'gold':'red'} />
    },
    {
      key: 'paid_at', label: t('date'),
      render: v => v ? format(new Date(v),'MMM d, yyyy') : '—'
    },
    {
      key: 'actions', label: '',
      render: (_, r) => (
        <button onClick={() => downloadReceipt(r.id)}
          className="p-1.5 rounded-lg hover:bg-gold-50 text-gold-600 transition-colors" title="Download Receipt">
          <Receipt size={14} />
        </button>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('payments')}
        subtitle="Record and track all fee payments"
        breadcrumb="Home / Finance / Payments"
        actions={
          <Button variant="primary" size="sm" icon={DollarSign} onClick={() => setAddOpen(true)}>
            Record Payment
          </Button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {methods.map(m => (
          <div key={m.value} className={clsx(
            'bg-white rounded-xl p-3 border cursor-pointer transition-all text-center',
            method === m.value ? 'border-primary-400 bg-primary-50' : 'border-gray-100 hover:border-primary-200'
          )} onClick={() => setMethod(method === m.value ? '' : m.value)}>
            <p className="text-lg mb-1">{m.label.split(' ')[0]}</p>
            <p className="text-xs font-semibold text-gray-700">{m.label.split(' ').slice(1).join(' ')}</p>
            {i18n.language === 'ne' && <p className="text-[10px] text-gray-400 font-devanagari">{m.labelNe}</p>}
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={payments?.data}
        loading={isLoading}
        searchable
        onSearch={setSearch}
        pagination={payments ? { total: payments.total, per_page: payments.per_page, current_page: payments.current_page } : null}
        onPageChange={setPage}
      />

      {/* Record Payment Modal */}
      <Modal open={addOpen} onClose={() => { setAddOpen(false); reset(); }} title="Record Payment" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Method selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('payment_method')}</label>
            <div className="grid grid-cols-3 gap-2">
              {methods.map(m => (
                <button key={m.value} type="button" onClick={() => setSelMethod(m.value)}
                  className={clsx(
                    'py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center',
                    selMethod === m.value
                      ? 'bg-primary-500 text-white border-primary-500 shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                  )}>
                  <div className="text-base mb-0.5">{m.label.split(' ')[0]}</div>
                  <div>{m.label.split(' ').slice(1).join(' ')}</div>
                </button>
              ))}
            </div>
          </div>

          <FormField label="Invoice ID" required error={errors.invoice_id?.message}>
            <Input type="number" {...register('invoice_id', { required: 'Invoice ID required' })} placeholder="Enter invoice ID" />
          </FormField>

          <FormField label="Amount (NPR)" required error={errors.amount?.message}>
            <Input type="number" step="0.01" {...register('amount', { required: 'Amount required', min: { value: 1, message: 'Min NPR 1' } })}
              placeholder="e.g. 15000" />
          </FormField>

          {selMethod === 'bank_transfer' && (
            <>
              <FormField label="Bank Reference Number" required error={errors.reference?.message}>
                <Input {...register('reference', { required: 'Reference required' })} placeholder="e.g. TXN123456" />
              </FormField>
              <FormField label="Bank Name">
                <Input {...register('bank_name')} placeholder="e.g. Nepal Bank Limited" />
              </FormField>
            </>
          )}

          {selMethod === 'cash' && (
            <FormField label="Note">
              <Input {...register('note')} placeholder="Optional note" />
            </FormField>
          )}

          {(selMethod === 'esewa' || selMethod === 'khalti') && (
            <div className="p-3 bg-primary-50 rounded-xl border border-primary-100 text-xs text-primary-700">
              You will be redirected to {selMethod === 'esewa' ? 'eSewa' : 'Khalti'} to complete the payment.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => { setAddOpen(false); reset(); }}>Cancel</Button>
            <Button variant="primary" type="submit"
              loading={cashMut.isPending || bankMut.isPending || esewaInitMut.isPending || khaltiInitMut.isPending}>
              {selMethod === 'cash' || selMethod === 'bank_transfer' ? 'Record Payment' : `Pay via ${selMethod}`}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Success modal */}
      <Modal open={!!success} onClose={() => setSuccess(null)} title="Payment Recorded" size="sm">
        {success && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
            <div>
              <p className="font-serif font-bold text-gray-900 text-lg">Payment Successful!</p>
              <p className="text-gray-500 text-sm mt-1">NPR {Number(success.amount).toLocaleString()} recorded via {success.method?.replace('_',' ')}</p>
              <p className="text-xs text-gray-400 mt-1">Ref: {success.reference}</p>
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={() => setSuccess(null)}>Close</Button>
              <Button variant="gold" icon={Receipt} onClick={() => { downloadReceipt(success.id); setSuccess(null); }}>Download Receipt</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
