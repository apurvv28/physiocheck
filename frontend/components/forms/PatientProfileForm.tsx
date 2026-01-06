'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { 
  User, Mail, Phone, Calendar, Camera,
  MapPin, Activity, AlertCircle, Save, X
} from 'lucide-react'
import { Card } from '@/components/cards/Card'

interface PatientProfileFormData {
  name: string
  email: string
  phone: string
  avatar?: string
  dateOfBirth?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  emergencyContact?: string
  emergencyPhone?: string
  height?: number
  weight?: number
  conditions: string[]
  medications: string[]
  allergies: string[]
}

interface PatientProfileFormProps {
  onSubmit: (data: PatientProfileFormData) => Promise<void>
  initialData?: Partial<PatientProfileFormData>
  isLoading?: boolean
}

export function PatientProfileForm({ onSubmit, initialData, isLoading }: PatientProfileFormProps) {
  const [avatar, setAvatar] = useState<string | null>(initialData?.['avatar'] as string || null)
  const [conditions, setConditions] = useState<string[]>(initialData?.conditions || [])
  const [medications, setMedications] = useState<string[]>(initialData?.medications || [])
  const [allergies, setAllergies] = useState<string[]>(initialData?.allergies || [])
  const [newItem, setNewItem] = useState({ type: '', value: '' })

  const { register, handleSubmit, formState: { errors } } = useForm<PatientProfileFormData>({
    defaultValues: initialData
  })

  const handleAddItem = () => {
    if (!newItem.type || !newItem.value.trim()) return

    const trimmedValue = newItem.value.trim()
    
    switch (newItem.type) {
      case 'condition':
        if (!conditions.includes(trimmedValue)) {
          setConditions([...conditions, trimmedValue])
        }
        break
      case 'medication':
        if (!medications.includes(trimmedValue)) {
          setMedications([...medications, trimmedValue])
        }
        break
      case 'allergy':
        if (!allergies.includes(trimmedValue)) {
          setAllergies([...allergies, trimmedValue])
        }
        break
    }

    setNewItem({ type: '', value: '' })
  }

  const handleRemoveItem = (type: string, index: number) => {
    switch (type) {
      case 'condition':
        setConditions(conditions.filter((_, i) => i !== index))
        break
      case 'medication':
        setMedications(medications.filter((_, i) => i !== index))
        break
      case 'allergy':
        setAllergies(allergies.filter((_, i) => i !== index))
        break
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmitForm = async (data: PatientProfileFormData) => {
    await onSubmit({
      ...data,
      conditions,
      medications,
      allergies
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Profile Header */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-6 md:space-y-0 md:space-x-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-16 h-16 text-slate-400" />
                  </div>
                )}
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center cursor-pointer hover:bg-black/70 transition-colors duration-200"
                >
                  <Camera className="w-4 h-4 inline mr-1" />
                  Change
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Click to upload profile picture
              </p>
            </div>

            {/* Personal Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Personal Information
              </h2>
              <p className="text-slate-600 mb-6">
                Keep your information up to date for better care
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Basic Information */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Phone */}
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

            {/* Date of Birth */}
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

            {/* Height & Weight */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Height (cm)
              </label>
              <input
                {...register('height', { min: 50, max: 250 })}
                type="number"
                min="50"
                max="250"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="175"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Weight (kg)
              </label>
              <input
                {...register('weight', { min: 20, max: 300 })}
                type="number"
                min="20"
                max="300"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="70"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Address Information */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            Address Information
          </h3>

          <div className="space-y-4">
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Street Address
              </label>
              <input
                {...register('address')}
                type="text"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="123 Main St"
              />
            </div>

            {/* City, State, ZIP */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  City
                </label>
                <input
                  {...register('city')}
                  type="text"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="New York"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  State
                </label>
                <input
                  {...register('state')}
                  type="text"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="NY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ZIP Code
                </label>
                <input
                  {...register('zipCode')}
                  type="text"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="10001"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Medical Information */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-teal-600" />
            Medical Information
          </h3>

          <div className="space-y-6">
            {/* Add Medical Item */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                  className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Select type</option>
                  <option value="condition">Medical Condition</option>
                  <option value="medication">Medication</option>
                  <option value="allergy">Allergy</option>
                </select>
                
                <input
                  type="text"
                  value={newItem.value}
                  onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                  className="col-span-2 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter item (e.g., Arthritis, Ibuprofen, Peanuts)"
                />
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
              >
                Add Medical Information
              </button>
            </div>

            {/* Medical Lists Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Conditions */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Medical Conditions</h4>
                <div className="space-y-2">
                  {conditions.map((condition, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-teal-50 rounded-lg"
                    >
                      <span className="text-sm text-teal-800">{condition}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem('condition', index)}
                        className="p-1 hover:bg-teal-100 rounded"
                      >
                        <X className="w-3 h-3 text-teal-600" />
                      </button>
                    </div>
                  ))}
                  {conditions.length === 0 && (
                    <p className="text-sm text-slate-500 italic">No conditions listed</p>
                  )}
                </div>
              </div>

              {/* Medications */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Medications</h4>
                <div className="space-y-2">
                  {medications.map((medication, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-blue-50 rounded-lg"
                    >
                      <span className="text-sm text-blue-800">{medication}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem('medication', index)}
                        className="p-1 hover:bg-blue-100 rounded"
                      >
                        <X className="w-3 h-3 text-blue-600" />
                      </button>
                    </div>
                  ))}
                  {medications.length === 0 && (
                    <p className="text-sm text-slate-500 italic">No medications listed</p>
                  )}
                </div>
              </div>

              {/* Allergies */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Allergies</h4>
                <div className="space-y-2">
                  {allergies.map((allergy, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-coral-50 rounded-lg"
                    >
                      <span className="text-sm text-coral-800">{allergy}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem('allergy', index)}
                        className="p-1 hover:bg-coral-100 rounded"
                      >
                        <X className="w-3 h-3 text-coral-600" />
                      </button>
                    </div>
                  ))}
                  {allergies.length === 0 && (
                    <p className="text-sm text-slate-500 italic">No allergies listed</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Emergency Contact
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Emergency Contact Name
              </label>
              <input
                {...register('emergencyContact')}
                type="text"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Jane Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Emergency Contact Phone
              </label>
              <input
                {...register('emergencyPhone')}
                type="tel"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="+1 (555) 987-6543"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Important Notice */}
      <Card className="bg-coral-50 border-coral-100">
        <div className="p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-coral-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-coral-900 mb-2">
                Important Information
              </h3>
              <ul className="space-y-2 text-sm text-coral-800">
                <li>• Keep your medical information up to date for safe treatment</li>
                <li>• List all medications and allergies to avoid complications</li>
                <li>• Emergency contact information is crucial for your safety</li>
                <li>• This information is confidential and only visible to your healthcare team</li>
              </ul>
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
          className="inline-flex items-center px-8 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving Changes...
            </div>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save Profile
            </>
          )}
        </motion.button>
      </div>
    </form>
  )
}