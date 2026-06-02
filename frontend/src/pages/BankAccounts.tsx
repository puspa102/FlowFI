import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Wallet,
  Banknote,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Plus,
  ArrowRightLeft,
  MoreHorizontal,
  Pencil,
  Trash2,
  Archive,
  X,
  Check,
} from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'
import DashboardLayout from '@/components/layout/DashboardLayout'
import {
  useGetBankAccountsQuery,
  useGetBankAccountsSummaryQuery,
  useGetTransferHistoryQuery,
  useCreateBankAccountMutation,
  useUpdateBankAccountMutation,
  useDeleteBankAccountMutation,
  useTransferBetweenAccountsMutation,
  type BankAccount,
  type BankAccountType,
  type CreateAccountRequest,
} from '@/store/api/bankAccountsApi'

const ACCOUNT_TYPES: { value: BankAccountType; label: string; icon: typeof Building2 }[] = [
  { value: 'BANK', label: 'Bank', icon: Building2 },
  { value: 'DIGITAL_WALLET', label: 'Digital Wallet', icon: Wallet },
  { value: 'CASH', label: 'Cash', icon: Banknote },
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
  { value: 'SAVINGS', label: 'Savings', icon: PiggyBank },
  { value: 'INVESTMENT', label: 'Investment', icon: TrendingUp },
]

const COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444',
  '#EC4899', '#06B6D4', '#6366F1', '#14B8A6', '#F97316',
]

const INSTITUTIONS = [
  'NIC Asia Bank', 'Nabil Bank', 'Global IME Bank', 'Himalayan Bank',
  'Nepal SBI Bank', 'Machhapuchhre Bank', 'eSewa', 'Khalti',
  'FonePay', 'IME Pay', 'Other',
]

function getTypeIcon(type: BankAccountType) {
  const found = ACCOUNT_TYPES.find((t) => t.value === type)
  return found?.icon ?? Building2
}

function getTypeLabel(type: BankAccountType) {
  return ACCOUNT_TYPES.find((t) => t.value === type)?.label ?? type
}

function formatCurrency(amount: number, currency = 'NPR') {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }

export default function BankAccounts() {
  const { data: accounts, isLoading } = useGetBankAccountsQuery()
  const { data: summary } = useGetBankAccountsSummaryQuery()
  const { data: transfers } = useGetTransferHistoryQuery()

  const [createAccount] = useCreateBankAccountMutation()
  const [updateAccount] = useUpdateBankAccountMutation()
  const [deleteAccount] = useDeleteBankAccountMutation()
  const [transferMoney] = useTransferBetweenAccountsMutation()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [menuOpen, setMenuOpen] = useState<number | null>(null)

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 md:grid-cols-3"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-52" /><Skeleton className="h-52" /><Skeleton className="h-52" /></div>
        </div>
      </DashboardLayout>
    )
  }

  const activeAccounts = accounts?.filter((a) => a.isActive) ?? []
  const archivedAccounts = accounts?.filter((a) => !a.isActive) ?? []

  const handleCreate = async (data: CreateAccountRequest) => {
    await createAccount(data)
    setShowAddModal(false)
  }

  const handleUpdate = async (id: number, data: any) => {
    await updateAccount({ id, data })
    setEditingAccount(null)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this account permanently?')) return
    await deleteAccount(id)
    setMenuOpen(null)
  }

  const handleArchive = async (id: number) => {
    await updateAccount({ id, data: { isActive: false } })
    setMenuOpen(null)
  }

  const handleTransfer = async (data: { fromAccountId: number; toAccountId: number; amount: number; description?: string }) => {
    await transferMoney(data)
    setShowTransferModal(false)
  }

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold" style={{ color: 'var(--foreground)' }}>Bank Accounts</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Manage your money across banks, wallets, and cash.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowTransferModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
              style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            >
              <ArrowRightLeft className="w-4 h-4" />
              Transfer
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg"
              style={{ background: 'var(--primary)', boxShadow: '0 4px 14px rgba(var(--primary-rgb), 0.3)' }}
            >
              <Plus className="w-4 h-4" />
              Add Account
            </button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--primary), #047857)', boxShadow: '0 8px 32px rgba(var(--primary-rgb), 0.25)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
            <p className="text-xs font-medium text-white/70 uppercase tracking-wider">Total Balance</p>
            <p className="text-[28px] font-bold text-white mt-2 tabular-nums">
              {formatCurrency(summary?.totalBalance ?? 0)}
            </p>
            <p className="text-xs text-white/60 mt-2">{summary?.activeCount ?? 0} active accounts</p>
          </div>

          <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Active</p>
            <p className="text-[28px] font-bold mt-2 tabular-nums" style={{ color: 'var(--foreground)' }}>{summary?.activeCount ?? 0}</p>
            <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
              {Object.keys(summary?.byType ?? {}).length} types in use
            </p>
          </div>

          <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Archived</p>
            <p className="text-[28px] font-bold mt-2 tabular-nums" style={{ color: 'var(--foreground)' }}>{summary?.archivedCount ?? 0}</p>
            <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>Inactive accounts</p>
          </div>
        </motion.div>

        {/* Account Cards */}
        {activeAccounts.length === 0 ? (
          <motion.div variants={fadeUp} className="text-center py-16 rounded-2xl" style={{ background: 'var(--card)', border: '2px dashed var(--border)' }}>
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: 'var(--primary-light)' }}>
              <Plus className="w-7 h-7" style={{ color: 'var(--primary)' }} />
            </div>
            <p className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>Add your first account</p>
            <p className="text-sm mt-1 max-w-sm mx-auto" style={{ color: 'var(--muted-foreground)' }}>
              Track your banks, wallets, cash, and cards all in one place.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--primary)' }}
            >
              Add Account
            </button>
          </motion.div>
        ) : (
          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeAccounts.map((account) => {
              const Icon = getTypeIcon(account.type)
              const color = account.color || '#10B981'
              return (
                <motion.div
                  key={account.id}
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="rounded-2xl p-6 relative group cursor-default"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: color }} />

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                      <div>
                        <p className="font-semibold text-[15px]" style={{ color: 'var(--foreground)' }}>{account.name}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          {account.institution || getTypeLabel(account.type)}
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === account.id ? null : account.id)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      <AnimatePresence>
                        {menuOpen === account.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-8 z-20 w-40 rounded-xl py-1.5 shadow-xl"
                            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                          >
                            <button
                              onClick={() => { setEditingAccount(account); setMenuOpen(null) }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-[var(--surface-sunken)] transition-colors"
                              style={{ color: 'var(--foreground)' }}
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleArchive(account.id)}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-[var(--surface-sunken)] transition-colors"
                              style={{ color: 'var(--foreground)' }}
                            >
                              <Archive className="w-3.5 h-3.5" /> Archive
                            </button>
                            <button
                              onClick={() => handleDelete(account.id)}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-[var(--surface-sunken)] transition-colors"
                              style={{ color: 'var(--danger)' }}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-[26px] font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
                      {formatCurrency(account.balance, account.currency)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[11px] px-2.5 py-1 rounded-full font-medium" style={{ background: `${color}18`, color }}>
                      {getTypeLabel(account.type)}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                      {account.currency}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Transfer History */}
        {transfers && transfers.length > 0 && (
          <motion.div variants={fadeUp} className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <h2 className="font-semibold text-[15px] mb-5" style={{ color: 'var(--foreground)' }}>Recent Transfers</h2>
            <div className="space-y-3">
              {transfers.slice(0, 8).map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3.5 rounded-xl" style={{ background: 'var(--surface-sunken)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
                      <ArrowRightLeft className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                        {t.description || 'Account Transfer'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        From {t.fromAccount.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>
                      {formatCurrency(t.amount)}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                      {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Archived Accounts */}
        {archivedAccounts.length > 0 && (
          <motion.div variants={fadeUp} className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <h2 className="font-semibold text-[15px] mb-4" style={{ color: 'var(--foreground)' }}>Archived Accounts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedAccounts.map((account) => {
                const Icon = getTypeIcon(account.type)
                return (
                  <div key={account.id} className="flex items-center gap-3 p-4 rounded-xl opacity-60" style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border)' }}>
                    <Icon className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{account.name}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{formatCurrency(account.balance)}</p>
                    </div>
                    <button
                      onClick={() => updateAccount({ id: account.id, data: { isActive: true } })}
                      className="text-xs font-medium px-3 py-1 rounded-lg"
                      style={{ color: 'var(--primary)', background: 'var(--primary-light)' }}
                    >
                      Restore
                    </button>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <AddAccountModal onClose={() => setShowAddModal(false)} onSubmit={handleCreate} />
        )}
        {editingAccount && (
          <EditAccountModal account={editingAccount} onClose={() => setEditingAccount(null)} onSubmit={handleUpdate} />
        )}
        {showTransferModal && (
          <TransferModal accounts={activeAccounts} onClose={() => setShowTransferModal(false)} onSubmit={handleTransfer} />
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function AddAccountModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: CreateAccountRequest) => void }) {
  const [form, setForm] = useState<CreateAccountRequest>({
    name: '',
    institution: '',
    type: 'BANK',
    balance: 0,
    currency: 'NPR',
    color: '#10B981',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  const inputStyle = { background: 'var(--surface-sunken)', border: '1px solid var(--border)', color: 'var(--foreground)' }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Add New Account</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--muted-foreground)' }}><X className="w-5 h-5" /></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Account Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Salary Account"
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Institution</label>
          <select
            value={form.institution}
            onChange={(e) => setForm({ ...form, institution: e.target.value })}
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            style={inputStyle}
          >
            <option value="">Select Institution (Optional)</option>
            {INSTITUTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Account Type</label>
          <div className="grid grid-cols-3 gap-2">
            {ACCOUNT_TYPES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, type: value })}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: form.type === value ? 'var(--primary-light)' : 'var(--surface-sunken)',
                  border: `1.5px solid ${form.type === value ? 'var(--primary)' : 'var(--border)'}`,
                  color: form.type === value ? 'var(--primary)' : 'var(--muted-foreground)',
                }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Initial Balance</label>
            <input
              type="number"
              step="0.01"
              value={form.balance || ''}
              onChange={(e) => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Currency</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={inputStyle}
            >
              <option value="NPR">NPR</option>
              <option value="USD">USD</option>
              <option value="INR">INR</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, color: c })}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{ background: c, border: form.color === c ? '3px solid var(--foreground)' : '3px solid transparent' }}
              >
                {form.color === c && <Check className="w-4 h-4 text-white" />}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.01]"
          style={{ background: 'var(--primary)', boxShadow: '0 4px 14px rgba(var(--primary-rgb), 0.3)' }}
        >
          Create Account
        </button>
      </form>
    </ModalOverlay>
  )
}

function EditAccountModal({ account, onClose, onSubmit }: { account: BankAccount; onClose: () => void; onSubmit: (id: number, data: any) => void }) {
  const [form, setForm] = useState({
    name: account.name,
    institution: account.institution || '',
    type: account.type,
    balance: account.balance,
    currency: account.currency,
    color: account.color || '#10B981',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(account.id, form)
  }

  const inputStyle = { background: 'var(--surface-sunken)', border: '1px solid var(--border)', color: 'var(--foreground)' }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Edit Account</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--muted-foreground)' }}><X className="w-5 h-5" /></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Account Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Institution</label>
          <select
            value={form.institution}
            onChange={(e) => setForm({ ...form, institution: e.target.value })}
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            style={inputStyle}
          >
            <option value="">Select Institution</option>
            {INSTITUTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Account Type</label>
          <div className="grid grid-cols-3 gap-2">
            {ACCOUNT_TYPES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, type: value })}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: form.type === value ? 'var(--primary-light)' : 'var(--surface-sunken)',
                  border: `1.5px solid ${form.type === value ? 'var(--primary)' : 'var(--border)'}`,
                  color: form.type === value ? 'var(--primary)' : 'var(--muted-foreground)',
                }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Balance</label>
            <input
              type="number"
              step="0.01"
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Currency</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={inputStyle}
            >
              <option value="NPR">NPR</option>
              <option value="USD">USD</option>
              <option value="INR">INR</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, color: c })}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{ background: c, border: form.color === c ? '3px solid var(--foreground)' : '3px solid transparent' }}
              >
                {form.color === c && <Check className="w-4 h-4 text-white" />}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.01]"
          style={{ background: 'var(--primary)', boxShadow: '0 4px 14px rgba(var(--primary-rgb), 0.3)' }}
        >
          Save Changes
        </button>
      </form>
    </ModalOverlay>
  )
}

function TransferModal({ accounts, onClose, onSubmit }: {
  accounts: BankAccount[]
  onClose: () => void
  onSubmit: (data: { fromAccountId: number; toAccountId: number; amount: number; description?: string }) => void
}) {
  const [fromId, setFromId] = useState<number>(accounts[0]?.id ?? 0)
  const [toId, setToId] = useState<number>(accounts[1]?.id ?? 0)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const fromAccount = accounts.find((a) => a.id === fromId)
  const toAccount = accounts.find((a) => a.id === toId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) { setError('Enter a valid amount'); return }
    if (fromId === toId) { setError('Select different accounts'); return }
    if (fromAccount && numAmount > fromAccount.balance) { setError('Insufficient balance'); return }

    setSuccess(true)
    setTimeout(() => {
      onSubmit({ fromAccountId: fromId, toAccountId: toId, amount: numAmount, description: description || undefined })
    }, 1200)
  }

  const inputStyle = { background: 'var(--surface-sunken)', border: '1px solid var(--border)', color: 'var(--foreground)' }

  if (success) {
    return (
      <ModalOverlay onClose={onClose}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center py-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'var(--primary-light)' }}
          >
            <Check className="w-8 h-8" style={{ color: 'var(--primary)' }} />
          </motion.div>
          <p className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>Transfer Successful</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            {formatCurrency(parseFloat(amount))} moved to {toAccount?.name}
          </p>
        </motion.div>
      </ModalOverlay>
    )
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Transfer Money</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--muted-foreground)' }}><X className="w-5 h-5" /></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>From</label>
            <select
              value={fromId}
              onChange={(e) => setFromId(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={inputStyle}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance)})</option>
              ))}
            </select>
          </div>
          <ArrowRightLeft className="w-5 h-5 mt-5 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
          <div className="flex-1">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>To</label>
            <select
              value={toId}
              onChange={(e) => setToId(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={inputStyle}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance)})</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>NPR</span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-14 pr-4 py-3.5 rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={inputStyle}
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Description (Optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Transfer to savings"
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            style={inputStyle}
          />
        </div>

        {error && (
          <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>{error}</p>
        )}

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.01]"
          style={{ background: 'var(--primary)', boxShadow: '0 4px 14px rgba(var(--primary-rgb), 0.3)' }}
        >
          Transfer Money
        </button>
      </form>
    </ModalOverlay>
  )
}
