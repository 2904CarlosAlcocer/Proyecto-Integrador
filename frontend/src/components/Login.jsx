import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

import api from '../api/axios'
import useAuthStore from '../store/authStore'
import fondoPrincipal from '../assets/fondoPrincipal1.png'
import logoRooster from '../assets/logodef.jpeg'

function Login() {
  const navigate = useNavigate()
  const loginStore = useAuthStore((state) => state.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setCargando(true)

    try {
      const response = await api.post('/login', {
        email: email.trim().toLowerCase(),
        password,
      })

      const { user, token } = response.data

      if (!user || !token) {
        throw new Error(
          'La respuesta del servidor no contiene los datos requeridos.'
        )
      }

      loginStore(user, token)

      const rutasPorRol = {
        admin: '/admin',
        cocina: '/cocina',
        caja: '/caja',
        cliente: '/',
      }

      const rol = String(user.rol || '').toLowerCase()

      navigate(rutasPorRol[rol] || '/', {
        replace: true,
      })
    } catch (err) {
      const erroresValidacion = err.response?.data?.errors

      if (erroresValidacion) {
        const primerError = Object.values(erroresValidacion)
          .flat()
          .find(Boolean)

        setError(
          primerError ||
            'Revisa los datos ingresados.'
        )
      } else if (
        err.response?.status === 401 ||
        err.response?.status === 422
      ) {
        setError(
          err.response?.data?.message ||
            'El correo o la contraseña son incorrectos.'
        )
      } else {
        setError(
          err.response?.data?.message ||
            'No se pudo conectar con el servidor. Intenta nuevamente.'
        )
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div
      className="
        fixed inset-0
        min-h-[100dvh] w-full
        overflow-y-auto
        bg-[#120C08]
        bg-cover bg-center bg-no-repeat
      "
      style={{
        backgroundImage: `url(${fondoPrincipal})`,
      }}
    >
      {/* Fondo oscuro */}
      <div className="fixed inset-0 bg-black/80" />

      {/* Contenido */}
      <div className="relative z-10 flex min-h-[100dvh] w-full items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
            <div className="h-2 bg-gradient-to-r from-[#E80000] via-[#FF6B00] to-[#E80000]" />

            <div className="px-6 py-8 sm:px-8 sm:pb-10">
              <div className="mb-8 flex flex-col items-center">
                <img
                  src={logoRooster}
                  alt="Logo de Rooster CR"
                  className="mb-3 h-24 w-24 object-contain drop-shadow-lg"
                />

                <h1 className="text-center text-3xl font-black tracking-tight text-white drop-shadow-md">
                  ROOSTER{' '}
                  <span className="text-[#FF6B00]">
                    CR
                  </span>
                </h1>

                <p className="mt-1 text-sm tracking-wide text-white/70">
                  INICIO DE SESIÓN
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Correo */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-white/90"
                  >
                    Correo electrónico
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                    autoComplete="email"
                    disabled={cargando}
                    placeholder="correo@ejemplo.com"
                    className="
                      w-full rounded-lg
                      border border-white/30
                      bg-white/95
                      px-4 py-3
                      text-gray-800
                      placeholder:text-gray-400
                      outline-none
                      transition
                      focus:border-[#FF6B00]
                      focus:ring-2
                      focus:ring-[#FF6B00]/30
                      disabled:cursor-not-allowed
                      disabled:opacity-70
                    "
                  />
                </div>

                {/* Contraseña */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-white/90"
                  >
                    Contraseña
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={
                        mostrarPassword
                          ? 'text'
                          : 'password'
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      required
                      autoComplete="current-password"
                      disabled={cargando}
                      placeholder="••••••••"
                      className="
                        w-full rounded-lg
                        border border-white/30
                        bg-white/95
                        px-4 py-3 pr-12
                        text-gray-800
                        placeholder:text-gray-400
                        outline-none
                        transition
                        focus:border-[#FF6B00]
                        focus:ring-2
                        focus:ring-[#FF6B00]/30
                        disabled:cursor-not-allowed
                        disabled:opacity-70
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarPassword(
                          (estado) => !estado
                        )
                      }
                      disabled={cargando}
                      aria-label={
                        mostrarPassword
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
                      }
                      className="
                        absolute right-3 top-1/2
                        -translate-y-1/2
                        rounded-md p-1
                        text-gray-500
                        transition-colors
                        hover:bg-gray-200
                        hover:text-[#E80000]
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#FF6B00]/40
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      {mostrarPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Recuperación de contraseña */}
                <div className="-mt-2 flex justify-end">
                  <Link
                    to="/olvide-contrasena"
                    className="
                      text-sm font-semibold
                      text-[#FF8A24]
                      transition-colors
                      hover:text-[#FFB15C]
                      hover:underline
                    "
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-500/40 bg-red-500/20 px-4 py-3 text-sm font-medium text-red-200"
                  >
                    {error}
                  </div>
                )}

                {/* Botón ingresar */}
                <button
                  type="submit"
                  disabled={cargando}
                  className="
                    flex w-full items-center justify-center
                    rounded-lg
                    bg-gradient-to-r
                    from-[#E80000]
                    to-[#FF6B00]
                    py-3.5
                    text-sm font-bold uppercase
                    tracking-wide text-white
                    transition-all duration-200
                    hover:shadow-lg
                    hover:shadow-[#E80000]/40
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {cargando ? (
                    <>
                      <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Ingresando...
                    </>
                  ) : (
                    'Ingresar'
                  )}
                </button>

                {/* Registro */}
                <p className="text-center text-sm text-white/70">
                  ¿No tienes cuenta?{' '}
                  <Link
                    to="/register"
                    className="font-bold text-[#FF6B00] transition-colors hover:text-[#FF9A3D] hover:underline"
                  >
                    Regístrate aquí
                  </Link>
                </p>
              </form>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-white/40">
            Acceso protegido por Rooster CR
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login