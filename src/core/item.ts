export default class Item {
  private id: string | undefined | null
  private nome: string
  private quantidade?: number | undefined | null
  private observacao?: string | undefined | null
  private listId?: string | undefined | null
  private createdBy?: string | undefined | null
  private createdAt?: number | undefined | null
  private updatedAt?: number | undefined | null
  private checked: boolean

  constructor(
    nome: string,
    quantidade: number = 1,
    observacao: string | null = null,
    id: string | null = null,
    listId: string | null = null,
    createdBy: string | null = null,
    createdAt: number | null = null,
    updatedAt: number | null = null,
    checked: boolean = false,
  ) {
    this.id = id
    this.nome = nome
    this.quantidade = quantidade
    this.observacao = observacao
    this.listId = listId
    this.createdBy = createdBy
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.checked = checked
  }

  static vazio() {
    return new Item('', 1, '', null, null, null, null, null, false)
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

  get itemListId() {
    return this.listId
  }

  get itemCreatedBy() {
    return this.createdBy
  }

  get itemCreatedAt() {
    return this.createdAt
  }

  get itemUpdatedAt() {
    return this.updatedAt
  }

  get itemChecked() {
    return this.checked
  }
}
