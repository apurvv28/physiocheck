'use client'

import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, XCircle, TrendingUp } from 'lucide-react'
import { Card } from '@/components/cards/Card'

interface WebcamFeedbackProps {
  postureStatus: 'good' | 'adjusting' | 'poor'
  feedback: string
  jointAngles?: Record<string, number>
}

export function WebcamFeedback({ postureStatus, feedback, jointAngles }: WebcamFeedbackProps) {
  const statusConfig = {
    good: {
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-500/30',
    },
    adjusting: {
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-500/30',
    },
    poor: {
      icon: <XCircle className="w-5 h-5" />,
      color: 'text-coral-400',
      bgColor: 'bg-coral-900/20',
      borderColor: 'border-coral-500/30',
    },
  }

  const config = statusConfig[postureStatus]

  return (
    <Card className={`bg-slate-800 border ${config.borderColor}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${config.bgColor} ${config.color}`}>
              {config.icon}
            </div>
            <div>
              <h3 className="font-semibold text-white">Live Feedback</h3>
              <p className="text-sm text-slate-400">Real-time posture analysis</p>
            </div>
          </div>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className={`w-3 h-3 rounded-full ${config.color.replace('text-', 'bg-')}`}
          />
        </div>

        {/* Feedback Message */}
        <motion.div
          key={feedback}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${config.bgColor} mb-6`}
        >
          <p className={`font-medium ${config.color}`}>{feedback}</p>
        </motion.div>

        {/* Joint Angles */}
        {jointAngles && (
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-3">Joint Angles</h4>
            <div className="space-y-3">
              {Object.entries(jointAngles).map(([joint, angle]) => (
                <div key={joint} className="flex items-center justify-between">
                  <span className="text-sm text-slate-400 capitalize">
                    {joint.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(angle, 180) / 180 * 100}%` }}
                        className={`h-full ${
                          postureStatus === 'good' ? 'bg-green-500' :
                          postureStatus === 'adjusting' ? 'bg-yellow-500' : 'bg-coral-500'
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium text-white w-10 text-right">
                      {angle}°
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 pt-6 border-t border-slate-700">
          <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Tips for Improvement
          </h4>
          <ul className="space-y-2">
            <li className="text-sm text-slate-400 flex items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-2" />
              Keep your back straight throughout the movement
            </li>
            <li className="text-sm text-slate-400 flex items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-2" />
              Maintain a steady breathing rhythm
            </li>
            <li className="text-sm text-slate-400 flex items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-2" />
              Focus on smooth, controlled movements
            </li>
          </ul>
        </div>
      </div>
    </Card>
  )
}