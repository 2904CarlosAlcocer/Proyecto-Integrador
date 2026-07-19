<?php

use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| RUTAS PÚBLICAS
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| AUTENTICACIÓN
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::post('/forgot-password', [PasswordResetController::class, 'enviarEnlace'])
    ->middleware('throttle:5,1');

Route::post('/reset-password', [PasswordResetController::class, 'restablecer'])
    ->middleware('throttle:10,1');

/*
|--------------------------------------------------------------------------
| CATEGORÍAS Y PRODUCTOS PÚBLICOS
|--------------------------------------------------------------------------
*/

Route::get('/categorias', [CategoriaController::class, 'index']);
Route::get('/productos', [ProductoController::class, 'index']);

/*
|--------------------------------------------------------------------------
| CLIENTES PÚBLICOS
|--------------------------------------------------------------------------
*/

Route::get('/clientes', [ClienteController::class, 'index']);
Route::get('/clientes/{cliente}', [ClienteController::class, 'show']);

/*
|--------------------------------------------------------------------------
| PEDIDOS PÚBLICOS
|--------------------------------------------------------------------------
*/

Route::post('/pedidos', [PedidoController::class, 'store']);
Route::get('/pedidos/tracking/{codigo}', [PedidoController::class, 'buscarPorTracking']);
Route::get('/pedidos/publico/{codigo}', [PedidoController::class, 'pedidoPublico']);
Route::post('/pedidos/{codigo}/comprobante', [PedidoController::class, 'subirComprobante']);

/*
|--------------------------------------------------------------------------
| RUTAS PROTEGIDAS CON SANCTUM
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | SESIÓN
    |--------------------------------------------------------------------------
    */

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    /*
    |--------------------------------------------------------------------------
    | PEDIDOS - Personal (Admin, Cocina, Caja)
    |--------------------------------------------------------------------------
    */

    Route::middleware('rol:admin,cocina,caja')->group(function () {
        Route::get('/pedidos', [PedidoController::class, 'index']);
        Route::patch('/pedidos/{pedido}/estado', [PedidoController::class, 'updateEstado']);
    });

    /*
    |--------------------------------------------------------------------------
    | RUTAS EXCLUSIVAS DEL ADMINISTRADOR
    |--------------------------------------------------------------------------
    */

    Route::middleware('es.admin')->group(function () {

        // Comprobantes SINPE
        Route::get('/admin/comprobantes', [PedidoController::class, 'listarComprobantes']);
        Route::patch('/admin/comprobantes/{pedidoId}/verificar', [PedidoController::class, 'verificarComprobante']);

        // Usuarios
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::patch('/users/{user}/toggle-estado', [UserController::class, 'toggleEstado']);

        // Productos
        Route::get('/admin/productos', [ProductoController::class, 'indexAdmin']);
        Route::post('/productos', [ProductoController::class, 'store']);
        Route::post('/productos/{producto}', [ProductoController::class, 'update']);
        Route::patch('/productos/{producto}/toggle-estado', [ProductoController::class, 'toggleEstado']);

        // Categorías
        Route::post('/categorias', [CategoriaController::class, 'store']);
        Route::put('/categorias/{categoria}', [CategoriaController::class, 'update']);
        Route::patch('/categorias/{categoria}/toggle-estado', [CategoriaController::class, 'toggleEstado']);

        // Clientes (gestión)
        Route::post('/clientes', [ClienteController::class, 'store']);
        Route::put('/clientes/{cliente}', [ClienteController::class, 'update']);
    });
});