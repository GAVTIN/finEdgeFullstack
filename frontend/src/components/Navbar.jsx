import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useNavigate } from 'react-router-dom'
import { logout, selectCurrentUser } from '../features/auth/authSlice'
import { finedgeApi } from '../services/finedgeApi'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
]

export default function Navbar() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const user      = useSelector(selectCurrentUser)

  function handleLogout() {
    dispatch(logout())
    dispatch(finedgeApi.util.resetApiState())
    navigate('/login')
  }

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'FE'

  return (
    <nav className="border-b border-surface-600 bg-surface-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-8">
          <span className="font-display text-xl text-surface-50 tracking-tight">
            Fin<span className="text-amber-400">Edge</span>
          </span>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-1">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-lg text-sm font-body transition-all duration-150 ${
                    isActive
                      ? 'text-amber-400 bg-amber-400/10'
                      : 'text-surface-100 hover:text-surface-50 hover:bg-surface-700'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-body text-surface-50 leading-none">{user?.name}</p>
            <p className="text-xs font-mono text-surface-100 mt-0.5">{user?.email}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
            <span className="text-xs font-mono font-medium text-amber-400">{initials}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-surface-100 hover:text-rose-400 transition-colors text-sm font-body ml-1"
          >
            Exit
          </button>
        </div>
      </div>
    </nav>
  )
}
