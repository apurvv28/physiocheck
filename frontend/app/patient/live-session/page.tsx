'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Camera, Target, Clock, Activity, 
  AlertCircle, CheckCircle, X, RotateCcw,
  Video, Mic, Volume2, Wifi, Play, Pause
} from 'lucide-react'
import { Card } from '@/components/cards/Card'
import { WebcamFeedback } from '@/components/webcam/WebcamFeedback'
import { CountdownTimer } from '@/components/animations/CountdownTimer'
import Link from 'next/link'

interface LiveSessionData {
  repCount: number
  accuracy: number
  postureStatus: 'good' | 'adjusting' | 'poor'
  feedback: string
  jointAngles: Record<string, number>
}

export default function LiveSessionPage() {
  const [isStarted, setIsStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showCountdown, setShowCountdown] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [liveSessionData, setLiveSessionData] = useState<LiveSessionData>({
    repCount: 0,
    accuracy: 85,
    postureStatus: 'good',
    feedback: 'Good posture maintained',
    jointAngles: {
      shoulder: 75,
      elbow: 45,
      knee: 60,
      hip: 90
    }
  })
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
const webSocketRef = useRef<WebSocket | null>(null)

useEffect(() => {
  // Simulate WebSocket connection
  if (isStarted && !isPaused) {
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1)
      
      // Simulate live data updates
      if (elapsedTime % 5 === 0) {
        setLiveSessionData(prev => ({
          ...prev,
          repCount: prev.repCount + 1,
          accuracy: Math.min(100, prev.accuracy + (Math.random() > 0.5 ? 1 : -1)),
          postureStatus: ['good', 'adjusting', 'poor'][Math.floor(Math.random() * 3)] as 'good' | 'adjusting' | 'poor',
          feedback: [
            'Good posture maintained',
            'Keep your back straight',
            'Smooth movement detected',
            'Adjust shoulder position',
            'Perfect form!'
          ][Math.floor(Math.random() * 5)]
        }))
      }
    }, 1000)
  }

  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }
}, [isStarted, isPaused, elapsedTime])

  const startSession = () => {
    setShowCountdown(true)
    setTimeout(() => {
      setShowCountdown(false)
      setIsStarted(true)
      setIsConnected(true)
    }, 3000)
  }

  const endSession = () => {
    setIsStarted(false)
    setElapsedTime(0)
    setLiveSessionData({
      repCount: 0,
      accuracy: 85,
      postureStatus: 'good',
      feedback: 'Good posture maintained',
      jointAngles: {
        shoulder: 75,
        elbow: 45,
        knee: 60,
        hip: 90
      }
    })
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800">
      {/* Countdown Overlay */}
      {showCountdown && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <CountdownTimer duration={3} onComplete={() => {}} />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Live Exercise Session</h1>
            <p className="text-slate-300 mt-2">
              Shoulder Rehabilitation - Range of Motion
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              isConnected ? 'bg-green-900/20 text-green-400' : 'bg-coral-900/20 text-coral-400'
            }`}>
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isConnected ? 'Live Monitoring Active' : 'Connecting...'}
              </span>
            </div>
            <button
              onClick={endSession}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
              <span>End Session</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Webcam Feed */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-teal-900/20">
                      <Camera className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Live Camera Feed</h3>
                      <p className="text-sm text-slate-400">
                        Ensure proper lighting and full body visibility
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200">
                      <Video className="w-5 h-5 text-slate-400" />
                    </button>
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200">
                      <Mic className="w-5 h-5 text-slate-400" />
                    </button>
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200">
                      <Volume2 className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative aspect-video bg-black">
                {/* Webcam feed placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative w-64 h-64 mx-auto mb-4">
                      <div className="absolute inset-0 bg-linear-to-r from-teal-500/20 to-blue-500/20 rounded-full animate-pulse" />
                      <div className="absolute inset-8 bg-slate-800 rounded-full flex items-center justify-center">
                        <Camera className="w-16 h-16 text-slate-600" />
                      </div>
                    </div>
                    <p className="text-slate-400">
                      {isStarted ? 'Camera feed active' : 'Click start to begin session'}
                    </p>
                  </div>
                </div>

                {/* Posture overlay */}
                {isStarted && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Simulated posture points */}
                    <div className="absolute top-1/4 left-1/2 w-4 h-4 rounded-full bg-green-500 transform -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute top-1/2 left-1/3 w-4 h-4 rounded-full bg-green-500" />
                    <div className="absolute top-1/2 right-1/3 w-4 h-4 rounded-full bg-green-500" />
                    <div className="absolute bottom-1/4 left-1/2 w-4 h-4 rounded-full bg-green-500 transform -translate-x-1/2 translate-y-1/2" />
                  </div>
                )}

                {/* Session controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  {!isStarted ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startSession}
                      className="flex items-center space-x-2 px-6 py-3 rounded-full bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-colors duration-200"
                    >
                      <Play className="w-5 h-5" />
                      <span>Start Session</span>
                    </motion.button>
                  ) : (
                    <div className="flex items-center space-x-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                      <button
                        onClick={togglePause}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
                      >
                        {isPaused ? (
                          <Play className="w-5 h-5 text-white" />
                        ) : (
                          <Pause className="w-5 h-5 text-white" />
                        )}
                      </button>
                      <button 
                        onClick={() => setLiveSessionData(prev => ({ ...prev, repCount: 0 }))}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
                      >
                        <RotateCcw className="w-5 h-5 text-white" />
                      </button>
                      <div className="text-white font-mono text-lg">
                        {formatTime(elapsedTime)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Live Feedback */}
          <div className="space-y-6">
            {/* Rep Counter */}
            <Card className="bg-slate-800 border-slate-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-blue-900/20">
                      <Activity className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Rep Counter</h3>
                      <p className="text-sm text-slate-400">Current set</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {liveSessionData.repCount}
                    </div>
                    <div className="text-sm text-slate-400">/ 12 reps</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map((set) => (
                    <div key={set} className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Set {set}</span>
                      <div className="flex items-center space-x-2">
                        {Array.from({ length: 12 }).map((_, rep) => (
                          <div
                            key={rep}
                            className={`w-2 h-2 rounded-full ${
                              rep < liveSessionData.repCount
                                ? 'bg-green-500'
                                : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Accuracy Meter */}
            <Card className="bg-slate-800 border-slate-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-green-900/20">
                      <Target className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Accuracy</h3>
                      <p className="text-sm text-slate-400">Posture correctness</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {liveSessionData.accuracy}%
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${liveSessionData.accuracy}%` }}
                      className="h-full bg-linear-to-r from-green-500 to-teal-400"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-white">95%</div>
                      <div className="text-xs text-slate-400">Best</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">
                        {liveSessionData.accuracy}%
                      </div>
                      <div className="text-xs text-slate-400">Current</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">85%</div>
                      <div className="text-xs text-slate-400">Target</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Live Feedback */}
            <WebcamFeedback
              postureStatus={liveSessionData.postureStatus}
              feedback={liveSessionData.feedback}
              jointAngles={liveSessionData.jointAngles}
            />
          </div>
        </div>

        {/* Session Summary */}
        {!isStarted && elapsedTime > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="bg-slate-800 border-slate-700">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Session Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {formatTime(elapsedTime)}
                    </div>
                    <p className="text-sm text-slate-400">Duration</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {liveSessionData.repCount}
                    </div>
                    <p className="text-sm text-slate-400">Total Reps</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {liveSessionData.accuracy}%
                    </div>
                    <p className="text-sm text-slate-400">Accuracy</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {Math.round((liveSessionData.accuracy / 100) * liveSessionData.repCount)}
                    </div>
                    <p className="text-sm text-slate-400">Correct Reps</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-center space-x-4">
                  <Link
                    href="/patient/history"
                    className="px-6 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors duration-200"
                  >
                    View History
                  </Link>
                  <button
                    onClick={startSession}
                    className="px-6 py-3 rounded-lg border border-slate-600 text-white font-medium hover:bg-slate-700 transition-colors duration-200"
                  >
                    Start New Session
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}