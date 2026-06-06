<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payroll extends Model
{
    use HasFactory;
    protected $table   = 'payroll';
    protected $guarded = ['id'];
    protected $casts   = [
        'allowances' => 'array',
        'deductions' => 'array',
        'paid_at'    => 'datetime',
        'basic'      => 'decimal:2',
        'gross'      => 'decimal:2',
        'net'        => 'decimal:2',
    ];
    public function staff()      { return $this->belongsTo(Staff::class); }
    public function institution(){ return $this->belongsTo(Institution::class); }
    public function approver()   { return $this->belongsTo(User::class, 'approved_by'); }
}
