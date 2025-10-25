// src/components/admin/InviteForm.tsx
'use client'

import { useState } from 'react'
import { UserRole } from '@/types'
import { inviteService } from '@/firebase/invites'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/button'
import Input from '@/components/input'

export default function InviteForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('user')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await inviteService.createInvite(email, role, user.uid)
      setSuccess(true)
      setEmail('')
      setRole('user')
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar convite')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Criar Novo Convite</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Convite criado com sucesso!
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">E-mail</label>
          <Input
            type="email"
            value={email}
            onChange={setEmail}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Papel</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full p-2 border rounded bg-gray-50"
          >
            <option value="user">Usuário</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Criar Convite'}
        </button>
      </div>
    </form>
  )
}
