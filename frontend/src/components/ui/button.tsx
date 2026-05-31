import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-navy-950 font-semibold hover:bg-primary-600',
        secondary: 'bg-white/[0.06] text-white border border-white/[0.08] hover:bg-white/[0.1]',
        outline: 'border border-white/[0.12] bg-transparent text-white hover:bg-white/[0.04]',
        ghost: 'text-platinum hover:text-white hover:bg-white/[0.04]',
        destructive: 'bg-coral text-white hover:bg-coral/90',
      },
      size: {
        default: 'h-10 px-5 py-2 rounded-md',
        sm: 'h-8 px-3 text-xs rounded-sm',
        lg: 'h-12 px-8 text-base rounded-lg',
        icon: 'h-9 w-9 rounded-md',
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
