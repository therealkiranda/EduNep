export const formatNPR = (amount, short = false) => {
  const n = Number(amount || 0);
  if (short && n >= 100000) return `NPR ${(n/100000).toFixed(1)}L`;
  if (short && n >= 1000)   return `NPR ${(n/1000).toFixed(1)}K`;
  return `NPR ${n.toLocaleString('en-IN')}`;
};

export const toDevanagari = (num) => {
  const map = {'0':'०','1':'१','2':'२','3':'३','4':'४','5':'५','6':'६','7':'७','8':'८','9':'९'};
  return String(num).replace(/[0-9]/g, d => map[d]);
};

export const statusColor = (status) => ({
  active:'#10B981', inactive:'#6B7280', paid:'#10B981', unpaid:'#EF4444',
  partial:'#F59E0B', present:'#10B981', absent:'#EF4444', late:'#F59E0B',
  approved:'#10B981', rejected:'#EF4444', pending:'#F59E0B',
})[status] || '#6B7280';

export const paymentIcon = (method) => ({
  cash:'💵', bank_transfer:'🏦', esewa:'🟣', khalti:'🟠', qr:'📱',
})[method] || '💳';

export const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

export const NEPALI_MONTHS = ['बैशाख','जेठ','असार','श्रावण','भाद्र','आश्विन','कार्तिक','मंसिर','पौष','माघ','फाल्गुन','चैत्र'];
