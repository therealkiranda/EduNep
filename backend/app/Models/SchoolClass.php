<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SchoolClass extends Model
{
    use HasFactory, SoftDeletes;
    protected $table   = 'classes';
    protected $guarded = ['id'];
    protected $casts   = [];
    public function institution() { return $this->belongsTo(Institution::class); }
    public function department()  { return $this->belongsTo(Department::class); }
    public function sections()    { return $this->hasMany(Section::class, 'class_id'); }
    public function students()    { return $this->hasMany(Student::class, 'class_id'); }
    public function subjects()    { return $this->hasMany(ClassSubject::class, 'class_id'); }
    public function timetables()  { return $this->hasMany(Timetable::class, 'class_id'); }
    public function exams()       { return $this->hasMany(Exam::class, 'class_id'); }
}
