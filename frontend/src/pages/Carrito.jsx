import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  Sparkles,
  Clock,
  CreditCard,
  Shield,
  Truck,
  Smartphone,
  Upload,
  User,
  Copy,
  PackageCheck,
  AlertCircle,
  Clock as ClockIcon,
  Undo2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import fondoPrincipal from '../assets/fondoPrincipal1.png'
import useCarritoStore from '../store/carritoStore'
import useAuthStore from '../store/authStore'
import api from '../api/axios'

export default function Carrito() {
  const navigate = useNavigate()
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    })
  }, [])

  const {
    items,
    eliminarProducto,
    actualizarCantidad,
    limpiarCarrito,
    obtenerTotal,
    obtenerCantidadItems,
  } = useCarritoStore()

  // USUARIO AUTENTICADO EN LA PESTAÑA ACTUAL
  const { user, token } = useAuthStore()

  const [modalidad, setModalidad] = useState(
    'consumo_local'
  )

  const [metodoPago, setMetodoPago] = useState(
    'efectivo'
  )

  const [comprobante, setComprobante] =
    useState(null)

  const [
    clienteSeleccionado,
    setClienteSeleccionado,
  ] = useState(null)

  const [enviando, setEnviando] =
    useState(false)

  const [mensaje, setMensaje] =
    useState(null)

  const [pedidoCreado, setPedidoCreado] =
    useState(null)

  const [codigoCopiado, setCodigoCopiado] =
    useState(false)

  const [cargandoCliente, setCargandoCliente] =
    useState(false)

  // TEMPORIZADOR DE CANCELACIÓN
  const [tiempoRestante, setTiempoRestante] =
    useState(0)

  const [puedeCancelar, setPuedeCancelar] =
    useState(false)

  const [pedidoEnEspera, setPedidoEnEspera] =
    useState(null)

  const [
    mostrarModalEspera,
    setMostrarModalEspera,
  ] = useState(false)

  const total = obtenerTotal
    ? obtenerTotal()
    : 0

  const cantidadItems = obtenerCantidadItems
    ? obtenerCantidadItems()
    : 0

  const formatearPrecio = (monto) => {
    return Number(monto || 0).toLocaleString(
      'es-CR',
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }
    )
  }

  /*
   * CARGAR EL CLIENTE AUTENTICADO
   *
   * Ya no descarga todos los clientes.
   * La ruta /user devuelve directamente
   * el usuario y su relación cliente.
   */
  useEffect(() => {
    let componenteActivo = true

    const cargarClienteAutenticado =
      async () => {
        if (!token || !user) {
          setClienteSeleccionado(null)
          setCargandoCliente(false)
          return
        }

        const rolActual = String(
          user.rol || ''
        )
          .trim()
          .toLowerCase()

        /*
         * Administrador, cocina y caja
         * no pueden comprar desde el carrito.
         */
        if (rolActual !== 'cliente') {
          setClienteSeleccionado(null)
          setCargandoCliente(false)

          setMensaje({
            tipo: 'error',
            texto:
              'Debes iniciar sesión con una cuenta de cliente para realizar un pedido.',
          })

          return
        }

        setCargandoCliente(true)

        try {
          const response =
            await api.get('/user')

          if (!componenteActivo) {
            return
          }

          const cliente =
            response.data?.cliente

          if (cliente) {
            setClienteSeleccionado(cliente)
            setMensaje(null)
          } else {
            setClienteSeleccionado(null)

            setMensaje({
              tipo: 'error',
              texto:
                'Tu cuenta no tiene información de cliente asociada.',
            })
          }
        } catch (err) {
          console.error(
            'Error al cargar la información del cliente:',
            err
          )

          if (!componenteActivo) {
            return
          }

          setClienteSeleccionado(null)

          setMensaje({
            tipo: 'error',
            texto:
              err.response?.data?.message ||
              'No se pudo cargar tu información de cliente.',
          })
        } finally {
          if (componenteActivo) {
            setCargandoCliente(false)
          }
        }
      }

    cargarClienteAutenticado()

    return () => {
      componenteActivo = false
    }
  }, [token, user])

  /*
   * TEMPORIZADOR DE CONFIRMACIÓN
   */
  useEffect(() => {
    if (
      tiempoRestante > 0 &&
      puedeCancelar
    ) {
      const timer = setTimeout(() => {
        setTiempoRestante(
          (tiempoActual) =>
            tiempoActual - 1
        )
      }, 1000)

      return () => {
        clearTimeout(timer)
      }
    }

    if (
      tiempoRestante === 0 &&
      puedeCancelar
    ) {
      confirmarPedidoFinal()
    }
  }, [
    tiempoRestante,
    puedeCancelar,
  ])

  const renderExtrasYObservaciones = (
    item
  ) => {
    const detalles = []

    if (item.extras) {
      detalles.push(
        `➕ Extras: ${item.extras}`
      )
    }

    if (item.observaciones) {
      detalles.push(
        `📝 ${item.observaciones}`
      )
    }

    if (detalles.length === 0) {
      return null
    }

    return (
      <div className="mt-1 space-y-0.5 text-[10px] text-white/50">
        {detalles.map(
          (detalle, indice) => (
            <p
              key={indice}
              className="truncate"
            >
              {detalle}
            </p>
          )
        )}
      </div>
    )
  }

  const tieneExtras = (item) => {
    return Boolean(
      item.extras ||
      item.observaciones
    )
  }

  /*
   * ESTADO DE AUTENTICACIÓN
   *
   * Se obtiene desde Zustand. Zustand ya
   * recupera los datos de sessionStorage.
   */
  const estaAutenticado = () => {
    return Boolean(user && token)
  }

  const rolUsuario = String(
    user?.rol || ''
  )
    .trim()
    .toLowerCase()

  const esClienteAutenticado =
    estaAutenticado() &&
    rolUsuario === 'cliente'

  /*
   * CREAR PEDIDO CON ESPERA
   * DE 10 SEGUNDOS
   */
  const crearPedidoConEspera = () => {
    if (!estaAutenticado()) {
      setMensaje({
        tipo: 'error',
        texto:
          'Debes iniciar sesión para hacer un pedido.',
      })

      setTimeout(() => {
        navigate('/login')
      }, 2000)

      return
    }

    if (!esClienteAutenticado) {
      setMensaje({
        tipo: 'error',
        texto:
          'Debes iniciar sesión con una cuenta de cliente para realizar un pedido.',
      })

      return
    }

    if (items.length === 0) {
      setMensaje({
        tipo: 'error',
        texto:
          'Tu carrito está vacío.',
      })

      return
    }

    if (!clienteSeleccionado) {
      setMensaje({
        tipo: 'error',
        texto:
          'No se encontró tu información de cliente.',
      })

      return
    }

    if (
      metodoPago === 'sinpe' &&
      !comprobante
    ) {
      setMensaje({
        tipo: 'error',
        texto:
          'Debes adjuntar el comprobante SINPE.',
      })

      return
    }

    setMostrarModalEspera(true)
    setTiempoRestante(10)
    setPuedeCancelar(true)
    setMensaje(null)

    setPedidoEnEspera({
      items: [...items],
      cliente: clienteSeleccionado,
      modalidad,
      metodoPago,
      comprobante,
    })
  }

  /*
   * CANCELAR PEDIDO
   */
  const cancelarPedido = () => {
    setPuedeCancelar(false)
    setTiempoRestante(0)
    setMostrarModalEspera(false)
    setPedidoEnEspera(null)

    setMensaje({
      tipo: 'info',
      texto:
        '⏹️ Pedido cancelado. Puedes modificar tu carrito.',
    })
  }

  /*
   * CONFIRMAR PEDIDO FINAL
   */
  const confirmarPedidoFinal =
    async () => {
      if (!pedidoEnEspera) {
        return
      }

      setPuedeCancelar(false)
      setEnviando(true)

      try {
        const formData =
          new FormData()

        formData.append(
          'cliente_id',
          pedidoEnEspera.cliente.id
        )

        formData.append(
          'modalidad_entrega',
          pedidoEnEspera.modalidad
        )

        formData.append(
          'metodo_pago',
          pedidoEnEspera.metodoPago
        )

        const productosPayload =
          pedidoEnEspera.items.map(
            (item) => ({
              producto_id: item.id,
              cantidad: item.cantidad,
              extras:
                item.extras || null,
              observaciones:
                item.observaciones ||
                null,
            })
          )

        formData.append(
          'productos',
          JSON.stringify(
            productosPayload
          )
        )

        if (
          pedidoEnEspera.metodoPago ===
          'sinpe' &&
          pedidoEnEspera.comprobante
        ) {
          formData.append(
            'comprobante',
            pedidoEnEspera.comprobante
          )
        }

        const response =
          await api.post(
            '/pedidos',
            formData,
            {
              headers: {
                'Content-Type':
                  'multipart/form-data',
              },
            }
          )

        setPedidoCreado(
          response.data.pedido
        )

        setCodigoCopiado(false)
        setMostrarModalEspera(false)
        setPedidoEnEspera(null)

        setMensaje({
          tipo: 'exito',
          texto:
            '✅ Pedido creado correctamente.',
        })
      } catch (err) {
        console.error(
          'Error al crear el pedido:',
          err
        )

        setMostrarModalEspera(false)

        setMensaje({
          tipo: 'error',
          texto:
            err.response?.data
              ?.message ||
            'No se pudo crear el pedido.',
        })
      } finally {
        setEnviando(false)
      }
    }

  const handleCantidad = (
    productoId,
    delta
  ) => {
    const item = items.find(
      (producto) =>
        producto.id === productoId
    )

    if (!item) {
      return
    }

    const nuevaCantidad =
      item.cantidad + delta

    if (nuevaCantidad <= 0) {
      eliminarProducto(productoId)
      return
    }

    actualizarCantidad(
      productoId,
      nuevaCantidad
    )
  }

  const metodoPagoTexto = () => {
    if (metodoPago === 'sinpe') {
      return 'SINPE Móvil'
    }

    if (metodoPago === 'tarjeta') {
      return 'Tarjeta'
    }

    return 'Efectivo'
  }

  const modalidadTexto = () => {
    if (modalidad === 'retiro') {
      return 'Para retirar'
    }

    return 'Consumo en local'
  }

  const copiarCodigo = async () => {
    if (
      !pedidoCreado?.codigo_tracking
    ) {
      return
    }

    try {
      await navigator.clipboard.writeText(
        pedidoCreado.codigo_tracking
      )

      setCodigoCopiado(true)

      setTimeout(() => {
        setCodigoCopiado(false)
      }, 2000)
    } catch (err) {
      console.error(
        'No se pudo copiar el código:',
        err
      )
    }
  }

  const limpiarDespuesDePedido =
    () => {
      limpiarCarrito()
      setComprobante(null)
      setMetodoPago('efectivo')
      setModalidad('consumo_local')
      setMensaje(null)
      setPedidoCreado(null)
    }

  const verSeguimiento = () => {
    const codigo =
      pedidoCreado?.codigo_tracking

    limpiarDespuesDePedido()

    navigate('/estado-pedido', {
      state: {
        codigo,
      },
    })
  }

  const autenticado =
    estaAutenticado()

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#120C08] text-white">
      <section
        className="relative flex min-h-screen items-start overflow-hidden bg-cover bg-center px-3 py-10 pt-20 sm:px-4 sm:py-12 sm:pt-24 lg:px-6 lg:py-16 lg:pt-28"
        style={{
          backgroundImage:
            `url(${fondoPrincipal})`,
          backgroundAttachment:
            'fixed',
        }}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/85 via-black/80 to-[#120C08]/95" />

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-[#E4002B]/40 bg-[#E4002B]/20 px-4 py-2 backdrop-blur-sm">
              <ShoppingCart className="h-4 w-4 text-[#F5A300]" />

              <span className="text-sm font-semibold text-[#F5A300]">
                Tu pedido
              </span>
            </div>

            <h1 className="text-4xl font-black leading-tight lg:text-6xl">
              <span className="text-white">
                Tu
              </span>

              <span className="block bg-gradient-to-r from-[#F5A300] via-[#E4002B] to-[#F5A300] bg-clip-text text-transparent">
                Carrito
              </span>
            </h1>

            <p className="mt-3 font-semibold text-white">
              Revisa tu pedido y confirma
              la orden.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* LISTA DE PRODUCTOS */}
            <div className="lg:col-span-2">
              {items.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/50 p-12 text-center backdrop-blur-sm">
                  <h3 className="mb-2 text-2xl font-bold text-white">
                    Tu carrito está vacío
                  </h3>

                  <p className="mb-6 text-white/60">
                    Parece que aún no has
                    agregado nada a tu pedido.
                  </p>

                  <Link
                    to="/menu"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E4002B] to-[#F5A300] px-6 py-3 font-bold"
                  >
                    Explorar menú
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">
                      Tu pedido (
                      {cantidadItems}{' '}
                      productos)
                    </h3>

                    <button
                      type="button"
                      onClick={limpiarCarrito}
                      className="flex items-center gap-1 text-sm text-white/40 hover:text-[#E4002B]"
                    >
                      <Trash2 size={14} />
                      Vaciar carrito
                    </button>
                  </div>

                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/50 p-4 backdrop-blur-sm"
                    >
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-black/50">
                        {item.imagen_url ? (
                          <img
                            src={
                              item.imagen_url
                            }
                            alt={
                              item.nombre
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-3xl text-white/20">
                            {item.nombre
                              .toLowerCase()
                              .includes(
                                'pizza'
                              )
                              ? '🍕'
                              : '🍽️'}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white">
                            {item.nombre}
                          </h4>

                          {tieneExtras(
                            item
                          ) && (
                              <span className="rounded-full bg-[#F5A300]/20 px-1.5 py-0.5 text-[8px] text-[#F5A300]">
                                Personalizado
                              </span>
                            )}
                        </div>

                        <p className="font-mono text-sm font-bold text-[#F5A300]">
                          ₡
                          {formatearPrecio(
                            item.precio
                          )}{' '}
                          c/u
                        </p>

                        {renderExtrasYObservaciones(
                          item
                        )}
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-3">
                        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5">
                          <button
                            type="button"
                            onClick={() =>
                              handleCantidad(
                                item.id,
                                -1
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center text-white/60 hover:text-[#F5A300]"
                          >
                            <Minus
                              size={14}
                            />
                          </button>

                          <span className="w-6 text-center text-sm font-bold text-white">
                            {item.cantidad}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleCantidad(
                                item.id,
                                1
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center text-white/60 hover:text-[#F5A300]"
                          >
                            <Plus
                              size={14}
                            />
                          </button>
                        </div>

                        <div className="min-w-[80px] text-right">
                          <p className="font-mono text-sm font-bold text-white">
                            ₡
                            {formatearPrecio(
                              item.precio *
                              item.cantidad
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            eliminarProducto(
                              item.id
                            )
                          }
                          className="text-white/30 hover:text-[#E4002B]"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RESUMEN DEL PEDIDO */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-white/10 bg-black/50 p-6 backdrop-blur-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                  <Sparkles
                    size={18}
                    className="text-[#F5A300]"
                  />

                  Resumen del pedido
                </h3>

                {items.length > 0 ? (
                  <>
                    {/* CLIENTE AUTOMÁTICO */}
                    <div className="mb-4">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/60">
                        Cliente
                      </label>

                      {!autenticado ? (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
                          <p className="text-sm font-medium text-red-400">
                            Debes iniciar
                            sesión para hacer
                            un pedido
                          </p>

                          <Link
                            to="/login"
                            className="mt-2 inline-block rounded-lg bg-gradient-to-r from-[#E80000] to-[#FF6B00] px-4 py-2 text-sm font-bold text-white"
                          >
                            Iniciar sesión
                          </Link>
                        </div>
                      ) : !esClienteAutenticado ? (
                        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-center">
                          <p className="text-sm text-yellow-400">
                            Debes usar una
                            cuenta de cliente.
                          </p>
                        </div>
                      ) : cargandoCliente ? (
                        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-center">
                          <p className="text-sm text-yellow-400">
                            Cargando tu
                            información...
                          </p>
                        </div>
                      ) : clienteSeleccionado ? (
                        <div className="rounded-xl border border-[#F5A300]/30 bg-[#F5A300]/10 p-3">
                          <div className="flex items-center gap-2">
                            <User
                              size={16}
                              className="text-[#F5A300]"
                            />

                            <div>
                              <p className="text-sm font-semibold text-white">
                                {
                                  clienteSeleccionado.nombre
                                }
                              </p>

                              <p className="text-xs text-white/40">
                                {clienteSeleccionado.telefono ||
                                  'Sin teléfono'}{' '}
                                •{' '}
                                {
                                  clienteSeleccionado.correo
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-center">
                          <p className="text-sm text-yellow-400">
                            No se encontró tu
                            información
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ITEMS DEL RESUMEN */}
                    <div className="mb-4 max-h-[160px] space-y-2 overflow-y-auto pr-1">
                      {items.map(
                        (item) => (
                          <div
                            key={
                              item.id
                            }
                            className="flex justify-between text-sm"
                          >
                            <span className="mr-2 truncate text-white/70">
                              {
                                item.cantidad
                              }
                              x{' '}
                              {
                                item.nombre
                              }

                              {tieneExtras(
                                item
                              ) &&
                                ' ✨'}
                            </span>

                            <span className="font-medium text-white">
                              ₡
                              {formatearPrecio(
                                item.precio *
                                item.cantidad
                              )}
                            </span>
                          </div>
                        )
                      )}
                    </div>

                    {/* TOTALES */}
                    <div className="mb-4 border-t border-white/10 pt-4">
                      <div className="mb-2 flex justify-between">
                        <span className="text-sm text-white/60">
                          Subtotal
                        </span>

                        <span className="text-sm font-medium text-white">
                          ₡
                          {formatearPrecio(
                            total
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-white/60">
                          Envío
                        </span>

                        <span className="text-sm font-medium text-[#F5A300]">
                          Gratis
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 border-t border-white/10 pt-4">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-white">
                          Total
                        </span>

                        <span className="font-mono text-xl font-black text-[#F5A300]">
                          ₡
                          {formatearPrecio(
                            total
                          )}
                        </span>
                      </div>
                    </div>

                    {/* MODALIDAD */}
                    <div className="mb-4">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/60">
                        Modalidad de entrega
                      </label>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setModalidad(
                              'consumo_local'
                            )
                          }
                          className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-bold ${modalidad ===
                              'consumo_local'
                              ? 'border-[#F5A300] bg-[#F5A300]/10 text-[#F5A300]'
                              : 'border-white/10 text-white/60 hover:text-white'
                            }`}
                        >
                          <Clock
                            size={14}
                          />
                          Local
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setModalidad(
                              'retiro'
                            )
                          }
                          className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-bold ${modalidad ===
                              'retiro'
                              ? 'border-[#F5A300] bg-[#F5A300]/10 text-[#F5A300]'
                              : 'border-white/10 text-white/60 hover:text-white'
                            }`}
                        >
                          <Truck
                            size={14}
                          />
                          Retiro
                        </button>
                      </div>
                    </div>

                    {/* MÉTODO DE PAGO */}
                    <div className="mb-4">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/60">
                        Método de pago
                      </label>

                      <div className="grid grid-cols-1 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMetodoPago(
                              'efectivo'
                            )

                            setComprobante(
                              null
                            )
                          }}
                          className={`flex items-center justify-between rounded-xl border p-3 text-sm font-bold ${metodoPago ===
                              'efectivo'
                              ? 'border-[#F5A300] bg-[#F5A300]/10 text-[#F5A300]'
                              : 'border-white/10 text-white/60 hover:text-white'
                            }`}
                        >
                          <span>
                            Efectivo
                          </span>

                          <CreditCard
                            size={16}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMetodoPago(
                              'tarjeta'
                            )

                            setComprobante(
                              null
                            )
                          }}
                          className={`flex items-center justify-between rounded-xl border p-3 text-sm font-bold ${metodoPago ===
                              'tarjeta'
                              ? 'border-[#F5A300] bg-[#F5A300]/10 text-[#F5A300]'
                              : 'border-white/10 text-white/60 hover:text-white'
                            }`}
                        >
                          <span>
                            Tarjeta
                          </span>

                          <CreditCard
                            size={16}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setMetodoPago(
                              'sinpe'
                            )
                          }
                          className={`flex items-center justify-between rounded-xl border p-3 text-sm font-bold ${metodoPago ===
                              'sinpe'
                              ? 'border-[#F5A300] bg-[#F5A300]/10 text-[#F5A300]'
                              : 'border-white/10 text-white/60 hover:text-white'
                            }`}
                        >
                          <span>
                            SINPE Móvil
                          </span>

                          <Smartphone
                            size={16}
                          />
                        </button>
                      </div>
                    </div>

                    {/* COMPROBANTE SINPE */}
                    {metodoPago ===
                      'sinpe' && (
                        <div className="mb-4 rounded-xl border border-[#F5A300]/30 bg-white/5 p-4">
                          <p className="mb-1 text-sm font-bold text-[#F5A300]">
                            Pago por SINPE
                            Móvil
                          </p>

                          <p className="mb-3 text-sm text-white/70">
                            Realiza el pago al
                            número:
                          </p>

                          <p className="mb-3 font-mono text-lg font-black text-white">
                            8888-8888
                          </p>

                          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/60">
                            Adjuntar comprobante
                          </label>

                          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 p-3 text-sm text-white/70 transition-colors hover:border-[#F5A300]">
                            <Upload
                              size={16}
                            />

                            {comprobante
                              ? comprobante.name
                              : 'Seleccionar archivo'}

                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.gif"
                              className="hidden"
                              onChange={(
                                event
                              ) =>
                                setComprobante(
                                  event
                                    .target
                                    .files?.[0] ||
                                  null
                                )
                              }
                            />
                          </label>
                        </div>
                      )}

                    {/* MENSAJES */}
                    {mensaje && (
                      <div
                        className={`mb-3 rounded-lg border px-3 py-2 text-sm font-medium ${mensaje.tipo ===
                            'exito'
                            ? 'border-[#C9E0B0] bg-[#EAF3DE] text-[#3B6D11]'
                            : mensaje.tipo ===
                              'info'
                              ? 'border-[#B0C4DE] bg-[#E8EEF7] text-[#3D5B8C]'
                              : 'border-[#F09595] bg-[#FCEBEB] text-[#A32D2D]'
                          }`}
                      >
                        {mensaje.texto}
                      </div>
                    )}

                    {/* BOTÓN CONFIRMAR */}
                    <button
                      type="button"
                      onClick={
                        crearPedidoConEspera
                      }
                      disabled={
                        enviando ||
                        !esClienteAutenticado ||
                        !clienteSeleccionado ||
                        (metodoPago ===
                          'sinpe' &&
                          !comprobante) ||
                        items.length === 0
                      }
                      className="flex w-full transform items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E4002B] to-[#F5A300] py-3 font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#E4002B]/50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {enviando
                        ? '⏳ Enviando...'
                        : !autenticado
                          ? 'Inicia sesión para pedir'
                          : !esClienteAutenticado
                            ? 'Usa una cuenta de cliente'
                            : (
                              <>
                                <ClockIcon
                                  size={
                                    18
                                  }
                                />
                                Confirmar
                                pedido
                                (10s)
                              </>
                            )}
                    </button>

                    {!autenticado && (
                      <p className="mt-2 text-center text-xs text-[#E4002B]">
                        Debes iniciar sesión
                        para hacer un pedido.
                      </p>
                    )}

                    {autenticado &&
                      !esClienteAutenticado && (
                        <p className="mt-2 text-center text-xs text-yellow-400">
                          Debes usar una
                          cuenta con rol
                          cliente para
                          realizar pedidos.
                        </p>
                      )}

                    {esClienteAutenticado &&
                      !clienteSeleccionado &&
                      !cargandoCliente && (
                        <p className="mt-2 text-center text-xs text-yellow-400">
                          No se encontró tu
                          información de
                          cliente.
                        </p>
                      )}

                    {metodoPago ===
                      'sinpe' &&
                      !comprobante &&
                      esClienteAutenticado && (
                        <p className="mt-2 text-center text-xs text-[#E4002B]">
                          Debes adjuntar el
                          comprobante SINPE.
                        </p>
                      )}

                    <div className="mt-3 flex items-center justify-center gap-1 text-[10px] text-white/30">
                      <Shield
                        size={12}
                      />

                      <span>
                        Pedido seguro
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-sm text-white/50">
                      No hay productos en
                      tu carrito.
                    </p>

                    <Link
                      to="/menu"
                      className="mt-4 inline-block text-sm text-[#F5A300] hover:underline"
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

      {/* MODAL DE ESPERA */}
      {mostrarModalEspera && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-md">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#F5A300]/30 bg-[#160F0B] shadow-2xl">
            <div className="h-[4px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

            <div className="p-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F5A300]/20">
                  <ClockIcon className="h-10 w-10 animate-pulse text-[#F5A300]" />
                </div>
              </div>

              <h2 className="mb-2 text-2xl font-black text-white">
                ⏳ Confirmando pedido...
              </h2>

              <p className="mb-4 text-sm text-white/60">
                Tienes{' '}

                <span className="text-xl font-bold text-[#F5A300]">
                  {tiempoRestante}
                </span>{' '}

                segundos para cancelar si
                deseas hacer algún cambio.
              </p>

              <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-[#F5A300] to-[#E4002B] transition-all duration-1000"
                  style={{
                    width:
                      `${(tiempoRestante / 10) * 100}%`,
                  }}
                />
              </div>

              <div className="mb-4 flex items-center justify-center gap-2 text-xs text-white/40">
                <AlertCircle
                  size={14}
                />

                <span>
                  El pedido se confirmará
                  automáticamente
                </span>
              </div>

              <button
                type="button"
                onClick={cancelarPedido}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E4002B] py-3 font-bold text-white transition-colors hover:bg-[#A32D2D]"
              >
                <Undo2 size={18} />
                Cancelar pedido
              </button>

              <p className="mt-3 text-[10px] text-white/30">
                Puedes modificar tu
                carrito y volver a
                confirmar
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PEDIDO CREADO */}
      {pedidoCreado && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-[#F5A300]/30 bg-[#160F0B] shadow-2xl">
            <div className="h-[4px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

            <div className="p-5 sm:p-6">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF3DE] shadow-lg">
                  <PackageCheck className="h-8 w-8 text-[#3B6D11]" />
                </div>
              </div>

              <h2 className="mb-2 text-center text-2xl font-black text-white sm:text-3xl">
                ¡Pedido realizado! 🎉
              </h2>

              <p className="mb-5 text-center text-sm text-white/60">
                Guarda este código para
                consultar el estado de tu
                pedido.
              </p>

              <div className="mb-4 rounded-2xl border border-[#F5A300]/40 bg-black/40 p-4 text-center">
                <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-white/45">
                  Tu número de pedido es
                </p>

                <p className="font-mono text-3xl font-black tracking-wide text-[#F5A300] sm:text-4xl">
                  {
                    pedidoCreado.codigo_tracking
                  }
                </p>
              </div>

              <div className="mb-4 space-y-2.5 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="font-bold text-white/45">
                    Cliente
                  </span>

                  <span className="text-right text-white">
                    {pedidoCreado
                      .cliente?.nombre ||
                      clienteSeleccionado
                        ?.nombre}
                  </span>
                </div>

                <div className="flex justify-between gap-3 text-sm">
                  <span className="font-bold text-white/45">
                    Modalidad
                  </span>

                  <span className="text-right text-white">
                    {modalidadTexto()}
                  </span>
                </div>

                <div className="flex justify-between gap-3 text-sm">
                  <span className="font-bold text-white/45">
                    Método
                  </span>

                  <span className="text-right text-white">
                    {metodoPagoTexto()}
                  </span>
                </div>

                <div className="flex justify-between gap-3 text-sm">
                  <span className="font-bold text-white/45">
                    Estado
                  </span>

                  <span className="text-right font-bold text-[#F5A300]">
                    Pendiente
                  </span>
                </div>

                <div className="flex justify-between gap-3 border-t border-white/10 pt-2.5">
                  <span className="font-bold text-white/45">
                    Total
                  </span>

                  <span className="font-mono font-black text-[#F5A300]">
                    ₡
                    {formatearPrecio(
                      pedidoCreado.total
                    )}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={copiarCodigo}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 py-3 font-bold text-white transition-colors hover:bg-white/15"
                >
                  <Copy size={17} />

                  {codigoCopiado
                    ? '✅ Código copiado'
                    : '📋 Copiar número'}
                </button>

                <button
                  type="button"
                  onClick={
                    verSeguimiento
                  }
                  className="w-full rounded-xl bg-gradient-to-r from-[#E4002B] to-[#F5A300] py-3 font-black text-white transition-all hover:scale-[1.01]"
                >
                  📦 Ver seguimiento
                </button>

                <button
                  type="button"
                  onClick={
                    limpiarDespuesDePedido
                  }
                  className="w-full py-2 text-sm text-white/45 hover:text-white"
                >
                  Cerrar y seguir
                  comprando
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}