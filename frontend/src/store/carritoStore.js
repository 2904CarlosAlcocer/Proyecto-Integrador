import { create } from 'zustand'

const useCarritoStore = create((set) => ({
  items: [],
  modalidad: 'consumo_local', // 'consumo_local' o 'retiro'
  cliente: {
    nombre: '',
    telefono: '',
    correo: '',
  },

  // Agregar producto al carrito
  agregarProducto: (producto) =>
    set((state) => {
      const existente = state.items.find((item) => item.id === producto.id)

      if (existente) {
        return {
          items: state.items.map((item) =>
            item.id === producto.id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          ),
        }
      }

      return {
        items: [...state.items, { ...producto, cantidad: 1 }],
      }
    }),

  // Eliminar producto
  eliminarProducto: (productoId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== productoId),
    })),

  // Actualizar cantidad
  actualizarCantidad: (productoId, cantidad) =>
    set((state) => ({
      items: state.items
        .map((item) =>
          item.id === productoId ? { ...item, cantidad } : item
        )
        .filter((item) => item.cantidad > 0),
    })),

  // Cambiar modalidad
  setModalidad: (modalidad) => set({ modalidad }),

  // Actualizar datos del cliente
  setCliente: (cliente) => set({ cliente }),

  // Limpiar carrito
  limpiarCarrito: () =>
    set({
      items: [],
      cliente: { nombre: '', telefono: '', correo: '' },
    }),

  // Obtener total
  obtenerTotal: () => {
    return useCarritoStore.getState().items.reduce(
      (total, item) => total + item.precio * item.cantidad,
      0
    )
  },

  // Obtener cantidad de items
  obtenerCantidadItems: () => {
    return useCarritoStore.getState().items.reduce(
      (total, item) => total + item.cantidad,
      0
    )
  },
}))

export default useCarritoStore