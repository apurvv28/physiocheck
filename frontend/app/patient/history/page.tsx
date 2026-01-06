'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Filter, TrendingUp, Clock, Target, Download, Eye } from 'lucide-react'
import { Card } from '@/components/cards/Card'
import { ProgressRing } from '@/components/charts/ProgressRing'
import { AnimatedLoader } from '@/components/loaders/AnimatedLoader'
import { api, apiEndpoints } from '@/lib/api'

interface SessionHistory {
  id: string
  date: string
  exerciseName: string
  duration: number
  reps: number
  accuracy: number
  sets: number
  notes?: string
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionHistory[]>([])
  const [dateRange, setDateRange] = useState<string>('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await api.get(apiEndpoints.patient.session.history)
      const data = response.data
      
      const mappedSessions: SessionHistory[] = data.map((s: any) => ({
        id: s.id,
        date: s.session_start,
        exerciseName: s.exercise_name,
        duration: 15, // Placeholder, compute from start/end if available
        reps: s.total_reps,
        accuracy: s.accuracy_percent,
        sets: 3, // Placeholder, not in session schema
        notes: s.notes
      }))
      
      setSessions(mappedSessions)
    } catch (error) {
       // eslint-disable-next-line no-console
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalSessions: sessions.length,
    avgAccuracy: Math.round(sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length),
    totalDuration: sessions.reduce((acc, s) => acc + s.duration, 0),
    totalReps: sessions.reduce((acc, s) => acc + s.reps, 0)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <AnimatedLoader message="Loading your history..." />
      </div>
    )
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Session History</h1>
          <p className="text-slate-600 mt-2">
            Track your progress and view past exercise sessions
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Sessions',
              value: stats.totalSessions,
              icon: <Calendar className="w-6 h-6" />,
              color: 'teal',
              change: '+15%'
            },
            {
              title: 'Avg Accuracy',
              value: `${stats.avgAccuracy}%`,
              icon: <Target className="w-6 h-6" />,
              color: 'green',
              change: '+8%'
            },
            {
              title: 'Total Duration',
              value: `${stats.totalDuration}m`,
              icon: <Clock className="w-6 h-6" />,
              color: 'blue',
              change: '+12%'
            },
            {
              title: 'Total Reps',
              value: stats.totalReps,
              icon: <TrendingUp className="w-6 h-6" />,
              color: 'coral',
              change: '+18%'
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-${stat.color}-100 text-${stat.color}-600`}>
                      {stat.icon}
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {stat.title}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="quarter">Last 3 Months</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
              </div>
              <button className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-200">
                <Download className="w-4 h-4 mr-2" />
                Export History
              </button>
            </div>
          </div>
        </Card>

        {/* Sessions List */}
        <div className="space-y-6">
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{session.exerciseName}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {formatDate(session.date)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <ProgressRing value={session.accuracy} size={60} strokeWidth={4} />
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200">
                        <Eye className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-slate-600 mb-1">Duration</div>
                      <div className="flex items-center justify-center space-x-1">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900">{session.duration}m</span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-slate-600 mb-1">Sets & Reps</div>
                      <span className="font-medium text-slate-900">
                        {session.sets} × {session.reps / session.sets}
                      </span>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-slate-600 mb-1">Total Reps</div>
                      <span className="font-medium text-slate-900">{session.reps}</span>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-slate-600 mb-1">Accuracy</div>
                      <span className={`font-medium ${
                        session.accuracy >= 90 ? "text-green-600" :
                        session.accuracy >= 75 ? "text-yellow-600" : "text-coral-600"
                      }`}>
                        {session.accuracy}%
                      </span>
                    </div>
                  </div>

                  {session.notes && (
                    <div className="mt-4 p-3 bg-teal-50 border border-teal-100 rounded-lg">
                      <p className="text-sm text-teal-800">
                        <span className="font-medium">Doctor's Note:</span> {session.notes}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Progress Chart */}
        <Card className="mt-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              Accuracy Trend
            </h2>
            <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Your progress over time</p>
                <p className="text-sm text-slate-500 mt-2">
                  Connect to analytics service to display detailed charts
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}