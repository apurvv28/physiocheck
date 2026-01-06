'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
  onClick?: () => void
}

export function Card({ children, className, hoverable = true, onClick }: CardProps) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -2, transition: { duration: 0.2 } } : {}}
      className={cn(
        'medical-card',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
