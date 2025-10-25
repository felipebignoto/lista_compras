// src/app/activate/[token]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { inviteService } from '@/firebase/invites'
import { userService } from '@/firebase/users'
import { AccountInvite } from '@/types'
import Button from '@/components/button'
import { CheckCircle, XCircle, Mail, Shield, UserIcon, AlertCircle } from 'lucide-react'

export default function ActivatePage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading, signInWithGoogle } = useAuth()
  const [invite, setInvite] = useState<AccountInvite | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  const token = params.token as string

  // Carregar convite
  useEffect(() => {
    if (!token) {
      setError('Token de convite inválido')
      setLoading(false)
      return
    }

    const loadInvite = async () => {
      try {
        const inviteData = await inviteService.getInviteById(token)
        
        if (!inviteData) {
          setError('Convite não encontrado')
          setLoading(false)
          return
        }

        if (inviteData.status !== 'pending') {
          setError(`Este convite já foi ${inviteData.status === 'accepted' ? 'aceito' : inviteData.status === 'declined' ? 'recusado' : 'expirado'}`)
          setLoading(false)
          return
        }

        if (inviteData.expiresAt < Date.now()) {
          setError('Este convite expirou')
          setLoading(false)
          return
        }

        setInvite(inviteData)
        setLoading(false)
      } catch (err) {
        console.error('Erro ao carregar convite:', err)
        setError('Erro ao carregar convite')
        setLoading(false)
      }
    }

    loadInvite()
  }, [token])

  const handleActivate = async () => {
    if (!user || !invite) return

    console.log('🔄 Iniciando ativação...', { user: user.email, invite: invite.email })
    setProcessing(true)
    setError(null)

    try {
      // Verificar se o email do usuário logado corresponde ao convite
      if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
        setError(`Este convite é para ${invite.email}. Você está logado como ${user.email}. Por favor, saia e entre com o email correto.`)
        setProcessing(false)
        return
      }

      console.log('✅ Email verificado, aceitando convite...')
      // Aceitar o convite
      if (invite.id) {
        await inviteService.acceptInvite(invite.id)
        console.log('✅ Convite aceito:', invite.id)
      }

      console.log('🔄 Atualizando role do usuário...')
      // Atualizar role do usuário se necessário
      const existingUser = await userService.getUserByEmail(user.email)
      console.log('👤 Usuário encontrado:', existingUser)
      
      if (existingUser && existingUser.role !== invite.role) {
        await userService.updateUserRole(existingUser.uid, invite.role)
        console.log('✅ Role atualizado para:', invite.role)
      }

      setSuccess(true)
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      console.error('❌ Erro ao ativar convite:', err)
      setError('Erro ao ativar convite. Tente novamente.')
      setProcessing(false)
    }
  }

  // Ativar convite automaticamente se usuário já estiver logado
  useEffect(() => {
    if (!authLoading && user && invite && !processing && !success && !error) {
      console.log('🎯 Disparando ativação automática')
      handleActivate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, invite])

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando convite...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => router.push('/')}
            color="blue"
            className="w-full"
          >
            Voltar para o início
          </Button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Conta Ativada!</h1>
          <p className="text-gray-600 mb-2">
            Sua conta foi ativada com sucesso como <strong>{invite?.role === 'admin' ? 'Administrador' : 'Usuário'}</strong>.
          </p>
          <p className="text-sm text-gray-500">
            Redirecionando...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Mail className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Convite para Lista de Compras
            </h1>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-gray-700 mb-2">
                  Você foi convidado para acessar a plataforma Lista de Compras.
                </p>
                <div className="space-y-1">
                  <p className="text-gray-600">
                    <strong>Email:</strong> {invite?.email}
                  </p>
                  <p className="text-gray-600 flex items-center gap-1">
                    <strong>Perfil:</strong> 
                    {invite?.role === 'admin' ? (
                      <>
                        <Shield className="h-4 w-4 text-blue-600 inline" />
                        <span>Administrador</span>
                      </>
                    ) : (
                      <>
                        <UserIcon className="h-4 w-4 text-gray-600 inline" />
                        <span>Usuário</span>
                      </>
                    )}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Expira em: {invite?.expiresAt ? new Date(invite.expiresAt).toLocaleDateString('pt-BR') : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6 text-center">
            Para ativar sua conta, faça login com o email <strong>{invite?.email}</strong>
          </p>

          <Button
            onClick={signInWithGoogle}
            color="blue"
            className="w-full hover:bg-blue-700"
          >
            Entrar com Google
          </Button>
        </div>
      </div>
    )
  }

  // Mostrar enquanto processa
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Ativando sua conta...</p>
      </div>
    </div>
  )
}
