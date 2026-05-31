import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, Plus, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { apiGet, apiPost, apiDelete, getAuthToken } from '../api/client'
import DashboardLayout from '@/components/layout/DashboardLayout'

type TransactionItem = {
  id: number
  date: string
  description: string
  category: string
  account: string
  amount: number
  status: string
  type: string
  isRecurring?: boolean
  recurringInterval?: string
  notes?: string
}

type TransactionResponse = {
  page: number
  pageSize: number
  total: number
  items: TransactionItem[]
}

type CategoryItem = {
  id: number
  value: string
  label: string
  icon: string
  tone: string
}

type AccountItem = {
  id: number
  name: string
  type: string
  balance: number
  last4?: string
}

const fallbackTransactions: TransactionResponse = {
  page: 1,
  pageSize: 25,
  total: 3,
  items: [
    { id: 1, date: new Date().toISOString(), description: 'NeuralMind Subscription', category: 'AI_INSIGHTS', account: 'FloFi Main', amount: -49.99, status: 'CLEARED', type: 'EXPENSE', isRecurring: true, recurringInterval: 'monthly' },
    { id: 2, date: new Date().toISOString(), description: 'Horizon Properties', category: 'RENT_UTILITIES', account: 'Wealth Reserve', amount: -3200, status: 'CLEARED', type: 'EXPENSE' },
    { id: 3, date: new Date().toISOString(), description: 'Whole Foods Market', category: 'FOOD_DINING', account: 'FloFi Main', amount: -142.18, status: 'CLEARED', type: 'EXPENSE' },
  ],
}

const fallbackCategories: CategoryItem[] = [
  { id: 1, value: 'FOOD_DINING', label: 'Food & Dining', icon: 'Utensils', tone: 'amber' },
  { id: 2, value: 'RENT_UTILITIES', label: 'Rent & Utilities', icon: 'Home', tone: 'indigo' },
  { id: 3, value: 'SHOPPING', label: 'Shopping', icon: 'ShoppingCart', tone: 'rose' },
  { id: 4, value: 'INVESTMENTS', label: 'Investments', icon: 'Activity', tone: 'emerald' },
  { id: 5, value: 'AI_INSIGHTS', label: 'AI Insights', icon: 'Sparkles', tone: 'violet' },
  { id: 6, value: 'OTHER', label: 'Other', icon: 'HelpCircle', tone: 'slate' },
]

const toneColors: Record<string, { bg: string; text: string }> = {
  amber: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b' },
  indigo: { bg: 'rgba(99,102,241,0.1)', text: '#818cf8' },
  rose: { bg: 'rgba(255,107,107,0.1)', text: '#FF6B6B' },
  emerald: { bg: 'rgba(0,212,170,0.1)', text: '#00D4AA' },
  violet: { bg: 'rgba(139,92,246,0.1)', text: '#a78bfa' },
  slate: { bg: 'rgba(136,146,164,0.1)', text: '#8892A4' },
  sky: { bg: 'rgba(56,189,248,0.1)', text: '#38bdf8' },
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value)
}

export default function Transactions() {
  const [payload, setPayload] = useState<TransactionResponse | null>(null)
  const [categories, setCategories] = useState<CategoryItem[]>(fallbackCategories)
  const [accounts, setAccounts] = useState<AccountItem[]>([])
  const [authRequired, setAuthRequired] = useState(false)
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('ALL')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [timeframe, setTimeframe] = useState('ALL')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<TransactionItem | null>(null)

  const [showCatForm, setShowCatForm] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatTone, setNewCatTone] = useState('indigo')

  const [formDescription, setFormDescription] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formType, setFormType] = useState('EXPENSE')
  const [formCategory, setFormCategory] = useState('')
  const [formAccountId, setFormAccountId] = useState('')
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formNotes, setFormNotes] = useState('')
  const [formIsRecurring, setFormIsRecurring] = useState(false)
  const [formRecurringInterval, setFormRecurringInterval] = useState('monthly')
  const [aiSuggested, setAiSuggested] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const loadData = async () => {
    const token = getAuthToken()
    if (!token) { setAuthRequired(true); setLoading(false); return }

    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedType && selectedType !== 'ALL') params.append('type', selectedType)
      if (selectedCategory) params.append('category', selectedCategory)
      if (timeframe && timeframe !== 'ALL') params.append('timeframe', timeframe)

      const [txRes, catRes, accRes] = await Promise.all([
        apiGet<TransactionResponse>(`/api/transactions?${params.toString()}`),
        apiGet<{ categories: CategoryItem[] }>('/api/categories'),
        apiGet<{ accounts: AccountItem[] }>('/api/accounts')
      ])

      if (txRes.ok && txRes.data) setPayload(txRes.data)
      else if (txRes.status === 401) setAuthRequired(true)
      if (catRes.ok && catRes.data) setCategories(catRes.data.categories)
      if (accRes.ok && accRes.data) setAccounts(accRes.data.accounts)
    } catch (error) {
      console.error('Error loading ledger data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [searchQuery, selectedType, selectedCategory, timeframe])

  const handleDescriptionChange = async (val: string) => {
    setFormDescription(val)
    if (val.trim().length > 3) {
      try {
        const res = await apiGet<{ category: string }>(`/api/insights/smart-categorize?description=${encodeURIComponent(val)}`)
        if (res.ok && res.data) {
          const matched = categories.find(c => c.label.toLowerCase() === res.data!.category.toLowerCase() || c.value.toUpperCase() === res.data!.category.toUpperCase().replace(/\s+/g, '_'))
          if (matched) { setFormCategory(matched.value); setAiSuggested(true) }
        }
      } catch { setAiSuggested(false) }
    } else { setAiSuggested(false) }
  }

  const openEditModal = (tx: TransactionItem) => {
    setEditingTransaction(tx)
    setFormDescription(tx.description)
    setFormAmount(Math.abs(tx.amount).toString())
    setFormType(tx.type)
    setFormCategory(tx.category)
    const acc = accounts.find(a => `${a.name} • ${a.last4 ?? ''}`.trim() === tx.account)
    setFormAccountId(acc ? acc.id.toString() : (accounts[0]?.id.toString() ?? ''))
    setFormDate(new Date(tx.date).toISOString().split('T')[0])
    setFormNotes(tx.notes ?? '')
    setFormIsRecurring(tx.isRecurring ?? false)
    setFormRecurringInterval(tx.recurringInterval ?? 'monthly')
    setAiSuggested(false)
    setErrorMessage('')
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    setEditingTransaction(null)
    setFormDescription('')
    setFormAmount('')
    setFormType('EXPENSE')
    setFormCategory(categories[0]?.value ?? '')
    setFormAccountId(accounts[0]?.id.toString() ?? '')
    setFormDate(new Date().toISOString().split('T')[0])
    setFormNotes('')
    setFormIsRecurring(false)
    setFormRecurringInterval('monthly')
    setAiSuggested(false)
    setErrorMessage('')
    setIsModalOpen(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formDescription || !formAmount || !formAccountId || !formCategory) {
      setErrorMessage('Please fill in all required fields.')
      return
    }
    const payloadBody = {
      description: formDescription,
      amount: parseFloat(formAmount),
      type: formType,
      category: formCategory,
      accountId: parseInt(formAccountId),
      occurredAt: new Date(formDate).toISOString(),
      notes: formNotes,
      isRecurring: formIsRecurring,
      recurringInterval: formIsRecurring ? formRecurringInterval : undefined
    }
    try {
      const response = editingTransaction
        ? await apiPost(`/api/transactions/${editingTransaction.id}`, payloadBody)
        : await apiPost('/api/transactions', payloadBody)
      if (response.ok) { setIsModalOpen(false); loadData() }
      else { setErrorMessage((response.data as { error?: string })?.error ?? 'An error occurred.') }
    } catch { setErrorMessage('Connection failed.') }
  }

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('Delete this transaction?')) return
    const res = await apiDelete(`/api/transactions/${id}`)
    if (res.ok) loadData()
  }

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return
    const res = await apiPost<{ category: CategoryItem }>('/api/categories', { name: newCatName, tone: newCatTone })
    if (res.ok && res.data) {
      setCategories(prev => [...prev, res.data!.category])
      setFormCategory(res.data.category.value)
      setNewCatName('')
      setShowCatForm(false)
    }
  }

  const handleExportCSV = () => {
    const itemsList = payload?.items ?? fallbackTransactions.items
    const header = 'Date,Description,Category,Account,Amount,Type,Status\n'
    const rows = itemsList.map(tx => {
      const dateStr = new Date(tx.date).toLocaleDateString()
      return `"${dateStr}","${tx.description.replace(/"/g, '""')}","${tx.category}","${tx.account}",${tx.amount},"${tx.type}","${tx.status}"`
    }).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `flofi_transactions_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const content = payload ?? fallbackTransactions
  const showingRange = useMemo(() => {
    const start = content.items.length === 0 ? 0 : (content.page - 1) * content.pageSize + 1
    const end = Math.min(content.total, content.page * content.pageSize)
    return { start, end }
  }, [content.page, content.pageSize, content.total, content.items])

  return (
    <DashboardLayout>
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-4xl italic text-white">Transaction Ledger</h1>
          <p className="text-sm text-platinum mt-1">Audit and manage your precision wealth cashflows</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download size={14} /> Export CSV
          </Button>
          <Button onClick={openCreateModal} size="sm">
            <Plus size={14} /> Add Transaction
          </Button>
        </div>
      </header>

      {authRequired && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-300">
          Set a JWT in localStorage as <span className="font-semibold">flofi_token</span> to load live data.
        </div>
      )}

      {/* Filtering + Ledger */}
      <section className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="space-y-5">
          {/* Search */}
          <div className="glass-card rounded-lg p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-platinum mb-3">Search</p>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-platinum" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search merchant..."
                className="pl-9 rounded-full bg-white/[0.04] border-white/[0.08] text-white placeholder:text-platinum/50 focus:border-primary/40 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Type selector */}
          <div className="glass-card rounded-lg p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-platinum mb-3">Flow Type</p>
            <div className="flex gap-2">
              {['ALL', 'INCOME', 'EXPENSE'].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`flex-1 rounded-md py-2 text-xs font-medium transition-all ${
                    selectedType === t
                      ? 'bg-primary text-navy-950'
                      : 'bg-white/[0.04] text-platinum hover:bg-white/[0.06]'
                  }`}
                >
                  {t === 'ALL' ? 'All' : t === 'INCOME' ? 'Income' : 'Expense'}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div className="glass-card rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-platinum">Category</p>
              {selectedCategory && (
                <button onClick={() => setSelectedCategory('')} className="text-xs text-primary hover:underline">Reset</button>
              )}
            </div>
            <div className="space-y-1.5 text-sm">
              {categories.map((category) => (
                <label key={category.value} className="flex items-center gap-2 cursor-pointer py-1.5 px-2 hover:bg-white/[0.03] rounded-md transition">
                  <input
                    type="radio"
                    name="filterCat"
                    checked={selectedCategory === category.value}
                    onChange={() => setSelectedCategory(category.value)}
                    className="h-3.5 w-3.5 rounded-full border-white/20 text-primary accent-primary"
                  />
                  <span className="text-platinum">{category.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Timeframe */}
          <div className="glass-card rounded-lg p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-platinum mb-3">Timeframe</p>
            <div className="grid grid-cols-2 gap-2">
              {[{ label: 'All', value: 'ALL' }, { label: '30 Days', value: '30_DAYS' }, { label: 'Quarter', value: 'QUARTER' }, { label: 'Year', value: 'YEAR' }].map((tf) => (
                <button
                  type="button"
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={`rounded-md py-2 text-xs font-medium transition-all ${
                    timeframe === tf.value
                      ? 'bg-primary text-navy-950'
                      : 'bg-white/[0.04] text-platinum hover:bg-white/[0.06]'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="glass-card rounded-lg overflow-hidden">
          <div className="border-b border-white/[0.06] py-4 px-6">
            <h2 className="text-lg font-semibold text-white">Ledger</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-widest text-platinum">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Account</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-platinum">
                    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="mt-2 text-xs">Loading entries...</p>
                  </td></tr>
                ) : content.items.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-platinum">No transactions found.</td></tr>
                ) : (
                  content.items.map((tx, idx) => {
                    const catInfo = categories.find(c => c.value === tx.category) || { label: tx.category.replace(/_/g, ' '), tone: 'slate' }
                    const colors = toneColors[catInfo.tone] || toneColors.slate
                    return (
                      <motion.tr
                        key={tx.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.03 * idx, duration: 0.2 }}
                        className="border-b border-white/[0.03] hover:bg-white/[0.02] transition group"
                        style={{ borderLeft: `3px solid ${tx.amount < 0 ? '#FF6B6B' : '#00D4AA'}` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-platinum text-xs">
                          {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white flex items-center gap-2">
                            {tx.description}
                            {tx.isRecurring && (
                              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                {tx.recurringInterval}
                              </span>
                            )}
                          </div>
                          {tx.notes && <p className="text-xs text-platinum/60 mt-0.5">{tx.notes}</p>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className="rounded-full border-transparent px-2 py-0.5 text-[11px] font-medium" style={{ background: colors.bg, color: colors.text }}>
                            {catInfo.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-platinum text-xs">{tx.account}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${tx.amount < 0 ? 'text-coral' : 'text-primary'}`}>
                          {tx.amount < 0 ? '' : '+'}{formatCurrency(tx.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditModal(tx)} className="text-xs font-medium text-primary hover:underline">Edit</button>
                            <button onClick={() => handleDeleteTransaction(tx.id)} className="text-xs font-medium text-coral hover:underline">Delete</button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-white/[0.06] px-6 py-4 text-xs text-platinum">
            <span>Showing {showingRange.start} to {showingRange.end} of {content.total}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Prev</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </div>
      </section>

      {/* AI + Stats Row */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="relative rounded-lg overflow-hidden border-gradient-teal p-6 bg-navy-900">
          <h3 className="text-lg font-semibold text-primary mb-2">FloFi AI Insights</h3>
          <p className="text-sm text-platinum leading-relaxed">Weekend analysis reveals food and leisure charging spikes. Restructuring recurring subscriptions will recover up to $26/mo automatically.</p>
          <Link to="/ai-assistant" className="mt-4 inline-block text-xs font-semibold text-navy-950 bg-primary hover:bg-primary-600 px-4 py-2.5 rounded-md transition">
            Enter AI Control Room
          </Link>
        </div>
        <div className="glass-card rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Categorization Pace</h3>
          <p className="text-3xl font-bold text-white">98.4%</p>
          <p className="text-xs text-platinum mt-1 mb-3">Confidence scale auto-tagging with smart merchants</p>
          <Progress value={98} className="bg-white/[0.06] h-2 [&>div]:bg-primary" />
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-navy-800 rounded-lg shadow-elevated border border-white/[0.08] overflow-hidden my-8"
          >
            <div className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg text-white">{editingTransaction ? 'Edit Transaction' : 'New Transaction'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-platinum hover:text-white text-lg">×</button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {errorMessage && <div className="rounded-md bg-coral/10 border border-coral/20 p-3 text-xs text-coral">{errorMessage}</div>}

              <div>
                <label className="block text-xs font-medium text-platinum mb-2">Type</label>
                <div className="flex gap-2">
                  {['EXPENSE', 'INCOME'].map(type => (
                    <button type="button" key={type} onClick={() => setFormType(type)} className={`flex-1 py-2 text-sm font-medium rounded-md border transition ${formType === type ? (type === 'EXPENSE' ? 'bg-coral/10 border-coral/30 text-coral' : 'bg-primary/10 border-primary/30 text-primary') : 'bg-white/[0.03] border-white/[0.08] text-platinum'}`}>
                      {type === 'EXPENSE' ? 'Expense' : 'Income'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div><label className="block text-xs font-medium text-platinum mb-1.5">Amount ($)</label>
                  <Input required type="number" step="0.01" min="0.01" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="0.00" className="bg-white/[0.04] border-white/[0.08] text-white rounded-md" /></div>
                <div><label className="block text-xs font-medium text-platinum mb-1.5">Date</label>
                  <Input required type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="bg-white/[0.04] border-white/[0.08] text-white rounded-md" /></div>
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-platinum mb-1.5">Description</label>
                <Input required type="text" value={formDescription} onChange={(e) => handleDescriptionChange(e.target.value)} placeholder="e.g. Starbucks, Uber, Rent" className="bg-white/[0.04] border-white/[0.08] text-white rounded-md" />
                {aiSuggested && <span className="absolute right-3 top-8 text-[9px] uppercase tracking-wider bg-violet-500/10 text-violet-400 px-1.5 py-0.5 rounded font-bold">AI Tagged</span>}
              </div>

              <div><label className="block text-xs font-medium text-platinum mb-1.5">Account</label>
                <select required value={formAccountId} onChange={(e) => setFormAccountId(e.target.value)} className="w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40">
                  <option value="" disabled>Select Account</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (${Number(acc.balance).toLocaleString()})</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-platinum">Category</label>
                  <button type="button" onClick={() => setShowCatForm(!showCatForm)} className="text-xs text-primary font-medium hover:underline">{showCatForm ? 'Cancel' : '+ New'}</button>
                </div>
                {showCatForm ? (
                  <div className="border border-white/[0.06] bg-white/[0.02] p-3 rounded-md space-y-3">
                    <Input placeholder="Category Name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="bg-white/[0.04] border-white/[0.08] text-white rounded-md" />
                    <div className="flex gap-2">
                      <select value={newCatTone} onChange={(e) => setNewCatTone(e.target.value)} className="flex-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 text-xs text-white">
                        <option value="indigo">Indigo</option><option value="emerald">Emerald</option><option value="rose">Rose</option><option value="amber">Amber</option><option value="violet">Violet</option><option value="sky">Sky</option>
                      </select>
                      <button type="button" onClick={handleCreateCategory} disabled={!newCatName.trim()} className="bg-primary text-navy-950 text-xs px-3 py-1.5 rounded-md font-medium disabled:opacity-50">Save</button>
                    </div>
                  </div>
                ) : (
                  <select required value={formCategory} onChange={(e) => { setFormCategory(e.target.value); setAiSuggested(false) }} className="w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40">
                    <option value="" disabled>Select Category</option>
                    {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                  </select>
                )}
              </div>

              <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={formIsRecurring} onChange={(e) => setFormIsRecurring(e.target.checked)} className="h-4 w-4 rounded border-white/20 accent-primary" />
                  <div><p className="text-sm font-medium text-white">Recurring Transaction</p><p className="text-xs text-platinum">Auto-generate periodically</p></div>
                </label>
                {formIsRecurring && (
                  <select value={formRecurringInterval} onChange={(e) => setFormRecurringInterval(e.target.value)} className="w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40">
                    <option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option>
                  </select>
                )}
              </div>

              <div><label className="block text-xs font-medium text-platinum mb-1.5">Notes</label>
                <textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Optional notes..." className="w-full rounded-md border border-white/[0.08] bg-white/[0.04] p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[60px]" /></div>

              <div className="flex gap-3 pt-3 border-t border-white/[0.06]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-md border border-white/[0.08] bg-transparent text-sm font-medium hover:bg-white/[0.04] text-platinum transition">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-md bg-primary hover:bg-primary-600 text-navy-950 text-sm font-semibold transition">Save Entry</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  )
}
