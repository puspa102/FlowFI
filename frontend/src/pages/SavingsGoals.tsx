import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiDelete } from '../api/client'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface Goal {
  id: number
  title: string
  targetAmount: number
  targetDate: string
  currentAmount: number
  monthlyContribution: number
  progressPercent: number
  statusLabel: string
  daysRemaining?: number
}

export default function SavingsGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [timeline, setTimeline] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadGoals()
    loadTimeline()
  }, [])

  const loadGoals = async () => {
    const response = await apiGet<Goal[]>('/api/savings-goals')
    if (response.ok && response.data) {
      setGoals(response.data)
    }
    setLoading(false)
  }

  const loadTimeline = async () => {
    const response = await apiGet<Goal[]>('/api/savings-goals/timeline')
    if (response.ok && response.data) {
      setTimeline(response.data)
    }
  }

  const handleAddGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await apiPost('/api/savings-goals', {
      title: formData.get('title'),
      targetAmount: parseFloat(formData.get('targetAmount') as string),
      targetDate: formData.get('targetDate'),
      monthlyContribution: parseFloat(formData.get('monthlyContribution') as string),
    })
    loadGoals()
    loadTimeline()
    setShowForm(false)
  }

  const handleDeleteGoal = async (id: number) => {
    await apiDelete(`/api/savings-goals/${id}`)
    loadGoals()
    loadTimeline()
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Savings Goals</h1>
        <p className="text-slate-400">You're currently on track to hit 2 of 3 goals by their target dates. Let's optimize your growth.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm">Total Goals</div>
          <div className="text-3xl font-bold text-white mt-2">{goals.length}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm">Goals On Track</div>
          <div className="text-3xl font-bold text-cyan-400 mt-2">
            {goals.filter((g) => g.statusLabel === 'On Track').length}
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm">Total Saving Monthly</div>
          <div className="text-3xl font-bold text-green-400 mt-2">
            ${goals.reduce((sum, g) => sum + g.monthlyContribution, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Priority Goal */}
      {goals.length > 0 && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{goals[0].title}</h2>
              <div className="text-slate-400 text-sm">Target: {new Date(goals[0].targetDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-cyan-400">{goals[0].progressPercent}%</div>
              <div className="text-sm text-slate-400">Complete</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full"
                style={{ width: `${goals[0].progressPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6 pb-6 border-b border-slate-600">
            <div>
              <div className="text-slate-400 text-sm">Current Balance</div>
              <div className="text-2xl font-bold text-white">${goals[0].currentAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Target Amount</div>
              <div className="text-2xl font-bold text-white">${goals[0].targetAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Remaining</div>
              <div className="text-2xl font-bold text-cyan-400">
                ${(goals[0].targetAmount - goals[0].currentAmount).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded font-semibold">
              Deposit Now
            </button>
            <button className="border border-cyan-400 text-cyan-400 hover:bg-cyan-500/10 px-6 py-2 rounded font-semibold">
              Adjust Goal
            </button>
          </div>
        </div>
      )}

      {/* Smart Growth Insights */}
      <div className="bg-slate-800 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Smart Growth Insights</h3>

        <div className="space-y-4">
          <div className="bg-slate-700 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📈</div>
              <div className="flex-1">
                <div className="font-semibold text-white">Interest Rate Optimization</div>
                <div className="text-sm text-slate-300">Move $5,000 from Savings to a 5.2% APY vault to earn $260 annually</div>
                <button className="text-cyan-400 hover:text-cyan-300 text-sm mt-2">Action</button>
              </div>
            </div>
          </div>

          <div className="bg-slate-700 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⏰</div>
              <div className="flex-1">
                <div className="font-semibold text-white">Round-Up Milestone</div>
                <div className="text-sm text-slate-300">You've reached $100 in round-ups this month. That's 25% of your Tokyo goal!</div>
                <button className="text-cyan-400 hover:text-cyan-300 text-sm mt-2">Celebrate</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* All Goals */}
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">All Goals</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded text-sm"
            >
              Create New Goal
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddGoal} className="bg-slate-700 p-4 rounded mb-4 space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Goal Title"
                className="w-full bg-slate-600 text-white px-3 py-2 rounded"
                required
              />
              <input
                type="number"
                step="0.01"
                name="targetAmount"
                placeholder="Target Amount"
                className="w-full bg-slate-600 text-white px-3 py-2 rounded"
                required
              />
              <input
                type="date"
                name="targetDate"
                className="w-full bg-slate-600 text-white px-3 py-2 rounded"
                required
              />
              <input
                type="number"
                step="0.01"
                name="monthlyContribution"
                placeholder="Monthly Contribution"
                className="w-full bg-slate-600 text-white px-3 py-2 rounded"
                required
              />
              <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded">
                Create Goal
              </button>
            </form>
          )}

          <div className="space-y-3">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-slate-700 p-4 rounded">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-white">{goal.title}</div>
                    <div className="text-sm text-slate-400">{goal.progressPercent}% Complete</div>
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${goal.progressPercent >= 100 ? 'bg-green-500' : 'bg-cyan-500'}`}
                    style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}</span>
                  <span>{new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goal Timeline */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Goal Timeline</h2>
          <div className="space-y-4">
            {timeline.map((goal) => (
              <div key={goal.id} className="border-l-2 border-cyan-500 pl-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">
                    {goal.statusLabel === 'Achieved' ? '✅' : goal.progressPercent >= 75 ? '🔥' : '📍'}
                  </span>
                  <div>
                    <div className="font-semibold text-white">{goal.title}</div>
                    <div className="text-xs text-slate-400">
                      {goal.statusLabel === 'Achieved'
                        ? 'Successfully moved $2,000 into high-yield savings'
                        : `${goal.daysRemaining} days remaining`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-sm">
            Adjust Plan Timeline
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
