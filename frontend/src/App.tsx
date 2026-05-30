import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import Budgets from './pages/Budgets'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Login from './pages/Login'
import Register from './pages/Register'
import Settings from './pages/Settings'
import AIAssistant from './pages/AIAssistant'
import Investments from './pages/Investments'
import Family from './pages/Family'
import Subscriptions from './pages/Subscriptions'
import BankAccounts from './pages/BankAccounts'
import SavingsGoals from './pages/SavingsGoals'

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
    </BrowserRouter>
  )
}

export default App
