<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PedidoVerificacionComprobanteTest extends TestCase
{
    use RefreshDatabase;

    private string $rutaMetadata;
    private bool $metadataExistia;
    private ?string $respaldoMetadata = null;

    protected function setUp(): void
    {
        parent::setUp();

        /*
         * Respaldamos el archivo real de metadata para evitar
         * modificar los datos reales durante las pruebas.
         */
        $this->rutaMetadata = storage_path(
            'app/pedidos_metadata.json'
        );

        $this->metadataExistia = file_exists(
            $this->rutaMetadata
        );

        if ($this->metadataExistia) {
            $contenido = file_get_contents(
                $this->rutaMetadata
            );

            $this->respaldoMetadata = $contenido !== false
                ? $contenido
                : '[]';
        }

        file_put_contents(
            $this->rutaMetadata,
            '[]'
        );
    }

    protected function tearDown(): void
    {
        /*
         * Restauramos la metadata original.
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

    /**
     * Simula un usuario autenticado con el rol indicado.
     */
    private function autenticarComo(string $rol): void
    {
        $usuario = new User();

        $usuario->forceFill([
            'id' => 1,
            'name' => 'Usuario de prueba',
            'email' => "{$rol}@test.com",
            'rol' => $rol,
            'estado' => 'activo',
        ]);

        Sanctum::actingAs($usuario, ['*']);
    }

    private function crearPedido(): int
    {
        $clienteId = DB::table('clientes')->insertGetId([
            'nombre' => 'Cliente SINPE',
            'telefono' => '88888888',
            'correo' => 'sinpe@test.com',
            'fecha_registro' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return DB::table('pedidos')->insertGetId([
            'cliente_id' => $clienteId,
            'codigo_tracking' => 'RC-VER123',
            'modalidad_entrega' => 'retiro',
            'estado_pedido' => 'pendiente',
            'total' => 12500,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function guardarMetadataPendiente(int $pedidoId): void
    {
        $metadata = [
            [
                'pedido_id' => $pedidoId,
                'metodo_pago' => 'sinpe',
                'estado_pago' => 'pendiente_verificacion',
                'comprobante' => 'comprobantes/RC-VER123.pdf',
                'fecha' => now()->toDateTimeString(),
                'fecha_comprobante' => now()->toDateTimeString(),
                'cliente_nombre' => 'Cliente SINPE',
            ],
        ];

        file_put_contents(
            $this->rutaMetadata,
            json_encode(
                $metadata,
                JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
            )
        );
    }

    private function obtenerMetadataPedido(
        int $pedidoId
    ): ?array {
        $contenido = file_get_contents(
            $this->rutaMetadata
        );

        $metadata = json_decode(
            $contenido ?: '[]',
            true
        );

        return collect($metadata)->first(
            fn (array $item) =>
                (int) $item['pedido_id'] === $pedidoId
        );
    }

    public function test_no_permite_listar_comprobantes_sin_autenticacion(): void
    {
        /*
        |--------------------------------------------------------------------------
        | ACT
        |--------------------------------------------------------------------------
        */

        $response = $this->getJson(
            '/api/admin/comprobantes'
        );

        /*
        |--------------------------------------------------------------------------
        | ASSERT
        |--------------------------------------------------------------------------
        */

        $response->assertUnauthorized();
    }

    public function test_usuario_autenticado_puede_listar_comprobantes(): void
    {
        /*
        |--------------------------------------------------------------------------
        | ARRANGE
        |--------------------------------------------------------------------------
        */

        $pedidoId = $this->crearPedido();

        $this->guardarMetadataPendiente($pedidoId);
        $this->autenticarComo('admin');

        /*
        |--------------------------------------------------------------------------
        | ACT
        |--------------------------------------------------------------------------
        */

        $response = $this->getJson(
            '/api/admin/comprobantes'
        );

        /*
        |--------------------------------------------------------------------------
        | ASSERT
        |--------------------------------------------------------------------------
        */

        $response
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath(
                '0.pedido_id',
                $pedidoId
            )
            ->assertJsonPath(
                '0.codigo_tracking',
                'RC-VER123'
            )
            ->assertJsonPath(
                '0.cliente_nombre',
                'Cliente SINPE'
            )
            ->assertJsonPath(
                '0.metodo_pago',
                'sinpe'
            )
            ->assertJsonPath(
                '0.estado_pago',
                'pendiente_verificacion'
            )
            ->assertJsonPath(
                '0.comprobante',
                'comprobantes/RC-VER123.pdf'
            )
            ->assertJsonStructure([
                [
                    'pedido_id',
                    'codigo_tracking',
                    'cliente_nombre',
                    'metodo_pago',
                    'comprobante',
                    'comprobante_url',
                    'estado_pago',
                    'fecha',
                ],
            ]);
    }

    public function test_usuario_autenticado_puede_verificar_un_comprobante(): void
    {
        /*
        |--------------------------------------------------------------------------
        | ARRANGE
        |--------------------------------------------------------------------------
        */

        $pedidoId = $this->crearPedido();

        $this->guardarMetadataPendiente($pedidoId);
        $this->autenticarComo('admin');

        /*
        |--------------------------------------------------------------------------
        | ACT
        |--------------------------------------------------------------------------
        */

        $response = $this->patchJson(
            "/api/admin/comprobantes/{$pedidoId}/verificar",
            [
                'estado' => 'verificado',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | ASSERT
        |--------------------------------------------------------------------------
        */

        $response
            ->assertOk()
            ->assertJson([
                'message' => 'Estado actualizado correctamente',
            ]);

        $registro = $this->obtenerMetadataPedido(
            $pedidoId
        );

        $this->assertNotNull($registro);

        $this->assertSame(
            'verificado',
            $registro['estado_pago']
        );

        $this->assertArrayHasKey(
            'fecha_verificacion',
            $registro
        );

        /*
         * Los otros datos deben conservarse.
         */
        $this->assertSame(
            'sinpe',
            $registro['metodo_pago']
        );

        $this->assertSame(
            'comprobantes/RC-VER123.pdf',
            $registro['comprobante']
        );
    }

    public function test_usuario_autenticado_puede_rechazar_un_comprobante(): void
    {
        /*
        |--------------------------------------------------------------------------
        | ARRANGE
        |--------------------------------------------------------------------------
        */

        $pedidoId = $this->crearPedido();

        $this->guardarMetadataPendiente($pedidoId);
        $this->autenticarComo('admin');

        /*
        |--------------------------------------------------------------------------
        | ACT
        |--------------------------------------------------------------------------
        */

        $response = $this->patchJson(
            "/api/admin/comprobantes/{$pedidoId}/verificar",
            [
                'estado' => 'rechazado',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | ASSERT
        |--------------------------------------------------------------------------
        */

        $response
            ->assertOk()
            ->assertJsonPath(
                'message',
                'Estado actualizado correctamente'
            );

        $registro = $this->obtenerMetadataPedido(
            $pedidoId
        );

        $this->assertNotNull($registro);

        $this->assertSame(
            'rechazado',
            $registro['estado_pago']
        );

        $this->assertArrayHasKey(
            'fecha_verificacion',
            $registro
        );
    }

    public function test_rechaza_un_estado_de_comprobante_invalido(): void
    {
        /*
        |--------------------------------------------------------------------------
        | ARRANGE
        |--------------------------------------------------------------------------
        */

        $pedidoId = $this->crearPedido();

        $this->guardarMetadataPendiente($pedidoId);
        $this->autenticarComo('admin');

        /*
        |--------------------------------------------------------------------------
        | ACT
        |--------------------------------------------------------------------------
        */

        $response = $this->patchJson(
            "/api/admin/comprobantes/{$pedidoId}/verificar",
            [
                'estado' => 'aprobado_inventado',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | ASSERT
        |--------------------------------------------------------------------------
        */

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'estado',
            ]);

        /*
         * La metadata debe conservar el estado anterior.
         */
        $registro = $this->obtenerMetadataPedido(
            $pedidoId
        );

        $this->assertNotNull($registro);

        $this->assertSame(
            'pendiente_verificacion',
            $registro['estado_pago']
        );

        $this->assertArrayNotHasKey(
            'fecha_verificacion',
            $registro
        );
    }

    public function test_no_permite_verificar_comprobante_sin_autenticacion(): void
    {
        /*
        |--------------------------------------------------------------------------
        | ARRANGE
        |--------------------------------------------------------------------------
        */

        $pedidoId = $this->crearPedido();

        $this->guardarMetadataPendiente($pedidoId);

        /*
        |--------------------------------------------------------------------------
        | ACT
        |--------------------------------------------------------------------------
        */

        $response = $this->patchJson(
            "/api/admin/comprobantes/{$pedidoId}/verificar",
            [
                'estado' => 'verificado',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | ASSERT
        |--------------------------------------------------------------------------
        */

        $response->assertUnauthorized();

        $registro = $this->obtenerMetadataPedido(
            $pedidoId
        );

        $this->assertSame(
            'pendiente_verificacion',
            $registro['estado_pago']
        );
    }
}