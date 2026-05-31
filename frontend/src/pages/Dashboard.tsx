import { useEffect, useMemo, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  ShoppingBag,
  Plus,
  Target,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import Skeleton from '@/components/ui/Skeleton'
import { apiGet, getAuthToken } from '../api/client'
import DashboardLayout from '@/components/layout/DashboardLayout'

type CashFlowItem = {
  month: string
  income: number
  expense: number
}

type Health = {
  score: number
  label: string
  summary: string
}

type Insight = {
  title: string
  body: string
  ctaLabel: string | null
  ctaHref: string | null
}

type RecentTransaction = {
  id: number
  date: string
  description: string
  category: string
  account: string
  amount: number
  status: string
}

type DashboardSummary = {
  totalBalance: number
  balanceChangePercent: number
  health: Health
  cashFlow: { label: string; income: number; expense: number }[]
  insight: Insight | null
  recentTransactions: RecentTransaction[]
}

type AnalyticsResponse = {
  netSavings: number
  savingsRate: number
  incomeChangePercent: number
  expenseChangePercent: number
  largestCategory: {
    category: string
    amount: number
  } | null
  monthlyPerformances: CashFlowItem[]
}

const fallbackSummary: DashboardSummary = {
  totalBalance: 128392.45,
  balanceChangePercent: 2.4,
  health: { score: 85, label: 'Excellent', summary: 'Top 5% of risk-adjusted portfolios in your bracket.' },
  cashFlow: [
    { label: 'Mar', income: 8200, expense: 6100 },
    { label: 'Apr', income: 9400, expense: 6800 },
    { label: 'May', income: 8700, expense: 7000 },
    { label: 'Jun', income: 10000, expense: 7600 },
    { label: 'Jul', income: 12000, expense: 8000 },
    { label: 'Aug', income: 11400, expense: 7950 },
  ],
  insight: {
    title: 'AI Wealth Insight',
    body: 'You spent 12% less on dining this week. On track for your Q4 savings goal of $50,000.',
    ctaLabel: 'Adjust Contribution Plan',
    ctaHref: '/budgets',
  },
  recentTransactions: [
    {
      id: 1,
      date: new Date().toISOString(),
      description: 'Apple Store - Fifth Ave',
      category: 'Technology & Gadgets',
      account: 'FloFi Main',
      amount: -1299,
      status: 'PENDING',
    },
    {
      id: 2,
      date: new Date().toISOString(),
      description: 'The Blue Lobster',
      category: 'Dining & Lifestyle',
      account: 'FloFi Main',
      amount: -245.5,
      status: 'CLEARED',
    },
    {
      id: 3,
      date: new Date().toISOString(),
      description: 'Stripe Dividend Payout',
      category: 'Investment Income',
      account: 'Wealth Reserve',
      amount: 14200,
      status: 'CLEARED',
    },
  ],
}

const fallbackAnalytics: AnalyticsResponse = {
  netSavings: 3450,
  savingsRate: 30.2,
  incomeChangePercent: 4.8,
  expenseChangePercent: -2.1,
  largestCategory: {
    category: 'Rent & Utilities',
    amount: 3200,
  },
  monthlyPerformances: [
    { month: 'Mar', income: 8200, expense: 6100 },
    { month: 'Apr', income: 9400, expense: 6800 },
    { month: 'May', income: 8700, expense: 7000 },
    { month: 'Jun', income: 10000, expense: 7600 },
    { month: 'Jul', income: 12000, expense: 8000 },
    { month: 'Aug', income: 11400, expense: 7950 },
  ],
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<number | null>(null)
  const shouldReduce = useReducedMotion()

  useEffect(() => {
    if (shouldReduce) {
      setDisplay(value)
      return
    }
    const duration = 800
    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round((value) * eased))
      if (progress < 1) {
        ref.current = requestAnimationFrame(tick)
      }
    }

    ref.current = requestAnimationFrame(tick)
    return () => { if (ref.current) cancelAnimationFrame(ref.current) }
  }, [value, shouldReduce])

  return <>{formatCurrency(display)}</>
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
  const [authRequired, setAuthRequired] = useState(false)
  const [loading, setLoading] = useState(true)
  const shouldReduce = useReducedMotion()

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      navigate('/login')
      return
    }

    const loadDashboard = async () => {
      try {
        setLoading(true)
        const [sumRes, anaRes] = await Promise.all([
          apiGet<DashboardSummary>('/api/dashboard/summary'),
          apiGet<AnalyticsResponse>('/api/dashboard/analytics'),
        ])

        if (sumRes.ok && sumRes.data) {
          setSummary(sumRes.data)
        } else if (sumRes.status === 401) {
          setAuthRequired(true)
        }

        if (anaRes.ok && anaRes.data) {
          setAnalytics(anaRes.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [navigate])

  const content = summary ?? fallbackSummary
  const activeAna = analytics ?? fallbackAnalytics

  const cashFlowList = useMemo(() => {
    if (activeAna.monthlyPerformances && activeAna.monthlyPerformances.length > 0) {
      return activeAna.monthlyPerformances.map((p) => ({
        label: p.month,
        income: p.income,
        expense: p.expense,
      }))
    }
    return content.cashFlow
  }, [activeAna.monthlyPerformances, content.cashFlow])

  const chartMax = useMemo(() => {
    return Math.max(1, ...cashFlowList.map((item) => Math.max(item.income, item.expense)))
  }, [cashFlowList])

  const statCards = [
    {
      label: 'Total Balance',
      value: content.totalBalance,
      change: content.balanceChangePercent,
      icon: Wallet,
      iconBg: '#00D4AA',
    },
    {
      label: 'Net Savings',
      value: activeAna.netSavings,
      change: activeAna.savingsRate,
      changeLabel: '% rate',
      icon: PiggyBank,
      iconBg: '#f59e0b',
    },
    {
      label: 'Income Growth',
      value: activeAna.incomeChangePercent,
      isPercent: true,
      icon: TrendingUp,
      iconBg: '#3b82f6',
    },
    {
      label: 'Top Expense',
      value: activeAna.largestCategory?.amount ?? 0,
      subtitle: activeAna.largestCategory?.category ?? 'None',
      icon: ShoppingBag,
      iconBg: '#FF6B6B',
    },
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-36 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-4xl italic text-white">
          Good morning
        </h1>
        <p className="text-sm text-platinum">
          Your savings rate is{' '}
          <span className="font-semibold text-primary">{activeAna.savingsRate}%</span> this month.
        </p>
      </header>

      {authRequired && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-300">
          Set a JWT in localStorage as <span className="font-semibold">flofi_token</span> to load live data.
        </div>
      )}

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
              className="glass-card rounded-lg p-5"
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `${stat.iconBg}15` }}
                >
                  <Icon size={20} style={{ color: stat.iconBg }} />
                </div>
                {stat.change !== undefined && !stat.isPercent && (
                  <span
                    className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{
                      background: stat.change >= 0 ? 'rgba(0,212,170,0.1)' : 'rgba(255,107,107,0.1)',
                      color: stat.change >= 0 ? '#00D4AA' : '#FF6B6B',
                    }}
                  >
                    {stat.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(stat.change)}%{stat.changeLabel ?? ''}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p className="text-[13px] font-medium text-platinum">
                  {stat.label}
                </p>
                <p className="mt-1 text-[28px] font-bold leading-tight text-white">
                  {stat.isPercent ? (
                    <>{stat.value >= 0 ? '+' : ''}{stat.value}%</>
                  ) : (
                    <AnimatedNumber value={stat.value} />
                  )}
                </p>
                {stat.subtitle && (
                  <p className="mt-0.5 text-xs text-platinum">
                    {stat.subtitle}
                  </p>
                )}
              </div>
            </motion.div>
          )
        })}
      </section>

      {/* Cash Flow Chart */}
      <div className="glass-card rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-white">Cash Flow</h2>
            <p className="text-xs text-platinum mt-0.5">Income vs expenses over 6 months</p>
          </div>
          <div className="flex gap-4 text-xs text-platinum">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Income
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-coral" />
              Expense
            </span>
          </div>
        </div>
        <div className="flex h-44 items-end gap-4">
          {cashFlowList.map((item, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-end justify-center gap-1.5" style={{ height: '140px' }}>
                <motion.span
                  className="w-5 rounded-t-sm bg-primary"
                  initial={shouldReduce ? false : { height: 0 }}
                  animate={{ height: `${Math.max(10, (item.income / chartMax) * 100)}%` }}
                  transition={{ delay: 0.05 * i, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
                <motion.span
                  className="w-5 rounded-t-sm bg-coral/70"
                  initial={shouldReduce ? false : { height: 0 }}
                  animate={{ height: `${Math.max(10, (item.expense / chartMax) * 100)}%` }}
                  transition={{ delay: 0.05 * i + 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
              </div>
              <span className="text-[11px] font-medium text-platinum">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Middle Row: Transactions + AI Insights */}
      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Recent Transactions */}
        <div className="glass-card rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <h2 className="text-base font-semibold text-white">Recent Transactions</h2>
            <Link
              className="text-xs font-semibold text-primary transition-colors hover:text-primary-600"
              to="/transactions"
            >
              View all
            </Link>
          </div>
          <div>
            {content.recentTransactions.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-platinum">
                No transactions yet.
              </p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-semibold uppercase tracking-wider text-platinum border-b border-white/[0.04]">
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {content.recentTransactions.map((tx, idx) => (
                    <motion.tr
                      key={tx.id}
                      initial={shouldReduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 * idx, duration: 0.2 }}
                      className="text-sm transition-colors hover:bg-white/[0.02] border-b border-white/[0.03] last:border-b-0"
                    >
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-white">{tx.description}</p>
                        <p className="mt-0.5 text-xs text-platinum">
                          {new Date(tx.date).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge
                          variant="outline"
                          className="rounded-full border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium capitalize text-platinum"
                        >
                          {tx.category.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td
                        className="px-6 py-3.5 text-right font-semibold"
                        style={{ color: tx.amount < 0 ? '#FF6B6B' : '#00D4AA' }}
                      >
                        {tx.amount < 0 ? '' : '+'}
                        {formatCurrency(tx.amount)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* AI Insights */}
        <div className="relative rounded-lg overflow-hidden border-gradient-teal p-6 bg-navy-900">
          <div className="border-b border-white/[0.06] pb-4 mb-4">
            <h2 className="text-base font-semibold text-primary">AI Insights</h2>
          </div>
          <p className="text-sm leading-relaxed text-platinum">
            {content.insight?.body ?? 'AI is analyzing your recent activity...'}
          </p>
          <Link
            to={content.insight?.ctaHref ?? '/ai-assistant'}
            className="mt-4 inline-block rounded-md bg-primary px-4 py-2.5 text-xs font-semibold text-navy-950 transition-all duration-150 hover:bg-primary-600"
          >
            {content.insight?.ctaLabel ?? 'Talk to Flofi AI'}
          </Link>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="flex flex-wrap gap-3">
        {[
          { to: '/transactions', label: 'Add Transaction', icon: Plus },
          { to: '/budgets', label: 'Set Budget', icon: Target },
          { to: '/family', label: 'Invite Family', icon: Users },
        ].map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2.5 text-sm font-medium text-primary transition-all duration-150 hover:bg-primary/5 hover:border-primary/50"
          >
            <action.icon size={16} /> {action.label}
          </Link>
        ))}
      </section>
    </DashboardLayout>
  )
}
