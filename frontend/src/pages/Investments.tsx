import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiDelete } from '../api/client'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface Investment {
  id: number
  symbol: string
  name: string
  type: string
  quantity: number
  purchasePrice: number
  currentPrice: number
  allocation: number
}

interface Portfolio {
  totalValue: number
  totalCost: number
  gainLoss: number
  gainLossPercent: number
  investments: Investment[]
}

export default function Investments() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [topAssets, setTopAssets] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadPortfolio()
    loadTopAssets()
  }, [])

  const loadPortfolio = async () => {
    const response = await apiGet<Portfolio>('/api/investments')
    if (response.ok && response.data) {
      setPortfolio(response.data)
    }
    setLoading(false)
  }

  const loadTopAssets = async () => {
    const response = await apiGet<Investment[]>('/api/investments/top-assets')
    if (response.ok && response.data) {
      setTopAssets(response.data)
    }
  }

  const handleAddInvestment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const response = await apiPost('/api/investments', {
      symbol: formData.get('symbol'),
      name: formData.get('name'),
      type: formData.get('type'),
      quantity: parseFloat(formData.get('quantity') as string),
      purchasePrice: parseFloat(formData.get('purchasePrice') as string),
      currentPrice: parseFloat(formData.get('currentPrice') as string),
      allocation: parseFloat(formData.get('allocation') as string),
    })
    if (response.ok) {
      loadPortfolio()
      loadTopAssets()
      setShowForm(false)
    }
  }

  const handleDeleteInvestment = async (id: number) => {
    await apiDelete(`/api/investments/${id}`)
    loadPortfolio()
    loadTopAssets()
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Investment Tracking</h1>
        <p className="text-slate-400">Real-time oversight of your global multi-asset portfolio.</p>
      </div>

      {/* Portfolio Summary */}
      {portfolio && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">Total Portfolio Value</div>
            <div className="text-4xl font-bold text-white">${portfolio.totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
            <div className={`text-sm mt-2 ${portfolio.gainLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {portfolio.gainLossPercent >= 0 ? '↑' : '↓'} {Math.abs(portfolio.gainLossPercent).toFixed(2)}% ({portfolio.gainLoss > 0 ? '+' : ''}${portfolio.gainLoss.toFixed(2)})
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">Total Cost</div>
            <div className="text-4xl font-bold text-white">${portfolio.totalCost.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
            <div className="text-sm text-slate-400 mt-2">{portfolio.investments.length} investments</div>
          </div>
        </div>
      )}

      {/* Top Performing Assets */}
      <div className="bg-slate-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Top Performing Assets</h2>
        <div className="space-y-4">
          {topAssets.map((asset) => (
            <div key={asset.id} className="flex items-center justify-between bg-slate-700 p-4 rounded">
              <div>
                <div className="font-semibold text-white">{asset.name}</div>
                <div className="text-sm text-slate-400">{asset.symbol}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">${(asset.quantity * asset.currentPrice).toFixed(2)}</div>
                <div className="text-sm text-slate-400">{asset.allocation}% allocation</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Investments */}
      <div className="bg-slate-800 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">All Investments</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded"
          >
            Add Investment
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAddInvestment} className="bg-slate-700 p-4 rounded mb-4 space-y-4">
            <input
              type="text"
              name="symbol"
              placeholder="Symbol (e.g., AAPL)"
              className="w-full bg-slate-600 text-white px-3 py-2 rounded"
              required
            />
            <input
              type="text"
              name="name"
              placeholder="Company Name"
              className="w-full bg-slate-600 text-white px-3 py-2 rounded"
              required
            />
            <select name="type" className="w-full bg-slate-600 text-white px-3 py-2 rounded" required>
              <option value="STOCK">Stock</option>
              <option value="ETF">ETF</option>
              <option value="CRYPTO">Crypto</option>
              <option value="BOND">Bond</option>
            </select>
            <input
              type="number"
              step="0.00001"
              name="quantity"
              placeholder="Quantity"
              className="w-full bg-slate-600 text-white px-3 py-2 rounded"
              required
            />
            <input
              type="number"
              step="0.01"
              name="purchasePrice"
              placeholder="Purchase Price"
              className="w-full bg-slate-600 text-white px-3 py-2 rounded"
              required
            />
            <input
              type="number"
              step="0.01"
              name="currentPrice"
              placeholder="Current Price"
              className="w-full bg-slate-600 text-white px-3 py-2 rounded"
              required
            />
            <input
              type="number"
              name="allocation"
              placeholder="Allocation %"
              className="w-full bg-slate-600 text-white px-3 py-2 rounded"
              required
            />
            <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded">
              Add Investment
            </button>
          </form>
        )}

        <div className="space-y-2">
          {portfolio?.investments.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between bg-slate-700 p-4 rounded">
              <div>
                <div className="font-semibold text-white">{inv.name}</div>
                <div className="text-sm text-slate-400">{inv.quantity} @ ${inv.currentPrice.toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-semibold text-white">${(inv.quantity * inv.currentPrice).toFixed(2)}</div>
                </div>
                <button
                  onClick={() => handleDeleteInvestment(inv.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
