import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import { useAuthStore } from '@/store/authStore';
import '@/locales/i18n';
import { ErrorBoundary } from '@/ErrorBoundary';

// Layout
const AdminLayout  = lazy(() => import('@/components/layout/AdminLayout'));
const AuthLayout   = lazy(() => import('@/components/layout/AuthLayout'));

// Auth pages
const Login        = lazy(() => import('@/pages/auth/Login'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));

// Admin pages
const Dashboard    = lazy(() => import('@/pages/admin/Dashboard'));
const Students     = lazy(() => import('@/pages/admin/Students'));
const StudentDetail= lazy(() => import('@/pages/admin/StudentDetail'));
const AddStudent   = lazy(() => import('@/pages/admin/AddStudent'));
const Staff        = lazy(() => import('@/pages/admin/Staff'));
const StaffDetail  = lazy(() => import('@/pages/admin/StaffDetail'));
const Classes      = lazy(() => import('@/pages/admin/Classes'));
const Timetable    = lazy(() => import('@/pages/admin/Timetable'));
const Announcements= lazy(() => import('@/pages/admin/Announcements'));
const Calendar     = lazy(() => import('@/pages/admin/Calendar'));
const Settings     = lazy(() => import('@/pages/admin/Settings'));
const Profile      = lazy(() => import('@/pages/admin/Profile'));

// Teacher pages
const TeacherDashboard  = lazy(() => import('@/pages/teacher/Dashboard'));
const AttendanceMark    = lazy(() => import('@/pages/teacher/AttendanceMark'));
const AssignmentsList   = lazy(() => import('@/pages/teacher/Assignments'));
const GradeEntry        = lazy(() => import('@/pages/teacher/GradeEntry'));
const ExamsList         = lazy(() => import('@/pages/teacher/Exams'));

// Finance pages
const FinanceDashboard  = lazy(() => import('@/pages/finance/Dashboard'));
const FeeStructures     = lazy(() => import('@/pages/finance/FeeStructures'));
const Invoices          = lazy(() => import('@/pages/finance/Invoices'));
const PaymentRecord     = lazy(() => import('@/pages/finance/PaymentRecord'));
const PayrollPage       = lazy(() => import('@/pages/finance/Payroll'));
const Defaulters        = lazy(() => import('@/pages/finance/Defaulters'));

// Student pages
const StudentDashboard  = lazy(() => import('@/pages/student/Dashboard'));
const StudentGrades     = lazy(() => import('@/pages/student/Grades'));
const StudentFees       = lazy(() => import('@/pages/student/Fees'));
const StudentAssignments= lazy(() => import('@/pages/student/Assignments'));

// Shared pages
const Messages          = lazy(() => import('@/pages/admin/Messages'));
const Library           = lazy(() => import('@/pages/admin/Library'));
const Reports           = lazy(() => import('@/pages/admin/Reports'));
const Attendance        = lazy(() => import('@/pages/admin/Attendance'));
const Grades            = lazy(() => import('@/pages/admin/Grades'));
const Exams             = lazy(() => import('@/pages/admin/Exams'));
const Leaves            = lazy(() => import('@/pages/admin/Leaves'));
const NotFound          = lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function ProtectedRoute({ children, roles }) {
  const { user, token } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { token } = useAuthStore();
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-primary-600 font-medium">Loading EduNep...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route element={<AuthLayout />}>
              <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            </Route>

            {/* Protected — admin shell */}
            <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route path="/"              element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"     element={<Dashboard />} />
              <Route path="/profile"       element={<Profile />} />
              <Route path="/settings"      element={<Settings />} />
              <Route path="/calendar"      element={<Calendar />} />
              <Route path="/messages"      element={<Messages />} />
              <Route path="/library"       element={<Library />} />
              <Route path="/reports"       element={<Reports />} />
              <Route path="/attendance"    element={<Attendance />} />
              <Route path="/grades"        element={<Grades />} />
              <Route path="/exams"         element={<Exams />} />
              <Route path="/leaves"        element={<Leaves />} />
              <Route path="/announcements" element={<Announcements />} />

              {/* Students */}
              <Route path="/students"              element={<Students />} />
              <Route path="/students/add"          element={<AddStudent />} />
              <Route path="/students/:id"          element={<StudentDetail />} />

              {/* Staff */}
              <Route path="/staff"         element={<Staff />} />
              <Route path="/staff/:id"     element={<StaffDetail />} />

              {/* Classes */}
              <Route path="/classes"       element={<Classes />} />
              <Route path="/timetable"     element={<Timetable />} />

              {/* Finance */}
              <Route path="/finance"           element={<FinanceDashboard />} />
              <Route path="/finance/fees"      element={<FeeStructures />} />
              <Route path="/finance/invoices"  element={<Invoices />} />
              <Route path="/finance/payment"   element={<PaymentRecord />} />
              <Route path="/finance/payroll"   element={<PayrollPage />} />
              <Route path="/finance/defaulters"element={<Defaulters />} />

              {/* Teacher specific */}
              <Route path="/teacher/attendance" element={<AttendanceMark />} />
              <Route path="/teacher/assignments"element={<AssignmentsList />} />
              <Route path="/teacher/grades"     element={<GradeEntry />} />
              <Route path="/teacher/exams"      element={<ExamsList />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        success: { style: { background: '#10B981', color: 'white' } },
        error:   { style: { background: '#EF4444', color: 'white' } },
        duration: 4000,
      }} />
    </QueryClientProvider>
    </ErrorBoundary>
  );
}
