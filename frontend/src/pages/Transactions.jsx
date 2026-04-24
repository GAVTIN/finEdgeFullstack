import { useState, useMemo } from 'react'
import { useGetTransactionsQuery } from '../services/finedgeApi'
import TransactionRow from '../components/TransactionRow'
import AddTransactionModal from '../components/AddTransactionModal'

const CATEGORIES = [
  'all', 'salary', 'freelance', 'investment', 'bonus',
  'food', 'rent', 'transport', 'utilities',
  'entertainment', 'healthcare', 'shopping', 'other',
]

function fmt(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n ?? 0)
}

export default function Transactions() {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  // Filter state
  const [type, setType] = useState('all')
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [sortDir, setSortDir] = useState('desc')

  const { data, isLoading } = useGetTransactionsQuery()
  const all = data?.data?.transactions || []

  const filtered = useMemo(() => {
    let list = [...all]
    if (type !== 'all') list = list.filter((t) => t.type === type)
    if (category !== 'all') list = list.filter((t) => t.category === category)
    if (search.trim()) list = list.filter((t) =>
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase())
    )
    list.sort((a, b) => {
      const diff = new Date(a.date) - new Date(b.date)
      return sortDir === 'desc' ? -diff : diff
    })
    return list
  }, [all, type, category, search, sortDir])

  const totals = useMemo(() => ({
    income: filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    expense: filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
  }), [filtered])

  function openEdit(tx) { setEditing(tx); setShowModal(true) }
  function closeModal() { setEditing(null); setShowModal(false) }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-up opacity-0 stagger-1">
        <div>
          <h1 className="font-display text-4xl text-surface-50">Transactions<span className="text-amber-400">.</span></h1>
          <p className="text-surface-100 font-mono text-sm mt-1">
            {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            {filtered.length !== all.length && ` · filtered from ${all.length}`}
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + Add Transaction
        </button>
      </div>

      {/* Totals strip */}
      <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-up opacity-0 stagger-2">
        <div className="card px-5 py-4 flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-jade-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-mono text-surface-500 uppercase tracking-widest">Income</p>
            <p className="text-jade-400 font-mono text-lg">{fmt(totals.income)}</p>
          </div>
        </div>
        <div className="card px-5 py-4 flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-mono text-surface-500 uppercase tracking-widest">Expenses</p>
            <p className="text-rose-400 font-mono text-lg">{fmt(totals.expense)}</p>
          </div>
        </div>
        <div className="card px-5 py-4 flex items-center gap-3">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${totals.income - totals.expense >= 0 ? 'bg-amber-400' : 'bg-rose-400'}`} />
          <div>
            <p className="text-xs font-mono text-surface-500 uppercase tracking-widest">Balance</p>
            <p className={`font-mono text-lg ${totals.income - totals.expense >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
              {fmt(totals.income - totals.expense)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 animate-fade-up opacity-0 stagger-3">
        <div className="flex flex-wrap gap-3 items-center">

          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 text-sm">⌕</span>
            <input
              type="text"
              placeholder="Search description or category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-8 py-2 text-sm"
            />
          </div>

          {/* Type filter */}
          <div className="flex gap-1 bg-surface-700 rounded-xl p-1">
            {['all', 'income', 'expense'].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 capitalize ${type === t
                  ? 'bg-surface-600 text-surface-50'
                  : 'text-surface-500 hover:text-surface-100'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Category select */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input py-2 text-sm w-auto capitalize"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>
            ))}
          </select>

          {/* Sort direction */}
          <button
            onClick={() => setSortDir((d) => d === 'desc' ? 'asc' : 'desc')}
            className="btn-ghost py-2 px-3 text-xs font-mono"
            title="Toggle sort order"
          >
            {sortDir === 'desc' ? '↓ newest' : '↑ oldest'}
          </button>

          {/* Clear filters */}
          {(type !== 'all' || category !== 'all' || search) && (
            <button
              onClick={() => { setType('all'); setCategory('all'); setSearch('') }}
              className="text-rose-400 hover:text-rose-300 text-xs font-mono transition-colors"
            >
              clear ×
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card animate-fade-up opacity-0 stagger-4 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-surface-700 rounded-xl animate-pulse-slow" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-surface-500 font-mono text-sm mb-2">
              {all.length === 0 ? 'No transactions yet' : 'No results match your filters'}
            </p>
            {all.length === 0 && (
              <button onClick={() => setShowModal(true)} className="btn-ghost text-sm mt-2">
                Add first transaction
              </button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-700">
                <th className="py-3.5 px-5 text-left text-xs font-mono text-surface-500 uppercase tracking-widest">Date</th>
                <th className="py-3.5 px-2 text-left text-xs font-mono text-surface-500 uppercase tracking-widest">Description</th>
                <th className="py-3.5 px-2 text-left text-xs font-mono text-surface-500 uppercase tracking-widest">Type</th>
                <th className="py-3.5 px-5 text-right text-xs font-mono text-surface-500 uppercase tracking-widest">Amount</th>
                <th className="py-3.5 px-5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx, i) => (
                <TransactionRow key={tx.id} tx={tx} index={i} onEdit={openEdit} />
              ))}
            </tbody>
          </table>
        )}

        {/* Footer count */}
        {filtered.length > 0 && (
          <div className="border-t border-surface-700 px-6 py-3 flex items-center justify-between">
            <p className="text-xs font-mono text-surface-500">
              Showing {filtered.length} of {all.length} transactions
            </p>
            <p className="text-xs font-mono text-surface-500">
              Net: <span className={totals.income - totals.expense >= 0 ? 'text-amber-400' : 'text-rose-400'}>
                {fmt(totals.income - totals.expense)}
              </span>
            </p>
          </div>
        )}
      </div>

      {showModal && <AddTransactionModal onClose={closeModal} editing={editing} />}
    </div>
  )
}
