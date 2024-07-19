import Item from './item'

export default interface ItemRepo {
  salvar(item: Item): Promise<Item | undefined>
  excluir(item: Item): Promise<void>
  obterTodos(): Promise<Item[]>
}
