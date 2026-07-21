<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PerfilClienteController extends Controller
{
    /**
     * Devuelve la información del cliente autenticado
     * junto con su pedido activo más reciente.
     */
    public function mostrar(Request $request): JsonResponse
    {
        $usuario = $request->user();

        if (!$usuario || !$usuario->esCliente()) {
            return response()->json([
                'message' => 'No tienes permiso para consultar este perfil.',
            ], 403);
        }

        $cliente = $usuario->cliente;

        if (!$cliente) {
            return response()->json([
                'message' => 'Tu cuenta no tiene un perfil de cliente asociado.',
            ], 404);
        }

        return response()->json([
            'user' => [
                'id' => $usuario->id,
                'name' => $usuario->name,
                'email' => $usuario->email,
                'rol' => $usuario->rolNormalizado(),
            ],

            'cliente' => [
                'id' => $cliente->id,
                'nombre' => $cliente->nombre,
                'correo' => $cliente->correo,
                'telefono' => $cliente->telefono,
                'fecha_registro' => $cliente->fecha_registro,
            ],

            'pedido_activo' => $this->obtenerPedidoActivo(
                $cliente->id
            ),
        ]);
    }

    /**
     * Actualiza el correo electrónico y el teléfono
     * del cliente autenticado.
     */
    public function actualizar(Request $request): JsonResponse
    {
        $usuario = $request->user();

        if (!$usuario || !$usuario->esCliente()) {
            return response()->json([
                'message' => 'No tienes permiso para modificar este perfil.',
            ], 403);
        }

        $cliente = $usuario->cliente;

        if (!$cliente) {
            return response()->json([
                'message' => 'Tu cuenta no tiene un perfil de cliente asociado.',
            ], 404);
        }

        $datos = $request->validate(
            [
                'email' => [
                    'required',
                    'string',
                    'email',
                    'max:255',
                    Rule::unique(
                        'users',
                        'email'
                    )->ignore($usuario->id),
                    Rule::unique(
                        'clientes',
                        'correo'
                    )->ignore($cliente->id),
                ],

                'telefono' => [
                    'nullable',
                    'string',
                    'max:20',
                ],
            ],
            [
                'email.required' =>
                    'El correo electrónico es obligatorio.',

                'email.email' =>
                    'Debes ingresar un correo electrónico válido.',

                'email.max' =>
                    'El correo electrónico es demasiado largo.',

                'email.unique' =>
                    'El correo electrónico ya está registrado.',

                'telefono.string' =>
                    'El número de teléfono no es válido.',

                'telefono.max' =>
                    'El número de teléfono es demasiado largo.',
            ]
        );

        $correo = Str::lower(
            trim($datos['email'])
        );

        $telefono = isset($datos['telefono'])
            ? trim($datos['telefono'])
            : null;

        if ($telefono === '') {
            $telefono = null;
        }

        DB::transaction(function () use (
            $usuario,
            $cliente,
            $correo,
            $telefono
        ) {
            /*
             * El correo se mantiene igual en users y clientes.
             * Así no existen dos correos distintos para la misma persona.
             */
            $usuario->update([
                'email' => $correo,
            ]);

            $cliente->update([
                'correo' => $correo,
                'telefono' => $telefono,
            ]);
        });

        $usuario->refresh();
        $cliente->refresh();

        return response()->json([
            'message' => 'Perfil actualizado correctamente.',

            /*
             * Este objeto se utilizará para actualizar authStore
             * sin cerrar la sesión.
             */
            'user' => [
                'id' => $usuario->id,
                'name' => $usuario->name,
                'email' => $usuario->email,
                'rol' => $usuario->rolNormalizado(),
            ],

            'cliente' => [
                'id' => $cliente->id,
                'nombre' => $cliente->nombre,
                'correo' => $cliente->correo,
                'telefono' => $cliente->telefono,
                'fecha_registro' => $cliente->fecha_registro,
            ],
        ]);
    }

    /**
     * Devuelve solamente el pedido activo.
     *
     * Esta ruta se podrá consultar automáticamente
     * cada tres segundos desde PerfilCliente.jsx.
     */
    public function pedidoActivo(Request $request): JsonResponse
    {
        $usuario = $request->user();

        if (!$usuario || !$usuario->esCliente()) {
            return response()->json([
                'message' => 'No tienes permiso para consultar este pedido.',
            ], 403);
        }

        $cliente = $usuario->cliente;

        if (!$cliente) {
            return response()->json([
                'message' => 'Tu cuenta no tiene un perfil de cliente asociado.',
            ], 404);
        }

        return response()->json([
            'pedido_activo' => $this->obtenerPedidoActivo(
                $cliente->id
            ),
        ]);
    }

    /**
     * Busca el pedido activo más reciente del cliente.
     */
    private function obtenerPedidoActivo(
        int $clienteId
    ): ?Pedido {
        return Pedido::query()
            ->with([
                'detalles.producto',
            ])
            ->where(
                'cliente_id',
                $clienteId
            )
            ->whereIn(
                'estado_pedido',
                [
                    'pendiente',
                    'confirmado',
                    'en_preparacion',
                    'listo',
                ]
            )
            ->latest('created_at')
            ->first();
    }
}