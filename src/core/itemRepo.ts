import Item from './item'

export default interface ItemRepo {
  salvar(item: Item, listId: string, userId: string): Promise<Item | undefined>
  excluir(item: Item): Promise<void>
  obterTodos(listId: string): Promise<Item[]>
}
