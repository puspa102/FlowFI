import { useEffect, useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Wealth Strategy</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Budgets & Long-term Goals</h1>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-3 py-1 bg-white border-slate-200 text-slate-600 rounded-lg">{monthLabel}</Badge>
              <Button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                + Set Budget Limit
              </Button>
            </div>
          </header>

          {authRequired && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-sm text-emerald-700">
              ⚠️ Set a JWT in localStorage as <span className="font-semibold">flofi_token</span> to load live budget and target schedules.
            </div>
          )}

          {/* AI Optimizer Summary */}
          <section className="grid gap-6 lg:grid-cols-2">
            <Card className="border-slate-200/70 bg-white shadow-xs rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base text-slate-800">{content.suggestion?.title ?? 'AI Optimization'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">{content.suggestion?.body ?? 'Profiling budgets...'}</p>
                <Button variant="outline" size="sm" className="rounded-lg border-slate-200 hover:bg-slate-50">
                  {content.suggestion?.ctaLabel ?? 'View Details'}
                </Button>
              </CardContent>
            </Card>
            <Card className="border-slate-200/70 bg-white shadow-xs rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base text-slate-800">Savings Streak</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-slate-900">{content.streak?.months ?? 0} months consecutive</div>
                <Progress value={content.streak?.progress ?? 0} className="bg-slate-100 h-2 [&>div]:bg-indigo-600" />
                <p className="text-xs text-slate-400 mt-1">{content.streak?.label ?? 'Pacing streak limits'}</p>
              </CardContent>
            </Card>
          </section>

          {/* Budget Limits */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Monthly budget tracking</h2>
              <Button onClick={() => setIsModalOpen(true)} variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-800">
                + Configure limit caps
              </Button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                <p className="text-xs">Loading live budget allocations...</p>
              </div>
            ) : content.budgets.length === 0 ? (
              <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 bg-white rounded-2xl">
                No budget limits configured for this month. Set a limit above to start tracking.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {content.budgets.map((budget) => {
                  const isWarning = budget.status === 'WARNING' || budget.progressPercent >= 85
                  return (
                    <Card key={budget.id} className="border-slate-200/70 bg-white shadow-xs rounded-2xl overflow-hidden relative group">
                      <CardHeader className="flex-row items-center justify-between py-4">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                          {budget.category.icon ? '🎨' : '📁'} {budget.category.name}
                        </span>
                        <Badge variant="outline" className={`rounded-md font-bold px-1.5 py-0.5 text-[10px] uppercase border ${
                          isWarning 
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                            : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        }`}>
                          {budget.progressPercent}% used
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(budget.spentAmount)}</p>
                            <p className="text-xs text-slate-400">Limit: {formatCurrency(budget.limitAmount)}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteBudget(budget.id)}
                            className="opacity-0 group-hover:opacity-100 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 px-2 py-1.5 rounded-lg transition"
                          >
                            Remove Limit
                          </button>
                        </div>
                        <Progress 
                          value={Math.min(100, budget.progressPercent)} 
                          className={`bg-slate-100 h-2 [&>div]:${isWarning ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                        />
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>

          {/* Goals */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Long-term savings goals</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {content.goals.map((goal) => (
                <Card key={goal.id} className="border-slate-200/70 bg-white shadow-xs rounded-2xl">
                  <CardHeader className="flex-row items-center justify-between py-4">
                    <CardTitle className="text-base font-semibold text-slate-800">{goal.title}</CardTitle>
                    <Badge variant="outline" className="rounded-lg bg-indigo-50 border-indigo-100 text-indigo-700 text-xs">{goal.statusLabel}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Target: {formatCurrency(goal.targetAmount)}</span>
                      <span>{new Date(goal.targetDate).toLocaleString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                    <Progress value={goal.progressPercent} className="bg-slate-100 h-2 [&>div]:bg-indigo-600" />
                    <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-400">Current balance</p>
                        <p className="text-base font-bold text-slate-900 mt-0.5">{formatCurrency(goal.currentAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-400">Monthly contribution</p>
                        <p className="text-base font-bold text-slate-900 mt-0.5">{formatCurrency(goal.monthlyContribution)}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full rounded-xl border-slate-200 text-xs hover:bg-slate-50">
                      {goal.progressPercent > 80 ? 'View Yield Details' : 'Adjust Contribution'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <footer className="text-xs text-slate-400 pt-6">FloFi • Precision Wealth Engineering</footer>

      {/* Set Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-100">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Set Category Spending Limit</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">×</button>
            </div>

            <form onSubmit={handleSubmitBudget} className="p-6 space-y-4">
              {errorMessage && (
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs text-rose-700">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Budget Category</label>
                <select
                  required
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Limit Amount ($)</label>
                <Input
                  required
                  type="number"
                  step="1"
                  min="1"
                  value={formLimitAmount}
                  onChange={(e) => setFormLimitAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold hover:bg-slate-50 text-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition"
                >
                  Save Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
