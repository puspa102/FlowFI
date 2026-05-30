import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    {
      id: 1,
      date: new Date().toISOString(),
      description: 'NeuralMind Subscription',
      category: 'AI_INSIGHTS',
      account: 'FloFi Main • 9904',
      amount: -49.99,
      status: 'CLEARED',
      type: 'EXPENSE',
      isRecurring: true,
      recurringInterval: 'monthly'
    },
    {
      id: 2,
      date: new Date().toISOString(),
      description: 'Horizon Properties',
      category: 'RENT_UTILITIES',
      account: 'Wealth Reserve • 1122',
      amount: -3200,
      status: 'CLEARED',
      type: 'EXPENSE',
    },
    {
      id: 3,
      date: new Date().toISOString(),
      description: 'Whole Foods Market',
      category: 'FOOD_DINING',
      account: 'FloFi Main • 9904',
      amount: -142.18,
      status: 'CLEARED',
      type: 'EXPENSE',
    },
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value)
}

export default function Transactions() {
  const [payload, setPayload] = useState<TransactionResponse | null>(null)
  const [categories, setCategories] = useState<CategoryItem[]>(fallbackCategories)
  const [accounts, setAccounts] = useState<AccountItem[]>([])
  const [authRequired, setAuthRequired] = useState(false)
  const [loading, setLoading] = useState(true)

  // Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('ALL')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [timeframe, setTimeframe] = useState('ALL')

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<TransactionItem | null>(null)

  // Category Manager inline state
  const [showCatForm, setShowCatForm] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatTone, setNewCatTone] = useState('indigo')

  // Form Fields state
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

  // Load Transactions & Metadata
  const loadData = async () => {
    const token = getAuthToken()
    if (!token) {
      setAuthRequired(true)
      setLoading(false)
      return
    }

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

      if (txRes.ok && txRes.data) {
        setPayload(txRes.data)
      } else if (txRes.status === 401) {
        setAuthRequired(true)
      }

      if (catRes.ok && catRes.data) {
        setCategories(catRes.data.categories)
      }

      if (accRes.ok && accRes.data) {
        setAccounts(accRes.data.accounts)
      }
    } catch (error) {
      console.error('Error loading ledger data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [searchQuery, selectedType, selectedCategory, timeframe])

  // Dynamic Suggest Category on Merchant Change
  const handleDescriptionChange = async (val: string) => {
    setFormDescription(val)
    if (val.trim().length > 3) {
      try {
        const res = await apiGet<{ category: string }>(`/api/insights/smart-categorize?description=${encodeURIComponent(val)}`)
        if (res.ok && res.data) {
          const categoryData = res.data
          const matched = categories.find(
            c => c.label.toLowerCase() === categoryData.category.toLowerCase() ||
                 c.value.toUpperCase() === categoryData.category.toUpperCase().replace(/\s+/g, '_')
          )
          if (matched) {
            setFormCategory(matched.value)
            setAiSuggested(true)
          }
        }
      } catch (err) {
        console.error('Smart tagger error:', err)
      }
    } else {
      setAiSuggested(false)
    }
  }

  // Handle Edit click
  const openEditModal = (tx: TransactionItem) => {
    setEditingTransaction(tx)
    setFormDescription(tx.description)
    setFormAmount(Math.abs(tx.amount).toString())
    setFormType(tx.type)
    setFormCategory(tx.category)
    // Find matching account ID
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

  // Handle Create click
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

  // Submit Modal Form
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
      let response
      if (editingTransaction) {
        response = await apiPost(`/api/transactions/${editingTransaction.id}`, payloadBody)
      } else {
        response = await apiPost('/api/transactions', payloadBody)
      }

      if (response.ok) {
        setIsModalOpen(false)
        loadData()
      } else {
        const errorData = response.data as any
        setErrorMessage(errorData?.error ?? 'An error occurred while saving.')
      }
    } catch (err) {
      console.error(err)
      setErrorMessage('Connection failed.')
    }
  }

  // Delete Transaction
  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction? This will permanently revert the impact on its account balance.')) {
      return
    }

    try {
      const res = await apiDelete(`/api/transactions/${id}`)
      if (res.ok) {
        loadData()
      } else {
        alert('Failed to delete transaction.')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Create Category Inline
  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return

    try {
      const res = await apiPost<{ category: CategoryItem }>('/api/categories', {
        name: newCatName,
        tone: newCatTone
      })

      if (res.ok && res.data) {
        const added = res.data.category
        setCategories(prev => [...prev, added])
        setFormCategory(added.value)
        setNewCatName('')
        setShowCatForm(false)
      } else {
        alert('Failed to create category.')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    const itemsList = payload?.items ?? fallbackTransactions.items
    const header = 'Date,Description,Category,Account,Amount,Type,Status,Recurring,Interval\n'
    const rows = itemsList.map(tx => {
      const dateStr = new Date(tx.date).toLocaleDateString()
      const desc = tx.description.replace(/"/g, '""')
      const cat = tx.category
      const acc = tx.account
      const amt = tx.amount
      const type = tx.type
      const status = tx.status
      const recurring = tx.isRecurring ? 'Yes' : 'No'
      const interval = tx.recurringInterval || 'N/A'
      return `"${dateStr}","${desc}","${cat}","${acc}",${amt},"${type}","${status}","${recurring}","${interval}"`
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

  // Colors mapping for premium design
  const toneClasses: { [key: string]: string } = {
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    violet: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
    slate: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    sky: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
  }

  return (
    <DashboardLayout>
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl text-slate-900 tracking-tight">Transaction Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">Configure, audit, and log precision wealth cashflows</p>
        </div>
        <div className="flex flex-wrap gap-3">
              <Button onClick={handleExportCSV} variant="outline" className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
                Export CSV
              </Button>
              <Button onClick={openCreateModal} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
                + Add transaction
              </Button>
            </div>
          </header>

          {authRequired && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-800 backdrop-blur-xs">
              ⚠️ Set a JWT in localStorage as <span className="font-semibold">flofi_token</span> to load live accounts & category ledgers.
            </div>
          )}

          {/* Filtering Workspace */}
          <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="space-y-6">
              
              {/* Search */}
              <Card className="border-slate-200/70 bg-white shadow-xs rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Merchant Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search description..." 
                    className="rounded-xl border-slate-200 px-4 py-2"
                  />
                </CardContent>
              </Card>

              {/* Type selector */}
              <Card className="border-slate-200/70 bg-white shadow-xs rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Flow Type</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                  {['ALL', 'INCOME', 'EXPENSE'].map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setSelectedType(t)}
                      className={`flex-1 rounded-xl py-2 text-xs font-medium border transition ${
                        selectedType === t 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t === 'ALL' ? 'All' : t === 'INCOME' ? 'Income' : 'Expense'}
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Category checklist */}
              <Card className="border-slate-200/70 bg-white shadow-xs rounded-2xl">
                <CardHeader className="flex-row items-center justify-between pb-3">
                  <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Filter Category</CardTitle>
                  {selectedCategory && (
                    <button onClick={() => setSelectedCategory('')} className="text-xs text-indigo-600 hover:underline">
                      Reset
                    </button>
                  )}
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600">
                  {categories.map((category) => (
                    <label key={category.value} className="flex items-center gap-2 cursor-pointer py-1 px-2 hover:bg-slate-50 rounded-lg transition">
                      <input
                        type="radio"
                        name="filterCat"
                        checked={selectedCategory === category.value}
                        onChange={() => setSelectedCategory(category.value)}
                        className="h-4 w-4 rounded-full border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{category.label}</span>
                    </label>
                  ))}
                </CardContent>
              </Card>

              {/* Timeframe selector */}
              <Card className="border-slate-200/70 bg-white shadow-xs rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Timeframe</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'All', value: 'ALL' },
                    { label: '30 Days', value: '30_DAYS' },
                    { label: 'Quarter', value: 'QUARTER' },
                    { label: 'Year', value: 'YEAR' }
                  ].map((tf) => (
                    <button
                      type="button"
                      key={tf.value}
                      onClick={() => setTimeframe(tf.value)}
                      className={`rounded-xl py-2 text-xs font-medium border transition ${
                        timeframe === tf.value
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Ledger */}
            <Card className="border-slate-200/70 bg-white shadow-xs rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 py-4 bg-slate-50/50">
                <CardTitle className="text-lg font-semibold text-slate-800">Ledger</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 bg-slate-50/20">
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Account</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-slate-400">
                            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                            <p className="mt-2 text-xs">Loading ledger entries...</p>
                          </td>
                        </tr>
                      ) : content.items.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-slate-400">
                            No transactions found for the active filter set.
                          </td>
                        </tr>
                      ) : (
                        content.items.map((tx) => {
                          const catInfo = categories.find(c => c.value === tx.category) || { label: tx.category.replace(/_/g, ' '), tone: 'slate' }
                          const toneStyle = toneClasses[catInfo.tone] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                          return (
                            <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                              <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-slate-900 flex items-center gap-2">
                                  {tx.description}
                                  {tx.isRecurring && (
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                                      🔄 {tx.recurringInterval}
                                    </span>
                                  )}
                                </div>
                                {tx.notes && <p className="text-xs text-slate-400 mt-0.5">{tx.notes}</p>}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="outline" className={`rounded-lg py-0.5 px-2 capitalize border font-medium ${toneStyle}`}>
                                  {catInfo.label}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-slate-500">{tx.account}</td>
                              <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${tx.amount < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                                {tx.amount < 0 ? '' : '+'}{formatCurrency(tx.amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                                <button onClick={() => openEditModal(tx)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1.5 rounded-lg transition">
                                  Edit
                                </button>
                                <button onClick={() => handleDeleteTransaction(tx.id)} className="text-xs font-semibold text-rose-600 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2 py-1.5 rounded-lg transition">
                                  Delete
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-xs text-slate-500 bg-slate-50/20">
                  <span>
                    Showing {showingRange.start} to {showingRange.end} of {content.total} entries
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-lg">Prev</Button>
                    <Button variant="outline" size="sm" className="rounded-lg">Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* AI Predictor Highlight Row */}
          <section className="grid gap-6 md:grid-cols-2">
            <Card className="border-slate-200/70 bg-linear-to-br from-indigo-900 to-indigo-950 text-white shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-indigo-200">FloFi AI Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-indigo-100">
                <p>Weekend analysis reveals food and leisure charging spikes. Restructuring recurring subscriptions will recover up to $26/mo automatically.</p>
                <Link to="/ai-assistant" className="inline-block text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-xl transition">
                  Enter AI Control Room →
                </Link>
              </CardContent>
            </Card>
            <Card className="border-slate-200/70 bg-white shadow-xs rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Categorization Pace</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-3xl font-bold text-slate-900">98.4%</p>
                <p className="text-xs text-slate-400">Confidence scale auto-tagging with smart merchants</p>
                <Progress value={98} className="bg-slate-100 h-2 [&>div]:bg-indigo-600" />
              </CardContent>
            </Card>
          </section>

          <footer className="text-xs text-slate-400 pt-6">FloFi • Precision Wealth SaaS Engine</footer>

      {/* Dynamic Add / Edit Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">{editingTransaction ? 'Edit Transaction' : 'New Transaction'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {errorMessage && (
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs text-rose-700">
                  {errorMessage}
                </div>
              )}

              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Type</label>
                <div className="flex gap-2">
                  {['EXPENSE', 'INCOME'].map(type => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setFormType(type)}
                      className={`flex-1 py-2 text-sm font-semibold rounded-xl border transition ${
                        formType === type 
                          ? type === 'EXPENSE' 
                            ? 'bg-rose-50 border-rose-200 text-rose-700' 
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {type === 'EXPENSE' ? '💸 Expense' : '💰 Income'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount & Description */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Amount ($)</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="0.00"
                    className="rounded-xl border-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Date</label>
                  <Input
                    required
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1 relative">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Description / Merchant</label>
                <Input
                  required
                  type="text"
                  value={formDescription}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  placeholder="e.g. Starbucks, Uber, Rent"
                  className="rounded-xl border-slate-200"
                />
                {aiSuggested && (
                  <span className="absolute right-3 top-8 text-[9px] uppercase tracking-wider bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-bold">
                    🔮 AI Tagged
                  </span>
                )}
              </div>

              {/* Account selection */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Account</label>
                <select
                  required
                  value={formAccountId}
                  onChange={(e) => setFormAccountId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" disabled>Select Account</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (${Number(acc.balance).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category selection & inline custom creation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Category</label>
                  <button
                    type="button"
                    onClick={() => setShowCatForm(!showCatForm)}
                    className="text-xs text-indigo-600 font-medium hover:underline"
                  >
                    {showCatForm ? 'Cancel' : '+ New Custom'}
                  </button>
                </div>

                {showCatForm ? (
                  <div className="border border-slate-100 bg-slate-50 p-3 rounded-2xl space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Custom Category</p>
                    <Input
                      placeholder="Category Name (e.g. Fitness)"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="rounded-xl border-slate-200 bg-white"
                    />
                    <div className="flex gap-2 items-center">
                      <select
                        value={newCatTone}
                        onChange={(e) => setNewCatTone(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs"
                      >
                        <option value="indigo">Indigo Tone</option>
                        <option value="emerald">Emerald Tone</option>
                        <option value="rose">Rose Tone</option>
                        <option value="amber">Amber Tone</option>
                        <option value="violet">Violet Tone</option>
                        <option value="sky">Sky Tone</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={!newCatName.trim()}
                        className="bg-indigo-600 text-white text-xs px-3 py-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <select
                    required
                    value={formCategory}
                    onChange={(e) => { setFormCategory(e.target.value); setAiSuggested(false) }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Recurring Transaction Scheduling */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsRecurring}
                    onChange={(e) => setFormIsRecurring(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Recurring Transaction</p>
                    <p className="text-xs text-slate-500">Auto-generate occurrences periodically</p>
                  </div>
                </label>

                {formIsRecurring && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-100">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Scheduler Interval</label>
                    <select
                      value={formRecurringInterval}
                      onChange={(e) => setFormRecurringInterval(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="weekly">Every Week</option>
                      <option value="monthly">Every Month</option>
                      <option value="yearly">Every Year</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Notes (Optional)</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Memo tags, serial IDs, or invoice records..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 min-h-[60px]"
                />
              </div>

              {/* Form buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold hover:bg-slate-50 text-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
