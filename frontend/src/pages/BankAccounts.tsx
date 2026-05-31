import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { apiGet, apiPost, apiDelete } from '../api/client'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface BankConnection {
  id: number
  accountName: string
  accountType: string
  balance: number
  maskedAccountNumber: string
  lastSynced: string
  syncStatus: string
}

interface NetLiquidity {
  totalLiquidity: number
  connections: BankConnection[]
  lastUpdated: string
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

export default function BankAccounts() {
  const [liquidity, setLiquidity] = useState<NetLiquidity | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadLiquidity()
  }, [])

  const loadLiquidity = async () => {
    const response = await apiGet<NetLiquidity>('/api/bank-connections/liquidity')
    if (response.ok && response.data) {
      setLiquidity(response.data)
    }
    setLoading(false)
  }

  const handleAddConnection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await apiPost('/api/bank-connections', {
      accountName: formData.get('accountName'),
      accountType: formData.get('accountType'),
      balance: parseFloat(formData.get('balance') as string),
      maskedAccountNumber: formData.get('maskedAccountNumber'),
    })
    loadLiquidity()
    setShowForm(false)
  }

  const handleDeleteConnection = async (id: number) => {
    await apiDelete(`/api/bank-connections/${id}`)
    loadLiquidity()
  }

  const handleSync = async () => {
    await apiPost('/api/bank-connections/sync', {})
    loadLiquidity()
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
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-platinum">Global Accounts</p>
          <h1 className="mt-3 font-display italic text-3xl tracking-tight text-white md:text-4xl">Bank Connections</h1>
          <p className="mt-2 text-platinum">Manage your global financial ecosystem in one ethereal space. Real-time synchronization across all your high-yield assets.</p>
        </motion.div>

        {/* Security Badge */}
        <motion.div variants={fadeUp} className="glass-card rounded-lg p-4 flex items-center gap-3 border-primary/20">
          <span className="text-primary text-lg">&#10003;</span>
          <span className="text-primary font-semibold text-sm uppercase tracking-wide">Secured by FloFi Frost</span>
        </motion.div>

        {/* Net Liquidity */}
        {liquidity && (
          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-lg p-6">
              <div className="text-platinum text-xs uppercase tracking-wider mb-2">Net Liquidity</div>
              <div className="text-4xl font-bold text-white">${liquidity.totalLiquidity.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
              <div className="text-sm text-primary mt-2">+4.2% from last month</div>
            </div>

            <div className="glass-card rounded-lg p-6">
              <div className="text-platinum text-xs uppercase tracking-wider mb-2">Import Status</div>
              <div className="flex items-center gap-2 mt-4">
                <span className="inline-block w-2.5 h-2.5 bg-primary rounded-full"></span>
                <span className="text-white text-sm">Monthly Reconciliation</span>
                <span className="text-platinum text-xs ml-auto">452 transactions processed</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-block w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse"></span>
                <span className="text-white text-sm">Pending Import</span>
                <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded ml-auto font-semibold">LIVE</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Linked Accounts */}
        <motion.div variants={fadeUp} className="glass-card rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Linked Accounts</h2>
            <div className="flex gap-3">
              <button
                onClick={handleSync}
                className="border border-white/[0.08] hover:bg-white/[0.04] text-platinum hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Sync Now
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-primary hover:bg-primary/90 text-navy-950 font-semibold px-4 py-2 rounded-lg text-sm transition"
              >
                Connect New Account
              </button>
            </div>
          </div>

          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleAddConnection}
              className="bg-navy-800 rounded-lg border border-white/[0.08] p-5 mb-6 space-y-4"
            >
              <input
                type="text"
                name="accountName"
                placeholder="Account Name"
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3 py-2.5 rounded-md placeholder:text-platinum/60 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <select name="accountType" className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required>
                <option value="">Select Type</option>
                <option value="CHECKING">Checking</option>
                <option value="SAVINGS">Savings</option>
                <option value="INVESTMENT">Investment</option>
              </select>
              <input
                type="number"
                step="0.01"
                name="balance"
                placeholder="Balance"
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3 py-2.5 rounded-md placeholder:text-platinum/60 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="text"
                name="maskedAccountNumber"
                placeholder="Account Number (Last 4)"
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3 py-2.5 rounded-md placeholder:text-platinum/60 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-navy-950 font-semibold px-4 py-2.5 rounded-lg transition">
                Connect Account
              </button>
            </motion.form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liquidity?.connections.map((conn) => (
              <div key={conn.id} className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-5 hover:border-white/[0.12] transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs text-primary uppercase font-semibold tracking-wider">Active</div>
                    <div className="font-semibold text-white mt-1">{conn.accountName}</div>
                  </div>
                  <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
                </div>
                <div className="text-2xl font-bold text-white mb-2">${conn.balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-platinum mb-3">
                  {conn.accountType} &middot; {conn.maskedAccountNumber}
                </div>
                <div className="flex justify-between items-center text-xs text-platinum">
                  <span>Synced {new Date(conn.lastSynced).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ago</span>
                  <span className="text-primary font-medium">ACTIVE</span>
                </div>
                <button
                  onClick={() => handleDeleteConnection(conn.id)}
                  className="w-full mt-4 border border-coral/20 hover:bg-coral/10 text-coral px-3 py-2 rounded-lg text-sm font-medium transition"
                >
                  Disconnect
                </button>
              </div>
            ))}

            {/* Add Link Card */}
            <div className="bg-white/[0.04] border border-dashed border-white/[0.12] rounded-lg p-5 flex items-center justify-center min-h-[200px] hover:border-primary/40 transition cursor-pointer"
              onClick={() => setShowForm(true)}
            >
              <div className="text-center">
                <div className="text-3xl text-primary mb-2">+</div>
                <div className="text-white font-medium">Link Another Asset</div>
                <div className="text-xs text-platinum mt-1">Support for 5,000+ banks</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Connect Popular Institutions */}
        <motion.div variants={fadeUp} className="glass-card rounded-lg p-6">
          <h3 className="text-sm font-semibold text-platinum uppercase tracking-wider mb-4">Connect Popular Institutions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['Chase Bank', 'Bank of America', 'Barclays', 'Goldman Sachs', 'Revolut', 'Wise'].map((bank) => (
              <button
                key={bank}
                className="bg-white/[0.04] border border-white/[0.06] hover:border-primary/40 hover:bg-white/[0.06] text-white px-4 py-3 rounded-lg text-sm font-medium transition"
              >
                {bank}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
