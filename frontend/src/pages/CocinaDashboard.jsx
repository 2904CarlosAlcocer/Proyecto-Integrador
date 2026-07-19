import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react'
import api from '../api/axios'
import DashboardLayout from '../components/DashboardLayout'
import {
  Clock,
  ChefHat,
  CheckCircle2,
  PackageCheck,
  BellRing,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'

const INTERVALO_ACTUALIZACION = 15000
const DURACION_ALERTA_VISUAL = 12000
const VOLUMEN_ALERTA = 5.2

const SIGUIENTE_ESTADO = {
  pendiente: 'confirmado',
  confirmado: 'en_preparacion',
  en_preparacion: 'listo',
  listo: 'entregado',
}

const ETIQUETA_ESTADO = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_preparacion: 'En preparación',
  listo: 'Listo',
  entregado: 'Entregado',
}

const ETIQUETA_ACCION = {
  pendiente: 'Aceptar pedido',
  confirmado: 'Empezar a preparar',
  en_preparacion: 'Marcar como listo',
  listo: 'Marcar como entregado',
}

const COLOR_ESTADO = {
  pendiente: 'bg-[#FDF1DA] text-[#A9824A]',
  confirmado: 'bg-[#E8EEF7] text-[#3D5B8C]',
  en_preparacion: 'bg-[#FEF1E3] text-[#C97A1E]',
  listo: 'bg-[#EAF3DE] text-[#3B6D11]',
  entregado: 'bg-[#F1EFE8] text-[#9B988F]',
}

const ICONO_ESTADO = {
  pendiente: Clock,
  confirmado: Clock,
  en_preparacion: ChefHat,
  listo: CheckCircle2,
  entregado: PackageCheck,
}

function CocinaDashboard() {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [actualizando, setActualizando] = useState(null)
  const [error, setError] = useState('')
  const [sonidoActivo, setSonidoActivo] = useState(false)
  const [alertaNuevoPedido, setAlertaNuevoPedido] =
    useState(null)
  const [pedidosNuevosIds, setPedidosNuevosIds] =
    useState([])

  const pedidosConocidosRef = useRef(new Set())
  const cargaInicialCompletadaRef = useRef(false)
  const solicitudEnCursoRef = useRef(false)
  const sonidoActivoRef = useRef(false)
  const audioContextRef = useRef(null)
  const alertaTimeoutRef = useRef(null)
  const tituloTimeoutRef = useRef(null)
  const tituloOriginalRef = useRef('')

  const obtenerAudioContext = useCallback(() => {
    if (typeof window === 'undefined') {
      return null
    }

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext

    if (!AudioContextClass) {
      return null
    }

    if (
      !audioContextRef.current ||
      audioContextRef.current.state === 'closed'
    ) {
      audioContextRef.current = new AudioContextClass()
    }

    return audioContextRef.current
  }, [])

  /*
    Genera el sonido directamente con Web Audio API.
    No necesitas guardar ningún archivo .mp3 o .wav.
  */
  const reproducirAlerta = useCallback(
    (contextoPreparado = null) => {
      if (
        !sonidoActivoRef.current &&
        !contextoPreparado
      ) {
        return
      }

      const contexto =
        contextoPreparado || obtenerAudioContext()

      if (!contexto || contexto.state !== 'running') {
        return
      }

      const inicio = contexto.currentTime
      const notas = [880, 1174.66, 880]

      notas.forEach((frecuencia, indice) => {
        const oscilador = contexto.createOscillator()
        const ganancia = contexto.createGain()
        const comienzo = inicio + indice * 0.22
        const final = comienzo + 0.17

        oscilador.type = 'square'
        oscilador.frequency.setValueAtTime(
          frecuencia,
          comienzo
        )

        ganancia.gain.setValueAtTime(0.0001, comienzo)
        ganancia.gain.exponentialRampToValueAtTime(
          VOLUMEN_ALERTA,
          comienzo + 0.025
        )
        ganancia.gain.exponentialRampToValueAtTime(
          0.0001,
          final
        )

        oscilador.connect(ganancia)
        ganancia.connect(contexto.destination)

        oscilador.start(comienzo)
        oscilador.stop(final)
      })
    },
    [obtenerAudioContext]
  )

  const cambiarEstadoSonido = async () => {
    if (sonidoActivoRef.current) {
      sonidoActivoRef.current = false
      setSonidoActivo(false)

      if (
        audioContextRef.current &&
        audioContextRef.current.state !== 'closed'
      ) {
        await audioContextRef.current.close()
        audioContextRef.current = null
      }

      return
    }

    const contexto = obtenerAudioContext()

    if (!contexto) {
      setError(
        'Este navegador no permite reproducir las alertas de sonido.'
      )
      return
    }

    try {
      if (contexto.state === 'suspended') {
        await contexto.resume()
      }

      sonidoActivoRef.current = true
      setSonidoActivo(true)
      setError('')

      // Sonido corto de confirmación al activarlo.
      reproducirAlerta(contexto)
    } catch (err) {
      console.error(
        'No se pudo activar el sonido de cocina:',
        err
      )

      sonidoActivoRef.current = false
      setSonidoActivo(false)
      setError(
        'No se pudo activar el sonido. Revisa los permisos del navegador.'
      )
    }
  }

  const ocultarAlertaNuevoPedido = useCallback(() => {
    setAlertaNuevoPedido(null)
    setPedidosNuevosIds([])

    if (alertaTimeoutRef.current) {
      clearTimeout(alertaTimeoutRef.current)
      alertaTimeoutRef.current = null
    }

    if (tituloTimeoutRef.current) {
      clearTimeout(tituloTimeoutRef.current)
      tituloTimeoutRef.current = null
    }

    if (tituloOriginalRef.current) {
      document.title = tituloOriginalRef.current
    }
  }, [])

  const mostrarAlertaNuevosPedidos = useCallback(
    (nuevosPedidos) => {
      const idsNuevos = nuevosPedidos.map((pedido) =>
        String(pedido.id)
      )

      const codigos = nuevosPedidos.map(
        (pedido) =>
          pedido.codigo_tracking || `Pedido ${pedido.id}`
      )

      setPedidosNuevosIds(idsNuevos)
      setAlertaNuevoPedido({
        cantidad: nuevosPedidos.length,
        codigos,
      })

      reproducirAlerta()

      if (!tituloOriginalRef.current) {
        tituloOriginalRef.current = document.title
      }

      document.title =
        nuevosPedidos.length === 1
          ? '🔔 ¡Nuevo pedido en cocina!'
          : `🔔 ¡${nuevosPedidos.length} pedidos nuevos!`

      if (alertaTimeoutRef.current) {
        clearTimeout(alertaTimeoutRef.current)
      }

      if (tituloTimeoutRef.current) {
        clearTimeout(tituloTimeoutRef.current)
      }

      alertaTimeoutRef.current = setTimeout(() => {
        setAlertaNuevoPedido(null)
        setPedidosNuevosIds([])
        alertaTimeoutRef.current = null
      }, DURACION_ALERTA_VISUAL)

      tituloTimeoutRef.current = setTimeout(() => {
        if (tituloOriginalRef.current) {
          document.title = tituloOriginalRef.current
        }

        tituloTimeoutRef.current = null
      }, DURACION_ALERTA_VISUAL)
    },
    [reproducirAlerta]
  )

  /*
    silencioso = false:
    muestra "Cargando pedidos..." durante la primera carga.

    silencioso = true:
    actualiza los pedidos sin ocultar las tarjetas.
  */
  const cargarPedidos = useCallback(
    async (silencioso = false) => {
      if (solicitudEnCursoRef.current) {
        return
      }

      solicitudEnCursoRef.current = true

      if (!silencioso) {
        setCargando(true)
      }

      try {
        const response = await api.get('/pedidos')

        const listaPedidos = Array.isArray(response.data)
          ? response.data
          : []

        const pedidosActivos = listaPedidos.filter(
          (pedido) =>
            pedido.estado_pedido !== 'entregado'
        )

        /*
          En la primera carga solo registramos los pedidos
          existentes. No mostramos alertas para pedidos viejos.
        */
        if (!cargaInicialCompletadaRef.current) {
          pedidosActivos.forEach((pedido) => {
            pedidosConocidosRef.current.add(
              String(pedido.id)
            )
          })

          cargaInicialCompletadaRef.current = true
        } else {
          const nuevosPedidos = pedidosActivos.filter(
            (pedido) =>
              !pedidosConocidosRef.current.has(
                String(pedido.id)
              )
          )

          pedidosActivos.forEach((pedido) => {
            pedidosConocidosRef.current.add(
              String(pedido.id)
            )
          })

          if (nuevosPedidos.length > 0) {
            mostrarAlertaNuevosPedidos(nuevosPedidos)
          }
        }

        setPedidos(pedidosActivos)
        setError('')
      } catch (err) {
        console.error(
          'Error al cargar los pedidos de cocina:',
          err
        )

        /*
          Durante una actualización silenciosa no eliminamos
          los pedidos que ya estaban visibles.
        */
        if (!silencioso) {
          setError(
            'No se pudieron cargar los pedidos de cocina.'
          )
        }
      } finally {
        solicitudEnCursoRef.current = false

        if (!silencioso) {
          setCargando(false)
        }
      }
    },
    [mostrarAlertaNuevosPedidos]
  )

  // Guardamos el título original y limpiamos recursos al salir.
  useEffect(() => {
    tituloOriginalRef.current = document.title

    return () => {
      if (alertaTimeoutRef.current) {
        clearTimeout(alertaTimeoutRef.current)
      }

      if (tituloTimeoutRef.current) {
        clearTimeout(tituloTimeoutRef.current)
      }

      if (tituloOriginalRef.current) {
        document.title = tituloOriginalRef.current
      }

      if (
        audioContextRef.current &&
        audioContextRef.current.state !== 'closed'
      ) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Carga inicial visible.
  useEffect(() => {
    cargarPedidos(false)
  }, [cargarPedidos])

  // Actualización automática silenciosa cada 15 segundos.
  useEffect(() => {
    const actualizarSilenciosamente = () => {
      /*
        No hace solicitudes mientras la pestaña
        está minimizada o no está visible.
      */
      if (document.visibilityState !== 'visible') {
        return
      }

      cargarPedidos(true)
    }

    const intervalo = setInterval(
      actualizarSilenciosamente,
      INTERVALO_ACTUALIZACION
    )

    return () => clearInterval(intervalo)
  }, [cargarPedidos])

  /*
    Cuando el usuario vuelve a la pestaña,
    se actualizan inmediatamente los pedidos.
  */
  useEffect(() => {
    const actualizarAlVolver = () => {
      if (document.visibilityState === 'visible') {
        cargarPedidos(true)
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
  }, [cargarPedidos])

  const avanzarEstado = async (pedido) => {
    const siguienteEstado =
      SIGUIENTE_ESTADO[pedido.estado_pedido]

    if (!siguienteEstado || actualizando !== null) {
      return
    }

    setActualizando(pedido.id)

    try {
      await api.patch(
        `/pedidos/${pedido.id}/estado`,
        {
          estado_pedido: siguienteEstado,
        }
      )

      setPedidosNuevosIds((idsActuales) =>
        idsActuales.filter(
          (id) => id !== String(pedido.id)
        )
      )

      /*
        Actualización inmediata y silenciosa.
        No aparecerá nuevamente "Cargando pedidos...".
      */
      await cargarPedidos(true)
    } catch (err) {
      console.error(
        'Error al actualizar el estado del pedido:',
        err
      )

      setError(
        'No se pudo actualizar el estado del pedido.'
      )
    } finally {
      setActualizando(null)
    }
  }

  return (
    <DashboardLayout
      titulo="Pedidos en cocina"
      dark
    >
      {/* Alerta flotante para pedidos nuevos */}
      {alertaNuevoPedido && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-2xl border border-[#F5A300]/60 bg-[#17120c]/95 shadow-[0_20px_70px_rgba(245,163,0,0.35)] backdrop-blur-xl"
        >
          <div className="h-1 bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

          <div className="flex items-start gap-3 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F5A300] text-black shadow-lg shadow-[#F5A300]/30">
              <BellRing className="h-6 w-6 animate-bounce" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-black text-white">
                {alertaNuevoPedido.cantidad === 1
                  ? '¡Nuevo pedido!'
                  : `¡${alertaNuevoPedido.cantidad} pedidos nuevos!`}
              </p>

              <p className="mt-1 text-sm text-white/65">
                {alertaNuevoPedido.codigos
                  .map((codigo) => `#${codigo}`)
                  .join(', ')}
              </p>

              {!sonidoActivo && (
                <p className="mt-2 text-xs text-[#F5A300]">
                  Activa el sonido para escuchar las próximas
                  alertas.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={ocultarAlertaNuevoPedido}
              className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
              aria-label="Cerrar alerta"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Control de actualización y sonido */}
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">
            Alertas de pedidos nuevos
          </p>

          <p className="mt-0.5 text-xs text-white/45">
            La cocina se actualiza automáticamente cada 15
            segundos.
          </p>
        </div>

        <button
          type="button"
          onClick={cambiarEstadoSonido}
          className={`
            inline-flex items-center justify-center gap-2
            rounded-xl border px-4 py-2.5
            text-sm font-bold transition-all
            ${sonidoActivo
              ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25'
              : 'border-[#F5A300]/30 bg-[#F5A300]/10 text-[#F5A300] hover:bg-[#F5A300]/20'
            }
          `}
        >
          {sonidoActivo ? (
            <Volume2 size={18} />
          ) : (
            <VolumeX size={18} />
          )}

          {sonidoActivo
            ? 'Sonido activado'
            : 'Activar sonido'}
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {cargando ? (
        <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-center backdrop-blur-md">
          <p className="text-sm text-white/60">
            Cargando pedidos...
          </p>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/10 p-10 text-center shadow-2xl backdrop-blur-md">
          <ChefHat className="mx-auto mb-3 h-10 w-10 text-[#F5A300]/70" />

          <p className="text-white/60">
            No hay pedidos activos en este momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pedidos.map((pedido) => {
            const Icono =
              ICONO_ESTADO[pedido.estado_pedido] || Clock

            const estaActualizando =
              actualizando === pedido.id

            const esPedidoNuevo = pedidosNuevosIds.includes(
              String(pedido.id)
            )

            return (
              <div
                key={pedido.id}
                className={`
                  relative overflow-hidden rounded-2xl
                  bg-white/10 shadow-2xl backdrop-blur-md
                  transition-all duration-500
                  ${esPedidoNuevo
                    ? 'scale-[1.02] border-2 border-[#F5A300] ring-4 ring-[#F5A300]/20'
                    : 'border border-white/10 hover:border-[#F5A300]/30'
                  }
                `}
              >
                <div className="h-[3px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

                <div className="p-5">
                  {/* Código, modalidad y estado */}
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      {esPedidoNuevo && (
                        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#F5A300] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-black shadow-lg shadow-[#F5A300]/30">
                          <BellRing size={12} />
                          Nuevo
                        </div>
                      )}

                      <p className="font-mono text-lg font-bold text-white">
                        #{pedido.codigo_tracking}
                      </p>

                      <p className="mt-0.5 text-xs text-white/50">
                        {pedido.modalidad_entrega ===
                          'consumo_local'
                          ? 'Consumo en local'
                          : 'Para retirar'}
                      </p>

                      {pedido.cliente && (
                        <p className="mt-1 text-xs text-white/40">
                          {pedido.cliente.nombre ||
                            pedido.cliente.name}
                        </p>
                      )}
                    </div>

                    <span
                      className={`
                        flex shrink-0 items-center gap-1
                        rounded-full px-2.5 py-1
                        text-xs font-bold uppercase
                        ${COLOR_ESTADO[
                        pedido.estado_pedido
                        ] ||
                        'bg-white/10 text-white/60'
                        }
                      `}
                    >
                      <Icono size={12} />

                      {ETIQUETA_ESTADO[
                        pedido.estado_pedido
                      ] || pedido.estado_pedido}
                    </span>
                  </div>

                  {/* Productos */}
                  <ul className="mb-4 space-y-1.5 rounded-lg bg-black/25 p-3">
                    {pedido.detalles?.map(
                      (detalle, indice) => (
                        <li
                          key={
                            detalle.id ||
                            `${pedido.id}-${indice}`
                          }
                          className="flex justify-between gap-3 text-sm text-white/80"
                        >
                          <span>
                            {detalle.cantidad}x{' '}
                            {detalle.producto?.nombre ||
                              'Producto'}
                          </span>
                        </li>
                      )
                    )}
                  </ul>

                  {/* Total */}
                  <div className="mb-3 flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-xs text-white/50">
                      Total
                    </span>

                    <span className="font-mono text-lg font-bold text-white">
                      ₡
                      {Number(
                        pedido.total || 0
                      ).toLocaleString('es-CR')}
                    </span>
                  </div>

                  {/* Botón para avanzar el pedido */}
                  {SIGUIENTE_ESTADO[
                    pedido.estado_pedido
                  ] && (
                      <button
                        type="button"
                        onClick={() => avanzarEstado(pedido)}
                        disabled={actualizando !== null}
                        className="
                        w-full rounded-xl
                        bg-[#E4002B]
                        py-3
                        text-sm font-black text-white
                        shadow-lg
                        transition-all
                        hover:bg-[#F5A300]
                        hover:text-black
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                      >
                        {estaActualizando
                          ? 'Actualizando...'
                          : ETIQUETA_ACCION[
                          pedido.estado_pedido
                          ]}
                      </button>
                    )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}

export default CocinaDashboard