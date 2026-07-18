import { useState, useEffect } from 'react'
import api from '../api/axios'
import DashboardLayout from '../components/DashboardLayout'
import { QRCodeCanvas } from 'qrcode.react'
import PersonalizadorPizza from '../components/PersonalizadorPizza'
import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  ImageOff,
  Search,
  User,
  CreditCard,
  DollarSign,
  Smartphone,
  QrCode,
  Copy,
} from 'lucide-react'

const MODALIDADES = [
  { value: 'consumo_local', label: 'Consumo en local' },
  { value: 'retiro', label: 'Para retirar' },
]

const METODOS_PAGO = [
  { value: 'sinpe', label: 'Sinpe Móvil', icon: Smartphone },
  { value: 'efectivo', label: 'Efectivo', icon: DollarSign },
  { value: 'tarjeta', label: 'Tarjeta (Datafono)', icon: CreditCard },
]

function CajaDashboard() {
  const [productos, setProductos] = useState([])
  const [cargandoProductos, setCargandoProductos] = useState(true)
  const [carrito, setCarrito] = useState([])
  const [modalidad, setModalidad] = useState('consumo_local')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [qrComprobanteUrl, setQrComprobanteUrl] = useState(null)

  // 🔥 ESTADO PARA PERSONALIZADOR
  const [productoPersonalizando, setProductoPersonalizando] = useState(null)

  const [clientes, setClientes] = useState([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [mostrarFormCliente, setMostrarFormCliente] = useState(false)
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', telefono: '', correo: '' })

  const DATOS_SINPE = {
    telefono: '8888-8888',
    nombre: 'Pizzería Rooster S.A.',
  }

  // 🔥 FUNCIÓN PARA FORMATEAR PRECIOS (SIN DECIMALES)
  const formatearPrecio = (monto) => {
    return monto.toLocaleString('es-CR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }

  // 🔥 FUNCIÓN PARA RENDERIZAR EXTRAS Y OBSERVACIONES EN CAJA
  const renderExtrasYObservaciones = (item) => {
    const detalles = []

    if (item.extras) {
      detalles.push(`➕ Extras: ${item.extras}`)
    }
    if (item.observaciones) {
      detalles.push(`📝 ${item.observaciones}`)
    }

    if (detalles.length === 0) return null

    return (
      <div className="text-[9px] text-[#6B6862] mt-0.5 space-y-0.5">
        {detalles.map((d, i) => (
          <p key={i} className="truncate">{d}</p>
        ))}
      </div>
    )
  }

  const tieneExtras = (item) => {
    return item.extras || item.observaciones
  }

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [productosRes, clientesRes] = await Promise.all([
          api.get('/productos'),
          api.get('/clientes'),
        ])

        setProductos(productosRes.data)
        setClientes(clientesRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setCargandoProductos(false)
      }
    }

    cargarDatos()
  }, [])

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
      c.telefono?.includes(busquedaCliente) ||
      c.correo?.toLowerCase().includes(busquedaCliente.toLowerCase())
  )

  // 🔥 AGREGAR PRODUCTO - AHORA ABRE PERSONALIZADOR SI ES PIZZA
  const agregarAlCarrito = (producto) => {
    // Si es pizza, abrir personalizador
    if (producto.es_pizza) {
      setProductoPersonalizando(producto)
      return
    }

    // Si no es pizza, agregar directamente
    setCarrito((prev) => {
      const existente = prev.find((item) => item.producto_id === producto.id)

      if (existente) {
        return prev.map((item) =>
          item.producto_id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      }

      return [
        ...prev,
        {
          producto_id: producto.id,
          nombre: producto.nombre,
          precio: parseFloat(producto.precio),
          cantidad: 1,
          extras: null,
          observaciones: null,
        },
      ]
    })
  }

  // 🔥 MANEJAR CONFIRMACIÓN DEL PERSONALIZADOR
  const handleConfirmarPersonalizacion = (itemPersonalizado) => {
    setCarrito((prev) => {
      const existente = prev.find((item) => item.producto_id === itemPersonalizado.producto_id)

      if (existente) {
        return prev.map((item) =>
          item.producto_id === itemPersonalizado.producto_id
            ? { 
                ...item, 
                cantidad: item.cantidad + 1,
                precio: itemPersonalizado.precio,
                extras: itemPersonalizado.extras,
                observaciones: itemPersonalizado.observaciones,
              }
            : item
        )
      }

      return [
        ...prev,
        {
          producto_id: itemPersonalizado.producto_id,
          nombre: itemPersonalizado.nombre,
          precio: itemPersonalizado.precio,
          cantidad: 1,
          extras: itemPersonalizado.extras || null,
          observaciones: itemPersonalizado.observaciones || null,
        },
      ]
    })

    setProductoPersonalizando(null)
  }

  const cambiarCantidad = (productoId, delta) => {
    setCarrito((prev) =>
      prev
        .map((item) =>
          item.producto_id === productoId
            ? { ...item, cantidad: item.cantidad + delta }
            : item
        )
        .filter((item) => item.cantidad > 0)
    )
  }

  const quitarDelCarrito = (productoId) => {
    setCarrito((prev) => prev.filter((item) => item.producto_id !== productoId))
  }

  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0)

  const handleCrearCliente = async (e) => {
    e.preventDefault()

    try {
      const response = await api.post('/clientes', nuevoCliente)

      setClientes([...clientes, response.data])
      setClienteSeleccionado(response.data)
      setMostrarFormCliente(false)
      setNuevoCliente({ nombre: '', telefono: '', correo: '' })
      setMensaje({
        tipo: 'exito',
        texto: `Cliente ${response.data.nombre} registrado correctamente`,
      })
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al registrar cliente' })
    }
  }

  const crearPedido = async () => {
    if (carrito.length === 0) {
      setMensaje({ tipo: 'error', texto: 'Agrega productos al carrito' })
      return
    }

    if (!clienteSeleccionado) {
      setMensaje({ tipo: 'error', texto: 'Selecciona o registra un cliente' })
      return
    }

    setEnviando(true)
    setMensaje(null)
    setQrComprobanteUrl(null)

    try {
      const productosPayload = carrito.map((item) => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        extras: item.extras || null,
        observaciones: item.observaciones || null,
      }))

      const payload = {
        cliente_id: clienteSeleccionado.id,
        modalidad_entrega: modalidad,
        metodo_pago: metodoPago,
        productos: JSON.stringify(productosPayload),
      }

      const response = await api.post('/pedidos', payload)
      const pedido = response.data.pedido

      if (metodoPago === 'sinpe') {
        const url = `${window.location.origin}/subir-comprobante/${pedido.codigo_tracking}`
        setQrComprobanteUrl(url)
      }

      setMensaje({
        tipo: 'exito',
        texto: `✅ Pedido #${pedido.codigo_tracking} creado para ${clienteSeleccionado.nombre}`,
      })

      setCarrito([])
    } catch (err) {
      console.error('Error:', err)
      setMensaje({
        tipo: 'error',
        texto: err.response?.data?.message || 'Error al crear el pedido',
      })
    } finally {
      setEnviando(false)
    }
  }

  const copiarUrl = async () => {
    if (!qrComprobanteUrl) return

    await navigator.clipboard.writeText(qrComprobanteUrl)
    setMensaje({
      tipo: 'exito',
      texto: 'Link del comprobante copiado correctamente',
    })
  }

  const productosPorCategoria = productos.reduce((acc, p) => {
    const cat = p.categoria?.nombre || 'Otros'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  return (
    <DashboardLayout titulo="Punto de caja" dark>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* SECCIÓN CLIENTE */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <User size={20} className="text-[#F5A300]" />
              <h3 className="text-white font-bold">Cliente</h3>
            </div>

            <div className="relative mb-3">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Buscar cliente por nombre, teléfono o correo..."
                value={busquedaCliente}
                onChange={(e) => setBusquedaCliente(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/15 rounded-xl text-white placeholder:text-white/30 focus:border-[#F5A300] outline-none text-sm"
              />
            </div>

            {busquedaCliente && clientesFiltrados.length > 0 && (
              <div className="max-h-40 overflow-y-auto bg-black/40 rounded-xl divide-y divide-white/10">
                {clientesFiltrados.map((cliente) => (
                  <button
                    key={cliente.id}
                    onClick={() => {
                      setClienteSeleccionado(cliente)
                      setBusquedaCliente('')
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-white/10 transition-colors"
                  >
                    <p className="text-white text-sm font-medium">{cliente.nombre}</p>
                    <p className="text-white/40 text-xs">
                      {cliente.telefono} • {cliente.correo}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {clienteSeleccionado ? (
              <div className="flex items-center justify-between bg-[#F5A300]/10 border border-[#F5A300]/30 rounded-xl p-3">
                <div>
                  <p className="text-white font-semibold">{clienteSeleccionado.nombre}</p>
                  <p className="text-white/50 text-xs">
                    {clienteSeleccionado.telefono} • {clienteSeleccionado.correo}
                  </p>
                </div>
                <button
                  onClick={() => setClienteSeleccionado(null)}
                  className="text-white/40 hover:text-[#E4002B] text-sm"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setMostrarFormCliente(!mostrarFormCliente)}
                className="text-[#F5A300] text-sm font-medium hover:underline"
              >
                {mostrarFormCliente ? 'Cancelar' : '+ Registrar nuevo cliente'}
              </button>
            )}

            {mostrarFormCliente && !clienteSeleccionado && (
              <form onSubmit={handleCrearCliente} className="mt-3 space-y-3">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={nuevoCliente.nombre}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-lg text-white placeholder:text-white/30 focus:border-[#F5A300] outline-none text-sm"
                />
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={nuevoCliente.telefono}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-lg text-white placeholder:text-white/30 focus:border-[#F5A300] outline-none text-sm"
                />
                <input
                  type="email"
                  placeholder="Correo electrónico (opcional)"
                  value={nuevoCliente.correo}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, correo: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-lg text-white placeholder:text-white/30 focus:border-[#F5A300] outline-none text-sm"
                />
                <button
                  type="submit"
                  className="w-full bg-[#F5A300] hover:bg-[#E4002B] text-white font-bold py-2 rounded-lg transition-colors text-sm"
                >
                  Registrar cliente
                </button>
              </form>
            )}
          </div>

          {/* CATÁLOGO DE PRODUCTOS */}
          {cargandoProductos ? (
            <p className="text-[#6B6862] text-sm">Cargando catálogo...</p>
          ) : (
            Object.entries(productosPorCategoria).map(([categoria, items]) => (
              <div key={categoria}>
                <h3 className="text-[#A9824A] text-xs font-bold uppercase tracking-wide mb-3">
                  {categoria}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {items.map((producto) => {
                    const esPizza = producto.es_pizza
                    return (
                      <button
                        key={producto.id}
                        onClick={() => agregarAlCarrito(producto)}
                        className="text-left bg-white hover:bg-[#FFF9F0] border border-[#E5E2DC] hover:border-[#F5A300] rounded-xl overflow-hidden transition-colors shadow-sm"
                      >
                        <div className="aspect-video bg-[#F1EFE8] flex items-center justify-center overflow-hidden">
                          {producto.imagen_url ? (
                            <img
                              src={producto.imagen_url}
                              alt={producto.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageOff size={28} className="text-[#C9C5BC]" />
                          )}
                        </div>

                        <div className="p-4">
                          <p className="text-[#1A1A1A] font-semibold text-sm line-clamp-1">
                            {producto.nombre}
                          </p>
                          {esPizza && (
                            <span className="text-[8px] bg-[#F5A300]/10 text-[#F5A300] px-1.5 py-0.5 rounded-full">
                              🍕 Personalizable
                            </span>
                          )}
                          <p className="text-[#E4002B] font-bold mt-2">
                            ₡{formatearPrecio(producto.precio)}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* CARRITO */}
        <div className="bg-white border border-[#E5E2DC] rounded-xl overflow-hidden shadow-sm flex flex-col h-[600px] sticky top-24">
          <div className="h-[3px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B] shrink-0" />

          <div className="p-4 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3 shrink-0">
              <ShoppingCart size={18} className="text-[#E4002B]" />
              <h3 className="text-[#1A1A1A] font-bold">Pedido actual</h3>

              {carrito.length > 0 && (
                <span className="ml-auto text-xs bg-[#E4002B] text-white px-2 py-0.5 rounded-full">
                  {carrito.reduce((sum, item) => sum + item.cantidad, 0)} items
                </span>
              )}
            </div>

            {/* MÉTODO DE PAGO */}
            <div className="mb-3 shrink-0">
              <label className="block text-xs font-bold text-[#6B6862] uppercase tracking-wide mb-1.5">
                Método de pago
              </label>

              <div className="grid grid-cols-3 gap-1.5">
                {METODOS_PAGO.map((metodo) => {
                  const Icon = metodo.icon

                  return (
                    <button
                      key={metodo.value}
                      onClick={() => {
                        setMetodoPago(metodo.value)
                        setQrComprobanteUrl(null)
                      }}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${metodoPago === metodo.value
                        ? 'bg-[#E4002B] text-white shadow-md'
                        : 'bg-[#F1EFE8] text-[#6B6862] hover:bg-[#E5E2DC]'
                        }`}
                    >
                      <Icon size={13} />
                      {metodo.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* SINPE */}
            {metodoPago === 'sinpe' && (
              <div className="bg-[#FFF9F0] border border-[#F5A300] rounded-xl p-3 mb-3 shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <QrCode size={16} className="text-[#E4002B]" />
                  <p className="text-[#1A1A1A] font-black text-sm">
                    Pago por SINPE Móvil
                  </p>
                </div>

                <p className="text-[#6B6862] text-[11px]">Número SINPE</p>
                <p className="text-[#E4002B] font-black text-lg">
                  {DATOS_SINPE.telefono}
                </p>

                <p className="text-[#6B6862] text-[11px] mt-1">A nombre de</p>
                <p className="text-[#1A1A1A] font-bold text-xs">
                  {DATOS_SINPE.nombre}
                </p>

                <p className="text-[#6B6862] text-[11px] mt-1">Monto</p>
                <p className="text-[#1A1A1A] font-black text-base">
                  ₡{formatearPrecio(total)}
                </p>

                {qrComprobanteUrl ? (
                  <div className="mt-3 bg-white border border-[#E5E2DC] rounded-xl p-3 text-center">
                    <p className="text-[#1A1A1A] font-bold text-xs mb-2">
                      Escanear para subir comprobante
                    </p>

                    <div className="flex justify-center">
                      <QRCodeCanvas
                        value={qrComprobanteUrl}
                        size={150}
                        includeMargin
                      />
                    </div>

                    <button
                      onClick={copiarUrl}
                      className="mt-2 inline-flex items-center justify-center gap-1 text-[11px] text-[#E4002B] font-bold hover:underline"
                    >
                      <Copy size={12} />
                      Copiar link
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-[#6B6862] mt-2 leading-snug">
                    Al confirmar el pedido se generará un QR para que el cliente suba el comprobante desde su celular.
                  </p>
                )}
              </div>
            )}

            {/* PRODUCTOS EN CARRITO - CON EXTRAS Y OBSERVACIONES */}
            <div className="flex-1 overflow-y-auto mb-3 border-t border-[#E5E2DC] pt-2">
              {carrito.length === 0 ? (
                <p className="text-[#9B988F] text-sm py-4 text-center">
                  Selecciona productos del catálogo
                </p>
              ) : (
                <div className="space-y-2">
                  {carrito.map((item) => (
                    <div
                      key={item.producto_id}
                      className="flex items-center justify-between gap-2 text-sm border-b border-[#F1EFE8] pb-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[#1A1A1A] font-medium text-sm truncate">
                          {item.nombre}
                          {tieneExtras(item) && (
                            <span className="ml-1 text-[8px] bg-[#F5A300]/20 text-[#F5A300] px-1 py-0.5 rounded-full">
                              ✨
                            </span>
                          )}
                        </p>
                        <p className="text-[#9B988F] text-[10px]">
                          ₡{formatearPrecio(item.precio)}
                        </p>
                        {renderExtrasYObservaciones(item)}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => cambiarCantidad(item.producto_id, -1)}
                          className="w-5 h-5 flex items-center justify-center bg-[#F1EFE8] hover:bg-[#E5E2DC] rounded text-[#1A1A1A] text-xs"
                        >
                          <Minus size={11} />
                        </button>

                        <span className="text-[#1A1A1A] w-5 text-center text-sm font-medium">
                          {item.cantidad}
                        </span>

                        <button
                          onClick={() => cambiarCantidad(item.producto_id, 1)}
                          className="w-5 h-5 flex items-center justify-center bg-[#F1EFE8] hover:bg-[#E5E2DC] rounded text-[#1A1A1A] text-xs"
                        >
                          <Plus size={11} />
                        </button>

                        <button
                          onClick={() => quitarDelCarrito(item.producto_id)}
                          className="w-5 h-5 flex items-center justify-center text-[#9B988F] hover:text-[#E4002B] ml-0.5"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MODALIDAD */}
            <div className="border-t border-[#E5E2DC] pt-2 mb-2 shrink-0">
              <select
                value={modalidad}
                onChange={(e) => setModalidad(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#E5E2DC] outline-none text-sm bg-white focus:border-[#E4002B]"
              >
                {MODALIDADES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* TOTAL Y BOTÓN */}
            <div className="border-t border-[#E5E2DC] pt-2 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#6B6862] text-sm font-semibold">Total</span>
                <span className="text-[#1A1A1A] text-xl font-black font-mono">
                  ₡{formatearPrecio(total)}
                </span>
              </div>

              {mensaje && (
                <div
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg mb-2 ${mensaje.tipo === 'exito'
                    ? 'bg-[#EAF3DE] text-[#3B6D11] border border-[#C9E0B0]'
                    : 'bg-[#FCEBEB] text-[#A32D2D] border border-[#F09595]'
                    }`}
                >
                  {mensaje.texto}
                </div>
              )}

              <button
                onClick={crearPedido}
                disabled={carrito.length === 0 || enviando || !clienteSeleccionado}
                className="w-full bg-[#E4002B] hover:bg-[#F5A300] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
              >
                {enviando ? '⏳ Enviando...' : '✅ Confirmar pedido'}
              </button>

              {!clienteSeleccionado && (
                <p className="text-[10px] text-[#E4002B] mt-1 text-center">
                  ⚠️ Selecciona un cliente
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 PERSONALIZADOR DE PIZZA (para Caja) */}
      {productoPersonalizando && (
        <PersonalizadorPizza
          producto={productoPersonalizando}
          extrasDisponibles={productoPersonalizando.extras_disponibles || []}
          onConfirmar={handleConfirmarPersonalizacion}
          onCancelar={() => setProductoPersonalizando(null)}
        />
      )}
    </DashboardLayout>
  )
}

export default CajaDashboard