'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { 
  User, Mail, Phone, Calendar, Activity, 
  AlertCircle, FileText, Plus, X 
} from 'lucide-react'
import { Card } from '@/components/cards/Card'

interface PatientFormData {
  name: string
  email: string
  phone: string
  dateOfBirth?: string
  conditions: string[]
  notes?: string
}

interface PatientFormProps {
  onSubmit: (data: PatientFormData) => Promise<void>
  initialData?: Partial<PatientFormData>
  isLoading?: boolean
}

export function PatientForm({ onSubmit, initialData, isLoading }: PatientFormProps) {
  const [conditions, setConditions] = useState<string[]>(initialData?.conditions || [])
  const [newCondition, setNewCondition] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<PatientFormData>({
    defaultValues: initialData
  })

  const handleAddCondition = () => {
    if (newCondition.trim() && !conditions.includes(newCondition.trim())) {
      setConditions([...conditions, newCondition.trim()])
      setNewCondition('')
    }
  }

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  const onSubmitForm = async (data: PatientFormData) => {
    await onSubmit({
      ...data,
      conditions
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Patient Information
          </h2>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('name', { required: 'Name is required' })}
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-coral-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-coral-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone & Date of Birth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    {...register('phone', { required: 'Phone number is required' })}
                    type="tel"
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-coral-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    {...register('dateOfBirth')}
                    type="date"
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Medical Conditions */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Medical Information
          </h2>

          <div className="space-y-6">
            {/* Conditions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-slate-900 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-teal-600" />
                  Medical Conditions
                </h3>
                <span className="text-sm text-slate-500">
                  {conditions.length} conditions
                </span>
              </div>

              {/* Add Condition */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCondition()}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g., Arthritis, Previous knee surgery"
                />
                <button
                  type="button"
                  onClick={handleAddCondition}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Conditions List */}
              <div className="space-y-2">
                {conditions.map((condition, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-teal-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-teal-500 mr-3" />
                      <span className="text-sm text-teal-800">{condition}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(index)}
                      className="p-1 hover:bg-teal-100 rounded"
                    >
                      <X className="w-4 h-4 text-teal-600" />
                    </button>
                  </div>
                ))}
                {conditions.length === 0 && (
                  <div className="text-center py-6">
                    <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No conditions added</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Add relevant medical conditions for better care planning
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="font-medium text-slate-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Additional Notes
              </h3>
              <textarea
                {...register('notes')}
                rows={4}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter any additional notes about the patient's condition, treatment history, or special requirements..."
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Important Notes */}
      <Card className="bg-coral-50 border-coral-100">
        <div className="p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-coral-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-coral-900 mb-2">
                Important Information
              </h3>
              <ul className="space-y-2 text-sm text-coral-800">
                <li>• All fields marked with * are required</li>
                <li>• Ensure email and phone number are accurate for communication</li>
                <li>• List all relevant medical conditions for proper exercise planning</li>
                <li>• Review patient information before submitting</li>
              </ul>
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
              {initialData ? 'Updating...' : 'Creating...'}
            </div>
          ) : initialData ? 'Update Patient' : 'Create Patient'}
        </motion.button>
      </div>
    </form>
  )
}