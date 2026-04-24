import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useGetSummaryQuery, useGetTransactionsQuery } from '../services/finedgeApi'
import { selectCurrentUser } from '../features/auth/authSlice'
import StatCard from '../components/StatCard'
import TrendChart from '../components/TrendChart'
import CategoryChart from '../components/CategoryChart'
import AddTransactionModal from '../components/AddTransactionModal'
import TransactionRow from '../components/TransactionRow'

export default function Dashboard() {
  const user = useSelector(selectCurrentUser)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const { data: summaryRes, isLoading: sumLoading } = useGetSummaryQuery()
  const { data: txRes, isLoading: txLoading } = useGetTransactionsQuery()

  const summary = summaryRes?.data || {}
  const transactions = txRes?.data?.transactions || []
  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  function openEdit(tx) { setEditing(tx); setShowModal(true) }
  function closeModal() { setEditing(null); setShowModal(false) }

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-start justify-between mb-10 animate-fade-up opacity-0 stagger-1">
        <div>
          <p className="text-surface-100 font-mono text-sm mb-1">{greet},</p>
          <h1 className="font-display text-4xl text-surface-50">
            {user?.name?.split(' ')[0] || 'there'}
            <span className="text-amber-400">.</span>
          </h1>
          {summary.fromCache && (
            <p className="text-surface-500 text-xs font-mono mt-1">⚡ served from cache</p>
          )}
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + Add Transaction
        </button>
      </div>

      {/* Stat cards */}
      {sumLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="stat-card h-28 animate-pulse-slow bg-surface-700 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Income" value={summary.totalIncome} type="income" delay={80} note={`${summary.transactionCount || 0} transactions`} />
          <StatCard label="Total Expenses" value={summary.totalExpenses} type="expense" delay={140} />
          <StatCard label="Balance" value={summary.balance} type="balance" delay={200} />
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">

        {/* Monthly trend — spans 2 cols */}
        <div className="card p-6 lg:col-span-2 animate-fade-up opacity-0 stagger-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-body font-medium text-surface-50">Monthly trend</h2>
            <div className="flex items-center gap-4 text-xs font-mono text-surface-100">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-jade-400" />income</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400" />expense</span>
            </div>
          </div>
          {sumLoading
            ? <div className="h-[220px] bg-surface-700 rounded-xl animate-pulse-slow" />
            : <TrendChart data={summary.monthlyTrend || []} />
          }
        </div>

        {/* Category breakdown */}
        <div className="card p-6 animate-fade-up opacity-0 stagger-4">
          <h2 className="font-body font-medium text-surface-50 mb-5">By category</h2>
          {sumLoading
            ? <div className="h-40 bg-surface-700 rounded-xl animate-pulse-slow" />
            : <CategoryChart byCategory={summary.byCategory || {}} />
          }
        </div>
      </div>

      {/* Savings tips */}
      {summary.savingsTips?.length > 0 && (
        <div className="card p-6 mb-8 animate-fade-up opacity-0 stagger-4 border-amber-400/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <h2 className="font-body font-medium text-surface-50 text-sm uppercase tracking-widest">Savings insights</h2>
          </div>
          <div className="space-y-2">
            {summary.savingsTips.map((tip, i) => (
              <p key={i} className="text-surface-100 font-body text-sm leading-relaxed">{tip}</p>
            ))}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className="card animate-fade-up opacity-0 stagger-5">
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-700">
          <h2 className="font-body font-medium text-surface-50">Recent transactions</h2>
          <a href="/transactions" className="text-amber-400 hover:text-amber-300 text-xs font-mono transition-colors">
            view all →
          </a>
        </div>

        {txLoading ? (
          <div className="p-6 space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-surface-700 rounded-lg animate-pulse-slow" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-surface-500 font-mono text-sm mb-3">No transactions yet</p>
            <button onClick={() => setShowModal(true)} className="btn-ghost text-sm">
              Add your first one
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-700">
                <th className="py-3 px-5 text-left text-xs font-mono text-surface-500 uppercase tracking-widest">Date</th>
                <th className="py-3 px-2 text-left text-xs font-mono text-surface-500 uppercase tracking-widest">Description</th>
                <th className="py-3 px-2 text-left text-xs font-mono text-surface-500 uppercase tracking-widest">Type</th>
                <th className="py-3 px-5 text-right text-xs font-mono text-surface-500 uppercase tracking-widest">Amount</th>
                <th className="py-3 px-5" />
              </tr>
            </thead>
            <tbody>
              {recent.map((tx, i) => (
                <TransactionRow key={tx.id} tx={tx} index={i} onEdit={openEdit} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && <AddTransactionModal onClose={closeModal} editing={editing} />}
    </div>
  )
}
