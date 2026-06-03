import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { Brain, Send, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/theme/ThemeProvider'

const chatMessages = [
  { role: 'user', text: 'How can I save more money this month?' },
  {
    role: 'ai',
    text: "Based on your spending patterns, I can see 3 key opportunities:\n\n**1. Dining out** — You spent $340 vs your $200 budget. Reducing restaurant visits by 2x/week saves ~$160.\n\n**2. Subscriptions** — You have 8 active subscriptions totaling $127/month. I found 2 you haven't used in 60+ days.\n\n**3. Grocery optimization** — Switching to weekly meal planning could reduce food waste and save $60–80/month.",
    typing: true,
  },
  { role: 'user', text: 'Which subscriptions should I cancel?' },
  {
    role: 'ai',
    text: "Based on your usage data:\n\n🔴 **Crunchyroll** — Last used 67 days ago · $9.99/mo\n🔴 **Audible** — Last used 45 days ago · $14.95/mo\n\nCancelling both saves **$24.94/month** = **$299/year**. Want me to add reminders to cancel these?",
    typing: false,
  },
]

function TypingDots() {
  return (
    <div className="flex gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full bg-cyan-400/60"
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

function ChatBubble({ msg, index, visible }: { msg: typeof chatMessages[0]; index: number; visible: boolean }) {
  const isUser = msg.role === 'user'
  const [showTyping, setShowTyping] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (!visible) return
    const delay = index * 900
    const typingTimer = setTimeout(() => setShowTyping(true), delay)
    const contentTimer = setTimeout(() => {
      setShowTyping(false)
      setShowContent(true)
    }, delay + (isUser ? 0 : 1200))

    return () => {
      clearTimeout(typingTimer)
      clearTimeout(contentTimer)
    }
  }, [visible, index, isUser])

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: index * 0.9, duration: 0.4 }}
        className="flex justify-end"
      >
        <div className="max-w-xs rounded-2xl rounded-tr-sm bg-gradient-to-br from-cyan-500 to-emerald-500 px-4 py-3 text-sm text-white font-medium shadow-lg shadow-cyan-500/20">
          {msg.text}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex gap-3 items-start">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 border border-cyan-500/20">
        <Brain className="h-4 w-4 text-cyan-400" />
      </div>
      <div className="flex-1">
        {showTyping && <TypingDots />}
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl rounded-tl-sm bg-white/[0.06] border border-white/[0.08] px-4 py-3 text-sm text-white/80 leading-relaxed whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }}
          />
        )}
      </div>
    </div>
  )
}

const capabilities = [
  { icon: '📊', title: 'Spending Analysis', desc: 'Analyzes every transaction to uncover spending trends and patterns.' },
  { icon: '💡', title: 'Smart Recommendations', desc: 'Personalized suggestions to reduce costs and increase savings.' },
  { icon: '🎯', title: 'Goal Coaching', desc: 'Tracks your savings goals and provides step-by-step guidance.' },
  { icon: '⚡', title: 'Budget Optimization', desc: 'Automatically adjusts budgets based on your lifestyle changes.' },
  { icon: '🔮', title: 'Financial Forecasting', desc: 'Predicts future cash flow and warns of potential shortfalls.' },
  { icon: '🛡️', title: 'Habit Monitoring', desc: 'Detects financial habits and helps build healthier money routines.' },
]

export default function AISection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const chatRef = useRef(null)
  const chatInView = useInView(chatRef, { once: true, margin: '-60px' })
  const { mode } = useTheme()

  return (
    <section className="relative py-28 overflow-hidden transition-colors duration-300" style={{ background: mode === 'dark' ? '#050d1f' : 'var(--background)' }} id="ai-assistant">
      <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      {/* Ambient blobs */}
      <div className="pointer-events-none absolute top-1/3 left-0 w-96 h-96 bg-cyan-500/8 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute top-1/2 right-0 w-80 h-80 bg-emerald-500/8 blur-3xl rounded-full" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-400 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered financial guidance
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight" style={{ color: mode === 'dark' ? '#FFFFFF' : 'var(--foreground)' }}>
            Your Personal{' '}
            <span className="gradient-text-cyan">Financial Assistant</span>
          </h2>
          <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'var(--muted-foreground)' }}>
            Ask anything about your finances. Get intelligent, context-aware answers based on your actual spending data.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Chat preview */}
          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, x: -32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Chat window */}
            <div className="rounded-3xl bg-[#0c1428] border border-white/[0.07] shadow-2xl shadow-black/50 overflow-hidden">
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] bg-[#080f20]">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 border border-cyan-500/25">
                  <Brain className="h-4.5 w-4.5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Flofi AI</p>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-xs text-white/40">Online · Analyzing your data</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="p-5 space-y-4 min-h-[360px]">
                {chatMessages.map((msg, i) => (
                  <ChatBubble key={i} msg={msg} index={i} visible={chatInView} />
                ))}
              </div>

              {/* Input bar */}
              <div className="px-5 pb-5">
                <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/[0.08] px-4 py-3">
                  <input
                    className="flex-1 bg-transparent text-sm text-white/60 placeholder:text-white/25 outline-none"
                    placeholder="Ask anything about your finances..."
                    readOnly
                  />
                  <button className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/25 hover:scale-110 transition-transform">
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Capability grid */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5"
          >
            <div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: mode === 'dark' ? '#FFFFFF' : 'var(--foreground)' }}>What Flofi AI can do</h3>
              <p className="text-sm leading-relaxed" style={{ color: mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'var(--muted-foreground)' }}>
                Powered by advanced language models trained on financial knowledge — your AI understands money like an expert CFO.
              </p>
            </div>

            <div className="grid gap-4">
              {capabilities.map((cap, i) => (
                <motion.div
                  key={cap.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.5 }}
                  className="group flex gap-4 rounded-2xl border p-4 transition-all duration-300 hover:border-cyan-500/20"
                  style={{
                    borderColor: mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'var(--border)',
                    background: mode === 'dark' ? 'rgba(255,255,255,0.025)' : 'var(--card)',
                  }}
                >
                  <span className="text-2xl shrink-0">{cap.icon}</span>
                  <div>
                    <p className="text-sm font-semibold mb-0.5" style={{ color: mode === 'dark' ? '#FFFFFF' : 'var(--foreground)' }}>{cap.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'var(--muted-foreground)' }}>{cap.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link
              to="/ai-assistant"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:scale-105 transition-all duration-300"
            >
              <Brain className="h-4 w-4" />
              Try AI Assistant Free
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </section>
  )
}
