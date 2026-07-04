<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $table = 'clientes';

    protected $fillable = [
        'nombre',
        'telefono',
        'correo',
    ];

    public function pedidos()
    {
        return $this->hasMany(Pedido::class, 'cliente_id');
    }
}