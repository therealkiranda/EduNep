<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use HasFactory;
    protected $guarded = ['id'];
    protected $casts   = ['paid_at' => 'datetime', 'amount' => 'decimal:2'];
    public function institution() { return $this->belongsTo(Institution::class); }
    public function invoice()     { return $this->belongsTo(Invoice::class); }
    public function student()     { return $this->belongsTo(Student::class); }
    public function recorder()    { return $this->belongsTo(User::class, 'recorded_by'); }
}
