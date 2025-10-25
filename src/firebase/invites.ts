// src/firebase/invites.ts
import { firestore } from "./config";
import { UserRole } from "@/types";

export class InviteService {
  private getFirestore() {
    if (!firestore) {
      throw new Error("Firestore não está disponível");
    }
    return firestore;
  }

  /**
   * Adicionar usuário como ativo no sistema
   * Busca o usuário pelo email e define role e status
   */
  async activateUser(email: string, role: UserRole): Promise<void> {
    const db = this.getFirestore();

    // Buscar usuário pelo email
    const usersSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      throw new Error(
        "Usuário não encontrado. O usuário precisa fazer login primeiro.",
      );
    }

    const userId = usersSnapshot.docs[0].id;

    // Atualizar role e status
    await db.collection("users").doc(userId).update({
      role,
      status: "active",
    });
  }

  /**
   * Listar todos os usuários do sistema (apenas para admin)
   */
  async listAllUsers() {
    const db = this.getFirestore();
    const snapshot = await db
      .collection("users")
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}

export const inviteService = new InviteService();
