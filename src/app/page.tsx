"use client";

import Button from "@/components/button";
import Form from "@/components/form";
import Table from "@/components/table";
import Title from "@/components/title";
import AuthButton from "@/components/authButton";
import ListSelector from "@/components/listSelector";
import CreateListModal from "@/components/createListModal";
import ThemeToggle from "@/components/themeToggle";
import Item from "@/core/item";
import ItemRepo from "@/core/itemRepo";
import ColecaoItem from "@/firebase/db";
import { listService } from "@/firebase/lists";
import { userService } from "@/firebase/users";
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
  const [favoriteListId, setFavoriteListId] = useState<string | null>(null);

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

      // Buscar lista favorita
      const favId = await userService.getFavoriteListId(user.uid);
      setFavoriteListId(favId);

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

  async function handleToggleFavorite(listId: string, setAsFavorite: boolean) {
    if (!user) return;

    try {
      await userService.setFavoriteList(user.uid, setAsFavorite ? listId : null);
      setFavoriteListId(setAsFavorite ? listId : null);
    } catch (error) {
      console.error("Erro ao atualizar favorita:", error);
    }
  }

  async function handleDeleteList(listId: string) {
    if (!user) return;

    try {
      await listService.deleteList(listId, user.uid);

      // Remover lista do estado
      const updatedLists = lists.filter((l) => l.id !== listId);
      setLists(updatedLists);

      // Se era a lista selecionada, selecionar outra
      if (selectedList?.id === listId) {
        setSelectedList(updatedLists.length > 0 ? updatedLists[0] : null);
      }

      // Se era a favorita, limpar favorita
      if (favoriteListId === listId) {
        setFavoriteListId(null);
      }
    } catch (error) {
      console.error("Erro ao excluir lista:", error);
      alert("Erro ao excluir lista: " + (error as Error).message);
    }
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 via-indigo-100 to-purple-200 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900">
        <p className="text-slate-700 dark:text-slate-300">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-100 to-purple-200 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900">
      <div className="max-w-5xl mx-auto p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-3 sm:gap-0">
          <Title
            title="Gerenciador de Listas"
            subtitle="Organize suas tarefas e itens"
            icon
          />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>

        {!user ? (
          <div className="flex flex-col items-center justify-center mt-10 md:mt-20 gap-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-12 border border-slate-200 dark:border-slate-700">
            <p className="text-slate-700 dark:text-slate-300 text-center text-base md:text-lg">
              Faça login para gerenciar suas listas
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:gap-6">
            {/* Seletor de Lista */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-3 md:p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <ListIcon className="hidden sm:block h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <div className="flex-1">
                  <ListSelector
                    lists={lists}
                    selectedList={selectedList}
                    onSelectList={setSelectedList}
                    onCreateNew={() => setShowCreateModal(true)}
                    onToggleFavorite={handleToggleFavorite}
                    onDeleteList={handleDeleteList}
                    favoriteListId={favoriteListId}
                    currentUserId={user?.uid}
                    loading={loadingLists}
                  />
                </div>
                {selectedList && (
                  <Link
                    href={`/lists/${selectedList.id}`}
                    className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-200 dark:border-indigo-700 min-h-11"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="sm:inline font-medium">Gerenciar</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Conteúdo da Lista */}
            {loadingLists ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 md:p-12 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-400">Carregando listas...</p>
              </div>
            ) : selectedList ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 md:p-6 border border-slate-200 dark:border-slate-700">
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
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-xl p-6 text-center">
                        <p className="text-yellow-800 dark:text-yellow-300 mb-3">
                          Você não tem permissão para editar itens nesta lista
                        </p>
                        <button
                          onClick={exibirTabela}
                          className="text-sm text-yellow-700 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-200 font-medium"
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
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12 flex flex-col items-center justify-center gap-4 border border-slate-200 dark:border-slate-700">
                <p className="text-slate-700 dark:text-slate-300 text-center text-lg">
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
