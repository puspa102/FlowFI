import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import PageWrapper from '@/components/ui/PageWrapper'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen font-sans bg-navy-950 text-white">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 space-y-8 px-6 py-8 sm:px-8 lg:px-12 lg:py-10 overflow-x-hidden">
          <PageWrapper>{children}</PageWrapper>
        </main>
      </div>
    </div>
  )
}
