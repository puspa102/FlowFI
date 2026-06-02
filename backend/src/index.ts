import 'dotenv/config'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth'
import dashboardRouter from './routes/dashboard'
import transactionsRouter from './routes/transactions'
import accountsRouter from './routes/accounts'
import insightsRouter from './routes/insights'
import categoriesRouter from './routes/categories'
import pricingRouter from './routes/pricing'
import budgetsRouter from './routes/budgets'
import investmentsRouter from './routes/investments'
import subscriptionsRouter from './routes/subscriptions'
import bankConnectionsRouter from './routes/bankConnections'
import bankAccountsRouter from './routes/bankAccounts'
import aiCoachRouter from './routes/aiCoach'
import savingsGoalsRouter from './routes/savingsGoals'
import familyRouter from './routes/family'
import requireAuth from './middleware/requireAuth'
import notFound from './middleware/notFound'
import errorHandler from './middleware/errorHandler'

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'] as const
const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name])

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`)
}

console.log('GOOGLE_CLIENT_ID', process.env.GOOGLE_CLIENT_ID)
console.log('GOOGLE_CLIENT_SECRET exists', !!process.env.GOOGLE_CLIENT_SECRET)

const app = express()
const port = Number(process.env.PORT ?? 3001)

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:5177',
        'http://localhost:5178',
        'http://localhost:5179',
        'http://localhost:5180',
      ]
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('CORS not allowed'))
      }
    },
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/', authRouter)

app.use('/api/dashboard', requireAuth, dashboardRouter)
app.use('/api/transactions', requireAuth, transactionsRouter)
app.use('/api/accounts', requireAuth, accountsRouter)
app.use('/api/insights', requireAuth, insightsRouter)
app.use('/api/categories', requireAuth, categoriesRouter)
app.use('/api/pricing', pricingRouter)
app.use('/api/budgets', requireAuth, budgetsRouter)
app.use('/api/investments', requireAuth, investmentsRouter)
app.use('/api/subscriptions', requireAuth, subscriptionsRouter)
app.use('/api/bank-connections', requireAuth, bankConnectionsRouter)
app.use('/api/bank-accounts', requireAuth, bankAccountsRouter)
app.use('/api/ai-coach', requireAuth, aiCoachRouter)
app.use('/api/savings-goals', requireAuth, savingsGoalsRouter)
app.use('/api/family', requireAuth, familyRouter)

app.use(notFound)
app.use(errorHandler)

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})
