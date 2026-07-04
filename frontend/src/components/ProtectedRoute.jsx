import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

function ProtectedRoute({ children, rolesPermitidos }) {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)

  if (!user || !token) {
    return <Navigate to="/login" replace />
  }

  if (rolesPermitidos && !rolesPermitidos.includes(user.rol)) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute