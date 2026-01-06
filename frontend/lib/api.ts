import axios from 'axios'
import { supabase } from './supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await supabase.auth.signOut()
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

export const apiEndpoints = {
  doctor: {
    dashboard: {
      stats: '/doctor/dashboard/stats',
      activeSessions: '/doctor/sessions/active',
    },
    sessions: {
      monitor: (patientId: string) => `ws://localhost:8000/ws/doctor/monitor/${patientId}`,
    },
    patients: {
      list: '/doctor/patients',
      create: '/doctor/create_patient',
      details: (id: string) => `/doctor/patients/${id}`,
      exercises: (id: string) => `/doctor/patients/${id}/exercises`,
      stats: (id: string) => `/doctor/patients/${id}/stats`,
    },
  },
  patient: {
    dashboard: {
      stats: '/patient/dashboard/stats',
    },
    session: {
      history: '/patient/session/history',
    },
    exercises: {
      list: '/patient/my_exercises',
    }
  },
  exercises: {
    list: '/exercises',
    details: (id: string) => `/exercises/${id}`,
  },
}