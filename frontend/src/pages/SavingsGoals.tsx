import { useState } from 'react'
import { motion } from 'framer-motion'
import Skeleton from '@/components/ui/Skeleton'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useGetSavingsGoalsQuery, useCreateSavingsGoalMutation, useContributeToMutation, useDeleteSavingsGoalMutation } from '@/store/api/savingsGoalsApi'

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

function ProgressRing({ percent, size = 80, stroke = 6 }: { percent: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference
  const color = percent >= 100 ? 'var(--success)' : percent >= 70 ? 'var(--primary)' : percent >= 40 ? 'var(--warning)' : 'var(--danger)'

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
  )
}

export default function SavingsGoals() {
  const { data: goals, isLoading, isError } = useGetSavingsGoalsQuery(undefined)
  const [createGoal] = useCreateSavingsGoalMutation()
  const [contributeTo] = useContributeToMutation()
  const [deleteGoal] = useDeleteSavingsGoalMutation()
  const [showForm, setShowForm] = useState(false)
  const [contributeId, setContributeId] = useState<number | null>(null)
  const [contributeAmount, setContributeAmount] = useState('')

  const handleAddGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await createGoal({
      title: formData.get('title'),
      targetAmount: parseFloat(formData.get('targetAmount') as string),
      targetDate: formData.get('targetDate'),
      monthlyContribution: parseFloat(formData.get('monthlyContribution') as string),
    })
    setShowForm(false)
  }

  const handleContribute = async () => {
    if (!contributeId || !contributeAmount) return
    await contributeTo({ id: contributeId, amount: parseFloat(contributeAmount) })
    setContributeId(null)
    setContributeAmount('')
  }

  const handleDeleteGoal = async (id: number) => {
    if (!confirm('Delete this goal?')) return
    await deleteGoal(id)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Failed to load savings goals.</p>
        </div>
      </DashboardLayout>
    )
  }

  const goalsList: any[] = Array.isArray(goals) ? goals : []

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
        <motion.div variants={fadeUp}>
          <h1 className="text-[26px] font-semibold" style={{ color: 'var(--foreground)' }}>Savings Goals</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Track progress toward your financial targets.</p>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-[var(--radius-lg)] p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Total Goals</div>
            <div className="text-[22px] font-semibold mt-2 tabular-nums" style={{ color: 'var(--foreground)' }}>{goalsList.length}</div>
          </div>
          <div className="rounded-[var(--radius-lg)] p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Goals On Track</div>
            <div className="text-[22px] font-semibold mt-2 tabular-nums" style={{ color: 'var(--primary)' }}>
              {goalsList.filter((g) => g.statusLabel === 'On Track').length}
            </div>
          </div>
          <div className="rounded-[var(--radius-lg)] p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Total Saving Monthly</div>
            <div className="text-[22px] font-semibold mt-2 tabular-nums" style={{ color: 'var(--primary)' }}>
              ${goalsList.reduce((sum: number, g: any) => sum + (g.monthlyContribution ?? 0), 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </motion.div>

        {goalsList.length === 0 ? (
          <div className="text-center py-12 rounded-[var(--radius-lg)]" style={{ color: 'var(--muted-foreground)', background: 'var(--card)', border: '1px dashed var(--border)' }}>
            No savings goals yet. Create your first goal below.
          </div>
        ) : (
          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goalsList.map((goal: any) => {
              const pct = goal.currentAmount && goal.targetAmount ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : (goal.progressPercent ?? 0)
              const statusColor = goal.statusLabel === 'On Track' ? 'var(--primary)' : goal.statusLabel === 'At Risk' ? 'var(--warning)' : 'var(--danger)'

              return (
                <div key={goal.id} className="rounded-[var(--radius-lg)] p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-[15px] font-semibold" style={{ color: 'var(--foreground)' }}>{goal.title}</h3>
                      <p className="text-xs mt-1" style={{ color: statusColor }}>{goal.statusLabel}</p>
                    </div>
                    <div className="relative flex items-center justify-center">
                      <ProgressRing percent={pct} />
                      <span className="absolute text-xs font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>{pct}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                    <div>
                      <span style={{ color: 'var(--muted-foreground)' }}>Current</span>
                      <p className="font-semibold mt-0.5 tabular-nums" style={{ color: 'var(--foreground)' }}>${goal.currentAmount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted-foreground)' }}>Target</span>
                      <p className="font-semibold mt-0.5 tabular-nums" style={{ color: 'var(--foreground)' }}>${goal.targetAmount?.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setContributeId(goal.id)} className="flex-1 py-2 rounded-[var(--radius-sm)] text-xs font-semibold text-white transition" style={{ background: 'var(--primary)' }}>
                      Contribute
                    </button>
                    <button onClick={() => handleDeleteGoal(goal.id)} className="py-2 px-3 rounded-[var(--radius-sm)] text-xs font-medium transition" style={{ border: '1px solid rgba(255,107,107,0.2)', color: 'var(--danger)', background: 'var(--danger-light)' }}>
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}

        {contributeId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-[var(--radius-lg)] p-6 space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>Add Contribution</h3>
              <input type="number" step="0.01" min="1" value={contributeAmount} onChange={(e) => setContributeAmount(e.target.value)} placeholder="Amount" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
              <div className="flex gap-3">
                <button onClick={() => setContributeId(null)} className="flex-1 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium" style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>Cancel</button>
                <button onClick={handleContribute} className="flex-1 py-2.5 rounded-[var(--radius-sm)] text-sm font-semibold text-white" style={{ background: 'var(--primary)' }}>Contribute</button>
              </div>
            </div>
          </div>
        )}

        <motion.div variants={fadeUp} className="rounded-[var(--radius-lg)] p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--foreground)' }}>Create New Goal</h2>
            <button onClick={() => setShowForm(!showForm)} className="font-semibold px-4 py-2 rounded-[var(--radius-sm)] text-sm text-white transition" style={{ background: 'var(--primary)' }}>
              {showForm ? 'Cancel' : 'New Goal'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddGoal} className="rounded-[var(--radius-md)] p-5 space-y-4" style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border)' }}>
              <input type="text" name="title" placeholder="Goal Title" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} required />
              <input type="number" step="0.01" name="targetAmount" placeholder="Target Amount" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} required />
              <input type="date" name="targetDate" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} required />
              <input type="number" step="0.01" name="monthlyContribution" placeholder="Monthly Contribution" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} required />
              <button type="submit" className="w-full font-semibold px-4 py-2.5 rounded-[var(--radius-sm)] text-white transition" style={{ background: 'var(--primary)' }}>Create Goal</button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
