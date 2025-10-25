// src/firebase/lists.ts
import firebase, { firestore } from "./config";
import { ShoppingList, ListRole, ListMember } from "@/types";

export class ListService {
  private collection = "lists";

  private getFirestore() {
    if (!firestore) {
      throw new Error("Firestore não está disponível");
    }
    return firestore;
  }

  /**
   * Criar nova lista
   */
  async createList(name: string, ownerId: string): Promise<ShoppingList> {
    const db = this.getFirestore();

    const list: Omit<ShoppingList, "id"> = {
      name,
      ownerId,
      members: {
        [ownerId]: {
          role: "owner",
          joinedAt: Date.now(),
        },
      },
      createdAt: Date.now(),
    };

    const docRef = await db.collection(this.collection).add(list);
    return { id: docRef.id, ...list };
  }

  /**
   * Buscar lista por ID
   */
  async getListById(id: string): Promise<ShoppingList | null> {
    const db = this.getFirestore();
    const doc = await db.collection(this.collection).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as ShoppingList;
  }

  /**
   * Listar todas as listas onde o usuário é membro
   */
  async getListsByUser(userId: string): Promise<ShoppingList[]> {
    const db = this.getFirestore();

    // Buscar todas as listas e filtrar no cliente
    // (Firestore não suporta queries com array contains em maps)
    const snapshot = await db.collection(this.collection).get();

    const lists = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as ShoppingList)
      .filter((list) => !!list.members[userId])
      .sort((a, b) => b.createdAt - a.createdAt);

    return lists;
  }

  /**
   * Listar listas onde usuário é owner
   */
  async getListsByOwner(ownerId: string): Promise<ShoppingList[]> {
    const db = this.getFirestore();
    const snapshot = await db
      .collection(this.collection)
      .where("ownerId", "==", ownerId)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as ShoppingList,
    );
  }

  /**
   * Atualizar lista (nome)
   */
  async updateList(
    id: string,
    userId: string,
    data: Partial<Pick<ShoppingList, "name">>,
  ): Promise<void> {
    const db = this.getFirestore();

    // Verificar permissão
    const list = await this.getListById(id);
    if (!list) throw new Error("Lista não encontrada");

    const userMember = list.members[userId];
    if (!userMember || userMember.role === "viewer") {
      throw new Error("Você não tem permissão para editar esta lista");
    }

    await db.collection(this.collection).doc(id).update(data);
  }

  /**
   * Deletar lista (apenas owner)
   */
  async deleteList(id: string, userId: string): Promise<void> {
    const db = this.getFirestore();

    const list = await this.getListById(id);
    if (!list) throw new Error("Lista não encontrada");

    if (list.ownerId !== userId) {
      throw new Error("Apenas o dono pode deletar a lista");
    }

    await db.collection(this.collection).doc(id).delete();
  }

  /**
   * Adicionar membro à lista
   */
  async addMember(
    listId: string,
    currentUserId: string,
    newUserId: string,
    role: ListRole,
  ): Promise<void> {
    const db = this.getFirestore();

    const list = await this.getListById(listId);
    if (!list) throw new Error("Lista não encontrada");

    // Apenas owner pode adicionar membros
    if (list.ownerId !== currentUserId) {
      throw new Error("Apenas o dono pode adicionar membros");
    }

    const newMember: ListMember = {
      role,
      joinedAt: Date.now(),
    };

    await db
      .collection(this.collection)
      .doc(listId)
      .update({
        [`members.${newUserId}`]: newMember,
      });
  }

  /**
   * Remover membro da lista
   */
  async removeMember(
    listId: string,
    currentUserId: string,
    userIdToRemove: string,
  ): Promise<void> {
    const db = this.getFirestore();

    const list = await this.getListById(listId);
    if (!list) throw new Error("Lista não encontrada");

    // Owner não pode ser removido
    if (list.ownerId === userIdToRemove) {
      throw new Error("O dono não pode ser removido da lista");
    }

    // Apenas owner pode remover membros, ou o próprio usuário pode se remover
    if (list.ownerId !== currentUserId && currentUserId !== userIdToRemove) {
      throw new Error("Você não tem permissão para remover este membro");
    }

    await db
      .collection(this.collection)
      .doc(listId)
      .update({
        [`members.${userIdToRemove}`]: firebase.firestore.FieldValue.delete(),
      });
  }

  /**
   * Atualizar role de um membro
   */
  async updateMemberRole(
    listId: string,
    currentUserId: string,
    targetUserId: string,
    newRole: ListRole,
  ): Promise<void> {
    const db = this.getFirestore();

    const list = await this.getListById(listId);
    if (!list) throw new Error("Lista não encontrada");

    // Apenas owner pode mudar roles
    if (list.ownerId !== currentUserId) {
      throw new Error("Apenas o dono pode alterar permissões");
    }

    // Não pode mudar role do owner
    if (list.ownerId === targetUserId) {
      throw new Error("Não é possível alterar a permissão do dono");
    }

    const member = list.members[targetUserId];
    if (!member) {
      throw new Error("Membro não encontrado");
    }

    await db
      .collection(this.collection)
      .doc(listId)
      .update({
        [`members.${targetUserId}.role`]: newRole,
      });
  }

  /**
   * Verificar se usuário tem permissão de leitura
   */
  async canRead(listId: string, userId: string): Promise<boolean> {
    const list = await this.getListById(listId);
    if (!list) return false;
    return !!list.members[userId];
  }

  /**
   * Verificar se usuário tem permissão de escrita
   */
  async canWrite(listId: string, userId: string): Promise<boolean> {
    const list = await this.getListById(listId);
    if (!list) return false;
    const member = list.members[userId];
    if (!member) return false;
    return member.role === "owner" || member.role === "editor";
  }

  /**
   * Verificar se usuário é owner
   */
  async isOwner(listId: string, userId: string): Promise<boolean> {
    const list = await this.getListById(listId);
    if (!list) return false;
    return list.ownerId === userId;
  }

  /**
   * Obter role do usuário na lista
   */
  async getUserRole(listId: string, userId: string): Promise<ListRole | null> {
    const list = await this.getListById(listId);
    if (!list) return null;
    const member = list.members[userId];
    return member ? member.role : null;
  }
}

export const listService = new ListService();
