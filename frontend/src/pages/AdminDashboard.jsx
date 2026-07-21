import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import DashboardLayout from '../components/DashboardLayout'
import useAuthStore from '../store/authStore'
import {
  Eye,
  EyeOff,
  Plus,
  X,
  Clock,
  CheckCircle2,
  Smartphone,
  DollarSign,
  CreditCard,
  User,
  Search,
} from 'lucide-react'

const ROLES = [
  {
    value: 'admin',
    label: 'Administrador',
  },
  {
    value: 'cocina',
    label: 'Cocina',
  },
  {
    value: 'caja',
    label: 'Caja',
  },
]

const ETIQUETA_ESTADO = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_preparacion: 'En preparación',
  listo: 'Listo',
  entregado: 'Entregado',
}

const COLOR_ESTADO = {
  pendiente:
    'bg-[#FDF1DA] text-[#A9824A]',

  confirmado:
    'bg-[#E8EEF7] text-[#3D5B8C]',

  en_preparacion:
    'bg-[#FEF1E3] text-[#C97A1E]',

  listo:
    'bg-[#EAF3DE] text-[#3B6D11]',

  entregado:
    'bg-[#F1EFE8] text-[#9B988F]',
}

const ETIQUETA_GRUPO_PASTA = {
  tipo_pasta: 'Tipos de pasta',
  proteina: 'Proteínas',
  salsa: 'Salsas',
  ingrediente: 'Ingredientes adicionales',
}

const ORDEN_GRUPOS_PASTA = [
  'tipo_pasta',
  'proteina',
  'salsa',
  'ingrediente',
]

const normalizarTexto = (valor) => {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/#/g, '')
    .toLowerCase()
    .trim()
}

function AdminDashboard() {
  const navigate = useNavigate()

  const {
    user,
    token,
    isAuthenticated,
  } = useAuthStore()

  /*
  |--------------------------------------------------------------------------
  | VERIFICAR AUTENTICACIÓN Y ROL
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    console.log(
      '=== ADMIN DASHBOARD ==='
    )

    console.log(
      '📱 Usuario:',
      user
    )

    console.log(
      '🔑 Token:',
      token
        ? '✅ SI HAY TOKEN'
        : '❌ NO HAY TOKEN'
    )

    console.log(
      '✅ Autenticado:',
      isAuthenticated
    )

    console.log(
      '👤 Rol:',
      user?.rol
    )

    if (
      !isAuthenticated ||
      user?.rol !== 'admin'
    ) {
      console.log(
        '⛔ No autorizado - Redirigiendo a login'
      )

      navigate('/login')
    }
  }, [])

  /*
  |--------------------------------------------------------------------------
  | ESTADOS DE PERSONAL
  |--------------------------------------------------------------------------
  */

  const [
    usuarios,
    setUsuarios,
  ] = useState([])

  const [
    cargandoLista,
    setCargandoLista,
  ] = useState(true)

  const [
    errorLista,
    setErrorLista,
  ] = useState('')

  /*
  |--------------------------------------------------------------------------
  | ESTADOS DE PEDIDOS
  |--------------------------------------------------------------------------
  */

  const [
    pedidos,
    setPedidos,
  ] = useState([])

  const [
    cargandoPedidos,
    setCargandoPedidos,
  ] = useState(true)

  const [
    vistaOrdenes,
    setVistaOrdenes,
  ] = useState('activas')

  /*
  |--------------------------------------------------------------------------
  | ESTADOS DEL MODAL
  |--------------------------------------------------------------------------
  */

  const [
    mostrarModal,
    setMostrarModal,
  ] = useState(false)

  const [
    nombre,
    setNombre,
  ] = useState('')

  const [
    email,
    setEmail,
  ] = useState('')

  const [
    password,
    setPassword,
  ] = useState('')

  const [
    mostrarPassword,
    setMostrarPassword,
  ] = useState(false)

  const [
    rol,
    setRol,
  ] = useState('cocina')

  const [
    errorForm,
    setErrorForm,
  ] = useState('')

  const [
    guardando,
    setGuardando,
  ] = useState(false)

  /*
  |--------------------------------------------------------------------------
  | ESTADOS DE COMPROBANTES
  |--------------------------------------------------------------------------
  */

  const [
    comprobantes,
    setComprobantes,
  ] = useState([])

  const [
    cargandoComprobantes,
    setCargandoComprobantes,
  ] = useState(false)

  const [
    filtroComprobantes,
    setFiltroComprobantes,
  ] = useState('todos')

  const [
    busquedaComprobantes,
    setBusquedaComprobantes,
  ] = useState('')

  /*
  |--------------------------------------------------------------------------
  | ESTADOS DE INGREDIENTES EXTRAS
  |--------------------------------------------------------------------------
  */

  const [
    ingredientes,
    setIngredientes,
  ] = useState([])

  const [
    preciosIngredientes,
    setPreciosIngredientes,
  ] = useState({})

  const [
    cargandoIngredientes,
    setCargandoIngredientes,
  ] = useState(false)

  const [
    guardandoIngredienteId,
    setGuardandoIngredienteId,
  ] = useState(null)

  const [
    errorIngredientes,
    setErrorIngredientes,
  ] = useState('')

  const [
    mensajeIngredientes,
    setMensajeIngredientes,
  ] = useState('')

  /*
  |--------------------------------------------------------------------------
  | ESTADOS DE OPCIONES DE PASTA
  |--------------------------------------------------------------------------
  */

  const [
    opcionesPasta,
    setOpcionesPasta,
  ] = useState([])

  const [
    preciosOpcionesPasta,
    setPreciosOpcionesPasta,
  ] = useState({})

  const [
    cargandoOpcionesPasta,
    setCargandoOpcionesPasta,
  ] = useState(false)

  const [
    guardandoOpcionPastaId,
    setGuardandoOpcionPastaId,
  ] = useState(null)

  const [
    errorOpcionesPasta,
    setErrorOpcionesPasta,
  ] = useState('')

  const [
    mensajeOpcionesPasta,
    setMensajeOpcionesPasta,
  ] = useState('')

  /*
  |--------------------------------------------------------------------------
  | ESTADOS DE ACOMPAÑAMIENTOS
  |--------------------------------------------------------------------------
  */

  const [
    acompanamientos,
    setAcompanamientos,
  ] = useState([])

  const [
    preciosAcompanamientos,
    setPreciosAcompanamientos,
  ] = useState({})

  const [
    cargandoAcompanamientos,
    setCargandoAcompanamientos,
  ] = useState(false)

  const [
    guardandoAcompanamientoId,
    setGuardandoAcompanamientoId,
  ] = useState(null)

  const [
    errorAcompanamientos,
    setErrorAcompanamientos,
  ] = useState('')

  const [
    mensajeAcompanamientos,
    setMensajeAcompanamientos,
  ] = useState('')

  /*
  |--------------------------------------------------------------------------
  | CARGAR USUARIOS
  |--------------------------------------------------------------------------
  */

  const cargarUsuarios = async () => {
    setCargandoLista(true)
    setErrorLista('')

    try {
      const response =
        await api.get('/users')

      setUsuarios(response.data)
    } catch (err) {
      console.error(
        'Error cargando usuarios:',
        err
      )

      setErrorLista(
        'No se pudo cargar la lista de personal.'
      )
    } finally {
      setCargandoLista(false)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | CARGAR PEDIDOS
  |--------------------------------------------------------------------------
  */

  const cargarPedidos = async (
    silencioso = false
  ) => {
    if (!silencioso) {
      setCargandoPedidos(true)
    }

    try {
      const response =
        await api.get('/pedidos')

      setPedidos(response.data)
    } catch (err) {
      console.error(
        'Error al actualizar pedidos:',
        err
      )
    } finally {
      if (!silencioso) {
        setCargandoPedidos(false)
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | CARGAR COMPROBANTES
  |--------------------------------------------------------------------------
  */

  const cargarComprobantes = async (
    silencioso = false
  ) => {
    if (!silencioso) {
      setCargandoComprobantes(true)
    }

    try {
      const response =
        await api.get(
          '/admin/comprobantes'
        )

      setComprobantes(response.data)
    } catch (err) {
      console.error(
        'Error al actualizar comprobantes:',
        err
      )
    } finally {
      if (!silencioso) {
        setCargandoComprobantes(false)
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | CARGAR INGREDIENTES EXTRAS
  |--------------------------------------------------------------------------
  */

  const cargarIngredientes = async () => {
    setCargandoIngredientes(true)
    setErrorIngredientes('')

    try {
      const response =
        await api.get(
          '/ingredientes'
        )

      setIngredientes(response.data)

      setPreciosIngredientes(
        response.data.reduce(
          (acumulador, ingrediente) => {
            acumulador[
              ingrediente.id
            ] =
              ingrediente.precio_extra

            return acumulador
          },
          {}
        )
      )
    } catch (err) {
      console.error(
        'Error cargando ingredientes:',
        err
      )

      setErrorIngredientes(
        'No se pudieron cargar los ingredientes extras.'
      )
    } finally {
      setCargandoIngredientes(false)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | CARGAR OPCIONES DE PASTA
  |--------------------------------------------------------------------------
  */

  const cargarOpcionesPasta = async () => {
    setCargandoOpcionesPasta(true)
    setErrorOpcionesPasta('')

    try {
      const response =
        await api.get(
          '/opciones-pasta'
        )

      const datos =
        Array.isArray(response.data)
          ? response.data
          : []

      setOpcionesPasta(datos)

      setPreciosOpcionesPasta(
        datos.reduce(
          (acumulador, opcion) => {
            acumulador[opcion.id] =
              opcion.precio_extra

            return acumulador
          },
          {}
        )
      )
    } catch (err) {
      console.error(
        'Error cargando opciones de pasta:',
        err
      )

      setErrorOpcionesPasta(
        'No se pudieron cargar las opciones de pasta.'
      )
    } finally {
      setCargandoOpcionesPasta(false)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | CARGAR ACOMPAÑAMIENTOS
  |--------------------------------------------------------------------------
  */

  const cargarAcompanamientos = async () => {
    setCargandoAcompanamientos(true)
    setErrorAcompanamientos('')

    try {
      const response =
        await api.get(
          '/acompanamientos'
        )

      const datos =
        Array.isArray(response.data)
          ? response.data
          : []

      setAcompanamientos(datos)

      setPreciosAcompanamientos(
        datos.reduce(
          (
            acumulador,
            acompanamiento
          ) => {
            acumulador[
              acompanamiento.id
            ] =
              acompanamiento.precio_extra

            return acumulador
          },
          {}
        )
      )
    } catch (err) {
      console.error(
        'Error cargando acompañamientos:',
        err
      )

      setErrorAcompanamientos(
        'No se pudieron cargar los acompañamientos.'
      )
    } finally {
      setCargandoAcompanamientos(false)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | CARGA INICIAL
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const cargarDatosIniciales =
      async () => {
        await Promise.all([
          cargarUsuarios(),
          cargarPedidos(false),
          cargarComprobantes(false),
          cargarIngredientes(),
          cargarOpcionesPasta(),
          cargarAcompanamientos(),
        ])
      }

    if (
      isAuthenticated &&
      user?.rol === 'admin'
    ) {
      cargarDatosIniciales()
    }
  }, [
    isAuthenticated,
    user,
  ])

  /*
  |--------------------------------------------------------------------------
  | ACTUALIZACIÓN AUTOMÁTICA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const actualizarSilenciosamente =
      () => {
        if (
          document.visibilityState !==
          'visible'
        ) {
          return
        }

        cargarPedidos(true)
        cargarComprobantes(true)
      }

    const intervalo = setInterval(
      actualizarSilenciosamente,
      3000
    )

    return () => {
      clearInterval(intervalo)
    }
  }, [])

  /*
  |--------------------------------------------------------------------------
  | ABRIR MODAL
  |--------------------------------------------------------------------------
  */

  const abrirModal = () => {
    setNombre('')
    setEmail('')
    setPassword('')
    setRol('cocina')
    setErrorForm('')
    setMostrarPassword(false)
    setMostrarModal(true)
  }

  /*
  |--------------------------------------------------------------------------
  | CREAR USUARIO
  |--------------------------------------------------------------------------
  */

  const handleCrearUsuario =
    async (event) => {
      event.preventDefault()

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
        if (
          err.response?.data?.errors
        ) {
          const primerError =
            Object.values(
              err.response.data.errors
            )[0][0]

          setErrorForm(primerError)
        } else {
          setErrorForm(
            'No se pudo crear el usuario. Intenta de nuevo.'
          )
        }
      } finally {
        setGuardando(false)
      }
    }

  /*
  |--------------------------------------------------------------------------
  | CAMBIAR ESTADO DEL USUARIO
  |--------------------------------------------------------------------------
  */

  const handleToggleEstado =
    async (usuario) => {
      try {
        await api.patch(
          `/users/${usuario.id}/toggle-estado`
        )

        cargarUsuarios()
      } catch (err) {
        setErrorLista(
          'No se pudo actualizar el estado del usuario.'
        )
      }
    }

  /*
  |--------------------------------------------------------------------------
  | VERIFICAR COMPROBANTE
  |--------------------------------------------------------------------------
  */

  const verificarComprobante =
    async (
      pedidoId,
      estado
    ) => {
      try {
        await api.patch(
          `/admin/comprobantes/${pedidoId}/verificar`,
          {
            estado,
          }
        )

        cargarComprobantes()
      } catch (err) {
        alert(
          'Error al verificar el comprobante'
        )
      }
    }

  /*
  |--------------------------------------------------------------------------
  | ACTUALIZAR PRECIO DEL INGREDIENTE
  |--------------------------------------------------------------------------
  */

  const guardarPrecioIngrediente =
    async (ingrediente) => {
      const precio = Number(
        preciosIngredientes[
          ingrediente.id
        ]
      )

      setErrorIngredientes('')
      setMensajeIngredientes('')

      if (
        !Number.isFinite(precio) ||
        precio < 0
      ) {
        setErrorIngredientes(
          'Ingresa un precio válido mayor o igual a cero.'
        )

        return
      }

      setGuardandoIngredienteId(
        ingrediente.id
      )

      try {
        const response =
          await api.put(
            `/ingredientes/${ingrediente.id}`,
            {
              nombre: ingrediente.nombre,
              precio_extra: precio,
            }
          )

        const ingredienteActualizado =
          response.data.ingrediente

        setIngredientes(
          (listaActual) =>
            listaActual.map(
              (item) =>
                item.id ===
                ingredienteActualizado.id
                  ? ingredienteActualizado
                  : item
            )
        )

        setPreciosIngredientes(
          (valoresActuales) => ({
            ...valoresActuales,
            [
              ingredienteActualizado.id
            ]:
              ingredienteActualizado
                .precio_extra,
          })
        )

        setMensajeIngredientes(
          `${ingredienteActualizado.nombre}: precio actualizado correctamente.`
        )
      } catch (err) {
        const primerError =
          err.response?.data?.errors
            ? Object.values(
                err.response.data.errors
              )[0][0]
            : null

        setErrorIngredientes(
          primerError ||
            'No se pudo actualizar el precio del ingrediente.'
        )
      } finally {
        setGuardandoIngredienteId(
          null
        )
      }
    }

  /*
  |--------------------------------------------------------------------------
  | CAMBIAR DISPONIBILIDAD DEL INGREDIENTE
  |--------------------------------------------------------------------------
  */

  const cambiarEstadoIngrediente =
    async (ingrediente) => {
      setErrorIngredientes('')
      setMensajeIngredientes('')
      setGuardandoIngredienteId(
        ingrediente.id
      )

      try {
        const response =
          await api.patch(
            `/ingredientes/${ingrediente.id}/toggle-estado`
          )

        const ingredienteActualizado =
          response.data.ingrediente

        setIngredientes(
          (listaActual) =>
            listaActual.map(
              (item) =>
                item.id ===
                ingredienteActualizado.id
                  ? ingredienteActualizado
                  : item
            )
        )

        setMensajeIngredientes(
          `${ingredienteActualizado.nombre}: estado actualizado correctamente.`
        )
      } catch (err) {
        setErrorIngredientes(
          'No se pudo actualizar el estado del ingrediente.'
        )
      } finally {
        setGuardandoIngredienteId(
          null
        )
      }
    }

  /*
  |--------------------------------------------------------------------------
  | ACTUALIZAR PRECIO DE UNA OPCIÓN DE PASTA
  |--------------------------------------------------------------------------
  */

  const guardarPrecioOpcionPasta =
    async (opcion) => {
      const precio = Number(
        preciosOpcionesPasta[
          opcion.id
        ]
      )

      setErrorOpcionesPasta('')
      setMensajeOpcionesPasta('')

      if (
        !Number.isFinite(precio) ||
        precio < 0
      ) {
        setErrorOpcionesPasta(
          'Ingresa un precio válido mayor o igual a cero.'
        )

        return
      }

      setGuardandoOpcionPastaId(
        opcion.id
      )

      try {
        const response =
          await api.put(
            `/opciones-pasta/${opcion.id}`,
            {
              grupo:
                opcion.grupo,

              nombre:
                opcion.nombre,

              precio_extra:
                precio,

              orden:
                Number(
                  opcion.orden
                ) || 0,
            }
          )

        const opcionActualizada =
          response.data.opcion

        setOpcionesPasta(
          (listaActual) =>
            listaActual.map(
              (item) =>
                item.id ===
                opcionActualizada.id
                  ? opcionActualizada
                  : item
            )
        )

        setPreciosOpcionesPasta(
          (valoresActuales) => ({
            ...valoresActuales,

            [opcionActualizada.id]:
              opcionActualizada
                .precio_extra,
          })
        )

        setMensajeOpcionesPasta(
          `${opcionActualizada.nombre}: precio actualizado correctamente.`
        )
      } catch (err) {
        const primerError =
          err.response?.data?.errors
            ? Object.values(
                err.response.data.errors
              )[0][0]
            : null

        setErrorOpcionesPasta(
          primerError ||
            'No se pudo actualizar el precio de la opción de pasta.'
        )
      } finally {
        setGuardandoOpcionPastaId(
          null
        )
      }
    }

  /*
  |--------------------------------------------------------------------------
  | CAMBIAR DISPONIBILIDAD DE UNA OPCIÓN DE PASTA
  |--------------------------------------------------------------------------
  */

  const cambiarEstadoOpcionPasta =
    async (opcion) => {
      setErrorOpcionesPasta('')
      setMensajeOpcionesPasta('')

      setGuardandoOpcionPastaId(
        opcion.id
      )

      try {
        const response =
          await api.patch(
            `/opciones-pasta/${opcion.id}/toggle-estado`
          )

        const opcionActualizada =
          response.data.opcion

        setOpcionesPasta(
          (listaActual) =>
            listaActual.map(
              (item) =>
                item.id ===
                opcionActualizada.id
                  ? opcionActualizada
                  : item
            )
        )

        setMensajeOpcionesPasta(
          `${opcionActualizada.nombre}: estado actualizado correctamente.`
        )
      } catch (err) {
        setErrorOpcionesPasta(
          'No se pudo actualizar el estado de la opción de pasta.'
        )
      } finally {
        setGuardandoOpcionPastaId(
          null
        )
      }
    }

  /*
  |--------------------------------------------------------------------------
  | ACTUALIZAR PRECIO DE UN ACOMPAÑAMIENTO
  |--------------------------------------------------------------------------
  */

  const guardarPrecioAcompanamiento =
    async (acompanamiento) => {
      const precio = Number(
        preciosAcompanamientos[
          acompanamiento.id
        ]
      )

      setErrorAcompanamientos('')
      setMensajeAcompanamientos('')

      if (
        !Number.isFinite(precio) ||
        precio < 0
      ) {
        setErrorAcompanamientos(
          'Ingresa un precio válido mayor o igual a cero.'
        )

        return
      }

      setGuardandoAcompanamientoId(
        acompanamiento.id
      )

      try {
        const response =
          await api.put(
            `/acompanamientos/${acompanamiento.id}`,
            {
              nombre:
                acompanamiento.nombre,

              precio_extra:
                precio,

              orden:
                Number(
                  acompanamiento.orden
                ) || 0,
            }
          )

        const acompanamientoActualizado =
          response.data.acompanamiento

        setAcompanamientos(
          (listaActual) =>
            listaActual.map(
              (item) =>
                item.id ===
                acompanamientoActualizado.id
                  ? acompanamientoActualizado
                  : item
            )
        )

        setPreciosAcompanamientos(
          (valoresActuales) => ({
            ...valoresActuales,

            [
              acompanamientoActualizado.id
            ]:
              acompanamientoActualizado
                .precio_extra,
          })
        )

        setMensajeAcompanamientos(
          `${acompanamientoActualizado.nombre}: precio actualizado correctamente.`
        )
      } catch (err) {
        const primerError =
          err.response?.data?.errors
            ? Object.values(
                err.response.data.errors
              )[0][0]
            : null

        setErrorAcompanamientos(
          primerError ||
            'No se pudo actualizar el precio del acompañamiento.'
        )
      } finally {
        setGuardandoAcompanamientoId(
          null
        )
      }
    }

  /*
  |--------------------------------------------------------------------------
  | CAMBIAR DISPONIBILIDAD DE UN ACOMPAÑAMIENTO
  |--------------------------------------------------------------------------
  */

  const cambiarEstadoAcompanamiento =
    async (acompanamiento) => {
      setErrorAcompanamientos('')
      setMensajeAcompanamientos('')

      setGuardandoAcompanamientoId(
        acompanamiento.id
      )

      try {
        const response =
          await api.patch(
            `/acompanamientos/${acompanamiento.id}/toggle-estado`
          )

        const acompanamientoActualizado =
          response.data.acompanamiento

        setAcompanamientos(
          (listaActual) =>
            listaActual.map(
              (item) =>
                item.id ===
                acompanamientoActualizado.id
                  ? acompanamientoActualizado
                  : item
            )
        )

        setMensajeAcompanamientos(
          `${acompanamientoActualizado.nombre}: estado actualizado correctamente.`
        )
      } catch (err) {
        setErrorAcompanamientos(
          'No se pudo actualizar el estado del acompañamiento.'
        )
      } finally {
        setGuardandoAcompanamientoId(
          null
        )
      }
    }

  /*
  |--------------------------------------------------------------------------
  | FILTROS DE PEDIDOS
  |--------------------------------------------------------------------------
  */

  const ordenesActivas =
    pedidos.filter(
      (pedido) =>
        pedido.estado_pedido !==
        'entregado'
    )

  const ordenesEntregadas =
    pedidos.filter(
      (pedido) =>
        pedido.estado_pedido ===
        'entregado'
    )

  const ordenesAMostrar =
    vistaOrdenes === 'activas'
      ? ordenesActivas
      : ordenesEntregadas

  /*
  |--------------------------------------------------------------------------
  | FILTRO Y BÚSQUEDA DE COMPROBANTES
  |--------------------------------------------------------------------------
  */

  const terminoBusqueda =
    normalizarTexto(
      busquedaComprobantes
    )

  const comprobantesFiltrados =
    comprobantes.filter(
      (comprobante) => {
        const coincideEstado =
          filtroComprobantes ===
          'todos' ||
          comprobante.estado_pago ===
          filtroComprobantes

        const coincideBusqueda =
          terminoBusqueda === '' ||
          normalizarTexto(
            comprobante.codigo_tracking
          ).includes(
            terminoBusqueda
          ) ||
          normalizarTexto(
            comprobante.pedido_id
          ).includes(
            terminoBusqueda
          ) ||
          normalizarTexto(
            comprobante.cliente_nombre
          ).includes(
            terminoBusqueda
          )

        return (
          coincideEstado &&
          coincideBusqueda
        )
      }
    )

  /*
  |--------------------------------------------------------------------------
  | TARJETA DE PRECIO PARA OPCIÓN DE PASTA
  |--------------------------------------------------------------------------
  */

  const renderTarjetaOpcionPasta = (
    opcion
  ) => {
    const estaGuardando =
      guardandoOpcionPastaId ===
      opcion.id

    const disponible =
      opcion.estado ===
      'disponible'

    return (
      <div
        key={opcion.id}
        className="
          overflow-hidden
          rounded-2xl
          border border-white/10
          bg-white/10
          shadow-xl
          backdrop-blur-md
        "
      >
        <div className="h-[3px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-bold text-white">
                {opcion.nombre}
              </h4>

              <p className="mt-1 text-xs text-white/40">
                {
                  ETIQUETA_GRUPO_PASTA[
                    opcion.grupo
                  ] || opcion.grupo
                }
              </p>
            </div>

            <span
              className={`
                rounded-full
                px-2.5 py-1
                text-[10px] font-black
                uppercase tracking-wide
                ${
                  disponible
                    ? 'bg-[#EAF3DE] text-[#3B6D11]'
                    : 'bg-white/10 text-white/50'
                }
              `}
            >
              {disponible
                ? 'Disponible'
                : 'Agotado'}
            </span>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-white/60">
              Precio adicional
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#F5A300]">
                ₡
              </span>

              <input
                type="number"
                min="0"
                step="1"
                value={
                  preciosOpcionesPasta[
                    opcion.id
                  ] ?? ''
                }
                onChange={(event) =>
                  setPreciosOpcionesPasta(
                    (
                      valoresActuales
                    ) => ({
                      ...valoresActuales,

                      [opcion.id]:
                        event.target.value,
                    })
                  )
                }
                className="
                  w-full rounded-xl
                  border border-white/15
                  bg-black/40
                  py-2.5 pl-8 pr-3
                  font-mono text-sm
                  text-white
                  outline-none
                  transition
                  focus:border-[#F5A300]
                  focus:ring-2
                  focus:ring-[#F5A300]/20
                "
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                guardarPrecioOpcionPasta(
                  opcion
                )
              }
              disabled={estaGuardando}
              className="
                flex-1 rounded-xl
                bg-[#E4002B]
                px-4 py-2.5
                text-xs font-black
                uppercase text-white
                transition-colors
                hover:bg-[#F5A300]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {estaGuardando
                ? 'Guardando...'
                : 'Guardar precio'}
            </button>

            <button
              type="button"
              onClick={() =>
                cambiarEstadoOpcionPasta(
                  opcion
                )
              }
              disabled={estaGuardando}
              className="
                rounded-xl
                border border-white/15
                bg-white/5
                px-4 py-2.5
                text-xs font-bold
                text-white/70
                transition-colors
                hover:border-[#F5A300]
                hover:text-[#F5A300]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {disponible
                ? 'Agotar'
                : 'Activar'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | TARJETA DE PRECIO PARA ACOMPAÑAMIENTO
  |--------------------------------------------------------------------------
  */

  const renderTarjetaAcompanamiento = (
    acompanamiento
  ) => {
    const estaGuardando =
      guardandoAcompanamientoId ===
      acompanamiento.id

    const disponible =
      acompanamiento.estado ===
      'disponible'

    return (
      <div
        key={acompanamiento.id}
        className="
          overflow-hidden
          rounded-2xl
          border border-white/10
          bg-white/10
          shadow-xl
          backdrop-blur-md
        "
      >
        <div className="h-[3px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-bold text-white">
                {acompanamiento.nombre}
              </h4>

              <p className="mt-1 text-xs text-white/40">
                Se cobra desde la tercera selección
              </p>
            </div>

            <span
              className={`
                rounded-full
                px-2.5 py-1
                text-[10px] font-black
                uppercase tracking-wide
                ${
                  disponible
                    ? 'bg-[#EAF3DE] text-[#3B6D11]'
                    : 'bg-white/10 text-white/50'
                }
              `}
            >
              {disponible
                ? 'Disponible'
                : 'Agotado'}
            </span>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-white/60">
              Precio adicional
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#F5A300]">
                ₡
              </span>

              <input
                type="number"
                min="0"
                step="1"
                value={
                  preciosAcompanamientos[
                    acompanamiento.id
                  ] ?? ''
                }
                onChange={(event) =>
                  setPreciosAcompanamientos(
                    (
                      valoresActuales
                    ) => ({
                      ...valoresActuales,

                      [acompanamiento.id]:
                        event.target.value,
                    })
                  )
                }
                className="
                  w-full rounded-xl
                  border border-white/15
                  bg-black/40
                  py-2.5 pl-8 pr-3
                  font-mono text-sm
                  text-white
                  outline-none
                  transition
                  focus:border-[#F5A300]
                  focus:ring-2
                  focus:ring-[#F5A300]/20
                "
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                guardarPrecioAcompanamiento(
                  acompanamiento
                )
              }
              disabled={estaGuardando}
              className="
                flex-1 rounded-xl
                bg-[#E4002B]
                px-4 py-2.5
                text-xs font-black
                uppercase text-white
                transition-colors
                hover:bg-[#F5A300]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {estaGuardando
                ? 'Guardando...'
                : 'Guardar precio'}
            </button>

            <button
              type="button"
              onClick={() =>
                cambiarEstadoAcompanamiento(
                  acompanamiento
                )
              }
              disabled={estaGuardando}
              className="
                rounded-xl
                border border-white/15
                bg-white/5
                px-4 py-2.5
                text-xs font-bold
                text-white/70
                transition-colors
                hover:border-[#F5A300]
                hover:text-[#F5A300]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {disponible
                ? 'Agotar'
                : 'Activar'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout
      titulo="Panel de administración"
      dark
      acciones={
        <button
          type="button"
          onClick={abrirModal}
          className="
            flex items-center gap-2
            rounded-xl
            bg-[#E4002B]
            px-4 py-2.5
            text-sm font-black text-white
            shadow-lg
            transition-colors
            hover:bg-[#F5A300]
          "
        >
          <Plus size={16} />

          Nuevo personal
        </button>
      }
    >
      {/* ÓRDENES */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Clock
              size={20}
              className="text-[#F5A300]"
            />

            Gestión de órdenes
          </h2>

          <span className="text-xs text-white/40">
            Se actualiza automáticamente
            cada 3s
          </span>
        </div>

        <div className="mb-6 flex gap-3">
          <button
            type="button"
            onClick={() =>
              setVistaOrdenes(
                'activas'
              )
            }
            className={`
              rounded-lg
              px-6 py-2.5
              text-sm font-bold
              uppercase
              transition-all
              ${vistaOrdenes ===
                'activas'
                ? 'bg-[#E4002B] text-white shadow-lg'
                : 'bg-white/10 text-white/60 hover:bg-white/15'
              }
            `}
          >
            Órdenes activas (
            {ordenesActivas.length})
          </button>

          <button
            type="button"
            onClick={() =>
              setVistaOrdenes(
                'entregadas'
              )
            }
            className={`
              rounded-lg
              px-6 py-2.5
              text-sm font-bold
              uppercase
              transition-all
              ${vistaOrdenes ===
                'entregadas'
                ? 'bg-[#E4002B] text-white shadow-lg'
                : 'bg-white/10 text-white/60 hover:bg-white/15'
              }
            `}
          >
            Órdenes entregadas (
            {ordenesEntregadas.length})
          </button>
        </div>

        {cargandoPedidos ? (
          <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-center backdrop-blur-md">
            <p className="text-sm text-white/60">
              Cargando órdenes...
            </p>
          </div>
        ) : ordenesAMostrar.length ===
          0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/10 p-10 text-center backdrop-blur-md">
            <p className="text-white/60">
              {vistaOrdenes ===
                'activas'
                ? 'No hay órdenes activas en este momento.'
                : 'No hay órdenes entregadas aún.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ordenesAMostrar.map(
              (pedido) => (
                <div
                  key={pedido.id}
                  className="
                    overflow-hidden
                    rounded-2xl
                    border border-white/10
                    bg-white/10
                    shadow-2xl
                    backdrop-blur-md
                    transition-all
                    hover:border-[#F5A300]/30
                  "
                >
                  <div className="h-[3px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

                  <div className="p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <p className="font-mono text-lg font-bold text-white">
                          #
                          {
                            pedido.codigo_tracking
                          }
                        </p>

                        <p className="mt-0.5 text-xs text-white/50">
                          {pedido.modalidad_entrega ===
                            'consumo_local'
                            ? 'Consumo en local'
                            : 'Para retirar'}
                        </p>

                        {pedido.cliente && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-white/40">
                            <User
                              size={12}
                            />

                            {
                              pedido
                                .cliente
                                .nombre
                            }
                          </p>
                        )}
                      </div>

                      <span
                        className={`
                          flex items-center gap-1
                          rounded-full
                          px-2.5 py-1
                          text-xs font-bold
                          uppercase
                          ${COLOR_ESTADO[
                          pedido
                            .estado_pedido
                          ]
                          }
                        `}
                      >
                        {
                          ETIQUETA_ESTADO[
                          pedido
                            .estado_pedido
                          ]
                        }
                      </span>
                    </div>

                    <ul className="mb-4 space-y-1.5 rounded-lg bg-black/30 p-3">
                      {pedido.detalles.map(
                        (detalle) => (
                          <li
                            key={
                              detalle.id
                            }
                            className="flex justify-between text-sm text-white/80"
                          >
                            <span>
                              {
                                detalle.cantidad
                              }
                              x{' '}
                              {
                                detalle
                                  .producto
                                  .nombre
                              }
                            </span>

                            <span className="text-white/50">
                              ₡
                              {parseFloat(
                                detalle.subtotal
                              ).toLocaleString(
                                'es-CR'
                              )}
                            </span>
                          </li>
                        )
                      )}
                    </ul>

                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="text-xs font-semibold text-white/50">
                        Total
                      </span>

                      <span className="font-mono text-lg font-bold text-[#F5A300]">
                        ₡
                        {parseFloat(
                          pedido.total
                        ).toLocaleString(
                          'es-CR'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* INGREDIENTES EXTRAS */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <DollarSign
              size={20}
              className="text-[#F5A300]"
            />

            Ingredientes extras
          </h2>

          <p className="mt-1 text-xs text-white/40">
            Modifica el precio que se cobra
            por cada ingrediente adicional.
          </p>
        </div>

        {mensajeIngredientes && (
          <div className="mb-4 rounded-xl border border-[#C9E0B0] bg-[#EAF3DE] px-4 py-3 text-sm font-semibold text-[#3B6D11]">
            {mensajeIngredientes}
          </div>
        )}

        {errorIngredientes && (
          <div className="mb-4 rounded-xl border border-[#F09595] bg-[#FCEBEB] px-4 py-3 text-sm font-semibold text-[#A32D2D]">
            {errorIngredientes}
          </div>
        )}

        {cargandoIngredientes ? (
          <div className="rounded-2xl border border-white/10 bg-white/10 p-8 text-center backdrop-blur-md">
            <p className="text-sm text-white/60">
              Cargando ingredientes...
            </p>
          </div>
        ) : ingredientes.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/10 p-8 text-center backdrop-blur-md">
            <p className="text-sm text-white/60">
              No hay ingredientes registrados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ingredientes.map(
              (ingrediente) => {
                const estaGuardando =
                  guardandoIngredienteId ===
                  ingrediente.id

                const disponible =
                  ingrediente.estado ===
                  'disponible'

                return (
                  <div
                    key={ingrediente.id}
                    className="
                      overflow-hidden
                      rounded-2xl
                      border border-white/10
                      bg-white/10
                      shadow-xl
                      backdrop-blur-md
                    "
                  >
                    <div className="h-[3px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

                    <div className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-white">
                            {ingrediente.nombre}
                          </h3>

                          <p className="mt-1 text-xs text-white/40">
                            Precio por unidad extra
                          </p>
                        </div>

                        <span
                          className={`
                            rounded-full
                            px-2.5 py-1
                            text-[10px] font-black
                            uppercase tracking-wide
                            ${
                              disponible
                                ? 'bg-[#EAF3DE] text-[#3B6D11]'
                                : 'bg-white/10 text-white/50'
                            }
                          `}
                        >
                          {disponible
                            ? 'Disponible'
                            : 'Agotado'}
                        </span>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-white/60">
                          Precio
                        </label>

                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#F5A300]">
                            ₡
                          </span>

                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={
                              preciosIngredientes[
                                ingrediente.id
                              ] ?? ''
                            }
                            onChange={(event) =>
                              setPreciosIngredientes(
                                (
                                  valoresActuales
                                ) => ({
                                  ...valoresActuales,
                                  [
                                    ingrediente.id
                                  ]:
                                    event.target
                                      .value,
                                })
                              )
                            }
                            className="
                              w-full rounded-xl
                              border border-white/15
                              bg-black/40
                              py-2.5 pl-8 pr-3
                              font-mono text-sm
                              text-white
                              outline-none
                              transition
                              focus:border-[#F5A300]
                              focus:ring-2
                              focus:ring-[#F5A300]/20
                            "
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            guardarPrecioIngrediente(
                              ingrediente
                            )
                          }
                          disabled={estaGuardando}
                          className="
                            flex-1 rounded-xl
                            bg-[#E4002B]
                            px-4 py-2.5
                            text-xs font-black
                            uppercase text-white
                            transition-colors
                            hover:bg-[#F5A300]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          {estaGuardando
                            ? 'Guardando...'
                            : 'Guardar precio'}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            cambiarEstadoIngrediente(
                              ingrediente
                            )
                          }
                          disabled={estaGuardando}
                          className="
                            rounded-xl
                            border border-white/15
                            bg-white/5
                            px-4 py-2.5
                            text-xs font-bold
                            text-white/70
                            transition-colors
                            hover:border-[#F5A300]
                            hover:text-[#F5A300]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          {disponible
                            ? 'Agotar'
                            : 'Activar'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }
            )}
          </div>
        )}
      </div>

      {/* OPCIONES DE PASTA */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <DollarSign
              size={20}
              className="text-[#F5A300]"
            />

            Opciones de pasta
          </h2>

          <p className="mt-1 text-xs text-white/40">
            Modifica los precios de tipos de pasta,
            proteínas, salsas e ingredientes adicionales.
          </p>
        </div>

        {mensajeOpcionesPasta && (
          <div className="mb-4 rounded-xl border border-[#C9E0B0] bg-[#EAF3DE] px-4 py-3 text-sm font-semibold text-[#3B6D11]">
            {mensajeOpcionesPasta}
          </div>
        )}

        {errorOpcionesPasta && (
          <div className="mb-4 rounded-xl border border-[#F09595] bg-[#FCEBEB] px-4 py-3 text-sm font-semibold text-[#A32D2D]">
            {errorOpcionesPasta}
          </div>
        )}

        {cargandoOpcionesPasta ? (
          <div className="rounded-2xl border border-white/10 bg-white/10 p-8 text-center backdrop-blur-md">
            <p className="text-sm text-white/60">
              Cargando opciones de pasta...
            </p>
          </div>
        ) : opcionesPasta.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/10 p-8 text-center backdrop-blur-md">
            <p className="text-sm text-white/60">
              No hay opciones de pasta registradas.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {ORDEN_GRUPOS_PASTA.map(
              (grupo) => {
                const opcionesDelGrupo =
                  opcionesPasta.filter(
                    (opcion) =>
                      opcion.grupo ===
                      grupo
                  )

                if (
                  opcionesDelGrupo.length ===
                  0
                ) {
                  return null
                }

                return (
                  <div key={grupo}>
                    <div className="mb-3 flex items-center gap-3">
                      <h3 className="text-sm font-black uppercase tracking-wide text-[#F5A300]">
                        {
                          ETIQUETA_GRUPO_PASTA[
                            grupo
                          ]
                        }
                      </h3>

                      <span className="h-px flex-1 bg-white/10" />

                      <span className="text-xs text-white/35">
                        {
                          opcionesDelGrupo.length
                        }
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {opcionesDelGrupo.map(
                        renderTarjetaOpcionPasta
                      )}
                    </div>
                  </div>
                )
              }
            )}
          </div>
        )}
      </div>

      {/* ACOMPAÑAMIENTOS DE CARNES */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <DollarSign
              size={20}
              className="text-[#F5A300]"
            />

            Acompañamientos de carnes
          </h2>

          <p className="mt-1 text-xs text-white/40">
            Los primeros dos acompañamientos están
            incluidos. Este precio se aplica al tercero
            y a los siguientes.
          </p>
        </div>

        {mensajeAcompanamientos && (
          <div className="mb-4 rounded-xl border border-[#C9E0B0] bg-[#EAF3DE] px-4 py-3 text-sm font-semibold text-[#3B6D11]">
            {mensajeAcompanamientos}
          </div>
        )}

        {errorAcompanamientos && (
          <div className="mb-4 rounded-xl border border-[#F09595] bg-[#FCEBEB] px-4 py-3 text-sm font-semibold text-[#A32D2D]">
            {errorAcompanamientos}
          </div>
        )}

        {cargandoAcompanamientos ? (
          <div className="rounded-2xl border border-white/10 bg-white/10 p-8 text-center backdrop-blur-md">
            <p className="text-sm text-white/60">
              Cargando acompañamientos...
            </p>
          </div>
        ) : acompanamientos.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/10 p-8 text-center backdrop-blur-md">
            <p className="text-sm text-white/60">
              No hay acompañamientos registrados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {acompanamientos.map(
              renderTarjetaAcompanamiento
            )}
          </div>
        )}
      </div>

      {/* COMPROBANTES SINPE */}
      <div className="mb-8">
        <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Smartphone
                size={20}
                className="text-[#F5A300]"
              />

              Comprobantes Sinpe Móvil
            </h2>

            <p className="mt-1 text-xs text-white/40">
              Busca por número de pedido
              o nombre del cliente.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
            {/* BÚSQUEDA */}
            <div className="relative w-full sm:min-w-[320px]">
              <Search
                size={17}
                className="
                  pointer-events-none
                  absolute left-3 top-1/2
                  -translate-y-1/2
                  text-white/40
                "
              />

              <input
                type="search"
                value={
                  busquedaComprobantes
                }
                onChange={(event) =>
                  setBusquedaComprobantes(
                    event.target.value
                  )
                }
                placeholder="Pedido o nombre del cliente..."
                aria-label="Buscar comprobantes"
                className="
                  w-full rounded-xl
                  border border-white/15
                  bg-black/40
                  py-2.5 pl-10 pr-10
                  text-sm text-white
                  outline-none
                  transition
                  placeholder:text-white/30
                  focus:border-[#F5A300]
                  focus:ring-2
                  focus:ring-[#F5A300]/20
                "
              />

              {busquedaComprobantes && (
                <button
                  type="button"
                  onClick={() =>
                    setBusquedaComprobantes(
                      ''
                    )
                  }
                  aria-label="Limpiar búsqueda"
                  className="
                    absolute right-3 top-1/2
                    -translate-y-1/2
                    rounded-md p-1
                    text-white/40
                    transition
                    hover:bg-white/10
                    hover:text-white
                  "
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* FILTRO DE ESTADO */}
            <select
              value={
                filtroComprobantes
              }
              onChange={(event) =>
                setFiltroComprobantes(
                  event.target.value
                )
              }
              className="
                rounded-xl
                border border-white/15
                bg-black/40
                px-3 py-2.5
                text-sm text-white
                outline-none
                transition
                focus:border-[#F5A300]
                focus:ring-2
                focus:ring-[#F5A300]/20
              "
            >
              <option value="todos">
                Todos los estados
              </option>

              <option value="pendiente_verificacion">
                ⏳ Pendientes
              </option>

              <option value="verificado">
                ✅ Verificados
              </option>

              <option value="rechazado">
                ❌ Rechazados
              </option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-md">
          <div className="h-[4px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

          {cargandoComprobantes ? (
            <p className="p-6 text-white/60">
              Cargando comprobantes...
            </p>
          ) : comprobantesFiltrados
            .length === 0 ? (
            <p className="p-6 text-center text-white/60">
              {busquedaComprobantes.trim()
                ? `No se encontraron comprobantes para "${busquedaComprobantes}".`
                : filtroComprobantes ===
                  'todos'
                  ? 'No hay comprobantes registrados.'
                  : `No hay comprobantes con estado "${filtroComprobantes}".`}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-white/10 bg-black/30">
                  <tr>
                    <th className="min-w-[120px] px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#F5A300]">
                      Pedido
                    </th>

                    <th className="min-w-[220px] px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#F5A300]">
                      Cliente
                    </th>

                    <th className="min-w-[180px] px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#F5A300]">
                      Fecha
                    </th>

                    <th className="min-w-[190px] px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#F5A300]">
                      Comprobante
                    </th>

                    <th className="min-w-[170px] px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#F5A300]">
                      Estado
                    </th>

                    <th className="min-w-[240px] px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-[#F5A300]">
                      Acción
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {comprobantesFiltrados.map(
                    (comprobante) => (
                      <tr
                        key={comprobante.pedido_id}
                        className="transition-colors hover:bg-white/[0.06]"
                      >
                        {/* PEDIDO */}
                        <td className="px-5 py-4">
                          <span className="whitespace-nowrap font-mono text-sm font-black text-white">
                            #{comprobante.codigo_tracking}
                          </span>
                        </td>

                        {/* CLIENTE */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[#F5A300]">
                              <User size={16} />
                            </div>

                            <span className="text-sm font-semibold text-white/80">
                              {comprobante.cliente_nombre ||
                                'Cliente no registrado'}
                            </span>
                          </div>
                        </td>

                        {/* FECHA */}
                        <td className="px-5 py-4">
                          <span className="text-sm leading-relaxed text-white/50">
                            {new Date(
                              comprobante.fecha
                            ).toLocaleString('es-CR')}
                          </span>
                        </td>

                        {/* VER COMPROBANTE */}
                        <td className="px-5 py-4">
                          <a
                            href={
                              comprobante.comprobante_url ||
                              `http://localhost:8000/storage/${comprobante.comprobante}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                inline-flex
                items-center
                gap-2
                whitespace-nowrap
                rounded-xl
                border
                border-[#F5A300]/25
                bg-[#F5A300]/10
                px-3.5
                py-2
                text-xs
                font-black
                text-[#F5A300]
                transition-all
                hover:border-[#F5A300]
                hover:bg-[#F5A300]
                hover:text-black
                hover:shadow-lg
                hover:shadow-[#F5A300]/15
              "
                          >
                            <Eye size={15} />

                            Ver comprobante
                          </a>
                        </td>

                        {/* ESTADO */}
                        <td className="px-5 py-4">
                          <span
                            className={`
                inline-flex
                items-center
                gap-2
                whitespace-nowrap
                rounded-full
                border
                px-3
                py-1.5
                text-xs
                font-black
                uppercase
                tracking-wide
                ${comprobante.estado_pago ===
                                'verificado'
                                ? `
                      border-emerald-400/25
                      bg-emerald-400/10
                      text-emerald-300
                    `
                                : comprobante.estado_pago ===
                                  'rechazado'
                                  ? `
                        border-red-400/25
                        bg-red-400/10
                        text-red-300
                      `
                                  : `
                        border-amber-400/25
                        bg-amber-400/10
                        text-amber-300
                      `
                              }
              `}
                          >
                            {comprobante.estado_pago ===
                              'verificado' ? (
                              <CheckCircle2 size={14} />
                            ) : comprobante.estado_pago ===
                              'rechazado' ? (
                              <X size={14} />
                            ) : (
                              <Clock size={14} />
                            )}

                            {comprobante.estado_pago ===
                              'verificado'
                              ? 'Verificado'
                              : comprobante.estado_pago ===
                                'rechazado'
                                ? 'Rechazado'
                                : 'Pendiente'}
                          </span>
                        </td>

                        {/* ACCIONES */}
                        <td className="px-5 py-4">
                          <div className="flex min-w-[220px] items-center justify-end gap-2">
                            {comprobante.estado_pago !==
                              'verificado' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    verificarComprobante(
                                      comprobante.pedido_id,
                                      'verificado'
                                    )
                                  }
                                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-1.5
                    whitespace-nowrap
                    rounded-xl
                    border
                    border-emerald-400/25
                    bg-emerald-400/10
                    px-3.5
                    py-2
                    text-xs
                    font-black
                    text-emerald-300
                    transition-all
                    hover:border-emerald-400
                    hover:bg-emerald-400
                    hover:text-black
                  "
                                >
                                  <CheckCircle2 size={14} />

                                  Verificar
                                </button>
                              )}

                            {comprobante.estado_pago !==
                              'rechazado' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    verificarComprobante(
                                      comprobante.pedido_id,
                                      'rechazado'
                                    )
                                  }
                                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-1.5
                    whitespace-nowrap
                    rounded-xl
                    border
                    border-red-400/25
                    bg-red-400/10
                    px-3.5
                    py-2
                    text-xs
                    font-black
                    text-red-300
                    transition-all
                    hover:border-red-400
                    hover:bg-red-400
                    hover:text-white
                  "
                                >
                                  <X size={14} />

                                  Rechazar
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* GESTIÓN DE PERSONAL */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-white">
          Gestión de personal
        </h2>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-md">
          <div className="h-[4px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

          {cargandoLista ? (
            <p className="p-6 text-sm text-white/60">
              Cargando personal...
            </p>
          ) : errorLista ? (
            <p className="p-6 text-sm text-[#F09595]">
              {errorLista}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-white/10 bg-black/30">
                  <tr>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-[#F5A300]">
                      Nombre
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-[#F5A300]">
                      Correo
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-[#F5A300]">
                      Rol
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-[#F5A300]">
                      Estado
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-[#F5A300]">
                      Acción
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {usuarios.map(
                    (usuario) => (
                      <tr
                        key={usuario.id}
                        className="transition-colors hover:bg-white/10"
                      >
                        <td className="px-5 py-3.5 text-sm font-semibold text-white">
                          {
                            usuario.name
                          }
                        </td>

                        <td className="px-5 py-3.5 font-mono text-sm text-white/60">
                          {
                            usuario.email
                          }
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="text-xs font-bold uppercase tracking-wide text-white/70">
                            {ROLES.find(
                              (
                                rolDisponible
                              ) =>
                                rolDisponible.value ===
                                usuario.rol
                            )?.label ||
                              usuario.rol}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`
                              rounded-full
                              px-2.5 py-1
                              text-xs font-bold
                              uppercase
                              ${usuario.estado ===
                                'activo'
                                ? 'bg-[#EAF3DE] text-[#3B6D11]'
                                : 'bg-white/10 text-white/50'
                              }
                            `}
                          >
                            {
                              usuario.estado
                            }
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleEstado(
                                usuario
                              )
                            }
                            className="
                              text-sm font-bold
                              text-[#F5A300]
                              transition-colors
                              hover:text-[#E4002B]
                            "
                          >
                            {usuario.estado ===
                              'activo'
                              ? 'Desactivar'
                              : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL CREAR USUARIO */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#21150F]/95 shadow-2xl">
            <div className="h-[4px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h3 className="text-base font-black uppercase tracking-wide text-white">
                Nuevo personal
              </h3>

              <button
                type="button"
                onClick={() =>
                  setMostrarModal(false)
                }
                className="text-white/60 transition-colors hover:text-[#F5A300]"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={
                handleCrearUsuario
              }
              className="space-y-4 px-6 py-5"
            >
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-white/60">
                  Nombre completo
                </label>

                <input
                  type="text"
                  value={nombre}
                  onChange={(event) =>
                    setNombre(
                      event.target.value
                    )
                  }
                  required
                  className="
                    w-full rounded-lg
                    border border-white/15
                    bg-white/10
                    px-3.5 py-2.5
                    text-sm text-white
                    outline-none
                    transition
                    placeholder:text-white/30
                    focus:border-[#F5A300]
                    focus:ring-2
                    focus:ring-[#F5A300]/20
                  "
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-white/60">
                  Correo electrónico
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  required
                  className="
                    w-full rounded-lg
                    border border-white/15
                    bg-white/10
                    px-3.5 py-2.5
                    font-mono text-sm
                    text-white
                    outline-none
                    transition
                    placeholder:text-white/30
                    focus:border-[#F5A300]
                    focus:ring-2
                    focus:ring-[#F5A300]/20
                  "
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-white/60">
                  Contraseña
                </label>

                <div className="relative">
                  <input
                    type={
                      mostrarPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    required
                    minLength={6}
                    className="
                      w-full rounded-lg
                      border border-white/15
                      bg-white/10
                      px-3.5 py-2.5 pr-11
                      text-sm text-white
                      outline-none
                      transition
                      placeholder:text-white/30
                      focus:border-[#F5A300]
                      focus:ring-2
                      focus:ring-[#F5A300]/20
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarPassword(
                        !mostrarPassword
                      )
                    }
                    className="
                      absolute right-3 top-1/2
                      -translate-y-1/2
                      text-white/50
                      transition-colors
                      hover:text-[#F5A300]
                    "
                  >
                    {mostrarPassword ? (
                      <EyeOff
                        size={17}
                      />
                    ) : (
                      <Eye
                        size={17}
                      />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-white/60">
                  Rol
                </label>

                <select
                  value={rol}
                  onChange={(event) =>
                    setRol(
                      event.target.value
                    )
                  }
                  className="
                    w-full rounded-lg
                    border border-white/15
                    bg-black/40
                    px-3.5 py-2.5
                    text-sm text-white
                    outline-none
                    transition
                    focus:border-[#F5A300]
                    focus:ring-2
                    focus:ring-[#F5A300]/20
                  "
                >
                  {ROLES.map(
                    (rolDisponible) => (
                      <option
                        key={
                          rolDisponible.value
                        }
                        value={
                          rolDisponible.value
                        }
                      >
                        {
                          rolDisponible.label
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {errorForm && (
                <div className="rounded-lg border border-[#F09595] bg-[#FCEBEB] px-4 py-2.5 text-sm font-medium text-[#A32D2D]">
                  {errorForm}
                </div>
              )}

              <button
                type="submit"
                disabled={guardando}
                className="
                  w-full rounded-xl
                  bg-[#E4002B]
                  py-3
                  text-sm font-black
                  uppercase text-white
                  shadow-lg
                  transition-colors
                  hover:bg-[#F5A300]
                  disabled:opacity-50
                "
              >
                {guardando
                  ? 'Guardando...'
                  : 'Crear usuario'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default AdminDashboard