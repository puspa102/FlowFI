import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import Skeleton from '@/components/ui/Skeleton'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useGetAIPredictionsQuery, useGetAnomaliesQuery, useGetSpendingPatternsQuery, useChatWithAIMutation } from '@/store/api/insightsApi'

type Message = {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'assistant', content: "Welcome to the FloFi AI Control Room. I've loaded your spending patterns, projections, and anomalies. Let's optimize your savings.", timestamp: new Date() },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: aiData, isLoading: loadingAi, isError: aiError } = useGetAIPredictionsQuery(undefined)
  const { data: anomalies } = useGetAnomaliesQuery(undefined)
  const { data: patterns } = useGetSpendingPatternsQuery(undefined)
  const [chatWithAI] = useChatWithAIMutation()

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return
    const newMsg: Message = { id: Date.now().toString(), type: 'user', content: inputValue, timestamp: new Date() }
    setMessages(prev => [...prev, newMsg])
    setInputValue('')
    setIsSending(true)
    try {
      const history = messages.map(m => ({ type: m.type, content: m.content }))
      const result = await chatWithAI({ message: inputValue, history }).unwrap()
      if (result) {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'assistant', content: result.content ?? result.reply ?? 'I understand. Let me help you with that.', timestamp: new Date() }])
      }
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'assistant', content: 'AI is temporarily unavailable. Please try again.', timestamp: new Date() }])
    } finally { setIsSending(false) }
  }

  const predictions: any[] = aiData?.expensePredictions ?? []
  const recommendations: any[] = aiData?.savingRecommendations ?? []
  const insights: any[] = Array.isArray(patterns) ? patterns : (aiData?.spendingInsights ?? [])
  const anomalyList: any[] = Array.isArray(anomalies) ? anomalies : (aiData?.anomalies ?? [])

  return (
    <DashboardLayout>
      <header>
        <h1 className="text-[26px] font-semibold" style={{ color: 'var(--foreground)' }}>AI Assistant</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Real-time forecasts, pattern analysis, and anomaly detection.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Left: AI Panels */}
        <div className="space-y-5">
          {loadingAi ? (
            <div className="space-y-4">
              <Skeleton className="h-40" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ) : aiError ? (
            <div className="rounded-[var(--radius-lg)] p-4" style={{ background: 'var(--warning-light)', border: '1px solid rgba(255,176,32,0.2)', color: 'var(--warning)' }}>
              AI insights temporarily unavailable.
            </div>
          ) : (
            <>
              {predictions.length > 0 && (
                <div className="rounded-[var(--radius-lg)] p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
                  <h2 className="text-[15px] font-semibold mb-1" style={{ color: 'var(--foreground)' }}>EOM Pacing Forecasts</h2>
                  <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>Projected from real-time burn rate</p>
                  <div className="space-y-4">
                    {predictions.map((pred: any, i: number) => {
                      const pct = pred.limit > 0 ? Math.round((pred.predictedSpent / pred.limit) * 100) : 0
                      const isOver = pred.predictedSpent > pred.limit
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="space-y-1.5 pb-3 last:pb-0" style={{ borderBottom: i < predictions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium" style={{ color: 'var(--foreground)' }}>{pred.categoryName}</span>
                            <Badge className="rounded-full px-2 py-0.5 text-[10px] font-semibold border-0" style={{ background: isOver ? 'var(--danger-light)' : 'var(--primary-light)', color: isOver ? 'var(--danger)' : 'var(--primary)' }}>
                              {isOver ? 'Overspend Risk' : 'On Track'}
                            </Badge>
                          </div>
                          <div className="w-full rounded-full h-2" style={{ background: '#E2E8F0' }}>
                            <div className="h-2 rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: isOver ? 'var(--danger)' : 'var(--primary)', transition: 'width 700ms cubic-bezier(0.4,0,0.2,1)' }} />
                          </div>
                          <div className="flex justify-between text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                            <span>Spent: {formatCurrency(pred.currentSpent)}</span>
                            <span>Projected: <span style={{ color: isOver ? 'var(--danger)' : 'var(--foreground)' }}>{formatCurrency(pred.predictedSpent)}</span> / {formatCurrency(pred.limit)}</span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}

              {recommendations.length > 0 && (
                <div className="rounded-[var(--radius-lg)] p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
                  <h2 className="text-[15px] font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Saving Recommendations</h2>
                  <div className="space-y-3">
                    {recommendations.map((rec: any, i: number) => (
                      <div key={i} className="p-3 rounded-[var(--radius-sm)] flex items-center justify-between gap-3" style={{ background: 'var(--accent-light)', border: '1px solid rgba(124,111,224,0.1)' }}>
                        <div><p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{rec.title}</p><p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{rec.body}</p></div>
                        <span className="text-xs font-bold shrink-0" style={{ color: 'var(--accent)' }}>+{formatCurrency(rec.savings)}/mo</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {insights.length > 0 && (
                <div className="rounded-[var(--radius-lg)] p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
                  <h2 className="text-[15px] font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Spending Patterns</h2>
                  {insights.map((insight: any, i: number) => (
                    <div key={i} className="p-3 rounded-[var(--radius-sm)] flex gap-3 items-start" style={{ background: 'var(--accent-light)', border: '1px solid rgba(124,111,224,0.1)' }}>
                      <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs shrink-0" style={{ background: 'rgba(124,111,224,0.12)' }}>📊</div>
                      <div><p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>{insight.title}</p><p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{insight.body}</p></div>
                    </div>
                  ))}
                </div>
              )}

              {anomalyList.length > 0 && (
                <div className="rounded-[var(--radius-lg)] p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
                  <h2 className="text-[15px] font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Anomaly Radar</h2>
                  {anomalyList.map((anom: any, i: number) => (
                    <div key={i} className="p-3 rounded-[var(--radius-sm)] flex gap-3 items-start" style={{ background: 'var(--danger-light)', border: '1px solid rgba(255,107,107,0.1)' }}>
                      <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs shrink-0" style={{ background: 'rgba(255,107,107,0.1)' }}>🚨</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold" style={{ color: 'var(--danger)' }}>{anom.description}</p>
                          <Badge className="border-0 text-[9px] px-1 py-0.5 rounded" style={{ background: 'rgba(255,107,107,0.1)', color: 'var(--danger)' }}>Anomaly</Badge>
                        </div>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{anom.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Chat */}
        <div className="rounded-[var(--radius-lg)] flex flex-col max-h-[80vh] lg:max-h-[calc(100vh-12rem)]" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="px-5 py-4 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>FloFi Wealth Assistant</p>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded" style={{ color: 'var(--muted-foreground)', background: 'var(--surface-sunken)', border: '1px solid var(--border)' }}>V2</span>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[85%] p-3.5 rounded-[var(--radius-md)]" style={{
                  background: message.type === 'user' ? 'var(--accent)' : 'var(--surface-sunken)',
                  color: message.type === 'user' ? '#fff' : 'var(--foreground)',
                  border: message.type === 'user' ? 'none' : '1px solid var(--border)',
                  borderTopRightRadius: message.type === 'user' ? 0 : undefined,
                  borderTopLeftRadius: message.type === 'assistant' ? 0 : undefined,
                }}>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="rounded-[var(--radius-md)] p-3 flex gap-2" style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border)' }}>
                  <div className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)' }} />
                  <div className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '0.15s' }} />
                  <div className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '0.3s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-5 py-4 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }}
                placeholder="Ask about spending patterns..."
                className="flex-1 rounded-[var(--radius-xl)] px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
                style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={isSending || !inputValue.trim()}
                className="rounded-[var(--radius-sm)] px-4 py-2 font-semibold text-xs text-white transition disabled:opacity-50 shrink-0"
                style={{ background: 'var(--accent)' }}
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
