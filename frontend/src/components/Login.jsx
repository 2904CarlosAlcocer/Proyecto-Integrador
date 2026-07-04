import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import fondoPrincipal from '../assets/fondoPrincipal1.png'
import logoRooster from '../assets/logo.jpeg'
import { Eye, EyeOff } from 'lucide-react'

function Login() {
  const navigate = useNavigate()
  const loginStore = useAuthStore((state) => state.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      const response = await api.post('/login', { email, password })
      const { user, token } = response.data

      loginStore(user, token)

      const rutasPorRol = {
        admin: '/admin',
        cocina: '/cocina',
        caja: '/caja',
      }

      navigate(rutasPorRol[user.rol] || '/')
    } catch (err) {
      if (err.response?.data?.errors) {
        const primerError = Object.values(err.response.data.errors)[0][0]
        setError(primerError)
      } else if (err.response?.status === 422) {
        setError('Credenciales incorrectas.')
      } else {
        setError('No se pudo conectar con el servidor. Intenta de nuevo.')
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative bg-cover bg-center"
      style={{ backgroundImage: `url(${fondoPrincipal})` }}
    >
      {/* Overlay para legibilidad sobre la imagen */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      {/* Card de login */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Franja superior de acento (fuego) */}
          <div className="h-2 bg-gradient-to-r from-[#E80000] via-[#FF6B00] to-[#E80000]" />

          <div className="px-8 pt-8 pb-10">
            {/* Logo / branding (placeholder hasta tener el logo real) */}
            <div className="flex flex-col items-center mb-8">
             <img
                src={logoRooster}
                alt="Rooster CR"
                className="w-24 h-24 object-contain mb-3 drop-shadow-lg"
              />
              <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">
                ROOSTER <span className="text-[#FF6B00]">CR</span>
              </h1>
              <p className="text-sm text-white/70 mt-1 tracking-wide">
                PANEL DE PERSONAL
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-white/90 uppercase tracking-wide mb-1.5"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="nombre@rooster.com"
                  className="w-full px-4 py-3 rounded-lg bg-white/90 border border-white/30 placeholder-gray-400 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/30 outline-none transition"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-white/90 uppercase tracking-wide mb-1.5"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={mostrarPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-white/90 border border-white/30 placeholder-gray-400 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/30 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#E80000] transition-colors"
                    aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-[#E80000] text-sm font-medium px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-[#0A0A0A] hover:bg-[#E80000] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg transition-colors duration-200 uppercase tracking-wide text-sm shadow-lg"
              >
                {cargando ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-white/60 text-xs mt-6">
          Acceso exclusivo para personal autorizado
        </p>
      </div>
    </div>
  )
}

export default Login