export default class Item {
  private id: string | undefined | null
  private nome: string
  private quantidade?: number | undefined | null
  private observacao?: string | undefined | null

  constructor(
    nome: string,
    quantidade: number = 1,
    observacao: string | null = null,
    id: string | null = null,
  ) {
    this.id = id
    this.nome = nome
    this.quantidade = quantidade
    this.observacao = observacao
  }

  static vazio() {
    return new Item('', 1, '')
  }

  get itemId() {
    return this.id
  }

  get itemNome() {
    return this.nome
  }

  get itemQuantidade() {
    return this.quantidade
  }

  get itemObservacao() {
    return this.observacao
  }
}
