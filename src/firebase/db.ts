import Item from '@/core/item'
import ItemRepo from '@/core/itemRepo'
import firebase from './config'

export default class ColecaoItem implements ItemRepo {
  async salvar(item: Item): Promise<Item | undefined> {
    if (typeof window === 'undefined') return undefined

    if (item?.itemId) {
      await this.colecao().doc(item.itemId).set(item)
      return item
    } else {
      const docRef = await this.colecao().add(item)
      const doc = await docRef.get()
      return doc.data()
    }
  }

  async excluir(item: Item): Promise<void> {
    if (typeof window === 'undefined') return

    if (item?.itemId) {
      return this.colecao().doc(item.itemId).delete()
    }
  }

  async obterTodos(): Promise<Item[]> {
    if (typeof window === 'undefined') return []

    const query = await this.colecao().get()
    return query.docs.map((doc) => doc.data()) ?? []
  }

  conversor = {
    toFirestore(item: Item) {
      return {
        nome: item.itemNome,
        quantidade: item.itemQuantidade,
        observacao: item.itemObservacao,
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
