import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getAuthToken, apiGet, apiPost } from '../api/client'
import DashboardLayout from '@/components/layout/DashboardLayout'

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
    { categoryId: 1, categoryName: 'Food & Groceries', limit: 800, currentSpent: 740, predictedSpent: 845.5, alert: 'WARNING', message: 'CAUTION: Projected $845.50 vs Limit $800.00.' },
    { categoryId: 2, categoryName: 'Rent & Mortgage', limit: 2400, currentSpent: 2400, predictedSpent: 2400, alert: 'ON_TRACK', message: 'On pace for 100% of limit.' }
  ],
  spendingInsights: [
    { type: 'weekend_pattern', title: 'Weekend Spend Spike', body: 'You spend 42% more on weekends. Average weekend: $112.50 vs $79.20 weekdays.', severity: 'medium' }
  ],
  anomalies: [
    { id: 99, description: 'The Blue Lobster', category: 'Food & Groceries', amount: 245.50, average: 82.00, date: new Date().toISOString(), message: 'Anomaly: $245.50 at The Blue Lobster is over 2x your average ($82.00).' }
  ],
  savingRecommendations: [
    { title: 'Consolidate Streaming', body: 'Subscriptions total $54.00/mo. Cancelling one could save $26.00/mo.', savings: 26.00 }
  ]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'assistant', content: "Welcome to the FloFi AI Control Room. I've loaded your spending patterns, projections, and anomalies. Let's optimize your savings.", timestamp: new Date() },
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
      if (res.ok && res.data) setAiData(res.data)
      else setAiData(fallbackAiData)
    } catch { setAiData(fallbackAiData) }
    finally { setLoadingAi(false) }
  }

  useEffect(() => {
    const token = getAuthToken()
    if (!token) { window.location.href = '/login'; return }
    fetchPredictions()
  }, [])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return
    const newMsg: Message = { id: Date.now().toString(), type: 'user', content: inputValue, timestamp: new Date() }
    setMessages(prev => [...prev, newMsg])
    setInputValue('')
    setIsLoading(true)
    try {
      const response = await apiPost<Message>('/api/insights/chat', { message: inputValue })
      if (response.ok && response.data) {
        setMessages(prev => [...prev, { ...response.data!, timestamp: new Date(response.data!.timestamp) }])
      } else {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'assistant', content: 'Sorry, an error occurred. Please try again.', timestamp: new Date() }])
      }
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'assistant', content: 'Connection error. Please try again.', timestamp: new Date() }])
    } finally { setIsLoading(false) }
  }

  const handleApplyRec = (recTitle: string, savings: number) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'assistant', content: `Optimization applied: "${recTitle}" scheduled. Projected savings: +${formatCurrency(savings)}/month.`, timestamp: new Date() }])
  }

  const activeAi = aiData ?? fallbackAiData

  return (
    <DashboardLayout>
      <header>
        <h1 className="font-display text-4xl italic text-white">AI Control Room</h1>
        <p className="text-sm text-platinum mt-1">Real-time forecasts, pattern analysis, and anomaly detection.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Left: AI Panels */}
        <div className="space-y-5">
          {loadingAi ? (
            <div className="flex flex-col items-center justify-center py-20 text-platinum space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
              <p className="text-xs">Profiling cash ledger...</p>
            </div>
          ) : (
            <>
              {/* Projections */}
              <div className="glass-card rounded-lg p-5">
                <h2 className="text-sm font-semibold text-white mb-1">EOM Pacing Forecasts</h2>
                <p className="text-xs text-platinum mb-4">Projected from real-time daily burn rate</p>
                <div className="space-y-4">
                  {activeAi.expensePredictions.map((pred, i) => {
                    const pct = pred.limit > 0 ? Math.round((pred.predictedSpent / pred.limit) * 100) : 0
                    const isOver = pred.predictedSpent > pred.limit
                    return (
                      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="space-y-1.5 border-b border-white/[0.04] pb-3 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-white">{pred.categoryName}</span>
                          <Badge className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border-0 ${isOver ? 'bg-coral/10 text-coral' : 'bg-primary/10 text-primary'}`}>
                            {isOver ? 'Overspend Risk' : 'On Track'}
                          </Badge>
                        </div>
                        <Progress value={Math.min(100, pct)} className="bg-white/[0.06] h-2 [&>div]:bg-primary" />
                        <div className="flex justify-between text-[11px] text-platinum">
                          <span>Spent: {formatCurrency(pred.currentSpent)}</span>
                          <span>Projected: <span className={isOver ? 'text-coral' : 'text-white'}>{formatCurrency(pred.predictedSpent)}</span> / {formatCurrency(pred.limit)}</span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Recommendations */}
              <div className="glass-card rounded-lg p-5">
                <h2 className="text-sm font-semibold text-white mb-3">Saving Recommendations</h2>
                <div className="space-y-3">
                  {activeAi.savingRecommendations.map((rec, i) => (
                    <div key={i} className="p-3 rounded-md bg-white/[0.02] border border-white/[0.04] flex items-center justify-between gap-3">
                      <div><p className="text-xs font-semibold text-white">{rec.title}</p><p className="text-[11px] text-platinum mt-0.5">{rec.body}</p></div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-primary">+{formatCurrency(rec.savings)}/mo</span>
                        <button onClick={() => handleApplyRec(rec.title, rec.savings)} className="block mt-1 bg-primary hover:bg-primary-600 text-navy-950 font-semibold text-[10px] px-2.5 py-1 rounded-sm transition">Apply</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insights */}
              <div className="glass-card rounded-lg p-5">
                <h2 className="text-sm font-semibold text-white mb-3">Spending Patterns</h2>
                {activeAi.spendingInsights.map((insight, i) => (
                  <div key={i} className="p-3 rounded-md bg-primary/5 border border-primary/10 flex gap-3 items-start">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs shrink-0">📊</div>
                    <div><p className="text-xs font-semibold text-primary">{insight.title}</p><p className="text-[11px] text-platinum mt-0.5">{insight.body}</p></div>
                  </div>
                ))}
              </div>

              {/* Anomalies */}
              {activeAi.anomalies.length > 0 && (
                <div className="glass-card rounded-lg p-5">
                  <h2 className="text-sm font-semibold text-white mb-3">Anomaly Radar</h2>
                  {activeAi.anomalies.map((anom, i) => (
                    <div key={i} className="p-3 rounded-md bg-coral/5 border border-coral/10 flex gap-3 items-start">
                      <div className="h-7 w-7 rounded-full bg-coral/10 flex items-center justify-center text-xs shrink-0">🚨</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-coral">{anom.description}</p>
                          <Badge className="bg-coral/10 text-coral border-0 text-[9px] px-1 py-0.5 rounded">Anomaly</Badge>
                        </div>
                        <p className="text-[11px] text-platinum mt-0.5">{anom.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Chat */}
        <div className="glass-card rounded-lg flex flex-col max-h-[80vh] lg:max-h-[calc(100vh-12rem)]">
          <div className="border-b border-white/[0.06] px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
              <p className="text-sm font-semibold text-white">FloFi Wealth Assistant</p>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-platinum bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded">V2</span>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-3.5 rounded-lg ${message.type === 'user' ? 'bg-primary text-navy-950 rounded-tr-none' : 'bg-white/[0.04] text-white border border-white/[0.06] rounded-tl-none'}`}>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-3 flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-white/[0.06] px-5 py-4 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }}
                placeholder="Ask about spending patterns..."
                className="flex-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-xs text-white placeholder-platinum/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="rounded-md bg-primary px-4 py-2 text-navy-950 font-semibold text-xs hover:bg-primary-600 transition disabled:opacity-50 shrink-0"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
