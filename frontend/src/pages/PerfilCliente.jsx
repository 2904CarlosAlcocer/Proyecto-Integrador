import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChefHat,
  Clock,
  Mail,
  PackageCheck,
  PackageSearch,
  Phone,
  Pizza,
  RefreshCw,
  Save,
  ShoppingBag,
  User,
} from 'lucide-react'

import api from '../api/axios'
import useAuthStore from '../store/authStore'

const INTERVALO_PEDIDO = 3000

const ESTADOS_PEDIDO = [
  {
    valor: 'pendiente',
    etiqueta: 'Pedido recibido',
    descripcion: 'Tu pedido fue recibido.',
    icono: Clock,
  },
  {
    valor: 'confirmado',
    etiqueta: 'Confirmado',
    descripcion: 'La cocina confirmó tu pedido.',
    icono: CheckCircle2,
  },
  {
    valor: 'en_preparacion',
    etiqueta: 'En preparación',
    descripcion: 'Estamos preparando tu pedido.',
    icono: ChefHat,
  },
  {
    valor: 'listo',
    etiqueta: 'Listo',
    descripcion: 'Tu pedido está listo.',
    icono: PackageCheck,
  },
]

const INFORMACION_ESTADO = {
  pendiente: {
    etiqueta: 'Pedido recibido',
    descripcion:
      'Recibimos tu pedido y está esperando confirmación.',
  },

  confirmado: {
    etiqueta: 'Pedido confirmado',
    descripcion:
      'La cocina confirmó tu pedido y pronto empezará a prepararlo.',
  },

  en_preparacion: {
    etiqueta: 'En preparación',
    descripcion:
      'Tu pedido se está preparando en este momento.',
  },

  listo: {
    etiqueta: 'Listo',
    descripcion:
      'Tu pedido está listo para ser retirado o entregado.',
  },
}

function formatearDinero(valor) {
  return `₡${Number(valor || 0).toLocaleString(
    'es-CR',
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }
  )}`
}

function formatearFecha(fecha) {
  if (!fecha) {
    return 'No disponible'
  }

  const fechaConvertida = new Date(fecha)

  if (Number.isNaN(fechaConvertida.getTime())) {
    return 'No disponible'
  }

  return fechaConvertida.toLocaleString(
    'es-CR',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  )
}

function obtenerPrimerError(error) {
  const erroresValidacion =
    error.response?.data?.errors

  if (erroresValidacion) {
    return (
      Object.values(erroresValidacion)
        .flat()
        .find(Boolean) ||
      'Revisa la información ingresada.'
    )
  }

  return (
    error.response?.data?.message ||
    'Ocurrió un error. Intenta nuevamente.'
  )
}

function PerfilCliente() {
  const actualizarUsuario = useAuthStore(
    (state) => state.actualizarUsuario
  )

  const [perfil, setPerfil] = useState(null)

  const [formulario, setFormulario] = useState({
    email: '',
    telefono: '',
  })

  const [pedidoActivo, setPedidoActivo] =
    useState(null)

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] =
    useState(false)

  const [
    actualizandoPedido,
    setActualizandoPedido,
  ] = useState(false)

  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const solicitudPedidoEnCursoRef =
    useRef(false)

  /*
  |--------------------------------------------------------------------------
  | CARGAR PERFIL
  |--------------------------------------------------------------------------
  */

  const cargarPerfil = useCallback(async () => {
    setCargando(true)
    setError('')

    try {
      const response = await api.get(
        '/perfil-cliente'
      )

      const {
        user,
        cliente,
        pedido_activo,
      } = response.data

      setPerfil({
        user,
        cliente,
      })

      setFormulario({
        email:
          cliente?.correo ||
          user?.email ||
          '',

        telefono:
          cliente?.telefono || '',
      })

      setPedidoActivo(
        pedido_activo || null
      )
    } catch (err) {
      console.error(
        'Error al cargar el perfil:',
        err
      )

      setError(obtenerPrimerError(err))
    } finally {
      setCargando(false)
    }
  }, [])

  /*
  |--------------------------------------------------------------------------
  | ACTUALIZAR SOLAMENTE EL PEDIDO
  |--------------------------------------------------------------------------
  */

  const cargarPedidoActivo = useCallback(
    async (mostrarCarga = false) => {
      if (
        solicitudPedidoEnCursoRef.current
      ) {
        return
      }

      solicitudPedidoEnCursoRef.current =
        true

      if (mostrarCarga) {
        setActualizandoPedido(true)
      }

      try {
        const response = await api.get(
          '/perfil-cliente/pedido-activo'
        )

        setPedidoActivo(
          response.data?.pedido_activo ||
            null
        )
      } catch (err) {
        console.error(
          'Error al actualizar el pedido activo:',
          err
        )
      } finally {
        solicitudPedidoEnCursoRef.current =
          false

        if (mostrarCarga) {
          setActualizandoPedido(false)
        }
      }
    },
    []
  )

  /*
  |--------------------------------------------------------------------------
  | CARGA INICIAL
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    cargarPerfil()
  }, [cargarPerfil])

  /*
  |--------------------------------------------------------------------------
  | ACTUALIZACIÓN AUTOMÁTICA CADA 3 SEGUNDOS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const actualizarPedido = () => {
      if (
        document.visibilityState !==
        'visible'
      ) {
        return
      }

      cargarPedidoActivo(false)
    }

    const intervalo = setInterval(
      actualizarPedido,
      INTERVALO_PEDIDO
    )

    return () => {
      clearInterval(intervalo)
    }
  }, [cargarPedidoActivo])

  /*
  |--------------------------------------------------------------------------
  | ACTUALIZAR AL VOLVER A LA PESTAÑA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const actualizarAlVolver = () => {
      if (
        document.visibilityState ===
        'visible'
      ) {
        cargarPedidoActivo(false)
      }
    }

    document.addEventListener(
      'visibilitychange',
      actualizarAlVolver
    )

    return () => {
      document.removeEventListener(
        'visibilitychange',
        actualizarAlVolver
      )
    }
  }, [cargarPedidoActivo])

  /*
  |--------------------------------------------------------------------------
  | FORMULARIO
  |--------------------------------------------------------------------------
  */

  const manejarCambio = (event) => {
    const { name, value } = event.target

    setFormulario((datosActuales) => ({
      ...datosActuales,
      [name]: value,
    }))

    setMensaje('')
    setError('')
  }

  const guardarPerfil = async (event) => {
    event.preventDefault()

    const email = formulario.email
      .trim()
      .toLowerCase()

    const telefono =
      formulario.telefono.trim()

    if (!email) {
      setError(
        'El correo electrónico es obligatorio.'
      )

      return
    }

    setGuardando(true)
    setError('')
    setMensaje('')

    try {
      const response = await api.patch(
        '/perfil-cliente',
        {
          email,
          telefono:
            telefono || null,
        }
      )

      const {
        user,
        cliente,
      } = response.data

      setPerfil({
        user,
        cliente,
      })

      setFormulario({
        email:
          cliente?.correo ||
          user?.email ||
          '',

        telefono:
          cliente?.telefono || '',
      })

      /*
       * Actualiza Zustand y sessionStorage.
       * La Navbar mostrará los datos nuevos
       * sin cerrar la sesión.
       */
      actualizarUsuario(user)

      setMensaje(
        response.data?.message ||
          'Perfil actualizado correctamente.'
      )
    } catch (err) {
      console.error(
        'Error al actualizar el perfil:',
        err
      )

      setError(obtenerPrimerError(err))
    } finally {
      setGuardando(false)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | PANTALLA DE CARGA
  |--------------------------------------------------------------------------
  */

  if (cargando) {
    return (
      <div className="flex min-h-[calc(100dvh-68px)] items-center justify-center bg-[#120C08] px-4 pt-24">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-[#F5A300]" />

          <p className="text-white/60">
            Cargando tu perfil...
          </p>
        </div>
      </div>
    )
  }

  const estadoActual =
    pedidoActivo?.estado_pedido || ''

  const indiceEstadoActual =
    ESTADOS_PEDIDO.findIndex(
      (estado) =>
        estado.valor === estadoActual
    )

  const informacionEstado =
    INFORMACION_ESTADO[estadoActual]

  return (
    <section className="min-h-[100dvh] bg-[#120C08] px-4 pb-16 pt-28 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Encabezado */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#F5A300]/30 bg-[#F5A300]/10 px-4 py-2 text-sm font-bold text-[#F5A300]">
            <User size={17} />
            Área de cliente
          </div>

          <h1 className="text-3xl font-black text-white sm:text-4xl">
            Mi perfil
          </h1>

          <p className="mt-2 max-w-2xl text-white/55">
            Consulta tu información y revisa el
            estado actual de tu pedido.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200"
          >
            <AlertCircle className="mt-0.5 shrink-0" size={20} />

            <p className="text-sm">
              {error}
            </p>
          </div>
        )}

        {mensaje && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200"
          >
            <CheckCircle2 className="mt-0.5 shrink-0" size={20} />

            <p className="text-sm">
              {mensaje}
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Información personal */}
          <div className="h-fit overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-xl">
            <div className="h-1 bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

            <div className="p-6">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5A300] text-black shadow-lg shadow-[#F5A300]/20">
                  <User size={28} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-white/45">
                    Cliente
                  </p>

                  <h2 className="truncate text-xl font-black text-white">
                    {perfil?.cliente?.nombre ||
                      perfil?.user?.name ||
                      'Cliente'}
                  </h2>
                </div>
              </div>

              <form
                onSubmit={guardarPerfil}
                className="space-y-5"
              >
                {/* Nombre */}
                <div>
                  <label
                    htmlFor="nombre"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/60"
                  >
                    Nombre completo
                  </label>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />

                    <input
                      id="nombre"
                      type="text"
                      value={
                        perfil?.cliente?.nombre ||
                        perfil?.user?.name ||
                        ''
                      }
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/25 py-3 pl-10 pr-4 text-white/50 outline-none"
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-white/30">
                    El nombre no puede modificarse desde
                    este apartado.
                  </p>
                </div>

                {/* Correo */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/60"
                  >
                    Correo electrónico
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formulario.email}
                      onChange={manejarCambio}
                      required
                      disabled={guardando}
                      autoComplete="email"
                      placeholder="correo@ejemplo.com"
                      className="w-full rounded-xl border border-white/15 bg-black/25 py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-white/25 focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/15 disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Teléfono */}
                <div>
                  <label
                    htmlFor="telefono"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/60"
                  >
                    Número de teléfono
                  </label>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />

                    <input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      value={formulario.telefono}
                      onChange={manejarCambio}
                      disabled={guardando}
                      autoComplete="tel"
                      inputMode="tel"
                      maxLength={20}
                      placeholder="8888-8888"
                      className="w-full rounded-xl border border-white/15 bg-black/25 py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-white/25 focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/15 disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Fecha de registro */}
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                  <CalendarDays
                    size={18}
                    className="shrink-0 text-[#F5A300]"
                  />

                  <div>
                    <p className="text-xs text-white/40">
                      Cliente desde
                    </p>

                    <p className="text-sm font-semibold text-white/75">
                      {formatearFecha(
                        perfil?.cliente
                          ?.fecha_registro
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={guardando}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E4002B] to-[#F5A300] px-5 py-3.5 font-black text-white shadow-lg shadow-[#E4002B]/20 transition hover:scale-[1.01] hover:shadow-[#E4002B]/35 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {guardando ? (
                    <>
                      <RefreshCw
                        size={18}
                        className="animate-spin"
                      />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Guardar cambios
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Pedido activo */}
          <div className="min-w-0">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <PackageSearch className="text-[#F5A300]" />

                    <h2 className="text-xl font-black text-white">
                      Pedido activo
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-white/45">
                    El estado se revisa automáticamente
                    cada 3 segundos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    cargarPedidoActivo(true)
                  }
                  disabled={actualizandoPedido}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/70 transition hover:border-[#F5A300]/40 hover:text-[#F5A300] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={
                      actualizandoPedido
                        ? 'animate-spin'
                        : ''
                    }
                  />

                  {actualizandoPedido
                    ? 'Actualizando...'
                    : 'Actualizar'}
                </button>
              </div>

              {!pedidoActivo ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <ShoppingBag
                      size={36}
                      className="text-white/30"
                    />
                  </div>

                  <h3 className="text-xl font-black text-white">
                    No tienes pedidos activos
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/45">
                    Cuando realices un pedido podrás ver
                    aquí su estado, productos y total.
                  </p>

                  <Link
                    to="/menu"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E4002B] to-[#F5A300] px-5 py-3 font-black text-white shadow-lg transition hover:scale-105"
                  >
                    <Pizza size={18} />
                    Ver menú
                  </Link>
                </div>
              ) : (
                <div className="p-6">
                  {/* Resumen del pedido */}
                  <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#F5A300]/20 bg-[#F5A300]/[0.07] p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#F5A300]">
                        Código del pedido
                      </p>

                      <p className="mt-1 font-mono text-2xl font-black text-white">
                        #
                        {
                          pedidoActivo.codigo_tracking
                        }
                      </p>

                      <p className="mt-2 text-sm text-white/45">
                        Creado el{' '}
                        {formatearFecha(
                          pedidoActivo.created_at
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#F5A300]/20 bg-black/20 px-4 py-3 sm:text-right">
                      <p className="text-xs uppercase tracking-wider text-white/40">
                        Estado actual
                      </p>

                      <p className="mt-1 font-black text-[#F5A300]">
                        {informacionEstado?.etiqueta ||
                          estadoActual}
                      </p>
                    </div>
                  </div>

                  {/* Barra de estados */}
                  <div className="mb-8">
                    <h3 className="mb-4 font-black text-white">
                      Progreso del pedido
                    </h3>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {ESTADOS_PEDIDO.map(
                        (estado, indice) => {
                          const Icono =
                            estado.icono

                          const completado =
                            indice <=
                            indiceEstadoActual

                          const actual =
                            indice ===
                            indiceEstadoActual

                          return (
                            <div
                              key={estado.valor}
                              className={`
                                rounded-2xl border p-4 transition
                                ${
                                  actual
                                    ? 'border-[#F5A300] bg-[#F5A300]/10 shadow-lg shadow-[#F5A300]/10'
                                    : completado
                                      ? 'border-emerald-500/25 bg-emerald-500/[0.07]'
                                      : 'border-white/10 bg-black/20'
                                }
                              `}
                            >
                              <div
                                className={`
                                  mb-3 flex h-10 w-10 items-center justify-center rounded-xl
                                  ${
                                    actual
                                      ? 'bg-[#F5A300] text-black'
                                      : completado
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : 'bg-white/5 text-white/25'
                                  }
                                `}
                              >
                                <Icono size={20} />
                              </div>

                              <p
                                className={`
                                  text-sm font-black
                                  ${
                                    actual
                                      ? 'text-[#F5A300]'
                                      : completado
                                        ? 'text-emerald-200'
                                        : 'text-white/35'
                                  }
                                `}
                              >
                                {estado.etiqueta}
                              </p>

                              <p className="mt-1 text-xs leading-relaxed text-white/35">
                                {estado.descripcion}
                              </p>
                            </div>
                          )
                        }
                      )}
                    </div>

                    {informacionEstado && (
                      <p className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
                        {
                          informacionEstado.descripcion
                        }
                      </p>
                    )}
                  </div>

                  {/* Detalles generales */}
                  <div className="mb-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-wider text-white/35">
                        Modalidad
                      </p>

                      <p className="mt-1 font-bold text-white">
                        {pedidoActivo.modalidad_entrega ===
                        'consumo_local'
                          ? 'Consumo en el local'
                          : 'Para retirar'}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-wider text-white/35">
                        Total del pedido
                      </p>

                      <p className="mt-1 text-xl font-black text-[#F5A300]">
                        {formatearDinero(
                          pedidoActivo.total
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Productos */}
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 font-black text-white">
                      <Pizza
                        size={19}
                        className="text-[#F5A300]"
                      />
                      Detalle del pedido
                    </h3>

                    <div className="space-y-3">
                      {pedidoActivo.detalles?.length >
                      0 ? (
                        pedidoActivo.detalles.map(
                          (
                            detalle,
                            indice
                          ) => (
                            <article
                              key={
                                detalle.id ||
                                `${pedidoActivo.id}-${indice}`
                              }
                              className="rounded-2xl border border-white/10 bg-black/20 p-4"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-black text-white">
                                    {
                                      detalle
                                        .cantidad
                                    }
                                    x{' '}
                                    {detalle
                                      .producto
                                      ?.nombre ||
                                      'Producto'}
                                  </p>

                                  <p className="mt-1 text-sm text-white/40">
                                    Precio unitario:{' '}
                                    {formatearDinero(
                                      detalle.precio_unitario
                                    )}
                                  </p>
                                </div>

                                <p className="shrink-0 font-black text-[#F5A300]">
                                  {formatearDinero(
                                    detalle.subtotal
                                  )}
                                </p>
                              </div>

                              {detalle.extras && (
                                <div className="mt-3 rounded-xl bg-white/5 px-3 py-2 text-sm text-white/55">
                                  <span className="font-bold text-white/75">
                                    Extras:
                                  </span>{' '}
                                  {detalle.extras}
                                </div>
                              )}

                              {detalle.alergias && (
                                <div className="mt-2 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-3 py-2 text-sm text-red-200">
                                  <span className="font-bold">
                                    Alergias:
                                  </span>{' '}
                                  {detalle.alergias}
                                </div>
                              )}

                              {detalle.observaciones && (
                                <div className="mt-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-white/55">
                                  <span className="font-bold text-white/75">
                                    Observaciones:
                                  </span>{' '}
                                  {
                                    detalle.observaciones
                                  }
                                </div>
                              )}
                            </article>
                          )
                        )
                      ) : (
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center text-sm text-white/40">
                          No se encontraron productos en
                          este pedido.
                        </div>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between rounded-2xl border border-[#F5A300]/25 bg-[#F5A300]/10 p-5">
                      <span className="font-bold text-white">
                        Total
                      </span>

                      <span className="text-2xl font-black text-[#F5A300]">
                        {formatearDinero(
                          pedidoActivo.total
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PerfilCliente