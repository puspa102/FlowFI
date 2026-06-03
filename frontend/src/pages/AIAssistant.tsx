import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { AlertTriangle, ChevronRight, FileText, Send, Sparkles, TrendingUp } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { formatMoney, useUserCurrency } from '@/lib/currency'
import { useGetAIPredictionsQuery, useChatWithAIMutation } from '@/store/api/insightsApi'

type Message = {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type SpendingInsight = {
  type: string
  title: string
  body: string
  severity: string
}

type ExpensePrediction = {
  categoryId: number
  categoryName: string
  limit: number
  currentSpent: number
  predictedSpent: number
  alert: string
  message: string
}

type Anomaly = {
  id: number
  description: string
  category: string
  amount: number
  average: number
  message: string
}

type SavingRecommendation = {
  title: string
  body: string
  savings: number
}

type AiData = {
  expensePredictions?: ExpensePrediction[]
  spendingInsights?: SpendingInsight[]
  anomalies?: Anomaly[]
  savingRecommendations?: SavingRecommendation[]
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#64748B']

export default function AIAssistant() {
  const currency = useUserCurrency()
  const formatCurrency = (value: number) => formatMoney(value, currency)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello. I can answer questions using the financial data saved in your FloFi account. Add accounts, transactions, budgets, goals, investments, or subscriptions for better analysis.',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data } = useGetAIPredictionsQuery(undefined)
  const aiData = data as AiData | undefined
  const [chatWithAI] = useChatWithAIMutation()

  const spendingInsights = aiData?.spendingInsights ?? []
  const anomalies = aiData?.anomalies ?? []
  const recommendations = aiData?.savingRecommendations ?? []
  const expensePredictions = aiData?.expensePredictions ?? []

  const pieData = useMemo(
    () =>
      expensePredictions
        .filter((item) => item.currentSpent > 0)
        .map((item) => ({ name: item.categoryName, value: item.currentSpent })),
    [expensePredictions],
  )
  const totalPotentialSavings = recommendations.reduce((sum, item) => sum + Number(item.savings ?? 0), 0)
  const hasInsights = spendingInsights.length > 0 || anomalies.length > 0 || expensePredictions.length > 0

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim()) return

    const newMsg: Message = { id: Date.now().toString(), type: 'user', content: text, timestamp: new Date() }
    setMessages((prev) => [...prev, newMsg])
    if (text === inputValue) setInputValue('')
    setIsSending(true)

    try {
      const history = messages.map((message) => ({ type: message.type, content: message.content }))
      const result = await chatWithAI({ message: text, history }).unwrap()
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: result.content ?? result.reply ?? 'I could not find enough saved data to answer that yet.',
          timestamp: new Date(),
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: 'AI assistance is temporarily unavailable. Please try again.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  const suggestions = ['Analyze my spending', 'Review my budget', 'Investment summary', 'How can I save more?', 'Summarize my finances']
  const cardStyle = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-card)',
  }
  const insetStyle = {
    background: 'var(--surface-sunken)',
    border: '1px solid var(--border)',
  }

  return (
    <DashboardLayout>
      <div className="flex w-full max-w-7xl flex-col mx-auto h-[calc(100vh-7rem)]">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 mb-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--primary-light)' }}>
              <Sparkles className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>AI Assistant</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Insights are generated from your saved FloFi data only.</p>
            </div>
          </div>
          <Badge variant="outline" className="rounded-full px-3 py-1 gap-1.5 w-fit" style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'rgba(var(--primary-rgb), 0.25)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            Connected to your data
          </Badge>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1.2fr_1fr] gap-6 min-h-0 flex-1">
          <div className="space-y-6 flex flex-col overflow-y-auto min-h-0">
            <div className="relative overflow-hidden rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, var(--primary-light), rgba(var(--accent-rgb), 0.14))', border: '1px solid var(--border)' }}>
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center shadow-sm" style={{ background: 'var(--card)' }}>
                    <Sparkles className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>FloFi AI data review</h2>
                      <Badge className="border-0 rounded text-[10px] uppercase tracking-wider px-1.5 h-5" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        Live
                      </Badge>
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      {hasInsights ? 'Using your saved transactions and budgets to generate insights.' : 'No AI insights yet. Add financial data to start analysis.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-5" style={cardStyle}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>Spending Insights</h3>
                <span className="text-sm font-medium flex items-center" style={{ color: 'var(--primary)' }}>View  data <ChevronRight className="w-4 h-4 ml-0.5" /></span>
              </div>

              {!hasInsights ? (
                <div className="rounded-xl border border-dashed p-6 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                  No spending insights are available yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {spendingInsights.slice(0, 2).map((insight) => (
                    <div key={insight.type} className="flex flex-col items-center text-center px-2">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--foreground)' }}>{insight.title}</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{insight.body}</p>
                    </div>
                  ))}

                  {anomalies.slice(0, 1).map((anomaly) => (
                    <div key={anomaly.id} className="flex flex-col items-center text-center px-2">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--foreground)' }}>{anomaly.description}</p>
                      <p className="text-2xl font-bold mb-1" style={{ color: 'var(--danger)' }}>{formatCurrency(anomaly.amount)}</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{anomaly.message}</p>
                    </div>
                  ))}

                  <div className="flex flex-col items-center text-center px-2 relative">
                    <p className="text-xs font-medium mb-2 w-full text-left" style={{ color: 'var(--muted-foreground)' }}>Budget Categories</p>
                    {pieData.length > 0 ? (
                      <div className="w-full flex items-center gap-3">
                        <div className="h-28 w-28 shrink-0 relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={45} paddingAngle={2} dataKey="value" stroke="none">
                                {pieData.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex-1 flex flex-col gap-1.5 justify-center">
                          {pieData.map((item, idx) => (
                            <div key={item.name} className="flex items-center justify-between text-[10px]">
                              <div className="flex items-center gap-1.5 truncate">
                                <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                <span className="truncate" style={{ color: 'var(--muted-foreground)' }}>{item.name}</span>
                              </div>
                              <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{formatCurrency(item.value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>No budget category spending to chart yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl p-5 flex flex-col flex-1" style={cardStyle}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>Personalized Recommendations</h3>
                <span className="text-sm font-medium flex items-center" style={{ color: 'var(--primary)' }}>View  data <ChevronRight className="w-4 h-4 ml-0.5" /></span>
              </div>

              {recommendations.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                  No savings recommendations are available yet.
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  {recommendations.map((rec) => (
                    <div key={rec.title} className="flex items-center justify-between p-3 rounded-xl" style={insetStyle}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--primary-light)' }}>
                          <Sparkles className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{rec.title}</p>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{rec.body}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--primary)' }}>Potential {formatCurrency(rec.savings)}</span>
                    </div>
                  ))}
                </div>
              )}

              {recommendations.length > 0 && (
                <div className="mt-auto pt-4 border-t flex items-center justify-between -mx-5 -mb-5 p-4 rounded-b-2xl" style={{ background: 'var(--primary-light)', borderColor: 'var(--border)' }}>
                  <span className="font-semibold" style={{ color: 'var(--foreground)' }}>Total potential savings</span>
                  <span className="font-bold text-lg" style={{ color: 'var(--primary)' }}>{formatCurrency(totalPotentialSavings)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl flex flex-col min-h-0 h-full max-h-[calc(100vh-10rem)]" style={cardStyle}>
            <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
              <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
                <Sparkles className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              </div>
              <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>FloFi AI Assistant</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ background: 'var(--surface-sunken)' }}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex flex-col gap-1 max-w-[85%]">
                    <div
                      className={`p-3.5 text-sm rounded-2xl ${message.type === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm shadow-sm'}`}
                      style={
                        message.type === 'user'
                          ? { background: 'var(--primary-light)', color: 'var(--foreground)' }
                          : { background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }
                      }
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <span className={`text-[10px] ${message.type === 'user' ? 'text-right mr-1' : 'ml-1'}`} style={{ color: 'var(--muted-foreground)' }}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {isSending && (
                <div className="flex justify-start">
                  <div className="shadow-sm rounded-2xl rounded-tl-sm p-4 flex gap-1.5 items-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--muted-foreground)' }} />
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--muted-foreground)', animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--muted-foreground)', animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t rounded-b-2xl" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSendMessage(suggestion)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-full transition-colors hover:opacity-85"
                    style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
                  >
                    {idx < 2 ? <FileText className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                    {suggestion}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Ask anything about your saved finances..."
                  className="w-full text-sm rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:ring-2 transition-all"
                  style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={isSending || !inputValue.trim()}
                  className="absolute right-2 top-2 bottom-2 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:opacity-85"
                  style={{ background: 'var(--primary)' }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-center text-[10px] mt-3" style={{ color: 'var(--muted-foreground)' }}>
                AI responses are based on saved FloFi data and are not financial advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
