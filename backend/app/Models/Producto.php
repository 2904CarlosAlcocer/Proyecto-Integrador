<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    protected $fillable = [
        'categoria_id',
        'nombre',
        'descripcion',
        'precio',
        'imagen',
        'estado'
    ];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    // 🔥 RELACIÓN CON INGREDIENTES
    public function ingredientes()
    {
        return $this->belongsToMany(Ingrediente::class, 'producto_ingredientes');
    }

    // 🔥 OBTENER INGREDIENTES BASE
    public function getIngredientesBaseAttribute()
    {
        return $this->ingredientes;
    }

    // 🔥 VERIFICAR SI ES UNA PIZZA
    public function getEsPizzaAttribute()
    {
        return $this->categoria && strtolower($this->categoria->nombre) === 'pizzas';
    }
}