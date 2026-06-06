<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Announcement extends Model
{
    use HasFactory, SoftDeletes;
    protected $guarded = ['id'];
    protected $casts   = ['published_at' => 'datetime'];
    public function institution() { return $this->belongsTo(Institution::class); }
    public function creator()     { return $this->belongsTo(User::class, 'created_by'); }
}
