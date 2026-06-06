<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Student extends Model
{
    use HasFactory, SoftDeletes;
    protected $guarded = ['id'];
    protected $casts   = [
        'dob'           => 'date',
        'join_date'     => 'date',
        'transferred_at'=> 'datetime',
    ];
    public function user()        { return $this->belongsTo(User::class); }
    public function institution() { return $this->belongsTo(Institution::class); }
    public function class()       { return $this->belongsTo(SchoolClass::class, 'class_id'); }
    public function section()     { return $this->belongsTo(Section::class); }
    public function grades()      { return $this->hasMany(Grade::class); }
    public function attendances() { return $this->hasMany(Attendance::class); }
    public function invoices()    { return $this->hasMany(Invoice::class); }
    public function payments()    { return $this->hasMany(Payment::class); }
    public function submissions() { return $this->hasMany(Submission::class); }
    public function examResults() { return $this->hasMany(ExamResult::class); }
}
