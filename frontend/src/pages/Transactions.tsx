import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Plus, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { formatMoney, useUserCurrency } from '@/lib/currency'
import {
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useSmartCategorizeMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useGetAccountsQuery,
} from '@/store/api/transactionsApi'

type TransactionItem = {
  id: number
  date: string
  description: string
  category: string
  accountId: number
  account: string
  amount: number
  status: string
  type: string
  isRecurring?: boolean
  recurringInterval?: string
  notes?: string
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

const toneColors: Record<string, { bg: string; text: string }> = {
  amber: { bg: 'var(--warning-light)', text: 'var(--warning)' },
  indigo: { bg: 'var(--info-light)', text: 'var(--info)' },
  rose: { bg: 'var(--danger-light)', text: 'var(--danger)' },
  emerald: { bg: 'var(--primary-light)', text: 'var(--primary)' },
  violet: { bg: 'var(--accent-light)', text: 'var(--accent)' },
  slate: { bg: 'var(--surface-sunken)', text: 'var(--muted-foreground)' },
  sky: { bg: 'var(--info-light)', text: 'var(--info)' },
}

export default function Transactions() {
  const currency = useUserCurrency()
  const formatCurrency = (value: number) => formatMoney(value, currency, 2)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedType, setSelectedType] = useState('ALL')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [timeframe, setTimeframe] = useState('ALL')
  const [page, setPage] = useState(1)
  const pageSize = 25

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

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

  const { data: txData, isLoading, isError, refetch } = useGetTransactionsQuery({
    search: debouncedSearch || undefined,
    type: selectedType !== 'ALL' ? selectedType : undefined,
    category: selectedCategory || undefined,
    timeframe: timeframe !== 'ALL' ? timeframe : undefined,
    page,
    pageSize,
  })
  const { data: catData } = useGetCategoriesQuery(undefined)
  const { data: accData } = useGetAccountsQuery(undefined)

  const [createTransaction] = useCreateTransactionMutation()
  const [updateTransaction] = useUpdateTransactionMutation()
  const [deleteTransaction] = useDeleteTransactionMutation()
  const [smartCategorize] = useSmartCategorizeMutation()
  const [createCategory] = useCreateCategoryMutation()

  const categories: CategoryItem[] = catData?.categories ?? []
  const accounts: AccountItem[] = accData?.accounts ?? []
  const content = txData ?? { page: 1, pageSize: 25, total: 0, items: [] }
  const totalPages = Math.max(1, Math.ceil(content.total / content.pageSize))
  const canGoPrev = content.page > 1
  const canGoNext = content.page < totalPages

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, selectedType, selectedCategory, timeframe])

  const categorizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (categorizeTimerRef.current) clearTimeout(categorizeTimerRef.current)
    }
  }, [])

  const handleDescriptionChange = useCallback((val: string) => {
    setFormDescription(val)
    if (categorizeTimerRef.current) {
      clearTimeout(categorizeTimerRef.current)
    }
    if (val.trim().length > 3) {
      categorizeTimerRef.current = setTimeout(async () => {
        try {
          const result = await smartCategorize({ description: val }).unwrap()
          if (result?.category) {
            const matched = categories.find(c => c.label.toLowerCase() === result.category.toLowerCase() || c.value.toUpperCase() === result.category.toUpperCase().replace(/\s+/g, '_'))
            if (matched) { setFormCategory(matched.value); setAiSuggested(true) }
          }
        } catch { setAiSuggested(false) }
      }, 500)
    } else { setAiSuggested(false) }
  }, [categories, smartCategorize])

  const openEditModal = (tx: TransactionItem) => {
    setEditingTransaction(tx)
    setFormDescription(tx.description)
    setFormAmount(Math.abs(tx.amount).toString())
    setFormType(tx.type)
    setFormCategory(tx.category)
    const acc = accounts.find(a => a.id === tx.accountId)
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
    const body = {
      description: formDescription,
      amount: parseFloat(formAmount),
      type: formType,
      category: formCategory,
      accountId: parseInt(formAccountId),
      occurredAt: new Date(formDate).toISOString(),
      notes: formNotes,
      isRecurring: formIsRecurring,
      recurringInterval: formIsRecurring ? formRecurringInterval : undefined,
    }
    try {
      if (editingTransaction) {
        await updateTransaction({ id: editingTransaction.id, ...body }).unwrap()
      } else {
        await createTransaction(body).unwrap()
        setPage(1)
      }
      setIsModalOpen(false)
    } catch (err: any) {
      setErrorMessage(err?.data?.error ?? 'An error occurred.')
    }
  }

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('Delete this transaction?')) return
    await deleteTransaction(id)
  }

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return
    try {
      const result = await createCategory({ name: newCatName, tone: newCatTone }).unwrap()
      if (result?.category) {
        setFormCategory(result.category.value)
      }
      setNewCatName('')
      setShowCatForm(false)
    } catch { /* ignore */ }
  }

  const handleExportCSV = () => {
    const itemsList = content.items
    const header = 'Date,Description,Category,Account,Amount,Type,Status\n'
    const rows = itemsList.map((tx: any) => {
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

  const showingRange = useMemo(() => {
    const start = content.items.length === 0 ? 0 : (content.page - 1) * content.pageSize + 1
    const end = Math.min(content.total, content.page * content.pageSize)
    return { start, end }
  }, [content.page, content.pageSize, content.total, content.items])

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Failed to load transactions.</p>
          <Button onClick={() => refetch()} size="sm">Retry</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[26px] font-semibold" style={{ color: 'var(--foreground)' }}>Transactions</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Manage and track all your cashflows</p>
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

      {/* Filtering + Ledger */}
      <section className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="space-y-5">
          <div className="rounded-[var(--radius-lg)] p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>Search</p>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search merchant..."
                className="pl-9 rounded-full"
              />
            </div>
          </div>

          <div className="rounded-[var(--radius-lg)] p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>Flow Type</p>
            <div className="flex gap-2">
              {['ALL', 'INCOME', 'EXPENSE'].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className="flex-1 rounded-[var(--radius-sm)] py-2 text-xs font-medium transition-all"
                  style={{
                    background: selectedType === t ? 'var(--primary)' : 'var(--surface-sunken)',
                    color: selectedType === t ? 'white' : 'var(--muted-foreground)',
                  }}
                >
                  {t === 'ALL' ? 'All' : t === 'INCOME' ? 'Income' : 'Expense'}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[var(--radius-lg)] p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Category</p>
              {selectedCategory && (
                <button onClick={() => setSelectedCategory('')} className="text-xs font-medium hover:underline" style={{ color: 'var(--primary)' }}>Reset</button>
              )}
            </div>
            <div className="space-y-1.5 text-sm">
              {categories.map((category) => (
                <label key={category.value} className="flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded-[var(--radius-sm)] transition hover:bg-[var(--surface-sunken)]">
                  <input
                    type="radio"
                    name="filterCat"
                    checked={selectedCategory === category.value}
                    onChange={() => setSelectedCategory(category.value)}
                    className="h-3.5 w-3.5 rounded-full accent-[var(--primary)]"
                  />
                  <span style={{ color: 'var(--muted-foreground)' }}>{category.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-[var(--radius-lg)] p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>Timeframe</p>
            <div className="grid grid-cols-2 gap-2">
              {[{ label: 'All', value: 'ALL' }, { label: '30 Days', value: '30_DAYS' }, { label: 'Quarter', value: 'QUARTER' }, { label: 'Year', value: 'YEAR' }].map((tf) => (
                <button
                  type="button"
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className="rounded-[var(--radius-sm)] py-2 text-xs font-medium transition-all"
                  style={{
                    background: timeframe === tf.value ? 'var(--primary)' : 'var(--surface-sunken)',
                    color: timeframe === tf.value ? 'white' : 'var(--muted-foreground)',
                  }}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="rounded-[var(--radius-lg)] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="py-4 px-6" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--foreground)' }}>Ledger</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Account</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
                    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
                    <p className="mt-2 text-xs">Loading entries...</p>
                  </td></tr>
                ) : content.items.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>No transactions found.</td></tr>
                ) : (
                  content.items.map((tx: any, idx: number) => {
                    const catInfo = categories.find(c => c.value === tx.category) || { label: tx.category?.replace(/_/g, ' ') ?? 'Other', tone: 'slate' }
                    const colors = toneColors[catInfo.tone] || toneColors.slate
                    return (
                      <motion.tr
                        key={tx.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.03 * idx, duration: 0.2 }}
                        className="transition group hover:bg-[var(--background)]"
                        style={{ borderBottom: '1px solid var(--border)' }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                            {tx.description}
                            {tx.isRecurring && (
                              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid rgba(0,201,167,0.2)' }}>
                                {tx.recurringInterval}
                              </span>
                            )}
                          </div>
                          {tx.notes && <p className="text-xs mt-0.5" style={{ color: 'var(--subtle-foreground)' }}>{tx.notes}</p>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className="rounded-full border-transparent px-2 py-0.5 text-[11px] font-medium" style={{ background: colors.bg, color: colors.text }}>
                            {catInfo.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs" style={{ color: 'var(--muted-foreground)' }}>{tx.account}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-semibold tabular-nums" style={{ color: tx.amount < 0 ? 'var(--danger)' : 'var(--success)' }}>
                          {tx.amount < 0 ? '' : '+'}{formatCurrency(tx.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button onClick={() => openEditModal(tx)} className="text-xs font-medium px-2 py-1 rounded transition-colors" style={{ color: 'var(--primary)', background: 'var(--primary-light)' }}>Edit</button>
                            <button onClick={() => handleDeleteTransaction(tx.id)} className="text-xs font-medium px-2 py-1 rounded transition-colors" style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}>Delete</button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-6 py-4 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
            <span>Showing {showingRange.start} to {showingRange.end} of {content.total}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={!canGoPrev || isLoading} onClick={() => setPage((current) => Math.max(1, current - 1))}>Prev</Button>
              <Button variant="outline" size="sm" disabled={!canGoNext || isLoading} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg rounded-[var(--radius-lg)] shadow-elevated overflow-hidden my-8"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>{editingTransaction ? 'Edit Transaction' : 'New Transaction'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-lg" style={{ color: 'var(--muted-foreground)' }}>×</button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {errorMessage && <div className="rounded-[var(--radius-sm)] p-3 text-xs" style={{ background: 'var(--danger-light)', border: '1px solid rgba(255,107,107,0.2)', color: 'var(--danger)' }}>{errorMessage}</div>}

              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>Type</label>
                <div className="flex gap-2">
                  {['EXPENSE', 'INCOME'].map(type => (
                    <button type="button" key={type} onClick={() => setFormType(type)} className="flex-1 py-2 text-sm font-medium rounded-[var(--radius-sm)] border transition" style={{
                      background: formType === type ? (type === 'EXPENSE' ? 'var(--danger-light)' : 'var(--primary-light)') : 'var(--surface-sunken)',
                      borderColor: formType === type ? (type === 'EXPENSE' ? 'rgba(255,107,107,0.3)' : 'rgba(0,201,167,0.3)') : 'var(--border)',
                      color: formType === type ? (type === 'EXPENSE' ? 'var(--danger)' : 'var(--primary)') : 'var(--muted-foreground)',
                    }}>
                      {type === 'EXPENSE' ? 'Expense' : 'Income'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div><label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Amount ($)</label>
                  <Input required type="number" step="0.01" min="0.01" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="0.00" /></div>
                <div><label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Date</label>
                  <Input required type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} /></div>
              </div>

              <div className="relative">
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Description</label>
                <Input required type="text" value={formDescription} onChange={(e) => handleDescriptionChange(e.target.value)} placeholder="e.g. Starbucks, Uber, Rent" />
                {aiSuggested && <span className="absolute right-3 top-8 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>AI Tagged</span>}
              </div>

              <div><label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Account</label>
                <select required value={formAccountId} onChange={(e) => setFormAccountId(e.target.value)} className="w-full rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                  <option value="" disabled>Select Account</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (${Number(acc.balance).toLocaleString()})</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Category</label>
                  <button type="button" onClick={() => setShowCatForm(!showCatForm)} className="text-xs font-medium hover:underline" style={{ color: 'var(--primary)' }}>{showCatForm ? 'Cancel' : '+ New'}</button>
                </div>
                {showCatForm ? (
                  <div className="p-3 rounded-[var(--radius-sm)] space-y-3" style={{ border: '1px solid var(--border)', background: 'var(--surface-sunken)' }}>
                    <Input placeholder="Category Name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
                    <div className="flex gap-2">
                      <select value={newCatTone} onChange={(e) => setNewCatTone(e.target.value)} className="flex-1 rounded-[var(--radius-sm)] px-2 py-1.5 text-xs" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                        <option value="indigo">Blue</option><option value="emerald">Teal</option><option value="rose">Red</option><option value="amber">Amber</option><option value="violet">Purple</option><option value="sky">Sky</option>
                      </select>
                      <button type="button" onClick={handleCreateCategory} disabled={!newCatName.trim()} className="text-xs px-3 py-1.5 rounded-[var(--radius-sm)] font-medium disabled:opacity-50 text-white" style={{ background: 'var(--primary)' }}>Save</button>
                    </div>
                  </div>
                ) : (
                  <select required value={formCategory} onChange={(e) => { setFormCategory(e.target.value); setAiSuggested(false) }} className="w-full rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                    <option value="" disabled>Select Category</option>
                    {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                  </select>
                )}
              </div>

              <div className="rounded-[var(--radius-sm)] p-4 space-y-3" style={{ border: '1px solid var(--border)', background: 'var(--surface-sunken)' }}>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={formIsRecurring} onChange={(e) => setFormIsRecurring(e.target.checked)} className="h-4 w-4 rounded accent-[var(--primary)]" />
                  <div><p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Recurring Transaction</p><p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Auto-generate periodically</p></div>
                </label>
                {formIsRecurring && (
                  <select value={formRecurringInterval} onChange={(e) => setFormRecurringInterval(e.target.value)} className="w-full rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                    <option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option>
                  </select>
                )}
              </div>

              <div><label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Notes</label>
                <textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Optional notes..." className="w-full rounded-[var(--radius-sm)] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-h-[60px]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} /></div>

              <div className="flex gap-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition" style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-[var(--radius-sm)] text-sm font-semibold text-white transition" style={{ background: 'var(--primary)' }}>Save Entry</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  )
}
