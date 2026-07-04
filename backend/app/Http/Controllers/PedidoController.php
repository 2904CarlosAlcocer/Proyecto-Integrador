<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PedidoController extends Controller
{
    public function index(Request $request)
    {
        $query = Pedido::with('detalles.producto', 'cliente')
            ->orderBy('created_at', 'desc');

        if ($request->has('estado')) {
            $query->where('estado_pedido', $request->estado);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cliente_id'        => 'required|exists:clientes,id',
            'modalidad_entrega' => ['required', Rule::in(['consumo_local', 'retiro'])],
            'metodo_pago'       => ['required', Rule::in(['sinpe', 'efectivo', 'tarjeta'])],
            'productos'         => 'required|json',
            'comprobante'       => 'nullable|file|max:5120|mimes:pdf,jpg,jpeg,png,gif',
        ]);

        $productos = json_decode($validated['productos'], true);

        $pedido = DB::transaction(function () use ($validated, $productos, $request) {
            $total   = 0;
            $detalles = [];

            foreach ($productos as $item) {
                $producto       = Producto::findOrFail($item['producto_id']);
                $precioUnitario = $producto->precio;
                $subtotal       = $precioUnitario * $item['cantidad'];
                $total         += $subtotal;

                $detalles[] = [
                    'producto_id'     => $producto->id,
                    'cantidad'        => $item['cantidad'],
                    'precio_unitario' => $precioUnitario,
                    'subtotal'        => $subtotal,
                    'observaciones'   => $item['observaciones'] ?? null,
                ];
            }

            $pedido = Pedido::create([
                'cliente_id'        => $validated['cliente_id'],
                'codigo_tracking'   => 'RC-' . strtoupper(Str::random(6)),
                'modalidad_entrega' => $validated['modalidad_entrega'],
                'estado_pedido'     => 'pendiente',
                'total'             => $total,
            ]);

            $this->guardarMetodoPago($pedido->id, $validated['metodo_pago']);

            if ($validated['metodo_pago'] === 'sinpe' && $request->hasFile('comprobante')) {
                $this->guardarComprobante($request->file('comprobante'), $pedido->id);
            }

            foreach ($detalles as $detalle) {
                $pedido->detalles()->create($detalle);
            }

            return $pedido;
        });

        return response()->json([
            'message' => 'Pedido creado correctamente',
            'pedido'  => $pedido->load('detalles.producto', 'cliente'),
        ], 201);
    }

    private function guardarMetodoPago($pedidoId, $metodo)
    {
        $pedido = Pedido::with('cliente')->find($pedidoId);

        $this->actualizarMetadataPedido($pedidoId, [
            'metodo_pago'   => $metodo,
            'estado_pago'   => $metodo === 'sinpe' ? 'pendiente_comprobante' : 'no_requiere',
            'fecha'         => now()->toDateTimeString(),
            'cliente_nombre' => $pedido && $pedido->cliente
                ? $pedido->cliente->nombre
                : 'Sin cliente',
        ]);
    }

    private function guardarComprobante($file, $pedidoId)
    {
        $extension = $file->getClientOriginalExtension();
        $nombre    = "comprobante_{$pedidoId}_" . time() . ".{$extension}";
        $ruta      = $file->storeAs('comprobantes', $nombre, 'public');

        $pedido        = Pedido::with('cliente')->find($pedidoId);
        $clienteNombre = $pedido && $pedido->cliente ? $pedido->cliente->nombre : 'Sin cliente';

        $this->actualizarMetadataPedido($pedidoId, [
            'comprobante'       => $ruta,
            'estado_pago'       => 'pendiente_verificacion',
            'fecha_comprobante' => now()->toDateTimeString(),
            'cliente_nombre'    => $clienteNombre,
        ]);
    }

    public function listarComprobantes()
    {
        $data      = $this->leerMetadata();
        $resultado = [];

        foreach ($data as $item) {
            if (!isset($item['comprobante'])) {
                continue;
            }

            $pedido = Pedido::with('cliente')->find($item['pedido_id']);

            if (!$pedido) {
                continue;
            }

            $resultado[] = [
                'pedido_id'       => $pedido->id,
                'codigo_tracking' => $pedido->codigo_tracking,
                'cliente_nombre'  => $pedido->cliente
                    ? $pedido->cliente->nombre
                    : ($item['cliente_nombre'] ?? 'Sin cliente'),
                'metodo_pago'     => $item['metodo_pago'] ?? null,
                'comprobante'     => $item['comprobante'],
                'comprobante_url' => asset('storage/' . $item['comprobante']),
                'estado_pago'     => $item['estado_pago'] ?? 'pendiente_verificacion',
                'fecha'           => $item['fecha_comprobante'] ?? $item['fecha'] ?? $pedido->created_at,
            ];
        }

        return response()->json($resultado);
    }

    public function verificarComprobante($pedidoId, Request $request)
    {
        $validated = $request->validate([
            'estado' => ['required', Rule::in(['verificado', 'rechazado'])],
        ]);

        $this->actualizarMetadataPedido($pedidoId, [
            'estado_pago'        => $validated['estado'],
            'fecha_verificacion' => now()->toDateTimeString(),
        ]);

        return response()->json([
            'message' => 'Estado actualizado correctamente',
        ]);
    }

    public function updateEstado(Request $request, Pedido $pedido)
    {
        $validated = $request->validate([
            'estado_pedido' => [
                'required',
                Rule::in(['pendiente', 'confirmado', 'en_preparacion', 'listo', 'entregado']),
            ],
        ]);

        $pedido->update(['estado_pedido' => $validated['estado_pedido']]);

        return response()->json([
            'message' => 'Estado actualizado',
            'pedido'  => $pedido->load('detalles.producto', 'cliente'),
        ]);
    }

    public function buscarPorTracking($codigo)
    {
        $pedido = Pedido::with('detalles.producto', 'cliente')
            ->where('codigo_tracking', strtoupper($codigo))
            ->first();

        if (!$pedido) {
            return response()->json([
                'message' => 'No se encontró ningún pedido con ese código.',
            ], 404);
        }

        return response()->json($pedido);
    }

    public function pedidoPublico($codigo)
    {
        $pedido = Pedido::with('cliente', 'detalles.producto')
            ->where('codigo_tracking', strtoupper($codigo))
            ->first();

        if (!$pedido) {
            return response()->json([
                'message' => 'Pedido no encontrado',
            ], 404);
        }

        $metadata = $this->obtenerMetadataPedido($pedido->id);

        return response()->json([
            'pedido' => [
                'id'                => $pedido->id,
                'codigo_tracking'   => $pedido->codigo_tracking,
                'cliente'           => $pedido->cliente,
                'total'             => $pedido->total,
                'estado_pedido'     => $pedido->estado_pedido,
                'modalidad_entrega' => $pedido->modalidad_entrega,
                'detalles'          => $pedido->detalles->map(function ($detalle) {
                    return [
                        'producto'        => $detalle->producto,
                        'cantidad'        => $detalle->cantidad,
                        'precio_unitario' => $detalle->precio_unitario,
                        'subtotal'        => $detalle->subtotal,
                        'observaciones'   => $detalle->observaciones,
                    ];
                }),
                'metodo_pago'     => $metadata['metodo_pago'] ?? null,
                'estado_pago'     => $metadata['estado_pago'] ?? null,
                'comprobante'     => $metadata['comprobante'] ?? null,
                'comprobante_url' => isset($metadata['comprobante'])
                    ? asset('storage/' . $metadata['comprobante'])
                    : null,
            ],
        ]);
    }

    public function subirComprobante(Request $request, $codigo)
    {
        $request->validate([
            'comprobante' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
        ]);

        $pedido = Pedido::where('codigo_tracking', strtoupper($codigo))->first();

        if (!$pedido) {
            return response()->json([
                'message' => 'Pedido no encontrado',
            ], 404);
        }

        $archivo       = $request->file('comprobante');
        $extension     = $archivo->getClientOriginalExtension();
        $nombreArchivo = $pedido->codigo_tracking . '.' . $extension;
        $ruta          = $archivo->storeAs('comprobantes', $nombreArchivo, 'public');

        $this->actualizarMetadataPedido($pedido->id, [
            'comprobante'       => $ruta,
            'estado_pago'       => 'pendiente_verificacion',
            'fecha_comprobante' => now()->toDateTimeString(),
        ]);

        return response()->json([
            'message' => 'Comprobante subido correctamente',
            'archivo' => asset('storage/' . $ruta),
        ]);
    }

    private function obtenerMetadataPedido($pedidoId)
    {
        $data = $this->leerMetadata();

        foreach ($data as $item) {
            if ((int) $item['pedido_id'] === (int) $pedidoId) {
                return $item;
            }
        }

        return null;
    }

    private function actualizarMetadataPedido($pedidoId, array $nuevosDatos)
    {
        $data  = $this->leerMetadata();
        $index = false;

        foreach ($data as $key => $item) {
            if ((int) $item['pedido_id'] === (int) $pedidoId) {
                $index = $key;
                break;
            }
        }

        if ($index !== false) {
            $data[$index] = array_merge($data[$index], [
                'pedido_id' => $pedidoId,
            ], $nuevosDatos);
        } else {
            $data[] = array_merge([
                'pedido_id' => $pedidoId,
            ], $nuevosDatos);
        }

        $this->guardarMetadata($data);
    }

    private function leerMetadata()
    {
        $ruta = storage_path('app/pedidos_metadata.json');

        if (!file_exists($ruta)) {
            return [];
        }

        return json_decode(file_get_contents($ruta), true) ?? [];
    }

    private function guardarMetadata(array $data)
    {
        $ruta = storage_path('app/pedidos_metadata.json');

        file_put_contents($ruta, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
}