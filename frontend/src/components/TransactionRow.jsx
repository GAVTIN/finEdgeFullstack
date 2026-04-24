import { format, parseISO } from 'date-fns'
import { useDeleteTransactionMutation } from '../services/finedgeApi'

function fmt(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n)
}

export default function TransactionRow({ tx, onEdit, index }) {
  const [deleteTx, { isLoading }] = useDeleteTransactionMutation()

  const dateStr = (() => {
    try { return format(parseISO(tx.date), 'd MMM yy') }
    catch { return tx.date?.slice(0, 10) }
  })()

  return (
    <tr
      className="border-b border-surface-700 hover:bg-surface-700/40 transition-colors duration-100 animate-slide-in opacity-0 group"
      style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'forwards' }}
    >
      {/* Date */}
      <td className="py-3.5 px-5 text-xs font-mono text-surface-100 whitespace-nowrap">
        {dateStr}
      </td>

      {/* Description + category */}
      <td className="py-3.5 px-2">
        <p className="text-sm font-body text-surface-50 leading-tight">
          {tx.description || <span className="text-surface-500 italic">—</span>}
        </p>
        <p className="text-xs font-mono text-surface-500 mt-0.5 capitalize">{tx.category}</p>
      </td>

      {/* Type badge */}
      <td className="py-3.5 px-2">
        {tx.type === 'income'
          ? <span className="badge-income">↑ income</span>
          : <span className="badge-expense">↓ expense</span>
        }
      </td>

      {/* Amount */}
      <td className="py-3.5 px-5 text-right">
        <span className={`font-mono text-sm font-medium ${tx.type === 'income' ? 'text-jade-400' : 'text-rose-400'}`}>
          {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3.5 px-5 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={() => onEdit(tx)}
            className="text-surface-100 hover:text-amber-400 text-xs font-mono transition-colors"
          >
            edit
          </button>
          <span className="text-surface-600">·</span>
          <button
            onClick={() => deleteTx(tx.id)}
            disabled={isLoading}
            className="text-surface-100 hover:text-rose-400 text-xs font-mono transition-colors disabled:opacity-40"
          >
            {isLoading ? '…' : 'delete'}
          </button>
        </div>
      </td>
    </tr>
  )
}
