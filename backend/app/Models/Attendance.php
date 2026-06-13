<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Attendance extends Model {
    use HasFactory;
    protected $table   = 'attendance';
    protected $guarded = ['id'];
    protected $casts   = ['date' => 'date'];
    public function student()    { return $this->belongsTo(Student::class); }
    public function class()      { return $this->belongsTo(SchoolClass::class,'class_id'); }
    public function subject()    { return $this->belongsTo(Subject::class); }
    public function marker()     { return $this->belongsTo(User::class,'marked_by'); }
    public function institution(){ return $this->belongsTo(Institution::class); }
}
