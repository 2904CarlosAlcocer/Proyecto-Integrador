<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ingrediente extends Model
{
    protected $table = 'ingredientes';

    protected $fillable = [
        'nombre',
        'estado',
    ];

    public function productos()
    {
        return $this->belongsToMany(Producto::class, 'producto_ingredientes');
    }

    public function getEstaDisponibleAttribute()
    {
        return $this->estado === 'disponible';
    }
}