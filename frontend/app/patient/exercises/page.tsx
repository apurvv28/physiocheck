'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Target, Clock, Calendar, CheckCircle, Play } from 'lucide-react'
import { Card } from '@/components/cards/Card'
import { ExerciseCard } from '@/components/cards/ExerciseCard'
import { AnimatedLoader } from '@/components/loaders/AnimatedLoader'
import { api, apiEndpoints } from '@/lib/api'
import Link from 'next/link'

interface PatientExercise {
  id: string
  name: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  bodyPart: string[]
  equipment: string[]
  assignedDate: string
  dueDate?: string
  completed: boolean
  lastCompleted?: string
  progress: number
  sets: number
  reps: number
  frequency: string
}

export default function PatientExercisesPage() {
  const [exercises, setExercises] = useState<PatientExercise[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExercises()
  }, [])

  const fetchExercises = async () => {
    try {
      const response = await api.get('/patient/my_exercises')
      const data = response.data
      
      console.log('Patient exercises data:', data)

      const mappedExercises: PatientExercise[] = data.map((ex: any) => ({
        id: ex.id,
        name: ex.exercises?.name || 'Unknown Exercise',
        description: ex.exercises?.description || '',
        difficulty: ex.exercises?.difficulty || 'beginner',
        duration: Math.round((ex.exercises?.default_duration_seconds || 900) / 60),
        bodyPart: ex.exercises?.body_part || [],
        equipment: ex.exercises?.equipment || [],
        assignedDate: ex.assigned_at || ex.created_at, // assigned_at is the correct field
        dueDate: ex.dueDate, // Might not exist
        completed: false, // You might want to check session history to see if completed today
        progress: 0,
        sets: ex.sets || 0,
        reps: ex.reps || 0,
        frequency: ex.frequency || 'daily'
      }))
      
      setExercises(mappedExercises)
    } catch (error) {
       // eslint-disable-next-line no-console
      console.error('Error fetching exercises:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (statusFilter === 'all') return matchesSearch
    if (statusFilter === 'completed') return matchesSearch && exercise.completed
    if (statusFilter === 'pending') return matchesSearch && !exercise.completed
    if (statusFilter === 'due_soon') {
      if (!exercise.dueDate) return false
      const dueDate = new Date(exercise.dueDate)
      const today = new Date()
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
      return matchesSearch && !exercise.completed && diffDays <= 7
    }
    return matchesSearch
  })

  const statusCounts = {
    all: exercises.length,
    completed: exercises.filter(e => e.completed).length,
    pending: exercises.filter(e => !e.completed).length,
    due_soon: exercises.filter(e => {
      if (!e.dueDate || e.completed) return false
      const dueDate = new Date(e.dueDate)
      const today = new Date()
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
      return diffDays <= 7
    }).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <AnimatedLoader message="Loading your exercises..." />
      </div>
    )
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Exercises</h1>
          <p className="text-slate-600 mt-2">
            View and manage your assigned rehabilitation exercises
          </p>
        </div>

        {/* Stats and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="lg:col-span-3">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search exercises..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="all">All Exercises</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="due_soon">Due Soon</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">
                  {exercises.filter(e => !e.completed).length}
                </div>
                <p className="text-sm text-slate-600">Pending Exercises</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Status Tabs */}
        <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All Exercises', count: statusCounts.all, color: 'slate' },
            { id: 'completed', label: 'Completed', count: statusCounts.completed, color: 'green' },
            { id: 'pending', label: 'Pending', count: statusCounts.pending, color: 'coral' },
            { id: 'due_soon', label: 'Due Soon', count: statusCounts.due_soon, color: 'yellow' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg whitespace-nowrap transition-colors duration-200 ${
                statusFilter === tab.id
                  ? `bg-${tab.color}-100 text-${tab.color}-700`
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="font-medium">{tab.label}</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                statusFilter === tab.id
                  ? `bg-${tab.color}-200`
                  : 'bg-slate-200'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Exercises Grid */}
        <AnimatePresence mode="wait">
          {filteredExercises.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No exercises found</p>
              <p className="text-sm text-slate-500 mt-2">
                Try adjusting your search or filter criteria
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="exercises"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredExercises.map((exercise, index) => (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <div className="p-6 h-full flex flex-col">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                            <Target className="w-6 h-6 text-teal-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{exercise.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                exercise.difficulty === 'beginner'
                                  ? 'bg-green-100 text-green-800'
                                  : exercise.difficulty === 'intermediate'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-coral-100 text-coral-800'
                              }`}>
                                {exercise.difficulty}
                              </span>
                              {exercise.completed && (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Completed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-600 mb-4 flex-1">
                        {exercise.description}
                      </p>

                      {/* Details */}
                      <div className="space-y-3 mb-6">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center space-x-2 text-slate-600">
                            <Clock className="w-4 h-4" />
                            <span>{exercise.duration} min</span>
                          </div>
                          <div className="text-slate-600">
                            {exercise.sets} sets × {exercise.reps} reps
                          </div>
                          <div className="text-slate-600">
                            {exercise.frequency}
                          </div>
                          <div className="text-slate-600">
                            Progress: {exercise.progress}%
                          </div>
                        </div>
                        {exercise.dueDate && !exercise.completed && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="w-4 h-4 text-coral-600" />
                            <span className="text-coral-700">
                              Due: {new Date(exercise.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {exercise.lastCompleted && (
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Last completed: {new Date(exercise.lastCompleted).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="mt-auto">
                        <Link
                          href={`/patient/live-session?exercise=${exercise.id}`}
                          className="block w-full"
                        >
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                              exercise.completed
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-teal-600 text-white hover:bg-teal-700'
                            }`}
                          >
                            <div className="flex items-center justify-center">
                              {exercise.completed ? (
                                <>
                                  <CheckCircle className="w-5 h-5 mr-2" />
                                  View Results
                                </>
                              ) : (
                                <>
                                  <Play className="w-5 h-5 mr-2" />
                                  Start Exercise
                                </>
                              )}
                            </div>
                          </motion.button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}