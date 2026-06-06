<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Grade extends Model
{
    use HasFactory;
    protected $guarded = ['id'];
    protected $casts   = ['ca_marks' => 'decimal:2', 'exam_marks' => 'decimal:2', 'total' => 'decimal:2', 'gpa' => 'decimal:2'];
    public function student()     { return $this->belongsTo(Student::class); }
    public function subject()     { return $this->belongsTo(Subject::class); }
    public function term()        { return $this->belongsTo(Term::class); }
    public function institution() { return $this->belongsTo(Institution::class); }
}
