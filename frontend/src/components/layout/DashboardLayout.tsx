import type { ReactNode } from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import PageWrapper from '@/components/ui/PageWrapper'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [showNotifications, setShowNotifications] = useState(false)

  const notifications = [
    { id: 1, title: 'Budget Alert', message: 'You have used 90% of your Dining budget.', time: '2 hours ago', unread: true, type: 'warning' },
    { id: 2, title: 'Bill Reminder', message: 'Electricity bill of $120 is due tomorrow.', time: '5 hours ago', unread: true, type: 'danger' },
    { id: 3, title: 'Weekly Digest', message: 'You saved $240 this week! Keep it up.', time: '1 day ago', unread: false, type: 'success' },
  ]

  return (
    <div className="min-h-screen font-sans" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="flex min-h-screen items-start relative">
        <div className="sticky top-0 h-[100dvh] hidden lg:block z-20">
          <Sidebar />
        </div>
        <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden">
          {/* Top Bar */}
          <header className="flex-shrink-0 flex items-center justify-between px-8 py-4 border-b bg-white border-[rgba(114,120,119,0.15)] hidden lg:flex sticky top-0 z-10 w-full">
            <div className="flex-1 flex max-w-xl items-center relative gap-2">
              <Search className="absolute left-4 text-[--muted-foreground]" size={18} />
              <input
                type="text"
                placeholder="Search accounts, assets or AI insights..."
                className="w-full bg-[--background] border border-[rgba(114,120,119,0.15)] rounded-full pl-11 pr-4 py-2.5 text-[14px] text-[--foreground] focus:outline-none focus:border-[--primary] focus:ring-1 focus:ring-[--primary] transition-all"
              />
            </div>
            <div className="flex items-center gap-6 ml-auto">
              <span className="text-[14px] font-medium text-[--foreground]">
                Good evening, Puspa 👋
              </span>
              
              {/* Notification Bell with Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-[--muted-foreground] hover:text-[--foreground] transition-colors p-1"
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
                        className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-[rgba(114,120,119,0.15)] overflow-hidden z-50 origin-top-right flex flex-col"
                      >
                        <div className="px-5 py-4 border-b border-[rgba(114,120,119,0.1)] flex items-center justify-between">
                          <h3 className="text-[15px] font-bold text-[--foreground]">Notifications</h3>
                          <span className="text-[12px] font-medium text-[--info] cursor-pointer hover:underline">Mark all read</span>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto">
                          {notifications.map((notif) => (
                            <div key={notif.id} className={`px-5 py-4 border-b border-[rgba(114,120,119,0.05)] hover:bg-[--background] transition-colors cursor-pointer ${notif.unread ? 'bg-[rgba(114,120,119,0.02)]' : ''}`}>
                              <div className="flex gap-3">
                                <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 bg-[--${notif.type}] ${!notif.unread && 'opacity-0'}`}></div>
                                <div>
                                  <h4 className="text-[14px] font-bold text-[--foreground] mb-0.5">{notif.title}</h4>
                                  <p className="text-[13px] text-[--muted-foreground] leading-snug mb-1">{notif.message}</p>
                                  <span className="text-[11px] font-medium text-[#A0AAB2]">{notif.time}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 text-center border-t border-[rgba(114,120,119,0.1)] bg-[var(--background)]">
                           <span className="text-[13px] font-bold text-[--info] cursor-pointer hover:underline">View all clear</span>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Shortcut */}
              <Link to="/settings" className="w-10 h-10 rounded-full overflow-hidden border border-[--border] relative group block">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="w-full h-full object-cover transition-opacity group-hover:opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Settings size={16} className="text-white" />
                </div>
              </Link>
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
