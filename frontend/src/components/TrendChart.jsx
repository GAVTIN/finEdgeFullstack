import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { format, parseISO } from 'date-fns'

function fmt(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-700 border border-surface-600 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-surface-100 text-xs font-mono mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm font-mono">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-surface-100 capitalize">{p.dataKey}</span>
          <span className="text-surface-50 ml-1">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function TrendChart({ data = [] }) {
  const formatted = data.map((d) => ({
    ...d,
    month: (() => {
      try { return format(parseISO(`${d.month}-01`), 'MMM yy') }
      catch { return d.month }
    })(),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={formatted} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#3DB87A" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#3DB87A" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#E05A5A" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#E05A5A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#272922" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: '#88877F', fontSize: 11, fontFamily: 'JetBrains Mono' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={fmt}
          tick={{ fill: '#88877F', fontSize: 11, fontFamily: 'JetBrains Mono' }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="income"  stroke="#3DB87A" strokeWidth={2} fill="url(#gIncome)"  dot={false} />
        <Area type="monotone" dataKey="expense" stroke="#E05A5A" strokeWidth={2} fill="url(#gExpense)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
