// src/context/authContext.tsx
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Session, User } from '@supabase/supabase-js'

interface AppUser {
  id: string
  email: string
  fullName?: string
}

type AuthContextType = {
  user: AppUser | null
  session: Session | null
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({
  children,
  initialSession = null,
}: {
  children: ReactNode
  initialSession?: Session | null
}) => {
  const [session, setSession] = useState<Session | null>(initialSession)
  const [user, setUser] = useState<AppUser | null>(null)

  // helper: fetch profile
  const fetchUserProfile = async (authUser: User | null) => {
    if (!authUser) {
      setUser(null)
      return
    }
    const { data: profile, error } = await supabase
      .from('users')
      .select('id, email, fullName')
      .eq('id', authUser.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      setUser({ id: authUser.id, email: authUser.email ?? '' })
    } else {
      setUser(profile)
    }
  }

  useEffect(() => {
    if (initialSession?.user) {
      fetchUserProfile(initialSession.user)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      fetchUserProfile(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [initialSession])

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        fullName,
      })
      await fetchUserProfile(data.user)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    if (data.user) await fetchUserProfile(data.user)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
