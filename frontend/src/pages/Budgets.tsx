import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { apiGet, apiPost, apiDelete, getAuthToken } from '../api/client'
import DashboardLayout from '@/components/layout/DashboardLayout'

type BudgetItem = {
  id: number
  category: { id: number; name: string; icon: string | null; tone: string | null }
  limitAmount: number
  spentAmount: number
  progressPercent: number
  status: string
}

type GoalItem = {
  id: number
  title: string
  targetAmount: number
  targetDate: string
  currentAmount: number
  monthlyContribution: number
  progressPercent: number
  statusLabel: string
}

type CategoryItem = {
  id: number
  value: string
  label: string
  icon: string
  tone: string
}

type BudgetSummary = {
  month: string
  suggestion: { title: string; body: string; ctaLabel: string; ctaHref: string } | null
  streak: { months: number; progress: number; label: string } | null
  budgets: BudgetItem[]
  goals: GoalItem[]
}

const fallbackSummary: BudgetSummary = {
  month: new Date().toISOString(),
  suggestion: {
    title: 'AI Spend Suggestion',
    body: 'Shift $200 from Dining to Savings to hit your Emergency Fund goal 2 months early.',
    ctaLabel: 'Apply Optimization',
    ctaHref: '/portfolio',
  },
  streak: { months: 14, progress: 72, label: 'Months Consecutive' },
  budgets: [
    {
      id: 1,
      category: { id: 1, name: 'Food & Groceries', icon: 'Utensils', tone: 'warning' },
      limitAmount: 800,
      spentAmount: 740,
      progressPercent: 92,
      status: 'WARNING',
    },
    {
      id: 2,
      category: { id: 2, name: 'Rent & Mortgage', icon: 'Home', tone: 'primary' },
      limitAmount: 2400,
      spentAmount: 2400,
      progressPercent: 100,
      status: 'ON_TRACK',
    },
  ],
  goals: [
    {
      id: 1,
      title: 'New Tesla Model 3',
      targetAmount: 45000,
      targetDate: new Date().toISOString(),
      currentAmount: 29250,
      monthlyContribution: 1200,
      progressPercent: 65,
      statusLabel: 'In Progress',
    },
  ],
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value)
}

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function Budgets() {
  const [summary, setSummary] = useState<BudgetSummary | null>(null)
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [authRequired, setAuthRequired] = useState(false)
  const [loading, setLoading] = useState(true)

  // Budget Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formCategoryId, setFormCategoryId] = useState('')
  const [formLimitAmount, setFormLimitAmount] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const loadBudgetsData = async () => {
    const token = getAuthToken()
    if (!token) {
      setAuthRequired(true)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const [budRes, catRes] = await Promise.all([
        apiGet<BudgetSummary>('/api/budgets/summary'),
        apiGet<{ categories: CategoryItem[] }>('/api/categories')
      ])

      if (budRes.ok && budRes.data) {
        setSummary(budRes.data)
      } else if (budRes.status === 401) {
        setAuthRequired(true)
      }

      if (catRes.ok && catRes.data) {
        setCategories(catRes.data.categories)
        if (catRes.data.categories.length > 0) {
          setFormCategoryId(catRes.data.categories[0].id.toString())
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBudgetsData()
  }, [])

  const content = summary ?? fallbackSummary
  const monthLabel = useMemo(() => new Date(content.month).toLocaleString('en-US', { month: 'long', year: 'numeric' }), [
    content.month,
  ])

  // Submit Budget limit
  const handleSubmitBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formCategoryId || !formLimitAmount) {
      setErrorMessage('Please fill in all required fields.')
      return
    }

    try {
      const res = await apiPost('/api/budgets', {
        categoryId: parseInt(formCategoryId),
        limitAmount: parseFloat(formLimitAmount)
      })

      if (res.ok) {
        setIsModalOpen(false)
        setFormLimitAmount('')
        loadBudgetsData()
      } else {
        const errorData = res.data as any
        setErrorMessage(errorData?.error ?? 'Failed to set budget limit.')
      }
    } catch (err) {
      console.error(err)
      setErrorMessage('Network connection error.')
    }
  }

  // Delete budget limit
  const handleDeleteBudget = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category budget limit?')) {
      return
    }

    try {
      const res = await apiDelete(`/api/budgets/${id}`)
      if (res.ok) {
        loadBudgetsData()
      } else {
        alert('Failed to delete budget limit.')
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
        <motion.header variants={fadeUp} className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-platinum">Wealth Strategy</p>
            <h1 className="mt-3 font-display italic text-3xl tracking-tight text-white md:text-4xl">Budgets & Long-term Goals</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1 bg-white/[0.04] border-white/[0.08] text-platinum rounded-lg">{monthLabel}</Badge>
            <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-navy-950 font-semibold rounded-lg">
              + Set Budget Limit
            </Button>
          </div>
        </motion.header>

        {authRequired && (
          <motion.div variants={fadeUp} className="glass-card rounded-lg border-primary/20 p-4 text-sm text-primary">
            Set a JWT in localStorage as <span className="font-semibold">flofi_token</span> to load live budget and target schedules.
          </motion.div>
        )}

        {/* AI Optimizer Summary */}
        <motion.section variants={fadeUp} className="grid gap-6 lg:grid-cols-2">
          <div className="glass-card rounded-lg p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">{content.suggestion?.title ?? 'AI Optimization'}</h3>
            <p className="text-sm text-platinum leading-relaxed">{content.suggestion?.body ?? 'Profiling budgets...'}</p>
            <Button variant="outline" size="sm" className="rounded-lg border-white/[0.08] text-platinum hover:bg-white/[0.04] hover:text-white">
              {content.suggestion?.ctaLabel ?? 'View Details'}
            </Button>
          </div>
          <div className="glass-card rounded-lg p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Savings Streak</h3>
            <div className="text-2xl font-bold text-white">{content.streak?.months ?? 0} months consecutive</div>
            <Progress value={content.streak?.progress ?? 0} className="bg-white/[0.06] h-2 [&>div]:bg-primary" />
            <p className="text-xs text-platinum mt-1">{content.streak?.label ?? 'Pacing streak limits'}</p>
          </div>
        </motion.section>

        {/* Budget Limits */}
        <motion.section variants={fadeUp} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Monthly budget tracking</h2>
            <Button onClick={() => setIsModalOpen(true)} variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-white/[0.04]">
              + Configure limit caps
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-platinum space-y-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-xs">Loading live budget allocations...</p>
            </div>
          ) : content.budgets.length === 0 ? (
            <div className="text-center py-12 text-platinum border border-dashed border-white/[0.08] glass-card rounded-lg">
              No budget limits configured for this month. Set a limit above to start tracking.
            </div>
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {content.budgets.map((budget) => {
                const isWarning = budget.status === 'WARNING' || budget.progressPercent >= 85
                return (
                  <motion.div variants={fadeUp} key={budget.id} className="glass-card rounded-lg overflow-hidden relative group">
                    <div className="flex items-center justify-between px-6 py-4">
                      <span className="text-xs font-semibold text-platinum uppercase tracking-widest">
                        {budget.category.icon ? '🎨' : '📁'} {budget.category.name}
                      </span>
                      <Badge variant="outline" className={`rounded-md font-bold px-1.5 py-0.5 text-[10px] uppercase border ${
                        isWarning
                          ? 'bg-coral/10 text-coral border-coral/20'
                          : 'bg-primary/10 text-primary border-primary/20'
                      }`}>
                        {budget.progressPercent}% used
                      </Badge>
                    </div>
                    <div className="px-6 pb-6 space-y-3">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-bold text-white">{formatCurrency(budget.spentAmount)}</p>
                          <p className="text-xs text-platinum">Limit: {formatCurrency(budget.limitAmount)}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="opacity-0 group-hover:opacity-100 text-xs font-semibold text-coral hover:text-coral/80 bg-coral/10 px-2 py-1.5 rounded-lg transition"
                        >
                          Remove Limit
                        </button>
                      </div>
                      <Progress
                        value={Math.min(100, budget.progressPercent)}
                        className={`bg-white/[0.06] h-2 ${isWarning ? '[&>div]:bg-coral' : '[&>div]:bg-primary'}`}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </motion.section>

        {/* Goals */}
        <motion.section variants={fadeUp} className="space-y-4">
          <h2 className="text-lg font-bold text-white">Long-term savings goals</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {content.goals.map((goal) => (
              <div key={goal.id} className="glass-card rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4">
                  <h3 className="text-base font-semibold text-white">{goal.title}</h3>
                  <Badge variant="outline" className="rounded-lg bg-primary/10 border-primary/20 text-primary text-xs">{goal.statusLabel}</Badge>
                </div>
                <div className="px-6 pb-6 space-y-4">
                  <div className="flex items-center justify-between text-xs text-platinum">
                    <span>Target: {formatCurrency(goal.targetAmount)}</span>
                    <span>{new Date(goal.targetDate).toLocaleString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                  <Progress value={goal.progressPercent} className="bg-white/[0.06] h-2 [&>div]:bg-primary" />
                  <div className="grid gap-3 text-sm md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-platinum">Current balance</p>
                      <p className="text-base font-bold text-white mt-0.5">{formatCurrency(goal.currentAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-platinum">Monthly contribution</p>
                      <p className="text-base font-bold text-white mt-0.5">{formatCurrency(goal.monthlyContribution)}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full rounded-lg border-white/[0.08] text-platinum text-xs hover:bg-white/[0.04] hover:text-white">
                    {goal.progressPercent > 80 ? 'View Yield Details' : 'Adjust Contribution'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <footer className="text-xs text-platinum pt-6">FloFi - Precision Wealth Engineering</footer>
      </motion.div>

      {/* Set Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-navy-800 rounded-lg shadow-elevated border border-white/[0.08] overflow-hidden"
          >
            <div className="border-b border-white/[0.08] px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">Set Category Spending Limit</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-platinum hover:text-white text-lg font-bold">x</button>
            </div>

            <form onSubmit={handleSubmitBudget} className="p-6 space-y-4">
              {errorMessage && (
                <div className="rounded-lg bg-coral/10 border border-coral/20 p-3 text-xs text-coral">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-platinum">Budget Category</label>
                <select
                  required
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-platinum">Limit Amount ($)</label>
                <Input
                  required
                  type="number"
                  step="1"
                  min="1"
                  value={formLimitAmount}
                  onChange={(e) => setFormLimitAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="bg-white/[0.04] border-white/[0.08] text-white rounded-md"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-sm font-semibold hover:bg-white/[0.06] text-platinum transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-navy-950 text-sm font-semibold transition"
                >
                  Save Limit
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  )
}
