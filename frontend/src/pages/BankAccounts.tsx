import { useState } from 'react'
import { motion } from 'framer-motion'
import Skeleton from '@/components/ui/Skeleton'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useGetBankConnectionsQuery, useConnectBankAccountMutation, useSyncBankAccountMutation, useDisconnectBankAccountMutation } from '@/store/api/bankAccountsApi'

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function BankAccounts() {
  const { data: liquidity, isLoading, isError } = useGetBankConnectionsQuery(undefined)
  const [connectAccount] = useConnectBankAccountMutation()
  const [syncAccount] = useSyncBankAccountMutation()
  const [disconnectAccount] = useDisconnectBankAccountMutation()
  const [showForm, setShowForm] = useState(false)

  const handleAddConnection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await connectAccount({
      bankName: formData.get('accountName') as string,
      accountType: formData.get('accountType') as string,
      balance: parseFloat(formData.get('balance') as string),
    })
    setShowForm(false)
  }

  const handleSync = async (id?: number) => {
    if (id) await syncAccount(id)
  }

  const handleDisconnect = async (id: number) => {
    if (!confirm('Disconnect this account?')) return
    await disconnectAccount(id)
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
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Failed to load bank accounts.</p>
        </div>
      </DashboardLayout>
    )
  }

  const connections: any[] = liquidity?.connections ?? []
  const totalLiquidity = liquidity?.totalLiquidity ?? connections.reduce((sum: number, c: any) => sum + (c.balance ?? 0), 0)

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
        <motion.div variants={fadeUp}>
          <h1 className="text-[26px] font-semibold" style={{ color: 'var(--foreground)' }}>Bank Accounts</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Manage your financial connections with real-time synchronization.</p>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-[var(--radius-lg)] p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <div className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>Net Liquidity</div>
            <div className="text-[26px] font-semibold tabular-nums" style={{ color: 'var(--primary)' }}>${totalLiquidity.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
          </div>
          <div className="rounded-[var(--radius-lg)] p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <div className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>Connected Accounts</div>
            <div className="text-[26px] font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>{connections.length}</div>
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: 'var(--primary)' }}></span>
              <span className="text-sm" style={{ color: 'var(--foreground)' }}>All synced</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-[var(--radius-lg)] p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--foreground)' }}>Linked Accounts</h2>
            <button onClick={() => setShowForm(!showForm)} className="font-semibold px-4 py-2 rounded-[var(--radius-sm)] text-sm text-white transition" style={{ background: 'var(--primary)' }}>
              Connect New Account
            </button>
          </div>

          {showForm && (
            <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={handleAddConnection} className="rounded-[var(--radius-md)] p-5 mb-6 space-y-4" style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border)' }}>
              <input type="text" name="accountName" placeholder="Account Name" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} required />
              <select name="accountType" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} required>
                <option value="">Select Type</option><option value="CHECKING">Checking</option><option value="SAVINGS">Savings</option><option value="INVESTMENT">Investment</option>
              </select>
              <input type="number" step="0.01" name="balance" placeholder="Balance" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} required />
              <button type="submit" className="w-full font-semibold px-4 py-2.5 rounded-[var(--radius-sm)] text-white transition" style={{ background: 'var(--primary)' }}>Connect Account</button>
            </motion.form>
          )}

          {connections.length === 0 ? (
            <div className="text-center py-12 rounded-[var(--radius-md)]" style={{ border: '1px dashed var(--border)', color: 'var(--muted-foreground)' }}>
              <div className="text-3xl mb-2" style={{ color: 'var(--primary)' }}>+</div>
              <p className="font-medium" style={{ color: 'var(--foreground)' }}>Connect your first bank account</p>
              <p className="text-xs mt-1">Support for 5,000+ banks</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connections.map((conn: any) => (
                <div key={conn.id} className="rounded-[var(--radius-md)] p-5 transition hover:bg-[var(--background)]" style={{ border: '1px solid var(--border)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--primary)' }}>Active</div>
                      <div className="font-medium mt-1" style={{ color: 'var(--foreground)' }}>{conn.accountName}</div>
                    </div>
                    <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--primary)' }}></span>
                  </div>
                  <div className="text-2xl font-semibold mb-2 tabular-nums" style={{ color: 'var(--foreground)' }}>${conn.balance?.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
                  <div className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>
                    {conn.accountType} {conn.maskedAccountNumber && `· ${conn.maskedAccountNumber}`}
                  </div>
                  <div className="flex justify-between items-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <span>{conn.lastSynced ? `Synced ${new Date(conn.lastSynced).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Not synced'}</span>
                    <button onClick={() => handleSync(conn.id)} className="font-medium" style={{ color: 'var(--primary)' }}>Sync</button>
                  </div>
                  <button onClick={() => handleDisconnect(conn.id)} className="w-full mt-4 px-3 py-2 rounded-[var(--radius-sm)] text-sm font-medium transition" style={{ border: '1px solid rgba(255,107,107,0.2)', color: 'var(--danger)', background: 'var(--danger-light)' }}>
                    Disconnect
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
