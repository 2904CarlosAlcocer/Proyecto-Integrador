<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PedidoComprobanteTest extends TestCase
{
    use RefreshDatabase;

    private string $rutaMetadata;
    private bool $metadataExistia;
    private ?string $respaldoMetadata = null;

    protected function setUp(): void
    {
        parent::setUp();

        /*
         * Simulamos el disco public para no guardar archivos
         * reales durante las pruebas.
         */
        Storage::fake('public');

        /*
         * Respaldamos pedidos_metadata.json para evitar
         * modificar la información real del sistema.
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
         * Restauramos el archivo original al finalizar.
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
     * Crea un pedido básico para realizar las pruebas.
     */
    private function crearPedido(
        string $codigoTracking = 'RC-SIN123'
    ): int {
        return DB::table('pedidos')->insertGetId([
            'cliente_id' => null,
            'codigo_tracking' => $codigoTracking,
            'modalidad_entrega' => 'retiro',
            'estado_pedido' => 'pendiente',
            'total' => 10000,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function test_puede_subir_un_comprobante_sinpe_valido(): void
    {
        /*
        |--------------------------------------------------------------------------
        | ARRANGE
        |--------------------------------------------------------------------------
        */

        $pedidoId = $this->crearPedido();

        $archivo = UploadedFile::fake()->create(
            'comprobante.pdf',
            200,
            'application/pdf'
        );

        /*
        |--------------------------------------------------------------------------
        | ACT
        |--------------------------------------------------------------------------
        */

        $response = $this->post(
            '/api/pedidos/RC-SIN123/comprobante',
            [
                'comprobante' => $archivo,
            ],
            [
                'Accept' => 'application/json',
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
                'Comprobante subido correctamente'
            )
            ->assertJsonStructure([
                'message',
                'archivo',
            ]);

        /*
         * El controlador guarda el archivo utilizando el
         * código tracking del pedido como nombre.
         */
        Storage::disk('public')->assertExists(
            'comprobantes/RC-SIN123.pdf'
        );

        /*
         * Comprobar la metadata guardada.
         */
        $contenido = file_get_contents(
            $this->rutaMetadata
        );

        $metadata = json_decode(
            $contenido ?: '[]',
            true
        );

        $registro = collect($metadata)->first(
            fn (array $item) =>
                (int) $item['pedido_id'] === $pedidoId
        );

        $this->assertNotNull(
            $registro,
            'No se encontró la metadata del comprobante.'
        );

        $this->assertSame(
            'comprobantes/RC-SIN123.pdf',
            $registro['comprobante']
        );

        $this->assertSame(
            'pendiente_verificacion',
            $registro['estado_pago']
        );

        $this->assertArrayHasKey(
            'fecha_comprobante',
            $registro
        );
    }

    public function test_devuelve_404_si_el_tracking_no_existe(): void
    {
        /*
        |--------------------------------------------------------------------------
        | ARRANGE
        |--------------------------------------------------------------------------
        */

        $archivo = UploadedFile::fake()->create(
            'comprobante.pdf',
            200,
            'application/pdf'
        );

        /*
        |--------------------------------------------------------------------------
        | ACT
        |--------------------------------------------------------------------------
        */

        $response = $this->post(
            '/api/pedidos/RC-NOEXIS/comprobante',
            [
                'comprobante' => $archivo,
            ],
            [
                'Accept' => 'application/json',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | ASSERT
        |--------------------------------------------------------------------------
        */

        $response
            ->assertNotFound()
            ->assertJson([
                'message' => 'Pedido no encontrado',
            ]);

        Storage::disk('public')->assertMissing(
            'comprobantes/RC-NOEXIS.pdf'
        );
    }

    public function test_rechaza_un_archivo_no_permitido(): void
    {
        /*
        |--------------------------------------------------------------------------
        | ARRANGE
        |--------------------------------------------------------------------------
        */

        $this->crearPedido('RC-INV123');

        $archivo = UploadedFile::fake()->create(
            'archivo.txt',
            50,
            'text/plain'
        );

        /*
        |--------------------------------------------------------------------------
        | ACT
        |--------------------------------------------------------------------------
        */

        $response = $this->post(
            '/api/pedidos/RC-INV123/comprobante',
            [
                'comprobante' => $archivo,
            ],
            [
                'Accept' => 'application/json',
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
                'comprobante',
            ]);

        Storage::disk('public')->assertMissing(
            'comprobantes/RC-INV123.txt'
        );

        $contenido = file_get_contents(
            $this->rutaMetadata
        );

        $metadata = json_decode(
            $contenido ?: '[]',
            true
        );

        $this->assertEmpty($metadata);
    }

    public function test_el_comprobante_es_obligatorio(): void
    {
        /*
        |--------------------------------------------------------------------------
        | ARRANGE
        |--------------------------------------------------------------------------
        */

        $this->crearPedido('RC-REQ123');

        /*
        |--------------------------------------------------------------------------
        | ACT
        |--------------------------------------------------------------------------
        */

        $response = $this->postJson(
            '/api/pedidos/RC-REQ123/comprobante',
            []
        );

        /*
        |--------------------------------------------------------------------------
        | ASSERT
        |--------------------------------------------------------------------------
        */

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'comprobante',
            ]);

        $contenido = file_get_contents(
            $this->rutaMetadata
        );

        $metadata = json_decode(
            $contenido ?: '[]',
            true
        );

        $this->assertEmpty($metadata);
    }
}