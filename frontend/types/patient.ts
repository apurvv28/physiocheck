export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth?: string
  conditions?: string[]
  assignedExercises: number
  lastSession?: string
  compliance: number
  status: 'active' | 'at_risk' | 'inactive'
  nextAppointment?: string
}
