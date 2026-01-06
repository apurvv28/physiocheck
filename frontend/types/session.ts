import { PostureFeedback } from './websocket'

export interface Session {
  id: string
  exerciseId: string
  patientId: string
  startTime: string
  endTime?: string
  duration: number
  repCount: number
  correctReps: number
  accuracy: number
  postureFeedback: PostureFeedback[]
  doctorNotes?: string
}
