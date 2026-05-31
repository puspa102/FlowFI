import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-platinum">Growth Engine</p>
          <h1 className="mt-3 font-display italic text-3xl tracking-tight text-white md:text-4xl">Savings Goals</h1>
          <p className="mt-2 text-platinum">You're currently on track to hit 2 of 3 goals by their target dates. Let's optimize your growth.</p>
        </motion.div>

        {/* Summary Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card rounded-lg p-5">
            <div className="text-platinum text-xs uppercase tracking-wider">Total Goals</div>
            <div className="text-3xl font-bold text-white mt-2">{goals.length}</div>
          </div>
          <div className="glass-card rounded-lg p-5">
            <div className="text-platinum text-xs uppercase tracking-wider">Goals On Track</div>
            <div className="text-3xl font-bold text-primary mt-2">
              {goals.filter((g) => g.statusLabel === 'On Track').length}
            </div>
          </div>
          <div className="glass-card rounded-lg p-5">
            <div className="text-platinum text-xs uppercase tracking-wider">Total Saving Monthly</div>
            <div className="text-3xl font-bold text-primary mt-2">
              ${goals.reduce((sum, g) => sum + g.monthlyContribution, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </motion.div>

        {/* Priority Goal */}
        {goals.length > 0 && (
          <motion.div variants={fadeUp} className="glass-card rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{goals[0].title}</h2>
                <div className="text-platinum text-sm">Target: {new Date(goals[0].targetDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary">{goals[0].progressPercent}%</div>
                <div className="text-xs text-platinum">Complete</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="w-full bg-white/[0.06] rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${goals[0].progressPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6 pb-6 border-b border-white/[0.08]">
              <div>
                <div className="text-platinum text-xs uppercase tracking-wider">Current Balance</div>
                <div className="text-2xl font-bold text-white mt-1">${goals[0].currentAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
              </div>
              <div>
                <div className="text-platinum text-xs uppercase tracking-wider">Target Amount</div>
                <div className="text-2xl font-bold text-white mt-1">${goals[0].targetAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
              </div>
              <div>
                <div className="text-platinum text-xs uppercase tracking-wider">Remaining</div>
                <div className="text-2xl font-bold text-primary mt-1">
                  ${(goals[0].targetAmount - goals[0].currentAmount).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="bg-primary hover:bg-primary/90 text-navy-950 px-6 py-2.5 rounded-lg font-semibold transition">
                Deposit Now
              </button>
              <button className="border border-primary/30 text-primary hover:bg-primary/10 px-6 py-2.5 rounded-lg font-semibold transition">
                Adjust Goal
              </button>
            </div>
          </motion.div>
        )}

        {/* Smart Growth Insights */}
        <motion.div variants={fadeUp} className="glass-card rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Smart Growth Insights</h3>

          <div className="space-y-3">
            <div className="bg-white/[0.04] border border-white/[0.06] p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">📈</div>
                <div className="flex-1">
                  <div className="font-semibold text-white">Interest Rate Optimization</div>
                  <div className="text-sm text-platinum mt-1">Move $5,000 from Savings to a 5.2% APY vault to earn $260 annually</div>
                  <button className="text-primary hover:text-primary/80 text-sm mt-2 font-medium">Action</button>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.04] border border-white/[0.06] p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">&#9201;</div>
                <div className="flex-1">
                  <div className="font-semibold text-white">Round-Up Milestone</div>
                  <div className="text-sm text-platinum mt-1">You've reached $100 in round-ups this month. That's 25% of your Tokyo goal!</div>
                  <button className="text-primary hover:text-primary/80 text-sm mt-2 font-medium">Celebrate</button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Goal Timeline */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* All Goals */}
          <div className="glass-card rounded-lg p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-white">All Goals</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-primary hover:bg-primary/90 text-navy-950 font-semibold px-4 py-2 rounded-lg text-sm transition"
              >
                Create New Goal
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleAddGoal} className="bg-navy-800 rounded-lg border border-white/[0.08] p-5 mb-5 space-y-4">
                <input
                  type="text"
                  name="title"
                  placeholder="Goal Title"
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3 py-2.5 rounded-md placeholder:text-platinum/60 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  name="targetAmount"
                  placeholder="Target Amount"
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3 py-2.5 rounded-md placeholder:text-platinum/60 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <input
                  type="date"
                  name="targetDate"
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  name="monthlyContribution"
                  placeholder="Monthly Contribution"
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3 py-2.5 rounded-md placeholder:text-platinum/60 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-navy-950 font-semibold px-4 py-2.5 rounded-lg transition">
                  Create Goal
                </button>
              </form>
            )}

            <div className="space-y-3">
              {goals.map((goal) => (
                <div key={goal.id} className="bg-white/[0.04] border border-white/[0.06] p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-white">{goal.title}</div>
                      <div className="text-sm text-platinum">{goal.progressPercent}% Complete</div>
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-coral hover:text-coral/80 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="w-full bg-white/[0.06] rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${goal.progressPercent >= 100 ? 'bg-primary' : 'bg-primary'}`}
                      style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-platinum">
                    <span>${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}</span>
                    <span>{new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goal Timeline */}
          <div className="glass-card rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-5">Goal Timeline</h2>
            <div className="space-y-4">
              {timeline.map((goal) => (
                <div key={goal.id} className="border-l-2 border-primary pl-4 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">
                      {goal.statusLabel === 'Achieved' ? '&#10004;' : goal.progressPercent >= 75 ? '&#128293;' : '&#128205;'}
                    </span>
                    <div>
                      <div className="font-semibold text-white">{goal.title}</div>
                      <div className="text-xs text-platinum">
                        {goal.statusLabel === 'Achieved'
                          ? 'Successfully moved $2,000 into high-yield savings'
                          : `${goal.daysRemaining} days remaining`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 border border-white/[0.08] hover:bg-white/[0.04] text-platinum hover:text-white py-2.5 rounded-lg text-sm font-medium transition">
              Adjust Plan Timeline
            </button>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
