'use client'

import Button from '@/components/button'
import Form from '@/components/form'
import Table from '@/components/table'
import Title from '@/components/title'
import AuthButton from '@/components/authButton'
import ListSelector from '@/components/listSelector'
import CreateListModal from '@/components/createListModal'
import Item from '@/core/item'
import ItemRepo from '@/core/itemRepo'
import ColecaoItem from '@/firebase/db'
import { listService } from '@/firebase/lists'
import UseTableForm from '@/hooks/useTableForm'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { ShoppingList } from '@/types'
import { List as ListIcon, Settings } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const { user, loading: authLoading } = useAuth()
  const [item, setItem] = useState<Item>(new Item(''))
  const [itens, setItens] = useState<Item[]>()
  const { exibirFormulario, exibirTabela, tabelaVisivel } = UseTableForm()
  const repo: ItemRepo = new ColecaoItem()

  // Estados de listas
  const [lists, setLists] = useState<ShoppingList[]>([])
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null)
  const [loadingLists, setLoadingLists] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [canWrite, setCanWrite] = useState(false)

  // Carregar listas do usuário
  useEffect(() => {
    if (user) {
      loadUserLists()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Carregar itens quando selecionar uma lista
  useEffect(() => {
    if (selectedList) {
      obterTodos()
      checkWritePermission()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedList])

  async function loadUserLists() {
    if (!user) return
    
    setLoadingLists(true)
    try {
      const userLists = await listService.getListsByUser(user.uid)
      setLists(userLists)
      
      // Se não tem lista selecionada, selecionar a primeira
      if (userLists.length > 0 && !selectedList) {
        setSelectedList(userLists[0])
      }
    } catch (error) {
      console.error('Erro ao carregar listas:', error)
    } finally {
      setLoadingLists(false)
    }
  }

  async function checkWritePermission() {
    if (!selectedList || !user) {
      setCanWrite(false)
      return
    }
    
    const hasPermission = await listService.canWrite(selectedList.id!, user.uid)
    setCanWrite(hasPermission)
  }

  async function handleCreateList(name: string) {
    if (!user) return
    
    const newList = await listService.createList(name, user.uid)
    setLists([newList, ...lists])
    setSelectedList(newList)
  }

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
    if (!selectedList?.id || !user) {
      console.error('Lista ou usuário não definido')
      return
    }
    
    console.log('save item')
    await repo.salvar(item, selectedList.id, user.uid)
    obterTodos()
  }

  function obterTodos() {
    if (!selectedList?.id) return
    
    repo.obterTodos(selectedList.id).then((itens) => {
      setItens(itens)
      exibirTabela()
    })
  }

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <Title
          title="Lista de compras"
          subtitle="Está precisando de ir no mercado?"
          icon
        />
        <AuthButton />
      </div>

      {!user ? (
        <div className="flex flex-col items-center justify-center mt-20 gap-4">
          <p className="text-gray-600 text-center">
            Faça login para gerenciar suas listas de compras
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Seletor de Lista */}
          <div className="flex items-center gap-3">
            <ListIcon className="h-5 w-5 text-gray-600" />
            <div className="flex-1 max-w-md">
              <ListSelector
                lists={lists}
                selectedList={selectedList}
                onSelectList={setSelectedList}
                onCreateNew={() => setShowCreateModal(true)}
                loading={loadingLists}
              />
            </div>
            {selectedList && (
              <Link
                href={`/lists/${selectedList.id}`}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Gerenciar</span>
              </Link>
            )}
          </div>

          {/* Conteúdo da Lista */}
          {selectedList ? (
            !tabelaVisivel ? (
              <div className="flex justify-center">
                {canWrite ? (
                  <Form
                    title={item.itemNome === '' ? 'Novo Item' : 'Atualizar item'}
                    canceled={exibirTabela}
                    itemChanged={saveItem}
                    item={item}
                    textButton={item.itemNome === '' ? 'Adicionar' : 'Salvar'}
                  />
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      Você não tem permissão para editar itens nesta lista
                    </p>
                    <button
                      onClick={exibirTabela}
                      className="mt-2 text-sm text-yellow-600 hover:text-yellow-800"
                    >
                      Voltar para lista
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                {canWrite && (
                  <Button
                    className="hover:bg-green-700"
                    onClick={addItem}
                    color="green"
                    text="Adicionar item"
                  />
                )}
                <div className="flex justify-center">
                  <Table
                    itemSelecionado={canWrite ? selectedItem : undefined}
                    itemExcluido={canWrite ? removeItem : undefined}
                    item={itens}
                  />
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center mt-20 gap-4">
              <p className="text-gray-600 text-center">
                {lists.length === 0
                  ? 'Você ainda não tem listas. Crie sua primeira lista!'
                  : 'Selecione uma lista para começar'}
              </p>
              {lists.length === 0 && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  color="green"
                  text="Criar minha primeira lista"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de Criar Lista */}
      <CreateListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateList}
      />
    </div>
  )
}
