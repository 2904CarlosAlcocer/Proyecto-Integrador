<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Ingrediente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProductoController extends Controller
{
    public function index(Request $request)
    {
        $productos = Producto::with(['categoria', 'ingredientes'])
            ->where('estado', 'disponible')
            ->orderBy('categoria_id')
            ->get();

        $extras = Ingrediente::where('estado', 'disponible')->get();

        return response()->json($this->conUrlImagen($productos, $extras));
    }

    public function indexAdmin()
    {
        $productos = Producto::with(['categoria', 'ingredientes'])
            ->orderBy('categoria_id')
            ->orderBy('nombre')
            ->get();

        $extras = Ingrediente::where('estado', 'disponible')->get();

        return response()->json($this->conUrlImagen($productos, $extras));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'categoria_id' => 'required|exists:categorias,id',
            'nombre' => 'required|string|max:120',
            'descripcion' => 'nullable|string|max:255',
            'precio' => 'required|numeric|min:0',
            'imagen' => 'nullable|image|max:4096',
            'ingredientes' => 'nullable|array',
            'ingredientes.*' => 'exists:ingredientes,id',
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

        if (!empty($validated['ingredientes'])) {
            $producto->ingredientes()->attach($validated['ingredientes']);
        }

        return response()->json([
            'message' => 'Producto creado correctamente',
            'producto' => $this->conUrlImagen($producto->load(['categoria', 'ingredientes'])),
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
            'ingredientes' => 'nullable|array',
            'ingredientes.*' => 'exists:ingredientes,id',
        ]);

        if ($request->hasFile('imagen')) {
            if ($producto->imagen) {
                Storage::disk('public')->delete($producto->imagen);
            }
            $validated['imagen'] = $request->file('imagen')->store('productos', 'public');
        }

        $producto->update($validated);

        if ($request->has('ingredientes')) {
            $producto->ingredientes()->sync($validated['ingredientes']);
        }

        return response()->json([
            'message' => 'Producto actualizado correctamente',
            'producto' => $this->conUrlImagen($producto->load(['categoria', 'ingredientes'])),
        ]);
    }

    public function toggleEstado(Producto $producto)
    {
        $producto->estado = $producto->estado === 'disponible' ? 'agotado' : 'disponible';
        $producto->save();

        return response()->json([
            'message' => 'Estado actualizado',
            'producto' => $this->conUrlImagen($producto->load(['categoria', 'ingredientes'])),
        ]);
    }

    private function conUrlImagen($productos, $extras = null)
    {
        $esColeccion = $productos instanceof \Illuminate\Support\Collection;
        $items = $esColeccion ? $productos : collect([$productos]);

        $items->each(function ($producto) {
            $producto->imagen_url = $producto->imagen
                ? Storage::disk('public')->url($producto->imagen)
                : null;

            $producto->ingredientes_base = $producto->ingredientes->map(function ($ing) {
                return [
                    'id' => $ing->id,
                    'nombre' => $ing->nombre,
                ];
            });

            $producto->es_pizza = $producto->categoria && strtolower($producto->categoria->nombre) === 'pizzas';
        });

        if ($extras) {
            $extrasArray = $extras->map(function ($extra) {
                return [
                    'id' => $extra->id,
                    'nombre' => $extra->nombre,
                    'precio_extra' => 1500,
                ];
            });

            $items->each(function ($producto) use ($extrasArray) {
                $producto->extras_disponibles = $extrasArray;
            });
        }

        return $esColeccion ? $items : $items->first();
    }
}