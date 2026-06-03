import { useState } from 'react'
import { motion } from 'framer-motion'
import Skeleton from '@/components/ui/Skeleton'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { formatMoney, useUserCurrency } from '@/lib/currency'
import { useGetInvestmentsQuery, useGetTopAssetsQuery, useAddInvestmentMutation, useDeleteInvestmentMutation } from '@/store/api/investmentsApi'

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function Investments() {
  const { data: portfolio, isLoading, isError } = useGetInvestmentsQuery(undefined)
  const { data: topAssets } = useGetTopAssetsQuery(undefined)
  const [addInvestment] = useAddInvestmentMutation()
  const [deleteInvestment] = useDeleteInvestmentMutation()
  const [showForm, setShowForm] = useState(false)
  const currency = useUserCurrency()
  const fc = (value: number) => formatMoney(value, currency, 2)

  const handleAddInvestment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await addInvestment({
      symbol: formData.get('symbol'),
      name: formData.get('name'),
      type: formData.get('type'),
      quantity: parseFloat(formData.get('quantity') as string),
      purchasePrice: parseFloat(formData.get('purchasePrice') as string),
      currentPrice: parseFloat(formData.get('currentPrice') as string),
      allocation: parseFloat(formData.get('allocation') as string),
    })
    setShowForm(false)
  }

  const handleDeleteInvestment = async (id: number) => {
    if (!confirm('Remove this investment?')) return
    await deleteInvestment(id)
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
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Failed to load investment data.</p>
        </div>
      </DashboardLayout>
    )
  }

  const topAssetsList: any[] = Array.isArray(topAssets) ? topAssets : []

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
        <motion.div variants={fadeUp}>
          <h1 className="text-[26px] font-semibold" style={{ color: 'var(--foreground)' }}>Investments</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Real-time oversight of your portfolio.</p>
        </motion.div>

        {portfolio && (
          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-[var(--radius-lg)] p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
              <div className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>Total Portfolio Value</div>
              <div className="text-[26px] font-semibold tabular-nums" style={{ color: 'var(--primary)' }}>{fc(portfolio.totalValue ?? 0)}</div>
              <div className="text-sm mt-2 font-medium" style={{ color: portfolio.gainLossPercent >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {portfolio.gainLossPercent >= 0 ? '+' : ''}{Math.abs(portfolio.gainLossPercent)?.toFixed(2)}% ({portfolio.gainLoss > 0 ? '+' : ''}{fc(portfolio.gainLoss ?? 0)})
              </div>
            </div>
            <div className="rounded-[var(--radius-lg)] p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
              <div className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>Total Cost</div>
              <div className="text-[26px] font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>{fc(portfolio.totalCost ?? 0)}</div>
              <div className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>{portfolio.investments?.length ?? 0} investments</div>
            </div>
          </motion.div>
        )}

        {topAssetsList.length > 0 && (
          <motion.div variants={fadeUp} className="rounded-[var(--radius-lg)] p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Top Performing Assets</h2>
            <div className="space-y-3">
              {topAssetsList.map((asset: any) => (
                <div key={asset.id} className="flex items-center justify-between p-4 rounded-[var(--radius-md)] transition hover:bg-[var(--background)]" style={{ border: '1px solid var(--border)' }}>
                  <div>
                    <div className="font-medium" style={{ color: 'var(--foreground)' }}>{asset.name}</div>
                    <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{asset.symbol}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>{fc(asset.quantity * asset.currentPrice)}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{asset.allocation}% allocation</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div variants={fadeUp} className="rounded-[var(--radius-lg)] p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--foreground)' }}>All Investments</h2>
            <button onClick={() => setShowForm(!showForm)} className="font-semibold px-4 py-2 rounded-[var(--radius-sm)] text-sm text-white transition" style={{ background: 'var(--primary)' }}>
              Add Investment
            </button>
          </div>

          {showForm && (
            <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={handleAddInvestment} className="rounded-[var(--radius-md)] p-5 mb-6 space-y-4" style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border)' }}>
              <input type="text" name="symbol" placeholder="Symbol (e.g., AAPL)" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} required />
              <input type="text" name="name" placeholder="Company Name" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} required />
              <select name="type" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} required>
                <option value="STOCK">Stock</option><option value="ETF">ETF</option><option value="CRYPTO">Crypto</option><option value="BOND">Bond</option>
              </select>
              <input type="number" step="0.00001" name="quantity" placeholder="Quantity" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} required />
              <input type="number" step="0.01" name="purchasePrice" placeholder="Purchase Price" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} required />
              <input type="number" step="0.01" name="currentPrice" placeholder="Current Price" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} required />
              <input type="number" name="allocation" placeholder="Allocation %" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} required />
              <button type="submit" className="w-full font-semibold px-4 py-2.5 rounded-[var(--radius-sm)] text-white transition" style={{ background: 'var(--primary)' }}>Add Investment</button>
            </motion.form>
          )}

          {(!portfolio?.investments || portfolio.investments.length === 0) ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>No investments yet. Add your first position above.</p>
          ) : (
            <div className="space-y-3">
              {portfolio.investments.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between p-4 rounded-[var(--radius-md)] transition group hover:bg-[var(--background)]" style={{ border: '1px solid var(--border)' }}>
                  <div>
                    <div className="font-medium" style={{ color: 'var(--foreground)' }}>{inv.name}</div>
                    <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{inv.quantity} @ {fc(inv.currentPrice ?? 0)}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>{fc(inv.quantity * inv.currentPrice)}</div>
                    </div>
                    <button onClick={() => handleDeleteInvestment(inv.id)} className="text-sm font-medium opacity-0 group-hover:opacity-100 transition" style={{ color: 'var(--danger)' }}>Delete</button>
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
