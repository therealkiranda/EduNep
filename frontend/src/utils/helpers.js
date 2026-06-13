import { format, formatDistanceToNow } from 'date-fns';

export const formatNPR = (amount, short=false) => {
  const n = Number(amount||0);
  if(short&&n>=100000) return `NPR ${(n/100000).toFixed(1)}L`;
  if(short&&n>=1000)   return `NPR ${(n/1000).toFixed(1)}K`;
  return `NPR ${n.toLocaleString('en-IN')}`;
};

export const formatDate     = (d,fmt='MMM d, yyyy') => d ? format(new Date(d),fmt) : '—';
export const formatDateTime = (d) => d ? format(new Date(d),'MMM d, yyyy h:mm a') : '—';
export const timeAgo        = (d) => d ? formatDistanceToNow(new Date(d),{addSuffix:true}) : '—';

export const statusColor = (s) => ({
  active:'green', inactive:'gray', paid:'green', unpaid:'red', partial:'orange',
  completed:'green', pending:'gold', failed:'red', approved:'green', rejected:'red',
  present:'green', absent:'red', late:'orange', excused:'blue',
  published:'blue', draft:'gray', graduated:'purple', transferred:'orange',
})[s] || 'gray';

export const paymentMethodIcon = (m) => ({cash:'💵',bank_transfer:'🏦',esewa:'🟣',khalti:'🟠',qr:'📱',cheque:'📄'})[m] || '💳';
export const paymentMethodLabel = (m) => ({cash:'Cash',bank_transfer:'Bank Transfer',esewa:'eSewa',khalti:'Khalti',qr:'QR Payment',cheque:'Cheque'})[m] || m;

export const capitalize = (s) => s ? s.charAt(0).toUpperCase()+s.slice(1) : '';
export const truncate   = (s,n=50) => s&&s.length>n ? s.slice(0,n)+'…' : (s||'');

export const downloadBlob = (blob, filename) => {
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download=filename; a.click();
  URL.revokeObjectURL(url);
};

export const getGradeColor = (grade) => {
  if(!grade) return 'gray';
  const g=grade.toUpperCase();
  if(g.startsWith('A')) return 'green';
  if(g.startsWith('B')) return 'blue';
  if(g.startsWith('C')) return 'gold';
  if(g.startsWith('D')) return 'orange';
  return 'red';
};
