import { useEffect, useState } from 'react'
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
    { name: 'Housing', icon: '🏠', color: 'from-blue-500', percent: 35 },
    { name: 'Groceries', icon: '🛒', color: 'from-green-500', percent: 25 },
    { name: 'Leisure', icon: '🎮', color: 'from-purple-500', percent: 40 },
  ]

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Family Finance</h1>
        <p className="text-slate-400">Unified control over household wealth and collective future goals for the Thompson family.</p>
      </div>

      {/* Family Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Total Members</div>
            <div className="text-3xl font-bold text-white">{stats.totalMembers}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Total Budgeted</div>
            <div className="text-3xl font-bold text-white">${stats.totalBudgeted.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Total Spent</div>
            <div className="text-3xl font-bold text-white">${stats.totalSpent.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Remaining</div>
            <div className="text-3xl font-bold text-green-400">${stats.remainingBudget.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
          </div>
        </div>
      )}

      {/* Shared Budgets */}
      <div className="bg-slate-800 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Shared Budgets</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded"
          >
            New Budget
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAddBudget} className="bg-slate-700 p-4 rounded mb-4 space-y-4">
            <input
              type="text"
              name="category"
              placeholder="Category (e.g., Housing)"
              className="w-full bg-slate-600 text-white px-3 py-2 rounded"
              required
            />
            <input
              type="month"
              name="month"
              className="w-full bg-slate-600 text-white px-3 py-2 rounded"
              required
            />
            <input
              type="number"
              step="0.01"
              name="budgetAmount"
              placeholder="Budget Amount"
              className="w-full bg-slate-600 text-white px-3 py-2 rounded"
              required
            />
            <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded">
              Create Budget
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.name} className="bg-slate-700 p-4 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{cat.icon}</span>
                <span className="text-slate-400 text-sm">{cat.percent}%</span>
              </div>
              <h3 className="font-semibold text-white mb-2">{cat.name}</h3>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div
                  className={`bg-gradient-to-r ${cat.color} to-cyan-400 h-2 rounded-full`}
                  style={{ width: `${cat.percent}%` }}
                ></div>
              </div>
              <div className="text-sm text-slate-400 mt-2">$3,450 / $4,000</div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget List */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">All Budgets</h2>
        <div className="space-y-3">
          {budgets.map((budget) => (
            <div key={budget.id} className="bg-slate-700 p-4 rounded">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-semibold text-white">{budget.category}</div>
                  <div className="text-sm text-slate-400">{new Date(budget.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">${budget.spentAmount.toFixed(2)} / ${budget.budgetAmount.toFixed(2)}</div>
                  <div className="text-sm text-slate-400">{budget.percentUsed}% used</div>
                </div>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${budget.percentUsed <= 50 ? 'bg-green-500' : budget.percentUsed <= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
