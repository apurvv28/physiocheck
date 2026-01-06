'use client'

import { createContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { AnimatedLoader } from '@/components/loaders/AnimatedLoader'

export interface AuthContextType {
  user: User | null
  role: string | null
  isLoading: boolean
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        const userRole = session.user.user_metadata?.role || 'patient'
        setRole(userRole)

        if (['/login', '/register', '/forgot-password'].includes(pathname)) {
          router.push(
            userRole === 'doctor'
              ? '/doctor/dashboard'
              : '/patient/dashboard'
          )
        }
      } else {
        setUser(null)
        setRole(null)

        const publicRoutes = [
          '/',
          '/login',
          '/register',
          '/forgot-password',
          '/public/exercises',
        ]

        if (!publicRoutes.includes(pathname)) {
          router.push('/login')
        }
      }

      setIsLoading(false)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        setRole(session.user.user_metadata?.role || 'patient')
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [pathname, router])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login') // ✅ CORRECT
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedLoader message="Loading your session..." />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, role, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
