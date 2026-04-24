import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAddTransactionMutation, useUpdateTransactionMutation } from '../services/finedgeApi'

const CATEGORIES = [
  'salary','freelance','investment','bonus',
  'food','rent','transport','utilities',
  'entertainment','healthcare','shopping','other',
]

export default function AddTransactionModal({ onClose, editing = null }) {
  const [addTx,    { isLoading: adding }]   = useAddTransactionMutation()
  const [updateTx, { isLoading: updating }] = useUpdateTransactionMutation()

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
    defaultValues: editing
      ? { type: editing.type, category: editing.category, amount: editing.amount, description: editing.description, date: editing.date?.slice(0, 10) }
      : { type: 'expense', date: new Date().toISOString().slice(0, 10) },
  })

  const type = watch('type')

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function onSubmit(data) {
    try {
      if (editing) {
        await updateTx({ id: editing.id, ...data }).unwrap()
      } else {
        await addTx(data).unwrap()
      }
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-surface-900/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative card p-7 w-full max-w-md animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-surface-50">
            {editing ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-surface-500 hover:text-surface-50 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Type toggle */}
          <div>
            <label className="label">Type</label>
            <div className="flex gap-2">
              {['income', 'expense'].map((t) => (
                <label
                  key={t}
                  className={`flex-1 py-2.5 rounded-xl border text-center text-sm font-mono cursor-pointer transition-all duration-150 ${
                    type === t
                      ? t === 'income'
                        ? 'border-jade-400 bg-jade-400/10 text-jade-400'
                        : 'border-rose-400 bg-rose-400/10 text-rose-400'
                      : 'border-surface-600 text-surface-100 hover:border-surface-500'
                  }`}
                >
                  <input type="radio" value={t} className="sr-only" {...register('type')} />
                  {t}
                </label>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="label">Category</label>
            <select className="input" {...register('category', { required: 'Required' })}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && <p className="text-rose-400 text-xs font-mono mt-1">{errors.category.message}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="label">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className="input font-mono"
              {...register('amount', { required: 'Required', min: { value: 0.01, message: 'Must be > 0' } })}
            />
            {errors.amount && <p className="text-rose-400 text-xs font-mono mt-1">{errors.amount.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="label">Description <span className="normal-case text-surface-500">(optional — used for auto-categorize)</span></label>
            <input
              type="text"
              placeholder="e.g. Zomato dinner, Monthly rent…"
              className="input"
              {...register('description')}
            />
          </div>

          {/* Date */}
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input font-mono"
              {...register('date', { required: 'Required' })}
            />
            {errors.date && <p className="text-rose-400 text-xs font-mono mt-1">{errors.date.message}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={adding || updating} className="btn-primary flex-1">
              {adding || updating ? 'Saving…' : editing ? 'Update' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
