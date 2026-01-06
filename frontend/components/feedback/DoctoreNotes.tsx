'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, Edit2, Save, X, Clock, User,
  ThumbsUp, AlertCircle, TrendingUp, MessageSquare
} from 'lucide-react'
import { Card } from '@/components/cards/Card'
import { cn } from '@/lib/utils'

interface DoctorNote {
  id: string
  doctorName: string
  doctorId: string
  date: string
  content: string
  type: 'progress' | 'instruction' | 'concern' | 'encouragement'
  priority?: 'low' | 'medium' | 'high'
  read: boolean
  followUp?: string
}

interface DoctorNotesProps {
  notes: DoctorNote[]
  patientId: string
  patientName: string
  onAddNote?: (note: Omit<DoctorNote, 'id' | 'date' | 'read'>) => Promise<void>
  onEditNote?: (noteId: string, content: string) => Promise<void>
  onMarkAsRead?: (noteId: string) => Promise<void>
  className?: string
  isDoctor?: boolean
}

export function DoctorNotes({ 
  notes, 
  patientId, 
  patientName, 
  onAddNote, 
  onEditNote,
  onMarkAsRead,
  className,
  isDoctor = false
}: DoctorNotesProps) {
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [newNote, setNewNote] = useState({
    content: '',
    type: 'instruction' as DoctorNote['type'],
    priority: 'medium' as DoctorNote['priority']
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const noteTypeConfig = {
    progress: {
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'Progress Update'
    },
    instruction: {
      icon: <FileText className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      label: 'Instruction'
    },
    concern: {
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'text-coral-600',
      bgColor: 'bg-coral-50',
      borderColor: 'border-coral-200',
      label: 'Concern'
    },
    encouragement: {
      icon: <ThumbsUp className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      label: 'Encouragement'
    }
  }

  const priorityConfig = {
    low: {
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      label: 'Low'
    },
    medium: {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      label: 'Medium'
    },
    high: {
      color: 'text-coral-600',
      bgColor: 'bg-coral-100',
      label: 'High'
    }
  }

  const handleAddNote = async () => {
    if (!newNote.content.trim()) return

    setIsSubmitting(true)
    try {
      if (onAddNote) {
        await onAddNote({
          doctorName: 'Dr. Smith', // In real app, get from auth
          doctorId: 'doctor-123',
          content: newNote.content,
          type: newNote.type,
          priority: newNote.priority,
          followUp: undefined
        })
      }
      setNewNote({ content: '', type: 'instruction', priority: 'medium' })
      setIsAddingNote(false)
    } catch (error) {
      console.error('Error adding note:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditNote = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId)
    if (!note || !editingNoteId) return

    setIsSubmitting(true)
    try {
      if (onEditNote) {
        await onEditNote(noteId, note.content)
      }
      setEditingNoteId(null)
    } catch (error) {
      console.error('Error editing note:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const unreadNotes = notes.filter(note => !note.read).length

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Doctor's Notes</h2>
          <p className="text-slate-600">
            Communication with {isDoctor ? patientName : 'your doctor'}
          </p>
        </div>
        
        {isDoctor && (
          <button
            onClick={() => setIsAddingNote(true)}
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Add Note
          </button>
        )}
      </div>

      {/* Add Note Form */}
      {isAddingNote && isDoctor && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Add New Note</h3>
                <button
                  onClick={() => setIsAddingNote(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Note Type
                    </label>
                    <select
                      value={newNote.type}
                      onChange={(e) => setNewNote({ ...newNote, type: e.target.value as DoctorNote['type'] })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="instruction">Instruction</option>
                      <option value="progress">Progress Update</option>
                      <option value="concern">Concern</option>
                      <option value="encouragement">Encouragement</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={newNote.priority}
                      onChange={(e) => setNewNote({ ...newNote, priority: e.target.value as DoctorNote['priority'] })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Note Content
                  </label>
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    rows={4}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter your note for the patient..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsAddingNote(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={handleAddNote}
                    disabled={isSubmitting || !newNote.content.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Note
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Notes List */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <Card>
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No Notes Yet
              </h3>
              <p className="text-slate-600">
                {isDoctor 
                  ? `Add your first note for ${patientName}`
                  : 'Your doctor will add notes here'}
              </p>
            </div>
          </Card>
        ) : (
          notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={cn(
                "border-l-4",
                noteTypeConfig[note.type].borderColor.replace('border-', 'border-l-'),
                !note.read && "bg-blue-50/50"
              )}>
                <div className="p-6">
                  {/* Note Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        noteTypeConfig[note.type].bgColor,
                        noteTypeConfig[note.type].color
                      )}>
                        {noteTypeConfig[note.type].icon}
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-slate-900">
                            {noteTypeConfig[note.type].label}
                          </h3>
                          {note.priority && (
                            <span className={cn(
                              "px-2 py-1 text-xs rounded-full",
                              priorityConfig[note.priority].bgColor,
                              priorityConfig[note.priority].color
                            )}>
                              {priorityConfig[note.priority].label} Priority
                            </span>
                          )}
                          {!note.read && (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                              New
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            <span>{note.doctorName}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{formatDate(note.date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {isDoctor && (
                      <button
                        onClick={() => setEditingNoteId(editingNoteId === note.id ? null : note.id)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                      >
                        <Edit2 className="w-5 h-5 text-slate-400" />
                      </button>
                    )}
                  </div>

                  {/* Note Content */}
                  {editingNoteId === note.id ? (
                    <div className="space-y-4">
                      <textarea
                        value={note.content}
                        onChange={(e) => {
                          const updatedNotes = notes.map(n => 
                            n.id === note.id ? { ...n, content: e.target.value } : n
                          )
                          // In real app, update state via props
                        }}
                        rows={4}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEditNote(note.id)}
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors duration-200"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-700 whitespace-pre-wrap mb-4">
                        {note.content}
                      </p>
                      
                      {note.followUp && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-sm text-amber-800">
                            <span className="font-medium">Follow-up needed:</span> {note.followUp}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Actions */}
                  {!isDoctor && !note.read && onMarkAsRead && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => onMarkAsRead(note.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark as read
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Stats Summary */}
      {notes.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Notes Summary</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {notes.length}
                </div>
                <div className="text-sm text-slate-700">Total Notes</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {unreadNotes}
                </div>
                <div className="text-sm text-blue-700">Unread</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {notes.filter(n => n.type === 'progress').length}
                </div>
                <div className="text-sm text-green-700">Progress Updates</div>
              </div>
              
              <div className="text-center p-4 bg-coral-50 rounded-lg">
                <div className="text-2xl font-bold text-coral-600 mb-1">
                  {notes.filter(n => n.type === 'concern').length}
                </div>
                <div className="text-sm text-coral-700">Concerns</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}