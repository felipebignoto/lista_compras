// src/types/index.ts

export type UserRole = 'admin' | 'user'
export type UserStatus = 'pending' | 'active' | 'inactive'
export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired'
export type ListRole = 'owner' | 'editor' | 'viewer'

export interface User {
  uid: string
  email: string
  name?: string | null
  image?: string | null
  role: UserRole
  status: UserStatus
  createdAt: number
  invitedBy?: string | null
}

export interface AccountInvite {
  id?: string
  email: string
  role: UserRole
  status: InviteStatus
  sentBy: string
  sentAt: number
  expiresAt: number
  acceptedAt?: number | null
}

export interface ListMember {
  role: ListRole
  joinedAt: number
}

export interface ShoppingList {
  id?: string
  name: string
  ownerId: string
  createdAt: number
  members: Record<string, ListMember> // uid -> ListMember
}

export interface ListItem {
  id?: string
  nome: string
  quantidade: number
  observacao?: string | null
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface ListInvite {
  id?: string
  listId: string
  listName: string
  invitedEmail: string
  invitedBy: string
  invitedByName?: string
  role: ListRole
  status: InviteStatus
  sentAt: number
  expiresAt: number
  acceptedAt?: number | null
}
