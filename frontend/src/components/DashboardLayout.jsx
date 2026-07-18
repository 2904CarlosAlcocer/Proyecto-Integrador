import { useNavigate, useLocation, Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import api from '../api/axios'
import logoRooster from '../assets/logodef.jpeg'

const NOMBRES_ROL = {
  admin: 'Administrador',
  cocina: 'Cocina',
  caja: 'Caja',
}

const TABS_ADMIN = [
  { path: '/admin', label: 'Personal' },
  { path: '/admin/productos', label: 'Catálogo' },
]

function DashboardLayout({ children, titulo, acciones, dark = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const logoutStore = useAuthStore((state) => state.logout)

  const handleLogout = async () => {
    try {
      await api.post('/logout')
    } catch (err) {
      console.error('Error al cerrar sesión en el servidor:', err)
    } finally {
      logoutStore()
      navigate('/login')  // ← SOLO ESTO CAMBIÉ
    }
  }

  const iniciales = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={`min-h-screen font-sans ${
        dark
          ? 'bg-[#120C08]'
          : 'bg-[#F7F5F2]'
      }`}
    >
      <header
        className={`sticky top-0 z-30 shadow-sm border-b ${
          dark
            ? 'bg-black/70 backdrop-blur-xl border-white/10'
            : 'bg-white border-[#E5E2DC]'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoRooster}
              alt="Rooster CR"
              className="w-9 h-9 rounded-md object-cover shrink-0"
            />
            <span
              className={`font-mono font-bold text-sm tracking-tight whitespace-nowrap ${
                dark ? 'text-white' : 'text-[#1A1A1A]'
              }`}
            >
              ROOSTER <span className="text-[#E4002B]">CR</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p
                className={`text-sm font-semibold leading-none ${
                  dark ? 'text-white' : 'text-[#1A1A1A]'
                }`}
              >
                {user?.name}
              </p>
              <p className="text-xs text-[#F5A300] leading-none mt-1 font-semibold uppercase tracking-wide">
                {NOMBRES_ROL[user?.rol] || user?.rol}
              </p>
            </div>

            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                dark ? 'bg-white/10 border border-white/20' : 'bg-[#1A1A1A]'
              }`}
            >
              <span className="text-white font-mono font-bold text-xs">
                {iniciales}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className={`text-sm font-semibold transition-colors px-3 py-1.5 rounded-md whitespace-nowrap ${
                dark
                  ? 'text-white/70 hover:text-[#F5A300] hover:bg-white/10'
                  : 'text-[#6B6862] hover:text-[#E4002B] hover:bg-[#F7F5F2]'
              }`}
            >
              Salir
            </button>
          </div>
        </div>

        {user?.rol === 'admin' && (
          <div
            className={`max-w-6xl mx-auto px-6 flex gap-1 border-t ${
              dark ? 'border-white/10' : 'border-[#E5E2DC]'
            }`}
          >
            {TABS_ADMIN.map((tab) => {
              const activo = location.pathname === tab.path

              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`text-sm font-semibold px-4 py-2.5 border-b-2 transition-colors ${
                    activo
                      ? 'border-[#E4002B] text-[#E4002B]'
                      : dark
                        ? 'border-transparent text-white/60 hover:text-white'
                        : 'border-transparent text-[#6B6862] hover:text-[#1A1A1A]'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>
        )}

        <div className="h-[3px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />
      </header>

      <main
        className={`max-w-6xl mx-auto px-6 py-8 ${
          dark
            ? 'min-h-[calc(100vh-67px)] bg-[radial-gradient(circle_at_top,#5c2f1f_0%,#120C08_45%,#050505_100%)]'
            : ''
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`text-2xl font-semibold tracking-tight ${
              dark ? 'text-white' : 'text-[#1A1A1A]'
            }`}
          >
            {titulo}
          </h2>
          {acciones}
        </div>

        {children}
      </main>
    </div>
  )
}

export default DashboardLayout