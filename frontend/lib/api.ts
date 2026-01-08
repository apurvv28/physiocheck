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
            console.warn('Unauthorized - clearing session and redirecting')
            await supabase.auth.signOut().catch(console.error)
            if (typeof window !== 'undefined') {
                localStorage.clear()
                sessionStorage.clear()
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export const apiEndpoints = {
    auth: {
        login: '/login',
        register: '/register',
    },
    sessions: {
        create: '/sessions',
        update: (id: string) => `/sessions/${id}`,
        get: (id: string) => `/sessions/${id}`,
    },
    doctor: {
        dashboard: {
            stats: '/doctor/dashboard/stats',
            activeSessions: '/doctor/sessions/active',
        },
        sessions: {
            monitor: (patientId: string) => {
                const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
                return `ws://${host}:8000/api/v1/ws/doctor/monitor/${patientId}`
            },
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
