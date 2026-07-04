import { Link } from 'react-router-dom'
import {
  ShoppingCart,
  Menu,
  X,
  Home,
  Users,
  Pizza,
  MapPin,
  Phone,
  PackageSearch,
} from 'lucide-react'
import useCarritoStore from '../store/carritoStore'
import { useState } from 'react'
import logoRooster from '../assets/logo.jpeg'

const navItems = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/nosotros', label: 'Nosotros', icon: Users },
  { path: '/menu', label: 'Menú', icon: Pizza },
  { path: '/ubicacion', label: 'Ubicación', icon: MapPin },
  { path: '/contacto', label: 'Contacto', icon: Phone },
  { path: '/estado-pedido', label: 'Estado pedido', icon: PackageSearch },
]

export default function NavbarPublico() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const cantidadItems = useCarritoStore((state) => state.obtenerCantidadItems())

  return (
    <nav className="fixed top-0 left-0 right-0 z-[9999] bg-black/35 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <img
            src={logoRooster}
            alt="Rooster"
            className="w-11 h-11 rounded-full object-cover border border-white/20 group-hover:border-[#F5A300]/50 transition-colors"
          />

          <span className="flex items-center leading-none text-xl sm:text-2xl font-black tracking-tight">
            <span className="text-white">ROOSTER</span>
            <span className="text-[#F5A300]">PIZZA</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="group relative px-3 py-2 rounded-lg flex items-center gap-2 text-white/90 hover:text-[#F5A300] transition-all duration-200"
            >
              <item.icon className="w-4 h-4 transition-colors" />
              <span className="font-medium text-sm transition-colors">
                {item.label}
              </span>

              <span className="absolute bottom-0 left-1/2 h-[2px] w-0 bg-[#F5A300] transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/menu"
            className="hidden xl:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E4002B] to-[#F5A300] hover:shadow-lg hover:shadow-[#E4002B]/40 rounded-lg font-bold text-sm text-white transition-all duration-300 hover:scale-105"
          >
            <span>Ordenar ahora</span>
          </Link>

          <Link
            to="/carrito"
            className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-white/90 hover:text-[#F5A300] transition-colors" />

            {cantidadItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E4002B] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-black/50">
                {cantidadItems}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMenuAbierto((prev) => !prev)}
            className="lg:hidden relative z-[10000] p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {menuAbierto ? (
              <X className="w-7 h-7 text-white" />
            ) : (
              <Menu className="w-7 h-7 text-white" />
            )}
          </button>
        </div>
      </div>

      {menuAbierto && (
        <div
          onClick={() => setMenuAbierto(false)}
          className="fixed inset-0 top-[72px] bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <div
        className={`lg:hidden fixed top-[72px] left-0 right-0 z-[9999] bg-black/90 backdrop-blur-xl border-t border-white/10 border-b border-white/10 p-4 space-y-2 transition-all duration-300 ${
          menuAbierto
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMenuAbierto(false)}
            className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
          >
            <item.icon className="w-5 h-5 text-[#F5A300]" />
            <span className="font-medium text-white">{item.label}</span>
          </Link>
        ))}

        <Link
          to="/menu"
          onClick={() => setMenuAbierto(false)}
          className="flex items-center justify-center gap-2 w-full mt-2 px-5 py-3 bg-gradient-to-r from-[#E4002B] to-[#F5A300] rounded-lg font-bold text-sm text-white"
        >
          Ordenar ahora
        </Link>

        <Link
          to="/carrito"
          onClick={() => setMenuAbierto(false)}
          className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white/90 transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Ver carrito</span>

          {cantidadItems > 0 && (
            <span className="bg-[#E4002B] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {cantidadItems}
            </span>
          )}
        </Link>
      </div>
    </nav>
  )
}