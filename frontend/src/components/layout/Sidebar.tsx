import { Link, useLocation, useNavigate } from 'react-router-dom'
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
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', to: '/transactions', icon: ArrowLeftRight },
  { label: 'Budgets', to: '/budgets', icon: PiggyBank },
  { label: 'Bank Accounts', to: '/bank-accounts', icon: Landmark },
  { label: 'Investments', to: '/investments', icon: TrendingUp },
  { label: 'Savings Goals', to: '/savings-goals', icon: Target },
  { label: 'Family', to: '/family', icon: Users },
  { label: 'AI Assistant', to: '/ai-assistant', icon: Bot },
  { label: 'Subscriptions', to: '/subscriptions', icon: CreditCard },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside className="hidden lg:flex flex-col w-[220px] min-h-screen bg-navy-950 border-r border-white/[0.06] px-4 py-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 pb-8">
        <div className="relative flex h-8 w-8 items-center justify-center">
          <span className="font-display text-2xl italic text-white">F</span>
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary animate-pulse-dot" />
        </div>
        <span className="font-display text-xl italic text-white">Flofi</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.to
          const Icon = item.icon

          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Link
                to={item.to}
                className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
                style={{
                  color: isActive ? '#00D4AA' : '#8892A4',
                  background: isActive ? 'rgba(0, 212, 170, 0.1)' : 'transparent',
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon size={18} className={isActive ? 'text-primary' : 'text-platinum group-hover:text-white'} style={{ transition: 'color 150ms ease' }} />
                <span className="group-hover:text-white" style={{ transition: 'color 150ms ease' }}>
                  {item.label}
                </span>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* User section */}
      <div className="mt-auto border-t border-white/[0.06] pt-4 px-3">
        <div className="flex items-center gap-3 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06]">
            <span className="text-xs font-semibold text-white">U</span>
          </div>
          <span className="text-sm font-medium text-platinum">My Account</span>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('flofi_token')
            navigate('/login')
          }}
          className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm text-platinum/60 transition-all duration-150 hover:bg-white/[0.04] hover:text-white"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  )
}
