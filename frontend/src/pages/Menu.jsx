import { Link } from 'react-router-dom'
import { 
  Flame, ArrowRight, Star, Sparkles, 
  Pizza, Coffee, ChefHat, ShoppingCart,
  Search, Filter, Grid, List, Plus, Check
} from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import fondoPrincipal from '../assets/imgMenu.jpeg'
import useCarritoStore from '../store/carritoStore'
import PersonalizadorPizza from '../components/PersonalizadorPizza'

export default function Menu() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [vista, setVista] = useState('grid')
  const [agregando, setAgregando] = useState(null)

  // 🔥 ESTADO PARA PERSONALIZADOR
  const [productoPersonalizando, setProductoPersonalizando] = useState(null)

  const { items, agregarProducto, eliminarProducto, actualizarCantidad, limpiarCarrito, obtenerTotal, obtenerCantidadItems } = useCarritoStore()

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

  const sparks = generateSparks(12)

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true)
      try {
        const publicApi = axios.create({
          baseURL: 'http://127.0.0.1:8000/api',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const [resCategorias, resProductos] = await Promise.all([
          publicApi.get('/categorias'),
          publicApi.get('/productos'),
        ])

        setCategorias(resCategorias.data.filter(c => c.estado === 'activa'))
        setProductos(resProductos.data.filter(p => p.estado === 'disponible'))
      } catch (err) {
        console.error('Error cargando el menú:', err)
      } finally {
        setCargando(false)
      }
    }

    cargarDatos()
  }, [])

  const productosFiltrados = productos.filter((producto) => {
    const coincideCategoria = categoriaSeleccionada === 'todas' 
      || producto.categoria_id === parseInt(categoriaSeleccionada)
    
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.descripcion?.toLowerCase().includes(busqueda.toLowerCase())

    return coincideCategoria && coincideBusqueda
  })

  const productosAgrupados = productosFiltrados.reduce((acc, p) => {
    const catNombre = p.categoria?.nombre || 'Otros'
    if (!acc[catNombre]) acc[catNombre] = []
    acc[catNombre].push(p)
    return acc
  }, {})

  // 🔥 FUNCIÓN PARA AGREGAR AL CARRITO (con personalización)
  const agregarAlCarrito = (producto) => {
    // Si es pizza, abrir personalizador
    if (producto.es_pizza) {
      setProductoPersonalizando(producto)
      return
    }

    if (typeof agregarProducto !== 'function') {
      console.error('agregarProducto no es una función. Verifica tu store.')
      return
    }

    setAgregando(producto.id)
    
    agregarProducto({
      id: producto.id,
      nombre: producto.nombre,
      precio: parseFloat(producto.precio),
      imagen_url: producto.imagen_url,
      descripcion: producto.descripcion,
    })

    setTimeout(() => {
      setAgregando(null)
    }, 800)
  }

  // 🔥 MANEJAR CONFIRMACIÓN DEL PERSONALIZADOR
  const handleConfirmarPersonalizacion = (itemPersonalizado) => {
    if (typeof agregarProducto !== 'function') {
      console.error('agregarProducto no es una función')
      return
    }

    setAgregando(itemPersonalizado.producto_id)
    
    agregarProducto({
      id: itemPersonalizado.producto_id,
      nombre: itemPersonalizado.nombre,
      precio: itemPersonalizado.precio,
      imagen_url: itemPersonalizado.imagen_url,
      cantidad: itemPersonalizado.cantidad,
      extras: itemPersonalizado.extras,
      observaciones: itemPersonalizado.observaciones,
      personalizacion: itemPersonalizado.personalizacion,
    })

    setProductoPersonalizando(null)
    
    setTimeout(() => {
      setAgregando(null)
    }, 800)
  }

  const estaEnCarrito = (productoId) => {
    if (!items) return false
    return items.some(item => item.id === productoId)
  }

  const totalItems = obtenerCantidadItems ? obtenerCantidadItems() : 0

  return (
    <div className="bg-[#120C08] text-white overflow-hidden relative min-h-screen">
      {/* CHISPAS */}
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

      {/* HERO */}
      <section
        className="relative min-h-[50vh] flex items-center justify-center px-4 sm:px-6 py-20 overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `url(${fondoPrincipal})`,
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/75 to-black/60 -z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/70 to-[#120C08] -z-10" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#E4002B]/15 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#F5A300]/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E4002B]/30 border border-[#E4002B]/50 rounded-full w-fit mx-auto mb-6 backdrop-blur-sm">
            <Pizza className="w-4 h-4 text-[#F5A300]" />
            <span className="text-sm font-semibold text-[#F5A300]">
              Nuestro menú
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-6">
            <span className="text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">Descubre</span>
            <span className="block bg-gradient-to-r from-[#F5A300] via-[#E4002B] to-[#F5A300] bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              Nuestros sabores
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Desde nuestras pizzas artesanales hasta las pastas caseras y carnes a la parrilla,
            cada platillo está preparado con ingredientes premium y mucha pasión.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link
              to="/carrito"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#E4002B] to-[#F5A300] hover:shadow-2xl hover:shadow-[#E4002B]/50 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg shadow-black/30"
            >
              <ShoppingCart size={16} />
              Ver carrito
              {totalItems > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        <svg className="absolute bottom-0 left-0 w-full -mb-1" viewBox="0 0 1200 35" preserveAspectRatio="none" style={{ zIndex: 5 }}>
          <path d="M0,20 Q300,5 600,20 T1200,20 L1200,60 L0,60 Z" fill="#120C08" />
          <path d="M0,25 Q300,12 600,25 T1200,25 L1200,60 L0,60 Z" fill="#120C08" opacity="0.8" />
        </svg>
      </section>

      {/* FILTROS */}
      <section className="py-8 px-4 sm:px-6 bg-gradient-to-b from-[#120C08] to-[#0a0604] border-b border-white/10 sticky top-[72px] z-30 backdrop-blur-md bg-[#120C08]/90">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Buscar en el menú..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/20 outline-none transition text-sm"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-hide">
              <button
                onClick={() => setCategoriaSeleccionada('todas')}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  categoriaSeleccionada === 'todas'
                    ? 'bg-gradient-to-r from-[#E4002B] to-[#F5A300] text-white shadow-lg'
                    : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                }`}
              >
                Todas
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaSeleccionada(String(cat.id))}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    categoriaSeleccionada === String(cat.id)
                      ? 'bg-gradient-to-r from-[#E4002B] to-[#F5A300] text-white shadow-lg'
                      : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>

            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 shrink-0">
              <button
                onClick={() => setVista('grid')}
                className={`p-2 rounded-lg transition-all ${
                  vista === 'grid' ? 'bg-[#E4002B] text-white' : 'text-white/40 hover:text-white'
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setVista('list')}
                className={`p-2 rounded-lg transition-all ${
                  vista === 'list' ? 'bg-[#E4002B] text-white' : 'text-white/40 hover:text-white'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTOS */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-b from-[#0a0604] to-[#120C08]">
        <div className="max-w-6xl mx-auto">
          {cargando ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F5A300]" />
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/50 text-lg">No encontramos productos que coincidan con tu búsqueda.</p>
              <button
                onClick={() => { setBusqueda(''); setCategoriaSeleccionada('todas') }}
                className="mt-4 text-[#F5A300] hover:underline"
              >
                Ver todo el menú
              </button>
            </div>
          ) : vista === 'grid' ? (
            <div className="space-y-12">
              {Object.entries(productosAgrupados).map(([categoria, items]) => (
                <div key={categoria}>
                  <h3 className="text-[#F5A300] text-xs font-black uppercase tracking-wide mb-4 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-gradient-to-r from-[#F5A300] to-transparent" />
                    {categoria}
                    <span className="flex-1 h-0.5 bg-gradient-to-r from-[#F5A300]/30 to-transparent" />
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {items.map((producto) => {
                      const enCarrito = estaEnCarrito(producto.id)
                      const agregandoEste = agregando === producto.id
                      const esPizza = producto.es_pizza

                      return (
                        <div
                          key={producto.id}
                          className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-[#F5A300]/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#F5A300]/10"
                        >
                          <div className="relative aspect-[4/3] overflow-hidden bg-black/30">
                            {producto.imagen_url ? (
                              <img
                                src={producto.imagen_url}
                                alt={producto.nombre}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/20 text-4xl sm:text-6xl">
                                🍕
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#120C08] via-[#120C08]/60 to-transparent" />
                            
                            {esPizza && (
                              <div className="absolute top-2 left-2 bg-[#F5A300] text-black text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                🍕 Personalizable
                              </div>
                            )}

                            {enCarrito && (
                              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[#F5A300] text-black text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1">
                                <Check size={8} className="sm:w-[10px] sm:h-[10px]" />
                                Agregado
                              </div>
                            )}
                          </div>

                          <div className="p-2.5 sm:p-3 lg:p-5">
                            <h4 className="text-white font-bold text-xs sm:text-sm lg:text-base group-hover:text-[#F5A300] transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                              {producto.nombre}
                            </h4>
                            
                            {producto.ingredientes_base && producto.ingredientes_base.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {producto.ingredientes_base.slice(0, 3).map((ing) => (
                                  <span key={ing.id} className="text-[8px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                                    {ing.nombre}
                                  </span>
                                ))}
                                {producto.ingredientes_base.length > 3 && (
                                  <span className="text-[8px] text-white/40">+{producto.ingredientes_base.length - 3}</span>
                                )}
                              </div>
                            )}
                            
                            {producto.descripcion && (
                              <p className="text-white/40 text-[10px] sm:text-xs lg:text-sm mt-0.5 sm:mt-1 line-clamp-2 hidden sm:block">
                                {producto.descripcion}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between mt-2 sm:mt-3 pt-1.5 sm:pt-2 lg:pt-3 border-t border-white/5">
                              <span className="text-[#F5A300] font-bold font-mono text-xs sm:text-sm lg:text-lg whitespace-nowrap">
                                ₡{parseFloat(producto.precio).toLocaleString('es-CR')}
                              </span>
                              <button
                                onClick={() => agregarAlCarrito(producto)}
                                disabled={agregandoEste}
                                className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-lg text-white text-[9px] sm:text-[10px] lg:text-xs font-bold transition-all hover:scale-105 flex items-center gap-1 sm:gap-1.5 ${
                                  enCarrito 
                                    ? 'bg-[#F5A300] text-black hover:bg-[#E4002B] hover:text-white'
                                    : esPizza
                                    ? 'bg-gradient-to-r from-[#F5A300] to-[#E4002B] hover:shadow-lg hover:shadow-[#F5A300]/30'
                                    : 'bg-gradient-to-r from-[#E4002B] to-[#F5A300] hover:shadow-lg hover:shadow-[#E4002B]/30'
                                }`}
                              >
                                {agregandoEste ? (
                                  <>
                                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span className="hidden xs:inline">Agregando</span>
                                  </>
                                ) : enCarrito ? (
                                  <>
                                    <Check size={10} className="sm:w-3 sm:h-3" />
                                    <span className="hidden xs:inline">Agregado</span>
                                  </>
                                ) : esPizza ? (
                                  <>
                                    <Plus size={10} className="sm:w-3 sm:h-3" />
                                    <span className="hidden xs:inline">Personalizar</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus size={10} className="sm:w-3 sm:h-3" />
                                    <span className="hidden xs:inline">Agregar</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(productosAgrupados).map(([categoria, items]) => (
                <div key={categoria}>
                  <h3 className="text-[#F5A300] text-xs font-black uppercase tracking-wide mb-4 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-gradient-to-r from-[#F5A300] to-transparent" />
                    {categoria}
                    <span className="flex-1 h-0.5 bg-gradient-to-r from-[#F5A300]/30 to-transparent" />
                  </h3>

                  <div className="space-y-2 sm:space-y-3">
                    {items.map((producto) => {
                      const enCarrito = estaEnCarrito(producto.id)
                      const agregandoEste = agregando === producto.id
                      const esPizza = producto.es_pizza

                      return (
                        <div
                          key={producto.id}
                          className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-[#F5A300]/40 transition-all duration-300 hover:bg-white/10"
                        >
                          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-black/30">
                            {producto.imagen_url ? (
                              <img
                                src={producto.imagen_url}
                                alt={producto.nombre}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/20 text-2xl sm:text-3xl">
                                🍕
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-bold text-sm sm:text-base group-hover:text-[#F5A300] transition-colors truncate">
                              {producto.nombre}
                            </h4>
                            {producto.descripcion && (
                              <p className="text-white/40 text-xs sm:text-sm line-clamp-1">
                                {producto.descripcion}
                              </p>
                            )}
                            {producto.ingredientes_base && producto.ingredientes_base.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {producto.ingredientes_base.slice(0, 3).map((ing) => (
                                  <span key={ing.id} className="text-[8px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                                    {ing.nombre}
                                  </span>
                                ))}
                                {producto.ingredientes_base.length > 3 && (
                                  <span className="text-[8px] text-white/40">+{producto.ingredientes_base.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                            <span className="text-[#F5A300] font-bold font-mono text-xs sm:text-sm lg:text-lg whitespace-nowrap">
                              ₡{parseFloat(producto.precio).toLocaleString('es-CR')}
                            </span>
                            <button
                              onClick={() => agregarAlCarrito(producto)}
                              disabled={agregandoEste}
                              className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-lg text-white text-[9px] sm:text-[10px] lg:text-xs font-bold transition-all hover:scale-105 flex items-center gap-1 sm:gap-1.5 ${
                                enCarrito 
                                  ? 'bg-[#F5A300] text-black hover:bg-[#E4002B] hover:text-white'
                                  : esPizza
                                  ? 'bg-gradient-to-r from-[#F5A300] to-[#E4002B] hover:shadow-lg hover:shadow-[#F5A300]/30'
                                  : 'bg-gradient-to-r from-[#E4002B] to-[#F5A300] hover:shadow-lg hover:shadow-[#E4002B]/30'
                              }`}
                            >
                              {agregandoEste ? (
                                <>
                                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  <span className="hidden xs:inline">Agregando</span>
                                </>
                              ) : enCarrito ? (
                                <>
                                  <Check size={10} className="sm:w-3 sm:h-3" />
                                  <span className="hidden xs:inline">Agregado</span>
                                </>
                              ) : esPizza ? (
                                <>
                                  <Plus size={10} className="sm:w-3 sm:h-3" />
                                  <span className="hidden xs:inline">Personalizar</span>
                                </>
                              ) : (
                                <>
                                  <Plus size={10} className="sm:w-3 sm:h-3" />
                                  <span className="hidden xs:inline">Agregar</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 border-t border-white/10 text-center overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 relative z-10">
          <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black">
            <span className="text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">¿Listo para </span>
            <span className="bg-gradient-to-r from-[#F5A300] to-[#E4002B] bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              ordenar?
            </span>
          </h2>

          <p className="text-white/80 text-base sm:text-lg md:text-xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Haz tu pedido ahora y disfruta de las mejores pizzas de La Fortuna,
            directamente desde nuestro horno artesanal.
          </p>

          <Link
            to="/carrito"
            className="inline-block px-10 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-[#F5A300] to-[#E4002B] hover:shadow-2xl hover:shadow-[#F5A300]/50 text-black font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 text-base sm:text-lg md:text-xl shadow-lg shadow-black/30"
          >
            VER CARRITO
            {totalItems > 0 && (
              <span className="ml-2 bg-black/20 px-2 py-0.5 rounded-full text-sm">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t border-white/10 py-8 sm:py-12 px-4 sm:px-6 bg-black/30 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center text-white/60 text-xs sm:text-sm relative z-10">
          <p>Rooster Pizza & Grill © 2026 | Mercadito Arenal, La Fortuna, Alajuela</p>
        </div>
      </footer>

      {/* 🔥 PERSONALIZADOR DE PIZZA */}
      {productoPersonalizando && (
        <PersonalizadorPizza
          producto={productoPersonalizando}
          extrasDisponibles={productoPersonalizando.extras_disponibles || []}
          onConfirmar={handleConfirmarPersonalizacion}
          onCancelar={() => setProductoPersonalizando(null)}
        />
      )}

      <style>{`
        @keyframes spark {
          0% { opacity: 0; transform: scale(0) rotate(0deg) translateY(0); }
          30% { opacity: 1; transform: scale(1.5) rotate(45deg) translateY(-10px); }
          70% { opacity: 0.8; transform: scale(1) rotate(90deg) translateY(-20px); }
          100% { opacity: 0; transform: scale(0) rotate(180deg) translateY(-40px); }
        }
        .animate-spark { animation: spark linear infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}