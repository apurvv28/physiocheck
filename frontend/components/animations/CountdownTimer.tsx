'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  duration: number
  onComplete: () => void
}

export function CountdownTimer({ duration, onComplete }: CountdownTimerProps) {
  const [count, setCount] = useState(duration)

  useEffect(() => {
    if (count === 0) {
      onComplete()
      return
    }

    const timer = setTimeout(() => {
      setCount(count - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [count, onComplete])

  return (
    <div className="relative w-48 h-48">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
              className="absolute inset-0 rounded-full bg-teal-500/20"
            />
            <div className="relative w-32 h-32 rounded-full bg-teal-500 flex items-center justify-center">
              <span className="text-6xl font-bold text-white">
                {count === 0 ? 'GO!' : count}
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress ring */}
      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
        <circle
          cx="96"
          cy="96"
          r="92"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="4"
          fill="none"
        />
        <motion.circle
          cx="96"
          cy="96"
          r="92"
          stroke="rgb(20, 184, 166)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: 2 * Math.PI * 92 }}
          animate={{ strokeDashoffset: (2 * Math.PI * 92) * (1 - count / duration) }}
          transition={{ duration: 1, ease: "linear" }}
          strokeDasharray={2 * Math.PI * 92}
        />
      </svg>
    </div>
  )
}