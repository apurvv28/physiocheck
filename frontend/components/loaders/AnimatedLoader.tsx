'use client'

import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'

interface AnimatedLoaderProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export function AnimatedLoader({ message = 'Loading...', size = 'md' }: AnimatedLoaderProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className={sizes[size]}
        >
          <Activity className="w-full h-full text-teal-600" />
        </motion.div>
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-teal-600 border-t-transparent"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-slate-600 font-medium"
      >
        {message}
      </motion.p>
    </div>
  )
}
