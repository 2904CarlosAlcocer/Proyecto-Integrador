import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, Trash2, Plus, Minus,
  ShoppingCart, Sparkles, Clock,
  CreditCard, Shield, Truck, Smartphone, Upload,
  Search, User, X, Copy, PackageCheck
} from 'lucide-react'
import { useEffect, useState } from 'react'
import fondoPrincipal from '../assets/fondoPrincipal1.png'
import useCarritoStore from '../store/carritoStore'
import api from '../api/axios'

export default function Carrito() {
  const navigate = useNavigate()

  const {
    items,
    eliminarProducto,
    actualizarCantidad,
    limpiarCarrito,
    obtenerTotal,
    obtenerCantidadItems,
  } = useCarritoStore()

  const [modalidad, setModalidad] = useState('consumo_local')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [comprobante, setComprobante] = useState(null)

  const [clientes, setClientes] = useState([])
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)

  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [pedidoCreado, setPedidoCreado] = useState(null)
  const [codigoCopiado, setCodigoCopiado] = useState(false)

  const total = obtenerTotal ? obtenerTotal() : 0
  const cantidadItems = obtenerCantidadItems ? obtenerCantidadItems() : 0

  useEffect(() => {
    cargarClientes()
  }, [])

  const cargarClientes = async () => {
    try {
      const response = await api.get('/clientes')
      setClientes(response.data)
    } catch (err) {
      console.error(err)
    }
  }

  const clientesFiltrados = clientes.filter((c) =>
    c.nombre?.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
    c.telefono?.includes(busquedaCliente) ||
    c.correo?.toLowerCase().includes(busquedaCliente.toLowerCase())
  )

  const crearPedido = async () => {
    if (items.length === 0) {
      setMensaje({
        tipo: 'error',
        texto: 'Tu carrito está vacío.',
      })
      return
    }

    if (!clienteSeleccionado) {
      setMensaje({
        tipo: 'error',
        texto: 'Debes seleccionar un cliente registrado.',
      })
      return
    }

    if (metodoPago === 'sinpe' && !comprobante) {
      setMensaje({
        tipo: 'error',
        texto: 'Debes adjuntar el comprobante SINPE.',
      })
      return
    }

    setEnviando(true)
    setMensaje(null)

    try {
      const formData = new FormData()

      formData.append('cliente_id', clienteSeleccionado.id)
      formData.append('modalidad_entrega', modalidad)
      formData.append('metodo_pago', metodoPago)

      formData.append(
        'productos',
        JSON.stringify(
          items.map((item) => ({
            producto_id: item.id,
            cantidad: item.cantidad,
          }))
        )
      )

      if (metodoPago === 'sinpe' && comprobante) {
        formData.append('comprobante', comprobante)
      }

      const response = await api.post('/pedidos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setPedidoCreado(response.data.pedido)
      setCodigoCopiado(false)

      setMensaje({
        tipo: 'exito',
        texto: 'Pedido creado correctamente.',
      })
    } catch (err) {
      setMensaje({
        tipo: 'error',
        texto: err.response?.data?.message || 'No se pudo crear el pedido.',
      })
      console.error(err)
    } finally {
      setEnviando(false)
    }
  }

  const handleCantidad = (productoId, delta) => {
    const item = items.find((i) => i.id === productoId)

    if (item) {
      const nuevaCantidad = item.cantidad + delta

      if (nuevaCantidad <= 0) {
        eliminarProducto(productoId)
      } else {
        actualizarCantidad(productoId, nuevaCantidad)
      }
    }
  }

  const metodoPagoTexto = () => {
    if (metodoPago === 'sinpe') return 'SINPE Móvil'
    if (metodoPago === 'tarjeta') return 'Tarjeta'
    return 'Efectivo'
  }

  const modalidadTexto = () => {
    if (modalidad === 'retiro') return 'Para retirar'
    return 'Consumo en local'
  }

  const copiarCodigo = async () => {
    if (!pedidoCreado?.codigo_tracking) return

    try {
      await navigator.clipboard.writeText(pedidoCreado.codigo_tracking)
      setCodigoCopiado(true)
      setTimeout(() => setCodigoCopiado(false), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  const limpiarDespuesDePedido = () => {
    limpiarCarrito()
    setComprobante(null)
    setMetodoPago('efectivo')
    setModalidad('consumo_local')
    setClienteSeleccionado(null)
    setBusquedaCliente('')
    setMensaje(null)
    setPedidoCreado(null)
  }

  const verSeguimiento = () => {
    const codigo = pedidoCreado?.codigo_tracking
    limpiarDespuesDePedido()

    navigate('/estado-pedido', {
      state: { codigo },
    })
  }

  return (
    <div className="min-h-screen bg-[#120C08] text-white overflow-hidden relative">
      <section
        className="relative min-h-screen flex items-start pt-20 sm:pt-24 lg:pt-28 px-3 sm:px-4 lg:px-6 py-10 sm:py-12 lg:py-16 overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `url(${fondoPrincipal})`,
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/80 to-[#120C08]/95 -z-10" />

        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E4002B]/20 border border-[#E4002B]/40 rounded-full w-fit mx-auto mb-4 backdrop-blur-sm">
              <ShoppingCart className="w-4 h-4 text-[#F5A300]" />
              <span className="text-sm font-semibold text-[#F5A300]">Tu pedido</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-black leading-tight">
              <span className="text-white">Tu</span>
              <span className="block bg-gradient-to-r from-[#F5A300] via-[#E4002B] to-[#F5A300] bg-clip-text text-transparent">
                Carrito
              </span>
            </h1>

            <p className="text-white font-semibold mt-3">
              Revisa tu pedido, selecciona tu cliente registrado y confirma la orden.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {items.length === 0 ? (
                <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Tu carrito está vacío
                  </h3>

                  <p className="text-white/60 mb-6">
                    Parece que aún no has agregado nada a tu pedido.
                  </p>

                  <Link
                    to="/menu"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E4002B] to-[#F5A300] rounded-xl font-bold"
                  >
                    Explorar menú
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-lg">
                      Tu pedido ({cantidadItems} productos)
                    </h3>

                    <button
                      onClick={limpiarCarrito}
                      className="text-white/40 hover:text-[#E4002B] text-sm flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Vaciar carrito
                    </button>
                  </div>

                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center gap-4"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/50">
                        {item.imagen_url ? (
                          <img
                            src={item.imagen_url}
                            alt={item.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20 text-3xl">
                            🍕
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h4 className="text-white font-bold">{item.nombre}</h4>
                        <p className="text-[#F5A300] font-bold font-mono text-sm">
                          ₡{item.precio.toLocaleString('es-CR')} c/u
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-white/5 rounded-lg border border-white/10">
                          <button
                            onClick={() => handleCantidad(item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-[#F5A300]"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="text-white font-bold w-6 text-center text-sm">
                            {item.cantidad}
                          </span>

                          <button
                            onClick={() => handleCantidad(item.id, 1)}
                            className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-[#F5A300]"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="text-right min-w-[80px]">
                          <p className="text-white font-bold font-mono text-sm">
                            ₡{(item.precio * item.cantidad).toLocaleString('es-CR')}
                          </p>
                        </div>

                        <button
                          onClick={() => eliminarProducto(item.id)}
                          className="text-white/30 hover:text-[#E4002B]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sticky top-24">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-[#F5A300]" />
                  Resumen del pedido
                </h3>

                {items.length > 0 ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-white/60 uppercase tracking-wide mb-2">
                        Cliente registrado
                      </label>

                      {!clienteSeleccionado ? (
                        <>
                          <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                            <input
                              type="text"
                              placeholder="Buscar por nombre, teléfono o correo..."
                              value={busquedaCliente}
                              onChange={(e) => setBusquedaCliente(e.target.value)}
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 text-sm outline-none focus:border-[#F5A300]"
                            />
                          </div>

                          {busquedaCliente && (
                            <div className="mt-2 max-h-40 overflow-y-auto bg-black/60 border border-white/10 rounded-xl">
                              {clientesFiltrados.length > 0 ? (
                                clientesFiltrados.map((cliente) => (
                                  <button
                                    key={cliente.id}
                                    onClick={() => {
                                      setClienteSeleccionado(cliente)
                                      setBusquedaCliente('')
                                      setMensaje(null)
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-white/10 border-b border-white/10 last:border-b-0"
                                  >
                                    <p className="text-white text-sm font-semibold">{cliente.nombre}</p>
                                    <p className="text-white/40 text-xs">
                                      {cliente.telefono || 'Sin teléfono'} • {cliente.correo || 'Sin correo'}
                                    </p>
                                  </button>
                                ))
                              ) : (
                                <p className="px-3 py-3 text-[#E4002B] text-xs">
                                  Cliente no registrado. No puede realizar pedido.
                                </p>
                              )}
                            </div>
                          )}

                          <p className="text-white/40 text-xs mt-2">
                            Solo clientes registrados pueden hacer pedidos.
                          </p>
                        </>
                      ) : (
                        <div className="bg-[#F5A300]/10 border border-[#F5A300]/30 rounded-xl p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-[#F5A300]" />
                            <div>
                              <p className="text-white font-semibold text-sm">{clienteSeleccionado.nombre}</p>
                              <p className="text-white/40 text-xs">
                                {clienteSeleccionado.telefono || 'Sin teléfono'} • {clienteSeleccionado.correo || 'Sin correo'}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => setClienteSeleccionado(null)}
                            className="text-white/40 hover:text-[#E4002B]"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 mb-4 max-h-[160px] overflow-y-auto pr-1">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-white/70 truncate mr-2">
                            {item.cantidad}x {item.nombre}
                          </span>
                          <span className="text-white font-medium">
                            ₡{(item.precio * item.cantidad).toLocaleString('es-CR')}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/10 pt-4 mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-white/60 text-sm">Subtotal</span>
                        <span className="text-white font-medium text-sm">
                          ₡{total.toLocaleString('es-CR')}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-white/60 text-sm">Envío</span>
                        <span className="text-[#F5A300] font-medium text-sm">Gratis</span>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-4 mb-4">
                      <div className="flex justify-between">
                        <span className="text-white font-bold text-lg">Total</span>
                        <span className="text-[#F5A300] font-black text-xl font-mono">
                          ₡{total.toLocaleString('es-CR')}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-bold text-white/60 uppercase tracking-wide mb-2">
                        Modalidad de entrega
                      </label>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setModalidad('consumo_local')}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold ${modalidad === 'consumo_local'
                              ? 'border-[#F5A300] bg-[#F5A300]/10 text-[#F5A300]'
                              : 'border-white/10 text-white/60 hover:text-white'
                            }`}
                        >
                          <Clock size={14} />
                          Local
                        </button>

                        <button
                          onClick={() => setModalidad('retiro')}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold ${modalidad === 'retiro'
                              ? 'border-[#F5A300] bg-[#F5A300]/10 text-[#F5A300]'
                              : 'border-white/10 text-white/60 hover:text-white'
                            }`}
                        >
                          <Truck size={14} />
                          Retiro
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-bold text-white/60 uppercase tracking-wide mb-2">
                        Método de pago
                      </label>

                      <div className="grid grid-cols-1 gap-2">
                        <button
                          onClick={() => {
                            setMetodoPago('efectivo')
                            setComprobante(null)
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl border text-sm font-bold ${metodoPago === 'efectivo'
                              ? 'border-[#F5A300] bg-[#F5A300]/10 text-[#F5A300]'
                              : 'border-white/10 text-white/60 hover:text-white'
                            }`}
                        >
                          <span>Efectivo</span>
                          <CreditCard size={16} />
                        </button>

                        <button
                          onClick={() => {
                            setMetodoPago('tarjeta')
                            setComprobante(null)
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl border text-sm font-bold ${metodoPago === 'tarjeta'
                              ? 'border-[#F5A300] bg-[#F5A300]/10 text-[#F5A300]'
                              : 'border-white/10 text-white/60 hover:text-white'
                            }`}
                        >
                          <span>Tarjeta</span>
                          <CreditCard size={16} />
                        </button>

                        <button
                          onClick={() => setMetodoPago('sinpe')}
                          className={`flex items-center justify-between p-3 rounded-xl border text-sm font-bold ${metodoPago === 'sinpe'
                              ? 'border-[#F5A300] bg-[#F5A300]/10 text-[#F5A300]'
                              : 'border-white/10 text-white/60 hover:text-white'
                            }`}
                        >
                          <span>SINPE Móvil</span>
                          <Smartphone size={16} />
                        </button>
                      </div>
                    </div>

                    {metodoPago === 'sinpe' && (
                      <div className="mb-4 bg-white/5 border border-[#F5A300]/30 rounded-xl p-4">
                        <p className="text-[#F5A300] font-bold text-sm mb-1">
                          Pago por SINPE Móvil
                        </p>

                        <p className="text-white/70 text-sm mb-3">
                          Realiza el pago al número:
                        </p>

                        <p className="text-white font-black text-lg font-mono mb-3">
                          8888-8888
                        </p>

                        <label className="block text-xs font-bold text-white/60 uppercase tracking-wide mb-2">
                          Adjuntar comprobante
                        </label>

                        <label className="flex items-center justify-center gap-2 border border-dashed border-white/20 rounded-xl p-3 cursor-pointer hover:border-[#F5A300] transition-colors text-sm text-white/70">
                          <Upload size={16} />
                          {comprobante ? comprobante.name : 'Seleccionar archivo'}
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.gif"
                            className="hidden"
                            onChange={(e) => setComprobante(e.target.files[0])}
                          />
                        </label>
                      </div>
                    )}

                    {mensaje && (
                      <div
                        className={`text-sm font-medium px-3 py-2 rounded-lg mb-3 ${mensaje.tipo === 'exito'
                            ? 'bg-[#EAF3DE] text-[#3B6D11] border border-[#C9E0B0]'
                            : 'bg-[#FCEBEB] text-[#A32D2D] border border-[#F09595]'
                          }`}
                      >
                        {mensaje.texto}
                      </div>
                    )}

                    <button
                      onClick={crearPedido}
                      disabled={
                        enviando ||
                        !clienteSeleccionado ||
                        (metodoPago === 'sinpe' && !comprobante)
                      }
                      className="w-full bg-gradient-to-r from-[#E4002B] to-[#F5A300] hover:shadow-2xl hover:shadow-[#E4002B]/50 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                      {enviando ? (
                        'Enviando...'
                      ) : (
                        <>
                          <CreditCard size={18} />
                          Confirmar pedido
                        </>
                      )}
                    </button>

                    {!clienteSeleccionado && (
                      <p className="text-[#E4002B] text-xs text-center mt-2">
                        Debes seleccionar un cliente registrado.
                      </p>
                    )}

                    {metodoPago === 'sinpe' && !comprobante && clienteSeleccionado && (
                      <p className="text-[#E4002B] text-xs text-center mt-2">
                        Debes adjuntar el comprobante SINPE.
                      </p>
                    )}

                    <div className="flex items-center justify-center gap-1 mt-3 text-[10px] text-white/30">
                      <Shield size={12} />
                      <span>Pedido seguro</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-white/50 text-sm">
                      No hay productos en tu carrito.
                    </p>

                    <Link
                      to="/menu"
                      className="inline-block mt-4 text-[#F5A300] text-sm hover:underline"
                    >
                      Ir al menú
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {pedidoCreado && (
        <div className="fixed inset-0 z-[10000] bg-black/75 backdrop-blur-md flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#160F0B] border border-[#F5A300]/30 rounded-3xl shadow-2xl">
            <div className="h-[4px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

            <div className="p-5 sm:p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-[#EAF3DE] flex items-center justify-center shadow-lg">
                  <PackageCheck className="w-8 h-8 text-[#3B6D11]" />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-2">
                ¡Pedido realizado!
              </h2>

              <p className="text-white/60 text-sm text-center mb-5">
                Guarda este código para consultar el estado de tu pedido.
              </p>

              <div className="bg-black/40 border border-[#F5A300]/40 rounded-2xl p-4 mb-4 text-center">
                <p className="text-white/45 text-[11px] uppercase font-black tracking-wide mb-2">
                  Tu número de pedido es
                </p>

                <p className="text-[#F5A300] text-3xl sm:text-4xl font-black font-mono tracking-wide">
                  {pedidoCreado.codigo_tracking}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 space-y-2.5">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-white/45 font-bold">Cliente</span>
                  <span className="text-white text-right">
                    {pedidoCreado.cliente?.nombre || clienteSeleccionado?.nombre}
                  </span>
                </div>

                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-white/45 font-bold">Modalidad</span>
                  <span className="text-white text-right">{modalidadTexto()}</span>
                </div>

                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-white/45 font-bold">Método</span>
                  <span className="text-white text-right">{metodoPagoTexto()}</span>
                </div>

                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-white/45 font-bold">Estado</span>
                  <span className="text-[#F5A300] font-bold text-right">Pendiente</span>
                </div>

                <div className="border-t border-white/10 pt-2.5 flex justify-between gap-3">
                  <span className="text-white/45 font-bold">Total</span>
                  <span className="text-[#F5A300] font-black font-mono">
                    ₡{parseFloat(pedidoCreado.total).toLocaleString('es-CR')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  onClick={copiarCodigo}
                  className="w-full bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Copy size={17} />
                  {codigoCopiado ? 'Código copiado' : 'Copiar número'}
                </button>

                <button
                  onClick={verSeguimiento}
                  className="w-full bg-gradient-to-r from-[#E4002B] to-[#F5A300] text-white font-black py-3 rounded-xl transition-all hover:scale-[1.01]"
                >
                  Ver seguimiento
                </button>

                <button
                  onClick={limpiarDespuesDePedido}
                  className="w-full text-white/45 hover:text-white text-sm py-2"
                >
                  Cerrar y seguir comprando
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}