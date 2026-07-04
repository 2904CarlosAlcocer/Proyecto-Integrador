<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    protected $table = 'pedidos';
    
    protected $fillable = [
        'cliente_id',
        'codigo_tracking',
        'modalidad_entrega',
        'estado_pedido',
        'total',
    ];
    
    public function detalles()
    {
        return $this->hasMany(DetallePedido::class);
    }
    
    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }
}