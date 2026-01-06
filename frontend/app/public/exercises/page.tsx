'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Filter, Play, Clock, Target, Users, Info } from 'lucide-react'
import { Card } from '@/components/cards/Card'
import { ExerciseCard } from '@/components/cards/ExerciseCard'
import Link from 'next/link'

interface PublicExercise {
  id: string
  name: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  bodyPart: string[]
  equipment: string[]
  videoUrl?: string
  benefits: string[]
  instructions: string[]
}

export default function PublicExercisesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [bodyPartFilter, setBodyPartFilter] = useState<string>('all')
  const [selectedExercise, setSelectedExercise] = useState<PublicExercise | null>(null)

  const exercises: PublicExercise[] = [
    {
      id: '1',
      name: 'Shoulder Range of Motion',
      description: 'Improve shoulder mobility and reduce stiffness. Ideal for post-injury recovery and general shoulder health.',
      difficulty: 'beginner',
      duration: 10,
      bodyPart: ['shoulder', 'upper back'],
      equipment: ['none'],
      benefits: [
        'Increases shoulder flexibility',
        'Reduces stiffness and pain',
        'Improves posture',
        'Enhances daily functional movements'
      ],
      instructions: [
        'Stand or sit with good posture',
        'Slowly raise arms forward to shoulder height',
        'Hold for 2 seconds',
        'Slowly lower arms back down',
        'Repeat 10-15 times'
      ]
    },
    {
      id: '2',
      name: 'Knee Rehabilitation Squats',
      description: 'Strengthen quadriceps and improve knee stability. Perfect for post-surgery recovery and arthritis management.',
      difficulty: 'intermediate',
      duration: 15,
      bodyPart: ['knee', 'thigh'],
      equipment: ['chair'],
      benefits: [
        'Builds knee stability',
        'Strengthens quadriceps',
        'Improves balance',
        'Reduces knee pain'
      ],
      instructions: [
        'Stand in front of a chair',
        'Slowly lower yourself as if sitting',
        'Hold for 3 seconds',
        'Push through heels to stand',
        'Repeat 8-12 times'
      ]
    },
    {
      id: '3',
      name: 'Spinal Mobility Flow',
      description: 'Enhance spinal flexibility and core strength. Excellent for back pain relief and improving posture.',
      difficulty: 'advanced',
      duration: 20,
      bodyPart: ['back', 'core'],
      equipment: ['mat'],
      benefits: [
        'Increases spinal flexibility',
        'Strengthens core muscles',
        'Improves posture',
        'Reduces back pain'
      ],
      instructions: [
        'Start on hands and knees',
        'Arch back upward (cat position)',
        'Hold for 3 seconds',
        'Drop belly toward floor (cow position)',
        'Repeat 10-15 times'
      ]
    },
    {
      id: '4',
      name: 'Ankle Strengthening Series',
      description: 'Build ankle stability and prevent injuries. Essential for athletes and those with weak ankles.',
      difficulty: 'beginner',
      duration: 8,
      bodyPart: ['ankle', 'foot'],
      equipment: ['resistance band'],
      benefits: [
        'Improves ankle stability',
        'Prevents sprains',
        'Enhances balance',
        'Reduces recovery time'
      ],
      instructions: [
        'Sit with leg extended',
        'Wrap resistance band around foot',
        'Point toes away and pull back',
        'Hold each position for 2 seconds',
        'Repeat 15-20 times'
      ]
    },
    {
      id: '5',
      name: 'Neck and Cervical Relief',
      description: 'Relieve neck tension and improve posture. Great for office workers and those with neck strain.',
      difficulty: 'beginner',
      duration: 12,
      bodyPart: ['neck', 'upper back'],
      equipment: ['none'],
      benefits: [
        'Reduces neck tension',
        'Improves posture',
        'Relieves headaches',
        'Increases range of motion'
      ],
      instructions: [
        'Sit or stand with good posture',
        'Slowly tilt head toward shoulder',
        'Hold for 5 seconds',
        'Return to center',
        'Repeat on other side'
      ]
    },
    {
      id: '6',
      name: 'Hip Flexor Stretch Routine',
      description: 'Increase hip flexibility and reduce lower back pain. Perfect for runners and sedentary individuals.',
      difficulty: 'intermediate',
      duration: 18,
      bodyPart: ['hip', 'lower back'],
      equipment: ['mat'],
      benefits: [
        'Increases hip flexibility',
        'Reduces lower back pain',
        'Improves walking gait',
        'Enhances athletic performance'
      ],
      instructions: [
        'Kneel on one knee',
        'Push hips forward gently',
        'Hold for 30 seconds',
        'Switch sides',
        'Repeat 3 times each side'
      ]
    },
  ]

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDifficulty = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter
    const matchesBodyPart = bodyPartFilter === 'all' || exercise.bodyPart.includes(bodyPartFilter)
    
    return matchesSearch && matchesDifficulty && matchesBodyPart
  })

  const bodyParts = Array.from(new Set(exercises.flatMap(ex => ex.bodyPart)))

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Exercise Library
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Browse professionally curated physiotherapy exercises with detailed instructions and video guides
            </p>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: <Target className="w-6 h-6" />, value: '50+', label: 'Exercises' },
            { icon: <Users className="w-6 h-6" />, value: 'Expert', label: 'Reviewed' },
            { icon: <Clock className="w-6 h-6" />, value: '5-30 min', label: 'Duration' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-100 text-teal-600 mb-4">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">
                    {stat.value}
                  </div>
                  <p className="text-sm text-slate-600">
                    {stat.label}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-slate-400" />
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All Difficulty</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-slate-400" />
                <select
                  value={bodyPartFilter}
                  onChange={(e) => setBodyPartFilter(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All Body Parts</option>
                  {bodyParts.map(part => (
                    <option key={part} value={part}>
                      {part.charAt(0).toUpperCase() + part.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

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
                  <ExerciseCard 
                    exercise={exercise} 
                    isPublic 
                    onClick={() => setSelectedExercise(exercise)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exercise Detail Modal */}
        <AnimatePresence>
          {selectedExercise && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedExercise(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {selectedExercise.name}
                      </h2>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className={`px-3 py-1 text-sm rounded-full ${
                          selectedExercise.difficulty === 'beginner'
                            ? 'bg-green-100 text-green-800'
                            : selectedExercise.difficulty === 'intermediate'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-coral-100 text-coral-800'
                        }`}>
                          {selectedExercise.difficulty}
                        </span>
                        <span className="flex items-center text-sm text-slate-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {selectedExercise.duration} minutes
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedExercise(null)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                    >
                      <X className="w-6 h-6 text-slate-400" />
                    </button>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">
                          Description
                        </h3>
                        <p className="text-slate-600">
                          {selectedExercise.description}
                        </p>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">
                          Benefits
                        </h3>
                        <ul className="space-y-2">
                          {selectedExercise.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 shrink-0" />
                              <span className="text-slate-600">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">
                          Equipment Needed
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedExercise.equipment.map((item, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">
                          Instructions
                        </h3>
                        <ol className="space-y-3">
                          {selectedExercise.instructions.map((instruction, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                                {index + 1}
                              </div>
                              <span className="text-slate-600">{instruction}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="bg-teal-50 border border-teal-100 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Info className="w-5 h-5 text-teal-600" />
                          <h4 className="font-semibold text-teal-900">Safety Tips</h4>
                        </div>
                        <ul className="space-y-2 text-sm text-teal-800">
                          <li>• Stop if you feel sharp pain</li>
                          <li>• Maintain proper breathing throughout</li>
                          <li>• Move slowly and with control</li>
                          <li>• Consult your doctor before starting new exercises</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600">
                        Exercise reviewed and approved by certified physiotherapists
                      </p>
                      <Link
                        href="/auth/register"
                        className="inline-flex items-center px-6 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors duration-200"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Start Your Journey
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <div className="bg-linear-to-r from-teal-500 to-blue-500 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Start Your Recovery Journey?
            </h2>
            <p className="mb-6 opacity-90">
              Join thousands of patients who have improved their mobility with guided physiotherapy
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center px-6 py-3 bg-white text-teal-600 font-semibold rounded-lg hover:bg-slate-100 transition-colors duration-200"
            >
              Get Started Free
              <Play className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}