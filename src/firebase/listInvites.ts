// src/firebase/listInvites.ts
import { firestore } from "./config";
import { ListRole } from "@/types";
import { listService } from "./lists";

export class ListInviteService {
  private getFirestore() {
    if (!firestore) {
      throw new Error("Firestore não está disponível");
    }
    return firestore;
  }

  /**
   * Adicionar usuário diretamente à lista
   * Busca o usuário pelo email e adiciona aos membros
   */
  async addUserToList(
    listId: string,
    invitedEmail: string,
    role: ListRole,
    invitedBy: string,
  ): Promise<void> {
    const db = this.getFirestore();

    // Buscar usuário pelo email
    const usersSnapshot = await db
      .collection("users")
      .where("email", "==", invitedEmail)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      throw new Error(
        "Usuário não encontrado. O usuário precisa fazer login primeiro.",
      );
    }

    const userId = usersSnapshot.docs[0].id;

    // Verificar se já é membro
    const list = await listService.getListById(listId);
    if (!list) throw new Error("Lista não encontrada");

    if (list.members[userId]) {
      throw new Error("Este usuário já é membro da lista");
    }

    // Adicionar como membro
    await listService.addMember(listId, invitedBy, userId, role);
  }
}

export const listInviteService = new ListInviteService();
