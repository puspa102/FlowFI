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
      </Routes>
    </BrowserRouter>
  )
}

export default App
