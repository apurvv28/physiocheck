'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Target, Clock, Trophy, Calendar,
  TrendingUp, Play, CheckCircle, Activity
} from 'lucide-react'
import { Card } from '@/components/cards/Card'
import { ProgressRing } from '@/components/charts/ProgressRing'
import { ExerciseCard } from '@/components/cards/ExerciseCard'
import { AnimatedLoader } from '@/components/loaders/AnimatedLoader'
import { api, apiEndpoints } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { AppointmentList } from '@/components/appointments/AppointmentList'

interface PatientStats {
  totalExercises: number
  completedToday: number
  streak: number
  avgAccuracy: number
}

interface UpcomingExercise {
  id: string
  name: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  dueToday: boolean
  bodyPart: string[]
}

export default function PatientDashboard() {
  const [stats, setStats] = useState<PatientStats | null>(null)
  const [upcomingExercises, setUpcomingExercises] = useState<UpcomingExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments'>('overview')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, exercisesRes] = await Promise.all([
        api.get(apiEndpoints.patient.dashboard.stats),
        api.get(apiEndpoints.patient.exercises.list)
      ])

      const statsData = statsRes.data
      const exercisesList = exercisesRes.data || []

      // Fetch sessions for streak calculation
      const { data: { user } } = await supabase.auth.getUser()
      let streak = 0
      let completedToday = 0

      if (user) {
        const { data: patients } = await supabase
          .from('patients')
          .select('id')
          .eq('auth_user_id', user.id)

        if (patients && patients.length > 0) {
          const patientIds = patients.map(p => p.id)

          const { data: sessions } = await supabase
            .from('exercise_sessions')
            .select('started_at, completed_at')
            .in('patient_id', patientIds)
            .not('completed_at', 'is', null)
            .order('started_at', { ascending: false })

          if (sessions && sessions.length > 0) {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            // Get unique dates of completed sessions
            const sessionDates = sessions
              .map(s => {
                const date = new Date(s.completed_at)
                date.setHours(0, 0, 0, 0)
                return date.getTime()
              })
              .filter((date, index, self) => self.indexOf(date) === index)
              .sort((a, b) => b - a)

            // Calculate streak
            let currentDate = sessionDates[0]
            const todayTime = today.getTime()
            const yesterdayTime = todayTime - 24 * 60 * 60 * 1000

            if (currentDate >= yesterdayTime) {
              streak = 1
              for (let i = 1; i < sessionDates.length; i++) {
                const expectedDate = currentDate - 24 * 60 * 60 * 1000
                if (sessionDates[i] === expectedDate) {
                  streak++
                  currentDate = sessionDates[i]
                } else {
                  break
                }
              }
            }

            // Count completed today
            completedToday = sessions.filter(s => {
              const sessionDate = new Date(s.completed_at)
              return sessionDate >= today
            }).length
          }
        }
      }

      setStats({
        totalExercises: exercisesList.length,
        completedToday: completedToday,
        streak: streak,
        avgAccuracy: statsData.avgAccuracy || 0
      })

      // Filter exercises due today (mock logic: all active exercises are "due" for demo)
      const upcoming = exercisesList.map((ex: any) => {
        let exerciseData = ex.exercises || ex.exercise || ex
        if (Array.isArray(exerciseData)) {
          exerciseData = exerciseData[0] || {}
        }

        return {
          id: ex.exercise_id || ex.id,
          name: exerciseData.title || exerciseData.name || exerciseData.exercise_name || ex.title || ex.name || 'Unknown Exercise',
          description: exerciseData.description || exerciseData.exercise_description || ex.description || ex.exercise_description || '',
          difficulty: exerciseData.difficulty || ex.difficulty || 'beginner',
          duration: exerciseData.duration_minutes || ex.duration_minutes || 15,
          dueToday: true,
          bodyPart: exerciseData.body_part || []
        }
      })

      setUpcomingExercises(upcoming)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <AnimatedLoader message="Loading your dashboard..." />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Exercises',
      value: stats?.totalExercises || 0,
      icon: <Target className="w-6 h-6" />,
      color: 'teal',
    },
    {
      title: 'Completed Today',
      value: stats?.completedToday || 0,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'green',
    },
    {
      title: 'Current Streak',
      value: `${stats?.streak || 0} days`,
      icon: <Trophy className="w-6 h-6" />,
      color: 'coral',
    },
    {
      title: 'Avg Accuracy',
      value: `${stats?.avgAccuracy || 0}%`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'blue',
    },
  ]

  const todaysExercises = upcomingExercises.filter(ex => ex.dueToday)

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back!</h1>
          <p className="text-slate-600 mt-2">
            Track your progress and continue your rehabilitation journey
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8 border-b border-slate-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'appointments'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Appointments
            </button>
          </div>
        </div>

        {activeTab === 'overview' ? (
        <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="p-6">
                  <div className={`p-3 rounded-xl bg-${stat.color}-100 text-${stat.color}-600 mb-4`}>
                    {stat.icon}
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Today's Exercises */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-slate-900">
                      Today's Exercises
                    </h2>
                    <Link
                      href="/patient/exercises"
                      className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors duration-200"
                    >
                      View all →
                    </Link>
                  </div>

                  {todaysExercises.length === 0 ? (
                    <div className="text-center py-12">
                      <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">No exercises for today</p>
                      <p className="text-sm text-slate-500 mt-2">
                        Great job! You've completed all scheduled exercises.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todaysExercises.map((exercise, index) => (
                        <motion.div
                          key={exercise.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        >
                          <div className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors duration-200">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                                <Target className="w-6 h-6 text-teal-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-slate-900">
                                  {exercise.name}
                                </h4>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-slate-600">
                                  <span className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {exercise.duration} min
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs ${exercise.difficulty === 'beginner'
                                    ? 'bg-green-100 text-green-800'
                                    : exercise.difficulty === 'intermediate'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-coral-100 text-coral-800'
                                    }`}>
                                    {exercise.difficulty}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Link
                              href={`/patient/live-session?exercise=${exercise.id}`}
                              className="inline-flex items-center px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors duration-200"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Start
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Progress & Quick Start */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="mb-6">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-6">
                    Weekly Progress
                  </h2>
                  <div className="flex flex-col items-center">
                    <ProgressRing
                      value={stats?.avgAccuracy || 0}
                      size={150}
                      strokeWidth={8}
                    />
                    <div className="mt-6 text-center">
                      <div className="text-3xl font-bold text-slate-900">
                        {stats?.avgAccuracy || 0}%
                      </div>
                      <p className="text-sm text-slate-600">Average Accuracy</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-6">
                    Quick Stats
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-green-100">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">Completion Rate</p>
                          <p className="text-xs text-slate-600">Last 7 days</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-green-600">94%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">Total Time</p>
                          <p className="text-xs text-slate-600">This week</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-slate-900">2h 15m</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-coral-100">
                          <Activity className="w-5 h-5 text-coral-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">Total Reps</p>
                          <p className="text-xs text-slate-600">This week</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-slate-900">156</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
        </>
        ) : (
          <div className="max-w-4xl">
             <AppointmentList userRole="patient" />
          </div>
        )}
      </div>
    </div>
  )
}