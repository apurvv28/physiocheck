// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Types matching your database schema
export interface User {
  id: string
  email: string
  password_hash: string
  role: 'admin' | 'doctor' | 'patient' | 'public_user'
  created_at: string
}

export interface Doctor {
  id: string
  user_id: string
  full_name: string
  specialization?: string
}

export interface Patient {
  id: string
  user_id: string
  doctor_id: string
  full_name: string
  age?: number
  gender?: string
  diagnosis?: string
  created_at: string
  email?: string
  phone?: string
  date_of_birth?: string
  conditions?: string[]
  allergies?: string[]
  medications?: string[]
  emergency_contact?: string
  emergency_phone?: string
  notes?: string
  status?: 'active' | 'at_risk' | 'inactive'
  last_session_date?: string
  compliance_rate?: number
  assigned_exercises_count?: number
  next_appointment?: string
}

export interface ExerciseMaster {
  id: string
  name: string
  category: string
  description?: string
  reference_video_url?: string
  primary_joint: string
  angle_rules_json: Record<string, unknown>
  active: boolean
}

export interface AssignedExercise {
  id: string
  doctor_id: string
  patient_id: string
  exercise_id: string
  sets: number
  reps: number
  frequency: string
  start_date: string
  end_date?: string
  status: string
  created_at: string
}

export interface ExerciseSession {
  id: string
  patient_id: string
  exercise_id: string
  session_start: string
  session_end?: string
  total_reps: number
  correct_reps: number
  incorrect_reps: number
  accuracy_percent: number
  avg_rom: number
  notes?: string
}

export interface RepLog {
  id: string
  session_id: string
  rep_number: number
  rom_value?: number
  correctness?: boolean
  feedback?: string
  timestamp: string
}