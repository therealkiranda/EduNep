<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\InstitutionController;
use App\Http\Controllers\Api\V1\AcademicYearController;
use App\Http\Controllers\Api\V1\TermController;
use App\Http\Controllers\Api\V1\DepartmentController;
use App\Http\Controllers\Api\V1\ClassController;
use App\Http\Controllers\Api\V1\StudentController;
use App\Http\Controllers\Api\V1\StaffController;
use App\Http\Controllers\Api\V1\SubjectController;
use App\Http\Controllers\Api\V1\TimetableController;
use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\AssignmentController;
use App\Http\Controllers\Api\V1\ExamController;
use App\Http\Controllers\Api\V1\GradeController;
use App\Http\Controllers\Api\V1\FeeController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\PayrollController;
use App\Http\Controllers\Api\V1\LibraryController;
use App\Http\Controllers\Api\V1\AnnouncementController;
use App\Http\Controllers\Api\V1\MessageController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\CalendarController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\LeaveController;
use App\Http\Controllers\Api\V1\SettingsController;

// ─── PUBLIC ROUTES ─────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {

    // Auth
    Route::prefix('auth')->middleware(['throttle:10,1'])->group(function () {
        Route::post('login',          [AuthController::class, 'login']);
        Route::post('forgot-password',[AuthController::class, 'forgotPassword']);
        Route::post('reset-password', [AuthController::class, 'resetPassword']);
        Route::post('verify-otp',     [AuthController::class, 'verifyOtp']);
    });

    // Payment Callbacks (webhooks - no auth needed)
    Route::post('payments/esewa/callback',  [PaymentController::class, 'esewaCallback']);
    Route::post('payments/khalti/callback', [PaymentController::class, 'khaltiCallback']);

    // ─── PROTECTED ROUTES ───────────────────────────────────────────────
    Route::middleware(['auth:sanctum'])->group(function () {

        // Auth
        Route::prefix('auth')->middleware(['throttle:10,1'])->group(function () {
            Route::post('logout',          [AuthController::class, 'logout']);
            Route::post('refresh',         [AuthController::class, 'refresh']);
            Route::get('me',               [AuthController::class, 'me']);
            Route::put('profile',          [AuthController::class, 'updateProfile']);
            Route::put('change-password',  [AuthController::class, 'changePassword']);
            Route::post('enable-2fa',      [AuthController::class, 'enable2FA']);
            Route::post('verify-2fa',      [AuthController::class, 'verify2FA']);
        });

        // Dashboard
        Route::get('dashboard',            [DashboardController::class, 'index']);
        Route::get('dashboard/stats',      [DashboardController::class, 'stats']);
        Route::get('dashboard/charts',     [DashboardController::class, 'charts']);

        // Users & Roles
        Route::apiResource('users', UserController::class);
        Route::get('roles',                [UserController::class, 'roles']);
        Route::post('users/{user}/assign-role', [UserController::class, 'assignRole']);

        // Institutions
        Route::apiResource('institutions', InstitutionController::class);
        Route::post('institutions/{institution}/logo', [InstitutionController::class, 'uploadLogo']);

        // Academic Years & Terms
        Route::apiResource('academic-years', AcademicYearController::class);
        Route::post('academic-years/{year}/set-current', [AcademicYearController::class, 'setCurrent']);
        Route::apiResource('terms', TermController::class);
        Route::post('terms/{term}/set-current', [TermController::class, 'setCurrent']);

        // Departments & Classes
        Route::apiResource('departments', DepartmentController::class);
        Route::apiResource('classes',     ClassController::class);
        Route::get('classes/{class}/students',  [ClassController::class, 'students']);
        Route::get('classes/{class}/timetable', [ClassController::class, 'timetable']);

        // Students
        Route::apiResource('students', StudentController::class);
        Route::post('students/{student}/photo',    [StudentController::class, 'uploadPhoto']);
        Route::get('students/{student}/id-card',   [StudentController::class, 'idCard']);
        Route::get('students/{student}/transcript',[StudentController::class, 'transcript']);
        Route::post('students/{student}/promote',  [StudentController::class, 'promote']);
        Route::post('students/{student}/transfer', [StudentController::class, 'transfer']);
        Route::get('students/{student}/report-card',[StudentController::class, 'reportCard']);
        Route::get('students/{student}/fee-balance',[StudentController::class, 'feeBalance']);

        // Staff
        Route::apiResource('staff', StaffController::class);
        Route::post('staff/{staff}/photo',   [StaffController::class, 'uploadPhoto']);
        Route::get('staff/{staff}/id-card',  [StaffController::class, 'idCard']);
        Route::get('staff/{staff}/payslips', [StaffController::class, 'payslips']);

        // Subjects & Timetable
        Route::apiResource('subjects',   SubjectController::class);
        Route::apiResource('timetables', TimetableController::class);

        // Attendance
        Route::post('attendance/mark',        [AttendanceController::class, 'mark']);
        Route::post('attendance/bulk-mark',   [AttendanceController::class, 'bulkMark']);
        Route::get('attendance/summary',      [AttendanceController::class, 'summary']);
        Route::get('attendance/student/{student}', [AttendanceController::class, 'studentReport']);
        Route::get('attendance/class/{class}',     [AttendanceController::class, 'classReport']);
        Route::get('attendance/today',        [AttendanceController::class, 'today']);

        // Assignments
        Route::apiResource('assignments', AssignmentController::class);
        Route::post('assignments/{assignment}/submit',  [AssignmentController::class, 'submit']);
        Route::post('assignments/{assignment}/grade',   [AssignmentController::class, 'grade']);
        Route::get('assignments/{assignment}/submissions', [AssignmentController::class, 'submissions']);

        // Exams
        Route::apiResource('exams', ExamController::class);
        Route::apiResource('exams.questions', ExamController::class);
        Route::post('exams/{exam}/publish',  [ExamController::class, 'publish']);
        Route::post('exams/{exam}/submit',   [ExamController::class, 'submitAnswers']);
        Route::get('exams/{exam}/results',   [ExamController::class, 'results']);
        Route::post('exams/{exam}/grade',    [ExamController::class, 'gradeEssay']);

        // Grades
        Route::get('grades',                      [GradeController::class, 'index']);
        Route::post('grades/bulk-entry',          [GradeController::class, 'bulkEntry']);
        Route::get('grades/student/{student}',    [GradeController::class, 'student']);
        Route::get('grades/class/{class}',        [GradeController::class, 'classGrades']);
        Route::get('grades/report-card/{student}',[GradeController::class, 'reportCard']);

        // Fees
        Route::apiResource('fee-structures', FeeController::class);
        Route::get('fees/invoices',                [FeeController::class, 'invoices']);
        Route::post('fees/generate-invoices',      [FeeController::class, 'generateInvoices']);
        Route::get('fees/invoices/{invoice}',      [FeeController::class, 'invoice']);
        Route::get('fees/invoices/{invoice}/pdf',  [FeeController::class, 'invoicePdf']);
        Route::get('fees/student/{student}',       [FeeController::class, 'studentBalance']);
        Route::get('fees/defaulters',              [FeeController::class, 'defaulters']);

        // Payments
        Route::post('payments/cash',        [PaymentController::class, 'recordCash']);
        Route::post('payments/bank',        [PaymentController::class, 'recordBank']);
        Route::post('payments/esewa/init',  [PaymentController::class, 'esewaInit']);
        Route::post('payments/khalti/init', [PaymentController::class, 'khaltiInit']);
        Route::post('payments/khalti/verify',[PaymentController::class, 'khaltiVerify']);
        Route::get('payments/history',      [PaymentController::class, 'history']);
        Route::get('payments/{payment}/receipt', [PaymentController::class, 'receipt']);

        // Payroll
        Route::get('payroll',              [PayrollController::class, 'index']);
        Route::post('payroll/run',         [PayrollController::class, 'run']);
        Route::post('payroll/{id}/approve',[PayrollController::class, 'approve']);
        Route::get('payroll/{id}/payslip', [PayrollController::class, 'payslip']);

        // Leave
        Route::apiResource('leaves', LeaveController::class);
        Route::post('leaves/{leave}/approve', [LeaveController::class, 'approve']);
        Route::post('leaves/{leave}/reject',  [LeaveController::class, 'reject']);

        // Library
        Route::apiResource('library/books', LibraryController::class);
        Route::post('library/borrow',      [LibraryController::class, 'borrow']);
        Route::post('library/return',      [LibraryController::class, 'returnBook']);
        Route::get('library/overdue',      [LibraryController::class, 'overdue']);
        Route::get('library/borrowed',     [LibraryController::class, 'borrowed']);

        // Announcements
        Route::apiResource('announcements', AnnouncementController::class);
        Route::post('announcements/{announcement}/publish', [AnnouncementController::class, 'publish']);

        // Messages
        Route::get('messages',             [MessageController::class, 'index']);
        Route::post('messages',            [MessageController::class, 'send']);
        Route::get('messages/{message}',   [MessageController::class, 'show']);
        Route::post('messages/{message}/read', [MessageController::class, 'markRead']);
        Route::get('messages/unread-count',[MessageController::class, 'unreadCount']);

        // Notifications
        Route::get('notifications',        [NotificationController::class, 'index']);
        Route::post('notifications/{id}/read', [NotificationController::class, 'markRead']);
        Route::post('notifications/read-all', [NotificationController::class, 'markAllRead']);

        // Calendar
        Route::get('calendar/events',      [CalendarController::class, 'events']);
        Route::post('calendar/events',     [CalendarController::class, 'store']);
        Route::put('calendar/events/{event}', [CalendarController::class, 'update']);
        Route::delete('calendar/events/{event}', [CalendarController::class, 'destroy']);
        Route::get('calendar/holidays',    [CalendarController::class, 'holidays']);
        Route::get('calendar/convert',     [CalendarController::class, 'convert']);

        // Reports
        Route::get('reports/academic',     [ReportController::class, 'academic']);
        Route::get('reports/attendance',   [ReportController::class, 'attendance']);
        Route::get('reports/finance',      [ReportController::class, 'finance']);
        Route::get('reports/enrollment',   [ReportController::class, 'enrollment']);
        Route::get('reports/staff',        [ReportController::class, 'staff']);

        // Settings
        Route::get('settings',             [SettingsController::class, 'index']);
        Route::put('settings',             [SettingsController::class, 'update']);
        Route::get('settings/grading',     [SettingsController::class, 'grading']);
        Route::put('settings/grading',     [SettingsController::class, 'updateGrading']);
    });
});
