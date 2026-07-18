import { useState } from 'react'
import { Plus, Minus, X, Check, Pizza } from 'lucide-react'

export default function PersonalizadorPizza({ 
  producto, 
  onConfirmar, 
  onCancelar,
  extrasDisponibles = [] 
}) {
  const [extrasSeleccionados, setExtrasSeleccionados] = useState([])
  const [observaciones, setObservaciones] = useState('')
  const [mostrarExtras, setMostrarExtras] = useState(false)

  const toggleExtra = (extra) => {
    setExtrasSeleccionados(prev => {
      const existe = prev.find(e => e.id === extra.id)
      if (existe) {
        return prev.filter(e => e.id !== extra.id)
      }
      return [...prev, extra]
    })
  }

  // 🔥 FUNCIÓN PARA FORMATEAR PRECIO (SIN DECIMALES)
  const formatearPrecio = (monto) => {
    return monto.toLocaleString('es-CR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }

  // 🔥 FUNCIÓN PARA CALCULAR TOTAL CORRECTAMENTE
  const calcularTotal = () => {
    // Asegurar que el precio base es un número
    let total = parseFloat(producto.precio) || 0
    
    // Sumar cada extra correctamente
    extrasSeleccionados.forEach(extra => {
      const precioExtra = parseFloat(extra.precio_extra) || 1500
      total += precioExtra
    })
    
    return total
  }

  const handleConfirmar = () => {
    const totalCalculado = calcularTotal()
    
    onConfirmar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio: totalCalculado,
      cantidad: 1,
      imagen_url: producto.imagen_url,
      extras: extrasSeleccionados.map(e => e.nombre).join(', '),
      observaciones: observaciones,
      personalizacion: {
        extras: extrasSeleccionados,
        observaciones: observaciones,
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[10000] bg-black/75 backdrop-blur-md flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#160F0B] border border-[#F5A300]/30 rounded-3xl shadow-2xl">
        <div className="h-[4px] bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />
        
        <div className="p-6">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Pizza className="w-6 h-6 text-[#F5A300]" />
              <h2 className="text-xl font-bold text-white">
                Personalizar {producto.nombre}
              </h2>
            </div>
            <button onClick={onCancelar} className="text-white/40 hover:text-[#E4002B]">
              <X size={24} />
            </button>
          </div>

          {/* INGREDIENTES BASE */}
          {producto.ingredientes_base && producto.ingredientes_base.length > 0 && (
            <div className="mb-4 bg-white/5 rounded-xl p-3">
              <p className="text-white/60 text-xs font-bold uppercase tracking-wide mb-2">
                Ingredientes base
              </p>
              <div className="flex flex-wrap gap-2">
                {producto.ingredientes_base.map((ing) => (
                  <span key={ing.id} className="px-2 py-1 bg-[#F5A300]/20 text-[#F5A300] text-xs rounded-lg">
                    {ing.nombre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* EXTRAS */}
          <div className="mb-4">
            <button
              onClick={() => setMostrarExtras(!mostrarExtras)}
              className="text-[#F5A300] font-bold text-sm flex items-center gap-2 hover:underline"
            >
              {mostrarExtras ? 'Ocultar' : 'Mostrar'} extras disponibles
              <Plus size={16} className={mostrarExtras ? 'rotate-45' : ''} />
            </button>

            {mostrarExtras && (
              <div className="mt-2 space-y-2">
                {extrasDisponibles.map(extra => {
                  const seleccionado = extrasSeleccionados.some(e => e.id === extra.id)
                  return (
                    <button
                      key={extra.id}
                      onClick={() => toggleExtra(extra)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                        seleccionado
                          ? 'border-[#F5A300] bg-[#F5A300]/10 text-[#F5A300]'
                          : 'border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {seleccionado ? <Check size={16} className="text-[#F5A300]" /> : <Plus size={16} />}
                        {extra.nombre}
                      </span>
                      <span className="text-xs font-mono">
                        +₡{formatearPrecio(extra.precio_extra || 1500)}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* OBSERVACIONES */}
          <div className="mb-4">
            <label className="text-white/60 text-xs font-bold uppercase tracking-wide mb-1 block">
              📝 Observaciones
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: Sin cebolla, bien cocida, extra queso, soy alérgico al marisco, etc."
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 focus:border-[#F5A300] outline-none text-sm resize-none h-20"
            />
          </div>

          {/* TOTAL Y BOTONES */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div>
              <p className="text-white/60 text-xs">Total</p>
              <p className="text-[#F5A300] font-black text-2xl font-mono">
                ₡{formatearPrecio(calcularTotal())}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onCancelar}
                className="px-4 py-2 border border-white/10 text-white/60 hover:text-white rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                className="px-6 py-2 bg-gradient-to-r from-[#E4002B] to-[#F5A300] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#E4002B]/50 transition-all"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}