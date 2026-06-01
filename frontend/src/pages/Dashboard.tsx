import { useMemo, useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
  Bot,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import Skeleton from '@/components/ui/Skeleton'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useGetDashboardSummaryQuery, useGetDashboardAnalyticsQuery } from '@/store/api/dashboardApi'

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
  const shouldReduce = useReducedMotion()
  const { data: summary, isLoading: summaryLoading, isError: summaryError } = useGetDashboardSummaryQuery(undefined)
  const { data: analytics, isLoading: analyticsLoading } = useGetDashboardAnalyticsQuery(undefined)

  const isLoading = summaryLoading || analyticsLoading

  const cashFlowList = useMemo(() => {
    if (analytics?.monthlyPerformances?.length) {
      return analytics.monthlyPerformances.map((p: any) => ({
        label: p.month,
        income: p.income,
        expense: p.expense,
      }))
    }
    if (summary?.cashFlow?.length) return summary.cashFlow
    return []
  }, [analytics, summary])

  const chartMax = useMemo(() => {
    return Math.max(1, ...cashFlowList.map((item: any) => Math.max(item.income, item.expense)))
  }, [cashFlowList])

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
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Failed to load dashboard data. Please try again later.</p>
        </div>
      </DashboardLayout>
    )
  }

  const totalBalance = summary?.totalBalance ?? 0
  const balanceChange = summary?.balanceChangePercent ?? 0
  const netSavings = analytics?.netSavings ?? 0
  const savingsRate = analytics?.savingsRate ?? 0
  const incomeChange = analytics?.incomeChangePercent ?? 0
  const largestCategory = analytics?.largestCategory
  const healthScore = summary?.health?.score ?? 0
  const insight = summary?.insight
  const recentTransactions = summary?.recentTransactions ?? []

  const statCards = [
    {
      label: 'TOTAL BALANCE',
      value: 2482190.5,
      change: 12,
      isMoney: true,
      icon: Wallet,
      iconBg: 'var(--primary-light)',
      iconColor: 'var(--primary)',
    },
    {
      label: 'MONTHLY EXPENSES',
      value: 12450.00,
      change: -4,
      isMoney: true,
      icon: ShoppingBag,
      iconBg: 'var(--background)',
      iconColor: 'var(--muted-foreground)',
    },
    {
      label: 'SAVINGS RATE',
      value: 32.8,
      isPercent: true,
      icon: PiggyBank,
      iconBg: 'var(--danger-light)',
      iconColor: 'var(--danger)',
    },
    {
      label: 'PORTFOLIO ROI',
      value: 18.2,
      isPercent: true,
      isPositive: true,
      icon: TrendingUp,
      iconBg: 'var(--primary)',
      iconColor: '#fff',
    },
  ]

  return (
    <DashboardLayout>
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[32px] font-bold font-display tracking-tight text-[--foreground]">
            Portfolio Overview
          </h1>
          <p className="text-[15px] font-medium text-[--muted-foreground] mt-1">
            Your net worth increased by <span className="text-[--success] font-semibold">2.4%</span> since last month.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[--border-strong] bg-white text-[14px] font-semibold text-[--foreground] hover:bg-[--background] transition-colors">
            <span className="text-[16px]">🤖</span> Ask AI
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#009c97] text-white text-[14px] font-semibold hover:bg-[--primary-hover] transition-colors">
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
              className="rounded-[20px] p-6 bg-white border border-[rgba(114,120,119,0.15)] shadow-[0_2px_12px_rgba(26,43,60,0.03)]"
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: stat.iconBg }}
                >
                  <Icon size={22} style={{ color: stat.iconColor }} />
                </div>
                {stat.change !== undefined && (
                  <span
                    className="inline-flex items-center gap-0.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide"
                    style={{
                      background: stat.change >= 0 ? '#E5F7F6' : '#FFF0F0',
                      color: stat.change >= 0 ? 'var(--primary)' : '#FF6B6B',
                    }}
                  >
                    {stat.change > 0 ? '+' : ''}{stat.change}%
                  </span>
                )}
              </div>
              <div className="mt-8">
                <p className="text-[11px] font-bold text-[--muted-foreground] tracking-wider uppercase mb-2">{stat.label}</p>
                <div className={`text-[28px] font-semibold ${stat.isPositive ? 'text-[--success]' : 'text-[--foreground]'} tracking-tight`}>
                  {stat.isPositive && '+'}
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
          <div className="rounded-[20px] p-6 bg-white border border-[rgba(114,120,119,0.15)] shadow-[0_2px_12px_rgba(26,43,60,0.03)]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-[20px] font-bold text-[--foreground]">Cash Flow Analysis</h2>
                <p className="text-[14px] text-[--muted-foreground] mt-1">Last 12 months performance</p>
              </div>
              <div className="flex bg-[rgba(114,120,119,0.05)] rounded-full p-1 border border-[rgba(114,120,119,0.08)] text-[12px] font-semibold">
                 <button className="px-4 py-1.5 rounded-full text-[--muted-foreground] hover:text-[--foreground]">Monthly</button>
                 <button className="px-4 py-1.5 rounded-full bg-[#317F7B] text-white shadow-sm">Quarterly</button>
              </div>
            </div>
            {/* Chart Area */}
            <div className="flex h-56 items-end justify-between gap-2 px-2">
              {/* Mocking bars */}
              {[40, 60, 50, 70, 95, 60, 80, 45, 60, 50, 65, 90].map((val, i) => (
                <div key={i} className="flex-1 max-w-[28px] h-full flex items-end">
                   <motion.div 
                     className="w-full rounded-t-sm" 
                     style={{ background: i % 2 === 0 ? '#C2D6D5' : 'var(--primary)', height: `${val}%` }}
                     initial={{ height: 0 }}
                     animate={{ height: `${val}%` }}
                     transition={{ delay: i * 0.05, duration: 0.5 }}
                   />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="rounded-[20px] p-6 bg-white border border-[rgba(114,120,119,0.15)] shadow-[0_2px_12px_rgba(26,43,60,0.03)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-bold text-[--foreground]">Recent Transactions</h2>
              <button className="text-[14px] font-bold text-[--info] hover:opacity-80">View All</button>
            </div>
            
            <div className="space-y-6">
              {/* Box 1 */}
              <div className="flex items-center justify-between pb-6 border-b border-[rgba(114,120,119,0.1)]">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--background)] flex items-center justify-center text-[var(--muted-foreground)]">
                      🍽️
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[--foreground]">L'Oiseau Blanc</p>
                      <p className="text-[13px] text-[--muted-foreground]">Dining & Gastronomy • Today</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[16px] font-bold text-[--foreground]">-$1,240.00</p>
                    <p className="text-[12px] font-semibold text-[--info]">Pending</p>
                 </div>
              </div>
              
              {/* Box 2 */}
              <div className="flex items-center justify-between pb-6 border-b border-[rgba(114,120,119,0.1)]">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--background)] flex items-center justify-center text-[var(--muted-foreground)]">
                      💵
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[--foreground]">Monthly Dividend</p>
                      <p className="text-[13px] text-[--muted-foreground]">Investment Income • Yesterday</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[16px] font-bold text-[--success]">+8,420.50</p>
                    <p className="text-[12px] font-semibold text-[--muted-foreground]">Completed</p>
                 </div>
              </div>

              {/* Box 3 */}
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--background)] flex items-center justify-center text-[var(--muted-foreground)]">
                      🛍️
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[--foreground]">Apple Store</p>
                      <p className="text-[13px] text-[--muted-foreground]">Electronics • 3 Days Ago</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[16px] font-bold text-[--foreground]">-$2,199.00</p>
                    <p className="text-[12px] font-semibold text-[--muted-foreground]">Completed</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* AI Intelligent Audit */}
          <div className="rounded-[20px] p-6 bg-[#a8eeea] overflow-hidden relative">
            <p className="text-[10px] font-bold text-[--info] tracking-wider uppercase mb-5 flex items-center gap-2">
              <Bot size={14} /> AI INTELLIGENT AUDIT
            </p>
            <h3 className="text-[24px] font-bold text-white mb-6 leading-tight" style={{ color: 'black' }}>
               "You spent 18% more on dining this month than your 3-month average."
            </h3>
            <p className="text-[14px] text-[rgba(10,2,2,0.8)] mb-8 leading-relaxed">
              Recommended: Adjust your entertainment budget by $400 to maintain savings trajectory.
            </p>
            <button className="bg-white text-[--info] px-6 py-2.5 rounded-full font-bold text-[14px] shadow-sm hover:bg-[--background] transition-colors">
              Action Plan
            </button>
            <div className="absolute inset-0 bg-[--primary] mix-blend-multiply opacity-90 -z-10" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[--info] blur-3xl opacity-20 rounded-full -z-10" />
          </div>

          {/* Health Score */}
          <div className="rounded-[20px] p-6 bg-white border border-[rgba(114,120,119,0.15)] shadow-[0_2px_12px_rgba(26,43,60,0.03)] flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[--foreground]">Health Score</h3>
            <div className="flex items-center gap-4">
               <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full rotate-[-90deg]">
                     <circle cx="32" cy="32" r="28" fill="none" stroke="#F4F6F8" strokeWidth="6" />
                     <circle cx="32" cy="32" r="28" fill="none" stroke="var(--info)" strokeWidth="6" strokeDasharray="175" strokeDashoffset="26" strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-[20px] font-bold text-[--foreground]">85</span>
               </div>
               <div>
                  <p className="text-[14px] font-bold text-[--foreground]">Excellent</p>
                  <p className="text-[12px] text-[--muted-foreground]">Top 5% of users</p>
               </div>
            </div>
          </div>

          {/* Asset Allocation */}
          <div className="rounded-[20px] p-6 bg-white border border-[rgba(114,120,119,0.15)] shadow-[0_2px_12px_rgba(26,43,60,0.03)]">
            <h3 className="text-[20px] font-bold text-[--foreground] mb-8">Asset Allocation</h3>
            
            <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
              {/* Simplistic representation of the chart using SVG */}
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--primary)" strokeWidth="16" strokeDasharray="251" strokeDashoffset="60" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--info)" strokeWidth="16" strokeDasharray="251" strokeDashoffset="190" strokeDashoffset-origin="60" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--accent)" strokeWidth="16" strokeDasharray="251" strokeDashoffset="220" strokeDashoffset-origin="250" />
              </svg>
              <div className="absolute text-center">
                 <p className="text-[10px] uppercase font-bold text-[--muted-foreground] tracking-widest">Top Class</p>
                 <p className="text-[22px] font-bold text-[--foreground]">Equity</p>
              </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-[--primary]"></span>
                     <span className="text-[14px] font-medium text-[--foreground]">Equities</span>
                  </div>
                  <span className="text-[16px] font-bold text-[--foreground]">64%</span>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-[--info]"></span>
                     <span className="text-[14px] font-medium text-[--foreground]">Real Estate</span>
                  </div>
                  <span className="text-[16px] font-bold text-[--foreground]">22%</span>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-[--accent]"></span>
                     <span className="text-[14px] font-medium text-[--foreground]">Fixed Income</span>
                  </div>
                  <span className="text-[16px] font-bold text-[--foreground]">14%</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
