import { useState, useEffect } from 'react'
import api from '../api/axios'
import DashboardLayout from '../components/DashboardLayout'
import {
  Eye, EyeOff, Plus, X, Clock, CheckCircle2,
  Smartphone, DollarSign, CreditCard, User, Search
} from 'lucide-react'

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'cocina', label: 'Cocina' },
  { value: 'caja', label: 'Caja' },
]

const ETIQUETA_ESTADO = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_preparacion: 'En preparación',
  listo: 'Listo',
  entregado: 'Entregado',
}

const COLOR_ESTADO = {
  pendiente: 'bg-[#FDF1DA] text-[#A9824A]',
  confirmado: 'bg-[#E8EEF7] text-[#3D5B8C]',
  en_preparacion: 'bg-[#FEF1E3] text-[#C97A1E]',
  listo: 'bg-[#EAF3DE] text-[#3B6D11]',
  entregado: 'bg-[#F1EFE8] text-[#9B988F]',
}

function AdminDashboard() {
  const [usuarios, setUsuarios] = useState([])
  const [cargandoLista, setCargandoLista] = useState(true)
  const [errorLista, setErrorLista] = useState('')

  const [pedidos, setPedidos] = useState([])
  const [cargandoPedidos, setCargandoPedidos] = useState(true)
  const [vistaOrdenes, setVistaOrdenes] = useState('activas') // 'activas' o 'entregadas'

  const [mostrarModal, setMostrarModal] = useState(false)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [rol, setRol] = useState('cocina')
  const [errorForm, setErrorForm] = useState('')
  const [guardando, setGuardando] = useState(false)

  // ========== COMPROBANTES SINPE ==========
  const [comprobantes, setComprobantes] = useState([])
  const [cargandoComprobantes, setCargandoComprobantes] = useState(false)
  const [filtroComprobantes, setFiltroComprobantes] = useState('todos') // 'todos', 'pendiente', 'verificado', 'rechazado'

  const cargarUsuarios = async () => {
    setCargandoLista(true)
    setErrorLista('')

    try {
      const response = await api.get('/users')
      setUsuarios(response.data)
    } catch (err) {
      setErrorLista('No se pudo cargar la lista de personal.')
    } finally {
      setCargandoLista(false)
    }
  }

  // Cargar pedidos.
  // silencioso = false: muestra "Cargando..." durante la primera carga.
  // silencioso = true: actualiza los datos sin cambiar la pantalla.
  const cargarPedidos = async (silencioso = false) => {
    if (!silencioso) {
      setCargandoPedidos(true)
    }

    try {
      const response = await api.get('/pedidos')
      setPedidos(response.data)
    } catch (err) {
      console.error('Error al actualizar pedidos:', err)
    } finally {
      if (!silencioso) {
        setCargandoPedidos(false)
      }
    }
  }

  // Cargar comprobantes silenciosamente o mostrando la carga inicial.
  const cargarComprobantes = async (silencioso = false) => {
    if (!silencioso) {
      setCargandoComprobantes(true)
    }

    try {
      const response = await api.get('/admin/comprobantes')
      setComprobantes(response.data)
    } catch (err) {
      console.error('Error al actualizar comprobantes:', err)
    } finally {
      if (!silencioso) {
        setCargandoComprobantes(false)
      }
    }
  }

  // Carga inicial: aquí sí se muestran los mensajes de carga.
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      await Promise.all([
        cargarUsuarios(),
        cargarPedidos(false),
        cargarComprobantes(false),
      ])
    }

    cargarDatosIniciales()
  }, [])

  // Actualización automática silenciosa cada 10 segundos.
  useEffect(() => {
    const actualizarSilenciosamente = () => {
      // No hace solicitudes innecesarias cuando la pestaña está oculta.
      if (document.visibilityState !== 'visible') {
        return
      }

      cargarPedidos(true)
      cargarComprobantes(true)
    }

    const intervalo = setInterval(
      actualizarSilenciosamente,
      10000
    )

    return () => clearInterval(intervalo)
  }, [])

  // Abrir modal para crear personal
  const abrirModal = () => {
    setNombre('')
    setEmail('')
    setPassword('')
    setRol('cocina')
    setErrorForm('')
    setMostrarPassword(false)
    setMostrarModal(true)
  }
  const handleCrearUsuario = async (e) => {
    e.preventDefault()
    setErrorForm('')
    setGuardando(true)

    try {
      await api.post('/users', {
        name: nombre,
        email,
        password,
        rol,
      })

      setMostrarModal(false)
      cargarUsuarios()
    } catch (err) {
      if (err.response?.data?.errors) {
        const primerError = Object.values(err.response.data.errors)[0][0]
        setErrorForm(primerError)
      } else {
        setErrorForm('No se pudo crear el usuario. Intenta de nuevo.')
      }
    } finally {
      setGuardando(false)
    }
  }

  const handleToggleEstado = async (usuario) => {
    try {
      await api.patch(`/users/${usuario.id}/toggle-estado`)
      cargarUsuarios()
    } catch (err) {
      setErrorLista('No se pudo actualizar el estado del usuario.')
    }
  }

  const verificarComprobante = async (pedidoId, estado) => {
    try {
      await api.patch(`/admin/comprobantes/${pedidoId}/verificar`, { estado })
      cargarComprobantes()
    } catch (err) {
      alert('Error al verificar el comprobante')
    }
  }

  // Filtrar órdenes
  const ordenesActivas = pedidos.filter((p) => p.estado_pedido !== 'entregado')
  const ordenesEntregadas = pedidos.filter((p) => p.estado_pedido === 'entregado')
  const ordenesAMostrar = vistaOrdenes === 'activas' ? ordenesActivas : ordenesEntregadas

  // Filtrar comprobantes
  const comprobantesFiltrados = filtroComprobantes === 'todos'
    ? comprobantes
    : comprobantes.filter(c => c.estado_pago === filtroComprobantes)

  return (
    <DashboardLayout
      titulo="Panel de administración"
      dark
      acciones={
        <button
          onClick={abrirModal}
          className="flex items-center gap-2 bg-[#E4002B] hover:bg-[#F5A300] text-white text-sm font-black py-2.5 px-4 rounded-xl transition-colors shadow-lg"
        >
          <Plus size={16} />
          Nuevo personal
        </button>
      }
    >
      {/* ==================== SECCIÓN DE ÓRDENES ==================== */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-bold flex items-center gap-2">
            <Clock size={20} className="text-[#F5A300]" />
            Gestión de órdenes
          </h2>
          <span className="text-xs text-white/40">Se actualiza automáticamente cada 10s</span>
        </div>

        {/* Botones de vista */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setVistaOrdenes('activas')}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm uppercase transition-all ${vistaOrdenes === 'activas'
              ? 'bg-[#E4002B] text-white shadow-lg'
              : 'bg-white/10 text-white/60 hover:bg-white/15'
              }`}
          >
            Órdenes activas ({ordenesActivas.length})
          </button>
          <button
            onClick={() => setVistaOrdenes('entregadas')}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm uppercase transition-all ${vistaOrdenes === 'entregadas'
              ? 'bg-[#E4002B] text-white shadow-lg'
              : 'bg-white/10 text-white/60 hover:bg-white/15'
              }`}
          >
            Órdenes entregadas ({ordenesEntregadas.length})
          </button>
        </div>

        {/* Contenido de órdenes */}
        {cargandoPedidos ? (
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-white/60 text-sm">Cargando órdenes...</p>
          </div>
        ) : ordenesAMostrar.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-10 text-center">
            <p className="text-white/60">
              {vistaOrdenes === 'activas'
                ? 'No hay órdenes activas en este momento.'
                : 'No hay órdenes entregadas aún.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ordenesAMostrar.map((pedido) => (
              <div
                key={pedido.id}
                className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl hover:border-[#F5A300]/30 transition-all"
              >
                <div className="h-[3px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

                <div className="p-5">
                  {/* Código y estado */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-bold font-mono text-lg">
                        #{pedido.codigo_tracking}
                      </p>
                      <p className="text-white/50 text-xs mt-0.5">
                        {pedido.modalidad_entrega === 'consumo_local'
                          ? 'Consumo en local'
                          : 'Para retirar'}
                      </p>
                      {pedido.cliente && (
                        <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
                          <User size={12} />
                          {pedido.cliente.nombre}
                        </p>
                      )}
                    </div>
                    <span
                      className={`flex items-center gap-1 text-xs font-bold uppercase px-2.5 py-1 rounded-full ${COLOR_ESTADO[pedido.estado_pedido]
                        }`}
                    >
                      {ETIQUETA_ESTADO[pedido.estado_pedido]}
                    </span>
                  </div>

                  {/* Detalles de productos */}
                  <ul className="space-y-1.5 mb-4 bg-black/30 rounded-lg p-3">
                    {pedido.detalles.map((d) => (
                      <li
                        key={d.id}
                        className="text-sm text-white/80 flex justify-between"
                      >
                        <span>
                          {d.cantidad}x {d.producto.nombre}
                        </span>
                        <span className="text-white/50">
                          ₡{parseFloat(d.subtotal).toLocaleString('es-CR')}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Total */}
                  <div className="flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-white/50 text-xs font-semibold">Total</span>
                    <span className="text-[#F5A300] font-bold font-mono text-lg">
                      ₡{parseFloat(pedido.total).toLocaleString('es-CR')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================== COMPROBANTES SINPE ==================== */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-bold flex items-center gap-2">
            <Smartphone size={20} className="text-[#F5A300]" />
            Comprobantes Sinpe Móvil
          </h2>
          <div className="flex gap-2">
            <select
              value={filtroComprobantes}
              onChange={(e) => setFiltroComprobantes(e.target.value)}
              className="bg-black/40 border border-white/15 text-white text-sm rounded-lg px-3 py-1.5 focus:border-[#F5A300] outline-none"
            >
              <option value="todos">Todos</option>
              <option value="pendiente_verificacion">⏳ Pendientes</option>
              <option value="verificado">✅ Verificados</option>
              <option value="rechazado">❌ Rechazados</option>
            </select>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="h-[4px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

          {cargandoComprobantes ? (
            <p className="p-6 text-white/60">Cargando comprobantes...</p>
          ) : comprobantesFiltrados.length === 0 ? (
            <p className="p-6 text-white/60 text-center">
              {filtroComprobantes === 'todos'
                ? 'No hay comprobantes registrados'
                : `No hay comprobantes con estado "${filtroComprobantes}"`}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-white/10 bg-black/30">
                  <tr>
                    <th className="px-5 py-3 text-xs font-bold text-[#F5A300] uppercase tracking-wide">
                      Pedido
                    </th>
                    <th className="px-5 py-3 text-xs font-bold text-[#F5A300] uppercase tracking-wide">
                      Cliente
                    </th>
                    <th className="px-5 py-3 text-xs font-bold text-[#F5A300] uppercase tracking-wide">
                      Fecha
                    </th>
                    <th className="px-5 py-3 text-xs font-bold text-[#F5A300] uppercase tracking-wide">
                      Comprobante
                    </th>
                    <th className="px-5 py-3 text-xs font-bold text-[#F5A300] uppercase tracking-wide">
                      Estado
                    </th>
                    <th className="px-5 py-3 text-xs font-bold text-[#F5A300] uppercase tracking-wide text-right">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {comprobantesFiltrados.map((comp) => (
                    <tr key={comp.pedido_id} className="hover:bg-white/10 transition-colors">
                      <td className="px-5 py-3.5 text-white font-mono text-sm">
                        #{comp.codigo_tracking}
                      </td>
                      <td className="px-5 py-3.5 text-white/80 text-sm">
                        {comp.cliente_nombre || 'Cliente no registrado'}
                      </td>
                      <td className="px-5 py-3.5 text-white/50 text-sm">
                        {new Date(comp.fecha).toLocaleString('es-CR')}
                      </td>
                      <td className="px-5 py-3.5">
                        <a
                          href={`http://localhost:8000/storage/${comp.comprobante}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#F5A300] hover:text-[#E4002B] text-sm font-medium underline flex items-center gap-1"
                        >
                          <Search size={14} />
                          Ver comprobante
                        </a>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${comp.estado_pago === 'verificado'
                          ? 'bg-[#EAF3DE] text-[#3B6D11]'
                          : comp.estado_pago === 'rechazado'
                            ? 'bg-[#FCEBEB] text-[#A32D2D]'
                            : 'bg-[#FDF1DA] text-[#A9824A]'
                          }`}>
                          {comp.estado_pago === 'verificado' ? '✅ Verificado' :
                            comp.estado_pago === 'rechazado' ? '❌ Rechazado' : '⏳ Pendiente'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        {comp.estado_pago !== 'verificado' && (
                          <button
                            onClick={() => verificarComprobante(comp.pedido_id, 'verificado')}
                            className="bg-[#3B6D11] hover:bg-[#2A4F0A] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            ✅ Verificar
                          </button>
                        )}
                        {comp.estado_pago !== 'rechazado' && (
                          <button
                            onClick={() => verificarComprobante(comp.pedido_id, 'rechazado')}
                            className="bg-[#A32D2D] hover:bg-[#7A1F1F] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            ❌ Rechazar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ==================== SECCIÓN DE PERSONAL ==================== */}
      <div>
        <h2 className="text-white text-lg font-bold mb-4">Gestión de personal</h2>

        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="h-[4px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

          {cargandoLista ? (
            <p className="p-6 text-white/60 text-sm">Cargando personal...</p>
          ) : errorLista ? (
            <p className="p-6 text-[#F09595] text-sm">{errorLista}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-white/10 bg-black/30">
                  <tr>
                    <th className="px-5 py-3 text-xs font-bold text-[#F5A300] uppercase tracking-wide">
                      Nombre
                    </th>
                    <th className="px-5 py-3 text-xs font-bold text-[#F5A300] uppercase tracking-wide">
                      Correo
                    </th>
                    <th className="px-5 py-3 text-xs font-bold text-[#F5A300] uppercase tracking-wide">
                      Rol
                    </th>
                    <th className="px-5 py-3 text-xs font-bold text-[#F5A300] uppercase tracking-wide">
                      Estado
                    </th>
                    <th className="px-5 py-3 text-xs font-bold text-[#F5A300] uppercase tracking-wide text-right">
                      Acción
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {usuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-white/10 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-white text-sm">
                        {u.name}
                      </td>

                      <td className="px-5 py-3.5 text-white/60 text-sm font-mono">
                        {u.email}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold uppercase text-white/70 tracking-wide">
                          {ROLES.find((r) => r.value === u.rol)?.label || u.rol}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${u.estado === 'activo'
                            ? 'bg-[#EAF3DE] text-[#3B6D11]'
                            : 'bg-white/10 text-white/50'
                            }`}
                        >
                          {u.estado}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleToggleEstado(u)}
                          className="text-sm font-bold text-[#F5A300] hover:text-[#E4002B] transition-colors"
                        >
                          {u.estado === 'activo' ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ==================== MODAL CREAR USUARIO ==================== */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#21150F]/95 rounded-2xl shadow-2xl w-full max-w-md border border-white/10 overflow-hidden">
            <div className="h-[4px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-base font-black text-white uppercase tracking-wide">
                Nuevo personal
              </h3>

              <button
                onClick={() => setMostrarModal(false)}
                className="text-white/60 hover:text-[#F5A300] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCrearUsuario} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wide mb-1.5">
                  Nombre completo
                </label>

                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-white/10 text-white placeholder:text-white/30 focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/20 outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wide mb-1.5">
                  Correo electrónico
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-white/10 text-white placeholder:text-white/30 focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/20 outline-none transition text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wide mb-1.5">
                  Contraseña
                </label>

                <div className="relative">
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3.5 py-2.5 pr-11 rounded-lg border border-white/15 bg-white/10 text-white placeholder:text-white/30 focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/20 outline-none transition text-sm"
                  />

                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-[#F5A300] transition-colors"
                  >
                    {mostrarPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wide mb-1.5">
                  Rol
                </label>

                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-black/40 text-white focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/20 outline-none transition text-sm"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {errorForm && (
                <div className="bg-[#FCEBEB] border border-[#F09595] text-[#A32D2D] text-sm font-medium px-4 py-2.5 rounded-lg">
                  {errorForm}
                </div>
              )}

              <button
                type="submit"
                disabled={guardando}
                className="w-full bg-[#E4002B] hover:bg-[#F5A300] disabled:opacity-50 text-white font-black py-3 rounded-xl transition-colors text-sm uppercase shadow-lg"
              >
                {guardando ? 'Guardando...' : 'Crear usuario'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default AdminDashboard