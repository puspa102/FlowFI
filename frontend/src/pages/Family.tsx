import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { apiGet, apiPost } from '../api/client'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface FamilyBudget {
  id: number
  category: string
  month: string
  budgetAmount: number
  spentAmount: number
  percentUsed: number
}

interface FamilyStats {
  familyId: number
  totalMembers: number
  totalBudgets: number
  totalBudgeted: number
  totalSpent: number
  remainingBudget: number
  percentUsed: number
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

export default function Family() {
  const [budgets, setBudgets] = useState<FamilyBudget[]>([])
  const [stats, setStats] = useState<FamilyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadBudgets()
    loadStats()
  }, [])

  const loadBudgets = async () => {
    const response = await apiGet<FamilyBudget[]>('/api/family/budgets')
    if (response.ok && response.data) {
      setBudgets(response.data)
    }
    setLoading(false)
  }

  const loadStats = async () => {
    const response = await apiGet<FamilyStats>('/api/family/stats')
    if (response.ok && response.data) {
      setStats(response.data)
    }
  }

  const handleAddBudget = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await apiPost('/api/family/budgets', {
      category: formData.get('category'),
      month: formData.get('month'),
      budgetAmount: parseFloat(formData.get('budgetAmount') as string),
    })
    loadBudgets()
    setShowForm(false)
  }

  const categories = [
    { name: 'Housing', icon: '&#127968;', color: 'bg-primary', percent: 35 },
    { name: 'Groceries', icon: '&#128722;', color: 'bg-primary', percent: 25 },
    { name: 'Leisure', icon: '&#127918;', color: 'bg-primary', percent: 40 },
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
        <motion.div variants={fadeUp}>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-platinum">Household</p>
          <h1 className="mt-3 font-display italic text-3xl tracking-tight text-white md:text-4xl">Family Finance</h1>
          <p className="mt-2 text-platinum">Unified control over household wealth and collective future goals for the Thompson family.</p>
        </motion.div>

        {/* Family Stats */}
        {stats && (
          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-lg p-5">
              <div className="text-platinum text-xs uppercase tracking-wider">Total Members</div>
              <div className="text-3xl font-bold text-white mt-2">{stats.totalMembers}</div>
            </div>
            <div className="glass-card rounded-lg p-5">
              <div className="text-platinum text-xs uppercase tracking-wider">Total Budgeted</div>
              <div className="text-3xl font-bold text-white mt-2">${stats.totalBudgeted.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="glass-card rounded-lg p-5">
              <div className="text-platinum text-xs uppercase tracking-wider">Total Spent</div>
              <div className="text-3xl font-bold text-white mt-2">${stats.totalSpent.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="glass-card rounded-lg p-5">
              <div className="text-platinum text-xs uppercase tracking-wider">Remaining</div>
              <div className="text-3xl font-bold text-primary mt-2">${stats.remainingBudget.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
            </div>
          </motion.div>
        )}

        {/* Shared Budgets */}
        <motion.div variants={fadeUp} className="glass-card rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Shared Budgets</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-primary hover:bg-primary/90 text-navy-950 font-semibold px-4 py-2 rounded-lg text-sm transition"
            >
              New Budget
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddBudget} className="bg-navy-800 rounded-lg border border-white/[0.08] p-5 mb-6 space-y-4">
              <input
                type="text"
                name="category"
                placeholder="Category (e.g., Housing)"
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3 py-2.5 rounded-md placeholder:text-platinum/60 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="month"
                name="month"
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="number"
                step="0.01"
                name="budgetAmount"
                placeholder="Budget Amount"
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3 py-2.5 rounded-md placeholder:text-platinum/60 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-navy-950 font-semibold px-4 py-2.5 rounded-lg transition">
                Create Budget
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat.name} className="bg-white/[0.04] border border-white/[0.06] p-5 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg" dangerouslySetInnerHTML={{ __html: cat.icon }}></span>
                  <span className="text-platinum text-xs font-medium">{cat.percent}%</span>
                </div>
                <h3 className="font-semibold text-white mb-3">{cat.name}</h3>
                <div className="w-full bg-white/[0.06] rounded-full h-2">
                  <div
                    className={`${cat.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${cat.percent}%` }}
                  ></div>
                </div>
                <div className="text-xs text-platinum mt-2">$3,450 / $4,000</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Budget List */}
        <motion.div variants={fadeUp} className="glass-card rounded-lg p-6">
          <h2 className="text-lg font-bold text-white mb-5">All Budgets</h2>
          <div className="space-y-3">
            {budgets.map((budget) => (
              <div key={budget.id} className="bg-white/[0.04] border border-white/[0.06] p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-white">{budget.category}</div>
                    <div className="text-xs text-platinum">{new Date(budget.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">${budget.spentAmount.toFixed(2)} / ${budget.budgetAmount.toFixed(2)}</div>
                    <div className="text-xs text-platinum">{budget.percentUsed}% used</div>
                  </div>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${budget.percentUsed <= 50 ? 'bg-primary' : budget.percentUsed <= 80 ? 'bg-yellow-500' : 'bg-coral'}`}
                    style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
