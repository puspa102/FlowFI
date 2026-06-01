import { useState } from 'react'
import { motion } from 'framer-motion'
import Skeleton from '@/components/ui/Skeleton'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useGetSubscriptionsQuery, useAddSubscriptionMutation, useCancelSubscriptionMutation, useGetSubscriptionRecommendationsQuery } from '@/store/api/subscriptionsApi'

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function Subscriptions() {
  const { data: stats, isLoading, isError } = useGetSubscriptionsQuery(undefined)
  const { data: recommendations } = useGetSubscriptionRecommendationsQuery(undefined)
  const [addSubscription] = useAddSubscriptionMutation()
  const [cancelSubscription] = useCancelSubscriptionMutation()
  const [showForm, setShowForm] = useState(false)

  const handleAddSubscription = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await addSubscription({
      name: formData.get('name'),
      status: 'ACTIVE',
      monthlyPrice: parseFloat(formData.get('monthlyPrice') as string),
      billingDate: formData.get('billingDate'),
      category: formData.get('category'),
    })
    setShowForm(false)
  }

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this subscription?')) return
    await cancelSubscription(id)
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
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Failed to load subscriptions.</p>
        </div>
      </DashboardLayout>
    )
  }

  const recs: any[] = Array.isArray(recommendations) ? recommendations : []
  const subscriptions: any[] = stats?.subscriptions ?? []
  const monthlyBurn = stats?.monthlyBurnRate ?? subscriptions.reduce((s: number, sub: any) => s + (sub.monthlyPrice ?? 0), 0)

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
        <motion.div variants={fadeUp}>
          <h1 className="text-[26px] font-semibold" style={{ color: 'var(--foreground)' }}>Subscriptions</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Track and optimize your recurring expenses.</p>
        </motion.div>

        {/* AI Recommendation - purple */}
        {recs.length > 0 && (
          <motion.div variants={fadeUp} className="rounded-[var(--radius-lg)] p-6" style={{ background: 'var(--accent-light)', border: '1px solid rgba(124,111,224,0.15)' }}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center text-lg font-bold" style={{ background: 'rgba(124,111,224,0.12)', color: 'var(--accent)' }}>AI</div>
              <div className="flex-1">
                <div className="font-semibold text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--accent)' }}>AI Recommendation</div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{recs[0]?.title || 'Optimize'}</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>{recs[0]?.body}</p>
                <button className="font-semibold px-5 py-2 rounded-[var(--radius-sm)] text-sm text-white transition" style={{ background: 'var(--accent)' }}>
                  1-Click Negotiate
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-[var(--radius-lg)] p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <div className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>Monthly Burn Rate</div>
            <div className="text-[26px] font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>${monthlyBurn.toFixed(2)}</div>
            <div className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>{stats?.activeSubscriptions ?? subscriptions.filter((s: any) => s.status === 'ACTIVE').length} active</div>
          </div>
          <div className="rounded-[var(--radius-lg)] p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <div className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>Total Subscriptions</div>
            <div className="text-[26px] font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>{stats?.totalSubscriptions ?? subscriptions.length}</div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-[var(--radius-lg)] p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--foreground)' }}>Active Subscriptions</h2>
            <button onClick={() => setShowForm(!showForm)} className="font-semibold px-4 py-2 rounded-[var(--radius-sm)] text-sm text-white transition" style={{ background: 'var(--primary)' }}>Add New</button>
          </div>

          {showForm && (
            <form onSubmit={handleAddSubscription} className="rounded-[var(--radius-md)] p-5 mb-6 space-y-4" style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border)' }}>
              <input type="text" name="name" placeholder="Subscription Name" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} required />
              <select name="category" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} required>
                <option value="">Select Category</option><option value="ENTERTAINMENT">Entertainment</option><option value="PRODUCTIVITY">Productivity</option><option value="CLOUD">Cloud Storage</option><option value="OTHER">Other</option>
              </select>
              <input type="number" step="0.01" name="monthlyPrice" placeholder="Monthly Price" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} required />
              <input type="date" name="billingDate" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} required />
              <button type="submit" className="w-full font-semibold px-4 py-2.5 rounded-[var(--radius-sm)] text-white transition" style={{ background: 'var(--primary)' }}>Add Subscription</button>
            </form>
          )}

          {subscriptions.filter((s: any) => s.status === 'ACTIVE').length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>No active subscriptions.</p>
          ) : (
            <div className="space-y-3">
              {subscriptions.filter((s: any) => s.status === 'ACTIVE').map((sub: any) => (
                <div key={sub.id} className="flex items-center justify-between p-4 rounded-[var(--radius-md)] transition group hover:bg-[var(--background)]" style={{ border: '1px solid var(--border)' }}>
                  <div>
                    <div className="font-medium" style={{ color: 'var(--foreground)' }}>{sub.name}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Next billing: {sub.billingDate ? new Date(sub.billingDate).toLocaleDateString() : 'N/A'}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>${sub.monthlyPrice?.toFixed(2)}/mo</div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{sub.category}</div>
                    </div>
                    <button onClick={() => handleCancel(sub.id)} className="text-sm font-medium opacity-0 group-hover:opacity-100 transition" style={{ color: 'var(--danger)' }}>Cancel</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
