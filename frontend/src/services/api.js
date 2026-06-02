import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  timeout: 30000,
});

// Request interceptor — attach token + language
api.interceptors.request.use(config => {
  const token    = useAuthStore.getState().token;
  const language = useAuthStore.getState().user?.language || localStorage.getItem('language') || 'en';
  if (token)    config.headers.Authorization = `Bearer ${token}`;
  config.headers['Accept-Language'] = language;
  return config;
}, Promise.reject);

// Response interceptor — handle errors globally
api.interceptors.response.use(
  res => res,
  err => {
    const status  = err.response?.status;
    const message = err.response?.data?.message;

    if (status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(err);
    }

    if (status === 403) {
      toast.error('You do not have permission to perform this action.');
      return Promise.reject(err);
    }

    if (status === 422) {
      // Validation errors — handled by form hooks
      return Promise.reject(err);
    }

    if (status === 500) {
      toast.error('Server error. Please try again.');
    }

    if (!err.response) {
      toast.error('No internet connection.');
    }

    return Promise.reject(err);
  }
);

// ─── API SERVICES ────────────────────────────────────────────────────────────

export const authApi = {
  login:          (data) => api.post('/auth/login', data),
  logout:         ()     => api.post('/auth/logout'),
  me:             ()     => api.get('/auth/me'),
  updateProfile:  (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword:  (data) => api.post('/auth/reset-password', data),
  enable2FA:      ()     => api.post('/auth/enable-2fa'),
  verify2FA:      (data) => api.post('/auth/verify-2fa', data),
};

export const dashboardApi = {
  index:  () => api.get('/dashboard'),
  stats:  () => api.get('/dashboard/stats'),
  charts: () => api.get('/dashboard/charts'),
};

export const studentsApi = {
  list:       (params) => api.get('/students', { params }),
  get:        (id)     => api.get(`/students/${id}`),
  create:     (data)   => api.post('/students', data),
  update:     (id, d)  => api.put(`/students/${id}`, d),
  delete:     (id)     => api.delete(`/students/${id}`),
  uploadPhoto:(id, f)  => api.post(`/students/${id}/photo`, f, { headers: {'Content-Type':'multipart/form-data'} }),
  idCard:     (id)     => api.get(`/students/${id}/id-card`, { responseType: 'blob' }),
  transcript: (id)     => api.get(`/students/${id}/transcript`, { responseType: 'blob' }),
  reportCard: (id)     => api.get(`/students/${id}/report-card`, { responseType: 'blob' }),
  promote:    (id, d)  => api.post(`/students/${id}/promote`, d),
  transfer:   (id, d)  => api.post(`/students/${id}/transfer`, d),
  feeBalance: (id)     => api.get(`/students/${id}/fee-balance`),
};

export const staffApi = {
  list:   (params) => api.get('/staff', { params }),
  get:    (id)     => api.get(`/staff/${id}`),
  create: (data)   => api.post('/staff', data),
  update: (id, d)  => api.put(`/staff/${id}`, d),
  delete: (id)     => api.delete(`/staff/${id}`),
  idCard: (id)     => api.get(`/staff/${id}/id-card`, { responseType: 'blob' }),
};

export const attendanceApi = {
  mark:       (data)   => api.post('/attendance/mark', data),
  bulkMark:   (data)   => api.post('/attendance/bulk-mark', data),
  today:      ()       => api.get('/attendance/today'),
  summary:    (params) => api.get('/attendance/summary', { params }),
  student:    (id, p)  => api.get(`/attendance/student/${id}`, { params: p }),
  classReport:(id, p)  => api.get(`/attendance/class/${id}`, { params: p }),
};

export const assignmentsApi = {
  list:       (params) => api.get('/assignments', { params }),
  get:        (id)     => api.get(`/assignments/${id}`),
  create:     (data)   => api.post('/assignments', data),
  update:     (id, d)  => api.put(`/assignments/${id}`, d),
  delete:     (id)     => api.delete(`/assignments/${id}`),
  submit:     (id, d)  => api.post(`/assignments/${id}/submit`, d),
  grade:      (id, d)  => api.post(`/assignments/${id}/grade`, d),
  submissions:(id)     => api.get(`/assignments/${id}/submissions`),
};

export const examsApi = {
  list:    (params) => api.get('/exams', { params }),
  get:     (id)     => api.get(`/exams/${id}`),
  create:  (data)   => api.post('/exams', data),
  update:  (id, d)  => api.put(`/exams/${id}`, d),
  delete:  (id)     => api.delete(`/exams/${id}`),
  publish: (id)     => api.post(`/exams/${id}/publish`),
  results: (id)     => api.get(`/exams/${id}/results`),
  grade:   (id, d)  => api.post(`/exams/${id}/grade`, d),
};

export const gradesApi = {
  list:       (params) => api.get('/grades', { params }),
  bulkEntry:  (data)   => api.post('/grades/bulk-entry', data),
  student:    (id)     => api.get(`/grades/student/${id}`),
  classGrades:(id)     => api.get(`/grades/class/${id}`),
  reportCard: (id)     => api.get(`/grades/report-card/${id}`, { responseType: 'blob' }),
};

export const feesApi = {
  structures:      (params) => api.get('/fee-structures', { params }),
  createStructure: (data)   => api.post('/fee-structures', data),
  invoices:        (params) => api.get('/fees/invoices', { params }),
  invoice:         (id)     => api.get(`/fees/invoices/${id}`),
  invoicePdf:      (id)     => api.get(`/fees/invoices/${id}/pdf`, { responseType: 'blob' }),
  generateInvoices:(data)   => api.post('/fees/generate-invoices', data),
  studentBalance:  (id)     => api.get(`/fees/student/${id}`),
  defaulters:      (params) => api.get('/fees/defaulters', { params }),
};

export const paymentsApi = {
  cash:          (data) => api.post('/payments/cash', data),
  bank:          (data) => api.post('/payments/bank', data),
  esewaInit:     (data) => api.post('/payments/esewa/init', data),
  khaltiInit:    (data) => api.post('/payments/khalti/init', data),
  khaltiVerify:  (data) => api.post('/payments/khalti/verify', data),
  history:       (p)    => api.get('/payments/history', { params: p }),
  receipt:       (id)   => api.get(`/payments/${id}/receipt`, { responseType: 'blob' }),
};

export const payrollApi = {
  list:    (params) => api.get('/payroll', { params }),
  run:     (data)   => api.post('/payroll/run', data),
  approve: (id)     => api.post(`/payroll/${id}/approve`),
  payslip: (id)     => api.get(`/payroll/${id}/payslip`, { responseType: 'blob' }),
};

export const calendarApi = {
  events:   (params) => api.get('/calendar/events', { params }),
  create:   (data)   => api.post('/calendar/events', data),
  update:   (id, d)  => api.put(`/calendar/events/${id}`, d),
  delete:   (id)     => api.delete(`/calendar/events/${id}`),
  holidays: (params) => api.get('/calendar/holidays', { params }),
  convert:  (params) => api.get('/calendar/convert', { params }),
};

export const announcementsApi = {
  list:    (params) => api.get('/announcements', { params }),
  get:     (id)     => api.get(`/announcements/${id}`),
  create:  (data)   => api.post('/announcements', data),
  update:  (id, d)  => api.put(`/announcements/${id}`, d),
  delete:  (id)     => api.delete(`/announcements/${id}`),
  publish: (id)     => api.post(`/announcements/${id}/publish`),
};

export const messagesApi = {
  list:       (params) => api.get('/messages', { params }),
  send:       (data)   => api.post('/messages', data),
  get:        (id)     => api.get(`/messages/${id}`),
  markRead:   (id)     => api.post(`/messages/${id}/read`),
  unreadCount:()       => api.get('/messages/unread-count'),
};

export const notificationsApi = {
  list:       () => api.get('/notifications'),
  markRead:   (id) => api.post(`/notifications/${id}/read`),
  markAllRead:()   => api.post('/notifications/read-all'),
};

export const libraryApi = {
  books:      (params) => api.get('/library/books', { params }),
  addBook:    (data)   => api.post('/library/books', data),
  updateBook: (id, d)  => api.put(`/library/books/${id}`, d),
  borrow:     (data)   => api.post('/library/borrow', data),
  return:     (data)   => api.post('/library/return', data),
  overdue:    ()       => api.get('/library/overdue'),
  borrowed:   ()       => api.get('/library/borrowed'),
};

export const reportsApi = {
  academic:   (params) => api.get('/reports/academic', { params }),
  attendance: (params) => api.get('/reports/attendance', { params }),
  finance:    (params) => api.get('/reports/finance', { params }),
  enrollment: (params) => api.get('/reports/enrollment', { params }),
};

export const settingsApi = {
  get:           () => api.get('/settings'),
  update:        (d) => api.put('/settings', d),
  getGrading:    () => api.get('/settings/grading'),
  updateGrading: (d) => api.put('/settings/grading', d),
};

export default api;
