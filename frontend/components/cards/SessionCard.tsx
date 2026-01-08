'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Clock, Target, TrendingUp, User, MoreVertical, Video } from 'lucide-react'
import { Card } from './Card'
import { cn } from '@/lib/utils'

interface SessionCardProps {
  session: {
    id: string
    patientName: string
    exerciseName: string
    date: string
    duration: number
    accuracy: number
    reps: number
    status: 'completed' | 'in_progress' | 'missed'
  }
}

export function SessionCard({ session }: SessionCardProps) {
  const statusConfig = {
    completed: {
      color: 'bg-green-100 text-green-800',
      icon: <Target className="w-4 h-4" />,
      label: 'Completed'
    },
    in_progress: {
      color: 'bg-blue-100 text-blue-800',
      icon: <Clock className="w-4 h-4" />,
      label: 'In Progress'
    },
    missed: {
      color: 'bg-coral-100 text-coral-800',
      icon: <Calendar className="w-4 h-4" />,
      label: 'Missed'
    }
  }

  const config = statusConfig[session.status]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card hoverable>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
              <User className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{session.patientName}</h3>
              <p className="text-sm text-slate-600">{session.exerciseName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {session.status === 'in_progress' && (
               <Link 
                 href={`/doctor/sessions/live/${session.id}`}
                 className="flex items-center space-x-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition"
               >
                 <Video className="w-3 h-3" />
                 <span>Join</span>
               </Link>
            )}
            <span className={`px-3 py-1 text-xs rounded-full flex items-center space-x-1 ${config.color}`}>
              {config.icon}
              <span>{config.label}</span>
            </span>
            <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors duration-200">
              <MoreVertical className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-slate-600 mb-1">Date</div>
            <div className="flex items-center justify-center space-x-1">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-slate-900">{formatDate(session.date)}</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-slate-600 mb-1">Duration</div>
            <div className="flex items-center justify-center space-x-1">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-slate-900">{session.duration}m</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-slate-600 mb-1">Accuracy</div>
            <div className="flex items-center justify-center space-x-1">
              <Target className="w-4 h-4 text-slate-400" />
              <span className={cn(
                "font-medium",
                session.accuracy >= 90 ? "text-green-600" :
                session.accuracy >= 75 ? "text-yellow-600" : "text-coral-600"
              )}>
                {session.accuracy}%
              </span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-slate-600 mb-1">Total Reps</div>
            <div className="flex items-center justify-center space-x-1">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-slate-900">{session.reps}</span>
            </div>
          </div>
        </div>

        {session.status === 'completed' && session.accuracy < 75 && (
          <div className="mt-4 p-3 bg-coral-50 border border-coral-100 rounded-lg">
            <p className="text-sm text-coral-800">
              <span className="font-medium">Note:</span> Patient struggled with form. Consider adjusting exercise difficulty or scheduling a follow-up.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}