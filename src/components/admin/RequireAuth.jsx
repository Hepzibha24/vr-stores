import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../../data/auth'

/** Wraps the admin routes; anything under /admin bounces to the login screen. */
export default function RequireAuth({ children }) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }
  return children
}
