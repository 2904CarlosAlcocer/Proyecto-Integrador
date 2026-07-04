<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EsAdmin
{
    /**
     * Permite el acceso solo si el usuario autenticado es admin.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || $request->user()->rol !== 'admin') {
            return response()->json([
                'message' => 'No tienes permiso para realizar esta acción.',
            ], 403);
        }

        return $next($request);
    }
}