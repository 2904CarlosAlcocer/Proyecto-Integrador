<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ClienteController;
use Illuminate\Support\Facades\Route;

// RUTAS PÚBLICAS
Route::post('/login', [AuthController::class, 'login']);

Route::get('/categorias', [CategoriaController::class, 'index']);
Route::get('/productos', [ProductoController::class, 'index']);

// Clientes públicos para validar desde carrito y caja
Route::get('/clientes', [ClienteController::class, 'index']);
Route::get('/clientes/{cliente}', [ClienteController::class, 'show']);

// Pedidos públicos
Route::post('/pedidos', [PedidoController::class, 'store']);

// Consultar estado público por código tracking
Route::get('/pedidos/tracking/{codigo}', [PedidoController::class, 'buscarPorTracking']);

// Vista pública para QR de comprobante SINPE
Route::get('/pedidos/publico/{codigo}', [PedidoController::class, 'pedidoPublico']);
Route::post('/pedidos/{codigo}/comprobante', [PedidoController::class, 'subirComprobante']);


// RUTAS PROTEGIDAS
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    Route::get('/pedidos', [PedidoController::class, 'index']);
    Route::patch('/pedidos/{pedido}/estado', [PedidoController::class, 'updateEstado']);

    Route::get('/admin/comprobantes', [PedidoController::class, 'listarComprobantes']);
    Route::patch('/admin/comprobantes/{pedidoId}/verificar', [PedidoController::class, 'verificarComprobante']);

    Route::middleware('es.admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::patch('/users/{user}/toggle-estado', [UserController::class, 'toggleEstado']);

        Route::get('/admin/productos', [ProductoController::class, 'indexAdmin']);
        Route::post('/productos', [ProductoController::class, 'store']);
        Route::post('/productos/{producto}', [ProductoController::class, 'update']);
        Route::patch('/productos/{producto}/toggle-estado', [ProductoController::class, 'toggleEstado']);

        Route::post('/categorias', [CategoriaController::class, 'store']);
        Route::put('/categorias/{categoria}', [CategoriaController::class, 'update']);
        Route::patch('/categorias/{categoria}/toggle-estado', [CategoriaController::class, 'toggleEstado']);

        Route::post('/clientes', [ClienteController::class, 'store']);
        Route::put('/clientes/{cliente}', [ClienteController::class, 'update']);
    });
});