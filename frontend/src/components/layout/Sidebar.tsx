import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Landmark,
  TrendingUp,
  Target,
  Bot,
  LogOut,
  User,
} from 'lucide-react'
import { clearToken } from '@/store/slices/authSlice'
import Logo from '@/components/ui/Logo'

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', to: '/transactions', icon: ArrowLeftRight },
  { label: 'Budgets', to: '/budgets', icon: PiggyBank },
  { label: 'Bank Accounts', to: '/bank-accounts', icon: Landmark },
  { label: 'Investments', to: '/investments', icon: TrendingUp },
  { label: 'Savings Goals', to: '/savings-goals', icon: Target },
  { label: 'AI Assistant', to: '/ai-assistant', icon: Bot },
  { label: 'Profile', to: '/profile', icon: User },
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
    <aside className="h-full overflow-y-auto flex flex-col w-[260px] py-6 bg-[--sidebar-bg] border-r border-[rgba(114,120,119,0.15)]">
      {/* Logo */}
      <div className="px-6 pb-8 flex flex-col gap-1">
        <Logo size={32} textClassName="text-xl font-bold font-display tracking-tight text-[--foreground]" />
        <span className="text-[9px] font-bold tracking-widest text-[#727877] uppercase px-0.5">WEALTH INTELLIGENCE</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to
          const Icon = item.icon

          const defaultColor = 'var(--muted-foreground)'
          const hoverColor = 'var(--foreground)'
          const activeColor = 'var(--info)'
          const activeBg = 'var(--primary-light)'
          const activeBorder = 'var(--info)'

          return (
            <div key={item.to}>
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
                  className={isActive ? 'text-[--info]' : 'text-[--muted-foreground] group-hover:text-[--foreground]'}
                  style={{ transition: 'color 150ms ease' }}
                />
                <span className="flex-1 tracking-tight">
                  {item.label}
                </span>

                {isActive && (
                  <span
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full"
                    style={{ background: activeBorder }}
                  />
                )}
              </Link>
            </div>
          )
        })}
      </nav>

      {/* Upgrade card */}
      <div className="mx-6 mb-4 mt-auto rounded-2xl p-5 bg-[rgba(114,120,119,0.03)] border border-[rgba(114,120,119,0.1)]">
        <p className="text-[10px] font-bold text-[#727877] tracking-wider uppercase mb-2">PRO PLAN</p>
        <p className="text-[13px] font-medium text-[--foreground] mb-4 leading-snug">Unlock predictive wealth modeling.</p>
        <button
          type="button"
          onClick={() => navigate('/pricing')}
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
    </aside>
  )
}
