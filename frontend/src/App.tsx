import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Skeleton from './components/ui/Skeleton'

const Home = lazy(() => import('./pages/Home'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Budgets = lazy(() => import('./pages/Budgets'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Transactions = lazy(() => import('./pages/Transactions'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Settings = lazy(() => import('./pages/Settings'))
const AIAssistant = lazy(() => import('./pages/AIAssistant'))
const Investments = lazy(() => import('./pages/Investments'))
const Family = lazy(() => import('./pages/Family'))
const Subscriptions = lazy(() => import('./pages/Subscriptions'))
const BankAccounts = lazy(() => import('./pages/BankAccounts'))
const SavingsGoals = lazy(() => import('./pages/SavingsGoals'))

function PageLoader() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="space-y-4 w-full max-w-md px-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/family" element={<Family />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/bank-accounts" element={<BankAccounts />} />
          <Route path="/savings-goals" element={<SavingsGoals />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App
