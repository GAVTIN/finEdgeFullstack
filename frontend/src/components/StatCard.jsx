function fmt(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n ?? 0)
}

export default function StatCard({ label, value, type, delay = 0, note }) {
  const glowClass = {
    income:  'glow-jade',
    expense: 'glow-rose',
    balance: value >= 0 ? 'glow-amber' : 'glow-rose',
  }[type] || ''

  const valueColor = {
    income:  'text-jade-400',
    expense: 'text-rose-400',
    balance: value >= 0 ? 'text-amber-400' : 'text-rose-400',
  }[type] || 'text-surface-50'

  const dot = {
    income:  'bg-jade-400',
    expense: 'bg-rose-400',
    balance: 'bg-amber-400',
  }[type] || 'bg-surface-500'

  return (
    <div
      className={`stat-card ${glowClass} animate-fade-up opacity-0`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Subtle top accent line */}
      <div className={`absolute top-0 left-6 right-6 h-px ${dot} opacity-40 rounded-full`} />

      <div className="flex items-center gap-2 mb-4">
        <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <p className="stat-label">{label}</p>
      </div>

      <p className={`stat-value ${valueColor}`}>{fmt(value)}</p>

      {note && (
        <p className="text-surface-100 text-xs font-mono mt-2">{note}</p>
      )}
    </div>
  )
}
