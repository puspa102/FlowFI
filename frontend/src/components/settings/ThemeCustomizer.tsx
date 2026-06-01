import { Moon, SunMedium } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTheme } from '@/theme/ThemeProvider'
import { motion } from 'framer-motion'

export default function ThemeCustomizer() {
  const { mode, setMode } = useTheme()

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[var(--radius-lg)] p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-semibold" style={{ color: 'var(--foreground)' }}>Theme & Appearance</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: 'var(--muted-foreground)' }}>
            Choose between light and dark mode for your preferred viewing experience.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <motion.button
          type="button"
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setMode('light')}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.28 }}
          className={cn(
            'relative overflow-hidden rounded-[var(--radius-lg)] border p-6 text-left transition-all',
            mode === 'light' ? 'border-[var(--primary)]' : 'border-[var(--border)] hover:border-[var(--primary)]/30',
          )}
          style={mode === 'light' ? { boxShadow: '0 0 0 1px rgba(0,201,167,0.15), 0 12px 40px rgba(26,43,60,0.08)' } : {}}
        >
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'var(--primary-light)' }}>
              <SunMedium className="h-6 w-6" style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Light Mode</p>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>Bright, clean interface</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setMode('dark')}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.28 }}
          className={cn(
            'relative overflow-hidden rounded-[var(--radius-lg)] border p-6 text-left transition-all',
            mode === 'dark' ? 'border-[var(--primary)]' : 'border-[var(--border)] hover:border-[var(--primary)]/30',
          )}
          style={mode === 'dark' ? { boxShadow: '0 0 0 1px rgba(0,201,167,0.15), 0 12px 40px rgba(26,43,60,0.08)' } : {}}
        >
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: '#1A2B3C' }}>
              <Moon className="h-6 w-6" style={{ color: '#8FA3B8' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Dark Mode</p>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>Easy on the eyes</p>
            </div>
          </div>
        </motion.button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={() => setMode(mode === 'light' ? 'dark' : 'light')} className="rounded-full px-5">
          Toggle Theme
        </Button>
      </div>
    </motion.div>
  )
}
