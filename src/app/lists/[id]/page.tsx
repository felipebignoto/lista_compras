// src/app/lists/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { listService } from "@/firebase/lists";
import { listInviteService } from "@/firebase/listInvites";
import { userService } from "@/firebase/users";
import { ShoppingList, User } from "@/types";
import {
  ArrowLeft,
  Users,
  Trash2,
  UserPlus,
  Edit2,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";
import AuthButton from "@/components/authButton";

export default function ListManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const listId = params.id as string;

  const [list, setList] = useState<ShoppingList | null>(null);
  const [members, setMembers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  // Form de adicionar membro
  const [showAddForm, setShowAddForm] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<"editor" | "viewer">("editor");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);

  // Edição de nome
  const [isEditingName, setIsEditingName] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [editNameLoading, setEditNameLoading] = useState(false);

  useEffect(() => {
    if (user && listId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, listId]);

  async function loadData() {
    if (!user || !listId) return;

    setLoading(true);
    try {
      // Carregar lista
      const listData = await listService.getListById(listId);
      if (!listData) {
        router.push("/");
        return;
      }

      // Verificar se usuário tem acesso
      if (!listData.members[user.uid]) {
        router.push("/");
        return;
      }

      setList(listData);
      setIsOwner(listData.ownerId === user.uid);

      // Carregar membros
      const memberIds = Object.keys(listData.members);
      const membersData: Record<string, User> = {};

      for (const uid of memberIds) {
        const userData = await userService.getUserById(uid);
        if (userData) {
          membersData[uid] = userData;
        }
      }
      setMembers(membersData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !list) return;

    setAddLoading(true);
    setAddError(null);
    setAddSuccess(false);

    try {
      await listInviteService.addUserToList(
        list.id!,
        memberEmail.trim().toLowerCase(),
        memberRole,
        user.uid,
      );

      setAddSuccess(true);
      setMemberEmail("");
      setMemberRole("editor");
      loadData(); // Recarregar membros

      setTimeout(() => {
        setShowAddForm(false);
        setAddSuccess(false);
      }, 2000);
    } catch (error) {
      setAddError(
        error instanceof Error ? error.message : "Erro ao adicionar membro",
      );
    } finally {
      setAddLoading(false);
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!user || !list) return;
    if (!confirm("Tem certeza que deseja remover este membro?")) return;

    try {
      await listService.removeMember(list.id!, user.uid, userId);
      loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao remover membro");
    }
  }

  async function handleEditName() {
    if (!user || !list || !newListName.trim()) return;

    setEditNameLoading(true);
    try {
      await listService.updateList(list.id!, user.uid, {
        name: newListName.trim(),
      });
      setIsEditingName(false);
      loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao editar nome");
    } finally {
      setEditNameLoading(false);
    }
  }

  function startEditName() {
    setNewListName(list?.name || "");
    setIsEditingName(true);
  }

  function cancelEditName() {
    setIsEditingName(false);
    setNewListName("");
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Lista não encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    className="text-2xl font-bold text-gray-900 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    disabled={editNameLoading}
                  />
                  <button
                    onClick={handleEditName}
                    disabled={editNameLoading || !newListName.trim()}
                    className="text-green-600 hover:text-green-700 disabled:opacity-50"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    onClick={cancelEditName}
                    disabled={editNameLoading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {list.name}
                  </h1>
                  {(isOwner ||
                    list.members[user?.uid || ""]?.role === "editor") && (
                    <button
                      onClick={startEditName}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
              <p className="text-sm text-gray-500">Gerenciar lista</p>
            </div>
          </div>
          <AuthButton />
        </div>

        {/* Membros */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Membros ({Object.keys(list.members).length})
              </h2>
            </div>
            {isOwner && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span>Adicionar Membro</span>
              </button>
            )}
          </div>

          {/* Form de adicionar membro */}
          {showAddForm && (
            <form
              onSubmit={handleAddMember}
              className="mb-6 p-4 bg-blue-50 rounded-lg"
            >
              <h3 className="font-medium text-gray-900 mb-3">
                Adicionar membro
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Digite o email de um usuário que já tenha feito login no
                sistema.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    required
                    disabled={addLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Permissão
                  </label>
                  <select
                    value={memberRole}
                    onChange={(e) =>
                      setMemberRole(e.target.value as "editor" | "viewer")
                    }
                    disabled={addLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="editor">
                      Editor (pode adicionar e editar)
                    </option>
                    <option value="viewer">
                      Visualizador (apenas visualizar)
                    </option>
                  </select>
                </div>

                {addError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{addError}</p>
                  </div>
                )}

                {addSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-600">
                      Membro adicionado com sucesso!
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setAddError(null);
                      setMemberEmail("");
                    }}
                    disabled={addLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {addLoading ? "Adicionando..." : "Adicionar"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Lista de membros */}
          <div className="space-y-2">
            {Object.entries(list.members).map(([uid, member]) => {
              const userData = members[uid];
              return (
                <div
                  key={uid}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {userData?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={userData.image}
                        alt="Avatar"
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {userData?.name || userData?.email || "Usuário"}
                        {list.ownerId === uid && (
                          <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            Dono
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">{userData?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm px-3 py-1 rounded-full ${
                        member.role === "owner"
                          ? "bg-blue-100 text-blue-800"
                          : member.role === "editor"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {member.role === "owner"
                        ? "Dono"
                        : member.role === "editor"
                          ? "Editor"
                          : "Visualizador"}
                    </span>

                    {isOwner && list.ownerId !== uid && (
                      <button
                        onClick={() => handleRemoveMember(uid)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
