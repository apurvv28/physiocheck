export interface AuthUser {
  id: string
  email: string
  role: 'doctor' | 'patient'
  full_name: string
  avatar_url?: string
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
}
