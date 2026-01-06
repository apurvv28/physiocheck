'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
  labelPosition?: 'inside' | 'outside'
}

export function ProgressRing({
  value,
  size = 80,
  strokeWidth = 6,
  className,
  showLabel = true,
  labelPosition = 'inside'
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  const getColor = (val: number) => {
    if (val >= 90) return '#10b981' // green
    if (val >= 75) return '#f59e0b' // yellow
    return '#f97316' // coral
  }

  const color = getColor(value)

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeInOut" }}
          strokeDasharray={circumference}
        />
      </svg>
      
      {showLabel && labelPosition === 'inside' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-bold"
            style={{ color }}
          >
            {value}%
          </motion.span>
        </div>
      )}
      
      {showLabel && labelPosition === 'outside' && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <span className="text-xs font-medium" style={{ color }}>
            {value}%
          </span>
        </div>
      )}
    </div>
  )
}