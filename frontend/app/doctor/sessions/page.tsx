'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Filter, TrendingUp, Clock, Target, Users, Download } from 'lucide-react'
import { Card } from '@/components/cards/Card'
import { SessionCard } from '@/components/cards/SessionCard'

interface Session {
  id: string
  patientName: string
  exerciseName: string
  date: string
  duration: number
  accuracy: number
  reps: number
  status: 'completed' | 'in_progress' | 'missed'
}

export default function SessionsPage() {
  const [dateRange, setDateRange] = useState<string>('week')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const sessions: Session[] = [
    {
      id: '1',
      patientName: 'John Smith',
      exerciseName: 'Shoulder Rehabilitation',
      date: '2024-01-15',
      duration: 15,
      accuracy: 92,
      reps: 36,
      status: 'completed'
    },
    {
      id: '2',
      patientName: 'Sarah Johnson',
      exerciseName: 'Knee Strengthening',
      date: '2024-01-14',
      duration: 22,
      accuracy: 87,
      reps: 44,
      status: 'completed'
    },
    {
      id: '3',
      patientName: 'Michael Chen',
      exerciseName: 'Spinal Mobility',
      date: '2024-01-13',
      duration: 18,
      accuracy: 95,
      reps: 54,
      status: 'completed'
    },
    {
      id: '4',
      patientName: 'Emily Wilson',
      exerciseName: 'Ankle Strengthening',
      date: '2024-01-12',
      duration: 12,
      accuracy: 78,
      reps: 24,
      status: 'in_progress'
    },
    {
      id: '5',
      patientName: 'Robert Brown',
      exerciseName: 'Shoulder Rehabilitation',
      date: '2024-01-11',
      duration: 0,
      accuracy: 0,
      reps: 0,
      status: 'missed'
    },
  ]

  const filteredSessions = sessions.filter(session => {
    if (statusFilter === 'all') return true
    return session.status === statusFilter
  })

  const stats = {
    totalSessions: sessions.length,
    avgAccuracy: Math.round(sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length),
    totalDuration: sessions.reduce((acc, s) => acc + s.duration, 0),
    completionRate: Math.round((sessions.filter(s => s.status === 'completed').length / sessions.length) * 100)
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Session Analytics</h1>
          <p className="text-slate-600 mt-2">
            Track and analyze patient exercise sessions
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
              change: '+12%'
            },
            {
              title: 'Avg Accuracy',
              value: `${stats.avgAccuracy}%`,
              icon: <Target className="w-6 h-6" />,
              color: 'green',
              change: '+5%'
            },
            {
              title: 'Total Duration',
              value: `${stats.totalDuration}m`,
              icon: <Clock className="w-6 h-6" />,
              color: 'blue',
              change: '+8%'
            },
            {
              title: 'Completion Rate',
              value: `${stats.completionRate}%`,
              icon: <TrendingUp className="w-6 h-6" />,
              color: 'coral',
              change: '+3%'
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
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="missed">Missed</option>
                  </select>
                </div>
              </div>
              <button className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-200">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </Card>

        {/* Sessions List */}
        <div className="space-y-6">
          {filteredSessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SessionCard session={session} />
            </motion.div>
          ))}
        </div>

        {/* Analytics Chart Placeholder */}
        <Card className="mt-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              Accuracy Trends
            </h2>
            <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Accuracy analytics chart</p>
                <p className="text-sm text-slate-500 mt-2">
                  Connect to your analytics service to display charts
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}