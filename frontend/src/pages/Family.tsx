import { useState } from 'react'
import { motion } from 'framer-motion'
import Skeleton from '@/components/ui/Skeleton'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useGetFamilyBudgetsQuery, useGetFamilyStatsQuery, useCreateFamilyBudgetMutation, useInviteFamilyMemberMutation } from '@/store/api/familyApi'

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function Family() {
  const { data: budgets, isLoading, isError } = useGetFamilyBudgetsQuery(undefined)
  const { data: stats } = useGetFamilyStatsQuery(undefined)
  const [createBudget] = useCreateFamilyBudgetMutation()
  const [inviteMember] = useInviteFamilyMemberMutation()
  const [showForm, setShowForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [showInvite, setShowInvite] = useState(false)

  const handleAddBudget = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await createBudget({
      category: formData.get('category'),
      month: formData.get('month'),
      budgetAmount: parseFloat(formData.get('budgetAmount') as string),
    })
    setShowForm(false)
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    await inviteMember({ email: inviteEmail })
    setInviteEmail('')
    setShowInvite(false)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-4"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Failed to load family data.</p>
        </div>
      </DashboardLayout>
    )
  }

  const budgetList: any[] = Array.isArray(budgets) ? budgets : []

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
        <motion.div variants={fadeUp}>
          <h1 className="text-[26px] font-semibold" style={{ color: 'var(--foreground)' }}>Family Finance</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Unified control over household wealth and collective goals.</p>
        </motion.div>

        {stats && (
          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-[var(--radius-lg)] p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
              <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Members</div>
              <div className="text-[22px] font-semibold mt-2 tabular-nums" style={{ color: 'var(--foreground)' }}>{stats.totalMembers}</div>
            </div>
            <div className="rounded-[var(--radius-lg)] p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
              <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Budgeted</div>
              <div className="text-[22px] font-semibold mt-2 tabular-nums" style={{ color: 'var(--foreground)' }}>${stats.totalBudgeted?.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="rounded-[var(--radius-lg)] p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
              <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Spent</div>
              <div className="text-[22px] font-semibold mt-2 tabular-nums" style={{ color: 'var(--foreground)' }}>${stats.totalSpent?.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="rounded-[var(--radius-lg)] p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
              <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Remaining</div>
              <div className="text-[22px] font-semibold mt-2 tabular-nums" style={{ color: 'var(--primary)' }}>${stats.remainingBudget?.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
            </div>
          </motion.div>
        )}

        <motion.div variants={fadeUp} className="rounded-[var(--radius-lg)] p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--foreground)' }}>Family Members</h2>
            <button onClick={() => setShowInvite(!showInvite)} className="font-semibold px-4 py-2 rounded-[var(--radius-sm)] text-sm text-white transition" style={{ background: 'var(--primary)' }}>Invite Member</button>
          </div>
          {showInvite && (
            <div className="flex gap-2 mb-4">
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Email address" className="flex-1 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
              <button onClick={handleInvite} className="px-4 py-2.5 rounded-[var(--radius-sm)] text-sm font-semibold text-white" style={{ background: 'var(--primary)' }}>Send</button>
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-[var(--radius-lg)] p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--foreground)' }}>Shared Budgets</h2>
            <button onClick={() => setShowForm(!showForm)} className="font-semibold px-4 py-2 rounded-[var(--radius-sm)] text-sm text-white transition" style={{ background: 'var(--primary)' }}>New Budget</button>
          </div>

          {showForm && (
            <form onSubmit={handleAddBudget} className="rounded-[var(--radius-md)] p-5 mb-6 space-y-4" style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border)' }}>
              <input type="text" name="category" placeholder="Category (e.g., Housing)" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} required />
              <input type="month" name="month" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} required />
              <input type="number" step="0.01" name="budgetAmount" placeholder="Budget Amount" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} required />
              <button type="submit" className="w-full font-semibold px-4 py-2.5 rounded-[var(--radius-sm)] text-white transition" style={{ background: 'var(--primary)' }}>Create Budget</button>
            </form>
          )}

          {budgetList.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>No shared budgets yet.</p>
          ) : (
            <div className="space-y-3">
              {budgetList.map((budget: any) => {
                const pct = budget.percentUsed ?? 0
                const barColor = pct >= 90 ? 'var(--danger)' : pct >= 75 ? 'var(--warning)' : 'var(--primary)'
                return (
                  <div key={budget.id} className="p-4 rounded-[var(--radius-md)]" style={{ border: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium" style={{ color: 'var(--foreground)' }}>{budget.category}</div>
                        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{budget.month ? new Date(budget.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>${budget.spentAmount?.toFixed(2)} / ${budget.budgetAmount?.toFixed(2)}</div>
                        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{pct}% used</div>
                      </div>
                    </div>
                    <div className="w-full rounded-full h-2" style={{ background: '#E2E8F0' }}>
                      <motion.div className="h-2 rounded-full" style={{ background: barColor, transition: 'width 700ms cubic-bezier(0.4,0,0.2,1)' }} initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ duration: 0.7 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
