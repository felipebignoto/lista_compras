// src/components/authButton.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import Button from './button'
import { LogIn, LogOut, Shield, User as UserIcon } from 'lucide-react'

export default function AuthButton() {
  const { user, loading, signInWithGoogle, signOut, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2">
        <span className="text-sm text-gray-500">Carregando...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <Button
        onClick={signInWithGoogle}
        color="blue"
        className="hover:bg-blue-700 flex items-center gap-2"
      >
        <LogIn className="h-4 w-4" />
        <span>Entrar com Google</span>
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt="Avatar"
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <UserIcon className="h-8 w-8 text-gray-400" />
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {user.name || user.email}
          </span>
          {isAdmin && (
            <span className="text-xs text-blue-600 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Admin
            </span>
          )}
        </div>
      </div>
      <Button
        onClick={signOut}
        color="red"
        className="hover:bg-red-700 flex items-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        <span>Sair</span>
      </Button>
    </div>
  )
}
