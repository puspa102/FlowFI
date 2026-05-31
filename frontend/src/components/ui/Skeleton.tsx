import { cn } from '@/lib/utils'

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg bg-white/[0.04] relative overflow-hidden',
        className
      )}
    >
      <div className="absolute inset-0 shimmer" />
    </div>
  )
}
