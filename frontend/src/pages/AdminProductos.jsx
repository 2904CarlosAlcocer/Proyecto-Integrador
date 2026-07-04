import { useState, useEffect } from 'react'
import api from '../api/axios'
import DashboardLayout from '../components/DashboardLayout'
import { Plus, X, Pencil, ImageOff } from 'lucide-react'

function AdminProductos() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [modalCategoria, setModalCategoria] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState(null)
  const [catNombre, setCatNombre] = useState('')
  const [catDescripcion, setCatDescripcion] = useState('')
  const [catError, setCatError] = useState('')
  const [catGuardando, setCatGuardando] = useState(false)

  const [modalProducto, setModalProducto] = useState(false)
  const [productoEditando, setProductoEditando] = useState(null)
  const [prodNombre, setProdNombre] = useState('')
  const [prodDescripcion, setProdDescripcion] = useState('')
  const [prodPrecio, setProdPrecio] = useState('')
  const [prodCategoriaId, setProdCategoriaId] = useState('')
  const [prodImagen, setProdImagen] = useState(null)
  const [prodPreview, setProdPreview] = useState(null)
  const [prodError, setProdError] = useState('')
  const [prodGuardando, setProdGuardando] = useState(false)

  const cargarDatos = async () => {
    setCargando(true)
    setError('')

    try {
      const [resCategorias, resProductos] = await Promise.all([
        api.get('/categorias'),
        api.get('/admin/productos'),
      ])

      setCategorias(resCategorias.data)
      setProductos(resProductos.data)
    } catch (err) {
      setError('No se pudo cargar el catálogo.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const abrirModalCategoria = (categoria = null) => {
    setCategoriaEditando(categoria)
    setCatNombre(categoria?.nombre || '')
    setCatDescripcion(categoria?.descripcion || '')
    setCatError('')
    setModalCategoria(true)
  }

  const guardarCategoria = async (e) => {
    e.preventDefault()
    setCatError('')
    setCatGuardando(true)

    try {
      const payload = {
        nombre: catNombre,
        descripcion: catDescripcion || null,
      }

      if (categoriaEditando) {
        await api.put(`/categorias/${categoriaEditando.id}`, payload)
      } else {
        await api.post('/categorias', payload)
      }

      setModalCategoria(false)
      cargarDatos()
    } catch (err) {
      setCatError(
        err.response?.data?.errors?.nombre?.[0] ||
          'No se pudo guardar la categoría.'
      )
    } finally {
      setCatGuardando(false)
    }
  }

  const toggleCategoria = async (categoria) => {
    try {
      await api.patch(`/categorias/${categoria.id}/toggle-estado`)
      cargarDatos()
    } catch (err) {
      setError('No se pudo actualizar el estado de la categoría.')
    }
  }

  const abrirModalProducto = (producto = null) => {
    setProductoEditando(producto)
    setProdNombre(producto?.nombre || '')
    setProdDescripcion(producto?.descripcion || '')
    setProdPrecio(producto?.precio || '')

    const catId =
      producto?.categoria_id || (categorias.length > 0 ? categorias[0].id : '')

    setProdCategoriaId(catId)
    setProdImagen(null)
    setProdPreview(producto?.imagen_url || null)
    setProdError('')
    setModalProducto(true)
  }

  const handleSeleccionImagen = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setProdImagen(file)
    setProdPreview(URL.createObjectURL(file))
  }

  const guardarProducto = async (e) => {
    e.preventDefault()
    setProdError('')
    setProdGuardando(true)

    const formData = new FormData()
    formData.append('nombre', prodNombre)
    formData.append('descripcion', prodDescripcion || '')
    formData.append('precio', String(prodPrecio).replace(',', '.'))
    formData.append('categoria_id', String(prodCategoriaId))

    if (prodImagen) {
      formData.append('imagen', prodImagen)
    }

    try {
      if (productoEditando) {
        await api.post(`/productos/${productoEditando.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      } else {
        await api.post('/productos', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      }

      setModalProducto(false)
      cargarDatos()
    } catch (err) {
      console.log(err.response?.data)

      const errores = err.response?.data?.errors

      setProdError(
        errores ? Object.values(errores)[0][0] : 'No se pudo guardar el producto.'
      )
    } finally {
      setProdGuardando(false)
    }
  }

  const toggleProducto = async (producto) => {
    try {
      await api.patch(`/productos/${producto.id}/toggle-estado`)
      cargarDatos()
    } catch (err) {
      setError('No se pudo actualizar el estado del producto.')
    }
  }

  const productosPorCategoria = productos.reduce((acc, p) => {
    const catNombre = p.categoria?.nombre || 'Sin categoría'
    if (!acc[catNombre]) acc[catNombre] = []
    acc[catNombre].push(p)
    return acc
  }, {})

  return (
    <DashboardLayout
      titulo="Catálogo"
      dark
      acciones={
        <div className="flex gap-2">
          <button
            onClick={() => abrirModalCategoria()}
            className="text-sm font-bold text-white/80 border border-white/15 hover:border-[#F5A300] hover:text-[#F5A300] py-2.5 px-4 rounded-xl transition-colors bg-white/10 backdrop-blur-md"
          >
            + Categoría
          </button>

          <button
            onClick={() => abrirModalProducto()}
            disabled={categorias.length === 0}
            className="flex items-center gap-2 bg-[#E4002B] hover:bg-[#F5A300] disabled:opacity-40 text-white text-sm font-black py-2.5 px-4 rounded-xl transition-colors shadow-lg"
          >
            <Plus size={16} />
            Nuevo producto
          </button>
        </div>
      }
    >
      {cargando ? (
        <p className="text-white/60 text-sm">Cargando catálogo...</p>
      ) : error ? (
        <p className="text-[#F09595] text-sm">{error}</p>
      ) : (
        <div className="space-y-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="h-[4px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

            <div className="px-5 py-3 border-b border-white/10 bg-black/20">
              <h3 className="text-xs font-bold text-[#F5A300] uppercase tracking-wide">
                Categorías
              </h3>
            </div>

            <div className="divide-y divide-white/10">
              {categorias.length === 0 ? (
                <p className="p-5 text-sm text-white/50">
                  No hay categorías todavía.
                </p>
              ) : (
                categorias.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">{cat.nombre}</p>

                      {cat.descripcion && (
                        <p className="text-xs text-white/50 mt-0.5">
                          {cat.descripcion}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                          cat.estado === 'activa'
                            ? 'bg-[#EAF3DE] text-[#3B6D11]'
                            : 'bg-white/10 text-white/50'
                        }`}
                      >
                        {cat.estado}
                      </span>

                      <button
                        onClick={() => abrirModalCategoria(cat)}
                        className="text-white/60 hover:text-[#F5A300] transition-colors"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        onClick={() => toggleCategoria(cat)}
                        className="text-sm font-bold text-[#F5A300] hover:text-[#E4002B] transition-colors"
                      >
                        {cat.estado === 'activa' ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {Object.entries(productosPorCategoria).map(([catNombre, items]) => (
            <div key={catNombre}>
              <h3 className="text-[#F5A300] text-xs font-black uppercase tracking-wide mb-3">
                {catNombre}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((producto) => (
                  <div
                    key={producto.id}
                    className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                  >
                    <div className="aspect-video bg-black/30 flex items-center justify-center overflow-hidden">
                      {producto.imagen_url ? (
                        <img
                          src={producto.imagen_url}
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageOff size={28} className="text-white/30" />
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-bold text-white">
                          {producto.nombre}
                        </p>

                        <span
                          className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full shrink-0 ${
                            producto.estado === 'disponible'
                              ? 'bg-[#EAF3DE] text-[#3B6D11]'
                              : 'bg-white/10 text-white/50'
                          }`}
                        >
                          {producto.estado}
                        </span>
                      </div>

                      {producto.descripcion && (
                        <p className="text-xs text-white/60 mb-2 line-clamp-2">
                          {producto.descripcion}
                        </p>
                      )}

                      <p className="text-[#F5A300] font-black font-mono text-lg mb-3">
                        ₡{parseFloat(producto.precio).toLocaleString('es-CR')}
                      </p>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => abrirModalProducto(producto)}
                          className="flex items-center gap-1 text-sm font-bold text-white hover:text-[#F5A300] transition-colors"
                        >
                          <Pencil size={14} />
                          Editar
                        </button>

                        <button
                          onClick={() => toggleProducto(producto)}
                          className="text-sm font-bold text-[#F5A300] hover:text-[#E4002B] transition-colors"
                        >
                          {producto.estado === 'disponible'
                            ? 'Marcar agotado'
                            : 'Marcar disponible'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalCategoria && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#21150F]/95 rounded-2xl shadow-2xl w-full max-w-sm border border-white/10 overflow-hidden">
            <div className="h-[4px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-base font-black text-white uppercase tracking-wide">
                {categoriaEditando ? 'Editar categoría' : 'Nueva categoría'}
              </h3>

              <button
                onClick={() => setModalCategoria(false)}
                className="text-white/60 hover:text-[#F5A300] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={guardarCategoria} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wide mb-1.5">
                  Nombre
                </label>

                <input
                  type="text"
                  value={catNombre}
                  onChange={(e) => setCatNombre(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-white/10 text-white focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/20 outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wide mb-1.5">
                  Descripción
                </label>

                <input
                  type="text"
                  value={catDescripcion}
                  onChange={(e) => setCatDescripcion(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-white/10 text-white focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/20 outline-none transition text-sm"
                />
              </div>

              {catError && (
                <div className="bg-[#FCEBEB] border border-[#F09595] text-[#A32D2D] text-sm font-medium px-4 py-2.5 rounded-lg">
                  {catError}
                </div>
              )}

              <button
                type="submit"
                disabled={catGuardando}
                className="w-full bg-[#E4002B] hover:bg-[#F5A300] disabled:opacity-50 text-white font-black py-3 rounded-xl transition-colors text-sm uppercase shadow-lg"
              >
                {catGuardando ? 'Guardando...' : 'Guardar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {modalProducto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 overflow-y-auto py-8">
          <div className="bg-[#21150F]/95 rounded-2xl shadow-2xl w-full max-w-md border border-white/10 overflow-hidden">
            <div className="h-[4px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-base font-black text-white uppercase tracking-wide">
                {productoEditando ? 'Editar producto' : 'Nuevo producto'}
              </h3>

              <button
                onClick={() => setModalProducto(false)}
                className="text-white/60 hover:text-[#F5A300] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={guardarProducto} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wide mb-1.5">
                  Imagen
                </label>

                <label className="flex items-center justify-center w-full h-36 rounded-xl border-2 border-dashed border-white/15 hover:border-[#F5A300] cursor-pointer overflow-hidden bg-black/30 transition-colors">
                  {prodPreview ? (
                    <img
                      src={prodPreview}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-white/50">
                      Clic para subir una imagen
                    </span>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSeleccionImagen}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wide mb-1.5">
                  Nombre
                </label>

                <input
                  type="text"
                  value={prodNombre}
                  onChange={(e) => setProdNombre(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-white/10 text-white focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/20 outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wide mb-1.5">
                  Descripción
                </label>

                <textarea
                  value={prodDescripcion}
                  onChange={(e) => setProdDescripcion(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-white/10 text-white focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/20 outline-none transition text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-wide mb-1.5">
                    Precio (₡)
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={prodPrecio}
                    onChange={(e) => setProdPrecio(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-white/10 text-white focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/20 outline-none transition text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-wide mb-1.5">
                    Categoría
                  </label>

                  <select
                    value={prodCategoriaId}
                    onChange={(e) => setProdCategoriaId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-black/40 text-white focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/20 outline-none transition text-sm"
                  >
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {prodError && (
                <div className="bg-[#FCEBEB] border border-[#F09595] text-[#A32D2D] text-sm font-medium px-4 py-2.5 rounded-lg">
                  {prodError}
                </div>
              )}

              <button
                type="submit"
                disabled={prodGuardando}
                className="w-full bg-[#E4002B] hover:bg-[#F5A300] disabled:opacity-50 text-white font-black py-3 rounded-xl transition-colors text-sm uppercase shadow-lg"
              >
                {prodGuardando ? 'Guardando...' : 'Guardar producto'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default AdminProductos