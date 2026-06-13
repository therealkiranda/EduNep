<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\User; use App\Models\Institution; use App\Models\AcademicYear;
use App\Models\Term; use App\Models\SchoolClass; use App\Models\Section; use App\Models\Department;
use Illuminate\Support\Facades\Hash;

class DemoInstitutionSeeder extends Seeder {
    public function run(): void {
        $inst = Institution::firstOrCreate(['email'=>'admin@edunep.com'],[
            'name'=>'EduNep Demo School','name_ne'=>'एडुनेप डेमो विद्यालय','type'=>'school',
            'address'=>'Kathmandu, Nepal','district'=>'Kathmandu','province'=>'Bagmati',
            'phone'=>'+977-1-4000000','currency'=>'NPR','timezone'=>'Asia/Kathmandu','language'=>'en','status'=>'active',
        ]);

        AcademicYear::where('institution_id',$inst->id)->update(['is_current'=>false]);
        $year = AcademicYear::updateOrCreate(
            ['institution_id'=>$inst->id,'name'=>'2081-2082 BS'],
            ['start_date'=>'2024-04-14','end_date'=>'2025-04-13','is_current'=>true]
        );

        Term::where('institution_id',$inst->id)->update(['is_current'=>false]);
        Term::updateOrCreate(['institution_id'=>$inst->id,'name'=>'First Term','academic_year_id'=>$year->id],['start_date'=>'2024-04-14','end_date'=>'2024-08-31','is_current'=>false]);
        Term::updateOrCreate(['institution_id'=>$inst->id,'name'=>'Second Term','academic_year_id'=>$year->id],['start_date'=>'2024-09-01','end_date'=>'2025-04-13','is_current'=>true]);

        $gen = Department::firstOrCreate(['institution_id'=>$inst->id,'name'=>'General'],['code'=>'GEN']);
        $sci = Department::firstOrCreate(['institution_id'=>$inst->id,'name'=>'Science'],['code'=>'SCI']);
        $mgt = Department::firstOrCreate(['institution_id'=>$inst->id,'name'=>'Management'],['code'=>'MGT']);

        foreach (range(1,10) as $l) {
            $c = SchoolClass::firstOrCreate(['institution_id'=>$inst->id,'name'=>"Class {$l}"],['department_id'=>$gen->id,'level'=>'secondary','capacity'=>40]);
            Section::firstOrCreate(['class_id'=>$c->id,'name'=>'A'],['capacity'=>40]);
            Section::firstOrCreate(['class_id'=>$c->id,'name'=>'B'],['capacity'=>40]);
        }
        foreach (['Science'=>$sci,'Management'=>$mgt] as $stream=>$dept) {
            foreach ([11,12] as $l) {
                $c = SchoolClass::firstOrCreate(['institution_id'=>$inst->id,'name'=>"Class {$l} {$stream}"],['department_id'=>$dept->id,'level'=>'higher_secondary','stream'=>$stream,'capacity'=>40]);
                Section::firstOrCreate(['class_id'=>$c->id,'name'=>'A'],['capacity'=>40]);
            }
        }

        foreach ([
            ['Super Admin','superadmin@edunep.com','super_admin'],
            ['Principal Sharma','principal@edunep.com','school_admin'],
            ['Ram Thapa','teacher@edunep.com','teacher'],
            ['Sita Shrestha','accountant@edunep.com','accountant'],
            ['Hari KC','hr@edunep.com','hr_officer'],
            ['Gita Thapa','librarian@edunep.com','librarian'],
        ] as [$name,$email,$role]) {
            $u = User::firstOrCreate(['email'=>$email],[
                'name'=>$name,'password'=>Hash::make('EduNep@2082'),
                'institution_id'=>$inst->id,'status'=>'active',
            ]);
            if (!$u->hasRole($role)) $u->assignRole($role);
        }
        $this->command->info('Seeded. Academic year 2081-2082 BS set as current. Password: EduNep@2082');
    }
}
