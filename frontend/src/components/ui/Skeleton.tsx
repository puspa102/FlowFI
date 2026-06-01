import { cn } from '@/lib/utils'

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] relative overflow-hidden',
        className
      )}
      style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border)' }}
    >
      <div className="absolute inset-0 shimmer" />
    </div>
  )
}
