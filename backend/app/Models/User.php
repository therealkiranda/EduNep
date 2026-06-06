<?php
namespace App\Models;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, HasRoles;
    protected $guarded = ['id'];
    protected $hidden  = ['password', 'remember_token', 'two_factor_secret'];
    protected $casts   = [
        'email_verified_at'  => 'datetime',
        'last_login_at'      => 'datetime',
        'two_factor_enabled' => 'boolean',
        'password'           => 'hashed',
    ];
    protected string $guard_name = 'sanctum';
    public function institution()     { return $this->belongsTo(Institution::class); }
    public function student()         { return $this->hasOne(Student::class); }
    public function staff()           { return $this->hasOne(Staff::class); }
    public function sentMessages()    { return $this->hasMany(Message::class, 'sender_id'); }
    public function receivedMessages(){ return $this->hasMany(Message::class, 'recipient_id'); }
    public function leaves()          { return $this->hasMany(Leave::class); }
}
