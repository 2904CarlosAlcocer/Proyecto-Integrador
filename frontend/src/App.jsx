import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import SubirComprobante from './pages/SubirComprobante'

// Páginas privadas
import AdminDashboard from './pages/AdminDashboard'
import AdminProductos from './pages/AdminProductos'
import CocinaDashboard from './pages/CocinaDashboard'
import CajaDashboard from './pages/CajaDashboard'

// Páginas públicas
import NavbarPublico from './components/NavbarPublico'
import Home from './pages/Home'
import Nosotros from './pages/Nosotros'
import Menu from './pages/Menu'
import Carrito from './pages/Carrito'
import Ubicacion from './pages/Ubicacion'
import Contacto from './pages/Contacto'
import EstadoPedido from './pages/EstadoPedido'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <>
              <NavbarPublico />
              <Home />
            </>
          }
        />

        <Route
          path="/nosotros"
          element={
            <>
              <NavbarPublico />
              <Nosotros />
            </>
          }
        />

        <Route
          path="/menu"
          element={
            <>
              <NavbarPublico />
              <Menu />
            </>
          }
        />

        <Route
          path="/ubicacion"
          element={
            <>
              <NavbarPublico />
              <Ubicacion />
            </>
          }
        />
        <Route 
          path="/subir-comprobante/:codigo" 
          element={
            <>
              <NavbarPublico />
              <SubirComprobante />
            </>
          }
        />

        <Route
          path="/contacto"
          element={
            <>
              <NavbarPublico />
              <Contacto />
            </>
          }
        />

        <Route
          path="/carrito"
          element={
            <>
              <NavbarPublico />
              <Carrito />
            </>
          }
        />

        <Route
          path="/estado-pedido"
          element={
            <>
              <NavbarPublico />
              <EstadoPedido />
            </>
          }
        />

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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App