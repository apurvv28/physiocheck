'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, User, Phone, Mail, Calendar, Activity, MoreVertical } from 'lucide-react'
import { Card } from '@/components/cards/Card'
import { PatientCard } from '@/components/cards/PatientCard'
import { AnimatedLoader } from '@/components/loaders/AnimatedLoader'
import { api, apiEndpoints } from '@/lib/api'

interface Patient {
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

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await api.get(apiEndpoints.doctor.patients.list)
      const data = response.data
      
      // Map backend data to frontend Patient interface
      const mappedPatients: Patient[] = data.map((p: any) => ({
        id: p.id,
        name: p.full_name,
        email: p.email || '',
        phone: p.user_id ? 'N/A' : '', // Phone not usually in basic user record
        lastSession: 'No sessions yet', // Placeholder as list endpoint doesn't return this
        compliance: 0, // Placeholder
        status: 'active', // Default status
        assignedExercises: 0, // Placeholder
        nextAppointment: undefined
      }))
      
      setPatients(mappedPatients)
    } catch (error) {
       // eslint-disable-next-line no-console
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = statusFilter === 'all' || patient.status === statusFilter
    return matchesSearch && matchesFilter
  })

  const statusCounts = {
    all: patients.length,
    active: patients.filter(p => p.status === 'active').length,
    at_risk: patients.filter(p => p.status === 'at_risk').length,
    inactive: patients.filter(p => p.status === 'inactive').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <AnimatedLoader message="Loading patients..." />
      </div>
    )
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Patient Management</h1>
          <p className="text-slate-600 mt-2">
            Monitor and manage your patient`s rehabilitation programs
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
                    placeholder="Search patients by name or email..."
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
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="at_risk">At Risk</option>
                      <option value="inactive">Inactive</option>
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
                  {patients.length}
                </div>
                <p className="text-sm text-slate-600">Total Patients</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Status Tabs */}
        <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All Patients', count: statusCounts.all, color: 'slate' },
            { id: 'active', label: 'Active', count: statusCounts.active, color: 'teal' },
            { id: 'at_risk', label: 'At Risk', count: statusCounts.at_risk, color: 'coral' },
            { id: 'inactive', label: 'Inactive', count: statusCounts.inactive, color: 'slate' },
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

        {/* Patients Grid */}
        <AnimatePresence mode="wait">
          {filteredPatients.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No patients found</p>
              <p className="text-sm text-slate-500 mt-2">
                Try adjusting your search or filter criteria
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="patients"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPatients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PatientCard patient={patient} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}