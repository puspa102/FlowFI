import { useState } from 'react'
import { motion } from 'framer-motion'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Skeleton from '@/components/ui/Skeleton'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { formatMoney, useUserCurrency } from '@/lib/currency'
import { useGetBudgetSummaryQuery, useCreateBudgetMutation, useDeleteBudgetMutation, useGetBudgetSuggestionsQuery } from '@/store/api/budgetsApi'
import { useGetCategoriesQuery } from '@/store/api/transactionsApi'

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function Budgets() {
  const { data: summary, isLoading, isError } = useGetBudgetSummaryQuery(undefined)
  const { data: catData } = useGetCategoriesQuery(undefined)
  const { data: suggestions } = useGetBudgetSuggestionsQuery(undefined)
  const [createBudget] = useCreateBudgetMutation()
  const [deleteBudget] = useDeleteBudgetMutation()
  const currency = useUserCurrency()
  const formatCurrency = (value: number) => formatMoney(value, currency, 2)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formCategoryId, setFormCategoryId] = useState('')
  const [formLimitAmount, setFormLimitAmount] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const categories = catData?.categories ?? []

  const handleSubmitBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formCategoryId || !formLimitAmount) {
      setErrorMessage('Please fill in all required fields.')
      return
    }
    try {
      await createBudget({ categoryId: parseInt(formCategoryId), limitAmount: parseFloat(formLimitAmount) }).unwrap()
      setIsModalOpen(false)
      setFormLimitAmount('')
    } catch (err: any) {
      setErrorMessage(err?.data?.error ?? 'Failed to set budget limit.')
    }
  }

  const handleDeleteBudget = async (id: number) => {
    if (!confirm('Delete this budget limit?')) return
    await deleteBudget(id)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 md:grid-cols-2"><Skeleton className="h-40" /><Skeleton className="h-40" /></div>
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Failed to load budget data.</p>
        </div>
      </DashboardLayout>
    )
  }

  const budgets = summary?.budgets ?? []
  const goals = summary?.goals ?? []
  const monthLabel = summary?.month ? new Date(summary.month).toLocaleString('en-US', { month: 'long', year: 'numeric' }) : ''

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
        <motion.header variants={fadeUp} className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-[26px] font-semibold" style={{ color: 'var(--foreground)' }}>Budgets & Goals</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Track spending limits and long-term savings</p>
          </div>
          <div className="flex items-center gap-3">
            {monthLabel && <Badge variant="outline" className="px-3 py-1 rounded-[var(--radius-sm)]" style={{ color: 'var(--muted-foreground)' }}>{monthLabel}</Badge>}
            <Button onClick={() => setIsModalOpen(true)}>
              + Set Budget Limit
            </Button>
          </div>
        </motion.header>

        {/* AI Suggestions - purple */}
        {suggestions && Array.isArray(suggestions) && suggestions.length > 0 && (
          <motion.section variants={fadeUp}>
            <div className="rounded-[var(--radius-lg)] p-6 space-y-3" style={{ background: 'var(--accent-light)', border: '1px solid rgba(124,111,224,0.15)' }}>
              <h3 className="text-[15px] font-semibold" style={{ color: 'var(--accent)' }}>AI Budget Suggestions</h3>
              {suggestions.map((s: any, i: number) => (
                <p key={i} className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{s.body ?? s.title}</p>
              ))}
            </div>
          </motion.section>
        )}

        {/* Streak + AI */}
        <motion.section variants={fadeUp} className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] p-6 space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <h3 className="text-[15px] font-semibold" style={{ color: 'var(--foreground)' }}>{summary?.suggestion?.title ?? 'AI Optimization'}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{summary?.suggestion?.body ?? 'Profiling budgets...'}</p>
          </div>
          <div className="rounded-[var(--radius-lg)] p-6 space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <h3 className="text-[15px] font-semibold" style={{ color: 'var(--foreground)' }}>Savings Streak</h3>
            <div className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>{summary?.streak?.months ?? 0} months consecutive</div>
            <div className="w-full rounded-full h-2" style={{ background: '#E2E8F0' }}>
              <motion.div
                className="h-2 rounded-full"
                style={{ background: 'var(--primary)', transition: 'width 700ms cubic-bezier(0.4,0,0.2,1)' }}
                initial={{ width: 0 }}
                animate={{ width: `${summary?.streak?.progress ?? 0}%` }}
                transition={{ duration: 0.7 }}
              />
            </div>
          </div>
        </motion.section>

        {/* Budget Limits */}
        <motion.section variants={fadeUp} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--foreground)' }}>Monthly budget tracking</h2>
          </div>

          {budgets.length === 0 ? (
            <div className="text-center py-12 rounded-[var(--radius-lg)]" style={{ color: 'var(--muted-foreground)', background: 'var(--card)', border: '1px dashed var(--border)' }}>
              No budget limits configured. Set a limit above to start tracking.
            </div>
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {budgets.map((budget: any) => {
                const pct = budget.progressPercent ?? 0
                const progressColor = pct >= 90 ? 'var(--danger)' : pct >= 75 ? 'var(--warning)' : 'var(--primary)'
                const isOver = pct >= 90

                return (
                  <motion.div variants={fadeUp} key={budget.id} className="rounded-[var(--radius-lg)] overflow-hidden relative group" style={{ background: 'var(--card)', border: isOver ? '1px solid rgba(255,107,107,0.2)' : '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
                    <div className="flex items-center justify-between px-6 py-4">
                      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
                        {budget.category?.name ?? 'Category'}
                      </span>
                      <Badge variant="outline" className="rounded-[var(--radius-sm)] font-bold px-1.5 py-0.5 text-[10px] uppercase border-transparent" style={{
                        background: isOver ? 'var(--danger-light)' : 'var(--primary-light)',
                        color: isOver ? 'var(--danger)' : 'var(--primary)',
                      }}>
                        {isOver ? 'over budget' : `${pct}% used`}
                      </Badge>
                    </div>
                    <div className="px-6 pb-6 space-y-3">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>{formatCurrency(budget.spentAmount)}</p>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Limit: {formatCurrency(budget.limitAmount)}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="opacity-0 group-hover:opacity-100 text-xs font-semibold px-2 py-1.5 rounded-[var(--radius-sm)] transition"
                          style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="w-full rounded-full h-2" style={{ background: '#E2E8F0' }}>
                        <motion.div
                          className="h-2 rounded-full"
                          style={{ background: progressColor, transition: 'width 700ms cubic-bezier(0.4,0,0.2,1)' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, pct)}%` }}
                          transition={{ duration: 0.7 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </motion.section>

        {/* Goals */}
        {goals.length > 0 && (
          <motion.section variants={fadeUp} className="space-y-4">
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--foreground)' }}>Long-term savings goals</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {goals.map((goal: any) => (
                <div key={goal.id} className="rounded-[var(--radius-lg)] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
                  <div className="flex items-center justify-between px-6 py-4">
                    <h3 className="text-[15px] font-semibold" style={{ color: 'var(--foreground)' }}>{goal.title}</h3>
                    <Badge variant="outline" className="rounded-[var(--radius-sm)] text-xs border-transparent" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{goal.statusLabel}</Badge>
                  </div>
                  <div className="px-6 pb-6 space-y-4">
                    <div className="flex items-center justify-between text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <span>Target: {formatCurrency(goal.targetAmount)}</span>
                      <span>{new Date(goal.targetDate).toLocaleString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="w-full rounded-full h-2" style={{ background: '#E2E8F0' }}>
                      <motion.div
                        className="h-2 rounded-full"
                        style={{ background: 'var(--primary)', transition: 'width 700ms cubic-bezier(0.4,0,0.2,1)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progressPercent}%` }}
                        transition={{ duration: 0.7 }}
                      />
                    </div>
                    <div className="grid gap-3 text-sm md:grid-cols-2">
                      <div>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Current</p>
                        <p className="text-base font-semibold mt-0.5 tabular-nums" style={{ color: 'var(--foreground)' }}>{formatCurrency(goal.currentAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Monthly</p>
                        <p className="text-base font-semibold mt-0.5 tabular-nums" style={{ color: 'var(--foreground)' }}>{formatCurrency(goal.monthlyContribution)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </motion.div>

      {/* Set Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-[var(--radius-lg)] shadow-elevated overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>Set Category Spending Limit</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-lg font-bold" style={{ color: 'var(--muted-foreground)' }}>×</button>
            </div>

            <form onSubmit={handleSubmitBudget} className="p-6 space-y-4">
              {errorMessage && <div className="rounded-[var(--radius-sm)] p-3 text-xs" style={{ background: 'var(--danger-light)', border: '1px solid rgba(255,107,107,0.2)', color: 'var(--danger)' }}>{errorMessage}</div>}

              <div className="space-y-1">
                <label className="block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Budget Category</label>
                <select required value={formCategoryId} onChange={(e) => setFormCategoryId(e.target.value)} className="w-full rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                  <option value="" disabled>Select Category</option>
                  {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Limit Amount ($)</label>
                <Input required type="number" step="1" min="1" value={formLimitAmount} onChange={(e) => setFormLimitAmount(e.target.value)} placeholder="e.g. 500" />
              </div>

              <div className="flex gap-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-[var(--radius-sm)] text-sm font-semibold transition" style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-[var(--radius-sm)] text-sm font-semibold text-white transition" style={{ background: 'var(--primary)' }}>Save Limit</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  )
}
