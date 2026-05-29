import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Transactions', to: '/transactions' },
  { label: 'Budgets', to: '/budgets' },
  { label: 'Bank Accounts', to: '/bank-accounts' },
  { label: 'Investments', to: '/investments' },
  { label: 'Savings Goals', to: '/savings-goals' },
  { label: 'Family', to: '/family' },
  { label: 'AI Assistant', to: '/ai-assistant' },
  { label: 'Subscriptions', to: '/subscriptions' },
  { label: 'Settings', to: '/settings' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside className="flex flex-col gap-6 bg-slate-950 px-6 py-8 text-white">
      <div>
        <div className="text-lg font-semibold">FloFi Pro</div>
        <span className="text-xs uppercase tracking-[0.25em] text-slate-400">AI Wealth Management</span>
      </div>
      <nav className="space-y-2 text-sm text-slate-300">
        {navItems.map((item) => (
          <Link
            key={item.to}
            className={`block rounded-full px-4 py-2 transition ${
              location.pathname === item.to
                ? 'bg-white/10 text-white'
                : 'hover:bg-white/10'
            }`}
            to={item.to}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <Button variant="secondary" className="mt-auto w-full rounded-full bg-white/10 text-white hover:bg-white/20">
        Upgrade to Plus
      </Button>
      <div className="text-xs text-slate-400">
        <a className="block hover:text-white transition" href="#support">
          Support
        </a>
        <button
          onClick={() => {
            localStorage.removeItem('flofi_token')
            navigate('/login')
          }}
          className="block text-left hover:text-white transition"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
