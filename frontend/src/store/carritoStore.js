import { create } from 'zustand'

const useCarritoStore = create((set, get) => ({
  items: [],
  modalidad: 'consumo_local',
  cliente: {
    nombre: '',
    telefono: '',
    correo: '',
  },

  agregarProducto: (producto) =>
    set((state) => {
      const existente = state.items.find((item) => item.id === producto.id)

      if (existente) {
        return {
          items: state.items.map((item) =>
            item.id === producto.id
              ? { 
                  ...item, 
                  cantidad: item.cantidad + (producto.cantidad || 1),
                  // 🔥 ACTUALIZAR PRECIO CON EXTRAS
                  precio: producto.precio || item.precio,
                  extras: producto.extras || item.extras,
                  observaciones: producto.observaciones || item.observaciones,
                  personalizacion: producto.personalizacion || item.personalizacion,
                }
              : item
          ),
        }
      }

      return {
        items: [
          ...state.items,
          {
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio, // ← YA VIENE CON EXTRAS DEL PERSONALIZADOR
            imagen_url: producto.imagen_url,
            descripcion: producto.descripcion,
            cantidad: producto.cantidad || 1,
            extras: producto.extras || null,
            observaciones: producto.observaciones || null,
            personalizacion: producto.personalizacion || null,
          },
        ],
      }
    }),

  eliminarProducto: (productoId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== productoId),
    })),

  actualizarCantidad: (productoId, cantidad) =>
    set((state) => ({
      items: state.items
        .map((item) =>
          item.id === productoId ? { ...item, cantidad } : item
        )
        .filter((item) => item.cantidad > 0),
    })),

  setModalidad: (modalidad) => set({ modalidad }),

  setCliente: (cliente) => set({ cliente }),

  limpiarCarrito: () =>
    set({
      items: [],
      cliente: { nombre: '', telefono: '', correo: '' },
    }),

  obtenerTotal: () => {
    return get().items.reduce(
      (total, item) => total + item.precio * item.cantidad,
      0
    )
  },

  obtenerCantidadItems: () => {
    return get().items.reduce(
      (total, item) => total + item.cantidad,
      0
    )
  },
}))

export default useCarritoStore