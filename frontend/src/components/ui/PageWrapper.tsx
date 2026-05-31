import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

export default function PageWrapper({ children }: { children: ReactNode }) {
  const shouldReduce = useReducedMotion()

  if (shouldReduce) {
    return <div className="space-y-8">{children}</div>
  }

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  )
}
