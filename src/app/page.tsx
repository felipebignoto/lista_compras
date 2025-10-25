"use client";

import Button from "@/components/button";
import Form from "@/components/form";
import Table from "@/components/table";
import Title from "@/components/title";
import AuthButton from "@/components/authButton";
import ListSelector from "@/components/listSelector";
import CreateListModal from "@/components/createListModal";
import Item from "@/core/item";
import ItemRepo from "@/core/itemRepo";
import ColecaoItem from "@/firebase/db";
import { listService } from "@/firebase/lists";
import UseTableForm from "@/hooks/useTableForm";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useCallback, useMemo } from "react";
import { ShoppingList } from "@/types";
import { List as ListIcon, Settings } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [item, setItem] = useState<Item>(new Item(""));
  const [itens, setItens] = useState<Item[]>();
  const { exibirFormulario, exibirTabela, tabelaVisivel } = UseTableForm();
  const repo: ItemRepo = useMemo(() => new ColecaoItem(), []);

  // Estados de listas
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [loadingLists, setLoadingLists] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [canWrite, setCanWrite] = useState(false);

  // Função para obter todos os itens (com useCallback)
  const obterTodos = useCallback(() => {
    if (!selectedList?.id) return;

    repo.obterTodos(selectedList.id).then((itens) => {
      setItens(itens);
    });
  }, [selectedList?.id, repo]);

  // Verificar permissão de escrita (com useCallback)
  const checkWritePermission = useCallback(async () => {
    if (!selectedList || !user) {
      setCanWrite(false);
      return;
    }

    const hasPermission = await listService.canWrite(
      selectedList.id!,
      user.uid,
    );
    setCanWrite(hasPermission);
  }, [selectedList, user]);

  // Carregar listas do usuário (com useCallback)
  const loadUserLists = useCallback(async () => {
    if (!user) return;

    setLoadingLists(true);
    try {
      const userLists = await listService.getListsByUser(user.uid);
      setLists(userLists);

      // Se não tem lista selecionada, selecionar a primeira
      if (userLists.length > 0 && !selectedList) {
        setSelectedList(userLists[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar listas:", error);
    } finally {
      setLoadingLists(false);
    }
  }, [user, selectedList]);

  // Carregar listas do usuário
  useEffect(() => {
    if (user) {
      loadUserLists();
    } else {
      // Limpar estado quando usuário faz logout
      setLists([]);
      setSelectedList(null);
      setItens(undefined);
      setLoadingLists(false);
    }
  }, [user, loadUserLists]);

  // Carregar itens quando selecionar uma lista
  useEffect(() => {
    if (selectedList && user) {
      obterTodos();
      checkWritePermission();
    }
  }, [selectedList, user, obterTodos, checkWritePermission]);

  async function handleCreateList(name: string) {
    if (!user) return;

    const newList = await listService.createList(name, user.uid);
    setLists([newList, ...lists]);
    setSelectedList(newList);
  }

  function selectedItem(item: Item) {
    setItem(item);
    exibirFormulario();
  }

  function addItem() {
    setItem(Item.vazio());
    exibirFormulario();
  }

  async function removeItem(itemm: Item) {
    if (!canWrite) return;
    await repo.excluir(itemm);
    obterTodos();
  }

  async function toggleItemChecked(item: Item) {
    if (!selectedList?.id || !user) return;

    await repo.toggleChecked(item.itemId!, selectedList.id, !item.itemChecked);
    obterTodos();
  }

  async function saveItem(item: Item) {
    if (!selectedList?.id || !user) {
      console.error("Lista ou usuário não definido");
      return;
    }

    await repo.salvar(item, selectedList.id, user.uid);
    await obterTodos();
    exibirTabela();
  }

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 via-indigo-100 to-purple-200">
        <p className="text-slate-700">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-100 to-purple-200">
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Title
            title="Gerenciador de Listas"
            subtitle="Organize suas tarefas e itens"
            icon
          />
          <AuthButton />
        </div>

        {!user ? (
          <div className="flex flex-col items-center justify-center mt-20 gap-4 bg-white rounded-2xl shadow-xl p-12 border border-slate-200">
            <p className="text-slate-700 text-center text-lg">
              Faça login para gerenciar suas listas
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Seletor de Lista */}
            <div className="bg-white rounded-2xl shadow-lg p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <ListIcon className="h-5 w-5 text-indigo-600" />
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
                    className="flex items-center gap-2 px-4 py-2 text-indigo-700 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-200"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">
                      Gerenciar
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* Conteúdo da Lista */}
            {loadingLists ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 flex items-center justify-center border border-slate-200">
                <p className="text-slate-600">Carregando listas...</p>
              </div>
            ) : selectedList ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                {!tabelaVisivel ? (
                  <div className="flex justify-center">
                    {canWrite ? (
                      <Form
                        title={
                          item.itemNome === "" ? "Novo Item" : "Atualizar item"
                        }
                        canceled={exibirTabela}
                        itemChanged={saveItem}
                        item={item}
                        textButton={
                          item.itemNome === "" ? "Adicionar" : "Salvar"
                        }
                      />
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6 text-center">
                        <p className="text-yellow-800 mb-3">
                          Você não tem permissão para editar itens nesta lista
                        </p>
                        <button
                          onClick={exibirTabela}
                          className="text-sm text-yellow-700 hover:text-yellow-900 font-medium"
                        >
                          Voltar para lista
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {canWrite && (
                      <div className="flex justify-center">
                        <Button
                          className="hover:bg-indigo-700 bg-indigo-600 shadow-lg"
                          onClick={addItem}
                          color="green"
                          text="+ Adicionar item"
                        />
                      </div>
                    )}
                    <Table
                      itemSelecionado={canWrite ? selectedItem : undefined}
                      itemExcluido={canWrite ? removeItem : undefined}
                      itemToggleChecked={toggleItemChecked}
                      item={itens}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 flex flex-col items-center justify-center gap-4 border border-slate-200">
                <p className="text-slate-700 text-center text-lg">
                  {lists.length === 0
                    ? "Você ainda não tem listas. Crie sua primeira lista!"
                    : "Selecione uma lista para começar"}
                </p>
                {lists.length === 0 && (
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    color="green"
                    text="Criar minha primeira lista"
                    className="bg-indigo-600 hover:bg-indigo-700 shadow-lg"
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
    </div>
  );
}
