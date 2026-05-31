import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { apiGet, apiPost, apiDelete } from '../api/client'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface Subscription {
  id: number
  name: string
  status: string
  monthlyPrice: number
  category: string
  billingDate: string
  lastActivity?: string
}

interface SubscriptionStats {
  totalSubscriptions: number
  activeSubscriptions: number
  monthlyBurnRate: number
  subscriptions: Subscription[]
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

export default function Subscriptions() {
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadSubscriptions()
    loadRecommendations()
  }, [])

  const loadSubscriptions = async () => {
    const response = await apiGet<SubscriptionStats>('/api/subscriptions/stats')
    if (response.ok && response.data) {
      setStats(response.data)
    }
    setLoading(false)
  }

  const loadRecommendations = async () => {
    const response = await apiGet<any[]>('/api/subscriptions/ai-recommendations')
    if (response.ok && response.data) {
      setRecommendations(response.data)
    }
  }

  const handleAddSubscription = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await apiPost('/api/subscriptions', {
      name: formData.get('name'),
      status: 'ACTIVE',
      monthlyPrice: parseFloat(formData.get('monthlyPrice') as string),
      billingDate: formData.get('billingDate'),
      category: formData.get('category'),
    })
    loadSubscriptions()
    setShowForm(false)
  }

  const handleDeleteSubscription = async (id: number) => {
    await apiDelete(`/api/subscriptions/${id}`)
    loadSubscriptions()
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
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-platinum">Recurring</p>
          <h1 className="mt-3 font-display italic text-3xl tracking-tight text-white md:text-4xl">Smart Subscription Manager</h1>
          <p className="mt-2 text-platinum">We detected {stats?.totalSubscriptions || 0} dominant services and {recommendations.length} pending price hike. Let FloFi AI handle the optimization.</p>
        </motion.div>

        {/* AI Recommendation */}
        {recommendations.length > 0 && (
          <motion.div variants={fadeUp} className="glass-card rounded-lg p-6 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-lg font-bold">AI</div>
              <div className="flex-1">
                <div className="text-primary font-semibold text-xs uppercase tracking-wider mb-1">AI Recommendation</div>
                <h3 className="text-xl font-bold text-white mb-2">{recommendations[0]?.title || 'Save money'}</h3>
                <p className="text-platinum text-sm mb-4">{recommendations[0]?.body}</p>
                <div className="flex gap-3">
                  <button className="bg-primary hover:bg-primary/90 text-navy-950 font-semibold px-5 py-2 rounded-lg text-sm transition">
                    1-Click Negotiate
                  </button>
                  <button className="border border-white/[0.08] text-platinum hover:text-white hover:bg-white/[0.04] px-5 py-2 rounded-lg text-sm font-medium transition">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Monthly Burn Rate */}
        {stats && (
          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-lg p-6">
              <div className="text-platinum text-xs uppercase tracking-wider mb-2">Monthly Burn Rate</div>
              <div className="text-4xl font-bold text-white">${stats.monthlyBurnRate.toFixed(2)}</div>
              <div className="text-sm text-platinum mt-2">{stats.activeSubscriptions} active subscriptions</div>
            </div>
            <div className="glass-card rounded-lg p-6">
              <div className="text-platinum text-xs uppercase tracking-wider mb-2">Total Subscriptions</div>
              <div className="text-4xl font-bold text-white">{stats.totalSubscriptions}</div>
              <div className="text-sm text-primary mt-2">Track and save</div>
            </div>
          </motion.div>
        )}

        {/* Active Subscriptions */}
        <motion.div variants={fadeUp} className="glass-card rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Active Subscriptions</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-primary hover:bg-primary/90 text-navy-950 font-semibold px-4 py-2 rounded-lg text-sm transition"
            >
              Add New
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddSubscription} className="bg-navy-800 rounded-lg border border-white/[0.08] p-5 mb-6 space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Subscription Name"
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3 py-2.5 rounded-md placeholder:text-platinum/60 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <select name="category" className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required>
                <option value="">Select Category</option>
                <option value="ENTERTAINMENT">Entertainment</option>
                <option value="PRODUCTIVITY">Productivity</option>
                <option value="CLOUD">Cloud Storage</option>
                <option value="OTHER">Other</option>
              </select>
              <input
                type="number"
                step="0.01"
                name="monthlyPrice"
                placeholder="Monthly Price"
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3 py-2.5 rounded-md placeholder:text-platinum/60 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="date"
                name="billingDate"
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-navy-950 font-semibold px-4 py-2.5 rounded-lg transition">
                Add Subscription
              </button>
            </form>
          )}

          <div className="space-y-3">
            {stats?.subscriptions.filter(s => s.status === 'ACTIVE').map((sub) => (
              <div key={sub.id} className="flex items-center justify-between bg-white/[0.04] border border-white/[0.06] p-4 rounded-lg hover:border-white/[0.12] transition group">
                <div>
                  <div className="font-semibold text-white">{sub.name}</div>
                  <div className="text-xs text-platinum">Next billing: {new Date(sub.billingDate).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold text-white">${sub.monthlyPrice.toFixed(2)}/mo</div>
                    <div className="text-xs text-platinum">{sub.category}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteSubscription(sub.id)}
                    className="text-coral hover:text-coral/80 text-sm font-medium opacity-0 group-hover:opacity-100 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Required */}
        <motion.div variants={fadeUp} className="glass-card rounded-lg p-6">
          <h2 className="text-lg font-bold text-white mb-4">Action Required</h2>
          <div className="space-y-3">
            <div className="bg-coral/5 border border-coral/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-coral/10 flex items-center justify-center text-coral text-sm font-bold">!</div>
                <div>
                  <div className="font-semibold text-white">Card Expiring Soon</div>
                  <div className="text-sm text-platinum mt-1">Your Visa 4242 used for 8 subscriptions expiring in 3 days.</div>
                  <button className="text-coral hover:text-coral/80 text-sm mt-2 font-medium">Update Method</button>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-400/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center text-blue-400 text-sm font-bold">&#8226;</div>
                <div>
                  <div className="font-semibold text-white">Trial Ending Alert</div>
                  <div className="text-sm text-platinum mt-1">Design+AI trial ends in 48 hours. Auto-renew is ON.</div>
                  <button className="text-primary hover:text-primary/80 text-sm mt-2 font-medium">Cancel Now</button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
