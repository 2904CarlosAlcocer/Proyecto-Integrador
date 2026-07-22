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
  const [prodPrecioPersonal, setProdPrecioPersonal] = useState('')
  const [prodCategoriaId, setProdCategoriaId] = useState('')
  const [prodImagen, setProdImagen] = useState(null)
  const [prodPreview, setProdPreview] = useState(null)
  const [prodError, setProdError] = useState('')
  const [prodGuardando, setProdGuardando] = useState(false)

  const formatearColones = (monto) => {
    return Math.round(
      Number(monto || 0)
    ).toLocaleString('es-CR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }

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

  const esCategoriaPizzas = (categoriaId) => {
    const categoria = categorias.find(
      (item) => Number(item.id) === Number(categoriaId)
    )

    return String(categoria?.nombre || '')
      .trim()
      .toLowerCase() === 'pizzas'
  }

  const categoriaProductoEsPizza =
    esCategoriaPizzas(prodCategoriaId)

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

    setProdPrecio(
      producto?.precio !== null &&
      producto?.precio !== undefined
        ? String(
            Math.round(
              Number(producto.precio)
            )
          )
        : ''
    )

    setProdPrecioPersonal(
      Number(producto?.precio_personal) > 0
        ? String(
            Math.round(
              Number(
                producto.precio_personal
              )
            )
          )
        : ''
    )

    const catId =
      producto?.categoria_id ||
      (
        categorias.length > 0
          ? categorias[0].id
          : ''
      )

    setProdCategoriaId(catId)
    setProdImagen(null)
    setProdPreview(producto?.imagen_url || null)
    setProdError('')
    setModalProducto(true)
  }

  const handleSeleccionImagen = (e) => {
    const file = e.target.files[0]

    if (!file) {
      return
    }

    setProdImagen(file)
    setProdPreview(
      URL.createObjectURL(file)
    )
  }

  const guardarProducto = async (e) => {
    e.preventDefault()
    setProdError('')
    setProdGuardando(true)

    const formData = new FormData()

    formData.append(
      'nombre',
      prodNombre
    )

    formData.append(
      'descripcion',
      prodDescripcion || ''
    )

    formData.append(
      'precio',
      String(prodPrecio)
    )

    formData.append(
      'precio_personal',
      categoriaProductoEsPizza &&
      prodPrecioPersonal !== ''
        ? String(prodPrecioPersonal)
        : ''
    )

    formData.append(
      'categoria_id',
      String(prodCategoriaId)
    )

    if (prodImagen) {
      formData.append(
        'imagen',
        prodImagen
      )
    }

    try {
      if (productoEditando) {
        await api.post(
          `/productos/${productoEditando.id}`,
          formData,
          {
            headers: {
              'Content-Type':
                'multipart/form-data',
            },
          }
        )
      } else {
        await api.post(
          '/productos',
          formData,
          {
            headers: {
              'Content-Type':
                'multipart/form-data',
            },
          }
        )
      }

      setModalProducto(false)
      cargarDatos()
    } catch (err) {
      console.log(
        err.response?.data
      )

      const errores =
        err.response?.data?.errors

      setProdError(
        errores
          ? Object.values(errores)[0][0]
          : 'No se pudo guardar el producto.'
      )
    } finally {
      setProdGuardando(false)
    }
  }

  const toggleProducto = async (producto) => {
    try {
      await api.patch(
        `/productos/${producto.id}/toggle-estado`
      )

      cargarDatos()
    } catch (err) {
      setError(
        'No se pudo actualizar el estado del producto.'
      )
    }
  }

  const productosPorCategoria =
    productos.reduce(
      (acc, producto) => {
        const categoriaNombre =
          producto.categoria?.nombre ||
          'Sin categoría'

        if (!acc[categoriaNombre]) {
          acc[categoriaNombre] = []
        }

        acc[categoriaNombre].push(
          producto
        )

        return acc
      },
      {}
    )

  return (
    <DashboardLayout
      titulo="Catálogo"
      dark
      acciones={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              abrirModalCategoria()
            }
            className="
              rounded-xl
              border border-white/15
              bg-white/10
              px-4 py-2.5
              text-sm font-bold
              text-white/80
              backdrop-blur-md
              transition-colors
              hover:border-[#F5A300]
              hover:text-[#F5A300]
            "
          >
            + Categoría
          </button>

          <button
            type="button"
            onClick={() =>
              abrirModalProducto()
            }
            disabled={
              categorias.length === 0
            }
            className="
              flex items-center gap-2
              rounded-xl
              bg-[#E4002B]
              px-4 py-2.5
              text-sm font-black
              text-white
              shadow-lg
              transition-colors
              hover:bg-[#F5A300]
              disabled:opacity-40
            "
          >
            <Plus size={16} />
            Nuevo producto
          </button>
        </div>
      }
    >
      {cargando ? (
        <p className="text-sm text-white/60">
          Cargando catálogo...
        </p>
      ) : error ? (
        <p className="text-sm text-[#F09595]">
          {error}
        </p>
      ) : (
        <div className="space-y-8">
          <div className="
            overflow-hidden
            rounded-2xl
            border border-white/10
            bg-white/10
            shadow-2xl
            backdrop-blur-md
          ">
            <div className="
              h-[4px]
              bg-gradient-to-r
              from-[#E4002B]
              via-[#F5A300]
              to-[#E4002B]
            " />

            <div className="
              border-b border-white/10
              bg-black/20
              px-5 py-3
            ">
              <h3 className="
                text-xs font-bold
                uppercase tracking-wide
                text-[#F5A300]
              ">
                Categorías
              </h3>
            </div>

            <div className="
              divide-y divide-white/10
            ">
              {categorias.length === 0 ? (
                <p className="
                  p-5
                  text-sm text-white/50
                ">
                  No hay categorías todavía.
                </p>
              ) : (
                categorias.map(
                  (categoria) => (
                    <div
                      key={categoria.id}
                      className="
                        flex items-center
                        justify-between
                        px-5 py-3
                        transition-colors
                        hover:bg-white/5
                      "
                    >
                      <div>
                        <p className="
                          text-sm font-bold
                          text-white
                        ">
                          {categoria.nombre}
                        </p>

                        {categoria.descripcion && (
                          <p className="
                            mt-0.5
                            text-xs
                            text-white/50
                          ">
                            {
                              categoria.descripcion
                            }
                          </p>
                        )}
                      </div>

                      <div className="
                        flex items-center gap-3
                      ">
                        <span
                          className={`
                            rounded-full
                            px-2.5 py-1
                            text-xs font-bold
                            uppercase
                            ${
                              categoria.estado ===
                              'activa'
                                ? `
                                  bg-[#EAF3DE]
                                  text-[#3B6D11]
                                `
                                : `
                                  bg-white/10
                                  text-white/50
                                `
                            }
                          `}
                        >
                          {categoria.estado}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            abrirModalCategoria(
                              categoria
                            )
                          }
                          aria-label={
                            `Editar categoría ${categoria.nombre}`
                          }
                          className="
                            text-white/60
                            transition-colors
                            hover:text-[#F5A300]
                          "
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            toggleCategoria(
                              categoria
                            )
                          }
                          className="
                            text-sm font-bold
                            text-[#F5A300]
                            transition-colors
                            hover:text-[#E4002B]
                          "
                        >
                          {categoria.estado ===
                          'activa'
                            ? 'Desactivar'
                            : 'Activar'}
                        </button>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>

          {Object.entries(
            productosPorCategoria
          ).map(
            ([
              categoriaNombre,
              productosCategoria,
            ]) => (
              <div key={categoriaNombre}>
                <h3 className="
                  mb-3
                  text-xs font-black
                  uppercase tracking-wide
                  text-[#F5A300]
                ">
                  {categoriaNombre}
                </h3>

                <div className="
                  grid grid-cols-1
                  gap-4
                  sm:grid-cols-2
                  lg:grid-cols-3
                ">
                  {productosCategoria.map(
                    (producto) => (
                      <div
                        key={producto.id}
                        className="
                          overflow-hidden
                          rounded-2xl
                          border border-white/10
                          bg-white/10
                          shadow-2xl
                          backdrop-blur-md
                        "
                      >
                        <div className="
                          flex aspect-video
                          items-center
                          justify-center
                          overflow-hidden
                          bg-black/30
                        ">
                          {producto.imagen_url ? (
                            <img
                              src={
                                producto.imagen_url
                              }
                              alt={
                                producto.nombre
                              }
                              className="
                                h-full w-full
                                object-cover
                              "
                            />
                          ) : (
                            <ImageOff
                              size={28}
                              className="
                                text-white/30
                              "
                            />
                          )}
                        </div>

                        <div className="p-4">
                          <div className="
                            mb-1
                            flex items-start
                            justify-between
                            gap-2
                          ">
                            <p className="
                              text-sm font-bold
                              text-white
                            ">
                              {producto.nombre}
                            </p>

                            <span
                              className={`
                                shrink-0
                                rounded-full
                                px-2.5 py-1
                                text-xs font-bold
                                uppercase
                                ${
                                  producto.estado ===
                                  'disponible'
                                    ? `
                                      bg-[#EAF3DE]
                                      text-[#3B6D11]
                                    `
                                    : `
                                      bg-white/10
                                      text-white/50
                                    `
                                }
                              `}
                            >
                              {producto.estado}
                            </span>
                          </div>

                          {producto.descripcion && (
                            <p className="
                              mb-3
                              line-clamp-2
                              text-xs
                              text-white/60
                            ">
                              {
                                producto.descripcion
                              }
                            </p>
                          )}

                          {Number(
                            producto
                              .precio_personal
                          ) > 0 ? (
                            <div className="
                              mb-4
                              grid grid-cols-2
                              overflow-hidden
                              rounded-xl
                              border border-white/10
                              bg-black/25
                            ">
                              <div className="
                                border-r
                                border-white/10
                                p-3
                              ">
                                <span className="
                                  mb-1 block
                                  text-[9px]
                                  font-black
                                  uppercase
                                  tracking-[0.14em]
                                  text-white/40
                                ">
                                  Grande
                                </span>

                                <p className="
                                  whitespace-nowrap
                                  font-mono
                                  text-base
                                  font-black
                                  text-[#F5A300]
                                ">
                                  ₡
                                  {formatearColones(
                                    producto.precio
                                  )}
                                </p>
                              </div>

                              <div className="p-3">
                                <span className="
                                  mb-1 block
                                  text-[9px]
                                  font-black
                                  uppercase
                                  tracking-[0.14em]
                                  text-white/40
                                ">
                                  Personal
                                </span>

                                <p className="
                                  whitespace-nowrap
                                  font-mono
                                  text-base
                                  font-black
                                  text-[#F5A300]
                                ">
                                  ₡
                                  {formatearColones(
                                    producto
                                      .precio_personal
                                  )}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="
                              mb-4
                              rounded-xl
                              border border-white/10
                              bg-black/25
                              p-3
                            ">
                              <span className="
                                mb-1 block
                                text-[9px]
                                font-black
                                uppercase
                                tracking-[0.14em]
                                text-white/40
                              ">
                                Precio
                              </span>

                              <p className="
                                whitespace-nowrap
                                font-mono
                                text-lg
                                font-black
                                text-[#F5A300]
                              ">
                                ₡
                                {formatearColones(
                                  producto.precio
                                )}
                              </p>
                            </div>
                          )}

                          <div className="
                            flex items-center gap-3
                          ">
                            <button
                              type="button"
                              onClick={() =>
                                abrirModalProducto(
                                  producto
                                )
                              }
                              className="
                                flex items-center
                                gap-1
                                text-sm font-bold
                                text-white
                                transition-colors
                                hover:text-[#F5A300]
                              "
                            >
                              <Pencil size={14} />
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                toggleProducto(
                                  producto
                                )
                              }
                              className="
                                text-sm font-bold
                                text-[#F5A300]
                                transition-colors
                                hover:text-[#E4002B]
                              "
                            >
                              {producto.estado ===
                              'disponible'
                                ? 'Marcar agotado'
                                : 'Marcar disponible'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {modalCategoria && (
        <div className="
          fixed inset-0 z-50
          flex items-center
          justify-center
          bg-black/70
          px-4
          backdrop-blur-sm
        ">
          <div className="
            w-full max-w-sm
            overflow-hidden
            rounded-2xl
            border border-white/10
            bg-[#21150F]/95
            shadow-2xl
          ">
            <div className="
              h-[4px]
              bg-gradient-to-r
              from-[#E4002B]
              via-[#F5A300]
              to-[#E4002B]
            " />

            <div className="
              flex items-center
              justify-between
              border-b
              border-white/10
              px-6 py-4
            ">
              <h3 className="
                text-base font-black
                uppercase tracking-wide
                text-white
              ">
                {categoriaEditando
                  ? 'Editar categoría'
                  : 'Nueva categoría'}
              </h3>

              <button
                type="button"
                onClick={() =>
                  setModalCategoria(false)
                }
                className="
                  text-white/60
                  transition-colors
                  hover:text-[#F5A300]
                "
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={guardarCategoria}
              className="
                space-y-4
                px-6 py-5
              "
            >
              <div>
                <label className="
                  mb-1.5 block
                  text-xs font-bold
                  uppercase tracking-wide
                  text-white/60
                ">
                  Nombre
                </label>

                <input
                  type="text"
                  value={catNombre}
                  onChange={(e) =>
                    setCatNombre(
                      e.target.value
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
                    focus:border-[#F5A300]
                    focus:ring-2
                    focus:ring-[#F5A300]/20
                  "
                />
              </div>

              <div>
                <label className="
                  mb-1.5 block
                  text-xs font-bold
                  uppercase tracking-wide
                  text-white/60
                ">
                  Descripción
                </label>

                <input
                  type="text"
                  value={catDescripcion}
                  onChange={(e) =>
                    setCatDescripcion(
                      e.target.value
                    )
                  }
                  className="
                    w-full rounded-lg
                    border border-white/15
                    bg-white/10
                    px-3.5 py-2.5
                    text-sm text-white
                    outline-none
                    transition
                    focus:border-[#F5A300]
                    focus:ring-2
                    focus:ring-[#F5A300]/20
                  "
                />
              </div>

              {catError && (
                <div className="
                  rounded-lg
                  border border-[#F09595]
                  bg-[#FCEBEB]
                  px-4 py-2.5
                  text-sm font-medium
                  text-[#A32D2D]
                ">
                  {catError}
                </div>
              )}

              <button
                type="submit"
                disabled={catGuardando}
                className="
                  w-full rounded-xl
                  bg-[#E4002B]
                  py-3
                  text-sm font-black
                  uppercase
                  text-white
                  shadow-lg
                  transition-colors
                  hover:bg-[#F5A300]
                  disabled:opacity-50
                "
              >
                {catGuardando
                  ? 'Guardando...'
                  : 'Guardar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {modalProducto && (
        <div className="
          fixed inset-0 z-50
          flex items-center
          justify-center
          overflow-y-auto
          bg-black/70
          px-4 py-8
          backdrop-blur-sm
        ">
          <div className="
            w-full max-w-md
            overflow-hidden
            rounded-2xl
            border border-white/10
            bg-[#21150F]/95
            shadow-2xl
          ">
            <div className="
              h-[4px]
              bg-gradient-to-r
              from-[#E4002B]
              via-[#F5A300]
              to-[#E4002B]
            " />

            <div className="
              flex items-center
              justify-between
              border-b
              border-white/10
              px-6 py-4
            ">
              <h3 className="
                text-base font-black
                uppercase tracking-wide
                text-white
              ">
                {productoEditando
                  ? 'Editar producto'
                  : 'Nuevo producto'}
              </h3>

              <button
                type="button"
                onClick={() =>
                  setModalProducto(false)
                }
                className="
                  text-white/60
                  transition-colors
                  hover:text-[#F5A300]
                "
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={guardarProducto}
              className="
                space-y-4
                px-6 py-5
              "
            >
              <div>
                <label className="
                  mb-1.5 block
                  text-xs font-bold
                  uppercase tracking-wide
                  text-white/60
                ">
                  Imagen
                </label>

                <label className="
                  flex h-36 w-full
                  cursor-pointer
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-xl
                  border-2
                  border-dashed
                  border-white/15
                  bg-black/30
                  transition-colors
                  hover:border-[#F5A300]
                ">
                  {prodPreview ? (
                    <img
                      src={prodPreview}
                      alt="Vista previa"
                      className="
                        h-full w-full
                        object-cover
                      "
                    />
                  ) : (
                    <span className="
                      text-xs text-white/50
                    ">
                      Clic para subir una imagen
                    </span>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleSeleccionImagen
                    }
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="
                  mb-1.5 block
                  text-xs font-bold
                  uppercase tracking-wide
                  text-white/60
                ">
                  Nombre
                </label>

                <input
                  type="text"
                  value={prodNombre}
                  onChange={(e) =>
                    setProdNombre(
                      e.target.value
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
                    focus:border-[#F5A300]
                    focus:ring-2
                    focus:ring-[#F5A300]/20
                  "
                />
              </div>

              <div>
                <label className="
                  mb-1.5 block
                  text-xs font-bold
                  uppercase tracking-wide
                  text-white/60
                ">
                  Descripción
                </label>

                <textarea
                  value={prodDescripcion}
                  onChange={(e) =>
                    setProdDescripcion(
                      e.target.value
                    )
                  }
                  rows={2}
                  className="
                    w-full resize-none
                    rounded-lg
                    border border-white/15
                    bg-white/10
                    px-3.5 py-2.5
                    text-sm text-white
                    outline-none
                    transition
                    focus:border-[#F5A300]
                    focus:ring-2
                    focus:ring-[#F5A300]/20
                  "
                />
              </div>

              <div className="
                grid grid-cols-1
                gap-3
                sm:grid-cols-2
              ">
                <div>
                  <label className="
                    mb-1.5 block
                    text-xs font-bold
                    uppercase tracking-wide
                    text-white/60
                  ">
                    {categoriaProductoEsPizza
                      ? 'Precio grande (₡)'
                      : 'Precio (₡)'}
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={prodPrecio}
                    onChange={(e) => {
                      const valor =
                        e.target.value.replace(
                          /\D/g,
                          ''
                        )

                      setProdPrecio(valor)
                    }}
                    placeholder="Ej: 11000"
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

                {categoriaProductoEsPizza && (
                  <div>
                    <label className="
                      mb-1.5 block
                      text-xs font-bold
                      uppercase tracking-wide
                      text-white/60
                    ">
                      Precio personal (₡)
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={
                        prodPrecioPersonal
                      }
                      onChange={(e) => {
                        const valor =
                          e.target.value.replace(
                            /\D/g,
                            ''
                          )

                        setProdPrecioPersonal(
                          valor
                        )
                      }}
                      placeholder="Ej: 6500"
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

                    <p className="
                      mt-1
                      text-[10px]
                      text-white/40
                    ">
                      Déjalo vacío si la pizza
                      solo tiene un precio.
                    </p>
                  </div>
                )}

                <div
                  className={
                    categoriaProductoEsPizza
                      ? 'sm:col-span-2'
                      : ''
                  }
                >
                  <label className="
                    mb-1.5 block
                    text-xs font-bold
                    uppercase tracking-wide
                    text-white/60
                  ">
                    Categoría
                  </label>

                  <select
                    value={prodCategoriaId}
                    onChange={(e) => {
                      const nuevaCategoriaId =
                        e.target.value

                      setProdCategoriaId(
                        nuevaCategoriaId
                      )

                      if (
                        !esCategoriaPizzas(
                          nuevaCategoriaId
                        )
                      ) {
                        setProdPrecioPersonal(
                          ''
                        )
                      }
                    }}
                    required
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
                    {categorias.map(
                      (categoria) => (
                        <option
                          key={categoria.id}
                          value={categoria.id}
                        >
                          {
                            categoria.nombre
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {prodError && (
                <div className="
                  rounded-lg
                  border border-[#F09595]
                  bg-[#FCEBEB]
                  px-4 py-2.5
                  text-sm font-medium
                  text-[#A32D2D]
                ">
                  {prodError}
                </div>
              )}

              <button
                type="submit"
                disabled={prodGuardando}
                className="
                  w-full rounded-xl
                  bg-[#E4002B]
                  py-3
                  text-sm font-black
                  uppercase
                  text-white
                  shadow-lg
                  transition-colors
                  hover:bg-[#F5A300]
                  disabled:opacity-50
                "
              >
                {prodGuardando
                  ? 'Guardando...'
                  : 'Guardar producto'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default AdminProductos