'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { 
  Calendar, Clock, Target, Activity, 
  TrendingUp, FileText, CheckCircle, AlertCircle 
} from 'lucide-react'
import { Card } from '@/components/cards/Card'

interface SessionFormData {
  patientId: string
  exerciseId: string
  date: string
  duration: number
  sets: number
  reps: number
  frequency: string
  startDate: string
  endDate?: string
  notes?: string
}

interface SessionFormProps {
  patients: Array<{ id: string; name: string }>
  exercises: Array<{ id: string; name: string; difficulty: string }>
  onSubmit: (data: SessionFormData) => Promise<void>
  initialData?: Partial<SessionFormData>
  isLoading?: boolean
}

export function SessionForm({ patients, exercises, onSubmit, initialData, isLoading }: SessionFormProps) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<SessionFormData>({
    defaultValues: initialData
  })

  const [frequency, setFrequency] = useState(initialData?.frequency || 'daily')

  const onSubmitForm = async (data: SessionFormData) => {
    await onSubmit({
      ...data,
      frequency
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Exercise Assignment
          </h2>

          <div className="space-y-4">
            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Patient *
              </label>
              <select
                {...register('patientId', { required: 'Patient is required' })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Choose a patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
              {errors.patientId && (
                <p className="mt-1 text-sm text-coral-600">{errors.patientId.message}</p>
              )}
            </div>

            {/* Exercise Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Exercise *
              </label>
              <select
                {...register('exerciseId', { required: 'Exercise is required' })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Choose an exercise</option>
                {exercises.map(exercise => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name} ({exercise.difficulty})
                  </option>
                ))}
              </select>
              {errors.exerciseId && (
                <p className="mt-1 text-sm text-coral-600">{errors.exerciseId.message}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Exercise Parameters */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Exercise Parameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sets & Reps */}
            <div>
              <h3 className="font-medium text-slate-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-teal-600" />
                Sets & Reps
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Sets
                  </label>
                  <input
                    {...register('sets', { 
                      required: 'Sets is required',
                      min: { value: 1, message: 'Minimum 1 set' },
                      max: { value: 10, message: 'Maximum 10 sets' }
                    })}
                    type="number"
                    min="1"
                    max="10"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  {errors.sets && (
                    <p className="mt-1 text-sm text-coral-600">{errors.sets.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Reps per Set
                  </label>
                  <input
                    {...register('reps', { 
                      required: 'Reps is required',
                      min: { value: 1, message: 'Minimum 1 rep' },
                      max: { value: 50, message: 'Maximum 50 reps' }
                    })}
                    type="number"
                    min="1"
                    max="50"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  {errors.reps && (
                    <p className="mt-1 text-sm text-coral-600">{errors.reps.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Duration & Frequency */}
            <div>
              <h3 className="font-medium text-slate-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Schedule
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    {...register('duration', { 
                      required: 'Duration is required',
                      min: { value: 1, message: 'Minimum 1 minute' },
                      max: { value: 60, message: 'Maximum 60 minutes' }
                    })}
                    type="number"
                    min="1"
                    max="60"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-coral-600">{errors.duration.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="every_other_day">Every Other Day</option>
                    <option value="twice_weekly">Twice Weekly</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h3 className="font-medium text-slate-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-600" />
                Date Range
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    {...register('startDate', { required: 'Start date is required' })}
                    type="date"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-coral-600">{errors.startDate.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    {...register('endDate')}
                    type="date"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Notes */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-purple-600" />
            Additional Instructions & Notes
          </h2>
          
          <div className="space-y-4">
            <textarea
              {...register('notes')}
              rows={4}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Enter any special instructions, precautions, or notes for the patient..."
            />
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-800">
                <span className="font-medium">Tip:</span> Include specific guidance on form, breathing techniques, 
                or modifications based on the patient`s condition.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Assignment Summary
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Sets</span>
                <span className="font-medium text-slate-900">{watch('sets') || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Reps</span>
                <span className="font-medium text-slate-900">
                  {(watch('sets') || 0) * (watch('reps') || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Estimated Time</span>
                <span className="font-medium text-slate-900">{watch('duration') || 0} min</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Frequency</span>
                <span className="font-medium text-slate-900 capitalize">
                  {frequency.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Start Date</span>
                <span className="font-medium text-slate-900">{watch('startDate') || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">End Date</span>
                <span className="font-medium text-slate-900">{watch('endDate') || 'Ongoing'}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors duration-200"
        >
          Cancel
        </button>
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Assigning Exercise...
            </div>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2 inline" />
              Assign Exercise
            </>
          )}
        </motion.button>
      </div>
    </form>
  )
}