import { useState, useEffect } from 'react'
import api from '../api/axios'
import DashboardLayout from '../components/DashboardLayout'
import { Clock, ChefHat, CheckCircle2, PackageCheck } from 'lucide-react'

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

  const cargarPedidos = async () => {
    setCargando(true)
    try {
      const response = await api.get('/pedidos')
      setPedidos(response.data.filter((p) => p.estado_pedido !== 'entregado'))
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarPedidos()
    const intervalo = setInterval(cargarPedidos, 15000)
    return () => clearInterval(intervalo)
  }, [])

  const avanzarEstado = async (pedido) => {
    const siguiente = SIGUIENTE_ESTADO[pedido.estado_pedido]
    if (!siguiente) return

    setActualizando(pedido.id)
    try {
      await api.patch(`/pedidos/${pedido.id}/estado`, { estado_pedido: siguiente })
      cargarPedidos()
    } catch (err) {
      console.error(err)
    } finally {
      setActualizando(null)
    }
  }

  return (
    <DashboardLayout titulo="Pedidos en cocina" dark>
      {cargando ? (
        <p className="text-[#6B6862] text-sm">Cargando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-10 text-center shadow-2xl">
          <p className="text-white/60">No hay pedidos activos en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pedidos.map((pedido) => {
            const Icono = ICONO_ESTADO[pedido.estado_pedido]
            return (
              <div
                key={pedido.id}
                className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
              >
                <div className="h-[3px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-bold font-mono text-lg">{pedido.codigo_tracking}</p>
                      <p className="text-white/50 text-xs mt-0.5">
                        {pedido.modalidad_entrega === 'consumo_local'
                          ? 'Consumo en local'
                          : 'Para retirar'}
                      </p>
                    </div>
                    <span
                      className={`flex items-center gap-1 text-xs font-bold uppercase px-2.5 py-1 rounded-full ${COLOR_ESTADO[pedido.estado_pedido]}`}
                    >
                      <Icono size={12} />
                      {ETIQUETA_ESTADO[pedido.estado_pedido]}
                    </span>
                  </div>

                  <ul className="space-y-1.5 mb-4">
                    {pedido.detalles.map((d) => (
                      <li
                        key={d.id}
                        className="text-sm text-white/80 flex justify-between"
                      >
                        <span>
                          {d.cantidad}x {d.producto.nombre}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between border-t border-white/10 pt-3 mb-3">
                    <span className="text-white/50 text-xs">Total</span>
                    <span className="text-white font-bold font-mono text-lg">
                      ₡{parseFloat(pedido.total).toLocaleString('es-CR')}
                    </span>
                  </div>

                  {SIGUIENTE_ESTADO[pedido.estado_pedido] && (
                    <button
                      onClick={() => avanzarEstado(pedido)}
                      disabled={actualizando === pedido.id}
                      className="w-full bg-[#E4002B] hover:bg-[#F5A300] disabled:opacity-50 text-white text-sm font-black py-3 rounded-xl transition-all shadow-lg"
                    >
                      {actualizando === pedido.id
                        ? 'Actualizando...'
                        : ETIQUETA_ACCION[pedido.estado_pedido]}
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