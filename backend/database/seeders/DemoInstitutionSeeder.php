<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Institution;
use App\Models\AcademicYear;
use App\Models\Term;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Department;
use Illuminate\Support\Facades\Hash;

class DemoInstitutionSeeder extends Seeder
{
    public function run(): void
    {
        // Institution
        $institution = Institution::firstOrCreate(['email' => 'admin@edunep.com'], [
            'name' => 'EduNep Demo School', 'name_ne' => 'एडुनेप डेमो विद्यालय',
            'type' => 'school', 'address' => 'Kathmandu, Nepal', 'district' => 'Kathmandu',
            'province' => 'Bagmati', 'phone' => '+977-1-4000000', 'email' => 'admin@edunep.com',
            'currency' => 'NPR', 'timezone' => 'Asia/Kathmandu', 'language' => 'en', 'status' => 'active',
        ]);

        // Academic Year
        $year = AcademicYear::firstOrCreate(['institution_id' => $institution->id, 'name' => '2081-2082 BS'], [
            'start_date' => '2024-04-14', 'end_date' => '2025-04-13', 'is_current' => true,
        ]);

        // Terms
        Term::firstOrCreate(['institution_id' => $institution->id, 'name' => 'First Term', 'academic_year_id' => $year->id], [
            'start_date' => '2024-04-14', 'end_date' => '2024-08-31', 'is_current' => false,
        ]);
        $term2 = Term::firstOrCreate(['institution_id' => $institution->id, 'name' => 'Second Term', 'academic_year_id' => $year->id], [
            'start_date' => '2024-09-01', 'end_date' => '2025-01-31', 'is_current' => true,
        ]);

        // Departments
        $dept = Department::firstOrCreate(['institution_id' => $institution->id, 'name' => 'General'], [
            'name_ne' => 'सामान्य', 'code' => 'GEN',
        ]);

        // Classes
        foreach ([1,2,3,4,5,6,7,8,9,10] as $level) {
            $class = SchoolClass::firstOrCreate(['institution_id' => $institution->id, 'name' => "Class {$level}"], [
                'department_id' => $dept->id, 'level' => 'secondary', 'capacity' => 40,
            ]);
            Section::firstOrCreate(['class_id' => $class->id, 'name' => 'A'], ['capacity' => 40]);
            Section::firstOrCreate(['class_id' => $class->id, 'name' => 'B'], ['capacity' => 40]);
        }

        // Users
        $users = [
            ['name' => 'Super Admin',        'email' => 'superadmin@edunep.com', 'role' => 'super_admin'],
            ['name' => 'Principal Sharma',   'email' => 'principal@edunep.com',  'role' => 'school_admin'],
            ['name' => 'Ram Bahadur Thapa',  'email' => 'teacher@edunep.com',    'role' => 'teacher'],
            ['name' => 'Sita Devi Shrestha', 'email' => 'accountant@edunep.com', 'role' => 'accountant'],
            ['name' => 'Hari Prasad KC',     'email' => 'hr@edunep.com',         'role' => 'hr_officer'],
            ['name' => 'Gita Kumari Thapa',  'email' => 'librarian@edunep.com',  'role' => 'librarian'],
        ];

        foreach ($users as $u) {
            $user = User::firstOrCreate(['email' => $u['email']], [
                'name' => $u['name'], 'password' => Hash::make('EduNep@2082'),
                'institution_id' => $institution->id, 'status' => 'active',
            ]);
            $user->assignRole($u['role']);
        }

        $this->command->info('✅ Demo institution and users seeded.');
        $this->command->info('   🔑 All passwords: EduNep@2082');
        $this->command->info('   📧 superadmin@edunep.com | principal@edunep.com | teacher@edunep.com | accountant@edunep.com');
    }
}
