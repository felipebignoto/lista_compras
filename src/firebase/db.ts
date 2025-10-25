import Item from '@/core/item'
import ItemRepo from '@/core/itemRepo'
import firebase from './config'

export default class ColecaoItem implements ItemRepo {
  async salvar(item: Item, listId: string, userId: string): Promise<Item | undefined> {
    if (typeof window === 'undefined') return undefined

    const now = Date.now()

    if (item?.itemId) {
      // Atualizar item existente
      await this.colecao().doc(item.itemId).update({
        nome: item.itemNome,
        quantidade: item.itemQuantidade,
        observacao: item.itemObservacao,
        listId,
        updatedAt: now,
      })
      return item
    } else {
      // Criar novo item - usar collection sem conversor para adicionar campos extras
      const docRef = await firebase
        .firestore()
        .collection('itens')
        .add({
          nome: item.itemNome,
          quantidade: item.itemQuantidade,
          observacao: item.itemObservacao,
          listId,
          createdBy: userId,
          createdAt: now,
          updatedAt: now,
        })
      
      const doc = await docRef.get()
      const dados = doc.data()
      if (!dados) return undefined
      
      return new Item(
        dados.nome,
        dados.quantidade,
        dados.observacao,
        doc.id,
        dados.listId,
        dados.createdBy,
        dados.createdAt,
        dados.updatedAt,
      )
    }
  }

  async excluir(item: Item): Promise<void> {
    if (typeof window === 'undefined') return

    if (item?.itemId) {
      return this.colecao().doc(item.itemId).delete()
    }
  }

  async obterTodos(listId: string): Promise<Item[]> {
    if (typeof window === 'undefined') return []

    const query = await this.colecao()
      .where('listId', '==', listId)
      .orderBy('createdAt', 'desc')
      .get()
    
    return query.docs.map((doc) => doc.data()) ?? []
  }

  conversor = {
    toFirestore(item: Item) {
      return {
        nome: item.itemNome,
        quantidade: item.itemQuantidade,
        observacao: item.itemObservacao,
        listId: item.itemListId,
        createdBy: item.itemCreatedBy,
        createdAt: item.itemCreatedAt,
        updatedAt: item.itemUpdatedAt,
      }
    },
    fromFirestore(
      snapshot: firebase.firestore.QueryDocumentSnapshot,
      options: firebase.firestore.SnapshotOptions,
    ): Item {
      const dados = snapshot?.data(options)
      return new Item(
        dados.nome,
        dados.quantidade,
        dados.observacao,
        snapshot?.id,
        dados.listId,
        dados.createdBy,
        dados.createdAt,
        dados.updatedAt,
      )
    },
  }

  private colecao() {
    return firebase
      .firestore()
      .collection('itens')
      .withConverter(this.conversor)
  }
}
