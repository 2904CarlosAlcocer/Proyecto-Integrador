<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /**
     * Login para personal y clientes.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales no son correctas.'],
            ]);
        }

        // Permitir tanto personal como clientes
        $rolesPermitidos = ['admin', 'cocina', 'caja', 'cliente'];
        if (!in_array($user->rol, $rolesPermitidos)) {
            throw ValidationException::withMessages([
                'email' => ['No tienes permiso para acceder.'],
            ]);
        }

        if ($user->estado !== 'activo') {
            throw ValidationException::withMessages([
                'email' => ['Tu cuenta está inactiva. Contacta al administrador.'],
            ]);
        }

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
     * Registro de clientes.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:150|unique:users,email',
            'telefono' => 'nullable|string|max:20',
            'password' => 'required|string|min:6|confirmed',
        ]);

        // 1. Crear el usuario con rol 'cliente'
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'rol' => 'cliente',
            'estado' => 'activo',
        ]);

        // 2. Crear el cliente vinculado al usuario
        $cliente = Cliente::create([
            'user_id' => $user->id,
            'nombre' => $validated['name'],
            'telefono' => $validated['telefono'] ?? null,
            'correo' => $validated['email'],
        ]);

        // 3. Generar token para el cliente
        $token = $user->createToken('rooster-token')->plainTextToken;

        return response()->json([
            'message' => 'Registro exitoso',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'rol' => $user->rol,
                'estado' => $user->estado,
            ],
            'cliente' => $cliente,
            'token' => $token,
        ], 201);
    }

    /**
     * Cierra la sesión del usuario autenticado.
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
        $user = $request->user();

        if ($user->rol === 'cliente') {
            $cliente = Cliente::where('user_id', $user->id)->first();
            return response()->json([
                'user' => $user,
                'cliente' => $cliente,
            ]);
        }

        return response()->json([
            'user' => $user,
        ]);
    }
}