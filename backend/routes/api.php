<?php

use App\Http\Controllers\AcompanamientoController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\IngredienteController;
use App\Http\Controllers\OpcionPastaController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\PerfilClienteController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| AUTENTICACIÓN PÚBLICA
|--------------------------------------------------------------------------
*/

Route::post(
    '/login',
    [AuthController::class, 'login']
);

Route::post(
    '/register',
    [AuthController::class, 'register']
);

Route::post(
    '/forgot-password',
    [
        PasswordResetController::class,
        'enviarEnlace',
    ]
)->middleware('throttle:5,1');

Route::post(
    '/reset-password',
    [
        PasswordResetController::class,
        'restablecer',
    ]
)->middleware('throttle:10,1');

/*
|--------------------------------------------------------------------------
| CATEGORÍAS Y PRODUCTOS PÚBLICOS
|--------------------------------------------------------------------------
*/

Route::get(
    '/categorias',
    [CategoriaController::class, 'index']
);

Route::get(
    '/productos',
    [ProductoController::class, 'index']
);

/*
|--------------------------------------------------------------------------
| CONSULTA PÚBLICA DE PEDIDOS
|--------------------------------------------------------------------------
|
| Estas rutas permanecen públicas para que el cliente pueda consultar su
| pedido mediante el código de seguimiento y subir el comprobante desde
| el enlace o código QR.
|
*/

Route::get(
    '/pedidos/tracking/{codigo}',
    [
        PedidoController::class,
        'buscarPorTracking',
    ]
);

Route::get(
    '/pedidos/publico/{codigo}',
    [
        PedidoController::class,
        'pedidoPublico',
    ]
);

Route::post(
    '/pedidos/{codigo}/comprobante',
    [
        PedidoController::class,
        'subirComprobante',
    ]
);

/*
|--------------------------------------------------------------------------
| RUTAS PROTEGIDAS CON SANCTUM
|--------------------------------------------------------------------------
*/

Route::middleware(
    'auth:sanctum'
)->group(function () {

    /*
    |--------------------------------------------------------------------------
    | SESIÓN
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/logout',
        [AuthController::class, 'logout']
    );

    Route::get(
        '/user',
        [AuthController::class, 'me']
    );

    /*
    |--------------------------------------------------------------------------
    | PERFIL DEL CLIENTE AUTENTICADO
    |--------------------------------------------------------------------------
    |
    | Estas rutas no reciben un cliente_id desde React.
    | El perfil se obtiene mediante el usuario autenticado con Sanctum.
    |
    */

    Route::middleware(
        'rol:cliente'
    )->group(function () {
        Route::get(
            '/perfil-cliente',
            [
                PerfilClienteController::class,
                'mostrar',
            ]
        );

        Route::patch(
            '/perfil-cliente',
            [
                PerfilClienteController::class,
                'actualizar',
            ]
        );

        Route::get(
            '/perfil-cliente/pedido-activo',
            [
                PerfilClienteController::class,
                'pedidoActivo',
            ]
        );
    });

    /*
    |--------------------------------------------------------------------------
    | CREACIÓN DE PEDIDOS
    |--------------------------------------------------------------------------
    |
    | Pueden crear pedidos:
    |
    | - cliente: pedido desde Carrito.
    | - caja: pedido presencial.
    | - admin: pedido desde CajaDashboard.
    |
    | Cocina no puede crear pedidos.
    |
    */

    Route::middleware(
        'rol:admin,caja,cliente'
    )->group(function () {
        Route::post(
            '/pedidos',
            [
                PedidoController::class,
                'store',
            ]
        );
    });

    /*
    |--------------------------------------------------------------------------
    | GESTIÓN DE PEDIDOS DEL PERSONAL
    |--------------------------------------------------------------------------
    */

    Route::middleware(
        'rol:admin,cocina,caja'
    )->group(function () {
        Route::get(
            '/pedidos',
            [
                PedidoController::class,
                'index',
            ]
        );

        Route::patch(
            '/pedidos/{pedido}/estado',
            [
                PedidoController::class,
                'updateEstado',
            ]
        );
    });

    /*
    |--------------------------------------------------------------------------
    | CLIENTES - ADMINISTRADOR Y CAJA
    |--------------------------------------------------------------------------
    |
    | Los datos de todos los clientes no quedan expuestos públicamente.
    | Caja puede buscar, consultar y registrar clientes presenciales.
    |
    */

    Route::middleware(
        'rol:admin,caja'
    )->group(function () {
        Route::get(
            '/clientes',
            [
                ClienteController::class,
                'index',
            ]
        );

        Route::get(
            '/clientes/{cliente}',
            [
                ClienteController::class,
                'show',
            ]
        );

        Route::post(
            '/clientes',
            [
                ClienteController::class,
                'store',
            ]
        );
    });

    /*
    |--------------------------------------------------------------------------
    | RUTAS EXCLUSIVAS DEL ADMINISTRADOR
    |--------------------------------------------------------------------------
    */

    Route::middleware(
        'es.admin'
    )->group(function () {

        /*
        |--------------------------------------------------------------------------
        | COMPROBANTES SINPE
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/admin/comprobantes',
            [
                PedidoController::class,
                'listarComprobantes',
            ]
        );

        Route::patch(
            '/admin/comprobantes/{pedidoId}/verificar',
            [
                PedidoController::class,
                'verificarComprobante',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | USUARIOS
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/users',
            [
                UserController::class,
                'index',
            ]
        );

        Route::post(
            '/users',
            [
                UserController::class,
                'store',
            ]
        );

        Route::patch(
            '/users/{user}/toggle-estado',
            [
                UserController::class,
                'toggleEstado',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | PRODUCTOS
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/admin/productos',
            [
                ProductoController::class,
                'indexAdmin',
            ]
        );

        Route::post(
            '/productos',
            [
                ProductoController::class,
                'store',
            ]
        );

        /*
         * Se utiliza POST porque el formulario puede contener
         * una imagen enviada mediante multipart/form-data.
         */
        Route::post(
            '/productos/{producto}',
            [
                ProductoController::class,
                'update',
            ]
        );

        Route::patch(
            '/productos/{producto}/toggle-estado',
            [
                ProductoController::class,
                'toggleEstado',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | INGREDIENTES EXTRAS
        |--------------------------------------------------------------------------
        |
        | Solamente el administrador puede:
        |
        | - Consultar todos los ingredientes.
        | - Crear ingredientes.
        | - Modificar nombre y precio.
        | - Cambiar su disponibilidad.
        |
        */

        Route::get(
            '/ingredientes',
            [
                IngredienteController::class,
                'index',
            ]
        );

        Route::post(
            '/ingredientes',
            [
                IngredienteController::class,
                'store',
            ]
        );

        Route::put(
            '/ingredientes/{ingrediente}',
            [
                IngredienteController::class,
                'update',
            ]
        );

        Route::patch(
            '/ingredientes/{ingrediente}/toggle-estado',
            [
                IngredienteController::class,
                'toggleEstado',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | OPCIONES DE PASTA
        |--------------------------------------------------------------------------
        |
        | Solamente el administrador puede:
        |
        | - Consultar todas las opciones.
        | - Crear tipos de pasta, proteínas, salsas e ingredientes.
        | - Modificar nombre, grupo, precio y orden.
        | - Cambiar su disponibilidad.
        |
        */

        Route::get(
            '/opciones-pasta',
            [
                OpcionPastaController::class,
                'index',
            ]
        );

        Route::post(
            '/opciones-pasta',
            [
                OpcionPastaController::class,
                'store',
            ]
        );

        Route::put(
            '/opciones-pasta/{opcionPasta}',
            [
                OpcionPastaController::class,
                'update',
            ]
        );

        Route::patch(
            '/opciones-pasta/{opcionPasta}/toggle-estado',
            [
                OpcionPastaController::class,
                'toggleEstado',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | ACOMPAÑAMIENTOS
        |--------------------------------------------------------------------------
        |
        | Solamente el administrador puede:
        |
        | - Consultar todos los acompañamientos.
        | - Crear acompañamientos.
        | - Modificar nombre, precio y orden.
        | - Cambiar su disponibilidad.
        |
        */

        Route::get(
            '/acompanamientos',
            [
                AcompanamientoController::class,
                'index',
            ]
        );

        Route::post(
            '/acompanamientos',
            [
                AcompanamientoController::class,
                'store',
            ]
        );

        Route::put(
            '/acompanamientos/{acompanamiento}',
            [
                AcompanamientoController::class,
                'update',
            ]
        );

        Route::patch(
            '/acompanamientos/{acompanamiento}/toggle-estado',
            [
                AcompanamientoController::class,
                'toggleEstado',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | CATEGORÍAS
        |--------------------------------------------------------------------------
        */

        Route::post(
            '/categorias',
            [
                CategoriaController::class,
                'store',
            ]
        );

        Route::put(
            '/categorias/{categoria}',
            [
                CategoriaController::class,
                'update',
            ]
        );

        Route::patch(
            '/categorias/{categoria}/toggle-estado',
            [
                CategoriaController::class,
                'toggleEstado',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | EDICIÓN DE CLIENTES
        |--------------------------------------------------------------------------
        */

        Route::put(
            '/clientes/{cliente}',
            [
                ClienteController::class,
                'update',
            ]
        );
    });
});