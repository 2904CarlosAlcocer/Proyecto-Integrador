import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import NavbarPublico from './components/NavbarPublico'
import Login from './components/Login'

// Páginas privadas
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminProductos = lazy(() => import('./pages/AdminProductos'))
const CocinaDashboard = lazy(() => import('./pages/CocinaDashboard'))
const CajaDashboard = lazy(() => import('./pages/CajaDashboard'))

// Páginas públicas
const Home = lazy(() => import('./pages/Home'))
const Nosotros = lazy(() => import('./pages/Nosotros'))
const Menu = lazy(() => import('./pages/Menu'))
const Carrito = lazy(() => import('./pages/Carrito'))
const Ubicacion = lazy(() => import('./pages/Ubicacion'))
const Contacto = lazy(() => import('./pages/Contacto'))
const EstadoPedido = lazy(() => import('./pages/EstadoPedido'))
const SubirComprobante = lazy(() => import('./pages/SubirComprobante'))
const Register = lazy(() => import('./pages/Register'))

function Cargando() {
  return (
    <div className="min-h-[100dvh] bg-[#120C08] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-white/20 border-t-[#F5A300] animate-spin" />

        <p className="text-white/60">
          Cargando...
        </p>
      </div>
    </div>
  )
}

/*
  El espacio para el navbar se aplica solamente
  en las páginas que realmente tienen navbar.
*/
function LayoutPublico({ children }) {
  return (
    <div className="min-h-[100dvh] bg-[#120C08]">
      <NavbarPublico />

      <main className="pt-[68px]">
        {children}
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Suspense fallback={<Cargando />}>
        <Routes>
          {/* LOGIN Y REGISTRO SIN NAVBAR */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PÁGINAS PÚBLICAS CON NAVBAR */}
          <Route
            path="/"
            element={
              <LayoutPublico>
                <Home />
              </LayoutPublico>
            }
          />

          <Route
            path="/nosotros"
            element={
              <LayoutPublico>
                <Nosotros />
              </LayoutPublico>
            }
          />

          <Route
            path="/menu"
            element={
              <LayoutPublico>
                <Menu />
              </LayoutPublico>
            }
          />

          <Route
            path="/ubicacion"
            element={
              <LayoutPublico>
                <Ubicacion />
              </LayoutPublico>
            }
          />

          <Route
            path="/contacto"
            element={
              <LayoutPublico>
                <Contacto />
              </LayoutPublico>
            }
          />

          <Route
            path="/carrito"
            element={
              <LayoutPublico>
                <Carrito />
              </LayoutPublico>
            }
          />

          <Route
            path="/estado-pedido"
            element={
              <LayoutPublico>
                <EstadoPedido />
              </LayoutPublico>
            }
          />

          <Route
            path="/subir-comprobante/:codigo"
            element={
              <LayoutPublico>
                <SubirComprobante />
              </LayoutPublico>
            }
          />

          {/* RUTAS PRIVADAS */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute rolesPermitidos={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/productos"
            element={
              <ProtectedRoute rolesPermitidos={['admin']}>
                <AdminProductos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cocina"
            element={
              <ProtectedRoute rolesPermitidos={['cocina', 'admin']}>
                <CocinaDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/caja"
            element={
              <ProtectedRoute rolesPermitidos={['caja', 'admin']}>
                <CajaDashboard />
              </ProtectedRoute>
            }
          />

          {/* RUTA NO ENCONTRADA */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App