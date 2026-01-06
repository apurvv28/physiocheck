'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { 
  Target, Clock, Activity, Users, 
  Plus, X, AlertCircle, CheckCircle 
} from 'lucide-react'
import { Card } from '@/components/cards/Card'

interface ExerciseFormData {
  name: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  bodyParts: string[]
  equipment: string[]
  instructions: string[]
  precautions: string[]
  benefits: string[]
  videoUrl?: string
}

interface ExerciseFormProps {
  onSubmit: (data: ExerciseFormData) => Promise<void>
  initialData?: Partial<ExerciseFormData>
  isLoading?: boolean
}

export function ExerciseForm({ onSubmit, initialData, isLoading }: ExerciseFormProps) {
  const [bodyParts, setBodyParts] = useState<string[]>(initialData?.bodyParts || [])
  const [equipment, setEquipment] = useState<string[]>(initialData?.equipment || [])
  const [instructions, setInstructions] = useState<string[]>(initialData?.instructions || [])
  const [precautions, setPrecautions] = useState<string[]>(initialData?.precautions || [])
  const [benefits, setBenefits] = useState<string[]>(initialData?.benefits || [])
  const [newItem, setNewItem] = useState({ type: '', value: '' })

  const { register, handleSubmit, formState: { errors } } = useForm<ExerciseFormData>({
    defaultValues: initialData
  })

  const handleAddItem = () => {
    if (!newItem.type || !newItem.value.trim()) return

    const trimmedValue = newItem.value.trim()
    
    switch (newItem.type) {
      case 'bodyPart':
        if (!bodyParts.includes(trimmedValue)) {
          setBodyParts([...bodyParts, trimmedValue])
        }
        break
      case 'equipment':
        if (!equipment.includes(trimmedValue)) {
          setEquipment([...equipment, trimmedValue])
        }
        break
      case 'instruction':
        setInstructions([...instructions, trimmedValue])
        break
      case 'precaution':
        setPrecautions([...precautions, trimmedValue])
        break
      case 'benefit':
        setBenefits([...benefits, trimmedValue])
        break
    }

    setNewItem({ type: '', value: '' })
  }

  const handleRemoveItem = (type: string, index: number) => {
    switch (type) {
      case 'bodyPart':
        setBodyParts(bodyParts.filter((_, i) => i !== index))
        break
      case 'equipment':
        setEquipment(equipment.filter((_, i) => i !== index))
        break
      case 'instruction':
        setInstructions(instructions.filter((_, i) => i !== index))
        break
      case 'precaution':
        setPrecautions(precautions.filter((_, i) => i !== index))
        break
      case 'benefit':
        setBenefits(benefits.filter((_, i) => i !== index))
        break
    }
  }

  const onSubmitForm = async (data: ExerciseFormData) => {
    await onSubmit({
      ...data,
      bodyParts,
      equipment,
      instructions,
      precautions,
      benefits
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Exercise Details
          </h2>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Exercise Name *
              </label>
              <input
                {...register('name', { required: 'Exercise name is required' })}
                type="text"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="e.g., Shoulder Range of Motion"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-coral-600">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={3}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Describe the exercise and its benefits..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-coral-600">{errors.description.message}</p>
              )}
            </div>

            {/* Difficulty & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Difficulty *
                </label>
                <select
                  {...register('difficulty', { required: 'Difficulty is required' })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Select difficulty</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                {errors.difficulty && (
                  <p className="mt-1 text-sm text-coral-600">{errors.difficulty.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Duration (minutes) *
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
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Video URL (Optional)
              </label>
              <input
                {...register('videoUrl')}
                type="url"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="https://example.com/video.mp4"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Dynamic Lists */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Exercise Details
          </h2>

          {/* Add Item Form */}
          <div className="bg-slate-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Select type</option>
                <option value="bodyPart">Body Part</option>
                <option value="equipment">Equipment</option>
                <option value="instruction">Instruction</option>
                <option value="precaution">Precaution</option>
                <option value="benefit">Benefit</option>
              </select>
              
              <input
                type="text"
                value={newItem.value}
                onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                className="col-span-2 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter item..."
              />
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </button>
          </div>

          {/* Lists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Body Parts */}
            <div>
              <h3 className="font-medium text-slate-900 mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-teal-600" />
                Body Parts
              </h3>
              <div className="space-y-2">
                {bodyParts.map((part, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-teal-50 rounded-lg"
                  >
                    <span className="text-sm text-teal-800">{part}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('bodyPart', index)}
                      className="p-1 hover:bg-teal-100 rounded"
                    >
                      <X className="w-3 h-3 text-teal-600" />
                    </button>
                  </div>
                ))}
                {bodyParts.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No body parts added</p>
                )}
              </div>
            </div>

            {/* Equipment */}
            <div>
              <h3 className="font-medium text-slate-900 mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2 text-blue-600" />
                Equipment
              </h3>
              <div className="space-y-2">
                {equipment.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-blue-50 rounded-lg"
                  >
                    <span className="text-sm text-blue-800">{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('equipment', index)}
                      className="p-1 hover:bg-blue-100 rounded"
                    >
                      <X className="w-3 h-3 text-blue-600" />
                    </button>
                  </div>
                ))}
                {equipment.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No equipment added</p>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="md:col-span-2 lg:col-span-1">
              <h3 className="font-medium text-slate-900 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-green-600" />
                Instructions
              </h3>
              <div className="space-y-2">
                {instructions.map((instruction, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-2 bg-green-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <span className="text-sm text-green-800">{index + 1}. {instruction}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('instruction', index)}
                      className="p-1 hover:bg-green-100 rounded ml-2 flex-shrink-0"
                    >
                      <X className="w-3 h-3 text-green-600" />
                    </button>
                  </div>
                ))}
                {instructions.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No instructions added</p>
                )}
              </div>
            </div>

            {/* Precautions */}
            <div>
              <h3 className="font-medium text-slate-900 mb-3 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-coral-600" />
                Precautions
              </h3>
              <div className="space-y-2">
                {precautions.map((precaution, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-2 bg-coral-50 rounded-lg"
                  >
                    <span className="text-sm text-coral-800">{precaution}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('precaution', index)}
                      className="p-1 hover:bg-coral-100 rounded"
                    >
                      <X className="w-3 h-3 text-coral-600" />
                    </button>
                  </div>
                ))}
                {precautions.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No precautions added</p>
                )}
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="font-medium text-slate-900 mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-purple-600" />
                Benefits
              </h3>
              <div className="space-y-2">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-2 bg-purple-50 rounded-lg"
                  >
                    <span className="text-sm text-purple-800">{benefit}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('benefit', index)}
                      className="p-1 hover:bg-purple-100 rounded"
                    >
                      <X className="w-3 h-3 text-purple-600" />
                    </button>
                  </div>
                ))}
                {benefits.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No benefits added</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
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
              Saving...
            </div>
          ) : initialData ? 'Update Exercise' : 'Create Exercise'}
        </motion.button>
      </div>
    </form>
  )
}