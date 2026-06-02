<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Institution;
use App\Models\AcademicYear;
use App\Models\Term;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesPermissionsSeeder::class,
            DemoInstitutionSeeder::class,
        ]);
    }
}

class RolesPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Students
            'students.view','students.create','students.update','students.delete',
            'students.promote','students.transfer','students.id-card','students.transcript',
            // Staff
            'staff.view','staff.create','staff.update','staff.delete',
            // Classes
            'classes.view','classes.create','classes.update','classes.delete',
            // Attendance
            'attendance.view','attendance.mark','attendance.report',
            // Assignments
            'assignments.view','assignments.create','assignments.grade',
            // Exams
            'exams.view','exams.create','exams.grade','exams.publish',
            // Grades
            'grades.view','grades.entry',
            // Finance
            'fees.view','fees.create','fees.update',
            'payments.view','payments.record',
            'payroll.view','payroll.run','payroll.approve',
            'invoices.view','invoices.create',
            // Library
            'library.view','library.manage','library.borrow',
            // Communication
            'announcements.view','announcements.create','announcements.publish',
            'messages.view','messages.send',
            // Reports
            'reports.academic','reports.finance','reports.attendance',
            // Settings
            'settings.view','settings.update',
            // Users
            'users.view','users.create','users.update','users.delete',
            // Calendar
            'calendar.view','calendar.manage',
            // Leaves
            'leaves.view','leaves.apply','leaves.approve',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'sanctum']);
        }

        $roles = [
            'super_admin'  => Permission::pluck('name')->toArray(),
            'school_admin' => [
                'students.view','students.create','students.update','students.promote','students.id-card',
                'staff.view','staff.create','staff.update',
                'classes.view','classes.create','classes.update',
                'attendance.view','attendance.report',
                'fees.view','fees.create','payments.view',
                'announcements.view','announcements.create','announcements.publish',
                'reports.academic','reports.finance','reports.attendance',
                'settings.view','settings.update','users.view','users.create',
                'calendar.view','calendar.manage','leaves.view','leaves.approve',
            ],
            'teacher' => [
                'students.view','attendance.view','attendance.mark','attendance.report',
                'assignments.view','assignments.create','assignments.grade',
                'exams.view','exams.create','exams.grade',
                'grades.view','grades.entry',
                'announcements.view','messages.view','messages.send',
                'calendar.view','leaves.view','leaves.apply',
            ],
            'accountant' => [
                'fees.view','fees.create','fees.update',
                'payments.view','payments.record',
                'invoices.view','invoices.create',
                'payroll.view','reports.finance',
                'students.view','messages.view','messages.send',
            ],
            'hr_officer' => [
                'staff.view','staff.create','staff.update',
                'payroll.view','payroll.run',
                'leaves.view','leaves.approve',
                'reports.attendance','messages.view','messages.send',
            ],
            'librarian' => [
                'library.view','library.manage','library.borrow',
                'students.view','staff.view',
                'messages.view','messages.send',
            ],
            'student' => [
                'assignments.view','exams.view','grades.view',
                'attendance.view','library.view','library.borrow',
                'announcements.view','messages.view','messages.send',
                'calendar.view','leaves.apply',
            ],
            'parent' => [
                'announcements.view','messages.view','messages.send',
                'calendar.view',
            ],
        ];

        foreach ($roles as $roleName => $perms) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'sanctum']);
            $role->syncPermissions($perms);
        }

        echo "✅ Roles and permissions seeded.\n";
    }
}

class DemoInstitutionSeeder extends Seeder
{
    public function run(): void
    {
        // Institution
        $institution = Institution::firstOrCreate(['email' => 'admin@edunep.com'], [
            'name'     => 'EduNep Demo School',
            'name_ne'  => 'एडुनेप डेमो विद्यालय',
            'type'     => 'school',
            'address'  => 'Kathmandu, Nepal',
            'district' => 'Kathmandu',
            'province' => 'Bagmati',
            'phone'    => '+977-1-4000000',
            'email'    => 'admin@edunep.com',
            'currency' => 'NPR',
            'timezone' => 'Asia/Kathmandu',
            'language' => 'en',
            'status'   => 'active',
        ]);

        // Academic Year
        $year = AcademicYear::firstOrCreate(['institution_id' => $institution->id, 'name' => '2081-2082 BS'], [
            'start_date' => '2024-04-14',
            'end_date'   => '2025-04-13',
            'is_current' => true,
        ]);

        // Terms
        Term::firstOrCreate(['institution_id' => $institution->id, 'name' => 'First Term', 'academic_year_id' => $year->id], [
            'start_date' => '2024-04-14',
            'end_date'   => '2024-08-31',
            'is_current' => false,
        ]);
        Term::firstOrCreate(['institution_id' => $institution->id, 'name' => 'Second Term', 'academic_year_id' => $year->id], [
            'start_date' => '2024-09-01',
            'end_date'   => '2025-01-31',
            'is_current' => true,
        ]);

        // Super Admin
        $superAdmin = User::firstOrCreate(['email' => 'superadmin@edunep.com'], [
            'name'           => 'Super Admin',
            'password'       => Hash::make('EduNep@2082'),
            'institution_id' => $institution->id,
            'status'         => 'active',
        ]);
        $superAdmin->assignRole('super_admin');

        // School Admin
        $admin = User::firstOrCreate(['email' => 'principal@edunep.com'], [
            'name'           => 'Principal Sharma',
            'password'       => Hash::make('EduNep@2082'),
            'institution_id' => $institution->id,
            'status'         => 'active',
        ]);
        $admin->assignRole('school_admin');

        // Teacher
        $teacher = User::firstOrCreate(['email' => 'teacher@edunep.com'], [
            'name'           => 'Ram Bahadur Thapa',
            'password'       => Hash::make('EduNep@2082'),
            'institution_id' => $institution->id,
            'status'         => 'active',
        ]);
        $teacher->assignRole('teacher');

        // Accountant
        $accountant = User::firstOrCreate(['email' => 'accountant@edunep.com'], [
            'name'           => 'Sita Devi Shrestha',
            'password'       => Hash::make('EduNep@2082'),
            'institution_id' => $institution->id,
            'status'         => 'active',
        ]);
        $accountant->assignRole('accountant');

        echo "✅ Demo institution and users seeded.\n";
        echo "   🔑 superadmin@edunep.com / EduNep\@2082\n";
        echo "   🔑 principal@edunep.com  / EduNep\@2082\n";
        echo "   🔑 teacher@edunep.com    / EduNep\@2082\n";
        echo "   🔑 accountant@edunep.com / EduNep\@2082\n";
    }
}
