'use client'

import Button from '@/components/button'
import Form from '@/components/form'
import Table from '@/components/table'
import Title from '@/components/title'
import Item from '@/core/item'
import ItemRepo from '@/core/itemRepo'
import ColecaoItem from '@/firebase/db'
import UseTableForm from '@/hooks/useTableForm'
import { useEffect, useState } from 'react'

export default function Home() {
  const [item, setItem] = useState<Item>(new Item(''))
  const [itens, setItens] = useState<Item[]>()
  const { exibirFormulario, exibirTabela, tabelaVisivel } = UseTableForm()
  const repo: ItemRepo = new ColecaoItem()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(obterTodos, [])

  function selectedItem(item: Item) {
    setItem(item)
    exibirFormulario()
  }

  function addItem() {
    setItem(Item.vazio())
    exibirFormulario()
  }

  async function removeItem(itemm: Item) {
    await repo.excluir(itemm)
    obterTodos()
  }

  async function saveItem(item: Item) {
    console.log('save item')
    await repo.salvar(item)
    obterTodos()
  }

  function obterTodos() {
    repo.obterTodos().then((itens) => {
      setItens(itens)
      exibirTabela()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-center items-center mt-4">
        <Title
          title="Lista de compras"
          subtitle="Está precisando de ir no mercado? "
          icon
        ></Title>
      </div>

      {!tabelaVisivel ? (
        <div className="flex justify-center">
          <Form
            title={item.itemNome === '' ? 'Novo Item' : 'Atualizar item'}
            canceled={exibirTabela}
            itemChanged={saveItem}
            item={item}
            textButton={item.itemNome === '' ? 'Adicionar' : 'Salvar'}
          ></Form>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Button
            className="hover:bg-green-700"
            onClick={addItem}
            color="green"
            text="Adicionar item"
          ></Button>
          <div className="flex justify-center">
            <Table
              itemSelecionado={selectedItem}
              itemExcluido={removeItem}
              item={itens}
            ></Table>
          </div>
        </div>
      )}
    </div>
  )
}
