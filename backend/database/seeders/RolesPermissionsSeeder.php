<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'students.view','students.create','students.update','students.delete','students.promote','students.transfer','students.id-card','students.transcript',
            'staff.view','staff.create','staff.update','staff.delete',
            'classes.view','classes.create','classes.update','classes.delete',
            'attendance.view','attendance.mark','attendance.report',
            'assignments.view','assignments.create','assignments.grade',
            'exams.view','exams.create','exams.grade','exams.publish',
            'grades.view','grades.entry',
            'fees.view','fees.create','fees.update',
            'payments.view','payments.record',
            'payroll.view','payroll.run','payroll.approve',
            'invoices.view','invoices.create',
            'library.view','library.manage','library.borrow',
            'announcements.view','announcements.create','announcements.publish',
            'messages.view','messages.send',
            'reports.academic','reports.finance','reports.attendance',
            'settings.view','settings.update',
            'users.view','users.create','users.update','users.delete',
            'calendar.view','calendar.manage',
            'leaves.view','leaves.apply','leaves.approve',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'sanctum']);
        }

        $roles = [
            'super_admin'  => Permission::where('guard_name','sanctum')->pluck('name')->toArray(),
            'school_admin' => ['students.view','students.create','students.update','students.promote','students.id-card','staff.view','staff.create','staff.update','classes.view','classes.create','classes.update','attendance.view','attendance.report','fees.view','fees.create','payments.view','announcements.view','announcements.create','announcements.publish','reports.academic','reports.finance','reports.attendance','settings.view','settings.update','users.view','users.create','calendar.view','calendar.manage','leaves.view','leaves.approve'],
            'teacher'      => ['students.view','attendance.view','attendance.mark','attendance.report','assignments.view','assignments.create','assignments.grade','exams.view','exams.create','exams.grade','grades.view','grades.entry','announcements.view','messages.view','messages.send','calendar.view','leaves.view','leaves.apply'],
            'accountant'   => ['fees.view','fees.create','fees.update','payments.view','payments.record','invoices.view','invoices.create','payroll.view','reports.finance','students.view','messages.view','messages.send'],
            'hr_officer'   => ['staff.view','staff.create','staff.update','payroll.view','payroll.run','leaves.view','leaves.approve','reports.attendance','messages.view','messages.send'],
            'librarian'    => ['library.view','library.manage','library.borrow','students.view','staff.view','messages.view','messages.send'],
            'student'      => ['assignments.view','exams.view','grades.view','attendance.view','library.view','library.borrow','announcements.view','messages.view','messages.send','calendar.view','leaves.apply'],
            'parent'       => ['announcements.view','messages.view','messages.send','calendar.view','grades.view','attendance.view','fees.view'],
        ];

        foreach ($roles as $roleName => $perms) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'sanctum']);
            $role->syncPermissions($perms);
        }

        $this->command->info('✅ Roles and permissions seeded.');
    }
}
