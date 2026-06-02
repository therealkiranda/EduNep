import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.yourdomain.com/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

// Request — attach token + language
api.interceptors.request.use(config => {
  const { token, language } = useAuthStore.getState();
  if (token)   config.headers.Authorization    = `Bearer ${token}`;
  config.headers['Accept-Language'] = language || 'en';
  return config;
}, Promise.reject);

// Response — handle 401 logout
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  }
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login:          (data) => api.post('/auth/login', data),
  logout:         ()     => api.post('/auth/logout'),
  me:             ()     => api.get('/auth/me'),
  updateProfile:  (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verify2FA:      (data) => api.post('/auth/verify-2fa', data),
};

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  index:  () => api.get('/dashboard'),
  stats:  () => api.get('/dashboard/stats'),
  charts: () => api.get('/dashboard/charts'),
};

// ─── STUDENTS ────────────────────────────────────────────────────────────────
export const studentsApi = {
  list:       (p) => api.get('/students', { params: p }),
  get:        (id) => api.get(`/students/${id}`),
  attendance: (id, p) => api.get(`/attendance/student/${id}`, { params: p }),
  grades:     (id) => api.get(`/grades/student/${id}`),
  feeBalance: (id) => api.get(`/fees/student/${id}`),
  reportCard: (id) => api.get(`/students/${id}/report-card`, { responseType: 'blob' }),
};

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
export const attendanceApi = {
  today:    ()     => api.get('/attendance/today'),
  summary:  (p)    => api.get('/attendance/summary', { params: p }),
  mark:     (data) => api.post('/attendance/mark', data),
  bulkMark: (data) => api.post('/attendance/bulk-mark', data),
  student:  (id, p) => api.get(`/attendance/student/${id}`, { params: p }),
};

// ─── ASSIGNMENTS ─────────────────────────────────────────────────────────────
export const assignmentsApi = {
  list:       (p)    => api.get('/assignments', { params: p }),
  get:        (id)   => api.get(`/assignments/${id}`),
  submit:     (id, data) => api.post(`/assignments/${id}/submit`, data),
  submissions:(id)   => api.get(`/assignments/${id}/submissions`),
  grade:      (id, data) => api.post(`/assignments/${id}/grade`, data),
};

// ─── EXAMS ───────────────────────────────────────────────────────────────────
export const examsApi = {
  list:    (p)  => api.get('/exams', { params: p }),
  get:     (id) => api.get(`/exams/${id}`),
  results: (id) => api.get(`/exams/${id}/results`),
};

// ─── GRADES ──────────────────────────────────────────────────────────────────
export const gradesApi = {
  student:    (id) => api.get(`/grades/student/${id}`),
  classGrades:(id) => api.get(`/grades/class/${id}`),
  bulkEntry:  (data) => api.post('/grades/bulk-entry', data),
};

// ─── FEES & PAYMENTS ─────────────────────────────────────────────────────────
export const feesApi = {
  studentBalance: (id) => api.get(`/fees/student/${id}`),
  invoices:       (p)  => api.get('/fees/invoices', { params: p }),
  invoice:        (id) => api.get(`/fees/invoices/${id}`),
};

export const paymentsApi = {
  cash:        (data) => api.post('/payments/cash', data),
  bank:        (data) => api.post('/payments/bank', data),
  esewaInit:   (data) => api.post('/payments/esewa/init', data),
  khaltiInit:  (data) => api.post('/payments/khalti/init', data),
  khaltiVerify:(data) => api.post('/payments/khalti/verify', data),
  history:     (p)    => api.get('/payments/history', { params: p }),
};

// ─── MESSAGES ────────────────────────────────────────────────────────────────
export const messagesApi = {
  list:       (p)    => api.get('/messages', { params: p }),
  send:       (data) => api.post('/messages', data),
  get:        (id)   => api.get(`/messages/${id}`),
  markRead:   (id)   => api.post(`/messages/${id}/read`),
  unreadCount:()     => api.get('/messages/unread-count'),
};

// ─── ANNOUNCEMENTS ───────────────────────────────────────────────────────────
export const announcementsApi = {
  list: (p)  => api.get('/announcements', { params: p }),
  get:  (id) => api.get(`/announcements/${id}`),
};

// ─── CALENDAR ────────────────────────────────────────────────────────────────
export const calendarApi = {
  events:   (p)    => api.get('/calendar/events', { params: p }),
  holidays: (p)    => api.get('/calendar/holidays', { params: p }),
  convert:  (p)    => api.get('/calendar/convert', { params: p }),
  create:   (data) => api.post('/calendar/events', data),
};

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
export const notificationsApi = {
  list:       () => api.get('/notifications'),
  markRead:   (id) => api.post(`/notifications/${id}/read`),
  markAllRead:()   => api.post('/notifications/read-all'),
};

// ─── LEAVES ──────────────────────────────────────────────────────────────────
export const leavesApi = {
  list:    (p)    => api.get('/leaves', { params: p }),
  apply:   (data) => api.post('/leaves', data),
  approve: (id)   => api.post(`/leaves/${id}/approve`),
  reject:  (id)   => api.post(`/leaves/${id}/reject`),
};

// ─── TIMETABLE ───────────────────────────────────────────────────────────────
export const timetableApi = {
  myTimetable: ()   => api.get('/timetables'),
  class:       (id) => api.get(`/classes/${id}/timetable`),
};

// ─── LIBRARY ─────────────────────────────────────────────────────────────────
export const libraryApi = {
  books:    (p)    => api.get('/library/books', { params: p }),
  borrow:   (data) => api.post('/library/borrow', data),
  return:   (data) => api.post('/library/return', data),
  borrowed: ()     => api.get('/library/borrowed'),
};

// ─── STAFF ───────────────────────────────────────────────────────────────────
export const staffApi = {
  list: (p) => api.get('/staff', { params: p }),
  get:  (id) => api.get(`/staff/${id}`),
};

// ─── PAYROLL ─────────────────────────────────────────────────────────────────
export const payrollApi = {
  list:    (p)  => api.get('/payroll', { params: p }),
  payslip: (id) => api.get(`/payroll/${id}/payslip`),
};

// ─── SETTINGS ────────────────────────────────────────────────────────────────
export const settingsApi = {
  get:    () => api.get('/settings'),
  update: (d) => api.put('/settings', d),
};

export default api;
