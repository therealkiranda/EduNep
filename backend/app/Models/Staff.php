<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Staff extends Model
{
    use HasFactory, SoftDeletes;
    protected $guarded = ['id'];
    protected $casts   = ['join_date' => 'date', 'basic_salary' => 'decimal:2'];
    public function user()        { return $this->belongsTo(User::class); }
    public function institution() { return $this->belongsTo(Institution::class); }
    public function department()  { return $this->belongsTo(Department::class); }
    public function payrolls()    { return $this->hasMany(Payroll::class); }
    public function leaves()      { return $this->hasMany(Leave::class, 'user_id', 'user_id'); }
}
