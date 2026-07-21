import { Link } from 'react-router-dom'
import {
  ChefHat, Flame, Users, Leaf, ArrowRight, Star,
  Menu, X, Award, Sparkles, MapPin, ShoppingCart
} from 'lucide-react'
import { useState } from 'react'
import fondoPrincipal from '../assets/fondoPrincipal1.png'
import pizzaEspecial from '../assets/pizza-especial-rooster.jpg'
import pasta from '../assets/pasta1.jpeg'
import carne from '../assets/carne3.jpeg'

// ========== IMPORTÁ TUS IMÁGENES PARA EL MENÚ ==========
import menuInicio from '../assets/fondoPrincipal1.png'
import menuNosotros from '../assets/nosotros.jpeg'
import menuUbicacion from '../assets/mapa.jpeg'

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Generar chispas (menos cantidad y más sutiles)
  const generateSparks = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3,
      size: 1.5 + Math.random() * 2.5,
    }))
  }

  const sparks = generateSparks(35)   // antes 40
  const sparks2 = generateSparks(8)   // antes 30
  const sparks3 = generateSparks(8)   // antes 25

  // ========== DATOS DEL MENÚ MODERNO ==========
  const menuItems = [
    {
      id: 'inicio',
      label: 'Inicio',
      path: '/',
      icon: '',
      desc: 'Bienvenido a la mejor experiencia gastronómica',
      image: menuInicio,
      number: '01',
      color: 'from-amber-500/30 to-orange-500/30',
    },
    {
      id: 'nosotros',
      label: 'Nosotros',
      path: '/nosotros',
      icon: '',
      desc: 'Conoce nuestra pasión por la cocina artesanal',
      image: menuNosotros,
      number: '02',
      color: 'from-red-500/30 to-orange-500/30',
    },
    {
      id: 'ubicacion',
      label: 'Ubicación',
      path: '/ubicacion',
      icon: '',
      desc: 'En el corazón de La Fortuna, Mercadito Arenal',
      image: menuUbicacion,
      number: '04',
      color: 'from-green-500/30 to-emerald-500/30',
    },
  ]

  return (
    <div className="bg-[#120C08] text-white overflow-hidden relative">
      {/* ==================== CHISPAS DE FUEGO - FONDO GLOBAL (REDUCIDAS) ==================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {sparks.map((spark) => (
          <div
            key={`spark-${spark.id}`}
            className="absolute rounded-full bg-gradient-to-t from-orange-400 to-yellow-300 animate-spark"
            style={{
              left: `${spark.left}%`,
              top: `${spark.top}%`,
              width: `${spark.size}px`,
              height: `${spark.size}px`,
              animationDelay: `${spark.delay}s`,
              animationDuration: `${spark.duration}s`,
              boxShadow: '0 0 8px 2px rgba(251, 146, 60, 0.4)',
            }}
          />
        ))}
      </div>

      {/* ==================== HERO CON FONDO ==================== */}
      <section className="relative isolate min-h-[calc(100svh-72px)] md:min-h-screen flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20 overflow-hidden bg-[#120C08]">
        {/* Imagen separada del contenido para controlar mejor el responsive */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-[position:58%_center] bg-scroll md:bg-center md:bg-fixed"
          style={{ backgroundImage: `url(${fondoPrincipal})` }}
        />

        {/* Capa oscura real: queda encima de la foto y debajo del contenido */}
        <div className="absolute inset-0 z-[1] bg-black/50 sm:bg-black/35" />
        <div className="absolute inset-0 z-[2] bg-gradient-to-r from-black/50 via-black/35 to-black/20 sm:from-black/45 sm:via-black/30 sm:to-black/15" />
        <div className="absolute inset-0 z-[2] bg-gradient-to-b from-transparent via-black/10 to-[#120C08]/85" />

        {/* Elementos decorativos */}
        <div className="absolute top-20 right-10 z-[2] w-72 h-72 sm:w-96 sm:h-96 bg-[#E4002B]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 z-[2] w-56 h-56 sm:w-72 sm:h-72 bg-[#F5A300]/5 rounded-full blur-3xl" />

        {/* ===== CHISPAS HERO (REDUCIDAS) ===== */}
        <div className="absolute inset-0 pointer-events-none z-[3] overflow-hidden">
          {sparks2.map((spark) => (
            <div
              key={`hero-spark-${spark.id}`}
              className="absolute rounded-full bg-gradient-to-t from-orange-500 to-yellow-200 animate-spark"
              style={{
                left: `${spark.left}%`,
                top: `${spark.top}%`,
                width: `${spark.size}px`,
                height: `${spark.size}px`,
                animationDelay: `${spark.delay + 0.5}s`,
                animationDuration: `${spark.duration + 0.5}s`,
                boxShadow: '0 0 10px 3px rgba(251, 146, 60, 0.5)',
              }}
            />
          ))}
        </div>

        {/* ===== BRASAS GRANDES (SOLO 3) ===== */}
        <div className="absolute inset-0 pointer-events-none z-[3] overflow-hidden">
          {[0, 1, 2].map((i) => (
            <div
              key={`braza-${i}`}
              className="absolute rounded-full bg-gradient-to-t from-red-600 via-orange-500 to-yellow-300 animate-float-spark"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                width: `${5 + Math.random() * 6}px`,
                height: `${5 + Math.random() * 6}px`,
                animationDelay: `${i * 1.2}s`,
                animationDuration: `${5 + Math.random() * 3}s`,
                boxShadow: '0 0 15px 5px rgba(234, 88, 12, 0.5)',
              }}
            />
          ))}
        </div>

        {/* ===== NAVBAR FLOTANTE (SIMPLE, SOLO LOGO + CARRITO) ===== */}
        <nav className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black">

              </span>
            </div>

            {/* Carrito + Menú móvil */}

          </div>

          {/* Menú Móvil Desplegable */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className="flex items-center gap-4 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.label} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white group-hover:text-[#F5A300] transition-colors">
                      {item.label}
                    </p>
                    <p className="text-white/50 text-xs truncate">{item.desc}</p>
                  </div>
                  <span className="text-white/20 text-sm">{item.number}</span>
                </Link>
              ))}
              <Link
                to="/carrito"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#E4002B] to-[#F5A300] rounded-xl font-bold text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingCart className="w-4 h-4" />
                Ver carrito (3)
              </Link>
            </div>
          )}
        </nav>

        {/* ===== CONTENIDO DEL HERO ===== */}
        <div className="max-w-6xl mx-auto w-full relative z-10 pt-6 sm:pt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-8 md:gap-12 items-center">
            <div className="space-y-5 sm:space-y-8">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#E4002B]/20 border border-[#E4002B]/40 rounded-full w-fit">
                <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-[#F5A300]" />
                <span className="text-xs sm:text-sm font-semibold text-[#F5A300]">
                  Sabor Auténtico
                </span>
              </div>

              <div className="space-y-2 sm:space-y-4">
                <h1 className="text-[clamp(2.5rem,12vw,3.35rem)] sm:text-6xl md:text-7xl font-black leading-[1.05] sm:leading-tight">
                  <span className="block text-white">Sabor que</span>
                  <span className="block text-white">se vive en</span>
                  <span className="block bg-gradient-to-r from-[#F5A300] via-[#E4002B] to-[#F5A300] bg-clip-text text-transparent">
                    LA FORTUNA
                  </span>
                </h1>
              </div>

              <p className="text-[15px] sm:text-base md:text-lg text-white/90 max-w-lg leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                Pizzas artesanales con masa de larga fermentación, pastas italianas auténticas y carnes premium en el corazón del Mercadito Arenal. Una experiencia gourmet que enamorará tus sentidos.
              </p>

              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                <Link
                  to="/menu"
                  className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#E4002B] to-[#F5A300] hover:shadow-2xl hover:shadow-[#E4002B]/50 rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  ORDENAR AHORA
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/menu"
                  className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-[#F5A300] text-[#F5A300] hover:bg-[#F5A300]/10 rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 text-center"
                >
                  VER MENÚ
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:flex sm:gap-8 pt-5 sm:pt-8 border-t border-white/10">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-[#F5A300]">16+</p>
                  <p className="text-white/60 text-xs sm:text-sm">Pizzas únicas</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-[#F5A300]">100%</p>
                  <p className="text-white/60 text-xs sm:text-sm">Ingredientes premium</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-[#F5A300]">⭐⭐⭐⭐⭐</p>
                  <p className="text-white/60 text-xs sm:text-sm">Favorito local</p>
                </div>
              </div>
            </div>

            {/* Card decorativa */}
            <div className="hidden md:flex justify-center">
              <div className="relative w-72 lg:w-80 h-[340px] lg:h-96">
                <div className="absolute -top-4 -right-4 w-2 h-2 bg-orange-400 rounded-full shadow-[0_0_15px_#f97316] animate-ping" />
                <div className="absolute -bottom-3 -left-3 w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-[0_0_10px_#facc15] animate-pulse" />
                <div className="absolute top-1/2 -right-6 w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_12px_#fb923c] animate-bounce" />
                <div className="absolute top-1/3 -left-5 w-1.5 h-1.5 bg-yellow-300 rounded-full shadow-[0_0_12px_#fde047] animate-ping delay-500" />
                <div className="absolute bottom-1/4 -right-4 w-1.5 h-1.5 bg-orange-400 rounded-full shadow-[0_0_10px_#fb923c] animate-pulse delay-700" />

                <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 flex flex-col justify-between shadow-2xl">
                  <div className="inline-flex w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#E4002B] to-[#F5A300] rounded-lg items-center justify-center text-lg lg:text-xl">
                    🍕
                  </div>

                  <div className="space-y-3 lg:space-y-4">
                    <div>
                      <h3 className="text-xl lg:text-2xl font-bold mb-1 lg:mb-2">Especialidad</h3>
                      <p className="text-white/70 text-xs lg:text-sm leading-relaxed">
                        Pizza Pepperoni con mozzarella fresca, salsa de tomate artesanal y orégano premium
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5 lg:gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 lg:w-4 lg:h-4 fill-[#F5A300] text-[#F5A300]"
                          />
                        ))}
                      </div>
                      <span className="text-white/60 text-[10px] lg:text-sm">(248 reseñas)</span>
                    </div>
                  </div>

                  <div className="space-y-2 lg:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-xs lg:text-sm">Precio</span>
                      <span className="text-xl lg:text-2xl font-bold text-[#F5A300]">
                        ₡13.500
                      </span>
                    </div>

                    <Link
                      to="/menu"
                      className="block w-full py-2.5 lg:py-3 bg-gradient-to-r from-[#E4002B] to-[#F5A300] rounded-lg font-bold text-sm lg:text-base text-center hover:shadow-lg transition-all"
                    >
                      Ver más
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== TRANSICIÓN ===== */}
        <div className="absolute bottom-0 left-0 w-full h-48 sm:h-64 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[#120C08]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-32 sm:h-40 bg-red-600/20 blur-[80px] sm:blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[500px] h-20 sm:h-24 bg-orange-400/20 blur-[60px] sm:blur-[80px]" />
          <div className="absolute bottom-0 left-[10%] w-40 sm:w-52 h-40 sm:h-52 bg-white/10 rounded-full blur-[60px] sm:blur-[80px] animate-pulse" />
          <div className="absolute bottom-0 left-[45%] w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-[70px] sm:blur-[90px] animate-pulse delay-500" />
          <div className="absolute bottom-0 left-[75%] w-44 sm:w-56 h-44 sm:h-56 bg-white/10 rounded-full blur-[65px] sm:blur-[85px] animate-pulse delay-1000" />
          {/* Algunas chispas pequeñas en la transición */}
          <div className="absolute bottom-8 sm:bottom-10 left-[15%] w-1.5 sm:w-2 h-1.5 sm:h-2 bg-orange-400 rounded-full shadow-[0_0_15px_#f59e0b] animate-ping" />
          <div className="absolute bottom-12 sm:bottom-16 left-[35%] w-1 sm:w-1.5 h-1 sm:h-1.5 bg-red-500 rounded-full shadow-[0_0_15px_#ef4444] animate-pulse" />
          <div className="absolute bottom-6 sm:bottom-8 left-[55%] w-1.5 sm:w-2 h-1.5 sm:h-2 bg-orange-300 rounded-full shadow-[0_0_15px_#fdba74] animate-ping" />
          <div className="absolute bottom-10 sm:bottom-14 left-[75%] w-1 sm:w-1.5 h-1 sm:h-1.5 bg-orange-500 rounded-full shadow-[0_0_15px_#f97316] animate-pulse" />
          <div className="absolute bottom-4 sm:bottom-6 left-[90%] w-1.5 sm:w-2 h-1.5 sm:h-2 bg-yellow-400 rounded-full shadow-[0_0_15px_#facc15] animate-ping" />
          <div className="absolute bottom-20 left-[25%] w-1.5 h-1.5 bg-orange-400 rounded-full shadow-[0_0_18px_#fb923c] animate-bounce" />
          <div className="absolute bottom-24 left-[65%] w-1 h-1 bg-yellow-300 rounded-full shadow-[0_0_12px_#fde047] animate-ping delay-300" />
          <div className="absolute bottom-16 left-[45%] w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_20px_#ea580c] animate-pulse delay-700" />
        </div>

        <svg
          className="absolute bottom-0 left-0 w-full -mb-1"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={{ zIndex: 5 }}
        >
          <path
            d="M0,40 Q300,0 600,40 T1200,40 L1200,120 L0,120 Z"
            fill="#120C08"
          />
          <path
            d="M0,50 Q300,20 600,50 T1200,50 L1200,120 L0,120 Z"
            fill="#120C08"
            opacity="0.8"
          />
        </svg>
      </section>

      {/* ==================== ESPECIALIDADES ==================== */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 bg-gradient-to-b from-[#120C08] via-[#120C08] to-[#0a0604] overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-red-600/30 rounded-full blur-[100px] sm:blur-[150px] animate-pulse" />
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[400px] sm:w-[550px] h-[400px] sm:h-[550px] bg-orange-500/35 rounded-full blur-[80px] sm:blur-[120px] animate-pulse delay-700" />
          <div className="absolute -top-10 -right-20 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-yellow-500/25 rounded-full blur-[70px] sm:blur-[110px] animate-pulse delay-1000" />
          <div className="absolute top-1/4 left-1/5 w-60 sm:w-80 h-60 sm:h-80 bg-gradient-to-t from-orange-600 to-red-500 rounded-full blur-[60px] sm:blur-[80px] opacity-60 animate-pulse" />
          <div className="absolute top-1/3 right-1/5 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-t from-red-600 to-orange-500 rounded-full blur-[70px] sm:blur-[90px] opacity-55 animate-pulse delay-500" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-56 sm:w-72 h-56 sm:h-72 bg-gradient-to-t from-orange-500 to-yellow-400 rounded-full blur-[50px] sm:blur-[70px] opacity-50 animate-pulse delay-300" />
          <div className="absolute -top-20 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-white/15 rounded-full blur-[70px] sm:blur-[100px] animate-pulse delay-300" />
          <div className="absolute top-1/3 right-1/4 w-60 sm:w-80 h-60 sm:h-80 bg-white/12 rounded-full blur-[65px] sm:blur-[95px] animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-1/2 w-56 sm:w-72 h-56 sm:h-72 bg-white/10 rounded-full blur-[60px] sm:blur-[85px] animate-pulse delay-500" />
        </div>

        {/* Chispas en especialidades (reducidas) */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {sparks3.map((spark) => (
            <div
              key={`esp-spark-${spark.id}`}
              className="absolute rounded-full bg-gradient-to-t from-orange-400 to-yellow-200 animate-spark"
              style={{
                left: `${spark.left}%`,
                top: `${spark.top}%`,
                width: `${spark.size}px`,
                height: `${spark.size}px`,
                animationDelay: `${spark.delay + 1}s`,
                animationDuration: `${spark.duration + 1}s`,
                boxShadow: '0 0 8px 2px rgba(251, 146, 60, 0.3)',
              }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16 sm:mb-20 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-1.5 sm:py-2 bg-[#E4002B]/10 border border-[#E4002B]/30 rounded-full backdrop-blur-sm">
              <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-[#F5A300] rounded-full animate-pulse" />
              <span className="text-[#F5A300] font-light text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase">
                Nuestras colecciones
              </span>
              <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-[#F5A300] rounded-full animate-pulse delay-500" />
            </div>
            <h2 className="text-4xl xs:text-5xl sm:text-6xl font-light text-white tracking-tight">
              Experiencias de <span className="text-[#F5A300]">sabor</span>
            </h2>
            <div className="flex justify-center gap-2 sm:gap-3">
              <span className="w-8 sm:w-12 h-1 bg-gradient-to-r from-transparent via-[#E4002B] to-[#F5A300] rounded-full" />
              <span className="w-8 sm:w-12 h-1 bg-gradient-to-r from-[#F5A300] via-[#E4002B] to-transparent rounded-full" />
            </div>
            <p className="text-white/50 text-xs sm:text-sm max-w-md mx-auto">
              Descubre nuestras especialidades elaboradas con pasión y los mejores ingredientes
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                titulo: 'PIZZAS',
                descripcion: 'Masa de larga fermentación con ingredientes premium',
                imagen: pizzaEspecial,
                emoji: '',
                color: 'from-red-600/40 to-orange-500/40',
              },
              {
                titulo: 'PASTAS',
                descripcion: 'Recetas italianas auténticas elaboradas con esmero',
                imagen: pasta,
                emoji: '',
                color: 'from-yellow-600/40 to-amber-500/40',
              },
              {
                titulo: 'CARNES',
                descripcion: 'Cortes premium preparados a la parrilla artesanal',
                imagen: carne,
                emoji: '',
                color: 'from-red-700/40 to-orange-600/40',
              },
            ].map((item, idx) => (
              <div key={idx} className="group relative">
                <div className="absolute -top-2 -right-2 w-1.5 h-1.5 bg-orange-400 rounded-full shadow-[0_0_12px_#fb923c] animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute -bottom-2 -left-2 w-1 h-1 bg-yellow-300 rounded-full shadow-[0_0_10px_#fde047] animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200" />
                <div className="absolute top-1/3 -right-3 w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_12px_#ea580c] animate-bounce opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-400" />

                <div className={`absolute -inset-1 bg-gradient-to-r ${item.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />

                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-[#F5A300]/30 transition-all duration-500 h-full flex flex-col">
                  <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
                    <img
                      src={item.imagen}
                      alt={item.titulo}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#120C08] via-[#120C08]/60 to-transparent" />

                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-2xl sm:text-3xl opacity-70 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110 group-hover:rotate-12">
                      {item.emoji}
                    </div>

                    <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 text-5xl sm:text-7xl font-black text-white/5 tracking-tighter">
                      0{idx + 1}
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 flex-1 flex flex-col space-y-3 sm:space-y-4">
                    <h3 className="text-xl sm:text-2xl font-light text-white tracking-wide group-hover:text-[#F5A300] transition-colors duration-300">
                      {item.titulo}
                    </h3>
                    <p className="text-white/70 font-light text-sm sm:text-base leading-relaxed flex-1">
                      {item.descripcion}
                    </p>

                    <Link
                      to="/menu"
                      className="inline-flex items-center gap-3 text-[#F5A300] font-light text-xs sm:text-sm tracking-widest uppercase hover:gap-5 transition-all duration-300 group/link pt-2 border-t border-white/5"
                    >
                      <span>Explorar</span>
                      <span className="w-5 sm:w-6 h-[1px] bg-[#F5A300] group-hover/link:w-7 sm:group-hover/link:w-8 transition-all" />
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover/link:opacity-100 transition-all duration-300 -ml-2 group-hover/link:ml-0" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-24 sm:mt-32 flex justify-center items-center gap-4 sm:gap-6">
            <span className="w-16 sm:w-24 h-[1px] bg-gradient-to-r from-transparent to-[#F5A300]/30" />
            <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-[#F5A300]/50 rounded-full animate-pulse" />
            <span className="w-16 sm:w-24 h-[1px] bg-gradient-to-l from-transparent to-[#F5A300]/30" />
          </div>
        </div>
      </section>

      {/* ==================== MENÚ MODERNO CON IMÁGENES - MÁS GRANDE Y CENTRADO ==================== */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
        {/* Fondo premium */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0604] via-[#120C08] to-[#0a0604] -z-10" />

        {/* Efectos de luz */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#F5A300]/5 rounded-full blur-[150px] -z-10" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-[#E4002B]/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#F5A300]/3 rounded-full blur-[100px] -z-10" />

        {/* Chispas en sección menú (reducidas) */}
        <div className="absolute inset-0 pointer-events-none">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={`menu-spark-${i}`}
              className="absolute rounded-full bg-orange-400 animate-float-spark"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${15 + Math.random() * 70}%`,
                width: `${1.5 + Math.random() * 2}px`,
                height: `${1.5 + Math.random() * 2}px`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${4 + Math.random() * 4}s`,
                boxShadow: '0 0 8px 2px rgba(251, 146, 60, 0.3)',
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Encabezado */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-gradient-to-r from-[#E4002B]/10 via-[#F5A300]/10 to-[#E4002B]/10 border border-[#F5A300]/20 rounded-full backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4 text-[#F5A300]" />
              <span className="text-[#F5A300] font-light text-xs tracking-[0.3em] uppercase">
                Navegación
              </span>
              <Sparkles className="w-4 h-4 text-[#F5A300]" />
            </div>

            <h2 className="text-4xl xs:text-5xl sm:text-6xl font-light text-white tracking-tight">
              <span className="text-white">Explora</span>{' '}
              <span className="bg-gradient-to-r from-[#F5A300] via-[#E4002B] to-[#F5A300] bg-clip-text text-transparent">
                Rooster
              </span>
            </h2>

            <div className="flex justify-center gap-3 mt-6">
              <span className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#E4002B] to-[#F5A300] rounded-full" />
              <span className="w-2 h-2 bg-[#F5A300] rounded-full animate-pulse" />
              <span className="w-16 h-0.5 bg-gradient-to-r from-[#F5A300] via-[#E4002B] to-transparent rounded-full" />
            </div>

            <p className="text-white/40 text-sm max-w-md mx-auto mt-6 font-light tracking-wide">
              Conoce todo lo que Rooster Pizza tiene para ti
            </p>
          </div>

          {/* Grid de menú moderno - más grande y centrado */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`group relative p-8 bg-gradient-to-br ${item.color} backdrop-blur-sm border border-white/10 rounded-2xl hover:border-[#F5A300]/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#F5A300]/20 overflow-hidden`}
              >
                {/* Número decorativo más grande */}
                <div className="absolute -top-8 -right-4 text-8xl font-black text-white/5 tracking-tighter select-none">
                  {item.number}
                </div>

                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#F5A300]/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                {/* Chispas hover (muy sutiles) */}
                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-orange-400 rounded-full shadow-[0_0_10px_#fb923c] animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-yellow-300 rounded-full shadow-[0_0_8px_#fde047] animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200" />

                {/* Imagen más grande */}
                <div className="relative mb-6 overflow-hidden rounded-xl aspect-[3/2]">
                  <img
                    src={item.image}
                    alt={item.label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 right-3 text-4xl opacity-80">
                    {item.icon}
                  </div>
                </div>

                {/* Contenido con textos más grandes */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white group-hover:text-[#F5A300] transition-colors duration-300 tracking-wide">
                    {item.label}
                  </h3>
                  <p className="text-white/60 text-base leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/5 group-hover:border-[#F5A300]/20 transition-all duration-300">
                  <div className="flex items-center gap-2 group-hover:gap-4 transition-all duration-300">
                    <span className="text-[11px] tracking-[0.3em] uppercase text-white/30 group-hover:text-[#F5A300]/60 transition-colors duration-300">
                      Explorar
                    </span>
                    <span className="flex-1 h-[1px] bg-gradient-to-r from-[#F5A300]/20 to-transparent group-hover:from-[#F5A300]/60 transition-all duration-300" />
                    <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-[#F5A300] group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* ===== EL BOTÓN DE CARRITO HA SIDO ELIMINADO ===== */}

          <div className="mt-24 sm:mt-32 flex justify-center items-center gap-4 sm:gap-6">
            <span className="w-16 sm:w-24 h-[1px] bg-gradient-to-r from-transparent to-[#F5A300]/30" />
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#F5A300]/50 rounded-full" />
              <span className="w-1.5 h-1.5 bg-[#E4002B]/50 rounded-full animate-pulse" />
              <span className="w-1.5 h-1.5 bg-[#F5A300]/50 rounded-full" />
            </div>
            <span className="w-16 sm:w-24 h-[1px] bg-gradient-to-l from-transparent to-[#F5A300]/30" />
          </div>
        </div>
      </section>


      {/* ==================== CTA FINAL ==================== */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 border-t border-white/10 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={`cta-spark-${i}`}
              className="absolute rounded-full bg-orange-400 animate-float-spark"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${15 + Math.random() * 70}%`,
                width: `${1.5 + Math.random() * 2}px`,
                height: `${1.5 + Math.random() * 2}px`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${4 + Math.random() * 4}s`,
                boxShadow: '0 0 8px 2px rgba(251, 146, 60, 0.3)',
              }}
            />
          ))}
        </div>

        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 relative z-10">
          <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black">
            <span className="text-white">¿Tienes </span>
            <span className="bg-gradient-to-r from-[#F5A300] to-[#E4002B] bg-clip-text text-transparent">
              hambre?
            </span>
          </h2>

          <p className="text-white/70 text-base sm:text-lg md:text-xl">
            Haz tu pedido ahora y disfruta de las mejores pizzas de La Fortuna, directamente desde nuestro horno artesanal.
          </p>

          <Link
            to="/menu"
            className="inline-block px-10 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-[#F5A300] to-[#E4002B] hover:shadow-2xl hover:shadow-[#F5A300]/50 text-black font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 text-base sm:text-lg md:text-xl relative"
          >
            ORDENAR AHORA
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-yellow-300 rounded-full shadow-[0_0_12px_#fde047] animate-ping" />
          </Link>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="relative border-t border-white/10 py-8 sm:py-12 px-4 sm:px-6 bg-black/30 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {[0, 1, 2].map((i) => (
            <div
              key={`footer-spark-${i}`}
              className="absolute rounded-full bg-orange-400/50 animate-float-spark"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${25 + Math.random() * 50}%`,
                width: `${1 + Math.random() * 1.5}px`,
                height: `${1 + Math.random() * 1.5}px`,
                animationDelay: `${i * 1}s`,
                animationDuration: `${5 + Math.random() * 3}s`,
                boxShadow: '0 0 6px 1px rgba(251, 146, 60, 0.2)',
              }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto text-center text-white/60 text-xs sm:text-sm relative z-10">
          <p>Rooster Pizza & Grill © 2026 | Mercadito Arenal, La Fortuna, Alajuela</p>
        </div>
      </footer>

      {/* ==================== ESTILOS PARA LAS CHISPAS ==================== */}
      <style>{`
        @keyframes spark {
          0% {
            opacity: 0;
            transform: scale(0) rotate(0deg) translateY(0);
          }
          30% {
            opacity: 1;
            transform: scale(1.5) rotate(45deg) translateY(-10px);
          }
          70% {
            opacity: 0.8;
            transform: scale(1) rotate(90deg) translateY(-20px);
          }
          100% {
            opacity: 0;
            transform: scale(0) rotate(180deg) translateY(-40px);
          }
        }

        @keyframes float-spark {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0);
          }
          20% {
            opacity: 1;
            transform: translate(10px, -15px) scale(1.2);
          }
          50% {
            opacity: 0.9;
            transform: translate(-8px, -35px) scale(1);
          }
          80% {
            opacity: 0.6;
            transform: translate(15px, -50px) scale(0.8);
          }
          100% {
            opacity: 0;
            transform: translate(-5px, -70px) scale(0);
          }
        }

        .animate-spark {
          animation: spark linear infinite;
        }

        .animate-float-spark {
          animation: float-spark ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}