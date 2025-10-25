// src/firebase/invites.ts
import { firestore } from './config'
import { AccountInvite, UserRole } from '@/types'

export class InviteService {
  private collection = 'invites'

  private getFirestore() {
    if (!firestore) {
      throw new Error('Firestore não está disponível')
    }
    return firestore
  }

  async createInvite(
    email: string,
    role: UserRole,
    sentBy: string,
  ): Promise<AccountInvite> {
    const db = this.getFirestore()
    
    // Verificar se já existe convite pendente para este email
    const existing = await this.getPendingInviteByEmail(email)
    if (existing) {
      throw new Error('Já existe um convite pendente para este e-mail')
    }

    const invite: Omit<AccountInvite, 'id'> = {
      email,
      role,
      status: 'pending',
      sentBy,
      sentAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 dias
      acceptedAt: null,
    }

    const docRef = await db.collection(this.collection).add(invite)
    return { id: docRef.id, ...invite }
  }

  async getInviteById(id: string): Promise<AccountInvite | null> {
    const db = this.getFirestore()
    const doc = await db.collection(this.collection).doc(id).get()
    if (!doc.exists) return null
    return { id: doc.id, ...doc.data() } as AccountInvite
  }

  async getPendingInviteByEmail(email: string): Promise<AccountInvite | null> {
    const db = this.getFirestore()
    const snapshot = await db
      .collection(this.collection)
      .where('email', '==', email)
      .where('status', '==', 'pending')
      .limit(1)
      .get()

    if (snapshot.empty) return null
    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() } as AccountInvite
  }

  async listAllInvites(): Promise<AccountInvite[]> {
    const db = this.getFirestore()
    const snapshot = await db
      .collection(this.collection)
      .orderBy('sentAt', 'desc')
      .get()
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AccountInvite))
  }

  async listPendingInvites(): Promise<AccountInvite[]> {
    const db = this.getFirestore()
    const snapshot = await db
      .collection(this.collection)
      .where('status', '==', 'pending')
      .orderBy('sentAt', 'desc')
      .get()
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AccountInvite))
  }

  async acceptInvite(id: string): Promise<void> {
    const db = this.getFirestore()
    await db.collection(this.collection).doc(id).update({
      status: 'accepted',
      acceptedAt: Date.now(),
    })
  }

  async declineInvite(id: string): Promise<void> {
    const db = this.getFirestore()
    await db.collection(this.collection).doc(id).update({
      status: 'declined',
    })
  }

  async deleteInvite(id: string): Promise<void> {
    const db = this.getFirestore()
    await db.collection(this.collection).doc(id).delete()
  }

  async expireOldInvites(): Promise<void> {
    const db = this.getFirestore()
    const now = Date.now()
    const snapshot = await db
      .collection(this.collection)
      .where('status', '==', 'pending')
      .where('expiresAt', '<', now)
      .get()

    const batch = db.batch()
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { status: 'expired' })
    })
    await batch.commit()
  }
}

export const inviteService = new InviteService()
