import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900 font-sans">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <Sidebar />
        <main className="space-y-8 px-6 py-10 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  )
}
