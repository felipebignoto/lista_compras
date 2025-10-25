// src/firebase/users.ts
import { firestore } from './config'
import { User, UserRole, UserStatus } from '@/types'

export class UserService {
  private collection = 'users'

  private getFirestore() {
    if (!firestore) {
      throw new Error('Firestore não está disponível (executando no servidor?)')
    }
    return firestore
  }

  async createUser(
    uid: string,
    email: string,
    name?: string | null,
    role: UserRole = 'user',
    invitedBy?: string | null,
  ): Promise<User> {
    const user: User = {
      uid,
      email,
      name: name || null,
      image: null,
      role,
      status: 'active',
      createdAt: Date.now(),
      invitedBy: invitedBy || null,
    }

    const db = this.getFirestore()
    await db.collection(this.collection).doc(uid).set(user)
    return user
  }

  async getUserById(uid: string): Promise<User | null> {
    const db = this.getFirestore()
    const doc = await db.collection(this.collection).doc(uid).get()
    if (!doc.exists) return null
    return doc.data() as User
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = this.getFirestore()
    const snapshot = await db
      .collection(this.collection)
      .where('email', '==', email)
      .limit(1)
      .get()

    if (snapshot.empty) return null
    return snapshot.docs[0].data() as User
  }

  async updateUser(uid: string, data: Partial<User>): Promise<void> {
    const db = this.getFirestore()
    await db.collection(this.collection).doc(uid).update(data)
  }

  async updateUserRole(uid: string, role: UserRole): Promise<void> {
    await this.updateUser(uid, { role })
  }

  async updateUserStatus(uid: string, status: UserStatus): Promise<void> {
    await this.updateUser(uid, { status })
  }

  async deleteUser(uid: string): Promise<void> {
    const db = this.getFirestore()
    await db.collection(this.collection).doc(uid).delete()
  }

  async listAllUsers(): Promise<User[]> {
    const db = this.getFirestore()
    const snapshot = await db
      .collection(this.collection)
      .orderBy('createdAt', 'desc')
      .get()
    return snapshot.docs.map((doc) => doc.data() as User)
  }

  async listActiveUsers(): Promise<User[]> {
    const db = this.getFirestore()
    const snapshot = await db
      .collection(this.collection)
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .get()
    return snapshot.docs.map((doc) => doc.data() as User)
  }

  async isAdmin(uid: string): Promise<boolean> {
    const user = await this.getUserById(uid)
    return user?.role === 'admin'
  }

  async isActiveUser(uid: string): Promise<boolean> {
    const user = await this.getUserById(uid)
    return user?.status === 'active'
  }
}

export const userService = new UserService()

