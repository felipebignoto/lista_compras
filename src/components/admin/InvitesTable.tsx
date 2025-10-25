// src/components/admin/InvitesTable.tsx
'use client'

import { AccountInvite } from '@/types'
import { Mail, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { inviteService } from '@/firebase/invites'
import { useState } from 'react'

interface InvitesTableProps {
  invites: AccountInvite[]
  onUpdate?: () => void
}

export default function InvitesTable({ invites, onUpdate }: InvitesTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este convite?')) return
    
    setDeleting(id)
    try {
      await inviteService.deleteInvite(id)
      onUpdate?.()
    } catch (error) {
      console.error('Erro ao excluir convite:', error)
      alert('Erro ao excluir convite')
    } finally {
      setDeleting(null)
    }
  }

  function getStatusBadge(status: AccountInvite['status']) {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">
            <Clock className="h-3 w-3" />
            Pendente
          </span>
        )
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
            <CheckCircle className="h-3 w-3" />
            Aceito
          </span>
        )
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-sm">
            <XCircle className="h-3 w-3" />
            Recusado
          </span>
        )
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
            <XCircle className="h-3 w-3" />
            Expirado
          </span>
        )
    }
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-4 font-medium">E-mail</th>
              <th className="text-center p-4 font-medium">Papel</th>
              <th className="text-center p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Enviado em</th>
              <th className="text-left p-4 font-medium">Expira em</th>
              <th className="text-center p-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {invites.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  Nenhum convite encontrado
                </td>
              </tr>
            ) : (
              invites.map((invite) => (
                <tr key={invite.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{invite.email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {invite.role === 'admin' ? 'Admin' : 'Usuário'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      {getStatusBadge(invite.status)}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">
                    {new Date(invite.sentAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4 text-gray-600 text-sm">
                    {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <button
                        onClick={() => invite.id && handleDelete(invite.id)}
                        disabled={deleting === invite.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        title="Excluir convite"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
