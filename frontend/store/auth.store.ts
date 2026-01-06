import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthUser {
  id: string
  email: string
  role: 'doctor' | 'patient'
  full_name: string
  avatar_url?: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  setToken: (token: string | null) => void
  setIsLoading: (isLoading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setIsLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
)