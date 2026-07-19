<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PedidoCreacionTest extends TestCase
{
    use RefreshDatabase;

    private string $rutaMetadata;
    private bool $metadataExistia;
    private ?string $respaldoMetadata = null;

    protected function setUp(): void
    {
        parent::setUp();

        /*
         * El PedidoController guarda información de pago en este
         * archivo JSON. Guardamos una copia para no modificar
         * los datos reales mientras ejecutamos los tests.
         */
        $this->rutaMetadata = storage_path('app/pedidos_metadata.json');

        $this->metadataExistia = file_exists($this->rutaMetadata);

        if ($this->metadataExistia) {
            $contenido = file_get_contents($this->rutaMetadata);

            $this->respaldoMetadata = $contenido !== false
                ? $contenido
                : '[]';
        }

        file_put_contents($this->rutaMetadata, '[]');
    }

    protected function tearDown(): void
    {
        /*
         * Al finalizar el test restauramos el archivo original.
         */
        if ($this->metadataExistia) {
            file_put_contents(
                $this->rutaMetadata,
                $this->respaldoMetadata ?? '[]'
            );
        } elseif (file_exists($this->rutaMetadata)) {
            unlink($this->rutaMetadata);
        }

        parent::tearDown();
    }

    public function test_puede_crear_un_pedido_y_calcular_correctamente_los_extras(): void
    {
        /*
        |--------------------------------------------------------------------------
        | ARRANGE
        |--------------------------------------------------------------------------
        | Preparar los datos necesarios para realizar el pedido.
        */

        $categoriaId = DB::table('categorias')->insertGetId([
            'nombre' => 'Pizzas',
            'descripcion' => 'Pizzas para pruebas',
            'estado' => 'activa',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $clienteId = DB::table('clientes')->insertGetId([
            'nombre' => 'Cliente de prueba',
            'telefono' => '88888888',
            'correo' => 'cliente@test.com',
            'fecha_registro' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $productoId = DB::table('productos')->insertGetId([
            'categoria_id' => $categoriaId,
            'nombre' => 'Pizza Suprema',
            'descripcion' => 'Pizza utilizada para el test',
            'precio' => 5000,
            'imagen' => null,
            'estado' => 'disponible',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $productos = [
            [
                'producto_id' => $productoId,
                'cantidad' => 2,
                'extras' => 'Queso extra, Tocineta',
                'observaciones' => 'Sin cebolla',
            ],
        ];

        /*
         * Precio base:              ₡5.000
         * Queso extra:              ₡1.500
         * Tocineta:                 ₡1.500
         * Precio unitario final:    ₡8.000
         * Cantidad:                       2
         * Total esperado:          ₡16.000
         */

        /*
        |--------------------------------------------------------------------------
        | ACT
        |--------------------------------------------------------------------------
        | Enviar la solicitud al endpoint real del sistema.
        */

        $response = $this->postJson('/api/pedidos', [
            'cliente_id' => $clienteId,
            'modalidad_entrega' => 'retiro',
            'metodo_pago' => 'efectivo',
            'productos' => json_encode($productos),
        ]);

        /*
        |--------------------------------------------------------------------------
        | ASSERT
        |--------------------------------------------------------------------------
        | Verificar la respuesta y los registros guardados.
        */

        $response
            ->assertCreated()
            ->assertJsonPath(
                'message',
                'Pedido creado correctamente'
            )
            ->assertJsonStructure([
                'message',
                'pedido' => [
                    'id',
                    'cliente_id',
                    'codigo_tracking',
                    'modalidad_entrega',
                    'estado_pedido',
                    'total',
                    'detalles',
                    'cliente',
                ],
            ]);

        $pedido = $response->json('pedido');

        $this->assertNotNull($pedido);

        $this->assertMatchesRegularExpression(
            '/^RC-[A-Z0-9]{6}$/',
            $pedido['codigo_tracking']
        );

        $this->assertSame(
            'pendiente',
            $pedido['estado_pedido']
        );

        $this->assertSame(
            'retiro',
            $pedido['modalidad_entrega']
        );

        $this->assertEquals(
            16000,
            (float) $pedido['total']
        );

        /*
         * Comprobar el pedido en la base de datos.
         */
        $this->assertDatabaseHas('pedidos', [
            'id' => $pedido['id'],
            'cliente_id' => $clienteId,
            'codigo_tracking' => $pedido['codigo_tracking'],
            'modalidad_entrega' => 'retiro',
            'estado_pedido' => 'pendiente',
            'total' => '16000.00',
        ]);

        /*
         * Comprobar el detalle del pedido.
         */
        $this->assertDatabaseHas('detalle_pedidos', [
            'pedido_id' => $pedido['id'],
            'producto_id' => $productoId,
            'cantidad' => 2,
            'precio_unitario' => '8000.00',
            'subtotal' => '16000.00',
            'extras' => 'Queso extra, Tocineta',
            'observaciones' => 'Sin cebolla',
        ]);

        /*
         * Comprobar la metadata del método de pago.
         */
        $contenidoMetadata = file_get_contents(
            $this->rutaMetadata
        );

        $metadata = json_decode(
            $contenidoMetadata ?: '[]',
            true
        );

        $registroPago = collect($metadata)->first(
            fn (array $item) =>
                (int) $item['pedido_id'] === (int) $pedido['id']
        );

        $this->assertNotNull(
            $registroPago,
            'No se encontró la metadata del pedido.'
        );

        $this->assertSame(
            'efectivo',
            $registroPago['metodo_pago']
        );

        $this->assertSame(
            'no_requiere',
            $registroPago['estado_pago']
        );
    }
}