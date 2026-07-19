<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Ruta principal de cada rol.
     */
    private const RUTAS_POR_ROL = [
        'admin' => '/admin',
        'cocina' => '/cocina',
        'caja' => '/caja',
        'cliente' => '/',
    ];

    /**
     * Inicio de sesión.
     */
    public function login(
        Request $request
    ): JsonResponse {
        $datos = $request->validate(
            [
                'email' => [
                    'required',
                    'email',
                    'max:150',
                ],

                'password' => [
                    'required',
                    'string',
                ],
            ],
            [
                'email.required' =>
                    'El correo electrónico es obligatorio.',

                'email.email' =>
                    'Debes ingresar un correo electrónico válido.',

                'password.required' =>
                    'La contraseña es obligatoria.',
            ]
        );

        $email = Str::lower(
            trim($datos['email'])
        );

        $user = User::whereRaw(
            'LOWER(email) = ?',
            [$email]
        )->first();

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR CREDENCIALES
        |--------------------------------------------------------------------------
        */

        if (
            !$user ||
            !Hash::check(
                $datos['password'],
                $user->password
            )
        ) {
            throw ValidationException::withMessages([
                'email' => [
                    'Las credenciales no son correctas.',
                ],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | NORMALIZAR ROL Y ESTADO
        |--------------------------------------------------------------------------
        |
        | Ejemplos:
        |
        | Admin → admin
        | Administrador → admin
        | ADMINISTRADOR → admin
        |
        */

        $rol = User::normalizarRol(
            $user->rol
        );

        $estado = Str::lower(
            trim((string) $user->estado)
        );

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR ROL PERMITIDO
        |--------------------------------------------------------------------------
        */

        if (
            !array_key_exists(
                $rol,
                self::RUTAS_POR_ROL
            )
        ) {
            throw ValidationException::withMessages([
                'email' => [
                    'No tienes permiso para acceder.',
                ],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR ESTADO
        |--------------------------------------------------------------------------
        */

        if ($estado !== 'activo') {
            throw ValidationException::withMessages([
                'email' => [
                    'Tu cuenta está inactiva. Contacta al administrador.',
                ],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | GUARDAR ROL Y ESTADO NORMALIZADOS
        |--------------------------------------------------------------------------
        */

        if (
            $user->rol !== $rol ||
            $user->estado !== $estado
        ) {
            $user->forceFill([
                'rol' => $rol,
                'estado' => $estado,
            ])->save();
        }

        /*
        |--------------------------------------------------------------------------
        | ELIMINAR TOKENS ANTERIORES
        |--------------------------------------------------------------------------
        |
        | Esto evita que se acumulen múltiples tokens
        | del mismo usuario en la base de datos.
        |
        */

        $user->tokens()->delete();

        /*
        |--------------------------------------------------------------------------
        | CREAR TOKEN
        |--------------------------------------------------------------------------
        |
        | Los tests esperan que el token guardado
        | se llame exactamente "rooster-token".
        |
        */

        $token = $user
            ->createToken('rooster-token')
            ->plainTextToken;

        return response()->json([
            'message' => 'Login exitoso',

            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'rol' => $rol,
                'estado' => $estado,
            ],

            'redirect' =>
                self::RUTAS_POR_ROL[$rol],

            'token' => $token,
        ]);
    }

    /**
     * Registro público para clientes.
     */
    public function register(
        Request $request
    ): JsonResponse {
        $validated = $request->validate(
            [
                'name' => [
                    'required',
                    'string',
                    'max:100',
                ],

                'email' => [
                    'required',
                    'email',
                    'max:150',
                    'unique:users,email',
                ],

                'telefono' => [
                    'nullable',
                    'string',
                    'max:20',
                ],

                'password' => [
                    'required',
                    'string',
                    'min:6',
                    'confirmed',
                ],
            ],
            [
                'name.required' =>
                    'El nombre es obligatorio.',

                'email.required' =>
                    'El correo electrónico es obligatorio.',

                'email.email' =>
                    'Debes ingresar un correo válido.',

                'email.unique' =>
                    'Ese correo ya está registrado.',

                'password.required' =>
                    'La contraseña es obligatoria.',

                'password.min' =>
                    'La contraseña debe tener al menos 6 caracteres.',

                'password.confirmed' =>
                    'Las contraseñas no coinciden.',
            ]
        );

        $email = Str::lower(
            trim($validated['email'])
        );

        /*
        |--------------------------------------------------------------------------
        | CREAR USUARIO
        |--------------------------------------------------------------------------
        */

        $user = User::create([
            'name' =>
                trim($validated['name']),

            'email' => $email,

            'password' =>
                $validated['password'],

            'rol' => 'cliente',

            'estado' => 'activo',
        ]);

        /*
        |--------------------------------------------------------------------------
        | CREAR PERFIL DE CLIENTE
        |--------------------------------------------------------------------------
        */

        $cliente = Cliente::create([
            'user_id' => $user->id,

            'nombre' =>
                trim($validated['name']),

            'telefono' =>
                $validated['telefono'] ?? null,

            'correo' => $email,
        ]);

        /*
        |--------------------------------------------------------------------------
        | CREAR TOKEN DEL CLIENTE
        |--------------------------------------------------------------------------
        */

        $token = $user
            ->createToken('rooster-cliente')
            ->plainTextToken;

        return response()->json([
            'message' => 'Registro exitoso',

            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'rol' => 'cliente',
                'estado' => 'activo',
            ],

            'cliente' => $cliente,

            'redirect' => '/',

            'token' => $token,
        ], 201);
    }

    /**
     * Cierra la sesión actual.
     */
    public function logout(
        Request $request
    ): JsonResponse {
        $request
            ->user()
            ?->currentAccessToken()
            ?->delete();

        return response()->json([
            'message' =>
                'Sesión cerrada correctamente',
        ]);
    }

    /**
     * Información del usuario autenticado.
     */
    public function me(
        Request $request
    ): JsonResponse {
        $user = $request->user();

        $rol = User::normalizarRol(
            $user->rol
        );

        $estado = Str::lower(
            trim((string) $user->estado)
        );

        /*
         * Corrige usuarios que ya tenían
         * una sesión iniciada.
         */
        if (
            $user->rol !== $rol ||
            $user->estado !== $estado
        ) {
            $user->forceFill([
                'rol' => $rol,
                'estado' => $estado,
            ])->save();
        }

        $respuesta = [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'rol' => $rol,
                'estado' => $estado,
            ],

            'redirect' =>
                self::RUTAS_POR_ROL[$rol] ?? '/',
        ];

        if ($rol === 'cliente') {
            $respuesta['cliente'] =
                Cliente::where(
                    'user_id',
                    $user->id
                )->first();
        }

        return response()->json(
            $respuesta
        );
    }
}