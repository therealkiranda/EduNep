import { format, formatDistanceToNow } from 'date-fns';

// ─── CURRENCY ─────────────────────────────────────────────────────────────────
export const formatNPR = (amount, short = false) => {
  const n = Number(amount || 0);
  if (short && n >= 100000) return `NPR ${(n / 100000).toFixed(1)}L`;
  if (short && n >= 1000)   return `NPR ${(n / 1000).toFixed(1)}K`;
  return `NPR ${n.toLocaleString('en-IN')}`;
};

// ─── DATES ───────────────────────────────────────────────────────────────────
export const formatDate     = (d, fmt = 'MMM d, yyyy') => d ? format(new Date(d), fmt) : '—';
export const formatDateTime = (d) => d ? format(new Date(d), 'MMM d, yyyy h:mm a') : '—';
export const timeAgo        = (d) => d ? formatDistanceToNow(new Date(d), { addSuffix: true }) : '—';

// ─── DEVANAGARI DIGITS ───────────────────────────────────────────────────────
export const toDevanagari = (num) => {
  const map = { '0':'०','1':'१','2':'२','3':'३','4':'४','5':'५','6':'६','7':'७','8':'८','9':'९' };
  return String(num).replace(/[0-9]/g, d => map[d]);
};

// ─── GRADE HELPERS ───────────────────────────────────────────────────────────
export const getGradeColor = (grade) => {
  if (!grade) return 'gray';
  const g = grade.toUpperCase();
  if (g.startsWith('A')) return 'green';
  if (g.startsWith('B')) return 'blue';
  if (g.startsWith('C')) return 'gold';
  if (g.startsWith('D')) return 'orange';
  return 'red';
};

export const getGradeLabel = (marks) => {
  if (marks >= 90) return { grade: 'A+', gpa: 4.0, label: 'Outstanding' };
  if (marks >= 80) return { grade: 'A',  gpa: 3.6, label: 'Excellent'   };
  if (marks >= 70) return { grade: 'B+', gpa: 3.2, label: 'Very Good'   };
  if (marks >= 60) return { grade: 'B',  gpa: 2.8, label: 'Good'        };
  if (marks >= 50) return { grade: 'C+', gpa: 2.4, label: 'Satisfactory'};
  if (marks >= 40) return { grade: 'C',  gpa: 2.0, label: 'Acceptable'  };
  if (marks >= 35) return { grade: 'D',  gpa: 1.6, label: 'Partially'   };
  return                   { grade: 'F',  gpa: 0.0, label: 'Failed'      };
};

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
export const getAttendanceColor = (rate) => {
  if (rate >= 90) return 'text-emerald-600';
  if (rate >= 75) return 'text-amber-600';
  return 'text-red-600';
};

export const getAttendanceBg = (rate) => {
  if (rate >= 90) return 'bg-emerald-50 border-emerald-200';
  if (rate >= 75) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
};

// ─── PAYMENT ─────────────────────────────────────────────────────────────────
export const paymentMethodIcon = (method) => ({
  cash:          '💵',
  bank_transfer: '🏦',
  esewa:         '🟣',
  khalti:        '🟠',
  qr:            '📱',
  cheque:        '📄',
})[method] || '💳';

export const paymentMethodLabel = (method) => ({
  cash:          'Cash',
  bank_transfer: 'Bank Transfer',
  esewa:         'eSewa',
  khalti:        'Khalti',
  qr:            'QR Payment',
  cheque:        'Cheque',
})[method] || method;

// ─── STRING ───────────────────────────────────────────────────────────────────
export const capitalize  = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
export const titleCase   = (s) => s ? s.split(' ').map(capitalize).join(' ') : '';
export const truncate    = (s, n = 50) => s && s.length > n ? s.slice(0, n) + '…' : (s || '');
export const slugify     = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ─── FILE ─────────────────────────────────────────────────────────────────────
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

export const formatFileSize = (bytes) => {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1048576)    return `${(bytes/1024).toFixed(1)} KB`;
  return                         `${(bytes/1048576).toFixed(1)} MB`;
};

// ─── STATUS BADGE COLOR ───────────────────────────────────────────────────────
export const statusColor = (status) => ({
  active:      'green',  inactive:    'gray',
  paid:        'green',  unpaid:      'red',   partial: 'orange',
  completed:   'green',  pending:     'gold',  failed:  'red',
  approved:    'green',  rejected:    'red',
  present:     'green',  absent:      'red',   late: 'orange', excused: 'blue',
  published:   'blue',   draft:       'gray',
  graduated:   'purple', transferred: 'orange',
})[status] || 'gray';

// ─── NEPALI MONTHS ────────────────────────────────────────────────────────────
export const NEPALI_MONTHS_EN = ['Baisakh','Jestha','Ashadh','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra'];
export const NEPALI_MONTHS_NE = ['बैशाख','जेठ','असार','श्रावण','भाद्र','आश्विन','कार्तिक','मंसिर','पौष','माघ','फाल्गुन','चैत्र'];
export const NEPALI_DAYS_NE   = ['आइत','सोम','मंगल','बुध','बिही','शुक्र','शनि'];
