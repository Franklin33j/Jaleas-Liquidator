<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $guarded = ['logs'];
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
