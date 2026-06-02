<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExamResult extends Model
{
    use HasFactory;
    protected $guarded = ['id'];
    protected $casts = [
        'is_current' => 'boolean', 'is_mandatory' => 'boolean',
        'allow_late' => 'boolean', 'all_day' => 'boolean',
        'two_factor_enabled' => 'boolean', 'options' => 'array',
        'allowances' => 'array', 'deductions' => 'array', 'settings' => 'array',
        'due_date' => 'date', 'start_date' => 'date', 'end_date' => 'date',
        'exam_date' => 'date', 'paid_at' => 'datetime',
        'published_at' => 'datetime', 'last_login_at' => 'datetime',
    ];
}
