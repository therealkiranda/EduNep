<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CalendarEvent extends Model
{
    use HasFactory, SoftDeletes;
    protected $guarded = ['id'];
    protected $casts   = ['start_date' => 'date', 'end_date' => 'date', 'all_day' => 'boolean'];
    public function institution() { return $this->belongsTo(Institution::class); }
    public function creator()     { return $this->belongsTo(User::class, 'created_by'); }
}
