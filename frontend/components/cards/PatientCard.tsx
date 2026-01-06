'use client'

import { motion } from 'framer-motion'
import { User, Phone, Mail, Calendar, Activity, ChevronRight, Clock } from 'lucide-react'
import { Card } from './Card'
import { ProgressRing } from '../charts/ProgressRing'
import Link from 'next/link'

interface PatientCardProps {
  patient: {
    id: string
    name: string
    email: string
    phone: string
    lastSession: string
    compliance: number
    status: 'active' | 'at_risk' | 'inactive'
    assignedExercises: number
    nextAppointment?: string
  }
}

export function PatientCard({ patient }: PatientCardProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    at_risk: 'bg-coral-100 text-coral-800',
    inactive: 'bg-slate-100 text-slate-800',
  }

  const statusLabels = {
    active: 'Active',
    at_risk: 'At Risk',
    inactive: 'Inactive',
  }

  return (
    <Card hoverable>
      <Link href={`/doctor/patients/${patient.id}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                <User className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{patient.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${statusColors[patient.status]}`}>
                  {statusLabels[patient.status]}
                </span>
              </div>
            </div>
            <motion.div
              whileHover={{ x: 2 }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            >
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </motion.div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Mail className="w-4 h-4" />
              <span className="truncate">{patient.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Phone className="w-4 h-4" />
              <span>{patient.phone}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {patient.assignedExercises}
              </div>
              <div className="flex items-center justify-center space-x-1 text-sm text-slate-600">
                <Activity className="w-4 h-4" />
                <span>Exercises</span>
              </div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <ProgressRing
                  value={patient.compliance}
                  size={60}
                  strokeWidth={4}
                />
              </div>
              <div className="text-sm text-slate-600">Compliance</div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>Last session</span>
              </div>
              <span className="font-medium text-slate-900">{patient.lastSession}</span>
            </div>
            {patient.nextAppointment && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>Next appointment</span>
                </div>
                <span className="font-medium text-green-700">{patient.nextAppointment}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </Card>
  )
}