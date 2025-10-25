// src/contexts/AuthContext.tsx
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { auth } from '@/firebase/config'
import { userService } from '@/firebase/users'
import { User } from '@/types'
import firebase from 'firebase/app'

interface AuthContextType {
  user: User | null
  firebaseUser: firebase.User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  isAdmin: boolean
  isActive: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<firebase.User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Só executar no cliente
    if (typeof window === 'undefined' || !auth) {
      setLoading(false)
      return
    }

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setFirebaseUser(firebaseUser)
      
      if (firebaseUser) {
        // Buscar dados do usuário no Firestore
        const userData = await userService.getUserById(firebaseUser.uid)
        
        if (!userData) {
          // Se não existir, criar usuário básico (para primeiro login)
          const newUser = await userService.createUser(
            firebaseUser.uid,
            firebaseUser.email || '',
            firebaseUser.displayName,
            'user',
            null,
          )
          setUser(newUser)
        } else {
          setUser(userData)
        }
      } else {
        setUser(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    if (!auth) {
      console.error('Firebase Auth não está disponível')
      return
    }
    try {
      const provider = new firebase.auth.GoogleAuthProvider()
      await auth.signInWithPopup(provider)
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      throw error
    }
  }

  const signOut = async () => {
    if (!auth) return
    try {
      await auth.signOut()
      setUser(null)
      setFirebaseUser(null)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      throw error
    }
  }

  const isAdmin = user?.role === 'admin'
  const isActive = user?.status === 'active'

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signInWithGoogle,
        signOut,
        isAdmin,
        isActive,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
