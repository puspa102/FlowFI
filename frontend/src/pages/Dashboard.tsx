import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { apiGet, getAuthToken } from '../api/client'

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
      account: 'FloFi Main • 9904',
      amount: -1299,
      status: 'PENDING',
    },
    {
      id: 2,
      date: new Date().toISOString(),
      description: 'The Blue Lobster',
      category: 'Dining & Lifestyle',
      account: 'FloFi Main • 9904',
      amount: -245.5,
      status: 'CLEARED',
    },
    {
      id: 3,
      date: new Date().toISOString(),
      description: 'Stripe Dividend Payout',
      category: 'Investment Income',
      account: 'Wealth Reserve • 1122',
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
    amount: 3200
  },
  monthlyPerformances: [
    { month: 'Mar', income: 8200, expense: 6100 },
    { month: 'Apr', income: 9400, expense: 6800 },
    { month: 'May', income: 8700, expense: 7000 },
    { month: 'Jun', income: 10000, expense: 7600 },
    { month: 'Jul', income: 12000, expense: 8000 },
    { month: 'Aug', income: 11400, expense: 7950 }
  ]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value)
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
  const [authRequired, setAuthRequired] = useState(false)
  const [loading, setLoading] = useState(true)

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
          apiGet<AnalyticsResponse>('/api/dashboard/analytics')
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
      return activeAna.monthlyPerformances.map(p => ({
        label: p.month,
        income: p.income,
        expense: p.expense
      }))
    }
    return content.cashFlow
  }, [activeAna.monthlyPerformances, content.cashFlow])

  const chartMax = useMemo(() => {
    return Math.max(1, ...cashFlowList.map((item) => Math.max(item.income, item.expense)))
  }, [cashFlowList])

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900 font-sans">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        
        {/* Sidebar Navigation */}
        <aside className="flex flex-col gap-6 bg-slate-950 px-6 py-8 text-white">
          <div>
            <div className="text-lg font-semibold">FloFi Pro</div>
            <span className="text-xs uppercase tracking-[0.25em] text-slate-400">AI Wealth Management</span>
          </div>
          <nav className="space-y-2 text-sm text-slate-300">
            <Link className="block rounded-full bg-white/10 px-4 py-2 text-white" to="/dashboard">
              Dashboard
            </Link>
            <Link className="block rounded-full px-4 py-2 transition hover:bg-white/10" to="/transactions">
              Transactions
            </Link>
            <Link className="block rounded-full px-4 py-2 transition hover:bg-white/10" to="/ai-assistant">
              AI Assistant
            </Link>
            <Link className="block rounded-full px-4 py-2 transition hover:bg-white/10" to="/budgets">
              Portfolio
            </Link>
            <Link className="block rounded-full px-4 py-2 transition hover:bg-white/10" to="/settings">
              Settings
            </Link>
          </nav>
          <Button variant="secondary" className="mt-auto w-full rounded-full bg-white/10 text-white hover:bg-white/20">
            Upgrade to Plus
          </Button>
          <div className="text-xs text-slate-400">
            <a className="block hover:text-white transition" href="#support">
              Support
            </a>
            <button onClick={() => { localStorage.removeItem('flofi_token'); navigate('/login') }} className="block text-left hover:text-white transition">
              Logout
            </button>
          </div>
        </aside>

        {/* Workspace */}
        <main className="space-y-8 px-6 py-10 lg:px-10">
          <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">Analytics Hub</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Precision Wealth Engineering</h1>
              <p className="max-w-2xl text-sm text-slate-500">
                Welcome back. Your cash flow engine is running at a <strong className="text-emerald-600">{activeAna.savingsRate}% savings rate</strong> this month.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-500 shadow-2xs">
                AI Wealth Active
              </div>
              <div className="h-10 w-10 rounded-full bg-linear-to-br from-indigo-600 to-indigo-400 shadow-md" />
            </div>
          </header>

          {authRequired && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-800">
              ⚠️ Set a JWT in localStorage as <span className="font-semibold">flofi_token</span> to load live transaction summaries & ledger analytics.
            </div>
          )}

          {/* Quick Stats Grid */}
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            
            {/* Total Balance */}
            <Card className="border-slate-200/70 bg-white shadow-2xs rounded-2xl">
              <CardContent className="pt-6 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Balance</p>
                <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(content.totalBalance)}</h3>
                <span className="text-xs font-medium text-emerald-600">+{content.balanceChangePercent}% vs last month</span>
              </CardContent>
            </Card>

            {/* Net Savings */}
            <Card className="border-slate-200/70 bg-white shadow-2xs rounded-2xl">
              <CardContent className="pt-6 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Net Savings (Month)</p>
                <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(activeAna.netSavings)}</h3>
                <span className="text-xs font-medium text-indigo-600">{activeAna.savingsRate}% monthly savings rate</span>
              </CardContent>
            </Card>

            {/* Income Trend Change */}
            <Card className="border-slate-200/70 bg-white shadow-2xs rounded-2xl">
              <CardContent className="pt-6 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Income Velocity (PoP)</p>
                <h3 className="text-2xl font-bold text-slate-900">{activeAna.incomeChangePercent >= 0 ? '+' : ''}{activeAna.incomeChangePercent}%</h3>
                <span className="text-xs text-slate-400">Period-over-Period trend speed</span>
              </CardContent>
            </Card>

            {/* Largest Expense Category */}
            <Card className="border-slate-200/70 bg-white shadow-2xs rounded-2xl">
              <CardContent className="pt-6 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Largest Spent Category</p>
                <h3 className="text-xl font-bold text-slate-900 truncate">
                  {activeAna.largestCategory ? activeAna.largestCategory.category : 'None'}
                </h3>
                <span className="text-xs font-semibold text-rose-500">
                  {activeAna.largestCategory ? formatCurrency(activeAna.largestCategory.amount) : '$0.00'}
                </span>
              </CardContent>
            </Card>

          </section>

          {/* Central Analytics Charts */}
          <section className="grid gap-6 lg:grid-cols-2">
            
            {/* Total Balance Chart */}
            <Card className="border-slate-200/70 bg-white shadow-2xs rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base text-slate-800">Income vs Expense trends</CardTitle>
                <CardDescription className="text-xs text-slate-400">Aggregate Cash Burn Rate vs Total Income velocity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex h-32 items-end gap-2.5">
                  {cashFlowList.map((item, i) => (
                    <div key={i} className="flex-1 h-full flex flex-col justify-end gap-1 items-center">
                      <div className="w-full flex items-end justify-center gap-1">
                        <span
                          className="w-3 rounded-t-sm bg-indigo-500"
                          style={{ height: `${Math.max(10, (item.income / chartMax) * 100)}%` }}
                        />
                        <span
                          className="w-3 rounded-t-sm bg-rose-400"
                          style={{ height: `${Math.max(10, (item.expense / chartMax) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold mt-1">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 justify-center text-xs text-slate-500 pt-2">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-indigo-500 rounded-xs" /> Income</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-rose-400 rounded-xs" /> Expense</span>
                </div>
              </CardContent>
            </Card>

            {/* Health Meter */}
            <Card className="border-slate-200/70 bg-white shadow-2xs rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base text-slate-800">Portfolio Wealth Diagnostics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-[6px] border-indigo-100 text-indigo-600 shrink-0">
                    <span className="text-2xl font-extrabold">{content.health.score}</span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">{content.health.label}</span>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-slate-800">AI Risk-Adjusted Health index</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{content.health.summary}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </section>

          {/* Cashflow & AI Recommendations */}
          <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
            
            {/* 6-Month Details */}
            <Card className="border-slate-200/70 bg-white shadow-2xs rounded-2xl">
              <CardHeader className="flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-base text-slate-800">Cash Flow Velocity Aggregates</CardTitle>
                  <CardDescription className="text-xs text-slate-400">Total ledger transactions across a 6-month window</CardDescription>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Ledger cycles</span>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-slate-50/50">
                        <th className="px-6 py-3">Month</th>
                        <th className="px-6 py-3 text-right">Inflow</th>
                        <th className="px-6 py-3 text-right">Outflow</th>
                        <th className="px-6 py-3 text-right">Surplus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {cashFlowList.map((item, i) => {
                        const surplus = item.income - item.expense
                        return (
                          <tr key={i} className="hover:bg-slate-50/50 transition">
                            <td className="px-6 py-3.5 font-semibold text-slate-900">{item.label}</td>
                            <td className="px-6 py-3.5 text-right text-emerald-600 font-medium">+{formatCurrency(item.income)}</td>
                            <td className="px-6 py-3.5 text-right text-rose-500 font-medium">-{formatCurrency(item.expense)}</td>
                            <td className={`px-6 py-3.5 text-right font-bold ${surplus >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                              {surplus >= 0 ? '+' : ''}{formatCurrency(surplus)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights Card */}
            <Card className="border-slate-200/70 bg-slate-900 text-white shadow-lg rounded-2xl overflow-hidden relative">
              <CardHeader className="pb-3 border-b border-slate-800">
                <CardTitle className="text-base text-indigo-300">🔮 AI Coprocessor Insights</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 text-xs text-slate-300 leading-relaxed">
                <p>{content.insight?.body ?? 'AI models are processing the ledger cache...'}</p>
                <Link to="/ai-assistant" className="inline-block text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-xl transition">
                  {content.insight?.ctaLabel ?? 'Enter AI Room'}
                </Link>
              </CardContent>
            </Card>

          </section>

          {/* Ledger highlights */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Recent ledger updates</h2>
              <Link className="text-xs font-bold text-indigo-600 hover:underline" to="/transactions">
                View all ledger entries
              </Link>
            </div>
            <Card className="border-slate-200/70 bg-white shadow-2xs rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-slate-50/50">
                        <th className="px-6 py-3.5">Merchant</th>
                        <th className="px-6 py-3.5">Account</th>
                        <th className="px-6 py-3.5">Category</th>
                        <th className="px-6 py-3.5 text-right">Amount</th>
                        <th className="px-6 py-3.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="text-center py-10 text-slate-400">Loading recent ledger transactions...</td>
                        </tr>
                      ) : content.recentTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-10 text-slate-400">No transactions recorded in this cycle.</td>
                        </tr>
                      ) : (
                        content.recentTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-6 py-3.5">
                              <p className="font-bold text-slate-900">{tx.description}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{new Date(tx.date).toLocaleDateString()}</p>
                            </td>
                            <td className="px-6 py-3.5 text-slate-500">{tx.account}</td>
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <Badge variant="outline" className="rounded-lg capitalize text-[10px] px-1.5 py-0.5 font-semibold bg-slate-50 border-slate-200 text-slate-600">
                                {tx.category.replace(/_/g, ' ')}
                              </Badge>
                            </td>
                            <td className={`px-6 py-3.5 text-right font-bold ${tx.amount < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                              {tx.amount < 0 ? '' : '+'}{formatCurrency(tx.amount)}
                            </td>
                            <td className="px-6 py-3.5 text-center">
                              <Badge className={`rounded-lg text-[9px] px-1.5 py-0.5 font-bold uppercase border ${
                                tx.status === 'CLEARED' 
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                                  : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                              }`}>
                                {tx.status.toLowerCase()}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>

          <footer className="text-xs text-slate-400 pt-6">FloFi • Precision Wealth Engineering</footer>
        </main>
      </div>
    </div>
  )
}
