import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { BarChart2, TrendingUp, Wallet, Brain, CheckCircle2, ArrowRight } from 'lucide-react'

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'budgets', label: 'Budgets', icon: Wallet },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'ai', label: 'AI Insights', icon: Brain },
]

function OverviewPanel() {
  return (
    <div className="grid md:grid-cols-3 gap-4 h-full">
      {/* Left col */}
      <div className="md:col-span-2 space-y-4">
        {/* Balance overview card */}
        <div className="rounded-2xl bg-white/5 border border-white/[0.07] p-5">
          <p className="text-xs text-white/40 font-medium mb-1">Net Worth</p>
          <p className="text-4xl font-extrabold text-white">$24,831<span className="text-white/40">.50</span></p>
          <p className="text-xs text-emerald-400 mt-1 font-medium">↑ +8.4% from last month</p>

          {/* Fake area chart */}
          <div className="mt-5 h-24 flex items-end gap-1">
            {[35, 42, 38, 55, 48, 62, 58, 72, 65, 80, 75, 88].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: 0.6 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 rounded-t-sm"
                style={{
                  background: i === 11
                    ? 'linear-gradient(to top, #22d3ee, #34d399)'
                    : 'rgba(34,211,238,0.2)',
                }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-white/25 mt-2">
            {['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'].map(m => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        {/* Account cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Checking', val: '$8,240', change: '+$340', color: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/15' },
            { label: 'Savings', val: '$12,400', change: '+$800', color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/15' },
            { label: 'Investment', val: '$3,840', change: '+$120', color: 'from-purple-500/20 to-indigo-500/20', border: 'border-purple-500/15' },
            { label: 'Credit', val: '-$649', change: 'Due Jun 15', color: 'from-red-500/20 to-orange-500/20', border: 'border-red-500/15' },
          ].map((acc) => (
            <div key={acc.label} className={`rounded-xl bg-gradient-to-br ${acc.color} border ${acc.border} p-4`}>
              <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider">{acc.label}</p>
              <p className="text-lg font-bold text-white mt-1">{acc.val}</p>
              <p className="text-xs text-emerald-400 mt-0.5">{acc.change}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right col */}
      <div className="space-y-4">
        <div className="rounded-2xl bg-white/5 border border-white/[0.07] p-5">
          <p className="text-xs text-white/40 font-medium mb-3">Income vs Spending</p>
          {[
            { label: 'Income', val: '$5,400', pct: 100, color: '#34d399' },
            { label: 'Expenses', val: '$3,160', pct: 58, color: '#f472b6' },
            { label: 'Savings', val: '$2,240', pct: 41, color: '#22d3ee' },
          ].map((item) => (
            <div key={item.label} className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/50">{item.label}</span>
                <span className="font-semibold text-white">{item.val}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.pct}%` }}
                  transition={{ delay: 0.8, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{ background: item.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Financial health */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 border border-emerald-500/20 p-5">
          <p className="text-xs text-white/40 font-medium mb-1">Health Score</p>
          <div className="flex items-end gap-2">
            <p className="text-5xl font-extrabold text-white">84</p>
            <p className="text-sm text-white/40 mb-2">/ 100</p>
          </div>
          <p className="text-xs text-emerald-400 font-medium">Excellent · Top 15%</p>
          <div className="mt-3 flex gap-1">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full ${i < 8 ? 'bg-emerald-400' : 'bg-white/15'}`} />
            ))}
          </div>
        </div>

        {/* Recent AI tip */}
        <div className="rounded-2xl bg-cyan-500/10 border border-cyan-500/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-3.5 w-3.5 text-cyan-400" />
            <p className="text-xs font-semibold text-cyan-400">AI Insight</p>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            Your savings rate is 41% this month — above the recommended 20%. Great work! Consider investing the surplus in an index fund.
          </p>
        </div>
      </div>
    </div>
  )
}

function BudgetsPanel() {
  const budgets = [
    { name: 'Groceries', spent: 240, total: 400, color: '#22d3ee', icon: '🛒' },
    { name: 'Dining Out', spent: 180, total: 200, color: '#f472b6', icon: '🍕' },
    { name: 'Entertainment', spent: 90, total: 150, color: '#818cf8', icon: '🎬' },
    { name: 'Transportation', spent: 110, total: 150, color: '#fb923c', icon: '🚗' },
    { name: 'Shopping', spent: 320, total: 300, color: '#f87171', icon: '🛍️' },
    { name: 'Health', spent: 60, total: 100, color: '#34d399', icon: '💊' },
  ]

  return (
    <div className="space-y-4 h-full">
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Budget', val: '$1,300', color: 'text-white' },
          { label: 'Spent', val: '$1,000', color: 'text-orange-400' },
          { label: 'Remaining', val: '$300', color: 'text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white/5 border border-white/[0.07] p-4 text-center">
            <p className="text-xs text-white/40 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {budgets.map((b, i) => {
        const pct = Math.min(100, Math.round((b.spent / b.total) * 100))
        const over = b.spent > b.total
        return (
          <div key={b.name} className="rounded-2xl bg-white/5 border border-white/[0.07] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">{b.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{b.name}</p>
                  <p className="text-xs text-white/40">${b.spent} of ${b.total}</p>
                </div>
              </div>
              <span className={`text-sm font-bold ${over ? 'text-red-400' : 'text-white/60'}`}>
                {pct}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full"
                style={{ background: over ? '#f87171' : b.color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AnalyticsPanel() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const income = [4200, 4800, 5100, 4900, 5400, 5200]
  const expenses = [3100, 3400, 3200, 3600, 3160, 3800]
  const maxVal = Math.max(...income, ...expenses)

  return (
    <div className="space-y-5 h-full">
      <div className="rounded-2xl bg-white/5 border border-white/[0.07] p-5">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold text-white">Income vs Expenses</p>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-white/50">
              <span className="h-2 w-4 rounded-full bg-emerald-400" /> Income
            </span>
            <span className="flex items-center gap-1.5 text-white/50">
              <span className="h-2 w-4 rounded-full bg-rose-400" /> Expenses
            </span>
          </div>
        </div>

        <div className="flex items-end gap-4 h-40">
          {months.map((month, i) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-1 items-end" style={{ height: '132px' }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(income[i] / maxVal) * 100}%` }}
                  transition={{ delay: 0.5 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 rounded-t-sm bg-emerald-400/70"
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(expenses[i] / maxVal) * 100}%` }}
                  transition={{ delay: 0.55 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 rounded-t-sm bg-rose-400/70"
                />
              </div>
              <p className="text-[10px] text-white/30">{month}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Avg Monthly Savings', val: '$2,100', trend: '+12%', pos: true },
          { label: 'Largest Expense', val: 'Rent $1,800', trend: 'Fixed', pos: true },
          { label: 'Top Category', val: 'Groceries', trend: '$240/mo', pos: true },
          { label: 'Savings Rate', val: '41%', trend: 'Excellent', pos: true },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white/5 border border-white/[0.07] p-4">
            <p className="text-[10px] text-white/40 mb-1 leading-tight">{s.label}</p>
            <p className="text-sm font-bold text-white">{s.val}</p>
            <p className={`text-xs mt-0.5 ${s.pos ? 'text-emerald-400' : 'text-red-400'}`}>{s.trend}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function AIPanel() {
  const insights = [
    { icon: '💡', title: 'Reduce dining costs', desc: 'You spend 35% more on restaurants vs last month. Cooking 3x/week could save $180.', action: 'View suggestions', color: 'border-yellow-500/20 bg-yellow-500/5' },
    { icon: '📈', title: 'Investment opportunity', desc: 'Your savings rate is strong. Consider investing $500/month in a low-cost index fund.', action: 'Learn more', color: 'border-emerald-500/20 bg-emerald-500/5' },
    { icon: '⚠️', title: 'Budget alert', desc: 'Shopping budget exceeded by $20. Adjust next month\'s limit or reduce spending now.', action: 'Adjust budget', color: 'border-red-500/20 bg-red-500/5' },
    { icon: '🎯', title: 'Goal on track', desc: 'Emergency fund goal: 74% complete. At current pace, you\'ll reach it in 2.4 months.', action: 'View goal', color: 'border-cyan-500/20 bg-cyan-500/5' },
  ]

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/30">
          <Brain className="h-4 w-4 text-cyan-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Flofi AI Assistant</p>
          <p className="text-xs text-white/40">4 new insights this week</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-emerald-400">Active</span>
        </div>
      </div>

      {insights.map((ins, i) => (
        <motion.div
          key={ins.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 + i * 0.12, duration: 0.5 }}
          className={`rounded-2xl border ${ins.color} p-5 flex gap-4`}
        >
          <span className="text-2xl shrink-0">{ins.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white mb-1">{ins.title}</p>
            <p className="text-xs text-white/50 leading-relaxed">{ins.desc}</p>
            <button className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
              {ins.action}
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

const panelMap: Record<string, () => JSX.Element> = {
  overview: OverviewPanel,
  budgets: BudgetsPanel,
  analytics: AnalyticsPanel,
  ai: AIPanel,
}

export default function DashboardShowcase() {
  const [activeTab, setActiveTab] = useState('overview')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const Panel = panelMap[activeTab]

  return (
    <section className="relative bg-[#030912] py-28 overflow-hidden" id="dashboard">
      <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      <div className="pointer-events-none absolute inset-0 dot-pattern opacity-20" />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-500/5 blur-3xl rounded-full" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-500/70 mb-4">
            Product showcase
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Your finances,{' '}
            <span className="gradient-text-emerald">beautifully organized</span>
          </h2>
          <p className="mt-4 text-base text-white/45 max-w-xl mx-auto">
            Experience a dashboard designed for clarity — every number, chart, and insight exactly where you need it.
          </p>
        </motion.div>

        {/* Dashboard window */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Browser chrome */}
          <div className="rounded-2xl bg-[#0c1428] border border-white/[0.07] shadow-2xl shadow-black/60 overflow-hidden">
            {/* Window bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] bg-[#080f20]">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <div className="h-3 w-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/[0.06] px-4 py-1.5 text-xs text-white/30">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 12 12"><path d="M6 1a5 5 0 100 10A5 5 0 006 1z" stroke="currentColor" strokeWidth="1.2"/><path d="M6 4v3.5L8 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  app.flofi.com/dashboard
                </div>
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex items-center gap-1 px-5 py-3 border-b border-white/[0.05] bg-[#080f20]">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white/10 text-white border border-white/10'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Panel content */}
            <div className="p-6 min-h-[480px]">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Panel />
              </motion.div>
            </div>
          </div>

          {/* Glow beneath */}
          <div className="absolute inset-x-16 -bottom-6 h-12 bg-cyan-500/15 blur-2xl rounded-full" />
        </motion.div>

        {/* Feature list below */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.65 }}
          className="mt-12 grid md:grid-cols-3 gap-6"
        >
          {[
            { icon: CheckCircle2, text: 'Real-time financial data sync' },
            { icon: CheckCircle2, text: 'Beautiful charts & visualizations' },
            { icon: CheckCircle2, text: 'AI-powered contextual insights' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-white/50">
              <Icon className="h-4 w-4 text-emerald-400 shrink-0" />
              {text}
            </div>
          ))}
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </section>
  )
}
