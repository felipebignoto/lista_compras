'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/types'
import { inviteService } from '@/firebase/invites'
import AuthButton from '@/components/authButton'
import { Users, ArrowLeft, UserCheck, Shield } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  const { user, loading: authLoading, isAdmin } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form de ativar usuário
  const [showActivateForm, setShowActivateForm] = useState(false)
  const [activateEmail, setActivateEmail] = useState('')
  const [activateRole, setActivateRole] = useState<'admin' | 'user'>('user')
  const [activateLoading, setActivateLoading] = useState(false)
  const [activateError, setActivateError] = useState<string | null>(null)
  const [activateSuccess, setActivateSuccess] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/')
    }
  }, [authLoading, isAdmin, router])

  useEffect(() => {
    if (user && isAdmin) {
      loadData()
    }
  }, [user, isAdmin])

  async function loadData() {
    setLoading(true)
    try {
      const usersData = await inviteService.listAllUsers()
      setUsers(usersData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleActivateUser(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setActivateLoading(true)
    setActivateError(null)
    setActivateSuccess(false)

    try {
      await inviteService.activateUser(
        activateEmail.trim().toLowerCase(),
        activateRole
      )

      setActivateSuccess(true)
      setActivateEmail('')
      setActivateRole('user')
      loadData() // Recarregar usuários
      
      setTimeout(() => {
        setShowActivateForm(false)
        setActivateSuccess(false)
      }, 2000)
    } catch (error) {
      setActivateError(error instanceof Error ? error.message : 'Erro ao ativar usuário')
    } finally {
      setActivateLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Carregando...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const activeUsers = users.filter((u: any) => u.status === 'active')
  const pendingUsers = users.filter((u: any) => u.status === 'pending')

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          </div>
          <AuthButton />
        </div>

        {/* Usuários */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Usuários ({users.length})
              </h2>
            </div>
            <button
              onClick={() => setShowActivateForm(!showActivateForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserCheck className="h-4 w-4" />
              <span>Ativar Usuário</span>
            </button>
          </div>

          {/* Form de ativar usuário */}
          {showActivateForm && (
            <form onSubmit={handleActivateUser} className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Ativar usuário</h3>
              <p className="text-sm text-gray-600 mb-4">
                Digite o email de um usuário que já tenha feito login no sistema.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={activateEmail}
                    onChange={(e) => setActivateEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    required
                    disabled={activateLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Permissão
                  </label>
                  <select
                    value={activateRole}
                    onChange={(e) => setActivateRole(e.target.value as 'admin' | 'user')}
                    disabled={activateLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                {activateError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{activateError}</p>
                  </div>
                )}

                {activateSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-600">Usuário ativado com sucesso!</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowActivateForm(false)
                      setActivateError(null)
                      setActivateEmail('')
                    }}
                    disabled={activateLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={activateLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {activateLoading ? 'Ativando...' : 'Ativar'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Usuários Ativos */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Ativos ({activeUsers.length})
            </h3>
            <div className="space-y-2">
              {activeUsers.map((userData: any) => (
                <div
                  key={userData.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {userData.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={userData.image}
                        alt="Avatar"
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {userData.name || userData.email}
                      </p>
                      <p className="text-sm text-gray-500">{userData.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      userData.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {userData.role === 'admin' ? (
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Admin
                        </span>
                      ) : (
                        'Usuário'
                      )}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(userData.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Usuários Pendentes */}
          {pendingUsers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Pendentes de Ativação ({pendingUsers.length})
              </h3>
              <div className="space-y-2">
                {pendingUsers.map((userData: any) => (
                  <div
                    key={userData.id}
                    className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                  >
                    <div className="flex items-center gap-3">
                      {userData.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={userData.image}
                          alt="Avatar"
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {userData.name || userData.email}
                        </p>
                        <p className="text-sm text-gray-500">{userData.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                        Aguardando ativação
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(userData.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
