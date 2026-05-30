import { useEffect, useState } from 'react'
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
    return <div className="p-8">Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Smart Subscription Manager</h1>
        <p className="text-slate-400">We detected {stats?.totalSubscriptions || 0} dominant services and {recommendations.length} pending price hike. Let FloFi AI handle the optimization.</p>
      </div>

      {/* AI Recommendation */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🤖</div>
            <div className="flex-1">
              <div className="text-white font-semibold mb-2">AI RECOMMENDATION</div>
              <h3 className="text-2xl font-bold text-white mb-2">{recommendations[0]?.title || 'Save money'}</h3>
              <p className="text-slate-200 mb-4">{recommendations[0]?.body}</p>
              <div className="flex gap-2">
                <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded">
                  1-Click Negotiate
                </button>
                <button className="border border-purple-300 text-purple-200 hover:bg-purple-600 px-6 py-2 rounded">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Burn Rate */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">MONTHLY BURN RATE</div>
            <div className="text-4xl font-bold text-white">${stats.monthlyBurnRate.toFixed(2)}</div>
            <div className="text-sm text-slate-400 mt-2">{stats.activeSubscriptions} active subscriptions</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">TOTAL SUBSCRIPTIONS</div>
            <div className="text-4xl font-bold text-white">{stats.totalSubscriptions}</div>
            <div className="text-sm text-green-400 mt-2">↓ Track and save</div>
          </div>
        </div>
      )}

      {/* Active Subscriptions */}
      <div className="bg-slate-800 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Active Subscriptions</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded"
          >
            Add New
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAddSubscription} className="bg-slate-700 p-4 rounded mb-4 space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Subscription Name"
              className="w-full bg-slate-600 text-white px-3 py-2 rounded"
              required
            />
            <select name="category" className="w-full bg-slate-600 text-white px-3 py-2 rounded" required>
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
              className="w-full bg-slate-600 text-white px-3 py-2 rounded"
              required
            />
            <input
              type="date"
              name="billingDate"
              className="w-full bg-slate-600 text-white px-3 py-2 rounded"
              required
            />
            <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded">
              Add Subscription
            </button>
          </form>
        )}

        <div className="space-y-3">
          {stats?.subscriptions.filter(s => s.status === 'ACTIVE').map((sub) => (
            <div key={sub.id} className="flex items-center justify-between bg-slate-700 p-4 rounded">
              <div>
                <div className="font-semibold text-white">{sub.name}</div>
                <div className="text-sm text-slate-400">Next billing: {new Date(sub.billingDate).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-semibold text-white">${sub.monthlyPrice.toFixed(2)}/mo</div>
                  <div className="text-sm text-slate-400">{sub.category}</div>
                </div>
                <button
                  onClick={() => handleDeleteSubscription(sub.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Increase Alerts */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Action Required</h2>
        <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <div className="font-semibold text-white">Card Expiring Soon</div>
              <div className="text-sm text-slate-300">Your Visa •••• 4242 used for 8 subscriptions expiring in 3 days.</div>
              <button className="text-yellow-400 hover:text-yellow-300 text-sm mt-2">Update Method</button>
            </div>
          </div>
        </div>

        <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🔔</div>
            <div>
              <div className="font-semibold text-white">Trial Ending Alert</div>
              <div className="text-sm text-slate-300">Design+AI trial ends in 48 hours. Auto-renew is ON.</div>
              <button className="text-blue-400 hover:text-blue-300 text-sm mt-2">Cancel Now</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
