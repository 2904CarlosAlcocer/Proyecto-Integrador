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
        'canal',
        'creado_por_user_id',
        'estado_pedido',
        'total',
    ];

    protected function casts(): array
    {
        return [
            'total' => 'decimal:2',
        ];
    }

    /**
     * Productos y cantidades incluidos en el pedido.
     */
    public function detalles()
    {
        return $this->hasMany(
            DetallePedido::class,
            'pedido_id'
        );
    }

    /**
     * Cliente al que pertenece el pedido.
     */
    public function cliente()
    {
        return $this->belongsTo(
            Cliente::class,
            'cliente_id'
        );
    }

    /**
     * Cuenta que creó el pedido.
     *
     * Puede representar:
     * - Al cliente que compró desde la página.
     * - Al cajero o administrador que registró el pedido.
     */
    public function creador()
    {
        return $this->belongsTo(
            User::class,
            'creado_por_user_id'
        );
    }

    /**
     * Indica si el pedido fue realizado desde la página web.
     */
    public function esPedidoWeb(): bool
    {
        return $this->canal === 'web';
    }

    /**
     * Indica si el pedido fue registrado desde CajaDashboard.
     */
    public function esPedidoCaja(): bool
    {
        return $this->canal === 'caja';
    }
}