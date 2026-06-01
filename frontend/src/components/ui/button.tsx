import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] rounded-[var(--radius-sm)]',
        secondary: 'bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)] hover:opacity-80 rounded-[var(--radius-sm)]',
        outline: 'border-[1.5px] border-[var(--primary)] bg-transparent text-[var(--primary)] hover:bg-[var(--primary-light)] rounded-[var(--radius-sm)]',
        ghost: 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-sunken)] rounded-[var(--radius-sm)]',
        destructive: 'bg-[var(--danger-light)] text-[#CC4444] hover:opacity-80 rounded-[var(--radius-sm)]',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    if (asChild) {
      return <Slot className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    }
    return (
      <motion.button
        whileTap={{ scale: 0.97 }}
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...(props as React.ComponentProps<typeof motion.button>)}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
