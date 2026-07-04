<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProductoController extends Controller
{
    /**
     * Lista productos disponibles (para Caja, catálogo público).
     */
    public function index(Request $request)
    {
        $productos = Producto::with('categoria')
            ->where('estado', 'disponible')
            ->orderBy('categoria_id')
            ->get();

        return response()->json($this->conUrlImagen($productos));
    }

    /**
     * Lista TODOS los productos, incluso desactivados (para Admin).
     */
    public function indexAdmin()
    {
        $productos = Producto::with('categoria')
            ->orderBy('categoria_id')
            ->orderBy('nombre')
            ->get();

        return response()->json($this->conUrlImagen($productos));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'categoria_id' => 'required|exists:categorias,id',
            'nombre' => 'required|string|max:120',
            'descripcion' => 'nullable|string|max:255',
            'precio' => 'required|numeric|min:0',
            'imagen' => 'nullable|image|max:4096',
        ]);

        $rutaImagen = null;
        if ($request->hasFile('imagen')) {
            $rutaImagen = $request->file('imagen')->store('productos', 'public');
        }

        $producto = Producto::create([
            'categoria_id' => $validated['categoria_id'],
            'nombre' => $validated['nombre'],
            'descripcion' => $validated['descripcion'] ?? null,
            'precio' => $validated['precio'],
            'imagen' => $rutaImagen,
            'estado' => 'disponible',
        ]);

        return response()->json([
            'message' => 'Producto creado correctamente',
            'producto' => $this->conUrlImagen($producto->load('categoria')),
        ], 201);
    }

    public function update(Request $request, Producto $producto)
    {
        $validated = $request->validate([
            'categoria_id' => 'required|exists:categorias,id',
            'nombre' => 'required|string|max:120',
            'descripcion' => 'nullable|string|max:255',
            'precio' => 'required|numeric|min:0',
            'imagen' => 'nullable|image|max:4096',
        ]);

        if ($request->hasFile('imagen')) {
            if ($producto->imagen) {
                Storage::disk('public')->delete($producto->imagen);
            }
            $validated['imagen'] = $request->file('imagen')->store('productos', 'public');
        }

        $producto->update($validated);

        return response()->json([
            'message' => 'Producto actualizado correctamente',
            'producto' => $this->conUrlImagen($producto->load('categoria')),
        ]);
    }

    public function toggleEstado(Producto $producto)
    {
        $producto->estado = $producto->estado === 'disponible' ? 'agotado' : 'disponible';
        $producto->save();

        return response()->json([
            'message' => 'Estado actualizado',
            'producto' => $this->conUrlImagen($producto->load('categoria')),
        ]);
    }

    /**
     * Agrega la URL completa de la imagen para que el frontend la use directo.
     */
    private function conUrlImagen($productos)
    {
        $esColeccion = $productos instanceof \Illuminate\Support\Collection;
        $items = $esColeccion ? $productos : collect([$productos]);

        $items->each(function ($producto) {
            $producto->imagen_url = $producto->imagen
                ? Storage::disk('public')->url($producto->imagen)
                : null;
        });

        return $esColeccion ? $items : $items->first();
    }
}