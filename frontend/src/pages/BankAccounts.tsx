import { useEffect, useState } from 'react'
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
    return <div className="p-8">Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Bank Connections</h1>
        <p className="text-slate-400">Manage your global financial ecosystem in one ethereal space. Real-time synchronization across all your high-yield assets.</p>
      </div>

      {/* Security Badge */}
      <div className="bg-green-900 border border-green-700 rounded-lg p-4 mb-8 flex items-center gap-2">
        <span className="text-green-400">✓</span>
        <span className="text-white">SECURED BY FLOFI FROST</span>
      </div>

      {/* Net Liquidity */}
      {liquidity && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">NET LIQUIDITY</div>
            <div className="text-4xl font-bold text-white">${liquidity.totalLiquidity.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
            <div className="text-sm text-slate-400 mt-2">↑ 4.2% from last month</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">IMPORT STATUS</div>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-white">Monthly Reconciliation</span>
              </div>
              <span className="text-slate-400 text-sm">452 transactions processed</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="text-white">Pending Import</span>
              </div>
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">LIVE</span>
            </div>
          </div>
        </div>
      )}

      {/* Linked Accounts */}
      <div className="bg-slate-800 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Linked Accounts</h2>
          <div className="flex gap-2">
            <button
              onClick={handleSync}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded text-sm"
            >
              Sync Now
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded"
            >
              Connect New Account
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleAddConnection} className="bg-slate-700 p-4 rounded mb-4 space-y-4">
            <input
              type="text"
              name="accountName"
              placeholder="Account Name"
              className="w-full bg-slate-600 text-white px-3 py-2 rounded"
              required
            />
            <select name="accountType" className="w-full bg-slate-600 text-white px-3 py-2 rounded" required>
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
              className="w-full bg-slate-600 text-white px-3 py-2 rounded"
              required
            />
            <input
              type="text"
              name="maskedAccountNumber"
              placeholder="Account Number (Last 4)"
              className="w-full bg-slate-600 text-white px-3 py-2 rounded"
              required
            />
            <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded">
              Connect Account
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {liquidity?.connections.map((conn) => (
            <div key={conn.id} className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm text-slate-400">ACTIVE</div>
                  <div className="font-semibold text-white mt-1">{conn.accountName}</div>
                </div>
                <div className="text-slate-400">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-2">${conn.balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
              <div className="text-sm text-slate-400 mb-3">
                {conn.accountType} • {conn.maskedAccountNumber}
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Synced {new Date(conn.lastSynced).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ago</span>
                <span className="text-slate-400">ACTIVE</span>
              </div>
              <button
                onClick={() => handleDeleteConnection(conn.id)}
                className="w-full mt-3 bg-slate-600 hover:bg-slate-500 text-red-400 px-3 py-2 rounded text-sm"
              >
                Disconnect
              </button>
            </div>
          ))}

          {/* Add Link Card */}
          <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-center min-h-[200px]">
            <button className="text-center">
              <div className="text-4xl mb-2">+</div>
              <div className="text-white">Link Another Asset</div>
              <div className="text-sm text-slate-400 mt-1">Support for 5,000+ banks</div>
            </button>
          </div>
        </div>
      </div>

      {/* Connect Popular Institutions */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">CONNECT POPULAR INSTITUTIONS</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {['Chase Bank', 'Bank of America', 'Barclays', 'Goldman Sachs', 'Revolut', 'Wise'].map((bank) => (
            <button
              key={bank}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded text-sm"
            >
              {bank}
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
