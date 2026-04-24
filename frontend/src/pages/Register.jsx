import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useRegisterMutation } from '../services/finedgeApi'
import { setCredentials } from '../features/auth/authSlice'

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [register_, { isLoading, error }] = useRegisterMutation()

  const { register, handleSubmit, formState: { errors } } = useForm()

  async function onSubmit(data) {
    try {
      const result = await register_(data).unwrap()
      dispatch(setCredentials(result.data))
      navigate('/dashboard', { replace: true })
    } catch { }
  }

  const apiError = error?.data?.message

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-400/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-jade-400/5 blur-3xl" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
      </div>

      <div className="relative w-full max-w-sm animate-fade-up">
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl text-surface-50 mb-2">
            Fin<span className="text-amber-400">Edge</span>
          </h1>
          <p className="text-surface-100 font-body text-sm">Start tracking your finances</p>
        </div>

        <div className="card p-8 noise">
          <h2 className="font-body font-medium text-surface-50 text-lg mb-6">Create account</h2>

          {apiError && (
            <div className="bg-rose-400/10 border border-rose-400/30 rounded-xl px-4 py-3 mb-5">
              <p className="text-rose-400 text-sm font-mono">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                placeholder="Your full name"
                autoComplete="name"
                className="input"
                {...register('name', { required: 'Name required', minLength: { value: 2, message: 'Min 2 chars' } })}
              />
              {errors.name && <p className="text-rose-400 text-xs font-mono mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="input"
                {...register('email', { required: 'Email required' })}
              />
              {errors.email && <p className="text-rose-400 text-xs font-mono mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                autoComplete="new-password"
                className="input"
                {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 chars' } })}
              />
              {errors.password && <p className="text-rose-400 text-xs font-mono mt-1">{errors.password.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Monthly budget (₹)</label>
                <input
                  type="number"
                  placeholder="50000"
                  className="input font-mono"
                  {...register('monthlyBudget')}
                />
              </div>
              <div>
                <label className="label">Savings target (₹)</label>
                <input
                  type="number"
                  placeholder="10000"
                  className="input font-mono"
                  {...register('savingsTarget')}
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm font-body text-surface-100 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-400 hover:text-amber-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
