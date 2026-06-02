import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, Settings, User, LogOut, ShieldCheck, Moon, SunMedium } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import Sidebar from './Sidebar'
import PageWrapper from '@/components/ui/PageWrapper'
import { useGetProfileQuery } from '@/store/api/profileApi'
import { clearToken } from '@/store/slices/authSlice'
import { useTheme } from '@/theme/ThemeProvider'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [avatarKey, setAvatarKey] = useState(0)
  
  const { data: profile, refetch } = useGetProfileQuery(undefined)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { mode, setMode } = useTheme()

  // Listen for avatar update events and refetch profile
  useEffect(() => {
    const handleAvatarUpdate = () => {
      refetch()
      setAvatarKey((k) => k + 1)
    }

    window.addEventListener('flofi_avatar_updated', handleAvatarUpdate)
    return () => {
      window.removeEventListener('flofi_avatar_updated', handleAvatarUpdate)
    }
  }, [refetch])

  const handleLogout = () => {
    dispatch(clearToken())
    navigate('/login')
  }

  const toggleTheme = () => {
    setMode(mode === 'light' ? 'dark' : 'light')
  }

  // Resolve avatar URL from backend profile data
  const avatarUrl = profile?.profileImage
    ? `${API_BASE}${profile.profileImage}`
    : null

  const initials = profile?.fullName
    ? profile.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part: string) => part[0]?.toUpperCase() ?? '')
        .join('')
    : 'U'

  // Determine membership tier from real data
  const memberTier = profile?.accountCount >= 3
    ? 'Pro Account'
    : profile?.accountCount >= 1
      ? 'Active Member'
      : 'New Member'

  return (
    <div className="min-h-screen font-sans" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="flex min-h-screen items-start relative">
        <div className="sticky top-0 h-[100dvh] hidden lg:block z-20">
          <Sidebar />
        </div>
        <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden">
          {/* Top Bar */}
          <header
            className="flex-shrink-0 items-center justify-between px-8 py-4 border-b hidden lg:flex sticky top-0 z-10 w-full"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex-1 flex max-w-xl items-center relative gap-2">
              <Search className="absolute left-4 text-[--muted-foreground]" size={18} />
              <input
                type="text"
                placeholder="Search accounts, assets or AI insights..."
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    navigate('/transactions')
                  }
                }}
                className="w-full rounded-full pl-11 pr-4 py-2.5 text-[14px] focus:outline-none focus:ring-1 transition-all"
                style={{
                  background: 'var(--surface-sunken)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
            <div className="flex items-center gap-6 ml-auto">
              <span className="text-[14px] font-semibold text-[--foreground]">
                Good evening, {profile?.fullName ? profile.fullName.split(' ')[0] : 'User'} 👋
              </span>
              
              {/* Notification Bell with Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications)
                    setShowProfileDropdown(false)
                  }}
                  className="relative text-[--muted-foreground] hover:text-[--foreground] transition-colors p-1 pointer-events-auto"
                >
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[--danger]"></span>
                </button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right flex flex-col"
                        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                      >
                        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                          <h3 className="text-[15px] font-bold text-[--foreground]">Notifications</h3>
                          <button
                            type="button"
                            onClick={() => setShowNotifications(false)}
                            className="text-[12px] font-medium text-[--info] hover:underline"
                          >
                            Mark all read
                          </button>
                        </div>
                        <div className="px-5 py-8 text-center">
                          <p className="text-sm text-[var(--muted-foreground)]">No new notifications</p>
                        </div>
                        <div className="p-3 text-center border-t bg-[var(--background)]" style={{ borderColor: 'var(--border)' }}>
                           <button
                             type="button"
                             onClick={() => setShowNotifications(false)}
                             className="text-[13px] font-bold text-[--info] hover:underline"
                           >
                             View all
                           </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:opacity-80"
                style={{
                  background: 'var(--surface-sunken)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
              >
                {mode === 'light' ? <Moon size={18} /> : <SunMedium size={18} />}
              </button>

              {/* Interactive Profile Option with Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowProfileDropdown(!showProfileDropdown)
                    setShowNotifications(false)
                  }}
                  className="w-10 h-10 rounded-full overflow-hidden border border-[--border] relative group block cursor-pointer transition-transform hover:scale-105 duration-200"
                >
                  {avatarUrl ? (
                    <img key={avatarKey} src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[var(--primary-light)] flex items-center justify-center">
                      <span className="text-sm font-extrabold text-[var(--primary)]">{initials}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Settings size={14} className="text-white" />
                  </div>
                </button>

                <AnimatePresence>
                  {showProfileDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowProfileDropdown(false)}></div>
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-72 rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right flex flex-col p-2"
                        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                      >
                        {/* Header Area */}
                        <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
                          <div className="w-10 h-10 rounded-full overflow-hidden border bg-[var(--primary-light)] flex items-center justify-center shrink-0">
                            {avatarUrl ? (
                              <img key={avatarKey} src={avatarUrl} alt="User Profile" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm font-extrabold text-[var(--primary)]">{initials}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-[14px] font-bold text-[--foreground] truncate leading-tight">
                              {profile?.fullName || 'User'}
                            </h4>
                            <p className="text-[11px] text-[--muted-foreground] truncate mt-0.5">
                              {profile?.email || ''}
                            </p>
                          </div>
                        </div>

                        {/* Membership tier status */}
                        <div className="mx-2 my-2 px-3 py-2 rounded-xl bg-[var(--success-light)] text-[var(--success)] flex items-center justify-between">
                          <span className="text-[10px] font-bold tracking-wider uppercase">{memberTier}</span>
                          <ShieldCheck size={14} className="text-[var(--primary)]" />
                        </div>

                        {/* List Items */}
                        <div className="flex flex-col gap-0.5 mt-1">
                          <Link 
                            to="/profile" 
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-[--foreground] hover:bg-[var(--background)] transition-colors"
                          >
                            <User size={16} className="text-[--muted-foreground]" />
                            <span>View Profile</span>
                          </Link>

                          <Link 
                            to="/settings" 
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-[--foreground] hover:bg-[var(--background)] transition-colors"
                          >
                            <Settings size={16} className="text-[--muted-foreground]" />
                            <span>Account Settings</span>
                          </Link>

                          <div className="w-full border-t my-1" style={{ borderColor: 'var(--border)' }}></div>

                          <button 
                            onClick={() => {
                              setShowProfileDropdown(false)
                              handleLogout()
                            }}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-[var(--danger)] hover:bg-[var(--danger-light)] transition-colors text-left"
                          >
                            <LogOut size={16} />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 space-y-8">
            <PageWrapper>{children}</PageWrapper>
          </div>
        </main>
      </div>
    </div>
  )
}
