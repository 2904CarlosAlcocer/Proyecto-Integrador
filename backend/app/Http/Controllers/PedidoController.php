<?php

namespace App\Http\Controllers;

use App\Models\Acompanamiento;
use App\Models\Ingrediente;
use App\Models\OpcionPasta;
use App\Models\Pedido;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PedidoController extends Controller
{
    public function index(Request $request)
    {
        $query = Pedido::with(
            'detalles.producto',
            'cliente'
        )->orderBy('created_at', 'desc');

        if ($request->has('estado')) {
            $query->where(
                'estado_pedido',
                $request->estado
            );
        }

        return response()->json(
            $query->get()
        );
    }

    public function store(Request $request)
    {
        /*
        |--------------------------------------------------------------------------
        | USUARIO AUTENTICADO Y ORIGEN DEL PEDIDO
        |--------------------------------------------------------------------------
        */

        $usuario = $request->user();

        if (!$usuario) {
            return response()->json([
                'message' =>
                    'Debes iniciar sesión para crear un pedido.',
            ], 401);
        }

        $rol = $usuario->rolNormalizado();

        if (
            !in_array(
                $rol,
                [
                    'admin',
                    'caja',
                    'cliente',
                ],
                true
            )
        ) {
            return response()->json([
                'message' =>
                    'No tienes permiso para crear pedidos.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | VALIDACIÓN PRINCIPAL
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'cliente_id' => [
                'nullable',
                'integer',
                'exists:clientes,id',
            ],

            'modalidad_entrega' => [
                'required',
                Rule::in([
                    'consumo_local',
                    'retiro',
                ]),
            ],

            'metodo_pago' => [
                'required',
                Rule::in([
                    'sinpe',
                    'efectivo',
                    'tarjeta',
                ]),
            ],

            'productos' => [
                'required',
                'json',
            ],

            'comprobante' => [
                'nullable',
                'file',
                'max:5120',
                'mimes:pdf,jpg,jpeg,png,gif',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | DETERMINAR CLIENTE, CANAL Y CREADOR
        |--------------------------------------------------------------------------
        */

        if ($rol === 'cliente') {
            $cliente = $usuario
                ->cliente()
                ->first();

            if (!$cliente) {
                throw ValidationException::withMessages([
                    'cliente_id' => [
                        'Tu cuenta no tiene un perfil de cliente asociado.',
                    ],
                ]);
            }

            $clienteId = $cliente->id;
            $canal = 'web';
        } else {
            if (empty($validated['cliente_id'])) {
                throw ValidationException::withMessages([
                    'cliente_id' => [
                        'Debes seleccionar un cliente para crear el pedido.',
                    ],
                ]);
            }

            $clienteId =
                (int) $validated['cliente_id'];

            $canal = 'caja';
        }

        $creadoPorUserId = $usuario->id;

        /*
        |--------------------------------------------------------------------------
        | DECODIFICAR PRODUCTOS
        |--------------------------------------------------------------------------
        */

        $productos = json_decode(
            $validated['productos'],
            true
        );

        /*
        |--------------------------------------------------------------------------
        | VALIDAR ESTRUCTURA DE PRODUCTOS Y PERSONALIZACIONES
        |--------------------------------------------------------------------------
        */

        $validatorProductos = Validator::make(
            [
                'productos' => $productos,
            ],
            [
                'productos' => [
                    'required',
                    'array',
                    'min:1',
                ],

                'productos.*' => [
                    'required',
                    'array',
                ],

                'productos.*.producto_id' => [
                    'required',
                    'integer',

                    Rule::exists(
                        'productos',
                        'id'
                    )->where(
                            fn($query) =>
                            $query->where(
                                'estado',
                                'disponible'
                            )
                        ),
                ],

                'productos.*.cantidad' => [
                    'required',
                    'integer',
                    'min:1',
                ],

                /*
                 * Compatibilidad con la personalización actual de pizzas.
                 */
                'productos.*.extras' => [
                    'nullable',
                    'string',
                    'max:1000',
                ],

                'productos.*.extras_ids' => [
                    'nullable',
                    'array',
                ],

                'productos.*.extras_ids.*' => [
                    'integer',


                    Rule::exists(
                        'ingredientes',
                        'id'
                    )->where(
                            fn($query) =>
                            $query->where(
                                'estado',
                                'disponible'
                            )
                        ),
                ],

                /*
                 * Personalización de pasta.
                 * Los grupos y precios se verifican nuevamente en la transacción.
                 */
                'productos.*.pasta' => [
                    'nullable',
                    'array',
                ],

                'productos.*.pasta.tipo_pasta_id' => [
                    'nullable',
                    'integer',
                ],

                'productos.*.pasta.proteina_ids' => [
                    'nullable',
                    'array',
                ],

                'productos.*.pasta.proteina_ids.*' => [
                    'integer',

                ],

                'productos.*.pasta.salsa_id' => [
                    'nullable',
                    'integer',
                ],

                'productos.*.pasta.ingrediente_ids' => [
                    'nullable',
                    'array',
                ],

                'productos.*.pasta.ingrediente_ids.*' => [
                    'integer',

                ],

                /*
                 * Acompañamientos de carnes.
                 * Se conserva el orden porque determina cuáles dos son incluidos.
                 */
                'productos.*.acompanamientos_ids' => [
                    'nullable',
                    'array',
                ],

                'productos.*.acompanamientos_ids.*' => [
                    'integer',
                    'distinct',
                ],

                'productos.*.observaciones' => [
                    'nullable',
                    'string',
                    'max:2000',
                ],

                'productos.*.alergias' => [
                    'nullable',
                    'string',
                    'max:255',
                ],
            ],
            [
                'productos.required' =>
                    'Debes agregar al menos un producto.',

                'productos.array' =>
                    'La lista de productos no tiene un formato válido.',

                'productos.min' =>
                    'Debes agregar al menos un producto.',

                'productos.*.array' =>
                    'Uno de los productos no tiene un formato válido.',

                'productos.*.producto_id.required' =>
                    'El producto es obligatorio.',

                'productos.*.producto_id.integer' =>
                    'El identificador del producto no es válido.',

                'productos.*.producto_id.exists' =>
                    'El producto seleccionado no existe o no está disponible.',

                'productos.*.cantidad.required' =>
                    'La cantidad es obligatoria.',

                'productos.*.cantidad.integer' =>
                    'La cantidad debe ser un número entero.',

                'productos.*.cantidad.min' =>
                    'La cantidad debe ser mayor o igual a uno.',

                'productos.*.extras.string' =>
                    'Los extras deben enviarse como texto.',

                'productos.*.extras.max' =>
                    'La descripción de los extras es demasiado larga.',

                'productos.*.extras_ids.array' =>
                    'Los identificadores de los extras deben enviarse como una lista.',

                'productos.*.extras_ids.*.integer' =>
                    'Uno de los extras seleccionados no tiene un identificador válido.',

                'productos.*.extras_ids.*.distinct' =>
                    'No puedes seleccionar el mismo extra más de una vez.',

                'productos.*.extras_ids.*.exists' =>
                    'Uno de los extras seleccionados no existe o no está disponible.',

                'productos.*.pasta.array' =>
                    'La personalización de la pasta no tiene un formato válido.',

                'productos.*.pasta.tipo_pasta_id.integer' =>
                    'El tipo de pasta seleccionado no es válido.',

                'productos.*.pasta.proteina_ids.array' =>
                    'Las proteínas deben enviarse como una lista.',

                'productos.*.pasta.proteina_ids.*.integer' =>
                    'Una de las proteínas seleccionadas no es válida.',

                'productos.*.pasta.proteina_ids.*.distinct' =>
                    'No puedes seleccionar la misma proteína más de una vez.',

                'productos.*.pasta.salsa_id.integer' =>
                    'La salsa seleccionada no es válida.',

                'productos.*.pasta.ingrediente_ids.array' =>
                    'Los ingredientes de la pasta deben enviarse como una lista.',

                'productos.*.pasta.ingrediente_ids.*.integer' =>
                    'Uno de los ingredientes de la pasta no es válido.',

                'productos.*.pasta.ingrediente_ids.*.distinct' =>
                    'No puedes seleccionar el mismo ingrediente de pasta más de una vez.',

                'productos.*.acompanamientos_ids.array' =>
                    'Los acompañamientos deben enviarse como una lista.',

                'productos.*.acompanamientos_ids.*.integer' =>
                    'Uno de los acompañamientos seleccionados no es válido.',

                'productos.*.acompanamientos_ids.*.distinct' =>
                    'No puedes seleccionar el mismo acompañamiento más de una vez.',

                'productos.*.observaciones.string' =>
                    'Las observaciones deben enviarse como texto.',

                'productos.*.observaciones.max' =>
                    'Las observaciones son demasiado largas.',

                'productos.*.alergias.string' =>
                    'Las alergias deben enviarse como texto.',

                'productos.*.alergias.max' =>
                    'La información de alergias es demasiado larga.',
            ]
        );

        $validatorProductos->validate();

        /*
        |--------------------------------------------------------------------------
        | CREAR PEDIDO
        |--------------------------------------------------------------------------
        */

        $pedido = DB::transaction(
            function () use ($validated, $productos, $request, $clienteId, $canal, $creadoPorUserId) {
                $total = 0;
                $detalles = [];

                foreach ($productos as $item) {
                    /** @var Producto $producto */
                    $producto = Producto::query()
                        ->with('categoria')
                        ->where(
                            'id',
                            $item['producto_id']
                        )
                        ->where(
                            'estado',
                            'disponible'
                        )
                        ->lockForUpdate()
                        ->firstOrFail();

                    $precioBase =
                        (float) $producto->precio;

                    $resultadoPersonalizacion =
                        $this->resolverPersonalizacionProducto(
                            $producto,
                            $item
                        );

                    $precioUnitario = round(
                        $precioBase
                        + $resultadoPersonalizacion[
                            'total_adicional'
                        ],
                        2
                    );

                    $cantidad =
                        (int) $item['cantidad'];

                    $subtotal = round(
                        $precioUnitario * $cantidad,
                        2
                    );

                    $total = round(
                        $total + $subtotal,
                        2
                    );

                    Log::info(
                        'Precio de línea calculado desde la base de datos.',
                        [
                            'producto_id' =>
                                $producto->id,

                            'producto' =>
                                $producto->nombre,

                            'tipo_personalizacion' =>
                                $producto
                                    ->tipo_personalizacion,

                            'precio_base' =>
                                $precioBase,

                            'total_adicional' =>
                                $resultadoPersonalizacion[
                                    'total_adicional'
                                ],

                            'precio_unitario' =>
                                $precioUnitario,

                            'cantidad' =>
                                $cantidad,

                            'subtotal' =>
                                $subtotal,
                        ]
                    );

                    $detalles[] = [
                        'producto_id' =>
                            $producto->id,

                        'cantidad' =>
                            $cantidad,

                        'precio_unitario' =>
                            $precioUnitario,

                        'subtotal' =>
                            $subtotal,

                        /*
                         * Texto generado por Laravel para cocina,
                         * notificaciones y compatibilidad con las vistas actuales.
                         */
                        'extras' =>
                            $resultadoPersonalizacion[
                                'texto'
                            ],

                        'alergias' =>
                            $item['alergias']
                            ?? null,

                        'observaciones' =>
                            $item['observaciones']
                            ?? null,

                        /*
                         * Fotografía estructurada de la composición y
                         * los precios aplicados en el momento del pedido.
                         */
                        'personalizacion' =>
                            $resultadoPersonalizacion[
                                'personalizacion'
                            ],
                    ];
                }

                $pedido = Pedido::create([
                    'cliente_id' =>
                        $clienteId,

                    'codigo_tracking' =>
                        'RC-' . strtoupper(
                            Str::random(6)
                        ),

                    'modalidad_entrega' =>
                        $validated[
                            'modalidad_entrega'
                        ],

                    'canal' =>
                        $canal,

                    'creado_por_user_id' =>
                        $creadoPorUserId,

                    'estado_pedido' =>
                        'pendiente',

                    'total' =>
                        $total,
                ]);

                $this->guardarMetodoPago(
                    $pedido->id,
                    $validated['metodo_pago']
                );

                if (
                    $validated['metodo_pago']
                    === 'sinpe'
                    && $request->hasFile(
                        'comprobante'
                    )
                ) {
                    $this->guardarComprobante(
                        $request->file(
                            'comprobante'
                        ),
                        $pedido->id
                    );
                }

                foreach ($detalles as $detalle) {
                    $pedido
                        ->detalles()
                        ->create($detalle);
                }

                return $pedido;
            }
        );

        $pedido->load(
            'detalles.producto',
            'cliente',
            'creador'
        );

        $this->enviarNotificacionNtfy(
            $pedido,
            $validated['metodo_pago']
        );

        return response()->json([
            'message' =>
                'Pedido creado correctamente',

            'pedido' =>
                $pedido,
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | RESOLVER PERSONALIZACIÓN SEGÚN EL PRODUCTO
    |--------------------------------------------------------------------------
    */

    private function resolverPersonalizacionProducto(
        Producto $producto,
        array $item
    ): array {
        $tipo = $producto
            ->tipo_personalizacion;

        if (
            $tipo ===
            Producto::PERSONALIZACION_PASTA
        ) {
            $this->rechazarExtrasDePizza(
                $item,
                'Las opciones de pizza no pueden utilizarse en una pasta personalizada.'
            );

            $this->rechazarAcompanamientos(
                $item,
                'Los acompañamientos de carnes no pueden utilizarse en una pasta personalizada.'
            );

            return $this->resolverPasta(
                $item
            );
        }

        if (
            $tipo ===
            Producto::PERSONALIZACION_ACOMPANAMIENTOS
        ) {
            $this->rechazarExtrasDePizza(
                $item,
                'Los ingredientes extras de pizza no pueden utilizarse en este producto.'
            );

            $this->rechazarPasta(
                $item,
                'Las opciones de pasta no pueden utilizarse en un producto de carnes.'
            );

            return $this->resolverAcompanamientos(
                $item
            );
        }

        if ($tipo !== null && $tipo !== '') {
            throw ValidationException::withMessages([
                'productos' => [
                    'El producto tiene un tipo de personalización no reconocido.',
                ],
            ]);
        }

        /*
         * Producto normal, pasta establecida o pizza actual.
         * Las nuevas estructuras deben venir vacías.
         */
        $this->rechazarPasta(
            $item,
            'Este producto no admite personalización de pasta.'
        );

        $this->rechazarAcompanamientos(
            $item,
            'Este producto no admite acompañamientos seleccionables.'
        );

        return $this->resolverExtrasActuales(
            $item
        );
    }

    /*
    |--------------------------------------------------------------------------
    | EXTRAS ACTUALES DE PIZZA
    |--------------------------------------------------------------------------
    */

    private function resolverExtrasActuales(
        array $item
    ): array {
        $ingredientesExtras =
            $this->resolverIngredientesExtras(
                $item
            );

        $texto = $ingredientesExtras
            ->isNotEmpty()
            ? $ingredientesExtras
                ->pluck('nombre')
                ->implode(', ')
            : null;

        $totalAdicional = round(
            (float) $ingredientesExtras
                ->sum(
                    fn(
                    Ingrediente $ingrediente
                ) =>
                    (float) $ingrediente
                        ->precio_extra
                ),
            2
        );

        return [
            'texto' =>
                $texto,

            'total_adicional' =>
                $totalAdicional,

            /*
             * Las pizzas siguen utilizando extras y extras_ids.
             * No se cambia su formato actual de almacenamiento.
             */
            'personalizacion' =>
                null,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | PASTA PERSONALIZADA
    |--------------------------------------------------------------------------
    */

    private function resolverPasta(
        array $item
    ): array {
        $pasta = $item['pasta'] ?? null;

        if (!is_array($pasta)) {
            throw ValidationException::withMessages([
                'productos' => [
                    'Debes seleccionar la composición de la pasta.',
                ],
            ]);
        }

        $tipoPastaId =
            $pasta['tipo_pasta_id']
            ?? null;

        if (
            !is_int($tipoPastaId)
            && !ctype_digit(
                (string) $tipoPastaId
            )
        ) {
            throw ValidationException::withMessages([
                'productos' => [
                    'Debes seleccionar un tipo de pasta válido.',
                ],
            ]);
        }

        $tipoPasta =
            $this->resolverOpcionPastaUnica(
                (int) $tipoPastaId,
                OpcionPasta::GRUPO_TIPO_PASTA,
                'El tipo de pasta seleccionado no existe o está agotado.'
            );

        $proteinas =
            $this->resolverOpcionesPastaMultiples(
                $pasta['proteina_ids']
                ?? [],
                OpcionPasta::GRUPO_PROTEINA,
                'Una de las proteínas seleccionadas no existe o está agotada.'
            );

        $salsa = null;
        $salsaId =
            $pasta['salsa_id']
            ?? null;

        if (
            $salsaId !== null
            && $salsaId !== ''
        ) {
            $salsa =
                $this->resolverOpcionPastaUnica(
                    (int) $salsaId,
                    OpcionPasta::GRUPO_SALSA,
                    'La salsa seleccionada no existe o está agotada.'
                );
        }

        $ingredientes =
            $this->resolverOpcionesPastaMultiples(
                $pasta['ingrediente_ids']
                ?? [],
                OpcionPasta::GRUPO_INGREDIENTE,
                'Uno de los ingredientes de la pasta no existe o está agotado.'
            );

        $totalAdicional = round(
            (float) $tipoPasta
                ->precio_extra
            + (float) $proteinas->sum(
                fn(OpcionPasta $opcion) =>
                (float) $opcion
                    ->precio_extra
            )
            + (
                $salsa
                ? (float) $salsa
                    ->precio_extra
                : 0
            )
            + (float) $ingredientes->sum(
                fn(OpcionPasta $opcion) =>
                (float) $opcion
                    ->precio_extra
            ),
            2
        );

        $proteinasTexto = $proteinas
            ->isNotEmpty()
            ? $proteinas
                ->pluck('nombre')
                ->implode(', ')
            : 'Sin proteína';

        $salsaTexto = $salsa
            ? $salsa->nombre
            : 'Sin salsa';

        $ingredientesTexto = $ingredientes
            ->isNotEmpty()
            ? $ingredientes
                ->pluck('nombre')
                ->implode(', ')
            : 'Sin ingredientes adicionales';

        $texto = implode(
            ' | ',
            [
                'Tipo de pasta: '
                . $tipoPasta->nombre,

                'Proteínas: '
                . $proteinasTexto,

                'Salsa: '
                . $salsaTexto,

                'Ingredientes adicionales: '
                . $ingredientesTexto,
            ]
        );

        return [
            'texto' =>
                $texto,

            'total_adicional' =>
                $totalAdicional,

            'personalizacion' => [
                'tipo' =>
                    Producto::PERSONALIZACION_PASTA,

                'tipo_pasta' =>
                    $this->datosOpcionPasta(
                        $tipoPasta
                    ),

                'proteinas' =>
                    $proteinas
                        ->map(
                            fn(
                            OpcionPasta $opcion
                        ) =>
                            $this->datosOpcionPasta(
                                $opcion
                            )
                        )
                        ->values()
                        ->all(),

                'salsa' =>
                    $salsa
                    ? $this->datosOpcionPasta(
                        $salsa
                    )
                    : null,

                'ingredientes' =>
                    $ingredientes
                        ->map(
                            fn(
                            OpcionPasta $opcion
                        ) =>
                            $this->datosOpcionPasta(
                                $opcion
                            )
                        )
                        ->values()
                        ->all(),

                'total_adicional' =>
                    $totalAdicional,
            ],
        ];
    }

    private function resolverOpcionPastaUnica(
        int $id,
        string $grupo,
        string $mensajeError
    ): OpcionPasta {
        $opcion = OpcionPasta::query()
            ->where('id', $id)
            ->where('grupo', $grupo)
            ->where(
                'estado',
                OpcionPasta::ESTADO_DISPONIBLE
            )
            ->lockForUpdate()
            ->first();

        if (!$opcion) {
            throw ValidationException::withMessages([
                'productos' => [
                    $mensajeError,
                ],
            ]);
        }

        return $opcion;
    }

    private function resolverOpcionesPastaMultiples(
        array $ids,
        string $grupo,
        string $mensajeError
    ): Collection {
        $idsNormalizados =
            $this->normalizarIdsUnicos(
                $ids,
                'No puedes repetir una opción dentro de la pasta.'
            );

        if ($idsNormalizados->isEmpty()) {
            return collect();
        }

        $opcionesPorId = OpcionPasta::query()
            ->whereIn(
                'id',
                $idsNormalizados
            )
            ->where(
                'grupo',
                $grupo
            )
            ->where(
                'estado',
                OpcionPasta::ESTADO_DISPONIBLE
            )
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        if (
            $opcionesPorId->count()
            !== $idsNormalizados->count()
        ) {
            throw ValidationException::withMessages([
                'productos' => [
                    $mensajeError,
                ],
            ]);
        }

        return $idsNormalizados
            ->map(
                fn($id) =>
                $opcionesPorId->get($id)
            );
    }

    private function datosOpcionPasta(
        OpcionPasta $opcion
    ): array {
        return [
            'id' =>
                $opcion->id,

            'grupo' =>
                $opcion->grupo,

            'nombre' =>
                $opcion->nombre,

            'precio_aplicado' =>
                (float) $opcion
                    ->precio_extra,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | ACOMPAÑAMIENTOS DE CARNES
    |--------------------------------------------------------------------------
    */

    private function resolverAcompanamientos(
        array $item
    ): array {
        $ids = $this->normalizarIdsUnicos(
            $item['acompanamientos_ids']
            ?? [],
            'No puedes seleccionar el mismo acompañamiento más de una vez.'
        );

        if ($ids->isEmpty()) {
            return [
                'texto' =>
                    'Acompañamientos incluidos: Ninguno | Acompañamientos adicionales: Ninguno',

                'total_adicional' =>
                    0,

                'personalizacion' => [
                    'tipo' =>
                        Producto::PERSONALIZACION_ACOMPANAMIENTOS,

                    'acompanamientos' =>
                        [],

                    'total_adicional' =>
                        0,
                ],
            ];
        }

        $acompanamientosPorId =
            Acompanamiento::query()
                ->whereIn(
                    'id',
                    $ids
                )
                ->where(
                    'estado',
                    Acompanamiento::ESTADO_DISPONIBLE
                )
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

        if (
            $acompanamientosPorId->count()
            !== $ids->count()
        ) {
            throw ValidationException::withMessages([
                'productos' => [
                    'Uno de los acompañamientos no existe o está agotado.',
                ],
            ]);
        }

        $acompanamientosOrdenados = $ids
            ->map(
                fn($id) =>
                $acompanamientosPorId
                    ->get($id)
            );

        $snapshot = [];
        $incluidos = [];
        $adicionales = [];
        $totalAdicional = 0;

        foreach (
            $acompanamientosOrdenados
            as $indice => $acompanamiento
        ) {
            $esIncluido = $indice < 2;

            $precioAplicado = $esIncluido
                ? 0
                : (float) $acompanamiento
                    ->precio_extra;

            $totalAdicional +=
                $precioAplicado;

            $snapshot[] = [
                'id' =>
                    $acompanamiento->id,

                'nombre' =>
                    $acompanamiento->nombre,

                'orden_seleccion' =>
                    $indice + 1,

                'incluido' =>
                    $esIncluido,

                'precio_configurado' =>
                    (float) $acompanamiento
                        ->precio_extra,

                'precio_aplicado' =>
                    $precioAplicado,
            ];

            if ($esIncluido) {
                $incluidos[] =
                    $acompanamiento->nombre;
            } else {
                $adicionales[] =
                    $acompanamiento->nombre
                    . ' (+₡'
                    . number_format(
                        $precioAplicado,
                        0,
                        ',',
                        '.'
                    )
                    . ')';
            }
        }

        $totalAdicional = round(
            $totalAdicional,
            2
        );

        $texto = implode(
            ' | ',
            [
                'Acompañamientos incluidos: '
                . (
                    $incluidos
                    ? implode(
                        ', ',
                        $incluidos
                    )
                    : 'Ninguno'
                ),

                'Acompañamientos adicionales: '
                . (
                    $adicionales
                    ? implode(
                        ', ',
                        $adicionales
                    )
                    : 'Ninguno'
                ),
            ]
        );

        return [
            'texto' =>
                $texto,

            'total_adicional' =>
                $totalAdicional,

            'personalizacion' => [
                'tipo' =>
                    Producto::PERSONALIZACION_ACOMPANAMIENTOS,

                'acompanamientos' =>
                    $snapshot,

                'total_adicional' =>
                    $totalAdicional,
            ],
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDACIONES DE COMPATIBILIDAD ENTRE PERSONALIZADORES
    |--------------------------------------------------------------------------
    */

    private function rechazarExtrasDePizza(
        array $item,
        string $mensaje
    ): void {
        $ids = collect(
            $item['extras_ids'] ?? []
        )->filter(
                fn($id) =>
                $id !== null
                && $id !== ''
            );

        $texto = trim(
            (string) (
                $item['extras'] ?? ''
            )
        );

        if (
            $ids->isNotEmpty()
            || $texto !== ''
        ) {
            throw ValidationException::withMessages([
                'productos' => [
                    $mensaje,
                ],
            ]);
        }
    }

    private function rechazarPasta(
        array $item,
        string $mensaje
    ): void {
        $pasta = $item['pasta'] ?? null;

        if (
            is_array($pasta)
            && collect($pasta)
                ->filter(
                    fn($valor) =>
                    $valor !== null
                    && $valor !== ''
                    && $valor !== []
                )
                ->isNotEmpty()
        ) {
            throw ValidationException::withMessages([
                'productos' => [
                    $mensaje,
                ],
            ]);
        }
    }

    private function rechazarAcompanamientos(
        array $item,
        string $mensaje
    ): void {
        $ids = collect(
            $item['acompanamientos_ids']
            ?? []
        )->filter(
                fn($id) =>
                $id !== null
                && $id !== ''
            );

        if ($ids->isNotEmpty()) {
            throw ValidationException::withMessages([
                'productos' => [
                    $mensaje,
                ],
            ]);
        }
    }

    private function normalizarIdsUnicos(
        array $ids,
        string $mensajeDuplicado
    ): Collection {
        $normalizados = collect($ids)
            ->filter(
                fn($id) =>
                $id !== null
                && $id !== ''
            )
            ->map(
                fn($id) => (int) $id
            )
            ->values();

        if (
            $normalizados->count()
            !== $normalizados
                ->unique()
                ->count()
        ) {
            throw ValidationException::withMessages([
                'productos' => [
                    $mensajeDuplicado,
                ],
            ]);
        }

        return $normalizados
            ->unique()
            ->values();
    }

    /*
    |--------------------------------------------------------------------------
    | RESOLVER INGREDIENTES EXTRAS
    |--------------------------------------------------------------------------
    |
    | extras_ids es el formato principal.
    |
    | La búsqueda por nombre se conserva temporalmente para que los pedidos
    | existentes del frontend continúen funcionando sin alterar las pizzas.
    |
    */
    private function resolverIngredientesExtras(
        array $item
    ): Collection {
        /*
        |--------------------------------------------------------------------------
        | OBTENER IDENTIFICADORES
        |--------------------------------------------------------------------------
        |
        | No utilizamos unique() antes de validar porque ocultaría
        | una selección duplicada enviada por React.
        |
        */

        $ids = collect(
            $item['extras_ids'] ?? []
        )
            ->filter(
                fn($id) =>
                $id !== null &&
                $id !== ''
            )
            ->map(
                fn($id) => (int) $id
            )
            ->values();

        /*
         * Rechaza duplicados solamente dentro
         * de esta línea del pedido.
         */
        if ($ids->duplicates()->isNotEmpty()) {
            throw ValidationException::withMessages([
                'productos' => [
                    'No puedes seleccionar el mismo ingrediente extra más de una vez en una pizza.',
                ],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | BUSCAR POR IDENTIFICADORES
        |--------------------------------------------------------------------------
        */

        if ($ids->isNotEmpty()) {
            $ingredientesPorId =
                Ingrediente::query()
                    ->whereIn(
                        'id',
                        $ids
                    )
                    ->where(
                        'estado',
                        'disponible'
                    )
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

            if (
                $ingredientesPorId->count()
                !== $ids->count()
            ) {
                throw ValidationException::withMessages([
                    'productos' => [
                        'Uno de los ingredientes extras no existe o ya no está disponible.',
                    ],
                ]);
            }

            /*
             * Mantiene el orden en que fueron
             * seleccionados desde React.
             */
            return $ids->map(
                fn($id) =>
                $ingredientesPorId->get(
                    $id
                )
            );
        }

        /*
        |--------------------------------------------------------------------------
        | COMPATIBILIDAD TEMPORAL POR NOMBRE
        |--------------------------------------------------------------------------
        */

        $extrasTexto = trim(
            (string) (
                $item['extras'] ?? ''
            )
        );

        if ($extrasTexto === '') {
            return collect();
        }

        $nombres = collect(
            explode(
                ',',
                $extrasTexto
            )
        )
            ->map(
                fn($nombre) =>
                trim($nombre)
            )
            ->filter(
                fn($nombre) =>
                $nombre !== ''
            )
            ->values();

        if ($nombres->isEmpty()) {
            return collect();
        }

        /*
         * También se rechazan nombres repetidos
         * dentro de la misma pizza.
         */
        $nombresNormalizados =
            $nombres->map(
                fn($nombre) =>
                mb_strtolower(
                    trim($nombre)
                )
            );

        if (
            $nombresNormalizados
                ->duplicates()
                ->isNotEmpty()
        ) {
            throw ValidationException::withMessages([
                'productos' => [
                    'No puedes seleccionar el mismo ingrediente extra más de una vez en una pizza.',
                ],
            ]);
        }

        $ingredientesPorNombre =
            Ingrediente::query()
                ->whereIn(
                    'nombre',
                    $nombres
                )
                ->where(
                    'estado',
                    'disponible'
                )
                ->lockForUpdate()
                ->get()
                ->keyBy(
                    fn(
                    Ingrediente $ingrediente
                ) =>
                    mb_strtolower(
                        trim(
                            $ingrediente->nombre
                        )
                    )
                );

        $ingredientesOrdenados =
            $nombres->map(
                fn($nombre) =>
                $ingredientesPorNombre
                    ->get(
                        mb_strtolower(
                            trim($nombre)
                        )
                    )
            );

        if (
            $ingredientesOrdenados
                ->contains(
                    fn($ingrediente) =>
                    $ingrediente === null
                )
        ) {
            throw ValidationException::withMessages([
                'productos' => [
                    'Uno de los ingredientes extras no existe o ya no está disponible.',
                ],
            ]);
        }

        return $ingredientesOrdenados;
    }


    /*
    |--------------------------------------------------------------------------
    | NOTIFICACIÓN DE NUEVO PEDIDO
    |--------------------------------------------------------------------------
    */

    private function enviarNotificacionNtfy(
        Pedido $pedido,
        string $metodoPago
    ): void {
        if (
            !config(
                'services.ntfy.enabled',
                true
            )
        ) {
            return;
        }

        $servidor = rtrim(
            (string) config(
                'services.ntfy.server',
                'https://ntfy.sh'
            ),
            '/'
        );

        $tema = trim(
            (string) config(
                'services.ntfy.topic'
            )
        );

        if (
            $servidor === ''
            || $tema === ''
        ) {
            Log::warning(
                'No se envió la notificación de ntfy porque falta su configuración.',
                [
                    'pedido_id' =>
                        $pedido->id,

                    'codigo_tracking' =>
                        $pedido
                            ->codigo_tracking,
                ]
            );

            return;
        }

        $clienteNombre =
            'Sin cliente';

        if ($pedido->cliente) {
            $clienteNombre = trim(
                (
                    $pedido
                        ->cliente
                        ->nombre
                    ?? ''
                )
                . ' '
                . (
                    $pedido
                        ->cliente
                        ->apellido
                    ?? ''
                )
            );

            if ($clienteNombre === '') {
                $clienteNombre =
                    'Sin cliente';
            }
        }

        $productos = $pedido
            ->detalles
            ->map(
                function ($detalle) {
                    $nombreProducto =
                        $detalle->producto
                        ? $detalle
                            ->producto
                            ->nombre
                        : 'Producto no disponible';

                    $linea =
                        '- '
                        . $nombreProducto
                        . ' x'
                        . $detalle->cantidad;

                    if ($detalle->extras) {
                        $etiquetaDetalle =
                            $detalle->personalizacion
                            ? ' | Personalización: '
                            : ' | Extras: ';

                        $linea .=
                            $etiquetaDetalle
                            . $detalle->extras;
                    }

                    return $linea;
                }
            )
            ->implode(PHP_EOL);

        if ($productos === '') {
            $productos =
                '- Sin productos';
        }

        $modalidad = match (
        $pedido->modalidad_entrega
        ) {
            'consumo_local' =>
            'Consumo en el local',

            'retiro' =>
            'Retiro',

            default =>
            ucfirst(
                str_replace(
                    '_',
                    ' ',
                    (string) 
                    $pedido
                        ->modalidad_entrega
                )
            ),
        };

        $metodoPagoTexto = match (
        $metodoPago
        ) {
            'sinpe' =>
            'SINPE Móvil',

            'efectivo' =>
            'Efectivo',

            'tarjeta' =>
            'Tarjeta',

            default =>
            ucfirst($metodoPago),
        };

        $mensaje = implode(
            PHP_EOL,
            [
                'Código: '
                . $pedido
                    ->codigo_tracking,

                'Cliente: '
                . $clienteNombre,

                'Modalidad: '
                . $modalidad,

                '',

                'Productos:',

                $productos,

                '',

                'Total: ₡'
                . number_format(
                    (float) 
                    $pedido->total,
                    0,
                    ',',
                    '.'
                ),

                'Método de pago: '
                . $metodoPagoTexto,
            ]
        );

        try {
            Http::connectTimeout(3)
                ->timeout(5)
                ->withHeaders([
                    'X-Title' =>
                        'Nuevo pedido '
                        . $pedido
                            ->codigo_tracking,

                    'X-Priority' =>
                        'high',

                    'X-Tags' =>
                        'pizza',
                ])
                ->withBody(
                    $mensaje,
                    'text/plain; charset=utf-8'
                )
                ->post(
                    $servidor
                    . '/'
                    . rawurlencode($tema)
                )
                ->throw();
        } catch (\Throwable $error) {
            Log::warning(
                'El pedido se creó, pero no fue posible enviar la notificación de ntfy.',
                [
                    'pedido_id' =>
                        $pedido->id,

                    'codigo_tracking' =>
                        $pedido
                            ->codigo_tracking,

                    'error' =>
                        $error->getMessage(),
                ]
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | GUARDAR MÉTODO DE PAGO
    |--------------------------------------------------------------------------
    */

    private function guardarMetodoPago(
        $pedidoId,
        $metodo
    ) {
        $pedido = Pedido::with(
            'cliente'
        )->find($pedidoId);

        $this->actualizarMetadataPedido(
            $pedidoId,
            [
                'metodo_pago' =>
                    $metodo,

                'estado_pago' =>
                    $metodo === 'sinpe'
                    ? 'pendiente_comprobante'
                    : 'no_requiere',

                'fecha' =>
                    now()
                        ->toDateTimeString(),

                'cliente_nombre' =>
                    $pedido
                    && $pedido->cliente
                    ? $pedido
                        ->cliente
                        ->nombre
                    : 'Sin cliente',
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | GUARDAR COMPROBANTE
    |--------------------------------------------------------------------------
    */

    private function guardarComprobante(
        $file,
        $pedidoId
    ) {
        $extension = $file
            ->getClientOriginalExtension();

        $nombre =
            "comprobante_{$pedidoId}_"
            . time()
            . ".{$extension}";

        $ruta = $file->storeAs(
            'comprobantes',
            $nombre,
            'public'
        );

        $pedido = Pedido::with(
            'cliente'
        )->find($pedidoId);

        $clienteNombre = (
            $pedido
            && $pedido->cliente
        )
            ? $pedido
                ->cliente
                ->nombre
            : 'Sin cliente';

        $this->actualizarMetadataPedido(
            $pedidoId,
            [
                'comprobante' =>
                    $ruta,

                'estado_pago' =>
                    'pendiente_verificacion',

                'fecha_comprobante' =>
                    now()
                        ->toDateTimeString(),

                'cliente_nombre' =>
                    $clienteNombre,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | LISTAR COMPROBANTES
    |--------------------------------------------------------------------------
    */

    public function listarComprobantes()
    {
        $data =
            $this->leerMetadata();

        $resultado = [];

        foreach ($data as $item) {
            if (
                !isset(
                $item['comprobante']
            )
            ) {
                continue;
            }

            $pedido = Pedido::with(
                'cliente'
            )->find(
                    $item['pedido_id']
                );

            if (!$pedido) {
                continue;
            }

            $resultado[] = [
                'pedido_id' =>
                    $pedido->id,

                'codigo_tracking' =>
                    $pedido
                        ->codigo_tracking,

                'cliente_nombre' =>
                    $pedido->cliente
                    ? $pedido
                        ->cliente
                        ->nombre
                    : (
                        $item[
                            'cliente_nombre'
                        ]
                        ?? 'Sin cliente'
                    ),

                'metodo_pago' =>
                    $item[
                        'metodo_pago'
                    ] ?? null,

                'comprobante' =>
                    $item['comprobante'],

                'comprobante_url' =>
                    asset(
                        'storage/'
                        . $item[
                            'comprobante'
                        ]
                    ),

                'estado_pago' =>
                    $item['estado_pago']
                    ?? 'pendiente_verificacion',

                'fecha' =>
                    $item[
                        'fecha_comprobante'
                    ]
                    ?? $item['fecha']
                    ?? $pedido->created_at,
            ];
        }

        return response()->json(
            $resultado
        );
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFICAR COMPROBANTE
    |--------------------------------------------------------------------------
    */

    public function verificarComprobante(
        $pedidoId,
        Request $request
    ) {
        $validated =
            $request->validate([
                'estado' => [
                    'required',

                    Rule::in([
                        'verificado',
                        'rechazado',
                    ]),
                ],
            ]);

        $this->actualizarMetadataPedido(
            $pedidoId,
            [
                'estado_pago' =>
                    $validated['estado'],

                'fecha_verificacion' =>
                    now()
                        ->toDateTimeString(),
            ]
        );

        return response()->json([
            'message' =>
                'Estado actualizado correctamente',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | ACTUALIZAR ESTADO DEL PEDIDO
    |--------------------------------------------------------------------------
    */

    public function updateEstado(
        Request $request,
        Pedido $pedido
    ) {
        $validated =
            $request->validate([
                'estado_pedido' => [
                    'required',

                    Rule::in([
                        'pendiente',
                        'confirmado',
                        'en_preparacion',
                        'listo',
                        'entregado',
                    ]),
                ],
            ]);

        $pedido->update([
            'estado_pedido' =>
                $validated[
                    'estado_pedido'
                ],
        ]);

        return response()->json([
            'message' =>
                'Estado actualizado',

            'pedido' =>
                $pedido->load(
                    'detalles.producto',
                    'cliente'
                ),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | BUSCAR PEDIDO POR TRACKING
    |--------------------------------------------------------------------------
    */

    public function buscarPorTracking(
        $codigo
    ) {
        $pedido = Pedido::with(
            'detalles.producto',
            'cliente'
        )
            ->where(
                'codigo_tracking',
                strtoupper($codigo)
            )
            ->first();

        if (!$pedido) {
            return response()->json([
                'message' =>
                    'No se encontró ningún pedido con ese código.',
            ], 404);
        }

        return response()->json(
            $pedido
        );
    }

    /*
    |--------------------------------------------------------------------------
    | CONSULTA PÚBLICA DEL PEDIDO
    |--------------------------------------------------------------------------
    */

    public function pedidoPublico(
        $codigo
    ) {
        $pedido = Pedido::with(
            'cliente',
            'detalles.producto'
        )
            ->where(
                'codigo_tracking',
                strtoupper($codigo)
            )
            ->first();

        if (!$pedido) {
            return response()->json([
                'message' =>
                    'Pedido no encontrado',
            ], 404);
        }

        $metadata =
            $this->obtenerMetadataPedido(
                $pedido->id
            );

        return response()->json([
            'pedido' => [
                'id' =>
                    $pedido->id,

                'codigo_tracking' =>
                    $pedido
                        ->codigo_tracking,

                'cliente' =>
                    $pedido->cliente,

                'total' =>
                    $pedido->total,

                'estado_pedido' =>
                    $pedido
                        ->estado_pedido,

                'modalidad_entrega' =>
                    $pedido
                        ->modalidad_entrega,

                'detalles' =>
                    $pedido
                        ->detalles
                        ->map(
                            function ($detalle) {
                                return [
                                    'producto' =>
                                        $detalle
                                            ->producto,

                                    'cantidad' =>
                                        $detalle
                                            ->cantidad,

                                    'precio_unitario' =>
                                        $detalle
                                            ->precio_unitario,

                                    'subtotal' =>
                                        $detalle
                                            ->subtotal,

                                    'extras' =>
                                        $detalle
                                            ->extras,

                                    'observaciones' =>
                                        $detalle
                                            ->observaciones,

                                    'personalizacion' =>
                                        $detalle
                                            ->personalizacion,
                                ];
                            }
                        ),

                'metodo_pago' =>
                    $metadata[
                        'metodo_pago'
                    ] ?? null,

                'estado_pago' =>
                    $metadata[
                        'estado_pago'
                    ] ?? null,

                'comprobante' =>
                    $metadata[
                        'comprobante'
                    ] ?? null,

                'comprobante_url' =>
                    isset(
                    $metadata[
                        'comprobante'
                    ]
                )
                    ? asset(
                        'storage/'
                        . $metadata[
                            'comprobante'
                        ]
                    )
                    : null,
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | SUBIR COMPROBANTE
    |--------------------------------------------------------------------------
    */

    public function subirComprobante(
        Request $request,
        $codigo
    ) {
        $request->validate([
            'comprobante' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:10240',
            ],
        ]);

        $pedido = Pedido::where(
            'codigo_tracking',
            strtoupper($codigo)
        )->first();

        if (!$pedido) {
            return response()->json([
                'message' =>
                    'Pedido no encontrado',
            ], 404);
        }

        $archivo =
            $request->file(
                'comprobante'
            );

        $extension = $archivo
            ->getClientOriginalExtension();

        $nombreArchivo =
            $pedido->codigo_tracking
            . '.'
            . $extension;

        $ruta = $archivo->storeAs(
            'comprobantes',
            $nombreArchivo,
            'public'
        );

        $this->actualizarMetadataPedido(
            $pedido->id,
            [
                'comprobante' =>
                    $ruta,

                'estado_pago' =>
                    'pendiente_verificacion',

                'fecha_comprobante' =>
                    now()
                        ->toDateTimeString(),
            ]
        );

        return response()->json([
            'message' =>
                'Comprobante subido correctamente',

            'archivo' =>
                asset(
                    'storage/' . $ruta
                ),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | OBTENER METADATA DEL PEDIDO
    |--------------------------------------------------------------------------
    */

    private function obtenerMetadataPedido(
        $pedidoId
    ) {
        $data =
            $this->leerMetadata();

        foreach ($data as $item) {
            if (
                (int) $item['pedido_id']
                === (int) $pedidoId
            ) {
                return $item;
            }
        }

        return null;
    }

    /*
    |--------------------------------------------------------------------------
    | ACTUALIZAR METADATA
    |--------------------------------------------------------------------------
    */

    private function actualizarMetadataPedido(
        $pedidoId,
        array $nuevosDatos
    ) {
        $data =
            $this->leerMetadata();

        $index = false;

        foreach (
            $data as $key => $item
        ) {
            if (
                (int) $item['pedido_id']
                === (int) $pedidoId
            ) {
                $index = $key;
                break;
            }
        }

        if ($index !== false) {
            $data[$index] = array_merge(
                $data[$index],
                [
                    'pedido_id' =>
                        $pedidoId,
                ],
                $nuevosDatos
            );
        } else {
            $data[] = array_merge(
                [
                    'pedido_id' =>
                        $pedidoId,
                ],
                $nuevosDatos
            );
        }

        $this->guardarMetadata(
            $data
        );
    }

    /*
    |--------------------------------------------------------------------------
    | LEER METADATA
    |--------------------------------------------------------------------------
    */

    private function leerMetadata()
    {
        $ruta = storage_path(
            'app/pedidos_metadata.json'
        );

        if (!file_exists($ruta)) {
            return [];
        }

        $contenido =
            file_get_contents($ruta);

        if ($contenido === false) {
            return [];
        }

        return json_decode(
            $contenido,
            true
        ) ?? [];
    }

    /*
    |--------------------------------------------------------------------------
    | GUARDAR METADATA
    |--------------------------------------------------------------------------
    */

    private function guardarMetadata(
        array $data
    ) {
        $ruta = storage_path(
            'app/pedidos_metadata.json'
        );

        if (
            !is_dir(
                dirname($ruta)
            )
        ) {
            mkdir(
                dirname($ruta),
                0755,
                true
            );
        }

        file_put_contents(
            $ruta,
            json_encode(
                $data,
                JSON_PRETTY_PRINT
                | JSON_UNESCAPED_UNICODE
            )
        );
    }
}