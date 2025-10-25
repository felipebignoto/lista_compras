// src/components/admin/UsersTable.tsx
'use client'

import { User } from '@/types'
import { Shield, UserIcon, Circle } from 'lucide-react'

interface UsersTableProps {
  users: User[]
}

export default function UsersTable({ users }: UsersTableProps) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-4 font-medium">Usuário</th>
              <th className="text-left p-4 font-medium">E-mail</th>
              <th className="text-center p-4 font-medium">Papel</th>
              <th className="text-center p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.uid} className="border-t hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt=""
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <UserIcon className="h-8 w-8 text-gray-400" />
                    )}
                    <span className="font-medium">{user.name || 'Sem nome'}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-600">{user.email}</td>
                <td className="p-4">
                  <div className="flex justify-center">
                    {user.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        <Shield className="h-3 w-3" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        <UserIcon className="h-3 w-3" />
                        Usuário
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex justify-center">
                    {user.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                        <Circle className="h-2 w-2 fill-current" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        <Circle className="h-2 w-2 fill-current" />
                        {user.status === 'pending' ? 'Pendente' : 'Inativo'}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-gray-600 text-sm">
                  {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
