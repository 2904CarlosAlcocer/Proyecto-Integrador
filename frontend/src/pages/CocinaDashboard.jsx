import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import DashboardLayout from '../components/DashboardLayout'
import {
  Clock,
  ChefHat,
  CheckCircle2,
  PackageCheck,
} from 'lucide-react'

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

  /*
    silencioso = false:
    muestra "Cargando pedidos..." durante la primera carga.

    silencioso = true:
    actualiza los pedidos sin ocultar las tarjetas.
  */
  const cargarPedidos = useCallback(async (silencioso = false) => {
    if (!silencioso) {
      setCargando(true)
    }

    try {
      const response = await api.get('/pedidos')

      const listaPedidos = Array.isArray(response.data)
        ? response.data
        : []

      const pedidosActivos = listaPedidos.filter(
        (pedido) => pedido.estado_pedido !== 'entregado'
      )

      setPedidos(pedidosActivos)
      setError('')
    } catch (err) {
      console.error('Error al cargar los pedidos de cocina:', err)

      /*
        Durante una actualización silenciosa no eliminamos
        los pedidos que ya estaban visibles.
      */
      if (!silencioso) {
        setError('No se pudieron cargar los pedidos de cocina.')
      }
    } finally {
      if (!silencioso) {
        setCargando(false)
      }
    }
  }, [])

  // Carga inicial visible
  useEffect(() => {
    cargarPedidos(false)
  }, [cargarPedidos])

  // Actualización automática silenciosa cada 15 segundos
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
      15000
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

            return (
              <div
                key={pedido.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-md transition-all hover:border-[#F5A300]/30"
              >
                <div className="h-[3px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

                <div className="p-5">
                  {/* Código, modalidad y estado */}
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
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
                        ${
                          COLOR_ESTADO[
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
                    {pedido.detalles?.map((detalle) => (
                      <li
                        key={detalle.id}
                        className="flex justify-between gap-3 text-sm text-white/80"
                      >
                        <span>
                          {detalle.cantidad}x{' '}
                          {detalle.producto?.nombre ||
                            'Producto'}
                        </span>
                      </li>
                    ))}
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
                      onClick={() =>
                        avanzarEstado(pedido)
                      }
                      disabled={
                        actualizando !== null
                      }
                      className="
                        w-full rounded-xl
                        bg-[#E4002B]
                        py-3
                        text-sm font-black text-white
                        shadow-lg
                        transition-all
                        hover:bg-[#F5A300]
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