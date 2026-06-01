import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-[var(--radius-sm)] border bg-white px-4 py-2 text-sm transition placeholder:text-[var(--subtle-foreground)] focus-visible:outline-none focus-visible:border-[var(--primary)] focus-visible:shadow-[0_0_0_3px_rgba(0,201,167,0.12)] disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        style={{ borderColor: 'rgba(26,43,60,0.12)', color: 'var(--foreground)' }}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
