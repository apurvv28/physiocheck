'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, AlertTriangle, XCircle, 
  TrendingUp, Target, Clock, Activity 
} from 'lucide-react'
import { Card } from '@/components/cards/Card'
import { cn } from '@/lib/utils'

interface PostureFeedbackData {
  id: string
  timestamp: string
  joint: string
  angle: number
  expectedAngle: number
  deviation: number
  feedback: 'correct' | 'warning' | 'incorrect'
  message: string
}

interface PostureFeedbackProps {
  feedback: PostureFeedbackData[]
  isLive?: boolean
  className?: string
}

export function PostureFeedback({ feedback, isLive = false, className }: PostureFeedbackProps) {
  const feedbackConfig = {
    correct: {
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'Correct'
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      label: 'Needs Adjustment'
    },
    incorrect: {
      icon: <XCircle className="w-5 h-5" />,
      color: 'text-coral-600',
      bgColor: 'bg-coral-50',
      borderColor: 'border-coral-200',
      label: 'Incorrect'
    }
  }

  const getLatestFeedback = () => {
    if (feedback.length === 0) return null
    return feedback[feedback.length - 1]
  }

  const latestFeedback = getLatestFeedback()
  const stats = {
    correctCount: feedback.filter(f => f.feedback === 'correct').length,
    warningCount: feedback.filter(f => f.feedback === 'warning').length,
    incorrectCount: feedback.filter(f => f.feedback === 'incorrect').length,
    total: feedback.length,
    accuracy: feedback.length > 0 
      ? Math.round((feedback.filter(f => f.feedback === 'correct').length / feedback.length) * 100)
      : 0
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Live Feedback Header */}
      {isLive && latestFeedback && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          key={latestFeedback.id}
        >
          <Card className={cn(
            "border-l-4",
            feedbackConfig[latestFeedback.feedback].borderColor.replace('border-', 'border-l-')
          )}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    feedbackConfig[latestFeedback.feedback].bgColor,
                    feedbackConfig[latestFeedback.feedback].color
                  )}>
                    {feedbackConfig[latestFeedback.feedback].icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {feedbackConfig[latestFeedback.feedback].label}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {latestFeedback.joint.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900">
                    {latestFeedback.angle}°
                  </div>
                  <div className="text-sm text-slate-500">
                    Expected: {latestFeedback.expectedAngle}°
                  </div>
                </div>
              </div>
              <p className="text-slate-700">{latestFeedback.message}</p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stats Overview */}
      <Card>
        <div className="p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Posture Analysis</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {stats.correctCount}
              </div>
              <div className="text-sm text-green-700">Correct</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {stats.warningCount}
              </div>
              <div className="text-sm text-yellow-700">Adjust</div>
            </div>
            
            <div className="text-center p-4 bg-coral-50 rounded-lg">
              <div className="text-2xl font-bold text-coral-600 mb-1">
                {stats.incorrectCount}
              </div>
              <div className="text-sm text-coral-700">Incorrect</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stats.accuracy}%
              </div>
              <div className="text-sm text-blue-700">Accuracy</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Posture Accuracy</span>
              <span>{stats.accuracy}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.accuracy}%` }}
                className={cn(
                  "h-full rounded-full",
                  stats.accuracy >= 90 ? "bg-green-500" :
                  stats.accuracy >= 70 ? "bg-yellow-500" : "bg-coral-500"
                )}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Detailed Feedback List */}
      {feedback.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Detailed Feedback</h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              <AnimatePresence>
                {feedback.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "p-4 rounded-lg border",
                      feedbackConfig[item.feedback].borderColor
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={cn(
                          "p-2 rounded-lg mt-1",
                          feedbackConfig[item.feedback].bgColor,
                          feedbackConfig[item.feedback].color
                        )}>
                          {feedbackConfig[item.feedback].icon}
                        </div>
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-slate-900">
                              {item.joint.replace('_', ' ')}
                            </h4>
                            <span className="text-sm text-slate-500">
                              {new Date(item.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-slate-700">{item.message}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm">
                            <div className="flex items-center space-x-1">
                              <Target className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600">
                                Angle: <span className="font-medium">{item.angle}°</span>
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="w-4 h-4 text-slate-400" />
                              <span className={cn(
                                "font-medium",
                                item.deviation <= 5 ? "text-green-600" :
                                item.deviation <= 15 ? "text-yellow-600" : "text-coral-600"
                              )}>
                                Deviation: {item.deviation.toFixed(1)}°
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </Card>
      )}

      {/* Tips for Improvement */}
      <Card className="bg-linear-to-r from-teal-50 to-blue-50">
        <div className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-teal-600" />
            Tips for Better Posture
          </h3>
          
          <ul className="space-y-3">
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 shrink-0" />
              <span className="text-slate-700">
                <span className="font-medium">Maintain alignment:</span> Keep joints stacked vertically
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 shrink-0" />
              <span className="text-slate-700">
                <span className="font-medium">Control your movements:</span> Move slowly and deliberately
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 shrink-0" />
              <span className="text-slate-700">
                <span className="font-medium">Focus on breathing:</span> Exhale during exertion
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 shrink-0" />
              <span className="text-slate-700">
                <span className="font-medium">Use mirrors:</span> Visual feedback helps maintain form
              </span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  )
}