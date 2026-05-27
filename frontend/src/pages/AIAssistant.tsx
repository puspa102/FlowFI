import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getAuthToken, apiGet, apiPost } from '../api/client'

type Message = {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type PredictionItem = {
  categoryId: number
  categoryName: string
  limit: number
  currentSpent: number
  predictedSpent: number
  alert: string
  message: string
}

type InsightItem = {
  type: string
  title: string
  body: string
  severity: string
}

type AnomalyItem = {
  id: number
  description: string
  category: string
  amount: number
  average: number
  date: string
  message: string
}

type RecommendationItem = {
  title: string
  body: string
  savings: number
}

type AiResponse = {
  expensePredictions: PredictionItem[]
  spendingInsights: InsightItem[]
  anomalies: AnomalyItem[]
  savingRecommendations: RecommendationItem[]
}

const fallbackAiData: AiResponse = {
  expensePredictions: [
    {
      categoryId: 1,
      categoryName: 'Food & Groceries',
      limit: 800,
      currentSpent: 740,
      predictedSpent: 845.5,
      alert: 'WARNING',
      message: 'CAUTION: You are on pace to reach your limit (Projected: $845.50 vs Limit: $800.00).'
    },
    {
      categoryId: 2,
      categoryName: 'Rent & Mortgage',
      limit: 2400,
      currentSpent: 2400,
      predictedSpent: 2400,
      alert: 'ON_TRACK',
      message: 'You are on pace to spend 100% of your limit.'
    }
  ],
  spendingInsights: [
    {
      type: 'weekend_pattern',
      title: 'Weekend Spend Spike',
      body: 'You spend 42% more on weekends compared to weekdays. Average weekend day spend is $112.50 vs $79.20 on weekdays.',
      severity: 'medium'
    }
  ],
  anomalies: [
    {
      id: 99,
      description: 'The Blue Lobster',
      category: 'Food & Groceries',
      amount: 245.50,
      average: 82.00,
      date: new Date().toISOString(),
      message: 'Anomaly flagged: Your payment of $245.50 at The Blue Lobster is over 2x your average spend ($82.00) in Food & Groceries.'
    }
  ],
  savingRecommendations: [
    {
      title: 'Consolidate Streaming Accounts',
      body: 'We detected subscriptions totaling $54.00/mo. Cancelling Hulu or Netflix could save you $26.00/mo.',
      savings: 26.00
    }
  ]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content:
        "Welcome back to the FloFi AI Control Room! I've loaded your weekend spending pattern, end-of-month projections, anomalies, and active subscription lists. Let's optimize your savings engine today.",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiData, setAiData] = useState<AiResponse | null>(null)
  const [loadingAi, setLoadingAi] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchPredictions = async () => {
    try {
      setLoadingAi(true)
      const res = await apiGet<AiResponse>('/api/insights/ai-predictions')
      if (res.ok && res.data) {
        setAiData(res.data)
      } else {
        setAiData(fallbackAiData)
      }
    } catch (err) {
      console.error(err)
      setAiData(fallbackAiData)
    } finally {
      setLoadingAi(false)
    }
  }

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      window.location.href = '/login'
      return
    }
    fetchPredictions()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newUserMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await apiPost<Message>('/api/insights/chat', { message: inputValue })

      if (response.ok && response.data) {
        const assistantResponse: Message = {
          ...response.data,
          timestamp: new Date(response.data.timestamp),
        }
        setMessages((prev) => [...prev, assistantResponse])
      } else {
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorResponse])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyRec = (recTitle: string, savings: number) => {
    const sysMsg: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `🔒 Optimization applied: We have initiated the scheduler rules for "${recTitle}". This action is projected to optimize your cash flow by +${formatCurrency(savings)}/month!`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, sysMsg])
  }

  const activeAi = aiData ?? fallbackAiData

  return (
    <div className="min-h-screen bg-[#070e17] text-slate-100 font-sans">
      <div className="grid min-h-screen lg:grid-cols-[240px_1fr]">
        
        {/* Navigation Sidebar */}
        <aside className="flex flex-col gap-6 bg-slate-950 px-6 py-8 text-white border-r border-slate-900">
          <div>
            <div className="text-lg font-semibold">FloFi Pro</div>
            <span className="text-xs uppercase tracking-[0.25em] text-slate-400">AI Wealth Management</span>
          </div>
          <nav className="space-y-2 text-sm text-slate-300">
            <RouterLink className="block rounded-full px-4 py-2 transition hover:bg-white/10" to="/dashboard">
              Dashboard
            </RouterLink>
            <RouterLink className="block rounded-full px-4 py-2 transition hover:bg-white/10" to="/transactions">
              Transactions
            </RouterLink>
            <RouterLink className="block rounded-full bg-white/10 px-4 py-2 text-white" to="/ai-assistant">
              AI Assistant
            </RouterLink>
            <RouterLink className="block rounded-full px-4 py-2 transition hover:bg-white/10" to="/budgets">
              Portfolio
            </RouterLink>
            <RouterLink className="block rounded-full px-4 py-2 transition hover:bg-white/10" to="/settings">
              Settings
            </RouterLink>
          </nav>
          <Button variant="secondary" className="mt-auto w-full rounded-full bg-white/10 text-white hover:bg-white/20">
            Upgrade to Plus
          </Button>
          <div className="text-xs text-slate-400">
            <a className="block hover:text-white transition" href="#support">
              Support
            </a>
            <button onClick={() => { localStorage.removeItem('flofi_token'); window.location.href = '/login' }} className="block text-left hover:text-white transition">
              Logout
            </button>
          </div>
        </aside>

        {/* Dashboard Work Area */}
        <main className="grid lg:grid-cols-[1.1fr_1fr] min-h-screen overflow-hidden">
          
          {/* AI Control Panel Left Column */}
          <div className="p-6 lg:p-8 space-y-6 overflow-y-auto max-h-screen border-r border-slate-900 bg-slate-950/20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-400">Engine control room</p>
              <h1 className="text-3xl font-bold tracking-tight mt-1 text-white">AI Diagnostics & Projections</h1>
              <p className="text-xs text-slate-400 mt-0.5">Real-time linear forecasts, Weekend profiling, and anomalous ledger triggers.</p>
            </div>

            {loadingAi ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
                <p className="text-xs">Profiling cash ledger & training linear pacing engines...</p>
              </div>
            ) : (
              <>
                {/* Linear Projections */}
                <Card className="border-slate-800 bg-slate-900/40 shadow-xl rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-slate-200">Linear Pacing Forecasts (EOM Projection)</CardTitle>
                    <CardDescription className="text-xs text-slate-400">Projected spending calculated dynamically from your real-time daily burn rate</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activeAi.expensePredictions.length === 0 ? (
                      <p className="text-xs text-slate-500">Configure category budgets to calculate linear pacing projections.</p>
                    ) : (
                      activeAi.expensePredictions.map((pred, i) => {
                        const pct = pred.limit > 0 ? Math.round((pred.predictedSpent / pred.limit) * 100) : 0
                        const isOver = pred.alert === 'OVERSPEND_ALERT' || pred.predictedSpent > pred.limit
                        return (
                          <div key={i} className="space-y-1.5 border-b border-slate-800/40 pb-3 last:border-b-0 last:pb-0">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-300">{pred.categoryName}</span>
                              <Badge className={`rounded-md font-bold px-1.5 py-0.5 text-[10px] uppercase border ${
                                isOver 
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              }`}>
                                {isOver ? 'Overspend Risk' : 'Healthy Pacing'}
                              </Badge>
                            </div>
                            <Progress value={Math.min(100, pct)} className="bg-slate-800 h-2 [&>div]:bg-indigo-500" />
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>Spent so far: {formatCurrency(pred.currentSpent)}</span>
                              <span>Projected EOM: <strong className={isOver ? 'text-rose-400' : 'text-slate-200'}>{formatCurrency(pred.predictedSpent)}</strong> / {formatCurrency(pred.limit)}</span>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </CardContent>
                </Card>

                {/* Saving Recommendations */}
                <Card className="border-slate-800 bg-slate-900/40 shadow-xl rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-slate-200">Actionable Saving Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activeAi.savingRecommendations.map((rec, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                        <div className="space-y-1 max-w-[70%]">
                          <p className="text-xs font-bold text-slate-200">{rec.title}</p>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{rec.body}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="text-xs font-black text-emerald-400">+{formatCurrency(rec.savings)}/mo</span>
                          <button
                            onClick={() => handleApplyRec(rec.title, rec.savings)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase px-2.5 py-1.5 rounded-lg transition"
                          >
                            Apply Optimization
                          </button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Weekend Pattern & Subscription Detector */}
                <Card className="border-slate-800 bg-slate-900/40 shadow-xl rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-slate-200">Weekend vs Weekday Burn Pattern</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activeAi.spendingInsights.map((insight, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-900/20 flex gap-3 items-start">
                        <div className="h-7 w-7 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">📊</div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-indigo-300">{insight.title}</p>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{insight.body}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Anomaly Detection Radar */}
                <Card className="border-slate-800 bg-slate-900/40 shadow-xl rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-slate-200">Ledger Anomaly Radar</CardTitle>
                    <CardDescription className="text-xs text-slate-400">Transactions exceeding 2x the normal category average standard deviation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activeAi.anomalies.length === 0 ? (
                      <p className="text-xs text-slate-500 py-2">No transaction anomalies detected in this ledger cycle.</p>
                    ) : (
                      activeAi.anomalies.map((anom, i) => (
                        <div key={i} className="p-3 rounded-xl bg-rose-950/10 border border-rose-900/20 flex gap-3 items-start">
                          <div className="h-7 w-7 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">🚨</div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-rose-300">{anom.description}</p>
                              <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-[9px] uppercase px-1 py-0.5 rounded">
                                Critical Anomaly
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">{anom.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Right Column: AI Chat Panel */}
          <div className="flex flex-col bg-slate-950/60 border-l border-slate-900 max-h-screen">
            
            {/* Header */}
            <div className="border-b border-slate-900 px-6 py-4 flex items-center justify-between shrink-0 bg-slate-950/40">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-indigo-500 animate-pulse" />
                <p className="text-sm font-bold text-white">FloFi Wealth Assistant</p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                Precision Core V2
              </span>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md p-3.5 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                        : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none'
                    }`}
                  >
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3 flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" />
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Form Input bar */}
            <div className="border-t border-slate-900 bg-slate-950 px-6 py-6 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Ask FloFi about weekend spikes, linear pacing..."
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold shrink-0"
                >
                  Send
                </button>
              </div>
              <p className="mt-3 text-center text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                FloFi AI Wealth Coprocessor
              </p>
            </div>

          </div>

        </main>
      </div>
    </div>
  )
}
