'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, AccountInvite } from '@/types'
import { userService } from '@/firebase/users'
import { inviteService } from '@/firebase/invites'
import UsersTable from '@/components/admin/UsersTable'
import InvitesTable from '@/components/admin/InvitesTable'
import InviteForm from '@/components/admin/InviteForm'
import AuthButton from '@/components/authButton'
import { Users, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  const { user, loading: authLoading, isAdmin } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [invites, setInvites] = useState<AccountInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'users' | 'invites'>('users')

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
      const [usersData, invitesData] = await Promise.all([
        userService.listAllUsers(),
        inviteService.listAllInvites(),
      ])
      setUsers(usersData)
      setInvites(invitesData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-white text-blue-600 shadow'
                : 'bg-white/50 text-gray-600 hover:bg-white'
            }`}
          >
            <Users className="h-4 w-4" />
            Usuários ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('invites')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'invites'
                ? 'bg-white text-blue-600 shadow'
                : 'bg-white/50 text-gray-600 hover:bg-white'
            }`}
          >
            <Mail className="h-4 w-4" />
            Convites ({invites.filter((i) => i.status === 'pending').length} pendentes)
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'invites' && (
            <InviteForm onSuccess={loadData} />
          )}

          {activeTab === 'users' ? (
            <UsersTable users={users} />
          ) : (
            <InvitesTable invites={invites} onUpdate={loadData} />
          )}
        </div>
      </div>
    </div>
  )
}
