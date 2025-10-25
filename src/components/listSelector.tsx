// src/components/listSelector.tsx
'use client'

import { ShoppingList } from '@/types'
import { ChevronDown, Plus, Settings } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface ListSelectorProps {
  lists: ShoppingList[]
  selectedList: ShoppingList | null
  onSelectList: (list: ShoppingList) => void
  onCreateNew: () => void
  loading?: boolean
}

export default function ListSelector({
  lists,
  selectedList,
  onSelectList,
  onCreateNew,
  loading = false,
}: ListSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (loading) {
    return (
      <div className="relative">
        <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
          <span className="text-sm text-gray-500">Carregando listas...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Botão do dropdown */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-900">
            {selectedList ? selectedList.name : 'Selecione uma lista'}
          </span>
          {selectedList && (
            <span className="text-xs text-gray-500">
              {Object.keys(selectedList.members).length} membro(s)
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Menu dropdown */}
      {isOpen && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {/* Botão criar nova lista */}
            <button
              onClick={() => {
                setIsOpen(false)
                onCreateNew()
              }}
              className="w-full flex items-center gap-2 px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-200"
            >
              <Plus className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">
                Criar nova lista
              </span>
            </button>

            {/* Lista de listas */}
            {lists.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Você ainda não tem listas
              </div>
            ) : (
              <div className="py-1">
                {lists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => {
                      onSelectList(list)
                      setIsOpen(false)
                    }}
                    className={`w-full flex flex-col items-start px-4 py-2 hover:bg-gray-50 transition-colors ${
                      selectedList?.id === list.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        selectedList?.id === list.id
                          ? 'text-blue-600'
                          : 'text-gray-900'
                      }`}
                    >
                      {list.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {Object.keys(list.members).length} membro(s) •{' '}
                      {new Date(list.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
