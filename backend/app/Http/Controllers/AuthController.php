<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login para personal (admin, cocina, caja).
     * NO es para clientes.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        // Verifica que el usuario exista y la contraseña sea correcta
        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales no son correctas.'],
            ]);
        }

        // Bloquea el login a clientes: solo admin, cocina, caja
        if (! in_array($user->rol, ['admin', 'cocina', 'caja'])) {
            throw ValidationException::withMessages([
                'email' => ['No tienes permiso para acceder a este panel.'],
            ]);
        }

        // Bloquea usuarios inactivos
        if ($user->estado !== 'activo') {
            throw ValidationException::withMessages([
                'email' => ['Tu cuenta está inactiva. Contacta al administrador.'],
            ]);
        }

        // Crea el token de Sanctum
        $token = $user->createToken('rooster-token')->plainTextToken;

        return response()->json([
            'message' => 'Login exitoso',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'rol' => $user->rol,
                'estado' => $user->estado,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Cierra la sesión del usuario autenticado,
     * revocando el token actual.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente',
        ]);
    }

    /**
     * Devuelve los datos del usuario autenticado.
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }
}