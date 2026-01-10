'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, Activity, TrendingUp, AlertCircle, 
  Clock, Calendar, UserCheck 
} from 'lucide-react'
import { Card } from '@/components/cards/Card'
import { AnimatedLoader } from '@/components/loaders/AnimatedLoader'
import { ProgressRing } from '@/components/charts/ProgressRing'
import { PatientCard } from '@/components/cards/PatientCard'
import { api, apiEndpoints } from '@/lib/api'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  activePatients: number
  totalSessions: number
  avgCompliance: number
  alerts: number
}

interface ActiveSession {
  id: string
  patientName: string
  exercise: string
  duration: number
  accuracy: number
}

export default function DoctorDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Get doctor profile
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (!doctor) {
        console.warn('Doctor profile not found')
        return
      }

      // Fetch data directly from Supabase for counts, but active sessions from API to get joined data safely
      const [patientsCount, sessionsCount, activeSessionsRes] = await Promise.all([
        // Active Patients (assigned to this doctor)
        supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .eq('doctor_id', doctor.id),

        // Total Sessions (for this doctor's patients)
        supabase
          .from('exercise_sessions')
          .select('id, patients!inner(doctor_id)', { count: 'exact', head: true })
          .eq('patients.doctor_id', doctor.id),

        // Active Sessions from Backend API
        api.get('/doctor/sessions/active')
      ])
      
      const statsData: DashboardStats = {
        activePatients: patientsCount.count || 0,
        totalSessions: sessionsCount.count || 0,
        avgCompliance: 85,
        alerts: 2
      }
      
      setStats(statsData)

      // Deduplicate sessions to show only one active session per patient
      const uniqueSessionsMap = new Map()
      const sessions = activeSessionsRes.data || []
      
      sessions.forEach((session: any) => {
        if (!uniqueSessionsMap.has(session.patient_id)) {
          uniqueSessionsMap.set(session.patient_id, session)
        }
      })

      const mappedSessions = Array.from(uniqueSessionsMap.values()).map((session: any) => {
          // Calculate elapsed duration in minutes
          // created_at is in UTC. Date.now() is local, but new Date(created_at) works if string is ISO.
          // Assuming backend returns ISO string.
          const startTime = new Date(session.created_at).getTime();
          const now = Date.now();
          // Diff in minutes
          const diffMins = Math.max(0, Math.floor((now - startTime) / 60000));
          
          return {
            id: session.id,
            patientName: session.patients?.full_name || 'Unknown Patient',
            exercise: session.exercises?.title || 'Unknown Exercise',
            duration: diffMins,
            accuracy: (session.metrics && typeof session.metrics === 'object' && session.metrics.accuracy) || 0
          };
      })

      setActiveSessions(mappedSessions)
      
    } catch (error) {
      // Gracefully handle error by setting defaults
      // eslint-disable-next-line no-console
      console.warn('Could not fetch dashboard data (using defaults):', error)
      
      setStats({
        activePatients: 0,
        totalSessions: 0,
        avgCompliance: 0,
        alerts: 0
      })
      setActiveSessions([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <AnimatedLoader message="Loading dashboard..." />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Active Patients',
      value: stats?.activePatients || 0,
      icon: <Users className="w-6 h-6" />,
      color: 'teal',
    },
    {
      title: 'Total Sessions',
      value: stats?.totalSessions || 0,
      icon: <Activity className="w-6 h-6" />,
      color: 'blue',
    },
    {
      title: 'Avg Compliance',
      value: `${stats?.avgCompliance || 0}%`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'green',
    },
    {
      title: 'Alerts',
      value: stats?.alerts || 0,
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'coral',
    },
  ]

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900">Doctor Dashboard</h1>
          <p className="text-slate-600 mt-2">
            Monitor patient progress and manage rehabilitation programs
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Active Sessions */}
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
                      Active Sessions
                    </h2>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm text-slate-600">
                        Live Monitoring
                      </span>
                    </div>
                  </div>

                  {activeSessions.length === 0 ? (
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">No active sessions</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeSessions.map((session) => (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                                <UserCheck className="w-5 h-5 text-teal-600" />
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900">
                                {session.patientName}
                              </h4>
                              <p className="text-sm text-slate-600">
                                {session.exercise}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600">
                                  {session.duration}m
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <TrendingUp className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium text-green-600">
                                  {session.accuracy}%
                                </span>
                              </div>
                            </div>
                            <Link
                              href={`/doctor/sessions/live/${session.id}`}
                              className="px-4 py-2 text-sm font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors duration-200"
                            >
                              View Live
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

          {/* Right Column - Quick Actions */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="mb-6">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-6">
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    <Link
                      href="/doctor/assign-exercises"
                      className="block w-full text-left px-4 py-3 rounded-lg bg-teal-50 text-teal-700 font-medium hover:bg-teal-100 transition-colors duration-200"
                    >
                      Assign New Exercise
                    </Link>
                    <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 text-slate-700 font-medium hover:bg-slate-100 transition-colors duration-200">
                      Schedule Follow-up
                    </button>
                    <Link
                      href="/doctor/patients"
                      className="block w-full text-left px-4 py-3 rounded-lg bg-slate-50 text-slate-700 font-medium hover:bg-slate-100 transition-colors duration-200"
                    >
                      Review Patient Reports
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}