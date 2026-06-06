<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;
    protected $guarded = ['id'];
    protected $casts   = [
        'due_date'     => 'date',
        'paid_at'      => 'datetime',
        'total_amount' => 'decimal:2',
        'discount'     => 'decimal:2',
        'net_amount'   => 'decimal:2',
    ];
    public function institution() { return $this->belongsTo(Institution::class); }
    public function student()     { return $this->belongsTo(Student::class); }
    public function term()        { return $this->belongsTo(Term::class); }
    public function items()       { return $this->hasMany(InvoiceItem::class); }
    public function payments()    { return $this->hasMany(Payment::class); }
}
