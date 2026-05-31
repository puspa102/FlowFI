import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-platinum">Portfolio</p>
          <h1 className="mt-3 font-display italic text-3xl tracking-tight text-white md:text-4xl">Investment Tracking</h1>
          <p className="mt-2 text-platinum">Real-time oversight of your global multi-asset portfolio.</p>
        </motion.div>

        {/* Portfolio Summary */}
        {portfolio && (
          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-lg p-6">
              <div className="text-platinum text-xs uppercase tracking-wider mb-2">Total Portfolio Value</div>
              <div className="text-4xl font-bold text-white">${portfolio.totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
              <div className={`text-sm mt-2 font-medium ${portfolio.gainLossPercent >= 0 ? 'text-primary' : 'text-coral'}`}>
                {portfolio.gainLossPercent >= 0 ? '+' : ''}{Math.abs(portfolio.gainLossPercent).toFixed(2)}% ({portfolio.gainLoss > 0 ? '+' : ''}${portfolio.gainLoss.toFixed(2)})
              </div>
            </div>

            <div className="glass-card rounded-lg p-6">
              <div className="text-platinum text-xs uppercase tracking-wider mb-2">Total Cost</div>
              <div className="text-4xl font-bold text-white">${portfolio.totalCost.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
              <div className="text-sm text-platinum mt-2">{portfolio.investments.length} investments</div>
            </div>
          </motion.div>
        )}

        {/* Top Performing Assets */}
        <motion.div variants={fadeUp} className="glass-card rounded-lg p-6">
          <h2 className="text-lg font-bold text-white mb-4">Top Performing Assets</h2>
          <div className="space-y-3">
            {topAssets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between bg-white/[0.04] border border-white/[0.06] p-4 rounded-lg hover:border-white/[0.12] transition">
                <div>
                  <div className="font-semibold text-white">{asset.name}</div>
                  <div className="text-sm text-platinum">{asset.symbol}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">${(asset.quantity * asset.currentPrice).toFixed(2)}</div>
                  <div className="text-xs text-platinum">{asset.allocation}% allocation</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* All Investments */}
        <motion.div variants={fadeUp} className="glass-card rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">All Investments</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-primary hover:bg-primary/90 text-navy-950 font-semibold px-4 py-2 rounded-lg text-sm transition"
            >
              Add Investment
            </button>
          </div>

          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleAddInvestment}
              className="bg-navy-800 rounded-lg border border-white/[0.08] p-5 mb-6 space-y-4"
            >
              <input
                type="text"
                name="symbol"
                placeholder="Symbol (e.g., AAPL)"
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3 py-2.5 rounded-md placeholder:text-platinum/60 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="text"
                name="name"
                placeholder="Company Name"
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3 py-2.5 rounded-md placeholder:text-platinum/60 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <select name="type" className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required>
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
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3 py-2.5 rounded-md placeholder:text-platinum/60 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="number"
                step="0.01"
                name="purchasePrice"
                placeholder="Purchase Price"
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3 py-2.5 rounded-md placeholder:text-platinum/60 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="number"
                step="0.01"
                name="currentPrice"
                placeholder="Current Price"
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3 py-2.5 rounded-md placeholder:text-platinum/60 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="number"
                name="allocation"
                placeholder="Allocation %"
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3 py-2.5 rounded-md placeholder:text-platinum/60 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-navy-950 font-semibold px-4 py-2.5 rounded-lg transition">
                Add Investment
              </button>
            </motion.form>
          )}

          <div className="space-y-3">
            {portfolio?.investments.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between bg-white/[0.04] border border-white/[0.06] p-4 rounded-lg hover:border-white/[0.12] transition group">
                <div>
                  <div className="font-semibold text-white">{inv.name}</div>
                  <div className="text-sm text-platinum">{inv.quantity} @ ${inv.currentPrice.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold text-white">${(inv.quantity * inv.currentPrice).toFixed(2)}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteInvestment(inv.id)}
                    className="text-coral hover:text-coral/80 text-sm font-medium opacity-0 group-hover:opacity-100 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
