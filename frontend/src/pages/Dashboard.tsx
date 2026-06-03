import { motion, useReducedMotion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  ShoppingBag,
  Plus,
  Bot,
  ArrowUpRight,
  BarChart3,
} from 'lucide-react'

import Skeleton from '@/components/ui/Skeleton'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useGetDashboardSummaryQuery, useGetDashboardAnalyticsQuery } from '@/store/api/dashboardApi'
import { formatMoney, useUserCurrency } from '@/lib/currency'

export default function Dashboard() {
  const shouldReduce = useReducedMotion()
  const navigate = useNavigate()
  const [cashFlowPeriod, setCashFlowPeriod] = useState<'monthly' | 'quarterly'>('monthly')
  const { data: summaryData, isLoading: summaryLoading, isError: summaryError } = useGetDashboardSummaryQuery(undefined)
  const { data: analyticsData, isLoading: analyticsLoading } = useGetDashboardAnalyticsQuery(undefined)
  const currency = useUserCurrency()
  const formatCurrency = (value: number) => formatMoney(value, currency)

  const isLoading = summaryLoading || analyticsLoading
  const cashFlowBars = useMemo(() => {
    const monthly = summaryData?.cashFlow?.length
      ? summaryData.cashFlow.map((entry: any) => Math.max(8, Math.min(100, Math.round(((entry.income ?? 0) + (entry.expense ?? 0)) / 1000))))
      : [40, 60, 50, 70, 95, 60, 80, 45, 60, 50, 65, 90]

    if (cashFlowPeriod === 'monthly') {
      return monthly
    }

    return [0, 1, 2, 3].map((quarter) => {
      const values = monthly.slice(quarter * 3, quarter * 3 + 3)
      return values.length ? Math.round(values.reduce((sum: number, value: number) => sum + value, 0) / values.length) : 8
    })
  }, [cashFlowPeriod, summaryData?.cashFlow])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-36 rounded-[var(--radius-lg)]" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-[var(--radius-lg)]" />
        </div>
      </DashboardLayout>
    )
  }

  if (summaryError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ background: 'var(--danger-light)' }}>
            <span className="text-2xl">!</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Failed to load dashboard data. Please try again later.</p>
        </div>
      </DashboardLayout>
    )
  }

  const hasTransactions = (summaryData?.recentTransactions?.length ?? 0) > 0
  const hasCashFlow = (summaryData?.cashFlow?.length ?? 0) > 0
  const totalBalance = summaryData?.totalBalance ?? 0
  const balanceChangePercent = summaryData?.balanceChangePercent ?? 0

  const statCards = [
    {
      label: 'TOTAL BALANCE',
      value: totalBalance,
      change: balanceChangePercent,
      isMoney: true,
      icon: Wallet,
      iconBg: 'var(--primary-light)',
      iconColor: 'var(--primary)',
    },
    {
      label: 'MONTHLY EXPENSES',
      value: analyticsData?.expenseThisMonth ?? 0,
      change: analyticsData?.expenseChange,
      isMoney: true,
      icon: ShoppingBag,
      iconBg: 'var(--background)',
      iconColor: 'var(--muted-foreground)',
    },
    {
      label: 'SAVINGS RATE',
      value: analyticsData?.savingsRate ?? 0,
      isPercent: true,
      icon: PiggyBank,
      iconBg: 'var(--danger-light)',
      iconColor: 'var(--danger)',
    },
    {
      label: 'BUDGET UTILIZATION',
      value: analyticsData?.budgetUtilization ?? 0,
      isPercent: true,
      isPositive: (analyticsData?.budgetUtilization ?? 0) > 0,
      icon: TrendingUp,
      iconBg: 'var(--primary)',
      iconColor: '#fff',
    },
  ]

  const cardStyle = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-card)',
  }

  return (
    <DashboardLayout>
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[32px] font-bold font-display tracking-tight text-[--foreground]">
            Portfolio Overview
          </h1>
          <p className="text-[15px] font-medium text-[--muted-foreground] mt-1">
            {balanceChangePercent !== 0
              ? <>Your net worth {balanceChangePercent > 0 ? 'increased' : 'decreased'} by <span className={balanceChangePercent > 0 ? 'text-[--success] font-semibold' : 'text-[--danger] font-semibold'}>{Math.abs(balanceChangePercent)}%</span> since last month.</>
              : 'Track your finances and watch your portfolio grow.'
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/ai-assistant')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[14px] font-semibold transition-colors hover:opacity-85"
            style={{ background: 'var(--card)', border: '1px solid var(--border-strong)', color: 'var(--foreground)' }}
          >
            <Bot size={16} /> Ask AI
          </button>
          <button
            type="button"
            onClick={() => navigate('/transactions')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--primary)] text-white text-[14px] font-semibold hover:opacity-90 transition-colors"
          >
            <Plus size={18} /> Add Transaction
          </button>
        </div>
      </header>

      {/* Stat Cards */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={shouldReduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={shouldReduce ? {} : { scale: 1.01 }}
              className="rounded-[20px] p-6"
              style={cardStyle}
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: stat.iconBg }}
                >
                  <Icon size={22} style={{ color: stat.iconColor }} />
                </div>
                {stat.change !== undefined && stat.change !== 0 && (
                  <span
                    className="inline-flex items-center gap-0.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide"
                    style={{
                      background: stat.change >= 0 ? 'var(--primary-light)' : 'var(--danger-light)',
                      color: stat.change >= 0 ? 'var(--primary)' : 'var(--danger)',
                    }}
                  >
                    {stat.change > 0 ? '+' : ''}{stat.change}%
                  </span>
                )}
              </div>
              <div className="mt-8">
                <p className="text-[11px] font-bold text-[--muted-foreground] tracking-wider uppercase mb-2">{stat.label}</p>
                <div className={`text-[28px] font-semibold ${stat.isPositive ? 'text-[--success]' : 'text-[--foreground]'} tracking-tight`}>
                  {stat.isPercent ? stat.value + '%' : formatCurrency(stat.value)}
                </div>
              </div>
            </motion.div>
          )
        })}
      </section>

      {/* Main Content Area Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] mt-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Cash Flow Analysis */}
          <div className="rounded-[20px] p-6" style={cardStyle}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-[20px] font-bold text-[--foreground]">Cash Flow Analysis</h2>
                <p className="text-[14px] text-[--muted-foreground] mt-1">
                  {hasCashFlow ? 'Last 12 months performance' : 'Add transactions to see your cash flow'}
                </p>
              </div>
              <div className="flex rounded-full p-1 text-[12px] font-semibold" style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setCashFlowPeriod('monthly')}
                  className={`px-4 py-1.5 rounded-full transition-colors ${cashFlowPeriod === 'monthly' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[--muted-foreground] hover:text-[--foreground]'}`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setCashFlowPeriod('quarterly')}
                  className={`px-4 py-1.5 rounded-full transition-colors ${cashFlowPeriod === 'quarterly' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[--muted-foreground] hover:text-[--foreground]'}`}
                >
                  Quarterly
                </button>
              </div>
            </div>
            {/* Chart Area */}
            <div className="flex h-56 items-end justify-between gap-2 px-2">
              {cashFlowBars.map((val: number, i: number) => (
                <div key={i} className="flex-1 max-w-[28px] h-full flex items-end">
                  <motion.div
                    className="w-full rounded-t-sm"
                    style={{ background: i % 2 === 0 ? 'rgba(var(--primary-rgb), 0.2)' : 'var(--primary)', height: `${val}%` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${val}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="rounded-[20px] p-6" style={cardStyle}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-bold text-[--foreground]">Recent Transactions</h2>
              <button
                type="button"
                onClick={() => navigate('/transactions')}
                className="text-[14px] font-bold hover:opacity-80"
                style={{ color: 'var(--primary)' }}
              >
                View All
              </button>
            </div>

            {hasTransactions ? (
              <div className="space-y-6">
                {summaryData.recentTransactions.slice(0, 3).map((tx: any, index: number) => (
                  <div
                    key={tx.id || index}
                    className={`flex items-center justify-between ${index !== Math.min(2, summaryData.recentTransactions.length - 1) ? 'pb-6 border-b' : ''}`}
                    style={index !== Math.min(2, summaryData.recentTransactions.length - 1) ? { borderColor: 'var(--border)' } : undefined}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--surface-sunken)' }}>
                        {tx.amount < 0 ? <ShoppingBag size={18} style={{ color: 'var(--muted-foreground)' }} /> : <ArrowUpRight size={18} style={{ color: 'var(--primary)' }} />}
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-[--foreground]">{tx.description}</p>
                        <p className="text-[13px] text-[--muted-foreground]">{tx.category} {tx.date ? `• ${new Date(tx.date).toLocaleDateString()}` : ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-[16px] font-bold ${tx.amount < 0 ? 'text-[--foreground]' : 'text-[--success]'}`}>{formatCurrency(tx.amount)}</p>
                      <p className={`text-[12px] font-semibold ${tx.status === 'PENDING' ? 'text-[--primary]' : 'text-[--muted-foreground]'}`}>{tx.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 rounded-xl" style={{ border: '2px dashed var(--border)' }}>
                <BarChart3 size={32} className="mx-auto mb-3" style={{ color: 'var(--muted-foreground)' }} />
                <p className="font-medium" style={{ color: 'var(--foreground)' }}>No transactions yet</p>
                <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Add your first transaction to see activity here.</p>
                <button
                  type="button"
                  onClick={() => navigate('/transactions')}
                  className="mt-4 px-5 py-2 rounded-full text-sm font-semibold text-white"
                  style={{ background: 'var(--primary)' }}
                >
                  Add Transaction
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* AI Intelligent Audit */}
          <div className="rounded-[20px] p-6 overflow-hidden relative" style={{ background: 'linear-gradient(135deg, var(--primary-light), rgba(var(--accent-rgb), 0.16))', border: '1px solid var(--border)' }}>
            <p className="text-[10px] font-bold tracking-wider uppercase mb-5 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
              <Bot size={14} /> AI INTELLIGENT AUDIT
            </p>
            <h3 className="text-[22px] font-bold mb-5 leading-tight" style={{ color: 'var(--foreground)' }}>
              {hasTransactions
                ? '"You spent 18% more on dining this month than your 3-month average."'
                : '"Start tracking expenses to receive personalized financial insights."'
              }
            </h3>
            <p className="text-[14px] mb-8 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              {hasTransactions
                ? 'Recommended: Adjust your entertainment budget by $400 to maintain savings trajectory.'
                : 'Add transactions, budgets, and goals to unlock AI-powered financial coaching.'
              }
            </p>
            <button
              type="button"
              onClick={() => navigate('/ai-assistant')}
              className="px-6 py-2.5 rounded-full font-bold text-[14px] shadow-sm transition-colors hover:opacity-85"
              style={{ background: 'var(--card)', color: 'var(--primary)' }}
            >
              {hasTransactions ? 'Action Plan' : 'Get Started'}
            </button>
          </div>

          {/* Health Score */}
          <div className="rounded-[20px] p-6 flex items-center justify-between" style={cardStyle}>
            <h3 className="text-[16px] font-bold text-[--foreground]">Health Score</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full rotate-[-90deg]">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="var(--surface-sunken)" strokeWidth="6" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="var(--primary)" strokeWidth="6" strokeDasharray="175" strokeDashoffset={`${175 - (175 * (summaryData?.health?.score ?? 0)) / 100}`} strokeLinecap="round" />
                </svg>
                <span className="absolute text-[20px] font-bold text-[--foreground]">{summaryData?.health?.score ?? 0}</span>
              </div>
              <div>
                <p className="text-[14px] font-bold text-[--foreground]">{summaryData?.health?.label ?? 'Unknown'}</p>
                <p className="text-[12px] text-[--muted-foreground]">{summaryData?.health?.summary ?? 'Add data to calculate'}</p>
              </div>
            </div>
          </div>

          {/* Asset Allocation */}
          <div className="rounded-[20px] p-6" style={cardStyle}>
            <h3 className="text-[20px] font-bold text-[--foreground] mb-8">Asset Allocation</h3>

            <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {totalBalance > 0 ? (
                  <>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--primary)" strokeWidth="16" strokeDasharray="251" strokeDashoffset="60" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(var(--accent-rgb), 0.6)" strokeWidth="16" strokeDasharray="60" strokeDashoffset="-191" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(var(--primary-rgb), 0.3)" strokeWidth="16" strokeDasharray="35" strokeDashoffset="-217" />
                  </>
                ) : (
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--surface-sunken)" strokeWidth="16" />
                )}
              </svg>
              <div className="absolute text-center">
                {totalBalance > 0 ? (
                  <>
                    <p className="text-[10px] uppercase font-bold text-[--muted-foreground] tracking-widest">Top Class</p>
                    <p className="text-[22px] font-bold text-[--foreground]">Equity</p>
                  </>
                ) : (
                  <p className="text-[12px] font-medium text-[--muted-foreground]">No data</p>
                )}
              </div>
            </div>

            {totalBalance > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--primary)' }}></span>
                    <span className="text-[14px] font-medium text-[--foreground]">Equities</span>
                  </div>
                  <span className="text-[16px] font-bold text-[--foreground]">64%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(var(--accent-rgb), 0.6)' }}></span>
                    <span className="text-[14px] font-medium text-[--foreground]">Real Estate</span>
                  </div>
                  <span className="text-[16px] font-bold text-[--foreground]">22%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(var(--primary-rgb), 0.3)' }}></span>
                    <span className="text-[14px] font-medium text-[--foreground]">Fixed Income</span>
                  </div>
                  <span className="text-[16px] font-bold text-[--foreground]">14%</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Add accounts & investments to see your allocation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
