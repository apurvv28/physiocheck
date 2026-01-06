'use client'

import { motion } from 'framer-motion'
import { Activity, TrendingUp, Shield, Target } from 'lucide-react'

export function HeroAnimation() {
  return (
    <div className="relative w-full h-96">
      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 bg-gradient-to-br from-white to-teal-50 rounded-2xl shadow-xl"
      >
        <div className="absolute inset-4 bg-gradient-to-br from-teal-500/10 to-blue-500/10 rounded-xl" />
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-8 left-8 w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Activity className="w-8 h-8 text-teal-600" />
      </motion.div>

      <motion.div
        className="absolute top-24 right-12 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.2 }}
      >
        <TrendingUp className="w-6 h-6 text-teal-600" />
      </motion.div>

      <motion.div
        className="absolute bottom-24 left-12 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 2.3, repeat: Infinity, delay: 0.4 }}
      >
        <Shield className="w-6 h-6 text-teal-600" />
      </motion.div>

      {/* Progress Rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <motion.div
            className="w-48 h-48 rounded-full border-8 border-teal-200"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute inset-0 w-48 h-48 rounded-full border-8 border-transparent border-t-teal-500"
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      </div>

      {/* Floating Text */}
      <motion.div
        className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm font-medium text-slate-900">
          Live Monitoring
        </p>
        <div className="flex items-center space-x-1 mt-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-slate-600">Active • 95% Accuracy</span>
        </div>
      </motion.div>
    </div>
  )
}