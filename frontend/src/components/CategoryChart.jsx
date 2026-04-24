import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const PALETTE = [
  '#F5A623','#3DB87A','#E05A5A','#5B8DF5',
  '#A78BFA','#F472B6','#34D399','#FB923C',
]

function fmt(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-surface-700 border border-surface-600 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-surface-50 text-sm font-mono capitalize">{d.name}</p>
      <p className="text-amber-400 text-sm font-mono">{fmt(d.value)}</p>
    </div>
  )
}

export default function CategoryChart({ byCategory = {} }) {
  const data = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-40 text-surface-500 text-sm font-mono">
        No data yet
      </div>
    )
  }

  return (
    <div className="flex gap-6 items-center">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={72}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex-1 space-y-2">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: PALETTE[i % PALETTE.length] }}
              />
              <span className="text-xs font-mono text-surface-100 capitalize truncate">{d.name}</span>
            </div>
            <span className="text-xs font-mono text-surface-50 flex-shrink-0">{fmt(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
