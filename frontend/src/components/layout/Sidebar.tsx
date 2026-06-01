import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Landmark,
  TrendingUp,
  Target,
  Users,
  Bot,
  CreditCard,
  Settings,
  LogOut,
  Wallet,
} from 'lucide-react'
import { clearToken } from '@/store/slices/authSlice'

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', to: '/transactions', icon: ArrowLeftRight },
  { label: 'Budgets', to: '/budgets', icon: PiggyBank },
  { label: 'Bank Accounts', to: '/bank-accounts', icon: Landmark },
  { label: 'Investments', to: '/investments', icon: TrendingUp },
  { label: 'Savings Goals', to: '/savings-goals', icon: Target },
  { label: 'AI Assistant', to: '/ai-assistant', icon: Bot, isAI: true },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const handleLogout = () => {
    dispatch(clearToken())
    navigate('/login')
  }

  return (
    <motion.aside
      key={`sidebar-${location.pathname}`}
      className="h-full overflow-y-auto flex flex-col w-[260px] py-6 bg-[--sidebar-bg] border-r border-[rgba(114,120,119,0.15)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 pb-8">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: 'var(--primary)' }}
        >
          <Wallet className="text-white bg-white/20 p-1.5 rounded-lg" size={24} />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold font-display tracking-tight text-[--foreground]">FloFi</span>
          <span className="text-[9px] font-bold tracking-widest text-[#727877] uppercase uppercase mt-[-2px]">WEALTH INTELLIGENCE</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-3">
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.to
          const Icon = item.icon
          const isAI = item.isAI

          const defaultColor = 'var(--muted-foreground)'
          const hoverColor = 'var(--foreground)'
          const activeColor = 'var(--info)'
          const activeBg = 'var(--primary-light)'
          const activeBorder = 'var(--info)'

          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Link
                to={item.to}
                className={`group relative flex items-center gap-3 px-4 py-3 text-[14px] font-medium transition-all duration-200 rounded-xl ${isActive ? 'font-semibold' : ''}`}
                style={{
                  color: isActive ? activeColor : defaultColor,
                  background: isActive ? activeBg : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = hoverColor
                    e.currentTarget.style.background = 'rgba(114,120,119,0.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = defaultColor
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <Icon
                  size={20}
                  className={isActive ? "text-[--info]" : "text-[--muted-foreground] group-hover:text-[--foreground]"}
                  style={{ transition: 'color 150ms ease' }}
                />
                <span className="flex-1 tracking-tight">
                  {item.label}
                </span>
                
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full"
                    style={{ background: activeBorder }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Upgrade card */}
      <div className="mx-6 mb-4 mt-auto rounded-2xl p-5 bg-[rgba(114,120,119,0.03)] border border-[rgba(114,120,119,0.1)]">
        <p className="text-[10px] font-bold text-[#727877] tracking-wider uppercase mb-2">PRO PLAN</p>
        <p className="text-[13px] font-medium text-[--foreground] mb-4 leading-snug">Unlock predictive wealth modeling.</p>
        <button
          className="w-full rounded-xl py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[--primary-hover]"
          style={{ background: 'var(--primary)' }}
        >
          Upgrade to Pro
        </button>
      </div>

      {/* Logout */}
      <div className="px-6 border-t border-[rgba(114,120,119,0.1)] pt-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 py-2 text-[14px] font-medium text-[--foreground] transition-all duration-150 hover:text-[--danger]"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </motion.aside>
  )
}
