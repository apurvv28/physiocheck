export interface Exercise {
  id: string
  name: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  bodyPart: string[]
  duration: number
  videoUrl?: string
  instructions: string[]
  equipment?: string[]
  precautions?: string[]
  benefits?: string[]
}

export interface AssignedExercise {
  id: string
  exerciseId: string
  patientId: string
  assignedBy: string
  assignedDate: string
  dueDate?: string
  sets: number
  reps: number
  frequency: string
  completed: boolean
  lastCompleted?: string
  progress: number
  notes?: string
}
