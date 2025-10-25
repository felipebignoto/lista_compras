import Item from '@/core/item'
import ItemRepo from '@/core/itemRepo'
import firebase from './config'

export default class ColecaoItem implements ItemRepo {
  /**
   * Retorna a subcollection de itens dentro de uma lista
   */
  private getItemsCollection(listId: string) {
    return firebase
      .firestore()
      .collection('lists')
      .doc(listId)
      .collection('itens')
      .withConverter(this.conversor)
  }

  async salvar(item: Item, listId: string, userId: string): Promise<Item | undefined> {
    if (typeof window === 'undefined') return undefined

    const now = Date.now()

    if (item?.itemId) {
      // Atualizar item existente
      await this.getItemsCollection(listId).doc(item.itemId).update({
        nome: item.itemNome,
        quantidade: item.itemQuantidade,
        observacao: item.itemObservacao,
        checked: item.itemChecked,
        updatedAt: now,
      })
      return item
    } else {
      // Criar novo item
      const docRef = await firebase
        .firestore()
        .collection('lists')
        .doc(listId)
        .collection('itens')
        .add({
          nome: item.itemNome,
          quantidade: item.itemQuantidade,
          observacao: item.itemObservacao,
          checked: false,
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
        listId,
        dados.createdBy,
        dados.createdAt,
        dados.updatedAt,
        dados.checked,
      )
    }
  }

  async excluir(item: Item): Promise<void> {
    if (typeof window === 'undefined') return

    if (item?.itemId && item?.itemListId) {
      return this.getItemsCollection(item.itemListId).doc(item.itemId).delete()
    }
  }

  async obterTodos(listId: string): Promise<Item[]> {
    if (typeof window === 'undefined') return []

    const query = await this.getItemsCollection(listId)
      .orderBy('createdAt', 'desc')
      .get()
    
    return query.docs.map((doc) => doc.data()) ?? []
  }

  async toggleChecked(
    itemId: string,
    listId: string,
    checked: boolean
  ): Promise<void> {
    const itemRef = this.getItemsCollection(listId).doc(itemId)
    await itemRef.update({ checked })
  }

  conversor = {
    toFirestore(item: Item) {
      return {
        nome: item.itemNome,
        quantidade: item.itemQuantidade,
        observacao: item.itemObservacao,
        checked: item.itemChecked,
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
        snapshot.ref.parent.parent?.id || '', // listId from parent
        dados.createdBy,
        dados.createdAt,
        dados.updatedAt,
        dados.checked || false,
      )
    },
  }
}
