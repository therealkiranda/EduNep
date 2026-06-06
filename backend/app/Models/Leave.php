<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Leave extends Model
{
    use HasFactory;
    protected $guarded = ['id'];
    protected $casts   = ['start_date' => 'date', 'end_date' => 'date', 'reviewed_at' => 'datetime'];
    public function user()       { return $this->belongsTo(User::class); }
    public function reviewer()   { return $this->belongsTo(User::class, 'reviewed_by'); }
    public function institution(){ return $this->belongsTo(Institution::class); }
}
