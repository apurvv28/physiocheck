'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Filter, TrendingUp, Clock, Target, Download, Eye } from 'lucide-react'
import { Card } from '@/components/cards/Card'
import { ProgressRing } from '@/components/charts/ProgressRing'
import { AnimatedLoader } from '@/components/loaders/AnimatedLoader'
import { api, apiEndpoints } from '@/lib/api'
import { supabase } from '@/lib/supabase'

interface SessionHistory {
  id: string
  date: string
  exerciseName: string
  duration: number
  reps: number
  accuracy: number
  sets: number
  notes?: string
  startedAt?: string
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionHistory[]>([])
  const [dateRange, setDateRange] = useState<string>('year')
  const [loading, setLoading] = useState(true)
  const [patientName, setPatientName] = useState<string>('')
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    fetchHistory()
  }, []) // Keep empty dep array for initial fetch, filtering is local

  const fetchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Current User:', user)
      if (!user) return

      const { data: patients, error: patientError } = await supabase
        .from('patients')
        .select('id, full_name')
        .eq('auth_user_id', user.id)

      if (patientError) {
        console.error('Error fetching patient:', patientError)
        setDebugInfo({ error: 'Error fetching patients', details: patientError })
        return
      }

      if (!patients || patients.length === 0) {
        console.warn('No patient found for this user.')
        setDebugInfo({
          error: 'No patient profile found for this user',
          auth_user_id: user.id,
          auth_email: user.email,
          message: 'Check if patients table has a record with this auth_user_id'
        })
        return
      }

      setPatientName(patients.map(p => p.full_name).join(', '))

      const patientIds = patients.map(p => p.id)

      const { data: sessionsData, error } = await supabase
        .from('exercise_sessions')
        .select(`
          id,
          started_at,
          completed_at,
          duration_seconds,
          repetitions,
          notes,
          exercise:exercises (
            name
          )
        `)
        .in('patient_id', patientIds) // Check ALL patient IDs
        .order('started_at', { ascending: false })

      if (error) {
        setDebugInfo({ error: 'Error fetching sessions', details: error })
        throw error
      }

      setDebugInfo({
        user_id: user.id,
        patient_count: patients.length,
        patient_ids: patientIds,
        sessions_found: sessionsData?.length || 0
      })

      const mappedSessions: SessionHistory[] = (sessionsData || []).map((s: any) => {
        let duration = 0
        // Precise calculation: completed_at - started_at
        if (s.started_at && s.completed_at) {
          const start = new Date(s.started_at).getTime()
          const end = new Date(s.completed_at).getTime()
          // diff is in ms, so /1000/60 for minutes
          if (!isNaN(start) && !isNaN(end) && end > start) {
            duration = Math.round((end - start) / 60000)
          }
        }

        // Fallback or explicit duration override if calculation failed or was 0
        if (duration === 0 && s.duration_seconds) {
          duration = Math.round(s.duration_seconds / 60)
        }

        return {
          id: s.id,
          date: s.started_at || s.created_at, // actual date object/string
          startedAt: s.started_at,
          exerciseName: s.exercise?.name || 'Unknown Exercise',
          duration: duration > 0 ? duration : 0,
          reps: s.repetitions || 0,
          accuracy: 85, // Mock data as per original or replace with real column if available
          sets: 1, // Default or fetch real data
          notes: s.notes
        }
      })

      console.log('Mapped Sessions:', mappedSessions)
      setSessions(mappedSessions)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter sessions based on selected range
  const filteredSessions = useMemo(() => {
    const now = new Date()
    return sessions.filter(session => {
      if (!session.date) return false
      const sessionDate = new Date(session.date)
      if (isNaN(sessionDate.getTime())) return false

      switch (dateRange) {
        case 'week': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return sessionDate >= weekAgo
        }
        case 'month': {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return sessionDate >= monthAgo
        }
        case 'quarter': {
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          return sessionDate >= quarterAgo
        }
        case 'year': {
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          return sessionDate >= yearAgo
        }
        default:
          return true
      }
    })
  }, [sessions, dateRange])

  // Calculate stats based on FILTERED sessions
  const stats = useMemo(() => {
    return {
      totalSessions: filteredSessions.length,
      avgAccuracy: filteredSessions.length > 0
        ? Math.round(filteredSessions.reduce((acc, s) => acc + s.accuracy, 0) / filteredSessions.length)
        : 0,
      totalDuration: filteredSessions.reduce((acc, s) => acc + s.duration, 0),
      totalReps: filteredSessions.reduce((acc, s) => acc + s.reps, 0)
    }
  }, [filteredSessions])


  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
            Track your progress and view past exercise sessions {patientName && `for ${patientName}`}
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
            },
            {
              title: 'Avg Accuracy',
              value: `${stats.avgAccuracy}%`,
              icon: <Target className="w-6 h-6" />,
              color: 'green',
            },
            {
              title: 'Total Duration',
              value: `${stats.totalDuration}m`,
              icon: <Clock className="w-6 h-6" />,
              color: 'blue',
            },
            {
              title: 'Total Reps',
              value: stats.totalReps,
              icon: <TrendingUp className="w-6 h-6" />,
              color: 'coral',
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
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No sessions found for this period.
            </div>
          ) : (
            filteredSessions.map((session, index) => (
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
                          {session.sets} × {Math.round(session.reps / (session.sets || 1))}
                        </span>
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-slate-600 mb-1">Total Reps</div>
                        <span className="font-medium text-slate-900">{session.reps}</span>
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-slate-600 mb-1">Accuracy</div>
                        <span className={`font-medium ${session.accuracy >= 90 ? "text-green-600" :
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
            ))
          )}
        </div>

        {/* Debug Info - Temporary */}
        {filteredSessions.length === 0 && debugInfo && (
          <div className="mt-8 p-4 bg-gray-100 rounded text-xs font-mono text-gray-600">
            <h4 className="font-bold">Debug Information:</h4>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            <p className="mt-2">Filter Mode: {dateRange}</p>
          </div>
        )}

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