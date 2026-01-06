'use client'

import { motion } from 'framer-motion'
import { Target, Clock, Activity, Play, ChevronRight, Check } from 'lucide-react'
import { Card } from './Card'
import { cn } from '@/lib/utils'

interface ExerciseCardProps {
  exercise: {
    id: string
    name: string
    description: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    duration: number
    bodyPart: string[]
    equipment: string[]
  }
  isPublic?: boolean
  selectable?: boolean
  selected?: boolean
  onSelect?: () => void
  onClick?: () => void
}

export function ExerciseCard({ 
  exercise, 
  isPublic = false, 
  selectable = false,
  selected = false,
  onSelect,
  onClick 
}: ExerciseCardProps) {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-coral-100 text-coral-800',
  }

  return (
    <Card 
      hoverable={!selectable} 
      className={cn(
        selectable && 'cursor-pointer',
        selected && 'ring-2 ring-teal-500'
      )}
      onClick={selectable ? onSelect : onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{exercise.name}</h3>
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                {exercise.description}
              </p>
            </div>
          </div>
          
          {selectable ? (
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              selected 
                ? 'bg-teal-500 border-teal-500' 
                : 'border-slate-300'
            }`}>
              {selected && <Check className="w-4 h-4 text-white" />}
            </div>
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 text-xs rounded-full ${difficultyColors[exercise.difficulty]}`}>
            {exercise.difficulty}
          </span>
          {exercise.bodyPart.slice(0, 2).map((part) => (
            <span key={part} className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
              {part}
            </span>
          ))}
          {exercise.bodyPart.length > 2 && (
            <span className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
              +{exercise.bodyPart.length - 2}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{exercise.duration} min</span>
            </div>
            <div className="flex items-center space-x-1">
              <Activity className="w-4 h-4" />
              <span>{exercise.equipment.length > 0 ? exercise.equipment.join(', ') : 'No equipment'}</span>
            </div>
          </div>
          
          {!isPublic && !selectable && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors duration-200"
            >
              <Play className="w-4 h-4 mr-2" />
              Start
            </motion.button>
          )}
        </div>
      </div>
    </Card>
  )
}