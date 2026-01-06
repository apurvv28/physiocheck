'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SkeletonLoaderProps {
  className?: string
  count?: number
}

export function SkeletonLoader({ className, count = 1 }: SkeletonLoaderProps) {
  const items = Array.from({ length: count })

  return (
    <div className="space-y-4">
      {items.map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className={cn(
            'bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg',
            className
          )}
        />
      ))}
    </div>
  )
}

// Specific skeleton components
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="animate-pulse space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-32" />
            <div className="h-3 bg-slate-200 rounded w-24" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-3 bg-slate-200 rounded w-full" />
          <div className="h-3 bg-slate-200 rounded w-5/6" />
          <div className="h-3 bg-slate-200 rounded w-4/6" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-slate-200 rounded w-20" />
          <div className="h-4 bg-slate-200 rounded w-16" />
        </div>
      </div>
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-slate-200 rounded w-full" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 bg-slate-100 rounded w-full" />
      ))}
    </div>
  )
}