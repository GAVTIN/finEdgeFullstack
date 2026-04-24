import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { selectCurrentToken } from './authSlice'

export default function PrivateRoute() {
  const token    = useSelector(selectCurrentToken)
  const location = useLocation()
  return token
    ? <Outlet />
    : <Navigate to="/login" state={{ from: location }} replace />
}
