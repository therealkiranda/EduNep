<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Institution extends Model
{
    use HasFactory, SoftDeletes;
    protected $guarded = ['id'];
    protected $casts   = ['settings' => 'array'];
    public function users()         { return $this->hasMany(User::class); }
    public function students()      { return $this->hasMany(Student::class); }
    public function staff()         { return $this->hasMany(Staff::class); }
    public function academicYears() { return $this->hasMany(AcademicYear::class); }
    public function terms()         { return $this->hasMany(Term::class); }
    public function departments()   { return $this->hasMany(Department::class); }
    public function classes()       { return $this->hasMany(SchoolClass::class); }
    public function feeStructures() { return $this->hasMany(FeeStructure::class); }
    public function announcements() { return $this->hasMany(Announcement::class); }
    public function calendarEvents(){ return $this->hasMany(CalendarEvent::class); }
    public function settings()      { return $this->hasMany(Setting::class); }
}
