<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    protected $table = 'productos';

    protected $fillable = [
        'categoria_id',
        'nombre',
        'descripcion',
        'precio',
        'imagen',
        'estado',
    ];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    public function ingredientes()
    {
        return $this->belongsToMany(Ingrediente::class, 'producto_ingredientes');
    }

    public function getIngredientesBaseAttribute()
    {
        return $this->ingredientes;
    }

    public function getEsPizzaAttribute()
    {
        return $this->categoria && strtolower($this->categoria->nombre) === 'pizzas';
    }
}